from __future__ import annotations

from datetime import datetime

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .db import SessionLocal, init_db
from .models import FuelPrice, InsurancePolicy, MaintenanceEvent, UserVehicle
from .schemas import (
    FuelNearbyResponse,
    FuelPriceResponse,
    InsuranceCreate,
    InsuranceResponse,
    MaintenanceEventCreate,
    MaintenanceEventResponse,
    TripCalcRequest,
    TripCalcResponse,
    VehicleCreate,
    VehicleResponse,
)
from .services.calc import compute_depreciation, compute_energy, compute_insurance, compute_maintenance
from .services.fuel_prices import fetch_and_store_fuel_prices, fetch_stations_by_postal_code

app = FastAPI(title="Trip Cost API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.on_event("startup")
def startup() -> None:
    init_db()


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "time": datetime.utcnow().isoformat()}


@app.get("/api/fuel-prices/latest", response_model=FuelPriceResponse)
def latest_fuel_prices(db: Session = Depends(get_db)) -> FuelPriceResponse:
    items = (
        db.query(FuelPrice)
        .order_by(FuelPrice.fetched_at.desc())
        .limit(10)
        .all()
    )
    if not items:
        raise HTTPException(status_code=404, detail="No fuel prices found. Run refresh first.")
    return FuelPriceResponse(
        items=[
            {
                "fuel_type": item.fuel_type,
                "price_eur_per_unit": item.price_eur_per_unit,
                "unit": item.unit,
                "source": item.source,
                "fetched_at": item.fetched_at,
            }
            for item in items
        ],
        generated_at=datetime.utcnow(),
    )


@app.get("/api/vehicles", response_model=list[VehicleResponse])
def list_vehicles(db: Session = Depends(get_db)) -> list[VehicleResponse]:
    vehicles = db.query(UserVehicle).order_by(UserVehicle.id.asc()).all()
    return [
        VehicleResponse(
            id=item.id,
            user_id=item.user_id,
            make=item.make,
            model=item.model,
            year=item.year,
            current_km=item.current_km,
            annual_km=item.annual_km,
            powertrain_type=item.powertrain_type,
            segment=item.segment,
            market_value_eur=item.market_value_eur,
            consumption_l_per_100km=item.consumption_l_per_100km,
            consumption_kwh_per_100km=item.consumption_kwh_per_100km,
            phev_electric_share=item.phev_electric_share,
        )
        for item in vehicles
    ]


@app.post("/api/vehicles", response_model=VehicleResponse)
def create_vehicle(payload: VehicleCreate, db: Session = Depends(get_db)) -> VehicleResponse:
    vehicle = UserVehicle(**payload.model_dump())
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return VehicleResponse(
        id=vehicle.id,
        user_id=vehicle.user_id,
        make=vehicle.make,
        model=vehicle.model,
        year=vehicle.year,
        current_km=vehicle.current_km,
        annual_km=vehicle.annual_km,
        powertrain_type=vehicle.powertrain_type,
        segment=vehicle.segment,
        market_value_eur=vehicle.market_value_eur,
        consumption_l_per_100km=vehicle.consumption_l_per_100km,
        consumption_kwh_per_100km=vehicle.consumption_kwh_per_100km,
        phev_electric_share=vehicle.phev_electric_share,
    )


@app.get("/api/maintenance-events", response_model=list[MaintenanceEventResponse])
def list_maintenance_events(vehicle_id: int, db: Session = Depends(get_db)) -> list[MaintenanceEventResponse]:
    events = (
        db.query(MaintenanceEvent)
        .filter(MaintenanceEvent.vehicle_id == vehicle_id)
        .order_by(MaintenanceEvent.event_date.desc())
        .all()
    )
    return [
        MaintenanceEventResponse(
            id=event.id,
            vehicle_id=event.vehicle_id,
            category=event.category,
            event_date=event.event_date,
            odometer_km=event.odometer_km,
            cost_eur=event.cost_eur,
            workshop=event.workshop,
            notes=event.notes,
        )
        for event in events
    ]


