import React, { useState, useEffect, useCallback } from 'react';
import { 
  CloudFog, 
  CloudRain, 
  CloudLightning, 
  Sun, 
  Moon, 
  Wind, 
  Thermometer, 
  Eye, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  Users, 
  Gavel, 
  RefreshCw, 
  Radio, 
  Clock, 
  CheckCircle2, 
  Copy, 
  Sparkles, 
  ChevronRight, 
  Layers, 
  Droplets, 
  Compass, 
  Activity, 
  Footprints, 
  Car, 
  Building2,
  Check,
  Maximize2,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { 
  WeatherData, 
  WeatherScenarioId, 
  WEATHER_PRESETS, 
  fetchCurrentWeather,
  HourlyWeatherPoint
} from '../../services/weatherService';
import { Language } from '../../types';

interface CurrentWeatherVisibilityWidgetProps {
  language: Language;
  facilityId?: string;
  facilityName?: string;
  compactView?: boolean;
  onAppendToNotes?: (weatherDirectivesText: string) => void;
  commanderName?: string;
  commanderBadge?: string;
  onViewFullWidget?: () => void;
}

export const CurrentWeatherVisibilityWidget: React.FC<CurrentWeatherVisibilityWidgetProps> = ({
  language,
  facilityId = 'fac-01',
  facilityName = 'Kalyan Central Maximum Security Penitentiary',
  compactView = false,
  onAppendToNotes,
  commanderName = 'Capt. Marcus Vance',
  commanderBadge = 'KP-8421',
  onViewFullWidget,
}) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedScenario, setSelectedScenario] = useState<WeatherScenarioId>('dense_fog');
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [copied, setCopied] = useState<boolean>(false);
  const [appended, setAppended] = useState<boolean>(false);
  const [isAcknowledged, setIsAcknowledged] = useState<boolean>(false);
  const [acknowledgedAt, setAcknowledgedAt] = useState<string | null>(null);
  const [activeOperationalTab, setActiveOperationalTab] = useState<'patrol' | 'yard' | 'court'>('patrol');

  // Load simulated weather telemetry
  const loadWeather = useCallback(async (scenario: WeatherScenarioId) => {
    setIsLoading(true);
    try {
      const data = await fetchCurrentWeather(facilityId, scenario);
      setWeatherData(data);
    } catch (err) {
      console.error('Failed to load simulated weather telemetry:', err);
    } finally {
      setIsLoading(false);
    }
  }, [facilityId]);

  useEffect(() => {
    loadWeather(selectedScenario);
  }, [loadWeather, selectedScenario]);

  // Handle Scenario Change
  const handleScenarioChange = (newScenario: WeatherScenarioId) => {
    setSelectedScenario(newScenario);
    setIsAcknowledged(false);
    setAcknowledgedAt(null);
  };

  // Weather Icon helper
  const renderWeatherIcon = (condition: string, className = 'w-5 h-5') => {
    switch (condition) {
      case 'dense_fog':
      case 'mist':
      case 'freezing_fog':
        return <CloudFog className={`${className} text-amber-300 animate-pulse`} />;
      case 'thunderstorm':
        return <CloudLightning className={`${className} text-amber-400`} />;
      case 'heavy_rain':
      case 'light_rain':
      case 'drizzle':
      case 'overcast_drizzle':
        return <CloudRain className={`${className} text-blue-400`} />;
      case 'freezing_rain':
      case 'sleet':
        return <Droplets className={`${className} text-cyan-300`} />;
      case 'clear_day':
      case 'sunny':
      case 'clear':
        return <Sun className={`${className} text-amber-400`} />;
      case 'clear_night':
      case 'warm_night':
        return <Moon className={`${className} text-indigo-300`} />;
      case 'heat_wave':
        return <Thermometer className={`${className} text-rose-400`} />;
      default:
        return <CloudFog className={`${className} text-slate-300`} />;
    }
  };

  // Visibility status badge color
  const getVisibilityBadge = (status: WeatherData['visibilityStatus']) => {
    switch (status) {
      case 'critical':
        return {
          bg: 'bg-rose-950/80 text-rose-300 border-rose-600 animate-pulse',
          badge: 'bg-rose-600 text-white',
          text: language === 'fr' ? 'CRITIQUE (< 1 KM)' : 'CRITICAL (< 1.0 KM)',
        };
      case 'degraded':
        return {
          bg: 'bg-amber-950/80 text-amber-300 border-amber-600',
          badge: 'bg-amber-600 text-white',
          text: language === 'fr' ? 'DÉGRADÉE (1-3 KM)' : 'DEGRADED (1-3 KM)',
        };
      case 'moderate':
        return {
          bg: 'bg-blue-950/80 text-blue-300 border-blue-600',
          badge: 'bg-blue-600 text-white',
          text: language === 'fr' ? 'MODÉRÉE (3-10 KM)' : 'MODERATE (3-10 KM)',
        };
      case 'optimal':
      default:
        return {
          bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-600',
          badge: 'bg-emerald-600 text-white',
          text: language === 'fr' ? 'OPTIMALE (> 10 KM)' : 'OPTIMAL (> 10 KM)',
        };
    }
  };

  // Format Directives text for export or Handover notes
  const buildDirectivesLogText = () => {
    if (!weatherData) return '';
    const tempStr = tempUnit === 'C' ? `${weatherData.tempC}°C` : `${weatherData.tempF}°F`;
    const windStr = `${weatherData.windSpeedKph} km/h ${weatherData.windDirection} (Gusts ${weatherData.windGustKph} km/h)`;
    const dateStr = new Date().toLocaleDateString();

    return `[METEOROLOGICAL & TACTICAL VISIBILITY ADDENDUM]
Date & Time: ${dateStr} at ${weatherData.timestamp}
Station ID: ${weatherData.stationId} | Facility: ${facilityName}
Atmospheric Condition: ${language === 'fr' ? weatherData.conditionLabel.fr : weatherData.conditionLabel.en}
Ambient Temp: ${tempStr} (Feels like: ${tempUnit === 'C' ? weatherData.feelsLikeC + '°C' : weatherData.feelsLikeF + '°F'})
Visibility: ${weatherData.visibilityKm} km (${weatherData.visibilityMiles} mi) - Status: ${weatherData.visibilityStatus.toUpperCase()}
Wind & Gusts: ${windStr} | Barometer: ${weatherData.barometricHpa} hPa | Humidity: ${weatherData.humidityPercent}%

1. OUTDOOR PERIMETER PATROL DIRECTIVE:
Status: ${language === 'fr' ? weatherData.patrolDirectives.statusLabel.fr : weatherData.patrolDirectives.statusLabel.en}
Mode: ${weatherData.patrolDirectives.perimeterPatrolMode}
Tower Searchlights: ${weatherData.patrolDirectives.towerSearchlightsActive ? 'ACTIVE CONTINUOUS' : 'STANDBY'}
Thermal FLIR: ${weatherData.patrolDirectives.thermalImagingRequired ? 'MANDATORY ON CULVERTS & BLINDSPOTS' : 'STANDARD'}
K-9 Units: ${weatherData.patrolDirectives.k9PerimeterDeployed ? 'DEPLOYED ON PERIMETER SALLY PORT' : 'RESTING'}

2. INMATE EXERCISE & YARD SCHEDULING:
Status: ${language === 'fr' ? weatherData.yardDirectives.statusLabel.fr : weatherData.yardDirectives.statusLabel.en}
Max Inmates: ${weatherData.yardDirectives.maxInmatesPerYard} | Duration: ${weatherData.yardDirectives.durationMinutes} min
Routing: ${weatherData.yardDirectives.locationType.toUpperCase()}
Rationale: ${language === 'fr' ? weatherData.yardDirectives.rationale.fr : weatherData.yardDirectives.rationale.en}

3. COURT CONVOYS & INTER-BLOCK ESCORTS:
Status: ${language === 'fr' ? weatherData.courtTransitDirectives.statusLabel.fr : weatherData.courtTransitDirectives.statusLabel.en}
Escort Ratio: ${weatherData.courtTransitDirectives.escortRatio}
Transit Mode: ${weatherData.courtTransitDirectives.transitMode}
Restraint Protocol: ${weatherData.courtTransitDirectives.restraintProtocol}

Acknowledged by Watch Commander: ${commanderName} (Badge #${commanderBadge})`;
  };

  const handleCopyDirectives = async () => {
    const text = buildDirectivesLogText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAppendDirectives = () => {
    const text = buildDirectivesLogText();
    if (onAppendToNotes) {
      onAppendToNotes(text);
      setAppended(true);
      setTimeout(() => setAppended(false), 3000);
    }
  };

  const handleAcknowledge = () => {
    setIsAcknowledged(true);
    setAcknowledgedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  if (isLoading && !weatherData) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-300 flex items-center justify-center gap-3">
        <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
        <span className="text-xs font-mono tracking-wider">
          {language === 'fr' 
            ? 'Interrogation des capteurs météo & stations visibilité pénitentiaire...' 
            : 'Connecting to prison meteorological telemetry station & visibility radar...'}
        </span>
      </div>
    );
  }

  if (!weatherData) return null;

  const currentTemp = tempUnit === 'C' ? `${weatherData.tempC}°C` : `${weatherData.tempF}°F`;
  const feelsLikeTemp = tempUnit === 'C' ? `${weatherData.feelsLikeC}°C` : `${weatherData.feelsLikeF}°F`;
  const visibilityBadge = getVisibilityBadge(weatherData.visibilityStatus);

  // ----------------------------------------------------
  // COMPACT VIEW: For Quick Glance in Executive Summary or Header
  // ----------------------------------------------------
  if (compactView) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white shadow-lg space-y-3">
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              <CloudFog className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  {language === 'fr' ? 'Météo & Visibilité Sécuritaire' : 'Weather & Visibility Telemetry'}
                </h3>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {weatherData.stationId} &bull; {weatherData.timestamp}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setTempUnit(tempUnit === 'C' ? 'F' : 'C')}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-[10px] border border-slate-700 transition-colors cursor-pointer"
              title="Toggle Celsius / Fahrenheit"
            >
              °{tempUnit}
            </button>
            <button
              type="button"
              onClick={() => loadWeather(selectedScenario)}
              disabled={isLoading}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title="Refresh simulated telemetry"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
            {onViewFullWidget && (
              <button
                type="button"
                onClick={onViewFullWidget}
                className="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>{language === 'fr' ? 'Détails' : 'Full Brief'}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Compact KPI Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Temperature & Condition */}
          <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block font-medium">
              {language === 'fr' ? 'Température' : 'Temperature'}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {renderWeatherIcon(weatherData.condition, 'w-4 h-4')}
              <span className="text-sm font-bold text-white">{currentTemp}</span>
            </div>
            <span className="text-[9px] text-slate-400 block truncate">
              {language === 'fr' ? 'Ressenti' : 'Feels'} {feelsLikeTemp}
            </span>
          </div>

          {/* Visibility Distance */}
          <div className={`p-2 rounded-lg border ${visibilityBadge.bg}`}>
            <span className="text-[10px] opacity-80 block font-medium flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{language === 'fr' ? 'Visibilité' : 'Visibility'}</span>
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm font-black tracking-tight">{weatherData.visibilityKm} km</span>
              <span className="text-[9px] opacity-75">({weatherData.visibilityMiles} mi)</span>
            </div>
            <span className="text-[9px] font-bold block uppercase truncate">
              {visibilityBadge.text}
            </span>
          </div>

          {/* Wind & Gusts */}
          <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block font-medium flex items-center gap-1">
              <Wind className="w-3 h-3 text-cyan-400" />
              <span>{language === 'fr' ? 'Vents & Rafales' : 'Wind & Gusts'}</span>
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm font-bold text-white">{weatherData.windSpeedKph}</span>
              <span className="text-[9px] text-slate-400">km/h</span>
            </div>
            <span className="text-[9px] text-slate-400 block truncate">
              {language === 'fr' ? 'Rafales' : 'Gusts'}: {weatherData.windGustKph} km/h
            </span>
          </div>

          {/* Inmate Yard Status */}
          <div className={`p-2 rounded-lg border ${
            weatherData.yardDirectives.status === 'suspended'
              ? 'bg-rose-950/60 border-rose-800/80 text-rose-300'
              : weatherData.yardDirectives.status === 'restricted'
              ? 'bg-amber-950/60 border-amber-800/80 text-amber-300'
              : 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
          }`}>
            <span className="text-[10px] opacity-80 block font-medium flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{language === 'fr' ? 'Accès Promenade' : 'Yard Access'}</span>
            </span>
            <span className="text-xs font-black uppercase tracking-tight block mt-0.5 truncate">
              {weatherData.yardDirectives.status.toUpperCase()}
            </span>
            <span className="text-[9px] opacity-75 block truncate">
              {weatherData.yardDirectives.locationType === 'covered_gym'
                ? (language === 'fr' ? 'Gymnase Couvert' : 'Covered Gym')
                : weatherData.yardDirectives.locationType === 'cell_lockdown'
                ? (language === 'fr' ? 'Confinement' : 'In-Cell Lock')
                : (language === 'fr' ? 'Cour Pleine' : 'Full Yard')}
            </span>
          </div>
        </div>

        {/* Operational Directive Warning Line */}
        <div className="text-[11px] bg-slate-950/90 px-3 py-2 rounded-lg border border-slate-800 flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-slate-300 leading-snug">
            <strong className="text-amber-300">
              {language === 'fr' ? 'Consigne Opérationnelle :' : 'Tactical Advisory:'}
            </strong>{' '}
            {language === 'fr' ? weatherData.yardDirectives.rationale.fr : weatherData.yardDirectives.rationale.en}
          </p>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // FULL VIEW: Complete Meteorological & Tactical Surveillance Deck
  // ----------------------------------------------------
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl text-white overflow-hidden space-y-6 p-5 sm:p-6">
      
      {/* 1. Header Bar: Station ID, Facility, Controls & Preset Simulator */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-950 to-slate-900 text-cyan-400 border border-cyan-700/60 shadow-inner">
            <CloudFog className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>{language === 'fr' ? 'Station Météo & Surveillance de Visibilité Périmétrique' : 'Current Weather & Visibility Tactical Command Deck'}</span>
              </h2>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                LIVE TELEMETRY
              </span>
            </div>
            
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              {weatherData.facilityName} &bull; <strong className="text-cyan-400">{weatherData.stationId}</strong> &bull; GPS: 45.4215°N 75.6972°W &bull; {weatherData.timestamp}
            </p>
          </div>
        </div>

        {/* Action Controls & Simulator Dropdown */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Scenario Simulator Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              {language === 'fr' ? 'Scénario :' : 'Simulation:'}
            </span>
            <select
              value={selectedScenario}
              onChange={e => handleScenarioChange(e.target.value as WeatherScenarioId)}
              className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-hidden cursor-pointer"
            >
              {WEATHER_PRESETS.map(p => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-slate-100">
                  {language === 'fr' ? p.labelFr : p.labelEn}
                </option>
              ))}
            </select>
          </div>

          {/* Unit Toggle */}
          <button
            type="button"
            onClick={() => setTempUnit(tempUnit === 'C' ? 'F' : 'C')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
            title="Toggle Celsius / Fahrenheit"
          >
            °{tempUnit}
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => loadWeather(selectedScenario)}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title={language === 'fr' ? 'Rafraîchir les capteurs' : 'Refresh Telemetry'}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Primary Telemetric Grid (4 Core Telemetry Gauges) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Metric 1: Ambient Temperature & Thermal State */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-rose-400" />
              <span>{language === 'fr' ? 'Température Ambiante' : 'Ambient Temperature'}</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">REAL-FEEL</span>
          </div>

          <div className="flex items-center gap-3 mt-3">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              {renderWeatherIcon(weatherData.condition, 'w-7 h-7')}
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {currentTemp}
              </div>
              <div className="text-xs text-slate-400">
                {language === 'fr' ? 'Ressenti :' : 'Feels Like:'} <strong className="text-slate-200">{feelsLikeTemp}</strong>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-300 flex items-center justify-between">
            <span>{language === 'fr' ? weatherData.conditionLabel.fr : weatherData.conditionLabel.en}</span>
            <span className="text-[10px] font-mono text-slate-400">UV {weatherData.uvIndex} &bull; AQI {weatherData.airQualityIndex}</span>
          </div>
        </div>

        {/* Metric 2: Optical Visibility & Line-of-Sight Range */}
        <div className={`p-4 rounded-xl border relative overflow-hidden ${visibilityBadge.bg}`}>
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              <span>{language === 'fr' ? 'Portée de Visibilité' : 'Optical Visibility'}</span>
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${visibilityBadge.badge}`}>
              {weatherData.visibilityStatus.toUpperCase()}
            </span>
          </div>

          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-black tracking-tight">
              {weatherData.visibilityKm} <span className="text-lg font-bold">km</span>
            </div>
            <div className="text-xs opacity-80">
              {weatherData.visibilityMiles} {language === 'fr' ? 'milles terrestres (ligne de mire)' : 'miles line-of-sight'}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-current/20 text-[11px] font-bold">
            {language === 'fr' ? weatherData.visibilityLabel.fr : weatherData.visibilityLabel.en}
          </div>
        </div>

        {/* Metric 3: Wind Vector & Perimeter Gust Dynamics */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-cyan-400" />
              <span>{language === 'fr' ? 'Vents & Rafales' : 'Wind Vector & Gusts'}</span>
            </span>
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
          </div>

          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {weatherData.windSpeedKph} <span className="text-lg font-bold text-slate-400">km/h</span>
            </div>
            <div className="text-xs text-slate-400">
              {weatherData.windSpeedMph} mph &bull; <strong className="text-cyan-300">{weatherData.windDirection}</strong>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-300 flex items-center justify-between">
            <span>{language === 'fr' ? 'Rafales max :' : 'Peak Gusts:'} <strong className="text-amber-300">{weatherData.windGustKph} km/h</strong></span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
              weatherData.patrolDirectives.droneDefenseRisk === 'elevated' 
                ? 'bg-amber-950 text-amber-300 border border-amber-800' 
                : 'bg-slate-900 text-slate-400'
            }`}>
              DRONE: {weatherData.patrolDirectives.droneDefenseRisk.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Metric 4: Precipitation & Atmospheric Barometer */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-blue-400" />
              <span>{language === 'fr' ? 'Précipitations & Baromètre' : 'Precipitation & Pressure'}</span>
            </span>
            <Activity className="w-3.5 h-3.5 text-blue-400" />
          </div>

          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {weatherData.precipitationProb}%
            </div>
            <div className="text-xs text-slate-400">
              {language === 'fr' ? 'Risque précipitations' : 'Precipitation Probability'} &bull; <span className="capitalize">{weatherData.precipitationType}</span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-300 flex items-center justify-between">
            <span>{language === 'fr' ? 'Humidité :' : 'Humidity:'} <strong className="text-white">{weatherData.humidityPercent}%</strong></span>
            <span className="font-mono text-slate-400">{weatherData.barometricHpa} hPa</span>
          </div>
        </div>

      </div>

      {/* 3. The 3 Key Security Operation Modules (Patrols, Inmate Yard, Court Escorts) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>{language === 'fr' ? 'Directives Tactiques Liées aux Conditions Météorologiques' : 'Operational Tactical Directives & Security Impacts'}</span>
            </h3>
            <p className="text-xs text-slate-400">
              {language === 'fr' 
                ? 'Consignes obligatoires pour les patrouilles extérieures, les promenades détenus et les escortes vers le tribunal' 
                : 'Mandatory operational protocols governing perimeter watch, inmate recreation, and court escorts'}
            </p>
          </div>

          {/* Module Sub-tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setActiveOperationalTab('patrol')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeOperationalTab === 'patrol' 
                  ? 'bg-amber-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>{language === 'fr' ? 'Patrouilles Extérieures' : 'Outdoor Patrols'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveOperationalTab('yard')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeOperationalTab === 'yard' 
                  ? 'bg-amber-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{language === 'fr' ? 'Promenade Détenus' : 'Inmate Yard'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveOperationalTab('court')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeOperationalTab === 'court' 
                  ? 'bg-amber-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Gavel className="w-3.5 h-3.5" />
              <span>{language === 'fr' ? 'Convois Tribunal' : 'Court Transits'}</span>
            </button>
          </div>
        </div>

        {/* TAB 1: Outdoor Security Patrols */}
        {activeOperationalTab === 'patrol' && (
          <div className="bg-slate-950/90 rounded-xl border border-slate-800 p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono border ${
                  weatherData.patrolDirectives.status === 'red'
                    ? 'bg-rose-950 text-rose-300 border-rose-700'
                    : weatherData.patrolDirectives.status === 'amber'
                    ? 'bg-amber-950 text-amber-300 border-amber-700'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-700'
                }`}>
                  {language === 'fr' ? weatherData.patrolDirectives.statusLabel.fr : weatherData.patrolDirectives.statusLabel.en}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className={`px-2 py-0.5 rounded border ${
                  weatherData.patrolDirectives.towerSearchlightsActive
                    ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}>
                  {language === 'fr' ? 'Projecteurs Miradors :' : 'Tower Spotlights:'}{' '}
                  <strong>{weatherData.patrolDirectives.towerSearchlightsActive ? (language === 'fr' ? 'ACTIFS' : 'ACTIVE') : (language === 'fr' ? 'STANDBY' : 'STANDBY')}</strong>
                </span>

                <span className={`px-2 py-0.5 rounded border ${
                  weatherData.patrolDirectives.thermalImagingRequired
                    ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}>
                  FLIR: <strong>{weatherData.patrolDirectives.thermalImagingRequired ? (language === 'fr' ? 'REQUIS' : 'REQUIRED') : (language === 'fr' ? 'OPT' : 'OPT')}</strong>
                </span>

                <span className={`px-2 py-0.5 rounded border ${
                  weatherData.patrolDirectives.k9PerimeterDeployed
                    ? 'bg-indigo-950/80 text-indigo-300 border-indigo-800'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}>
                  K-9: <strong>{weatherData.patrolDirectives.k9PerimeterDeployed ? (language === 'fr' ? 'DÉPLOYÉ' : 'DEPLOYED') : (language === 'fr' ? 'NON' : 'OFF')}</strong>
                </span>
              </div>
            </div>

            {/* Mode Banner */}
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">{language === 'fr' ? 'Régime de patrouille périmétrique ordonné :' : 'Authorized Perimeter Patrol Mode:'}</span>
              <span className="font-bold text-cyan-300 font-mono">{weatherData.patrolDirectives.perimeterPatrolMode}</span>
            </div>

            {/* Patrol Instructions List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {language === 'fr' ? 'Consignes Opérationnelles pour les Équipes de Surveillance :' : 'Specific Guard Orders for Watch Sentinels:'}
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {(language === 'fr' ? weatherData.patrolDirectives.instructions.fr : weatherData.patrolDirectives.instructions.en).map((instruction, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{instruction}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* TAB 2: Inmate Exercise Scheduling & Courtyard */}
        {activeOperationalTab === 'yard' && (
          <div className="bg-slate-950/90 rounded-xl border border-slate-800 p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono border ${
                  weatherData.yardDirectives.status === 'suspended'
                    ? 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse'
                    : weatherData.yardDirectives.status === 'restricted'
                    ? 'bg-amber-950 text-amber-300 border-amber-700'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-700'
                }`}>
                  {language === 'fr' ? weatherData.yardDirectives.statusLabel.fr : weatherData.yardDirectives.statusLabel.en}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-slate-400">
                  {language === 'fr' ? 'Capacité Détenus :' : 'Max Inmates:'}{' '}
                  <strong className="text-white">{weatherData.yardDirectives.maxInmatesPerYard}</strong>
                </span>
                <span className="text-slate-400">
                  {language === 'fr' ? 'Durée :' : 'Duration:'}{' '}
                  <strong className="text-white">{weatherData.yardDirectives.durationMinutes} min</strong>
                </span>
                <span className="text-slate-400">
                  {language === 'fr' ? 'Lieu :' : 'Location:'}{' '}
                  <strong className="text-cyan-300 uppercase">{weatherData.yardDirectives.locationType.replace('_', ' ')}</strong>
                </span>
              </div>
            </div>

            {/* Rationale Box */}
            <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{language === 'fr' ? 'Motif Réglementaire de Sécurité Pénitentiaire :' : 'Custodial Safety Rationale & Legal Justification:'}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pl-6">
                {language === 'fr' ? weatherData.yardDirectives.rationale.fr : weatherData.yardDirectives.rationale.en}
              </p>
            </div>

            {/* Substitution Plan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase">{language === 'fr' ? 'Plan de Substitution' : 'Alternative Exercise Routing'}</span>
                <p className="text-slate-200 font-semibold">
                  {weatherData.yardDirectives.locationType === 'covered_gym'
                    ? (language === 'fr' ? 'Déploiement échelonné vers le Gymnase Intérieur Couvert (Bloc C)' : 'Staggered rotation into Covered Gymnasium Wing C')
                    : weatherData.yardDirectives.locationType === 'cell_lockdown'
                    ? (language === 'fr' ? 'Maintien au bloc cellulaire avec distribution de lecture' : 'Cell tier lock-in with in-cell hobbycraft & reading distribution')
                    : (language === 'fr' ? 'Accès standard aux 4 quadrants de la cour de promenade' : 'Standard 4-quadrant open courtyard recreation')}
                </p>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase">{language === 'fr' ? 'Encadrement Surveillants Requis' : 'Supervisory Escort Requirement'}</span>
                <p className="text-slate-200 font-semibold">
                  {weatherData.yardDirectives.status === 'suspended'
                    ? (language === 'fr' ? 'Surveillance renforcée des coursives intérieures (1:8)' : 'Reinforced interior tier catwalk surveillance (1:8 ratio)')
                    : (language === 'fr' ? '1 surveillant pour 15 détenus + 2 sentinelles miradors' : '1 officer per 15 inmates + 2 sniper sentinels on towers')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Court Movement & Inter-Block Escorts */}
        {activeOperationalTab === 'court' && (
          <div className="bg-slate-950/90 rounded-xl border border-slate-800 p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono border ${
                  weatherData.courtTransitDirectives.status === 'suspended'
                    ? 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse'
                    : weatherData.courtTransitDirectives.status === 'heightened'
                    ? 'bg-amber-950 text-amber-300 border-amber-700'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-700'
                }`}>
                  {language === 'fr' ? weatherData.courtTransitDirectives.statusLabel.fr : weatherData.courtTransitDirectives.statusLabel.en}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span>{language === 'fr' ? 'Ratio d\'Escorte :' : 'Escort Ratio:'}</span>
                <strong className="text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {weatherData.courtTransitDirectives.escortRatio}
                </strong>
              </div>
            </div>

            {/* Protocol Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                  <Car className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{language === 'fr' ? 'Mode de Transport Véhiculaire' : 'Vehicle Transport Mode'}</span>
                </span>
                <p className="text-slate-200 font-semibold">{weatherData.courtTransitDirectives.transitMode}</p>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{language === 'fr' ? 'Protocole d\'Entraves & Menottes' : 'Restraints & Cuffs Protocol'}</span>
                </span>
                <p className="text-slate-200 font-semibold">{weatherData.courtTransitDirectives.restraintProtocol}</p>
              </div>
            </div>

            {/* Escort Directives */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {language === 'fr' ? 'Consignes d\'Extraction & Déplacements Inter-Blocs :' : 'Court Conveyance & Inter-Block Transit Instructions:'}
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {(language === 'fr' ? weatherData.courtTransitDirectives.instructions.fr : weatherData.courtTransitDirectives.instructions.en).map((instruction, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{instruction}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* 4. Shift 6-Hour Forecast Bar (Transition Projection) */}
      <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{language === 'fr' ? 'Évolution Météo & Visibilité sur les 6 Prochaines Heures (Relève de Quart)' : 'Upcoming 6-Hour Shift Transition Forecast'}</span>
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            {language === 'fr' ? 'Projections télémesure' : 'Telemetry Projection'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
          {weatherData.hourlyForecast.map(pt => (
            <div key={pt.hourOffset} className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex flex-col items-center text-center space-y-1.5">
              <span className="text-[11px] font-mono font-bold text-slate-300">{pt.time}</span>
              <div className="p-1 rounded bg-slate-950 border border-slate-800">
                {renderWeatherIcon(pt.condition, 'w-4 h-4')}
              </div>
              <span className="text-xs font-bold text-white">
                {tempUnit === 'C' ? `${pt.tempC}°C` : `${pt.tempF}°F`}
              </span>
              <span className="text-[10px] font-mono text-cyan-400">
                {pt.visibilityKm} km {language === 'fr' ? 'vis.' : 'vis.'}
              </span>
              
              {/* Yard advisory pill */}
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                pt.yardAdvisory === 'suspended'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : pt.yardAdvisory === 'restricted'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                YARD: {pt.yardAdvisory}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Command Action Bar: Acknowledge & Append to Handover Notes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
        <div className="flex items-center gap-2">
          {isAcknowledged ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-xs font-semibold">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>
                {language === 'fr'
                  ? `Directives météo ratifiées par ${commanderName} à ${acknowledgedAt}`
                  : `Directives ratified by ${commanderName} at ${acknowledgedAt}`}
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAcknowledge}
              className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-200" />
              <span>{language === 'fr' ? 'Ratifier les Directives Météo' : 'Acknowledge Directives'}</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Copy Directives */}
          <button
            type="button"
            onClick={handleCopyDirectives}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Copy formatted meteorological security log to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? (language === 'fr' ? 'Copié !' : 'Copied !') : (language === 'fr' ? 'Copier Log' : 'Copy Directives')}</span>
          </button>

          {/* Append to Shift Handover Notes */}
          {onAppendToNotes && (
            <button
              type="button"
              onClick={handleAppendDirectives}
              disabled={appended}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              title="Append this meteorological assessment into the official handover notes"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>
                {appended 
                  ? (language === 'fr' ? 'Ajouté aux Notes !' : 'Appended to Notes !') 
                  : (language === 'fr' ? 'Insérer dans Notes Relève' : 'Append to Handover Notes')}
              </span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
