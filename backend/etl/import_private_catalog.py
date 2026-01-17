from __future__ import annotations

import csv
from pathlib import Path

from backend.db import SessionLocal, init_db
from backend.etl.idae_catalog import _map_segment
from backend.models import VehicleCatalog


def _to_float(value: str) -> float | None:
    if value is None:
        return None
    value = str(value).replace(",", ".").strip()
    if not value:
        return None
    try:
        return float(value)
    except ValueError:
        return None


def import_catalog(path: Path, source: str) -> list[VehicleCatalog]:
    items: list[VehicleCatalog] = []
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            category = row.get("category") or None
            segment = row.get("segment") or _map_segment(category)
            items.append(
                VehicleCatalog(
                    brand=row.get("brand") or None,
                    model=row.get("model") or None,
                    variant=row.get("variant") or None,
                    fuel_type=row.get("fuel_type") or None,
                    category=category,
                    segment=segment,
                    engine_cc=_to_float(row.get("engine_cc")),
                    classification=row.get("classification") or None,
                    consumption_min=_to_float(row.get("consumption_min")),
                    consumption_max=_to_float(row.get("consumption_max")),
                    emissions_min=_to_float(row.get("emissions_min")),
                    emissions_max=_to_float(row.get("emissions_max")),
                    source=source,
                )
            )
    return items


def main() -> None:
    import argparse

    parser = argparse.ArgumentParser(description="Import private vehicle catalog CSV.")
    parser.add_argument("--file", type=Path, required=True)
    parser.add_argument("--source", type=str, default="private")
    parser.add_argument("--replace", action="store_true", help="Replace catalog before import")
    args = parser.parse_args()

    init_db()
    items = import_catalog(args.file, args.source)
    with SessionLocal() as session:
        if args.replace:
            session.query(VehicleCatalog).delete()
        session.add_all(items)
        session.commit()
    print(f"Imported {len(items)} catalog rows from {args.file}")


if __name__ == "__main__":
    main()
