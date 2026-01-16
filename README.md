# Vehicle Trip Cost MVP

Aplicacion web (MVP) para calcular el coste real de un viaje en coche con desglose de energia, mantenimiento, depreciacion y seguro. Incluye backend FastAPI + SQLite y frontend React.

## Demo / Deploy

Workflow de deploy en GitHub Actions:

- Frontend en Vercel (workflow `Deploy`)
- Backend en Render via deploy hook

Secrets requeridos en GitHub:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `RENDER_DEPLOY_HOOK`

## Backend (FastAPI)

1) Crear entorno e instalar dependencias:

```bash
python -m venv .venv
.\.venv\Scripts\python -m pip install -r backend\requirements.txt
```

2) Inicializar base de datos con datos demo:

```bash
.\.venv\Scripts\python backend\seed.py
```

3) (Opcional) Actualizar precios oficiales de carburante en Espana:

```bash
.\.venv\Scripts\python backend\etl\fuel_prices_es.py
```

4) Levantar API:

```bash
.\.venv\Scripts\python -m uvicorn backend.main:app --reload
```

## Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Si el backend corre en otro host/puerto, exporta `VITE_API_URL` antes de `npm run dev`.

## Endpoints principales

- `GET /api/fuel-prices/latest`
- `POST /api/fuel-prices/refresh`
- `GET /api/fuel-prices/nearby?postal_code=`
- `POST /api/calc/trip`

Ver especificacion completa en `docs/spec.md`.

## GitHub

Issues y Projects habilitados. Hay plantillas de bug/feature en `.github/ISSUE_TEMPLATE/`.

## Importar datasets (Kaggle)

```bash
.\.venv\Scripts\python backend\etl\import_kaggle.py --maintenance path\to\maintenance.csv --depreciation path\to\depreciation.csv
```

Columnas esperadas (CSV):

- mantenimiento: `powertrain_type,segment,category,cost_eur,every_km,every_months`
- depreciacion: `powertrain_type,segment,base_value_eur,annual_rate,km_rate,min_residual_pct`

## Ejemplo de uso

1) Ejecuta `backend/seed.py` para cargar precios y plantillas base.
2) Ejecuta el backend y el frontend.
3) En la UI, pulsa "Calcular viaje" para ver el desglose completo con supuestos.
