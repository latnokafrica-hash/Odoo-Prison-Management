import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  History, 
  Calendar, 
  ShieldAlert, 
  AlertTriangle, 
  HeartPulse, 
  Truck, 
  Search, 
  Filter, 
  ArrowUpDown, 
  CheckCircle2, 
  Plus, 
  MapPin, 
  User, 
  UserCheck, 
  X, 
  Radio, 
  Megaphone, 
  Wrench, 
  Users, 
  Package, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Sparkles,
  Info,
  Shield,
  FileCheck
} from 'lucide-react';
import { 
  ShiftTimelineEvent, 
  ShiftEventType, 
  ShiftEventSeverity, 
  ShiftType, 
  Language 
} from '../../types';
import { INITIAL_TIMELINE_EVENTS } from '../../data/timelineData';

interface ShiftTimelineWidgetProps {
  language: Language;
  currentShift: ShiftType;
  facilityName?: string;
  events?: ShiftTimelineEvent[];
  onAddEvent?: (newEvent: ShiftTimelineEvent) => void;
  onVerifyEvent?: (eventId: string, verifiedBy: string) => void;
  compactView?: boolean;
}

export const ShiftTimelineWidget: React.FC<ShiftTimelineWidgetProps> = ({
  language,
  currentShift = 'morning',
  facilityName = 'Central Maximum Penitentiary',
  events: propEvents,
  onAddEvent,
  onVerifyEvent,
  compactView = false,
}) => {
  // Local events state if not managed externally
  const [localEvents, setLocalEvents] = useState<ShiftTimelineEvent[]>(
    propEvents && propEvents.length > 0 ? propEvents : INITIAL_TIMELINE_EVENTS
  );

  // Sync with prop events when updated
  const activeEvents = propEvents && propEvents.length > 0 ? propEvents : localEvents;

  // Sorting & Filtering States
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // asc = chronological (earliest first)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  // Modal State for Logging New Event
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTimestamp, setNewTimestamp] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [newCategory, setNewCategory] = useState<ShiftEventType>('routine_patrol');
  const [newSeverity, setNewSeverity] = useState<ShiftEventSeverity>('routine');
  const [newLocation, setNewLocation] = useState('Block A - Tier 1');
  const [newLoggedBy, setNewLoggedBy] = useState('Capt. Marcus Vance');
  const [newBadgeNumber, setNewBadgeNumber] = useState('KP-8421');
  const [newDescription, setNewDescription] = useState('');
  const [newActionTaken, setNewActionTaken] = useState('');
  const [newRelatedInmate, setNewRelatedInmate] = useState('');
  const [newMarkVerified, setNewMarkVerified] = useState(true);

  // Quick verify handler
  const handleVerify = (eventId: string) => {
    const verifiedBy = 'Duty Shift Commander';
    if (onVerifyEvent) {
      onVerifyEvent(eventId, verifiedBy);
    } else {
      setLocalEvents(prev => prev.map(ev => {
        if (ev.id === eventId) {
          return {
            ...ev,
            isVerified: true,
            verifiedBy,
            verifiedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }
        return ev;
      }));
    }
  };

  // Add event handler
  const handleSubmitNewEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const createdEvent: ShiftTimelineEvent = {
      id: `evt-${Date.now()}`,
      timestamp: newTimestamp,
      title: newTitle.trim(),
      description: newDescription.trim() || 'Logged during routine shift operations.',
      category: newCategory,
      severity: newSeverity,
      location: newLocation,
      loggedBy: newLoggedBy,
      badgeNumber: newBadgeNumber,
      relatedInmate: newRelatedInmate.trim() || undefined,
      actionTaken: newActionTaken.trim() || 'Acknowledged and noted in shift register.',
      isVerified: newMarkVerified,
      verifiedBy: newMarkVerified ? newLoggedBy : undefined,
      verifiedAt: newMarkVerified ? newTimestamp : undefined,
      shift: currentShift
    };

    if (onAddEvent) {
      onAddEvent(createdEvent);
    } else {
      setLocalEvents(prev => [...prev, createdEvent]);
    }

    // Reset and close
    setIsLogModalOpen(false);
    setNewTitle('');
    setNewDescription('');
    setNewActionTaken('');
    setNewRelatedInmate('');
  };

  // Filtered and Sorted Events
  const filteredEvents = useMemo(() => {
    return activeEvents.filter(ev => {
      const matchesSearch = 
        ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.loggedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ev.relatedInmate && ev.relatedInmate.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === 'all' || ev.category === selectedCategory;
      const matchesSev = selectedSeverity === 'all' || ev.severity === selectedSeverity;
      const matchesVerif = 
        verificationFilter === 'all' ||
        (verificationFilter === 'verified' && ev.isVerified) ||
        (verificationFilter === 'unverified' && !ev.isVerified);

      return matchesSearch && matchesCat && matchesSev && matchesVerif;
    }).sort((a, b) => {
      const timeA = a.timestamp.replace(':', '');
      const timeB = b.timestamp.replace(':', '');
      return sortOrder === 'asc' ? timeA.localeCompare(timeB) : timeB.localeCompare(timeA);
    });
  }, [activeEvents, searchQuery, selectedCategory, selectedSeverity, verificationFilter, sortOrder]);

  // Metric Summaries
  const metrics = useMemo(() => {
    const total = activeEvents.length;
    const criticalUrgent = activeEvents.filter(e => e.severity === 'critical' || e.severity === 'urgent').length;
    const verified = activeEvents.filter(e => e.isVerified).length;
    const routineCount = activeEvents.filter(e => e.severity === 'routine').length;
    return {
      total,
      criticalUrgent,
      verified,
      verifiedPct: total > 0 ? Math.round((verified / total) * 100) : 100,
      routineCount
    };
  }, [activeEvents]);

  // Helper for Category styling & icon
  const getCategoryDetails = (cat: ShiftEventType) => {
    switch (cat) {
      case 'headcount_muster':
        return {
          label: language === 'fr' ? 'Appel & Clés' : 'Headcount & Muster',
          icon: <Users className="w-4 h-4 text-sky-400" />,
          color: 'bg-sky-500/10 text-sky-300 border-sky-500/30'
        };
      case 'security_incident':
        return {
          label: language === 'fr' ? 'Incident Sécurité' : 'Security Incident',
          icon: <ShieldAlert className="w-4 h-4 text-rose-400" />,
          color: 'bg-rose-500/10 text-rose-300 border-rose-500/30'
        };
      case 'contraband_discovery':
        return {
          label: language === 'fr' ? 'Saisie Contrebande' : 'Contraband Discovery',
          icon: <Package className="w-4 h-4 text-amber-400" />,
          color: 'bg-amber-500/10 text-amber-300 border-amber-500/30'
        };
      case 'medical_emergency':
        return {
          label: language === 'fr' ? 'Urgence Médicale' : 'Medical Emergency',
          icon: <HeartPulse className="w-4 h-4 text-red-400" />,
          color: 'bg-red-500/10 text-red-300 border-red-500/30'
        };
      case 'escort_transit':
        return {
          label: language === 'fr' ? 'Escorte Convoi' : 'Escort & Convoy',
          icon: <Truck className="w-4 h-4 text-indigo-400" />,
          color: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
        };
      case 'perimeter_alert':
        return {
          label: language === 'fr' ? 'Alerte Périmètre' : 'Perimeter Alert',
          icon: <Radio className="w-4 h-4 text-cyan-400" />,
          color: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
        };
      case 'command_directive':
        return {
          label: language === 'fr' ? 'Ordre de Commandement' : 'Command Directive',
          icon: <Megaphone className="w-4 h-4 text-purple-400" />,
          color: 'bg-purple-500/10 text-purple-300 border-purple-500/30'
        };
      case 'maintenance_issue':
        return {
          label: language === 'fr' ? 'Maintenance Sécurité' : 'Maintenance & Locks',
          icon: <Wrench className="w-4 h-4 text-orange-400" />,
          color: 'bg-orange-500/10 text-orange-300 border-orange-500/30'
        };
      default:
        return {
          label: language === 'fr' ? 'Patrouille de Routine' : 'Routine Patrol',
          icon: <Clock className="w-4 h-4 text-emerald-400" />,
          color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
        };
    }
  };

  // Helper for Severity styling
  const getSeverityBadge = (sev: ShiftEventSeverity) => {
    switch (sev) {
      case 'critical':
        return {
          label: language === 'fr' ? 'Critique' : 'Critical',
          badge: 'bg-red-600 text-white font-black animate-pulse',
          dot: 'bg-red-500 ring-4 ring-red-500/20'
        };
      case 'urgent':
        return {
          label: language === 'fr' ? 'Urgent' : 'Urgent',
          badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
          dot: 'bg-amber-400 ring-4 ring-amber-400/20'
        };
      case 'notable':
        return {
          label: language === 'fr' ? 'Notable' : 'Notable',
          badge: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40',
          dot: 'bg-indigo-400'
        };
      default:
        return {
          label: language === 'fr' ? 'Routine' : 'Routine',
          badge: 'bg-slate-800 text-slate-300 border border-slate-700',
          dot: 'bg-emerald-400'
        };
    }
  };

  // COMPACT VIEW: For Executive Summary card
  if (compactView) {
    const recentEvents = [...activeEvents].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 3);

    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              {language === 'fr' ? 'Fil Chronologique du Quart' : 'Shift Chronological Log'}
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400">
              {metrics.total} {language === 'fr' ? 'événements' : 'logged'}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {metrics.verifiedPct}% {language === 'fr' ? 'Vérifié' : 'Verified'}
            </span>
          </div>
        </div>

        {/* Mini Highlights */}
        <div className="space-y-2 mb-3">
          {recentEvents.map(ev => {
            const cat = getCategoryDetails(ev.category);
            const sev = getSeverityBadge(ev.severity);
            return (
              <div key={ev.id} className="flex items-start gap-2.5 p-2 bg-slate-950 rounded-lg border border-slate-800/80 text-xs">
                <span className="font-mono text-[11px] font-bold text-indigo-300 shrink-0 mt-0.5">
                  {ev.timestamp}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-medium text-slate-200 truncate">{ev.title}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${sev.badge}`}>
                      {sev.label}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                    <span>{ev.location}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
          <span>{metrics.criticalUrgent} {language === 'fr' ? 'alertes prioritaires' : 'high-priority alerts'}</span>
          <button
            onClick={() => setIsLogModalOpen(true)}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'fr' ? 'Ajouter' : 'Log Event'}</span>
          </button>
        </div>
      </div>
    );
  }

  // FULL INTERACTIVE TIMELINE VIEW
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 shadow-xl text-white space-y-6">
      
      {/* Header with Title, Actions & Description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-indigo-950 text-indigo-400 rounded-xl border border-indigo-700/60 shadow-xs">
            <History className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide uppercase">
                {language === 'fr' ? 'Chronologie Opérationnelle du Quart' : 'Shift Operational Event Timeline'}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                {language === 'fr' ? `Quart de ${currentShift}` : `${currentShift.toUpperCase()} SHIFT`}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{metrics.verified}/{metrics.total} {language === 'fr' ? 'Vérifiés' : 'Verified'}</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'fr'
                ? `Journal chronologique officiel des étapes, alertes de sécurité, urgences médicales et consignes de commandement enregistrées pour le quart.`
                : `Official chronological log of operational milestones, security alerts, medical responses, and command directives recorded during the shift.`}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Chronological Sort Toggle */}
          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-800 transition-colors cursor-pointer"
            title={language === 'fr' ? 'Inverser l\'ordre chronologique' : 'Toggle chronological sorting order'}
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              {sortOrder === 'asc' 
                ? (language === 'fr' ? '06:00 → 14:00 (Ordre Direct)' : 'Earliest First')
                : (language === 'fr' ? '14:00 → 06:00 (Récents d\'Abord)' : 'Latest First')}
            </span>
          </button>

          {/* Log New Shift Event Button */}
          <button
            onClick={() => setIsLogModalOpen(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-900/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'fr' ? 'Consigner un Événement' : 'Log Shift Event'}</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Dashboard Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        
        {/* Total Events */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{language === 'fr' ? 'Événements Consignés' : 'Total Events Logged'}</span>
            <FileCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-white">{metrics.total}</span>
            <span className="text-xs text-slate-400 font-semibold">{language === 'fr' ? 'entrées' : 'entries'}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {language === 'fr' ? 'Registre officiel infalsifiable' : 'Continuous audit trail'}
          </p>
        </div>

        {/* Critical & Urgent Alerts */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{language === 'fr' ? 'Alertes Prioritaires' : 'Critical / Urgent'}</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-xl font-black ${metrics.criticalUrgent > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {metrics.criticalUrgent}
            </span>
            <span className="text-xs text-slate-400 font-semibold">{language === 'fr' ? 'signalement(s)' : 'incident(s)'}</span>
          </div>
          <p className="text-[11px] text-amber-400/90 mt-2">
            {metrics.criticalUrgent > 0 
              ? (language === 'fr' ? 'Nécessite passation détaillée' : 'Detailed handover required')
              : (language === 'fr' ? 'Aucun incident majeur' : 'No major security breach')}
          </p>
        </div>

        {/* Verification Rate */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{language === 'fr' ? 'Taux de Vérification' : 'Verification Rate'}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-emerald-400">{metrics.verifiedPct}%</span>
            <span className="text-xs text-slate-400 font-semibold">({metrics.verified}/{metrics.total})</span>
          </div>
          <p className="text-[11px] text-emerald-400/90 mt-2">
            {metrics.verified === metrics.total 
              ? (language === 'fr' ? '100% Validé par commandement' : '100% Commander certified')
              : (language === 'fr' ? `${metrics.total - metrics.verified} à valider` : `${metrics.total - metrics.verified} pending verification`)}
          </p>
        </div>

        {/* Routine Checks */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{language === 'fr' ? 'Contrôles de Routine' : 'Routine Procedures'}</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-sky-300">{metrics.routineCount}</span>
            <span className="text-xs text-slate-400 font-semibold">{language === 'fr' ? 'rondes' : 'passes'}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {language === 'fr' ? 'Appels, repas & rondes' : 'Muster, meal & tool audits'}
          </p>
        </div>

        {/* Active Shift Duration */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 col-span-2 sm:col-span-4 lg:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{language === 'fr' ? 'Fenêtre Opérationnelle' : 'Operational Span'}</span>
            <Shield className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-white font-mono">06:00 &rarr; 14:00</span>
          </div>
          <p className="text-[11px] text-indigo-300 mt-2">
            {language === 'fr' ? 'Quart Matin (8h 00m)' : 'Day Shift (8 Hours)'}
          </p>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder={language === 'fr' ? 'Rechercher par titre, mot-clé, officier, détenu...' : 'Search events, officers, inmates, sectors...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">{language === 'fr' ? 'Catégorie :' : 'Category:'}</span>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">{language === 'fr' ? 'Toutes les Catégories' : 'All Categories'}</option>
              <option value="headcount_muster">{language === 'fr' ? 'Appel & Clés' : 'Headcount & Muster'}</option>
              <option value="security_incident">{language === 'fr' ? 'Incident Sécurité' : 'Security Incident'}</option>
              <option value="contraband_discovery">{language === 'fr' ? 'Saisie Contrebande' : 'Contraband Discovery'}</option>
              <option value="medical_emergency">{language === 'fr' ? 'Urgence Médicale' : 'Medical Emergency'}</option>
              <option value="escort_transit">{language === 'fr' ? 'Escorte & Convoi' : 'Escort & Convoy'}</option>
              <option value="perimeter_alert">{language === 'fr' ? 'Alerte Périmètre' : 'Perimeter Alert'}</option>
              <option value="command_directive">{language === 'fr' ? 'Ordre de Commandement' : 'Command Directive'}</option>
              <option value="maintenance_issue">{language === 'fr' ? 'Maintenance Sécurité' : 'Maintenance & Locks'}</option>
              <option value="routine_patrol">{language === 'fr' ? 'Patrouille de Routine' : 'Routine Patrol'}</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">{language === 'fr' ? 'Gravité :' : 'Severity:'}</span>
            <select
              value={selectedSeverity}
              onChange={e => setSelectedSeverity(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">{language === 'fr' ? 'Tous Niveaux' : 'All Severities'}</option>
              <option value="critical">{language === 'fr' ? 'Critique' : 'Critical'}</option>
              <option value="urgent">{language === 'fr' ? 'Urgent' : 'Urgent'}</option>
              <option value="notable">{language === 'fr' ? 'Notable' : 'Notable'}</option>
              <option value="routine">{language === 'fr' ? 'Routine' : 'Routine'}</option>
            </select>
          </div>

          {/* Verification Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">{language === 'fr' ? 'Validation :' : 'Status:'}</span>
            <select
              value={verificationFilter}
              onChange={e => setVerificationFilter(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">{language === 'fr' ? 'Tous' : 'All'}</option>
              <option value="verified">{language === 'fr' ? 'Vérifiés Uniquement' : 'Verified Only'}</option>
              <option value="unverified">{language === 'fr' ? 'En Attente de Visa' : 'Unverified'}</option>
            </select>
          </div>

        </div>

      </div>

      {/* Main Interactive Chronological Timeline Rail */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
        
        {filteredEvents.length === 0 ? (
          <div className="bg-slate-950 p-8 rounded-xl border border-slate-800 text-center text-slate-400 text-xs">
            <History className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-slate-300">
              {language === 'fr' ? 'Aucun événement ne correspond aux critères de filtre.' : 'No events match the selected filter criteria.'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedSeverity('all');
                setVerificationFilter('all');
              }}
              className="mt-3 text-indigo-400 hover:text-indigo-300 underline font-medium cursor-pointer"
            >
              {language === 'fr' ? 'Réinitialiser les filtres' : 'Reset all filters'}
            </button>
          </div>
        ) : (
          filteredEvents.map(event => {
            const cat = getCategoryDetails(event.category);
            const sev = getSeverityBadge(event.severity);
            const isExpanded = expandedEventId === event.id;

            return (
              <div 
                key={event.id}
                className="relative group transition-all"
              >
                {/* Timeline Milestone Node Marker */}
                <div className={`absolute -left-6 sm:-left-8 top-3 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-950 border-2 border-slate-800 flex items-center justify-center shadow-md transition-transform group-hover:scale-110 z-10 ${
                  event.severity === 'critical' 
                    ? 'border-red-500 text-red-400' 
                    : event.severity === 'urgent' 
                      ? 'border-amber-500 text-amber-400' 
                      : 'border-indigo-500/60 text-indigo-400'
                }`}>
                  {cat.icon}
                </div>

                {/* Event Card Container */}
                <div className={`rounded-xl border transition-all overflow-hidden ${
                  event.severity === 'critical'
                    ? 'bg-slate-950/90 border-red-500/50 shadow-lg shadow-red-950/20'
                    : event.severity === 'urgent'
                      ? 'bg-slate-950/90 border-amber-500/40 shadow-md shadow-amber-950/20'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}>
                  
                  {/* Card Header Bar */}
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80">
                    
                    <div className="flex flex-wrap items-center gap-2.5">
                      {/* Monospace Timestamp */}
                      <span className="font-mono text-sm font-black text-indigo-300 bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-800/50 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{event.timestamp}</span>
                      </span>

                      {/* Category Badge */}
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border flex items-center gap-1 ${cat.color}`}>
                        {cat.icon}
                        <span>{cat.label}</span>
                      </span>

                      {/* Severity Badge */}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${sev.badge}`}>
                        {sev.label}
                      </span>
                    </div>

                    {/* Sector / Location Tag */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="font-medium text-slate-300">{event.location}</span>
                    </div>

                  </div>

                  {/* Card Main Body */}
                  <div className="p-4 space-y-3">
                    
                    {/* Event Title */}
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-sm font-bold text-white tracking-wide">
                        {event.title}
                      </h4>
                      
                      {/* Related Inmate Badge if any */}
                      {event.relatedInmate && (
                        <span className="px-2 py-0.5 rounded bg-rose-950/50 text-rose-300 border border-rose-800/50 text-[11px] font-semibold shrink-0">
                          {language === 'fr' ? 'Détenu :' : 'Inmate:'} {event.relatedInmate}
                        </span>
                      )}
                    </div>

                    {/* Description Paragraph */}
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {event.description}
                    </p>

                    {/* Action Taken / Mitigation Callout */}
                    {event.actionTaken && (
                      <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 text-xs flex items-start gap-2">
                        <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                            {language === 'fr' ? 'Mesure Opérationnelle Immédiate :' : 'Immediate Operational Action Taken:'}
                          </span>
                          <span className="text-slate-200 leading-snug block">
                            {event.actionTaken}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Footer with Officer Log & Commander Verification */}
                    <div className="pt-2 border-t border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      
                      {/* Logged By Officer */}
                      <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>{language === 'fr' ? 'Consigné par :' : 'Logged by:'}</span>
                        <strong className="text-slate-200">{event.loggedBy}</strong>
                        {event.badgeNumber && (
                          <span className="font-mono text-indigo-300">({event.badgeNumber})</span>
                        )}
                      </div>

                      {/* Verification Status */}
                      <div className="flex items-center gap-2">
                        {event.isVerified ? (
                          <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-semibold bg-emerald-950/30 px-2.5 py-1 rounded-md border border-emerald-800/40">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>
                              {language === 'fr' ? 'Vérifié' : 'Verified'}
                              {event.verifiedBy && ` (${event.verifiedBy}${event.verifiedAt ? ` - ${event.verifiedAt}` : ''})`}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-amber-400 text-[11px] font-medium">
                              {language === 'fr' ? 'En attente de visa' : 'Awaiting sign-off'}
                            </span>
                            <button
                              onClick={() => handleVerify(event.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Check className="w-3 h-3" />
                              <span>{language === 'fr' ? 'Valider' : 'Verify'}</span>
                            </button>
                          </div>
                        )}
                      </div>

                    </div>

                  </div>

                </div>

              </div>
            );
          })
        )}

      </div>

      {/* MODAL: Log New Shift Event Form */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 max-w-xl w-full text-white shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-400" />
                <h4 className="text-sm font-bold uppercase tracking-wider">
                  {language === 'fr' ? 'Consigner un Événement au Journal du Quart' : 'Log Shift Operational Event'}
                </h4>
              </div>
              <button 
                onClick={() => setIsLogModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitNewEvent} className="space-y-4 text-xs">
              
              {/* Event Title */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {language === 'fr' ? 'Intitulé de l\'Événement *' : 'Event Title / Summary *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'fr' ? 'Ex: Incident en salle de visite, alerte capteur...' : 'e.g., Unplanned medical extraction, perimeter sensor alert...'}
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Timestamp & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{language === 'fr' ? 'Heure de l\'Événement (HH:MM) *' : 'Event Time (HH:MM) *'}</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={newTimestamp}
                    onChange={e => setNewTimestamp(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {language === 'fr' ? 'Catégorie Opérationnelle *' : 'Operational Category *'}
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as ShiftEventType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="routine_patrol">{language === 'fr' ? 'Patrouille de Routine' : 'Routine Patrol'}</option>
                    <option value="headcount_muster">{language === 'fr' ? 'Appel & Clés' : 'Headcount & Muster'}</option>
                    <option value="security_incident">{language === 'fr' ? 'Incident Sécurité' : 'Security Incident'}</option>
                    <option value="contraband_discovery">{language === 'fr' ? 'Saisie Contrebande' : 'Contraband Discovery'}</option>
                    <option value="medical_emergency">{language === 'fr' ? 'Urgence Médicale' : 'Medical Emergency'}</option>
                    <option value="escort_transit">{language === 'fr' ? 'Escorte Convoi' : 'Escort & Convoy'}</option>
                    <option value="perimeter_alert">{language === 'fr' ? 'Alerte Périmètre' : 'Perimeter Alert'}</option>
                    <option value="command_directive">{language === 'fr' ? 'Ordre de Commandement' : 'Command Directive'}</option>
                    <option value="maintenance_issue">{language === 'fr' ? 'Maintenance Sécurité' : 'Maintenance & Locks'}</option>
                  </select>
                </div>
              </div>

              {/* Severity & Sector / Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {language === 'fr' ? 'Niveau de Gravité *' : 'Severity Level *'}
                  </label>
                  <select
                    value={newSeverity}
                    onChange={e => setNewSeverity(e.target.value as ShiftEventSeverity)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="routine">{language === 'fr' ? 'Routine (Opérations standard)' : 'Routine (Standard procedure)'}</option>
                    <option value="notable">{language === 'fr' ? 'Notable (À signaler à la relève)' : 'Notable (Relevant for incoming shift)'}</option>
                    <option value="urgent">{language === 'fr' ? 'Urgent (Incident actif maîtrisé)' : 'Urgent (Contained active incident)'}</option>
                    <option value="critical">{language === 'fr' ? 'Critique (Alerte majeure)' : 'Critical (Major security threat)'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {language === 'fr' ? 'Lieu / Secteur *' : 'Location / Facility Sector *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newLocation}
                    onChange={e => setNewLocation(e.target.value)}
                    placeholder="e.g. Block A Tier 1, Yard 2, Armory"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Officer Log & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {language === 'fr' ? 'Officier Déclarant *' : 'Reporting Officer Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newLoggedBy}
                    onChange={e => setNewLoggedBy(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {language === 'fr' ? 'Matricule / Badge #' : 'Officer Badge Number'}
                  </label>
                  <input
                    type="text"
                    value={newBadgeNumber}
                    onChange={e => setNewBadgeNumber(e.target.value)}
                    placeholder="KP-8421"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Related Inmate (optional) */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {language === 'fr' ? 'Détenu Concerné (Facultatif)' : 'Related Inmate (Optional)'}
                </label>
                <input
                  type="text"
                  value={newRelatedInmate}
                  onChange={e => setNewRelatedInmate(e.target.value)}
                  placeholder="e.g., John Doe (#INM-1029)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {language === 'fr' ? 'Description Détaillée des Faits *' : 'Detailed Factual Observations *'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder={language === 'fr' ? 'Préciser les circonstances, témoins, objets saisis...' : 'Detail sequence of events, personnel involved, and findings...'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Immediate Action Taken */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {language === 'fr' ? 'Mesures Prises & Résolution' : 'Immediate Action Taken / Mitigation'}
                </label>
                <input
                  type="text"
                  value={newActionTaken}
                  onChange={e => setNewActionTaken(e.target.value)}
                  placeholder={language === 'fr' ? 'Ex: Évacué vers infirmerie, cellule scellée, fouille ordonnée' : 'e.g. Inmate moved to clinic, cell secured, area cordoned off'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Mark as Verified Checkbox */}
              <div className="flex items-center gap-2 p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <input
                  type="checkbox"
                  id="markVerified"
                  checked={newMarkVerified}
                  onChange={e => setNewMarkVerified(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="markVerified" className="text-slate-300 cursor-pointer">
                  {language === 'fr'
                    ? 'Valider immédiatement en tant que Commandant de Quart'
                    : 'Certify and verify entry immediately as Duty Shift Commander'}
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold transition-colors cursor-pointer"
                >
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-md shadow-indigo-900/30 transition-all cursor-pointer"
                >
                  {language === 'fr' ? 'Enregistrer au Registre' : 'Commit to Log'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
