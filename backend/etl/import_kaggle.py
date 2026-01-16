from __future__ import annotations

import csv
from pathlib import Path

from backend.db import SessionLocal, init_db
from backend.models import DepreciationModel, MaintenanceTemplate


def import_maintenance(path: Path):
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            item = MaintenanceTemplate(
                powertrain_type=row.get("powertrain_type", "gasoline"),
                segment=row.get("segment", "generic"),
                category=row.get("category", "other"),
                cost_eur=float(row.get("cost_eur", "0") or 0),
                every_km=float(row.get("every_km", "0") or 0) or None,
                every_months=int(row.get("every_months", "0") or 0) or None,
            )
            yield item


def import_depreciation(path: Path):
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            item = DepreciationModel(
                powertrain_type=row.get("powertrain_type", "gasoline"),
                segment=row.get("segment", "generic"),
                base_value_eur=float(row.get("base_value_eur", "0") or 0),
                annual_rate=float(row.get("annual_rate", "0.12") or 0.12),
                km_rate=float(row.get("km_rate", "0.02") or 0.02),
                min_residual_pct=float(row.get("min_residual_pct", "0.2") or 0.2),
            )
            yield item


def main() -> None:
    import argparse

    parser = argparse.ArgumentParser(description="Import Kaggle CSVs into SQLite.")
    parser.add_argument("--maintenance", type=Path, help="CSV for maintenance templates")
    parser.add_argument("--depreciation", type=Path, help="CSV for depreciation models")
    args = parser.parse_args()

    init_db()
    with SessionLocal() as session:
        if args.maintenance:
            items = list(import_maintenance(args.maintenance))
            session.add_all(items)
            print(f"Imported maintenance templates: {len(items)}")
        if args.depreciation:
            items = list(import_depreciation(args.depreciation))
            session.add_all(items)
            print(f"Imported depreciation models: {len(items)}")
        session.commit()


if __name__ == "__main__":
    main()
