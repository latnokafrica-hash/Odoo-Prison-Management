import React, { useState, useMemo } from 'react';
import { 
  PrisonFacility, 
  Language, 
  UserRole,
  CellBlockInspectionRecord, 
  InfrastructureCheckItem, 
  MaintenanceWorkOrder, 
  SanitationViolation,
  InspectionType,
  InspectionStatus,
  InfrastructureCategory
} from '../../types';
import { 
  INITIAL_INSPECTIONS, 
  INITIAL_MAINTENANCE_ORDERS, 
  INITIAL_SANITATION_VIOLATIONS,
  STANDARD_INFRASTRUCTURE_ITEMS 
} from '../../data/inspectionData';
import { 
  ClipboardCheck, 
  ShieldAlert, 
  Wrench, 
  Droplets, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Search, 
  Filter, 
  Plus, 
  Printer, 
  Building2, 
  Eye, 
  Lock, 
  Wind, 
  Flame, 
  Lightbulb, 
  Sparkles, 
  User, 
  Calendar, 
  Clock, 
  ChevronRight, 
  X,
  FileText,
  BadgeAlert,
  ArrowRight,
  Check,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

interface FacilityInspectionHubProps {
  facilities: PrisonFacility[];
  language: Language;
  currentUserRole?: UserRole;
  initialFacilityId?: string;
  onNavigateToRooms?: () => void;
}

export const FacilityInspectionHub: React.FC<FacilityInspectionHubProps> = ({
  facilities,
  language,
  currentUserRole = 'superintendent',
  initialFacilityId = 'ALL',
  onNavigateToRooms,
}) => {
  // Navigation & Filter states
  const [activeTab, setActiveTab] = useState<'inspections' | 'infrastructure' | 'maintenance' | 'sanitation'>('inspections');
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(initialFacilityId);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  // Core Data Collections
  const [inspections, setInspections] = useState<CellBlockInspectionRecord[]>(INITIAL_INSPECTIONS);
  const [maintenanceOrders, setMaintenanceOrders] = useState<MaintenanceWorkOrder[]>(INITIAL_MAINTENANCE_ORDERS);
  const [sanitationViolations, setSanitationViolations] = useState<SanitationViolation[]>(INITIAL_SANITATION_VIOLATIONS);

  // Active Selected / Inspected Item for Modals
  const [selectedInspectionForView, setSelectedInspectionForView] = useState<CellBlockInspectionRecord | null>(null);
  const [isNewInspectionModalOpen, setIsNewInspectionModalOpen] = useState(false);
  const [isNewMaintenanceModalOpen, setIsNewMaintenanceModalOpen] = useState(false);
  const [isNewSanitationModalOpen, setIsNewSanitationModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Pre-fill context when logging maintenance or sanitation from an infrastructure item
  const [prefillContext, setPrefillContext] = useState<{
    facilityId: string;
    facilityName: string;
    blockName: string;
    locationDetail?: string;
    category?: any;
    defectNotes?: string;
  } | null>(null);

  // New Inspection Form State
  const [newInspFacilityId, setNewInspFacilityId] = useState(facilities[0]?.id || 'FAC-01');
  const [newInspBlockName, setNewInspBlockName] = useState('Block A - High Security Custody');
  const [newInspType, setNewInspType] = useState<InspectionType>('routine_daily');
  const [newInspInspectorName, setNewInspInspectorName] = useState('Senior Inspector David Kiprop');
  const [newInspInspectorRank, setNewInspInspectorRank] = useState('Senior Inspector');
  const [newInspInspectorBadge, setNewInspInspectorBadge] = useState('KPS-8841');
  const [newInspCellsChecked, setNewInspCellsChecked] = useState(24);
  const [newInspCellsTotal, setNewInspCellsTotal] = useState(24);
  const [newInspContraband, setNewInspContraband] = useState('');
  const [newInspSummary, setNewInspSummary] = useState('');
  const [newInspDirectives, setNewInspDirectives] = useState('');
  
  // Interactive checklist items for new inspection
  const [newChecklist, setNewChecklist] = useState<{
    itemIndex: number;
    status: 'pass' | 'flagged' | 'critical_fail' | 'na';
    notes: string;
  }[]>(
    STANDARD_INFRASTRUCTURE_ITEMS.map((_, i) => ({
      itemIndex: i,
      status: 'pass',
      notes: ''
    }))
  );

  // New Maintenance Form State
  const [newMoFacilityId, setNewMoFacilityId] = useState(facilities[0]?.id || 'FAC-01');
  const [newMoBlockName, setNewMoBlockName] = useState('Block A - High Security Custody');
  const [newMoCellRoom, setNewMoCellRoom] = useState('');
  const [newMoCategory, setNewMoCategory] = useState<MaintenanceWorkOrder['category']>('lock_mechanism');
  const [newMoPriority, setNewMoPriority] = useState<MaintenanceWorkOrder['priority']>('medium');
  const [newMoTitle, setNewMoTitle] = useState('');
  const [newMoDesc, setNewMoDesc] = useState('');
  const [newMoReportedBy, setNewMoReportedBy] = useState('Correctional Duty Officer');
  const [newMoTechnician, setNewMoTechnician] = useState('Prison Facilities Engineer');
  const [newMoCost, setNewMoCost] = useState(5000);
  const [newMoParts, setNewMoParts] = useState('');

  // New Sanitation Form State
  const [newSanFacilityId, setNewSanFacilityId] = useState(facilities[0]?.id || 'FAC-01');
  const [newSanBlockName, setNewSanBlockName] = useState('Block B - General Remand');
  const [newSanLocation, setNewSanLocation] = useState('');
  const [newSanType, setNewSanType] = useState<SanitationViolation['violationType']>('black_mold_infestation');
  const [newSanSeverity, setNewSanSeverity] = useState<SanitationViolation['severity']>('major');
  const [newSanMandelaRef, setNewSanMandelaRef] = useState('Mandela Rule 13 (Sanitary Installations & Clean Water)');
  const [newSanDesc, setNewSanDesc] = useState('');
  const [newSanRemedy, setNewSanRemedy] = useState('');
  const [newSanDeadlineDays, setNewSanDeadlineDays] = useState(3);
  const [newSanHealthOfficer, setNewSanHealthOfficer] = useState('District Public Health Officer');

  // Facilities list lookup
  const facilityLookup = useMemo(() => {
    const map: Record<string, PrisonFacility> = {};
    facilities.forEach(f => {
      map[f.id] = f;
    });
    return map;
  }, [facilities]);

  // Active facility object if single selected
  const activeFacility = selectedFacilityId !== 'ALL' ? facilityLookup[selectedFacilityId] : null;

  // Filtered Inspections
  const filteredInspections = useMemo(() => {
    return inspections.filter(insp => {
      if (selectedFacilityId !== 'ALL' && insp.facilityId !== selectedFacilityId) return false;
      if (statusFilter !== 'ALL' && insp.status !== statusFilter) return false;
      if (typeFilter !== 'ALL' && insp.inspectionType !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = insp.inspectionCode.toLowerCase().includes(q);
        const matchFac = insp.facilityName.toLowerCase().includes(q);
        const matchBlock = insp.blockName.toLowerCase().includes(q);
        const matchInspector = insp.leadInspectorName.toLowerCase().includes(q);
        const matchSummary = insp.summaryFindings.toLowerCase().includes(q);
        if (!matchCode && !matchFac && !matchBlock && !matchInspector && !matchSummary) return false;
      }
      return true;
    });
  }, [inspections, selectedFacilityId, statusFilter, typeFilter, searchQuery]);

  // Filtered Maintenance Orders
  const filteredMaintenance = useMemo(() => {
    return maintenanceOrders.filter(mo => {
      if (selectedFacilityId !== 'ALL' && mo.facilityId !== selectedFacilityId) return false;
      if (statusFilter !== 'ALL' && mo.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNum = mo.orderNumber.toLowerCase().includes(q);
        const matchTitle = mo.title.toLowerCase().includes(q);
        const matchBlock = mo.blockName.toLowerCase().includes(q);
        const matchTech = (mo.assignedTechnician || '').toLowerCase().includes(q);
        if (!matchNum && !matchTitle && !matchBlock && !matchTech) return false;
      }
      return true;
    });
  }, [maintenanceOrders, selectedFacilityId, statusFilter, searchQuery]);

  // Filtered Sanitation Violations
  const filteredSanitation = useMemo(() => {
    return sanitationViolations.filter(sv => {
      if (selectedFacilityId !== 'ALL' && sv.facilityId !== selectedFacilityId) return false;
      if (statusFilter !== 'ALL' && sv.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNum = sv.caseNumber.toLowerCase().includes(q);
        const matchLoc = sv.locationDetail.toLowerCase().includes(q);
        const matchDesc = sv.description.toLowerCase().includes(q);
        const matchRule = sv.mandelaRuleRef.toLowerCase().includes(q);
        if (!matchNum && !matchLoc && !matchDesc && !matchRule) return false;
      }
      return true;
    });
  }, [sanitationViolations, selectedFacilityId, statusFilter, searchQuery]);

  // Key KPI metrics calculations (respects selectedFacilityId)
  const kpis = useMemo(() => {
    const relevantInspections = selectedFacilityId === 'ALL' 
      ? inspections 
      : inspections.filter(i => i.facilityId === selectedFacilityId);

    const relevantMaintenance = selectedFacilityId === 'ALL' 
      ? maintenanceOrders 
      : maintenanceOrders.filter(m => m.facilityId === selectedFacilityId);

    const relevantSanitation = selectedFacilityId === 'ALL' 
      ? sanitationViolations 
      : sanitationViolations.filter(s => s.facilityId === selectedFacilityId);

    const totalInspections = relevantInspections.length;
    const avgScore = totalInspections > 0
      ? Math.round(relevantInspections.reduce((acc, i) => acc + i.complianceScore, 0) / totalInspections)
      : 100;

    const criticalInspectionsCount = relevantInspections.filter(i => i.status === 'critical_fail').length;
    const urgentWorkOrders = relevantMaintenance.filter(m => m.priority === 'urgent_security_breach' && m.status !== 'completed').length;
    const pendingWorkOrders = relevantMaintenance.filter(m => m.status === 'pending' || m.status === 'in_progress').length;
    const activeSanitationCases = relevantSanitation.filter(s => s.status === 'active' || s.status === 'fumigation_scheduled' || s.status === 'rectification_underway').length;

    return {
      totalInspections,
      avgScore,
      criticalHazards: criticalInspectionsCount + urgentWorkOrders,
      pendingWorkOrders,
      activeSanitationCases
    };
  }, [inspections, maintenanceOrders, sanitationViolations, selectedFacilityId]);

  // Helper for status badge colors
  const getInspectionStatusBadge = (status: InspectionStatus) => {
    switch (status) {
      case 'passed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {language === 'fr' ? 'Conforme / Validé' : 'Passed & Certified'}
          </span>
        );
      case 'minor_issues':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            {language === 'fr' ? 'Anomalies Mineures' : 'Minor Deficiencies'}
          </span>
        );
      case 'critical_fail':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            {language === 'fr' ? 'Échec Critique Sécurité' : 'Critical Hazard / Fail'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            {language === 'fr' ? 'En Cours' : 'In Progress'}
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: MaintenanceWorkOrder['priority']) => {
    switch (priority) {
      case 'urgent_security_breach':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 border border-red-300">
            <BadgeAlert className="w-3 h-3 text-red-600" />
            {language === 'fr' ? 'URGENCE SÉCURITAIRE' : 'URGENT BREACH'}
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            {language === 'fr' ? 'Élevée' : 'High Priority'}
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
            {language === 'fr' ? 'Moyenne' : 'Medium'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            {language === 'fr' ? 'Basse' : 'Low'}
          </span>
        );
    }
  };

  const getCategoryIcon = (category: InfrastructureCategory) => {
    switch (category) {
      case 'locks_doors':
        return <Lock className="w-4 h-4 text-amber-600" />;
      case 'bars_grilles':
        return <Building2 className="w-4 h-4 text-slate-700" />;
      case 'surveillance_cctv':
        return <Eye className="w-4 h-4 text-indigo-600" />;
      case 'ventilation_air':
        return <Wind className="w-4 h-4 text-cyan-600" />;
      case 'plumbing_sanitary':
        return <Droplets className="w-4 h-4 text-blue-600" />;
      case 'electrical_lighting':
        return <Lightbulb className="w-4 h-4 text-yellow-600" />;
      case 'fire_life_safety':
        return <Flame className="w-4 h-4 text-rose-600" />;
      case 'anti_ligature':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
    }
  };

  // Handler: Complete or Advance Maintenance Order
  const handleUpdateMaintenanceStatus = (id: string, newStatus: MaintenanceWorkOrder['status']) => {
    setMaintenanceOrders(prev => prev.map(m => {
      if (m.id === id) {
        return {
          ...m,
          status: newStatus,
          completedDate: newStatus === 'completed' ? new Date().toISOString().slice(0, 16).replace('T', ' ') : m.completedDate
        };
      }
      return m;
    }));
  };

  // Handler: Update Sanitation Violation Status
  const handleUpdateSanitationStatus = (id: string, newStatus: SanitationViolation['status']) => {
    setSanitationViolations(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, status: newStatus };
      }
      return s;
    }));
  };

  // Handler: Create New Inspection
  const handleCreateInspection = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedFac = facilityLookup[newInspFacilityId] || facilities[0];
    
    // Count passes vs flags vs fails to compute score
    const totalChecks = newChecklist.length;
    const fails = newChecklist.filter(c => c.status === 'critical_fail').length;
    const flags = newChecklist.filter(c => c.status === 'flagged').length;
    
    let score = 100;
    score -= (fails * 20);
    score -= (flags * 6);
    if (score < 30) score = 30;

    let derivedStatus: InspectionStatus = 'passed';
    if (fails > 0) derivedStatus = 'critical_fail';
    else if (flags > 0) derivedStatus = 'minor_issues';

    const generatedChecks: InfrastructureCheckItem[] = newChecklist.map((c, idx) => {
      const template = STANDARD_INFRASTRUCTURE_ITEMS[c.itemIndex];
      return {
        id: `chk-custom-${Date.now()}-${idx}`,
        category: template.category,
        name: template.name,
        standardCode: template.standardCode,
        status: c.status,
        notes: c.notes || (c.status === 'pass' ? 'Inspected and certified in order.' : 'Deficiency observed during routine walk-through.'),
        lastChecked: new Date().toISOString().slice(0, 16).replace('T', ' ')
      };
    });

    const newRec: CellBlockInspectionRecord = {
      id: `insp-${Date.now()}`,
      inspectionCode: `INSP/2026/09/${String(inspections.length + 20).padStart(3, '0')}`,
      facilityId: selectedFac.id,
      facilityName: selectedFac.name,
      blockId: `blk-custom-${Date.now()}`,
      blockName: newInspBlockName,
      inspectionType: newInspType,
      inspectionDate: new Date().toISOString().slice(0, 10),
      inspectionTime: new Date().toTimeString().slice(0, 5),
      leadInspectorName: newInspInspectorName,
      leadInspectorRank: newInspInspectorRank,
      leadInspectorBadge: newInspInspectorBadge,
      status: derivedStatus,
      complianceScore: score,
      cellsCheckedCount: Number(newInspCellsChecked),
      cellsTotalCount: Number(newInspCellsTotal),
      infrastructureChecks: generatedChecks,
      contrabandFoundSummary: newInspContraband || undefined,
      maintenanceOrdersGenerated: [],
      sanitationViolationsGenerated: [],
      summaryFindings: newInspSummary || 'Physical inspection of cell block concluded. Structural grilles, locking assemblies, and sanitary installations assessed.',
      correctiveDirectives: newInspDirectives || 'Standard operational custodial directives in effect.',
      signature: `${newInspInspectorName} / ${newInspInspectorBadge}`
    };

    setInspections(prev => [newRec, ...prev]);
    setIsNewInspectionModalOpen(false);
    setSelectedInspectionForView(newRec);
  };

  // Handler: Create New Maintenance Work Order
  const handleCreateMaintenanceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedFac = facilityLookup[newMoFacilityId] || facilities[0];

    const newMo: MaintenanceWorkOrder = {
      id: `wo-${Date.now()}`,
      orderNumber: `WO/2026/${String(maintenanceOrders.length + 95).padStart(4, '0')}`,
      facilityId: selectedFac.id,
      facilityName: selectedFac.name,
      blockId: `blk-${Date.now()}`,
      blockName: newMoBlockName,
      cellRoomName: newMoCellRoom || undefined,
      category: newMoCategory,
      priority: newMoPriority,
      title: newMoTitle,
      description: newMoDesc,
      reportedBy: newMoReportedBy,
      assignedTechnician: newMoTechnician,
      reportedDate: new Date().toISOString().slice(0, 10),
      targetCompletionDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
      status: 'pending',
      estimatedCostKes: Number(newMoCost),
      partsRequired: newMoParts || undefined
    };

    setMaintenanceOrders(prev => [newMo, ...prev]);
    setIsNewMaintenanceModalOpen(false);
    setActiveTab('maintenance');
  };

  // Handler: Create New Sanitation Violation
  const handleCreateSanitationViolation = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedFac = facilityLookup[newSanFacilityId] || facilities[0];

    const deadline = new Date(Date.now() + 86400000 * newSanDeadlineDays).toISOString().slice(0, 10);

    const newSan: SanitationViolation = {
      id: `san-${Date.now()}`,
      caseNumber: `SAN/2026/${String(sanitationViolations.length + 48).padStart(4, '0')}`,
      facilityId: selectedFac.id,
      facilityName: selectedFac.name,
      blockId: `blk-${Date.now()}`,
      blockName: newSanBlockName,
      locationDetail: newSanLocation,
      violationType: newSanType,
      severity: newSanSeverity,
      mandelaRuleRef: newSanMandelaRef,
      description: newSanDesc,
      remedialAction: newSanRemedy,
      reportedDate: new Date().toISOString().slice(0, 10),
      remedyDeadline: deadline,
      inspectedByOfficer: 'Environmental Health Officer',
      assignedHealthOfficer: newSanHealthOfficer,
      status: 'active'
    };

    setSanitationViolations(prev => [newSan, ...prev]);
    setIsNewSanitationModalOpen(false);
    setActiveTab('sanitation');
  };

  // Quick Action: Pre-fill and open maintenance from an infrastructure defect
  const handleQuickLogMaintenance = (
    facId: string, 
    facName: string, 
    block: string, 
    category: InfrastructureCategory, 
    defectName: string, 
    notes?: string
  ) => {
    let moCat: MaintenanceWorkOrder['category'] = 'lock_mechanism';
    if (category === 'bars_grilles') moCat = 'bars_grille';
    else if (category === 'plumbing_sanitary') moCat = 'sanitary_plumbing';
    else if (category === 'electrical_lighting') moCat = 'lighting_electrical';
    else if (category === 'ventilation_air') moCat = 'ventilation';
    else if (category === 'surveillance_cctv') moCat = 'cctv_sensor';

    setNewMoFacilityId(facId);
    setNewMoBlockName(block);
    setNewMoCategory(moCat);
    setNewMoPriority('high');
    setNewMoTitle(`Remediate Defect: ${defectName}`);
    setNewMoDesc(notes || `Defect identified during cell block inspection on ${defectName}. Requires immediate repair to meet prison security and habitability standards.`);
    setIsNewMaintenanceModalOpen(true);
  };

  // Quick Action: Pre-fill and open sanitation violation from an environmental item
  const handleQuickLogSanitation = (
    facId: string, 
    facName: string, 
    block: string, 
    defectName: string, 
    notes?: string
  ) => {
    setNewSanFacilityId(facId);
    setNewSanBlockName(block);
    setNewSanLocation(`${block} - ${defectName}`);
    setNewSanDesc(notes || `Sanitation deficiency identified during inspection: ${defectName}.`);
    setNewSanRemedy('Conduct specialized deep sanitation, disinfection, and repair in compliance with Nelson Mandela Rules 13-17.');
    setIsNewSanitationModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Facility Scope Selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 rounded">
                Odoo 19 Facilities & Custody Audit
              </span>
              <span className="text-xs text-slate-500 font-mono">
                models: prison.inspection, prison.maintenance.order, prison.sanitation
              </span>
              {activeFacility && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 rounded">
                  {activeFacility.name}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ClipboardCheck className="w-6 h-6 text-indigo-600" />
              {language === 'fr' 
                ? 'Inspections des Bâtiments & Contrôle d\'Infrastructure' 
                : 'Facility Inspections & Infrastructure Maintenance Hub'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
              {language === 'fr'
                ? 'Enregistrement des rondes périodiques de cellules, vérification des barreaux et serrures blindées, signalement GMAO et infractions d\'hygiène selon les Règles Nelson Mandela.'
                : 'Record periodic cell block rounds, test physical locks and security grilles, log corrective maintenance work orders, and track sanitation compliance for national correctional facilities.'}
            </p>
          </div>

          {/* Action buttons & Facility dropdown */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Facility Filter Selector */}
            <div className="relative">
              <select
                value={selectedFacilityId}
                onChange={e => setSelectedFacilityId(e.target.value)}
                className="appearance-none pl-8 pr-8 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer"
              >
                <option value="ALL">
                  {language === 'fr' ? '🏢 Tous les Établissements (National)' : '🏢 All Facilities (National Overview)'}
                </option>
                {facilities.map(fac => (
                  <option key={fac.id} value={fac.id}>
                    {fac.name} ({fac.currentInmates}/{fac.capacity})
                  </option>
                ))}
              </select>
              <Building2 className="w-4 h-4 text-slate-500 absolute left-2.5 top-2.5 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-3 pointer-events-none" />
            </div>

            {/* Print Inspection Dossier */}
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200"
              title={language === 'fr' ? 'Imprimer le certificat d\'inspection' : 'Print Inspection Dossier'}
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">{language === 'fr' ? 'Dossier d\'Inspection' : 'Inspection Dossier'}</span>
            </button>

            {/* Button: Record Cell Block Inspection */}
            <button
              onClick={() => setIsNewInspectionModalOpen(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'fr' ? 'Nouvelle Inspection' : 'Record Inspection'}</span>
            </button>
          </div>
        </div>

        {/* 2. Key Metrics Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <ClipboardCheck className="w-3.5 h-3.5 text-indigo-500" />
              {language === 'fr' ? 'Inspections Effectuées' : 'Inspections MTD'}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-slate-900">{kpis.totalInspections}</span>
              <span className="text-[11px] text-emerald-600 font-medium">
                {language === 'fr' ? 'Rondes actives' : 'Total recorded'}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              {language === 'fr' ? 'Conformité Moyenne' : 'Compliance Rate'}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-slate-900">{kpis.avgScore}%</span>
              <span className="text-[11px] text-slate-500">
                {kpis.avgScore >= 85 ? (language === 'fr' ? 'Optimal' : 'Standard met') : (language === 'fr' ? 'Vigilance' : 'Action needed')}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              {language === 'fr' ? 'Périls Critiques' : 'Critical Hazards'}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-xl font-bold ${kpis.criticalHazards > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                {kpis.criticalHazards}
              </span>
              <span className="text-[11px] text-slate-500">
                {language === 'fr' ? 'Sécurité & Barreaux' : 'Immediate breach'}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <Wrench className="w-3.5 h-3.5 text-amber-500" />
              {language === 'fr' ? 'Ordres GMAO Ouverts' : 'Active Work Orders'}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-slate-900">{kpis.pendingWorkOrders}</span>
              <span className="text-[11px] text-amber-600 font-medium">
                {language === 'fr' ? 'En réparation' : 'Pending/Progress'}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 col-span-2 md:col-span-1">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-cyan-600" />
              {language === 'fr' ? 'Déficits Salubrité' : 'Sanitation Flags'}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-xl font-bold ${kpis.activeSanitationCases > 0 ? 'text-cyan-700' : 'text-slate-900'}`}>
                {kpis.activeSanitationCases}
              </span>
              <span className="text-[11px] text-slate-500">
                {language === 'fr' ? 'Règles Mandela' : 'Mandela Rule std.'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Tab Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => { setActiveTab('inspections'); setStatusFilter('ALL'); }}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'inspections'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>{language === 'fr' ? 'Rondes & Inspections Cellules' : 'Cell Block Inspections'}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'inspections' ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-100 text-slate-600'
            }`}>
              {filteredInspections.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('infrastructure'); setStatusFilter('ALL'); }}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'infrastructure'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>{language === 'fr' ? 'Matrice Diagnostics Infrastructure' : 'Infrastructure Check Matrix'}</span>
          </button>

          <button
            onClick={() => { setActiveTab('maintenance'); setStatusFilter('ALL'); }}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'maintenance'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>{language === 'fr' ? 'Ordres de Maintenance (GMAO)' : 'Maintenance Requests'}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'maintenance' ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-100 text-slate-600'
            }`}>
              {filteredMaintenance.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('sanitation'); setStatusFilter('ALL'); }}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'sanitation'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Droplets className="w-4 h-4" />
            <span>{language === 'fr' ? 'Infractions Hygiène & Salubrité' : 'Sanitation Violations'}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'sanitation' ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-100 text-slate-600'
            }`}>
              {filteredSanitation.length}
            </span>
          </button>
        </div>

        {/* Action button inside tab bar to quickly log specific record */}
        <div className="flex items-center gap-2">
          {activeTab === 'maintenance' && (
            <button
              onClick={() => setIsNewMaintenanceModalOpen(true)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'fr' ? 'Créer Ordre GMAO' : 'Log Work Order'}</span>
            </button>
          )}

          {activeTab === 'sanitation' && (
            <button
              onClick={() => setIsNewSanitationModalOpen(true)}
              className="px-3 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'fr' ? 'Signaler Infraction' : 'Log Violation'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Search and Secondary Filters Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={
              language === 'fr'
                ? 'Rechercher par référence, aile de détention, inspecteur...'
                : 'Search by reference, wing, inspector name, defect...'
            }
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {activeTab === 'inspections' && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 text-[11px] font-medium">{language === 'fr' ? 'Type:' : 'Type:'}</span>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 focus:outline-none"
              >
                <option value="ALL">{language === 'fr' ? 'Tous les types' : 'All Inspection Types'}</option>
                <option value="routine_daily">{language === 'fr' ? 'Ronde Quotidienne' : 'Daily Routine'}</option>
                <option value="weekly_comprehensive">{language === 'fr' ? 'Audit Hebdomadaire' : 'Weekly Comprehensive'}</option>
                <option value="monthly_structural">{language === 'fr' ? 'Structure & Génie' : 'Monthly Structural'}</option>
                <option value="surprise_shakedown">{language === 'fr' ? 'Fouille Inopinée' : 'Surprise Shakedown'}</option>
                <option value="mandela_sanitation_audit">{language === 'fr' ? 'Audit Nelson Mandela' : 'Mandela Sanitation'}</option>
              </select>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[11px] font-medium">{language === 'fr' ? 'Statut:' : 'Status:'}</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 focus:outline-none"
            >
              <option value="ALL">{language === 'fr' ? 'Tous les statuts' : 'All Statuses'}</option>
              {activeTab === 'inspections' && (
                <>
                  <option value="passed">{language === 'fr' ? 'Conforme' : 'Passed'}</option>
                  <option value="minor_issues">{language === 'fr' ? 'Anomalies Mineures' : 'Minor Issues'}</option>
                  <option value="critical_fail">{language === 'fr' ? 'Échec Critique' : 'Critical Fail'}</option>
                </>
              )}
              {activeTab === 'maintenance' && (
                <>
                  <option value="pending">{language === 'fr' ? 'En attente' : 'Pending'}</option>
                  <option value="in_progress">{language === 'fr' ? 'En cours de travaux' : 'In Progress'}</option>
                  <option value="completed">{language === 'fr' ? 'Terminé' : 'Completed'}</option>
                </>
              )}
              {activeTab === 'sanitation' && (
                <>
                  <option value="active">{language === 'fr' ? 'Infraction Active' : 'Active Hazard'}</option>
                  <option value="fumigation_scheduled">{language === 'fr' ? 'Désinfection Programmée' : 'Fumigation Scheduled'}</option>
                  <option value="reinspected_resolved">{language === 'fr' ? 'Résolu & Nettoyé' : 'Resolved'}</option>
                  <option value="closed">{language === 'fr' ? 'Clôturé' : 'Closed'}</option>
                </>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* 5. TAB 1: CELL BLOCK INSPECTIONS LIST */}
      {activeTab === 'inspections' && (
        <div className="space-y-4">
          {filteredInspections.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
              <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-800">
                {language === 'fr' ? 'Aucune inspection trouvée' : 'No inspection records found'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                {language === 'fr'
                  ? 'Aucune ronde enregistrée pour ces filtres. Cliquez sur Nouvelle Inspection pour démarrer un contrôle.'
                  : 'No inspections match the current filters. Click Record Inspection to log a new cell block check.'}
              </p>
              <button
                onClick={() => setIsNewInspectionModalOpen(true)}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'fr' ? 'Démarrer une Ronde' : 'Start Cell Inspection'}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredInspections.map(insp => {
                const isPassed = insp.status === 'passed';
                const isCritical = insp.status === 'critical_fail';

                return (
                  <div
                    key={insp.id}
                    className={`bg-white rounded-xl border transition-all hover:shadow-md flex flex-col justify-between ${
                      isCritical ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'
                    }`}
                  >
                    <div className="p-4 space-y-3">
                      {/* Top bar: Reference & Status */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {insp.inspectionCode}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {insp.inspectionDate} • {insp.inspectionTime}
                          </span>
                        </div>
                        {getInspectionStatusBadge(insp.status)}
                      </div>

                      {/* Title & Facility */}
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">
                          {insp.blockName}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{insp.facilityName}</span>
                        </p>
                      </div>

                      {/* Score Gauge & Cells checked */}
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {language === 'fr' ? 'Indice de Salubrité & Sécurité' : 'Compliance Rating'}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-lg font-bold ${
                              insp.complianceScore >= 90 ? 'text-emerald-700' :
                              insp.complianceScore >= 75 ? 'text-amber-700' : 'text-rose-700'
                            }`}>
                              {insp.complianceScore}%
                            </span>
                            <div className="w-20 bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  insp.complianceScore >= 90 ? 'bg-emerald-500' :
                                  insp.complianceScore >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                                }`}
                                style={{ width: `${insp.complianceScore}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-[11px] text-slate-500 font-medium">
                            {language === 'fr' ? 'Cellules Inspectées' : 'Cells Inspected'}
                          </div>
                          <div className="text-sm font-bold text-slate-800 mt-0.5">
                            {insp.cellsCheckedCount} / {insp.cellsTotalCount}
                          </div>
                        </div>
                      </div>

                      {/* Summary text */}
                      <p className="text-xs text-slate-600 line-clamp-2 italic">
                        "{insp.summaryFindings}"
                      </p>

                      {/* Contraband or Defect alert note if any */}
                      {insp.contrabandFoundSummary && (
                        <div className="bg-amber-50/70 border border-amber-200 rounded p-2 text-[11px] text-amber-800 flex items-start gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{insp.contrabandFoundSummary}</span>
                        </div>
                      )}

                      {/* Inspector signature / officer */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">{insp.leadInspectorName} ({insp.leadInspectorBadge})</span>
                        </div>
                        <span className="font-semibold text-slate-600">
                          {insp.infrastructureChecks.length} {language === 'fr' ? 'points vérifiés' : 'items checked'}
                        </span>
                      </div>
                    </div>

                    {/* Card Footer: View Inspection Details */}
                    <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 rounded-b-xl flex items-center justify-between">
                      <button
                        onClick={() => setSelectedInspectionForView(insp)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{language === 'fr' ? 'Voir le Procès-Verbal' : 'View Full Audit Report'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedInspectionForView(insp);
                          setIsPrintModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition-colors"
                        title={language === 'fr' ? 'Imprimer le certificat' : 'Print Certificate'}
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 6. TAB 2: INFRASTRUCTURE DIAGNOSTICS MATRIX */}
      {activeTab === 'infrastructure' && (
        <div className="space-y-4">
          <div className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-600" />
                {language === 'fr' ? 'Protocole Standard d\'Épreuve Physique des Matériels' : 'Physical Infrastructure & Security Hardware Test Matrix'}
              </h3>
              <p className="text-xs text-indigo-800/80 mt-0.5">
                {language === 'fr'
                  ? 'Contrôle direct des barreaux au son harmonique, serrurerie double panneton, vision panoramique CCTV et conformité Nelson Mandela.'
                  : 'Interactive audit matrix for structural manganese bars, double-throw mechanical locks, optical blindspot sweeps, and sanitary installations.'}
              </p>
            </div>

            <button
              onClick={() => setIsNewMaintenanceModalOpen(true)}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'fr' ? 'Générer une Réparation' : 'Log Maintenance Request'}</span>
            </button>
          </div>

          {/* Infrastructure Category Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STANDARD_INFRASTRUCTURE_ITEMS.map((item, idx) => {
              // Find matching check from latest inspections if available
              const recentChecks = inspections
                .flatMap(i => i.infrastructureChecks)
                .filter(c => c.category === item.category);

              const latestCheck = recentChecks[0];
              const isFlagged = latestCheck?.status === 'flagged';
              const isFail = latestCheck?.status === 'critical_fail';

              return (
                <div
                  key={idx}
                  className={`bg-white rounded-xl border p-4 flex flex-col justify-between transition-all hover:border-indigo-300 shadow-xs ${
                    isFail ? 'border-rose-300 ring-1 ring-rose-200' : isFlagged ? 'border-amber-300' : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-slate-100">
                          {getCategoryIcon(item.category)}
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-slate-500 font-semibold uppercase tracking-wider">
                            {item.standardCode}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                            {item.name}
                          </h4>
                        </div>
                      </div>

                      {latestCheck ? (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          latestCheck.status === 'pass' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          latestCheck.status === 'flagged' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                        }`}>
                          {latestCheck.status === 'pass' ? 'OPÉRATIONNEL' : latestCheck.status === 'flagged' ? 'ANOMALIE' : 'PÉRIL CRITIQUE'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                          NON TESTÉ
                        </span>
                      )}
                    </div>

                    {latestCheck?.notes && (
                      <div className="bg-slate-50 rounded-lg p-2.5 text-xs text-slate-600 border border-slate-100">
                        <span className="font-semibold text-slate-700">
                          {language === 'fr' ? 'Dernier constat: ' : 'Latest Audit Note: '}
                        </span>
                        {latestCheck.notes}
                      </div>
                    )}
                  </div>

                  {/* Actions to log work order or sanitation directly from this item */}
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {latestCheck?.lastChecked 
                        ? `${language === 'fr' ? 'Vérifié le' : 'Checked'}: ${latestCheck.lastChecked}`
                        : (language === 'fr' ? 'Inclus au protocole' : 'Mandatory in sweep')}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleQuickLogMaintenance(
                          activeFacility?.id || 'FAC-01',
                          activeFacility?.name || 'Kamiti National Maximum Security Penitentiary',
                          'Block A - High Security Custody',
                          item.category,
                          item.name,
                          latestCheck?.notes
                        )}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                        title={language === 'fr' ? 'Créer un ordre de réparation GMAO pour cet élément' : 'Log Maintenance Order'}
                      >
                        <Wrench className="w-3 h-3 text-amber-600" />
                        <span>{language === 'fr' ? 'GMAO' : 'Order'}</span>
                      </button>

                      {(item.category === 'plumbing_sanitary' || item.category === 'ventilation_air') && (
                        <button
                          onClick={() => handleQuickLogSanitation(
                            activeFacility?.id || 'FAC-01',
                            activeFacility?.name || 'Kamiti National Maximum Security Penitentiary',
                            'Block B - General Remand',
                            item.name,
                            latestCheck?.notes
                          )}
                          className="px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                          title={language === 'fr' ? 'Signaler une infraction sanitaire Nelson Mandela' : 'Log Sanitation Hazard'}
                        >
                          <Droplets className="w-3 h-3 text-cyan-600" />
                          <span>{language === 'fr' ? 'Salubrité' : 'Sanitation'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. TAB 3: MAINTENANCE REQUESTS (GMAO) */}
      {activeTab === 'maintenance' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              {language === 'fr' 
                ? 'Registre des Ordres de Travaux GMAO & Réparations Pénitentiaires' 
                : 'Facility Maintenance Work Orders & Corrective Engineering'}
            </h3>
            <span className="text-xs text-slate-500 font-mono">model: prison.maintenance.order</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMaintenance.map(mo => {
              const isCompleted = mo.status === 'completed';
              const isUrgent = mo.priority === 'urgent_security_breach';

              return (
                <div
                  key={mo.id}
                  className={`bg-white rounded-xl border p-4 flex flex-col justify-between transition-all hover:shadow-md ${
                    isUrgent && !isCompleted ? 'border-red-300 ring-1 ring-red-200' : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {mo.orderNumber}
                      </span>
                      {getPriorityBadge(mo.priority)}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {mo.title}
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{mo.blockName} {mo.cellRoomName ? `(${mo.cellRoomName})` : ''}</span>
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {mo.description}
                    </p>

                    {mo.partsRequired && (
                      <div className="text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-700">{language === 'fr' ? 'Pièces requises: ' : 'Parts: '}</span>
                        {mo.partsRequired}
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                      <div className="flex items-center justify-between">
                        <span>{language === 'fr' ? 'Technicien:' : 'Technician:'}</span>
                        <span className="font-medium text-slate-800">{mo.assignedTechnician || 'Unassigned'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>{language === 'fr' ? 'Date cible:' : 'Target Date:'}</span>
                        <span className="font-medium text-slate-800">{mo.targetCompletionDate}</span>
                      </div>
                      {mo.estimatedCostKes && (
                        <div className="flex items-center justify-between">
                          <span>{language === 'fr' ? 'Coût estimé:' : 'Estimated Cost:'}</span>
                          <span className="font-semibold text-indigo-700">{mo.estimatedCostKes.toLocaleString()} KES</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Toggle Buttons */}
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      mo.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      mo.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {mo.status === 'completed' ? (language === 'fr' ? 'RÉPARATION EFFECTUÉE' : 'COMPLETED') :
                       mo.status === 'in_progress' ? (language === 'fr' ? 'EN INTERVENTION' : 'IN PROGRESS') :
                       (language === 'fr' ? 'EN ATTENTE' : 'PENDING')}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {mo.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateMaintenanceStatus(mo.id, 'in_progress')}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold transition-colors"
                        >
                          {language === 'fr' ? 'Démarrer' : 'Start Job'}
                        </button>
                      )}
                      {mo.status === 'in_progress' && (
                        <button
                          onClick={() => handleUpdateMaintenanceStatus(mo.id, 'completed')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>{language === 'fr' ? 'Clôturer' : 'Complete'}</span>
                        </button>
                      )}
                      {mo.status === 'completed' && (
                        <button
                          onClick={() => handleUpdateMaintenanceStatus(mo.id, 'in_progress')}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold transition-colors"
                        >
                          {language === 'fr' ? 'Rouvrir' : 'Reopen'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 8. TAB 4: SANITATION & NELSON MANDELA VIOLATIONS */}
      {activeTab === 'sanitation' && (
        <div className="space-y-4">
          <div className="bg-cyan-50/60 border border-cyan-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-cyan-950 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-cyan-600" />
                {language === 'fr' ? 'Surveillance Sanitaire & Normes des Règles Nelson Mandela' : 'Correctional Sanitation & UN Nelson Mandela Rules Compliance'}
              </h3>
              <p className="text-xs text-cyan-800/80 mt-0.5">
                {language === 'fr'
                  ? 'Contrôle des Règles 13 (installations sanitaires), 14 (aération et lumière naturelle), 15 (propreté) et 17 (literie propre).'
                  : 'Statutory compliance tracking for potable water ingress, wastewater drainage, vermin fumigation, and human dignity standards.'}
              </p>
            </div>

            <button
              onClick={() => setIsNewSanitationModalOpen(true)}
              className="px-3.5 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'fr' ? 'Signaler une Infraction' : 'Log Violation'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSanitation.map(san => {
              const isResolved = san.status === 'reinspected_resolved' || san.status === 'closed';
              const isCritical = san.severity === 'critical_health_hazard';

              return (
                <div
                  key={san.id}
                  className={`bg-white rounded-xl border p-4 flex flex-col justify-between transition-all hover:shadow-md ${
                    isCritical && !isResolved ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {san.caseNumber}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isCritical ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                        san.severity === 'major' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {san.severity.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {san.locationDetail}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {san.mandelaRuleRef}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {san.facilityName}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {san.description}
                    </p>

                    <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-900 space-y-1">
                      <div className="font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                        {language === 'fr' ? 'Mesure Corrective Imposée:' : 'Remedial Action Required:'}
                      </div>
                      <p>{san.remedialAction}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                      <div className="flex items-center justify-between">
                        <span>{language === 'fr' ? 'Officier d\'Hygiène Assigné:' : 'Health Officer:'}</span>
                        <span className="font-medium text-slate-800">{san.assignedHealthOfficer || 'Public Health Officer'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>{language === 'fr' ? 'Délai d\'Exécution:' : 'Deadline:'}</span>
                        <span className="font-semibold text-rose-700">{san.remedyDeadline}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Advance status */}
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      isResolved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      san.status === 'fumigation_scheduled' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {san.status === 'reinspected_resolved' ? (language === 'fr' ? 'RÉSOLU & DÉCONTAMINÉ' : 'RESOLVED') :
                       san.status === 'fumigation_scheduled' ? (language === 'fr' ? 'DÉSINFECTION PROGRAMMÉE' : 'FUMIGATION SCHEDULED') :
                       san.status === 'rectification_underway' ? (language === 'fr' ? 'TRAVAUX EN COURS' : 'UNDERWAY') :
                       (language === 'fr' ? 'EN ATTENTE DE TRAITEMENT' : 'ACTIVE HAZARD')}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {san.status === 'active' && (
                        <button
                          onClick={() => handleUpdateSanitationStatus(san.id, 'fumigation_scheduled')}
                          className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[11px] font-semibold transition-colors"
                        >
                          {language === 'fr' ? 'Programmer Désinfection' : 'Schedule Treatment'}
                        </button>
                      )}
                      {san.status === 'fumigation_scheduled' && (
                        <button
                          onClick={() => handleUpdateSanitationStatus(san.id, 'rectification_underway')}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold transition-colors"
                        >
                          {language === 'fr' ? 'Intervention en Cours' : 'In Progress'}
                        </button>
                      )}
                      {(san.status === 'rectification_underway' || san.status === 'fumigation_scheduled') && (
                        <button
                          onClick={() => handleUpdateSanitationStatus(san.id, 'reinspected_resolved')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>{language === 'fr' ? 'Certifier Sain' : 'Certify Clean'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 9. MODAL: RECORD NEW CELL BLOCK INSPECTION */}
      {isNewInspectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col my-auto">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {language === 'fr' ? 'Enregistrer une Ronde Périodique de Cellules' : 'Record Cell Block Physical Inspection'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'fr' ? 'Vérification matérielle des cellules, grilles et installations de sécurité' : 'Security hardware testing, locking verification & Nelson Mandela audit'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewInspectionModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleCreateInspection} className="p-5 space-y-5 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'fr' ? 'Établissement Pénitentiaire' : 'Correctional Facility'}
                  </label>
                  <select
                    value={newInspFacilityId}
                    onChange={e => setNewInspFacilityId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    {facilities.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'fr' ? 'Aile / Bâtiment de Détention' : 'Cell Block / Wing'}
                  </label>
                  <input
                    type="text"
                    value={newInspBlockName}
                    onChange={e => setNewInspBlockName(e.target.value)}
                    placeholder="e.g. Block A - High Security Custody (Tier 1)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'fr' ? 'Type d\'Inspection' : 'Inspection Type'}
                  </label>
                  <select
                    value={newInspType}
                    onChange={e => setNewInspType(e.target.value as InspectionType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="routine_daily">{language === 'fr' ? 'Ronde Quotidienne du Matin' : 'Routine Daily Morning Check'}</option>
                    <option value="weekly_comprehensive">{language === 'fr' ? 'Audit Approfondi Hebdomadaire' : 'Weekly Comprehensive Tier Audit'}</option>
                    <option value="monthly_structural">{language === 'fr' ? 'Contrôle Génie & Résistance des Matériaux' : 'Monthly Structural Integrity Check'}</option>
                    <option value="surprise_shakedown">{language === 'fr' ? 'Fouille Inopinée & Recherche Contrebande' : 'Surprise Shakedown & Search'}</option>
                    <option value="mandela_sanitation_audit">{language === 'fr' ? 'Audit Salubrité Règles Nelson Mandela' : 'UN Nelson Mandela Sanitation Audit'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'fr' ? 'Inspecteur Responsable (Nom & Matricule)' : 'Lead Inspector (Name & Badge)'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newInspInspectorName}
                      onChange={e => setNewInspInspectorName(e.target.value)}
                      placeholder="Inspector Name"
                      className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800"
                      required
                    />
                    <input
                      type="text"
                      value={newInspInspectorBadge}
                      onChange={e => setNewInspInspectorBadge(e.target.value)}
                      placeholder="Badge KPS-XXXX"
                      className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'fr' ? 'Cellules Contrôlées / Total' : 'Cells Checked / Total in Block'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={newInspCellsChecked}
                      onChange={e => setNewInspCellsChecked(Number(e.target.value))}
                      className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800"
                      min={1}
                      required
                    />
                    <input
                      type="number"
                      value={newInspCellsTotal}
                      onChange={e => setNewInspCellsTotal(Number(e.target.value))}
                      className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800"
                      min={1}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'fr' ? 'Objets Interdits / Saisies de Contrebande' : 'Contraband / Prohibited Items Seized'}
                  </label>
                  <input
                    type="text"
                    value={newInspContraband}
                    onChange={e => setNewInspContraband(e.target.value)}
                    placeholder={language === 'fr' ? 'Ex: Néant ou 1 cuillère en plastique taillée' : 'e.g. None or 1 wire scrap confiscated'}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Interactive Checklist section */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-indigo-600" />
                    {language === 'fr' ? 'Grille de Contrôle des Éléments Critiques' : 'Security Hardware & Safety Item Checklist'}
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    {language === 'fr' ? 'Sélectionnez l\'état de chaque composant' : 'Mark component operational status'}
                  </span>
                </div>

                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {STANDARD_INFRASTRUCTURE_ITEMS.slice(0, 8).map((template, idx) => {
                    const currentStatus = newChecklist[idx]?.status || 'pass';

                    return (
                      <div
                        key={idx}
                        className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-slate-800">{template.name}</div>
                          <div className="text-[10px] font-mono text-slate-500">{template.standardCode}</div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setNewChecklist(prev => prev.map((c, i) => i === idx ? { ...c, status: 'pass' } : c));
                            }}
                            className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                              currentStatus === 'pass'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                            <span>{language === 'fr' ? 'Conforme' : 'Pass'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setNewChecklist(prev => prev.map((c, i) => i === idx ? { ...c, status: 'flagged' } : c));
                            }}
                            className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                              currentStatus === 'flagged'
                                ? 'bg-amber-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <AlertTriangle className="w-3 h-3" />
                            <span>{language === 'fr' ? 'Mineur' : 'Defect'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setNewChecklist(prev => prev.map((c, i) => i === idx ? { ...c, status: 'critical_fail' } : c));
                            }}
                            className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                              currentStatus === 'critical_fail'
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <XCircle className="w-3 h-3" />
                            <span>{language === 'fr' ? 'Péril' : 'Critical'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Summary and Directives */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'fr' ? 'Conclusions Générales de la Ronde' : 'General Audit Summary & Physical Observations'}
                  </label>
                  <textarea
                    rows={2}
                    value={newInspSummary}
                    onChange={e => setNewInspSummary(e.target.value)}
                    placeholder={language === 'fr' ? 'Observations sur le verrouillage des portes, éclairage et attitude des détenus...' : 'Observations on door deadbolts, illumination, sanitation and custody posture...'}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'fr' ? 'Directives Immédiates & Mesures Correctives' : 'Immediate Directives & Remedial Actions'}
                  </label>
                  <input
                    type="text"
                    value={newInspDirectives}
                    onChange={e => setNewInspDirectives(e.target.value)}
                    placeholder={language === 'fr' ? 'Ex: Remplacer le poussoir sanitaire sous 24h' : 'e.g. Desilt drain trap and lubricate deadbolt pins'}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewInspectionModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'fr' ? 'Valider et Signer le PV' : 'Sign & Certify Inspection'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 10. MODAL: LOG MAINTENANCE WORK ORDER */}
      {isNewMaintenanceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl my-auto">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-amber-50/50 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {language === 'fr' ? 'Créer un Ordre de Maintenance (GMAO)' : 'Log Corrective Maintenance Work Order'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'fr' ? 'Dépannage serrurerie, barreaux, plomberie et électricité' : 'Work order for locks, bars, plumbing, lighting and CCTV'}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsNewMaintenanceModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMaintenanceOrder} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{language === 'fr' ? 'Établissement' : 'Facility'}</label>
                  <select
                    value={newMoFacilityId}
                    onChange={e => setNewMoFacilityId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    {facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{language === 'fr' ? 'Aile / Bâtiment' : 'Cell Block'}</label>
                  <input
                    type="text"
                    value={newMoBlockName}
                    onChange={e => setNewMoBlockName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{language === 'fr' ? 'Corps d\'État' : 'Category'}</label>
                  <select
                    value={newMoCategory}
                    onChange={e => setNewMoCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
                  >
                    <option value="lock_mechanism">{language === 'fr' ? 'Serrurerie & Verrous' : 'Lock Mechanism'}</option>
                    <option value="bars_grille">{language === 'fr' ? 'Barreaux & Grilles' : 'Bars & Grilles'}</option>
                    <option value="sanitary_plumbing">{language === 'fr' ? 'Plomberie & Sanitaires' : 'Sanitary Plumbing'}</option>
                    <option value="lighting_electrical">{language === 'fr' ? 'Éclairage & Électricité' : 'Lighting & Electrical'}</option>
                    <option value="ventilation">{language === 'fr' ? 'Ventilation & Aération' : 'Ventilation & Air'}</option>
                    <option value="structural_masonry">{language === 'fr' ? 'Maçonnerie & Blindage' : 'Structural Masonry'}</option>
                    <option value="cctv_sensor">{language === 'fr' ? 'Vidéosurveillance & Alarmes' : 'CCTV & Sensors'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{language === 'fr' ? 'Niveau d\'Urgence' : 'Priority'}</label>
                  <select
                    value={newMoPriority}
                    onChange={e => setNewMoPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                  >
                    <option value="urgent_security_breach">{language === 'fr' ? '🚨 URGENCE SÉCURITÉ CRITIQUE' : '🚨 URGENT SECURITY BREACH'}</option>
                    <option value="high">{language === 'fr' ? 'Élevée (Sous 24h)' : 'High (Within 24h)'}</option>
                    <option value="medium">{language === 'fr' ? 'Moyenne (Sous 48h)' : 'Medium (Within 48h)'}</option>
                    <option value="low">{language === 'fr' ? 'Basse (Planifié)' : 'Low (Scheduled)'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{language === 'fr' ? 'Titre de l\'Intervention' : 'Work Order Title'}</label>
                <input
                  type="text"
                  value={newMoTitle}
                  onChange={e => setNewMoTitle(e.target.value)}
                  placeholder="e.g. Replace Jammed Deadbolt Cylinder on Cell A-104"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{language === 'fr' ? 'Détails de l\'Anomalie' : 'Description & Scope of Work'}</label>
                <textarea
                  rows={3}
                  value={newMoDesc}
                  onChange={e => setNewMoDesc(e.target.value)}
                  placeholder="Detailed observations and repair steps required..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{language === 'fr' ? 'Technicien / Ouvrier Assigné' : 'Assigned Technician'}</label>
                  <input
                    type="text"
                    value={newMoTechnician}
                    onChange={e => setNewMoTechnician(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{language === 'fr' ? 'Estimation Coût (KES)' : 'Estimated Cost (KES)'}</label>
                  <input
                    type="number"
                    value={newMoCost}
                    onChange={e => setNewMoCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewMaintenanceModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold"
                >
                  {language === 'fr' ? 'Créer le Bon de Travail' : 'Issue Work Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 11. MODAL: LOG SANITATION VIOLATION */}
      {isNewSanitationModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl my-auto">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-cyan-50/50 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-cyan-100 text-cyan-800">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {language === 'fr' ? 'Signaler une Infraction Sanitaire (Nelson Mandela)' : 'Log Sanitation & Hygiene Non-Compliance'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'fr' ? 'Conformité Règles Nelson Mandela 13 à 18 (Eau, Salubrité, Vermine)' : 'Nelson Mandela Rules 13-18 compliance & environmental health hazard'}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsNewSanitationModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSanitationViolation} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{language === 'fr' ? 'Établissement' : 'Facility'}</label>
                  <select
                    value={newSanFacilityId}
                    onChange={e => setNewSanFacilityId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    {facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{language === 'fr' ? 'Localisation Précise' : 'Specific Location'}</label>
                  <input
                    type="text"
                    value={newSanLocation}
                    onChange={e => setNewSanLocation(e.target.value)}
                    placeholder="e.g. Block B Latrine Tier 1 West"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{language === 'fr' ? 'Nature de l\'Infraction' : 'Violation Hazard'}</label>
                  <select
                    value={newSanType}
                    onChange={e => setNewSanType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
                  >
                    <option value="black_mold_infestation">{language === 'fr' ? 'Moisissures & Champignons' : 'Black Mold Infestation'}</option>
                    <option value="sewage_leak">{language === 'fr' ? 'Fuite Eaux Usées / Refoulement' : 'Sewage / Plumbing Leak'}</option>
                    <option value="blocked_drainage">{language === 'fr' ? 'Évacuation Eaux Bouchée' : 'Blocked Floor Drainage'}</option>
                    <option value="vermin_pest_activity">{language === 'fr' ? 'Punaises de Lit / Rongeurs' : 'Vermin & Bedbug Activity'}</option>
                    <option value="inadequate_ventilation">{language === 'fr' ? 'Aération Insuffisante (R14)' : 'Inadequate Ventilation'}</option>
                    <option value="unpotable_water">{language === 'fr' ? 'Eau Non Potable' : 'Unpotable Water Ingress'}</option>
                    <option value="waste_accumulation">{language === 'fr' ? 'Accumulation d\'Ordures' : 'Waste Accumulation'}</option>
                    <option value="soiled_bedding">{language === 'fr' ? 'Literie Souillée / Parasites' : 'Soiled / Infested Bedding'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{language === 'fr' ? 'Gravité Sanitaire' : 'Severity'}</label>
                  <select
                    value={newSanSeverity}
                    onChange={e => setNewSanSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                  >
                    <option value="critical_health_hazard">{language === 'fr' ? 'Péril Sanitaire Critique' : 'Critical Health Hazard'}</option>
                    <option value="major">{language === 'fr' ? 'Majeur' : 'Major'}</option>
                    <option value="minor">{language === 'fr' ? 'Mineur' : 'Minor'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{language === 'fr' ? 'Règle Nelson Mandela Concernée' : 'Mandela Rule Reference'}</label>
                <input
                  type="text"
                  value={newSanMandelaRef}
                  onChange={e => setNewSanMandelaRef(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{language === 'fr' ? 'Constat d\'Infraction' : 'Violation Description'}</label>
                <textarea
                  rows={2}
                  value={newSanDesc}
                  onChange={e => setNewSanDesc(e.target.value)}
                  placeholder="Describe health risk, odor, pest traces, pooling water..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{language === 'fr' ? 'Protocole Curatif Imposé' : 'Prescribed Remedial Protocol'}</label>
                <input
                  type="text"
                  value={newSanRemedy}
                  onChange={e => setNewSanRemedy(e.target.value)}
                  placeholder="e.g. Anti-fungal fogging, drain desilting, bedding autoclave"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{language === 'fr' ? 'Officier d\'Hygiène' : 'Public Health Officer'}</label>
                  <input
                    type="text"
                    value={newSanHealthOfficer}
                    onChange={e => setNewSanHealthOfficer(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{language === 'fr' ? 'Délai d\'Exécution' : 'Deadline'}</label>
                  <select
                    value={newSanDeadlineDays}
                    onChange={e => setNewSanDeadlineDays(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
                  >
                    <option value={1}>{language === 'fr' ? '24 Heures (Urgence)' : '24 Hours (Urgent)'}</option>
                    <option value={3}>{language === 'fr' ? '72 Heures' : '72 Hours'}</option>
                    <option value={7}>{language === 'fr' ? '7 Jours' : '7 Days'}</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewSanitationModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-xs font-semibold"
                >
                  {language === 'fr' ? 'Enregistrer l\'Injonction' : 'Issue Sanitation Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 12. MODAL: VIEW FULL INSPECTION REPORT */}
      {selectedInspectionForView && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col my-auto">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 rounded-t-2xl">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {selectedInspectionForView.inspectionCode}
                  </span>
                  <span className="text-xs text-slate-500">
                    {selectedInspectionForView.inspectionDate} • {selectedInspectionForView.inspectionTime}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {selectedInspectionForView.blockName}
                </h3>
                <p className="text-xs text-slate-600">
                  {selectedInspectionForView.facilityName}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPrintModalOpen(true)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-200"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  <span>{language === 'fr' ? 'Imprimer' : 'Print'}</span>
                </button>
                <button
                  onClick={() => setSelectedInspectionForView(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Score and summary stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="text-[11px] text-slate-500">{language === 'fr' ? 'Statut Général' : 'Overall Status'}</div>
                  <div className="mt-1">{getInspectionStatusBadge(selectedInspectionForView.status)}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="text-[11px] text-slate-500">{language === 'fr' ? 'Indice de Conformité' : 'Compliance Score'}</div>
                  <div className="text-lg font-bold text-slate-900 mt-0.5">{selectedInspectionForView.complianceScore}%</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="text-[11px] text-slate-500">{language === 'fr' ? 'Cellules Inspectées' : 'Cells Inspected'}</div>
                  <div className="text-lg font-bold text-slate-900 mt-0.5">
                    {selectedInspectionForView.cellsCheckedCount} / {selectedInspectionForView.cellsTotalCount}
                  </div>
                </div>
              </div>

              {/* Summary text */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  {language === 'fr' ? 'Procès-Verbal des Observations' : 'Written Audit Findings'}
                </div>
                <p className="text-slate-700 leading-relaxed">{selectedInspectionForView.summaryFindings}</p>
              </div>

              {/* Directives */}
              {selectedInspectionForView.correctiveDirectives && (
                <div className="bg-amber-50/80 rounded-xl p-3.5 border border-amber-200 space-y-1">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    {language === 'fr' ? 'Directives & Injonctions Correctives' : 'Mandated Corrective Directives'}
                  </div>
                  <p className="text-amber-800 leading-relaxed">{selectedInspectionForView.correctiveDirectives}</p>
                </div>
              )}

              {/* Checklist Breakdown */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {language === 'fr' ? 'Détail des Éléments d\'Infrastructure Testés' : 'Itemized Physical Infrastructure Checks'}
                </h4>

                <div className="space-y-2">
                  {selectedInspectionForView.infrastructureChecks.map((chk, i) => (
                    <div
                      key={i}
                      className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{chk.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{chk.standardCode}</div>
                        {chk.notes && <div className="text-slate-600 mt-1 italic">"{chk.notes}"</div>}
                      </div>

                      <div className="shrink-0">
                        <span className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                          chk.status === 'pass' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          chk.status === 'flagged' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {chk.status === 'pass' ? (language === 'fr' ? 'CONFORME' : 'PASSED') :
                           chk.status === 'flagged' ? (language === 'fr' ? 'DÉFAUT MINEUR' : 'DEFECT FLAGGED') :
                           (language === 'fr' ? 'PÉRIL CRITIQUE' : 'CRITICAL HAZARD')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inspector signatures */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-slate-500">
                <div>
                  <span className="font-semibold text-slate-700">{language === 'fr' ? 'Inspecteur en Chef:' : 'Lead Inspector:'} </span>
                  {selectedInspectionForView.leadInspectorName} ({selectedInspectionForView.leadInspectorBadge})
                </div>
                <div className="font-mono text-indigo-700 font-semibold">
                  {selectedInspectionForView.signature}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 flex items-center justify-end bg-slate-50/50 rounded-b-2xl">
              <button
                onClick={() => setSelectedInspectionForView(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                {language === 'fr' ? 'Fermer le Dossier' : 'Close Audit View'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 13. MODAL: OFFICIAL PRINTABLE INSPECTION DOSSIER */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-auto p-6 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-900 text-white">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                    Republic of Kenya • State Department for Correctional Services
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {language === 'fr' 
                      ? 'Certificat Officiel d\'Inspection Périodique des Locaux' 
                      : 'Official Certificate of Physical Custody & Infrastructure Inspection'}
                  </h2>
                </div>
              </div>
              <button onClick={() => setIsPrintModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable summary */}
            <div className="space-y-4 text-xs font-serif leading-relaxed text-slate-800 bg-slate-50/50 p-4 border rounded-xl">
              <div className="flex justify-between border-b pb-2 text-[11px] font-mono">
                <span>REF: INSP/2026/09/STATUTORY</span>
                <span>DATE: {new Date().toISOString().slice(0, 10)}</span>
                <span>STATUS: CERTIFIED</span>
              </div>

              <p>
                This certifies that on this day, authorized inspection officers of the Kenya Prisons Service completed a physical custody security sweep, mechanical deadbolt torque test, manganese bar acoustic test, and UN Nelson Mandela sanitation check across designated cell block wings.
              </p>

              <div className="grid grid-cols-2 gap-2 font-sans text-xs bg-white p-3 rounded border">
                <div><strong>Facility:</strong> {activeFacility ? activeFacility.name : 'National Directorate'}</div>
                <div><strong>Lead Inspector:</strong> Senior Supt. Josephat Mwangi</div>
                <div><strong>Active Work Orders:</strong> {kpis.pendingWorkOrders} logged</div>
                <div><strong>Hygiene Standards:</strong> Mandela Rules 13-17 compliant</div>
              </div>

              <div className="pt-4 flex items-center justify-between font-sans text-[11px] text-slate-500">
                <div>
                  <div className="border-t border-slate-400 pt-1 w-44 font-semibold text-slate-800">
                    Custody Superintendent
                  </div>
                  <span>Signed & Sealed</span>
                </div>
                <div>
                  <div className="border-t border-slate-400 pt-1 w-44 font-semibold text-slate-800">
                    Director of Prisons Engineering
                  </div>
                  <span>Ministry of Interior</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                {language === 'fr' ? 'Fermer' : 'Close'}
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>{language === 'fr' ? 'Lancer l\'Impression' : 'Print Official Dossier'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
