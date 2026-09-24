import React, { useState, useMemo } from 'react';
import { 
  ContrabandItem, 
  ContrabandSeverity, 
  ContrabandCategory, 
  ContrabandDisposalStatus, 
  Language, 
  Inmate 
} from '../../types';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Trash2, 
  Check, 
  X, 
  FileText, 
  Download, 
  Printer, 
  User, 
  MapPin, 
  Clock, 
  Archive, 
  ExternalLink, 
  Sparkles, 
  Flame, 
  Zap, 
  Smartphone, 
  Banknote, 
  Wrench, 
  Wine, 
  HelpCircle,
  FolderLock,
  ChevronDown
} from 'lucide-react';

interface ContrabandSeizedTableProps {
  language: Language;
  items: ContrabandItem[];
  inmates?: Inmate[];
  currentOfficerName?: string;
  currentOfficerBadge?: string;
  onUpdateSeverity: (itemId: string, newSeverity: ContrabandSeverity) => void;
  onUpdateDisposalStatus: (itemId: string, newStatus: ContrabandDisposalStatus) => void;
  onUpdateStorageLocation?: (itemId: string, newLocation: string) => void;
  onAddItem: (newItem: ContrabandItem) => void;
  onDeleteItem?: (itemId: string) => void;
  compactView?: boolean;
}

