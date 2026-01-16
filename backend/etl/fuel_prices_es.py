from __future__ import annotations

from backend.db import SessionLocal, init_db
from backend.services.fuel_prices import fetch_and_store_fuel_prices


def main() -> None:
    init_db()
    with SessionLocal() as session:
        fetch_and_store_fuel_prices(session)
    print("Fuel prices refreshed.")


if __name__ == "__main__":
    main()
