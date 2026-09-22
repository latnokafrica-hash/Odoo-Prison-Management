import React, { useState } from 'react';
import { Language } from '../../types';
import { 
  Building2, 
  AlertTriangle, 
  Users, 
  ShieldAlert, 
  ShieldCheck, 
  Layers, 
  Flame, 
  Lock, 
  CheckCircle2, 
  Activity,
  SlidersHorizontal
} from 'lucide-react';

export interface SectorHeatmapData {
  id: string;
  name: string;
  code: string;
  category: 'remand' | 'medium' | 'maximum' | 'solitary' | 'medical' | 'perimeter';
  capacity: number;
  occupancy: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  officersOnDuty: number;
  highProfileInmates: number;
  recentIncident: string | null;
}

interface FacilitySectorHeatmapProps {
  language: Language;
  selectedSectorId?: string | null;
  onSelectSector?: (sectorId: string | null) => void;
}

export const FacilitySectorHeatmap: React.FC<FacilitySectorHeatmapProps> = ({
  language,
  selectedSectorId,
  onSelectSector,
}) => {
  const isFr = language === 'fr';
  const [viewMode, setViewMode] = useState<'occupancy' | 'risk'>('occupancy');

  const sectors: SectorHeatmapData[] = [
    {
      id: 'sec-block-a',
      name: isFr ? 'Bloc A - Prévenus & Accueil' : 'Block A - Remand & Intake',
      code: 'SEC-A',
      category: 'remand',
      capacity: 200,
      occupancy: 218,
      riskLevel: 'HIGH',
      officersOnDuty: 8,
      highProfileInmates: 12,
      recentIncident: isFr ? 'Tension distribution repas 13h' : 'Meal distribution unrest 13:00',
    },
    {
      id: 'sec-block-b',
      name: isFr ? 'Bloc B - Détention Moyenne' : 'Block B - Medium Custody',
      code: 'SEC-B',
      category: 'medium',
      capacity: 320,
      occupancy: 308,
      riskLevel: 'MEDIUM',
      officersOnDuty: 10,
      highProfileInmates: 6,
      recentIncident: null,
    },
    {
      id: 'sec-block-c',
      name: isFr ? 'Bloc C - Haute Sécurité (CAT A)' : 'Block C - Maximum Threat (CAT A)',
      code: 'SEC-C',
      category: 'maximum',
      capacity: 140,
      occupancy: 148,
      riskLevel: 'CRITICAL',
      officersOnDuty: 14,
      highProfileInmates: 36,
      recentIncident: isFr ? 'Fouille cellule C-12 : lame artisanale' : 'Cell C-12 sweep: contraband shank seized',
    },
    {
      id: 'sec-block-d',
      name: isFr ? 'Bloc D - Isolement & Quartier Disciplinaire' : 'Block D - Segregation & Solitary',
      code: 'SEC-D',
      category: 'solitary',
      capacity: 35,
      occupancy: 34,
      riskLevel: 'HIGH',
      officersOnDuty: 6,
      highProfileInmates: 18,
      recentIncident: isFr ? 'Grève de la faim surveillée' : 'Hunger strike vitals check ordered',
    },
    {
      id: 'sec-block-e',
      name: isFr ? 'Aile Médicale & Infirmerie' : 'Medical Wing & Psychiatric Infirmary',
      code: 'SEC-MED',
      category: 'medical',
      capacity: 50,
      occupancy: 42,
      riskLevel: 'LOW',
      officersOnDuty: 4,
      highProfileInmates: 2,
      recentIncident: null,
    },
    {
      id: 'sec-perimeter',
      name: isFr ? 'Périmètre, Miradors & Sas Armé' : 'Perimeter, Watchtowers & Sallyport',
      code: 'SEC-PERIM',
      category: 'perimeter',
      capacity: 0,
      occupancy: 0,
      riskLevel: 'LOW',
      officersOnDuty: 16,
      highProfileInmates: 0,
      recentIncident: isFr ? 'Capteur infrarouge zone Est vérifié' : 'Zone East IR motion trip verified clear',
    },
  ];

  // Helper for occupancy color
  const getOccupancyColor = (occ: number, cap: number) => {
    if (cap === 0) return 'bg-slate-800 text-slate-200 border-slate-700';
    const ratio = occ / cap;
    if (ratio >= 1.05) {
      return 'bg-rose-950/80 text-rose-200 border-rose-700 hover:border-rose-500';
    }
    if (ratio >= 0.95) {
      return 'bg-amber-950/80 text-amber-200 border-amber-700 hover:border-amber-500';
    }
    if (ratio >= 0.8) {
      return 'bg-indigo-950/80 text-indigo-200 border-indigo-700 hover:border-indigo-500';
    }
    return 'bg-emerald-950/80 text-emerald-200 border-emerald-700 hover:border-emerald-500';
  };

  // Helper for risk color
  const getRiskColor = (risk: SectorHeatmapData['riskLevel']) => {
    switch (risk) {
      case 'CRITICAL':
        return 'bg-rose-950/90 text-rose-200 border-rose-600 shadow-rose-900/30';
      case 'HIGH':
        return 'bg-amber-950/80 text-amber-200 border-amber-600';
      case 'MEDIUM':
        return 'bg-indigo-950/80 text-indigo-200 border-indigo-600';
      case 'LOW':
        return 'bg-emerald-950/80 text-emerald-200 border-emerald-600';
    }
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl p-4 border border-slate-800 shadow-md">
      
      {/* Heatmap Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase">
              {isFr ? 'Cartographie Thermique des Secteurs (Heatmap)' : 'Facility Sector Heatmap & Density Matrix'}
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isFr 
              ? 'Taux d\'occupation en temps réel & niveau de criticité opérationnelle par bloc' 
              : 'Real-time occupancy density and operational risk levels across prison cell blocks'}
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
          <button
            onClick={() => setViewMode('occupancy')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
              viewMode === 'occupancy' 
                ? 'bg-indigo-600 text-white shadow-xs' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isFr ? 'Densité / Effectifs' : 'Occupancy Density'}
          </button>
          <button
            onClick={() => setViewMode('risk')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
              viewMode === 'risk' 
                ? 'bg-amber-600 text-white shadow-xs' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isFr ? 'Niveau de Menace' : 'Threat Level'}
          </button>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sectors.map(sec => {
          const isOvercrowded = sec.capacity > 0 && sec.occupancy > sec.capacity;
          const occPct = sec.capacity > 0 ? Math.round((sec.occupancy / sec.capacity) * 100) : 0;
          const isSelected = selectedSectorId === sec.id;

          const cardStyling = viewMode === 'occupancy' 
            ? getOccupancyColor(sec.occupancy, sec.capacity)
            : getRiskColor(sec.riskLevel);

          return (
            <div
              key={sec.id}
              onClick={() => onSelectSector && onSelectSector(isSelected ? null : sec.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${cardStyling} ${
                isSelected ? 'ring-2 ring-indigo-400 scale-[1.02]' : 'hover:scale-[1.01]'
              }`}
            >
              {/* Overcrowded Indicator Banner */}
              {isOvercrowded && (
                <div className="absolute top-0 right-0 bg-rose-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-bl tracking-wider animate-pulse">
                  {isFr ? 'SURPEUPLEMENT' : 'OVER-CAPACITY'}
                </div>
              )}

              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-black text-white px-1.5 py-0.5 bg-black/40 rounded border border-white/10">
                      {sec.code}
                    </span>
                    <strong className="text-xs font-bold text-white block truncate max-w-[170px]">
                      {sec.name}
                    </strong>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  sec.riskLevel === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border-rose-500/50' :
                  sec.riskLevel === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' :
                  sec.riskLevel === 'MEDIUM' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50' :
                  'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                }`}>
                  {sec.riskLevel}
                </span>
              </div>

              {/* Occupancy Progress Bar */}
              {sec.capacity > 0 ? (
                <div className="space-y-1 mb-2.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300 font-mono">
                      <strong className="text-white text-xs">{sec.occupancy}</strong> / {sec.capacity} {isFr ? 'détenus' : 'inmates'}
                    </span>
                    <span className={`font-mono font-bold ${isOvercrowded ? 'text-rose-400 font-black' : 'text-slate-200'}`}>
                      {occPct}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        occPct >= 105 ? 'bg-rose-500' :
                        occPct >= 95 ? 'bg-amber-500' :
                        occPct >= 80 ? 'bg-indigo-400' :
                        'bg-emerald-400'
                      }`}
                      style={{ width: `${Math.min(occPct, 100)}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="mb-2.5 p-1.5 bg-black/30 rounded text-[11px] text-slate-300 flex items-center justify-between">
                  <span>{isFr ? 'Ligne de Défense Armée' : 'Armed Defense Line'}</span>
                  <span className="font-mono text-emerald-400 font-bold">{isFr ? 'SÉCURISÉ' : 'ACTIVE SECURE'}</span>
                </div>
              )}

              {/* Sector Stats & Incidents */}
              <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-1.5 text-[10px] text-slate-300">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-indigo-300" />
                  <span>{sec.officersOnDuty} {isFr ? 'Sentinelles' : 'Officers on Post'}</span>
                </div>
                {sec.highProfileInmates > 0 && (
                  <div className="flex items-center gap-1 text-amber-300 font-semibold justify-end">
                    <ShieldAlert className="w-3 h-3 text-amber-400" />
                    <span>{sec.highProfileInmates} {isFr ? 'Profils Dangereux' : 'CAT A Inmates'}</span>
                  </div>
                )}
              </div>

              {sec.recentIncident && (
                <div className="mt-2 text-[10px] bg-black/40 px-2 py-1 rounded text-rose-300 flex items-center gap-1 border border-rose-900/50">
                  <Flame className="w-3 h-3 text-rose-400 shrink-0" />
                  <span className="truncate">{sec.recentIncident}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Heatmap Legend */}
      <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-300">{isFr ? 'Légende Densité :' : 'Density Scale :'}</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-600" />
            <span>&lt; 80% {isFr ? 'Optimal' : 'Optimal'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-indigo-600" />
            <span>80-95% {isFr ? 'Dense' : 'Dense'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-600" />
            <span>95-100% {isFr ? 'Capacité Max' : 'Near Capacity'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-600" />
            <span>&gt; 100% {isFr ? 'Surpeuplé (Alerte)' : 'Over-Capacity Alert'}</span>
          </div>
        </div>

        <div className="text-[10px] text-slate-500 font-mono">
          {isFr ? 'Mise à jour en temps réel par capteurs RFID & appels' : 'Live sensor & muster sync active'}
        </div>
      </div>

    </div>
  );
};
