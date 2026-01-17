# Functional Spec (MVP)

## MVP scope
- Trip calculator with energy, maintenance, depreciation, insurance.
- Public fuel prices for Spain (average national).
- User inputs for electricity price.
- Toggle between real maintenance vs estimates.
- Transparent assumptions in every calculation.

## Roadmap
- Fuel prices by province/municipality.
- Electricity price API integration.
- User accounts + multi-vehicle.
- Map-based routing + real distance.
- Model-specific depreciation curves.

# Data Model (SQLite)

## users
- id, name, created_at

## user_vehicles
- id, user_id, make, model, year, current_km, annual_km, powertrain_type, segment, created_at

## fuel_prices
- id, fuel_type, price_eur_per_unit, unit, source, fetched_at

## insurance_policies
- id, user_id, vehicle_id, cost_amount, cost_period, start_date, annual_km, created_at

## maintenance_events
- id, vehicle_id, category, event_date, odometer_km, cost_eur, workshop, notes

## maintenance_templates
- id, powertrain_type, segment, category, cost_eur, every_km, every_months

## depreciation_models
- id, powertrain_type, segment, base_value_eur, annual_rate, km_rate, min_residual_pct

# API Endpoints

- `GET /api/health`
- `GET /api/fuel-prices/latest`
- `POST /api/fuel-prices/refresh`
- `GET /api/fuel-prices/nearby?postal_code=`
- `GET /api/vehicles`
- `POST /api/vehicles`
- `GET /api/maintenance-events?vehicle_id=`
- `POST /api/maintenance-events`
- `GET /api/insurance-policies?vehicle_id=`
- `POST /api/insurance-policies`
- `POST /api/calc/trip`

# ETL Scripts

- `backend/etl/fuel_prices_es.py`:
  - Fetches Spanish official station prices.
  - Stores daily average by fuel type.

- `backend/etl/import_kaggle.py`:
  - Loads maintenance templates and depreciation models from CSV.

- `backend/etl/idae_catalog.py`:
  - Descarga catalogo IDAE (WLTP) por marca/modelo.
  - Crea `vehicle_catalog` para seleccion real de vehiculos.

- `backend/etl/export_catalog_csv.py`:
  - Exporta `vehicle_catalog` a CSV.

- `backend/etl/import_private_catalog.py`:
  - Importa un catalogo privado desde CSV.
