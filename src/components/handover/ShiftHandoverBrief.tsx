import React, { useState, useMemo, useEffect } from 'react';
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
  EquipmentCategory,
  EquipmentCondition,
  ContrabandItem,
  ContrabandSeverity,
  ContrabandDisposalStatus
} from '../../types';
import { INITIAL_HANDOVER_BRIEFS } from '../../data/handoverData';
import { INITIAL_CONTRABAND_ITEMS } from '../../data/contrabandData';
import { SHIFT_CONFIGS } from '../../data/staffDutyData';
import { SignatureCanvasModal } from './SignatureCanvasModal';
import { HandoverPrintModal } from './HandoverPrintModal';
import { ShiftIncidentTrendChart } from './ShiftIncidentTrendChart';
import { FacilitySectorHeatmap } from './FacilitySectorHeatmap';
import { DutyOverlapRosterWidget } from './DutyOverlapRosterWidget';
import { PersonnelTrackingWidget } from './PersonnelTrackingWidget';
import { ShiftTimelineWidget } from './ShiftTimelineWidget';
import { ShiftHandoverNotesSection } from './ShiftHandoverNotesSection';
import { HandoverVoiceDictationWidget } from './HandoverVoiceDictationWidget';
import { ResourcesInventoryCheckSection } from './ResourcesInventoryCheckSection';
import { ContrabandSeizedTable } from './ContrabandSeizedTable';
import { Contraband30DayTrendChart } from './Contraband30DayTrendChart';
import { ShiftExecutiveSummarySection } from './ShiftExecutiveSummarySection';
import { EmergencyAlertModal, EmergencyAlertPayload } from './EmergencyAlertModal';
import { CurrentWeatherVisibilityWidget } from './CurrentWeatherVisibilityWidget';
import { SecurityIncidentAuditWidget } from './SecurityIncidentAuditWidget';
import { OfficerBiometricCheckInWidget } from './OfficerBiometricCheckInWidget';
import { ShiftCommunicationsSidebar } from './ShiftCommunicationsSidebar';
import { generateHandoverPdf } from '../../utils/handoverPdfExport';
import { createAuditEntry, createInitialAuditTrail } from '../../utils/securityAuditLogger';
import { ShiftTimelineEvent, ShiftHandoverNote, SecurityAuditActionCategory, SecurityAuditSeverity, BiometricCheckInRecord } from '../../types';
import { INITIAL_TIMELINE_EVENTS } from '../../data/timelineData';
import { INITIAL_HANDOVER_NOTES } from '../../data/handoverNotesData';
import { INITIAL_SECURITY_OFFICERS } from '../../data/personnelData';
import { INITIAL_BIOMETRIC_CHECKINS } from '../../data/biometricAttendanceData';
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
  ChevronDown,
  Download,
  Flame,
  Activity,
  Layers,
  Sparkles,
  NotebookPen,
  Mic,
  Save,
  Wifi,
  WifiOff,
  Bell,
  BellRing,
  Database,
  HardDrive,
  QrCode,
  CloudFog,
  CloudSun,
  FileLock2,
  Fingerprint
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
  const [activeTab, setActiveTab] = useState<'risks' | 'tasks' | 'personnel' | 'timeline' | 'notes' | 'equipment' | 'contraband' | 'signoffs' | 'audit' | 'biometrics' | 'comms'>('risks');

  // Chat Sidebar Drawer State
  const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(false);

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
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isVoiceDictationModalOpen, setIsVoiceDictationModalOpen] = useState(false);

  // Executive Summary & Widgets State
  const [isExecutiveSummaryOpen, setIsExecutiveSummaryOpen] = useState(true);
  const [executiveSummaryTab, setExecutiveSummaryTab] = useState<'all' | 'ai_summary' | 'weather' | 'audit' | 'biometrics' | 'comms' | 'trend' | 'heatmap' | 'overlap' | 'personnel' | 'timeline' | 'notes' | 'inventory' | 'contraband' | 'voice'>('all');
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const [activeEmergencyAlert, setActiveEmergencyAlert] = useState<EmergencyAlertPayload | null>(null);

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

  // Local Storage Cache Sync Service State
  const STORAGE_KEY_HANDOVER_DRAFT = 'PRISON_HANDOVER_DRAFT_CACHE_v2';
  const [isOnline, setIsOnline] = useState<boolean>(typeof window !== 'undefined' ? window.navigator.onLine : true);
  const [lastCacheSavedAt, setLastCacheSavedAt] = useState<string | null>(null);
  const [isRestoredFromCache, setIsRestoredFromCache] = useState<boolean>(false);
  const [cacheSyncToast, setCacheSyncToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);
  const [isManualSyncing, setIsManualSyncing] = useState<boolean>(false);

  // Automated Inventory Shortage Alert System State
  const [isShortageToastDismissed, setIsShortageToastDismissed] = useState<boolean>(false);
  const [shortageSnoozeUntil, setShortageSnoozeUntil] = useState<number | null>(null);

  // Current active handover object
  const currentHandover = useMemo(() => {
    return handovers.find(h => h.id === activeHandoverId) || handovers[0];
  }, [handovers, activeHandoverId]);

  // Restore draft from local storage on initial mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_HANDOVER_DRAFT);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.handovers) && parsed.handovers.length > 0) {
          setHandovers(parsed.handovers);
          if (parsed.activeHandoverId) {
            setActiveHandoverId(parsed.activeHandoverId);
          }
          setIsRestoredFromCache(true);
          const savedTime = parsed.savedAt ? new Date(parsed.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : new Date().toLocaleTimeString();
          setLastCacheSavedAt(savedTime);
          setCacheSyncToast({
            message: language === 'fr' 
              ? `Brouillon de passation restauré depuis le cache local (${savedTime})` 
              : `Handover draft restored from local browser cache (${savedTime})`,
            type: 'info'
          });
          setTimeout(() => setCacheSyncToast(null), 4000);
        }
      }
    } catch (err) {
      console.warn('Could not read cached draft handover from localStorage:', err);
    }
  }, []);

  // Continuous debounced local storage save
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const now = new Date();
        const payload = {
          handovers,
          activeHandoverId,
          savedAt: now.toISOString(),
        };
        localStorage.setItem(STORAGE_KEY_HANDOVER_DRAFT, JSON.stringify(payload));
        setLastCacheSavedAt(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } catch (err) {
        console.warn('Failed to save handover draft to localStorage:', err);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [handovers, activeHandoverId]);

  // Online / Offline network listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setCacheSyncToast({
        message: language === 'fr' 
          ? 'Connexion réseau rétablie — Synchronisation continue activée' 
          : 'Network connection restored — Continuous sync online',
        type: 'success'
      });
      setTimeout(() => setCacheSyncToast(null), 3500);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setCacheSyncToast({
        message: language === 'fr' 
          ? 'Interruption réseau détectée — Mode hors-ligne actif (sauvegarde cache locale)' 
          : 'Network interruption detected — Offline mode active (saving to browser cache)',
        type: 'warning'
      });
      setTimeout(() => setCacheSyncToast(null), 5000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [language]);

  // Manual Force Sync to Local Storage
  const handleForceManualSync = () => {
    setIsManualSyncing(true);
    try {
      const now = new Date();
      const payload = {
        handovers,
        activeHandoverId,
        savedAt: now.toISOString(),
      };
      localStorage.setItem(STORAGE_KEY_HANDOVER_DRAFT, JSON.stringify(payload));
      const formatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastCacheSavedAt(formatted);
      setCacheSyncToast({
        message: language === 'fr' 
          ? `Brouillon de passation synchronisé avec succès dans le cache (${formatted})` 
          : `Handover draft successfully synchronized to browser cache (${formatted})`,
        type: 'success'
      });
      setTimeout(() => setCacheSyncToast(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsManualSyncing(false), 400);
    }
  };

  // Reset Draft Cache
  const handleClearCache = () => {
    if (confirm(language === 'fr' ? 'Réinitialiser le cache local et rétablir les données d\'origine ?' : 'Clear browser draft cache and restore initial brief data?')) {
      try {
        localStorage.removeItem(STORAGE_KEY_HANDOVER_DRAFT);
        setHandovers(INITIAL_HANDOVER_BRIEFS);
        setActiveHandoverId(INITIAL_HANDOVER_BRIEFS[0].id);
        setIsRestoredFromCache(false);
        setLastCacheSavedAt(null);
        setCacheSyncToast({
          message: language === 'fr' ? 'Cache réinitialisé' : 'Draft cache cleared',
          type: 'info'
        });
        setTimeout(() => setCacheSyncToast(null), 3000);
      } catch (err) {
        console.warn(err);
      }
    }
  };

  // Inventory Critical Shortages calculation
  const criticalInventoryShortages = useMemo(() => {
    if (!currentHandover?.equipment) return [];
    return currentHandover.equipment.filter(e => {
      const isShort = e.countedQty < e.expectedQty;
      const isDamaged = e.condition === 'damaged' || e.condition === 'missing' || e.condition === 'defective';
      return isShort || isDamaged;
    });
  }, [currentHandover?.equipment]);

  const isShortageToastVisible = useMemo(() => {
    if (criticalInventoryShortages.length === 0) return false;
    if (isShortageToastDismissed) return false;
    if (shortageSnoozeUntil && Date.now() < shortageSnoozeUntil) return false;
    return true;
  }, [criticalInventoryShortages.length, isShortageToastDismissed, shortageSnoozeUntil]);

  const handleSnoozeShortageToast = () => {
    setShortageSnoozeUntil(Date.now() + 5 * 60 * 1000); // 5 minutes snooze
  };

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

  // Helper to append an immutable cryptographic audit record to the handover session
  const appendAuditEntryToHandover = (
    handover: ShiftHandoverBriefData,
    params: {
      actionCategory: SecurityAuditActionCategory;
      actionName: string;
      changeSummary: string;
      entityType: string;
      entityId?: string;
      previousValue?: string;
      newValue?: string;
      severity?: SecurityAuditSeverity;
      actorName?: string;
      actorBadge?: string;
      actorRole?: string;
      ipOrTerminalId?: string;
    }
  ): ShiftHandoverBriefData => {
    const currentTrail = handover.auditTrail || createInitialAuditTrail(handover.facilityName);
    const prev = currentTrail.length > 0 ? currentTrail[currentTrail.length - 1] : null;
    const entry = createAuditEntry(prev, {
      actionCategory: params.actionCategory,
      actionName: params.actionName,
      changeSummary: params.changeSummary,
      entityType: params.entityType,
      entityId: params.entityId,
      previousValue: params.previousValue,
      newValue: params.newValue,
      severity: params.severity || 'routine',
      actorName: params.actorName || handover.outgoingSignOff?.commanderName || 'Capt. Marcus Vance',
      actorBadge: params.actorBadge || handover.outgoingSignOff?.badgeNumber || 'KP-8421',
      actorRole: params.actorRole || 'Watch Commander',
      ipOrTerminalId: params.ipOrTerminalId || 'TERM-CTRL-01 (10.240.12.44)',
    });
    return {
      ...handover,
      auditTrail: [...currentTrail, entry],
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
  };

  // Handle digital signature application
  const handleApplySignature = (signOff: CommanderSignOff) => {
    setHandovers(prev => prev.map(h => {
      if (h.id !== currentHandover.id) return h;

      let updated = { ...h };
      if (signatureType === 'outgoing') {
        updated.outgoingSignOff = signOff;
        updated.status = 'outgoing_signed';
        updated = appendAuditEntryToHandover(updated, {
          actionCategory: 'digital_signatures',
          actionName: 'Outgoing Commander Official Sign-Off Executed',
          changeSummary: `${signOff.commanderName} (Badge #${signOff.badgeNumber}) applied digital signature and executed handover oath. Declaration confirmed.`,
          severity: 'critical',
          entityType: 'CommanderSignOff',
          entityId: signOff.commanderId,
          previousValue: 'Draft Unsigned',
          newValue: 'Outgoing Signed & Sealed',
          actorName: signOff.commanderName,
          actorBadge: signOff.badgeNumber,
          actorRole: 'Outgoing Watch Commander',
        });
      } else if (signatureType === 'incoming') {
        updated.incomingSignOff = signOff;
        updated.status = 'fully_signed';
        // Mark all risks as acknowledged by incoming commander
        updated.risks = updated.risks.map(r => ({ ...r, isAcknowledgedByIncoming: true }));
        updated = appendAuditEntryToHandover(updated, {
          actionCategory: 'digital_signatures',
          actionName: 'Incoming Commander Custody Acceptance Signed',
          changeSummary: `${signOff.commanderName} (Badge #${signOff.badgeNumber}) accepted custody of facility and acknowledged all ${h.risks.length} active risks.`,
          severity: 'critical',
          entityType: 'CommanderSignOff',
          entityId: signOff.commanderId,
          previousValue: 'Outgoing Signed Pending Custody',
          newValue: 'Custody Accepted & Fully Signed',
          actorName: signOff.commanderName,
          actorBadge: signOff.badgeNumber,
          actorRole: 'Incoming Watch Commander',
        });
      } else if (signatureType === 'governor') {
        updated.governorSignOff = signOff;
        updated.status = 'governor_certified';
        updated = appendAuditEntryToHandover(updated, {
          actionCategory: 'digital_signatures',
          actionName: 'Superintendent / Governor Official Ratification',
          changeSummary: `${signOff.commanderName} (Badge #${signOff.badgeNumber}) certified and ratified the handover session for official record archiving.`,
          severity: 'critical',
          entityType: 'CommanderSignOff',
          entityId: signOff.commanderId,
          previousValue: 'Fully Signed Pending Governor',
          newValue: 'Governor Certified & Archived',
          actorName: signOff.commanderName,
          actorBadge: signOff.badgeNumber,
          actorRole: 'Senior Superintendent of Prisons',
        });
      }

      updated.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
      return updated;
    }));
  };

  // Toggle risk acknowledgment
  const handleToggleRiskAck = (riskId: string) => {
    setHandovers(prev => prev.map(h => {
      if (h.id !== currentHandover.id) return h;
      const updatedRisks = h.risks.map(r => r.id === riskId ? { ...r, isAcknowledgedByIncoming: !r.isAcknowledgedByIncoming } : r);
      const targetRisk = h.risks.find(r => r.id === riskId);
      const updated = {
        ...h,
        risks: updatedRisks
      };
      return appendAuditEntryToHandover(updated, {
        actionCategory: 'risk_assessment',
        actionName: 'Facility Risk Acknowledged by Incoming Command',
        changeSummary: `Incoming Commander toggled acknowledgement for Risk #${riskId} (${targetRisk?.title || 'Unknown Risk'}).`,
        severity: 'routine',
        entityType: 'FacilityRiskItem',
        entityId: riskId,
      });
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
      const updated = { ...h, risks: [newRisk, ...h.risks] };
      return appendAuditEntryToHandover(updated, {
        actionCategory: 'risk_assessment',
        actionName: `Facility Risk Classified: ${newRisk.title}`,
        changeSummary: `New risk logged in ${newRisk.location}. Severity: ${newRisk.severity}. Mitigation: ${newRisk.mitigation}`,
        severity: newRisk.severity === 'CRITICAL' ? 'critical' : 'elevated',
        entityType: 'FacilityRiskItem',
        entityId: newRisk.id,
        newValue: `${newRisk.severity} - ${newRisk.location}`,
      });
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
          verifiedByBoth: true,
          lastInspectedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          inspectedBy: h.outgoingSignOff?.commanderName || 'Capt. Marcus Vance'
        }))
      };
    }));
  };

  // Record time-stamped attendance via officer biometric check-in with tamper-evident audit sealing
  const handleRecordBiometricCheckIn = (record: BiometricCheckInRecord) => {
    setHandovers(prev => prev.map(h => {
      if (h.id !== currentHandover.id) return h;
      const prevCheckIns = h.biometricCheckIns || INITIAL_BIOMETRIC_CHECKINS;
      const updatedCheckIns = prevCheckIns.some(r => r.officerId === record.officerId)
        ? prevCheckIns.map(r => r.officerId === record.officerId ? record : r)
        : [...prevCheckIns, record];

      const updated: ShiftHandoverBriefData = {
        ...h,
        biometricCheckIns: updatedCheckIns,
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };

      return appendAuditEntryToHandover(updated, {
        actionCategory: 'biometric_attendance',
        actionName: record.verificationStatus === 'manual_override'
          ? `Biometric Muster Override: ${record.officerName}`
          : `Biometric Attendance Verified: ${record.officerName}`,
        changeSummary: record.verificationStatus === 'manual_override'
          ? `Supervisor override authorized for ${record.officerName} (${record.badgeNumber}). Reason: ${record.overrideReason || 'N/A'}. Post: ${record.assignedPost}.`
          : `Officer ${record.officerName} (${record.badgeNumber}) verified attendance on ${record.scannerTerminalId} via ${record.fingerScanned}. Match Confidence: ${record.confidenceScore}%. Minutiae: ${record.minutiaePointsMatched} pts. Post: ${record.assignedPost}.`,
        severity: record.verificationStatus === 'manual_override' ? 'elevated' : 'routine',
        entityType: 'BiometricCheckInRecord',
        entityId: record.id,
        newValue: `${record.verificationStatus.toUpperCase()} - ${record.checkInTime} - Seal: ${record.verificationHash.substring(0, 16)}...`,
      });
    }));
  };

  // Record tamper-evident security audit log for encrypted shift transmissions
  const handleChatAuditLog = (
    summary: string, 
    _category: 'secure_communications', 
    severity: 'low' | 'medium' | 'high' | 'critical'
  ) => {
    setHandovers(prev => prev.map(h => {
      if (h.id !== currentHandover.id) return h;
      return appendAuditEntryToHandover(h, {
        actionCategory: 'secure_communications',
        actionName: 'Encrypted Shift Transmission',
        changeSummary: summary,
        severity: severity === 'critical' ? 'critical' : severity === 'high' ? 'elevated' : 'routine',
        entityType: 'ShiftChatMessage',
        newValue: summary.substring(0, 120),
      });
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
            verifiedByBoth: count === e.expectedQty,
            discrepancyNote: count !== e.expectedQty ? `Discrepancy: ${count - e.expectedQty} variance logged.` : undefined
          };
        })
      };
    }));
  };

  const handleUpdateEquipmentCondition = (equipmentId: string, condition: EquipmentCondition) => {
    setHandovers(prev => prev.map(h => {
      if (h.id !== currentHandover.id) return h;

      let newTasks = [...h.tasks];

      const updatedEquipment = h.equipment.map(e => {
        if (e.id !== equipmentId) return e;

        const isDamaged = condition === 'damaged' || condition === 'defective';
        const workOrderRef = isDamaged
          ? (e.workOrderRef || `WO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`)
          : e.workOrderRef;
        const workOrderStatus = isDamaged ? (e.workOrderStatus || 'pending') : e.workOrderStatus;
        const workOrderTriggeredAt = isDamaged ? (e.workOrderTriggeredAt || new Date().toISOString()) : e.workOrderTriggeredAt;

        let discrepancyNote = e.discrepancyNote;
        if (isDamaged) {
          discrepancyNote = `[AUTO WORK ORDER ${workOrderRef}] Asset flagged as DAMAGED during handover check. Armory & Technical Services repair ticket issued.`;
          
          // Auto-trigger a pending task for the incoming shift if not already present
          const taskExists = newTasks.some(t => t.id === `task-wo-${equipmentId}` || (t.notes && workOrderRef && t.notes.includes(workOrderRef)));
          if (!taskExists) {
            const woTask: PendingTaskItem = {
              id: `task-wo-${equipmentId}`,
              title: `[Work Order ${workOrderRef}] Corrective Repair & Armory Intake for Damaged ${e.name}`,
              description: `Critical inventory asset flagged as DAMAGED at ${e.storageLocation}. Corrective maintenance docket ${workOrderRef} triggered. Incoming watch must verify custodial status, log technician arrival, and ensure security seal reconciliation.`,
              priority: e.criticality === 'critical' || e.category === 'keys_security' || e.category === 'armory_firearms' ? 'urgent' : 'high',
              assignedRole: 'Armory Technician / Custody Escort',
              assignedOfficer: 'Prison Technical Workshop',
              dueTime: 'Next Watch',
              status: 'pending',
              category: 'maintenance',
              notes: `Auto-generated from Shift Inventory Check for ${e.name} (WO #${workOrderRef}).`,
            };
            newTasks = [woTask, ...newTasks];
          }
        } else if (condition === 'maintenance' || condition === 'needs_maintenance') {
          discrepancyNote = e.discrepancyNote || `Needs preventative maintenance inspection and diagnostic check.`;
        } else if (condition === 'operational') {
          discrepancyNote = e.countedQty === e.expectedQty ? undefined : e.discrepancyNote;
        }

        return {
          ...e,
          condition,
          workOrderRef,
          workOrderStatus,
          workOrderTriggeredAt,
          discrepancyNote,
        };
      });

      return {
        ...h,
        equipment: updatedEquipment,
        tasks: newTasks,
      };
    }));
  };

  const handleToggleEquipmentVerification = (equipmentId: string) => {
    setHandovers(prev => prev.map(h => {
      if (h.id !== currentHandover.id) return h;
      return {
        ...h,
        equipment: h.equipment.map(e => {
          if (e.id !== equipmentId) return e;
          const newVerified = !e.verifiedByBoth;
          return {
            ...e,
            verifiedByBoth: newVerified,
            lastInspectedAt: newVerified ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : e.lastInspectedAt,
            inspectedBy: newVerified ? (currentHandover.outgoingSignOff?.commanderName || 'Capt. Marcus Vance') : e.inspectedBy,
          };
        })
      };
    }));
  };

  const handleAddEquipmentItem = (newItem: EquipmentInventoryItem) => {
    setHandovers(prev => prev.map(h => {
      if (h.id !== currentHandover.id) return h;
      return {
        ...h,
        equipment: [newItem, ...h.equipment]
      };
    }));
  };

  const handleUpdateEquipmentItem = (updatedItem: EquipmentInventoryItem) => {
    setHandovers(prev => prev.map(h => {
      if (h.id !== currentHandover.id) return h;
      return {
        ...h,
        equipment: h.equipment.map(e => e.id === updatedItem.id ? updatedItem : e),
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };
    }));
  };

  // Contraband Seized Management Handlers
  const handleUpdateContrabandSeverity = (itemId: string, newSeverity: ContrabandSeverity) => {
    setHandovers(prev => prev.map(h => {
      if (h.id !== currentHandover.id) return h;
      const updatedContraband = (h.contrabandSeized || INITIAL_CONTRABAND_ITEMS).map(item => {
        if (item.id !== itemId) return item;
        return { ...item, severityLevel: newSeverity };
      });
      return { ...h, contrabandSeized: updatedContraband };
    }));
  };

  const handleUpdateContrabandDisposalStatus = (itemId: string, newStatus: ContrabandDisposalStatus) => {
    setHandovers(prev => prev.map(h => {
      if (h.id !== currentHandover.id) return h;
      const updatedContraband = (h.contrabandSeized || INITIAL_CONTRABAND_ITEMS).map(item => {
        if (item.id !== itemId) return item;
        return { ...item, disposalStatus: newStatus };
      });
      return { ...h, contrabandSeized: updatedContraband };
    }));
  };

  const handleAddContrabandItem = (newItem: ContrabandItem) => {
    setHandovers(prev => prev.map(h => {
      if (h.id !== currentHandover.id) return h;
      const updated = {
        ...h,
        contrabandSeized: [newItem, ...(h.contrabandSeized || INITIAL_CONTRABAND_ITEMS)]
      };
      return appendAuditEntryToHandover(updated, {
        actionCategory: 'contraband_evidence',
        actionName: `Contraband Evidence Confiscated: ${newItem.itemDescription}`,
        changeSummary: `Seized ${newItem.itemDescription} in ${newItem.seizedLocation}. Chain-of-custody seal: ${newItem.chainOfCustodyRef}. Severity: ${newItem.severityLevel.toUpperCase()}.`,
        severity: newItem.severityLevel === 'critical' ? 'critical' : 'elevated',
        entityType: 'ContrabandItem',
        entityId: newItem.id,
        newValue: `Confiscated & Vaulted (Seal #${newItem.chainOfCustodyRef})`,
      });
    }));
  };

  const handleDeleteContrabandItem = (itemId: string) => {
    setHandovers(prev => prev.map(h => {
      if (h.id !== currentHandover.id) return h;
      return {
        ...h,
        contrabandSeized: (h.contrabandSeized || INITIAL_CONTRABAND_ITEMS).filter(i => i.id !== itemId)
      };
    }));
  };

  // Critical Resources & Inventory Clearance Memo
  const inventoryClearance = useMemo(() => {
    const totalItems = currentHandover.equipment.length;
    const verifiedItems = currentHandover.equipment.filter(e => e.verifiedByBoth).length;
    const missingCount = currentHandover.equipment.filter(e => e.condition === 'missing' || e.countedQty < e.expectedQty).length;
    const variancesCount = currentHandover.equipment.filter(e => e.countedQty !== e.expectedQty || e.condition !== 'operational').length;

    const criticalItems = currentHandover.equipment.filter(e => 
      e.category === 'keys_security' || 
      e.category === 'radios_comms' || 
      e.category === 'restraints_cuffs' ||
      e.criticality === 'critical'
    );
    const criticalVerified = criticalItems.filter(e => e.verifiedByBoth).length;
    const isCriticalCleared = criticalItems.length > 0 && criticalVerified === criticalItems.length && missingCount === 0;

    const keys = currentHandover.equipment.filter(e => e.category === 'keys_security');
    const radios = currentHandover.equipment.filter(e => e.category === 'radios_comms');
    const restraints = currentHandover.equipment.filter(e => e.category === 'restraints_cuffs');

    const keysVerified = keys.length > 0 && keys.every(k => k.verifiedByBoth && k.countedQty === k.expectedQty);
    const radiosVerified = radios.length > 0 && radios.every(r => r.verifiedByBoth);
    const restraintsVerified = restraints.length > 0 && restraints.every(r => r.verifiedByBoth);

    return {
      totalItems,
      verifiedItems,
      percentVerified: totalItems > 0 ? Math.round((verifiedItems / totalItems) * 100) : 0,
      isCriticalCleared,
      missingCount,
      variancesCount,
      criticalTotal: criticalItems.length,
      criticalVerified,
      keysVerified,
      radiosVerified,
      restraintsVerified,
    };
  }, [currentHandover.equipment]);

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
      auditTrail: createInitialAuditTrail(facilityName),
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
      timelineEvents: INITIAL_TIMELINE_EVENTS,
      handoverNotes: INITIAL_HANDOVER_NOTES,
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

  // Update Shift Executive Summary (Gemini AI auto-generated or commander edited)
  const handleUpdateExecutiveSummary = (summaryText: string) => {
    const timestamp = new Date().toISOString();
    setHandovers(prev => prev.map(h => {
      if (h.id !== currentHandover.id) return h;
      return {
        ...h,
        executiveSummaryText: summaryText,
        executiveSummaryGeneratedAt: timestamp,
      };
    }));
  };

  // Append Gemini Executive Summary as an official Handover Note
  const handleAppendExecutiveSummaryToNotes = (summaryText: string) => {
    const newNote: ShiftHandoverNote = {
      id: `note-ai-${Date.now()}`,
      category: 'general_orders',
      title: language === 'fr' ? 'Synthèse Exécutive du Quart (Gemini AI)' : 'Shift Executive Summary (Gemini AI)',
      content: summaryText,
      urgency: 'urgent',
      location: 'Central Command Post',
      authorCommander: currentHandover.outgoingSignOff?.commanderName || 'Shift Commander (AI Assisted)',
      authorBadge: currentHandover.outgoingSignOff?.badgeNumber || 'KP-COMMAND',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAcknowledgedByIncoming: false,
    };
    handleAppendHandoverNote(newNote);
  };

  // Append meteorological & tactical visibility directives to handover notes
  const handleAppendWeatherToNotes = (weatherLogText: string) => {
    const newNote: ShiftHandoverNote = {
      id: `note-weather-${Date.now()}`,
      category: 'general_orders',
      title: language === 'fr' 
        ? 'Directives Météorologiques & Surveillance Visibilité (Patrouilles, Cour, Convois)' 
        : 'Meteorological & Tactical Visibility Directives (Patrols, Yard, Court Transits)',
      content: weatherLogText,
      urgency: 'urgent',
      location: 'Exterior Perimeter & Courtyards',
      authorCommander: currentHandover.outgoingSignOff?.commanderName || 'Capt. Marcus Vance',
      authorBadge: currentHandover.outgoingSignOff?.badgeNumber || 'KP-8421',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAcknowledgedByIncoming: false,
    };
    handleAppendHandoverNote(newNote);
  };

  // Add new structured handover note
  const handleAppendHandoverNote = (newNote: ShiftHandoverNote) => {
    setHandovers(prev => prev.map(h => {
      if (h.id !== currentHandover.id) return h;
      const currentNotes = h.handoverNotes || INITIAL_HANDOVER_NOTES;
      const updated = {
        ...h,
        handoverNotes: [newNote, ...currentNotes]
      };
      return appendAuditEntryToHandover(updated, {
        actionCategory: 'executive_command',
        actionName: `Handover Directive Appended: ${newNote.title}`,
        changeSummary: `Note appended under category ${newNote.category.toUpperCase()} by ${newNote.authorCommander} (Badge #${newNote.authorBadge}). Urgency: ${newNote.urgency.toUpperCase()}.`,
        severity: newNote.urgency === 'critical' ? 'critical' : 'routine',
        entityType: 'ShiftHandoverNote',
        entityId: newNote.id,
      });
    }));
  };

  // Acknowledge single handover note by incoming command
  const handleAcknowledgeHandoverNote = (noteId: string, acknowledgedBy: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setHandovers(prev => prev.map(h => {
      if (h.id !== currentHandover.id) return h;
      const currentNotes = h.handoverNotes || INITIAL_HANDOVER_NOTES;
      return {
        ...h,
        handoverNotes: currentNotes.map(n => {
          if (n.id === noteId) {
            return {
              ...n,
              isAcknowledgedByIncoming: true,
              acknowledgedBy,
              acknowledgedAt: timeStr,
            };
          }
          return n;
        })
      };
    }));
  };

  // Acknowledge all pending notes in session
  const handleAcknowledgeAllHandoverNotes = (acknowledgedBy: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setHandovers(prev => prev.map(h => {
      if (h.id !== currentHandover.id) return h;
      const currentNotes = h.handoverNotes || INITIAL_HANDOVER_NOTES;
      return {
        ...h,
        handoverNotes: currentNotes.map(n => ({
          ...n,
          isAcknowledgedByIncoming: true,
          acknowledgedBy: n.acknowledgedBy || acknowledgedBy,
          acknowledgedAt: n.acknowledgedAt || timeStr,
        }))
      };
    }));
  };

  // Add new operational event to timeline
  const handleCreateTimelineEvent = (newEvent: ShiftTimelineEvent) => {
    setHandovers(prev => prev.map(h => {
      if (h.id !== currentHandover.id) return h;
      const currentEvents = h.timelineEvents || INITIAL_TIMELINE_EVENTS;
      return {
        ...h,
        timelineEvents: [...currentEvents, newEvent]
      };
    }));
  };

  // Verify operational event on timeline
  const handleVerifyTimelineEvent = (eventId: string, verifiedBy: string) => {
    setHandovers(prev => prev.map(h => {
      if (h.id !== currentHandover.id) return h;
      const currentEvents = h.timelineEvents || INITIAL_TIMELINE_EVENTS;
      return {
        ...h,
        timelineEvents: currentEvents.map(ev => {
          if (ev.id === eventId) {
            return {
              ...ev,
              isVerified: true,
              verifiedBy,
              verifiedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
          }
          return ev;
        })
      };
    }));
  };

  // Broadcast Tactical Emergency Alert
  const handleBroadcastAlert = (alertPayload: EmergencyAlertPayload) => {
    setActiveEmergencyAlert(alertPayload);

    // Create an immediate CRITICAL facility risk entry
    const newEmergencyRisk: FacilityRiskItem = {
      id: `risk-emerg-${Date.now()}`,
      title: `[${alertPayload.code.replace('_', ' ')}] ${alertPayload.title}`,
      category: 'security_inmate',
      severity: 'CRITICAL',
      location: alertPayload.sector,
      description: `TACTICAL DIRECTIVE: ${alertPayload.directives}`,
      mitigation: 'Immediate facility lockdown ordered. VHF Ch 1 & 4 active alert acknowledged by shift leads.',
      reportedBy: alertPayload.author,
      reportedAt: alertPayload.timestamp,
      isAcknowledgedByIncoming: false,
    };

    setHandovers(prev => prev.map(h => {
      if (h.id !== currentHandover.id) return h;
      const updated = { ...h, risks: [newEmergencyRisk, ...h.risks] };
      return appendAuditEntryToHandover(updated, {
        actionCategory: 'emergency_tactical',
        actionName: `Tactical Emergency Alert Broadcast: [${alertPayload.code}]`,
        changeSummary: `${alertPayload.author} triggered tactical code red in ${alertPayload.sector}. Directives: ${alertPayload.directives}.`,
        severity: 'critical',
        entityType: 'EmergencyAlertPayload',
        entityId: alertPayload.code,
        newValue: `EMERGENCY ALERT: ${alertPayload.title}`,
        actorName: alertPayload.author,
        actorBadge: 'TAC-CMD',
        actorRole: 'Tactical Watch Lead',
      });
    }));
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
      
      {/* Active Tactical Emergency Broadcast Banner */}
      {activeEmergencyAlert && (
        <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-red-950 text-white p-4 rounded-xl shadow-xl border-2 border-rose-500 animate-in fade-in slide-in-from-top-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-rose-600 text-white rounded-xl shadow-md animate-pulse">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-black uppercase px-2 py-0.5 bg-black/50 rounded border border-rose-400/50 text-rose-200">
                  {activeEmergencyAlert.code.replace('_', ' ')}
                </span>
                <strong className="text-sm font-black tracking-wide text-white">
                  {activeEmergencyAlert.title}
                </strong>
                <span className="text-[10px] font-bold bg-rose-600 px-2 py-0.5 rounded-full uppercase tracking-wider text-white">
                  {language === 'fr' ? 'ALERTE ACTIVE' : 'LIVE DISPATCH'}
                </span>
              </div>
              <p className="text-xs text-rose-100 mt-1">
                <strong>{language === 'fr' ? 'Directive :' : 'Directives :'}</strong> {activeEmergencyAlert.directives}
              </p>
              <div className="text-[11px] text-rose-300 mt-1.5 flex flex-wrap items-center gap-3">
                <span>{language === 'fr' ? 'Secteur :' : 'Sector :'} <strong>{activeEmergencyAlert.sector}</strong></span>
                <span>&bull;</span>
                <span>{language === 'fr' ? 'Diffusé à :' : 'Broadcast at :'} <strong className="font-mono">{activeEmergencyAlert.timestamp}</strong></span>
                <span>&bull;</span>
                <span className="text-emerald-300 font-bold">
                  {activeEmergencyAlert.acknowledgedOfficers}/{activeEmergencyAlert.totalOfficers} {language === 'fr' ? 'Postes & Officiers Radio Synchronisés' : 'Watch Leads & QRF Acknowledged'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            <button
              onClick={() => setActiveEmergencyAlert(null)}
              className="px-3.5 py-1.5 bg-black/40 hover:bg-black/60 text-white rounded-lg text-xs font-semibold border border-white/20 transition-colors cursor-pointer"
            >
              {language === 'fr' ? 'Acquitter & Clôturer l\'Alerte' : 'Acknowledge & Dismiss'}
            </button>
          </div>
        </div>
      )}

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

            {/* Local Storage Offline Resilient Cache Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border ${
                isOnline 
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800' 
                  : 'bg-amber-950/80 text-amber-300 border-amber-700 animate-pulse'
              }`}>
                {isOnline ? <Wifi className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3 text-amber-400" />}
                <span>{isOnline ? (language === 'fr' ? 'RÉSEAU ACTIF' : 'NETWORK ONLINE') : (language === 'fr' ? 'HORS-LIGNE (CACHE ACTIF)' : 'OFFLINE (CACHE RESILIENT)')}</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                <Save className="w-3 h-3 text-cyan-400" />
                <span>
                  {language === 'fr' ? 'Cache Local :' : 'Draft Cache:'} {lastCacheSavedAt || (language === 'fr' ? 'Synchronisé' : 'Synchronized')}
                </span>
                {isRestoredFromCache && (
                  <span className="text-cyan-400 text-[10px] font-bold">({language === 'fr' ? 'Restauré' : 'Restored'})</span>
                )}
              </span>

              <button
                type="button"
                onClick={handleForceManualSync}
                disabled={isManualSyncing}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[10px] transition-colors cursor-pointer flex items-center gap-1 font-sans"
                title={language === 'fr' ? 'Forcer la synchronisation immédiate vers le cache local' : 'Force immediate sync to browser localStorage cache'}
              >
                <RefreshCw className={`w-2.5 h-2.5 text-cyan-400 ${isManualSyncing ? 'animate-spin' : ''}`} />
                <span>{language === 'fr' ? 'Sync Immédiate' : 'Sync Cache'}</span>
              </button>

              <button
                type="button"
                onClick={handleClearCache}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-rose-950/50 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-800 text-[10px] transition-colors cursor-pointer font-sans"
                title={language === 'fr' ? 'Réinitialiser le cache local du brouillon' : 'Clear draft cache and restore initial data'}
              >
                <span>{language === 'fr' ? 'Réinit. Cache' : 'Reset Cache'}</span>
              </button>

              {/* Quick Weather & Tactical Visibility Live Pill */}
              <button
                type="button"
                onClick={() => {
                  setExecutiveSummaryTab('weather');
                  setIsExecutiveSummaryOpen(true);
                }}
                className="px-2 py-0.5 rounded bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 text-[10px] transition-colors cursor-pointer flex items-center gap-1 font-sans"
                title={language === 'fr' ? 'Consulter le bulletin météo & visibilité tactique' : 'Open Meteorological & Visibility Tactical Command Deck'}
              >
                <CloudFog className="w-3 h-3 text-cyan-400" />
                <span>{language === 'fr' ? 'Météo: 8.5°C | 0.8 km Brouillard' : 'Weather: 8.5°C | 0.8 km Fog'}</span>
                <span className="px-1 py-0.2 rounded bg-rose-900 text-rose-200 text-[9px] font-mono font-bold">
                  {language === 'fr' ? 'COUR SUSPENDUE' : 'YARD SUSP'}
                </span>
              </button>

              {/* Quick Security Audit Ledger Pill */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('audit');
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
                className="px-2 py-0.5 rounded bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 text-[10px] transition-colors cursor-pointer flex items-center gap-1 font-sans"
                title={language === 'fr' ? 'Consulter le registre d\'audit inviolable' : 'Open Tamper-Evident Security Audit Ledger'}
              >
                <FileLock2 className="w-3 h-3 text-emerald-400" />
                <span>{language === 'fr' ? 'Audit :' : 'Audit:'} {(currentHandover.auditTrail || []).length} {language === 'fr' ? 'blocs' : 'blocks'}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </button>

              {/* Quick Biometric Check-in Attendance Pill */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('biometrics');
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
                className="px-2 py-0.5 rounded bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 text-[10px] transition-colors cursor-pointer flex items-center gap-1 font-sans"
                title={language === 'fr' ? 'Consulter le pointage biométrique des surveillants' : 'Open Officer Biometric Check-in Widget'}
              >
                <Fingerprint className="w-3 h-3 text-cyan-400" />
                <span>{language === 'fr' ? 'Pointage :' : 'Biometrics:'} {(currentHandover.biometricCheckIns || INITIAL_BIOMETRIC_CHECKINS).length}/{INITIAL_SECURITY_OFFICERS.length}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              </button>

              {/* Quick Shift Communications Pill */}
              <button
                type="button"
                onClick={() => setIsChatSidebarOpen(true)}
                className="px-2 py-0.5 rounded bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700 text-[10px] transition-colors cursor-pointer flex items-center gap-1 font-sans"
                title={language === 'fr' ? 'Ouvrir les transmissions chiffrées de relève' : 'Open Shift Communications Secure Chat Sidebar'}
              >
                <Radio className="w-3 h-3 text-indigo-400 animate-pulse" />
                <span>{language === 'fr' ? 'Comms Sécurisées' : 'Shift Comms'}</span>
                <span className="px-1 py-0.2 rounded bg-cyan-900 text-cyan-200 text-[9px] font-mono font-bold flex items-center gap-0.5">
                  <Lock className="w-2 h-2 text-cyan-300" />
                  <span>E2EE</span>
                </span>
              </button>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Shift Communications Secure Chat Launcher Button */}
            <button
              onClick={() => setIsChatSidebarOpen(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 hover:from-cyan-900 hover:to-indigo-900 text-cyan-200 rounded-lg text-xs font-bold flex items-center gap-2 transition-all border border-cyan-500/50 shadow-sm active:scale-95 cursor-pointer group"
              title={language === 'fr' 
                ? 'Ouvrir la messagerie sécurisée chiffrée de relève entre commandants' 
                : 'Open Shift Communications real-time encrypted messaging sidebar'}
            >
              <Radio className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform animate-pulse" />
              <span>{language === 'fr' ? 'Transmissions de Relève' : 'Shift Comms'}</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                <span>SECURE</span>
              </span>
            </button>

            {/* Trigger Emergency Alert Button */}
            <button
              onClick={() => setIsEmergencyModalOpen(true)}
              className="px-3 py-2 bg-gradient-to-r from-rose-600 via-rose-700 to-red-700 hover:from-rose-500 hover:to-red-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-950/60 transition-all active:scale-95 animate-pulse"
              title={language === 'fr' ? 'Déclencher une alerte tactique d\'urgence générale' : 'Broadcast immediate tactical emergency alert to security leads'}
            >
              <Flame className="w-4 h-4 text-amber-200" />
              <span>{language === 'fr' ? 'Alerte Urgence Tactique' : 'Trigger Emergency Alert'}</span>
            </button>

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

            {/* Generate PDF Shift Report Button (Formatted for Submission to Prison Warden) */}
            <div className="inline-flex rounded-lg shadow-sm border border-slate-700 overflow-hidden bg-slate-800">
              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-slate-800 via-indigo-950 to-slate-900 hover:from-slate-700 hover:to-indigo-900 text-white text-xs font-bold flex items-center gap-2 transition-all border-r border-slate-700 active:scale-95 cursor-pointer group"
                title={language === 'fr' 
                  ? 'Générer le rapport PDF officiel de passation de quart pour transmission au directeur de la prison' 
                  : 'Generate official PDF shift handover report formatted for submission to the prison warden'}
              >
                <FileText className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                <span>{language === 'fr' ? 'Générer Rapport PDF Relève' : 'Generate PDF Shift Report'}</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/40">
                  {language === 'fr' ? 'Direction' : 'Warden'}
                </span>
              </button>
              <button
                onClick={() => generateHandoverPdf(currentHandover, language)}
                className="px-2.5 py-2 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                title={language === 'fr' ? 'Téléchargement direct du PDF officiel pour le directeur' : 'Direct download formatted PDF report for warden'}
              >
                <Download className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold">PDF</span>
              </button>
            </div>

            {/* Voice-to-Text Recording Widget Launcher */}
            <button
              onClick={() => setIsVoiceDictationModalOpen(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 hover:from-rose-900 hover:to-indigo-900 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-all border border-rose-500/50 shadow-xs active:scale-95 cursor-pointer group"
              title={language === 'fr' 
                ? 'Ouvrir l\'outil de dictée vocale temps réel avec reconnaissance automatique de la parole' 
                : 'Open real-time voice-to-text dictation recorder for commanding officers'}
            >
              <Mic className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform animate-pulse" />
              <span>{language === 'fr' ? 'Dictée Vocale' : 'Dictate Note'}</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-200 border border-rose-400/40">
                VOICE
              </span>
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

      {/* Quick Executive Summary Panel */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-lg text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-700/60 shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide uppercase">
                  {language === 'fr' ? 'Synthèse Opérationnelle & Surveillance de Quart' : 'Quick Executive Summary & Tactical Handover Oversight'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  DEFCON 4 &bull; NORMAL
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {language === 'fr' 
                  ? 'Visualisation de la fréquence des incidents sur les 7 derniers quarts, matrice thermique des blocs et régulation du chevauchement de garde' 
                  : 'Incident frequency trend over rolling 7 shifts, facility sector heatmap & risk matrix, and shift overlap roster controls'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View sub-tabs */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setExecutiveSummaryTab('all')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  executiveSummaryTab === 'all' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                {language === 'fr' ? 'Vue Globale' : 'All Widgets'}
              </button>
              <button
                type="button"
                onClick={() => setExecutiveSummaryTab('ai_summary')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  executiveSummaryTab === 'ai_summary' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
                <span>{language === 'fr' ? 'Synthèse IA' : 'AI Summary'}</span>
              </button>
              <button
                type="button"
                onClick={() => setExecutiveSummaryTab('weather')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  executiveSummaryTab === 'weather' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <CloudFog className="w-3 h-3 text-cyan-400" />
                <span>{language === 'fr' ? 'Météo & Visibilité' : 'Weather & Visibility'}</span>
              </button>
              <button
                type="button"
                onClick={() => setExecutiveSummaryTab('audit')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  executiveSummaryTab === 'audit' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileLock2 className="w-3 h-3 text-emerald-400" />
                <span>{language === 'fr' ? 'Audit Sécurité' : 'Security Audit'}</span>
              </button>
              <button
                type="button"
                onClick={() => setExecutiveSummaryTab('biometrics')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  executiveSummaryTab === 'biometrics' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Fingerprint className="w-3 h-3 text-cyan-400" />
                <span>{language === 'fr' ? 'Pointage Biométrique' : 'Biometric Check-in'}</span>
              </button>
              <button
                type="button"
                onClick={() => setExecutiveSummaryTab('comms')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  executiveSummaryTab === 'comms' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                <span>{language === 'fr' ? 'Comms Sécurisées' : 'Shift Comms'}</span>
              </button>
              <button
                type="button"
                onClick={() => setExecutiveSummaryTab('trend')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  executiveSummaryTab === 'trend' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                {language === 'fr' ? 'Tendance Incidents' : 'Incident Trend'}
              </button>
              <button
                type="button"
                onClick={() => setExecutiveSummaryTab('heatmap')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  executiveSummaryTab === 'heatmap' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                {language === 'fr' ? 'Heatmap Blocs' : 'Sector Heatmap'}
              </button>
              <button
                type="button"
                onClick={() => setExecutiveSummaryTab('overlap')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  executiveSummaryTab === 'overlap' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                {language === 'fr' ? 'Chevauchement de Quart' : 'Duty Overlap'}
              </button>
              <button
                type="button"
                onClick={() => setExecutiveSummaryTab('personnel')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  executiveSummaryTab === 'personnel' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3 h-3 text-indigo-400" />
                <span>{language === 'fr' ? 'Effectifs Sécurité' : 'Staffing & Sentinels'}</span>
              </button>
              <button
                type="button"
                onClick={() => setExecutiveSummaryTab('timeline')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  executiveSummaryTab === 'timeline' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <History className="w-3 h-3 text-indigo-400" />
                <span>{language === 'fr' ? 'Chronologie Événements' : 'Shift Timeline'}</span>
              </button>
              <button
                type="button"
                onClick={() => setExecutiveSummaryTab('notes')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  executiveSummaryTab === 'notes' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <NotebookPen className="w-3 h-3 text-indigo-400" />
                <span>{language === 'fr' ? 'Notes Relève' : 'Handover Notes'}</span>
              </button>
              <button
                type="button"
                onClick={() => setExecutiveSummaryTab('inventory')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  executiveSummaryTab === 'inventory' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Key className="w-3 h-3 text-amber-400" />
                <span>{language === 'fr' ? 'Inventaire Ressources' : 'Resources & Inventory'}</span>
              </button>
              <button
                type="button"
                onClick={() => setExecutiveSummaryTab('contraband')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  executiveSummaryTab === 'contraband' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldAlert className="w-3 h-3 text-rose-400" />
                <span>{language === 'fr' ? 'Saisies Contrebande' : 'Contraband Seized'}</span>
              </button>
              <button
                type="button"
                onClick={() => setExecutiveSummaryTab('voice')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  executiveSummaryTab === 'voice' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Mic className="w-3 h-3 text-rose-400" />
                <span>{language === 'fr' ? 'Dictée Vocale' : 'Voice Dictation'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsExecutiveSummaryOpen(!isExecutiveSummaryOpen)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
              title={isExecutiveSummaryOpen ? 'Collapse Executive Summary' : 'Expand Executive Summary'}
            >
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExecutiveSummaryOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Collapsible Content */}
        {isExecutiveSummaryOpen && (
          <div className="space-y-4">
            
            {/* Current Weather & Visibility Telemetry Widget (Outdoor Patrols, Yard, Court Transits) */}
            {(executiveSummaryTab === 'all' || executiveSummaryTab === 'weather') && (
              <CurrentWeatherVisibilityWidget
                language={language}
                facilityId={currentHandover.facilityId}
                facilityName={currentHandover.facilityName}
                compactView={executiveSummaryTab === 'all'}
                onAppendToNotes={handleAppendWeatherToNotes}
                commanderName={currentHandover.outgoingSignOff?.commanderName || 'Capt. Marcus Vance'}
                commanderBadge={currentHandover.outgoingSignOff?.badgeNumber || 'KP-8421'}
                onViewFullWidget={() => setExecutiveSummaryTab('weather')}
              />
            )}

            {/* Shift Executive Summary (Gemini AI Powered) */}
            {(executiveSummaryTab === 'all' || executiveSummaryTab === 'ai_summary') && (
              <ShiftExecutiveSummarySection
                language={language}
                handover={currentHandover}
                contrabandItems={currentHandover.contrabandSeized || INITIAL_CONTRABAND_ITEMS}
                tasks={currentHandover.tasks || []}
                notes={currentHandover.handoverNotes || INITIAL_HANDOVER_NOTES}
                onUpdateExecutiveSummary={handleUpdateExecutiveSummary}
                onAppendToNotes={handleAppendExecutiveSummaryToNotes}
                onProceedToSignOff={() => {
                  setActiveTab('signoffs');
                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                }}
              />
            )}

            {/* Incident Trend Chart & Sector Heatmap */}
            {(executiveSummaryTab === 'all' || executiveSummaryTab === 'trend') && (
              <div className={executiveSummaryTab === 'all' ? 'grid grid-cols-1 xl:grid-cols-12 gap-4' : 'w-full'}>
                
                {/* 7-Shift Trend Chart */}
                <div className={executiveSummaryTab === 'all' ? 'xl:col-span-6' : 'w-full'}>
                  <ShiftIncidentTrendChart language={language} />
                </div>

                {/* Heatmap in grid if 'all' */}
                {executiveSummaryTab === 'all' && (
                  <div className="xl:col-span-6">
                    <FacilitySectorHeatmap 
                      language={language}
                      selectedSectorId={selectedSectorId}
                      onSelectSector={setSelectedSectorId}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Dedicated Heatmap view */}
            {executiveSummaryTab === 'heatmap' && (
              <FacilitySectorHeatmap 
                language={language}
                selectedSectorId={selectedSectorId}
                onSelectSector={setSelectedSectorId}
              />
            )}

            {/* Dedicated or Included Duty Overlap Widget */}
            {(executiveSummaryTab === 'all' || executiveSummaryTab === 'overlap') && (
              <DutyOverlapRosterWidget language={language} />
            )}

            {/* Staffing & Sentinel Coverage Widget */}
            {(executiveSummaryTab === 'all' || executiveSummaryTab === 'personnel') && (
              <PersonnelTrackingWidget 
                language={language} 
                currentShift={currentHandover.outgoingShift}
                compactView={executiveSummaryTab === 'all'}
              />
            )}

            {/* Shift Chronological Timeline & Milestone Widget */}
            {(executiveSummaryTab === 'all' || executiveSummaryTab === 'timeline') && (
              <ShiftTimelineWidget
                language={language}
                currentShift={currentHandover.outgoingShift}
                facilityName={currentHandover.facilityName}
                events={currentHandover.timelineEvents || INITIAL_TIMELINE_EVENTS}
                onAddEvent={handleCreateTimelineEvent}
                onVerifyEvent={handleVerifyTimelineEvent}
                compactView={executiveSummaryTab === 'all'}
              />
            )}

            {/* Shift Handover Notes (Facility Maintenance, Behaviors, Inmate Watch Instructions) */}
            {(executiveSummaryTab === 'notes') && (
              <ShiftHandoverNotesSection
                language={language}
                notes={currentHandover.handoverNotes || INITIAL_HANDOVER_NOTES}
                onAppendNote={handleAppendHandoverNote}
                onAcknowledgeNote={handleAcknowledgeHandoverNote}
                onAcknowledgeAllNotes={handleAcknowledgeAllHandoverNotes}
                outgoingCommanderName={currentHandover.outgoingSignOff?.commanderName || 'Capt. Marcus Vance'}
                outgoingCommanderBadge={currentHandover.outgoingSignOff?.badgeNumber || 'KP-8421'}
                incomingCommanderName={currentHandover.incomingSignOff?.commanderName || 'Capt. Jonathan Hayes'}
                incomingCommanderBadge={currentHandover.incomingSignOff?.badgeNumber || 'KP-7890'}
                inmates={inmates}
                compactView={true}
              />
            )}

            {/* Shift Critical Resources & Equipment Inventory Check Widget */}
            {(executiveSummaryTab === 'inventory') && (
              <ResourcesInventoryCheckSection
                language={language}
                equipment={currentHandover.equipment}
                contrabandItems={currentHandover.contrabandSeized || INITIAL_CONTRABAND_ITEMS}
                inmates={inmates}
                outgoingShift={currentHandover.outgoingShift}
                incomingShift={currentHandover.incomingShift}
                outgoingCommanderName={currentHandover.outgoingSignOff?.commanderName || 'Capt. Marcus Vance'}
                outgoingCommanderBadge={currentHandover.outgoingSignOff?.badgeNumber || 'KP-8421'}
                incomingCommanderName={currentHandover.incomingSignOff?.commanderName || 'Capt. Jonathan Hayes'}
                incomingCommanderBadge={currentHandover.incomingSignOff?.badgeNumber || 'KP-7890'}
                onUpdateCount={handleUpdateEquipmentCount}
                onUpdateCondition={handleUpdateEquipmentCondition}
                onToggleVerification={handleToggleEquipmentVerification}
                onVerifyAllMatching={handleVerifyAllEquipment}
                onAddEquipmentItem={handleAddEquipmentItem}
                onUpdateEquipmentItem={handleUpdateEquipmentItem}
                onUpdateContrabandSeverity={handleUpdateContrabandSeverity}
                onUpdateContrabandDisposalStatus={handleUpdateContrabandDisposalStatus}
                onAddContrabandItem={handleAddContrabandItem}
                onDeleteContrabandItem={handleDeleteContrabandItem}
                onProceedToSignOff={() => setActiveTab('signoffs')}
                compactView={true}
              />
            )}

            {/* Dedicated Contraband Seized Table & 30-Day Trend Chart in Executive Summary */}
            {(executiveSummaryTab === 'contraband') && (
              <div className="space-y-4">
                <Contraband30DayTrendChart language={language} />
                <ContrabandSeizedTable
                  language={language}
                  items={currentHandover.contrabandSeized || INITIAL_CONTRABAND_ITEMS}
                  inmates={inmates}
                  currentOfficerName={currentHandover.outgoingSignOff?.commanderName || 'Capt. Marcus Vance'}
                  currentOfficerBadge={currentHandover.outgoingSignOff?.badgeNumber || 'KP-8421'}
                  onUpdateSeverity={handleUpdateContrabandSeverity}
                  onUpdateDisposalStatus={handleUpdateContrabandDisposalStatus}
                  onAddItem={handleAddContrabandItem}
                  onDeleteItem={handleDeleteContrabandItem}
                  compactView={true}
                />
              </div>
            )}

            {/* Shift Handover Voice-to-Text Dictation Deck */}
            {(executiveSummaryTab === 'voice') && (
              <HandoverVoiceDictationWidget
                language={language}
                onAppendNote={handleAppendHandoverNote}
                outgoingCommanderName={currentHandover.outgoingSignOff?.commanderName || 'Capt. Marcus Vance'}
                outgoingCommanderBadge={currentHandover.outgoingSignOff?.badgeNumber || 'KP-8421'}
                incomingCommanderName={currentHandover.incomingSignOff?.commanderName || 'Capt. Jonathan Hayes'}
                incomingCommanderBadge={currentHandover.incomingSignOff?.badgeNumber || 'KP-7890'}
              />
            )}

            {/* Security Incident Audit (Tamper-Evident Ledger) in Executive Summary */}
            {(executiveSummaryTab === 'all' || executiveSummaryTab === 'audit') && (
              <SecurityIncidentAuditWidget
                language={language}
                auditTrail={currentHandover.auditTrail || []}
                handoverRef={currentHandover.referenceNumber}
                facilityName={currentHandover.facilityName}
                date={currentHandover.date}
                outgoingShift={currentHandover.outgoingShift}
                incomingShift={currentHandover.incomingShift}
                compactView={executiveSummaryTab === 'all'}
              />
            )}

            {/* Officer Biometric Check-in & Time-Stamped Attendance in Executive Summary */}
            {(executiveSummaryTab === 'all' || executiveSummaryTab === 'biometrics') && (
              <OfficerBiometricCheckInWidget
                language={language}
                currentShift={currentHandover.outgoingShift}
                facilityName={currentHandover.facilityName}
                handoverRef={currentHandover.referenceNumber}
                checkInRecords={currentHandover.biometricCheckIns || INITIAL_BIOMETRIC_CHECKINS}
                officersList={INITIAL_SECURITY_OFFICERS}
                onRecordCheckIn={handleRecordBiometricCheckIn}
                commanderName={currentHandover.outgoingSignOff?.commanderName || 'Capt. Marcus Vance'}
                commanderBadge={currentHandover.outgoingSignOff?.badgeNumber || 'KP-8421'}
                compactView={executiveSummaryTab === 'all'}
              />
            )}

            {/* Shift Communications (Secure Real-Time Encrypted Command Transit) in Executive Summary */}
            {(executiveSummaryTab === 'all' || executiveSummaryTab === 'comms') && (
              <div className="bg-slate-900 border border-cyan-500/40 rounded-xl p-4 text-white shadow-lg space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
                      <Radio className="w-4 h-4 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-200">
                          {language === 'fr' ? 'Transmissions de Relève Chiffrées (AES-256-GCM)' : 'Shift Communications (AES-256-GCM Encrypted Comms)'}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                          ACTIVE WSS LINK
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {currentHandover.referenceNumber} &bull; {currentHandover.facilityName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('comms')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-700/50 text-[11px] font-bold transition-all flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{language === 'fr' ? 'Plein Écran' : 'Full Console'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsChatSidebarOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold transition-all shadow-md shadow-cyan-900/40 flex items-center gap-1.5"
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span>{language === 'fr' ? 'Ouvrir Volet Latéral' : 'Open Sidebar'}</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {language === 'fr'
                    ? 'Canal de communication sécurisé et inviolable permettant aux commandants sortant et entrant d\'échanger des directives tactiques, de vérifier la conformité des trousseaux de clés et de consigner les accusés de réception en direct avec scellé cryptographique SHA-256.'
                    : 'End-to-end encrypted, tamper-evident communications channel for incoming and outgoing watch commanders to exchange directives, verify key control custody, and acknowledge handovers with SHA-256 integrity seals.'}
                </p>

                <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="flex items-center gap-1 text-cyan-400">
                    <Lock className="w-3.5 h-3.5" />
                    <span>ALGORITHM: AES-256-GCM / SHA-256 INTEGRITY SEAL</span>
                  </span>
                  <div className="flex items-center gap-2 text-slate-300">
                    <span>Vance (SENTINEL-1)</span>
                    <span className="text-slate-600">&harr;</span>
                    <span>Hayes (EAGLE-2)</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
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
            <span>{language === 'fr' ? 'Tâches & Consignes' : 'Tasks & Orders'}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'tasks' ? 'bg-indigo-800 text-indigo-100' : 'bg-indigo-100 text-indigo-800'
            }`}>
              {currentHandover.tasks.length}
            </span>
          </button>

          {/* Tab: Personnel Tracking & Staffing */}
          <button
            onClick={() => setActiveTab('personnel')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'personnel'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{language === 'fr' ? 'Effectifs & Gardes' : 'Staffing & Sentinels'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              {currentHandover.personnelSummary ? `${currentHandover.personnelSummary.staffing.deployedOfficersCount}/${currentHandover.personnelSummary.staffing.minimumRequiredOfficers}` : '24/22'}
            </span>
          </button>

          {/* Tab: Shift Timeline */}
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <History className="w-4 h-4" />
            <span>{language === 'fr' ? 'Chronologie du Quart' : 'Shift Timeline'}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'timeline' ? 'bg-indigo-800 text-indigo-100' : 'bg-indigo-100 text-indigo-800'
            }`}>
              {(currentHandover.timelineEvents || INITIAL_TIMELINE_EVENTS).length}
            </span>
          </button>

          {/* Tab: Shift Handover Notes */}
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <NotebookPen className="w-4 h-4" />
            <span>{language === 'fr' ? 'Consignes & Notes de Relève' : 'Shift Handover Notes'}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'notes' ? 'bg-indigo-800 text-indigo-100' : 'bg-indigo-100 text-indigo-800'
            }`}>
              {(currentHandover.handoverNotes || INITIAL_HANDOVER_NOTES).length}
            </span>
            {(currentHandover.handoverNotes || INITIAL_HANDOVER_NOTES).some(n => !n.isAcknowledgedByIncoming) && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Notes en attente de visa" />
            )}
          </button>

          {/* Tab: Resources & Inventory Check */}
          <button
            onClick={() => setActiveTab('equipment')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'equipment'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Key className="w-4 h-4 text-amber-400" />
            <span>{language === 'fr' ? 'Ressources & Inventaire' : 'Resources & Inventory Check'}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              inventoryClearance.isCriticalCleared 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-amber-100 text-amber-800'
            }`}>
              {inventoryClearance.verifiedItems}/{inventoryClearance.totalItems}
            </span>
            {inventoryClearance.isCriticalCleared ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : inventoryClearance.variancesCount > 0 ? (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                {inventoryClearance.variancesCount} {language === 'fr' ? 'écart(s)' : 'variance(s)'}
              </span>
            ) : null}
          </button>

          {/* Tab: Contraband Seized Register */}
          <button
            onClick={() => setActiveTab('contraband')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'contraband'
                ? 'bg-rose-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-rose-700'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <span>{language === 'fr' ? 'Objets Saisis & Scellés' : 'Contraband Seized'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-100 text-rose-900">
              {(currentHandover.contrabandSeized || INITIAL_CONTRABAND_ITEMS).length}
            </span>
            {(currentHandover.contrabandSeized || INITIAL_CONTRABAND_ITEMS).some(i => i.severityLevel === 'critical') && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" title="Critical Lethal Contraband" />
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

          {/* Tab: Security Incident Audit */}
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-emerald-700'
            }`}
          >
            <FileLock2 className="w-4 h-4 text-emerald-400" />
            <span>{language === 'fr' ? 'Audit Sécurité' : 'Security Incident Audit'}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'audit' ? 'bg-emerald-950 text-emerald-300' : 'bg-emerald-100 text-emerald-900'
            }`}>
              {(currentHandover.auditTrail || []).length}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Tamper-Evident SHA-256 Ledger" />
          </button>

          {/* Tab: Officer Biometric Check-in */}
          <button
            onClick={() => setActiveTab('biometrics')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'biometrics'
                ? 'bg-cyan-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-cyan-700'
            }`}
          >
            <Fingerprint className="w-4 h-4 text-cyan-400" />
            <span>{language === 'fr' ? 'Pointage Biométrique' : 'Biometric Check-in'}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'biometrics' ? 'bg-cyan-950 text-cyan-200' : 'bg-cyan-100 text-cyan-900'
            }`}>
              {(currentHandover.biometricCheckIns || INITIAL_BIOMETRIC_CHECKINS).length}/{INITIAL_SECURITY_OFFICERS.length}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" title="Live Fingerprint Terminal Active" />
          </button>

          {/* Tab: Shift Communications Secure Chat */}
          <button
            onClick={() => setActiveTab('comms')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'comms'
                ? 'bg-gradient-to-r from-cyan-900 to-indigo-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-cyan-700'
            }`}
          >
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>{language === 'fr' ? 'Transmissions de Relève' : 'Shift Comms'}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'comms' ? 'bg-cyan-950 text-cyan-200' : 'bg-cyan-100 text-cyan-900'
            }`}>
              E2EE
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="256-Bit Encrypted WebSocket Channel" />
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

      {/* TAB CONTENT 2.5: PERSONNEL TRACKING & SAFETY STAFFING */}
      {activeTab === 'personnel' && (
        <PersonnelTrackingWidget
          language={language}
          currentShift={currentHandover.outgoingShift}
          facilityName={currentHandover.facilityName}
        />
      )}

      {/* TAB CONTENT 2.7: CHRONOLOGICAL SHIFT TIMELINE & EVENT LOG */}
      {activeTab === 'timeline' && (
        <ShiftTimelineWidget
          language={language}
          currentShift={currentHandover.outgoingShift}
          facilityName={currentHandover.facilityName}
          events={currentHandover.timelineEvents || INITIAL_TIMELINE_EVENTS}
          onAddEvent={handleCreateTimelineEvent}
          onVerifyEvent={handleVerifyTimelineEvent}
        />
      )}

      {/* TAB CONTENT 2.8: STRUCTURED SHIFT HANDOVER NOTES & DIRECTIVES */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <HandoverVoiceDictationWidget
            language={language}
            onAppendNote={handleAppendHandoverNote}
            outgoingCommanderName={currentHandover.outgoingSignOff?.commanderName || 'Capt. Marcus Vance'}
            outgoingCommanderBadge={currentHandover.outgoingSignOff?.badgeNumber || 'KP-8421'}
            incomingCommanderName={currentHandover.incomingSignOff?.commanderName || 'Capt. Jonathan Hayes'}
            incomingCommanderBadge={currentHandover.incomingSignOff?.badgeNumber || 'KP-7890'}
          />

          <ShiftHandoverNotesSection
            language={language}
            notes={currentHandover.handoverNotes || INITIAL_HANDOVER_NOTES}
            onAppendNote={handleAppendHandoverNote}
            onAcknowledgeNote={handleAcknowledgeHandoverNote}
            onAcknowledgeAllNotes={handleAcknowledgeAllHandoverNotes}
            outgoingCommanderName={currentHandover.outgoingSignOff?.commanderName || 'Capt. Marcus Vance'}
            outgoingCommanderBadge={currentHandover.outgoingSignOff?.badgeNumber || 'KP-8421'}
            incomingCommanderName={currentHandover.incomingSignOff?.commanderName || 'Capt. Jonathan Hayes'}
            incomingCommanderBadge={currentHandover.incomingSignOff?.badgeNumber || 'KP-7890'}
            inmates={inmates}
          />
        </div>
      )}

      {/* TAB CONTENT 3: RESOURCES & INVENTORY CHECK */}
      {activeTab === 'equipment' && (
        <ResourcesInventoryCheckSection
          language={language}
          equipment={currentHandover.equipment}
          contrabandItems={currentHandover.contrabandSeized || INITIAL_CONTRABAND_ITEMS}
          inmates={inmates}
          outgoingShift={currentHandover.outgoingShift}
          incomingShift={currentHandover.incomingShift}
          outgoingCommanderName={currentHandover.outgoingSignOff?.commanderName || 'Capt. Marcus Vance'}
          outgoingCommanderBadge={currentHandover.outgoingSignOff?.badgeNumber || 'KP-8421'}
          incomingCommanderName={currentHandover.incomingSignOff?.commanderName || 'Capt. Jonathan Hayes'}
          incomingCommanderBadge={currentHandover.incomingSignOff?.badgeNumber || 'KP-7890'}
          onUpdateCount={handleUpdateEquipmentCount}
          onUpdateCondition={handleUpdateEquipmentCondition}
          onToggleVerification={handleToggleEquipmentVerification}
          onVerifyAllMatching={handleVerifyAllEquipment}
          onAddEquipmentItem={handleAddEquipmentItem}
          onUpdateEquipmentItem={handleUpdateEquipmentItem}
          onUpdateContrabandSeverity={handleUpdateContrabandSeverity}
          onUpdateContrabandDisposalStatus={handleUpdateContrabandDisposalStatus}
          onAddContrabandItem={handleAddContrabandItem}
          onDeleteContrabandItem={handleDeleteContrabandItem}
          onProceedToSignOff={() => setActiveTab('signoffs')}
          compactView={false}
        />
      )}

      {/* TAB CONTENT 3.5: CONTRABAND SEIZED & EVIDENCE REPOSITORY */}
      {activeTab === 'contraband' && (
        <div className="space-y-6">
          <Contraband30DayTrendChart language={language} />
          <ContrabandSeizedTable
            language={language}
            items={currentHandover.contrabandSeized || INITIAL_CONTRABAND_ITEMS}
            inmates={inmates}
            currentOfficerName={currentHandover.outgoingSignOff?.commanderName || 'Capt. Marcus Vance'}
            currentOfficerBadge={currentHandover.outgoingSignOff?.badgeNumber || 'KP-8421'}
            onUpdateSeverity={handleUpdateContrabandSeverity}
            onUpdateDisposalStatus={handleUpdateContrabandDisposalStatus}
            onAddItem={handleAddContrabandItem}
            onDeleteItem={handleDeleteContrabandItem}
            compactView={false}
          />
        </div>
      )}

      {/* TAB CONTENT 4: SIGN-OFFS & RATIFICATION */}
      {activeTab === 'signoffs' && (
        <div className="space-y-6">
          
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>{language === 'fr' ? 'Protocole Légal de Passation de Garde & Signatures Numériques' : 'Official Custodial Handover Protocol & Digital Signatures'}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {language === 'fr'
                  ? 'Conformément aux directives pénitentiaires, la responsabilité légale de la garde est officiellement transférée après vérification contradictoire des matériels et signature mutuelle.'
                  : 'Pursuant to national corrections standing orders, legal command transfer takes effect upon joint resources verification and mutual digital sign-off.'}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                title="Open print view formatted for prison warden submission"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>{language === 'fr' ? 'Générer Rapport PDF (Direction)' : 'Generate PDF Shift Report'}</span>
              </button>
            </div>
          </div>

          {/* Pre-Sign-Off Critical Security Equipment Clearance Protocol Banner */}
          <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
            inventoryClearance.isCriticalCleared
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg shrink-0 ${
                inventoryClearance.isCriticalCleared ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
              }`}>
                {inventoryClearance.isCriticalCleared ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-xs font-bold uppercase tracking-wider">
                    {inventoryClearance.isCriticalCleared
                      ? (language === 'fr' ? 'Contrôle des Équipements Validé : Autorisation de Signature Donnée' : 'Security Inventory Verified: Ready for Command Sign-Off')
                      : (language === 'fr' ? 'Contrôle Préalable Obligatoire : Clés, Radios & Entraves' : 'Mandatory Pre-Sign-Off Resources Audit Incomplete')}
                  </strong>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    inventoryClearance.isCriticalCleared ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                  }`}>
                    {inventoryClearance.verifiedItems}/{inventoryClearance.totalItems} {language === 'fr' ? 'matériels pointés' : 'items checked'} ({inventoryClearance.percentVerified}%)
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {inventoryClearance.isCriticalCleared
                    ? (language === 'fr'
                        ? 'Toutes les clés maîtresses, trousseaux scellés, postes UHF et matériels d\'entrave ont été certifiés conformes par les commandants de quart.'
                        : 'Dual command inspection has verified 100% of master keys, encrypted tactical radios, and restraint gear. Digital certification is unlocked.')
                    : (language === 'fr'
                        ? `Il reste ${inventoryClearance.criticalTotal - inventoryClearance.criticalVerified} équipement(s) critique(s) ou écarts à pointer avant de signer la décharge officielle.`
                        : `${inventoryClearance.criticalTotal - inventoryClearance.criticalVerified} critical equipment items or variances require physical verification before signing.`)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <button
                onClick={() => setActiveTab('equipment')}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Key className="w-3.5 h-3.5 text-amber-600" />
                <span>{language === 'fr' ? 'Ouvrir l\'Inventaire des Ressources' : 'Open Resources Check'}</span>
              </button>
            </div>
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

      {/* TAB CONTENT: SECURITY INCIDENT AUDIT (TAMPER-EVIDENT LEDGER) */}
      {activeTab === 'audit' && (
        <SecurityIncidentAuditWidget
          language={language}
          auditTrail={currentHandover.auditTrail || []}
          handoverRef={currentHandover.referenceNumber}
          facilityName={currentHandover.facilityName}
          date={currentHandover.date}
          outgoingShift={currentHandover.outgoingShift}
          incomingShift={currentHandover.incomingShift}
          compactView={false}
        />
      )}

      {/* TAB CONTENT: OFFICER BIOMETRIC CHECK-IN (FINGERPRINT SCANNER & MUSTER LEDGER) */}
      {activeTab === 'biometrics' && (
        <OfficerBiometricCheckInWidget
          language={language}
          currentShift={currentHandover.outgoingShift}
          facilityName={currentHandover.facilityName}
          handoverRef={currentHandover.referenceNumber}
          checkInRecords={currentHandover.biometricCheckIns || INITIAL_BIOMETRIC_CHECKINS}
          officersList={INITIAL_SECURITY_OFFICERS}
          onRecordCheckIn={handleRecordBiometricCheckIn}
          commanderName={currentHandover.outgoingSignOff?.commanderName || 'Capt. Marcus Vance'}
          commanderBadge={currentHandover.outgoingSignOff?.badgeNumber || 'KP-8421'}
          compactView={false}
        />
      )}

      {/* TAB CONTENT: SHIFT COMMUNICATIONS (FULL-PAGE EMBEDDED CONSOLE) */}
      {activeTab === 'comms' && (
        <div className="bg-slate-950 border border-cyan-500/30 rounded-2xl overflow-hidden shadow-2xl p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-500/20">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                  {language === 'fr' ? 'Canal Sécurisé de Transmissions de Relève' : 'Shift Communications Command Console'}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {currentHandover.referenceNumber} &bull; {currentHandover.facilityName} &bull; AES-256-GCM / SHA-256
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>WSS SECURE LINK</span>
              </span>
            </div>
          </div>

          <div className="h-[680px] rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-inner relative flex justify-center">
            <div className="w-full h-full">
              <ShiftCommunicationsSidebar
                isOpen={true}
                onClose={() => setActiveTab('risks')}
                handoverId={currentHandover.id}
                handoverRef={currentHandover.referenceNumber}
                facilityName={currentHandover.facilityName}
                outgoingShift={currentHandover.outgoingShift}
                incomingShift={currentHandover.incomingShift}
                outgoingCommanderName={currentHandover.outgoingSignOff?.commanderName || 'Capt. Marcus Vance'}
                outgoingCommanderBadge={currentHandover.outgoingSignOff?.badgeNumber || 'KP-8421'}
                incomingCommanderName={currentHandover.incomingSignOff?.commanderName || 'Capt. Jonathan Hayes'}
                incomingCommanderBadge={currentHandover.incomingSignOff?.badgeNumber || 'KP-7890'}
                language={language}
                onAuditLog={handleChatAuditLog}
              />
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
        inventoryClearance={inventoryClearance}
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

      {/* Tactical Emergency Alert Trigger Modal */}
      <EmergencyAlertModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        language={language}
        onBroadcast={handleBroadcastAlert}
      />

      {/* Voice-to-Text Handover Dictation Modal */}
      {isVoiceDictationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl">
            <HandoverVoiceDictationWidget
              language={language}
              onAppendNote={handleAppendHandoverNote}
              outgoingCommanderName={currentHandover.outgoingSignOff?.commanderName || 'Capt. Marcus Vance'}
              outgoingCommanderBadge={currentHandover.outgoingSignOff?.badgeNumber || 'KP-8421'}
              incomingCommanderName={currentHandover.incomingSignOff?.commanderName || 'Capt. Jonathan Hayes'}
              incomingCommanderBadge={currentHandover.incomingSignOff?.badgeNumber || 'KP-7890'}
              onClose={() => setIsVoiceDictationModalOpen(false)}
              isModal={true}
            />
          </div>
        </div>
      )}

      {/* FLOATING NOTIFICATION: DRAFT CACHE SYNC TOAST */}
      {cacheSyncToast && (
        <div className={`fixed top-4 right-4 z-50 p-3.5 rounded-xl shadow-2xl border text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-top-3 duration-200 ${
          cacheSyncToast.type === 'success'
            ? 'bg-slate-900 text-emerald-300 border-emerald-500/60 shadow-emerald-950/40'
            : cacheSyncToast.type === 'warning'
            ? 'bg-slate-900 text-amber-300 border-amber-500/60 shadow-amber-950/40'
            : 'bg-slate-900 text-cyan-300 border-cyan-500/60 shadow-cyan-950/40'
        }`}>
          <Save className="w-4 h-4 shrink-0 text-cyan-400" />
          <span>{cacheSyncToast.message}</span>
        </div>
      )}

      {/* FLOATING WARNING TOAST: CRITICAL INVENTORY SHORTAGE MONITOR */}
      {isShortageToastVisible && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-slate-900 border-2 border-amber-500/90 rounded-2xl shadow-2xl shadow-amber-950/50 p-4 text-slate-100 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0 animate-pulse">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>

            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-amber-400" />
                  <span>{language === 'fr' ? 'ALERTE PÉNURIE INVENTAIRE' : 'INVENTORY SHORTAGE DETECTED'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsShortageToastDismissed(true)}
                  className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
                  title="Dismiss Alert"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h4 className="text-xs font-bold text-white leading-tight">
                {language === 'fr'
                  ? `${criticalInventoryShortages.length} matériel(s) critique(s) sous le seuil réglementaire de sécurité`
                  : `${criticalInventoryShortages.length} critical security resource(s) below mandatory safety threshold`}
              </h4>

              <div className="space-y-1 pt-1 max-h-24 overflow-y-auto">
                {criticalInventoryShortages.slice(0, 3).map(item => (
                  <div key={item.id} className="text-[11px] font-mono text-slate-300 flex items-center justify-between bg-slate-950/70 px-2 py-1 rounded border border-slate-800">
                    <span className="truncate max-w-[200px]">{item.name}</span>
                    <span className="text-amber-400 font-bold shrink-0 ml-1">
                      {item.countedQty}/{item.expectedQty} {item.unit} {item.condition !== 'operational' ? `(${item.condition})` : ''}
                    </span>
                  </div>
                ))}
                {criticalInventoryShortages.length > 3 && (
                  <div className="text-[10px] text-slate-400 italic">
                    +{criticalInventoryShortages.length - 3} {language === 'fr' ? 'autres matériels signalés' : 'more items affected'}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleSnoozeShortageToast}
                  className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer font-medium"
                >
                  {language === 'fr' ? 'Rappeler dans 5 min' : 'Snooze (5m)'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('equipment');
                    setIsShortageToastDismissed(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>{language === 'fr' ? 'Inspecter & Réconcilier' : 'Inspect & Reconcile'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
