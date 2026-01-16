from __future__ import annotations

from datetime import date

from backend.db import SessionLocal, init_db
from backend.models import DepreciationModel, FuelPrice, MaintenanceEvent, MaintenanceTemplate, User, UserVehicle


def main() -> None:
    init_db()
    with SessionLocal() as session:
        if not session.query(User).first():
            user = User(name="Demo User")
            session.add(user)
            session.flush()
            vehicle = UserVehicle(
                user_id=user.id,
                make="Seat",
                model="Leon",
                year=2019,
                current_km=62000,
                annual_km=15000,
                powertrain_type="gasoline",
                segment="compact",
                market_value_eur=14500,
                consumption_l_per_100km=6.4,
            )
            session.add(vehicle)

        if not session.query(MaintenanceEvent).first():
            vehicle = session.query(UserVehicle).first()
            if vehicle:
                session.add_all(
                    [
                        MaintenanceEvent(
                            vehicle_id=vehicle.id,
                            category="oil_filter",
                            event_date=date(2024, 3, 2),
                            odometer_km=52000,
                            cost_eur=160,
                            workshop="Taller Norte",
                        ),
                        MaintenanceEvent(
                            vehicle_id=vehicle.id,
                            category="tires",
                            event_date=date(2025, 1, 12),
                            odometer_km=60000,
                            cost_eur=420,
                            workshop="Ruedas Express",
                        ),
                    ]
                )

        if not session.query(MaintenanceTemplate).first():
            templates = [
                MaintenanceTemplate(
                    powertrain_type="gasoline",
                    segment="compact",
                    category="oil_filter",
                    cost_eur=160,
                    every_km=15000,
                ),
                MaintenanceTemplate(
                    powertrain_type="gasoline",
                    segment="compact",
                    category="tires",
                    cost_eur=420,
                    every_km=45000,
                ),
                MaintenanceTemplate(
                    powertrain_type="gasoline",
                    segment="compact",
                    category="brakes",
                    cost_eur=280,
                    every_km=40000,
                ),
                MaintenanceTemplate(
                    powertrain_type="bev",
                    segment="compact",
                    category="tires",
                    cost_eur=460,
                    every_km=40000,
                ),
            ]
            session.add_all(templates)

        if not session.query(DepreciationModel).first():
            session.add_all(
                [
                    DepreciationModel(
                        powertrain_type="gasoline",
                        segment="compact",
                        base_value_eur=22000,
                        annual_rate=0.13,
                        km_rate=0.02,
                        min_residual_pct=0.2,
                    ),
                    DepreciationModel(
                        powertrain_type="bev",
                        segment="compact",
                        base_value_eur=32000,
                        annual_rate=0.15,
                        km_rate=0.025,
                        min_residual_pct=0.25,
                    ),
                ]
            )

        if not session.query(FuelPrice).first():
            session.add_all(
                [
                    FuelPrice(
                        fuel_type="gasoline",
                        price_eur_per_unit=1.62,
                        unit="eur/l",
                        source="seed",
                    ),
                    FuelPrice(
                        fuel_type="diesel",
                        price_eur_per_unit=1.52,
                        unit="eur/l",
                        source="seed",
                    ),
                ]
            )

        session.commit()
    print("Seeded database with demo data.")


if __name__ == "__main__":
    main()
