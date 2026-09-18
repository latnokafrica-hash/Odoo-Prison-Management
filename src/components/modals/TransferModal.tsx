import React, { useState } from 'react';
import { Inmate, PrisonFacility, TransferRecord } from '../../types';
import { X, ArrowRightLeft, Car, Shield, Check } from 'lucide-react';

interface TransferModalProps {
  inmate: Inmate | null;
  facilities: PrisonFacility[];
  isOpen: boolean;
  onClose: () => void;
  onConfirmTransfer: (inmateId: string, transferData: Partial<TransferRecord>) => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  inmate,
  facilities,
  isOpen,
  onClose,
  onConfirmTransfer
}) => {
  if (!isOpen || !inmate) return null;

  const otherFacilities = facilities.filter(f => f.id !== inmate.facilityId);
  const [toFacilityId, setToFacilityId] = useState(otherFacilities[0]?.id || facilities[0].id);
  const [transferReason, setTransferReason] = useState<'court_proximity' | 'security_elevation' | 'medical_treatment' | 'vocational_training' | 'overcrowding_relief'>('vocational_training');
  const [escortLevel, setEscortLevel] = useState<'standard' | 'armed_convoy' | 'special_operations_unit'>('armed_convoy');
  const [transitVehicleNumber, setTransitVehicleNumber] = useState('GK-B-9912');
  const [escortCommander, setEscortCommander] = useState('Chief Inspector J. Karanja');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const destinationFacility = facilities.find(f => f.id === toFacilityId);

    onConfirmTransfer(inmate.id, {
      fromFacilityId: inmate.facilityId,
      fromFacilityName: inmate.facilityName,
      toFacilityId: toFacilityId,
      toFacilityName: destinationFacility?.name || 'Destination Prison',
      transferReason,
      escortLevel,
      transitVehicleNumber,
      escortCommander,
      requisitionDate: new Date().toISOString().split('T')[0],
      transitDispatchedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'in_transit'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden border border-slate-300">
        <div className="bg-[#714B67] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ArrowRightLeft className="w-5 h-5" />
            <h3 className="font-bold text-sm">Inter-Prison Transfer Requisition</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="bg-slate-50 p-3 rounded border border-slate-200">
            <div className="text-[10px] uppercase font-bold text-slate-500">Inmate Detail</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">{inmate.firstName} {inmate.lastName}</div>
            <div className="text-xs text-slate-600 font-mono">Booking: {inmate.bookingNumber} • Current: {inmate.facilityName}</div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Destination Facility *</label>
            <select
              value={toFacilityId}
              onChange={e => setToFacilityId(e.target.value)}
              className="w-full border border-slate-300 rounded p-2 text-xs font-semibold"
            >
              {otherFacilities.map(fac => (
                <option key={fac.id} value={fac.id}>
                  {fac.name} ({fac.currentInmates}/{fac.capacity} beds)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reason for Transfer</label>
              <select
                value={transferReason}
                onChange={e => setTransferReason(e.target.value as any)}
                className="w-full border border-slate-300 rounded p-2 text-xs"
              >
                <option value="vocational_training">Vocational Training Enrollment</option>
                <option value="overcrowding_relief">Overcrowding Relief Rebalancing</option>
                <option value="security_elevation">Security Elevation / Reclassification</option>
                <option value="medical_treatment">Specialized Hospital / Medical</option>
                <option value="court_proximity">Proximity to Committal Court</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Escort Security Protocol</label>
              <select
                value={escortLevel}
                onChange={e => setEscortLevel(e.target.value as any)}
                className="w-full border border-slate-300 rounded p-2 text-xs font-bold"
              >
                <option value="armed_convoy">Armed Vehicle Convoy</option>
                <option value="special_operations_unit">Special Operations Tactical Escort</option>
                <option value="standard">Standard Custodial Van</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Convoy Vehicle Plate</label>
              <input
                type="text"
                value={transitVehicleNumber}
                onChange={e => setTransitVehicleNumber(e.target.value)}
                className="w-full border border-slate-300 rounded p-2 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Escort Commander</label>
              <input
                type="text"
                value={escortCommander}
                onChange={e => setEscortCommander(e.target.value)}
                className="w-full border border-slate-300 rounded p-2 text-xs"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#714B67] hover:bg-[#5f3c54] text-white rounded font-semibold shadow-xs flex items-center gap-1.5"
            >
              <Car className="w-4 h-4" />
              <span>Dispatch Armed Convoy</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
