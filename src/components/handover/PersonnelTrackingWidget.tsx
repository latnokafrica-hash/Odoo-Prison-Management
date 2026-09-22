import React, { useState, useMemo } from 'react';
import { 
  Users, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Radio, 
  Search, 
  Filter, 
  ChevronRight, 
  UserCheck, 
  Calendar, 
  FileText, 
  Crosshair, 
  Briefcase, 
  Check, 
  X, 
  Plus, 
  AlertOctagon, 
  Eye, 
  ArrowUpRight,
  Shield,
  PhoneCall,
  UserX
} from 'lucide-react';
import { 
  SecurityOfficer, 
  LeaveRequest, 
  ShiftStaffingRequirement, 
  ShiftType, 
  Language, 
  OfficerDutyStatus, 
  LeaveRequestType 
} from '../../types';
import { 
  INITIAL_SECURITY_OFFICERS, 
  INITIAL_LEAVE_REQUESTS, 
  INITIAL_STAFFING_REQUIREMENTS 
} from '../../data/personnelData';

interface PersonnelTrackingWidgetProps {
  language: Language;
  currentShift: ShiftType;
  facilityName?: string;
  onStaffingAlert?: (message: string) => void;
  compactView?: boolean;
}

export const PersonnelTrackingWidget: React.FC<PersonnelTrackingWidgetProps> = ({
  language,
  currentShift = 'morning',
  facilityName = 'Central Maximum Penitentiary',
  onStaffingAlert,
  compactView = false,
}) => {
  // State for active officers and leave requests
  const [officers, setOfficers] = useState<SecurityOfficer[]>(INITIAL_SECURITY_OFFICERS);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);
  const [staffingReqs, setStaffingReqs] = useState<Record<ShiftType, ShiftStaffingRequirement>>(INITIAL_STAFFING_REQUIREMENTS);

  // Sub-tab selection: 'roster' | 'leave' | 'compliance'
  const [activeSubTab, setActiveSubTab] = useState<'roster' | 'leave' | 'compliance'>('roster');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectorFilter, setSelectedSectorFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedLeaveFilter, setSelectedLeaveFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Modal / Quick Action States
  const [selectedOfficerDetails, setSelectedOfficerDetails] = useState<SecurityOfficer | null>(null);
  const [isNewLeaveModalOpen, setIsNewLeaveModalOpen] = useState(false);
  const [selectedRequestToReview, setSelectedRequestToReview] = useState<LeaveRequest | null>(null);
  const [reviewDecisionNotes, setReviewDecisionNotes] = useState('');

  // New Leave Form State
  const [newLeaveOfficerId, setNewLeaveOfficerId] = useState(officers[0]?.id || '');
  const [newLeaveType, setNewLeaveType] = useState<LeaveRequestType>('medical_sick');
  const [newLeaveStartDate, setNewLeaveStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newLeaveEndDate, setNewLeaveEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [newLeaveAssessment, setNewLeaveAssessment] = useState('');
  const [newLeaveReplacement, setNewLeaveReplacement] = useState('');

  // Current Shift Staffing Requirement
  const currentReq = staffingReqs[currentShift] || staffingReqs.morning;

  // Real-time calculations based on active on-duty officers
  const activeOnDutyCount = useMemo(() => {
    return officers.filter(o => o.shift === currentShift && o.status !== 'relief_break').length;
  }, [officers, currentShift]);

  const totalAssignedShiftCount = useMemo(() => {
    return officers.filter(o => o.shift === currentShift).length;
  }, [officers, currentShift]);

  const safetyCoverageRatio = useMemo(() => {
    return currentReq.minimumRequiredOfficers > 0 
      ? totalAssignedShiftCount / currentReq.minimumRequiredOfficers 
      : 1;
  }, [totalAssignedShiftCount, currentReq]);

  const safetyStatus = useMemo(() => {
    if (safetyCoverageRatio >= 1.1) return 'OPTIMAL';
    if (safetyCoverageRatio >= 1.0) return 'COMPLIANT';
    if (safetyCoverageRatio >= 0.9) return 'BORDERLINE';
    return 'CRITICAL_DEFICIT';
  }, [safetyCoverageRatio]);

  // Pending leave requests affecting current or upcoming shift
  const pendingLeavesCount = useMemo(() => {
    return leaveRequests.filter(r => r.status === 'pending').length;
  }, [leaveRequests]);

  // Unique sectors for filter dropdown
  const uniqueSectors = useMemo(() => {
    const sectors = new Set<string>();
    officers.forEach(o => sectors.add(o.assignedSector));
    return Array.from(sectors);
  }, [officers]);

  // Filtered officers list
  const filteredOfficers = useMemo(() => {
    return officers.filter(o => {
      const matchesSearch = 
        o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.badgeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.callSign.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.assignedPost.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSector = selectedSectorFilter === 'all' || o.assignedSector === selectedSectorFilter;
      const matchesStatus = selectedStatusFilter === 'all' || o.status === selectedStatusFilter;

      return matchesSearch && matchesSector && matchesStatus;
    });
  }, [officers, searchQuery, selectedSectorFilter, selectedStatusFilter]);

  // Filtered leave requests list
  const filteredLeaveRequests = useMemo(() => {
    return leaveRequests.filter(r => {
      if (selectedLeaveFilter === 'all') return true;
      return r.status === selectedLeaveFilter;
    });
  }, [leaveRequests, selectedLeaveFilter]);

  // Handlers for leave decisions
  const handleApproveLeave = (requestId: string) => {
    setLeaveRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'approved',
          decisionBy: 'Duty Shift Commander',
          decisionNotes: reviewDecisionNotes || 'Approved. Shift coverage satisfied by standby replacement.'
        };
      }
      return req;
    }));
    setSelectedRequestToReview(null);
    setReviewDecisionNotes('');
  };

  const handleRejectLeave = (requestId: string) => {
    setLeaveRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'rejected',
          decisionBy: 'Duty Shift Commander',
          decisionNotes: reviewDecisionNotes || 'Rejected: Critical staffing deficit. Approval would breach minimum safety threshold.'
        };
      }
      return req;
    }));
    setSelectedRequestToReview(null);
    setReviewDecisionNotes('');
  };

  const handleCreateLeaveRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const officer = officers.find(o => o.id === newLeaveOfficerId);
    if (!officer) return;

    const newReq: LeaveRequest = {
      id: `leave-${Date.now()}`,
      officerId: officer.id,
      officerName: officer.name,
      badgeNumber: officer.badgeNumber,
      rank: officer.rank,
      leaveType: newLeaveType,
      startDate: newLeaveStartDate,
      endDate: newLeaveEndDate,
      shiftsCovered: [currentShift],
      impactRisk: newLeaveType === 'emergency_compassionate' ? 'moderate' : 'low',
      impactAssessment: newLeaveAssessment || `Absence from ${officer.assignedPost}. Requires stand-in.`,
      replacementOfficer: newLeaveReplacement || 'Standby reserve designated by roster clerk',
      status: 'pending',
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      decisionNotes: 'Pending commander safety review.'
    };

    setLeaveRequests(prev => [newReq, ...prev]);
    setIsNewLeaveModalOpen(false);
    setNewLeaveAssessment('');
    setNewLeaveReplacement('');
  };

  // Status badge styling helper
  const getStatusBadge = (status: OfficerDutyStatus) => {
    switch (status) {
      case 'active_post':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-400',
          label: language === 'fr' ? 'Poste Actif' : 'On Post'
        };
      case 'armed_patrol':
        return {
          bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
          dot: 'bg-indigo-400',
          label: language === 'fr' ? 'Patrouille Armée' : 'Armed Patrol'
        };
      case 'standby_qrf':
        return {
          bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          dot: 'bg-rose-400',
          label: language === 'fr' ? 'Alerte QRF' : 'QRF Standby'
        };
      case 'convoy_escort':
        return {
          bg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
          dot: 'bg-sky-400',
          label: language === 'fr' ? 'Escorte Convoi' : 'Convoy Transit'
        };
      case 'relief_break':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-400',
          label: language === 'fr' ? 'Relève Repas' : 'Meal Relief'
        };
      default:
        return {
          bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
          dot: 'bg-slate-400',
          label: status
        };
    }
  };

  // Leave badge styling helper
  const getLeaveTypeBadge = (type: LeaveRequestType) => {
    switch (type) {
      case 'emergency_compassionate':
        return {
          bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          label: language === 'fr' ? 'Urgence Familiale' : 'Emergency Compassionate'
        };
      case 'medical_sick':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          label: language === 'fr' ? 'Arrêt Maladie' : 'Medical Sick Leave'
        };
      case 'training_recert':
        return {
          bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
          label: language === 'fr' ? 'Recyclage Tir / Tactique' : 'Tactical Recertification'
        };
      case 'annual_furlough':
        return {
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          label: language === 'fr' ? 'Congé Annuel' : 'Annual Furlough'
        };
      case 'compensatory_rest':
        return {
          bg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
          label: language === 'fr' ? 'Repos Compensateur' : 'Compensatory Rest'
        };
    }
  };

  // Compact View for Executive Summary or side-panel
  if (compactView) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              {language === 'fr' ? 'Effectifs & Couverture de Sécurité' : 'Shift Staffing & Safety Coverage'}
            </h4>
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
            safetyStatus === 'COMPLIANT' || safetyStatus === 'OPTIMAL'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
          }`}>
            {safetyStatus}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-center">
          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">{language === 'fr' ? 'Gardes Déployés' : 'Deployed Staff'}</span>
            <span className="text-sm font-bold text-white">{totalAssignedShiftCount}</span>
            <span className="text-[9px] text-slate-400 block">/ {currentReq.minimumRequiredOfficers} Min</span>
          </div>

          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">{language === 'fr' ? 'Postes Fixes' : 'Fixed Posts'}</span>
            <span className="text-sm font-bold text-emerald-400">{currentReq.fixedPostsMannedCount}/{currentReq.mandatoryFixedPostsCount}</span>
            <span className="text-[9px] text-slate-400 block">100% {language === 'fr' ? 'Armés' : 'Manned'}</span>
          </div>

          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">{language === 'fr' ? 'Réserve QRF' : 'QRF Tactical'}</span>
            <span className="text-sm font-bold text-rose-400">{currentReq.qrfStandbyCount} {language === 'fr' ? 'officiers' : 'officers'}</span>
            <span className="text-[9px] text-slate-400 block">Prêt 60s</span>
          </div>

          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">{language === 'fr' ? 'Congés en Attente' : 'Pending Leave'}</span>
            <span className="text-sm font-bold text-amber-400">{pendingLeavesCount}</span>
            <span className="text-[9px] text-slate-400 block">{language === 'fr' ? 'À valider' : 'Pending review'}</span>
          </div>
        </div>

        {/* Safety Ratio Progress Bar */}
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
          <div className="flex justify-between items-center text-[11px] mb-1">
            <span className="text-slate-400">{language === 'fr' ? 'Taux de Conformité Sécurité :' : 'Minimum Safety Ratio :'}</span>
            <span className={`font-mono font-bold ${
              safetyCoverageRatio >= 1.0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {(safetyCoverageRatio * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                safetyCoverageRatio >= 1.0 ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, safetyCoverageRatio * 100)}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Full Widget View
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-xl text-white space-y-6">
      
      {/* Header with Title and Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-indigo-950 text-indigo-400 rounded-xl border border-indigo-700/60 shadow-xs">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide uppercase">
                {language === 'fr' ? 'Gestion des Effectifs & Suivi du Personnel' : 'Personnel Tracking & Shift Safety Staffing'}
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                safetyStatus === 'COMPLIANT' || safetyStatus === 'OPTIMAL'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}>
                {safetyStatus === 'COMPLIANT' && (language === 'fr' ? 'EFFECTIFS CONFORMES' : 'SAFETY COMPLIANT')}
                {safetyStatus === 'OPTIMAL' && (language === 'fr' ? 'COUVERTURE OPTIMALE' : 'OPTIMAL COVERAGE')}
                {safetyStatus === 'BORDERLINE' && (language === 'fr' ? 'EFFECTIF CRITIQUE' : 'BORDERLINE STAFFING')}
                {safetyStatus === 'CRITICAL_DEFICIT' && (language === 'fr' ? 'DÉFICIT CRITIQUE' : 'CRITICAL DEFICIT')}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'fr'
                ? `Suivi en temps réel des officiers de garde, postes fixes obligatoires et validation des demandes d'absence pour le quart de ${currentShift}.`
                : `Real-time monitoring of on-duty security sentinels, mandatory security posts, and time-off request approvals for ${currentShift} shift.`}
            </p>
          </div>
        </div>

        {/* Tab Switcher & New Leave Button */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveSubTab('roster')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'roster'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{language === 'fr' ? 'Officiers en Poste' : 'On-Duty Roster'} ({filteredOfficers.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('leave')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 relative ${
                activeSubTab === 'leave'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{language === 'fr' ? 'Demandes de Congé' : 'Leave Requests'}</span>
              {pendingLeavesCount > 0 && (
                <span className="w-4 h-4 bg-amber-500 text-black text-[10px] font-black rounded-full flex items-center justify-center">
                  {pendingLeavesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSubTab('compliance')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'compliance'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{language === 'fr' ? 'Réglementation Sécurité' : 'Safety Mandates'}</span>
            </button>
          </div>

          <button
            onClick={() => setIsNewLeaveModalOpen(true)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            title={language === 'fr' ? 'Déclarer un arrêt ou absence' : 'Log unplanned absence / leave request'}
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">{language === 'fr' ? 'Signaler Absence' : 'Record Absence'}</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        
        {/* Deployed vs Required */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{language === 'fr' ? 'Effectif Déployé' : 'Officers Deployed'}</span>
            <Briefcase className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-white">{totalAssignedShiftCount}</span>
            <span className="text-xs text-slate-400 font-semibold">/ {currentReq.minimumRequiredOfficers} {language === 'fr' ? 'Requis' : 'Required'}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{language === 'fr' ? 'Couverture :' : 'Coverage :'}</span>
            <span className={`font-mono font-bold ${
              safetyCoverageRatio >= 1.0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {(safetyCoverageRatio * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Mandatory Fixed Posts */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{language === 'fr' ? 'Postes Fixes Armés' : 'Fixed Posts Manned'}</span>
            <Crosshair className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-emerald-400">{currentReq.fixedPostsMannedCount}</span>
            <span className="text-xs text-slate-400 font-semibold">/ {currentReq.mandatoryFixedPostsCount}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {language === 'fr' ? '100% Miradors & Sas sécurisés' : 'Sallyport & 4 Towers 100% manned'}
          </p>
        </div>

        {/* QRF Rapid Reaction Standby */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{language === 'fr' ? 'Force d\'Intervention QRF' : 'QRF Tactical Reserve'}</span>
            <Shield className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-rose-400">{currentReq.qrfStandbyCount}</span>
            <span className="text-xs text-slate-400 font-semibold">{language === 'fr' ? 'Officiers' : 'Sentinels'}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {language === 'fr' ? 'Boucliers & MP5 prêts (60s)' : 'Riot gear & tactical breachers staged'}
          </p>
        </div>

        {/* Guard to Inmate Ratio */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{language === 'fr' ? 'Ratio Garde / Détenus' : 'Guard-to-Inmate Ratio'}</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-bold text-sky-300">1:17</span>
            <span className="text-[10px] text-slate-400">(Norme ≤ 1:20)</span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{language === 'fr' ? 'Conforme Règles Mandela' : 'Mandela Rule 56 Compliant'}</span>
          </p>
        </div>

        {/* Pending Leave Requests */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 col-span-2 md:col-span-4 lg:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{language === 'fr' ? 'Congés en Attente' : 'Pending Time-Off'}</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-xl font-black ${pendingLeavesCount > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
              {pendingLeavesCount}
            </span>
            <span className="text-xs text-slate-400">{language === 'fr' ? 'demande(s)' : 'request(s)'}</span>
          </div>
          <p className="text-[11px] text-amber-300/80 mt-2">
            {pendingLeavesCount > 0 
              ? (language === 'fr' ? 'Nécessite arbitrage relève' : 'Requires stand-in validation')
              : (language === 'fr' ? 'Aucun préavis en cours' : 'No backlog')}
          </p>
        </div>

      </div>

      {/* Safety Alert Banner if Borderline or Deficit */}
      {safetyStatus !== 'COMPLIANT' && safetyStatus !== 'OPTIMAL' && (
        <div className="bg-amber-950/60 border border-amber-600/60 text-amber-200 p-3.5 rounded-xl flex items-start gap-3 text-xs animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-amber-100 flex items-center gap-2">
              <span>{language === 'fr' ? 'Avertissement de Couverture de Quart' : 'Shift Staffing Safety Threshold Warning'}</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono uppercase">
                {currentReq.safetyStatus}
              </span>
            </div>
            <p className="text-amber-200/90 leading-relaxed">
              {currentReq.recommendedAction}
            </p>
          </div>
        </div>
      )}

      {/* TAB 1: ON-DUTY ROSTER VIEW */}
      {activeSubTab === 'roster' && (
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
            
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder={language === 'fr' ? 'Rechercher par nom, matricule, indicatif radio...' : 'Search by officer name, badge #, radio callsign...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Sector Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px]">{language === 'fr' ? 'Secteur :' : 'Sector :'}</span>
                <select
                  value={selectedSectorFilter}
                  onChange={e => setSelectedSectorFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">{language === 'fr' ? 'Tous les Secteurs' : 'All Sectors'}</option>
                  {uniqueSectors.map(sec => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px]">{language === 'fr' ? 'Statut :' : 'Status :'}</span>
                <select
                  value={selectedStatusFilter}
                  onChange={e => setSelectedStatusFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">{language === 'fr' ? 'Tous les Statuts' : 'All Statuses'}</option>
                  <option value="active_post">{language === 'fr' ? 'Poste Actif' : 'On Post'}</option>
                  <option value="armed_patrol">{language === 'fr' ? 'Patrouille Armée' : 'Armed Patrol'}</option>
                  <option value="standby_qrf">{language === 'fr' ? 'Alerte QRF' : 'QRF Standby'}</option>
                  <option value="convoy_escort">{language === 'fr' ? 'Escorte Convoi' : 'Convoy Transit'}</option>
                  <option value="relief_break">{language === 'fr' ? 'Relève Repas' : 'Meal Relief'}</option>
                </select>
              </div>
            </div>

          </div>

          {/* Officers Table / Grid */}
          <div className="border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">{language === 'fr' ? 'Officier & Grade' : 'Officer & Rank'}</th>
                    <th className="py-3 px-4">{language === 'fr' ? 'Secteur & Poste Assigné' : 'Sector & Assigned Post'}</th>
                    <th className="py-3 px-4">{language === 'fr' ? 'Indicatif / Radio' : 'Call Sign / Radio'}</th>
                    <th className="py-3 px-4">{language === 'fr' ? 'Armement & Caméra' : 'Weapon & Gear'}</th>
                    <th className="py-3 px-4">{language === 'fr' ? 'Statut de Garde' : 'Duty Status'}</th>
                    <th className="py-3 px-4 text-right">{language === 'fr' ? 'Détails' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                  {filteredOfficers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        {language === 'fr' ? 'Aucun officier correspondant aux critères de recherche.' : 'No officers found matching the filter criteria.'}
                      </td>
                    </tr>
                  ) : (
                    filteredOfficers.map(officer => {
                      const badge = getStatusBadge(officer.status);
                      return (
                        <tr key={officer.id} className="hover:bg-slate-800/50 transition-colors">
                          
                          {/* Officer Name & Badge */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-200 uppercase">
                                {officer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                              <div>
                                <div className="font-bold text-white flex items-center gap-1.5">
                                  <span>{officer.name}</span>
                                  {officer.tacticalVest && (
                                    <span className="w-2 h-2 rounded-full bg-indigo-400" title="Ballistic Vest Issued" />
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                                  <span className="font-mono text-indigo-300">{officer.badgeNumber}</span>
                                  <span>&bull;</span>
                                  <span>{officer.rank}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Sector & Post */}
                          <td className="py-3 px-4">
                            <div className="font-medium text-slate-200">{officer.assignedPost}</div>
                            <div className="text-[11px] text-slate-400">{officer.assignedSector}</div>
                          </td>

                          {/* Call Sign & Radio */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-emerald-300">
                              <Radio className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{officer.callSign}</span>
                            </div>
                            <div className="text-[10px] text-slate-400">{officer.radioChannel}</div>
                          </td>

                          {/* Weapon & Gear */}
                          <td className="py-3 px-4 max-w-[200px]">
                            <div className="text-[11px] text-slate-200 truncate" title={officer.weaponIssued}>
                              {officer.weaponIssued}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {officer.bodyCamIssued}
                            </div>
                          </td>

                          {/* Duty Status */}
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badge.bg}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                              <span>{badge.label}</span>
                            </span>
                          </td>

                          {/* Action Button */}
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setSelectedOfficerDetails(officer)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-medium border border-slate-700 transition-colors cursor-pointer"
                            >
                              {language === 'fr' ? 'Fiche' : 'Details'}
                            </button>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: PENDING LEAVE & TIME-OFF REQUESTS */}
      {activeSubTab === 'leave' && (
        <div className="space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">{language === 'fr' ? 'Filtrer par état :' : 'Filter by Status :'}</span>
              <div className="inline-flex rounded-lg border border-slate-800 p-0.5 bg-slate-900">
                <button
                  onClick={() => setSelectedLeaveFilter('all')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                    selectedLeaveFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {language === 'fr' ? 'Toutes' : 'All'} ({leaveRequests.length})
                </button>
                <button
                  onClick={() => setSelectedLeaveFilter('pending')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                    selectedLeaveFilter === 'pending' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {language === 'fr' ? 'En Attente' : 'Pending'} ({leaveRequests.filter(r => r.status === 'pending').length})
                </button>
                <button
                  onClick={() => setSelectedLeaveFilter('approved')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                    selectedLeaveFilter === 'approved' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {language === 'fr' ? 'Validées' : 'Approved'}
                </button>
              </div>
            </div>

            <div className="text-xs text-slate-400">
              <span className="font-semibold text-slate-300">
                {language === 'fr' ? 'Règle impérative :' : 'Safety Mandate :'}
              </span>{' '}
              {language === 'fr'
                ? 'Aucun congé ne peut être approuvé si le seuil de sécurité passe sous 22 gardes.'
                : 'No leave can be ratified if coverage drops below the 22-guard minimum requirement.'}
            </div>
          </div>

          {/* Leave Requests Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLeaveRequests.map(req => {
              const typeBadge = getLeaveTypeBadge(req.leaveType);
              const isPending = req.status === 'pending';

              return (
                <div 
                  key={req.id} 
                  className={`bg-slate-950 rounded-xl border p-4 transition-all flex flex-col justify-between ${
                    req.status === 'pending' 
                      ? 'border-amber-500/40 shadow-md shadow-amber-950/20' 
                      : req.status === 'approved' 
                        ? 'border-emerald-500/30' 
                        : 'border-slate-800'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-bold text-white">{req.officerName}</strong>
                          <span className="font-mono text-xs text-indigo-300">{req.badgeNumber}</span>
                        </div>
                        <span className="text-xs text-slate-400">{req.rank}</span>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${typeBadge.bg}`}>
                        {typeBadge.label}
                      </span>
                    </div>

                    {/* Period & Coverage */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 mb-3">
                      <div>
                        <span className="text-slate-400 block text-[10px]">{language === 'fr' ? 'Période Demandée' : 'Requested Dates'}</span>
                        <span className="font-semibold text-white">{req.startDate} &rarr; {req.endDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">{language === 'fr' ? 'Quarts Impactés' : 'Shifts Affected'}</span>
                        <span className="font-semibold text-indigo-300 capitalize">{req.shiftsCovered.join(', ')}</span>
                      </div>
                    </div>

                    {/* Safety Impact Assessment */}
                    <div className="space-y-1.5 text-xs text-slate-300 mb-3">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-200">
                        <AlertOctagon className={`w-3.5 h-3.5 ${
                          req.impactRisk === 'high_critical' ? 'text-rose-400' : req.impactRisk === 'moderate' ? 'text-amber-400' : 'text-slate-400'
                        }`} />
                        <span>{language === 'fr' ? 'Évaluation Impact Sécurité :' : 'Shift Safety Impact Assessment :'}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed pl-5">
                        {req.impactAssessment}
                      </p>
                    </div>

                    {/* Replacement Officer */}
                    {req.replacementOfficer && (
                      <div className="p-2 bg-indigo-950/40 rounded-lg border border-indigo-900/60 text-[11px] text-indigo-200 flex items-start gap-2 mb-3">
                        <UserCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                          <strong>{language === 'fr' ? 'Relève Prévue :' : 'Replacement Officer :'}</strong> {req.replacementOfficer}
                        </div>
                      </div>
                    )}

                    {/* Decision info if already decided */}
                    {req.decisionBy && (
                      <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-900 flex justify-between">
                        <span>{language === 'fr' ? 'Arbitré par :' : 'Decided by :'} <strong className="text-slate-200">{req.decisionBy}</strong></span>
                        <span className={`font-bold uppercase ${req.status === 'approved' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {req.status}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Commander Actions if Pending */}
                  {isPending && (
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedRequestToReview(req);
                          setReviewDecisionNotes('');
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                      >
                        {language === 'fr' ? 'Examiner & Décider' : 'Review & Arbitrate'}
                      </button>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* TAB 3: SAFETY COMPLIANCE & POST MANDATES */}
      {activeSubTab === 'compliance' && (
        <div className="space-y-4">
          
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h4 className="text-sm font-bold text-white mb-2 uppercase tracking-wide flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>{language === 'fr' ? 'Postes Fixes & Exigences Réglementaires de Sécurité' : 'Mandatory Security Post Breakdown & UN Mandela Compliance'}</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              {language === 'fr'
                ? 'Conformément aux normes pénitentiaires nationales et à la Règle 56 de Nelson Mandela, les postes ci-dessous doivent être pourvus en permanence sans exception. Aucun congé ne peut être octroyé sans relève certifiée.'
                : 'Pursuant to National Corrections Service Security Directives & UN Mandela Rule 56, the following critical security positions require continuous manned coverage. Shift handover cannot be certified if any mandatory post is vacant.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                <div className="flex justify-between items-center font-semibold text-white">
                  <span>{language === 'fr' ? 'Miradors Périmètre (1-4)' : 'Perimeter Towers (1 to 4)'}</span>
                  <span className="text-emerald-400 font-mono">4/4 {language === 'fr' ? 'Pourvus' : 'Manned'}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {language === 'fr' ? 'Tireurs de précision armés FN FAL / G3 avec optiques thermiques.' : 'Armed marksmen with high-candela searchlights and FLIR optics.'}
                </p>
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                <div className="flex justify-between items-center font-semibold text-white">
                  <span>{language === 'fr' ? 'Sas Véhicules Sallyport' : 'Main Vehicle Sallyport'}</span>
                  <span className="text-emerald-400 font-mono">1/1 {language === 'fr' ? 'Pourvu' : 'Manned'}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {language === 'fr' ? 'Contrôle sous-châssis et sas motorisé bi-directionnel interverrouillé.' : 'Undercarriage mirrors, biometric gate interlocks, less-lethal shotgun.'}
                </p>
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                <div className="flex justify-between items-center font-semibold text-white">
                  <span>{language === 'fr' ? 'Poste Central de Contrôle (PCC)' : 'Central Control Matrix (PCC)'}</span>
                  <span className="text-emerald-400 font-mono">2/2 {language === 'fr' ? 'Pourvus' : 'Manned'}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {language === 'fr' ? '128 caméras IP, détection périmétrique et déclenchement d\'alarmes générales.' : '128 CCTV feeds, perimeter motion alarms, and radio dispatch.'}
                </p>
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                <div className="flex justify-between items-center font-semibold text-white">
                  <span>{language === 'fr' ? 'Bloc A - Haute Sécurité' : 'Block A - Maximum Custody'}</span>
                  <span className="text-emerald-400 font-mono">3/3 {language === 'fr' ? 'Pourvus' : 'Manned'}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {language === 'fr' ? 'Surveillance visuelle 30 min pour les profils CAT-A et fouille systématique.' : '30-minute mandatory visual rounds for high-threat escape risks.'}
                </p>
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                <div className="flex justify-between items-center font-semibold text-white">
                  <span>{language === 'fr' ? 'Bloc D - Quartier Isolement' : 'Block D - Segregation Wing'}</span>
                  <span className="text-emerald-400 font-mono">1/1 {language === 'fr' ? 'Pourvu' : 'Manned'}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {language === 'fr' ? 'Registre horaire strict des sanctions et surveillance de santé mentale.' : 'Log of solitary confinement days, psychiatric suicide observation.'}
                </p>
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                <div className="flex justify-between items-center font-semibold text-white">
                  <span>{language === 'fr' ? 'Force d\'Intervention QRF' : 'QRF Tactical Reserve'}</span>
                  <span className="text-emerald-400 font-mono">4/4 {language === 'fr' ? 'Armés' : 'Armed'}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {language === 'fr' ? 'Section anti-émeute avec bélier, gaz lacrymogène et boucliers balistiques.' : 'Tactical breachers, riot shield operators, and canine detection unit.'}
                </p>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* MODAL: Review & Arbitrate Leave Request */}
      {selectedRequestToReview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 max-w-lg w-full text-white shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <h4 className="text-sm font-bold uppercase tracking-wider">
                  {language === 'fr' ? 'Arbitrage de la Demande d\'Absence' : 'Arbitrate Staff Time-Off Request'}
                </h4>
              </div>
              <button 
                onClick={() => setSelectedRequestToReview(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">{language === 'fr' ? 'Officier Demandeur :' : 'Requesting Officer :'}</span>
                  <span className="font-bold text-white">{selectedRequestToReview.officerName} ({selectedRequestToReview.badgeNumber})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{language === 'fr' ? 'Motif de Congé :' : 'Leave Category :'}</span>
                  <span className="font-semibold text-indigo-300 capitalize">{selectedRequestToReview.leaveType.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{language === 'fr' ? 'Période & Quarts :' : 'Dates & Shifts :'}</span>
                  <span className="font-semibold text-slate-200">{selectedRequestToReview.startDate} &rarr; {selectedRequestToReview.endDate}</span>
                </div>
              </div>

              {/* Safety Impact Warning */}
              <div className="p-3 bg-amber-950/40 border border-amber-600/40 rounded-lg text-amber-200">
                <div className="font-bold mb-1 flex items-center gap-1.5 text-amber-300">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{language === 'fr' ? 'Contrôle d\'Impact sur le Seuil de Sécurité' : 'Safety Staffing Threshold Check'}</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {selectedRequestToReview.impactAssessment}
                </p>
                {selectedRequestToReview.replacementOfficer && (
                  <p className="text-[11px] font-semibold text-emerald-300 mt-2">
                    &bull; {language === 'fr' ? 'Relève identifiée :' : 'Identified relief :'} {selectedRequestToReview.replacementOfficer}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {language === 'fr' ? 'Motif ou Consignes de la Décision :' : 'Commander Decision Rationale :'}
                </label>
                <textarea
                  rows={3}
                  value={reviewDecisionNotes}
                  onChange={e => setReviewDecisionNotes(e.target.value)}
                  placeholder={language === 'fr' 
                    ? 'Ex: Accordé sous réserve de la présence effective du remplaçant en réserve...' 
                    : 'e.g., Approved subject to confirmed sign-on of reserve officer...'}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => handleRejectLeave(selectedRequestToReview.id)}
                className="px-4 py-2 bg-rose-950 hover:bg-rose-900 text-rose-200 rounded-lg text-xs font-semibold border border-rose-800 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>{language === 'fr' ? 'Refuser (Déficit de Sécurité)' : 'Decline (Breaches Minimum)'}</span>
              </button>
              
              <button
                type="button"
                onClick={() => handleApproveLeave(selectedRequestToReview.id)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{language === 'fr' ? 'Valider le Congé' : 'Approve Time-Off'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: Record Sudden Absence / New Leave Request */}
      {isNewLeaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 max-w-lg w-full text-white shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserX className="w-5 h-5 text-amber-400" />
                <h4 className="text-sm font-bold uppercase tracking-wider">
                  {language === 'fr' ? 'Déclarer une Absence / Demande d\'Arrêt' : 'Record Staff Absence or Medical Leave'}
                </h4>
              </div>
              <button 
                onClick={() => setIsNewLeaveModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLeaveRequest} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {language === 'fr' ? 'Officier Concerné :' : 'Officer :'} *
                </label>
                <select
                  value={newLeaveOfficerId}
                  onChange={e => setNewLeaveOfficerId(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-medium"
                >
                  {officers.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.rank} {o.name} ({o.badgeNumber}) - {o.assignedPost}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {language === 'fr' ? 'Type d\'Absence :' : 'Leave Category :'}
                  </label>
                  <select
                    value={newLeaveType}
                    onChange={e => setNewLeaveType(e.target.value as LeaveRequestType)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white capitalize"
                  >
                    <option value="medical_sick">{language === 'fr' ? 'Arrêt Maladie' : 'Medical Sick'}</option>
                    <option value="emergency_compassionate">{language === 'fr' ? 'Urgence Familiale' : 'Emergency Compassionate'}</option>
                    <option value="training_recert">{language === 'fr' ? 'Recyclage / Formation' : 'Training Recert'}</option>
                    <option value="compensatory_rest">{language === 'fr' ? 'Repos Compensateur' : 'Compensatory Rest'}</option>
                    <option value="annual_furlough">{language === 'fr' ? 'Congé Annuel' : 'Annual Furlough'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {language === 'fr' ? 'Date de Début :' : 'Start Date :'}
                  </label>
                  <input
                    type="date"
                    value={newLeaveStartDate}
                    onChange={e => setNewLeaveStartDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {language === 'fr' ? 'Évaluation de l\'Impact de Sécurité :' : 'Security Impact Analysis :'}
                </label>
                <input
                  type="text"
                  placeholder={language === 'fr' 
                    ? 'Ex: Laisse le bloc B avec 2 surveillants sur 3 requis...' 
                    : 'e.g. Leaves Block B with 2/3 required sentinels...'}
                  value={newLeaveAssessment}
                  onChange={e => setNewLeaveAssessment(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {language === 'fr' ? 'Officier de Relève / Remplaçant Standby :' : 'Replacement Officer / Standby Reserve :'}
                </label>
                <input
                  type="text"
                  placeholder={language === 'fr' 
                    ? 'Ex: Cpl. Titus Langat (Réserve de Garde appelée)...' 
                    : 'e.g. Off-Duty Reserve: Cpl. Titus Langat called in...'}
                  value={newLeaveReplacement}
                  onChange={e => setNewLeaveReplacement(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewLeaveModalOpen(false)}
                  className="px-3.5 py-2 font-semibold text-slate-400 hover:text-white rounded-lg"
                >
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold shadow-xs"
                >
                  {language === 'fr' ? 'Enregistrer la Demande' : 'Log Request'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL: Officer Details Inspection */}
      {selectedOfficerDetails && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 max-w-md w-full text-white shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-indigo-900/60 border border-indigo-700 flex items-center justify-center font-bold text-indigo-200">
                  {selectedOfficerDetails.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{selectedOfficerDetails.name}</h4>
                  <span className="text-xs text-indigo-300 font-mono">{selectedOfficerDetails.badgeNumber} &bull; {selectedOfficerDetails.rank}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedOfficerDetails(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">{language === 'fr' ? 'Secteur :' : 'Sector :'}</span>
                  <span className="font-semibold text-white">{selectedOfficerDetails.assignedSector}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{language === 'fr' ? 'Poste :' : 'Post :'}</span>
                  <span className="font-semibold text-slate-200">{selectedOfficerDetails.assignedPost}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{language === 'fr' ? 'Indicatif Radio :' : 'Call Sign :'}</span>
                  <span className="font-mono font-bold text-emerald-400">{selectedOfficerDetails.callSign}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{language === 'fr' ? 'Canal Radio :' : 'Radio Channel :'}</span>
                  <span className="text-slate-300">{selectedOfficerDetails.radioChannel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{language === 'fr' ? 'Heure d\'Émargement :' : 'Check-In Muster :'}</span>
                  <span className="font-mono text-slate-300">{selectedOfficerDetails.checkInTime}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
                <span className="text-slate-400 block text-[11px] font-semibold">{language === 'fr' ? 'Équipement Armurerie Délivré :' : 'Issued Gear & Armory Serial :'}</span>
                <p className="text-white font-medium">&bull; {selectedOfficerDetails.weaponIssued}</p>
                <p className="text-slate-300">&bull; {selectedOfficerDetails.bodyCamIssued}</p>
                {selectedOfficerDetails.tacticalVest && (
                  <p className="text-indigo-300">&bull; {language === 'fr' ? 'Gilet pare-balles tactique certifié' : 'Tactical Ballistic Vest Level IIIA'}</p>
                )}
              </div>

              {selectedOfficerDetails.notes && (
                <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800 text-[11px] text-slate-300">
                  <span className="text-slate-400 block font-semibold mb-0.5">{language === 'fr' ? 'Notes du Quart :' : 'Shift Log Notes :'}</span>
                  {selectedOfficerDetails.notes}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOfficerDetails(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
              >
                {language === 'fr' ? 'Fermer' : 'Close'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
