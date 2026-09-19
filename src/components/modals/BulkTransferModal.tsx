import React, { useState } from 'react';
import { Inmate, PrisonFacility, TransferRecord } from '../../types';
import { 
  X, 
  ArrowLeftRight, 
  Car, 
  Shield, 
  Check, 
  Users, 
  AlertTriangle, 
  Building2, 
  FileText,
  UserCheck,
  Truck
} from 'lucide-react';

interface BulkTransferModalProps {
  selectedInmates: Inmate[];
  facilities: PrisonFacility[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveInmate: (inmateId: string) => void;
  onConfirmBulkTransfer: (transferData: {
    toFacilityId: string;
    toFacilityName: string;
    transferReason: 'overcrowding_relief' | 'security_reclassification' | 'court_proximity' | 'medical_specialty' | 'vocational_training' | 'medical_treatment' | 'security_elevation';
    escortLevel: 'armed_tactical' | 'standard_escort' | 'minimum_custody' | 'armed_convoy' | 'special_operations_unit' | 'standard';
    transitVehicleNumber: string;
    escortCommander: string;
    authorizedBy: string;
    specialDirectives: string;
    manifestNumber: string;
  }) => void;
}

export const BulkTransferModal: React.FC<BulkTransferModalProps> = ({
  selectedInmates,
  facilities,
  isOpen,
  onClose,
  onRemoveInmate,
  onConfirmBulkTransfer
}) => {
  if (!isOpen || selectedInmates.length === 0) return null;

  // Derive origin facilities
  const originFacilityIds = Array.from(new Set(selectedInmates.map(i => i.facilityId)));
  const originFacilities = facilities.filter(f => originFacilityIds.includes(f.id));

  // Destination facilities: prioritize facilities other than primary origin
  const candidateDestinations = facilities.filter(f => !originFacilityIds.includes(f.id));
  const destinationOptions = candidateDestinations.length > 0 ? candidateDestinations : facilities;

  const [toFacilityId, setToFacilityId] = useState<string>(destinationOptions[0]?.id || facilities[0]?.id || '');
  const [transferReason, setTransferReason] = useState<'overcrowding_relief' | 'security_reclassification' | 'court_proximity' | 'medical_specialty' | 'vocational_training' | 'medical_treatment' | 'security_elevation'>('overcrowding_relief');
  const [escortLevel, setEscortLevel] = useState<'armed_tactical' | 'standard_escort' | 'minimum_custody' | 'armed_convoy' | 'special_operations_unit' | 'standard'>('armed_convoy');
  const [transitVehicleNumber, setTransitVehicleNumber] = useState<string>('GK-B-9912 (Armored Heavy Tactical Bus)');
  const [escortCommander, setEscortCommander] = useState<string>('Chief Inspector J. Karanja (Escort Commander)');
  const [authorizedBy, setAuthorizedBy] = useState<string>('Commissioner General / National Classification Board');
  const [manifestNumber, setManifestNumber] = useState<string>(`TRF-BULK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [specialDirectives, setSpecialDirectives] = useState<string>('Ensure all physical property vault bags, biometric docket records, and medical files are transferred concurrently with convoy escort.');

  const selectedDestination = facilities.find(f => f.id === toFacilityId) || facilities[0];
  const destinationOccupancyRate = selectedDestination 
    ? Math.round((selectedDestination.currentInmates / selectedDestination.capacity) * 100)
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDestination) return;

    onConfirmBulkTransfer({
      toFacilityId: selectedDestination.id,
      toFacilityName: selectedDestination.name,
      transferReason,
      escortLevel,
      transitVehicleNumber,
      escortCommander,
      authorizedBy,
      specialDirectives,
      manifestNumber
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-300 my-8">
        {/* Modal Header */}
        <div className="bg-[#714B67] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-white/10 rounded">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Bulk Inter-Prison Transfer Authorization</h3>
              <p className="text-[11px] text-white/80">
                Shared convoy manifest for {selectedInmates.length} selected inmates to a single destination facility
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
          {/* Selected Inmates Batch Roster */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#714B67]" />
                Selected Inmate Cohort ({selectedInmates.length})
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                Manifest Ref: <strong className="text-slate-700">{manifestNumber}</strong>
              </span>
            </div>

            <div className="bg-slate-50 rounded-lg border border-slate-200 p-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {selectedInmates.map(inmate => (
                  <div 
                    key={inmate.id}
                    className="bg-white p-2.5 rounded border border-slate-200 flex items-center justify-between gap-2 shadow-2xs"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <img 
                        src={inmate.photoUrl} 
                        alt={inmate.firstName} 
                        className="w-9 h-9 rounded object-cover border border-slate-200 shrink-0" 
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate text-xs">
                          {inmate.firstName} {inmate.lastName}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">
                          {inmate.bookingNumber} • {inmate.facilityName.split(' ')[0]}
                        </div>
                        <div className="text-[10px] text-purple-700 font-medium truncate">
                          Cell: {inmate.cellLocation || 'General Ward'}
                        </div>
                      </div>
                    </div>

                    {selectedInmates.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onRemoveInmate(inmate.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors shrink-0"
                        title="Remove from this convoy manifest"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-2 pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-600 gap-2">
                <span>
                  Origin Facilities: <strong>{originFacilities.map(f => f.name).join(', ') || 'Mixed Facilities'}</strong>
                </span>
                <span className="text-purple-800 font-semibold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  Total Cohort Weight: {selectedInmates.length} Inmates
                </span>
              </div>
            </div>
          </div>

          {/* Destination Facility Selection */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#714B67]" />
              Shared Destination Facility *
            </label>

            <select
              value={toFacilityId}
              onChange={e => setToFacilityId(e.target.value)}
              className="w-full border border-slate-300 rounded-md p-2.5 text-xs font-semibold bg-white focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67] outline-none"
              required
            >
              {facilities.map(fac => {
                const occ = Math.round((fac.currentInmates / fac.capacity) * 100);
                const isOvercrowded = fac.currentInmates > fac.capacity;
                return (
                  <option key={fac.id} value={fac.id}>
                    {fac.name} ({fac.code}) — {fac.currentInmates}/{fac.capacity} Beds ({occ}%) {isOvercrowded ? '⚠️ OVERCROWDED' : '✅ AVAILABLE'}
                  </option>
                );
              })}
            </select>

            {/* Selected Destination Preview Card */}
            {selectedDestination && (
              <div className="bg-slate-50 border border-slate-200 rounded-md p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{selectedDestination.name}</span>
                    <span className="text-[10px] uppercase font-bold bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded">
                      {selectedDestination.type}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Location: {selectedDestination.location} • Superintendent: {selectedDestination.wardenName}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="text-[11px] text-slate-600 font-medium">Beds:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {selectedDestination.currentInmates} / {selectedDestination.capacity}
                    </span>
                    <span className={`font-mono font-bold text-xs px-1.5 py-0.5 rounded ${
                      destinationOccupancyRate > 100 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {destinationOccupancyRate}%
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    New total with +{selectedInmates.length} inmates: {selectedDestination.currentInmates + selectedInmates.length} beds
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Transfer Reason & Escort Protocol */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Reason for Shared Bulk Transfer *
              </label>
              <select
                value={transferReason}
                onChange={e => setTransferReason(e.target.value as any)}
                className="w-full border border-slate-300 rounded p-2 text-xs bg-white focus:border-[#714B67] outline-none"
              >
                <option value="overcrowding_relief">Overcrowding Relief & National Bed Balancing</option>
                <option value="security_reclassification">Security Reclassification & Custody Elevation</option>
                <option value="vocational_training">Vocational Rehabilitation & Agricultural Program</option>
                <option value="court_proximity">Proximity to Regional Judicial Court / Trial</option>
                <option value="medical_specialty">Specialized Medical / Psychiatric Referral</option>
                <option value="medical_treatment">Hospitalization / Clinical Care Wing</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Convoy Escort Protocol & Security Tier *
              </label>
              <select
                value={escortLevel}
                onChange={e => setEscortLevel(e.target.value as any)}
                className="w-full border border-slate-300 rounded p-2 text-xs bg-white focus:border-[#714B67] outline-none"
              >
                <option value="armed_convoy">Armed Tactical Convoy (Armed Guards + Chase Vehicle)</option>
                <option value="special_operations_unit">Special Operations & Anti-Ambush Unit (Maximum Tier)</option>
                <option value="armed_tactical">Armed Tactical Mobile Unit</option>
                <option value="standard_escort">Standard Armed Correctional Escort</option>
                <option value="minimum_custody">Minimum Custody Low-Risk Coach</option>
              </select>
            </div>
          </div>

          {/* Vehicle and Escort Commander */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Transit Vehicle Registration / Formation
              </label>
              <input
                type="text"
                value={transitVehicleNumber}
                onChange={e => setTransitVehicleNumber(e.target.value)}
                className="w-full border border-slate-300 rounded p-2 text-xs font-mono focus:border-[#714B67] outline-none"
                placeholder="e.g. GK-B-9912 (Armored Heavy Tactical Bus)"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Convoy Escort Commander / Rank
              </label>
              <input
                type="text"
                value={escortCommander}
                onChange={e => setEscortCommander(e.target.value)}
                className="w-full border border-slate-300 rounded p-2 text-xs focus:border-[#714B67] outline-none"
                placeholder="e.g. Chief Inspector J. Karanja (Escort Commander)"
                required
              />
            </div>
          </div>

          {/* Authorization Authority & Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Authorizing Directorate / Board
              </label>
              <input
                type="text"
                value={authorizedBy}
                onChange={e => setAuthorizedBy(e.target.value)}
                className="w-full border border-slate-300 rounded p-2 text-xs focus:border-[#714B67] outline-none"
                placeholder="e.g. Commissioner General / Classification Board"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                National Manifest Order #
              </label>
              <input
                type="text"
                value={manifestNumber}
                onChange={e => setManifestNumber(e.target.value)}
                className="w-full border border-slate-300 rounded p-2 text-xs font-mono focus:border-[#714B67] outline-none"
                placeholder="TRF-BULK-2026-XXXX"
              />
            </div>
          </div>

          {/* Directives & Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Custody Handover Directives & Vault Property Transfer
            </label>
            <textarea
              value={specialDirectives}
              onChange={e => setSpecialDirectives(e.target.value)}
              rows={2}
              className="w-full border border-slate-300 rounded p-2 text-xs focus:border-[#714B67] outline-none"
              placeholder="Directives for property vault items, medical charts, and restraint protocols..."
            />
          </div>

          {/* Final Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-purple-700 shrink-0" />
              <span>All {selectedInmates.length} inmates will immediately be marked <strong>In Transit</strong>.</span>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded text-xs font-bold bg-[#714B67] hover:bg-[#5e3d55] text-white shadow-sm flex items-center space-x-1.5 transition-colors"
              >
                <Truck className="w-4 h-4" />
                <span>Authorize & Dispatch Convoy ({selectedInmates.length})</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
