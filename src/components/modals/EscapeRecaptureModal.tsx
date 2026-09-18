import React, { useState } from 'react';
import { Inmate } from '../../types';
import { X, ShieldAlert, CheckCircle2, AlertTriangle, Scale } from 'lucide-react';

interface EscapeRecaptureModalProps {
  inmate: Inmate | null;
  isOpen: boolean;
  onClose: () => void;
  onProcessRecapture: (inmateId: string, penaltyDays: number, arrestingAgency: string, notes: string) => void;
  onTriggerEscapeAlert: (inmateId: string, escapeLocation: string, method: string) => void;
}

export const EscapeRecaptureModal: React.FC<EscapeRecaptureModalProps> = ({
  inmate,
  isOpen,
  onClose,
  onProcessRecapture,
  onTriggerEscapeAlert
}) => {
  if (!isOpen || !inmate) return null;

  const isEscaped = inmate.custodyStatus === 'escaped';

  // State for recapture
  const [arrestingAgency, setArrestingAgency] = useState('DCI Flying Squad & Joint Anti-Terror Unit');
  const [penaltyDays, setPenaltyDays] = useState(90);
  const [recaptureNotes, setRecaptureNotes] = useState('Apprehended at border checkpoint trying to cross with fake papers. Returned under armed escort.');

  // State for escape alert
  const [escapeLocation, setEscapeLocation] = useState('Perimeter Fence East Gate - Workshop Transit');
  const [escapeMethod, setEscapeMethod] = useState('Breach of perimeter fence during evening muster count');

  const handleRecaptureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onProcessRecapture(inmate.id, penaltyDays, arrestingAgency, recaptureNotes);
    onClose();
  };

  const handleEscapeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTriggerEscapeAlert(inmate.id, escapeLocation, escapeMethod);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden border border-slate-300">
        {/* Header */}
        <div className={`text-white px-5 py-3.5 flex items-center justify-between ${
          isEscaped ? 'bg-purple-900' : 'bg-rose-700'
        }`}>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="font-bold text-sm">
              {isEscaped ? 'Process Fugitive Recapture & Disciplinary Committal' : 'RED ALERT: Broadcast Prisoner Escape Incident'}
            </h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isEscaped ? (
          /* Recapture Form */
          <form onSubmit={handleRecaptureSubmit} className="p-5 space-y-4 text-xs">
            <div className="bg-purple-50 p-3 rounded border border-purple-200">
              <div className="text-[10px] uppercase font-bold text-purple-800">Recaptured Inmate Profile</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">{inmate.firstName} {inmate.lastName}</div>
              <div className="text-xs text-slate-600 font-mono">Booking: {inmate.bookingNumber} • ID: {inmate.nationalIdNumber}</div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Arresting Authority / Security Agency</label>
              <input
                type="text"
                required
                value={arrestingAgency}
                onChange={e => setArrestingAgency(e.target.value)}
                className="w-full border border-slate-300 rounded p-2 text-xs"
              />
            </div>

            <div className="bg-rose-50 border border-rose-300 rounded p-3 space-y-1.5">
              <label className="block font-bold text-rose-900 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-rose-700" />
                Statutory Remission Penalty (Forfeiture of Earned Days)
              </label>
              <p className="text-[11px] text-rose-700">
                Under Prisons Act Section 46, escape from lawful custody triggers mandatory forfeiture of accrued remission and demotion to Stage 1.
              </p>
              <input
                type="number"
                min="0"
                value={penaltyDays}
                onChange={e => setPenaltyDays(parseInt(e.target.value) || 0)}
                className="w-36 border border-rose-400 rounded p-1.5 text-xs font-mono font-bold text-rose-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Recapture Circumstances & Medical Examination Notes</label>
              <textarea
                rows={3}
                required
                value={recaptureNotes}
                onChange={e => setRecaptureNotes(e.target.value)}
                className="w-full border border-slate-300 rounded p-2 text-xs"
              />
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
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded font-semibold shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Recapture & Apply Penalties</span>
              </button>
            </div>
          </form>
        ) : (
          /* Escape Alert Form */
          <form onSubmit={handleEscapeSubmit} className="p-5 space-y-4 text-xs">
            <div className="bg-rose-50 p-3 rounded border border-rose-200 text-rose-900">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                WARNING: This will place {inmate.firstName} {inmate.lastName} on National Red Notice!
              </div>
              <div className="text-[11px] mt-1 text-rose-700">
                Notification will be pushed to the National Police Operations Room, Interpol desk, and all border posts.
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Point of Breach / Location of Escape</label>
              <input
                type="text"
                required
                value={escapeLocation}
                onChange={e => setEscapeLocation(e.target.value)}
                className="w-full border border-slate-300 rounded p-2 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Method of Escape / Circumstances</label>
              <textarea
                rows={3}
                required
                value={escapeMethod}
                onChange={e => setEscapeMethod(e.target.value)}
                className="w-full border border-slate-300 rounded p-2 text-xs"
              />
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
                className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded font-semibold shadow-xs flex items-center gap-1.5"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Issue National Escape Broadcast</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
