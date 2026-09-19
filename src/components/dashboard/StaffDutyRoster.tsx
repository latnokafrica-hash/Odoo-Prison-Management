import React, { useState, useMemo } from 'react';
import { 
  Language, 
  UserRole, 
  StaffDutyAssignment, 
  ShiftType, 
  DutyStatus, 
  OfficerRank, 
  PrisonFacility,
  Inmate
} from '../../types';
import { INITIAL_STAFF_DUTY_ROSTER, SHIFT_CONFIGS } from '../../data/staffDutyData';
import { INITIAL_CELL_BLOCKS } from '../../data/newModuleData';
import { 
  generateShiftBriefingReport, 
  ShiftBriefingReportData 
} from '../../utils/shiftBriefingReport';
import { ShiftBriefingReportModal } from './ShiftBriefingReportModal';
import { 
  Users, 
  Shield, 
  ShieldAlert, 
  Clock, 
  Radio, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Search, 
  Lock, 
  Key, 
  Phone, 
  ArrowLeftRight, 
  Printer, 
  SlidersHorizontal,
  X,
  Edit3,
  Trash2,
  Check,
  FileText,
  ClipboardCheck
} from 'lucide-react';

export { generateShiftBriefingReport };
export type { ShiftBriefingReportData };

interface StaffDutyRosterProps {
  language: Language;
  facilities?: PrisonFacility[];
  inmates?: Inmate[];
  currentUserRole?: UserRole;
  onNavigateToRooms?: () => void;
  onNavigateToHandover?: () => void;
}

