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
  FileCheck
} from 'lucide-react';

interface AdmissionsTransfersHubProps {
  inmates: Inmate[];
  facilities: PrisonFacility[];
  onSelectInmate: (inmate: Inmate) => void;
  onOpenNewModal: () => void;
  onOpenTransferModal: (inmate: Inmate) => void;
  onOpenEscapeModal: (inmate: Inmate) => void;
  onUpdateInmate: (inmate: Inmate) => void;
}

export const AdmissionsTransfersHub: React.FC<AdmissionsTransfersHubProps> = ({
  inmates,
  facilities,
  onSelectInmate,
  onOpenNewModal,
  onOpenTransferModal,
  onOpenEscapeModal,
  onUpdateInmate
}) => {
  const [activeTab, setActiveTab] = useState<'transfers' | 'escapes' | 'bail' | 'intake'>('transfers');

  // Active escapes
  const activeEscapes = inmates.filter(i => i.custodyStatus === 'escaped');
  // Inmates in transit
  const inTransitInmates = inmates.filter(i => i.custodyStatus === 'in_transit');
  // Inmates re-admitted on bail revocation
  const bailInmates = inmates.filter(i => i.admissionType === 'bail_revocation' || i.custodyStatus === 'on_bail');

  // All transfer records across inmates
  const allTransfers = inmates.flatMap(i => i.transfers);

  // Quick action: Confirm arrival of in-transit inmate
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
          <button
            onClick={onOpenNewModal}
            className="flex items-center space-x-1.5 bg-[#714B67] hover:bg-[#5f3c54] text-white px-3 py-1.5 rounded text-xs font-semibold shadow-xs transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>New Admission Intake</span>
          </button>
        </div>
      </div>

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
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
              <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                Active Armed Prisoner Convoys Currently in Transit
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {inTransitInmates.map(inm => {
                  const trf = inm.transfers.find(t => t.status === 'in_transit');
                  return (
                    <div key={inm.id} className="bg-white p-3 rounded-md border border-amber-200 shadow-xs flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{inm.firstName} {inm.lastName}</span>
                          <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded">{inm.bookingNumber}</span>
                        </div>
                        <div className="text-[11px] text-slate-600 mt-1">
                          <strong>Route:</strong> {trf?.fromFacilityName.split(' ')[0]} ➔ <strong>{trf?.toFacilityName.split(' ')[0]}</strong>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Dispatched: {trf?.transitDispatchedAt || 'Today'} • Escort: {trf?.escortLevel}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
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
                          View Inmate Form
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Transfers Log Table */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                National Inter-Prison Transfer Manifests
              </h3>
              <span className="text-[10px] text-slate-500">
                Authorizations by Commissioner General / Classification Board
              </span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Inmate</th>
                  <th className="py-2.5 px-3">Origin Facility</th>
                  <th className="py-2.5 px-3">Destination Facility</th>
                  <th className="py-2.5 px-3">Reason</th>
                  <th className="py-2.5 px-3">Escort Protocol</th>
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
    </div>
  );
};
