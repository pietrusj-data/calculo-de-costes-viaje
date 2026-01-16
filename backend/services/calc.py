from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import DepreciationModel, FuelPrice, MaintenanceEvent, MaintenanceTemplate, UserVehicle
from ..schemas import TripCalcRequest


@dataclass
class MaintenanceResult:
    per_km_eur: float
    amount_eur: float
    source: str
    assumptions: list[str]


@dataclass
class DepreciationResult:
    per_km_eur: float
    amount_eur: float
    residual_value_eur: float
    source: str
    assumptions: list[str]


@dataclass
class EnergyResult:
    per_km_eur: float
    total_eur: float
    detail: dict[str, float]
    source: str
    assumptions: list[str]


def _latest_fuel_price(session: Session, fuel_type: str) -> FuelPrice | None:
    stmt = select(FuelPrice).where(FuelPrice.fuel_type == fuel_type).order_by(FuelPrice.fetched_at.desc())
    return session.execute(stmt).scalars().first()


def compute_energy(session: Session, payload: TripCalcRequest) -> EnergyResult:
    vehicle = payload.vehicle
    assumptions: list[str] = []
    detail: dict[str, float] = {}
    route_multiplier = {"city": 1.15, "mixed": 1.0, "highway": 0.9}.get(payload.route_type, 1.0)

    if payload.vehicle_id:
        stored_vehicle = session.get(UserVehicle, payload.vehicle_id)
        if stored_vehicle:
            if vehicle.consumption_l_per_100km is None and stored_vehicle.consumption_l_per_100km:
                vehicle.consumption_l_per_100km = stored_vehicle.consumption_l_per_100km
                assumptions.append("consumption l/100km from saved vehicle")
            if vehicle.consumption_kwh_per_100km is None and stored_vehicle.consumption_kwh_per_100km:
                vehicle.consumption_kwh_per_100km = stored_vehicle.consumption_kwh_per_100km
                assumptions.append("consumption kwh/100km from saved vehicle")
            if vehicle.phev_electric_share is None and stored_vehicle.phev_electric_share:
                vehicle.phev_electric_share = stored_vehicle.phev_electric_share
                assumptions.append("PHEV share from saved vehicle")

    if vehicle.powertrain_type in {"gasoline", "diesel"}:
        fuel_type = "gasoline" if vehicle.powertrain_type == "gasoline" else "diesel"
        price = _latest_fuel_price(session, fuel_type)
        if not price:
            raise ValueError(f"Missing fuel price for {fuel_type}")
        if vehicle.consumption_l_per_100km is None:
            raise ValueError("Missing consumption_l_per_100km")

        liters = payload.trip_km * vehicle.consumption_l_per_100km * route_multiplier / 100
        total = liters * price.price_eur_per_unit
        detail[f"{fuel_type}_liters"] = liters
        assumptions.append(f"price {price.price_eur_per_unit:.3f} eur/l from {price.source}")
        assumptions.append(f"consumption in l/100km from user, route multiplier {route_multiplier}")
        return EnergyResult(
            per_km_eur=total / payload.trip_km,
            total_eur=total,
            detail=detail,
            source=f"{price.source} ({price.fetched_at.date().isoformat()})",
            assumptions=assumptions,
        )

    if vehicle.powertrain_type == "bev":
        if vehicle.consumption_kwh_per_100km is None:
            raise ValueError("Missing consumption_kwh_per_100km")
        if payload.electricity_price_eur_per_kwh is None:
            raise ValueError("Missing electricity_price_eur_per_kwh")
        kwh = payload.trip_km * vehicle.consumption_kwh_per_100km * route_multiplier / 100
        total = kwh * payload.electricity_price_eur_per_kwh
        detail["electric_kwh"] = kwh
        assumptions.append("electricity price from user input")
        assumptions.append(f"consumption in kwh/100km from user, route multiplier {route_multiplier}")
        return EnergyResult(
            per_km_eur=total / payload.trip_km,
            total_eur=total,
            detail=detail,
            source="user input",
            assumptions=assumptions,
        )

    if vehicle.powertrain_type == "phev":
        if vehicle.consumption_kwh_per_100km is None or vehicle.consumption_l_per_100km is None:
            raise ValueError("Missing PHEV consumption inputs")
        if vehicle.phev_electric_share is None:
            raise ValueError("Missing phev_electric_share")
        if payload.electricity_price_eur_per_kwh is None:
            raise ValueError("Missing electricity_price_eur_per_kwh")

        electric_km = payload.trip_km * vehicle.phev_electric_share
        fuel_km = payload.trip_km - electric_km
        kwh = electric_km * vehicle.consumption_kwh_per_100km * route_multiplier / 100
        fuel_liters = fuel_km * vehicle.consumption_l_per_100km * route_multiplier / 100

        gasoline_price = _latest_fuel_price(session, "gasoline")
        if not gasoline_price:
            raise ValueError("Missing fuel price for gasoline")

        total_electric = kwh * payload.electricity_price_eur_per_kwh
        total_fuel = fuel_liters * gasoline_price.price_eur_per_unit
        total = total_electric + total_fuel

        detail["electric_kwh"] = kwh
        detail["gasoline_liters"] = fuel_liters
        assumptions.append(f"gasoline price {gasoline_price.price_eur_per_unit:.3f} eur/l from {gasoline_price.source}")
        assumptions.append("electricity price from user input")
        assumptions.append("PHEV share from user input")
        assumptions.append(f"route multiplier {route_multiplier}")
        return EnergyResult(
            per_km_eur=total / payload.trip_km,
            total_eur=total,
            detail=detail,
            source=f"{gasoline_price.source} + user input",
            assumptions=assumptions,
        )

    raise ValueError("Unsupported powertrain type")


