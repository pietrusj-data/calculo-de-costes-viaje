from __future__ import annotations

import argparse
from pathlib import Path

from vehicle_data import VehicleSpec, load_or_fetch_recalls


def main() -> int:
    parser = argparse.ArgumentParser(description="Descarga recalls (NHTSA) y genera un DataFrame limpio.")
    parser.add_argument("--make", required=True, help="Marca (ej: PORSCHE)")
    parser.add_argument("--model", required=True, help="Modelo (ej: PANAMERA)")
    parser.add_argument("--year", required=True, type=int, help="Año (ej: 2018)")
    parser.add_argument("--out", default="", help="Ruta CSV de salida (opcional)")
    parser.add_argument("--refresh", action="store_true", help="Ignora caché y vuelve a descargar")
    args = parser.parse_args()

    vehicle = VehicleSpec(make=args.make, model=args.model, year=args.year)
    df = load_or_fetch_recalls(vehicle, refresh=args.refresh)

    print(f"Registros: {len(df)}")
    if df.empty:
        return 0

    useful = [c for c in ["component", "summary", "consequence", "report_received_date"] if c in df.columns]
    print(df[useful].head(10).to_string(index=False))

    if args.out:
        out_path = Path(args.out)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        df.to_csv(out_path, index=False)
        print(f"CSV guardado en: {out_path}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