export const StaffDutyRoster: React.FC<StaffDutyRosterProps> = ({
  language,
  facilities = [],
  inmates = [],
  currentUserRole = 'superintendent',
  onNavigateToRooms,
  onNavigateToHandover,
}) => {
  // Roster state
  const [roster, setRoster] = useState<StaffDutyAssignment[]>(INITIAL_STAFF_DUTY_ROSTER);
  
  // Filters
  const [selectedShift, setSelectedShift] = useState<ShiftType | 'all'>('morning');
  const [selectedBlockId, setSelectedBlockId] = useState<string>('all');
  const [selectedFacility, setSelectedFacility] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'blocks' | 'table'>('blocks');

  // Interactive Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<StaffDutyAssignment | null>(null);
  const [reassigningOfficer, setReassigningOfficer] = useState<StaffDutyAssignment | null>(null);
  const [musterToastMessage, setMusterToastMessage] = useState<string | null>(null);

  // Printable Shift Briefing Report State
  const [isBriefingModalOpen, setIsBriefingModalOpen] = useState(false);
  const [briefingReport, setBriefingReport] = useState<ShiftBriefingReportData | null>(null);

  // Function to generate the printable Shift Briefing Report
  const handleGenerateShiftBriefingReport = (shiftOverride?: ShiftType) => {
    const shiftToUse = shiftOverride || (selectedShift === 'all' ? 'morning' : selectedShift);
    const reportData = generateShiftBriefingReport({
      shift: shiftToUse,
      facilities,
      inmates,
      roster,
      language,
    });
    setBriefingReport(reportData);
    setIsBriefingModalOpen(true);
  };

  // Form state for assignment modal
  const [formData, setFormData] = useState<Partial<StaffDutyAssignment>>({
    officerName: '',
    badgeNumber: '',
    rank: 'Correctional Officer',
    blockId: INITIAL_CELL_BLOCKS[0]?.id || 'blk-01',
    shift: 'morning',
    roleOnDuty: 'Tier Floor Sentinel',
    dutyStatus: 'on_duty',
    isArmed: false,
    weaponType: 'Unarmed (Baton & Comms)',
    radioCallSign: 'PATROL-1',
    contactExtension: 'Ext. 200',
    specialization: 'General Floor Control',
    notes: '',
  });

  // Reassign modal state
  const [targetBlockId, setTargetBlockId] = useState<string>('');

  // Handle shift roll call muster execution
  const handleExecuteMuster = () => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setRoster(prev => 
      prev.map(item => {
        if (selectedShift === 'all' || item.shift === selectedShift) {
          return {
            ...item,
            dutyStatus: 'on_duty',
            musterCheckInTime: `${timestamp} Verified`,
          };
        }
        return item;
      })
    );

    const shiftName = selectedShift === 'all' ? 'All Active Shifts' : SHIFT_CONFIGS.find(s => s.id === selectedShift)?.name;
    const msg = language === 'fr'
      ? `Appel d'effectifs validé pour ${shiftName} : Tous les officiers de poste sont confirmés présents.`
      : `Muster Roll Call executed for ${shiftName}: All assigned post sentinels verified present.`;
    
    setMusterToastMessage(msg);
    setTimeout(() => setMusterToastMessage(null), 5000);
  };

  // Quick cycle duty status
  const handleCycleStatus = (id: string) => {
    const statuses: DutyStatus[] = ['on_duty', 'on_break', 'standby', 'off_duty'];
    setRoster(prev => prev.map(item => {
      if (item.id === id) {
        const nextIndex = (statuses.indexOf(item.dutyStatus) + 1) % statuses.length;
        return { ...item, dutyStatus: statuses[nextIndex] };
      }
      return item;
    }));
  };

  // Delete assignment
  const handleDeleteAssignment = (id: string) => {
    if (window.confirm(language === 'fr' ? 'Retirer cet officier de la grille de garde ?' : 'Remove this officer assignment from the duty roster?')) {
      setRoster(prev => prev.filter(item => item.id !== id));
    }
  };

  // Open Edit modal
  const handleOpenEdit = (item: StaffDutyAssignment) => {
    setEditingAssignment(item);
    setFormData({ ...item });
    setIsAssignModalOpen(true);
  };

  // Save Assignment
  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.officerName || !formData.badgeNumber) return;

    const block = INITIAL_CELL_BLOCKS.find(b => b.id === formData.blockId) || INITIAL_CELL_BLOCKS[0];
    const shiftCfg = SHIFT_CONFIGS.find(s => s.id === formData.shift) || SHIFT_CONFIGS[0];

    if (editingAssignment) {
      // Update existing
      setRoster(prev => prev.map(item => {
        if (item.id === editingAssignment.id) {
          return {
            ...item,
            ...formData,
            blockName: block.name,
            facilityId: block.facilityId,
            facilityName: block.facilityName,
            shiftHours: shiftCfg.hours,
          } as StaffDutyAssignment;
        }
        return item;
      }));
    } else {
      // Create new
      const newAssignment: StaffDutyAssignment = {
        id: `duty-${Date.now()}`,
        officerId: `off-${Date.now()}`,
        badgeNumber: formData.badgeNumber || `KP-${Math.floor(1000 + Math.random() * 9000)}`,
        officerName: formData.officerName || 'Officer',
        rank: (formData.rank as OfficerRank) || 'Correctional Officer',
        facilityId: block.facilityId,
        facilityName: block.facilityName,
        blockId: block.id,
        blockName: block.name,
        shift: formData.shift || 'morning',
        shiftHours: shiftCfg.hours,
        roleOnDuty: formData.roleOnDuty || 'Tier Sentinel',
        dutyStatus: (formData.dutyStatus as DutyStatus) || 'on_duty',
        isArmed: !!formData.isArmed,
        weaponType: formData.isArmed ? (formData.weaponType || 'Sidearm 9mm') : 'Unarmed (Baton & Comms)',
        radioCallSign: formData.radioCallSign || 'PATROL-UNIT',
        contactExtension: formData.contactExtension || 'Ext. 200',
        musterCheckInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        specialization: formData.specialization || 'Standard Floor Duty',
        notes: formData.notes || '',
        avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 9999999)}?w=150&auto=format&fit=crop&q=80`
      };
      setRoster(prev => [newAssignment, ...prev]);
    }

    setIsAssignModalOpen(false);
    setEditingAssignment(null);
  };

  // Reassign to another block
  const handleExecuteReassign = () => {
    if (!reassigningOfficer || !targetBlockId) return;
    const targetBlock = INITIAL_CELL_BLOCKS.find(b => b.id === targetBlockId);
    if (!targetBlock) return;

    setRoster(prev => prev.map(item => {
      if (item.id === reassigningOfficer.id) {
        return {
          ...item,
          blockId: targetBlock.id,
          blockName: targetBlock.name,
          facilityId: targetBlock.facilityId,
          facilityName: targetBlock.facilityName,
          notes: `${item.notes || ''} [Reassigned from ${item.blockName} by Superintendent on ${new Date().toLocaleTimeString()}]`.trim(),
        };
      }
      return item;
    }));

    setReassigningOfficer(null);
    setTargetBlockId('');
  };

  // Print Roster
  const handlePrintRoster = () => {
    window.print();
  };

  // Filtered Roster
  const filteredRoster = useMemo(() => {
    return roster.filter(item => {
      // Shift filter
      if (selectedShift !== 'all' && item.shift !== selectedShift) return false;
      // Block filter
      if (selectedBlockId !== 'all' && item.blockId !== selectedBlockId) return false;
      // Facility filter
      if (selectedFacility !== 'all' && item.facilityId !== selectedFacility) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.officerName.toLowerCase().includes(q);
        const matchesBadge = item.badgeNumber.toLowerCase().includes(q);
        const matchesRadio = item.radioCallSign.toLowerCase().includes(q);
        const matchesRole = item.roleOnDuty.toLowerCase().includes(q);
        if (!matchesName && !matchesBadge && !matchesRadio && !matchesRole) return false;
      }
      return true;
    });
  }, [roster, selectedShift, selectedBlockId, selectedFacility, searchQuery]);

  // Overall Statistics for Superintendent Quick Reference
  const totalOfficersOnDuty = roster.filter(r => r.dutyStatus === 'on_duty').length;
  const totalArmedGuards = roster.filter(r => r.isArmed && r.dutyStatus === 'on_duty').length;
  const totalStandbyGuards = roster.filter(r => r.dutyStatus === 'standby').length;
  
  // Calculate block coverage for the active shift
  const currentShiftForStats = selectedShift === 'all' ? 'morning' : selectedShift;
  const shiftRoster = roster.filter(r => r.shift === currentShiftForStats && r.dutyStatus === 'on_duty');

  // Block requirements summary
  const blockStats = INITIAL_CELL_BLOCKS.map(block => {
    const assignedOfficers = shiftRoster.filter(r => r.blockId === block.id);
    const minRequired = block.blockType === 'high_security' ? 3 : block.blockType === 'remand_wing' ? 3 : 2;
    const isUnderstaffed = assignedOfficers.length < minRequired;
    const ratio = assignedOfficers.length > 0 
      ? (block.currentOccupancy / assignedOfficers.length).toFixed(1) 
      : 'N/A';

    return {
      block,
      assignedOfficers,
      minRequired,
      isUnderstaffed,
      ratio,
    };
  });

  const understaffedBlocksCount = blockStats.filter(b => b.isUnderstaffed).length;

  return (
    <div id="staff-duty-roster-root" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
      {/* 1. Executive Header Banner with Odoo ERP Styling */}
      <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-[#3d2737] to-slate-900 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-purple-500/30 text-purple-200 border border-purple-400/30 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-300" />
                {language === 'fr' ? 'Poste de Commandement' : 'Command Post'} • Odoo 19 HR Guard Roster
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {language === 'fr' ? 'Quart Actif : Matin (06:00 - 14:00)' : 'Live Active Shift: Morning (06:00 - 14:00)'}
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-300" />
              <span>
                {language === 'fr' 
                  ? 'Tableau de Garde des Officiers & Sentinelles de Quartiers' 
                  : 'Staff Duty Roster & Cell Block Post Assignments'}
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {language === 'fr'
                ? 'Suivi tactique des gardiens en poste par quartier cellulaire, contrôle des armes de dotation, effectifs minimaux de sécurité et appels nominatifs (Muster Call) pour la direction pénitentiaire.'
                : 'Superintendent quick-reference board: Live oversight of correctional officers assigned per cell wing, armed armory allocations, statutory minimum staffing thresholds, and muster roll-call verification.'}
            </p>
          </div>

          {/* Superintendent Quick Command Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExecuteMuster}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
              title={language === 'fr' ? 'Exécuter l\'appel nominatif du quart' : 'Execute shift muster roll call check'}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{language === 'fr' ? 'Lancer Appel / Muster' : 'Execute Muster Roll Call'}</span>
            </button>

            <button
              onClick={() => {
                setEditingAssignment(null);
                setFormData({
                  officerName: '',
                  badgeNumber: `KP-${Math.floor(1000 + Math.random() * 9000)}`,
                  rank: 'Correctional Officer',
                  blockId: INITIAL_CELL_BLOCKS[0]?.id || 'blk-01',
                  shift: selectedShift === 'all' ? 'morning' : selectedShift,
                  roleOnDuty: 'Tier Floor Sentinel',
                  dutyStatus: 'on_duty',
                  isArmed: false,
                  weaponType: 'Unarmed (Baton & Comms)',
                  radioCallSign: 'ALPHA-PATROL',
                  contactExtension: 'Ext. 200',
                  specialization: 'General Custody Oversight',
                  notes: '',
                });
                setIsAssignModalOpen(true);
              }}
              className="px-3.5 py-2 bg-[#714B67] hover:bg-[#85597a] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'fr' ? '+ Assigner un Officier' : '+ Assign Officer'}</span>
            </button>

            <button
              onClick={() => handleGenerateShiftBriefingReport()}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 border border-amber-500/40"
              title={language === 'fr' ? 'Générer le rapport de briefing de quart imprimable' : 'Generate Printable Shift Briefing Report'}
            >
              <FileText className="w-4 h-4 text-amber-200" />
              <span>{language === 'fr' ? 'Briefing de Quart' : 'Shift Briefing Report'}</span>
            </button>

            <button
              onClick={() => handleGenerateShiftBriefingReport()}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
              title={language === 'fr' ? 'Imprimer le briefing ou la garde' : 'Print Shift Briefing Sheet'}
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'fr' ? 'Imprimer Briefing' : 'Print Briefing'}</span>
            </button>

            {onNavigateToHandover && (
              <button
                onClick={onNavigateToHandover}
                className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 border border-indigo-500/40"
                title={language === 'fr' ? 'Passation de quart, signatures numériques et contrôle de l\'armurerie' : 'Open Shift Handover Brief & Digital Sign-Off Module'}
              >
                <ClipboardCheck className="w-4 h-4 text-indigo-200" />
                <span>{language === 'fr' ? 'Passation de Quart' : 'Shift Handover Brief'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Muster Toast Alert Banner */}
        {musterToastMessage && (
          <div className="mt-3 p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-lg text-xs text-emerald-100 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">{musterToastMessage}</span>
            </div>
            <button onClick={() => setMusterToastMessage(null)} className="text-emerald-300 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 2. Superintendent Metric Badges Ribbon */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Metric 1: Total Officers On Duty */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {language === 'fr' ? 'Sentinelles en Poste' : 'Officers on Duty'}
            </span>
            <div className="text-xl font-bold text-slate-900 mt-0.5 flex items-baseline gap-1.5">
              <span>{totalOfficersOnDuty}</span>
              <span className="text-xs text-slate-400 font-normal">/ {roster.length} {language === 'fr' ? 'inscrits' : 'enrolled'}</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: Mandatory Block Manning Status */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {language === 'fr' ? 'Couverture des Quartiers' : 'Wing Coverage'}
            </span>
            <div className="text-xl font-bold mt-0.5 flex items-baseline gap-1.5">
              {understaffedBlocksCount === 0 ? (
                <span className="text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  100% {language === 'fr' ? 'Couvert' : 'Manned'}
                </span>
              ) : (
                <span className="text-rose-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  {understaffedBlocksCount} {language === 'fr' ? 'Sous-effectif' : 'Understaffed'}
                </span>
              )}
            </div>
          </div>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${understaffedBlocksCount === 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Armed Tactical Sentinels */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {language === 'fr' ? 'Postes Armés d\'Appui' : 'Armed Sentinels'}
            </span>
            <div className="text-xl font-bold text-slate-900 mt-0.5 flex items-baseline gap-1.5">
              <span>{totalArmedGuards}</span>
              <span className="text-xs text-purple-700 font-medium">{language === 'fr' ? 'dotations actives' : 'sidearms issued'}</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4: Tactical Standby / Relief */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {language === 'fr' ? 'Réserve d\'Urgence' : 'Standby / Relief'}
            </span>
            <div className="text-xl font-bold text-slate-900 mt-0.5 flex items-baseline gap-1.5">
              <span>{totalStandbyGuards}</span>
              <span className="text-xs text-blue-600 font-medium">{language === 'fr' ? 'prêts à intervenir' : 'ready for muster'}</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Radio className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Controls & Filter Bar: Shift Tabs, Block Selector, Search, View Mode */}
      <div className="p-4 border-b border-slate-200 space-y-3">
        {/* Shift Selection Pills */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {language === 'fr' ? 'Quart de Garde :' : 'Guard Shift:'}
            </span>

            <button
              onClick={() => setSelectedShift('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedShift === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {language === 'fr' ? 'Tous les Quarts' : 'All Shifts'} ({roster.length})
            </button>

            {SHIFT_CONFIGS.map(shift => {
              const count = roster.filter(r => r.shift === shift.id).length;
              const isSelected = selectedShift === shift.id;
              return (
                <button
                  key={shift.id}
                  onClick={() => setSelectedShift(shift.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-[#714B67] text-white border-[#714B67] shadow-2xs'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {shift.activeNow && (
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-300' : 'bg-emerald-500'} animate-pulse`} />
                  )}
                  <span>{language === 'fr' ? shift.nameFr : shift.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-100">
            <button
              onClick={() => setViewMode('blocks')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                viewMode === 'blocks'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{language === 'fr' ? 'Vue Bâtiments' : 'Block Wing View'}</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{language === 'fr' ? 'Grille Matricule' : 'Table Roster'}</span>
            </button>
          </div>
        </div>

        {/* Secondary Filter Row: Facility, Block, Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            {/* Cell Block Dropdown */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-medium text-slate-500">{language === 'fr' ? 'Quartier :' : 'Wing:'}</span>
              <select
                value={selectedBlockId}
                onChange={e => setSelectedBlockId(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-[#714B67]"
              >
                <option value="all">{language === 'fr' ? 'Tous les Quartiers' : 'All Cell Blocks'}</option>
                {INITIAL_CELL_BLOCKS.map(blk => (
                  <option key={blk.id} value={blk.id}>{blk.name} ({blk.code})</option>
                ))}
              </select>
            </div>

            {/* Facility Dropdown */}
            {facilities.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-medium text-slate-500">{language === 'fr' ? 'Prison :' : 'Facility:'}</span>
                <select
                  value={selectedFacility}
                  onChange={e => setSelectedFacility(e.target.value)}
                  className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-[#714B67]"
                >
                  <option value="all">{language === 'fr' ? 'Toutes les Prisons' : 'All Facilities'}</option>
                  {facilities.map(fac => (
                    <option key={fac.id} value={fac.id}>{fac.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={language === 'fr' ? 'Nom d\'officier, matricule, indicatif radio...' : 'Officer name, badge #, radio callsign...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#714B67]"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. MAIN CONTENT VIEW: Mode 'blocks' vs Mode 'table' */}
      {viewMode === 'blocks' ? (
        <div className="p-5 space-y-6">
          {/* Loop over Cell Blocks */}
          {INITIAL_CELL_BLOCKS
            .filter(b => selectedBlockId === 'all' || b.id === selectedBlockId)
            .map(block => {
              // Get assigned officers for this block under current filter
              const officersInBlock = filteredRoster.filter(r => r.blockId === block.id);
              const minStaffRequired = block.blockType === 'high_security' ? 3 : block.blockType === 'remand_wing' ? 3 : 2;
              const isShortStaffed = officersInBlock.filter(o => o.dutyStatus === 'on_duty').length < minStaffRequired;
              const ratio = officersInBlock.length > 0 
                ? (block.currentOccupancy / officersInBlock.length).toFixed(1) 
                : 'N/A';

              return (
                <div 
                  key={block.id}
                  className={`rounded-xl border transition-all ${
                    isShortStaffed && selectedShift !== 'standby'
                      ? 'border-rose-300 bg-rose-50/20 shadow-xs' 
                      : 'border-slate-200 bg-white shadow-2xs'
                  }`}
                >
                  {/* Block Header Card */}
                  <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/70 rounded-t-xl">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                          {block.code}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900">
                          {block.name}
                        </h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          block.blockType === 'high_security'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : block.blockType === 'remand_wing'
                              ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {block.blockType.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                        <span>{block.facilityName}</span>
                        <span>•</span>
                        <span>{language === 'fr' ? 'Superviseur Titulaire :' : 'Nominal Supervisor:'} <strong>{block.supervisor}</strong></span>
                      </p>
                    </div>

                    {/* Right Block Metrics: Manning level & Inmate/Staff Ratio */}
                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Manning Requirement Tag */}
                      <div className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 ${
                        isShortStaffed && selectedShift !== 'standby'
                          ? 'bg-rose-100 text-rose-800 border-rose-300 font-bold animate-pulse'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                      }`}>
                        {isShortStaffed && selectedShift !== 'standby' ? (
                          <>
                            <ShieldAlert className="w-4 h-4 text-rose-600" />
                            <span>
                              {language === 'fr' ? 'SOUS-EFFECTIF' : 'UNDERSTAFFED'} : {officersInBlock.filter(o => o.dutyStatus === 'on_duty').length} / {minStaffRequired} {language === 'fr' ? 'requis' : 'required'}
                            </span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>
                              {language === 'fr' ? 'Effectif Conforme' : 'Optimal Manning'} ({officersInBlock.filter(o => o.dutyStatus === 'on_duty').length} / {minStaffRequired})
                            </span>
                          </>
                        )}
                      </div>

                      {/* Inmate Ratio */}
                      <div className="bg-white border border-slate-200 px-3 py-1 rounded-lg text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                          {language === 'fr' ? 'Ratio Détenu / Gardien' : 'Inmate-to-Staff Ratio'}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {ratio} : 1 ({block.currentOccupancy} {language === 'fr' ? 'détenus' : 'inmates'})
                        </span>
                      </div>

                      {/* Add Officer to this Block Button */}
                      <button
                        onClick={() => {
                          setEditingAssignment(null);
                          setFormData({
                            officerName: '',
                            badgeNumber: `KP-${Math.floor(1000 + Math.random() * 9000)}`,
                            rank: 'Correctional Officer',
                            blockId: block.id,
                            shift: selectedShift === 'all' ? 'morning' : selectedShift,
                            roleOnDuty: 'Tier Floor Sentinel',
                            dutyStatus: 'on_duty',
                            isArmed: false,
                            weaponType: 'Unarmed (Baton & Comms)',
                            radioCallSign: `${block.code}-POST`,
                            contactExtension: 'Ext. 200',
                            specialization: 'Floor Control',
                            notes: '',
                          });
                          setIsAssignModalOpen(true);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-slate-50 text-[#714B67] border border-[#714B67]/30 rounded-lg flex items-center gap-1 transition-colors"
                        title="Add officer to this wing"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{language === 'fr' ? 'Ajouter' : 'Add Post'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Officers Grid inside this Block */}
                  <div className="p-4">
                    {officersInBlock.length === 0 ? (
                      <div className="p-6 text-center bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                        <Users className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                        <p className="text-xs font-medium text-slate-600">
                          {language === 'fr' 
                            ? 'Aucun officier assigné à ce quartier cellulaire pour le quart sélectionné.' 
                            : 'No officers currently assigned to this cell block for the active selection.'}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {language === 'fr' 
                            ? 'Cliquez sur "+ Ajouter" pour déployer un gardien ou changez de quart.' 
                            : 'Click "+ Add Post" to schedule a guard or switch shift filter.'}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                        {officersInBlock.map(officer => {
                          const isLead = officer.roleOnDuty.toLowerCase().includes('supervisor') || officer.roleOnDuty.toLowerCase().includes('lead') || officer.roleOnDuty.toLowerCase().includes('chief');
                          return (
                            <div 
                              key={officer.id}
                              className={`p-3.5 rounded-xl border transition-all hover:shadow-sm bg-white relative ${
                                officer.dutyStatus === 'on_duty'
                                  ? 'border-slate-200'
                                  : officer.dutyStatus === 'on_break'
                                    ? 'border-amber-200 bg-amber-50/10'
                                    : 'border-slate-200 bg-slate-50/50 opacity-80'
                              }`}
                            >
                              {/* Officer Top Line */}
                              <div className="flex items-start gap-3">
                                <img
                                  src={officer.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                                  alt={officer.officerName}
                                  className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0"
                                  onError={e => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <h4 className="text-xs font-bold text-slate-900 truncate">
                                      {officer.officerName}
                                    </h4>
                                    <span className="text-[10px] font-mono font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                      {officer.badgeNumber}
                                    </span>
                                  </div>

                                  <div className="text-[11px] text-[#714B67] font-semibold truncate mt-0.5">
                                    {officer.rank}
                                  </div>

                                  <div className="text-xs font-medium text-slate-700 flex items-center gap-1 mt-1">
                                    {isLead ? (
                                      <Key className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                    ) : (
                                      <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    )}
                                    <span className="truncate">{officer.roleOnDuty}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Details Tag Cloud */}
                              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap text-[11px]">
                                {/* Radio & Extension */}
                                <div className="flex items-center gap-1 text-slate-600 font-mono">
                                  <Radio className="w-3 h-3 text-indigo-500" />
                                  <span>{officer.radioCallSign}</span>
                                  <span className="text-slate-300">•</span>
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <span>{officer.contactExtension}</span>
                                </div>

                                {/* Armed / Armory Status */}
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                                  officer.isArmed
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-slate-100 text-slate-600'
                                }`}>
                                  <Lock className="w-2.5 h-2.5" />
                                  <span>{officer.isArmed ? (language === 'fr' ? 'Armé' : 'Armed (9mm)') : (language === 'fr' ? 'Non-armé' : 'Unarmed')}</span>
                                </span>
                              </div>

                              {/* Muster check-in stamp */}
                              {officer.musterCheckInTime && (
                                <div className="mt-1.5 text-[10px] text-slate-400 flex items-center justify-between">
                                  <span>{language === 'fr' ? 'Pointage :' : 'Muster Check-in :'} <strong className="text-slate-600 font-mono">{officer.musterCheckInTime}</strong></span>
                                  <span className="capitalize text-slate-500 font-medium">
                                    {officer.shift} ({officer.shiftHours})
                                  </span>
                                </div>
                              )}

                              {/* Interactive Action Ribbon */}
                              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                                {/* Clickable Duty Status Pill */}
                                <button
                                  onClick={() => handleCycleStatus(officer.id)}
                                  className={`px-2 py-1 rounded text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                                    officer.dutyStatus === 'on_duty'
                                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                      : officer.dutyStatus === 'on_break'
                                        ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                        : officer.dutyStatus === 'standby'
                                          ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                  }`}
                                  title="Click to cycle duty status (On Duty / Break / Standby / Off Duty)"
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    officer.dutyStatus === 'on_duty' ? 'bg-emerald-600' : 'bg-current'
                                  }`} />
                                  <span className="capitalize">{officer.dutyStatus.replace(/_/g, ' ')}</span>
                                </button>

                                {/* Action Buttons: Reassign, Edit, Delete */}
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => {
                                      setReassigningOfficer(officer);
                                      setTargetBlockId(officer.blockId);
                                    }}
                                    className="p-1 rounded text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                    title={language === 'fr' ? 'Transférer de quartier' : 'Quick Reassign Cell Block'}
                                  >
                                    <ArrowLeftRight className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => handleOpenEdit(officer)}
                                    className="p-1 rounded text-slate-500 hover:text-[#714B67] hover:bg-purple-50 transition-colors"
                                    title={language === 'fr' ? 'Modifier l\'assignation' : 'Edit Post Details'}
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => handleDeleteAssignment(officer.id)}
                                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                    title={language === 'fr' ? 'Supprimer' : 'Remove from Post'}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        /* 5. TABULAR / MATRIX ROSTER VIEW */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">{language === 'fr' ? 'Officier & Matricule' : 'Officer & Badge'}</th>
                <th className="py-3 px-3">{language === 'fr' ? 'Grade' : 'Rank'}</th>
                <th className="py-3 px-3">{language === 'fr' ? 'Quartier Cellulaire' : 'Cell Block'}</th>
                <th className="py-3 px-3">{language === 'fr' ? 'Poste Assigné' : 'Duty Post'}</th>
                <th className="py-3 px-3">{language === 'fr' ? 'Quart & Horaires' : 'Shift'}</th>
                <th className="py-3 px-3">{language === 'fr' ? 'Armement' : 'Armory Status'}</th>
                <th className="py-3 px-3">{language === 'fr' ? 'Radio & Ext' : 'Comms'}</th>
                <th className="py-3 px-3">{language === 'fr' ? 'Statut' : 'Status'}</th>
                <th className="py-3 px-4 text-right">{language === 'fr' ? 'Actions' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRoster.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  {/* Officer Info */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={item.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                        alt={item.officerName}
                        className="w-8 h-8 rounded-md object-cover border border-slate-200 shrink-0"
                        onError={e => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                      <div>
                        <div className="font-bold text-slate-900">{item.officerName}</div>
                        <div className="text-[11px] font-mono text-slate-500">{item.badgeNumber}</div>
                      </div>
                    </div>
                  </td>

                  {/* Rank */}
                  <td className="py-3 px-3 font-semibold text-[#714B67]">
                    {item.rank}
                  </td>

                  {/* Cell Block */}
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-800">{item.blockName}</div>
                    <div className="text-[10px] text-slate-500">{item.facilityName}</div>
                  </td>

                  {/* Duty Post */}
                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-800 flex items-center gap-1">
                      <Shield className="w-3 h-3 text-slate-400" />
                      <span>{item.roleOnDuty}</span>
                    </div>
                    {item.specialization && (
                      <div className="text-[10px] text-slate-500">{item.specialization}</div>
                    )}
                  </td>

                  {/* Shift */}
                  <td className="py-3 px-3">
                    <span className="capitalize font-semibold text-slate-700 block">{item.shift}</span>
                    <span className="text-[10px] font-mono text-slate-500">{item.shiftHours}</span>
                  </td>

                  {/* Armory */}
                  <td className="py-3 px-3">
                    {item.isArmed ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <Lock className="w-2.5 h-2.5" />
                        <span>Armed</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500">Unarmed</span>
                    )}
                  </td>

                  {/* Radio & Comms */}
                  <td className="py-3 px-3 font-mono text-[11px]">
                    <div className="text-indigo-700 font-bold">{item.radioCallSign}</div>
                    <div className="text-slate-400 text-[10px]">{item.contactExtension}</div>
                  </td>

                  {/* Status Toggle */}
                  <td className="py-3 px-3">
                    <button
                      onClick={() => handleCycleStatus(item.id)}
                      className={`px-2 py-1 rounded text-[11px] font-semibold transition-all capitalize ${
                        item.dutyStatus === 'on_duty'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.dutyStatus === 'on_break'
                            ? 'bg-amber-100 text-amber-800'
                            : item.dutyStatus === 'standby'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-200 text-slate-700'
                      }`}
                      title="Click to cycle status"
                    >
                      {item.dutyStatus.replace(/_/g, ' ')}
                    </button>
                  </td>

                  {/* Action buttons */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setReassigningOfficer(item);
                          setTargetBlockId(item.blockId);
                        }}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                        title={language === 'fr' ? 'Changer de quartier' : 'Reassign Block'}
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-slate-500 hover:text-[#714B67] hover:bg-purple-50 rounded"
                        title="Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAssignment(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 6. MODAL: Create / Edit Staff Duty Assignment */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#714B67]" />
                <h3 className="font-bold text-slate-900 text-sm">
                  {editingAssignment 
                    ? (language === 'fr' ? 'Modifier l\'Assignation de Garde' : 'Edit Officer Shift Assignment')
                    : (language === 'fr' ? 'Nouvelle Assignation au Tableau de Garde' : 'Assign Officer to Cell Block Shift')}
                </h3>
              </div>
              <button 
                onClick={() => setIsAssignModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAssignment} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                {/* Officer Name */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {language === 'fr' ? 'Nom de l\'Officier' : 'Officer Full Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.officerName || ''}
                    onChange={e => setFormData({ ...formData, officerName: e.target.value })}
                    placeholder="e.g. Sgt. Daniel Kiprop"
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#714B67]"
                  />
                </div>

                {/* Badge Number */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {language === 'fr' ? 'Matricule de Service' : 'Service Badge Number'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.badgeNumber || ''}
                    onChange={e => setFormData({ ...formData, badgeNumber: e.target.value })}
                    placeholder="KP-8421"
                    className="w-full p-2 font-mono bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#714B67]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Rank */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {language === 'fr' ? 'Grade Militaire / Pénitentiaire' : 'Officer Rank'}
                  </label>
                  <select
                    value={formData.rank || 'Correctional Officer'}
                    onChange={e => setFormData({ ...formData, rank: e.target.value as OfficerRank })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#714B67]"
                  >
                    <option value="Chief Inspector">Chief Inspector</option>
                    <option value="Inspector">Inspector</option>
                    <option value="Senior Sergeant">Senior Sergeant</option>
                    <option value="Sergeant">Sergeant</option>
                    <option value="Corporal">Corporal</option>
                    <option value="Correctional Officer">Correctional Officer</option>
                    <option value="Tactical Specialist">Tactical Specialist</option>
                  </select>
                </div>

                {/* Cell Block Target */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {language === 'fr' ? 'Quartier Cellulaire Déployé' : 'Assigned Cell Block'} *
                  </label>
                  <select
                    value={formData.blockId || ''}
                    onChange={e => setFormData({ ...formData, blockId: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#714B67]"
                  >
                    {INITIAL_CELL_BLOCKS.map(blk => (
                      <option key={blk.id} value={blk.id}>{blk.name} ({blk.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Shift */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {language === 'fr' ? 'Quart de Service' : 'Assigned Shift'}
                  </label>
                  <select
                    value={formData.shift || 'morning'}
                    onChange={e => setFormData({ ...formData, shift: e.target.value as ShiftType })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#714B67]"
                  >
                    <option value="morning">Morning Watch (06:00 - 14:00)</option>
                    <option value="afternoon">Afternoon / Swing (14:00 - 22:00)</option>
                    <option value="night">Night / Vigilance (22:00 - 06:00)</option>
                    <option value="standby">Tactical Standby & Relief</option>
                  </select>
                </div>

                {/* Duty Status */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {language === 'fr' ? 'Statut Opérationnel' : 'Operational Status'}
                  </label>
                  <select
                    value={formData.dutyStatus || 'on_duty'}
                    onChange={e => setFormData({ ...formData, dutyStatus: e.target.value as DutyStatus })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#714B67]"
                  >
                    <option value="on_duty">On Duty (Active on Post)</option>
                    <option value="on_break">On Break / Relief</option>
                    <option value="standby">Standby / Reserve</option>
                    <option value="off_duty">Off Duty</option>
                  </select>
                </div>
              </div>

              {/* Role on Duty */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {language === 'fr' ? 'Poste / Mission Spécifique' : 'Specific Post Role & Assignment'}
                </label>
                <input
                  type="text"
                  value={formData.roleOnDuty || ''}
                  onChange={e => setFormData({ ...formData, roleOnDuty: e.target.value })}
                  placeholder="e.g. Tier 1 Floor Sentinel / Control Room Console"
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#714B67]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Radio Callsign */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {language === 'fr' ? 'Indicatif Radio Comms' : 'Radio Callsign'}
                  </label>
                  <input
                    type="text"
                    value={formData.radioCallSign || ''}
                    onChange={e => setFormData({ ...formData, radioCallSign: e.target.value })}
                    placeholder="ALPHA-PATROL"
                    className="w-full p-2 font-mono bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#714B67]"
                  />
                </div>

                {/* Contact Extension */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {language === 'fr' ? 'Poste Interphone' : 'Intercom Extension'}
                  </label>
                  <input
                    type="text"
                    value={formData.contactExtension || ''}
                    onChange={e => setFormData({ ...formData, contactExtension: e.target.value })}
                    placeholder="Ext. 201"
                    className="w-full p-2 font-mono bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#714B67]"
                  />
                </div>
              </div>

              {/* Armed status toggle */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={!!formData.isArmed}
                    onChange={e => setFormData({ ...formData, isArmed: e.target.checked })}
                    className="rounded text-[#714B67] focus:ring-[#714B67]"
                  />
                  <span>{language === 'fr' ? 'Dotation Armée (Armurerie Centrale)' : 'Armed Sentinel (Central Armory Requisition)'}</span>
                </label>

                {formData.isArmed && (
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-0.5">
                      {language === 'fr' ? 'Type d\'armement doté' : 'Issued Firearm / Less-Lethal Model'}
                    </label>
                    <input
                      type="text"
                      value={formData.weaponType || ''}
                      onChange={e => setFormData({ ...formData, weaponType: e.target.value })}
                      placeholder="e.g. Sidearm 9mm Beretta / Non-Lethal Beanbag"
                      className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800"
                    />
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-[#714B67] hover:bg-[#85597a] text-white rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{language === 'fr' ? 'Enregistrer l\'Assignation' : 'Save Assignment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL: Quick Reassign Officer to Cell Block */}
      {reassigningOfficer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  {language === 'fr' ? 'Redéploiement d\'Urgence de Poste' : 'Reassign Officer to Cell Block'}
                </h3>
              </div>
              <button 
                onClick={() => setReassigningOfficer(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-950">
                <p className="font-semibold text-xs">
                  {reassigningOfficer.officerName} ({reassigningOfficer.rank})
                </p>
                <p className="text-[11px] text-indigo-700 mt-0.5">
                  {language === 'fr' ? 'Affectation actuelle :' : 'Current Wing :'} <strong>{reassigningOfficer.blockName}</strong>
                </p>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">
                  {language === 'fr' ? 'Sélectionnez le nouveau quartier cellulaire cible :' : 'Select destination cell block :'}
                </label>
                <select
                  value={targetBlockId}
                  onChange={e => setTargetBlockId(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-600"
                >
                  {INITIAL_CELL_BLOCKS.map(blk => (
                    <option key={blk.id} value={blk.id}>
                      {blk.name} ({blk.code}) - {blk.currentOccupancy} inmates
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReassigningOfficer(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleExecuteReassign}
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>{language === 'fr' ? 'Confirmer le Redéploiement' : 'Confirm Reassignment'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Printable Shift Briefing Report Modal */}
      {briefingReport && (
        <ShiftBriefingReportModal
          report={briefingReport}
          isOpen={isBriefingModalOpen}
          onClose={() => setIsBriefingModalOpen(false)}
          language={language}
          onShiftChange={(newShift) => handleGenerateShiftBriefingReport(newShift)}
        />
      )}
    </div>
  );
};
