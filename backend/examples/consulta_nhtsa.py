from __future__ import annotations

import pandas as pd

from vehicle_data import VehicleSpec, load_or_fetch_recalls


def _normalize_input(value: str) -> str:
    cleaned = value.strip()
    if cleaned.startswith("[") and cleaned.endswith("]"):
        cleaned = cleaned[1:-1].strip()
    return cleaned


# --- CONEXION A API EXTERNA (NHTSA - USA) ---
# Documentacion: https://vpic.nhtsa.dot.gov/api/


def buscar_recalls(marca: str, modelo: str, anio: int) -> pd.DataFrame:
    print(f"Conectando con el servidor del Gobierno para {marca} {modelo} ({anio})...")

    vehicle = VehicleSpec(make=marca, model=modelo, year=anio)
    try:
        df = load_or_fetch_recalls(vehicle)
    except Exception as exc:
        print(f"Error al conectar con la API: {exc}")
        return pd.DataFrame()

    if df.empty:
        print("No se encontraron datos o hubo un error.")
        return df

    print(f"Datos recibidos. Total de registros: {len(df)}")
    return df


def _prompt(text: str, default: str) -> str:
    value = _normalize_input(input(f"{text} [{default}]: "))
    return value or default


def main() -> None:
    marca = _prompt("Marca", "PORSCHE")
    modelo = _prompt("Modelo", "PANAMERA")
    anio_raw = _prompt("Anio", "2018")
    try:
        anio = int(anio_raw)
    except ValueError:
        print("Anio invalido, usando 2018.")
        anio = 2018

    df = buscar_recalls(marca, modelo, anio)
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
