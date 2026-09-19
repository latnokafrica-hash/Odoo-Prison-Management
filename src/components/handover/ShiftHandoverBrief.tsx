import React, { useState, useMemo } from 'react';
import { 
  Language, 
  UserRole, 
  PrisonFacility, 
  Inmate, 
  ShiftHandoverBriefData, 
  FacilityRiskItem, 
  PendingTaskItem, 
  EquipmentInventoryItem, 
  CommanderSignOff,
  ShiftType,
  RiskSeverity,
  TaskPriority,
  TaskStatus,
  EquipmentCategory
} from '../../types';
import { INITIAL_HANDOVER_BRIEFS } from '../../data/handoverData';
import { SHIFT_CONFIGS } from '../../data/staffDutyData';
import { SignatureCanvasModal } from './SignatureCanvasModal';
import { HandoverPrintModal } from './HandoverPrintModal';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Key, 
  Users, 
  Building2, 
  Printer, 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  FileCheck, 
  ArrowRight, 
  History, 
  PenTool, 
  ChevronRight, 
  X, 
  Lock, 
  Radio, 
  Check, 
  RefreshCw,
  Eye,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

interface ShiftHandoverBriefProps {
  language: Language;
  facilities?: PrisonFacility[];
  inmates?: Inmate[];
  currentUserRole?: UserRole;
  onNavigateToRoster?: () => void;
  onNavigateToDashboard?: () => void;
}

