import React, { useState, useMemo } from 'react';
import { 
  ScheduledSafetyEvent, 
  FacilityBlockInfo, 
  FACILITY_BLOCKS, 
  INITIAL_SCHEDULED_EVENTS 
} from '../../data/facilityBlockScheduleData';
import { PrisonFacility } from '../../types';
import { 
  Calendar as CalendarIcon, 
  CalendarDays, 
  ClipboardCheck, 
  Wrench, 
  ShieldCheck, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Filter, 
  Search, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  ChevronDown, 
  Sparkles, 
  Printer, 
  Lock, 
  Flame, 
  Eye, 
  Wind, 
  Droplets, 
  Lightbulb, 
  RotateCcw,
  Check,
  SlidersHorizontal,
  FileText
} from 'lucide-react';

interface FacilityInspectionMaintenanceSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  facilities: PrisonFacility[];
  selectedFacilityId?: string;
  onSelectFacility?: (facilityId: string) => void;
  isDocked?: boolean;
  onToggleDock?: () => void;
}

export const FacilityInspectionMaintenanceSidebar: React.FC<FacilityInspectionMaintenanceSidebarProps> = ({
  isOpen,
  onClose,
  facilities,
  selectedFacilityId = '',
  onSelectFacility,
  isDocked = false,
  onToggleDock
}) => {
  // Calendar Navigation State (Defaults to September 2026 per current mock timestamp 2026-09-21)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // 0-indexed: 8 is September
  const [selectedDateString, setSelectedDateString] = useState<string | null>('2026-09-21');

  // Filters State
  const [filterFacilityId, setFilterFacilityId] = useState<string>(selectedFacilityId || 'ALL');
  const [filterBlockId, setFilterBlockId] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<'ALL' | 'safety_inspection' | 'preventative_maintenance' | 'urgent_only'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Events Live State
  const [events, setEvents] = useState<ScheduledSafetyEvent[]>(INITIAL_SCHEDULED_EVENTS);

  // Modals State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<ScheduledSafetyEvent | null>(null);

  // New Event Form State
  const [newType, setNewType] = useState<'safety_inspection' | 'preventative_maintenance'>('safety_inspection');
  const [newFacilityId, setNewFacilityId] = useState<string>(facilities[0]?.id || 'FAC-01');
  const [newBlockId, setNewBlockId] = useState<string>('blk-01');
  const [newCellRoom, setNewCellRoom] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ScheduledSafetyEvent['category']>('locks_doors');
  const [newScheduledDate, setNewScheduledDate] = useState('2026-09-22');
  const [newScheduledTime, setNewScheduledTime] = useState('09:00 - 11:30');
  const [newPriority, setNewPriority] = useState<ScheduledSafetyEvent['priority']>('high');
  const [newLeadPerson, setNewLeadPerson] = useState('Senior Inspector David Kiprop');
  const [newLeadRole, setNewLeadRole] = useState('Lead Custodial Safety Inspector');
  const [newStandardRef, setNewStandardRef] = useState('KPS-SEC-LK01');
  const [newNotes, setNewNotes] = useState('');
  const [newParts, setNewParts] = useState('');

  // Synchronize facility filter if outer selection changes and filter is not custom
  React.useEffect(() => {
    if (selectedFacilityId) {
      setFilterFacilityId(selectedFacilityId);
      // Reset block filter to ALL when facility changes
      setFilterBlockId('ALL');
    }
  }, [selectedFacilityId]);

  // Derived available blocks for currently chosen filterFacilityId
  const availableBlocksForFilter = useMemo(() => {
    if (filterFacilityId === 'ALL') {
      return FACILITY_BLOCKS;
    }
    return FACILITY_BLOCKS.filter(b => b.facilityId === filterFacilityId);
  }, [filterFacilityId]);

  // Derived blocks for the New Event modal
  const availableBlocksForNewEvent = useMemo(() => {
    return FACILITY_BLOCKS.filter(b => b.facilityId === newFacilityId);
  }, [newFacilityId]);

  // Set default block for new event when facility changes
  React.useEffect(() => {
    if (availableBlocksForNewEvent.length > 0) {
      setNewBlockId(availableBlocksForNewEvent[0].id);
    }
  }, [newFacilityId, availableBlocksForNewEvent]);

  // Calendar month dates computation
  const { calendarDays, monthName } = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    const days: Array<{
      dateString: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }> = [];

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({
        dateString: dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateStr === '2026-09-21'
      });
    }

    // Current month days
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({
        dateString: dateStr,
        dayNumber: dayNum,
        isCurrentMonth: true,
        isToday: dateStr === '2026-09-21'
      });
    }

    // Next month padding to complete standard 35 or 42 grid
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        dateString: dateStr,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: dateStr === '2026-09-21'
      });
    }

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return {
      calendarDays: days,
      monthName: monthNames[currentMonth]
    };
  }, [currentYear, currentMonth]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter(evt => {
      // Facility filter
      if (filterFacilityId !== 'ALL' && evt.facilityId !== filterFacilityId) {
        return false;
      }
      // Block filter
      if (filterBlockId !== 'ALL' && evt.blockId !== filterBlockId) {
        return false;
      }
      // Type filter
      if (filterType === 'safety_inspection' && evt.type !== 'safety_inspection') {
        return false;
      }
      if (filterType === 'preventative_maintenance' && evt.type !== 'preventative_maintenance') {
        return false;
      }
      if (filterType === 'urgent_only' && evt.priority !== 'urgent' && evt.priority !== 'high') {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = evt.title.toLowerCase().includes(q);
        const matchBlock = evt.blockName.toLowerCase().includes(q);
        const matchFac = evt.facilityName.toLowerCase().includes(q);
        const matchLead = evt.leadPerson.toLowerCase().includes(q);
        const matchRef = evt.standardRef.toLowerCase().includes(q);
        if (!matchTitle && !matchBlock && !matchFac && !matchLead && !matchRef) {
          return false;
        }
      }
      return true;
    });
  }, [events, filterFacilityId, filterBlockId, filterType, searchQuery]);

  // Date-wise Event Count Map for Calendar Cells
  const eventsByDate = useMemo(() => {
    const map = new Map<string, ScheduledSafetyEvent[]>();
    filteredEvents.forEach(evt => {
      const list = map.get(evt.scheduledDate) || [];
      list.push(evt);
      map.set(evt.scheduledDate, list);
    });
    return map;
  }, [filteredEvents]);

  // Agenda items: If a date is selected, filter to that date; otherwise show all upcoming sorted by date
  const agendaEvents = useMemo(() => {
    let list = [...filteredEvents];
    if (selectedDateString) {
      list = list.filter(evt => evt.scheduledDate === selectedDateString);
    }
    // Sort chronologically
    return list.sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate) || a.scheduledTime.localeCompare(b.scheduledTime));
  }, [filteredEvents, selectedDateString]);

  // KPI Metrics
  const metrics = useMemo(() => {
    const totalScheduled = filteredEvents.length;
    const inspectionsCount = filteredEvents.filter(e => e.type === 'safety_inspection').length;
    const maintenanceCount = filteredEvents.filter(e => e.type === 'preventative_maintenance').length;
    const urgentCount = filteredEvents.filter(e => e.priority === 'urgent' || e.priority === 'high').length;
    const todayCount = filteredEvents.filter(e => e.scheduledDate === '2026-09-21').length;
    return { totalScheduled, inspectionsCount, maintenanceCount, urgentCount, todayCount };
  }, [filteredEvents]);

  // Actions
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const handleJumpToToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(8); // September
    setSelectedDateString('2026-09-21');
  };

  const handleMarkCompleted = (eventId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEvents(prev => prev.map(item => {
      if (item.id === eventId) {
        const nextStatus = item.status === 'completed' ? 'scheduled' : 'completed';
        return {
          ...item,
          status: nextStatus,
          completedDate: nextStatus === 'completed' ? '2026-09-21 10:45' : undefined,
          completionNotes: nextStatus === 'completed' ? 'Signed off by Lead Safety Inspector. All safety criteria satisfied.' : undefined
        };
      }
      return item;
    }));
  };

  const handleCreateNewEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const chosenFac = facilities.find(f => f.id === newFacilityId);
    const chosenBlock = FACILITY_BLOCKS.find(b => b.id === newBlockId);

    const newEvent: ScheduledSafetyEvent = {
      id: `evt-custom-${Date.now()}`,
      type: newType,
      title: newTitle.trim(),
      facilityId: newFacilityId,
      facilityName: chosenFac?.name || 'Correctional Facility',
      blockId: newBlockId,
      blockName: chosenBlock?.name || 'Facility Block',
      cellRoomName: newCellRoom.trim() || undefined,
      scheduledDate: newScheduledDate,
      scheduledTime: newScheduledTime,
      category: newCategory,
      priority: newPriority,
      status: 'scheduled',
      leadPerson: newLeadPerson.trim() || 'Assigned Officer',
      leadRole: newLeadRole.trim() || 'Custodial Safety Officer',
      standardRef: newStandardRef.trim() || 'KPS-STD-01',
      notes: newNotes.trim() || 'Scheduled preventative maintenance order logged via Multi-Prison ERP overview.',
      complianceRequirements: [
        'Mandatory logbook sign-off upon completion',
        'Physical escort required during block entry',
        'Equipment inspection before re-securing tier'
      ],
      partsRequired: newParts.trim() || undefined,
      estimatedDuration: '2.0 hrs'
    };

    setEvents(prev => [newEvent, ...prev]);
    setSelectedDateString(newScheduledDate);
    setIsScheduleModalOpen(false);

    // Reset title and notes
    setNewTitle('');
    setNewNotes('');
    setNewParts('');
    setNewCellRoom('');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for Slide-over on mobile or non-docked mode */}
      {!isDocked && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 transition-opacity"
        />
      )}

      {/* Main Sidebar Panel */}
      <aside 
        className={`${
          isDocked 
            ? 'w-full lg:w-[460px] xl:w-[500px] shrink-0 border-l border-slate-200 bg-white shadow-md relative' 
            : 'fixed inset-y-0 right-0 z-50 w-full max-w-xl sm:max-w-2xl bg-white shadow-2xl border-l border-slate-200'
        } flex flex-col h-full overflow-hidden transition-all duration-300 select-none text-slate-800`}
      >
        {/* Header Bar */}
        <div className="bg-[#714B67] text-white p-4 shrink-0 flex items-center justify-between border-b border-[#5a3b52]">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2 bg-white/10 rounded-lg shrink-0">
              <CalendarDays className="w-5 h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base truncate">
                  Block Safety & Maintenance Calendar
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded font-bold bg-amber-400 text-slate-950 shrink-0">
                  {metrics.totalScheduled} TASKS
                </span>
              </div>
              <p className="text-xs text-purple-200 truncate">
                Safety inspections & preventative maintenance for specific facility blocks
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            {onToggleDock && (
              <button
                onClick={onToggleDock}
                className="hidden lg:flex p-1.5 text-purple-200 hover:text-white hover:bg-white/10 rounded transition-colors"
                title={isDocked ? 'Undock into Overlay Drawer' : 'Dock alongside Multi-Prison Grid'}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-purple-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Close Calendar Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Controls & KPI Bar */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 space-y-2.5 shrink-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {/* Quick KPI Badges */}
            <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
              <span className="px-2 py-0.5 rounded-md font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs">
                Total: <strong className="text-slate-900">{metrics.totalScheduled}</strong>
              </span>
              <span className="px-2 py-0.5 rounded-md font-semibold bg-blue-50 border border-blue-200 text-blue-900 shadow-2xs flex items-center gap-1">
                <ClipboardCheck className="w-3 h-3 text-blue-600" />
                <span>Insp: <strong>{metrics.inspectionsCount}</strong></span>
              </span>
              <span className="px-2 py-0.5 rounded-md font-semibold bg-amber-50 border border-amber-200 text-amber-900 shadow-2xs flex items-center gap-1">
                <Wrench className="w-3 h-3 text-amber-600" />
                <span>Maint: <strong>{metrics.maintenanceCount}</strong></span>
              </span>
              {metrics.urgentCount > 0 && (
                <span className="px-2 py-0.5 rounded-md font-bold bg-rose-50 border border-rose-200 text-rose-800 shadow-2xs flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-rose-600 animate-pulse" />
                  <span>Urgent: <strong>{metrics.urgentCount}</strong></span>
                </span>
              )}
            </div>

            {/* Schedule New Button */}
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="px-2.5 py-1.5 bg-[#714B67] hover:bg-[#5a3b52] text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-amber-300" />
              <span>Schedule Event</span>
            </button>
          </div>

          {/* Dual Dropdowns: Facility and Specific Block */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {/* Facility Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                Target Facility
              </label>
              <div className="relative">
                <select
                  value={filterFacilityId}
                  onChange={(e) => {
                    const newFac = e.target.value;
                    setFilterFacilityId(newFac);
                    setFilterBlockId('ALL');
                    if (onSelectFacility) {
                      onSelectFacility(newFac === 'ALL' ? '' : newFac);
                    }
                  }}
                  className="w-full bg-white border border-slate-300 rounded-md py-1.5 pl-2 pr-7 text-xs font-medium text-slate-800 focus:ring-1 focus:ring-[#714B67] focus:border-[#714B67] truncate"
                >
                  <option value="ALL">All Facilities (National Overview)</option>
                  {facilities.map(fac => (
                    <option key={fac.id} value={fac.id}>
                      {fac.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* Specific Facility Block Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                Facility Block
              </label>
              <div className="relative">
                <select
                  value={filterBlockId}
                  onChange={(e) => setFilterBlockId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md py-1.5 pl-2 pr-7 text-xs font-medium text-slate-800 focus:ring-1 focus:ring-[#714B67] focus:border-[#714B67] truncate"
                >
                  <option value="ALL">All Blocks in Scope</option>
                  {availableBlocksForFilter.map(block => (
                    <option key={block.id} value={block.id}>
                      {block.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Secondary Filter & Search Row */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search block, equipment, standard code, technician..."
                className="w-full bg-white border border-slate-300 rounded-md py-1 pl-8 pr-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:ring-1 focus:ring-[#714B67] focus:border-[#714B67]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Quick Type Filter Tabs */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                  filterType === 'ALL'
                    ? 'bg-slate-800 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
                title="All Events"
              >
                All
              </button>
              <button
                onClick={() => setFilterType('safety_inspection')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                  filterType === 'safety_inspection'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-100'
                }`}
                title="Filter Safety Inspections only"
              >
                <ClipboardCheck className="w-3 h-3" />
                <span className="hidden sm:inline">Inspections</span>
              </button>
              <button
                onClick={() => setFilterType('preventative_maintenance')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                  filterType === 'preventative_maintenance'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100'
                }`}
                title="Filter Preventative Maintenance only"
              >
                <Wrench className="w-3 h-3" />
                <span className="hidden sm:inline">Maintenance</span>
              </button>
              <button
                onClick={() => setFilterType('urgent_only')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                  filterType === 'urgent_only'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 border border-rose-200 text-rose-800 hover:bg-rose-100'
                }`}
                title="Filter Urgent / High Priority only"
              >
                <AlertTriangle className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content: Calendar Widget + Agenda List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          
          {/* Calendar Widget Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
            {/* Month Header Navigation */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm text-slate-900">
                  {monthName} {currentYear}
                </span>
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                  {currentYear === 2026 && currentMonth === 8 ? 'CURRENT PERIOD' : `${monthName.slice(0, 3)}`}
                </span>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={handleJumpToToday}
                  className="px-2 py-0.5 text-[10px] font-bold text-[#714B67] hover:bg-purple-50 rounded border border-purple-200 transition-colors mr-1 cursor-pointer"
                  title="Jump to Today (Sep 21, 2026)"
                >
                  Today
                </button>
                <button
                  onClick={handlePrevMonth}
                  className="p-1 hover:bg-slate-100 text-slate-600 rounded transition-colors cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1 hover:bg-slate-100 text-slate-600 rounded transition-colors cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of Week Row */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase text-slate-400 mb-1">
              <span>Su</span>
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day) => {
                const isSelected = selectedDateString === day.dateString;
                const dayEvents = eventsByDate.get(day.dateString) || [];
                const hasEvents = dayEvents.length > 0;
                const hasInspection = dayEvents.some(e => e.type === 'safety_inspection');
                const hasMaintenance = dayEvents.some(e => e.type === 'preventative_maintenance');
                const hasUrgent = dayEvents.some(e => e.priority === 'urgent' || e.priority === 'high');

                return (
                  <button
                    key={day.dateString}
                    onClick={() => {
                      // Toggle date selection
                      setSelectedDateString(isSelected ? null : day.dateString);
                    }}
                    className={`min-h-[44px] p-1 rounded-lg border text-left transition-all flex flex-col justify-between cursor-pointer relative group ${
                      isSelected
                        ? 'bg-[#714B67] text-white border-[#5a3b52] shadow-xs'
                        : day.isToday
                        ? 'bg-amber-50/80 border-amber-300 text-slate-900 font-bold'
                        : day.isCurrentMonth
                        ? 'bg-slate-50/50 hover:bg-slate-100 border-slate-100 text-slate-800'
                        : 'bg-transparent border-transparent text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {/* Day Number and Today Indicator */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-semibold ${
                        isSelected ? 'text-white font-bold' : day.isToday ? 'text-amber-900 font-bold' : ''
                      }`}>
                        {day.dayNumber}
                      </span>
                      {day.isToday && !isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Today" />
                      )}
                    </div>

                    {/* Event Badges / Dots */}
                    {hasEvents && (
                      <div className="flex items-center gap-0.5 flex-wrap mt-0.5">
                        {hasInspection && (
                          <span 
                            className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-cyan-300' : 'bg-blue-600'}`} 
                            title="Safety Inspection Scheduled"
                          />
                        )}
                        {hasMaintenance && (
                          <span 
                            className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-300' : 'bg-amber-500'}`} 
                            title="Preventative Maintenance Scheduled"
                          />
                        )}
                        {hasUrgent && (
                          <span 
                            className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-rose-300' : 'bg-rose-600'} animate-pulse`} 
                            title="Urgent / High Priority Item"
                          />
                        )}
                        {dayEvents.length > 1 && (
                          <span className={`text-[9px] font-mono leading-none ml-auto font-bold ${
                            isSelected ? 'text-purple-100' : 'text-slate-500'
                          }`}>
                            {dayEvents.length}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Calendar Legend & Filter Reset */}
            <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 text-[10px] text-slate-500">
              <div className="flex items-center space-x-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span>Inspection</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Maintenance</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-600" />
                  <span>Urgent</span>
                </span>
              </div>

              {selectedDateString && (
                <button
                  onClick={() => setSelectedDateString(null)}
                  className="text-xs text-[#714B67] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Show All Dates</span>
                </button>
              )}
            </div>
          </div>

          {/* Agenda List Section Header */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-2">
              <ClipboardCheck className="w-4 h-4 text-slate-700" />
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                {selectedDateString ? (
                  <span>
                    Schedule for {new Date(selectedDateString + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })} ({agendaEvents.length})
                  </span>
                ) : (
                  <span>All Upcoming Scheduled Block Activities ({agendaEvents.length})</span>
                )}
              </h4>
            </div>

            {selectedDateString && (
              <span className="text-[11px] text-slate-500">
                {selectedDateString === '2026-09-21' ? 'TODAY' : 'Selected Date'}
              </span>
            )}
          </div>

          {/* Agenda Items List */}
          {agendaEvents.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-xl p-6 text-center space-y-2">
              <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="text-xs font-bold text-slate-700">No scheduled activities for this selection</div>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                No safety inspections or preventative maintenance work orders match the current block or date filter.
              </p>
              <div className="pt-2 flex items-center justify-center gap-2">
                {selectedDateString && (
                  <button
                    onClick={() => setSelectedDateString(null)}
                    className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                  >
                    Clear Date Filter
                  </button>
                )}
                <button
                  onClick={() => {
                    setNewScheduledDate(selectedDateString || '2026-09-21');
                    setIsScheduleModalOpen(true);
                  }}
                  className="px-2.5 py-1 text-xs font-semibold bg-[#714B67] hover:bg-[#5a3b52] text-white rounded-md transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3 text-amber-300" />
                  <span>Schedule for this Block</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {agendaEvents.map((evt) => {
                const isCompleted = evt.status === 'completed';
                const isUrgent = evt.priority === 'urgent';
                const isHigh = evt.priority === 'high';

                return (
                  <div
                    key={evt.id}
                    onClick={() => setSelectedEventForDetail(evt)}
                    className={`bg-white border rounded-xl p-3 shadow-2xs hover:shadow-xs transition-all cursor-pointer space-y-2 ${
                      isCompleted
                        ? 'border-emerald-200 bg-emerald-50/20 opacity-90'
                        : isUrgent
                        ? 'border-rose-300 bg-rose-50/10'
                        : isHigh
                        ? 'border-amber-200'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Top Row: Type, Date, Priority */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Event Type Badge */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          evt.type === 'safety_inspection'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {evt.type === 'safety_inspection' ? (
                            <>
                              <ClipboardCheck className="w-3 h-3 text-blue-700" />
                              <span>Safety Inspection</span>
                            </>
                          ) : (
                            <>
                              <Wrench className="w-3 h-3 text-amber-700" />
                              <span>Preventative Maint</span>
                            </>
                          )}
                        </span>

                        {/* Priority Badge */}
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          isUrgent
                            ? 'bg-rose-600 text-white animate-pulse'
                            : isHigh
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {evt.priority.toUpperCase()}
                        </span>

                        {/* Standard Ref Code */}
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {evt.standardRef}
                        </span>
                      </div>

                      {/* Status / Checkbox */}
                      <button
                        onClick={(e) => handleMarkCompleted(evt.id, e)}
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 transition-colors ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                        title={isCompleted ? 'Mark Incomplete' : 'Sign Off & Complete Activity'}
                      >
                        <CheckCircle2 className={`w-3.5 h-3.5 ${isCompleted ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <span>{isCompleted ? 'Completed' : 'Pending Sign-off'}</span>
                      </button>
                    </div>

                    {/* Title & Scope */}
                    <div>
                      <h5 className={`text-xs font-bold leading-snug ${isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                        {evt.title}
                      </h5>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                        {evt.notes}
                      </p>
                    </div>

                    {/* Location Metadata: Facility & Specific Block */}
                    <div className="bg-slate-50 rounded-lg p-2 border border-slate-100 space-y-1 text-[11px]">
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="flex items-center gap-1 font-semibold truncate text-[#714B67]">
                          <Building2 className="w-3.5 h-3.5 shrink-0 text-[#714B67]" />
                          <strong className="truncate">{evt.blockName}</strong>
                        </span>
                        {evt.cellRoomName && (
                          <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 shrink-0">
                            {evt.cellRoomName}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-slate-500 text-[10px]">
                        <span className="truncate">{evt.facilityName}</span>
                        <span className="flex items-center gap-1 shrink-0 font-medium text-slate-600">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{evt.scheduledDate} ({evt.scheduledTime})</span>
                        </span>
                      </div>
                    </div>

                    {/* Footer: Lead Officer & Action link */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                      <span className="truncate">
                        Assigned: <strong className="text-slate-700">{evt.leadPerson}</strong> ({evt.leadRole.split(' ')[0]})
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEventForDetail(evt);
                        }}
                        className="text-xs font-bold text-[#714B67] hover:underline flex items-center gap-0.5 shrink-0 ml-2"
                      >
                        <span>Specifications</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Facility Blocks Reference Directory */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-slate-700 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-[#714B67]" />
                <span>Facility Blocks Surveillance Status</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {availableBlocksForFilter.length} Blocks Registered
              </span>
            </div>

            <div className="grid grid-cols-1 gap-1.5 text-xs">
              {availableBlocksForFilter.slice(0, 4).map(block => (
                <div 
                  key={block.id}
                  onClick={() => {
                    setFilterBlockId(block.id);
                  }}
                  className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                    filterBlockId === block.id 
                      ? 'bg-purple-50 border-purple-300 text-purple-900 font-semibold' 
                      : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-[11px] truncate">{block.name}</div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-2">
                      <span>Occupancy: {block.currentOccupancy}/{block.capacity}</span>
                      <span>•</span>
                      <span>Next Insp: {block.nextScheduledInspectionDate}</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5">
                    <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded ${
                      block.overallSafetyRating === 'A'
                        ? 'bg-emerald-100 text-emerald-800'
                        : block.overallSafetyRating === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}>
                      RATING: {block.overallSafetyRating}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="bg-slate-100 border-t border-slate-200 p-2.5 px-4 shrink-0 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-[11px] font-medium">Statutory Compliance: Mandela Rules 13-14 & KPS-SEC-01</span>
          </div>

          <button
            onClick={() => {
              // Print preview alert / mock print
              window.print();
            }}
            className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-300 rounded text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Print Monthly Block Inspection & Preventative Maintenance Schedule"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print Schedule</span>
          </button>
        </div>
      </aside>

      {/* Schedule New Inspection or Preventative Maintenance Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#714B67] text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <CalendarDays className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">Schedule Safety Inspection or Maintenance</h3>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1 hover:bg-white/10 rounded transition-colors text-purple-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewEvent} className="p-4 overflow-y-auto space-y-3.5 text-xs">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setNewType('safety_inspection');
                    setNewStandardRef('MANDELA-R14-VENT');
                  }}
                  className={`p-2.5 rounded-lg border text-left transition-all flex items-center gap-2 ${
                    newType === 'safety_inspection'
                      ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <ClipboardCheck className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="font-bold">Safety Inspection</div>
                    <div className="text-[10px] text-slate-500 font-normal">Cell block audit & structural check</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNewType('preventative_maintenance');
                    setNewStandardRef('KPS-SEC-LK01');
                  }}
                  className={`p-2.5 rounded-lg border text-left transition-all flex items-center gap-2 ${
                    newType === 'preventative_maintenance'
                      ? 'bg-amber-50 border-amber-400 text-amber-900 font-bold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <Wrench className="w-4 h-4 text-amber-600" />
                  <div>
                    <div className="font-bold">Preventative Maintenance</div>
                    <div className="text-[10px] text-slate-500 font-normal">Lock, bar, electrical & HVAC service</div>
                  </div>
                </button>
              </div>

              {/* Facility & Facility Block Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Penitentiary Facility</label>
                  <select
                    value={newFacilityId}
                    onChange={(e) => setNewFacilityId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-1 focus:ring-[#714B67]"
                  >
                    {facilities.map(fac => (
                      <option key={fac.id} value={fac.id}>{fac.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Target Facility Block</label>
                  <select
                    value={newBlockId}
                    onChange={(e) => setNewBlockId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-1 focus:ring-[#714B67]"
                  >
                    {availableBlocksForNewEvent.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Scope Title */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Scope Title / Description</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Ultrasonic Manganese Bar Ring Test & Perimeter Gate Service"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-1 focus:ring-[#714B67]"
                />
              </div>

              {/* Cell / Ward Location & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Specific Tier / Cells (Optional)</label>
                  <input
                    type="text"
                    value={newCellRoom}
                    onChange={(e) => setNewCellRoom(e.target.value)}
                    placeholder="e.g. Tier 1 (Cells 101-112) or Sallyport"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-1 focus:ring-[#714B67]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Equipment Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-1 focus:ring-[#714B67]"
                  >
                    <option value="locks_doors">Locks, Heavy Doors & Sallyports</option>
                    <option value="bars_grilles">Manganese Bars & Anti-Climb Grilles</option>
                    <option value="surveillance_cctv">Surveillance CCTV & Audio Mon</option>
                    <option value="ventilation_air">Ventilation, Air Vents & Louvers</option>
                    <option value="plumbing_sanitary">Plumbing, Toilets & Sewer Traps</option>
                    <option value="electrical_lighting">Electrical, Generator ATS & Lighting</option>
                    <option value="fire_life_safety">Fire Alarms & Extinguishers</option>
                    <option value="anti_ligature">Anti-Ligature Suicide Prevention</option>
                  </select>
                </div>
              </div>

              {/* Date, Time & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    required
                    value={newScheduledDate}
                    onChange={(e) => setNewScheduledDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-1 focus:ring-[#714B67]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Time Window</label>
                  <input
                    type="text"
                    required
                    value={newScheduledTime}
                    onChange={(e) => setNewScheduledTime(e.target.value)}
                    placeholder="08:30 - 11:00"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-1 focus:ring-[#714B67]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Priority Level</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-1 focus:ring-[#714B67]"
                  >
                    <option value="routine">Routine Check</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent Security Breach</option>
                  </select>
                </div>
              </div>

              {/* Lead Person & Standard Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Assigned Inspector / Tech</label>
                  <input
                    type="text"
                    required
                    value={newLeadPerson}
                    onChange={(e) => setNewLeadPerson(e.target.value)}
                    placeholder="e.g. Senior Inspector David Kiprop"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-1 focus:ring-[#714B67]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Standard Reference Code</label>
                  <input
                    type="text"
                    value={newStandardRef}
                    onChange={(e) => setNewStandardRef(e.target.value)}
                    placeholder="e.g. KPS-SEC-LK01 or MANDELA-R14"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-1 focus:ring-[#714B67]"
                  />
                </div>
              </div>

              {/* Operational Directives / Notes */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Operational Directives & Scope Notes</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Specific instructions, safety protocols, or physical inspection checklist directives..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-1 focus:ring-[#714B67]"
                />
              </div>

              {/* Parts Required (if maintenance) */}
              {newType === 'preventative_maintenance' && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Parts & Tools Required</label>
                  <input
                    type="text"
                    value={newParts}
                    onChange={(e) => setNewParts(e.target.value)}
                    placeholder="e.g. 24x M10 shear bolts, synthetic dry graphite lube, torque wrench"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-medium focus:ring-1 focus:ring-[#714B67]"
                  />
                </div>
              )}

              {/* Form Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#714B67] hover:bg-[#5a3b52] text-white font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-amber-300" />
                  <span>Commit to Schedule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Details & Specifications Dossier Modal */}
      {selectedEventForDetail && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#714B67] text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                {selectedEventForDetail.type === 'safety_inspection' ? (
                  <ClipboardCheck className="w-5 h-5 text-cyan-300" />
                ) : (
                  <Wrench className="w-5 h-5 text-amber-300" />
                )}
                <div>
                  <h3 className="font-bold text-base">
                    {selectedEventForDetail.type === 'safety_inspection' ? 'Safety Inspection Dossier' : 'Preventative Work Order'}
                  </h3>
                  <p className="text-[11px] text-purple-200">
                    Standard Code: {selectedEventForDetail.standardRef}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEventForDetail(null)}
                className="p-1 hover:bg-white/10 rounded transition-colors text-purple-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              {/* Status Header Banner */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Execution Status</div>
                  <div className="font-extrabold text-slate-800 flex items-center gap-1.5 mt-0.5 capitalize">
                    {selectedEventForDetail.status === 'completed' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-800">Certified Completed ({selectedEventForDetail.completedDate})</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span className="text-amber-900">{selectedEventForDetail.status.replace('_', ' ')}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Priority</div>
                  <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-full ${
                    selectedEventForDetail.priority === 'urgent'
                      ? 'bg-rose-600 text-white'
                      : 'bg-amber-100 text-amber-900 font-bold'
                  }`}>
                    {selectedEventForDetail.priority.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Title & Scope */}
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-500">Operation Scope</div>
                <h4 className="text-sm font-bold text-slate-900">{selectedEventForDetail.title}</h4>
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {selectedEventForDetail.notes}
                </p>
              </div>

              {/* Facility & Specific Block Location Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Facility Location</div>
                  <div className="font-bold text-slate-800">{selectedEventForDetail.facilityName}</div>
                  <div className="text-slate-600 font-medium">{selectedEventForDetail.blockName}</div>
                  {selectedEventForDetail.cellRoomName && (
                    <div className="text-[11px] font-mono text-purple-800 mt-0.5">
                      Sub-location: {selectedEventForDetail.cellRoomName}
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Time & Duration</div>
                  <div className="font-bold text-slate-800">{selectedEventForDetail.scheduledDate}</div>
                  <div className="text-slate-600">{selectedEventForDetail.scheduledTime}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Est. Duration: {selectedEventForDetail.estimatedDuration}
                  </div>
                </div>
              </div>

              {/* Assigned Technical Lead */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-500">Assigned Inspector / Engineer</div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{selectedEventForDetail.leadPerson}</div>
                    <div className="text-xs text-slate-500">{selectedEventForDetail.leadRole}</div>
                  </div>
                  {selectedEventForDetail.leadBadge && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                      {selectedEventForDetail.leadBadge}
                    </span>
                  )}
                </div>
              </div>

              {/* Compliance & Mandates Checklist */}
              {selectedEventForDetail.complianceRequirements && selectedEventForDetail.complianceRequirements.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] uppercase font-bold text-slate-500">
                    Mandatory Safety Verification Checklist
                  </div>
                  <div className="space-y-1">
                    {selectedEventForDetail.complianceRequirements.map((req, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-xs text-slate-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Parts & Equipment Required */}
              {selectedEventForDetail.partsRequired && (
                <div className="p-2.5 bg-amber-50/60 rounded-lg border border-amber-200 text-xs text-amber-950">
                  <div className="font-bold text-[11px] mb-0.5">Parts & Materials Reserved:</div>
                  <div>{selectedEventForDetail.partsRequired}</div>
                </div>
              )}

              {/* Mandela Rule Legal Reference */}
              {selectedEventForDetail.mandelaRuleRef && (
                <div className="p-2.5 bg-blue-50/60 rounded-lg border border-blue-200 text-xs text-blue-950">
                  <div className="font-bold text-[11px] mb-0.5">International Statutory Mandate:</div>
                  <div>{selectedEventForDetail.mandelaRuleRef}</div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="bg-slate-50 border-t border-slate-200 p-3 flex items-center justify-between">
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>Print Work Order</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedEventForDetail(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => {
                    handleMarkCompleted(selectedEventForDetail.id);
                    setSelectedEventForDetail(null);
                  }}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 text-white ${
                    selectedEventForDetail.status === 'completed'
                      ? 'bg-slate-700 hover:bg-slate-800'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>{selectedEventForDetail.status === 'completed' ? 'Re-open Order' : 'Sign Off & Complete'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
