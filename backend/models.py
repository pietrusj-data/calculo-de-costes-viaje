from __future__ import annotations

from datetime import datetime, date

from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    vehicles: Mapped[list["UserVehicle"]] = relationship(back_populates="user")


class UserVehicle(Base):
    __tablename__ = "user_vehicles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    make: Mapped[str | None] = mapped_column(String(80))
    model: Mapped[str | None] = mapped_column(String(80))
    year: Mapped[int | None] = mapped_column(Integer)
    current_km: Mapped[float | None] = mapped_column(Float)
    annual_km: Mapped[float | None] = mapped_column(Float)
    powertrain_type: Mapped[str] = mapped_column(String(20), nullable=False)
    segment: Mapped[str] = mapped_column(String(30), default="generic")
    consumption_l_per_100km: Mapped[float | None] = mapped_column(Float)
    consumption_kwh_per_100km: Mapped[float | None] = mapped_column(Float)
    phev_electric_share: Mapped[float | None] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="vehicles")
    insurance_policies: Mapped[list["InsurancePolicy"]] = relationship(back_populates="vehicle")
    maintenance_events: Mapped[list["MaintenanceEvent"]] = relationship(back_populates="vehicle")


class FuelPrice(Base):
    __tablename__ = "fuel_prices"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    fuel_type: Mapped[str] = mapped_column(String(20), nullable=False)
    price_eur_per_unit: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[str] = mapped_column(String(10), nullable=False)
    source: Mapped[str] = mapped_column(String(200), nullable=False)
    fetched_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class InsurancePolicy(Base):
    __tablename__ = "insurance_policies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("user_vehicles.id"), nullable=False)
    cost_amount: Mapped[float] = mapped_column(Float, nullable=False)
    cost_period: Mapped[str] = mapped_column(String(20), nullable=False)
    start_date: Mapped[date | None] = mapped_column(Date)
    annual_km: Mapped[float | None] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    vehicle: Mapped["UserVehicle"] = relationship(back_populates="insurance_policies")


class MaintenanceEvent(Base):
    __tablename__ = "maintenance_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("user_vehicles.id"), nullable=False)
    category: Mapped[str] = mapped_column(String(80), nullable=False)
    event_date: Mapped[date | None] = mapped_column(Date)
    odometer_km: Mapped[float | None] = mapped_column(Float)
    cost_eur: Mapped[float] = mapped_column(Float, nullable=False)
    workshop: Mapped[str | None] = mapped_column(String(120))
    notes: Mapped[str | None] = mapped_column(Text)

    vehicle: Mapped["UserVehicle"] = relationship(back_populates="maintenance_events")


class MaintenanceTemplate(Base):
    __tablename__ = "maintenance_templates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    powertrain_type: Mapped[str] = mapped_column(String(20), nullable=False)
    segment: Mapped[str] = mapped_column(String(30), default="generic")
    category: Mapped[str] = mapped_column(String(80), nullable=False)
    cost_eur: Mapped[float] = mapped_column(Float, nullable=False)
    every_km: Mapped[float | None] = mapped_column(Float)
    every_months: Mapped[int | None] = mapped_column(Integer)


class DepreciationModel(Base):
    __tablename__ = "depreciation_models"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    powertrain_type: Mapped[str] = mapped_column(String(20), nullable=False)
    segment: Mapped[str] = mapped_column(String(30), default="generic")
    base_value_eur: Mapped[float] = mapped_column(Float, nullable=False)
    annual_rate: Mapped[float] = mapped_column(Float, nullable=False)
    km_rate: Mapped[float] = mapped_column(Float, nullable=False)
    min_residual_pct: Mapped[float] = mapped_column(Float, nullable=False, default=0.2)
