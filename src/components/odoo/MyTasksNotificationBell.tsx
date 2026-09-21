import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Check, 
  Calendar, 
  Gavel, 
  Stethoscope, 
  ClipboardCheck, 
  FileText, 
  ShieldAlert, 
  ArrowRight, 
  X, 
  Search, 
  Plus, 
  RotateCcw, 
  Sparkles, 
  ShieldCheck, 
  Scale, 
  LogOut, 
  ArrowLeftRight, 
  Truck, 
  Building2, 
  Filter,
  CheckCheck
} from 'lucide-react';
import { Inmate, PrisonFacility, UserRole, Language } from '../../types';

export type TaskCategory = 'inspections' | 'appointments' | 'approvals' | 'security';
export type TaskPriority = 'urgent' | 'high' | 'routine';

export interface PersistentTask {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  moduleTarget: string;
  inmateId?: string;
  inmateName?: string;
  inmateTab?: 'intake' | 'medical' | 'sentence' | 'stages' | 'court' | 'transfers' | 'human_rights' | 'timeline';
  facilityId?: string;
  facilityName?: string;
  priority: TaskPriority;
  dueText: string;
  assignedRole: string;
  assignedOfficer: string;
  status: 'pending' | 'in_progress' | 'completed';
  actionLabel: string;
  completedAt?: string;
  isCustom?: boolean;
  createdAt: string;
}

interface MyTasksNotificationBellProps {
  inmates: Inmate[];
  facilities: PrisonFacility[];
  currentUserRole: UserRole;
  language: Language;
  onSelectModule: (moduleId: string) => void;
  onSelectInmate?: (inmate: Inmate, initialTab?: any) => void;
}

const STORAGE_KEY = 'odoo_corrections_my_tasks_v1';
const DISMISSED_KEY = 'odoo_corrections_dismissed_tasks_v1';

