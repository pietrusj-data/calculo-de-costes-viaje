from __future__ import annotations

import csv
from pathlib import Path

from backend.db import SessionLocal, init_db
from backend.models import VehicleCatalog


def main() -> None:
    import argparse

    parser = argparse.ArgumentParser(description="Export vehicle catalog to CSV.")
    parser.add_argument("--out", type=Path, default=Path("data") / "idae_catalog.csv")
    args = parser.parse_args()

    init_db()
    with SessionLocal() as session:
        rows = session.query(VehicleCatalog).order_by(VehicleCatalog.brand.asc()).all()

    args.out.parent.mkdir(parents=True, exist_ok=True)
    with args.out.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(
            [
                "id",
                "brand",
                "model",
                "variant",
                "fuel_type",
                "category",
                "segment",
                "engine_cc",
                "classification",
                "consumption_min",
                "consumption_max",
                "emissions_min",
                "emissions_max",
                "source",
                "updated_at",
            ]
        )
        for row in rows:
            writer.writerow(
                [
                    row.id,
                    row.brand,
                    row.model,
                    row.variant,
                    row.fuel_type,
                    row.category,
                    row.segment,
                    row.engine_cc,
                    row.classification,
                    row.consumption_min,
                    row.consumption_max,
                    row.emissions_min,
                    row.emissions_max,
                    row.source,
                    row.updated_at,
                ]
            )
    print(f"Exported {len(rows)} rows to {args.out}")


if __name__ == "__main__":
    main()
