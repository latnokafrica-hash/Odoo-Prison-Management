import React, { useState } from 'react';
import { Language } from '../../types';
import { 
  Users, 
  Clock, 
  ShieldCheck, 
  ShieldAlert, 
  ToggleLeft, 
  ToggleRight, 
  ArrowRight, 
  CheckCircle2, 
  Radio, 
  Sliders, 
  Eye
} from 'lucide-react';

interface SectorOverlapItem {
  id: string;
  name: string;
  code: string;
  outgoingOfficer: string;
  outgoingRank: string;
  incomingOfficer: string;
  incomingRank: string;
  overlapStartTime: string;
  overlapEndTime: string;
  overlapDurationMinutes: number;
  postLocation: string;
  keyVerificationDone: boolean;
  musterVerified: boolean;
}

interface DutyOverlapRosterWidgetProps {
  language: Language;
}

export const DutyOverlapRosterWidget: React.FC<DutyOverlapRosterWidgetProps> = ({ language }) => {
  const isFr = language === 'fr';

  const initialSectors: SectorOverlapItem[] = [
    {
      id: 'sec-alpha',
      name: isFr ? 'Secteur Alpha - Blocs Détenus A & B' : 'Sector Alpha - Cell Blocks A & B',
      code: 'SEC-A',
      outgoingOfficer: 'Sgt. J. Kimani',
      outgoingRank: 'Senior Sergeant',
      incomingOfficer: 'Sgt. P. Ochieng',
      incomingRank: 'Sergeant',
      overlapStartTime: '13:45',
      overlapEndTime: '14:30',
      overlapDurationMinutes: 45,
      postLocation: isFr ? 'Poste de Contrôle Central Tier 1' : 'Central Tier 1 Control Desk',
      keyVerificationDone: true,
      musterVerified: true,
    },
    {
      id: 'sec-bravo',
      name: isFr ? 'Secteur Bravo - Haute Sécurité & Isolement' : 'Sector Bravo - Maximum Threat CAT A & Solitary',
      code: 'SEC-B',
      outgoingOfficer: 'Insp. D. Rotich',
      outgoingRank: 'Chief Inspector',
      incomingOfficer: 'Insp. E. Mwangi',
      incomingRank: 'Inspector',
      overlapStartTime: '13:30',
      overlapEndTime: '14:30',
      overlapDurationMinutes: 60,
      postLocation: isFr ? 'Sas Blindé Bloc C' : 'Block C Interlock Air-Lock',
      keyVerificationDone: true,
      musterVerified: false,
    },
    {
      id: 'sec-charlie',
      name: isFr ? 'Secteur Charlie - Périmètre, Armurerie & Miradors' : 'Sector Charlie - Perimeter, Armory & Watchtowers',
      code: 'SEC-C',
      outgoingOfficer: 'Cpl. F. Mutua',
      outgoingRank: 'Corporal',
      incomingOfficer: 'Cpl. H. Wambui',
      incomingRank: 'Corporal',
      overlapStartTime: '13:45',
      overlapEndTime: '14:30',
      overlapDurationMinutes: 45,
      postLocation: isFr ? 'Armurerie Centrale & Tour Nord' : 'Main Armory & North Tower',
      keyVerificationDone: true,
      musterVerified: true,
    },
    {
      id: 'sec-delta',
      name: isFr ? 'Secteur Delta - Sas des Véhicules & Greffe' : 'Sector Delta - Sallyport Gatehouse & Records Intake',
      code: 'SEC-D',
      outgoingOfficer: 'Sgt. A. Barasa',
      outgoingRank: 'Sergeant',
      incomingOfficer: 'Sgt. K. Njoroge',
      incomingRank: 'Sergeant',
      overlapStartTime: '13:45',
      overlapEndTime: '14:30',
      overlapDurationMinutes: 45,
      postLocation: isFr ? 'Portail Principal Sallyport' : 'Main Sallyport Gate',
      keyVerificationDone: false,
      musterVerified: true,
    },
    {
      id: 'sec-echo',
      name: isFr ? 'Secteur Écho - Aile Médicale & Infirmerie' : 'Sector Echo - Medical Infirmary & Clinic',
      code: 'SEC-E',
      outgoingOfficer: 'Off. L. Achieng',
      outgoingRank: 'Ward Officer',
      incomingOfficer: 'Off. S. Kiprono',
      incomingRank: 'Ward Officer',
      overlapStartTime: '13:45',
      overlapEndTime: '14:15',
      overlapDurationMinutes: 30,
      postLocation: isFr ? 'Infirmerie Poste Infirmier' : 'Infirmary Nurse Station',
      keyVerificationDone: true,
      musterVerified: true,
    },
  ];

  // Active toggled overlap windows (sectorId -> boolean)
  const [activeOverlapSectors, setActiveOverlapSectors] = useState<Record<string, boolean>>({
    'sec-alpha': true,
    'sec-bravo': true,
    'sec-charlie': false,
    'sec-delta': false,
    'sec-echo': false,
  });

  const toggleSectorOverlap = (sectorId: string) => {
    setActiveOverlapSectors(prev => ({
      ...prev,
      [sectorId]: !prev[sectorId]
    }));
  };

  const toggleAll = (activate: boolean) => {
    const nextState: Record<string, boolean> = {};
    initialSectors.forEach(s => {
      nextState[s.id] = activate;
    });
    setActiveOverlapSectors(nextState);
  };

  const activeCount = Object.values(activeOverlapSectors).filter(Boolean).length;

  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl p-4 border border-slate-800 shadow-md">
      
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
            <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase">
              {isFr ? 'Régulation du Chevauchement de Quart (Shift Overlap Window)' : 'Tactical Duty Overlap & Handover Roster'}
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isFr 
              ? 'Activez la période de transition conjointe pour chaque secteur (double garde et passation physique des postes)' 
              : 'Toggle active overlap windows per sector to mandate two-officer physical post verification'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleAll(activeCount < initialSectors.length)}
            className="px-2.5 py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
          >
            {activeCount < initialSectors.length 
              ? (isFr ? 'Activer Tout le Chevauchement' : 'Activate All Overlaps')
              : (isFr ? 'Désactiver Tout' : 'Clear All Overlaps')}
          </button>

          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-950/80 text-amber-300 border border-amber-800">
            {activeCount} / {initialSectors.length} {isFr ? 'Secteurs en Double Garde' : 'Sectors in Joint Overlap'}
          </span>
        </div>
      </div>

      {/* Visual Duty Overlap Timeline Chart */}
      <div className="mb-5 p-3.5 bg-slate-950/70 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isFr ? 'Chronologie de la Période Critique de Relève' : 'Critical Shift Overlap Timeline'}</span>
          </span>
          <span className="text-[11px] font-mono text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/80">
            {isFr ? 'FENÊTRE CONJOINTE : 13:45 - 14:30 (45 MIN)' : 'HANDOVER WINDOW : 13:45 - 14:30 (45 MIN)'}
          </span>
        </div>

        {/* Timeline Visual Bar */}
        <div className="space-y-2 text-[10px]">
          {/* Outgoing Shift Timeline */}
          <div className="flex items-center gap-2">
            <span className="w-20 font-mono text-slate-400 truncate text-right">
              {isFr ? 'Sortant (06-14h)' : 'Outgoing (06-14)'}
            </span>
            <div className="flex-1 h-5 bg-slate-800 rounded relative overflow-hidden flex items-center">
              <div className="w-[85%] h-full bg-slate-700 flex items-center px-2 text-slate-300 font-medium">
                {isFr ? 'Garde Principale Assurée' : 'Primary Shift Watch Duty'}
              </div>
              <div className="w-[15%] h-full bg-gradient-to-r from-amber-600 to-amber-700 flex items-center justify-center text-white font-bold tracking-wider">
                {isFr ? 'RELÈVE' : 'OVERLAP'}
              </div>
            </div>
            <span className="font-mono text-slate-400 text-xs w-12 text-left">14:00</span>
          </div>

          {/* Incoming Shift Timeline */}
          <div className="flex items-center gap-2">
            <span className="w-20 font-mono text-slate-400 truncate text-right">
              {isFr ? 'Entrant (13h45-22)' : 'Incoming (13:45-22)'}
            </span>
            <div className="flex-1 h-5 bg-slate-800 rounded relative overflow-hidden flex items-center">
              <div className="w-[15%] h-full bg-gradient-to-r from-amber-600 to-indigo-600 flex items-center justify-center text-white font-bold tracking-wider">
                {isFr ? 'PRISE' : 'TAKEOVER'}
              </div>
              <div className="w-[85%] h-full bg-indigo-900/60 flex items-center px-2 text-indigo-200 font-medium">
                {isFr ? 'Quart d\'Après-Midi Activé' : 'Afternoon Watch Custody Active'}
              </div>
            </div>
            <span className="font-mono text-slate-400 text-xs w-12 text-left">22:00</span>
          </div>
        </div>

        {/* Legend / Status Note */}
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>{isFr ? 'Pendant le chevauchement, les deux commandants de secteur patrouillent ensemble.' : 'During active overlap, both sector leads jointly inspect cell locks and muster counts.'}</span>
          </span>
          <span className="font-mono text-slate-500 text-[10px]">
            {isFr ? 'Protocole Kenya Prisons R-14' : 'Prisons Service Protocol R-14'}
          </span>
        </div>
      </div>

      {/* Sector Roster List with Manual Overlap Toggles */}
      <div className="space-y-2.5">
        {initialSectors.map(sec => {
          const isOverlapActive = !!activeOverlapSectors[sec.id];

          return (
            <div
              key={sec.id}
              className={`p-3 rounded-xl border transition-all ${
                isOverlapActive
                  ? 'bg-amber-950/20 border-amber-600/80 shadow-md shadow-amber-950/40 ring-1 ring-amber-500/50'
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                
                {/* Sector Info */}
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg font-mono font-black text-xs ${
                    isOverlapActive ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {sec.code}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-xs sm:text-sm font-bold text-white">
                        {sec.name}
                      </strong>
                      {isOverlapActive && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          <span>{isFr ? 'CHEVAUCHEMENT ACTIF' : 'OVERLAP WINDOW ACTIVE'}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {sec.postLocation} &bull; {isFr ? 'Fenêtre :' : 'Window :'} <span className="font-mono text-slate-200">{sec.overlapStartTime} - {sec.overlapEndTime} ({sec.overlapDurationMinutes} min)</span>
                    </p>
                  </div>
                </div>

                {/* Duty Officers Transition Box */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs bg-black/40 px-3 py-1.5 rounded-lg border border-slate-800">
                  {/* Outgoing Officer */}
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">{isFr ? 'Officier Sortant' : 'Outgoing Officer'}</span>
                    <strong className="text-slate-200 block text-xs">{sec.outgoingOfficer}</strong>
                    <span className="text-[10px] text-slate-400 block">{sec.outgoingRank}</span>
                  </div>

                  <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />

                  {/* Incoming Officer */}
                  <div className="text-left">
                    <span className="text-[10px] text-indigo-400 block">{isFr ? 'Officier Entrant' : 'Incoming Officer'}</span>
                    <strong className="text-indigo-200 block text-xs">{sec.incomingOfficer}</strong>
                    <span className="text-[10px] text-indigo-300/80 block">{sec.incomingRank}</span>
                  </div>
                </div>

                {/* Toggle Button */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleSectorOverlap(sec.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isOverlapActive
                        ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                    title={isFr ? 'Basculer le statut de chevauchement' : 'Toggle shift overlap window'}
                  >
                    {isOverlapActive ? (
                      <>
                        <ToggleRight className="w-4 h-4 text-amber-200" />
                        <span>{isFr ? 'Chevauchement ON' : 'Overlap ON'}</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4 text-slate-400" />
                        <span>{isFr ? 'Chevauchement OFF' : 'Overlap OFF'}</span>
                      </>
                    )}
                  </button>
                </div>

              </div>

              {/* Joint Checklist Verification Pills when Active */}
              {isOverlapActive && (
                <div className="mt-2.5 pt-2 border-t border-amber-900/40 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-3">
                    <span className="text-amber-300 font-semibold">{isFr ? 'Vérifications conjointes :' : 'Joint Verifications :'}</span>
                    <span className={`flex items-center gap-1 ${sec.keyVerificationDone ? 'text-emerald-400 font-medium' : 'text-slate-400'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isFr ? 'Armurerie / Clés' : 'Keys Custody Handover'}</span>
                    </span>
                    <span className={`flex items-center gap-1 ${sec.musterVerified ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}`}>
                      {sec.musterVerified ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                      <span>{isFr ? 'Appel Physique Réconcilié' : 'Muster Reconciliation'}</span>
                    </span>
                  </div>

                  <span className="text-[10px] text-amber-400/90 font-mono">
                    {isFr ? 'Zone illuminée sur le diagramme de charge' : 'Sector highlighted on operational duty roster'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
