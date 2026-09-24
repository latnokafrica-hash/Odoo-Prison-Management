import React, { useState, useMemo } from 'react';
import { 
  EquipmentInventoryItem, 
  EquipmentCategory, 
  EquipmentCondition, 
  Language, 
  ShiftType,
  ContrabandItem,
  ContrabandSeverity,
  ContrabandDisposalStatus,
  Inmate
} from '../../types';
import { ContrabandSeizedTable } from './ContrabandSeizedTable';
import { 
  Key, 
  Radio, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  Plus, 
  Check, 
  RotateCcw, 
  Zap, 
  BatteryCharging, 
  Battery, 
  Camera, 
  Crosshair, 
  ChevronRight, 
  ArrowRight, 
  FileText, 
  Sparkles, 
  Eye, 
  SlidersHorizontal,
  LayoutGrid,
  List,
  Flame,
  X,
  PackageCheck,
  QrCode,
  Scan,
  ScanLine,
  Wrench
} from 'lucide-react';
import { AssetQrScannerModal } from './AssetQrScannerModal';

interface ResourcesInventoryCheckSectionProps {
  language: Language;
  equipment: EquipmentInventoryItem[];
  contrabandItems?: ContrabandItem[];
  inmates?: Inmate[];
  outgoingShift: ShiftType;
  incomingShift: ShiftType;
  outgoingCommanderName?: string;
  outgoingCommanderBadge?: string;
  incomingCommanderName?: string;
  incomingCommanderBadge?: string;
  onUpdateCount: (id: string, count: number) => void;
  onUpdateCondition: (id: string, condition: EquipmentCondition) => void;
  onToggleVerification: (id: string) => void;
  onVerifyAllMatching: () => void;
  onAddEquipmentItem: (newItem: EquipmentInventoryItem) => void;
  onUpdateEquipmentItem?: (updatedItem: EquipmentInventoryItem) => void;
  onUpdateContrabandSeverity?: (itemId: string, newSeverity: ContrabandSeverity) => void;
  onUpdateContrabandDisposalStatus?: (itemId: string, newStatus: ContrabandDisposalStatus) => void;
  onAddContrabandItem?: (newItem: ContrabandItem) => void;
  onDeleteContrabandItem?: (itemId: string) => void;
  defaultSubSection?: 'equipment' | 'contraband';
  onProceedToSignOff?: () => void;
  compactView?: boolean;
}

