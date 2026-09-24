import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Wrench, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  User, 
  MapPin, 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Check, 
  X, 
  Copy, 
  UserCheck, 
  Sparkles, 
  Info, 
  AlertCircle, 
  Layers, 
  ChevronRight, 
  NotebookPen,
  Calendar,
  Building2,
  HardHat,
  HelpCircle,
  Mic
} from 'lucide-react';
import { HandoverVoiceDictationWidget } from './HandoverVoiceDictationWidget';
import { 
  ShiftHandoverNote, 
  HandoverNoteCategory, 
  HandoverNoteUrgency, 
  InmateWatchLevel, 
  Language, 
  Inmate,
  ShiftType 
} from '../../types';

interface ShiftHandoverNotesSectionProps {
  language: Language;
  notes: ShiftHandoverNote[];
  onAppendNote: (newNote: ShiftHandoverNote) => void;
  onAcknowledgeNote: (noteId: string, acknowledgedBy: string) => void;
  onAcknowledgeAllNotes?: (acknowledgedBy: string) => void;
  outgoingCommanderName?: string;
  outgoingCommanderBadge?: string;
  incomingCommanderName?: string;
  incomingCommanderBadge?: string;
  inmates?: Inmate[];
  compactView?: boolean;
}

export const ShiftHandoverNotesSection: React.FC<ShiftHandoverNotesSectionProps> = ({
  language,
  notes,
  onAppendNote,
  onAcknowledgeNote,
  onAcknowledgeAllNotes,
  outgoingCommanderName = 'Capt. Marcus Vance',
  outgoingCommanderBadge = 'KP-8421',
  incomingCommanderName = 'Capt. Jonathan Hayes',
  incomingCommanderBadge = 'KP-7890',
  inmates = [],
  compactView = false,
}) => {
  // State
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<'all' | 'inmate_watch' | 'unusual_behavior' | 'maintenance'>('all');
  const [filterUrgency, setFilterUrgency] = useState<string>('all');
  const [filterAckStatus, setFilterAckStatus] = useState<'all' | 'pending' | 'acknowledged'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);
  const [showVoiceDictation, setShowVoiceDictation] = useState(false);

  // New Note Form State
  const [newCategory, setNewCategory] = useState<HandoverNoteCategory>('inmate_watch');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newUrgency, setNewUrgency] = useState<HandoverNoteUrgency>('urgent');
  const [newLocation, setNewLocation] = useState('');

  // Maintenance fields
  const [maintAsset, setMaintAsset] = useState('');
  const [maintTrade, setMaintTrade] = useState<'locks_doors' | 'plumbing' | 'electrical' | 'hvac' | 'cctv_sensors' | 'perimeter_fencing' | 'structural'>('locks_doors');
  const [maintWorkOrder, setMaintWorkOrder] = useState('');
  const [maintContractorRequired, setMaintContractorRequired] = useState(false);
  const [maintContractorName, setMaintContractorName] = useState('');
  const [maintResolutionEta, setMaintResolutionEta] = useState('');

  // Behavior fields
  const [behavInmateId, setBehavInmateId] = useState('');
  const [behavInmateName, setBehavInmateName] = useState('');
  const [behavType, setBehavType] = useState<'agitating_tensions' | 'withdrawn_depression' | 'gang_posturing' | 'hoarding_contraband' | 'verbal_altercation' | 'unusual_solicitation' | 'paranoia_anxiety'>('agitating_tensions');
  const [behavWitnesses, setBehavWitnesses] = useState('');
  const [behavResponse, setBehavResponse] = useState('');

  // Inmate Watch fields
  const [watchInmateId, setWatchInmateId] = useState('');
  const [watchInmateName, setWatchInmateName] = useState('');
  const [watchCellLocation, setWatchCellLocation] = useState('');
  const [watchLevel, setWatchLevel] = useState<InmateWatchLevel>('suicide_watch_15m');
  const [watchInterval, setWatchInterval] = useState<number>(15);
  const [watchKeepSeparated, setWatchKeepSeparated] = useState('');
  const [watchInstructions, setWatchInstructions] = useState('');
  const [watchPost, setWatchPost] = useState('');

  // Quick Inmate selection helper
  const handleSelectInmateForWatch = (inmateId: string) => {
    const found = inmates.find(i => i.id === inmateId || i.bookingNumber === inmateId);
    if (found) {
      setWatchInmateId(found.bookingNumber || found.id);
      setWatchInmateName(`${found.firstName} ${found.lastName}`);
      setWatchCellLocation(found.cellLocation || 'Bloc A');
    }
  };

  const handleSelectInmateForBehavior = (inmateId: string) => {
    const found = inmates.find(i => i.id === inmateId || i.bookingNumber === inmateId);
    if (found) {
      setBehavInmateId(found.bookingNumber || found.id);
      setBehavInmateName(`${found.firstName} ${found.lastName}`);
    }
  };

  // Reset form
  const resetForm = () => {
    setNewTitle('');
    setNewContent('');
    setNewUrgency('urgent');
    setNewLocation('');
    setMaintAsset('');
    setMaintTrade('locks_doors');
    setMaintWorkOrder('');
    setMaintContractorRequired(false);
    setMaintContractorName('');
    setMaintResolutionEta('');
    setBehavInmateId('');
    setBehavInmateName('');
    setBehavType('agitating_tensions');
    setBehavWitnesses('');
    setBehavResponse('');
    setWatchInmateId('');
    setWatchInmateName('');
    setWatchCellLocation('');
    setWatchLevel('suicide_watch_15m');
    setWatchInterval(15);
    setWatchKeepSeparated('');
    setWatchInstructions('');
    setWatchPost('');
  };

  // Handle Submit Form
  const handleSubmitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newNote: ShiftHandoverNote = {
      id: `note-${Date.now()}`,
      category: newCategory,
      title: newTitle.trim(),
      content: newContent.trim(),
      urgency: newUrgency,
      location: newLocation.trim() || (newCategory === 'inmate_watch' ? watchCellLocation : 'Poste Central'),
      authorCommander: outgoingCommanderName,
      authorBadge: outgoingCommanderBadge,
      timestamp: timeStr,
      isAcknowledgedByIncoming: false,
    };

    if (newCategory === 'maintenance') {
      newNote.maintenanceDetails = {
        equipmentOrAsset: maintAsset.trim() || newTitle.trim(),
        workOrderRef: maintWorkOrder.trim() || `WO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        trade: maintTrade,
        contractorAccessRequired: maintContractorRequired,
        contractorName: maintContractorRequired ? (maintContractorName.trim() || 'Escorte Technique Agréée') : undefined,
        estimatedResolution: maintResolutionEta.trim() || undefined,
      };
    } else if (newCategory === 'unusual_behavior') {
      newNote.behaviorDetails = {
        inmateId: behavInmateId.trim() || undefined,
        inmateName: behavInmateName.trim() || undefined,
        behaviorType: behavType,
        witnessingOfficers: behavWitnesses ? behavWitnesses.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        recommendedResponse: behavResponse.trim() || 'Surveillance accrue requise.',
      };
    } else if (newCategory === 'inmate_watch') {
      newNote.inmateWatchDetails = {
        inmateId: watchInmateId.trim() || 'KP-9901',
        inmateName: watchInmateName.trim() || 'Détenu Signalé',
        cellLocation: watchCellLocation.trim() || newLocation.trim() || 'Aile Haute Sécurité',
        watchLevel: watchLevel,
        watchIntervalMinutes: watchInterval || 15,
        keepSeparatedFrom: watchKeepSeparated ? watchKeepSeparated.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        specialInstructions: watchInstructions.trim() || newContent.trim(),
        assignedWatchPost: watchPost.trim() || 'Poste de Surveillance Étage',
      };
    }

    onAppendNote(newNote);
    resetForm();
    setIsAddNoteModalOpen(false);
  };

  // Copy note summary to clipboard
  const handleCopyNote = (note: ShiftHandoverNote) => {
    let text = `[NOTE RELÈVE ${note.urgency.toUpperCase()}] ${note.title}\n`;
    text += `Lieu: ${note.location} | Auteur: ${note.authorCommander} (${note.authorBadge}) à ${note.timestamp}\n`;
    text += `Contenu: ${note.content}\n`;
    if (note.inmateWatchDetails) {
      text += `>> Consigne Détenu: ${note.inmateWatchDetails.inmateName} (${note.inmateWatchDetails.inmateId}) - Surveillance ${note.inmateWatchDetails.watchIntervalMinutes} min - ${note.inmateWatchDetails.specialInstructions}\n`;
    }
    if (note.behaviorDetails) {
      text += `>> Comportement Insolite: ${note.behaviorDetails.behaviorType} - Réponse: ${note.behaviorDetails.recommendedResponse}\n`;
    }
    if (note.maintenanceDetails) {
      text += `>> Maintenance: ${note.maintenanceDetails.trade} - OT: ${note.maintenanceDetails.workOrderRef} - Accès Prestataire: ${note.maintenanceDetails.contractorAccessRequired ? 'OUI' : 'NON'}\n`;
    }

    navigator.clipboard.writeText(text);
    setCopiedNoteId(note.id);
    setTimeout(() => setCopiedNoteId(null), 2000);
  };

  // Filtered Notes
  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      // Category tab
      if (selectedCategoryTab !== 'all' && n.category !== selectedCategoryTab) return false;

      // Urgency filter
      if (filterUrgency !== 'all' && n.urgency !== filterUrgency) return false;

      // Acknowledgment filter
      if (filterAckStatus === 'pending' && n.isAcknowledgedByIncoming) return false;
      if (filterAckStatus === 'acknowledged' && !n.isAcknowledgedByIncoming) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = n.title.toLowerCase().includes(q);
        const matchContent = n.content.toLowerCase().includes(q);
        const matchLocation = n.location.toLowerCase().includes(q);
        const matchAuthor = n.authorCommander.toLowerCase().includes(q);
        const matchInmate = n.inmateWatchDetails?.inmateName.toLowerCase().includes(q) || n.inmateWatchDetails?.inmateId.toLowerCase().includes(q) || n.behaviorDetails?.inmateName?.toLowerCase().includes(q) || n.behaviorDetails?.inmateId?.toLowerCase().includes(q);
        const matchWO = n.maintenanceDetails?.workOrderRef?.toLowerCase().includes(q) || n.maintenanceDetails?.equipmentOrAsset.toLowerCase().includes(q);
        if (!matchTitle && !matchContent && !matchLocation && !matchAuthor && !matchInmate && !matchWO) {
          return false;
        }
      }

      return true;
    });
  }, [notes, selectedCategoryTab, filterUrgency, filterAckStatus, searchQuery]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const total = notes.length;
    const maintenanceCount = notes.filter(n => n.category === 'maintenance').length;
    const behaviorCount = notes.filter(n => n.category === 'unusual_behavior').length;
    const watchCount = notes.filter(n => n.category === 'inmate_watch').length;
    const criticalUrgentCount = notes.filter(n => n.urgency === 'critical' || n.urgency === 'urgent').length;
    const acknowledgedCount = notes.filter(n => n.isAcknowledgedByIncoming).length;
    const pendingCount = total - acknowledgedCount;

    return {
      total,
      maintenanceCount,
      behaviorCount,
      watchCount,
      criticalUrgentCount,
      acknowledgedCount,
      pendingCount
    };
  }, [notes]);

  // Urgency styling helper
  const getUrgencyBadge = (urgency: HandoverNoteUrgency) => {
    switch (urgency) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-600 text-white flex items-center gap-1 shadow-xs animate-pulse">
            <ShieldAlert className="w-3 h-3" />
            {language === 'fr' ? 'Critique' : 'Critical'}
          </span>
        );
      case 'urgent':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white flex items-center gap-1 shadow-xs">
            <AlertTriangle className="w-3 h-3" />
            {language === 'fr' ? 'Urgent' : 'Urgent'}
          </span>
        );
      case 'elevated':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {language === 'fr' ? 'Vigilance' : 'Elevated'}
          </span>
        );
      case 'routine':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-300 flex items-center gap-1">
            <Info className="w-3 h-3" />
            {language === 'fr' ? 'Courant' : 'Routine'}
          </span>
        );
    }
  };

  // Watch Level styling helper
  const getWatchLevelBadge = (level: InmateWatchLevel, interval?: number) => {
    switch (level) {
      case 'suicide_watch_15m':
        return (
          <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>{language === 'fr' ? `Vigilance Suicide (${interval || 15} min)` : `Suicide Watch (${interval || 15} min)`}</span>
          </span>
        );
      case 'constant_1to1':
        return (
          <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-red-600 text-white flex items-center gap-1 shadow-xs">
            <Eye className="w-3 h-3" />
            <span>{language === 'fr' ? 'Surveillance Continue 1:1' : 'Constant 1-on-1 Watch'}</span>
          </span>
        );
      case 'keep_separate':
        return (
          <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-purple-100 text-purple-900 border border-purple-300 flex items-center gap-1">
            <EyeOff className="w-3 h-3 text-purple-700" />
            <span>{language === 'fr' ? 'Séparation Obligatoire' : 'Keep Separate Order'}</span>
          </span>
        );
      case 'segregation_high_risk':
        return (
          <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-900 text-amber-400 border border-amber-500/50 flex items-center gap-1">
            <Lock className="w-3 h-3 text-amber-400" />
            <span>{language === 'fr' ? `Isolement CAT-A (${interval || 30} min)` : `CAT-A Segregation (${interval || 30}m)`}</span>
          </span>
        );
      case 'medical_convalescence':
        return (
          <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
            <HardHat className="w-3 h-3 text-emerald-600" />
            <span>{language === 'fr' ? 'Surveillance Médicale / Convalescence' : 'Medical Convalescence Watch'}</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded font-semibold text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
            Standard
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Metrics Banner */}
      <div className="bg-slate-900 rounded-xl p-5 text-white shadow-sm border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/30">
                <NotebookPen className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>{language === 'fr' ? 'Consignes & Notes de Relève Structurées' : 'Structured Shift Handover Notes & Directives'}</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-600 text-white">
                  {metrics.total}
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {language === 'fr' 
                ? 'Registre officiel où le commandant sortant consigne les maintenances d\'infrastructure, comportements anormaux et directives spécifiques de surveillance des détenus.' 
                : 'Official command log for recording facility maintenance orders, anomalous inmate behaviors, and mandatory individual watch protocols for the incoming shift.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {metrics.pendingCount > 0 && onAcknowledgeAllNotes && (
              <button
                type="button"
                onClick={() => onAcknowledgeAllNotes(`${incomingCommanderName} (${incomingCommanderBadge})`)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
                title="Acknowledge all pending notes in this session"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'fr' ? 'Viser Tout Conforme' : 'Acknowledge All'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowVoiceDictation(!showVoiceDictation)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border shadow-xs active:scale-95 ${
                showVoiceDictation
                  ? 'bg-rose-600 text-white border-rose-500 shadow-rose-950/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-rose-300 border-slate-700'
              }`}
              title={language === 'fr' ? 'Activer la dictée vocale temps réel' : 'Toggle real-time voice-to-text dictation'}
            >
              <Mic className="w-4 h-4 animate-pulse text-rose-400" />
              <span>{language === 'fr' ? 'Dicter en Direct' : 'Dictate with Voice'}</span>
              <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 font-mono">
                MIC
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                resetForm();
                setIsAddNoteModalOpen(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'fr' ? 'Ajouter une Note' : 'Append Handover Note'}</span>
            </button>
          </div>
        </div>

        {/* 4 Interactive KPI Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800/80">
          <div 
            onClick={() => setSelectedCategoryTab('inmate_watch')}
            className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
              selectedCategoryTab === 'inmate_watch' 
                ? 'bg-rose-950/40 border-rose-500/60 ring-1 ring-rose-500/40' 
                : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-rose-400" />
                <span>{language === 'fr' ? 'Surveillances Détenus' : 'Inmate Watches'}</span>
              </span>
              <span className="font-bold text-rose-400 text-sm">{metrics.watchCount}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {language === 'fr' ? 'Suicides, CAT-A, séparations' : 'Suicide & segregation orders'}
            </div>
          </div>

          <div 
            onClick={() => setSelectedCategoryTab('unusual_behavior')}
            className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
              selectedCategoryTab === 'unusual_behavior' 
                ? 'bg-purple-950/40 border-purple-500/60 ring-1 ring-purple-500/40' 
                : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-purple-400" />
                <span>{language === 'fr' ? 'Comportements Insolites' : 'Unusual Behaviors'}</span>
              </span>
              <span className="font-bold text-purple-400 text-sm">{metrics.behaviorCount}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {language === 'fr' ? 'Tensions, regroupements, refus' : 'Tensions, groupings, refusals'}
            </div>
          </div>

          <div 
            onClick={() => setSelectedCategoryTab('maintenance')}
            className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
              selectedCategoryTab === 'maintenance' 
                ? 'bg-amber-950/40 border-amber-500/60 ring-1 ring-amber-500/40' 
                : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'fr' ? 'Maintenances & Pannes' : 'Facility Maintenance'}</span>
              </span>
              <span className="font-bold text-amber-400 text-sm">{metrics.maintenanceCount}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {language === 'fr' ? 'Serrures, caméras, prestataires' : 'Locks, CCTV, contractors'}
            </div>
          </div>

          <div 
            onClick={() => setFilterAckStatus(filterAckStatus === 'pending' ? 'all' : 'pending')}
            className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
              filterAckStatus === 'pending' 
                ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/40' 
                : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'fr' ? 'Visas Commandant Entrant' : 'Incoming Visas'}</span>
              </span>
              <span className={`font-bold text-sm ${metrics.pendingCount === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {metrics.acknowledgedCount}/{metrics.total}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {metrics.pendingCount === 0 ? (language === 'fr' ? '100% visé & validé' : '100% acknowledged') : `${metrics.pendingCount} en attente de visa`}
            </div>
          </div>
        </div>
      </div>

      {/* Voice-to-Text Dictation Deck */}
      {showVoiceDictation && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <HandoverVoiceDictationWidget
            language={language}
            onAppendNote={(newNote) => {
              onAppendNote(newNote);
              setShowVoiceDictation(false);
            }}
            outgoingCommanderName={outgoingCommanderName}
            outgoingCommanderBadge={outgoingCommanderBadge}
            incomingCommanderName={incomingCommanderName}
            incomingCommanderBadge={incomingCommanderBadge}
            onClose={() => setShowVoiceDictation(false)}
            isModal={false}
          />
        </div>
      )}

      {/* Filter and Category Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedCategoryTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedCategoryTab === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {language === 'fr' ? 'Toutes les Notes' : 'All Notes'} ({metrics.total})
          </button>
          
          <button
            type="button"
            onClick={() => setSelectedCategoryTab('inmate_watch')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedCategoryTab === 'inmate_watch'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{language === 'fr' ? 'Surveillances Détenus' : 'Inmate Watch Instructions'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-white/20">
              {metrics.watchCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategoryTab('unusual_behavior')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedCategoryTab === 'unusual_behavior'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{language === 'fr' ? 'Comportements Insolites' : 'Unusual Behaviors'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-white/20">
              {metrics.behaviorCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategoryTab('maintenance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedCategoryTab === 'maintenance'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>{language === 'fr' ? 'Maintenance Infrastructure' : 'Facility Maintenance'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-white/20">
              {metrics.maintenanceCount}
            </span>
          </button>
        </div>

        {/* Secondary filters & search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Urgency select */}
          <select
            value={filterUrgency}
            onChange={e => setFilterUrgency(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value="all">{language === 'fr' ? 'Toutes urgences' : 'All Urgency Levels'}</option>
            <option value="critical">{language === 'fr' ? 'Critique' : 'Critical Only'}</option>
            <option value="urgent">{language === 'fr' ? 'Urgent' : 'Urgent Only'}</option>
            <option value="elevated">{language === 'fr' ? 'Vigilance' : 'Elevated Only'}</option>
            <option value="routine">{language === 'fr' ? 'Courant' : 'Routine Only'}</option>
          </select>

          {/* Ack filter */}
          <select
            value={filterAckStatus}
            onChange={e => setFilterAckStatus(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value="all">{language === 'fr' ? 'Tous états visa' : 'All Status'}</option>
            <option value="pending">{language === 'fr' ? 'En attente de visa' : 'Pending Visa Only'}</option>
            <option value="acknowledged">{language === 'fr' ? 'Visé par entrant' : 'Acknowledged'}</option>
          </select>

          {/* Search */}
          <div className="relative w-44 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={language === 'fr' ? 'Rechercher détenu, OT, lieu...' : 'Search inmate, WO, post...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Notes List / Empty state */}
      {filteredNotes.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs space-y-3">
          <NotebookPen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">
            {language === 'fr' ? 'Aucune note de relève correspondante' : 'No Handover Notes Found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {language === 'fr'
              ? 'Aucune consigne n\'a été enregistrée pour ces critères de recherche ou cette catégorie.'
              : 'No operational handover instructions or maintenance orders match your active search filters.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategoryTab('all');
              setFilterUrgency('all');
              setFilterAckStatus('all');
              setSearchQuery('');
            }}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-all"
          >
            {language === 'fr' ? 'Réinitialiser les filtres' : 'Reset Filters'}
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredNotes.map(note => {
            const isWatch = note.category === 'inmate_watch';
            const isMaint = note.category === 'maintenance';
            const isBehav = note.category === 'unusual_behavior';

            // Border color depending on category & urgency
            let borderClass = 'border-slate-200';
            let bgCategoryHeader = 'bg-slate-50';
            if (isWatch) {
              borderClass = note.urgency === 'critical' ? 'border-rose-400 ring-1 ring-rose-200' : 'border-rose-200';
              bgCategoryHeader = 'bg-rose-50/70 text-rose-950';
            } else if (isMaint) {
              borderClass = 'border-amber-200';
              bgCategoryHeader = 'bg-amber-50/70 text-amber-950';
            } else if (isBehav) {
              borderClass = 'border-purple-200';
              bgCategoryHeader = 'bg-purple-50/70 text-purple-950';
            }

            return (
              <div 
                key={note.id} 
                className={`bg-white rounded-xl border ${borderClass} shadow-xs overflow-hidden transition-all hover:shadow-md`}
              >
                {/* Note Top Bar */}
                <div className={`p-3.5 ${bgCategoryHeader} border-b border-slate-100 flex flex-wrap items-center justify-between gap-2.5`}>
                  <div className="flex items-center gap-2">
                    {/* Category Icon */}
                    {isWatch && <Eye className="w-4 h-4 text-rose-600 shrink-0" />}
                    {isMaint && <Wrench className="w-4 h-4 text-amber-600 shrink-0" />}
                    {isBehav && <AlertCircle className="w-4 h-4 text-purple-600 shrink-0" />}
                    {!isWatch && !isMaint && !isBehav && <FileText className="w-4 h-4 text-slate-600 shrink-0" />}

                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      {isWatch && (language === 'fr' ? 'CONSIGNE DÉTENU PARTICULIÈRE' : 'SPECIFIC INMATE WATCH DIRECTIVE')}
                      {isMaint && (language === 'fr' ? 'MAINTENANCE & INFRASTRUCTURE' : 'FACILITY MAINTENANCE ORDER')}
                      {isBehav && (language === 'fr' ? 'SIGNALEMENT COMPORTEMENTAL' : 'ANOMALOUS BEHAVIOR REPORT')}
                      {!isWatch && !isMaint && !isBehav && (language === 'fr' ? 'ORDRE DU COMMANDEMENT' : 'COMMAND DIRECTIVE')}
                    </span>

                    {/* Urgency Badge */}
                    {getUrgencyBadge(note.urgency)}
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 flex items-center gap-1 font-mono text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{note.timestamp}</span>
                    </span>

                    <span className="text-slate-300">|</span>

                    <span className="text-slate-600 font-semibold flex items-center gap-1 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{note.location}</span>
                    </span>

                    {note.audioDictated && (
                      <>
                        <span className="text-slate-300">|</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1 shadow-2xs">
                          <Mic className="w-3 h-3 text-rose-500 animate-pulse" />
                          <span>{language === 'fr' ? 'Dictée Vocale' : 'Voice Dictated'}</span>
                          {note.audioDurationSeconds && (
                            <span className="text-indigo-400 font-mono text-[9px]">({note.audioDurationSeconds}s)</span>
                          )}
                        </span>
                      </>
                    )}

                    <span className="text-slate-300">|</span>

                    {/* Copy button */}
                    <button
                      type="button"
                      onClick={() => handleCopyNote(note)}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-white rounded transition-colors cursor-pointer"
                      title="Copy note directives to clipboard"
                    >
                      {copiedNoteId === note.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Main Body */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">
                      {note.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                      {note.content}
                    </p>
                  </div>

                  {/* PILLAR 1: SPECIFIC INMATE WATCH DETAILS */}
                  {isWatch && note.inmateWatchDetails && (
                    <div className="p-3 bg-rose-50/40 border border-rose-200 rounded-lg space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-200/60 pb-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-rose-700" />
                          <div>
                            <span className="text-xs font-bold text-slate-900">
                              {note.inmateWatchDetails.inmateName}
                            </span>
                            <span className="text-[11px] font-mono text-slate-500 ml-1.5">
                              (Matricule: {note.inmateWatchDetails.inmateId})
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {getWatchLevelBadge(note.inmateWatchDetails.watchLevel, note.inmateWatchDetails.watchIntervalMinutes)}
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-rose-200 text-rose-900">
                            Ronde: {note.inmateWatchDetails.watchIntervalMinutes} min
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="text-[11px]">
                          <span className="text-slate-500 block font-medium">
                            {language === 'fr' ? 'Emplacement & Cellule :' : 'Cell Assignment & Location:'}
                          </span>
                          <span className="font-semibold text-slate-800">
                            {note.inmateWatchDetails.cellLocation}
                          </span>
                        </div>

                        {note.inmateWatchDetails.assignedWatchPost && (
                          <div className="text-[11px]">
                            <span className="text-slate-500 block font-medium">
                              {language === 'fr' ? 'Poste de Contrôle Assigné :' : 'Responsible Sentry Post:'}
                            </span>
                            <span className="font-semibold text-slate-800">
                              {note.inmateWatchDetails.assignedWatchPost}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Keep separate alerts if applicable */}
                      {note.inmateWatchDetails.keepSeparatedFrom && note.inmateWatchDetails.keepSeparatedFrom.length > 0 && (
                        <div className="p-2 bg-purple-50 border border-purple-200 rounded text-xs">
                          <span className="text-[10px] font-bold uppercase text-purple-900 flex items-center gap-1 mb-1">
                            <EyeOff className="w-3 h-3 text-purple-700" />
                            <span>{language === 'fr' ? 'Incompatibilité & Séparation Judiciaire :' : 'Mandatory Keep-Separate Individuals:'}</span>
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {note.inmateWatchDetails.keepSeparatedFrom.map((incomp, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-white border border-purple-300 text-purple-950 font-bold text-[10px] rounded">
                                🚫 {incomp}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Strict Instructions */}
                      {note.inmateWatchDetails.specialInstructions && (
                        <div className="p-2 bg-white/90 border border-rose-200/80 rounded text-xs text-rose-950">
                          <strong className="text-[10px] uppercase font-bold text-rose-800 block mb-0.5">
                            {language === 'fr' ? 'Consignes Strictes pour l\'Équipe Entrante :' : 'Mandatory Orders for Incoming Shift Officers:'}
                          </strong>
                          <span>{note.inmateWatchDetails.specialInstructions}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PILLAR 2: UNUSUAL BEHAVIOR DETAILS */}
                  {isBehav && note.behaviorDetails && (
                    <div className="p-3 bg-purple-50/40 border border-purple-200 rounded-lg space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-200/60 pb-2">
                        <div className="flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-purple-700" />
                          <span className="text-xs font-bold text-purple-950">
                            {language === 'fr' ? 'Type d\'Anomalie :' : 'Behavioral Pattern:'}
                          </span>
                          <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-purple-200 text-purple-900 uppercase">
                            {note.behaviorDetails.behaviorType.replace('_', ' ')}
                          </span>
                        </div>

                        {note.behaviorDetails.inmateName && (
                          <div className="text-xs text-slate-700 font-medium">
                            <span>{language === 'fr' ? 'Détenu concerné :' : 'Target Inmate:'} </span>
                            <strong className="text-slate-900">{note.behaviorDetails.inmateName}</strong>
                            {note.behaviorDetails.inmateId && <span className="text-slate-500 font-mono ml-1">({note.behaviorDetails.inmateId})</span>}
                          </div>
                        )}
                      </div>

                      {note.behaviorDetails.witnessingOfficers && note.behaviorDetails.witnessingOfficers.length > 0 && (
                        <div className="text-xs text-slate-600">
                          <span className="text-[11px] font-semibold text-slate-500">
                            {language === 'fr' ? 'Agents témoins :' : 'Witnessing Officers:'} 
                          </span>
                          <span className="ml-1 text-slate-800 font-medium">
                            {note.behaviorDetails.witnessingOfficers.join(', ')}
                          </span>
                        </div>
                      )}

                      <div className="p-2.5 bg-white border border-purple-200 rounded text-xs text-purple-950">
                        <strong className="text-[10px] uppercase font-bold text-purple-800 block mb-0.5">
                          {language === 'fr' ? 'Conduite Opérationnelle Recommandée :' : 'Recommended Commander Countermeasure:'}
                        </strong>
                        <span>{note.behaviorDetails.recommendedResponse}</span>
                      </div>
                    </div>
                  )}

                  {/* PILLAR 3: FACILITY MAINTENANCE DETAILS */}
                  {isMaint && note.maintenanceDetails && (
                    <div className="p-3 bg-amber-50/40 border border-amber-200 rounded-lg space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/60 pb-2">
                        <div className="flex items-center gap-1.5">
                          <Wrench className="w-4 h-4 text-amber-700" />
                          <span className="text-xs font-bold text-slate-900">
                            {note.maintenanceDetails.equipmentOrAsset}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            OT: {note.maintenanceDetails.workOrderRef || 'N/A'}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-amber-200 text-slate-700 uppercase">
                            Corps d'état: {note.maintenanceDetails.trade.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="text-[11px]">
                          <span className="text-slate-500 block font-medium">
                            {language === 'fr' ? 'Accès Prestataire Externe :' : 'Contractor Escort Required:'}
                          </span>
                          <span className={`font-bold ${note.maintenanceDetails.contractorAccessRequired ? 'text-amber-700' : 'text-slate-700'}`}>
                            {note.maintenanceDetails.contractorAccessRequired 
                              ? (language === 'fr' ? `OUI — ${note.maintenanceDetails.contractorName || 'Technicien Agréé'}` : `YES — ${note.maintenanceDetails.contractorName || 'Vetted Contractor'}`)
                              : (language === 'fr' ? 'Non (Équipe Régie Interne)' : 'No (In-House Maintenance)')}
                          </span>
                        </div>

                        {note.maintenanceDetails.estimatedResolution && (
                          <div className="text-[11px]">
                            <span className="text-slate-500 block font-medium">
                              {language === 'fr' ? 'Délai Estimé de Rétablissement :' : 'Target Resolution ETA:'}
                            </span>
                            <span className="font-bold text-slate-800">
                              {note.maintenanceDetails.estimatedResolution}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Footer: Author stamp & Incoming Commander Visa */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    {/* Outgoing Author Stamp */}
                    <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{language === 'fr' ? 'Consigné par :' : 'Logged by:'} </span>
                      <strong className="text-slate-800">{note.authorCommander}</strong>
                      <span className="font-mono text-slate-400">({note.authorBadge})</span>
                    </div>

                    {/* Incoming Commander Acknowledgment Status / Button */}
                    <div>
                      {note.isAcknowledgedByIncoming ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>
                            {language === 'fr' ? 'Visé par :' : 'Visa by:'} {note.acknowledgedBy || incomingCommanderName}
                          </span>
                          {note.acknowledgedAt && (
                            <span className="text-[10px] font-mono text-emerald-700 ml-1">
                              ({note.acknowledgedAt})
                            </span>
                          )}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onAcknowledgeNote(note.id, `${incomingCommanderName} (${incomingCommanderBadge})`)}
                          className="w-full sm:w-auto px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 hover:border-indigo-300 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
                          title="Incoming Commander Visa certification"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{language === 'fr' ? 'Viser la Note (Commandant Entrant)' : 'Acknowledge Note (Incoming Command)'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: APPEND STRUCTURED HANDOVER NOTE */}
      {isAddNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                  <NotebookPen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {language === 'fr' ? 'Ajouter une Note de Relève Structurée' : 'Append Structured Handover Note'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'fr' ? 'Destiné au briefing et aux consignes du commandant entrant.' : 'Preserve operational continuity for the incoming command shift.'}
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsAddNoteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitNote} className="space-y-4 text-xs">
              {/* Category Selector Tabs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'fr' ? 'Pôle de la Consigne *' : 'Note Category Pillar *'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewCategory('inmate_watch');
                      if (newUrgency === 'routine') setNewUrgency('urgent');
                    }}
                    className={`p-2.5 rounded-lg border text-left flex items-start gap-2 transition-all cursor-pointer ${
                      newCategory === 'inmate_watch'
                        ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-200 text-rose-950 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Eye className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs">{language === 'fr' ? 'Surveillance Détenu' : 'Inmate Watch Order'}</div>
                      <div className="text-[10px] text-slate-500 font-normal">Suicide, CAT-A, séparations</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewCategory('unusual_behavior')}
                    className={`p-2.5 rounded-lg border text-left flex items-start gap-2 transition-all cursor-pointer ${
                      newCategory === 'unusual_behavior'
                        ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-200 text-purple-950 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs">{language === 'fr' ? 'Comportement Insolite' : 'Unusual Behavior'}</div>
                      <div className="text-[10px] text-slate-500 font-normal">Tensions, cliques, refus</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewCategory('maintenance')}
                    className={`p-2.5 rounded-lg border text-left flex items-start gap-2 transition-all cursor-pointer ${
                      newCategory === 'maintenance'
                        ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-200 text-amber-950 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Wrench className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs">{language === 'fr' ? 'Maintenance Infrastructure' : 'Facility Maintenance'}</div>
                      <div className="text-[10px] text-slate-500 font-normal">Serrures, caméras, pannes</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Title & Urgency */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'fr' ? 'Intitulé de la Note *' : 'Note Title *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      newCategory === 'inmate_watch' 
                        ? 'ex: Surveillance Suicide 15min - Détenu Mutua'
                        : newCategory === 'maintenance'
                        ? 'ex: Panne Électrique Serrure B-12'
                        : 'ex: Regroupement Suspect Cour de Promenade 2'
                    }
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'fr' ? 'Niveau d\'Urgence *' : 'Urgency Level *'}
                  </label>
                  <select
                    value={newUrgency}
                    onChange={e => setNewUrgency(e.target.value as HandoverNoteUrgency)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                  >
                    <option value="routine">{language === 'fr' ? 'Courant' : 'Routine'}</option>
                    <option value="elevated">{language === 'fr' ? 'Vigilance Accrue' : 'Elevated'}</option>
                    <option value="urgent">{language === 'fr' ? 'Urgent' : 'Urgent'}</option>
                    <option value="critical">{language === 'fr' ? 'Critique (Alerte Immédiate)' : 'Critical Protocol'}</option>
                  </select>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'fr' ? 'Localisation / Bâtiment / Cellule *' : 'Location / Block / Sentry Post *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'fr' ? 'ex: Bloc A - Aile Haute Sécurité, Cellule A-04' : 'e.g. Block A - Tier 1, Cell A-04'}
                  value={newLocation}
                  onChange={e => setNewLocation(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                />
              </div>

              {/* DYNAMIC FIELDS: INMATE WATCH */}
              {newCategory === 'inmate_watch' && (
                <div className="p-3.5 bg-rose-50/50 border border-rose-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900 border-b border-rose-200 pb-1.5">
                    <Eye className="w-4 h-4 text-rose-700" />
                    <span>{language === 'fr' ? 'Paramètres de Surveillance Individuelle du Détenu' : 'Individual Inmate Watch Parameters'}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Inmate auto-picker or manual entry */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {language === 'fr' ? 'Sélectionner / Saisir le Détenu' : 'Target Inmate (Roster / Manual)'}
                      </label>
                      {inmates.length > 0 && (
                        <select
                          onChange={e => handleSelectInmateForWatch(e.target.value)}
                          className="w-full p-1.5 mb-1.5 bg-white border border-rose-300 rounded text-xs text-slate-800"
                        >
                          <option value="">{language === 'fr' ? '-- Sélectionner depuis le registre --' : '-- Quick pick from roster --'}</option>
                          {inmates.slice(0, 20).map(inmate => (
                            <option key={inmate.id} value={inmate.id}>
                              {inmate.bookingNumber} - {inmate.firstName} {inmate.lastName} ({inmate.cellLocation || 'Bloc A'})
                            </option>
                          ))}
                        </select>
                      )}
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="text"
                          placeholder="Matricule (ex: KP-8821)"
                          value={watchInmateId}
                          onChange={e => setWatchInmateId(e.target.value)}
                          className="p-1.5 bg-white border border-rose-300 rounded text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Nom (ex: Rashid Al-Hassan)"
                          value={watchInmateName}
                          onChange={e => setWatchInmateName(e.target.value)}
                          className="p-1.5 bg-white border border-rose-300 rounded text-xs"
                        />
                      </div>
                    </div>

                    {/* Watch Protocol Level & Interval */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {language === 'fr' ? 'Régime de Surveillance & Fréquence' : 'Watch Protocol & Round Frequency'}
                      </label>
                      <select
                        value={watchLevel}
                        onChange={e => {
                          const lvl = e.target.value as InmateWatchLevel;
                          setWatchLevel(lvl);
                          if (lvl === 'suicide_watch_15m') setWatchInterval(15);
                          if (lvl === 'constant_1to1') setWatchInterval(5);
                          if (lvl === 'segregation_high_risk') setWatchInterval(30);
                          if (lvl === 'medical_convalescence') setWatchInterval(60);
                        }}
                        className="w-full p-1.5 mb-1.5 bg-white border border-rose-300 rounded text-xs font-semibold"
                      >
                        <option value="suicide_watch_15m">{language === 'fr' ? 'Vigilance Suicide (Fiche 15 min)' : 'Suicide Watch (15 min round)'}</option>
                        <option value="constant_1to1">{language === 'fr' ? 'Surveillance Continue 1:1' : 'Constant 1-on-1 Sentry'}</option>
                        <option value="segregation_high_risk">{language === 'fr' ? 'Isolement Disciplinaire CAT-A (30 min)' : 'CAT-A Segregation (30 min)'}</option>
                        <option value="keep_separate">{language === 'fr' ? 'Séparation Judiciaire / Protection' : 'Keep Separate Court Order'}</option>
                        <option value="medical_convalescence">{language === 'fr' ? 'Convalescence Médicale' : 'Medical Convalescence'}</option>
                      </select>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-600">{language === 'fr' ? 'Intervalle :' : 'Interval:'}</span>
                        <input
                          type="number"
                          min={5}
                          max={120}
                          value={watchInterval}
                          onChange={e => setWatchInterval(Number(e.target.value))}
                          className="w-20 p-1 bg-white border border-rose-300 rounded text-xs font-bold text-center"
                        />
                        <span className="text-[11px] text-slate-500">minutes</span>
                      </div>
                    </div>
                  </div>

                  {/* Keep Separated from */}
                  <div>
                    <label className="block text-[11px] font-bold text-purple-900 mb-1">
                      {language === 'fr' ? 'Incompatibilités & Détenus à Séparer Impérativement' : 'Keep Separated From (Court Orders / Gang Rivals)'}
                    </label>
                    <input
                      type="text"
                      placeholder="ex: KP-7940 (David Kimani), KP-8115 (Ali Nur)"
                      value={watchKeepSeparated}
                      onChange={e => setWatchKeepSeparated(e.target.value)}
                      className="w-full p-1.5 bg-white border border-purple-300 rounded text-xs"
                    />
                  </div>

                  {/* Special Watch Instructions */}
                  <div>
                    <label className="block text-[11px] font-bold text-rose-900 mb-1">
                      {language === 'fr' ? 'Consignes Particulières de Sécurité pour les Agents Entrants *' : 'Specific Orders for Incoming Sentry Sentinels *'}
                    </label>
                    <textarea
                      rows={2}
                      placeholder={language === 'fr' ? 'ex: Vérification visuelle des deux pupilles au guichet, pas de draps ordinaires, éclairage veilleuse permanent.' : 'e.g. Visual verification of breathing through hatch every 15 min. No plastic utensils.'}
                      value={watchInstructions}
                      onChange={e => setWatchInstructions(e.target.value)}
                      className="w-full p-2 bg-white border border-rose-300 rounded text-xs"
                    />
                  </div>
                </div>
              )}

              {/* DYNAMIC FIELDS: UNUSUAL BEHAVIOR */}
              {newCategory === 'unusual_behavior' && (
                <div className="p-3.5 bg-purple-50/50 border border-purple-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 border-b border-purple-200 pb-1.5">
                    <AlertCircle className="w-4 h-4 text-purple-700" />
                    <span>{language === 'fr' ? 'Caractérisation de l\'Anomalie Comportementale' : 'Anomalous Behavior Indicators'}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {language === 'fr' ? 'Type d\'Anomalie Observée *' : 'Observed Behavior Pattern *'}
                      </label>
                      <select
                        value={behavType}
                        onChange={e => setBehavType(e.target.value as any)}
                        className="w-full p-1.5 bg-white border border-purple-300 rounded text-xs font-semibold"
                      >
                        <option value="agitating_tensions">{language === 'fr' ? 'Agitation & Regroupements Mençants' : 'Agitating Tensions & Clusters'}</option>
                        <option value="withdrawn_depression">{language === 'fr' ? 'Repli Psychologique & Prostration' : 'Withdrawn Depression / Mutism'}</option>
                        <option value="gang_posturing">{language === 'fr' ? 'Provocations de Gangs / Rivalité' : 'Gang Posturing & Boundary Marking'}</option>
                        <option value="hoarding_contraband">{language === 'fr' ? 'Suspicion de Dissimulation / Trafic' : 'Contraband Hoarding Suspicion'}</option>
                        <option value="verbal_altercation">{language === 'fr' ? 'Altercation Verbale / Menaces' : 'Verbal Altercation with Guards'}</option>
                        <option value="paranoia_anxiety">{language === 'fr' ? 'Angoisse Sévère & Paranoïa' : 'Severe Paranoia / Hallucination'}</option>
                        <option value="unusual_solicitation">{language === 'fr' ? 'Tentative de Sollicitation Indue' : 'Unusual Solicitation / Bribing'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {language === 'fr' ? 'Détenu Suspect / Signalé' : 'Target Inmate Involved'}
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="text"
                          placeholder="Matricule (ex: KP-7712)"
                          value={behavInmateId}
                          onChange={e => setBehavInmateId(e.target.value)}
                          className="p-1.5 bg-white border border-purple-300 rounded text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Nom (ex: Ezekiel Baraza)"
                          value={behavInmateName}
                          onChange={e => setBehavInmateName(e.target.value)}
                          className="p-1.5 bg-white border border-purple-300 rounded text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {language === 'fr' ? 'Agents Témoins / Patrouille' : 'Witnessing Officers / Unit'}
                    </label>
                    <input
                      type="text"
                      placeholder="ex: Sgt. Jane Wanjiru, Cpl. Peter Mwangi"
                      value={behavWitnesses}
                      onChange={e => setBehavWitnesses(e.target.value)}
                      className="w-full p-1.5 bg-white border border-purple-300 rounded text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-purple-900 mb-1">
                      {language === 'fr' ? 'Mesure Opérationnelle Recommandée pour le Quart Entrant *' : 'Recommended Response / Order for Incoming Shift *'}
                    </label>
                    <input
                      type="text"
                      placeholder={language === 'fr' ? 'ex: Disperser les rassemblements > 3 détenus; surveillance psychologue au repas de 18h.' : 'e.g. Disperse groups > 3 along south bleachers. Ensure psy orderly presence at dinner.'}
                      value={behavResponse}
                      onChange={e => setBehavResponse(e.target.value)}
                      className="w-full p-2 bg-white border border-purple-300 rounded text-xs"
                    />
                  </div>
                </div>
              )}

              {/* DYNAMIC FIELDS: MAINTENANCE */}
              {newCategory === 'maintenance' && (
                <div className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 border-b border-amber-200 pb-1.5">
                    <Wrench className="w-4 h-4 text-amber-700" />
                    <span>{language === 'fr' ? 'Détails de l\'Intervention Technique & Prestataires' : 'Infrastructure & Work Order Parameters'}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {language === 'fr' ? 'Équipement / Ouvrage *' : 'Asset / Equipment *'}
                      </label>
                      <input
                        type="text"
                        placeholder="ex: Serrure électromagnétique Cellule B-12"
                        value={maintAsset}
                        onChange={e => setMaintAsset(e.target.value)}
                        className="w-full p-1.5 bg-white border border-amber-300 rounded text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {language === 'fr' ? 'Corps d\'État (Spécialité)' : 'Technical Trade'}
                      </label>
                      <select
                        value={maintTrade}
                        onChange={e => setMaintTrade(e.target.value as any)}
                        className="w-full p-1.5 bg-white border border-amber-300 rounded text-xs font-semibold"
                      >
                        <option value="locks_doors">{language === 'fr' ? 'Serrurerie & Blindages' : 'Locks & Doors'}</option>
                        <option value="electrical">{language === 'fr' ? 'Électricité & Groupes' : 'Electrical & Generators'}</option>
                        <option value="cctv_sensors">{language === 'fr' ? 'CCTV & Capteurs Sécurité' : 'CCTV & Sensors'}</option>
                        <option value="perimeter_fencing">{language === 'fr' ? 'Clôture & Détection Périmétrique' : 'Perimeter Fence'}</option>
                        <option value="plumbing">{language === 'fr' ? 'Plomberie & Réseaux d\'eau' : 'Plumbing & Water'}</option>
                        <option value="hvac">{language === 'fr' ? 'Ventilation & Désenfumage' : 'HVAC & Extraction'}</option>
                        <option value="structural">{language === 'fr' ? 'Génie Civil & Maçonnerie' : 'Civil / Structural'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {language === 'fr' ? 'N° Ordre de Travail (OT)' : 'Work Order Ref (WO)'}
                      </label>
                      <input
                        type="text"
                        placeholder="ex: WO-2026-0892"
                        value={maintWorkOrder}
                        onChange={e => setMaintWorkOrder(e.target.value)}
                        className="w-full p-1.5 bg-white border border-amber-300 rounded text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-2.5 bg-white border border-amber-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <input
                          type="checkbox"
                          id="chkContractor"
                          checked={maintContractorRequired}
                          onChange={e => setMaintContractorRequired(e.target.checked)}
                          className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                        />
                        <label htmlFor="chkContractor" className="text-xs font-bold text-amber-950 cursor-pointer">
                          {language === 'fr' ? 'Accès Prestataire Externe Requis' : 'External Contractor Escort Required'}
                        </label>
                      </div>
                      {maintContractorRequired && (
                        <input
                          type="text"
                          placeholder={language === 'fr' ? 'Nom société / technicien (ex: SecureLock Ltd)' : 'Company / Technician name'}
                          value={maintContractorName}
                          onChange={e => setMaintContractorName(e.target.value)}
                          className="w-full p-1.5 bg-amber-50/50 border border-amber-300 rounded text-xs mt-1.5"
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {language === 'fr' ? 'Délai d\'Intervention / Résolution' : 'Estimated Resolution ETA'}
                      </label>
                      <input
                        type="text"
                        placeholder="ex: Aujourd'hui, 16:30"
                        value={maintResolutionEta}
                        onChange={e => setMaintResolutionEta(e.target.value)}
                        className="w-full p-1.5 bg-white border border-amber-300 rounded text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Full Narrative Content */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'fr' ? 'Description Détaillée & Constatations du Quart *' : 'Detailed Narrative & Operational Instructions *'}
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder={language === 'fr' ? 'Rédiger l\'exposé complet de la situation et les consignes impératives pour la relève...' : 'Provide complete operational context, observations, and instructions for the incoming watch commander...'}
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                />
              </div>

              {/* Author Preview Stamp */}
              <div className="p-3 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-between text-slate-600 text-xs">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>{language === 'fr' ? 'Commandant Rédacteur :' : 'Originating Commander:'} <strong>{outgoingCommanderName}</strong> ({outgoingCommanderBadge})</span>
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  Horodatage immédiat
                </span>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddNoteModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold cursor-pointer transition-all"
                >
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{language === 'fr' ? 'Consigner & Transmettre à la Relève' : 'Record & Transmit to Incoming Shift'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
