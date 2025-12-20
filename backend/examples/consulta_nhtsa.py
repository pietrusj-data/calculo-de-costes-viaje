from __future__ import annotations

from vehicle_data import VehicleSpec, load_or_fetch_recalls


def main() -> None:
    vehicle = VehicleSpec(make="PORSCHE", model="PANAMERA", year=2018)
    df = load_or_fetch_recalls(vehicle)

    if df.empty:
        print("No se encontraron datos.")
        return

    columnas_utiles = [c for c in ["component", "summary", "consequence"] if c in df.columns]
    print("\n--- ANÁLISIS DE FALLOS (RECALLS) ---")
    print(df[columnas_utiles].head())

    if "component" in df.columns:
        print("\n--- PIEZAS MÁS PROBLEMÁTICAS ---")
        print(df["component"].value_counts())

    df.to_csv("data/fallos_panamera.csv", index=False)
    print("\nArchivo guardado: data/fallos_panamera.csv")


if __name__ == "__main__":
    main()