export const MyTasksNotificationBell: React.FC<MyTasksNotificationBellProps> = ({
  inmates,
  facilities,
  currentUserRole,
  language,
  onSelectModule,
  onSelectInmate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | TaskCategory | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMyRoleOnly, setFilterMyRoleOnly] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<TaskCategory>('inspections');
  const [newPriority, setNewPriority] = useState<TaskPriority>('high');
  const [newDueText, setNewDueText] = useState('Today 17:00');
  const [newTargetModule, setNewTargetModule] = useState('inspections');

  // Baseline seed tasks representing pending operational actions across ERP modules
  const defaultTasks: PersistentTask[] = useMemo(() => [
    // 1. Assigned Inspections & Maintenance
    {
      id: 'task-insp-001',
      title: 'Emergency Bar Integrity Re-Inspection & Weld Certification',
      description: 'Cell C-110 & C-112 window manganese bars weakened by marine salt corrosion. Mandatory engineering re-inspection and anti-corrosion barrier check.',
      category: 'inspections',
      moduleTarget: 'inspections',
      facilityId: 'FAC-03',
      facilityName: 'Shimo La Tewa Medium Security & Remand',
      priority: 'urgent',
      dueText: 'Immediate (Due Today 14:30)',
      assignedRole: 'superintendent',
      assignedOfficer: 'Chief Inspector Evans Mutua / Locksmith',
      status: 'pending',
      actionLabel: 'Open Facility Inspections',
      createdAt: '2026-09-20 08:00'
    },
    {
      id: 'task-insp-002',
      title: 'Mandatory Monthly Structural & Sanitation Sweep',
      description: 'Block B Remand wing communal wash drain hydro-jetting completion review and biological swab sign-off.',
      category: 'inspections',
      moduleTarget: 'inspections',
      facilityId: 'FAC-01',
      facilityName: 'Kamiti National Maximum Security Penitentiary',
      priority: 'high',
      dueText: 'Today 16:00',
      assignedRole: 'superintendent',
      assignedOfficer: 'Inspector Ali Hassan Jr.',
      status: 'pending',
      actionLabel: 'Inspect Block B',
      createdAt: '2026-09-20 09:15'
    },

    // 2. Scheduled Inmate Appointments & Court Escorts
    {
      id: 'task-appt-001',
      title: 'Milimani High Court Escort Convoy #B6-01 Dispatch',
      description: 'Escort team deployment for Inmate Marcus Kiprono (Case #CA-CR-22/2024). Requires armed sentinels, ballistic vehicle B6 check, and biometric check-out.',
      category: 'appointments',
      moduleTarget: 'court_calendar',
      inmateId: 'inm-1',
      inmateName: 'Marcus Kiprono',
      inmateTab: 'court',
      facilityId: 'FAC-01',
      facilityName: 'Kamiti Maximum Security',
      priority: 'urgent',
      dueText: 'Scheduled 09:00 AM',
      assignedRole: 'guard',
      assignedOfficer: 'Sgt. Daniel Kiprop / Armored Convoy Lead',
      status: 'pending',
      actionLabel: 'Open Court Calendar',
      createdAt: '2026-09-20 07:30'
    },
    {
      id: 'task-appt-002',
      title: 'Clinical Follow-up & Chronic Asthma Spirometry',
      description: 'Scheduled medical intake follow-up for Marcus Kiprono. Inhaler dosage titration and pulmonary peak flow review.',
      category: 'appointments',
      moduleTarget: 'inmates',
      inmateId: 'inm-1',
      inmateName: 'Marcus Kiprono',
      inmateTab: 'medical',
      facilityId: 'FAC-01',
      facilityName: 'Kamiti Maximum Security',
      priority: 'high',
      dueText: 'Today 14:00',
      assignedRole: 'medical_officer',
      assignedOfficer: 'Dr. Clara Kamau (Senior Medical Officer)',
      status: 'pending',
      actionLabel: 'Open Clinical Intake Form',
      createdAt: '2026-09-20 09:00'
    },
    {
      id: 'task-appt-003',
      title: 'NITA Vocational Grade II Joinery Practical Trade Exam',
      description: 'Assessment board evaluation for Stage 3 rehabilitated carpenters in the Prison Vocational Workshop.',
      category: 'appointments',
      moduleTarget: 'rehabilitation',
      facilityId: 'FAC-01',
      facilityName: 'Kamiti Maximum Security',
      priority: 'routine',
      dueText: 'Tomorrow 10:00 AM',
      assignedRole: 'records_clerk',
      assignedOfficer: 'Instructor Peter Mwangi / Trade Testing Officer',
      status: 'pending',
      actionLabel: 'View Rehab Enrollments',
      createdAt: '2026-09-20 10:00'
    },

    // 3. Administrative Approvals & Warrants
    {
      id: 'task-appr-001',
      title: 'Superintendent Warrant Authorization: High-Risk Transfer',
      description: 'Inter-facility transfer request from King\'ong\'o Central Remand to Kamiti Maximum Security for security de-escalation.',
      category: 'approvals',
      moduleTarget: 'admissions',
      facilityId: 'FAC-04',
      facilityName: 'King\'ong\'o Central Remand',
      priority: 'urgent',
      dueText: 'Pending Approval (Action Req.)',
      assignedRole: 'superintendent',
      assignedOfficer: 'Superintendent Command Desk',
      status: 'pending',
      actionLabel: 'Authorize Transfer Warrant',
      createdAt: '2026-09-20 08:45'
    },
    {
      id: 'task-appr-002',
      title: 'Sec. 46 Prisons Act Remission Expiry & Discharge Gate Pass',
      description: 'Discharge clearance packet for David Njuguna. Final property vault restitution, gratuity disbursement of KES 3,850, and release deed sign-off.',
      category: 'approvals',
      moduleTarget: 'discharge',
      inmateId: 'inm-3',
      inmateName: 'David Njuguna',
      inmateTab: 'sentence',
      facilityId: 'FAC-01',
      facilityName: 'Kamiti Maximum Security',
      priority: 'high',
      dueText: 'Due by 15:00 Today',
      assignedRole: 'superintendent',
      assignedOfficer: 'Superintendent & Gate Commander',
      status: 'pending',
      actionLabel: 'Review Exit Dossier',
      createdAt: '2026-09-20 09:30'
    },
    {
      id: 'task-appr-003',
      title: 'Digital Shift Command Handover #BRIEF-2026-0919 Sign-Off',
      description: 'Formal digital sign-off of armory ammunition count, security keys custody transfer, and incoming commander acknowledgement.',
      category: 'approvals',
      moduleTarget: 'handover',
      facilityId: 'FAC-01',
      facilityName: 'Kamiti Maximum Security',
      priority: 'high',
      dueText: 'Shift Transition 15:00',
      assignedRole: 'superintendent',
      assignedOfficer: 'Capt. Marcus Vance / Insp. Sarah Aling\'o',
      status: 'pending',
      actionLabel: 'Sign Handover Brief',
      createdAt: '2026-09-20 11:00'
    },
    {
      id: 'task-sec-001',
      title: 'Nelson Mandela Rule 43 Solitary Confinement 7-Day Audit',
      description: 'Mandatory clinical and legal review for segregated inmates exceeding 7 continuous days in administrative separation.',
      category: 'security',
      moduleTarget: 'human_rights',
      facilityId: 'FAC-01',
      facilityName: 'Kamiti Maximum Security',
      priority: 'urgent',
      dueText: 'Statutory 7-Day Limit',
      assignedRole: 'superintendent',
      assignedOfficer: 'Human Rights Ombudsman & Medical Lead',
      status: 'pending',
      actionLabel: 'Audit Segregation Log',
      createdAt: '2026-09-20 11:30'
    }
  ], []);

  // Persistent tasks state
  const [tasks, setTasks] = useState<PersistentTask[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return defaultTasks;
  });

  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(DISMISSED_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // ignore
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissedIds));
    } catch {
      // ignore
    }
  }, [dismissedIds]);

  // Handle outside clicks to close the popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Dynamic enrichment: if any inmate has custodyStatus === 'escaped', add an urgent task
  const escapedInmates = useMemo(() => inmates.filter(i => i.custodyStatus === 'escaped'), [inmates]);
  useEffect(() => {
    if (escapedInmates.length > 0) {
      setTasks(prev => {
        const existingIds = new Set(prev.map(t => t.id));
        const newEscapeTasks: PersistentTask[] = [];

        escapedInmates.forEach(esc => {
          const taskId = `task-escape-${esc.id}`;
          if (!existingIds.has(taskId)) {
            newEscapeTasks.push({
              id: taskId,
              title: `🚨 Active Escape Broadcast: Apprehend ${esc.firstName} ${esc.lastName}`,
              description: `Booking #${esc.bookingNumber} escaped custody. Execute national gazette notice, perimeter containment, and alert nearby police command.`,
              category: 'security',
              moduleTarget: 'admissions',
              inmateId: esc.id,
              inmateName: `${esc.firstName} ${esc.lastName}`,
              facilityId: esc.facilityId,
              facilityName: esc.facilityName,
              priority: 'urgent',
              dueText: 'IMMEDIATE / AT LARGE',
              assignedRole: 'superintendent',
              assignedOfficer: 'National Recapture Taskforce',
              status: 'pending',
              actionLabel: 'Coordinate Recapture',
              createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
            });
          }
        });

        if (newEscapeTasks.length > 0) {
          return [...newEscapeTasks, ...prev];
        }
        return prev;
      });
    }
  }, [escapedInmates]);

  // Toggle complete
  const handleToggleComplete = (taskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const isNowCompleted = task.status !== 'completed';
        return {
          ...task,
          status: isNowCompleted ? 'completed' : 'pending',
          completedAt: isNowCompleted ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined
        };
      }
      return task;
    }));
  };

  // Dismiss task
  const handleDismissTask = (taskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDismissedIds(prev => [...prev, taskId]);
  };

  // Mark all active as completed
  const handleMarkAllDone = () => {
    setTasks(prev => prev.map(task => ({
      ...task,
      status: 'completed',
      completedAt: task.completedAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })));
  };

  // Reset to default tasks
  const handleResetDefaults = () => {
    setTasks(defaultTasks);
    setDismissedIds([]);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(DISMISSED_KEY);
  };

  // Add custom task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: PersistentTask = {
      id: `task-custom-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim() || 'Custom administrative task created from My Tasks panel.',
      category: newCategory,
      moduleTarget: newTargetModule,
      priority: newPriority,
      dueText: newDueText.trim() || 'Today',
      assignedRole: currentUserRole,
      assignedOfficer: 'Current Officer',
      status: 'pending',
      actionLabel: `Open ${newTargetModule.replace('_', ' ').toUpperCase()}`,
      isCustom: true,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    setTasks(prev => [newTask, ...prev]);
    setNewTitle('');
    setNewDesc('');
    setIsAddingTask(false);
  };

  // Jump to module / inmate
  const handleExecuteTask = (task: PersistentTask) => {
    setIsOpen(false);
    if (task.inmateId && onSelectInmate) {
      const inmate = inmates.find(i => i.id === task.inmateId);
      if (inmate) {
        onSelectInmate(inmate, task.inmateTab || 'sentence');
        return;
      }
    }
    if (task.moduleTarget) {
      onSelectModule(task.moduleTarget);
    }
  };

  // Filter tasks
  const visibleTasks = useMemo(() => {
    return tasks.filter(t => !dismissedIds.includes(t.id));
  }, [tasks, dismissedIds]);

  const pendingTasks = useMemo(() => {
    return visibleTasks.filter(t => t.status !== 'completed');
  }, [visibleTasks]);

  const completedTasks = useMemo(() => {
    return visibleTasks.filter(t => t.status === 'completed');
  }, [visibleTasks]);

  const hasUrgent = useMemo(() => {
    return pendingTasks.some(t => t.priority === 'urgent');
  }, [pendingTasks]);

  // Counts by category
  const counts = useMemo(() => {
    return {
      all: pendingTasks.length,
      inspections: pendingTasks.filter(t => t.category === 'inspections').length,
      appointments: pendingTasks.filter(t => t.category === 'appointments').length,
      approvals: pendingTasks.filter(t => t.category === 'approvals').length,
      security: pendingTasks.filter(t => t.category === 'security').length,
      completed: completedTasks.length
    };
  }, [pendingTasks, completedTasks]);

  // Filtered list for display
  const displayedTasks = useMemo(() => {
    let list = visibleTasks;

    // Filter by tab
    if (activeCategory === 'completed') {
      list = completedTasks;
    } else if (activeCategory === 'all') {
      list = pendingTasks;
    } else {
      list = pendingTasks.filter(t => t.category === activeCategory);
    }

    // Role filter
    if (filterMyRoleOnly) {
      list = list.filter(t => t.assignedRole === currentUserRole || t.assignedRole === 'all');
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t => 
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        (t.inmateName && t.inmateName.toLowerCase().includes(q)) ||
        (t.facilityName && t.facilityName.toLowerCase().includes(q)) ||
        t.assignedOfficer.toLowerCase().includes(q)
      );
    }

    // Sort: urgent first, then high, then routine
    const priorityWeight: Record<TaskPriority, number> = { urgent: 3, high: 2, routine: 1 };
    return [...list].sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
    });
  }, [visibleTasks, pendingTasks, completedTasks, activeCategory, filterMyRoleOnly, currentUserRole, searchQuery]);

  return (
    <div className="relative" ref={popoverRef}>
      {/* Persistent Bell Button in Odoo Navbar */}
      <button
        id="odoo-my-tasks-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        className={`p-1.5 rounded relative transition-all duration-150 flex items-center justify-center ${
          isOpen
            ? 'bg-white/25 text-white ring-2 ring-white/40'
            : 'text-white/80 hover:text-white hover:bg-white/10'
        }`}
        title={`My Tasks & Action Items (${pendingTasks.length} pending actions across modules)`}
        aria-label="My Tasks & Pending Actions"
      >
        <Bell className={`w-4 h-4 transition-transform ${hasUrgent && pendingTasks.length > 0 ? 'animate-bounce' : ''}`} />

        {/* Counter Badge */}
        {pendingTasks.length > 0 ? (
          <span className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] font-bold font-mono text-white rounded-full flex items-center justify-center shadow-md border border-white/20 ${
            hasUrgent ? 'bg-rose-600 animate-pulse' : 'bg-amber-500'
          }`}>
            {pendingTasks.length}
          </span>
        ) : (
          <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full ring-1 ring-white/50" />
        )}
      </button>

      {/* Flyout Popover: My Tasks & Pending Actions */}
      {isOpen && (
        <div 
          id="odoo-my-tasks-popover"
          className="absolute right-0 mt-2 w-[390px] sm:w-[460px] max-w-[95vw] bg-white rounded-xl shadow-2xl border border-slate-200 z-50 text-slate-800 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150 select-text"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#714B67] to-[#51354A] text-white p-3.5 flex items-center justify-between border-b border-purple-900/40">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur-xs">
                <ClipboardCheck className="w-4 h-4 text-purple-200" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold tracking-tight text-white leading-none">
                    {language === 'fr' ? 'Mes Tâches & Actions en Attente' : 'My Tasks & Pending Actions'}
                  </h3>
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-white/20 text-white leading-none">
                    {pendingTasks.length} {language === 'fr' ? 'en cours' : 'pending'}
                  </span>
                </div>
                <div className="text-[10px] text-purple-200 mt-0.5 font-mono">
                  odoo.model: mail.activity / corrections.task
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsAddingTask(!isAddingTask)}
                className={`p-1.5 rounded text-xs transition-colors flex items-center gap-1 font-medium ${
                  isAddingTask ? 'bg-white text-[#714B67]' : 'text-purple-100 hover:text-white hover:bg-white/10'
                }`}
                title="Add custom task"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">{isAddingTask ? 'Cancel' : 'Add Task'}</span>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded text-purple-200 hover:text-white hover:bg-white/10 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Add Custom Task Drawer (Inline Form) */}
          {isAddingTask && (
            <form onSubmit={handleCreateTask} className="p-3 bg-purple-50/70 border-b border-purple-100 space-y-2.5">
              <div className="text-xs font-bold text-[#714B67] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Create New Operational Task / Action Item</span>
              </div>
              <input
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g. Verify CCTV feed in Isolation Ward 3..."
                className="w-full text-xs px-2.5 py-1.5 rounded border border-purple-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#714B67]"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as TaskCategory)}
                    className="w-full text-xs px-2 py-1 rounded border border-slate-200 bg-white"
                  >
                    <option value="inspections">Facility Inspection</option>
                    <option value="appointments">Court / Medical Appt</option>
                    <option value="approvals">Administrative Approval</option>
                    <option value="security">Security & Custody</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Priority</label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full text-xs px-2 py-1 rounded border border-slate-200 bg-white"
                  >
                    <option value="urgent">🔴 Urgent / Critical</option>
                    <option value="high">🟠 High Priority</option>
                    <option value="routine">🟢 Routine</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Target Module</label>
                  <select
                    value={newTargetModule}
                    onChange={e => setNewTargetModule(e.target.value)}
                    className="w-full text-xs px-2 py-1 rounded border border-slate-200 bg-white"
                  >
                    <option value="inspections">Facility Inspections</option>
                    <option value="court_calendar">Court Calendar</option>
                    <option value="discharge">Discharge & Exit</option>
                    <option value="admissions">Admissions & Transfers</option>
                    <option value="handover">Shift Handover</option>
                    <option value="inmates">Inmate Records</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">Due Time</label>
                  <input
                    type="text"
                    value={newDueText}
                    onChange={e => setNewDueText(e.target.value)}
                    placeholder="e.g. Today 17:00"
                    className="w-full text-xs px-2 py-1 rounded border border-slate-200 bg-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingTask(false)}
                  className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200/50 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-[#714B67] hover:bg-[#5f3e56] text-white text-xs font-semibold rounded shadow-xs"
                >
                  Save Task
                </button>
              </div>
            </form>
          )}

          {/* Search & Quick Filter Bar */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-200 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={language === 'fr' ? 'Rechercher par titre, détenu, officier...' : 'Search tasks, inmate name, officer or facility...'}
                className="w-full text-xs pl-8 pr-7 py-1.5 rounded-md border border-slate-200 bg-white focus:outline-hidden focus:ring-1 focus:ring-[#714B67]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Pills (Single Line, No Wrap) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-thin">
              <button
                onClick={() => setActiveCategory('all')}
                className={`whitespace-nowrap px-2.5 py-1 rounded-full font-medium transition-colors flex items-center gap-1 border ${
                  activeCategory === 'all'
                    ? 'bg-[#714B67] text-white border-[#714B67] shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{language === 'fr' ? 'Toutes' : 'All Tasks'}</span>
                <span className={`text-[10px] font-bold px-1 rounded-full ${activeCategory === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
                  {counts.all}
                </span>
              </button>

              <button
                onClick={() => setActiveCategory('inspections')}
                className={`whitespace-nowrap px-2.5 py-1 rounded-full font-medium transition-colors flex items-center gap-1 border ${
                  activeCategory === 'inspections'
                    ? 'bg-[#714B67] text-white border-[#714B67] shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <ClipboardCheck className="w-3 h-3 text-emerald-600" />
                <span>{language === 'fr' ? 'Inspections' : 'Inspections'}</span>
                <span className={`text-[10px] font-bold px-1 rounded-full ${activeCategory === 'inspections' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
                  {counts.inspections}
                </span>
              </button>

              <button
                onClick={() => setActiveCategory('appointments')}
                className={`whitespace-nowrap px-2.5 py-1 rounded-full font-medium transition-colors flex items-center gap-1 border ${
                  activeCategory === 'appointments'
                    ? 'bg-[#714B67] text-white border-[#714B67] shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Calendar className="w-3 h-3 text-blue-600" />
                <span>{language === 'fr' ? 'Rendez-vous' : 'Appointments'}</span>
                <span className={`text-[10px] font-bold px-1 rounded-full ${activeCategory === 'appointments' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
                  {counts.appointments}
                </span>
              </button>

              <button
                onClick={() => setActiveCategory('approvals')}
                className={`whitespace-nowrap px-2.5 py-1 rounded-full font-medium transition-colors flex items-center gap-1 border ${
                  activeCategory === 'approvals'
                    ? 'bg-[#714B67] text-white border-[#714B67] shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Scale className="w-3 h-3 text-purple-600" />
                <span>{language === 'fr' ? 'Approbations' : 'Approvals'}</span>
                <span className={`text-[10px] font-bold px-1 rounded-full ${activeCategory === 'approvals' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
                  {counts.approvals}
                </span>
              </button>

              <button
                onClick={() => setActiveCategory('completed')}
                className={`whitespace-nowrap px-2.5 py-1 rounded-full font-medium transition-colors flex items-center gap-1 border ${
                  activeCategory === 'completed'
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>{language === 'fr' ? 'Terminées' : 'Completed'}</span>
                <span className={`text-[10px] font-bold px-1 rounded-full ${activeCategory === 'completed' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
                  {counts.completed}
                </span>
              </button>
            </div>

            {/* Secondary toolbar: Role filter toggle & mark all done */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
              <label className="flex items-center space-x-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filterMyRoleOnly}
                  onChange={e => setFilterMyRoleOnly(e.target.checked)}
                  className="rounded text-[#714B67] focus:ring-[#714B67] w-3 h-3"
                />
                <span className="text-slate-600">
                  {language === 'fr' ? 'Filtrer pour mon rôle uniquement' : 'My Role only'} ({currentUserRole})
                </span>
              </label>

              {pendingTasks.length > 0 && activeCategory !== 'completed' && (
                <button
                  onClick={handleMarkAllDone}
                  className="text-[#714B67] hover:underline font-semibold flex items-center gap-1 text-[11px]"
                >
                  <CheckCheck className="w-3 h-3" />
                  <span>{language === 'fr' ? 'Tout marquer fait' : 'Mark all done'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Task List Body */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 divide-y divide-slate-100">
            {displayedTasks.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500/50 mb-2" />
                <p className="text-xs font-semibold text-slate-700">
                  {activeCategory === 'completed' 
                    ? 'No completed tasks recorded yet.' 
                    : 'All caught up! No pending actions in this category.'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Great operational standing across prison modules.
                </p>
              </div>
            ) : (
              displayedTasks.map((task) => {
                const isCompleted = task.status === 'completed';

                // Category Icon
                let CatIcon = ClipboardCheck;
                let catColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
                if (task.category === 'appointments') {
                  CatIcon = Calendar;
                  catColor = 'text-blue-600 bg-blue-50 border-blue-200';
                } else if (task.category === 'approvals') {
                  CatIcon = Scale;
                  catColor = 'text-purple-600 bg-purple-50 border-purple-200';
                } else if (task.category === 'security') {
                  CatIcon = ShieldAlert;
                  catColor = 'text-rose-600 bg-rose-50 border-rose-200';
                }

                // Priority Badge
                let priorityBadge = (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wide bg-slate-100 text-slate-700 border border-slate-200">
                    Routine
                  </span>
                );
                if (task.priority === 'urgent') {
                  priorityBadge = (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wide bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                      Urgent
                    </span>
                  );
                } else if (task.priority === 'high') {
                  priorityBadge = (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wide bg-amber-100 text-amber-800 border border-amber-200">
                      High
                    </span>
                  );
                }

                return (
                  <div 
                    key={task.id}
                    className={`pt-2.5 first:pt-0 rounded-lg p-2.5 transition-all duration-150 border ${
                      isCompleted 
                        ? 'bg-slate-50/70 border-slate-200/80 opacity-70' 
                        : task.priority === 'urgent'
                        ? 'bg-rose-50/40 border-rose-200/90 shadow-2xs'
                        : 'bg-white border-slate-200 hover:border-[#714B67]/40 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      {/* Checkbox toggle */}
                      <button
                        onClick={(e) => handleToggleComplete(task.id, e)}
                        className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center transition-colors border ${
                          isCompleted
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 hover:border-[#714B67] bg-white'
                        }`}
                        title={isCompleted ? 'Mark as pending' : 'Mark as completed'}
                      >
                        {isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>

                      {/* Main info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <span className={`p-0.5 rounded border ${catColor}`}>
                            <CatIcon className="w-3 h-3" />
                          </span>
                          {priorityBadge}
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                            {task.moduleTarget}
                          </span>
                          {task.dueText && (
                            <span className="text-[10px] text-slate-600 font-medium flex items-center gap-1 ml-auto">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span className={task.priority === 'urgent' && !isCompleted ? 'text-rose-600 font-bold' : ''}>
                                {task.dueText}
                              </span>
                            </span>
                          )}
                        </div>

                        <h4 className={`text-xs font-bold leading-snug ${isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                          {task.title}
                        </h4>

                        <p className="text-[11px] text-slate-600 mt-1 leading-normal line-clamp-2">
                          {task.description}
                        </p>

                        {/* Associated Inmate / Facility Tag */}
                        {(task.inmateName || task.facilityName) && (
                          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500">
                            {task.inmateName && (
                              <span className="inline-flex items-center gap-1 bg-purple-50 text-[#714B67] px-1.5 py-0.5 rounded border border-purple-200 font-semibold">
                                👤 {task.inmateName}
                              </span>
                            )}
                            {task.facilityName && (
                              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                                🏛️ {task.facilityName.split(' ')[0]}
                              </span>
                            )}
                            <span className="text-slate-400">
                              Assigned: {task.assignedOfficer.split(' ')[0]}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Dismiss Action */}
                      <button
                        onClick={(e) => handleDismissTask(task.id, e)}
                        className="text-slate-400 hover:text-slate-600 p-0.5 rounded hover:bg-slate-100 transition-colors"
                        title="Dismiss task"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Operational Action Button */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        {isCompleted && task.completedAt ? `Completed at ${task.completedAt}` : `Logged: ${task.createdAt.slice(5)}`}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleExecuteTask(task)}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded bg-[#714B67] hover:bg-[#5f3e56] text-white transition-colors flex items-center gap-1 shadow-2xs"
                        >
                          <span>{task.actionLabel}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer with summary & persistence reset */}
          <div className="p-2.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-2 font-medium">
              <span className="text-slate-700 font-semibold">{pendingTasks.length} pending</span>
              <span>•</span>
              <span>{completedTasks.length} completed</span>
            </div>

            <button
              onClick={handleResetDefaults}
              className="text-slate-500 hover:text-[#714B67] flex items-center gap-1 transition-colors text-[10px]"
              title="Reset tasks to default operational demo state"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
