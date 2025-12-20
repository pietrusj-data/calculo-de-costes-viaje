from __future__ import annotations

import pandas as pd

from vehicle_data import VehicleSpec, load_or_fetch_recalls


# --- CONEXION A API EXTERNA (NHTSA - USA) ---
# Documentacion: https://vpic.nhtsa.dot.gov/api/


def buscar_recalls(marca: str, modelo: str, anio: int) -> pd.DataFrame:
    print(f"Conectando con el servidor del Gobierno para {marca} {modelo} ({anio})...")

    vehicle = VehicleSpec(make=marca, model=modelo, year=anio)
    df = load_or_fetch_recalls(vehicle)

    if df.empty:
        print("No se encontraron datos o hubo un error.")
        return df

    print(f"Datos recibidos. Total de registros: {len(df)}")
    return df


def main() -> None:
    # 1. Probamos con el Porsche Panamera (famoso por mantenimientos complejos)
    df = buscar_recalls("PORSCHE", "PANAMERA", 2018)
    if df.empty:
        return

    # 2. Seleccionamos columnas interesantes para el analisis
    # component: que pieza fallo
    # summary: descripcion del problema
    columnas_utiles = [c for c in ["component", "summary", "consequence"] if c in df.columns]

    print("\n--- ANALISIS DE FALLOS (RECALLS) ---")
    print(df[columnas_utiles].head())

    # 3. Insight rapido: que piezas fallan mas?
    if "component" in df.columns:
        print("\n--- PIEZAS MAS PROBLEMATICAS ---")
        print(df["component"].value_counts())

    # 4. Exportar para estudiar luego
    df.to_csv("data/fallos_panamera.csv", index=False)
    print("\nArchivo guardado: data/fallos_panamera.csv")


if __name__ == "__main__":
    main()

