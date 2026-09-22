import React, { useState } from 'react';
import { Language } from '../../types';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Radio, 
  Flame, 
  Users, 
  X, 
  Check, 
  Send, 
  Building2, 
  Lock, 
  Activity 
} from 'lucide-react';

export interface EmergencyAlertPayload {
  code: 'CODE_RED' | 'CODE_AMBER' | 'CODE_BLUE' | 'CODE_BLACK' | 'CODE_ORANGE';
  title: string;
  sector: string;
  directives: string;
  author: string;
  timestamp: string;
  acknowledgedOfficers: number;
  totalOfficers: number;
}

interface EmergencyAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onBroadcast: (alert: EmergencyAlertPayload) => void;
}

export const EmergencyAlertModal: React.FC<EmergencyAlertModalProps> = ({
  isOpen,
  onClose,
  language,
  onBroadcast,
}) => {
  const isFr = language === 'fr';

  const [alertCode, setAlertCode] = useState<EmergencyAlertPayload['code']>('CODE_RED');
  const [sector, setSector] = useState('All Sectors (Facility-Wide Lockdown)');
  const [title, setTitle] = useState('');
  const [directives, setDirectives] = useState('');
  const [channels, setChannels] = useState({
    vhfRadios: true,
    controlRoomConsole: true,
    armedQRF: true,
    governorNotify: true,
  });

  if (!isOpen) return null;

  const alertDefinitions = {
    CODE_RED: {
      label: isFr ? 'CODE ROUGE : Évasion / Brèche Périmètre' : 'CODE RED : Escape Attempt / Perimeter Breach',
      desc: isFr ? 'Intrusion extérieure ou tentative d\'évasion armée. Verrouillage immédiat.' : 'Perimeter breach or armed escape attempt. Immediate sallyport seal.',
      bg: 'bg-rose-600',
      border: 'border-rose-500',
      defaultTitle: isFr ? 'Tentative de Franchissement Clôture Périmètre' : 'Perimeter Outer Fence Intrusion Detected',
      defaultDirectives: isFr ? 'Déployer la Force d\'Intervention Rapide. Verrouillage général des sas.' : 'Deploy armed QRF squad. Full sallyport interlock freeze.'
    },
    CODE_AMBER: {
      label: isFr ? 'CODE AMBRE : Émeute de Bloc / Prise d\'Otage' : 'CODE AMBER : Cell Block Riot / Hostage Disturbance',
      desc: isFr ? 'Refus d\'obtempérer de masse, altercation collective dans les coursives.' : 'Mass inmate disorder, tier barricade, or officer hostage situation.',
      bg: 'bg-amber-600',
      border: 'border-amber-500',
      defaultTitle: isFr ? 'Rixe Collective et Barricade Bloc C' : 'Mass Tier Barricade & Disorder in Block C',
      defaultDirectives: isFr ? 'Évacuer le personnel médical, verrouiller les grilles de tier, gaz lacrymogène en attente.' : 'Evacuate non-custody staff, seal tier gates, riot team stand by.'
    },
    CODE_BLUE: {
      label: isFr ? 'CODE BLEU : Urgence Médicale Vitale' : 'CODE BLUE : Critical Medical Emergency / Trauma',
      desc: isFr ? 'Arrêt cardiorespiratoire ou blessure par arme blanche nécessitant réanimation.' : 'Cardiac arrest or severe penetrating trauma requiring trauma stabilization.',
      bg: 'bg-sky-600',
      border: 'border-sky-500',
      defaultTitle: isFr ? 'Arrêt Cardiaque Détenu - Réanimation Immédiate' : 'Acute Medical Arrest - CPR In Progress',
      defaultDirectives: isFr ? 'Ouvrir couloir d\'ambulance au portail Nord, escorter les urgentistes.' : 'Clear ambulance corridor at North Sallyport, dispatch armed escort.'
    },
    CODE_BLACK: {
      label: isFr ? 'CODE NOIR : Incendie / Perte Totale Énergie' : 'CODE BLACK : Facility Fire / Structural Hazard',
      desc: isFr ? 'Départ de feu dans un bloc ou coupure complète de l\'alimentation électrique.' : 'Structural cell block blaze or total primary power grid failure.',
      bg: 'bg-slate-900',
      border: 'border-slate-700',
      defaultTitle: isFr ? 'Départ d\'Incendie Détecté Aile Ouest' : 'Active Cell Fire Detected in West Wing',
      defaultDirectives: isFr ? 'Activer générateurs de secours, isoler la conduite de gaz, extraire les détenus en zone sûre.' : 'Start emergency generators, isolate gas lines, orderly evacuation to secure yard.'
    },
    CODE_ORANGE: {
      label: isFr ? 'CODE ORANGE : Découverte Armes / Contrebande' : 'CODE ORANGE : Concealed Weapon Infiltration',
      desc: isFr ? 'Arme à feu ou explosif suspecté dans l\'établissement. Fouille générale.' : 'Firearm or high-lethality weapon reported inside secure perimeter.',
      bg: 'bg-orange-600',
      border: 'border-orange-500',
      defaultTitle: isFr ? 'Suspicion Arme à Feu Introduite au Parloir' : 'Suspected Firearm Incursion at Visiting Bay',
      defaultDirectives: isFr ? 'Fouille au corps générale des parloirs, rétention des visiteurs.' : 'Lock down visiting bay, full secondary metal detector screening.'
    },
  };

  const handleSelectCode = (code: EmergencyAlertPayload['code']) => {
    setAlertCode(code);
    const def = alertDefinitions[code];
    setTitle(def.defaultTitle);
    setDirectives(def.defaultDirectives);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: EmergencyAlertPayload = {
      code: alertCode,
      title: title || alertDefinitions[alertCode].defaultTitle,
      sector,
      directives: directives || alertDefinitions[alertCode].defaultDirectives,
      author: isFr ? 'Commandant de Garde (Shift Commander)' : 'Shift Duty Commander',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      acknowledgedOfficers: 14,
      totalOfficers: 14,
    };

    onBroadcast(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border-2 border-rose-600/80 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 text-white flex items-center justify-between border-b border-rose-700/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-600 text-white animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-wide flex items-center gap-2">
                <span>{isFr ? 'DÉCLENCHEMENT D\'ALERTE D\'URGENCE TACTIQUE' : 'TRIGGER TACTICAL EMERGENCY ALERT'}</span>
              </h3>
              <p className="text-[11px] text-rose-200">
                {isFr ? 'Diffusion radio instantanée à tous les commandants de quart et sentinelles armées' : 'Broadcasts an immediate high-priority tactical directive to all active post leads'}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-rose-200 hover:text-white p-1 rounded-lg hover:bg-rose-800/50">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          {/* Alert Code Selector */}
          <div>
            <label className="block font-bold text-slate-200 mb-1.5 uppercase text-[11px] tracking-wider">
              {isFr ? '1. Sélectionner le Code d\'Alerte' : '1. Select Emergency Code'} *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(Object.keys(alertDefinitions) as Array<EmergencyAlertPayload['code']>).map(codeKey => {
                const def = alertDefinitions[codeKey];
                const isSelected = alertCode === codeKey;

                return (
                  <button
                    key={codeKey}
                    type="button"
                    onClick={() => handleSelectCode(codeKey)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected 
                        ? `${def.bg} text-white border-white shadow-md ring-2 ring-white/50 scale-[1.01]` 
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>{codeKey.replace('_', ' ')}</span>
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <span className="text-[10px] opacity-90 mt-1 line-clamp-2">
                      {def.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Sector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                {isFr ? 'Secteur Visé / Localisation' : 'Target Sector / Location'} *
              </label>
              <select
                value={sector}
                onChange={e => setSector(e.target.value)}
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 font-semibold focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
              >
                <option value="All Sectors (Facility-Wide Lockdown)">
                  {isFr ? 'Tous Secteurs (Confinement Général)' : 'All Sectors (Facility-Wide Lockdown)'}
                </option>
                <option value="Sector Alpha - Cell Block A & B">Sector Alpha - Cell Block A & B</option>
                <option value="Sector Bravo - Block C Maximum Security CAT A">Sector Bravo - Block C Maximum Security CAT A</option>
                <option value="Sector Charlie - Perimeter & Watchtowers">Sector Charlie - Perimeter & Watchtowers</option>
                <option value="Sector Delta - Main Sallyport Gatehouse">Sector Delta - Main Sallyport Gatehouse</option>
                <option value="Sector Echo - Medical Infirmary">Sector Echo - Medical Infirmary</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                {isFr ? 'Intitulé Opérationnel' : 'Alert Headline'} *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={alertDefinitions[alertCode].defaultTitle}
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 font-semibold focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Tactical Directives */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              {isFr ? 'Consignes Tactiques d\'Urgence Immédiates' : 'Immediate Tactical Directives'} *
            </label>
            <textarea
              rows={2}
              value={directives}
              onChange={e => setDirectives(e.target.value)}
              placeholder={alertDefinitions[alertCode].defaultDirectives}
              className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-xs focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>

          {/* Broadcast Channels Selection */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="block font-bold text-slate-300 mb-2 uppercase text-[10px] tracking-wider">
              {isFr ? 'Canaux de Transmission Tactique :' : 'Broadcast Channels Synchronized :'}
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={channels.vhfRadios}
                  onChange={e => setChannels({ ...channels, vhfRadios: e.target.checked })}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span>{isFr ? 'Radios VHF Ch 1 & 4' : 'VHF Radio Ch 1 & Ch 4'}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={channels.armedQRF}
                  onChange={e => setChannels({ ...channels, armedQRF: e.target.checked })}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span>{isFr ? 'Peloton QRF Armé' : 'Armed QRF Tactical Squad'}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={channels.controlRoomConsole}
                  onChange={e => setChannels({ ...channels, controlRoomConsole: e.target.checked })}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span>{isFr ? 'Console Pupitre Sécurité' : 'Central Command Console'}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={channels.governorNotify}
                  onChange={e => setChannels({ ...channels, governorNotify: e.target.checked })}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span>{isFr ? 'Télégramme Gouverneur' : 'Governor SMS Dispatch'}</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              {isFr ? 'Annuler' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white rounded-lg shadow-lg shadow-rose-900/40 flex items-center gap-2 transition-all active:scale-95"
            >
              <Radio className="w-4 h-4 animate-spin text-white" />
              <span>{isFr ? 'Diffuser l\'Alerte Immédiate' : 'Broadcast Alert Immediately'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
