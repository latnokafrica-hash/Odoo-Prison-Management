import React, { useState } from 'react';
import { Inmate } from '../../types';
import { 
  LogOut, 
  CheckCircle2, 
  FileText, 
  Coins, 
  ShieldCheck, 
  AlertCircle, 
  Printer, 
  Fingerprint, 
  Lock, 
  HeartHandshake,
  FileDown,
  Eye,
  X
} from 'lucide-react';
import { PropertyVault } from '../property/PropertyVault';
import { PropertyReportModal } from '../property/PropertyReportModal';
import { downloadPropertyDischargePdf } from '../property/propertyPdfGenerator';

interface DischargeExitHubProps {
  inmates: Inmate[];
  onSelectInmate: (inmate: Inmate) => void;
  onUpdateInmate: (inmate: Inmate) => void;
  onOpenDischargeModal: (inmate: Inmate) => void;
}

export const DischargeExitHub: React.FC<DischargeExitHubProps> = ({
  inmates,
  onSelectInmate,
  onUpdateInmate,
  onOpenDischargeModal
}) => {
  // Inmates with discharge records or imminent release (e.g. Grace Achieng due in 2 days)
  const dischargeCandidateInmates = inmates.filter(i => 
    i.dischargeRecord || i.progressiveStage === 'stage_4' || i.custodyStatus === 'discharged'
  );

  const [selectedDischargeInmate, setSelectedDischargeInmate] = useState<Inmate | null>(
    dischargeCandidateInmates.find(i => i.dischargeRecord) || dischargeCandidateInmates[0] || null
  );

  const [isPropertyVaultModalOpen, setIsPropertyVaultModalOpen] = useState(false);
  const [isPropertyPdfModalOpen, setIsPropertyPdfModalOpen] = useState(false);
  const [isExportingDirectPdf, setIsExportingDirectPdf] = useState(false);

  const discharge = selectedDischargeInmate?.dischargeRecord;

  // Direct export PDF handler
  const handleExportPropertyPdf = async () => {
    if (!selectedDischargeInmate) return;
    try {
      setIsExportingDirectPdf(true);
      await downloadPropertyDischargePdf(selectedDischargeInmate);
      // Auto complete property handover checklist if not yet checked
      if (selectedDischargeInmate.dischargeRecord && !selectedDischargeInmate.dischargeRecord.propertyHandoverCompleted) {
        handleToggleChecklistStep('propertyHandoverCompleted');
      }
    } catch (err) {
      console.error('Failed to export property discharge PDF:', err);
    } finally {
      setIsExportingDirectPdf(false);
    }
  };

  // Toggle checklist step
  const handleToggleChecklistStep = (key: keyof NonNullable<Inmate['dischargeRecord']>) => {
    if (!selectedDischargeInmate || !selectedDischargeInmate.dischargeRecord) return;

    const currentVal = selectedDischargeInmate.dischargeRecord[key];
    if (typeof currentVal !== 'boolean') return;

    const updatedDischarge = {
      ...selectedDischargeInmate.dischargeRecord,
      [key]: !currentVal
    };

    // Check if all 5 key gates are cleared
    const isAllCleared = 
      (key === 'fingerprintVerified' ? !currentVal : updatedDischarge.fingerprintVerified) &&
      (key === 'noHoldWarrantVerified' ? !currentVal : updatedDischarge.noHoldWarrantVerified) &&
      (key === 'propertyHandoverCompleted' ? !currentVal : updatedDischarge.propertyHandoverCompleted) &&
      (key === 'gratuityDisbursed' ? !currentVal : updatedDischarge.gratuityDisbursed) &&
      (key === 'transportVoucherIssued' ? !currentVal : updatedDischarge.transportVoucherIssued);

    const updatedInmate: Inmate = {
      ...selectedDischargeInmate,
      dischargeRecord: {
        ...updatedDischarge,
        status: isAllCleared ? 'cleared_gate' : 'checklist_in_progress'
      },
      custodyStatus: isAllCleared ? 'discharged' : selectedDischargeInmate.custodyStatus,
      chatterLogs: [
        {
          id: `ch-${Date.now()}`,
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          author: 'Exit Gate Superintendent',
          message: `Discharge checklist item updated: ${key} = ${!currentVal}. ${isAllCleared ? 'ALL EXIT CHECKS CLEARED. GATE PASS VALIDATED.' : ''}`,
          type: 'activity'
        },
        ...selectedDischargeInmate.chatterLogs
      ]
    };

    onUpdateInmate(updatedInmate);
    setSelectedDischargeInmate(updatedInmate);
  };

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <LogOut className="w-5 h-5 text-[#714B67]" />
            Discharge & Exit Management from Lawful Custody
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Module 2: 7-point pre-release verification, biometric fingerprint re-check, warrant clearance, property vault return, and gratuity disbursement.
          </p>
        </div>
      </div>

      {/* Main 2-Column: Left Inmates List, Right Interactive Clearance Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Discharge Roll */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Pre-Release & Exit Docket Roll
            </h3>

            <div className="space-y-2">
              {dischargeCandidateInmates.map(inm => {
                const isSelected = selectedDischargeInmate?.id === inm.id;
                const rec = inm.dischargeRecord;

                return (
                  <div
                    key={inm.id}
                    onClick={() => setSelectedDischargeInmate(inm)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-purple-50/60 border-[#714B67] ring-1 ring-[#714B67]'
                        : 'bg-slate-50/50 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-slate-500">{inm.bookingNumber}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        inm.custodyStatus === 'discharged' ? 'bg-slate-200 text-slate-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {inm.custodyStatus === 'discharged' ? 'Exited Gate' : 'Pending Exit'}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-slate-900 mt-1">{inm.firstName} {inm.lastName}</div>
                    <div className="text-[11px] text-slate-500">{inm.facilityName.split(' ')[0]}</div>

                    {rec && (
                      <div className="mt-2 text-[10px] font-mono font-medium text-[#714B67]">
                        Exit Target: {rec.dischargeDate} ({rec.dischargeType.replace('_', ' ')})
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: 7-Point Exit Clearance Checklist & Certificate */}
        <div className="lg:col-span-8">
          {selectedDischargeInmate ? (
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-6">
              {/* Inmate Exit Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedDischargeInmate.photoUrl}
                    alt={selectedDischargeInmate.firstName}
                    className="w-14 h-14 rounded-lg object-cover border border-slate-200"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded">
                        {selectedDischargeInmate.bookingNumber}
                      </span>
                      <span className="text-xs text-slate-500">ID: {selectedDischargeInmate.nationalIdNumber}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      {selectedDischargeInmate.firstName} {selectedDischargeInmate.lastName}
                    </h3>
                    <div className="text-xs text-slate-600">
                      Facility: <strong>{selectedDischargeInmate.facilityName}</strong>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-500">Gate Pass Number</div>
                  <div className="font-mono font-bold text-slate-900 text-sm">
                    {discharge?.gatePassNumber || 'GP-PENDING-2026'}
                  </div>
                  <div className="text-xs font-semibold text-emerald-700 mt-1">
                    Gratuity Balance: ${selectedDischargeInmate.gratuityBalance.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Interactive 7-Point Clearance Checklist */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Official 7-Point Custody Exit Clearance Checklist
                </h4>

                <div className="space-y-2.5">
                  {/* Step 1: Biometric Verification */}
                  <div 
                    onClick={() => discharge && handleToggleChecklistStep('fingerprintVerified')}
                    className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                      discharge?.fingerprintVerified ? 'bg-emerald-50/50 border-emerald-300' : 'bg-slate-50 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-md ${discharge?.fingerprintVerified ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        <Fingerprint className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">1. Biometric 10-Print Identification Verification</div>
                        <div className="text-[11px] text-slate-500">Cross-match with National Police Service Criminal Records Bureau database to prevent identity fraud.</div>
                      </div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={discharge?.fingerprintVerified || false} 
                      onChange={() => {}} 
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                  </div>

                  {/* Step 2: No-Hold Warrant Clearance */}
                  <div 
                    onClick={() => discharge && handleToggleChecklistStep('noHoldWarrantVerified')}
                    className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                      discharge?.noHoldWarrantVerified ? 'bg-emerald-50/50 border-emerald-300' : 'bg-slate-50 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-md ${discharge?.noHoldWarrantVerified ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">2. National Judiciary & Police "No-Hold" Warrant Clearance</div>
                        <div className="text-[11px] text-slate-500">Confirmed no pending detainers, extradition notices, or arrest warrants from other High Court jurisdictions.</div>
                      </div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={discharge?.noHoldWarrantVerified || false} 
                      onChange={() => {}} 
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                  </div>

                  {/* Step 3: Sealed Property Handover */}
                  <div 
                    className={`p-3 rounded-lg border transition-colors ${
                      discharge?.propertyHandoverCompleted ? 'bg-emerald-50/50 border-emerald-300' : 'bg-slate-50 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div 
                        onClick={() => discharge && handleToggleChecklistStep('propertyHandoverCompleted')}
                        className="flex items-center space-x-3 cursor-pointer flex-1"
                      >
                        <div className={`p-2 rounded-md ${discharge?.propertyHandoverCompleted ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                          <Lock className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900">3. Sealed Property Vault Handover & Counter-Signature</div>
                          <div className="text-[11px] text-slate-500">
                            Return of personal property ({selectedDischargeInmate.propertyItems.length} items logged in vault) with verified unbroken security seal.
                          </div>
                        </div>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={discharge?.propertyHandoverCompleted || false} 
                        onChange={() => discharge && handleToggleChecklistStep('propertyHandoverCompleted')} 
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer ml-3"
                      />
                    </div>

                    {/* Action Bar for Property Vault & PDF Export */}
                    <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>Vault Bay: <strong>LOCKER-B04</strong></span>
                        <span className="text-slate-300">•</span>
                        <span>{selectedDischargeInmate.propertyItems.length} Sealed Bags</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setIsPropertyVaultModalOpen(true)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded border border-slate-300 shadow-2xs flex items-center gap-1 text-[11px] transition-colors"
                        >
                          <Eye className="w-3 h-3 text-slate-500" />
                          <span>Inspect Vault</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsPropertyPdfModalOpen(true)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded shadow-2xs flex items-center gap-1 text-[11px] transition-colors"
                        >
                          <Printer className="w-3 h-3 text-slate-300" />
                          <span>Preview Sign-Off</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleExportPropertyPdf}
                          disabled={isExportingDirectPdf}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded shadow-2xs flex items-center gap-1 text-[11px] transition-colors disabled:opacity-50"
                        >
                          <FileDown className="w-3 h-3" />
                          <span>{isExportingDirectPdf ? 'Generating...' : 'Export PDF'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Gratuity Disbursement */}
                  <div 
                    onClick={() => discharge && handleToggleChecklistStep('gratuityDisbursed')}
                    className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                      discharge?.gratuityDisbursed ? 'bg-emerald-50/50 border-emerald-300' : 'bg-slate-50 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-md ${discharge?.gratuityDisbursed ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        <Coins className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">4. Gratuity Earnings Settlement (${selectedDischargeInmate.gratuityBalance.toFixed(2)})</div>
                        <div className="text-[11px] text-slate-500">Final liquidation of inmate labor account via cash voucher / mobile money transfer.</div>
                      </div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={discharge?.gratuityDisbursed || false} 
                      onChange={() => {}} 
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                  </div>

                  {/* Step 5: Transport Travel Voucher */}
                  <div 
                    onClick={() => discharge && handleToggleChecklistStep('transportVoucherIssued')}
                    className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                      discharge?.transportVoucherIssued ? 'bg-emerald-50/50 border-emerald-300' : 'bg-slate-50 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-md ${discharge?.transportVoucherIssued ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">5. Statutory Travel Transport Warrant & Civilian Clothing</div>
                        <div className="text-[11px] text-slate-500">Government transportation voucher issued to home district of residence.</div>
                      </div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={discharge?.transportVoucherIssued || false} 
                      onChange={() => {}} 
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Release Certificate Printout Preview */}
              <div className="bg-slate-50 border border-slate-300 rounded-lg p-4 font-mono text-xs space-y-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-300 pb-2">
                  <span className="font-bold text-slate-800 uppercase">OFFICIAL PRISONS ACT DISCHARGE CERTIFICATE</span>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setIsPropertyPdfModalOpen(true)}
                      className="flex items-center gap-1 text-[11px] font-sans font-semibold text-amber-800 hover:text-amber-900 hover:underline"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      Export Property PDF (Form NPS-PR-7B)
                    </button>
                    <button className="flex items-center gap-1 text-[11px] font-sans font-semibold text-[#714B67] hover:underline">
                      <Printer className="w-3.5 h-3.5" />
                      Print Gate Clearance
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>INMATE: {selectedDischargeInmate.firstName} {selectedDischargeInmate.lastName}</div>
                  <div>BOOKING REF: {selectedDischargeInmate.bookingNumber}</div>
                  <div>FACILITY: {selectedDischargeInmate.facilityName}</div>
                  <div>EXIT DATE: {discharge?.dischargeDate || '2026-09-18'}</div>
                  <div>PROBATION OFFICER: {discharge?.aftercareOfficerAssigned || 'N/A'}</div>
                  <div>CLEARANCE STATUS: <span className="font-bold text-emerald-700">{discharge?.status?.toUpperCase() || 'IN PROGRESS'}</span></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-500 text-xs">
              Select an inmate on the left to review their discharge clearance checklist.
            </div>
          )}
        </div>
      </div>

      {/* Property Report Printable Sign-Off Modal */}
      {selectedDischargeInmate && (
        <PropertyReportModal
          inmate={selectedDischargeInmate}
          isOpen={isPropertyPdfModalOpen}
          onClose={() => setIsPropertyPdfModalOpen(false)}
          onConfirmSignOff={() => {
            if (selectedDischargeInmate.dischargeRecord && !selectedDischargeInmate.dischargeRecord.propertyHandoverCompleted) {
              handleToggleChecklistStep('propertyHandoverCompleted');
            }
          }}
        />
      )}

      {/* Full Property Vault Inspection Modal */}
      {isPropertyVaultModalOpen && selectedDischargeInmate && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-amber-500 text-slate-950 rounded-md">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Property Vault Inspection & Discharge Sign-Off</h3>
                  <p className="text-xs text-slate-400">
                    Inmate: {selectedDischargeInmate.firstName} {selectedDischargeInmate.lastName} ({selectedDischargeInmate.bookingNumber}) — {selectedDischargeInmate.facilityName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPropertyVaultModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto bg-slate-50">
              <PropertyVault
                inmate={selectedDischargeInmate}
                onUpdateInmate={onUpdateInmate}
                showDischargeActions={true}
                onDischargeVerified={() => {
                  if (selectedDischargeInmate.dischargeRecord && !selectedDischargeInmate.dischargeRecord.propertyHandoverCompleted) {
                    handleToggleChecklistStep('propertyHandoverCompleted');
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