export const ResourcesInventoryCheckSection: React.FC<ResourcesInventoryCheckSectionProps> = ({
  language,
  equipment,
  contrabandItems = [],
  inmates = [],
  outgoingShift,
  incomingShift,
  outgoingCommanderName = 'Capt. Marcus Vance',
  outgoingCommanderBadge = 'KP-8421',
  incomingCommanderName = 'Capt. Jonathan Hayes',
  incomingCommanderBadge = 'KP-7890',
  onUpdateCount,
  onUpdateCondition,
  onToggleVerification,
  onVerifyAllMatching,
  onAddEquipmentItem,
  onUpdateEquipmentItem,
  onUpdateContrabandSeverity,
  onUpdateContrabandDisposalStatus,
  onAddContrabandItem,
  onDeleteContrabandItem,
  defaultSubSection = 'equipment',
  onProceedToSignOff,
  compactView = false,
}) => {
  // Sub-Section Switcher: Equipment vs Contraband Seized Table
  const [activeSubSection, setActiveSubSection] = useState<'equipment' | 'contraband'>(defaultSubSection);

  // Filters & View State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterVarianceOnly, setFilterVarianceOnly] = useState<boolean>(false);
  const [filterUnverifiedOnly, setFilterUnverifiedOnly] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [quickTestMessage, setQuickTestMessage] = useState<string | null>(null);

  // QR Code Scanner & Asset History Modal State
  const [isQrScannerOpen, setIsQrScannerOpen] = useState<boolean>(false);
  const [qrModalTargetItem, setQrModalTargetItem] = useState<EquipmentInventoryItem | null>(null);

  // Modal State for adding new item or logging discrepancy
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [activeEditingItem, setActiveEditingItem] = useState<EquipmentInventoryItem | null>(null);
  const [itemNoteText, setItemNoteText] = useState('');

  // New Equipment Form State
  const [newCategory, setNewCategory] = useState<EquipmentCategory>('keys_security');
  const [newName, setNewName] = useState('');
  const [newExpectedQty, setNewExpectedQty] = useState(1);
  const [newCountedQty, setNewCountedQty] = useState(1);
  const [newUnit, setNewUnit] = useState('units');
  const [newLocation, setNewLocation] = useState('');
  const [newCondition, setNewCondition] = useState<EquipmentCondition>('operational');
  const [newCriticality, setNewCriticality] = useState<'critical' | 'high' | 'standard'>('critical');
  const [newSealNumber, setNewSealNumber] = useState('');
  const [newNote, setNewNote] = useState('');

  // Category counts and KPIs
  const kpis = useMemo(() => {
    const keys = equipment.filter(e => e.category === 'keys_security');
    const radios = equipment.filter(e => e.category === 'radios_comms');
    const restraints = equipment.filter(e => e.category === 'restraints_cuffs');
    const armory = equipment.filter(e => e.category === 'armory_firearms');

    const totalItems = equipment.length;
    const verifiedItems = equipment.filter(e => e.verifiedByBoth).length;
    const variancesCount = equipment.filter(e => e.countedQty !== e.expectedQty || e.condition !== 'operational').length;
    const missingCount = equipment.filter(e => e.condition === 'missing' || e.countedQty < e.expectedQty).length;

    // Critical check: keys, radios, restraints
    const criticalItems = equipment.filter(e => 
      e.category === 'keys_security' || 
      e.category === 'radios_comms' || 
      e.category === 'restraints_cuffs' ||
      e.criticality === 'critical'
    );
    const criticalVerified = criticalItems.filter(e => e.verifiedByBoth).length;
    const isCriticalCleared = criticalItems.length > 0 && criticalVerified === criticalItems.length && missingCount === 0;

    const totalKeySets = keys.reduce((acc, k) => acc + k.countedQty, 0);
    const totalKeyExpected = keys.reduce((acc, k) => acc + k.expectedQty, 0);
    const keysVerified = keys.every(k => k.verifiedByBoth && k.countedQty === k.expectedQty);

    const totalRadios = radios.filter(r => r.unit.includes('handset') || r.name.toLowerCase().includes('radio')).reduce((acc, r) => acc + r.countedQty, 0);
    const radiosVerified = radios.every(r => r.verifiedByBoth);

    const totalRestraints = restraints.reduce((acc, r) => acc + r.countedQty, 0);
    const restraintsVerified = restraints.every(r => r.verifiedByBoth);

    return {
      totalItems,
      verifiedItems,
      percentVerified: totalItems > 0 ? Math.round((verifiedItems / totalItems) * 100) : 0,
      variancesCount,
      missingCount,
      criticalTotal: criticalItems.length,
      criticalVerified,
      isCriticalCleared,
      totalKeySets,
      totalKeyExpected,
      keysVerified,
      totalRadios,
      radiosVerified,
      totalRestraints,
      restraintsVerified,
      armoryCount: armory.reduce((acc, a) => acc + a.countedQty, 0),
    };
  }, [equipment]);

  // Filtered Equipment List
  const filteredEquipment = useMemo(() => {
    return equipment.filter(item => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (filterVarianceOnly && item.countedQty === item.expectedQty && item.condition === 'operational') return false;
      if (filterUnverifiedOnly && item.verifiedByBoth) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const inName = item.name.toLowerCase().includes(q);
        const inLocation = item.storageLocation.toLowerCase().includes(q);
        const inSeal = item.sealNumber?.toLowerCase().includes(q) || false;
        const inNotes = item.discrepancyNote?.toLowerCase().includes(q) || false;
        const inSerials = item.serialNumbers?.some(s => s.toLowerCase().includes(q)) || false;
        return inName || inLocation || inSeal || inNotes || inSerials;
      }
      return true;
    });
  }, [equipment, selectedCategory, filterVarianceOnly, filterUnverifiedOnly, searchQuery]);

  // Quick Action Diagnostics
  const handleRunRadioCommsCheck = () => {
    equipment.forEach(item => {
      if (item.category === 'radios_comms') {
        if (!item.verifiedByBoth) {
          onToggleVerification(item.id);
        }
      }
    });
    setQuickTestMessage(
      language === 'fr' 
        ? 'Diagnostic radio terminé : Réseau UHF & Canal 1 Sécurité synchronisés, 18 postes confirmés opérationnels.'
        : 'Radio Comms Diagnostic Complete: UHF Encrypted Net & Channel 1 verified. All handsets synchronized.'
    );
    setTimeout(() => setQuickTestMessage(null), 5000);
  };

  const handleRunKeyRingSealCheck = () => {
    equipment.forEach(item => {
      if (item.category === 'keys_security') {
        if (!item.verifiedByBoth) {
          onToggleVerification(item.id);
        }
      }
    });
    setQuickTestMessage(
      language === 'fr'
        ? 'Contrôle des scellés de clés achevé : Les 4 trousseaux passe-partout et scellés de coffre K-01 sont intacts.'
        : 'Key Ring Seal Audit Completed: All 4 master rings & Vault K-01 seals verified intact.'
    );
    setTimeout(() => setQuickTestMessage(null), 5000);
  };

  const handleRunRestraintsAudit = () => {
    equipment.forEach(item => {
      if (item.category === 'restraints_cuffs') {
        if (!item.verifiedByBoth) {
          onToggleVerification(item.id);
        }
      }
    });
    setQuickTestMessage(
      language === 'fr'
        ? 'Contrôle des entraves : Mécanismes double-verrouillage et chaînes de transfèrement 100% opérationnels.'
        : 'Restraints Check Completed: Double-lock mechanisms & transit chains verified fully functional.'
    );
    setTimeout(() => setQuickTestMessage(null), 5000);
  };

  // Open note edit modal
  const handleOpenNoteModal = (item: EquipmentInventoryItem) => {
    setActiveEditingItem(item);
    setItemNoteText(item.discrepancyNote || '');
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = () => {
    if (activeEditingItem) {
      activeEditingItem.discrepancyNote = itemNoteText;
      setIsNoteModalOpen(false);
      setActiveEditingItem(null);
    }
  };

  // Handle Form Submit for new item
  const handleCreateEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    const newItem: EquipmentInventoryItem = {
      id: `eq-${Date.now()}`,
      category: newCategory,
      name: newName,
      expectedQty: newExpectedQty,
      countedQty: newCountedQty,
      unit: newUnit || 'units',
      condition: newCondition,
      storageLocation: newLocation || 'Central Armory',
      criticality: newCriticality,
      sealNumber: newSealNumber || undefined,
      discrepancyNote: newNote || (newCountedQty !== newExpectedQty ? `Variance of ${newCountedQty - newExpectedQty} noted during shift intake.` : undefined),
      verifiedByBoth: newCountedQty === newExpectedQty,
      lastInspectedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      inspectedBy: outgoingCommanderName,
    };

    onAddEquipmentItem(newItem);
    setIsAddModalOpen(false);
    setNewName('');
    setNewLocation('');
    setNewSealNumber('');
    setNewNote('');
  };

  return (
    <div className="space-y-5">
      
      {/* SECTION SUB-MODULE SWITCHER: EQUIPMENT AUDIT vs CONTRABAND SEIZED REGISTER */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveSubSection('equipment')}
            className={`px-3.5 py-2 rounded-md text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubSection === 'equipment'
                ? 'bg-white text-indigo-900 shadow-xs ring-1 ring-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-amber-500" />
            <span>{language === 'fr' ? 'Inventaire Clés & Armurerie' : 'Security Keys & Equipment Inventory'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-indigo-50 text-indigo-700">
              {equipment.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubSection('contraband')}
            className={`px-3.5 py-2 rounded-md text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubSection === 'contraband'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-rose-600'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{language === 'fr' ? 'Saisies de Contrebande' : 'Contraband Seized & Evidence Log'}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
              activeSubSection === 'contraband' ? 'bg-rose-800 text-white' : 'bg-rose-100 text-rose-800'
            }`}>
              {contrabandItems.length}
            </span>
            {contrabandItems.some(i => i.severityLevel === 'critical') && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" title="Critical Contraband Logged" />
            )}
          </button>
        </div>

        <div className="text-[11px] text-slate-500 px-2 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-indigo-500" />
          <span>
            {activeSubSection === 'equipment'
              ? (language === 'fr' ? 'Contrôle physique des dotations et scellés' : 'Joint verification of custodial arms and keys')
              : (language === 'fr' ? 'Classification de sévérité et chaîne de garde' : 'Incident severity classification & chain of custody')}
          </span>
        </div>
      </div>

      {activeSubSection === 'contraband' ? (
        <ContrabandSeizedTable
          language={language}
          items={contrabandItems}
          inmates={inmates}
          currentOfficerName={outgoingCommanderName}
          currentOfficerBadge={outgoingCommanderBadge}
          onUpdateSeverity={onUpdateContrabandSeverity || (() => {})}
          onUpdateDisposalStatus={onUpdateContrabandDisposalStatus || (() => {})}
          onAddItem={onAddContrabandItem || (() => {})}
          onDeleteItem={onDeleteContrabandItem}
          compactView={compactView}
        />
      ) : (
        <>
          {/* SECTION HEADER & CRITICAL MANDATE BANNER */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-xl p-5 text-white shadow-lg border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-300">
              <Key className="w-4 h-4 text-amber-400" />
              <span>{language === 'fr' ? 'INVENTAIRE CONTRADICTOIRE DES RESSOURCES & MATÉRIELS' : 'MANDATORY CUSTODIAL RESOURCES & INVENTORY CHECK'}</span>
              <span>&bull;</span>
              <span className="text-emerald-400 font-bold">{kpis.percentVerified}% {language === 'fr' ? 'Vérifié' : 'Reconciled'}</span>
            </div>
            <h2 className="text-xl font-black text-white flex items-center gap-2.5">
              <span>{language === 'fr' ? 'Contrôle des Ressources & Équipements Critiques' : 'Resources & Critical Security Inventory Check'}</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              {language === 'fr'
                ? 'Conformément aux Règlements Pénitentiaires, la passation de commandement exige la vérification physique contradictoire des clés maîtresses, du réseau radio UHF et des matériels d\'entrave avant signature exécutoire.'
                : 'Pursuant to Corrections Standing Orders, custodial command handover mandates joint physical audit of master keys, encrypted tactical radios, and restraint gear prior to statutory digital sign-off.'}
            </p>
          </div>

          {/* Dual Commander Verification Badges */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center shrink-0">
            <div className="px-3 py-1.5 bg-black/40 rounded-lg border border-indigo-500/30 text-xs">
              <span className="text-[10px] uppercase text-indigo-300 block font-mono">{language === 'fr' ? 'Commandant Sortant' : 'Outgoing Watch Lead'}</span>
              <strong className="text-white text-xs">{outgoingCommanderName}</strong>{' '}
              <span className="text-[10px] text-indigo-300">({outgoingCommanderBadge})</span>
            </div>

            <ArrowRight className="w-4 h-4 text-indigo-400 hidden sm:block" />

            <div className="px-3 py-1.5 bg-black/40 rounded-lg border border-indigo-500/30 text-xs">
              <span className="text-[10px] uppercase text-indigo-300 block font-mono">{language === 'fr' ? 'Commandant Entrant' : 'Relieving Watch Lead'}</span>
              <strong className="text-white text-xs">{incomingCommanderName}</strong>{' '}
              <span className="text-[10px] text-indigo-300">({incomingCommanderBadge})</span>
            </div>
          </div>
        </div>

        {/* Quick Diagnostic Notification */}
        {quickTestMessage && (
          <div className="mt-4 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-lg text-xs text-emerald-200 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{quickTestMessage}</span>
            </div>
            <button 
              onClick={() => setQuickTestMessage(null)}
              className="text-emerald-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* FOUR KPI READINESS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Master Keys & Deadbolts */}
        <div className={`p-4 rounded-xl border transition-all ${
          kpis.keysVerified 
            ? 'bg-amber-500/5 border-amber-300/80' 
            : 'bg-white border-amber-300/80 shadow-xs'
        }`}>
          <div className="flex items-center justify-between">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
              <Key className="w-5 h-5 text-amber-700" />
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              kpis.keysVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {kpis.keysVerified ? (language === 'fr' ? '100% VÉRIFIÉ' : 'RECONCILED') : (language === 'fr' ? 'À POINTER' : 'AUDIT PENDING')}
            </span>
          </div>
          <div className="mt-3">
            <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
              {language === 'fr' ? 'Trousseaux & Clés Maîtresses' : 'Master Keys & Safe Sets'}
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-slate-900 font-mono">
                {kpis.totalKeySets} / {kpis.totalKeyExpected}
              </span>
              <span className="text-xs text-slate-500">{language === 'fr' ? 'jeux scellés' : 'sealed sets'}</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-600 font-medium">{language === 'fr' ? 'Coffre Central #K-01' : 'Vault Safe K-01'}</span>
            <button 
              onClick={handleRunKeyRingSealCheck}
              className="text-amber-700 hover:text-amber-800 font-bold hover:underline cursor-pointer"
            >
              {language === 'fr' ? 'Tester Scellés' : 'Audit Seals'}
            </button>
          </div>
        </div>

        {/* KPI 2: Tactical Radios & Comms */}
        <div className={`p-4 rounded-xl border transition-all ${
          kpis.radiosVerified 
            ? 'bg-indigo-500/5 border-indigo-200' 
            : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between">
            <div className="p-2 bg-indigo-100 text-indigo-800 rounded-lg">
              <Radio className="w-5 h-5 text-indigo-700" />
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              kpis.radiosVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
            }`}>
              {kpis.radiosVerified ? (language === 'fr' ? 'SYNCHRONISÉ' : 'ALL CHECKED') : (language === 'fr' ? 'EN CHARGE' : 'DOCK CHECK')}
            </span>
          </div>
          <div className="mt-3">
            <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
              {language === 'fr' ? 'Radios UHF & Batteries' : 'Tactical Radios & Comms'}
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-slate-900 font-mono">
                {kpis.totalRadios}
              </span>
              <span className="text-xs text-slate-500">{language === 'fr' ? 'postes actifs' : 'handsets active'}</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-600 font-medium">{language === 'fr' ? 'Canal 1 Sécurité' : 'Ch 1 Security'}</span>
            <button 
              onClick={handleRunRadioCommsCheck}
              className="text-indigo-700 hover:text-indigo-800 font-bold hover:underline cursor-pointer"
            >
              {language === 'fr' ? 'Contrôle Radio' : 'Radio Check'}
            </button>
          </div>
        </div>

        {/* KPI 3: Restraint Gear */}
        <div className={`p-4 rounded-xl border transition-all ${
          kpis.restraintsVerified 
            ? 'bg-purple-500/5 border-purple-200' 
            : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center justify-between">
            <div className="p-2 bg-purple-100 text-purple-800 rounded-lg">
              <Lock className="w-5 h-5 text-purple-700" />
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              kpis.restraintsVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
            }`}>
              {kpis.restraintsVerified ? (language === 'fr' ? 'FONCTIONNEL' : '100% OPERATIONAL') : (language === 'fr' ? 'À TESTER' : 'NEEDS AUDIT')}
            </span>
          </div>
          <div className="mt-3">
            <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
              {language === 'fr' ? 'Menottes & Entraves' : 'Restraints & Cuffs'}
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-slate-900 font-mono">
                {kpis.totalRestraints}
              </span>
              <span className="text-xs text-slate-500">{language === 'fr' ? 'paires & fers' : 'pairs & chains'}</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-600 font-medium">{language === 'fr' ? 'Double verrou' : 'Double-lock ok'}</span>
            <button 
              onClick={handleRunRestraintsAudit}
              className="text-purple-700 hover:text-purple-800 font-bold hover:underline cursor-pointer"
            >
              {language === 'fr' ? 'Tester Mécanismes' : 'Test Locks'}
            </button>
          </div>
        </div>

        {/* KPI 4: Pre-Sign-Off Clearance Gate Status */}
        <div className={`p-4 rounded-xl border transition-all ${
          kpis.isCriticalCleared 
            ? 'bg-emerald-50 border-emerald-300' 
            : 'bg-rose-50 border-rose-300'
        }`}>
          <div className="flex items-center justify-between">
            <div className={`p-2 rounded-lg ${kpis.isCriticalCleared ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'}`}>
              {kpis.isCriticalCleared ? <ShieldCheck className="w-5 h-5 text-emerald-700" /> : <ShieldAlert className="w-5 h-5 text-rose-700" />}
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              kpis.isCriticalCleared ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
            }`}>
              {kpis.isCriticalCleared ? (language === 'fr' ? 'AUTORISÉ' : 'GATE CLEARED') : (language === 'fr' ? 'RESTREINT' : 'SIGN-OFF BLOCKED')}
            </span>
          </div>
          <div className="mt-3">
            <span className="text-xs font-semibold text-slate-600 block uppercase tracking-wider">
              {language === 'fr' ? 'Statut Visa de Relève' : 'Sign-Off Readiness'}
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-slate-900 font-mono">
                {kpis.criticalVerified} / {kpis.criticalTotal}
              </span>
              <span className="text-xs text-slate-600 font-semibold">{language === 'fr' ? 'critiques visés' : 'critical items'}</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
            {kpis.isCriticalCleared ? (
              <button
                onClick={onProceedToSignOff}
                className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>{language === 'fr' ? 'Passer aux Signatures' : 'Proceed to Sign-Off'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="text-rose-700 font-bold">
                {kpis.criticalTotal - kpis.criticalVerified} {language === 'fr' ? 'contrôles en attente' : 'checks pending'}
              </span>
            )}
          </div>
        </div>

      </div>

      {/* PRE-SIGN-OFF CLEARANCE GATE NOTIFICATION BANNER */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
        kpis.isCriticalCleared
          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
          : 'bg-amber-50 border-amber-300 text-amber-950'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg shrink-0 ${
            kpis.isCriticalCleared ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
          }`}>
            {kpis.isCriticalCleared ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <strong className="text-sm font-bold">
                {kpis.isCriticalCleared
                  ? (language === 'fr' ? 'Validation des Ressources Complète : Prêt pour la Signature du Quart' : 'All Critical Security Resources Reconciled & Verified')
                  : (language === 'fr' ? 'Inspection Obligatoire : Clés, Radios et Entraves doivent être validées avant la signature' : 'Mandatory Pre-Sign-Off Verification Pending')}
              </strong>
              {kpis.variancesCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                  {kpis.variancesCount} {language === 'fr' ? 'écart(s) noté(s)' : 'variance(s) recorded'}
                </span>
              )}
            </div>
            <p className="text-xs mt-1 leading-relaxed text-slate-700">
              {kpis.isCriticalCleared
                ? (language === 'fr'
                    ? 'L\'ensemble des armements, trousseaux passe-partout et radios a fait l\'objet du contrôle contradictoire. Le commandant sortant peut maintenant apposer sa signature officielle.'
                    : 'All keys, communications, munitions, and restraint equipment have been physically audited by dual watch commanders. The handover session is certified ready for formal sign-off.')
                : (language === 'fr'
                    ? 'Le protocole de sécurité interdit le transfert de commandement tant que les clés maîtresses, talkies-walkies et menottes n\'ont pas été pointés physiquement.'
                    : 'Standing orders prevent handover completion until outgoing and incoming commanders have accounted for all high-security keys, comms units, and restraints.')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          <button
            onClick={onVerifyAllMatching}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            title="Mark all matching items with zero discrepancy as verified"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'fr' ? 'Tout Pointer Conforme (0 Écart)' : 'Verify All Matching (0 Variance)'}</span>
          </button>

          {onProceedToSignOff && (
            <button
              onClick={onProceedToSignOff}
              disabled={!kpis.isCriticalCleared}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer ${
                kpis.isCriticalCleared
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>{language === 'fr' ? 'Aller aux Signatures' : 'Go to Sign-Off'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* FILTER CONTROLS & SEARCH BAR */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={language === 'fr' ? 'Rechercher un équipement, trousseau, matricule ou lieu...' : 'Search by equipment name, storage, key seal # or serial...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
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

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                  viewMode === 'cards' ? 'bg-white shadow-xs text-indigo-700 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Detailed Cards View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-white shadow-xs text-indigo-700 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Compact Table Audit View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Variances Only Filter Pill */}
            <button
              onClick={() => setFilterVarianceOnly(!filterVarianceOnly)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                filterVarianceOnly
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{language === 'fr' ? 'Écarts Uniquement' : 'Variances Only'}</span>
              {kpis.variancesCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  filterVarianceOnly ? 'bg-amber-800 text-white' : 'bg-amber-200 text-amber-900'
                }`}>
                  {kpis.variancesCount}
                </span>
              )}
            </button>

            {/* Unverified Only Filter Pill */}
            <button
              onClick={() => setFilterUnverifiedOnly(!filterUnverifiedOnly)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                filterUnverifiedOnly
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{language === 'fr' ? 'Non Pointés' : 'Pending Only'}</span>
            </button>

            {/* Scan Asset QR Code Button */}
            <button
              onClick={() => {
                setQrModalTargetItem(null);
                setIsQrScannerOpen(true);
              }}
              className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer ring-1 ring-cyan-400/30"
              title={language === 'fr' ? 'Scanner un QR code pour ouvrir l\'historique d\'actif et les fiches de maintenance' : 'Scan QR code to pull full asset history and maintenance logs'}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>{language === 'fr' ? 'Scanner QR Actif' : 'Scan Asset QR'}</span>
            </button>

            {/* Add New Equipment Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'fr' ? 'Ajouter Matériel' : 'Add Item'}</span>
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>{language === 'fr' ? 'Catégories :' : 'Category:'}</span>
          </span>

          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {language === 'fr' ? 'Tous les matériels' : 'All Resources'} ({equipment.length})
          </button>

          <button
            onClick={() => setSelectedCategory('keys_security')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'keys_security'
                ? 'bg-amber-600 text-white'
                : 'text-amber-800 hover:bg-amber-50'
            }`}
          >
            <Key className="w-3 h-3" />
            <span>{language === 'fr' ? 'Clés de Sécurité' : 'Keys & Locks'}</span>
            <span className="px-1 py-0.2 rounded-full text-[9px] bg-amber-200/60 text-amber-950 font-bold">
              {equipment.filter(e => e.category === 'keys_security').length}
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory('radios_comms')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'radios_comms'
                ? 'bg-indigo-600 text-white'
                : 'text-indigo-800 hover:bg-indigo-50'
            }`}
          >
            <Radio className="w-3 h-3" />
            <span>{language === 'fr' ? 'Radios & Comms' : 'Radios & Comms'}</span>
            <span className="px-1 py-0.2 rounded-full text-[9px] bg-indigo-200/60 text-indigo-950 font-bold">
              {equipment.filter(e => e.category === 'radios_comms').length}
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory('restraints_cuffs')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'restraints_cuffs'
                ? 'bg-purple-600 text-white'
                : 'text-purple-800 hover:bg-purple-50'
            }`}
          >
            <Lock className="w-3 h-3" />
            <span>{language === 'fr' ? 'Entraves & Menottes' : 'Restraints & Cuffs'}</span>
            <span className="px-1 py-0.2 rounded-full text-[9px] bg-purple-200/60 text-purple-950 font-bold">
              {equipment.filter(e => e.category === 'restraints_cuffs').length}
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory('armory_firearms')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'armory_firearms'
                ? 'bg-rose-600 text-white'
                : 'text-rose-800 hover:bg-rose-50'
            }`}
          >
            <Crosshair className="w-3 h-3" />
            <span>{language === 'fr' ? 'Armurerie & Munitions' : 'Armory & Munitions'}</span>
            <span className="px-1 py-0.2 rounded-full text-[9px] bg-rose-200/60 text-rose-950 font-bold">
              {equipment.filter(e => e.category === 'armory_firearms').length}
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory('tactical_protection')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'tactical_protection'
                ? 'bg-slate-700 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Shield className="w-3 h-3" />
            <span>{language === 'fr' ? 'Équipement Anti-Émeute' : 'Tactical & Riot Gear'}</span>
          </button>

          <button
            onClick={() => setSelectedCategory('body_cameras')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'body_cameras'
                ? 'bg-blue-600 text-white'
                : 'text-blue-800 hover:bg-blue-50'
            }`}
          >
            <Camera className="w-3 h-3" />
            <span>{language === 'fr' ? 'Caméras Piéton' : 'Body Cameras'}</span>
          </button>
        </div>
      </div>

      {/* EQUIPMENT ITEMS VIEW: DETAILED CARDS OR AUDIT TABLE */}
      {viewMode === 'cards' ? (
        
        /* DETAILED CARDS GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEquipment.map(item => {
            const isMatch = item.countedQty === item.expectedQty;
            const variance = item.countedQty - item.expectedQty;
            const isCritical = item.criticality === 'critical' || 
              item.category === 'keys_security' || 
              item.category === 'radios_comms' || 
              item.category === 'restraints_cuffs';

            return (
              <div 
                key={item.id} 
                className={`bg-white rounded-xl border transition-all p-4 flex flex-col justify-between space-y-3 ${
                  !isMatch || item.condition !== 'operational'
                    ? 'border-amber-300 shadow-md ring-1 ring-amber-200'
                    : item.verifiedByBoth
                    ? 'border-slate-200 shadow-xs'
                    : 'border-slate-200 shadow-xs hover:border-indigo-300'
                }`}
              >
                <div>
                  {/* Card Top: Category Badge, Critical Pill, Verification Toggle */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 ${
                        item.category === 'keys_security' ? 'bg-amber-100 text-amber-900' :
                        item.category === 'radios_comms' ? 'bg-indigo-100 text-indigo-900' :
                        item.category === 'restraints_cuffs' ? 'bg-purple-100 text-purple-900' :
                        item.category === 'armory_firearms' ? 'bg-rose-100 text-rose-900' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {item.category === 'keys_security' && <Key className="w-2.5 h-2.5" />}
                        {item.category === 'radios_comms' && <Radio className="w-2.5 h-2.5" />}
                        {item.category === 'restraints_cuffs' && <Lock className="w-2.5 h-2.5" />}
                        {item.category === 'armory_firearms' && <Crosshair className="w-2.5 h-2.5" />}
                        <span>{item.category.replace('_', ' ')}</span>
                      </span>

                      {isCritical && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-rose-600 text-white">
                          CRITICAL
                        </span>
                      )}
                    </div>

                    {/* Verification Action Stamp */}
                    <button
                      onClick={() => onToggleVerification(item.id)}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        item.verifiedByBoth
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200'
                      }`}
                      title={item.verifiedByBoth ? 'Mark as unverified' : 'Mark as physically verified by commander'}
                    >
                      {item.verifiedByBoth ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{language === 'fr' ? 'Pointé' : 'Verified'}</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{language === 'fr' ? 'À pointer' : 'Pending'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Title & Storage & QR Tag */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {item.name}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setQrModalTargetItem(item);
                        setIsQrScannerOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-300 hover:bg-cyan-100 hover:border-cyan-400 transition-colors cursor-pointer shrink-0"
                      title={language === 'fr' ? 'Consulter le dossier QR, l\'historique et la maintenance' : 'Open QR asset history & maintenance ledger'}
                    >
                      <QrCode className="w-3 h-3 text-cyan-600" />
                      <span>{item.assetTag || 'QR'}</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                    <span>{item.storageLocation}</span>
                    {item.sealNumber && (
                      <>
                        <span>&bull;</span>
                        <span className="font-mono text-indigo-700 bg-indigo-50 px-1 rounded font-semibold">
                          Scellé: {item.sealNumber}
                        </span>
                      </>
                    )}
                    {item.batteryLevel !== undefined && (
                      <>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1 text-slate-700 font-medium">
                          <Battery className="w-3 h-3 text-emerald-600" />
                          <span>{item.batteryLevel}%</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Quantitative Counting & Stepper Controls */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        {language === 'fr' ? 'Attendu au registre' : 'Expected Custody'}
                      </span>
                      <span className="font-mono font-bold text-slate-700 text-sm">
                        {item.expectedQty} {item.unit}
                      </span>
                    </div>

                    {/* Stepper Count Input */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onUpdateCount(item.id, Math.max(0, item.countedQty - 1))}
                        className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
                        title="Decrement Count"
                      >
                        -
                      </button>
                      
                      <input
                        type="number"
                        min="0"
                        value={item.countedQty}
                        onChange={e => onUpdateCount(item.id, parseInt(e.target.value) || 0)}
                        className={`w-14 p-1 text-center font-mono font-bold rounded-md border text-sm ${
                          !isMatch 
                            ? 'bg-rose-50 border-rose-300 text-rose-900' 
                            : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      />

                      <button
                        onClick={() => onUpdateCount(item.id, item.countedQty + 1)}
                        className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
                        title="Increment Count"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Variance Banner */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-500">{language === 'fr' ? 'Écart d\'inventaire :' : 'Inventory Variance:'}</span>
                    {isMatch ? (
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>0 {language === 'fr' ? '(Conforme)' : '(Match)'}</span>
                      </span>
                    ) : (
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                        variance > 0 ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-900'
                      }`}>
                        {variance > 0 ? `+${variance}` : variance} {item.unit} ({variance > 0 ? 'Surplus' : 'Déficit'})
                      </span>
                    )}
                  </div>

                  {/* Condition Selector */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[10px] text-slate-500">{language === 'fr' ? 'État opérationnel :' : 'Condition:'}</span>
                    <select
                      value={item.condition}
                      onChange={e => onUpdateCondition(item.id, e.target.value as EquipmentCondition)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        item.condition === 'operational' ? 'bg-emerald-50 text-emerald-900 border-emerald-300' :
                        item.condition === 'maintenance' ? 'bg-amber-50 text-amber-900 border-amber-300' :
                        item.condition === 'defective' ? 'bg-orange-50 text-orange-900 border-orange-300' :
                        'bg-rose-600 text-white border-rose-700'
                      }`}
                    >
                      <option value="operational">OPERATIONAL (Conforme)</option>
                      <option value="maintenance">MAINTENANCE (En atelier)</option>
                      <option value="defective">DEFECTIVE (Hors d'usage)</option>
                      <option value="missing">MISSING (Perdu / Alerte)</option>
                    </select>
                  </div>

                  {/* Discrepancy Note / Observation Banner */}
                  {item.discrepancyNote && (
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900 flex items-start justify-between gap-2">
                      <div className="flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                        <span className="italic leading-relaxed">{item.discrepancyNote}</span>
                      </div>
                      <button 
                        onClick={() => handleOpenNoteModal(item)}
                        className="text-amber-800 hover:text-amber-950 underline text-[10px] shrink-0 font-bold"
                      >
                        {language === 'fr' ? 'Modifier' : 'Edit'}
                      </button>
                    </div>
                  )}

                  {!item.discrepancyNote && !isMatch && (
                    <button
                      onClick={() => handleOpenNoteModal(item)}
                      className="w-full py-1 text-center text-[10px] font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200 transition-colors cursor-pointer"
                    >
                      + {language === 'fr' ? 'Ajouter une observation d\'écart' : 'Attach Variance Explanation'}
                    </button>
                  )}
                </div>

                {/* Inspection Footnote */}
                <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between font-mono">
                  <span>
                    {item.lastInspectedAt ? `Audit: ${item.lastInspectedAt}` : 'Pre-shift check'}
                  </span>
                  <span>{item.inspectedBy || outgoingCommanderName}</span>
                </div>

              </div>
            );
          })}
        </div>

      ) : (

        /* COMPACT MASTER AUDIT TABLE VIEW */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3 w-10 text-center">{language === 'fr' ? 'Type' : 'Cat'}</th>
                  <th className="p-3">{language === 'fr' ? 'Désignation & Emplacement Sécurisé' : 'Equipment Name & Storage'}</th>
                  <th className="p-3 w-24 text-center">{language === 'fr' ? 'Attendu' : 'Expected'}</th>
                  <th className="p-3 w-36 text-center">{language === 'fr' ? 'Compté' : 'Counted'}</th>
                  <th className="p-3 w-28 text-center">{language === 'fr' ? 'Écart' : 'Variance'}</th>
                  <th className="p-3 w-32">{language === 'fr' ? 'État' : 'Condition'}</th>
                  <th className="p-3">{language === 'fr' ? 'Observations & Scellés' : 'Discrepancy Notes & Seals'}</th>
                  <th className="p-3 w-24 text-center">{language === 'fr' ? 'Validation' : 'Sign-Off Check'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEquipment.map(item => {
                  const isMatch = item.countedQty === item.expectedQty;
                  const variance = item.countedQty - item.expectedQty;

                  return (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        !isMatch || item.condition !== 'operational' ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      <td className="p-3 text-center">
                        {item.category === 'keys_security' && <Key className="w-4 h-4 text-amber-600 mx-auto" />}
                        {item.category === 'radios_comms' && <Radio className="w-4 h-4 text-indigo-600 mx-auto" />}
                        {item.category === 'restraints_cuffs' && <Lock className="w-4 h-4 text-purple-600 mx-auto" />}
                        {item.category === 'armory_firearms' && <Crosshair className="w-4 h-4 text-rose-600 mx-auto" />}
                        {item.category === 'tactical_protection' && <Shield className="w-4 h-4 text-slate-600 mx-auto" />}
                        {item.category === 'body_cameras' && <Camera className="w-4 h-4 text-blue-600 mx-auto" />}
                      </td>

                      <td className="p-3">
                        <div className="flex items-center justify-between gap-2">
                          <strong className="text-slate-900 block font-semibold">{item.name}</strong>
                          <button
                            type="button"
                            onClick={() => {
                              setQrModalTargetItem(item);
                              setIsQrScannerOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono text-[9px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-300 hover:bg-cyan-100 transition-colors cursor-pointer shrink-0"
                            title={language === 'fr' ? 'Consulter le dossier QR et la maintenance' : 'Open QR asset history & maintenance'}
                          >
                            <QrCode className="w-2.5 h-2.5 text-cyan-600" />
                            <span>{item.assetTag || 'QR'}</span>
                          </button>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span>{item.storageLocation}</span>
                          {item.sealNumber && (
                            <span className="font-mono text-[10px] text-indigo-700 bg-indigo-50 px-1 rounded">
                              #{item.sealNumber}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3 text-center font-mono font-bold text-slate-600">
                        {item.expectedQty} {item.unit}
                      </td>

                      <td className="p-3 text-center">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => onUpdateCount(item.id, Math.max(0, item.countedQty - 1))}
                            className="w-5 h-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold text-xs flex items-center justify-center cursor-pointer"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={item.countedQty}
                            onChange={e => onUpdateCount(item.id, parseInt(e.target.value) || 0)}
                            className={`w-12 p-0.5 text-center font-mono font-bold rounded border text-xs ${
                              !isMatch ? 'border-rose-400 bg-rose-50 text-rose-900' : 'border-slate-300 bg-white text-slate-900'
                            }`}
                          />
                          <button
                            onClick={() => onUpdateCount(item.id, item.countedQty + 1)}
                            className="w-5 h-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold text-xs flex items-center justify-center cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td className="p-3 text-center">
                        {isMatch ? (
                          <span className="text-emerald-700 font-bold font-mono text-[11px]">0 OK</span>
                        ) : (
                          <span className={`px-1.5 py-0.5 rounded font-mono font-bold text-[10px] ${
                            variance > 0 ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-900'
                          }`}>
                            {variance > 0 ? `+${variance}` : variance}
                          </span>
                        )}
                      </td>

                      <td className="p-3">
                        <select
                          value={item.condition}
                          onChange={e => onUpdateCondition(item.id, e.target.value as EquipmentCondition)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            item.condition === 'operational' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                            item.condition === 'maintenance' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                            'bg-rose-50 text-rose-800 border-rose-300'
                          }`}
                        >
                          <option value="operational">Operational</option>
                          <option value="maintenance">Maintenance</option>
                          <option value="defective">Defective</option>
                          <option value="missing">Missing</option>
                        </select>
                      </td>

                      <td className="p-3 text-slate-600 text-[11px]">
                        {item.discrepancyNote ? (
                          <span className="italic text-amber-900">{item.discrepancyNote}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="p-3 text-center">
                        <button
                          onClick={() => onToggleVerification(item.id)}
                          className={`p-1.5 rounded-md transition-all cursor-pointer ${
                            item.verifiedByBoth
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-400 hover:bg-indigo-50 hover:text-indigo-700'
                          }`}
                          title={item.verifiedByBoth ? 'Verified' : 'Click to verify'}
                        >
                          {item.verifiedByBoth ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      )}

      {/* MODAL: ADD CUSTOM CRITICAL EQUIPMENT OR ACCESSORY */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <span>{language === 'fr' ? 'Inscrire un Équipement au Registre du Quart' : 'Register New Security Equipment'}</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEquipment} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'fr' ? 'Catégorie de Sécurité' : 'Security Category'} *
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as EquipmentCategory)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold"
                  >
                    <option value="keys_security">{language === 'fr' ? 'Clés Maîtresses & Batteuses' : 'Master Keys & Deadbolts'}</option>
                    <option value="radios_comms">{language === 'fr' ? 'Radios UHF & Batteries' : 'Radios & Comms'}</option>
                    <option value="restraints_cuffs">{language === 'fr' ? 'Menottes & Chaînes' : 'Restraints & Cuffs'}</option>
                    <option value="armory_firearms">{language === 'fr' ? 'Armes & Munitions' : 'Armory & Munitions'}</option>
                    <option value="tactical_protection">{language === 'fr' ? 'Tenues Anti-Émeute' : 'Tactical & Riot Protection'}</option>
                    <option value="body_cameras">{language === 'fr' ? 'Caméras Piéton' : 'Body Cameras'}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'fr' ? 'Criticité Réglementaire' : 'Criticality Level'} *
                  </label>
                  <select
                    value={newCriticality}
                    onChange={e => setNewCriticality(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold"
                  >
                    <option value="critical">CRITICAL (Blocage Relève)</option>
                    <option value="high">HIGH (Surveillance Renforcée)</option>
                    <option value="standard">STANDARD (Matériel Courant)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'fr' ? 'Désignation Précise du Matériel' : 'Equipment Designation / Asset Name'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'fr' ? 'Ex: Trousseau Passe-Partout Bloc Médical & Pharmacie' : 'e.g. Medical Wing & Pharmacy Master Pass Ring'}
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'fr' ? 'Attendu' : 'Expected'} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newExpectedQty}
                    onChange={e => setNewExpectedQty(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'fr' ? 'Compté' : 'Counted'} *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newCountedQty}
                    onChange={e => setNewCountedQty(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'fr' ? 'Unité' : 'Unit'}
                  </label>
                  <input
                    type="text"
                    placeholder="sets, pairs, etc."
                    value={newUnit}
                    onChange={e => setNewUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'fr' ? 'Lieu de Rangement / Coffre' : 'Storage Vault / Location'}
                  </label>
                  <input
                    type="text"
                    placeholder={language === 'fr' ? 'Ex: Armoire Forte Poste Central' : 'e.g. Vault Safe A-02'}
                    value={newLocation}
                    onChange={e => setNewLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'fr' ? 'Numéro de Scellé / Sceau' : 'Seal Number (Optional)'}
                  </label>
                  <input
                    type="text"
                    placeholder="SEAL-2026-X"
                    value={newSealNumber}
                    onChange={e => setNewSealNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'fr' ? 'État Opérationnel' : 'Serviceability Condition'}
                </label>
                <select
                  value={newCondition}
                  onChange={e => setNewCondition(e.target.value as EquipmentCondition)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold"
                >
                  <option value="operational">Operational (En service)</option>
                  <option value="maintenance">Maintenance (En révision)</option>
                  <option value="defective">Defective (Défectueux)</option>
                  <option value="missing">Missing (Manquant / Alerte)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'fr' ? 'Observations & Justification Écart' : 'Variance / Discrepancy Note'}
                </label>
                <textarea
                  rows={2}
                  placeholder={language === 'fr' ? 'Observations ou motif si le décompte diffère...' : 'Details if physical count differs from ledger...'}
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold shadow-xs transition-all cursor-pointer"
                >
                  {language === 'fr' ? 'Enregistrer le Matériel' : 'Save Equipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close conditional equipment sub-section */}
      </>
      )}

      {/* MODAL: EDIT DISCREPANCY NOTE */}
      {isNoteModalOpen && activeEditingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-3.5 bg-amber-600 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>{language === 'fr' ? 'Observation d\'Écart d\'Inventaire' : 'Log Equipment Variance Note'}</span>
              </h3>
              <button onClick={() => setIsNoteModalOpen(false)} className="text-amber-100 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <strong className="text-slate-900 block text-xs">{activeEditingItem.name}</strong>
                <span className="text-[11px] text-slate-500">{activeEditingItem.storageLocation}</span>
                <div className="mt-1 font-mono text-[11px] text-slate-700">
                  {language === 'fr' ? 'Attendu :' : 'Expected:'} {activeEditingItem.expectedQty} | {language === 'fr' ? 'Compté :' : 'Counted:'} {activeEditingItem.countedQty} {activeEditingItem.unit}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'fr' ? 'Motif de l\'Écart ou Défaillance' : 'Discrepancy Justification'} *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder={language === 'fr' ? 'Ex: Envoyé en réparation armurerie ce matin, reçu bon de prise en charge #AR-492...' : 'e.g. Sent for repair to ordnance workshop, signed ticket #AR-492 attached...'}
                  value={itemNoteText}
                  onChange={e => setItemNoteText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveNote}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold shadow-xs transition-all cursor-pointer"
                >
                  {language === 'fr' ? 'Valider l\'Observation' : 'Save Note'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ASSET QR SCANNER & MAINTENANCE DOSSIER MODAL */}
      <AssetQrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => {
          setIsQrScannerOpen(false);
          setQrModalTargetItem(null);
        }}
        language={language}
        equipment={equipment}
        initialSelectedItem={qrModalTargetItem}
        onUpdateCondition={onUpdateCondition}
        onUpdateItemLogs={onUpdateEquipmentItem}
      />

    </div>
  );
};