export const ShiftHandoverBrief: React.FC<ShiftHandoverBriefProps> = ({
  language,
  facilities = [],
  inmates = [],
  currentUserRole = 'superintendent',
  onNavigateToRoster,
  onNavigateToDashboard,
}) => {
  // Handover Sessions State
  const [handovers, setHandovers] = useState<ShiftHandoverBriefData[]>(INITIAL_HANDOVER_BRIEFS);
  const [activeHandoverId, setActiveHandoverId] = useState<string>(INITIAL_HANDOVER_BRIEFS[0].id);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'risks' | 'tasks' | 'equipment' | 'signoffs'>('risks');

  // Filters
  const [filterRiskSeverity, setFilterRiskSeverity] = useState<string>('all');
  const [filterTaskStatus, setFilterTaskStatus] = useState<string>('all');
  const [filterEquipmentCategory, setFilterEquipmentCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [signatureType, setSignatureType] = useState<'outgoing' | 'incoming' | 'governor'>('outgoing');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isAddRiskModalOpen, setIsAddRiskModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false);

  // New Risk Form State
  const [newRiskData, setNewRiskData] = useState<Partial<FacilityRiskItem>>({
    title: '',
    category: 'security_inmate',
    severity: 'HIGH',
    location: '',
    description: '',
    mitigation: '',
    reportedBy: 'Duty Sentinel',
  });

  // New Task Form State
  const [newTaskData, setNewTaskData] = useState<Partial<PendingTaskItem>>({
    title: '',
    description: '',
    priority: 'high',
    assignedRole: 'Tier Floor Sentinel',
    assignedOfficer: 'Duty Officer',
    dueTime: '16:00',
    category: 'maintenance',
    status: 'pending',
  });

  // New Handover Session Form State
  const [newSessionFacilityId, setNewSessionFacilityId] = useState(facilities[0]?.id || 'fac-01');
  const [newSessionOutgoingShift, setNewSessionOutgoingShift] = useState<ShiftType>('morning');
  const [newSessionIncomingShift, setNewSessionIncomingShift] = useState<ShiftType>('afternoon');

  // Current active handover object
  const currentHandover = useMemo(() => {
    return handovers.find(h => h.id === activeHandoverId) || handovers[0];
  }, [handovers, activeHandoverId]);

  // Status badge styling
  const getStatusBadge = (status: ShiftHandoverBriefData['status']) => {
    switch (status) {
      case 'draft':
        return {
          bg: 'bg-slate-100 text-slate-800 border-slate-300',
          label: language === 'fr' ? 'Brouillon en Cours' : 'Draft In-Progress',
        };
      case 'outgoing_signed':
        return {
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          label: language === 'fr' ? 'Commandant Sortant Signé' : 'Outgoing Commander Signed',
        };
      case 'fully_signed':
        return {
          bg: 'bg-indigo-100 text-indigo-900 border-indigo-300',
          label: language === 'fr' ? 'Garde Transmise & Acceptée' : 'Custody Accepted & Signed',
        };
      case 'governor_certified':
        return {
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          label: language === 'fr' ? 'Visé par le Gouverneur' : 'Certified by Governor',
        };
      case 'archived':
        return {
          bg: 'bg-slate-200 text-slate-700 border-slate-400',
          label: language === 'fr' ? 'Archivé au Registre' : 'Archived Record',
        };
      default:
        return { bg: 'bg-slate-100 text-slate-800 border-slate-300', label: status };
    }
  };

  // Handle digital signature application
  const handleApplySignature = (signOff: CommanderSignOff) => {
    setHandovers(prev => prev.map(h => {
      if (h.id !== currentHandover.id) return h;

      const updated = { ...h };
      if (signatureType === 'outgoing') {
        updated.outgoingSignOff = signOff;
        updated.status = 'outgoing_signed';
      } else if (signatureType === 'incoming') {
        updated.incomingSignOff = signOff;
        updated.status = 'fully_signed';
        // Mark all risks as acknowledged by incoming commander
        updated.risks = updated.risks.map(r => ({ ...r, isAcknowledgedByIncoming: true }));
      } else if (signatureType === 'governor') {
        updated.governorSignOff = signOff;
        updated.status = 'governor_certified';
      }

      updated.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
      return updated;
    }));
  };

  // Toggle risk acknowledgment
  const handleToggleRiskAck = (riskId: string) => {
    setHandovers(prev => prev.map(h => {
      if (h.id !== currentHandover.id) return h;
      return {
        ...h,
        risks: h.risks.map(r => r.id === riskId ? { ...r, isAcknowledgedByIncoming: !r.isAcknowledgedByIncoming } : r)
      };
    }));
  };

  // Update task status
  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setHandovers(prev => prev.map(h => {
      if (h.id !== currentHandover.id) return h;
      return {
        ...h,
        tasks: h.tasks.map(t => {
          if (t.id !== taskId) return t;
          return {
            ...t,
            status: newStatus,
            completedAt: newStatus === 'completed' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined
          };
        })
      };
    }));
  };

  // Add new risk item
  const handleCreateRisk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRiskData.title) return;

    const newRisk: FacilityRiskItem = {
      id: `risk-${Date.now()}`,
      title: newRiskData.title || '',
      category: newRiskData.category || 'security_inmate',
      severity: newRiskData.severity || 'HIGH',
      location: newRiskData.location || 'Central Facility',
      description: newRiskData.description || '',
      mitigation: newRiskData.mitigation || 'Immediate physical inspection ordered.',
      reportedBy: newRiskData.reportedBy || 'Duty Commander',
      reportedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAcknowledgedByIncoming: false,
    };

    setHandovers(prev => prev.map(h => {
      if (h.id !== currentHandover.id) return h;
      return { ...h, risks: [newRisk, ...h.risks] };
    }));

    setIsAddRiskModalOpen(false);
    setNewRiskData({
      title: '',
      category: 'security_inmate',
      severity: 'HIGH',
      location: '',
      description: '',
      mitigation: '',
      reportedBy: 'Duty Sentinel',
    });
  };

  // Add new pending task item
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskData.title) return;

    const newTask: PendingTaskItem = {
      id: `task-${Date.now()}`,
      title: newTaskData.title || '',
      description: newTaskData.description || '',
      priority: newTaskData.priority || 'high',
      assignedRole: newTaskData.assignedRole || 'Tier Sentinel',
      assignedOfficer: newTaskData.assignedOfficer || 'Incoming Watch Lead',
      dueTime: newTaskData.dueTime || '18:00',
      category: newTaskData.category || 'maintenance',
      status: 'pending',
    };

    setHandovers(prev => prev.map(h => {
      if (h.id !== currentHandover.id) return h;
      return { ...h, tasks: [...h.tasks, newTask] };
    }));

    setIsAddTaskModalOpen(false);
    setNewTaskData({
      title: '',
      description: '',
      priority: 'high',
      assignedRole: 'Tier Floor Sentinel',
      assignedOfficer: 'Duty Officer',
      dueTime: '16:00',
      category: 'maintenance',
      status: 'pending',
    });
  };

  // Update counted quantity or verify all equipment
  const handleVerifyAllEquipment = () => {
    setHandovers(prev => prev.map(h => {
      if (h.id !== currentHandover.id) return h;
      return {
        ...h,
        equipment: h.equipment.map(e => ({
          ...e,
          countedQty: e.expectedQty,
          verifiedByBoth: true
        }))
      };
    }));
  };

  const handleUpdateEquipmentCount = (equipmentId: string, count: number) => {
    setHandovers(prev => prev.map(h => {
      if (h.id !== currentHandover.id) return h;
      return {
        ...h,
        equipment: h.equipment.map(e => {
          if (e.id !== equipmentId) return e;
          return {
            ...e,
            countedQty: count,
            verifiedByBoth: true,
            discrepancyNote: count !== e.expectedQty ? `Discrepancy: ${count - e.expectedQty} variance logged.` : undefined
          };
        })
      };
    }));
  };

  // Create new handover session
  const handleCreateNewSession = (e: React.FormEvent) => {
    e.preventDefault();
    const targetFacility = facilities.find(f => f.id === newSessionFacilityId) || facilities[0];
    const facilityName = targetFacility?.name || 'Central Maximum Penitentiary';
    const refNum = `SEC/HOB/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(handovers.length + 1).padStart(3, '0')}`;

    const newSession: ShiftHandoverBriefData = {
      id: `hob-${Date.now()}`,
      referenceNumber: refNum,
      facilityId: newSessionFacilityId,
      facilityName,
      date: new Date().toISOString().split('T')[0],
      outgoingShift: newSessionOutgoingShift,
      incomingShift: newSessionIncomingShift,
      status: 'draft',
      headcountSummary: {
        totalInmates: targetFacility?.currentInmates || 850,
        certifiedCapacity: targetFacility?.capacity || 800,
        remandCount: 220,
        convictedCount: (targetFacility?.currentInmates || 850) - 220,
        highSecurityCount: 42,
        solitaryCount: 6,
        hospitalCount: 14,
        courtTransitCount: 4,
        rollCallDiscrepancy: 0,
      },
      risks: [...currentHandover.risks.map(r => ({ ...r, id: `risk-${Date.now()}-${r.id}`, isAcknowledgedByIncoming: false }))],
      tasks: [...currentHandover.tasks.map(t => ({ ...t, id: `task-${Date.now()}-${t.id}`, status: 'pending' as const }))],
      equipment: [...currentHandover.equipment.map(e => ({ ...e, verifiedByBoth: false }))],
      outgoingSignOff: null,
      incomingSignOff: null,
      governorSignOff: null,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setHandovers([newSession, ...handovers]);
    setActiveHandoverId(newSession.id);
    setIsNewSessionModalOpen(false);
  };

  // Filtered lists
  const filteredRisks = useMemo(() => {
    return currentHandover.risks.filter(r => {
      if (filterRiskSeverity !== 'all' && r.severity !== filterRiskSeverity) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return r.title.toLowerCase().includes(q) || r.location.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [currentHandover.risks, filterRiskSeverity, searchQuery]);

  const filteredTasks = useMemo(() => {
    return currentHandover.tasks.filter(t => {
      if (filterTaskStatus !== 'all' && t.status !== filterTaskStatus) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return t.title.toLowerCase().includes(q) || t.assignedOfficer.toLowerCase().includes(q) || t.assignedRole.toLowerCase().includes(q);
      }
      return true;
    });
  }, [currentHandover.tasks, filterTaskStatus, searchQuery]);

  const filteredEquipment = useMemo(() => {
    return currentHandover.equipment.filter(e => {
      if (filterEquipmentCategory !== 'all' && e.category !== filterEquipmentCategory) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return e.name.toLowerCase().includes(q) || e.storageLocation.toLowerCase().includes(q);
      }
      return true;
    });
  }, [currentHandover.equipment, filterEquipmentCategory, searchQuery]);

  // Summary counts
  const unacknowledgedRisksCount = currentHandover.risks.filter(r => !r.isAcknowledgedByIncoming).length;
  const pendingTasksCount = currentHandover.tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
  const equipmentDiscrepanciesCount = currentHandover.equipment.filter(e => e.countedQty !== e.expectedQty || e.condition !== 'operational').length;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      
      {/* Top Breadcrumb & Actions Bar */}
      <div className="bg-slate-900 text-white rounded-xl p-5 shadow-lg border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Title and Session Switcher */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-indigo-300 font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{language === 'fr' ? 'SÉCURITÉ PÉNITENTIAIRE & PROTOCOLE DE GARDE' : 'PRISON SECURITY & WATCH PROTOCOL'}</span>
              <span>&bull;</span>
              <span className="text-amber-300 font-bold">{currentHandover.referenceNumber}</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <span>{language === 'fr' ? 'Passation de Quart (Shift Handover)' : 'Shift Handover Command Brief'}</span>
              </h1>
              
              {/* Session Selector Dropdown */}
              <div className="relative inline-block">
                <select
                  value={activeHandoverId}
                  onChange={e => setActiveHandoverId(e.target.value)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-lg text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  {handovers.map(h => (
                    <option key={h.id} value={h.id}>
                      {h.referenceNumber} &bull; {h.facilityName} ({h.outgoingShift} &rarr; {h.incomingShift})
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Badge */}
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(currentHandover.status).bg}`}>
                {getStatusBadge(currentHandover.status).label}
              </span>
            </div>

            <p className="text-xs text-slate-400">
              {currentHandover.facilityName} &bull; {language === 'fr' ? 'Quart Cédant :' : 'Relieved Shift :'} <strong className="text-slate-200 capitalize">{currentHandover.outgoingShift}</strong> &rarr; {language === 'fr' ? 'Quart Prenant :' : 'Relieving Shift :'} <strong className="text-slate-200 capitalize">{currentHandover.incomingShift}</strong> &bull; {currentHandover.date}
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Outgoing Sign Button */}
            {!currentHandover.outgoingSignOff && (
              <button
                onClick={() => {
                  setSignatureType('outgoing');
                  setIsSignatureModalOpen(true);
                }}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
              >
                <PenTool className="w-4 h-4 text-amber-200" />
                <span>{language === 'fr' ? 'Signer Sortant' : 'Sign Outgoing'}</span>
              </button>
            )}

            {/* Incoming Sign Button */}
            {currentHandover.outgoingSignOff && !currentHandover.incomingSignOff && (
              <button
                onClick={() => {
                  setSignatureType('incoming');
                  setIsSignatureModalOpen(true);
                }}
                className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 animate-pulse"
              >
                <FileCheck className="w-4 h-4 text-indigo-200" />
                <span>{language === 'fr' ? 'Prendre la Garde (Entrant)' : 'Accept Custody (Incoming)'}</span>
              </button>
            )}

            {/* Governor Ratification Button */}
            {currentHandover.incomingSignOff && !currentHandover.governorSignOff && currentUserRole === 'superintendent' && (
              <button
                onClick={() => {
                  setSignatureType('governor');
                  setIsSignatureModalOpen(true);
                }}
                className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-200" />
                <span>{language === 'fr' ? 'Viser (Gouverneur)' : 'Governor Ratification'}</span>
              </button>
            )}

            {/* Print Official Dossier */}
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
              title="Print Official Handover Document"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'fr' ? 'Imprimer le P.V.' : 'Print Dossier'}</span>
            </button>

            {/* New Session Button */}
            <button
              onClick={() => setIsNewSessionModalOpen(true)}
              className="px-3 py-2 bg-[#714B67] hover:bg-[#85597a] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              title="Initiate New Shift Handover Session"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'fr' ? 'Nouvelle Relève' : 'New Handover'}</span>
            </button>
          </div>

        </div>

        {/* Headcount Status & Custody Metrics Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="bg-slate-800/70 p-2.5 rounded-lg border border-slate-700/60">
            <span className="text-slate-400 block text-[11px]">{language === 'fr' ? 'Effectif Présent' : 'Total Inmates'}</span>
            <span className="text-base font-bold text-white">{currentHandover.headcountSummary.totalInmates}</span>
            <span className="text-[10px] text-slate-400 block">/ {currentHandover.headcountSummary.certifiedCapacity} Cap.</span>
          </div>

          <div className="bg-slate-800/70 p-2.5 rounded-lg border border-slate-700/60">
            <span className="text-slate-400 block text-[11px]">{language === 'fr' ? 'Prévenus (Remand)' : 'Remand Count'}</span>
            <span className="text-base font-bold text-indigo-300">{currentHandover.headcountSummary.remandCount}</span>
            <span className="text-[10px] text-slate-400 block">{currentHandover.headcountSummary.convictedCount} {language === 'fr' ? 'Condamnés' : 'Convicted'}</span>
          </div>

          <div className="bg-slate-800/70 p-2.5 rounded-lg border border-slate-700/60">
            <span className="text-slate-400 block text-[11px]">{language === 'fr' ? 'Haute Sécurité CAT A' : 'High Threat (CAT A)'}</span>
            <span className="text-base font-bold text-rose-400">{currentHandover.headcountSummary.highSecurityCount}</span>
            <span className="text-[10px] text-rose-300/80 block">{currentHandover.headcountSummary.solitaryCount} {language === 'fr' ? 'en Isolement' : 'in Solitary'}</span>
          </div>

          <div className="bg-slate-800/70 p-2.5 rounded-lg border border-slate-700/60">
            <span className="text-slate-400 block text-[11px]">{language === 'fr' ? 'Infirmerie / Hôpital' : 'Medical Infirmary'}</span>
            <span className="text-base font-bold text-amber-300">{currentHandover.headcountSummary.hospitalCount}</span>
            <span className="text-[10px] text-slate-400 block">{language === 'fr' ? 'Soins continus' : 'Under daily care'}</span>
          </div>

          <div className="bg-slate-800/70 p-2.5 rounded-lg border border-slate-700/60">
            <span className="text-slate-400 block text-[11px]">{language === 'fr' ? 'Convois au Tribunal' : 'Court Convoys Transit'}</span>
            <span className="text-base font-bold text-sky-300">{currentHandover.headcountSummary.courtTransitCount}</span>
            <span className="text-[10px] text-slate-400 block">{language === 'fr' ? 'En transit armé' : 'Armed escort'}</span>
          </div>

          <div className="bg-slate-800/70 p-2.5 rounded-lg border border-slate-700/60">
            <span className="text-slate-400 block text-[11px]">{language === 'fr' ? 'Écart d\'Appel (Roll Call)' : 'Roll-Call Discrepancy'}</span>
            <span className={`text-base font-bold ${currentHandover.headcountSummary.rollCallDiscrepancy === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {currentHandover.headcountSummary.rollCallDiscrepancy === 0 ? '0 (100% OK)' : `${currentHandover.headcountSummary.rollCallDiscrepancy} MISMATCH`}
            </span>
            <span className="text-[10px] text-slate-400 block">{language === 'fr' ? 'Vérifié par deux officiers' : 'Two-officer verified'}</span>
          </div>
        </div>

      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-1.5 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          
          {/* Tab: Risks */}
          <button
            onClick={() => setActiveTab('risks')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'risks'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{language === 'fr' ? 'Risques Établissement' : 'Facility Risks'}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'risks' ? 'bg-amber-800 text-amber-100' : 'bg-amber-100 text-amber-800'
            }`}>
              {currentHandover.risks.length}
            </span>
            {unacknowledgedRisksCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </button>

          {/* Tab: Tasks */}
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'tasks'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{language === 'fr' ? 'Tâches & Consignes en Cours' : 'Pending Tasks & Orders'}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'tasks' ? 'bg-indigo-800 text-indigo-100' : 'bg-indigo-100 text-indigo-800'
            }`}>
              {currentHandover.tasks.length}
            </span>
          </button>

          {/* Tab: Equipment */}
          <button
            onClick={() => setActiveTab('equipment')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'equipment'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>{language === 'fr' ? 'Inventaire Clés & Armurerie' : 'Equipment & Armory Inventory'}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'equipment' ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-800'
            }`}>
              {currentHandover.equipment.length}
            </span>
            {equipmentDiscrepanciesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                {equipmentDiscrepanciesCount} {language === 'fr' ? 'écart' : 'alert'}
              </span>
            )}
          </button>

          {/* Tab: Sign-Offs */}
          <button
            onClick={() => setActiveTab('signoffs')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'signoffs'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>{language === 'fr' ? 'Signatures & P.V.' : 'Command Sign-Offs & Oath'}</span>
            {currentHandover.status === 'governor_certified' && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
          </button>
        </div>

        {/* Quick Search Input */}
        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={language === 'fr' ? 'Filtrer les éléments...' : 'Search brief items...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
          />
        </div>
      </div>

      {/* TAB CONTENT 1: FACILITY RISKS */}
      {activeTab === 'risks' && (
        <div className="space-y-4">
          
          {/* Subheader and Add Risk Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>{language === 'fr' ? 'Registre des Risques Immédiats & Vigilance' : 'Current Facility Risks & Operational Threat Matrix'}</span>
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'fr' 
                  ? 'Détenus dangereux, défaillances de serrures, périmètre et alertes psychiatriques nécessitant transmission.' 
                  : 'High-threat inmates, cell door faults, perimeter observations, and psychiatric watches.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Severity Filter */}
              <select
                value={filterRiskSeverity}
                onChange={e => setFilterRiskSeverity(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
              >
                <option value="all">{language === 'fr' ? 'Toutes les gravités' : 'All Severities'}</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>

              <button
                onClick={() => setIsAddRiskModalOpen(true)}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'fr' ? '+ Signaler un Risque' : '+ Log Facility Risk'}</span>
              </button>
            </div>
          </div>

          {/* Risks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRisks.map(risk => (
              <div 
                key={risk.id}
                className={`p-4 rounded-xl border transition-all ${
                  risk.severity === 'CRITICAL' ? 'bg-rose-50/40 border-rose-200 shadow-xs' :
                  risk.severity === 'HIGH' ? 'bg-amber-50/30 border-amber-200' :
                  'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] tracking-wider uppercase ${
                      risk.severity === 'CRITICAL' ? 'bg-rose-600 text-white' :
                      risk.severity === 'HIGH' ? 'bg-amber-500 text-white' :
                      'bg-slate-200 text-slate-800'
                    }`}>
                      {risk.severity}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">{risk.reportedAt}</span>
                  </div>

                  {/* Acknowledgment Toggle */}
                  <button
                    onClick={() => handleToggleRiskAck(risk.id)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all ${
                      risk.isAcknowledgedByIncoming
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300'
                    }`}
                    title={language === 'fr' ? 'Cliquer pour attester la prise en compte' : 'Click to toggle incoming acknowledgment'}
                  >
                    {risk.isAcknowledgedByIncoming ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{language === 'fr' ? 'Visé par Prenant' : 'Acknowledged'}</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>{language === 'fr' ? 'À valider' : 'Pending Ack'}</span>
                      </>
                    )}
                  </button>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-1">{risk.title}</h3>
                <p className="text-xs text-slate-600 mb-2.5 leading-relaxed">{risk.description}</p>

                <div className="space-y-1.5 text-xs bg-white/80 p-2.5 rounded-lg border border-slate-200/80">
                  <div className="flex items-center gap-1 text-[11px] text-indigo-900">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <strong>{language === 'fr' ? 'Localisation :' : 'Location :'}</strong> {risk.location}
                  </div>
                  <div className="text-[11px] text-slate-700">
                    <strong className="text-emerald-800">{language === 'fr' ? 'Mesure d\'Atténuation :' : 'Mitigation Action :'}</strong> {risk.mitigation}
                  </div>
                  <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
                    <span>{language === 'fr' ? 'Rapporteur :' : 'Reported By :'} {risk.reportedBy}</span>
                    <span className="font-mono">{risk.category}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB CONTENT 2: PENDING TASKS */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>{language === 'fr' ? 'Consignes Opérationnelles & Tâches Transmises' : 'Pending Operational Directives & Task Handover'}</span>
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'fr' 
                  ? 'Retours d\'audiences, distribution des repas, rondes d\'armurerie et comptages du soir à exécuter.' 
                  : 'Court return intakes, meal distributions, lock-down headcounts, and scheduled patrols.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterTaskStatus}
                onChange={e => setFilterTaskStatus(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
              >
                <option value="all">{language === 'fr' ? 'Tous les statuts' : 'All Statuses'}</option>
                <option value="pending">{language === 'fr' ? 'En attente' : 'Pending'}</option>
                <option value="in_progress">{language === 'fr' ? 'En cours' : 'In Progress'}</option>
                <option value="completed">{language === 'fr' ? 'Terminé' : 'Completed'}</option>
              </select>

              <button
                onClick={() => setIsAddTaskModalOpen(true)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'fr' ? '+ Ajouter une Tâche' : '+ Add Directive'}</span>
              </button>
            </div>
          </div>

          {/* Tasks Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="p-3 w-16 text-center">{language === 'fr' ? 'Heure' : 'Due'}</th>
                    <th className="p-3 w-24">{language === 'fr' ? 'Priorité' : 'Priority'}</th>
                    <th className="p-3">{language === 'fr' ? 'Tâche & Directives' : 'Task & Directives'}</th>
                    <th className="p-3 w-48">{language === 'fr' ? 'Responsable' : 'Assigned Officer'}</th>
                    <th className="p-3 w-36 text-center">{language === 'fr' ? 'Statut' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTasks.map(task => (
                    <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-indigo-900 text-center">
                        {task.dueTime}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          task.priority === 'urgent' ? 'bg-rose-100 text-rose-800' :
                          task.priority === 'high' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="p-3">
                        <strong className="text-slate-900 block">{task.title}</strong>
                        <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">{task.description}</p>
                        {task.notes && (
                          <div className="mt-1 text-[11px] text-amber-800 font-medium">
                            &bull; {task.notes}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-slate-700">
                        <div className="font-semibold">{task.assignedOfficer}</div>
                        <div className="text-[11px] text-slate-500">{task.assignedRole}</div>
                      </td>
                      <td className="p-3 text-center">
                        <select
                          value={task.status}
                          onChange={e => handleUpdateTaskStatus(task.id, e.target.value as TaskStatus)}
                          className={`w-full p-1.5 rounded-lg text-[11px] font-semibold border cursor-pointer ${
                            task.status === 'completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                            task.status === 'in_progress' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                            'bg-slate-50 text-slate-700 border-slate-300'
                          }`}
                        >
                          <option value="pending">{language === 'fr' ? 'En attente' : 'Pending'}</option>
                          <option value="in_progress">{language === 'fr' ? 'En cours' : 'In Progress'}</option>
                          <option value="completed">{language === 'fr' ? 'Terminé' : 'Completed'}</option>
                          <option value="deferred">{language === 'fr' ? 'Reporté' : 'Deferred'}</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT 3: EQUIPMENT & ARMORY INVENTORY */}
      {activeTab === 'equipment' && (
        <div className="space-y-4">
          
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-600" />
                <span>{language === 'fr' ? 'Inventaire Conjoint des Clés Maîtresses, Armements & Matériels' : 'Joint Armory Munitions, Master Keys & Protective Gear Audit'}</span>
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'fr' 
                  ? 'Vérification physique contradictoire obligatoire à chaque changement de quart.' 
                  : 'Mandatory joint dual-commander physical count before assuming custodial command.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterEquipmentCategory}
                onChange={e => setFilterEquipmentCategory(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
              >
                <option value="all">{language === 'fr' ? 'Toutes les catégories' : 'All Categories'}</option>
                <option value="keys_security">{language === 'fr' ? 'Clés de sécurité' : 'Security Keys'}</option>
                <option value="armory_firearms">{language === 'fr' ? 'Armes & Munitions' : 'Armory & Munitions'}</option>
                <option value="tactical_protection">{language === 'fr' ? 'Protection & Anti-Émeute' : 'Tactical & Riot Gear'}</option>
                <option value="radios_comms">{language === 'fr' ? 'Radios UHF & Batteries' : 'Radios & Comms'}</option>
                <option value="body_cameras">{language === 'fr' ? 'Caméras Piéton Axon' : 'Body Cameras'}</option>
                <option value="restraints_cuffs">{language === 'fr' ? 'Menottes & Fers' : 'Restraints & Cuffs'}</option>
              </select>

              <button
                onClick={handleVerifyAllEquipment}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
                title="Mark all counted quantities as reconciled"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{language === 'fr' ? 'Valider Tout Conforme' : 'Verify All Match'}</span>
              </button>
            </div>
          </div>

          {/* Equipment Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="p-3">{language === 'fr' ? 'Désignation du Matériel' : 'Equipment Name & Storage'}</th>
                    <th className="p-3 w-28 text-center">{language === 'fr' ? 'Attendu' : 'Expected'}</th>
                    <th className="p-3 w-32 text-center">{language === 'fr' ? 'Compté' : 'Counted'}</th>
                    <th className="p-3 w-28">{language === 'fr' ? 'État' : 'Condition'}</th>
                    <th className="p-3">{language === 'fr' ? 'Observations & Écarts' : 'Discrepancy Notes'}</th>
                    <th className="p-3 w-24 text-center">{language === 'fr' ? 'Vérifié' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEquipment.map(item => {
                    const hasDiscrepancy = item.countedQty !== item.expectedQty || item.condition !== 'operational';

                    return (
                      <tr key={item.id} className={`hover:bg-slate-50/80 transition-colors ${hasDiscrepancy ? 'bg-amber-50/30' : ''}`}>
                        <td className="p-3">
                          <strong className="text-slate-900 block">{item.name}</strong>
                          <span className="text-slate-500 text-[11px] block mt-0.5">
                            {item.storageLocation}
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono text-slate-600">
                          {item.expectedQty} {item.unit}
                        </td>
                        <td className="p-3 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              value={item.countedQty}
                              onChange={e => handleUpdateEquipmentCount(item.id, parseInt(e.target.value) || 0)}
                              className={`w-16 p-1 text-center font-mono font-bold rounded border text-xs ${
                                item.countedQty !== item.expectedQty 
                                  ? 'border-rose-400 bg-rose-50 text-rose-900' 
                                  : 'border-slate-300 bg-white text-slate-900'
                              }`}
                            />
                            <span className="text-[10px] text-slate-500">{item.unit}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.condition === 'operational' ? 'bg-emerald-100 text-emerald-800' :
                            item.condition === 'maintenance' ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {item.condition}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 text-[11px]">
                          {item.discrepancyNote || (language === 'fr' ? 'Conforme, aucune anomalie' : 'Operational, zero variance')}
                        </td>
                        <td className="p-3 text-center">
                          {item.verifiedByBoth ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{language === 'fr' ? 'OK' : 'Verified'}</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">
                              {language === 'fr' ? 'À pointer' : 'Pending'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT 4: SIGN-OFFS & RATIFICATION */}
      {activeTab === 'signoffs' && (
        <div className="space-y-6">
          
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>{language === 'fr' ? 'Protocole Légal de Passation de Garde & Signatures Numériques' : 'Official Custodial Handover Protocol & Digital Signatures'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'fr'
                ? 'Conformément aux directives pénitentiaires, la responsabilité légale de la garde est officiellement transférée après signature mutuelle.'
                : 'Pursuant to national corrections standing orders, legal command transfer takes effect upon mutual digital sign-off.'}
            </p>
          </div>

          {/* Three Column Sign-Off Stages */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 1. Outgoing Commander */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <span className="text-xs font-bold text-amber-900 uppercase">
                    1. {language === 'fr' ? 'Commandant Sortant' : 'Outgoing Commander'}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    currentHandover.outgoingSignOff ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {currentHandover.outgoingSignOff ? (language === 'fr' ? 'Signé' : 'Signed') : (language === 'fr' ? 'En attente' : 'Pending')}
                  </span>
                </div>

                {currentHandover.outgoingSignOff ? (
                  <div className="space-y-3 text-xs">
                    <div>
                      <strong className="text-sm font-bold text-slate-900 block">{currentHandover.outgoingSignOff.commanderName}</strong>
                      <span className="text-slate-500 text-[11px] block">{currentHandover.outgoingSignOff.rank} (Matricule: {currentHandover.outgoingSignOff.badgeNumber})</span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                      <span className="text-[10px] text-slate-400 uppercase block mb-1">Signature Numérique Validée</span>
                      {currentHandover.outgoingSignOff.signatureData.startsWith('data:image') ? (
                        <img src={currentHandover.outgoingSignOff.signatureData} alt="Signature" className="max-h-12 mx-auto object-contain" />
                      ) : (
                        <span className="font-mono text-xs font-bold text-indigo-700">{currentHandover.outgoingSignOff.signatureData}</span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-500 font-mono">
                      Horodatage : {currentHandover.outgoingSignOff.signedAt}
                    </div>

                    {currentHandover.outgoingSignOff.handoverNotes && (
                      <div className="p-2.5 bg-amber-50/50 border border-amber-200/60 rounded text-[11px] text-amber-950">
                        <strong>Consignes :</strong> {currentHandover.outgoingSignOff.handoverNotes}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 space-y-2">
                    <PenTool className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs">{language === 'fr' ? 'Le commandant sortant doit valider le rapport avant relève.' : 'Outgoing commander must sign off to certify inventory.'}</p>
                  </div>
                )}
              </div>

              {!currentHandover.outgoingSignOff && (
                <button
                  onClick={() => {
                    setSignatureType('outgoing');
                    setIsSignatureModalOpen(true);
                  }}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all"
                >
                  <PenTool className="w-4 h-4" />
                  <span>{language === 'fr' ? 'Signer et Transmettre le Quart' : 'Sign Outgoing Handover'}</span>
                </button>
              )}
            </div>

            {/* 2. Incoming Commander */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <span className="text-xs font-bold text-indigo-900 uppercase">
                    2. {language === 'fr' ? 'Commandant Entrant' : 'Incoming Commander'}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    currentHandover.incomingSignOff ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {currentHandover.incomingSignOff ? (language === 'fr' ? 'Garde Acceptée' : 'Custody Accepted') : (language === 'fr' ? 'Non signé' : 'Pending')}
                  </span>
                </div>

                {currentHandover.incomingSignOff ? (
                  <div className="space-y-3 text-xs">
                    <div>
                      <strong className="text-sm font-bold text-slate-900 block">{currentHandover.incomingSignOff.commanderName}</strong>
                      <span className="text-slate-500 text-[11px] block">{currentHandover.incomingSignOff.rank} (Matricule: {currentHandover.incomingSignOff.badgeNumber})</span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                      <span className="text-[10px] text-slate-400 uppercase block mb-1">Signature Numérique Validée</span>
                      {currentHandover.incomingSignOff.signatureData.startsWith('data:image') ? (
                        <img src={currentHandover.incomingSignOff.signatureData} alt="Signature" className="max-h-12 mx-auto object-contain" />
                      ) : (
                        <span className="font-mono text-xs font-bold text-indigo-700">{currentHandover.incomingSignOff.signatureData}</span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-500 font-mono">
                      Horodatage : {currentHandover.incomingSignOff.signedAt}
                    </div>

                    {currentHandover.incomingSignOff.handoverNotes && (
                      <div className="p-2.5 bg-indigo-50/50 border border-indigo-200/60 rounded text-[11px] text-indigo-950">
                        <strong>Prise en charge :</strong> {currentHandover.incomingSignOff.handoverNotes}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 space-y-2">
                    <FileCheck className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs">
                      {currentHandover.outgoingSignOff 
                        ? (language === 'fr' ? 'Prêt pour l\'inspection conjointe et la signature entrante.' : 'Ready for joint inspection and custody acceptance sign-off.')
                        : (language === 'fr' ? 'En attente de la signature du commandant sortant.' : 'Awaiting outgoing commander completion first.')}
                    </p>
                  </div>
                )}
              </div>

              {!currentHandover.incomingSignOff && (
                <button
                  disabled={!currentHandover.outgoingSignOff}
                  onClick={() => {
                    setSignatureType('incoming');
                    setIsSignatureModalOpen(true);
                  }}
                  className={`w-full py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all ${
                    currentHandover.outgoingSignOff 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer active:scale-95' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <FileCheck className="w-4 h-4" />
                  <span>{language === 'fr' ? 'Accepter la Garde & Signer' : 'Accept Custody & Sign'}</span>
                </button>
              )}
            </div>

            {/* 3. Superintendent Governor Ratification */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <span className="text-xs font-bold text-slate-900 uppercase">
                    3. {language === 'fr' ? 'Visa de Direction' : 'Governor Certification'}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    currentHandover.governorSignOff ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {currentHandover.governorSignOff ? (language === 'fr' ? 'Certifié' : 'Ratified') : (language === 'fr' ? 'Non visé' : 'Pending')}
                  </span>
                </div>

                {currentHandover.governorSignOff ? (
                  <div className="space-y-3 text-xs">
                    <div>
                      <strong className="text-sm font-bold text-slate-900 block">{currentHandover.governorSignOff.commanderName}</strong>
                      <span className="text-slate-500 text-[11px] block">{currentHandover.governorSignOff.rank}</span>
                    </div>

                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center space-y-1">
                      <ShieldCheck className="w-6 h-6 text-emerald-600 mx-auto" />
                      <span className="text-[11px] font-bold text-emerald-900 block">Sceau Directionnel Apposé</span>
                      <span className="font-mono text-[9px] text-emerald-700 block">{currentHandover.governorSignOff.signatureData}</span>
                    </div>

                    <div className="text-[11px] text-slate-500 font-mono">
                      Ratifié le : {currentHandover.governorSignOff.signedAt}
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 space-y-2">
                    <Shield className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs">{language === 'fr' ? 'Validation finale par le Directeur d\'Établissement.' : 'Final executive oversight review by Prison Governor.'}</p>
                  </div>
                )}
              </div>

              {!currentHandover.governorSignOff && currentUserRole === 'superintendent' && (
                <button
                  disabled={!currentHandover.incomingSignOff}
                  onClick={() => {
                    setSignatureType('governor');
                    setIsSignatureModalOpen(true);
                  }}
                  className={`w-full py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all ${
                    currentHandover.incomingSignOff 
                      ? 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer active:scale-95' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{language === 'fr' ? 'Apposer le Visa de Direction' : 'Ratify Handover (Governor)'}</span>
                </button>
              )}
            </div>

          </div>

        </div>
      )}

      {/* MODAL: SIGNATURE CANVAS */}
      <SignatureCanvasModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onConfirmSign={handleApplySignature}
        signType={signatureType}
        shift={signatureType === 'outgoing' ? currentHandover.outgoingShift : currentHandover.incomingShift}
        language={language}
      />

      {/* MODAL: PRINT DOSSIER */}
      <HandoverPrintModal
        handover={currentHandover}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        language={language}
      />

      {/* MODAL: ADD FACILITY RISK */}
      {isAddRiskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-3.5 bg-amber-600 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                <span>{language === 'fr' ? 'Signaler un Risque Immédiat' : 'Log New Facility Risk'}</span>
              </h3>
              <button onClick={() => setIsAddRiskModalOpen(false)} className="text-amber-100 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateRisk} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'fr' ? 'Titre du Risque / Objet' : 'Risk Title'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'fr' ? 'Ex: Serrure défectueuse cellule B-08' : 'e.g. Broken deadbolt in cell B-08'}
                  value={newRiskData.title}
                  onChange={e => setNewRiskData({ ...newRiskData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'fr' ? 'Niveau de Gravité' : 'Severity Level'} *
                  </label>
                  <select
                    value={newRiskData.severity}
                    onChange={e => setNewRiskData({ ...newRiskData, severity: e.target.value as RiskSeverity })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold"
                  >
                    <option value="CRITICAL">CRITICAL (Danger Immédiat)</option>
                    <option value="HIGH">HIGH (Élevé)</option>
                    <option value="MEDIUM">MEDIUM (Moyen)</option>
                    <option value="LOW">LOW (Faible)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'fr' ? 'Catégorie' : 'Category'} *
                  </label>
                  <select
                    value={newRiskData.category}
                    onChange={e => setNewRiskData({ ...newRiskData, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold"
                  >
                    <option value="security_inmate">Détenu Dangereux</option>
                    <option value="structural_locks">Serrures / Bâtiment</option>
                    <option value="perimeter_surveillance">Périmètre / Caméras</option>
                    <option value="medical_mental">Suicide / Psychiatrie</option>
                    <option value="contraband_tension">Contrebande / Tensions</option>
                    <option value="overcrowding">Surpopulation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'fr' ? 'Emplacement Précis' : 'Specific Location'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'fr' ? 'Ex: Quartier A, Palier 2, Cellule A-12' : 'e.g. Block A, Tier 2, Cell A-12'}
                  value={newRiskData.location}
                  onChange={e => setNewRiskData({ ...newRiskData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'fr' ? 'Description Détaillée' : 'Detailed Narrative'} *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder={language === 'fr' ? 'Circonstances et observations du poste...' : 'Circumstances and observations...'}
                  value={newRiskData.description}
                  onChange={e => setNewRiskData({ ...newRiskData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'fr' ? 'Mesure d\'Atténuation Immédiate' : 'Mitigation / Action Taken'} *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder={language === 'fr' ? 'Mesures prises par l\'équipe sortante...' : 'Action taken by outgoing watch...'}
                  value={newRiskData.mitigation}
                  onChange={e => setNewRiskData({ ...newRiskData, mitigation: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddRiskModalOpen(false)}
                  className="px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-xs"
                >
                  {language === 'fr' ? 'Enregistrer le Risque' : 'Save Risk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD TASK */}
      {isAddTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-3.5 bg-indigo-600 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{language === 'fr' ? 'Ajouter une Consigne / Tâche' : 'Add Handover Directive'}</span>
              </h3>
              <button onClick={() => setIsAddTaskModalOpen(false)} className="text-indigo-100 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'fr' ? 'Intitulé de la Tâche' : 'Directive Title'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'fr' ? 'Ex: Réception du convoi retour de Milimani' : 'e.g. Receive returning court convoy'}
                  value={newTaskData.title}
                  onChange={e => setNewTaskData({ ...newTaskData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'fr' ? 'Priorité' : 'Priority'} *
                  </label>
                  <select
                    value={newTaskData.priority}
                    onChange={e => setNewTaskData({ ...newTaskData, priority: e.target.value as TaskPriority })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold"
                  >
                    <option value="urgent">{language === 'fr' ? 'URGENT' : 'URGENT'}</option>
                    <option value="high">{language === 'fr' ? 'HIGH (Élevée)' : 'HIGH'}</option>
                    <option value="routine">{language === 'fr' ? 'ROUTINE' : 'ROUTINE'}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'fr' ? 'Heure Limite (Due)' : 'Target Due Time'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="17:00"
                    value={newTaskData.dueTime}
                    onChange={e => setNewTaskData({ ...newTaskData, dueTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'fr' ? 'Officier / Équipe' : 'Assigned Officer'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Sgt. Daniel Kiprop"
                    value={newTaskData.assignedOfficer}
                    onChange={e => setNewTaskData({ ...newTaskData, assignedOfficer: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'fr' ? 'Poste / Rôle' : 'Assigned Role'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Tier Sentinel"
                    value={newTaskData.assignedRole}
                    onChange={e => setNewTaskData({ ...newTaskData, assignedRole: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'fr' ? 'Instructions Précises' : 'Instructions & Procedures'} *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder={language === 'fr' ? 'Consignes particulières à transmettre à la relève...' : 'Specific procedures to follow...'}
                  value={newTaskData.description}
                  onChange={e => setNewTaskData({ ...newTaskData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddTaskModalOpen(false)}
                  className="px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs"
                >
                  {language === 'fr' ? 'Créer la Consigne' : 'Save Directive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NEW HANDOVER SESSION */}
      {isNewSessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-emerald-400" />
                <span>{language === 'fr' ? 'Initialiser une Nouvelle Relève' : 'Initiate Shift Handover Session'}</span>
              </h3>
              <button onClick={() => setIsNewSessionModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateNewSession} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'fr' ? 'Établissement Pénitentiaire' : 'Prison Facility'} *
                </label>
                <select
                  value={newSessionFacilityId}
                  onChange={e => setNewSessionFacilityId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold"
                >
                  {facilities.map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'fr' ? 'Quart Sortant (Cédant)' : 'Outgoing Shift'} *
                  </label>
                  <select
                    value={newSessionOutgoingShift}
                    onChange={e => setNewSessionOutgoingShift(e.target.value as ShiftType)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold capitalize"
                  >
                    <option value="morning">Morning Watch</option>
                    <option value="afternoon">Afternoon Watch</option>
                    <option value="night">Night Watch</option>
                    <option value="standby">Tactical Standby</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'fr' ? 'Quart Entrant (Prenant)' : 'Incoming Shift'} *
                  </label>
                  <select
                    value={newSessionIncomingShift}
                    onChange={e => setNewSessionIncomingShift(e.target.value as ShiftType)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold capitalize"
                  >
                    <option value="afternoon">Afternoon Watch</option>
                    <option value="night">Night Watch</option>
                    <option value="morning">Morning Watch</option>
                    <option value="standby">Tactical Standby</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-[11px] text-indigo-900 leading-relaxed">
                {language === 'fr'
                  ? 'La session pré-remplira automatiquement l\'inventaire réglementaire des armes et clés, ainsi que la situation des effectifs détenus.'
                  : 'This session will bootstrap certified armory counts, key registers, and active facility threats for joint verification.'}
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewSessionModalOpen(false)}
                  className="px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-xs"
                >
                  {language === 'fr' ? 'Ouvrir la Session' : 'Create Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
