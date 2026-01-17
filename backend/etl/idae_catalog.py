from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import datetime
from typing import Iterable
from urllib.parse import urlencode

import requests

from backend.db import SessionLocal, init_db
from backend.models import VehicleCatalog

BASE_URL = "https://coches.idae.es/base-datos/marca-y-modelo"
AJAX_URL = "https://coches.idae.es/ajax"


@dataclass
class IdAeSession:
    session: requests.Session
    token: str
    brands: list[str]


def _fetch_html() -> str:
    response = requests.get(BASE_URL, timeout=30)
    response.raise_for_status()
    return response.text


def _extract_token(html: str) -> str:
    match = re.search(r'name=\"_token\" value=\"([^\"]+)\"', html)
    if not match:
        raise RuntimeError("Unable to find CSRF token in IDAE page")
    return match.group(1)


def _extract_brands(html: str) -> list[str]:
    match = re.search(r'<select[^>]*id=\"marca\"[^>]*>(.*?)</select>', html, re.S)
    if not match:
        return []
    options = re.findall(r'<option[^>]*value=\"?([^\">]*)\"?[^>]*>(.*?)</option>', match.group(1), re.S)
    brands = [re.sub(r"<[^>]+>", "", name).strip() for _, name in options if name.strip() and name.strip() != "* Cualquiera"]
    brands = sorted(brands, key=len, reverse=True)
    return brands


def _bootstrap_session() -> IdAeSession:
    session = requests.Session()
    html = session.get(BASE_URL, timeout=30).text
    token = _extract_token(html)
    brands = _extract_brands(html)
    return IdAeSession(session=session, token=token, brands=brands)


def _classification_from_html(html: str) -> str | None:
    match = re.search(r'Clasificación:\\s*([^\"<]+)', html)
    return match.group(1).strip() if match else None


def _parse_float(value: str) -> float | None:
    if value is None:
        return None
    value = str(value).replace(",", ".").strip()
    if not value:
        return None
    try:
        return float(value)
    except ValueError:
        return None


def _split_brand_model(variant: str, brands: list[str]) -> tuple[str | None, str]:
    upper_variant = variant.upper()
    for brand in brands:
        if upper_variant.startswith(brand.upper() + " "):
            return brand, variant[len(brand) :].strip()
        if upper_variant == brand.upper():
            return brand, ""
    return None, variant.strip()


def _fetch_listado(
    client: IdAeSession,
    *,
    ciclo: str,
    start: int,
    length: int,
    filtros: dict[str, str],
) -> dict:
    payload = {
        "draw": 1,
        "start": start,
        "length": length,
        "_token": client.token,
        "campo": "listado",
        "ciclo": ciclo,
        "filtros": urlencode(filtros),
    }
    response = client.session.post(AJAX_URL, data=payload, timeout=60)
    response.raise_for_status()
    return response.json()


def _iter_rows(client: IdAeSession, ciclo: str, filtros: dict[str, str]) -> Iterable[list]:
    first = _fetch_listado(client, ciclo=ciclo, start=0, length=1, filtros=filtros)
    total = int(first.get("recordsFiltered") or 0)
    if total == 0:
        return
    page_size = 500
    for start in range(0, total, page_size):
        payload = _fetch_listado(client, ciclo=ciclo, start=start, length=page_size, filtros=filtros)
        for row in payload.get("data", []):
            yield row


def build_catalog() -> list[VehicleCatalog]:
    client = _bootstrap_session()
    filtros = {
        "_token": client.token,
        "tipo": "marca-y-modelo",
        "marca": "",
        "modelo": "",
        "categoria": "",
        "segmento": "",
    }

    wltp_data: dict[int, dict] = {}
    for row in _iter_rows(client, "wltp", filtros):
        if len(row) < 7:
            continue
        variant = re.sub(r"<[^>]+>", "", row[0]).strip()
        classification = _classification_from_html(row[1] or "")
        consumption_min = _parse_float(row[2])
        consumption_max = _parse_float(row[3])
        emissions_min = _parse_float(row[4])
        emissions_max = _parse_float(row[5])
        item_id = int(row[6])
        brand, model = _split_brand_model(variant, client.brands)
        wltp_data[item_id] = {
            "id": item_id,
            "variant": variant,
            "brand": brand,
            "model": model,
            "classification": classification,
            "consumption_min": consumption_min,
            "consumption_max": consumption_max,
            "emissions_min": emissions_min,
            "emissions_max": emissions_max,
        }

    elec_data: dict[int, dict] = {}
    for row in _iter_rows(client, "elec", filtros):
        if len(row) < 10:
            continue
        variant = re.sub(r"<[^>]+>", "", row[0]).strip()
        classification = _classification_from_html(row[1] or "")
        fuel_type = re.sub(r"<[^>]+>", "", str(row[2])).strip()
        category = re.sub(r"<[^>]+>", "", str(row[3])).strip()
        engine_cc = _parse_float(row[4])
        item_id = int(row[-1])
        brand, model = _split_brand_model(variant, client.brands)
        elec_data[item_id] = {
            "id": item_id,
            "variant": variant,
            "brand": brand,
            "model": model,
            "classification": classification,
            "fuel_type": fuel_type or None,
            "category": category or None,
            "engine_cc": engine_cc,
        }

    catalog: list[VehicleCatalog] = []
    updated_at = datetime.utcnow()
    for item_id, wltp in wltp_data.items():
        elec = elec_data.get(item_id, {})
        catalog.append(
            VehicleCatalog(
                id=item_id,
                brand=wltp.get("brand") or elec.get("brand"),
                model=wltp.get("model") or elec.get("model"),
                variant=wltp.get("variant") or elec.get("variant"),
                fuel_type=elec.get("fuel_type"),
                category=elec.get("category"),
                engine_cc=elec.get("engine_cc"),
                classification=wltp.get("classification") or elec.get("classification"),
                consumption_min=wltp.get("consumption_min"),
                consumption_max=wltp.get("consumption_max"),
                emissions_min=wltp.get("emissions_min"),
                emissions_max=wltp.get("emissions_max"),
                source="idae",
                updated_at=updated_at,
            )
        )
    return catalog


def main() -> None:
    init_db()
    items = build_catalog()
    with SessionLocal() as session:
        session.query(VehicleCatalog).delete()
        session.add_all(items)
        session.commit()
    print(f"Imported {len(items)} vehicles from IDAE.")


if __name__ == "__main__":
    main()
