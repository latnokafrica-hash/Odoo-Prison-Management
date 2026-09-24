import React, { useState } from 'react';
import { ShiftHandoverBriefData, Language } from '../../types';
import { 
  Printer, 
  Copy, 
  Check, 
  X, 
  Shield, 
  Building2, 
  Lock, 
  Key, 
  AlertTriangle, 
  FileCheck, 
  Calendar, 
  Clock,
  Download,
  Users,
  History,
  NotebookPen,
  Eye,
  Wrench,
  FileText,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  Fingerprint
} from 'lucide-react';
import { generateHandoverPdf } from '../../utils/handoverPdfExport';
import { INITIAL_TIMELINE_EVENTS } from '../../data/timelineData';
import { INITIAL_HANDOVER_NOTES } from '../../data/handoverNotesData';
import { INITIAL_CONTRABAND_ITEMS } from '../../data/contrabandData';
import { INITIAL_BIOMETRIC_CHECKINS } from '../../data/biometricAttendanceData';

interface HandoverPrintModalProps {
  handover: ShiftHandoverBriefData;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const HandoverPrintModal: React.FC<HandoverPrintModalProps> = ({
  handover,
  isOpen,
  onClose,
  language,
}) => {
  const [copied, setCopied] = useState(false);
  const [wardenSubmissionMode, setWardenSubmissionMode] = useState(true);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const text = `
================================================================================
KENYA PRISONS SERVICE - FORMAL SHIFT HANDOVER REPORT FOR PRISON WARDEN
TRANSMITTAL TO: THE PRISON WARDEN / OFFICER IN CHARGE (OIC)
================================================================================
Reference:       ${handover.referenceNumber}
Facility:        ${handover.facilityName} (ID: ${handover.facilityId})
Date:            ${handover.date}
Shift Watch:     ${handover.outgoingShift.toUpperCase()} -> ${handover.incomingShift.toUpperCase()}
Status:          ${handover.status.toUpperCase()}
Legal Authority: Kenya Prisons Standing Orders Cap. 90 / Mandela Rules Rule 14

EXECUTIVE SUMMARY FOR THE PRISON WARDEN
--------------------------------------------------------------------------------
Total Custody Population: ${handover.headcountSummary.totalInmates} / ${handover.headcountSummary.certifiedCapacity} capacity
Remand Detainees:         ${handover.headcountSummary.remandCount}
Convicted Inmates:        ${handover.headcountSummary.convictedCount}
High-Security CAT A:      ${handover.headcountSummary.highSecurityCount}
Solitary / Segregation:   ${handover.headcountSummary.solitaryCount}
Infirmary / Hospital:     ${handover.headcountSummary.hospitalCount}
Court Transit Escorts:    ${handover.headcountSummary.courtTransitCount}
Roll-Call Reconciliation: ${handover.headcountSummary.rollCallDiscrepancy === 0 ? 'CERTIFIED EXACT (0 DISCREPANCY)' : `WARNING: ${handover.headcountSummary.rollCallDiscrepancy} MISMATCH`}
${handover.executiveSummaryText ? `
SHIFT EXECUTIVE BRIEFING (GEMINI 3.8 FLASH):
--------------------------------------------------------------------------------
"${handover.executiveSummaryText}"
` : ''}
1. CURRENT FACILITY SECURITY RISKS
--------------------------------------------------------------------------------
${handover.risks.map((r, i) => `[${i + 1}] [${r.severity}] ${r.title}
    Location:   ${r.location}
    Details:    ${r.description}
    Mitigation: ${r.mitigation}
    Status:     ${r.isAcknowledgedByIncoming ? 'ACKNOWLEDGED BY INCOMING COMMANDER' : 'PENDING ACKNOWLEDGMENT'}
`).join('\n')}

2. CRITICAL EQUIPMENT, KEYS & ARMORY RECONCILIATION
--------------------------------------------------------------------------------
${handover.equipment.map(e => `- ${e.name}: Expected ${e.expectedQty}, Counted ${e.countedQty} ${e.unit} [${e.condition.toUpperCase()}] ${e.verifiedByBoth ? '(DUAL COMMAND VERIFIED)' : '(PENDING VERIFICATION)'} Location: ${e.storageLocation} ${e.sealNumber ? `[Seal #${e.sealNumber}]` : ''}`).join('\n')}

3. OPERATIONAL DIRECTIVES & GUARD TASKS
--------------------------------------------------------------------------------
${handover.tasks.map((t, i) => `[${i + 1}] [${t.priority.toUpperCase()}] ${t.title} (Due: ${t.dueTime})
    Assignee: ${t.assignedOfficer} [${t.assignedRole}]
    Status:   ${t.status.toUpperCase()}
    Details:  ${t.description}
`).join('\n')}

4. SHIFT HANDOVER DIRECTIVES & WATCH ORDERS
--------------------------------------------------------------------------------
${(handover.handoverNotes || INITIAL_HANDOVER_NOTES).map((n, i) => `[${i + 1}] [${n.category.toUpperCase()}] [${n.urgency.toUpperCase()}] ${n.title} (${n.timestamp} @ ${n.location})
    Author:     ${n.authorCommander} (${n.authorBadge})
    Directives: ${n.content}
    ${n.inmateWatchDetails ? `Watch Order: Inmate ${n.inmateWatchDetails.inmateName} (${n.inmateWatchDetails.inmateId}) | Round: ${n.inmateWatchDetails.watchIntervalMinutes} min | ${n.inmateWatchDetails.specialInstructions}` : ''}
    Visa Status: ${n.isAcknowledgedByIncoming ? `ACKNOWLEDGED by ${n.acknowledgedBy} (${n.acknowledgedAt})` : 'PENDING INCOMING COMMAND VISA'}
`).join('\n')}

5. CONTRABAND SEIZED & EVIDENCE REGISTER (WITH SEVERITY LEVEL)
--------------------------------------------------------------------------------
${(handover.contrabandSeized || INITIAL_CONTRABAND_ITEMS).map((c, i) => `[${i + 1}] [${c.severityLevel.toUpperCase()}] ${c.chainOfCustodyRef} - ${c.itemDescription}
    Category:  ${c.category.toUpperCase()} | Qty: ${c.quantity} ${c.unit} | Location: ${c.seizedLocation} (${c.seizedAt})
    Inmate:    ${c.seizedFromInmateName ? `${c.seizedFromInmateName} (${c.seizedFromInmateId || 'N/A'})` : 'Unclaimed / Common Area'}
    Storage:   ${c.storageLocation} | Docket Ref: #${c.chainOfCustodyRef}
    Disposal:  ${c.disposalStatus.toUpperCase()} | Officer: ${c.seizedByOfficer} (${c.seizedByBadge})
`).join('\n')}

6. STATUTORY SIGN-OFFS & PRISON WARDEN RATIFICATION
--------------------------------------------------------------------------------
Outgoing Commander: ${handover.outgoingSignOff?.commanderName || 'NOT SIGNED'} (${handover.outgoingSignOff?.rank || ''} - ${handover.outgoingSignOff?.badgeNumber || ''})
Signed At:          ${handover.outgoingSignOff?.signedAt || 'PENDING'}

Incoming Commander: ${handover.incomingSignOff?.commanderName || 'NOT SIGNED'} (${handover.incomingSignOff?.rank || ''} - ${handover.incomingSignOff?.badgeNumber || ''})
Accepted At:        ${handover.incomingSignOff?.signedAt || 'PENDING'}

Prison Warden (OIC): ${handover.governorSignOff?.commanderName || 'PENDING EXECUTIVE REVIEW'} (${handover.governorSignOff?.rank || ''})
Endorsed At:         ${handover.governorSignOff?.signedAt || 'PENDING'}
================================================================================
Generated via Kenya Prisons Service Integrated Custodial Suite
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto print:p-0 print:static print:bg-white print:overflow-visible">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden print:border-none print:shadow-none print:max-h-none print:w-full print:rounded-none">
        
        {/* Modal Top Control Bar (Hidden on Print) */}
        <div className="no-print px-5 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            <div>
              <span className="font-bold text-sm">
                {language === 'fr' ? 'Rapport PDF Officiel de Relève (Transmission Direction)' : 'Official PDF Shift Report (Warden Submission)'}
              </span>
              <span className="ml-2 text-xs font-mono text-indigo-300">
                {handover.referenceNumber}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            
            {/* Format Toggle */}
            <button
              onClick={() => setWardenSubmissionMode(prev => !prev)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                wardenSubmissionMode 
                  ? 'bg-indigo-900/70 text-indigo-200 border-indigo-500/50' 
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
              title="Toggle formal Warden Transmittal memorandum"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-300" />
              <span>{wardenSubmissionMode ? (language === 'fr' ? 'Mode Direction Actif' : 'Warden Dossier Active') : (language === 'fr' ? 'Mode Bureau' : 'Desk Mode')}</span>
            </button>

            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
              title="Copy Warden Transmittal Plaintext Memo"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? (language === 'fr' ? 'Copié !' : 'Copied !') : (language === 'fr' ? 'Copier Mémo' : 'Copy Memo')}</span>
            </button>

            <button
              onClick={() => generateHandoverPdf(handover, language)}
              className="px-3 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              title="Download Formatted PDF Dossier for Warden"
            >
              <Download className="w-4 h-4" />
              <span>{language === 'fr' ? 'Télécharger PDF' : 'Download PDF'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              title="Open Browser Print Dialog formatted for PDF saving or physical print"
            >
              <Printer className="w-4 h-4" />
              <span>{language === 'fr' ? 'Imprimer / Sauvegarder PDF' : 'Print / Save as PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-900 font-sans print:p-6 print:overflow-visible text-xs leading-normal">
          
          {/* Official Letterhead Header */}
          <div className="border-b-2 border-slate-900 pb-4 text-center">
            <div className="flex items-center justify-between mb-2">
              <div className="text-left font-mono text-[11px] text-slate-500">
                <div>REP. SEC: <strong>{handover.referenceNumber}</strong></div>
                <div>DATE: <strong>{handover.date}</strong></div>
              </div>

              <div className="text-center">
                <p className="font-serif tracking-widest text-[11px] font-bold text-slate-700 uppercase">
                  {language === 'fr' ? 'RÉPUBLIQUE DU KENYA' : 'REPUBLIC OF KENYA'}
                </p>
                <h1 className="text-base font-extrabold uppercase tracking-tight text-slate-900 mt-0.5">
                  {language === 'fr' ? 'ADMINISTRATION PÉNITENTIAIRE NATIONALE' : 'STATE DEPARTMENT FOR CORRECTIONAL SERVICES'}
                </h1>
                <p className="text-[11px] font-medium text-slate-600">
                  {handover.facilityName} &bull; {language === 'fr' ? 'POSTE DE COMMANDEMENT DE GARDE' : 'SECURITY COMMAND DESK'}
                </p>
              </div>

              <div className="text-right font-mono text-[11px] text-slate-500">
                <div>STATUS: <strong className="uppercase">{handover.status}</strong></div>
                <div>WATCH: <strong>{handover.outgoingShift} &rarr; {handover.incomingShift}</strong></div>
              </div>
            </div>

            <div className="bg-slate-900 text-white py-1.5 px-3 rounded font-bold uppercase tracking-wider text-[11px] flex justify-between items-center">
              <span>
                {language === 'fr' 
                  ? 'PROCÈS-VERBAL OFFICIEL DE RELÈVE DE POSTE — TRANSMISSION AU DIRECTEUR' 
                  : 'OFFICIAL SHIFT HANDOVER REPORT — SUBMISSION TO THE PRISON WARDEN'}
              </span>
              <span className="font-mono text-[10px] text-slate-300">KENYA PRISONS STANDING ORDERS RULE 14</span>
            </div>
          </div>

          {/* Formal Warden Transmittal Memorandum Block */}
          {wardenSubmissionMode && (
            <div className="bg-slate-50 border border-slate-300 rounded-lg p-3.5 space-y-2.5 print:bg-slate-50">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-[11px] text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-700" />
                  <span>{language === 'fr' ? 'BORDEREAU D\'ENVOI OFFICIEL AU DIRECTEUR DE L\'ÉTABLISSEMENT' : 'OFFICIAL TRANSMITTAL MEMORANDUM TO THE PRISON WARDEN'}</span>
                </span>
                <span className="px-2 py-0.5 bg-slate-200 text-slate-800 border border-slate-300 rounded text-[9px] font-bold uppercase tracking-wider font-mono">
                  {language === 'fr' ? 'CONFIDENTIEL SÉCURITÉ' : 'OFFICIAL / RESTRICTED CUSTODIAL'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
                <div>
                  <span className="text-slate-500 font-medium">{language === 'fr' ? 'DESTINATAIRE :' : 'TO :'}</span>{' '}
                  <strong className="text-slate-900">{language === 'fr' ? 'Le Directeur de l\'Établissement (Prison Warden / OIC)' : 'The Prison Warden / Officer in Charge (OIC)'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">{language === 'fr' ? 'COMMANDANTS DE RELÈVE :' : 'FROM :'}</span>{' '}
                  <strong className="text-slate-900">{handover.outgoingSignOff?.commanderName || 'Capt. Marcus Vance'} & {handover.incomingSignOff?.commanderName || 'Capt. Jonathan Hayes'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">{language === 'fr' ? 'OBJET DU RAPPORT :' : 'SUBJECT :'}</span>{' '}
                  <strong className="text-slate-900">{language === 'fr' ? 'Procès-Verbal Réglementaire de Relève de Poste & Bilan de Garde' : 'Shift Handover Assessment & Formal Custody Transfer Dossier'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">{language === 'fr' ? 'BASE LÉGALE :' : 'REGULATORY MANDATE :'}</span>{' '}
                  <span className="text-slate-700 font-mono text-[10px]">Prisons Act Cap. 90 / Mandela Rules Rule 14 / Standing Orders 2024</span>
                </div>
              </div>

              {/* Warden Executive Summary Strip */}
              <div className="mt-2 pt-2 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-500 block">{language === 'fr' ? 'Appel Effectifs Détenus' : 'Headcount Balance'}</span>
                  <span className="font-bold text-emerald-700 text-[11px]">
                    {handover.headcountSummary.rollCallDiscrepancy === 0 ? '✓ 100% Conforme (0 Écart)' : `⚠ Écart: ${handover.headcountSummary.rollCallDiscrepancy}`}
                  </span>
                  <span className="text-[9px] text-slate-500 block">{handover.headcountSummary.totalInmates} / {handover.headcountSummary.certifiedCapacity} Écrou</span>
                </div>

                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-500 block">{language === 'fr' ? 'Clés & Armes Contrôlées' : 'Master Keys & Arms'}</span>
                  <span className="font-bold text-emerald-700 text-[11px]">
                    ✓ {handover.equipment.filter(e => e.verifiedByBoth).length}/{handover.equipment.length} Postes Contrôlés
                  </span>
                  <span className="text-[9px] text-slate-500 block">Sceaux intègres vérifiés</span>
                </div>

                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-500 block">{language === 'fr' ? 'Menaces & Risques Actifs' : 'Active Facility Threats'}</span>
                  <span className="font-bold text-amber-700 text-[11px]">
                    {handover.risks.length} Signalements ({handover.risks.filter(r => r.severity === 'CRITICAL').length} Critique)
                  </span>
                  <span className="text-[9px] text-slate-500 block">Mesures d'atténuation en place</span>
                </div>

                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-slate-500 block">{language === 'fr' ? 'Homologation Direction' : 'Warden Approval'}</span>
                  <span className="font-bold text-indigo-700 text-[11px] uppercase">
                    {handover.governorSignOff ? 'Homologué & Visé' : (handover.incomingSignOff ? 'Relève Prête pour Visa' : 'En Cours de Relève')}
                  </span>
                  <span className="text-[9px] text-slate-500 block">{handover.status.toUpperCase()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Section 1: Inmate Custody Balance */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-700" />
              <span>1. {language === 'fr' ? 'Situation des Effectifs Détenus & Écrou' : 'Inmate Custody Headcount & Roll Reconciliation'}</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-500 block">{language === 'fr' ? 'Effectif Total Présent' : 'Total Custody Count'}</span>
                <span className="text-sm font-bold text-slate-900">{handover.headcountSummary.totalInmates}</span>
                <span className="text-[10px] text-slate-500 block">Capacité: {handover.headcountSummary.certifiedCapacity}</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-500 block">{language === 'fr' ? 'Prévenus / Remand' : 'Remand Detainees'}</span>
                <span className="text-sm font-bold text-slate-900">{handover.headcountSummary.remandCount}</span>
                <span className="text-[10px] text-slate-500 block">Condamnés: {handover.headcountSummary.convictedCount}</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-500 block">{language === 'fr' ? 'Haute Sécurité CAT A' : 'High Threat (CAT A)'}</span>
                <span className="text-sm font-bold text-rose-700">{handover.headcountSummary.highSecurityCount}</span>
                <span className="text-[10px] text-slate-500 block">Isolement: {handover.headcountSummary.solitaryCount}</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-500 block">{language === 'fr' ? 'Écart d\'Appel (Roll Call)' : 'Roll-Call Discrepancy'}</span>
                <span className={`text-sm font-bold ${handover.headcountSummary.rollCallDiscrepancy === 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {handover.headcountSummary.rollCallDiscrepancy === 0 ? (language === 'fr' ? '0 (Conforme)' : '0 (100% Accounted)') : `${handover.headcountSummary.rollCallDiscrepancy} MISMATCH`}
                </span>
                <span className="text-[10px] text-slate-500 block">Convois Ext.: {handover.headcountSummary.courtTransitCount}</span>
              </div>
            </div>
          </div>

          {/* Section 1.5: Security Staffing & Sentinel Coverage */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-700" />
              <span>2. {language === 'fr' ? 'Effectifs de Sécurité & Postes Fixes Obligatoires' : 'Security Sentinel Staffing & Mandatory Fixed Posts'}</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] mb-2">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-500 block">{language === 'fr' ? 'Effectif Déployé' : 'Sentinels Deployed'}</span>
                <span className="text-sm font-bold text-slate-900">
                  {handover.personnelSummary?.staffing?.deployedOfficersCount ?? 24}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Min. Requis: {handover.personnelSummary?.staffing?.minimumRequiredOfficers ?? 22}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-500 block">{language === 'fr' ? 'Postes Fixes Armés' : 'Fixed Posts Manned'}</span>
                <span className="text-sm font-bold text-emerald-700">
                  {handover.personnelSummary?.staffing?.fixedPostsMannedCount ?? 14} / {handover.personnelSummary?.staffing?.mandatoryFixedPostsCount ?? 14}
                </span>
                <span className="text-[10px] text-emerald-600 block">100% Couverts</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-500 block">{language === 'fr' ? 'Réserve QRF Standby' : 'QRF Tactical Standby'}</span>
                <span className="text-sm font-bold text-rose-700">
                  {handover.personnelSummary?.staffing?.qrfStandbyCount ?? 4} Gardes
                </span>
                <span className="text-[10px] text-slate-500 block">Prêt Alerte 60s</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-500 block">{language === 'fr' ? 'Conformité Mandela' : 'Safety Compliance'}</span>
                <span className="text-sm font-bold text-emerald-700 uppercase">
                  {handover.personnelSummary?.staffing?.safetyStatus ?? 'OPTIMAL'}
                </span>
                <span className="text-[10px] text-slate-500 block">Congés: {handover.personnelSummary?.leaveRequests?.filter(r => r.status === 'pending').length ?? 2} en cours</span>
              </div>
            </div>
          </div>

          {/* Section 2.5: Shift Executive Summary (Gemini AI Synthesis) */}
          {handover.executiveSummaryText && (
            <div className="bg-indigo-50/70 border border-indigo-200 rounded p-3 text-slate-900">
              <div className="flex items-center justify-between border-b border-indigo-200/80 pb-1 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-indigo-700" />
                  <span>2.5 {language === 'fr' ? 'Synthèse Exécutive du Quart (Gemini 3.8 Flash)' : 'Shift Executive Briefing (Gemini 3.8 Flash Synthesis)'}</span>
                </span>
                <span className="text-[9px] font-mono text-indigo-800">
                  {handover.executiveSummaryGeneratedAt ? new Date(handover.executiveSummaryGeneratedAt).toLocaleString() : 'CONFIDENTIAL BRIEFING'}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-900 font-serif italic">
                "{handover.executiveSummaryText}"
              </p>
            </div>
          )}

          {/* Section 3: Current Facility Risks */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2.5 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              <span>3. {language === 'fr' ? 'Risques Établissement & Situations d\'Alerte' : 'Current Facility Risks & Operational Alerts'}</span>
            </h2>

            <div className="border border-slate-300 rounded overflow-hidden">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 font-semibold">
                  <tr>
                    <th className="p-2 w-20">Niveau</th>
                    <th className="p-2">Intitulé & Localisation</th>
                    <th className="p-2">Description & Mesures d'Atténuation</th>
                    <th className="p-2 w-24">Visa Entrant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {handover.risks.map(r => (
                    <tr key={r.id}>
                      <td className="p-2 align-top">
                        <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                          r.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                          r.severity === 'HIGH' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                          'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}>
                          {r.severity}
                        </span>
                      </td>
                      <td className="p-2 align-top">
                        <strong className="text-slate-900 block">{r.title}</strong>
                        <span className="text-slate-500 text-[10px]">{r.location}</span>
                      </td>
                      <td className="p-2 align-top text-slate-700 space-y-1">
                        <div>{r.description}</div>
                        <div className="text-[10px] font-medium text-indigo-900">
                          <strong>Action:</strong> {r.mitigation}
                        </div>
                      </td>
                      <td className="p-2 align-top text-center">
                        <span className={`font-semibold text-[10px] ${r.isAcknowledgedByIncoming ? 'text-emerald-700' : 'text-slate-400'}`}>
                          {r.isAcknowledgedByIncoming ? '✓ Lu & Visé' : 'En attente'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Pending Tasks */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-700" />
              <span>3. {language === 'fr' ? 'Consignes & Tâches Prioritaires Transmises' : 'Pending Directives & Operational Tasks Handed Over'}</span>
            </h2>

            <div className="border border-slate-300 rounded overflow-hidden">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 font-semibold">
                  <tr>
                    <th className="p-2 w-16">Heure</th>
                    <th className="p-2">Tâche & Description</th>
                    <th className="p-2 w-40">Responsable / Rôle</th>
                    <th className="p-2 w-24">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {handover.tasks.map(t => (
                    <tr key={t.id}>
                      <td className="p-2 font-mono font-bold align-top text-indigo-900">
                        {t.dueTime}
                      </td>
                      <td className="p-2 align-top">
                        <strong className="text-slate-900 block">{t.title}</strong>
                        <span className="text-slate-600 text-[10px] block mt-0.5">{t.description}</span>
                      </td>
                      <td className="p-2 align-top text-slate-700 text-[10px]">
                        <div>{t.assignedOfficer}</div>
                        <span className="text-slate-500">{t.assignedRole}</span>
                      </td>
                      <td className="p-2 align-top">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          t.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                          t.status === 'in_progress' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {t.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Equipment & Armory Inventory Verification */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-700" />
              <span>4. {language === 'fr' ? 'Vérification Conjointe des Clés, Armements & Matériels' : 'Joint Armory, Keys & Riot Equipment Physical Audit'}</span>
            </h2>

            <div className="border border-slate-300 rounded overflow-hidden">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 font-semibold">
                  <tr>
                    <th className="p-2">Matériel & Emplacement</th>
                    <th className="p-2 w-20 text-center">Attendu</th>
                    <th className="p-2 w-20 text-center">Compté</th>
                    <th className="p-2 w-28">État</th>
                    <th className="p-2">Observations / Écarts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {handover.equipment.map(e => (
                    <tr key={e.id}>
                      <td className="p-2 align-top">
                        <strong className="text-slate-900 block">{e.name}</strong>
                        <div className="flex flex-wrap items-center gap-1.5 text-slate-500 text-[10px] mt-0.5">
                          <span>{e.storageLocation}</span>
                          {e.sealNumber && <span className="font-mono font-semibold text-indigo-800 bg-indigo-50 px-1 rounded">#{e.sealNumber}</span>}
                        </div>
                      </td>
                      <td className="p-2 text-center font-mono align-top text-slate-600">
                        {e.expectedQty} {e.unit}
                      </td>
                      <td className="p-2 text-center font-mono font-bold align-top text-slate-900">
                        {e.countedQty} {e.unit}
                      </td>
                      <td className="p-2 align-top">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          e.condition === 'operational' ? 'bg-emerald-100 text-emerald-800' :
                          e.condition === 'maintenance' ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {e.condition.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-2 align-top text-slate-600 text-[10px]">
                        <div>{e.discrepancyNote || '—'}</div>
                        {e.verifiedByBoth && (
                          <div className="text-[9px] text-emerald-700 font-bold mt-0.5 flex items-center gap-1">
                            <span>✓</span>
                            <span>{language === 'fr' ? 'Pointé & validé' : 'Dual-command verified'}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 5: Chronological Shift Operational Event Log */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2.5 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-indigo-700" />
              <span>5. {language === 'fr' ? 'Journal Chronologique des Événements & Incidents du Quart' : 'Chronological Shift Operational Events & Milestone Register'}</span>
            </h2>

            <div className="border border-slate-300 rounded overflow-hidden">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 font-semibold">
                  <tr>
                    <th className="p-2 w-16">Heure</th>
                    <th className="p-2 w-28">Catégorie</th>
                    <th className="p-2">Événement & Observations</th>
                    <th className="p-2 w-44">Lieu & Déclarant</th>
                    <th className="p-2 w-20 text-center">Validation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(handover.timelineEvents || INITIAL_TIMELINE_EVENTS).map(ev => (
                    <tr key={ev.id}>
                      <td className="p-2 font-mono font-bold align-top text-indigo-900">
                        {ev.timestamp}
                      </td>
                      <td className="p-2 align-top">
                        <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] uppercase ${
                          ev.severity === 'critical' ? 'bg-rose-100 text-rose-800' :
                          ev.severity === 'urgent' ? 'bg-amber-100 text-amber-800' :
                          ev.severity === 'notable' ? 'bg-blue-100 text-blue-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {ev.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-2 align-top">
                        <strong className="text-slate-900 block">{ev.title}</strong>
                        <span className="text-slate-600 text-[10px] block mt-0.5">{ev.description}</span>
                        {ev.actionTaken && (
                          <span className="text-emerald-700 text-[10px] block mt-0.5 italic">
                            Mesure: {ev.actionTaken}
                          </span>
                        )}
                      </td>
                      <td className="p-2 align-top text-slate-700 text-[10px]">
                        <div className="font-semibold">{ev.location}</div>
                        <span className="text-slate-500">{ev.loggedBy} {ev.badgeNumber && `(${ev.badgeNumber})`}</span>
                      </td>
                      <td className="p-2 text-center align-top">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          ev.isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ev.isVerified ? 'VALIDÉ' : 'EN COURS'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 6: Structured Shift Handover Notes & Watch Directives */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2.5 flex items-center gap-1.5">
              <NotebookPen className="w-3.5 h-3.5 text-indigo-700" />
              <span>6. {language === 'fr' ? 'Consignes & Notes de Relève Structurées (Maintenance, Comportements, Surveillances)' : 'Structured Handover Notes (Maintenance, Behaviors, Inmate Watches)'}</span>
            </h2>

            <div className="space-y-2">
              {(handover.handoverNotes || INITIAL_HANDOVER_NOTES).map(n => (
                <div key={n.id} className="border border-slate-300 rounded p-2.5 bg-slate-50 text-[11px] space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-slate-200 pb-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.2 rounded font-bold text-[9px] uppercase ${
                        n.category === 'inmate_watch' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                        n.category === 'maintenance' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        n.category === 'unusual_behavior' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                        'bg-slate-200 text-slate-800'
                      }`}>
                        {n.category.replace('_', ' ')}
                      </span>
                      <strong className="text-slate-900">{n.title}</strong>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span>{n.location}</span>
                      <span>•</span>
                      <span className="font-mono font-bold text-slate-700">{n.timestamp}</span>
                      <span>•</span>
                      <span className={`px-1.5 py-0.2 rounded font-bold uppercase ${
                        n.urgency === 'critical' ? 'bg-rose-600 text-white' :
                        n.urgency === 'urgent' ? 'bg-amber-500 text-white' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {n.urgency}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-700 leading-relaxed text-[10.5px]">
                    {n.content}
                  </p>

                  {/* Specialized details in print */}
                  {n.inmateWatchDetails && (
                    <div className="p-1.5 bg-white border border-rose-200 rounded text-[10px] text-rose-950 flex flex-wrap items-center justify-between gap-2">
                      <span>
                        <strong>DÉTENU:</strong> {n.inmateWatchDetails.inmateName} ({n.inmateWatchDetails.inmateId}) — {n.inmateWatchDetails.cellLocation}
                      </span>
                      <span>
                        <strong>RÉGIME:</strong> {n.inmateWatchDetails.watchLevel} ({n.inmateWatchDetails.watchIntervalMinutes} min)
                      </span>
                      {n.inmateWatchDetails.keepSeparatedFrom && (
                        <span className="text-purple-800">
                          <strong>SÉPARATION:</strong> {n.inmateWatchDetails.keepSeparatedFrom.join(', ')}
                        </span>
                      )}
                    </div>
                  )}

                  {n.maintenanceDetails && (
                    <div className="p-1.5 bg-white border border-amber-200 rounded text-[10px] text-amber-950 flex flex-wrap items-center justify-between gap-2">
                      <span><strong>OUVRAGE:</strong> {n.maintenanceDetails.equipmentOrAsset}</span>
                      <span><strong>OT:</strong> {n.maintenanceDetails.workOrderRef}</span>
                      <span><strong>PRESTATAIRE:</strong> {n.maintenanceDetails.contractorAccessRequired ? `OUI (${n.maintenanceDetails.contractorName || 'Agréé'})` : 'NON (Régie)'}</span>
                    </div>
                  )}

                  {n.behaviorDetails && (
                    <div className="p-1.5 bg-white border border-purple-200 rounded text-[10px] text-purple-950">
                      <span><strong>ANOMALIE:</strong> {n.behaviorDetails.behaviorType} | <strong>CONDUITE:</strong> {n.behaviorDetails.recommendedResponse}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 border-t border-slate-200/60">
                    <span>Auteur: {n.authorCommander} ({n.authorBadge})</span>
                    <span className={`font-semibold ${n.isAcknowledgedByIncoming ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {n.isAcknowledgedByIncoming 
                        ? `Visa Entrant: Conforme (${n.acknowledgedBy || 'Commandant'} @ ${n.acknowledgedAt || 'Relève'})` 
                        : 'Visa Entrant: EN ATTENTE DE VISA DE PRISE EN CHARGE'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 6.5: Contraband Seized & Evidence Chain of Custody */}
          <div>
            <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-700" />
                <span>6.5 {language === 'fr' ? 'Objets Prohibés Saisis, Classification de Sévérité & Scellés' : 'Contraband Seized Register, Severity Classification & Evidence Vault'}</span>
              </h2>
              <span className="text-[10px] font-mono font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                {(handover.contrabandSeized || INITIAL_CONTRABAND_ITEMS).length} {language === 'fr' ? 'articles confisqués' : 'items confiscated'}
              </span>
            </div>

            <div className="border border-slate-300 rounded overflow-hidden">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 font-semibold">
                  <tr>
                    <th className="p-2 w-24">{language === 'fr' ? 'Réf / Code' : 'Ref / Code'}</th>
                    <th className="p-2">{language === 'fr' ? 'Désignation & Catégorie' : 'Item Name & Category'}</th>
                    <th className="p-2 w-28">{language === 'fr' ? 'Niveau Sévérité' : 'Severity Level'}</th>
                    <th className="p-2 w-36">{language === 'fr' ? 'Lieu Saisie & Détenu' : 'Location & Inmate'}</th>
                    <th className="p-2 w-32">{language === 'fr' ? 'Stockage / Scellé' : 'Storage / Custody'}</th>
                    <th className="p-2 w-28 text-center">{language === 'fr' ? 'Statut Légal' : 'Disposal Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(handover.contrabandSeized || INITIAL_CONTRABAND_ITEMS).map(c => (
                    <tr key={c.id}>
                      <td className="p-2 font-mono font-bold align-top text-indigo-900">
                        {c.chainOfCustodyRef}
                      </td>
                      <td className="p-2 align-top">
                        <strong className="text-slate-900 block">{c.itemDescription}</strong>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          <span>Cat: {c.category.replace('_', ' ')}</span>
                          <span className="mx-1">•</span>
                          <span>Qté: {c.quantity} {c.unit}</span>
                        </div>
                        {c.notes && (
                          <p className="text-[9.5px] text-slate-600 mt-1 italic line-clamp-1">
                            {c.notes}
                          </p>
                        )}
                      </td>
                      <td className="p-2 align-top">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                          c.severityLevel === 'critical' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                          c.severityLevel === 'high' ? 'bg-orange-100 text-orange-800 border border-orange-300' :
                          c.severityLevel === 'medium' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                          'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}>
                          <span>●</span>
                          <span>{c.severityLevel.toUpperCase()}</span>
                        </span>
                      </td>
                      <td className="p-2 align-top text-[10.5px]">
                        <div className="font-semibold text-slate-800">{c.seizedLocation}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {c.seizedFromInmateName ? (
                            <span className="text-rose-900 font-medium">{c.seizedFromInmateName} {c.seizedFromInmateId && `(${c.seizedFromInmateId})`}</span>
                          ) : (
                            <span className="text-slate-400 italic">{language === 'fr' ? 'Non réclamé' : 'Unclaimed'}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-2 align-top text-[10px] text-slate-700">
                        <div className="font-medium text-slate-900">{c.storageLocation}</div>
                        <div className="font-mono text-[9px] text-indigo-700 mt-0.5">Off: {c.seizedByOfficer} ({c.seizedByBadge})</div>
                      </td>
                      <td className="p-2 align-top text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase ${
                          c.disposalStatus === 'transferred_to_police' ? 'bg-blue-100 text-blue-800' :
                          c.disposalStatus === 'slated_for_destruction' ? 'bg-amber-100 text-amber-800' :
                          c.disposalStatus === 'destroyed' ? 'bg-slate-100 text-slate-700 line-through' :
                          c.disposalStatus === 'pending_forensics' ? 'bg-orange-100 text-orange-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {c.disposalStatus.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 6B: Officer Biometric Attendance & Muster Roll Verification */}
          <div className="border-t border-slate-300 pt-3">
            <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Fingerprint className="w-3.5 h-3.5 text-cyan-700" />
                <span>6B. {language === 'fr' ? 'Émargement Biométrique & Appel Électronique des Surveillants' : 'Officer Biometric Check-In & Electronic Muster Roll'}</span>
              </h2>
              <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-cyan-100 text-cyan-900 border border-cyan-300 font-bold">
                {language === 'fr' ? 'HORODATAGE & HASH SHA-256 SCELLÉ' : 'TIMESTAMPED & SHA-256 SEALED'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-[10px] uppercase font-bold text-slate-700 border-b border-slate-300">
                    <th className="p-1.5 border-r border-slate-300">{language === 'fr' ? 'Officier & Matricule' : 'Officer & Badge'}</th>
                    <th className="p-1.5 border-r border-slate-300">{language === 'fr' ? 'Poste Affecté' : 'Assigned Post'}</th>
                    <th className="p-1.5 border-r border-slate-300">{language === 'fr' ? 'Horodatage' : 'Timestamp'}</th>
                    <th className="p-1.5 border-r border-slate-300">{language === 'fr' ? 'Terminal' : 'Terminal'}</th>
                    <th className="p-1.5 border-r border-slate-300">{language === 'fr' ? 'Statut & Doigt' : 'Status & Finger'}</th>
                    <th className="p-1.5">{language === 'fr' ? 'Sceau Cryptographique' : 'Cryptographic Seal'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[10px]">
                  {(handover.biometricCheckIns || INITIAL_BIOMETRIC_CHECKINS).map(record => (
                    <tr key={record.id} className="hover:bg-slate-50">
                      <td className="p-1.5 border-r border-slate-200">
                        <div className="font-bold text-slate-900">{record.officerName}</div>
                        <div className="font-mono text-[9px] text-slate-500">#{record.badgeNumber} &bull; {record.rank}</div>
                      </td>
                      <td className="p-1.5 border-r border-slate-200 text-slate-700">{record.assignedPost}</td>
                      <td className="p-1.5 border-r border-slate-200 font-mono font-semibold text-slate-800">{record.checkInTime}</td>
                      <td className="p-1.5 border-r border-slate-200 font-mono text-[9px] text-slate-600">{record.scannerTerminalId}</td>
                      <td className="p-1.5 border-r border-slate-200">
                        <span className={`px-1.5 py-0.2 rounded font-bold uppercase text-[9px] inline-block ${
                          record.verificationStatus === 'verified' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                          record.verificationStatus === 'manual_override' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                          'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}>
                          {record.verificationStatus === 'verified' ? (language === 'fr' ? 'Vérifié' : 'Verified') :
                           record.verificationStatus === 'manual_override' ? (language === 'fr' ? 'Dérogation' : 'Override') :
                           (language === 'fr' ? 'Échoué' : 'Failed')}
                        </span>
                        <div className="text-[9px] text-slate-500 mt-0.5">
                          {record.fingerScanned ? record.fingerScanned.replace('_', ' ') : 'N/A'} ({record.confidenceScore}%)
                        </div>
                      </td>
                      <td className="p-1.5 font-mono text-[8.5px] text-slate-600 break-all max-w-[120px]">
                        {record.verificationHash.substring(0, 16)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 7: Digital Sign-Off Protocol & Ratification */}
          <div className="border-t-2 border-slate-900 pt-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-indigo-700" />
              <span>7. {language === 'fr' ? 'Signatures Numériques & Ratification Réglementaire' : 'Digital Sign-Offs & Regulatory Ratification'}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[11px]">
              
              {/* Outgoing Commander Box */}
              <div className="p-3 border border-slate-300 rounded bg-slate-50 flex flex-col justify-between min-h-[140px]">
                <div>
                  <span className="text-[10px] font-bold text-amber-900 uppercase block mb-1">
                    {language === 'fr' ? 'Commandant Sortant (Cédant)' : 'Outgoing Commander (Relieved)'}
                  </span>
                  {handover.outgoingSignOff ? (
                    <div>
                      <strong className="text-slate-900 block text-xs">{handover.outgoingSignOff.commanderName}</strong>
                      <span className="text-slate-500 text-[10px] block">{handover.outgoingSignOff.rank} (Matricule: {handover.outgoingSignOff.badgeNumber})</span>
                      <div className="my-2 h-10 flex items-center justify-center bg-white border border-slate-200 rounded p-1">
                        {handover.outgoingSignOff.signatureData.startsWith('data:image') ? (
                          <img src={handover.outgoingSignOff.signatureData} alt="Signature" className="max-h-8 object-contain" />
                        ) : (
                          <span className="font-mono text-[9px] text-indigo-700">{handover.outgoingSignOff.signatureData}</span>
                        )}
                      </div>
                      <span className="text-[9px] text-slate-500 block font-mono">Signé le: {handover.outgoingSignOff.signedAt}</span>
                    </div>
                  ) : (
                    <div className="text-slate-400 italic py-4 text-center">
                      {language === 'fr' ? 'En attente de signature...' : 'Pending digital sign-off...'}
                    </div>
                  )}
                </div>
              </div>

              {/* Incoming Commander Box */}
              <div className="p-3 border border-slate-300 rounded bg-slate-50 flex flex-col justify-between min-h-[140px]">
                <div>
                  <span className="text-[10px] font-bold text-indigo-900 uppercase block mb-1">
                    {language === 'fr' ? 'Commandant Entrant (Prenant)' : 'Incoming Commander (Accepting)'}
                  </span>
                  {handover.incomingSignOff ? (
                    <div>
                      <strong className="text-slate-900 block text-xs">{handover.incomingSignOff.commanderName}</strong>
                      <span className="text-slate-500 text-[10px] block">{handover.incomingSignOff.rank} (Matricule: {handover.incomingSignOff.badgeNumber})</span>
                      <div className="my-2 h-10 flex items-center justify-center bg-white border border-slate-200 rounded p-1">
                        {handover.incomingSignOff.signatureData.startsWith('data:image') ? (
                          <img src={handover.incomingSignOff.signatureData} alt="Signature" className="max-h-8 object-contain" />
                        ) : (
                          <span className="font-mono text-[9px] text-indigo-700">{handover.incomingSignOff.signatureData}</span>
                        )}
                      </div>
                      <span className="text-[9px] text-slate-500 block font-mono">Accepté le: {handover.incomingSignOff.signedAt}</span>
                    </div>
                  ) : (
                    <div className="text-slate-400 italic py-4 text-center">
                      {language === 'fr' ? 'En attente d\'acceptation de garde...' : 'Pending custody acceptance...'}
                    </div>
                  )}
                </div>
              </div>

              {/* Superintendent Governor Box */}
              <div className="p-3 border border-slate-300 rounded bg-slate-50 flex flex-col justify-between min-h-[140px]">
                <div>
                  <span className="text-[10px] font-bold text-slate-900 uppercase block mb-1">
                    {language === 'fr' ? 'Visa Direction / Gouverneur' : 'Superintendent Governor Stamp'}
                  </span>
                  {handover.governorSignOff ? (
                    <div>
                      <strong className="text-slate-900 block text-xs">{handover.governorSignOff.commanderName}</strong>
                      <span className="text-slate-500 text-[10px] block">{handover.governorSignOff.rank}</span>
                      <div className="my-2 h-10 flex items-center justify-center bg-white border border-slate-200 rounded p-1">
                        <span className="font-mono text-[9px] text-emerald-800 font-bold">
                          [CERTIFIED SEAL #{handover.governorSignOff.badgeNumber}]
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-500 block font-mono">Visé le: {handover.governorSignOff.signedAt}</span>
                    </div>
                  ) : (
                    <div className="text-slate-400 italic py-4 text-center">
                      {language === 'fr' ? 'En attente de visa direction...' : 'Pending executive review...'}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Section 8: Prison Warden / Superintendent Official Review & Endorsement Order */}
            <div className="border border-slate-900 rounded-lg p-4 bg-slate-50/80 space-y-3 mt-4 print:page-break-inside-avoid">
              <div className="flex items-center justify-between border-b border-slate-300 pb-2">
                <div>
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>{language === 'fr' ? '8. DÉCISION & VISATION DU DIRECTEUR DE L\'ÉTABLISSEMENT PÉNITENTIAIRE' : '8. PRISON WARDEN / OFFICER IN CHARGE OFFICIAL ENDORSEMENT ORDER'}</span>
                  </span>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {language === 'fr' 
                      ? 'Section statutaire réservée au Directeur / Surintendant pour approbation définitive de la passation de garde et instructions impératives.' 
                      : 'Statutory section reserved for the Prison Warden / Officer in Charge (OIC) review, endorsement seal, and special instructions.'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-slate-900 text-white rounded">
                    FORM-PS-14A / WARDEN
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
                <div className="md:col-span-2 space-y-2">
                  <div className="font-bold text-slate-800 text-[10px] uppercase">
                    {language === 'fr' ? 'DIRECTIVES PARTICULIÈRES DU DIRECTEUR :' : 'WARDEN\'S SPECIAL DIRECTIVES & OBSERVATIONS :'}
                  </div>
                  <div className="p-2.5 bg-white border border-slate-300 rounded min-h-[60px] text-[10px] text-slate-700 italic">
                    {handover.governorSignOff?.handoverNotes || (language === 'fr'
                      ? 'Rapport de relève vérifié ce jour. Ordre de maintenir une vigilance renforcée sur le Quartier Haute Sécurité (Aile A) et d\'assurer le retour sous escorte du convoi judiciaire Milimani. Effectifs de garde conformes.'
                      : 'Shift handover report reviewed and noted. Maintain heightened alert posture across High-Security Wing A. Escort security intake from Milimani Court confirmed. No custodial deviations noted.')}
                  </div>

                  <div className="flex flex-wrap gap-4 text-[10px] text-slate-700">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={!!handover.governorSignOff || handover.status === 'governor_certified'} readOnly className="rounded text-indigo-600" />
                      <span className="font-semibold">{language === 'fr' ? 'Passation de consigne approuvée sans réserve' : 'Handover fully approved without reservation'}</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={handover.headcountSummary.rollCallDiscrepancy === 0} readOnly className="rounded text-indigo-600" />
                      <span className="font-semibold">{language === 'fr' ? 'Effectif écrou certifié exact' : 'Roll-call count certified accurate'}</span>
                    </label>
                  </div>
                </div>

                <div className="border border-slate-300 rounded p-2.5 bg-white flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      {language === 'fr' ? 'Sceau & Signature du Directeur' : 'Warden Seal & Signature'}
                    </span>
                    <strong className="text-slate-900 block text-xs">
                      {handover.governorSignOff?.commanderName || 'Senior Superintendent / Warden'}
                    </strong>
                    <span className="text-slate-500 text-[10px] block">
                      {handover.governorSignOff?.rank || 'Officer in Charge (OIC)'}
                    </span>
                  </div>

                  <div className="my-1.5 py-1.5 px-2 border-2 border-dashed border-emerald-600/60 rounded text-center bg-emerald-50/50">
                    <span className="font-mono text-[9px] font-bold text-emerald-800 uppercase block">
                      {handover.governorSignOff ? `[OFFICIAL SEAL APPLIED - ${handover.governorSignOff.signedAt}]` : '[SUBMITTED FOR WARDEN REVIEW]'}
                    </span>
                    <span className="text-[8px] text-emerald-700 block">REPUBLIC OF KENYA - PRISONS</span>
                  </div>

                  <span className="text-[9px] text-slate-500 font-mono text-center block">
                    {handover.governorSignOff?.signedAt || handover.date}
                  </span>
                </div>
              </div>
            </div>

            {/* Statutory Notice Footnote */}
            <p className="text-[9px] text-slate-400 mt-4 text-center">
              {language === 'fr'
                ? 'Conformément au Règlement pénitentiaire du Kenya et aux Règles minima de Nelson Mandela. Tout faux ou omission délibérée engage la responsabilité disciplinaire et pénale des signataires.'
                : 'Pursuant to Kenya Prisons Standing Orders and UN Standard Minimum Rules for the Treatment of Prisoners (Nelson Mandela Rules). Document is digitally sealed and archived in the master corrections registry.'}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
