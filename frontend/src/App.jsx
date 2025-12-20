import React, { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const FuelIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" x2="15" y1="22" y2="22" />
    <line x1="4" x2="14" y1="9" y2="9" />
    <path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18" />
    <path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5" />
  </svg>
);

const PlugIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const BatteryIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 18H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.19M15 6h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3.19" />
    <line x1="23" x2="23" y1="13" y2="11" />
    <polyline points="11 6 7 12 13 12 9 18" />
  </svg>
);

const SportIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
    <path d="M8.5 8.5v.01" />
    <path d="M16 16v.01" />
    <path d="M12 12v.01" />
    <path d="M12 22s-2-4-2-10 2-10 2-10" />
    <path d="M12 2s4 2 10 2" />
  </svg>
);

const SettingsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const ActivityIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const AlertIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="8" y2="12" />
    <line x1="12" x2="12.01" y1="16" y2="16" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const RefreshIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 2v6h-6" />
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M3 22v-6h6" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
  </svg>
);

const MapPinIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ShieldIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export default function App() {
  const [carType, setCarType] = useState('hybrid');
  const [fuelVariant, setFuelVariant] = useState('gasoline');
  const [brand, setBrand] = useState('Lynk & Co');
  const [model, setModel] = useState('01 PHEV');
  const [drivingStyle, setDrivingStyle] = useState('normal');
  const [terrain, setTerrain] = useState('mixed');
  const [distance, setDistance] = useState(15000);
  const [tripDistance, setTripDistance] = useState(450);
  const [insuranceCost, setInsuranceCost] = useState(600);

  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [fuelPrices, setFuelPrices] = useState({
    gasoline: 1.65,
    diesel: 1.55,
    electric: 0.45,
  });
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchOfficialPrices = async () => {
    setIsLoadingPrices(true);
    setTimeout(() => {
      const mockApiPriceGas = 1.55 + Math.random() * 0.2;
      const mockApiPriceDiesel = 1.45 + Math.random() * 0.2;
      const mockApiPriceElec = 0.35 + Math.random() * 0.15;

      setFuelPrices({
        gasoline: parseFloat(mockApiPriceGas.toFixed(3)),
        diesel: parseFloat(mockApiPriceDiesel.toFixed(3)),
        electric: parseFloat(mockApiPriceElec.toFixed(3)),
      });
      setLastUpdated(new Date().toLocaleTimeString());
      setIsLoadingPrices(false);
    }, 1500);
  };

  const BASE_DATA = {
    combustion: {
      gasoline: {
        baseConsumption: 7.5,
        fuelPrice: fuelPrices.gasoline,
        maintenanceBase: 0.05,
        cityFactor: 1.4,
        highwayFactor: 0.9,
        aggressiveFactor: 1.3,
      },
      diesel: {
        baseConsumption: 5.8,
        fuelPrice: fuelPrices.diesel,
        maintenanceBase: 0.06,
        cityFactor: 1.3,
        highwayFactor: 0.8,
        aggressiveFactor: 1.2,
      },
    },
    electric: {
      baseConsumption: 16,
      fuelPrice: fuelPrices.electric,
      maintenanceBase: 0.03,
      cityFactor: 0.8,
      highwayFactor: 1.3,
      aggressiveFactor: 1.15,
    },
    hybrid: {
      baseConsumption: 4.0,
      fuelPrice: fuelPrices.gasoline,
      maintenanceBase: 0.045,
      cityFactor: 0.5,
      highwayFactor: 1.6,
      aggressiveFactor: 1.25,
    },
    sport: {
      gasoline: {
        name: 'Deportivo (Gasolina)',
        baseConsumption: 10.8,
        fuelPrice: fuelPrices.gasoline,
        maintenanceBase: 0.12,
        cityFactor: 1.6,
        highwayFactor: 0.85,
        aggressiveFactor: 1.5,
      },
      diesel: {
        name: 'Deportivo (Diésel)',
        baseConsumption: 7.2,
        fuelPrice: fuelPrices.diesel,
        maintenanceBase: 0.13,
        cityFactor: 1.4,
        highwayFactor: 0.75,
        aggressiveFactor: 1.3,
      },
    },
  };

  const handleCarTypeChange = (type) => {
    setCarType(type);
    setFuelVariant('gasoline');

    if (type === 'hybrid') {
      setBrand('Lynk & Co');
      setModel('01 PHEV');
    } else if (type === 'sport') {
      setBrand('Porsche');
      setModel('Panamera');
      setInsuranceCost(1800);
    } else if (type === 'electric') {
      setBrand('Tesla');
      setModel('Model 3');
      setInsuranceCost(800);
    } else {
      setBrand('Genérico');
      setModel('Coche Térmico');
      setInsuranceCost(500);
    }
  };

  const getCurrentCarData = () => {
    const typeData = BASE_DATA[carType];
    if (carType === 'combustion' || carType === 'sport') return typeData[fuelVariant];
    return typeData;
  };

  const car = getCurrentCarData();

  const calculateCoefficients = () => {
    let consumptionMultiplier = 1;
    let wearMultiplier = 1;

    if (terrain === 'city') {
      consumptionMultiplier *= car.cityFactor;
      wearMultiplier *= 1.5;
    } else if (terrain === 'highway') {
      consumptionMultiplier *= car.highwayFactor;
      wearMultiplier *= 0.8;
    }

    if (drivingStyle === 'aggressive') {
      consumptionMultiplier *= car.aggressiveFactor;
      wearMultiplier *= 1.8;
    } else if (drivingStyle === 'calm') {
      consumptionMultiplier *= 0.9;
      wearMultiplier *= 0.7;
    }

    return { consumptionMultiplier, wearMultiplier };
  };

  const { consumptionMultiplier, wearMultiplier } = calculateCoefficients();

  const realConsumption = car.baseConsumption * consumptionMultiplier;
  const fuelCostPerKm = (realConsumption * car.fuelPrice) / 100;
  const maintenanceCostPerKm = car.maintenanceBase * wearMultiplier;
  const totalCostPerKm = fuelCostPerKm + maintenanceCostPerKm;

  const dailyFixedCost = insuranceCost / 365;
  const dailyVariableCost = (totalCostPerKm * distance) / 365;
  const totalDailyCost = dailyFixedCost + dailyVariableCost;

  const tripCost = tripDistance * totalCostPerKm;
  const tripFuelCost = tripDistance * fuelCostPerKm;
  const tripMaintCost = tripDistance * maintenanceCostPerKm;

  const chartData = useMemo(() => {
    const data = [];
    const years = 5;
    for (let i = 0; i <= years; i++) {
      const totalDist = distance * i;
      const fuelCost = totalDist * fuelCostPerKm;
      const maintCost = totalDist * maintenanceCostPerKm;
      const insuranceCumul = insuranceCost * i;

      data.push({
        year: `Año ${i}`,
        Combustible: parseFloat(fuelCost.toFixed(0)),
        Mantenimiento: parseFloat(maintCost.toFixed(0)),
        'Seguros/Fijos': parseFloat(insuranceCumul.toFixed(0)),
        'Coste Total': parseFloat((fuelCost + maintCost + insuranceCumul).toFixed(0)),
      });
    }
    return data;
  }, [distance, fuelCostPerKm, maintenanceCostPerKm, insuranceCost]);

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 font-sans text-slate-800 overflow-y-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <ActivityIcon />
            Analítica de Costes
          </h1>
          <p className="text-slate-600">
            Simulador TCO para{' '}
            <span className="font-semibold text-slate-800">
              {brand} {model}{' '}
              {carType === 'sport' ? `(${fuelVariant === 'gasoline' ? 'Gasolina' : 'Diésel'})` : ''}
            </span>
          </p>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-slate-400 font-medium uppercase">Precios Mercado</p>
            <div className="flex flex-col text-xs font-bold text-slate-700">
              <span>G95: {fuelPrices.gasoline}€</span>
              <span>DSL: {fuelPrices.diesel}€</span>
            </div>
          </div>
          <button
            onClick={fetchOfficialPrices}
            disabled={isLoadingPrices}
            className={[
              'p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all',
              isLoadingPrices ? 'animate-spin' : '',
            ].join(' ')}
            title="Sincronizar con API Gobierno"
          >
            <RefreshIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-1 space-y-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-700">
            <SettingsIcon />
            Perfil del Vehículo
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Marca</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                  placeholder="Ej. Lynk & Co"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Modelo</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                  placeholder="Ej. 01 PHEV"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-500 mb-2 block">Tipo de Vehículo</label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  onClick={() => handleCarTypeChange('hybrid')}
                  className={[
                    'py-2 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-2',
                    carType === 'hybrid'
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : 'bg-slate-50 text-slate-600 border border-slate-100',
                  ].join(' ')}
                >
                  <PlugIcon /> PHEV
                </button>
                <button
                  onClick={() => handleCarTypeChange('sport')}
                  className={[
                    'py-2 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-2',
                    carType === 'sport'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-slate-50 text-slate-600 border border-slate-100',
                  ].join(' ')}
                >
                  <SportIcon /> Panamera
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleCarTypeChange('combustion')}
                  className={[
                    'py-2 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-2',
                    carType === 'combustion'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-slate-50 text-slate-600 border border-slate-100',
                  ].join(' ')}
                >
                  <FuelIcon /> Térmico
                </button>
                <button
                  onClick={() => handleCarTypeChange('electric')}
                  className={[
                    'py-2 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-2',
                    carType === 'electric'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-slate-50 text-slate-600 border border-slate-100',
                  ].join(' ')}
                >
                  <BatteryIcon /> EV
                </button>
              </div>
            </div>

            {(carType === 'sport' || carType === 'combustion') && (
              <div className="bg-slate-100 p-2 rounded-lg flex gap-1">
                <button
                  onClick={() => setFuelVariant('gasoline')}
                  className={[
                    'flex-1 py-1.5 text-xs font-bold rounded-md transition-all',
                    fuelVariant === 'gasoline'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-400 hover:text-slate-600',
                  ].join(' ')}
                >
                  GASOLINA 95
                </button>
                <button
                  onClick={() => setFuelVariant('diesel')}
                  className={[
                    'flex-1 py-1.5 text-xs font-bold rounded-md transition-all',
                    fuelVariant === 'diesel'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-400 hover:text-slate-600',
                  ].join(' ')}
                >
                  DIÉSEL (A)
                </button>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-slate-500 mb-2 block">Entorno Habitual</label>
              <div className="grid grid-cols-3 gap-2">
                {['city', 'mixed', 'highway'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTerrain(t)}
                    className={[
                      'py-2 px-1 rounded-lg border text-sm transition-colors',
                      terrain === t
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 hover:border-slate-300',
                    ].join(' ')}
                  >
                    {t === 'city' ? 'Ciudad' : t === 'mixed' ? 'Mixto' : 'Autovía'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-500 mb-2 block">Conducción</label>
              <div className="grid grid-cols-3 gap-2">
                {['calm', 'normal', 'aggressive'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setDrivingStyle(s)}
                    className={[
                      'py-2 px-1 rounded-lg border text-sm transition-colors',
                      drivingStyle === s
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-slate-200 hover:border-slate-300',
                    ].join(' ')}
                  >
                    {s === 'calm' ? 'Eco' : s === 'normal' ? 'Normal' : 'Agresiva'}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-2 mb-2">
                <ShieldIcon /> Costes Fijos (Seguro/Impuestos)
              </label>
              <div className="mb-1 flex justify-between">
                <span className="text-xs text-slate-500">Anual</span>
                <span className="text-sm font-bold text-slate-800">{insuranceCost} €</span>
              </div>
              <input
                type="range"
                min="0"
                max="5000"
                step="50"
                value={insuranceCost}
                onChange={(e) => setInsuranceCost(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-500 flex justify-between mb-2">
                <span>Distancia Anual</span>
                <span className="text-blue-600 font-bold">{distance.toLocaleString()} km</span>
              </label>
              <input
                type="range"
                min="5000"
                max="50000"
                step="1000"
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-md font-semibold flex items-center gap-2 text-slate-700 mb-4">
              <MapPinIcon />
              Calculadora de Viaje
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 flex justify-between">
                  <span>Kms del Viaje</span>
                  <span className="font-bold text-slate-800">{tripDistance} km</span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="2000"
                  step="10"
                  value={tripDistance}
                  onChange={(e) => setTripDistance(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 flex justify-between items-center">
                <span className="text-sm text-purple-900 font-medium">Coste Marginal</span>
                <div className="text-right">
                  <span className="text-xl font-bold text-purple-700">{tripCost.toFixed(2)} €</span>
                  <span className="block text-xs text-purple-500">
                    {tripFuelCost.toFixed(2)}€ fuel + {tripMaintCost.toFixed(2)}€ desg.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <div className="text-slate-400 text-xs uppercase font-bold mb-1">Coste Diario (TCO)</div>
              <div className="text-2xl font-bold text-slate-800">{totalDailyCost.toFixed(2)} €</div>
              <div className="text-xs mt-1 text-slate-500 flex justify-between">
                <span>Fijo: {dailyFixedCost.toFixed(2)}€</span>
                <span>Var: {dailyVariableCost.toFixed(2)}€</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <div className="text-slate-400 text-xs uppercase font-bold mb-1">Coste por KM</div>
              <div className="text-2xl font-bold text-slate-800">{totalCostPerKm.toFixed(3)} €</div>
              <div className="text-xs mt-1 text-slate-500">Inc. Mantenimiento</div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <div className="text-slate-400 text-xs uppercase font-bold mb-1">Proyección 5 Años</div>
              <div className="text-2xl font-bold text-blue-600">
                {((totalCostPerKm * distance * 5) + insuranceCost * 5).toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}{' '}
                €
              </div>
              <div className="text-xs mt-1 text-slate-500">Inc. Seguro y Desgaste</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80">
            <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <TrendingUpIcon />
              Proyección de Costes Acumulados
            </h3>
            <div style={{ width: '100%', height: '85%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorMaint" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorFixed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#64748b" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="year"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} unit="€" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="Seguros/Fijos" stackId="1" stroke="#64748b" fill="url(#colorFixed)" />
                  <Area type="monotone" dataKey="Combustible" stackId="1" stroke="#3b82f6" fill="url(#colorFuel)" />
                  <Area type="monotone" dataKey="Mantenimiento" stackId="1" stroke="#f59e0b" fill="url(#colorMaint)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3">
            <div className="mt-0.5 text-blue-600 flex-shrink-0">
              <AlertIcon />
            </div>
            <div className="text-sm text-blue-800">
              <strong>Análisis Automático para {brand}:</strong>
              {carType === 'sport' && fuelVariant === 'diesel' ? (
                <span className="block mt-1">
                  El Panamera Diésel reduce consumo vs gasolina en viajes largos. Vigila el mantenimiento del FAP si haces mucha ciudad.
                </span>
              ) : carType === 'sport' && fuelVariant === 'gasoline' ? (
                <span className="block mt-1">
                  El Panamera Gasolina tiene un &quot;impuesto de diversión&quot; alto. Úsalo con moderación en ciudad.
                </span>
              ) : (
                carType === 'hybrid' && (
                  <span className="block mt-1">
                    La clave de tu rentabilidad está en mantener el mix 50/50. Si subes a 80% autovía, el coste por KM se dispara.
                  </span>
                )
              )}
              <span className="block mt-2 font-medium border-t border-blue-200 pt-2">
                Solo en seguro ({insuranceCost}€), tu coche cuesta{' '}
                <strong>{(insuranceCost / 365).toFixed(2)}€ al día</strong> aunque no lo muevas.
              </span>
              {lastUpdated ? (
                <div className="text-xs text-blue-600 mt-2">Última actualización de precios: {lastUpdated}</div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

