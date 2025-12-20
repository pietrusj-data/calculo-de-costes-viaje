# Vehicule Analytics Data

Repositorio con:

- `frontend/`: UI en React (código ya preparado).
- `backend/`: pipeline en Python para búsqueda, limpieza y creación de DataFrames (NHTSA).

## Backend (Python)

1) Crear entorno e instalar dependencias:

```bash
python -m venv .venv
.\.venv\Scripts\python -m pip install -r backend\requirements.txt
```

2) Ejecutar ejemplo (recalls NHTSA → CSV):

```bash
.\.venv\Scripts\python backend\cli.py --make PORSCHE --model PANAMERA --year 2018 --out data\fallos_panamera.csv
```

## Frontend (React)

Este repo incluye los archivos del frontend en `frontend/`. Para ejecutar necesitarás Node.js.

## Publicar en GitHub

Si tienes `git` instalado:

```bash
git init
git add .
git commit -m "Initial commit"
```

Luego crea el repo en GitHub (recomendado sin espacios, por ejemplo `vehicule-analytics-data`) y añade el remote:

```bash
git remote add origin https://github.com/<TU_USUARIO>/vehicule-analytics-data.git
git push -u origin main
```

