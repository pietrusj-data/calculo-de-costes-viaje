from __future__ import annotations

from datetime import date, datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


FuelType = Literal["gasoline", "diesel", "electric"]
PowertrainType = Literal["gasoline", "diesel", "phev", "bev"]
RouteType = Literal["city", "mixed", "highway"]
InsuranceMode = Literal["per_day", "per_km"]


class FuelPriceItem(BaseModel):
    fuel_type: FuelType
    price_eur_per_unit: float
    unit: str
    source: str
    fetched_at: datetime


class FuelPriceResponse(BaseModel):
    items: list[FuelPriceItem]
    generated_at: datetime


class VehicleInput(BaseModel):
    powertrain_type: PowertrainType
    consumption_l_per_100km: Optional[float] = None
    consumption_kwh_per_100km: Optional[float] = None
    phev_electric_share: Optional[float] = Field(None, ge=0, le=1)
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    current_km: Optional[float] = None
    annual_km: Optional[float] = None
    segment: Optional[str] = "generic"


class VehicleCreate(BaseModel):
    user_id: int
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    current_km: Optional[float] = None
    annual_km: Optional[float] = None
    powertrain_type: PowertrainType
    segment: Optional[str] = "generic"


class VehicleResponse(VehicleCreate):
    id: int


class InsuranceInput(BaseModel):
    cost_amount: float
    cost_period: Literal["annual", "monthly"]
    start_date: Optional[date] = None
    annual_km: Optional[float] = None
    mode: InsuranceMode = "per_day"


class InsuranceCreate(BaseModel):
    user_id: int
    vehicle_id: int
    cost_amount: float
    cost_period: Literal["annual", "monthly"]
    start_date: Optional[date] = None
    annual_km: Optional[float] = None


class InsuranceResponse(InsuranceCreate):
    id: int


class MaintenanceInput(BaseModel):
    use_real_costs: bool = False
    force_estimates: bool = False


class MaintenanceEventCreate(BaseModel):
    vehicle_id: int
    category: str
    event_date: Optional[date] = None
    odometer_km: Optional[float] = None
    cost_eur: float
    workshop: Optional[str] = None
    notes: Optional[str] = None


class MaintenanceEventResponse(MaintenanceEventCreate):
    id: int


class TripCalcRequest(BaseModel):
    trip_km: float
    trip_days: int
    route_type: RouteType = "mixed"
    vehicle_id: Optional[int] = None
    vehicle: VehicleInput
    electricity_price_eur_per_kwh: Optional[float] = None
    insurance: Optional[InsuranceInput] = None
    maintenance: MaintenanceInput = MaintenanceInput()


class ComponentBreakdown(BaseModel):
    amount_eur: float
    per_km_eur: float
    source: str
    assumptions: list[str]


class EnergyBreakdown(BaseModel):
    total_eur: float
    per_km_eur: float
    detail: dict[str, float]
    source: str
    assumptions: list[str]


class DepreciationBreakdown(BaseModel):
    amount_eur: float
    per_km_eur: float
    residual_value_eur: float
    source: str
    assumptions: list[str]


class TripCalcResponse(BaseModel):
    total_eur: float
    per_km_eur: float
    energy: EnergyBreakdown
    maintenance: ComponentBreakdown
    insurance: ComponentBreakdown
    depreciation: DepreciationBreakdown
    generated_at: datetime
