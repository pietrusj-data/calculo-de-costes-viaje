from __future__ import annotations

import json
import re
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Iterable

import pandas as pd
import requests


@dataclass(frozen=True)
class VehicleSpec:
    make: str
    model: str
    year: int


class NHTSAClient:
    """
    Cliente mínimo para endpoints públicos de NHTSA.

    Docs: https://vpic.nhtsa.dot.gov/api/
    """

    def __init__(self, base_url: str = "https://api.nhtsa.gov", timeout_s: int = 30) -> None:
        self.base_url = base_url.rstrip("/")
        self.timeout_s = timeout_s

    def fetch_recalls(self, vehicle: VehicleSpec) -> list[dict[str, Any]]:
        url = (
            f"{self.base_url}/recalls/recallsByVehicle"
            f"?make={vehicle.make}&model={vehicle.model}&modelYear={vehicle.year}"
        )
        response = requests.get(url, timeout=self.timeout_s)
        response.raise_for_status()
        payload: dict[str, Any] = response.json()
        results = payload.get("results")
        if not isinstance(results, list):
            return []
        return [r for r in results if isinstance(r, dict)]


def _to_snake_case(text: str) -> str:
    cleaned = re.sub(r"[^0-9a-zA-Z]+", "_", text).strip("_")
    return cleaned.lower()


def _clean_text(value: Any) -> str | None:
    if value is None:
        return None
    if isinstance(value, str):
        stripped = re.sub(r"\s+", " ", value).strip()
        return stripped or None
    return str(value)


def recalls_to_dataframe(records: Iterable[dict[str, Any]]) -> pd.DataFrame:
    df = pd.DataFrame(list(records))
    if df.empty:
        return df

    df = df.rename(columns={c: _to_snake_case(str(c)) for c in df.columns})

    for col in df.select_dtypes(include=["object"]).columns:
        df[col] = df[col].map(_clean_text)

    if "report_received_date" in df.columns:
        df["report_received_date"] = pd.to_datetime(df["report_received_date"], errors="coerce", utc=True)

    return df


def cache_key(vehicle: VehicleSpec) -> str:
    make = re.sub(r"\s+", "_", vehicle.make.strip().upper())
    model = re.sub(r"\s+", "_", vehicle.model.strip().upper())
    return f"recalls__{make}__{model}__{vehicle.year}.json"


def load_or_fetch_recalls(
    vehicle: VehicleSpec,
    *,
    client: NHTSAClient | None = None,
    cache_dir: str | Path = "data/cache",
    refresh: bool = False,
) -> pd.DataFrame:
    """
    Descarga recalls desde NHTSA, con caché local en JSON, y devuelve un DataFrame limpio.
    """

    client = client or NHTSAClient()
    cache_path = Path(cache_dir) / cache_key(vehicle)
    cache_path.parent.mkdir(parents=True, exist_ok=True)

    if cache_path.exists() and not refresh:
        records = json.loads(cache_path.read_text(encoding="utf-8"))
        if isinstance(records, list):
            return recalls_to_dataframe(records)

    records = client.fetch_recalls(vehicle)
    cache_path.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")
    return recalls_to_dataframe(records)


def query_recalls(
    df: pd.DataFrame,
    *,
    component: str | None = None,
    keyword: str | None = None,
) -> pd.DataFrame:
    """
    Filtrado sencillo para consultas rápidas en el DataFrame.
    """

    result = df
    if component and "component" in result.columns:
        component_norm = component.strip().lower()
        result = result[result["component"].fillna("").str.lower().str.contains(component_norm, na=False)]
    if keyword:
        keyword_norm = keyword.strip().lower()
        for col in ("summary", "consequence", "remedy"):
            if col in result.columns:
                mask = result[col].fillna("").str.lower().str.contains(keyword_norm, na=False)
                result = result[mask]
                break
    return result.reset_index(drop=True)


def build_vehicle_recalls_snapshot(
    vehicle: VehicleSpec,
    *,
    cache_dir: str | Path = "data/cache",
    refresh: bool = False,
) -> dict[str, Any]:
    """
    Devuelve un resumen listo para dashboards (nº recalls + top componentes).
    """

    df = load_or_fetch_recalls(vehicle, cache_dir=cache_dir, refresh=refresh)
    top_components: list[dict[str, Any]] = []
    if not df.empty and "component" in df.columns:
        counts = df["component"].value_counts(dropna=True).head(10)
        top_components = [{"component": str(k), "count": int(v)} for k, v in counts.items()]

    return {
        "vehicle": {"make": vehicle.make, "model": vehicle.model, "year": vehicle.year},
        "generated_at_utc": datetime.utcnow().isoformat(timespec="seconds") + "Z",
        "recalls_count": int(len(df)),
        "top_components": top_components,
    }