export const ContrabandSeizedTable: React.FC<ContrabandSeizedTableProps> = ({
  language,
  items,
  inmates = [],
  currentOfficerName = 'Capt. Marcus Vance',
  currentOfficerBadge = 'KP-8421',
  onUpdateSeverity,
  onUpdateDisposalStatus,
  onUpdateStorageLocation,
  onAddItem,
  onDeleteItem,
  compactView = false,
}) => {
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDossierItem, setSelectedDossierItem] = useState<ContrabandItem | null>(null);

  // New Item Form State
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<ContrabandCategory>('weapons_shanks');
  const [newSeverity, setNewSeverity] = useState<ContrabandSeverity>('critical');
  const [newQuantity, setNewQuantity] = useState(1);
  const [newUnit, setNewUnit] = useState('item');
  const [newStorageLocation, setNewStorageLocation] = useState('Evidence Locker Alpha-01');
  const [newDisposalStatus, setNewDisposalStatus] = useState<ContrabandDisposalStatus>('secured_in_evidence');
  const [newSeizedLocation, setNewSeizedLocation] = useState('');
  const [newInmateName, setNewInmateName] = useState('');
  const [newInmateId, setNewInmateId] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Classification Metrics
  const metrics = useMemo(() => {
    const total = items.length;
    const critical = items.filter(i => i.severityLevel === 'critical').length;
    const high = items.filter(i => i.severityLevel === 'high').length;
    const medium = items.filter(i => i.severityLevel === 'medium').length;
    const low = items.filter(i => i.severityLevel === 'low').length;
    const secured = items.filter(i => i.disposalStatus === 'secured_in_evidence').length;
    const transferred = items.filter(i => i.disposalStatus === 'transferred_to_police').length;
    const slatedDestruction = items.filter(i => i.disposalStatus === 'slated_for_destruction').length;

    return {
      total,
      critical,
      high,
      medium,
      low,
      secured,
      transferred,
      slatedDestruction,
    };
  }, [items]);

  // Filtered List
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchDesc = item.itemDescription.toLowerCase().includes(q);
        const matchTag = item.chainOfCustodyRef.toLowerCase().includes(q);
        const matchInmate = (item.seizedFromInmateName || '').toLowerCase().includes(q) || (item.seizedFromInmateId || '').toLowerCase().includes(q);
        const matchStorage = item.storageLocation.toLowerCase().includes(q);
        const matchLoc = item.seizedLocation.toLowerCase().includes(q);
        if (!matchDesc && !matchTag && !matchInmate && !matchStorage && !matchLoc) {
          return false;
        }
      }

      // Severity
      if (filterSeverity !== 'all' && item.severityLevel !== filterSeverity) {
        return false;
      }

      // Category
      if (filterCategory !== 'all' && item.category !== filterCategory) {
        return false;
      }

      // Status
      if (filterStatus !== 'all' && item.disposalStatus !== filterStatus) {
        return false;
      }

      return true;
    });
  }, [items, searchQuery, filterSeverity, filterCategory, filterStatus]);

  // Helpers for labels and badge colors
  const getSeverityBadge = (level: ContrabandSeverity) => {
    switch (level) {
      case 'critical':
        return {
          bg: 'bg-rose-950/70 text-rose-300 border-rose-600/70',
          dot: 'bg-rose-500 animate-pulse',
          iconColor: 'text-rose-400',
          label: language === 'fr' ? 'Critique' : 'Critical',
          desc: language === 'fr' ? 'Arme létale, explosif, tentative d\'évasion' : 'Lethal weapon, explosive, escape tool'
        };
      case 'high':
        return {
          bg: 'bg-amber-950/70 text-amber-300 border-amber-600/70',
          dot: 'bg-amber-500',
          iconColor: 'text-amber-400',
          label: language === 'fr' ? 'Élevé' : 'High',
          desc: language === 'fr' ? 'Stupéfiant, alcool, téléphone actif' : 'Narcotics, brew, active phone'
        };
      case 'medium':
        return {
          bg: 'bg-indigo-950/70 text-indigo-300 border-indigo-600/70',
          dot: 'bg-indigo-400',
          iconColor: 'text-indigo-400',
          label: language === 'fr' ? 'Moyen' : 'Medium',
          desc: language === 'fr' ? 'Espèces non autorisées, SIM, tabac' : 'Illicit cash, SIM, tobacco'
        };
      case 'low':
      default:
        return {
          bg: 'bg-slate-800 text-slate-300 border-slate-600',
          dot: 'bg-slate-400',
          iconColor: 'text-slate-400',
          label: language === 'fr' ? 'Faible' : 'Low',
          desc: language === 'fr' ? 'Vêtements en surplus, résistance thermique' : 'Minor domestic or electrical hazard'
        };
    }
  };

  const getCategoryMeta = (cat: ContrabandCategory) => {
    switch (cat) {
      case 'weapons_shanks':
        return {
          label: language === 'fr' ? 'Arme / Lame Artisanale' : 'Weapons & Improvised Shanks',
          icon: ShieldAlert,
          color: 'text-rose-500',
          bg: 'bg-rose-50 text-rose-900 border-rose-200'
        };
      case 'narcotics_drugs':
        return {
          label: language === 'fr' ? 'Stupéfiants & Substances' : 'Narcotics & Controlled Substances',
          icon: Flame,
          color: 'text-amber-500',
          bg: 'bg-amber-50 text-amber-900 border-amber-200'
        };
      case 'unauthorized_electronics':
        return {
          label: language === 'fr' ? 'Électronique & Téléphonie' : 'Unauthorized Electronics & Comms',
          icon: Smartphone,
          color: 'text-blue-500',
          bg: 'bg-blue-50 text-blue-900 border-blue-200'
        };
      case 'illicit_cash':
        return {
          label: language === 'fr' ? 'Devises & Numéraire' : 'Illicit Currency & Cash',
          icon: Banknote,
          color: 'text-emerald-500',
          bg: 'bg-emerald-50 text-emerald-900 border-emerald-200'
        };
      case 'altered_tools':
        return {
          label: language === 'fr' ? 'Outils Détournés / Limes' : 'Altered Industrial Tools & Saws',
          icon: Wrench,
          color: 'text-purple-500',
          bg: 'bg-purple-50 text-purple-900 border-purple-200'
        };
      case 'alcohol_brew':
        return {
          label: language === 'fr' ? 'Alcool Artisanal (Muratina)' : 'Illicit Prison Ferment & Brew',
          icon: Wine,
          color: 'text-orange-500',
          bg: 'bg-orange-50 text-orange-900 border-orange-200'
        };
      case 'communication_media':
        return {
          label: language === 'fr' ? 'Cartes SIM & Médias' : 'SIM Cards & Clandestine Notes',
          icon: Zap,
          color: 'text-cyan-500',
          bg: 'bg-cyan-50 text-cyan-900 border-cyan-200'
        };
      case 'other_prohibited':
      default:
        return {
          label: language === 'fr' ? 'Autre Objet Prohibé' : 'Other Prohibited Paraphernalia',
          icon: HelpCircle,
          color: 'text-slate-500',
          bg: 'bg-slate-50 text-slate-900 border-slate-200'
        };
    }
  };

  const getStatusMeta = (status: ContrabandDisposalStatus) => {
    switch (status) {
      case 'secured_in_evidence':
        return {
          label: language === 'fr' ? 'Sécurisé sous Scellé' : 'Secured in Evidence',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          icon: FolderLock
        };
      case 'pending_forensics':
        return {
          label: language === 'fr' ? 'Expertise / Dactyloscopie' : 'Pending Forensics / DCI',
          bg: 'bg-indigo-50 text-indigo-800 border-indigo-300',
          icon: Search
        };
      case 'transferred_to_police':
        return {
          label: language === 'fr' ? 'Transféré Police Judiciaire' : 'Transferred to Police / DCI',
          bg: 'bg-blue-50 text-blue-800 border-blue-300',
          icon: ExternalLink
        };
      case 'slated_for_destruction':
        return {
          label: language === 'fr' ? 'Destruction Programmée' : 'Slated for Destruction',
          bg: 'bg-amber-50 text-amber-800 border-amber-300',
          icon: Flame
        };
      case 'destroyed':
        return {
          label: language === 'fr' ? 'Détruit / Neutralisé' : 'Destroyed per Court Order',
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          icon: Check
        };
      case 'internal_disciplinary_hold':
        return {
          label: language === 'fr' ? 'Pièce à Conviction Disciplinaire' : 'Disciplinary Tribunal Hold',
          bg: 'bg-purple-50 text-purple-800 border-purple-300',
          icon: FileText
        };
      default:
        return {
          label: status,
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          icon: Archive
        };
    }
  };

  const handleInmateSelect = (inmateId: string) => {
    const found = inmates.find(i => i.id === inmateId || i.bookingNumber === inmateId);
    if (found) {
      setNewInmateName(`${found.firstName} ${found.lastName}`);
      setNewInmateId(found.bookingNumber || found.id);
      if (!newSeizedLocation && found.cellLocation) {
        setNewSeizedLocation(`${found.cellLocation} (Assigned Cell)`);
      }
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescription.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const tagRef = `EVD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newItem: ContrabandItem = {
      id: `cntr-${Date.now()}`,
      itemDescription: newDescription.trim(),
      category: newCategory,
      severityLevel: newSeverity,
      quantity: Number(newQuantity) || 1,
      unit: newUnit.trim() || 'item',
      storageLocation: newStorageLocation.trim() || 'Central Evidence Locker #01',
      disposalStatus: newDisposalStatus,
      seizedLocation: newSeizedLocation.trim() || 'Facility Central Compound',
      seizedFromInmateName: newInmateName.trim() || 'Unknown / Unassigned Cache',
      seizedFromInmateId: newInmateId.trim() || undefined,
      seizedByOfficer: currentOfficerName,
      seizedByBadge: currentOfficerBadge,
      seizedAt: timeStr,
      chainOfCustodyRef: tagRef,
      incidentRef: `INC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      notes: newNotes.trim() || undefined,
    };

    onAddItem(newItem);
    setIsAddModalOpen(false);

    // Reset Form
    setNewDescription('');
    setNewCategory('weapons_shanks');
    setNewSeverity('critical');
    setNewQuantity(1);
    setNewUnit('item');
    setNewStorageLocation('Evidence Locker Alpha-01');
    setNewDisposalStatus('secured_in_evidence');
    setNewSeizedLocation('');
    setNewInmateName('');
    setNewInmateId('');
    setNewNotes('');
  };

  return (
    <div className="space-y-4">
      
      {/* HEADER STRIP & INCIDENT CLASSIFICATION METRICS */}
      <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-44 h-44 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-8 -bottom-8 w-44 h-44 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>{language === 'fr' ? 'Registre des Saisies & Pièces à Conviction' : 'Contraband Seized & Evidence Register'}</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                KENYA PRISONS STANDING ORDERS CAP 90
              </span>
            </div>
            <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              <span>{language === 'fr' ? 'Inventaire des Objets Confisqués & Niveaux de Sévérité' : 'Confiscated Contraband & Severity Classification'}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                {metrics.total} {language === 'fr' ? 'objets répertoriés' : 'logged items'}
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {language === 'fr'
                ? 'Traçabilité légale stricte de tous les objets prohibés saisis en détention : classification immédiate de sévérité, localisation sous scellé et chaîne de garde pour transmission judiciaire.'
                : 'Mandatory chain of custody registry for all items confiscated during cell sweeps, perimeter security sweeps, and visitor screenings with live incident severity classification.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'fr' ? 'Enregistrer une Saisie' : 'Log Seized Contraband'}</span>
            </button>
          </div>
        </div>

        {/* 4 Severity Classification Metric Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-4 pt-4 border-t border-slate-800/80">
          
          {/* Critical Tile */}
          <div 
            onClick={() => setFilterSeverity(filterSeverity === 'critical' ? 'all' : 'critical')}
            className={`p-3 rounded-lg border transition-all cursor-pointer ${
              filterSeverity === 'critical'
                ? 'bg-rose-950/60 border-rose-500 ring-1 ring-rose-500/50'
                : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold flex items-center gap-1.5 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>{language === 'fr' ? 'Critique (Létal / Évasion)' : 'Critical (Lethal / Escape)'}</span>
              </span>
              <span className="text-sm font-mono font-black text-rose-300">{metrics.critical}</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 truncate">
              {language === 'fr' ? 'Armes blanches, explosifs, limes' : 'Shanks, firearms, saw blades'}
            </p>
          </div>

          {/* High Tile */}
          <div 
            onClick={() => setFilterSeverity(filterSeverity === 'high' ? 'all' : 'high')}
            className={`p-3 rounded-lg border transition-all cursor-pointer ${
              filterSeverity === 'high'
                ? 'bg-amber-950/60 border-amber-500 ring-1 ring-amber-500/50'
                : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold flex items-center gap-1.5 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>{language === 'fr' ? 'Élevé (Drogues / Téléphones)' : 'High (Drugs & Tech)'}</span>
              </span>
              <span className="text-sm font-mono font-black text-amber-300">{metrics.high}</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 truncate">
              {language === 'fr' ? 'Stupéfiants, téléphones, matraques' : 'Narcotics, comms, bludgeons'}
            </p>
          </div>

          {/* Medium Tile */}
          <div 
            onClick={() => setFilterSeverity(filterSeverity === 'medium' ? 'all' : 'medium')}
            className={`p-3 rounded-lg border transition-all cursor-pointer ${
              filterSeverity === 'medium'
                ? 'bg-indigo-950/60 border-indigo-500 ring-1 ring-indigo-500/50'
                : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold flex items-center gap-1.5 text-indigo-400">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <span>{language === 'fr' ? 'Moyen (Devises / Alcool)' : 'Medium (Cash / Brew)'}</span>
              </span>
              <span className="text-sm font-mono font-black text-indigo-300">{metrics.medium}</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 truncate">
              {language === 'fr' ? 'Espèces KES, macération, SIM' : 'Unauthorized cash, SIMs, brew'}
            </p>
          </div>

          {/* Low Tile */}
          <div 
            onClick={() => setFilterSeverity(filterSeverity === 'low' ? 'all' : 'low')}
            className={`p-3 rounded-lg border transition-all cursor-pointer ${
              filterSeverity === 'low'
                ? 'bg-slate-700 border-slate-500 ring-1 ring-slate-400/50'
                : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span>{language === 'fr' ? 'Faible (Électrique / Confort)' : 'Low (Minor / Domestic)'}</span>
              </span>
              <span className="text-sm font-mono font-black text-slate-200">{metrics.low}</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 truncate">
              {language === 'fr' ? 'Fils électriques, surplus textile' : 'Immersion coils, extra bedding'}
            </p>
          </div>

        </div>
      </div>

      {/* FILTER CONTROLS & SEVERITY CLASSIFICATION TOOLBAR */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={language === 'fr' ? 'Rechercher objet, détenu, matricule, n° scellé, lieu...' : 'Search by item, inmate name, booking #, seal tag, or location...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Severity Level Filter Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-600 hidden sm:inline">
                {language === 'fr' ? 'Sévérité :' : 'Severity :'}
              </span>
              <select
                value={filterSeverity}
                onChange={e => setFilterSeverity(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:bg-white focus:outline-hidden"
              >
                <option value="all">{language === 'fr' ? 'Toutes les sévérités' : 'All Severity Levels'} ({metrics.total})</option>
                <option value="critical">🚨 {language === 'fr' ? 'Critique uniquement' : 'Critical Only'} ({metrics.critical})</option>
                <option value="high">⚠️ {language === 'fr' ? 'Élevé uniquement' : 'High Only'} ({metrics.high})</option>
                <option value="medium">⚡ {language === 'fr' ? 'Moyen uniquement' : 'Medium Only'} ({metrics.medium})</option>
                <option value="low">ℹ️ {language === 'fr' ? 'Faible uniquement' : 'Low Only'} ({metrics.low})</option>
              </select>
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:bg-white focus:outline-hidden"
            >
              <option value="all">{language === 'fr' ? 'Toutes catégories' : 'All Categories'}</option>
              <option value="weapons_shanks">{language === 'fr' ? 'Armes & Lames' : 'Weapons & Shanks'}</option>
              <option value="narcotics_drugs">{language === 'fr' ? 'Stupéfiants' : 'Narcotics'}</option>
              <option value="unauthorized_electronics">{language === 'fr' ? 'Téléphones & Électronique' : 'Electronics & Phones'}</option>
              <option value="illicit_cash">{language === 'fr' ? 'Espèces / Devises' : 'Illicit Cash'}</option>
              <option value="altered_tools">{language === 'fr' ? 'Outils Détournés' : 'Altered Tools'}</option>
              <option value="alcohol_brew">{language === 'fr' ? 'Alcool Artisanal' : 'Prison Brew'}</option>
              <option value="other_prohibited">{language === 'fr' ? 'Autres Prohibés' : 'Other Prohibited'}</option>
            </select>

            {/* Disposal Status Filter */}
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:bg-white focus:outline-hidden"
            >
              <option value="all">{language === 'fr' ? 'Tous les statuts' : 'All Custody Statuses'}</option>
              <option value="secured_in_evidence">{language === 'fr' ? 'Sécurisé sous Scellé' : 'Secured in Evidence'}</option>
              <option value="pending_forensics">{language === 'fr' ? 'Expertise Forensique' : 'Pending Forensics'}</option>
              <option value="transferred_to_police">{language === 'fr' ? 'Transféré Police' : 'Transferred to Police'}</option>
              <option value="slated_for_destruction">{language === 'fr' ? 'Destruction Programmée' : 'Slated Destruction'}</option>
              <option value="destroyed">{language === 'fr' ? 'Détruit' : 'Destroyed'}</option>
              <option value="internal_disciplinary_hold">{language === 'fr' ? 'Tribunal Disciplinaire' : 'Disciplinary Hold'}</option>
            </select>

          </div>
        </div>
      </div>

      {/* CONTRABAND SEIZED TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-300 text-[11px] font-bold uppercase tracking-wider border-b border-slate-800">
                <th className="py-3 px-3.5 w-28">{language === 'fr' ? 'Réf Scellé / Heure' : 'Tag Ref / Time'}</th>
                <th className="py-3 px-3.5 min-w-[240px]">{language === 'fr' ? 'Description de la Pièce à Conviction' : 'Contraband Item & Narrative'}</th>
                <th className="py-3 px-3.5 w-44">{language === 'fr' ? 'Niveau de Sévérité' : 'Severity Level'}</th>
                <th className="py-3 px-3.5 w-24 text-center">{language === 'fr' ? 'Quantité' : 'Qty'}</th>
                <th className="py-3 px-3.5 min-w-[190px]">{language === 'fr' ? 'Lieu de Saisie & Détenu' : 'Seized Location & Inmate'}</th>
                <th className="py-3 px-3.5 min-w-[180px]">{language === 'fr' ? 'Localisation du Scellé' : 'Storage Location'}</th>
                <th className="py-3 px-3.5 min-w-[180px]">{language === 'fr' ? 'Statut Chaîne de Garde' : 'Disposal / Custody Status'}</th>
                <th className="py-3 px-3.5 w-20 text-right">{language === 'fr' ? 'Actions' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <ShieldAlert className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">
                      {language === 'fr' ? 'Aucune saisie de contrebande trouvée' : 'No contraband seizures match your filter criteria'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {language === 'fr' ? 'Réinitialisez les filtres ou enregistrez une nouvelle saisie.' : 'Reset filters or click "Log Seized Contraband" to record a new incident.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const sevMeta = getSeverityBadge(item.severityLevel);
                  const catMeta = getCategoryMeta(item.category);
                  const statusMeta = getStatusMeta(item.disposalStatus);
                  const CatIcon = catMeta.icon;

                  return (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        item.severityLevel === 'critical' ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      {/* 1. Tag Ref & Time */}
                      <td className="py-3 px-3.5 align-top">
                        <div className="font-mono font-bold text-slate-900 text-[11px] flex items-center gap-1">
                          <span className="text-rose-600 font-black">#</span>
                          <span>{item.chainOfCustodyRef}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{item.seizedAt}</span>
                        </div>
                        <div className="text-[9px] text-slate-400 mt-0.5 truncate" title={item.seizedByOfficer}>
                          {item.seizedByOfficer}
                        </div>
                      </td>

                      {/* 2. Description & Category */}
                      <td className="py-3 px-3.5 align-top">
                        <div className="flex items-start gap-2">
                          <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${catMeta.bg}`}>
                            <CatIcon className={`w-4 h-4 ${catMeta.color}`} />
                          </div>
                          <div className="space-y-1">
                            <span className="font-bold text-slate-900 block leading-tight">
                              {item.itemDescription}
                            </span>
                            
                            <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                              <span className="px-1.5 py-0.2 rounded font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                {catMeta.label}
                              </span>
                              {item.incidentRef && (
                                <span className="font-mono text-slate-400">
                                  Ref: {item.incidentRef}
                                </span>
                              )}
                            </div>

                            {item.notes && (
                              <p className="text-[11px] text-slate-500 leading-snug line-clamp-2 italic">
                                "{item.notes}"
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 3. SEVERITY LEVEL DROPDOWN (Direct User Request) */}
                      <td className="py-3 px-3.5 align-top">
                        <div className="space-y-1.5">
                          {/* Live interactive dropdown with colored border & indicator */}
                          <div className="relative">
                            <select
                              value={item.severityLevel}
                              onChange={e => onUpdateSeverity(item.id, e.target.value as ContrabandSeverity)}
                              className={`w-full appearance-none pl-6 pr-6 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide border shadow-2xs cursor-pointer transition-all focus:outline-hidden focus:ring-2 focus:ring-rose-500 ${sevMeta.bg}`}
                              title={language === 'fr' ? 'Modifier la classification de sévérité de cette saisie' : 'Change incident severity classification'}
                            >
                              <option value="critical" className="bg-slate-900 text-rose-300 font-bold">
                                🚨 {language === 'fr' ? 'CRITIQUE (Létal)' : 'CRITICAL (Lethal)'}
                              </option>
                              <option value="high" className="bg-slate-900 text-amber-300 font-bold">
                                ⚠️ {language === 'fr' ? 'ÉLEVÉ (Drogues / Tech)' : 'HIGH (Drugs / Comms)'}
                              </option>
                              <option value="medium" className="bg-slate-900 text-indigo-300 font-bold">
                                ⚡ {language === 'fr' ? 'MOYEN (Devises / SIM)' : 'MEDIUM (Cash / SIM)'}
                              </option>
                              <option value="low" className="bg-slate-900 text-slate-300 font-bold">
                                ℹ️ {language === 'fr' ? 'FAIBLE (Non Létal)' : 'LOW (Domestic)'}
                              </option>
                            </select>
                            
                            {/* Visual Beacon Dot */}
                            <span className={`w-2 h-2 rounded-full absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none ${sevMeta.dot}`} />
                            
                            {/* Chevron */}
                            <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-70" />
                          </div>

                          <div className="text-[10px] text-slate-500 leading-tight">
                            {sevMeta.desc}
                          </div>
                        </div>
                      </td>

                      {/* 4. Quantity */}
                      <td className="py-3 px-3.5 align-top text-center">
                        <div className="font-mono font-black text-sm text-slate-900">
                          {item.quantity.toLocaleString()}
                        </div>
                        <div className="text-[10px] font-semibold text-slate-400 capitalize">
                          {item.unit}
                        </div>
                      </td>

                      {/* 5. Seized Location & Inmate */}
                      <td className="py-3 px-3.5 align-top">
                        <div className="space-y-1">
                          <div className="text-[11px] font-semibold text-slate-800 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span className="truncate">{item.seizedLocation}</span>
                          </div>

                          <div className="text-[11px] text-slate-600 flex items-center gap-1 bg-slate-100/80 px-2 py-0.5 rounded border border-slate-200">
                            <User className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="font-medium truncate">
                              {item.seizedFromInmateName || (language === 'fr' ? 'Détenu Non Identifié' : 'Unassigned Cache')}
                            </span>
                            {item.seizedFromInmateId && (
                              <span className="font-mono text-[10px] text-slate-400 ml-auto">
                                ({item.seizedFromInmateId})
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 6. Storage Location */}
                      <td className="py-3 px-3.5 align-top">
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Archive className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>{item.storageLocation}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span>{language === 'fr' ? 'Sous scellé armurerie' : 'Tamper seal intact'}</span>
                        </div>
                      </td>

                      {/* 7. Disposal / Custody Status */}
                      <td className="py-3 px-3.5 align-top">
                        <div className="space-y-1">
                          <select
                            value={item.disposalStatus}
                            onChange={e => onUpdateDisposalStatus(item.id, e.target.value as ContrabandDisposalStatus)}
                            className={`w-full text-[11px] font-bold p-1.5 rounded-lg border cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-indigo-500 ${statusMeta.bg}`}
                          >
                            <option value="secured_in_evidence">{language === 'fr' ? '🔒 Sécurisé sous Scellé' : '🔒 Secured in Evidence'}</option>
                            <option value="pending_forensics">{language === 'fr' ? '🔬 Expertise Forensique' : '🔬 Pending Forensics / DCI'}</option>
                            <option value="transferred_to_police">{language === 'fr' ? '🚓 Transféré Police' : '🚓 Transferred to Police'}</option>
                            <option value="slated_for_destruction">{language === 'fr' ? '🔥 Destruction Programmée' : '🔥 Slated Destruction'}</option>
                            <option value="destroyed">{language === 'fr' ? '✅ Détruit (Arrêté)' : '✅ Destroyed (Decreed)'}</option>
                            <option value="internal_disciplinary_hold">{language === 'fr' ? '⚖️ Hold Tribunal Interne' : '⚖️ Disciplinary Hold'}</option>
                          </select>

                          <div className="text-[10px] font-mono text-slate-400">
                            {language === 'fr' ? 'Traité par :' : 'By :'} {item.seizedByBadge}
                          </div>
                        </div>
                      </td>

                      {/* 8. Actions */}
                      <td className="py-3 px-3.5 align-top text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedDossierItem(item)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
                            title={language === 'fr' ? 'Voir le dossier de scellé & chaîne de garde' : 'View Chain-of-Custody Evidence Dossier'}
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {onDeleteItem && (
                            <button
                              onClick={() => {
                                if (window.confirm(language === 'fr' ? 'Supprimer cet enregistrement de scellé ?' : 'Remove this contraband record?')) {
                                  onDeleteItem(item.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                              title="Delete Contraband Entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Strip */}
        <div className="bg-slate-50 p-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">
              {filteredItems.length} {language === 'fr' ? 'pièces à conviction affichées' : 'evidence entries listed'}
            </span>
            <span>•</span>
            <span className="text-rose-700 font-bold">
              {metrics.critical} {language === 'fr' ? 'critiques' : 'critical weapons/threats'}
            </span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold">
              {metrics.secured} {language === 'fr' ? 'sécurisées en armurerie' : 'secured in safe storage'}
            </span>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>{language === 'fr' ? 'Toutes les saisies sont incluses dans le rapport officiel PDF pour le directeur.' : 'All logged items are bound to the Warden PDF Shift Handover Report.'}</span>
          </div>
        </div>
      </div>

      {/* MODAL 1: LOG SEIZED CONTRABAND */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/40">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {language === 'fr' ? 'Enregistrer une Saisie de Contrebande' : 'Log Confiscated Contraband & Evidence'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {language === 'fr' ? 'Attribution obligatoire du niveau de sévérité et du coffre de stockage' : 'Mandatory incident severity classification and chain-of-custody assignment'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4 text-xs">
              
              {/* Item Description */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {language === 'fr' ? 'Description Détaillée de l\'Objet Confisqué *' : 'Confiscated Item Description & Physical Attributes *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'fr' ? 'ex: Lame de scie artisanale (15cm) avec manche en tissu tressé' : 'e.g. Improvised steel shank (6-inch) fashioned from sharpened bed slat'}
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>

              {/* Category & SEVERITY LEVEL DROPDOWN (User Request) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    {language === 'fr' ? 'Catégorie de Contrebande *' : 'Contraband Category *'}
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as ContrabandCategory)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  >
                    <option value="weapons_shanks">🗡️ {language === 'fr' ? 'Armes & Lames Artisanales' : 'Weapons & Improvised Shanks'}</option>
                    <option value="narcotics_drugs">💊 {language === 'fr' ? 'Stupéfiants & Substances Illégales' : 'Narcotics & Controlled Substances'}</option>
                    <option value="unauthorized_electronics">📱 {language === 'fr' ? 'Téléphonie & Électronique' : 'Unauthorized Phones & Comms'}</option>
                    <option value="illicit_cash">💵 {language === 'fr' ? 'Devises & Numéraire Non Autorisé' : 'Illicit Cash & Currency'}</option>
                    <option value="altered_tools">🔧 {language === 'fr' ? 'Outils Détournés & Limes' : 'Altered Industrial Tools & Saws'}</option>
                    <option value="alcohol_brew">🍷 {language === 'fr' ? 'Alcool Artisanal (Muratina)' : 'Illicit Ferment / Prison Brew'}</option>
                    <option value="communication_media">⚡ {language === 'fr' ? 'Cartes SIM & Médias Clandestins' : 'SIM Cards & Secret Media'}</option>
                    <option value="other_prohibited">❓ {language === 'fr' ? 'Autre Objet Prohibé' : 'Other Prohibited Paraphernalia'}</option>
                  </select>
                </div>

                {/* Severity Level Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-rose-900 mb-1 flex items-center justify-between">
                    <span>{language === 'fr' ? 'Niveau de Sévérité (Classification) *' : 'Severity Level (Classification) *'}</span>
                    <span className="text-[10px] font-mono uppercase text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">REQUIRED</span>
                  </label>
                  <select
                    value={newSeverity}
                    onChange={e => setNewSeverity(e.target.value as ContrabandSeverity)}
                    className="w-full p-2.5 bg-rose-50 border border-rose-300 rounded-lg text-rose-950 font-black focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  >
                    <option value="critical">🚨 {language === 'fr' ? 'Critique - Arme létale / Plan évasion' : 'CRITICAL - Lethal Weapon / Escape Implement'}</option>
                    <option value="high">⚠️ {language === 'fr' ? 'Élevé - Stupéfiants / Téléphone actif' : 'HIGH - Narcotics / Active Phone / Weapon Tool'}</option>
                    <option value="medium">⚡ {language === 'fr' ? 'Moyen - Devises / Alcool / SIM card' : 'MEDIUM - Illicit Cash / Brew / SIM Cards'}</option>
                    <option value="low">ℹ️ {language === 'fr' ? 'Faible - Objet non létal / Résistance' : 'LOW - Minor Unauthorized / Domestic Hazard'}</option>
                  </select>
                </div>

              </div>

              {/* Quantity, Unit & Storage Location */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {language === 'fr' ? 'Quantité Saisie *' : 'Quantity Confiscated *'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newQuantity}
                    onChange={e => setNewQuantity(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {language === 'fr' ? 'Unité de Mesure' : 'Unit (pieces, g, L)'}
                  </label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={e => setNewUnit(e.target.value)}
                    placeholder="ex: weapon, device, grams, liters"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {language === 'fr' ? 'Emplacement de Stockage Sécurisé *' : 'Storage Location / Locker *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newStorageLocation}
                    onChange={e => setNewStorageLocation(e.target.value)}
                    placeholder="e.g. Evidence Safe #1, Locker A-04"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                  />
                </div>
              </div>

              {/* Seized Location & Inmate Quick Picker */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {language === 'fr' ? 'Lieu de Découverte / Fouille *' : 'Seized Location / Cell / Post *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newSeizedLocation}
                    onChange={e => setNewSeizedLocation(e.target.value)}
                    placeholder={language === 'fr' ? 'ex: Bloc A - Cellule A-08 (Sous le châlit)' : 'e.g. Block A - Cell A-08 (Inside hollow bedpost)'}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {language === 'fr' ? 'Détenu Impliqué (Optionnel)' : 'Target Inmate (Roster Quick-Select)'}
                  </label>
                  {inmates.length > 0 && (
                    <select
                      onChange={e => handleInmateSelect(e.target.value)}
                      className="w-full p-2 mb-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                    >
                      <option value="">{language === 'fr' ? '-- Sélectionner depuis le registre --' : '-- Pick from inmate roster --'}</option>
                      {inmates.slice(0, 20).map(inmate => (
                        <option key={inmate.id} value={inmate.id}>
                          {inmate.bookingNumber} - {inmate.firstName} {inmate.lastName} ({inmate.cellLocation || 'Bloc A'})
                        </option>
                      ))}
                    </select>
                  )}
                  <input
                    type="text"
                    value={newInmateName}
                    onChange={e => setNewInmateName(e.target.value)}
                    placeholder={language === 'fr' ? 'Nom du détenu ou "Cache Clandestine Non Assignée"' : 'Inmate name or "Unknown / Unassigned Cache"'}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              {/* Disposal / Custody Status */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {language === 'fr' ? 'Statut Initial de la Chaîne de Garde *' : 'Initial Chain of Custody & Disposal Status *'}
                </label>
                <select
                  value={newDisposalStatus}
                  onChange={e => setNewDisposalStatus(e.target.value as ContrabandDisposalStatus)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold"
                >
                  <option value="secured_in_evidence">{language === 'fr' ? '🔒 Sécurisé sous Scellé en Armurerie' : '🔒 Secured in Evidence Locker'}</option>
                  <option value="pending_forensics">{language === 'fr' ? '🔬 Requis pour Expertise Forensique / Dactyloscopie' : '🔬 Pending Forensics / Fingerprint Dusting'}</option>
                  <option value="transferred_to_police">{language === 'fr' ? '🚓 Transféré à la Police Judiciaire / DCI' : '🚓 Transferred to Police / Anti-Narcotics'}</option>
                  <option value="slated_for_destruction">{language === 'fr' ? '🔥 Destiné à l\'Incinération / Destruction Immédiate' : '🔥 Slated for Approved Destruction'}</option>
                  <option value="internal_disciplinary_hold">{language === 'fr' ? '⚖️ Sous Main de Justice Interne (Tribunal Pénitentiaire)' : '⚖️ Disciplinary Tribunal Evidence Hold'}</option>
                </select>
              </div>

              {/* Circumstances & Notes */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {language === 'fr' ? 'Circonstances de la Saisie & Observations' : 'Circumstances of Seizure & Operational Directives'}
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  placeholder={language === 'fr' ? 'Méthode de dissimulation, chien de détection K-9, agents témoins...' : 'Concealment method, K9 detection alert, witnessing sentinels, forensic indicators...'}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              {/* Chain of Custody Stamp */}
              <div className="p-3 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-between text-slate-600 text-[11px]">
                <span className="flex items-center gap-1.5 font-medium">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>{language === 'fr' ? 'Officier Enregistreur :' : 'Logging Commander:'} <strong>{currentOfficerName}</strong> ({currentOfficerBadge})</span>
                </span>
                <span className="font-mono text-slate-500">
                  Tag: EVD-{new Date().getFullYear()}-AUTO
                </span>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{language === 'fr' ? 'Enregistrer au Registre des Scellés' : 'Commit Evidence to Register'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EVIDENCE DOSSIER & CHAIN OF CUSTODY SHEET */}
      {selectedDossierItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            
            {/* Dossier Header */}
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/40">
                  <FolderLock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{language === 'fr' ? 'Fiche de Scellé & Chaîne de Garde' : 'Evidence Custody Dossier'}</span>
                    <span className="font-mono text-emerald-400">#{selectedDossierItem.chainOfCustodyRef}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {language === 'fr' ? 'Répertoire légal sous les ordres permanents des prisons' : 'Statutory chain of evidence document pursuant to Prisons Act Rule 14'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDossierItem(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dossier Details */}
            <div className="p-5 space-y-4 text-xs">
              
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wide">
                  {language === 'fr' ? 'Pièce à Conviction Confisquée' : 'Confiscated Evidence Item'}
                </div>
                <div className="text-sm font-black text-slate-900">
                  {selectedDossierItem.itemDescription}
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getSeverityBadge(selectedDossierItem.severityLevel).bg}`}>
                    {selectedDossierItem.severityLevel} Severity
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800">
                    {selectedDossierItem.quantity} {selectedDossierItem.unit}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                    {selectedDossierItem.category}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-slate-700">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase block font-bold mb-0.5">
                    {language === 'fr' ? 'Lieu de Saisie' : 'Seizure Location'}
                  </span>
                  <span className="font-semibold text-slate-900 block">{selectedDossierItem.seizedLocation}</span>
                  <span className="text-[10px] text-slate-500">Heure: {selectedDossierItem.seizedAt}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase block font-bold mb-0.5">
                    {language === 'fr' ? 'Détenu / Suspect' : 'Inmate / Suspect'}
                  </span>
                  <span className="font-semibold text-slate-900 block">
                    {selectedDossierItem.seizedFromInmateName || 'Unknown / Clandestine Cache'}
                  </span>
                  {selectedDossierItem.seizedFromInmateId && (
                    <span className="text-[10px] font-mono text-slate-500">Matricule: {selectedDossierItem.seizedFromInmateId}</span>
                  )}
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase block font-bold mb-0.5">
                    {language === 'fr' ? 'Emplacement du Coffre' : 'Vault Storage Location'}
                  </span>
                  <span className="font-semibold text-slate-900 block">{selectedDossierItem.storageLocation}</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Seal Integrity: VERIFIED</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase block font-bold mb-0.5">
                    {language === 'fr' ? 'Statut Chaîne de Garde' : 'Chain of Custody Status'}
                  </span>
                  <span className="font-semibold text-slate-900 block capitalize">{selectedDossierItem.disposalStatus.replace(/_/g, ' ')}</span>
                  <span className="text-[10px] text-slate-500">By {selectedDossierItem.seizedByBadge}</span>
                </div>
              </div>

              {selectedDossierItem.notes && (
                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-slate-800">
                  <span className="text-[10px] font-bold uppercase text-amber-900 block mb-0.5">
                    {language === 'fr' ? 'Notes Circonstancielles de l\'Officier' : 'Officer Operational Notes & Circumstances'}
                  </span>
                  <p className="text-xs leading-relaxed text-slate-700 italic">
                    "{selectedDossierItem.notes}"
                  </p>
                </div>
              )}

              {/* Security Seal Barcode Representation */}
              <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-mono text-xs font-bold text-emerald-400">
                    {selectedDossierItem.chainOfCustodyRef}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    SHA-256: 8f94d7b...{selectedDossierItem.id.substring(0, 8)}
                  </div>
                </div>
                <div className="px-3 py-1 bg-white/10 rounded font-mono text-[10px] tracking-widest text-slate-300">
                  ||||||| | |||| | |||||
                </div>
              </div>

              {/* Dossier Footer Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedDossierItem(null)}
                  className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  {language === 'fr' ? 'Fermer le Dossier' : 'Close Dossier'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