def _maintenance_from_events(session: Session, vehicle_id: int | None, trip_km: float) -> MaintenanceResult | None:
    if not vehicle_id:
        return None
    events = (
        session.execute(select(MaintenanceEvent).where(MaintenanceEvent.vehicle_id == vehicle_id))
        .scalars()
        .all()
    )
    if not events:
        return None
    costs = sum(event.cost_eur for event in events)
    odo_values = [event.odometer_km for event in events if event.odometer_km is not None]
    if len(odo_values) >= 2:
        distance = max(odo_values) - min(odo_values)
    else:
        vehicle = session.get(UserVehicle, vehicle_id)
        distance = (vehicle.current_km or 0) - (min(odo_values) if odo_values else 0)
    if distance <= 0:
        return None
    per_km = costs / distance
    return MaintenanceResult(
        per_km_eur=per_km,
        amount_eur=per_km * trip_km,
        source="user events",
        assumptions=["per km from maintenance event history"],
    )


def _maintenance_from_templates(session: Session, powertrain_type: str, segment: str, trip_km: float) -> MaintenanceResult:
    templates = (
        session.execute(
            select(MaintenanceTemplate).where(
                MaintenanceTemplate.powertrain_type == powertrain_type,
                MaintenanceTemplate.segment == segment,
            )
        )
        .scalars()
        .all()
    )
    if not templates:
        templates = (
            session.execute(
                select(MaintenanceTemplate).where(MaintenanceTemplate.powertrain_type == powertrain_type)
            )
            .scalars()
            .all()
        )
    per_km_total = 0.0
    for item in templates:
        if item.every_km and item.every_km > 0:
            per_km_total += item.cost_eur / item.every_km
        elif item.every_months and item.every_months > 0:
            per_km_total += item.cost_eur / 15000
    if per_km_total == 0:
        per_km_total = 0.05
    return MaintenanceResult(
        per_km_eur=per_km_total,
        amount_eur=per_km_total * trip_km,
        source="template estimates",
        assumptions=["templates by powertrain and segment"],
    )


