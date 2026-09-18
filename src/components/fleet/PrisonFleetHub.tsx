import React, { useState } from 'react';
import { Language, FleetVehicle, FleetConvoy } from '../../types';
import { TRANSLATIONS } from '../../data/translations';
import { 
  Truck, Shield, Radio, CheckCircle, Clock, 
  MapPin, AlertTriangle, Users, Fuel, Navigation, CheckCircle2
} from 'lucide-react';
import { INITIAL_FLEET_VEHICLES, INITIAL_FLEET_CONVOYS } from '../../data/newModuleData';

interface PrisonFleetHubProps {
  language: Language;
}

export const PrisonFleetHub: React.FC<PrisonFleetHubProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'convoys' | 'vehicles'>('convoys');
  const [convoys, setConvoys] = useState<FleetConvoy[]>(INITIAL_FLEET_CONVOYS);
  const [vehicles] = useState<FleetVehicle[]>(INITIAL_FLEET_VEHICLES);

  const handleStageConvoy = (id: string) => {
    setConvoys(prev => prev.map(c => c.id === id ? { ...c, status: 'staging' } : c));
  };

  const handleDispatchConvoy = (id: string) => {
    setConvoys(prev => prev.map(c => c.id === id ? { ...c, status: 'en_route_court' } : c));
  };

  const handleArriveCourt = (id: string) => {
    setConvoys(prev => prev.map(c => c.id === id ? { ...c, status: 'at_court' } : c));
  };

  const handleCompleteConvoy = (id: string) => {
    setConvoys(prev => prev.map(c => c.id === id ? { ...c, status: 'completed' } : c));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 rounded">
              Odoo 19 Convoy Escort Fleet
            </span>
            <span className="text-xs text-slate-500 font-mono">model: prison.fleet.convoy</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            {language === 'fr' ? 'Flotte Pénitentiaire & Convois d\'Escorte Judiciaire' : 'Correctional Transport Fleet & Court Convoys'}
          </h2>
          <p className="text-xs text-slate-500">
            {language === 'fr'
              ? 'Véhicules cellulaires blindés (Blindage B6), suivi par balise satellite GPS, escorte armée et extractions vers les tribunaux.'
              : 'Armored cellular transport vehicles, ballistic B6 protection, satellite telemetry, and armed judicial transfer manifests.'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('convoys')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'convoys' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'fr' ? 'Convois Actifs' : 'Active Convoys'}
          </button>
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'vehicles' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'fr' ? 'Parc de Véhicules' : 'Transport Fleet'}
          </button>
        </div>
      </div>

      {activeTab === 'convoys' ? (
        /* Convoys List */
        <div className="space-y-4">
          {convoys.map(convoy => (
            <div key={convoy.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-base">{convoy.missionCode}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        convoy.securityRating === 'CAT_A_HIGH_THREAT'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {convoy.securityRating}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        convoy.status === 'at_court'
                          ? 'bg-emerald-100 text-emerald-800'
                          : convoy.status === 'completed'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-amber-100 text-amber-800'
                      }`}>
                        {convoy.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {convoy.facilityName} ➔ <strong className="text-slate-700">{convoy.destinationCourt}</strong>
                    </p>
                  </div>
                </div>

                {/* Convoy Workflow Actions */}
                <div className="flex items-center gap-2">
                  {convoy.status === 'staging' && (
                    <button
                      onClick={() => handleDispatchConvoy(convoy.id)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg shadow-xs"
                    >
                      {language === 'fr' ? 'Départ du Convoi (Sortie Écrou)' : 'Dispatch Convoy En Route'}
                    </button>
                  )}
                  {convoy.status === 'en_route_court' && (
                    <button
                      onClick={() => handleArriveCourt(convoy.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-xs"
                    >
                      {language === 'fr' ? 'Confirmer Arrivée au Tribunal' : 'Confirm Court Arrival'}
                    </button>
                  )}
                  {convoy.status === 'at_court' && (
                    <button
                      onClick={() => handleCompleteConvoy(convoy.id)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg shadow-xs"
                    >
                      {language === 'fr' ? 'Clôturer Mission au Centre' : 'Conclude Mission'}
                    </button>
                  )}
                </div>
              </div>

              {/* Convoy details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[11px] font-medium">{language === 'fr' ? 'Détenus Transportés' : 'Inmates Manifest'}</span>
                  <div className="font-semibold text-slate-900 mt-1 space-y-0.5">
                    {convoy.inmateNames.map((name, i) => (
                      <div key={i} className="truncate">• {name}</div>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[11px] font-medium">{language === 'fr' ? 'Véhicules Assignés' : 'Vehicles Assigned'}</span>
                  <div className="font-semibold text-slate-900 mt-1 space-y-0.5">
                    {convoy.vehiclesAssigned.map((veh, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-slate-400" />
                        <span>{veh}</span>
                      </div>
                    ))}
                  </div>
                  <span className="text-slate-500 block mt-2">
                    {convoy.armedOfficersCount} {language === 'fr' ? 'officiers d\'escorte armés' : 'armed tactical officers'}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[11px] font-medium">{language === 'fr' ? 'Journal Radio Opérations' : 'Control Room Radio Log'}</span>
                  <p className="font-mono text-xs text-slate-700 mt-1 leading-relaxed">
                    {convoy.radioLog}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Vehicles List */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {vehicles.map(veh => (
            <div key={veh.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{veh.callSign}</h4>
                  <p className="text-xs text-slate-500">{veh.model}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  veh.status === 'ready'
                    ? 'bg-emerald-100 text-emerald-800'
                    : veh.status === 'in_convoy'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                }`}>
                  {veh.status.toUpperCase()}
                </span>
              </div>

              <div className="p-2.5 rounded bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-600">
                  <span>{language === 'fr' ? 'Protection balistique :' : 'Ballistic Armor:'}</span>
                  <span className="font-semibold text-slate-900">{veh.armorLevel.toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>{language === 'fr' ? 'Cellules individuelles :' : 'Cellular Cages:'}</span>
                  <span className="font-semibold text-slate-900">{veh.cellularCagesCapacity} {language === 'fr' ? 'détenus' : 'inmates'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>{language === 'fr' ? 'Escorte armée :' : 'Guard Seats:'}</span>
                  <span className="font-semibold text-slate-900">{veh.armedGuardCapacity} {language === 'fr' ? 'places' : 'seats'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>{language === 'fr' ? 'Balise GPS :' : 'Satellite GPS:'}</span>
                  <span className="font-mono text-slate-800 font-semibold">{veh.gpsTrackerId}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Fuel className="w-3.5 h-3.5 text-amber-500" />
                  <span>{veh.fuelLevel}% {language === 'fr' ? 'carburant' : 'fuel'}</span>
                </div>
                <span>{veh.facilityName}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
