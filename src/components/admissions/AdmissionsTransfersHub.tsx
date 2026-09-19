import React, { useState } from 'react';
import { Inmate, PrisonFacility, TransferRecord } from '../../types';
import { 
  ArrowLeftRight, 
  ShieldAlert, 
  UserPlus, 
  Car, 
  Lock, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Building2, 
  Search, 
  RotateCcw,
  FileCheck,
  Truck,
  CheckSquare,
  Square,
  Users,
  X,
  Filter,
  Shield
} from 'lucide-react';
import { BulkTransferModal } from '../modals/BulkTransferModal';

interface AdmissionsTransfersHubProps {
  inmates: Inmate[];
  facilities: PrisonFacility[];
  onSelectInmate: (inmate: Inmate) => void;
  onOpenNewModal: () => void;
  onOpenTransferModal: (inmate: Inmate) => void;
  onOpenEscapeModal: (inmate: Inmate) => void;
  onUpdateInmate: (inmate: Inmate) => void;
  onBulkUpdateInmates?: (inmates: Inmate[]) => void;
}

export const AdmissionsTransfersHub: React.FC<AdmissionsTransfersHubProps> = ({
  inmates,
  facilities,
  onSelectInmate,
  onOpenNewModal,
  onOpenTransferModal,
  onOpenEscapeModal,
  onUpdateInmate,
  onBulkUpdateInmates
}) => {
  const [activeTab, setActiveTab] = useState<'transfers' | 'escapes' | 'bail' | 'intake'>('transfers');

  // Bulk transfer selection states
  const [selectedInmateIds, setSelectedInmateIds] = useState<string[]>([]);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFacilityId, setFilterFacilityId] = useState<string>('all');
  const [filterSecurityLevel, setFilterSecurityLevel] = useState<string>('all');
  const [lastDispatchedNotice, setLastDispatchedNotice] = useState<{
    manifestNumber: string;
    count: number;
    destinationName: string;
  } | null>(null);

  // Active escapes
  const activeEscapes = inmates.filter(i => i.custodyStatus === 'escaped');
  // Inmates in transit
  const inTransitInmates = inmates.filter(i => i.custodyStatus === 'in_transit');
  // Inmates re-admitted on bail revocation
  const bailInmates = inmates.filter(i => i.admissionType === 'bail_revocation' || i.custodyStatus === 'on_bail');

  // All transfer records across inmates
  const allTransfers = inmates.flatMap(i => i.transfers);

  // Eligible inmates for transfer (active in custody, not already in transit or escaped)
  const eligibleInmates = inmates.filter(i => 
    i.custodyStatus !== 'in_transit' && 
    i.custodyStatus !== 'escaped' && 
    i.custodyStatus !== 'discharged'
  );

  // Filtered candidate list based on search, origin facility, and security level
  const filteredCandidates = eligibleInmates.filter(inm => {
    const fullName = `${inm.firstName} ${inm.lastName}`.toLowerCase();
    const matchesSearch = 
      fullName.includes(searchQuery.toLowerCase()) ||
      inm.bookingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inm.nationalIdNumber && inm.nationalIdNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFacility = filterFacilityId === 'all' || inm.facilityId === filterFacilityId;
    const matchesSecurity = filterSecurityLevel === 'all' || (inm.securityCategory && inm.securityCategory.toLowerCase().includes(filterSecurityLevel.toLowerCase()));

    return matchesSearch && matchesFacility && matchesSecurity;
  });

  // Selected inmates objects
  const selectedInmates = inmates.filter(i => selectedInmateIds.includes(i.id));

  // Selection toggle handlers
  const handleToggleSelectInmate = (id: string) => {
    setSelectedInmateIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredCandidates.map(i => i.id);
    const allSelected = filteredIds.length > 0 && filteredIds.every(id => selectedInmateIds.includes(id));
    if (allSelected) {
      setSelectedInmateIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setSelectedInmateIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleClearSelection = () => {
    setSelectedInmateIds([]);
  };

  const handleRemoveFromSelected = (inmateId: string) => {
    setSelectedInmateIds(prev => prev.filter(id => id !== inmateId));
  };

  // Quick action: Confirm arrival of single in-transit inmate
  const handleConfirmArrival = (inmate: Inmate) => {
    const activeTransfer = inmate.transfers.find(t => t.status === 'in_transit');
    const destinationFacility = facilities.find(f => f.id === activeTransfer?.toFacilityId) || facilities[0];

    const updatedTransfers = inmate.transfers.map(t => {
      if (t.status === 'in_transit') {
        return {
          ...t,
          status: 'completed' as const,
          arrivalConfirmedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
        };
      }
      return t;
    });

    const updatedInmate: Inmate = {
      ...inmate,
      custodyStatus: 'convicted',
      facilityId: destinationFacility.id,
      facilityName: destinationFacility.name,
      cellLocation: 'Arrival Cell A-1 (Induction Wing)',
      transfers: updatedTransfers,
      chatterLogs: [
        {
          id: `ch-${Date.now()}`,
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          author: 'Reception Superintendent',
          message: `Inmate arrived safely at ${destinationFacility.name}. Custody handover completed.`,
          type: 'system'
        },
        ...inmate.chatterLogs
      ]
    };

    onUpdateInmate(updatedInmate);
  };

  // Bulk action: Confirm all in-transit arrivals
  const handleConfirmAllArrivals = () => {
    if (inTransitInmates.length === 0) return;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const updated = inTransitInmates.map((inm, idx) => {
      const activeTransfer = inm.transfers.find(t => t.status === 'in_transit');
      const destinationFacility = facilities.find(f => f.id === activeTransfer?.toFacilityId) || facilities[0];

      const updatedTransfers = inm.transfers.map(t => {
        if (t.status === 'in_transit') {
          return {
            ...t,
            status: 'completed' as const,
            arrivalConfirmedAt: nowStr
          };
        }
        return t;
      });

      return {
        ...inm,
        custodyStatus: 'convicted' as const,
        facilityId: destinationFacility.id,
        facilityName: destinationFacility.name,
        cellLocation: 'Arrival Cell A-1 (Induction Wing)',
        transfers: updatedTransfers,
        chatterLogs: [
          {
            id: `ch-arr-${Date.now()}-${idx}`,
            date: nowStr,
            author: 'Reception Superintendent',
            message: `Convoy arrival verified at ${destinationFacility.name}. Biometric identity verified and custody handover completed.`,
            type: 'system' as const
          },
          ...inm.chatterLogs
        ]
      };
    });

    if (onBulkUpdateInmates) {
      onBulkUpdateInmates(updated);
    } else {
      updated.forEach(onUpdateInmate);
    }
  };

  // Process shared bulk transfer request to a single destination facility
  const handleConfirmBulkTransfer = (transferData: {
    toFacilityId: string;
    toFacilityName: string;
    transferReason: 'overcrowding_relief' | 'security_reclassification' | 'court_proximity' | 'medical_specialty' | 'vocational_training' | 'medical_treatment' | 'security_elevation';
    escortLevel: 'armed_tactical' | 'standard_escort' | 'minimum_custody' | 'armed_convoy' | 'special_operations_unit' | 'standard';
    transitVehicleNumber: string;
    escortCommander: string;
    authorizedBy: string;
    specialDirectives: string;
    manifestNumber: string;
  }) => {
    const cohortToTransfer = inmates.filter(i => selectedInmateIds.includes(i.id));
    if (cohortToTransfer.length === 0) return;

    const nowIso = new Date().toISOString();
    const requisitionDate = nowIso.split('T')[0];
    const transitDispatchedAt = nowIso.replace('T', ' ').slice(0, 16);

    const updatedInmates: Inmate[] = cohortToTransfer.map((inm, idx) => {
      const newTransfer: TransferRecord = {
        id: `trf-bulk-${Date.now()}-${idx}-${inm.id.slice(-4)}`,
        inmateId: inm.id,
        inmateName: `${inm.firstName} ${inm.lastName}`,
        bookingNumber: inm.bookingNumber,
        fromFacilityId: inm.facilityId,
        fromFacilityName: inm.facilityName,
        toFacilityId: transferData.toFacilityId,
        toFacilityName: transferData.toFacilityName,
        requisitionDate,
        transferReason: transferData.transferReason,
        authorizedBy: transferData.authorizedBy,
        escortLevel: transferData.escortLevel,
        status: 'in_transit',
        transitDispatchedAt,
        transitVehicleNumber: transferData.transitVehicleNumber,
        escortCommander: transferData.escortCommander
      };

      return {
        ...inm,
        custodyStatus: 'in_transit',
        cellLocation: `Convoy Transit (${transferData.manifestNumber})`,
        transfers: [newTransfer, ...inm.transfers],
        chatterLogs: [
          {
            id: `ch-bulk-${Date.now()}-${idx}`,
            date: transitDispatchedAt,
            author: transferData.escortCommander,
            message: `Dispatched on shared convoy under Manifest #${transferData.manifestNumber} to ${transferData.toFacilityName} via ${transferData.transitVehicleNumber}. Security Tier: ${transferData.escortLevel.replace(/_/g, ' ')}. Directives: ${transferData.specialDirectives}`,
            type: 'system'
          },
          ...inm.chatterLogs
        ]
      };
    });

    if (onBulkUpdateInmates) {
      onBulkUpdateInmates(updatedInmates);
    } else {
      updatedInmates.forEach(onUpdateInmate);
    }

    setLastDispatchedNotice({
      manifestNumber: transferData.manifestNumber,
      count: cohortToTransfer.length,
      destinationName: transferData.toFacilityName
    });

    setSelectedInmateIds([]);
    setIsBulkModalOpen(false);
  };

  const isAllFilteredSelected = 
    filteredCandidates.length > 0 && 
    filteredCandidates.every(i => selectedInmateIds.includes(i.id));

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-4">
      {/* Top Banner & Stats */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-[#714B67]" />
            Admissions, Transfers, Bail Re-Admit & Escape Operations
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Module 1: End-to-end management of custodial movement, national transfers, bail compliance, and escape & recapture workflows.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Bulk Transfer Action Button in Top Banner */}
          <button
            onClick={() => {
              if (selectedInmateIds.length > 0) {
                setIsBulkModalOpen(true);
              } else {
                setActiveTab('transfers');
              }
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold shadow-xs transition-colors ${
              selectedInmateIds.length > 0
                ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>
              {selectedInmateIds.length > 0
                ? `Process Bulk Transfer (${selectedInmateIds.length})`
                : 'Bulk Transfer Action'}
            </span>
          </button>

          <button
            onClick={onOpenNewModal}
            className="flex items-center space-x-1.5 bg-[#714B67] hover:bg-[#5f3c54] text-white px-3 py-1.5 rounded text-xs font-semibold shadow-xs transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>New Admission Intake</span>
          </button>
        </div>
      </div>

      {/* Dispatched Convoy Success Notification */}
      {lastDispatchedNotice && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-3.5 flex items-center justify-between gap-3 text-xs text-emerald-900 animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold">Shared Bulk Transfer Convoy Successfully Dispatched!</span>
              <span className="ml-1 text-emerald-800">
                <strong>{lastDispatchedNotice.count} inmates</strong> were placed in transit to <strong>{lastDispatchedNotice.destinationName}</strong> under Manifest Order <strong>#{lastDispatchedNotice.manifestNumber}</strong>.
              </span>
            </div>
          </div>
          <button 
            onClick={() => setLastDispatchedNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 rounded hover:bg-emerald-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-slate-200 bg-white px-4 pt-2 rounded-t-lg">
        <button
          onClick={() => setActiveTab('transfers')}
          className={`py-2 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'transfers'
              ? 'border-[#714B67] text-[#714B67]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Car className="w-3.5 h-3.5" />
          <span>Inter-Prison Transfers ({inTransitInmates.length} In Transit)</span>
        </button>

        <button
          onClick={() => setActiveTab('escapes')}
          className={`py-2 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'escapes'
              ? 'border-rose-600 text-rose-700 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          <span>Escape & Recapture ({activeEscapes.length} Fugitives)</span>
        </button>

        <button
          onClick={() => setActiveTab('bail')}
          className={`py-2 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'bail'
              ? 'border-[#714B67] text-[#714B67]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Bail Surrender & Re-Admissions ({bailInmates.length})</span>
        </button>
      </div>

      {/* TAB 1: TRANSFERS */}
      {activeTab === 'transfers' && (
        <div className="space-y-4">
          {/* In Transit Active Convoy Alerts */}
          {inTransitInmates.length > 0 && (
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                  Active Armed Prisoner Convoys Currently in Transit ({inTransitInmates.length} Inmates En Route)
                </h3>
                {inTransitInmates.length > 1 && (
                  <button
                    onClick={handleConfirmAllArrivals}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold px-3 py-1 rounded shadow-xs transition-colors flex items-center gap-1 self-start sm:self-auto"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm All Convoy Arrivals ({inTransitInmates.length})</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {inTransitInmates.map(inm => {
                  const trf = inm.transfers.find(t => t.status === 'in_transit');
                  return (
                    <div key={inm.id} className="bg-white p-3 rounded-md border border-amber-200 shadow-2xs flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 truncate">{inm.firstName} {inm.lastName}</span>
                          <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded shrink-0">{inm.bookingNumber}</span>
                        </div>
                        <div className="text-[11px] text-slate-600 mt-1 truncate">
                          <strong>Route:</strong> {trf?.fromFacilityName.split(' ')[0]} ➔ <strong>{trf?.toFacilityName.split(' ')[0]}</strong>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          Dispatched: {trf?.transitDispatchedAt || 'Today'} • {trf?.transitVehicleNumber || 'Convoy Bus'}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <button
                          onClick={() => handleConfirmArrival(inm)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold px-2.5 py-1 rounded shadow-2xs transition-colors flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confirm Arrival</span>
                        </button>
                        <button
                          onClick={() => onSelectInmate(inm)}
                          className="text-[10px] text-purple-700 hover:underline"
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* BULK TRANSFER COHORT ROSTER CARD */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
            {/* Header & Description */}
            <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] bg-[#714B67] text-white font-mono font-bold px-2 py-0.5 rounded">
                    CONVOY OPERATIONS
                  </span>
                  <span className="text-xs text-slate-500">Shared Convoy Batch Processing</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#714B67]" />
                  Bulk Transfer Action — Inmate Candidate Roster
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select multiple inmates to initiate a unified transfer request with shared escort, vehicle, and destination facility.
                </p>
              </div>

              {/* Action Trigger Button */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    if (selectedInmateIds.length === 0) {
                      // auto select first 2 if none selected as a quick helper
                      setSelectedInmateIds(filteredCandidates.slice(0, 2).map(i => i.id));
                    }
                    setIsBulkModalOpen(true);
                  }}
                  disabled={filteredCandidates.length === 0}
                  className={`px-3.5 py-2 rounded text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-colors ${
                    selectedInmateIds.length > 0
                      ? 'bg-[#714B67] hover:bg-[#5e3d55] text-white'
                      : 'bg-purple-100 text-purple-900 hover:bg-purple-200'
                  }`}
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>
                    {selectedInmateIds.length > 0
                      ? `Configure Shared Transfer (${selectedInmateIds.length} Selected)`
                      : 'Create Bulk Transfer'}
                  </span>
                </button>
              </div>
            </div>

            {/* Filter Toolbar */}
            <div className="p-3.5 border-b border-slate-200 bg-slate-50/40 grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
              {/* Search */}
              <div className="sm:col-span-5 relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by inmate name, booking #, or ID..."
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded bg-white text-xs outline-none focus:border-[#714B67]"
                />
              </div>

              {/* Origin Facility Filter */}
              <div className="sm:col-span-4 flex items-center gap-1.5">
                <label className="text-slate-500 shrink-0 font-medium text-[11px]">Origin:</label>
                <select
                  value={filterFacilityId}
                  onChange={e => setFilterFacilityId(e.target.value)}
                  className="w-full border border-slate-300 rounded p-1.5 bg-white text-xs outline-none focus:border-[#714B67]"
                >
                  <option value="all">All National Facilities</option>
                  {facilities.map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.code})</option>
                  ))}
                </select>
              </div>

              {/* Security Filter */}
              <div className="sm:col-span-3 flex items-center gap-1.5">
                <label className="text-slate-500 shrink-0 font-medium text-[11px]">Security:</label>
                <select
                  value={filterSecurityLevel}
                  onChange={e => setFilterSecurityLevel(e.target.value)}
                  className="w-full border border-slate-300 rounded p-1.5 bg-white text-xs outline-none focus:border-[#714B67]"
                >
                  <option value="all">All Categories</option>
                  <option value="maximum">Maximum / Close</option>
                  <option value="medium">Medium Security</option>
                  <option value="minimum">Minimum Custody</option>
                </select>
              </div>
            </div>

            {/* Sticky Action Banner when Inmates are selected */}
            {selectedInmateIds.length > 0 && (
              <div className="bg-purple-50/90 border-b border-purple-200 p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                  <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5 bg-purple-200/70 px-2 py-0.5 rounded">
                    <CheckSquare className="w-4 h-4 text-purple-700" />
                    {selectedInmateIds.length} {selectedInmateIds.length === 1 ? 'Inmate' : 'Inmates'} Selected for Bulk Transfer
                  </span>

                  <div className="flex items-center space-x-1 max-w-md overflow-x-auto py-0.5">
                    {selectedInmates.map(inm => (
                      <span 
                        key={inm.id}
                        className="inline-flex items-center gap-1 text-[11px] bg-white border border-purple-200 text-slate-800 px-2 py-0.5 rounded-full shadow-2xs font-medium"
                      >
                        {inm.firstName} {inm.lastName}
                        <button 
                          onClick={() => handleRemoveFromSelected(inm.id)}
                          className="text-slate-400 hover:text-rose-600 rounded-full"
                          title="Remove from selection"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
                  <button
                    onClick={handleClearSelection}
                    className="text-xs text-slate-600 hover:text-slate-900 underline px-2"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setIsBulkModalOpen(true)}
                    className="bg-[#714B67] hover:bg-[#5e3d55] text-white text-xs font-bold px-3.5 py-1.5 rounded shadow-xs flex items-center space-x-1.5 transition-colors"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Process Bulk Transfer ({selectedInmateIds.length})</span>
                  </button>
                </div>
              </div>
            )}

            {/* Candidate Inmates Table */}
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 sticky top-0 z-10 shadow-2xs">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={isAllFilteredSelected}
                        onChange={handleSelectAllFiltered}
                        className="rounded border-slate-300 text-[#714B67] focus:ring-[#714B67] cursor-pointer"
                        title={isAllFilteredSelected ? 'Deselect all visible' : 'Select all visible'}
                      />
                    </th>
                    <th className="py-2.5 px-3">Inmate Profile</th>
                    <th className="py-2.5 px-3">Booking # / ID</th>
                    <th className="py-2.5 px-3">Current Facility</th>
                    <th className="py-2.5 px-3">Cell Location</th>
                    <th className="py-2.5 px-3">Security Level</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Individual Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        No eligible inmates found matching your search and filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredCandidates.map(inm => {
                      const isSelected = selectedInmateIds.includes(inm.id);
                      return (
                        <tr 
                          key={inm.id}
                          className={`transition-colors cursor-pointer ${
                            isSelected ? 'bg-purple-50/50 hover:bg-purple-50' : 'hover:bg-slate-50'
                          }`}
                          onClick={() => handleToggleSelectInmate(inm.id)}
                        >
                          <td 
                            className="py-2.5 px-3 text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectInmate(inm.id)}
                              className="rounded border-slate-300 text-[#714B67] focus:ring-[#714B67] cursor-pointer"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center space-x-2.5">
                              <img 
                                src={inm.photoUrl} 
                                alt={inm.firstName} 
                                className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0" 
                              />
                              <div>
                                <div className="font-bold text-slate-900">
                                  {inm.firstName} {inm.lastName}
                                </div>
                                <div className="text-[10px] text-slate-500">
                                  {inm.alias ? `Alias: "${inm.alias}"` : inm.gender}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-mono">
                            <div className="font-bold text-slate-800">{inm.bookingNumber}</div>
                            <div className="text-[10px] text-slate-500">ID: {inm.nationalIdNumber || 'N/A'}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-medium text-slate-800">{inm.facilityName}</span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                            {inm.cellLocation || 'General Ward'}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              {inm.securityCategory || 'Medium Security'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 capitalize">
                              {inm.custodyStatus}
                            </span>
                          </td>
                          <td 
                            className="py-2.5 px-3 text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => onOpenTransferModal(inm)}
                              className="text-xs font-semibold text-[#714B67] hover:underline"
                            >
                              Single Transfer
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer info */}
            <div className="p-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
              <span>Showing {filteredCandidates.length} eligible inmates for transfer</span>
              <span className="font-medium">
                {selectedInmateIds.length} selected for bulk transfer
              </span>
            </div>
          </div>

          {/* Transfers Log Table */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                National Inter-Prison Transfer Manifests Log
              </h3>
              <span className="text-[10px] text-slate-500">
                Authorizations by Commissioner General / Classification Board
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Inmate</th>
                    <th className="py-2.5 px-3">Origin Facility</th>
                    <th className="py-2.5 px-3">Destination Facility</th>
                    <th className="py-2.5 px-3">Reason</th>
                    <th className="py-2.5 px-3">Escort Protocol</th>
                    <th className="py-2.5 px-3">Vehicle</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allTransfers.map(trf => (
                    <tr key={trf.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono text-slate-600">{trf.requisitionDate}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{trf.inmateName}</td>
                      <td className="py-2.5 px-3">{trf.fromFacilityName}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{trf.toFacilityName}</td>
                      <td className="py-2.5 px-3 capitalize">{trf.transferReason.replace(/_/g, ' ')}</td>
                      <td className="py-2.5 px-3 uppercase font-mono text-[10px]">{trf.escortLevel.replace(/_/g, ' ')}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">{trf.transitVehicleNumber || 'Convoy GK-B-9912'}</td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
                          trf.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                        }`}>
                          {trf.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ESCAPE & RECAPTURE */}
      {activeTab === 'escapes' && (
        <div className="space-y-4">
          {/* Active Escapes Red Notice Banner */}
          {activeEscapes.length > 0 ? (
            <div className="bg-rose-50 border-2 border-rose-500 rounded-lg p-4 animate-in fade-in">
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert className="w-5 h-5 text-rose-600 animate-bounce" />
                <h3 className="text-sm font-bold text-rose-900 uppercase">
                  RED ALERT: Active Escaped Fugitives from Lawful Custody
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeEscapes.map(inm => {
                  const esc = inm.escapeIncidents?.[0];
                  return (
                    <div key={inm.id} className="bg-white border border-rose-300 rounded-lg p-4 shadow-sm space-y-2.5">
                      <div className="flex items-start space-x-3">
                        <img
                          src={inm.photoUrl}
                          alt={inm.firstName}
                          className="w-16 h-16 rounded-md object-cover border-2 border-rose-500"
                        />
                        <div className="flex-1">
                          <span className="text-[10px] bg-rose-600 text-white font-bold px-1.5 py-0.5 rounded">
                            EXTREME DANGER LEVEL
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 mt-1">
                            {inm.firstName} {inm.lastName} {inm.alias && `("${inm.alias}")`}
                          </h4>
                          <div className="text-xs text-slate-600 font-mono">
                            Booking: {inm.bookingNumber} • ID: {inm.nationalIdNumber}
                          </div>
                        </div>
                      </div>

                      {esc && (
                        <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1">
                          <div><strong>Incident Date:</strong> {esc.incidentDate}</div>
                          <div><strong>Location:</strong> {esc.escapeLocation}</div>
                          <div><strong>Method:</strong> {esc.methodOfEscape}</div>
                        </div>
                      )}

                      <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
                        <button
                          onClick={() => onOpenEscapeModal(inm)}
                          className="bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold px-3 py-1.5 rounded shadow-2xs transition-colors flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Process Recapture & Disciplinary Penalty</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-center text-xs text-emerald-800">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <div className="font-bold text-sm">No Active Fugitives</div>
              <div className="text-emerald-700 mt-0.5">All inmates accounted for across national correctional facilities.</div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BAIL SURRENDER */}
      {activeTab === 'bail' && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Bail Revocation, Surrender & Re-Admissions Roll
          </h3>
          <p className="text-xs text-slate-500">
            Inmates whose court bail terms were revoked, sureties discharged, or who were re-admitted under bench warrants.
          </p>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2 px-3">Booking #</th>
                <th className="py-2 px-3">Inmate Name</th>
                <th className="py-2 px-3">Facility</th>
                <th className="py-2 px-3">Admission Type</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bailInmates.map(inm => (
                <tr key={inm.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{inm.bookingNumber}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{inm.firstName} {inm.lastName}</td>
                  <td className="py-2.5 px-3">{inm.facilityName}</td>
                  <td className="py-2.5 px-3 capitalize font-medium text-purple-700">{inm.admissionType.replace(/_/g, ' ')}</td>
                  <td className="py-2.5 px-3">
                    <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded capitalize">
                      {inm.custodyStatus}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onSelectInmate(inm)}
                      className="text-xs font-semibold text-[#714B67] hover:underline"
                    >
                      Open File
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bulk Transfer Requisition Modal */}
      <BulkTransferModal
        selectedInmates={selectedInmates}
        facilities={facilities}
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onRemoveInmate={handleRemoveFromSelected}
        onConfirmBulkTransfer={handleConfirmBulkTransfer}
      />
    </div>
  );
};