def compute_maintenance(session: Session, payload: TripCalcRequest, vehicle_id: int | None) -> MaintenanceResult:
    if payload.maintenance.use_real_costs and not payload.maintenance.force_estimates:
        real = _maintenance_from_events(session, vehicle_id, payload.trip_km)
        if real:
            return real
    return _maintenance_from_templates(session, payload.vehicle.powertrain_type, payload.vehicle.segment or "generic", payload.trip_km)


def compute_insurance(payload: TripCalcRequest) -> MaintenanceResult:
    if not payload.insurance:
        return MaintenanceResult(
            per_km_eur=0.0,
            amount_eur=0.0,
            source="not provided",
            assumptions=["insurance not provided"],
        )
    insurance = payload.insurance
    annual_cost = insurance.cost_amount * (12 if insurance.cost_period == "monthly" else 1)
    per_day = annual_cost / 365
    per_km = annual_cost / (insurance.annual_km or payload.vehicle.annual_km or 15000)
    if insurance.mode == "per_km":
        amount = per_km * payload.trip_km
        mode_assumption = "insurance allocated per km"
        per_km_value = per_km
    else:
        amount = per_day * payload.trip_days
        mode_assumption = "insurance allocated per day"
        per_km_value = amount / payload.trip_km
    return MaintenanceResult(
        per_km_eur=per_km_value,
        amount_eur=amount,
        source="user policy",
        assumptions=[mode_assumption, f"annual cost {annual_cost:.2f} eur"],
    )


def compute_depreciation(session: Session, payload: TripCalcRequest, vehicle_id: int | None) -> DepreciationResult:
    vehicle = payload.vehicle
    segment = vehicle.segment or "generic"
    assumptions = [
        "depreciation model",
    ]
    if payload.vehicle_id and vehicle.market_value_eur is None:
        stored_vehicle = session.get(UserVehicle, payload.vehicle_id)
        if stored_vehicle and stored_vehicle.market_value_eur:
            vehicle.market_value_eur = stored_vehicle.market_value_eur
    model = (
        session.execute(
            select(DepreciationModel).where(
                DepreciationModel.powertrain_type == vehicle.powertrain_type,
                DepreciationModel.segment == segment,
            )
        )
        .scalars()
        .first()
    )
    if not model:
        model = (
            session.execute(select(DepreciationModel).where(DepreciationModel.powertrain_type == vehicle.powertrain_type))
            .scalars()
            .first()
        )
    if not model:
        model = DepreciationModel(
            powertrain_type=vehicle.powertrain_type,
            segment=segment,
            base_value_eur=25000,
            annual_rate=0.12,
            km_rate=0.02,
            min_residual_pct=0.2,
        )
    years = max(0, (datetime.utcnow().year - (vehicle.year or datetime.utcnow().year)))
    current_km = vehicle.current_km or 0
    value = model.base_value_eur * ((1 - model.annual_rate) ** years)
    value *= (1 - model.km_rate) ** (current_km / 10000)
    residual_floor = model.base_value_eur * model.min_residual_pct
    residual_value = max(value, residual_floor)
    total_life_km = max(vehicle.annual_km or 15000, 1) * 12
    per_km = (model.base_value_eur - residual_floor) / total_life_km
    amount = per_km * payload.trip_km
    if vehicle.market_value_eur:
        residual_value = vehicle.market_value_eur
        residual_floor = min(residual_value, model.base_value_eur * model.min_residual_pct)
        per_km = max((model.base_value_eur - residual_value) / total_life_km, 0)
        amount = per_km * payload.trip_km
        assumptions.append("market value provided by user")
    return DepreciationResult(
        per_km_eur=per_km,
        amount_eur=amount,
        residual_value_eur=residual_value,
        source="depreciation model",
        assumptions=assumptions
        + [
            f"annual_rate {model.annual_rate:.2f}",
            f"km_rate {model.km_rate:.2f} per 10k km",
            f"min_residual_pct {model.min_residual_pct:.2f}",
        ],
    )
