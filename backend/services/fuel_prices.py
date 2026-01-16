from __future__ import annotations

from datetime import datetime

import requests
from sqlalchemy.orm import Session

from ..models import FuelPrice

FUEL_PRICE_URL = (
    "https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/"
    "PreciosCarburantes/EstacionesTerrestres/"
)


def _parse_float(value: str) -> float | None:
    if not value:
        return None
    try:
        return float(value.replace(",", "."))
    except ValueError:
        return None


def fetch_and_store_fuel_prices(session: Session) -> None:
    response = requests.get(FUEL_PRICE_URL, timeout=30)
    response.raise_for_status()
    payload = response.json()
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