@app.post("/api/maintenance-events", response_model=MaintenanceEventResponse)
def create_maintenance_event(payload: MaintenanceEventCreate, db: Session = Depends(get_db)) -> MaintenanceEventResponse:
    event = MaintenanceEvent(**payload.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)
    return MaintenanceEventResponse(
        id=event.id,
        vehicle_id=event.vehicle_id,
        category=event.category,
        event_date=event.event_date,
        odometer_km=event.odometer_km,
        cost_eur=event.cost_eur,
        workshop=event.workshop,
        notes=event.notes,
    )


@app.get("/api/insurance-policies", response_model=list[InsuranceResponse])
def list_insurance(vehicle_id: int, db: Session = Depends(get_db)) -> list[InsuranceResponse]:
    policies = (
        db.query(InsurancePolicy)
        .filter(InsurancePolicy.vehicle_id == vehicle_id)
        .order_by(InsurancePolicy.created_at.desc())
        .all()
    )
    return [
        InsuranceResponse(
            id=policy.id,
            user_id=policy.user_id,
            vehicle_id=policy.vehicle_id,
            cost_amount=policy.cost_amount,
            cost_period=policy.cost_period,
            start_date=policy.start_date,
            annual_km=policy.annual_km,
        )
        for policy in policies
    ]


@app.post("/api/insurance-policies", response_model=InsuranceResponse)
def create_insurance(payload: InsuranceCreate, db: Session = Depends(get_db)) -> InsuranceResponse:
    policy = InsurancePolicy(**payload.model_dump())
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return InsuranceResponse(
        id=policy.id,
        user_id=policy.user_id,
        vehicle_id=policy.vehicle_id,
        cost_amount=policy.cost_amount,
        cost_period=policy.cost_period,
        start_date=policy.start_date,
        annual_km=policy.annual_km,
    )


@app.post("/api/fuel-prices/refresh")
def refresh_fuel_prices(db: Session = Depends(get_db)) -> dict[str, str]:
    fetch_and_store_fuel_prices(db)
    return {"status": "ok", "time": datetime.utcnow().isoformat()}


@app.get("/api/fuel-prices/nearby", response_model=FuelNearbyResponse)
def fuel_prices_nearby(postal_code: str) -> FuelNearbyResponse:
    if not postal_code or len(postal_code.strip()) < 4:
        raise HTTPException(status_code=400, detail="postal_code required")
    payload = fetch_stations_by_postal_code(postal_code)
    return FuelNearbyResponse(**payload)


@app.post("/api/calc/trip", response_model=TripCalcResponse)
def calculate_trip(payload: TripCalcRequest, db: Session = Depends(get_db)) -> TripCalcResponse:
    try:
        energy = compute_energy(db, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    maintenance = compute_maintenance(db, payload, vehicle_id=payload.vehicle_id)
    insurance = compute_insurance(payload)
    depreciation = compute_depreciation(db, payload, vehicle_id=payload.vehicle_id)
    total = energy.total_eur + maintenance.amount_eur + insurance.amount_eur + depreciation.amount_eur
    per_km = total / payload.trip_km

    return TripCalcResponse(
        total_eur=total,
        per_km_eur=per_km,
        energy={
            "total_eur": energy.total_eur,
            "per_km_eur": energy.per_km_eur,
            "detail": energy.detail,
            "source": energy.source,
            "assumptions": energy.assumptions,
        },
        maintenance={
            "amount_eur": maintenance.amount_eur,
            "per_km_eur": maintenance.per_km_eur,
            "source": maintenance.source,
            "assumptions": maintenance.assumptions,
        },
        insurance={
            "amount_eur": insurance.amount_eur,
            "per_km_eur": insurance.per_km_eur,
            "source": insurance.source,
            "assumptions": insurance.assumptions,
        },
        depreciation={
            "amount_eur": depreciation.amount_eur,
            "per_km_eur": depreciation.per_km_eur,
            "residual_value_eur": depreciation.residual_value_eur,
            "source": depreciation.source,
            "assumptions": depreciation.assumptions,
        },
        generated_at=datetime.utcnow(),
    )
