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
  Clock 
} from 'lucide-react';

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

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const text = `
================================================================================
KENYA PRISONS SERVICE - DIGITAL SHIFT HANDOVER BRIEF / PROCÈS-VERBAL DE RELÈVE
================================================================================
Reference: ${handover.referenceNumber}
Facility:  ${handover.facilityName} (ID: ${handover.facilityId})
Date:      ${handover.date}
Shift:     ${handover.outgoingShift.toUpperCase()} -> ${handover.incomingShift.toUpperCase()}
Status:    ${handover.status.toUpperCase()}

1. CUSTODY BALANCE & RECONCILIATION
--------------------------------------------------------------------------------
Total Population:       ${handover.headcountSummary.totalInmates} / ${handover.headcountSummary.certifiedCapacity} capacity
Remand Detainees:       ${handover.headcountSummary.remandCount}
Convicted Inmates:      ${handover.headcountSummary.convictedCount}
High-Security CAT A:    ${handover.headcountSummary.highSecurityCount}
Solitary / Segregation: ${handover.headcountSummary.solitaryCount}
Infirmary / Hospital:   ${handover.headcountSummary.hospitalCount}
Court Transit Escorts:  ${handover.headcountSummary.courtTransitCount}
Headcount Discrepancy:  ${handover.headcountSummary.rollCallDiscrepancy === 0 ? '0 (100% Accounted)' : 'ALERT: MISMATCH'}

2. CURRENT FACILITY RISKS & SITUATIONAL THREATS
--------------------------------------------------------------------------------
${handover.risks.map((r, i) => `[${i + 1}] [${r.severity}] ${r.title}
    Location:   ${r.location}
    Details:    ${r.description}
    Mitigation: ${r.mitigation}
    Status:     ${r.isAcknowledgedByIncoming ? 'ACKNOWLEDGED BY INCOMING' : 'PENDING ACKNOWLEDGMENT'}
`).join('\n')}

3. PENDING OPERATIONAL DIRECTIVES & TASKS
--------------------------------------------------------------------------------
${handover.tasks.map((t, i) => `[${i + 1}] [${t.priority.toUpperCase()}] ${t.title} (Due: ${t.dueTime})
    Assignee: ${t.assignedOfficer} [${t.assignedRole}]
    Status:   ${t.status.toUpperCase()}
    Details:  ${t.description}
`).join('\n')}

4. CRITICAL EQUIPMENT & ARMORY VERIFICATION
--------------------------------------------------------------------------------
${handover.equipment.map(e => `- ${e.name}: Expected ${e.expectedQty}, Counted ${e.countedQty} ${e.unit} [${e.condition.toUpperCase()}] Location: ${e.storageLocation} ${e.discrepancyNote ? `(Note: ${e.discrepancyNote})` : ''}`).join('\n')}

5. DIGITAL SIGN-OFF & COMMAND RATIFICATION
--------------------------------------------------------------------------------
Outgoing Commander: ${handover.outgoingSignOff?.commanderName || 'NOT SIGNED'} (${handover.outgoingSignOff?.rank || ''} - ${handover.outgoingSignOff?.badgeNumber || ''})
Signed At:          ${handover.outgoingSignOff?.signedAt || 'PENDING'}
Declaration:        ${handover.outgoingSignOff?.declarationConfirmed ? 'CONFIRMED' : 'UNCONFIRMED'}

Incoming Commander: ${handover.incomingSignOff?.commanderName || 'NOT SIGNED'} (${handover.incomingSignOff?.rank || ''} - ${handover.incomingSignOff?.badgeNumber || ''})
Accepted At:        ${handover.incomingSignOff?.signedAt || 'PENDING'}
Declaration:        ${handover.incomingSignOff?.declarationConfirmed ? 'CONFIRMED' : 'UNCONFIRMED'}

Superintendent:     ${handover.governorSignOff?.commanderName || 'NOT RATIFIED'} (${handover.governorSignOff?.rank || ''})
Certified At:       ${handover.governorSignOff?.signedAt || 'PENDING'}
================================================================================
Generated via Odoo 19 Corrections Suite
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto print:p-0 print:static print:bg-white print:overflow-visible">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden print:border-none print:shadow-none print:max-h-none print:w-full print:rounded-none">
        
        {/* Modal Top Control Bar (Hidden on Print) */}
        <div className="no-print px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            <div>
              <span className="font-bold text-sm">
                {language === 'fr' ? 'Dossier Officiel de Passation de Quart' : 'Official Shift Handover Dossier'}
              </span>
              <span className="ml-2 text-xs font-mono text-indigo-300">
                {handover.referenceNumber}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700"
              title="Copy Telex Plaintext"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? (language === 'fr' ? 'Copié !' : 'Copied !') : (language === 'fr' ? 'Copier Texte' : 'Copy Text')}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>{language === 'fr' ? 'Imprimer le Dossier' : 'Print Handover'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-1"
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
              <span>{language === 'fr' ? 'PROCÈS-VERBAL OFFICIEL DE PASSATION DE CONSIGNES ET DE GARDE' : 'OFFICIAL SHIFT HANDOVER & CUSTODY ASSIGNMENT BRIEF'}</span>
              <span className="font-mono text-[10px] text-slate-300">RULE 14 COMPLIANT</span>
            </div>
          </div>

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

          {/* Section 2: Current Facility Risks */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2.5 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              <span>2. {language === 'fr' ? 'Risques Établissement & Situations d\'Alerte' : 'Current Facility Risks & Operational Alerts'}</span>
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
                        <span className="text-slate-500 text-[10px]">{e.storageLocation}</span>
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
                        {e.discrepancyNote || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 5: Digital Sign-Off Protocol & Ratification */}
          <div className="border-t-2 border-slate-900 pt-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-indigo-700" />
              <span>5. {language === 'fr' ? 'Signatures Numériques & Ratification Réglementaire' : 'Digital Sign-Offs & Regulatory Ratification'}</span>
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
