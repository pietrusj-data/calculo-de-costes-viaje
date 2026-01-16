from __future__ import annotations

from datetime import datetime
from time import sleep

import requests
from datetime import datetime
from sqlalchemy.orm import Session

from ..models import FuelPrice

FUEL_PRICE_URL = (
    "https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/"
    "PreciosCarburantes/EstacionesTerrestres/"
)
DEFAULT_HEADERS = {
    "User-Agent": "VehicleAnalytics/1.0 (+https://github.com/pietrusj-data/calculo-de-costes-viaje)",
    "Accept": "application/json,text/json,*/*",
}


def _parse_float(value: str) -> float | None:
    if not value:
        return None
    try:
        return float(value.replace(",", "."))
    except ValueError:
        return None


def _fetch_fuel_payload() -> dict:
    last_error: Exception | None = None
    for attempt in range(3):
        try:
            response = requests.get(FUEL_PRICE_URL, timeout=30, headers=DEFAULT_HEADERS)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as exc:
            last_error = exc
            sleep(1.5 * (attempt + 1))
    raise RuntimeError("Failed to reach fuel price service") from last_error


def fetch_and_store_fuel_prices(session: Session) -> None:
    payload = _fetch_fuel_payload()
    stations = payload.get("ListaEESSPrecio", [])

    gasoline_prices: list[float] = []
    diesel_prices: list[float] = []

    for station in stations:
        gas_value = _parse_float(station.get("Precio Gasolina 95 E5", ""))
        if gas_value:
            gasoline_prices.append(gas_value)
        diesel_value = _parse_float(station.get("Precio Gasoleo A", ""))
        if diesel_value:
            diesel_prices.append(diesel_value)

    if gasoline_prices:
        avg_gasoline = sum(gasoline_prices) / len(gasoline_prices)
        session.add(
            FuelPrice(
                fuel_type="gasoline",
                price_eur_per_unit=avg_gasoline,
                unit="eur/l",
                source="minetur-rest",
                fetched_at=datetime.utcnow(),
            )
        )
    if diesel_prices:
        avg_diesel = sum(diesel_prices) / len(diesel_prices)
        session.add(
            FuelPrice(
                fuel_type="diesel",
                price_eur_per_unit=avg_diesel,
                unit="eur/l",
                source="minetur-rest",
                fetched_at=datetime.utcnow(),
            )
        )
    session.commit()


def fetch_stations_by_postal_code(postal_code: str) -> dict[str, object]:
    payload = _fetch_fuel_payload()
    stations = payload.get("ListaEESSPrecio", [])
    postal_code = postal_code.strip()
    filtered = [s for s in stations if str(s.get("C.P.", "")).strip() == postal_code]
    fetched_at_raw = payload.get("Fecha")
    fetched_at = None
    if fetched_at_raw:
        try:
            fetched_at = datetime.strptime(fetched_at_raw, "%d/%m/%Y %H:%M:%S")
        except ValueError:
            fetched_at = None

    normalized = []
    gas_prices = []
    diesel_prices = []
    for station in filtered:
        gas = _parse_float(station.get("Precio Gasolina 95 E5", ""))
        diesel = _parse_float(station.get("Precio Gasoleo A", ""))
        if gas is not None:
            gas_prices.append(gas)
        if diesel is not None:
            diesel_prices.append(diesel)
        normalized.append(
            {
                "id": station.get("IDEESS"),
                "label": station.get("Rótulo"),
                "address": station.get("Dirección"),
                "postal_code": station.get("C.P."),
                "municipality": station.get("Municipio"),
                "province": station.get("Provincia"),
                "schedule": station.get("Horario"),
                "latitude": _parse_float(station.get("Latitud", "")),
                "longitude": _parse_float(station.get("Longitud (WGS84)", "")),
                "prices": {
                    "gasoline_95_e5": gas,
                    "diesel_a": diesel,
                },
            }
        )

    averages = {}
    if gas_prices:
        averages["gasoline_95_e5"] = sum(gas_prices) / len(gas_prices)
    if diesel_prices:
        averages["diesel_a"] = sum(diesel_prices) / len(diesel_prices)

    return {
        "postal_code": postal_code,
        "stations": normalized,
        "averages": averages,
        "source": "minetur-rest",
        "fetched_at": fetched_at,
    }
