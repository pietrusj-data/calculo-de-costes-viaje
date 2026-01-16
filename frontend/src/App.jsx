import React, { useEffect, useMemo, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const SectionTitle = ({ kicker, title, subtitle }) => (
  <div className="section-title">
    <p className="section-kicker">{kicker}</p>
    <h2>{title}</h2>
    {subtitle ? <p className="section-sub">{subtitle}</p> : null}
  </div>
);

const InputRow = ({ label, children, hint }) => (
  <label className="input-row">
    <span>
      {label}
      {hint ? <em>{hint}</em> : null}
    </span>
    {children}
  </label>
);

const formatMoney = (value) =>
  value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function App() {
  const [tripKm, setTripKm] = useState(420);
  const [tripDays, setTripDays] = useState(3);
  const [routeType, setRouteType] = useState('mixed');
  const [powertrainType, setPowertrainType] = useState('gasoline');
  const [consumptionL, setConsumptionL] = useState(6.5);
  const [consumptionKwh, setConsumptionKwh] = useState(17.5);
  const [phevElectricKm, setPhevElectricKm] = useState(0);
  const [make, setMake] = useState('Seat');
  const [model, setModel] = useState('Leon');
  const [year, setYear] = useState(2019);
  const [currentKm, setCurrentKm] = useState(62000);
  const [annualKm, setAnnualKm] = useState(15000);
  const [segment, setSegment] = useState('compact');
  const [marketValue, setMarketValue] = useState('');
  const [electricityPrice, setElectricityPrice] = useState(0.32);
  const [vehicleId, setVehicleId] = useState('');

  const [insuranceAmount, setInsuranceAmount] = useState(520);
  const [insurancePeriod, setInsurancePeriod] = useState('annual');
  const [insuranceMode, setInsuranceMode] = useState('per_day');

  const [useRealMaintenance, setUseRealMaintenance] = useState(false);
  const [forceEstimates, setForceEstimates] = useState(false);

  const [fuelPrices, setFuelPrices] = useState(null);
  const [priceStatus, setPriceStatus] = useState('idle');
  const [calcStatus, setCalcStatus] = useState('idle');
  const [calcResult, setCalcResult] = useState(null);
  const [error, setError] = useState('');
  const [maintenanceEvents, setMaintenanceEvents] = useState([]);
  const [postalCode, setPostalCode] = useState('');
  const [stationResults, setStationResults] = useState(null);
  const [stationStatus, setStationStatus] = useState('idle');
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesStatus, setVehiclesStatus] = useState('idle');
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [showCreateVehicle, setShowCreateVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    user_id: 1,
    make: '',
    model: '',
    year: '',
    current_km: '',
    annual_km: '',
    powertrain_type: 'gasoline',
    segment: 'generic',
    market_value_eur: '',
    consumption_l_per_100km: '',
    consumption_kwh_per_100km: '',
    phev_electric_km_per_100: '',
  });
  const [eventForm, setEventForm] = useState({
    category: 'oil_filter',
    event_date: '',
    odometer_km: '',
    cost_eur: '',
    workshop: '',
    notes: '',
  });

  const refreshFuelPrices = async () => {
    setPriceStatus('loading');
    setError('');
    try {
      await fetch(`${API_BASE}/api/fuel-prices/refresh`, { method: 'POST' });
      const response = await fetch(`${API_BASE}/api/fuel-prices/latest`);
      if (!response.ok) throw new Error('Failed to fetch prices');
      const data = await response.json();
      setFuelPrices(data);
      setPriceStatus('ready');
    } catch (err) {
      setError(err.message || 'Price refresh failed');
      setPriceStatus('error');
    }
  };

  const fetchFuelPrices = async () => {
    setPriceStatus('loading');
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/fuel-prices/latest`);
      if (!response.ok) throw new Error('No fuel prices available yet');
      const data = await response.json();
      setFuelPrices(data);
      setPriceStatus('ready');
    } catch (err) {
      setPriceStatus('idle');
    }
  };

  const fetchStationsByPostalCode = async () => {
    if (!postalCode.trim()) return;
    setStationStatus('loading');
    setError('');
    try {
      const response = await fetch(
        `${API_BASE}/api/fuel-prices/nearby?postal_code=${encodeURIComponent(postalCode.trim())}`,
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'No stations found');
      }
      const data = await response.json();
      setStationResults(data);
      setStationStatus('ready');
    } catch (err) {
      setStationResults(null);
      setStationStatus('error');
      setError(err.message || 'Station lookup failed');
    }
  };

  const fetchVehicles = async () => {
    setVehiclesStatus('loading');
    try {
      const response = await fetch(`${API_BASE}/api/vehicles`);
      if (!response.ok) throw new Error('Failed to fetch vehicles');
      const data = await response.json();
      setVehicles(data);
      if (!vehicleId && data.length) {
        setVehicleId(String(data[0].id));
      }
      setVehiclesStatus('ready');
    } catch (err) {
      setVehiclesStatus('error');
      setVehicles([]);
    }
  };

  const createVehicle = async () => {
    setError('');
    try {
      const payload = {
        ...newVehicle,
        user_id: Number(newVehicle.user_id || 1),
        year: newVehicle.year ? Number(newVehicle.year) : null,
        current_km: newVehicle.current_km ? Number(newVehicle.current_km) : null,
        annual_km: newVehicle.annual_km ? Number(newVehicle.annual_km) : null,
        market_value_eur: newVehicle.market_value_eur ? Number(newVehicle.market_value_eur) : null,
        consumption_l_per_100km: newVehicle.consumption_l_per_100km
          ? Number(newVehicle.consumption_l_per_100km)
          : null,
        consumption_kwh_per_100km: newVehicle.consumption_kwh_per_100km
          ? Number(newVehicle.consumption_kwh_per_100km)
          : null,
        phev_electric_share: newVehicle.phev_electric_km_per_100
          ? Number(newVehicle.phev_electric_km_per_100) / 100
          : null,
      };
      const response = await fetch(`${API_BASE}/api/vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to create vehicle');
      }
      setNewVehicle({ ...newVehicle, make: '', model: '', year: '' });
      fetchVehicles();
    } catch (err) {
      setError(err.message || 'Failed to create vehicle');
    }
  };

  const buildPayload = () => ({
    trip_km: Number(tripKm),
    trip_days: Number(tripDays),
    route_type: routeType,
    vehicle_id: vehicleId ? Number(vehicleId) : null,
    electricity_price_eur_per_kwh: powertrainType === 'bev' || powertrainType === 'phev' ? Number(electricityPrice) : null,
    vehicle: {
      powertrain_type: powertrainType,
      consumption_l_per_100km: powertrainType === 'gasoline' || powertrainType === 'diesel' || powertrainType === 'phev'
        ? Number(consumptionL)
        : null,
      consumption_kwh_per_100km: powertrainType === 'bev' || powertrainType === 'phev'
        ? Number(consumptionKwh)
        : null,
      phev_electric_share: powertrainType === 'phev'
        ? Math.min(Number(phevElectricKm) || 0, Number(tripKm) || 0) / (Number(tripKm) || 1)
        : null,
      market_value_eur: marketValue ? Number(marketValue) : null,
      make,
      model,
      year: Number(year),
      current_km: Number(currentKm),
      annual_km: Number(annualKm),
      segment,
    },
    insurance: {
      cost_amount: Number(insuranceAmount),
      cost_period: insurancePeriod,
      annual_km: Number(annualKm),
      mode: insuranceMode,
    },
    maintenance: {
      use_real_costs: useRealMaintenance,
      force_estimates: forceEstimates,
    },
  });

  const runCalculation = async () => {
    setCalcStatus('loading');
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/calc/trip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Calculation failed');
      }
      const data = await response.json();
      setCalcResult(data);
      setCalcStatus('ready');
    } catch (err) {
      setError(err.message || 'Calculation failed');
      setCalcStatus('error');
    }
  };

  const fetchEvents = async () => {
    if (!vehicleId) {
      setMaintenanceEvents([]);
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/api/maintenance-events?vehicle_id=${vehicleId}`);
      if (!response.ok) return;
      const data = await response.json();
      setMaintenanceEvents(data);
    } catch (err) {
      setMaintenanceEvents([]);
    }
  };

  const createEvent = async () => {
    setError('');
    try {
      if (!vehicleId) {
        throw new Error('Selecciona un vehiculo para guardar el evento');
      }
      const payload = {
        vehicle_id: Number(vehicleId),
        category: eventForm.category,
        event_date: eventForm.event_date || null,
        odometer_km: eventForm.odometer_km ? Number(eventForm.odometer_km) : null,
        cost_eur: Number(eventForm.cost_eur),
        workshop: eventForm.workshop || null,
        notes: eventForm.notes || null,
      };
      const response = await fetch(`${API_BASE}/api/maintenance-events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to save maintenance event');
      setEventForm({ ...eventForm, cost_eur: '', odometer_km: '', event_date: '', workshop: '', notes: '' });
      fetchEvents();
    } catch (err) {
      setError(err.message || 'Failed to save maintenance event');
    }
  };

  useEffect(() => {
    fetchFuelPrices();
    fetchVehicles();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [vehicleId]);

  useEffect(() => {
    if (!vehicleId) return;
    const selected = vehicles.find((item) => String(item.id) === String(vehicleId));
    if (!selected) return;
    setMake(selected.make || '');
    setModel(selected.model || '');
    setYear(selected.year || '');
    setCurrentKm(selected.current_km || 0);
    setAnnualKm(selected.annual_km || 0);
    setSegment(selected.segment || 'generic');
    setPowertrainType(selected.powertrain_type || 'gasoline');
    setMarketValue(selected.market_value_eur || '');
    if (selected.consumption_l_per_100km) {
      setConsumptionL(selected.consumption_l_per_100km);
    }
    if (selected.consumption_kwh_per_100km) {
      setConsumptionKwh(selected.consumption_kwh_per_100km);
    }
    if (selected.phev_electric_share) {
      setPhevElectricKm(selected.phev_electric_share * (Number(tripKm) || 0));
    }
  }, [vehicleId, vehicles]);

  const fuelPriceSummary = useMemo(() => {
    if (!fuelPrices?.items?.length) return null;
    const latest = {};
    fuelPrices.items.forEach((item) => {
      if (!latest[item.fuel_type]) latest[item.fuel_type] = item;
    });
    return latest;
  }, [fuelPrices]);

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="hero-kicker">Antigravity Lab</p>
          <h1>Coste real de un viaje en coche</h1>
          <p>
            Calcula energia, mantenimiento, depreciacion y seguro con fuentes reales. Sin magia negra.
          </p>
        </div>
        <div className="hero-card">
          <p>Precio combustible (ESP)</p>
          <div className="hero-prices">
            <span>Gasolina: {fuelPriceSummary?.gasoline ? fuelPriceSummary.gasoline.price_eur_per_unit.toFixed(3) : '--'} eur/l</span>
            <span>Diesel: {fuelPriceSummary?.diesel ? fuelPriceSummary.diesel.price_eur_per_unit.toFixed(3) : '--'} eur/l</span>
          </div>
          <button type="button" onClick={refreshFuelPrices} className="ghost" disabled={priceStatus === 'loading'}>
            {priceStatus === 'loading' ? 'Actualizando...' : 'Actualizar precios oficiales'}
          </button>
          <p className="hero-meta">
            {fuelPriceSummary?.gasoline ? `Fuente: ${fuelPriceSummary.gasoline.source}` : 'No hay precios guardados'}
          </p>
        </div>
      </header>

      {error ? <div className="error">{error}</div> : null}

      <section className="panel grid">
        <div className="col">
          <SectionTitle
            kicker="01 Calculadora"
            title="Datos del viaje"
            subtitle="Introduce los datos clave para el coste marginal del trayecto."
          />
          <div className="panel-body">
            <InputRow label="Kilometros del viaje" hint="km">
              <input type="number" value={tripKm} onChange={(e) => setTripKm(e.target.value)} />
            </InputRow>
            <InputRow label="Dias del viaje" hint="para seguro">
              <input type="number" value={tripDays} onChange={(e) => setTripDays(e.target.value)} />
            </InputRow>
            <InputRow label="Tipo de ruta">
              <div className="pill-group">
                {['city', 'mixed', 'highway'].map((route) => (
                  <button
                    key={route}
                    type="button"
                    className={routeType === route ? 'pill active' : 'pill'}
                    onClick={() => setRouteType(route)}
                  >
                    {route === 'city' ? 'Urbano' : route === 'mixed' ? 'Mixto' : 'Carretera'}
                  </button>
                ))}
              </div>
            </InputRow>
          </div>
        </div>

        <div className="col">
          <SectionTitle
            kicker="02 Vehiculo"
            title="Perfil del coche"
            subtitle="Usa datos reales o estimaciones por segmento."
          />
          <div className="panel-body">
            <InputRow label="Tipo de coche">
              <div className="pill-group">
                {['gasoline', 'diesel', 'phev', 'bev'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={powertrainType === type ? 'pill active' : 'pill'}
                    onClick={() => setPowertrainType(type)}
                  >
                    {type === 'gasoline'
                      ? 'Gasolina'
                      : type === 'diesel'
                        ? 'Diesel'
                        : type === 'phev'
                          ? 'PHEV'
                          : 'BEV'}
                  </button>
                ))}
              </div>
            </InputRow>
            <div className="grid-two">
              <InputRow label="Marca">
                <input type="text" value={make} onChange={(e) => setMake(e.target.value)} />
              </InputRow>
              <InputRow label="Modelo">
                <input type="text" value={model} onChange={(e) => setModel(e.target.value)} />
              </InputRow>
            </div>
            <div className="grid-two">
              <InputRow label="Ano">
                <input type="number" value={year} onChange={(e) => setYear(e.target.value)} />
              </InputRow>
              <InputRow label="Segmento">
                <input type="text" value={segment} onChange={(e) => setSegment(e.target.value)} />
              </InputRow>
            </div>
            <InputRow label="Vehiculo (para costes reales)" hint="marca + modelo">
              <div className="stack">
                <input
                  type="text"
                  placeholder="Buscar por marca o modelo"
                  value={vehicleSearch}
                  onChange={(e) => setVehicleSearch(e.target.value)}
                />
                <select
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  disabled={vehiclesStatus === 'loading'}
                >
                  <option value="">Selecciona un vehiculo</option>
                  {vehicles
                    .filter((item) => {
                      if (!vehicleSearch.trim()) return true;
                      const term = vehicleSearch.toLowerCase();
                      return `${item.make || ''} ${item.model || ''}`.toLowerCase().includes(term);
                    })
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.make || 'Marca'} {item.model || 'Modelo'} {item.year ? `(${item.year})` : ''}
                      </option>
                    ))}
                </select>
              </div>
            </InputRow>
            <div className="note">
              Si tu vehiculo no aparece, puedes crearlo abajo con tus datos y consumo medio.
            </div>
            <div className="grid-two">
              <InputRow label="Km actuales">
                <input type="number" value={currentKm} onChange={(e) => setCurrentKm(e.target.value)} />
              </InputRow>
              <InputRow label="Km anuales">
                <input type="number" value={annualKm} onChange={(e) => setAnnualKm(e.target.value)} />
              </InputRow>
            </div>
            <InputRow label="Valor actual estimado" hint="eur">
              <input type="number" value={marketValue} onChange={(e) => setMarketValue(e.target.value)} />
            </InputRow>
            {(powertrainType === 'gasoline' || powertrainType === 'diesel' || powertrainType === 'phev') && (
              <InputRow label="Consumo" hint="l/100km">
                <input type="number" value={consumptionL} onChange={(e) => setConsumptionL(e.target.value)} />
              </InputRow>
            )}
            {(powertrainType === 'bev' || powertrainType === 'phev') && (
              <InputRow label="Consumo" hint="kwh/100km">
                <input type="number" value={consumptionKwh} onChange={(e) => setConsumptionKwh(e.target.value)} />
              </InputRow>
            )}
            {powertrainType === 'phev' && (
              <InputRow label="Km en electrico (este viaje)" hint="km">
                <input
                  type="number"
                  value={phevElectricKm}
                  onChange={(e) => setPhevElectricKm(e.target.value)}
                />
              </InputRow>
            )}
            <button type="button" className="ghost" onClick={() => setShowCreateVehicle(!showCreateVehicle)}>
              {showCreateVehicle ? 'Ocultar crear vehiculo' : 'Crear vehiculo'}
            </button>
            {showCreateVehicle ? (
              <div className="maintenance-form">
                <h4>Crear vehiculo</h4>
                <div className="grid-two">
                  <InputRow label="Marca">
                    <input
                      type="text"
                      value={newVehicle.make}
                      onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                    />
                  </InputRow>
                  <InputRow label="Modelo">
                    <input
                      type="text"
                      value={newVehicle.model}
                      onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                    />
                  </InputRow>
                </div>
                <div className="grid-two">
                  <InputRow label="Ano">
                    <input
                      type="number"
                      value={newVehicle.year}
                      onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value })}
                    />
                  </InputRow>
                  <InputRow label="Segmento">
                    <input
                      type="text"
                      value={newVehicle.segment}
                      onChange={(e) => setNewVehicle({ ...newVehicle, segment: e.target.value })}
                    />
                  </InputRow>
                </div>
                <InputRow label="Tipo de coche">
                  <div className="pill-group">
                    {['gasoline', 'diesel', 'phev', 'bev'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        className={newVehicle.powertrain_type === type ? 'pill active' : 'pill'}
                        onClick={() => setNewVehicle({ ...newVehicle, powertrain_type: type })}
                      >
                        {type === 'gasoline'
                          ? 'Gasolina'
                          : type === 'diesel'
                            ? 'Diesel'
                            : type === 'phev'
                              ? 'PHEV'
                              : 'BEV'}
                      </button>
                    ))}
                  </div>
                </InputRow>
                <div className="grid-two">
                  <InputRow label="Km actuales">
                    <input
                      type="number"
                      value={newVehicle.current_km}
                      onChange={(e) => setNewVehicle({ ...newVehicle, current_km: e.target.value })}
                    />
                  </InputRow>
                  <InputRow label="Km anuales">
                    <input
                      type="number"
                      value={newVehicle.annual_km}
                      onChange={(e) => setNewVehicle({ ...newVehicle, annual_km: e.target.value })}
                    />
                  </InputRow>
                </div>
                <InputRow label="Valor actual estimado" hint="eur">
                  <input
                    type="number"
                    value={newVehicle.market_value_eur}
                    onChange={(e) => setNewVehicle({ ...newVehicle, market_value_eur: e.target.value })}
                  />
                </InputRow>
                {(newVehicle.powertrain_type === 'gasoline' ||
                  newVehicle.powertrain_type === 'diesel' ||
                  newVehicle.powertrain_type === 'phev') && (
                  <InputRow label="Consumo medio" hint="l/100km">
                    <input
                      type="number"
                      value={newVehicle.consumption_l_per_100km}
                      onChange={(e) => setNewVehicle({ ...newVehicle, consumption_l_per_100km: e.target.value })}
                    />
                  </InputRow>
                )}
                {(newVehicle.powertrain_type === 'bev' || newVehicle.powertrain_type === 'phev') && (
                  <InputRow label="Consumo medio" hint="kwh/100km">
                    <input
                      type="number"
                      value={newVehicle.consumption_kwh_per_100km}
                      onChange={(e) => setNewVehicle({ ...newVehicle, consumption_kwh_per_100km: e.target.value })}
                    />
                  </InputRow>
                )}
                {newVehicle.powertrain_type === 'phev' && (
                  <InputRow label="Km electricos por 100 km" hint="ej. 50">
                    <input
                      type="number"
                      step="1"
                      value={newVehicle.phev_electric_km_per_100}
                      onChange={(e) => setNewVehicle({ ...newVehicle, phev_electric_km_per_100: e.target.value })}
                    />
                  </InputRow>
                )}
                <button type="button" className="ghost" onClick={createVehicle}>
                  Guardar vehiculo
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="panel grid">
        <div className="col">
          <SectionTitle
            kicker="03 Energia"
            title="Combustible y electricidad"
            subtitle="Precio oficial para carburantes y precio manual para kwh."
          />
          <div className="panel-body">
            <InputRow label="Precio electricidad" hint="eur/kwh">
              <input
                type="number"
                step="0.01"
                value={electricityPrice}
                onChange={(e) => setElectricityPrice(e.target.value)}
                disabled={powertrainType === 'gasoline' || powertrainType === 'diesel'}
              />
            </InputRow>
            <InputRow label="Codigo postal">
              <div className="inline-group">
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="Ej. 28001"
                />
                <button type="button" className="ghost" onClick={fetchStationsByPostalCode}>
                  {stationStatus === 'loading' ? 'Buscando...' : 'Buscar estaciones'}
                </button>
              </div>
            </InputRow>
            {stationResults ? (
              <div className="stations-block">
                <div className="stations-summary">
                  <strong>{stationResults.stations.length} estaciones</strong>
                  <span>
                    Media G95: {stationResults.averages.gasoline_95_e5?.toFixed(3) || '--'} eur/l
                  </span>
                  <span>
                    Media Diesel A: {stationResults.averages.diesel_a?.toFixed(3) || '--'} eur/l
                  </span>
                </div>
                <div className="stations-list">
                  {stationResults.stations.slice(0, 6).map((station) => (
                    <div key={station.id} className="station-card">
                      <strong>{station.label}</strong>
                      <span>{station.address}</span>
                      <span>
                        G95: {station.prices.gasoline_95_e5 ?? '--'} | Diesel: {station.prices.diesel_a ?? '--'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="note">
              <strong>Fuente combustible:</strong>{' '}
              {fuelPriceSummary?.gasoline ? `${fuelPriceSummary.gasoline.source}` : 'sin datos'}
            </div>
          </div>
        </div>
        <div className="col">
          <SectionTitle
            kicker="04 Seguro"
            title="Seguro del usuario"
            subtitle="Prorrateo por dias o por km."
          />
          <div className="panel-body">
            <div className="grid-two">
              <InputRow label="Coste seguro">
                <input type="number" value={insuranceAmount} onChange={(e) => setInsuranceAmount(e.target.value)} />
              </InputRow>
              <InputRow label="Periodo">
                <select value={insurancePeriod} onChange={(e) => setInsurancePeriod(e.target.value)}>
                  <option value="annual">Anual</option>
                  <option value="monthly">Mensual</option>
                </select>
              </InputRow>
            </div>
            <InputRow label="Modo de prorrateo">
              <div className="pill-group">
                {['per_day', 'per_km'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={insuranceMode === mode ? 'pill active' : 'pill'}
                    onClick={() => setInsuranceMode(mode)}
                  >
                    {mode === 'per_day' ? 'Por dias' : 'Por km'}
                  </button>
                ))}
              </div>
            </InputRow>
          </div>
        </div>
      </section>

      <section className="panel grid">
        <div className="col">
          <SectionTitle
            kicker="05 Mantenimiento"
            title="Real o estimado"
            subtitle="Si no hay eventos reales, se usan plantillas base."
          />
          <div className="panel-body">
            <InputRow label="Usar costes reales">
              <div className="pill-group">
                <button
                  type="button"
                  className={useRealMaintenance ? 'pill active' : 'pill'}
                  onClick={() => setUseRealMaintenance(true)}
                >
                  Si
                </button>
                <button
                  type="button"
                  className={!useRealMaintenance ? 'pill active' : 'pill'}
                  onClick={() => setUseRealMaintenance(false)}
                >
                  No
                </button>
              </div>
            </InputRow>
            <InputRow label="Forzar estimaciones">
              <div className="pill-group">
                <button
                  type="button"
                  className={forceEstimates ? 'pill active' : 'pill'}
                  onClick={() => setForceEstimates(true)}
                >
                  Si
                </button>
                <button
                  type="button"
                  className={!forceEstimates ? 'pill active' : 'pill'}
                  onClick={() => setForceEstimates(false)}
                >
                  No
                </button>
              </div>
            </InputRow>
            <div className="note">
              Si no hay eventos reales, el sistema usa plantillas de mantenimiento por segmento.
            </div>
            <div className="maintenance-form">
              <h4>Nuevo evento</h4>
              <div className="grid-two">
                <InputRow label="Categoria">
                  <select
                    value={eventForm.category}
                    onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                  >
                    <option value="oil_filter">Aceite + filtro</option>
                    <option value="air_filter">Filtro aire</option>
                    <option value="fuel_filter">Filtro combustible</option>
                    <option value="cabin_filter">Filtro habitaculo</option>
                    <option value="spark_plugs">Bujias</option>
                    <option value="timing_belt">Correa distribucion</option>
                    <option value="brake_pads">Pastillas freno</option>
                    <option value="brake_discs">Discos freno</option>
                    <option value="brake_fluid">Liquido frenos</option>
                    <option value="tires">Neumaticos</option>
                    <option value="alignment">Alineacion</option>
                    <option value="battery_12v">Bateria 12V</option>
                    <option value="clutch">Embrague</option>
                    <option value="suspension">Amortiguadores</option>
                    <option value="coolant">Refrigerante</option>
                    <option value="itv">ITV</option>
                    <option value="wipers">Limpaparabrisas</option>
                    <option value="other">Otros</option>
                  </select>
                </InputRow>
                <InputRow label="Fecha">
                  <input
                    type="date"
                    value={eventForm.event_date}
                    onChange={(e) => setEventForm({ ...eventForm, event_date: e.target.value })}
                  />
                </InputRow>
              </div>
              <div className="grid-two">
                <InputRow label="Kilometraje">
                  <input
                    type="number"
                    value={eventForm.odometer_km}
                    onChange={(e) => setEventForm({ ...eventForm, odometer_km: e.target.value })}
                  />
                </InputRow>
                <InputRow label="Coste (eur)">
                  <input
                    type="number"
                    value={eventForm.cost_eur}
                    onChange={(e) => setEventForm({ ...eventForm, cost_eur: e.target.value })}
                  />
                </InputRow>
              </div>
              <InputRow label="Taller">
                <input
                  type="text"
                  value={eventForm.workshop}
                  onChange={(e) => setEventForm({ ...eventForm, workshop: e.target.value })}
                />
              </InputRow>
              <InputRow label="Notas">
                <input
                  type="text"
                  value={eventForm.notes}
                  onChange={(e) => setEventForm({ ...eventForm, notes: e.target.value })}
                />
              </InputRow>
              <button type="button" className="ghost" onClick={createEvent}>
                Guardar evento
              </button>
            </div>
            {maintenanceEvents.length ? (
              <div className="maintenance-list">
                <h4>Eventos recientes</h4>
                <ul>
                  {maintenanceEvents.map((item) => (
                    <li key={item.id}>
                      <strong>{item.category}</strong> - {item.cost_eur} eur{' '}
                      {item.event_date ? `(${item.event_date})` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            ) : vehicleId ? (
              <div className="note">No hay eventos guardados para este vehiculo.</div>
            ) : (
              <div className="note">Selecciona un vehiculo para ver eventos reales.</div>
            )}
          </div>
        </div>
        <div className="col">
          <SectionTitle
            kicker="06 Resultado"
            title="Coste total del viaje"
            subtitle="Desglose completo y supuestos explicitos."
          />
          <div className="panel-body">
            <button type="button" className="primary" onClick={runCalculation}>
              {calcStatus === 'loading' ? 'Calculando...' : 'Calcular viaje'}
            </button>
            {calcResult ? (
              <div className="result-block">
                <div>
                  <span>Total viaje</span>
                  <strong>{formatMoney(calcResult.total_eur)} eur</strong>
                </div>
                <div>
                  <span>Coste por km</span>
                  <strong>{formatMoney(calcResult.per_km_eur)} eur</strong>
                </div>
              </div>
            ) : null}
            {calcResult ? (
              <div className="breakdown">
                <div>
                  <h4>Energia</h4>
                  <p>{formatMoney(calcResult.energy.total_eur)} eur</p>
                  <span>{calcResult.energy.source}</span>
                </div>
                <div>
                  <h4>Mantenimiento</h4>
                  <p>{formatMoney(calcResult.maintenance.amount_eur)} eur</p>
                  <span>{calcResult.maintenance.source}</span>
                </div>
                <div>
                  <h4>Seguro</h4>
                  <p>{formatMoney(calcResult.insurance.amount_eur)} eur</p>
                  <span>{calcResult.insurance.source}</span>
                </div>
                <div>
                  <h4>Depreciacion</h4>
                  <p>{formatMoney(calcResult.depreciation.amount_eur)} eur</p>
                  <span>Residual: {formatMoney(calcResult.depreciation.residual_value_eur)} eur</span>
                </div>
              </div>
            ) : null}
            {calcResult ? (
              <div className="assumptions">
                <h4>Supuestos</h4>
                <ul>
                  {calcResult.energy.assumptions.map((item) => (
                    <li key={`energy-${item}`}>{item}</li>
                  ))}
                  {calcResult.maintenance.assumptions.map((item) => (
                    <li key={`maint-${item}`}>{item}</li>
                  ))}
                  {calcResult.insurance.assumptions.map((item) => (
                    <li key={`ins-${item}`}>{item}</li>
                  ))}
                  {calcResult.depreciation.assumptions.map((item) => (
                    <li key={`dep-${item}`}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div>
          <strong>Roadmap</strong>
          <p>Integracion electricidad publica, rutas reales y scoring por modelo.</p>
        </div>
        <div>
          <strong>Transparencia</strong>
          <p>Todos los calculos muestran fuente y fecha.</p>
        </div>
      </footer>
    </div>
  );
}
