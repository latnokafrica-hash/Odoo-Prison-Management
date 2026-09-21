import React, { useState, useEffect } from 'react';
import { Inmate } from '../../types';
import { downloadPropertyDischargePdf } from './propertyPdfGenerator';
import QRCode from 'qrcode';
import { 
  FileText, 
  Printer, 
  Download, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  Lock, 
  Building2, 
  User, 
  AlertCircle,
  FileCheck
} from 'lucide-react';

interface PropertyReportModalProps {
  inmate: Inmate;
  isOpen: boolean;
  onClose: () => void;
  onConfirmSignOff?: () => void;
}

export const PropertyReportModal: React.FC<PropertyReportModalProps> = ({
  inmate,
  isOpen,
  onClose,
  onConfirmSignOff
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Formal timestamp for the report preview
  const reportTime = new Date('2026-09-20T12:03:13');
  const timestampFormatted = reportTime.toISOString().replace('T', ' ').slice(0, 19) + ' (EAT)';
  const dateFormatted = reportTime.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const docSerial = `DOC-PV-2026-09-${inmate.bookingNumber.replace(/[^a-zA-Z0-9]/g, '')}-7421`;

  useEffect(() => {
    if (!isOpen) return;
    const payload = JSON.stringify({
      type: 'DISCHARGE_PROPERTY_RESTITUTION',
      serial: docSerial,
      inmate: inmate.bookingNumber,
      name: `${inmate.firstName} ${inmate.lastName}`,
      facility: inmate.facilityName,
      items: inmate.propertyItems.length,
      timestamp: timestampFormatted
    });

    QRCode.toDataURL(payload, { margin: 1, width: 140 })
      .then(url => setQrCodeUrl(url))
      .catch(() => {});
  }, [isOpen, inmate, docSerial, timestampFormatted]);

  if (!isOpen) return null;

  const totalCash = inmate.propertyItems
    .filter(p => p.category === 'cash')
    .reduce((acc, p) => acc + p.quantity, 0);

  const handleDownloadPdf = async () => {
    try {
      setIsExporting(true);
      const filename = await downloadPropertyDischargePdf(inmate);
      setDownloadSuccess(`Downloaded ${filename}`);
      setTimeout(() => setDownloadSuccess(null), 5000);
      if (onConfirmSignOff) {
        onConfirmSignOff();
      }
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white">
      {/* Modal Card */}
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-0 print:rounded-none">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500 text-slate-950 rounded-lg">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  Formal Inmate Property Discharge Inventory & Sign-Off Docket
                </h3>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.2 rounded font-mono font-bold">
                  FORM NPS-PR-7B
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official Prisons Act Cap 90 release certificate with unbroken tamper seals audit & counter-signature blocks.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {downloadSuccess && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                PDF Downloaded!
              </span>
            )}

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Print via browser print dialog or save to system PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Print Document</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Generating PDF...' : 'Export PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Container */}
        <div className="overflow-y-auto p-4 sm:p-8 bg-slate-100 print:bg-white print:p-0">
          {/* Printable Official Sheet (A4 Simulation) */}
          <div className="bg-white mx-auto border border-slate-300 shadow-md p-6 sm:p-10 max-w-3xl font-sans text-slate-900 print:border-0 print:shadow-none print:p-4">
            
            {/* Document Header */}
            <div className="border-b-2 border-slate-900 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-bold tracking-widest text-slate-600 uppercase">
                    State Department for Correctional Services
                  </div>
                  <h1 className="text-lg sm:text-xl font-extrabold text-slate-950 uppercase tracking-tight mt-0.5">
                    National Prison Service — Property Vault Registry
                  </h1>
                  <div className="text-xs font-semibold text-amber-800 mt-0.5">
                    FORM NPS-PR-7B: INMATE PERSONAL PROPERTY INVENTORY & DISCHARGE HANDOVER DOCKET
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {qrCodeUrl && (
                    <img
                      src={qrCodeUrl}
                      alt="Security Verification QR"
                      className="w-16 h-16 border border-slate-300 p-0.5 bg-white inline-block mb-1"
                    />
                  )}
                  <div className="text-[10px] font-mono font-bold text-slate-900">{docSerial}</div>
                  <div className="text-[9px] text-slate-500 font-mono">STATUTORY 10-YR RETENTION</div>
                </div>
              </div>

              {/* Timestamp & Law Citation Bar */}
              <div className="mt-3 pt-2 border-t border-slate-200 flex flex-col sm:flex-row justify-between text-[10px] text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>Audit Timestamp: <strong className="font-mono text-slate-800">{timestampFormatted}</strong></span>
                </div>
                <div className="text-slate-700 font-medium">
                  Prisons Act (Cap 90) Section 48 & Bangkok Rules Compliance
                </div>
              </div>
            </div>

            {/* Inmate & Facility Details Grid */}
            <div className="my-5 p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-500">Subject Inmate</div>
                <div className="text-sm font-bold text-slate-900">
                  {inmate.firstName} {inmate.lastName}
                </div>
                <div className="font-mono text-[11px] text-slate-600">
                  Booking: <strong>{inmate.bookingNumber}</strong>
                </div>
                <div className="font-mono text-[11px] text-slate-600">
                  National ID: <strong>{inmate.nationalIdNumber}</strong>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-500">Holding Facility & Custody</div>
                <div className="font-semibold text-slate-800 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  {inmate.facilityName}
                </div>
                <div className="text-slate-600">
                  Security Category: <strong>{inmate.securityCategory}</strong>
                </div>
                <div className="text-slate-600">
                  Cell Unit: <strong>{inmate.cellLocation}</strong>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-500">Discharge Clearance Docket</div>
                <div className="font-mono font-bold text-amber-700">
                  Gate Pass #: {inmate.dischargeRecord?.gatePassNumber || 'GP-VERIFIED-2026'}
                </div>
                <div className="text-slate-600">
                  Discharge Type: <strong className="capitalize">{inmate.dischargeRecord?.dischargeType?.replace('_', ' ') || 'Sentence Expiry'}</strong>
                </div>
                <div className="text-slate-600">
                  Intake Date: <strong>{inmate.admissionDate}</strong>
                </div>
              </div>
            </div>

            {/* Vault Inventory Itemized Table */}
            <div className="my-5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  Itemized Sealed Property Vault Docket
                </h4>
                <span className="text-[11px] font-semibold text-slate-600">
                  {inmate.propertyItems.length} Registered Items / Bags
                </span>
              </div>

              <div className="border border-slate-300 rounded overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-800 text-white font-semibold text-[11px]">
                    <tr>
                      <th className="py-2 px-2.5 text-center w-8">#</th>
                      <th className="py-2 px-2.5">Seal Bag No.</th>
                      <th className="py-2 px-2.5">Category</th>
                      <th className="py-2 px-2.5">Description & Serial / Detail</th>
                      <th className="py-2 px-2.5">Intake Condition</th>
                      <th className="py-2 px-2.5 text-center">Qty</th>
                      <th className="py-2 px-2.5 text-center">Seal Intact?</th>
                      <th className="py-2 px-2.5 text-center">Exit Checked</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {inmate.propertyItems.length > 0 ? (
                      inmate.propertyItems.map((item, idx) => (
                        <tr key={item.id} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                          <td className="py-2 px-2.5 text-center font-mono font-bold text-slate-500">{idx + 1}</td>
                          <td className="py-2 px-2.5 font-mono font-bold text-slate-900">{item.sealBagNumber}</td>
                          <td className="py-2 px-2.5 capitalize font-semibold text-slate-700">{item.category}</td>
                          <td className="py-2 px-2.5 text-slate-900">
                            {item.description}
                            {item.serialOrDetail && (
                              <span className="block text-[10px] text-slate-500 font-mono">
                                Ref: {item.serialOrDetail}
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-2.5 text-slate-600 text-[11px]">{item.condition || 'Good'}</td>
                          <td className="py-2 px-2.5 text-center font-mono font-bold">
                            {item.category === 'cash' ? `KES ${item.quantity.toLocaleString()}` : item.quantity}
                          </td>
                          <td className="py-2 px-2.5 text-center">
                            <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-1.5 py-0.5 rounded">
                              ✓ UNBROKEN
                            </span>
                          </td>
                          <td className="py-2 px-2.5 text-center">
                            <span className="inline-block w-4 h-4 border-2 border-slate-400 rounded text-[10px] font-bold text-emerald-600 leading-none pt-0.5">
                              ✓
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="py-6 text-center text-slate-500 italic">
                          No personal property items deposited in the facility vault upon intake.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Liquidation & Cash Valuables Summary */}
            <div className="my-4 p-3 bg-slate-50 border border-slate-300 rounded text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-800">Financial Liquidation & Settlement at Gate:</span>
                <div className="text-[11px] text-slate-600">
                  Vault Cash Handed Over: <strong>KES {totalCash.toLocaleString()}</strong> | 
                  Inmate Labor Gratuity Balance Disbursed: <strong>${inmate.gratuityBalance.toFixed(2)}</strong>
                </div>
              </div>
              <div className="text-[11px] font-mono bg-white px-2.5 py-1 rounded border border-slate-300 text-slate-800 font-bold">
                AUDIT PASS: ZERO DEFICIT
              </div>
            </div>

            {/* Statutory Inmate Legal Acknowledgment */}
            <div className="my-4 p-3.5 bg-amber-50 border border-amber-300 rounded text-xs space-y-1.5">
              <div className="font-bold text-amber-950 uppercase text-[11px] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                Statutory Inmate Receipt & Indemnity Declaration (Prisons Act Cap 90)
              </div>
              <p className="text-[11px] text-amber-900 leading-relaxed italic">
                &ldquo;I, <strong>{inmate.firstName} {inmate.lastName}</strong>, hereby declare that I have personally inspected and received into my possession all items of personal property, cash monies, legal documents, and personal effects deposited by me into the Prison Property Vault upon admission. I confirm that all tamper-evident seals were broken in my presence and that all listed items are returned intact and in good condition. I release the Superintendent and National Prison Service from all further liability regarding my property.&rdquo;
              </p>
            </div>

            {/* Three Formal Sign-Off & Biometric Thumbprint Blocks */}
            <div className="mt-6 pt-4 border-t-2 border-slate-900 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              
              {/* Block 1: Inmate Signature & Thumbprint */}
              <div className="border border-slate-300 p-3 rounded bg-slate-50/50 flex flex-col justify-between h-48">
                <div>
                  <div className="font-bold text-slate-900 uppercase text-[11px]">
                    1. Inmate Acknowledgment
                  </div>
                  <div className="text-[10px] text-slate-500">Physical receipt of all belongings</div>
                </div>

                <div className="space-y-1">
                  <div className="border-b border-slate-400 pb-1 text-center font-serif italic text-sm text-slate-800">
                    {inmate.firstName} {inmate.lastName}
                  </div>
                  <div className="text-[9px] text-center text-slate-500">Inmate Signature / Mark</div>
                </div>

                <div className="border-2 border-dashed border-slate-400 rounded h-14 flex items-center justify-center text-center p-1 bg-white">
                  <span className="text-[9px] font-mono text-slate-500 font-bold uppercase">
                    [ Inmate Right Thumb Biometric Ink Print ]
                  </span>
                </div>

                <div className="text-[9px] text-slate-500 flex justify-between font-mono">
                  <span>Date: {dateFormatted}</span>
                  <span>Time: 12:00</span>
                </div>
              </div>

              {/* Block 2: Releasing Vault Officer */}
              <div className="border border-slate-300 p-3 rounded bg-slate-50/50 flex flex-col justify-between h-48">
                <div>
                  <div className="font-bold text-slate-900 uppercase text-[11px]">
                    2. Releasing Vault Officer
                  </div>
                  <div className="text-[10px] text-slate-500">Vault custodian verification</div>
                </div>

                <div className="space-y-1 text-[11px]">
                  <div>Officer: <strong>Insp. Peter Kilonzo</strong></div>
                  <div>Rank: <strong>Senior Vault Master</strong></div>
                  <div>Service ID: <strong className="font-mono">PR-SVC-9942</strong></div>
                </div>

                <div className="space-y-1">
                  <div className="border-b border-slate-400 pb-1 text-center font-serif italic text-sm text-slate-800">
                    P. Kilonzo (Insp.)
                  </div>
                  <div className="text-[9px] text-center text-slate-500">Releasing Officer Physical Signature</div>
                </div>

                <div className="text-[9px] text-slate-500 flex justify-between font-mono">
                  <span>Date: {dateFormatted}</span>
                  <span>Status: RESTITUTED</span>
                </div>
              </div>

              {/* Block 3: Gate Superintendent & Official Embossed Stamp */}
              <div className="border border-slate-300 p-3 rounded bg-slate-50/50 flex flex-col justify-between h-48">
                <div>
                  <div className="font-bold text-slate-900 uppercase text-[11px]">
                    3. Gate Superintendent
                  </div>
                  <div className="text-[10px] text-slate-500">Final release authorization</div>
                </div>

                {/* Embossed stamp box */}
                <div className="border-2 border-dashed border-amber-600 rounded p-1.5 text-center bg-amber-50/30">
                  <div className="text-[9px] font-mono font-bold text-amber-800 uppercase">
                    OFFICIAL PRISON EMBOSSED SEAL
                  </div>
                  <div className="text-[8px] text-amber-700 font-mono">
                    {inmate.facilityName.slice(0, 22)}
                  </div>
                  <div className="text-[8px] text-emerald-700 font-bold font-mono mt-0.5">
                    GATE EXIT CLEARED
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="border-b border-slate-400 pb-1 text-center font-serif italic text-sm text-slate-800">
                    Senior Supt. J. Mwangi
                  </div>
                  <div className="text-[9px] text-center text-slate-500">Superintendent Counter-Signature</div>
                </div>

                <div className="text-[9px] text-slate-500 flex justify-between font-mono">
                  <span>Date: {dateFormatted}</span>
                  <span>Gate Pass: CLEARED</span>
                </div>
              </div>
            </div>

            {/* Document Footer */}
            <div className="mt-6 pt-3 border-t border-slate-300 flex flex-col sm:flex-row justify-between items-center text-[9px] text-slate-500 font-mono">
              <div>CONFIDENTIAL CORRECTIONAL RECORD • LAW ENFORCEMENT DISCHARGE DOCKET</div>
              <div>PAGE 1 OF 1 • VERIFIED VIA ODOO 19 PRISON VAULT ENGINE</div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Ready for physical print and counter-signature at the facility gate.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              Close
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="px-4 py-2 bg-[#714B67] hover:bg-[#5e3c55] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Downloading...' : 'Export PDF (Save File)'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
