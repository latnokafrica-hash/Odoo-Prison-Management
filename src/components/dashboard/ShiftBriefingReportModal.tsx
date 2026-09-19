import React, { useState } from 'react';
import { 
  ShiftBriefingReportData, 
  formatReportPlainText 
} from '../../utils/shiftBriefingReport';
import { Language, ShiftType } from '../../types';
import { 
  Printer, 
  Copy, 
  Check, 
  X, 
  Shield, 
  ShieldAlert, 
  AlertTriangle, 
  Users, 
  Truck, 
  Building2, 
  Clock, 
  FileText, 
  Radio, 
  Key, 
  Lock, 
  Activity, 
  Download,
  Flame,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

interface ShiftBriefingReportModalProps {
  report: ShiftBriefingReportData;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onShiftChange?: (shift: ShiftType) => void;
}

export const ShiftBriefingReportModal: React.FC<ShiftBriefingReportModalProps> = ({
  report,
  isOpen,
  onClose,
  language,
  onShiftChange,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'facilities' | 'alerts' | 'movements'>('all');

  if (!isOpen) return null;

  const isFr = language === 'fr';

  const handleCopyText = async () => {
    try {
      const text = formatReportPlainText(report, language);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy report text: ', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const shiftLabels: Record<ShiftType, { en: string; fr: string }> = {
    morning: { en: 'Morning Watch (06:00 - 14:00)', fr: 'Quart du Matin (06:00 - 14:00)' },
    afternoon: { en: 'Afternoon / Swing (14:00 - 22:00)', fr: 'Quart d\'Après-Midi (14:00 - 22:00)' },
    night: { en: 'Night Vigilance (22:00 - 06:00)', fr: 'Quart de Nuit (22:00 - 06:00)' },
    standby: { en: 'Tactical Standby & Relief', fr: 'Réserve Tactique & Relève' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      {/* Modal Container */}
      <div 
        id="shift-briefing-modal-container"
        className="relative w-full max-w-5xl bg-white rounded-xl shadow-2xl border border-slate-300 flex flex-col max-h-[94vh] overflow-hidden my-auto"
      >
        {/* Top Control Bar (Screen only, hidden in print) */}
        <div className="no-print p-4 bg-slate-900 border-b border-slate-800 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#714B67] text-white flex items-center justify-center shrink-0 shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-400/30">
                  {isFr ? 'Rapport Exécutif' : 'Command Briefing'}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {report.reportId}
                </span>
              </div>
              <h3 className="text-base font-bold text-white">
                {isFr ? 'Rapport de Briefing de Quart des Sentinelles' : 'Official Shift Briefing & Threat Report'}
              </h3>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            {/* Shift Quick Switcher */}
            {onShiftChange && (
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
                {(['morning', 'afternoon', 'night'] as ShiftType[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => onShiftChange(s)}
                    className={`px-2.5 py-1 rounded text-xs font-medium capitalize transition-colors ${
                      report.shift === s
                        ? 'bg-[#714B67] text-white shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
              title={isFr ? 'Copier le texte du rapport' : 'Copy plain text summary to clipboard'}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? (isFr ? 'Copié !' : 'Copied!') : (isFr ? 'Copier Texte' : 'Copy Text')}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
              title={isFr ? 'Imprimer le rapport de briefing' : 'Print Shift Briefing Sheet'}
            >
              <Printer className="w-4 h-4" />
              <span>{isFr ? 'Imprimer le Rapport' : 'Print Briefing Report'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Navigation Tabs (Screen only) */}
        <div className="no-print px-4 py-2 bg-slate-100 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
          <span className="text-slate-500 font-medium whitespace-nowrap">
            {isFr ? 'Section :' : 'Jump to section:'}
          </span>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              activeTab === 'all' 
                ? 'bg-slate-800 text-white' 
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isFr ? 'Vue Complète (Toutes Sections)' : 'Full Briefing (All Sections)'}
          </button>
          <button
            onClick={() => setActiveTab('facilities')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
              activeTab === 'facilities' 
                ? 'bg-slate-800 text-white' 
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{isFr ? 'Population par Établissement' : 'Inmate Headcounts'}</span>
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
              activeTab === 'alerts' 
                ? 'bg-slate-800 text-white' 
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>{isFr ? 'Alertes 24h' : '24H Critical Alerts'} ({report.criticalAlerts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
              activeTab === 'movements' 
                ? 'bg-slate-800 text-white' 
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-indigo-500" />
            <span>{isFr ? 'Convois Haute Sécurité' : 'High-Risk Movements'} ({report.highRiskMovements.length})</span>
          </button>
        </div>

        {/* Scrollable Printable Report Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50" id="shift-briefing-printable">
          {/* Printable Official Document Header */}
          <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-300 shadow-2xs">
            <div className="border-b-2 border-slate-900 pb-4 mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xl border border-slate-700">
                    <Shield className="w-7 h-7 text-amber-400" />
                  </div>
                  <div>
                    <h1 className="text-base sm:text-lg font-black uppercase tracking-wide text-slate-950">
                      {isFr 
                        ? 'SERVICE PÉNITENTIAIRE NATIONAL • DIRECTION DE LA SÉCURITÉ' 
                        : 'KENYA PRISONS SERVICE • STATE DEPARTMENT FOR CORRECTIONAL SERVICES'}
                    </h1>
                    <h2 className="text-sm sm:text-base font-bold text-[#714B67] uppercase tracking-wider">
                      {isFr 
                        ? 'RAPPORT OFFICIEL DE BRIEFING DE QUART & ALERTES SITUATIONNELLES' 
                        : 'OFFICIAL SHIFT BRIEFING & THREAT DISCLOSURE REPORT'}
                    </h2>
                    <p className="text-[11px] font-mono text-slate-500">
                      CLASSIFICATION: <span className="font-bold text-red-700">RESTRICTED // LAW ENFORCEMENT SENSITIVE // DUTY MUSTER</span>
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right text-xs font-mono text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
                  <div><strong>REF:</strong> {report.reportId}</div>
                  <div><strong>ISSUED:</strong> {report.generatedAtFormatted}</div>
                  <div><strong>QUART:</strong> {report.shift.toUpperCase()} ({report.shiftHours})</div>
                </div>
              </div>
            </div>

            {/* Document Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  {isFr ? 'Officier de Garde' : 'Duty Commander'}
                </span>
                <span className="font-semibold text-slate-900">{report.commandingOfficer}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  {isFr ? 'Quart de Service' : 'Active Duty Watch'}
                </span>
                <span className="font-semibold text-indigo-900 capitalize">
                  {shiftLabels[report.shift][language === 'fr' ? 'fr' : 'en']}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  {isFr ? 'Effectif Sentinelles en Poste' : 'Officers on Duty'}
                </span>
                <span className="font-semibold text-emerald-700">
                  {report.staffingSummary.totalOfficersOnDuty} {isFr ? 'Officiers' : 'Sentinels'} ({report.staffingSummary.totalArmedSentinels} {isFr ? 'Armés' : 'Armed'})
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  {isFr ? 'Conformité des Postes' : 'Statutory Manning'}
                </span>
                <span className={`font-semibold ${report.staffingSummary.understaffedBlocks.length > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {report.staffingSummary.overallCoveragePercent}% {report.staffingSummary.understaffedBlocks.length > 0 ? (isFr ? '(Attention)' : '(Deficit Alert)') : (isFr ? '(Complet)' : '(100% Compliant)')}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 1: Total Current Inmate Counts per Facility */}
          {(activeTab === 'all' || activeTab === 'facilities') && (
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-300 shadow-2xs space-y-4 print-avoid-break">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-700" />
                      <span>{isFr ? 'Recensement Total des Détenus par Établissement Pénitentiaire' : 'Total Current Inmate Counts per Prison Facility'}</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      {isFr 
                        ? 'Effectifs réels, capacité d\'accueil, taux d\'occupation et ventilation des régimes de garde' 
                        : 'Certified capacity, live population headcounts, density percentage, and custody status breakdown'}
                    </p>
                  </div>
                </div>

                {/* Overcrowding Status Pill */}
                {report.systemSummary.overcrowdedFacilitiesCount > 0 ? (
                  <span className="px-2.5 py-1 rounded text-xs font-bold bg-red-100 text-red-800 border border-red-300 flex items-center gap-1 shrink-0">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                    {report.systemSummary.overcrowdedFacilitiesCount} {isFr ? 'Établissements Suroccupés' : 'Facilities Overcrowded (>100%)'}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {isFr ? 'Capacités Réglementaires Respectées' : 'All Facilities Within Capacity'}
                  </span>
                )}
              </div>

              {/* System Aggregated KPI Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 text-center">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-500">{isFr ? 'Total Détenus' : 'Total Inmates'}</div>
                  <div className="text-lg sm:text-xl font-black text-slate-900">{report.systemSummary.totalInmates.toLocaleString()}</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-500">{isFr ? 'Capacité Totale' : 'Total Capacity'}</div>
                  <div className="text-lg sm:text-xl font-black text-slate-700">{report.systemSummary.totalCapacity.toLocaleString()}</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-500">{isFr ? 'Taux d\'Occupation' : 'System Density'}</div>
                  <div className={`text-lg sm:text-xl font-black ${report.systemSummary.overallOccupancyRate > 100 ? 'text-red-700' : 'text-slate-900'}`}>
                    {report.systemSummary.overallOccupancyRate}%
                  </div>
                </div>
                <div className="p-2.5 bg-amber-50/60 rounded-lg border border-amber-200">
                  <div className="text-[10px] uppercase font-bold text-amber-800">{isFr ? 'Prévenus / Remand' : 'Remand / Pre-Trial'}</div>
                  <div className="text-lg sm:text-xl font-black text-amber-900">{report.systemSummary.totalRemand.toLocaleString()}</div>
                </div>
                <div className="p-2.5 bg-purple-50/60 rounded-lg border border-purple-200">
                  <div className="text-[10px] uppercase font-bold text-purple-800">{isFr ? 'Condamnés' : 'Convicted'}</div>
                  <div className="text-lg sm:text-xl font-black text-purple-900">{report.systemSummary.totalConvicted.toLocaleString()}</div>
                </div>
                <div className="p-2.5 bg-red-50/60 rounded-lg border border-red-200">
                  <div className="text-[10px] uppercase font-bold text-red-800">{isFr ? 'Haute Sécurité CAT A' : 'CAT A High Threat'}</div>
                  <div className="text-lg sm:text-xl font-black text-red-900">{report.systemSummary.totalCatAHighSecurity.toLocaleString()}</div>
                </div>
              </div>

              {/* Table of Facilities */}
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">{isFr ? 'Établissement & Code' : 'Facility & Code'}</th>
                      <th className="py-2.5 px-3">{isFr ? 'Niveau Sécurité' : 'Security Level'}</th>
                      <th className="py-2.5 px-3 text-right">{isFr ? 'Effectif / Capacité' : 'Count / Capacity'}</th>
                      <th className="py-2.5 px-3 text-center">{isFr ? 'Occupation' : 'Density'}</th>
                      <th className="py-2.5 px-3 text-right">{isFr ? 'Prévenus' : 'Remand'}</th>
                      <th className="py-2.5 px-3 text-right">{isFr ? 'Condamnés' : 'Convicted'}</th>
                      <th className="py-2.5 px-3 text-right">{isFr ? 'CAT A' : 'CAT A'}</th>
                      <th className="py-2.5 px-3 text-center">{isFr ? 'Statut' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                    {report.facilityCounts.map((fac) => (
                      <tr key={fac.facilityId} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{fac.facilityName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{fac.facilityCode} • {fac.county}</div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {fac.securityRating}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">
                          <span className="font-bold text-slate-900">{fac.currentInmates.toLocaleString()}</span>
                          <span className="text-slate-400"> / {fac.capacity.toLocaleString()}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                            fac.occupancyRate > 100 
                              ? 'bg-red-100 text-red-800 border border-red-200' 
                              : fac.occupancyRate >= 90
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}>
                            {fac.occupancyRate}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-amber-700">{fac.remandCount.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-purple-700">{fac.convictedCount.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-red-700 font-bold">{fac.highSecurityCatACount.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-center">
                          {fac.status === 'overcrowded' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-800">
                              {isFr ? 'Suroccupé' : 'Overcrowded'}
                            </span>
                          ) : fac.status === 'near_capacity' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                              {isFr ? 'Seuil Critique' : 'Near Capacity'}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                              {isFr ? 'Normal' : 'Normal'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 2: Critical Alerts for the Next 24 Hours */}
          {(activeTab === 'all' || activeTab === 'alerts') && (
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-300 shadow-2xs space-y-4 print-avoid-break">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-600" />
                      <span>{isFr ? 'Alertes Critiques pour les Prochaines 24 Heures' : 'Critical Alerts for the Next 24 Hours'}</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      {isFr 
                        ? 'Consignes impératives de sécurité, surveillance médicale, audience judiciaire et interventions' 
                        : 'Immediate situational threats, suicidal/medical watches, hardware faults, and mandatory officer actions'}
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 shrink-0">
                  <Flame className="w-3.5 h-3.5 text-red-600" />
                  {report.criticalAlerts.length} {isFr ? 'Alertes Actives au Registre' : 'Active Operational Directives'}
                </span>
              </div>

              {/* Alerts Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {report.criticalAlerts.map((alert) => {
                  const title = isFr ? alert.titleFr : alert.titleEn;
                  const desc = isFr ? alert.descriptionFr : alert.descriptionEn;
                  const action = isFr ? alert.actionRequiredFr : alert.actionRequiredEn;

                  const isCritical = alert.level === 'CRITICAL_HIGH';
                  const isHigh = alert.level === 'HIGH_ALERT';

                  return (
                    <div 
                      key={alert.id}
                      className={`p-3.5 rounded-lg border flex flex-col justify-between transition-shadow ${
                        isCritical 
                          ? 'bg-red-50/40 border-red-300' 
                          : isHigh 
                          ? 'bg-amber-50/40 border-amber-300' 
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div>
                        {/* Header badges */}
                        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              isCritical 
                                ? 'bg-red-600 text-white' 
                                : isHigh 
                                ? 'bg-amber-600 text-white' 
                                : 'bg-slate-600 text-white'
                            }`}>
                              {alert.level.replace('_', ' ')}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-700 uppercase">
                              {alert.category}
                            </span>
                          </div>

                          <span className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {alert.timeframe}
                          </span>
                        </div>

                        {/* Title & Entity */}
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                          {title}
                        </h4>
                        <div className="text-[11px] text-indigo-700 font-semibold mt-0.5">
                          🎯 {alert.affectedEntity} • <span className="text-slate-600 font-normal">{alert.facilityName}</span>
                        </div>

                        {/* Briefing Narrative */}
                        <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                          {desc}
                        </p>
                      </div>

                      {/* Mandatory Action Box */}
                      <div className="mt-3 pt-2.5 border-t border-slate-200/80">
                        <div className="p-2 rounded bg-white border border-slate-200 text-[11px] text-slate-900 flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-red-700 font-bold uppercase mr-1">
                              {isFr ? 'Action Requise :' : 'Mandatory Action:'}
                            </strong>
                            <span>{action}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 3: High-Risk Inmate Movements & Armed Convoys */}
          {(activeTab === 'all' || activeTab === 'movements') && (
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-300 shadow-2xs space-y-4 print-avoid-break">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#714B67]" />
                      <span>{isFr ? 'Mouvements & Extractions de Détenus à Haut Risque' : 'High-Risk Inmate Movements & Armed Convoys'}</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      {isFr 
                        ? 'Convois d\'escorte judiciaire CAT A, transferts pénitentiaires inter-établissements et précautions tactiques' 
                        : 'Armed tactical transit missions, inmate threat profiles, assigned armored fleet, and rules of engagement'}
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded text-xs font-bold bg-purple-100 text-purple-900 border border-purple-300 flex items-center gap-1 shrink-0">
                  <Shield className="w-3.5 h-3.5 text-[#714B67]" />
                  {report.highRiskMovements.length} {isFr ? 'Missions Programmées' : 'Active High-Risk Operations'}
                </span>
              </div>

              {/* Movement Mission Cards */}
              <div className="space-y-3.5">
                {report.highRiskMovements.map((mov) => {
                  const precautions = isFr ? mov.mandatoryPrecautionsFr : mov.mandatoryPrecautionsEn;

                  return (
                    <div 
                      key={mov.id}
                      className="p-4 rounded-lg border border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                    >
                      {/* Top Mission Banner */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-900 text-white">
                            {mov.missionCode}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-200">
                            {mov.threatRating.replace(/_/g, ' ')}
                          </span>
                          <span className="text-xs text-slate-500 font-medium capitalize">
                            • {mov.movementType.replace(/_/g, ' ')}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-mono text-slate-700">
                          <Radio className="w-3.5 h-3.5 text-indigo-600" />
                          <span>COMMS: {mov.radioChannel}</span>
                          <span className="text-slate-300">|</span>
                          <span className="font-semibold text-emerald-700">{mov.status}</span>
                        </div>
                      </div>

                      {/* Route & Escort Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-3">
                        <div className="p-2.5 bg-white rounded border border-slate-200">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">{isFr ? 'Itinéraire' : 'Transit Corridor'}</span>
                          <div className="font-semibold text-slate-900 mt-0.5">
                            {mov.originFacility}
                          </div>
                          <div className="text-indigo-600 font-bold mt-0.5 flex items-center gap-1">
                            <span>➔ {mov.destination}</span>
                          </div>
                        </div>

                        <div className="p-2.5 bg-white rounded border border-slate-200">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">{isFr ? 'Escorte & Commandement' : 'Command & Armed Force'}</span>
                          <div className="font-semibold text-slate-900 mt-0.5">{mov.escortCommander}</div>
                          <div className="text-slate-600 mt-0.5 flex items-center gap-1">
                            <Shield className="w-3 h-3 text-slate-500" />
                            <span>{mov.armedOfficersCount} {isFr ? 'Officiers Armés Spécialisés' : 'Armed Tactical Guards'}</span>
                          </div>
                        </div>

                        <div className="p-2.5 bg-white rounded border border-slate-200">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">{isFr ? 'Horaire & Véhicules' : 'Schedule & Fleet'}</span>
                          <div className="font-semibold text-slate-900 mt-0.5">{mov.scheduledTime}</div>
                          <div className="text-slate-600 mt-0.5 text-[11px] font-mono truncate" title={mov.vehiclesAssigned.join(', ')}>
                            {mov.vehiclesAssigned.join(', ')}
                          </div>
                        </div>
                      </div>

                      {/* Inmates Under Escort */}
                      <div className="bg-white p-3 rounded border border-slate-200 mb-3">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5">
                          {isFr ? 'Détenus Sous Escorte Armée :' : 'Detainees Under Armed Custody Manifest:'}
                        </span>
                        <div className="space-y-1.5">
                          {mov.inmates.map((inm, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 text-xs border-b border-slate-100 pb-1 last:border-0 last:pb-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">{inm.name}</span>
                                {inm.alias && (
                                  <span className="text-slate-500 italic text-[11px]">"{inm.alias}"</span>
                                )}
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-800">
                                  {inm.securityCategory}
                                </span>
                              </div>
                              <div className="text-slate-600 text-[11px]">
                                {inm.threatProfile}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Mandatory Precautions */}
                      <div className="bg-amber-50/50 p-2.5 rounded border border-amber-200/70 text-xs">
                        <span className="text-[10px] uppercase font-bold text-amber-900 block mb-1">
                          {isFr ? 'Consignes & Règles d\'Engagement Tactiques :' : 'Mandatory Tactical Precautions & Rules of Engagement:'}
                        </span>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-800 list-disc list-inside">
                          {precautions.map((prec, pIdx) => (
                            <li key={pIdx} className="leading-tight">{prec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 4: Shift Guard Manning & Cell Block Post Compliance */}
          {activeTab === 'all' && (
            <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-300 shadow-2xs space-y-4 print-avoid-break">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <div className="w-7 h-7 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  4
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>{isFr ? 'Dispositif du Personnel de Garde & Couverture des Quartiers' : 'Shift Sentinel Manning & Cell Block Post Verification'}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isFr 
                      ? 'Récapitulatif des sentinelles déployées, armement et respects des seuils légaux de présence' 
                      : 'Audit of officers on duty, armed armory allocations, and minimum statutory post coverage'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{isFr ? 'Sentinelles Actives' : 'Active Sentinels'}</span>
                  <div className="text-xl font-black text-slate-900">{report.staffingSummary.totalOfficersOnDuty}</div>
                  <div className="text-[11px] text-slate-500">{isFr ? 'En poste de coursive' : 'On cell block duty'}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{isFr ? 'Sentinelles Armées' : 'Armed Sentinels'}</span>
                  <div className="text-xl font-black text-slate-900">{report.staffingSummary.totalArmedSentinels}</div>
                  <div className="text-[11px] text-slate-500">{isFr ? 'Armes de dotation' : 'Authorized sidearms/rifles'}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{isFr ? 'Réserve d\'Intervention' : 'Standby Reserves'}</span>
                  <div className="text-xl font-black text-slate-900">{report.staffingSummary.totalStandbyReserves}</div>
                  <div className="text-[11px] text-slate-500">{isFr ? 'Disponibles immédiatement' : 'Immediate tactical response'}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{isFr ? 'Taux de Couverture' : 'Coverage Compliance'}</span>
                  <div className={`text-xl font-black ${report.staffingSummary.overallCoveragePercent < 100 ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {report.staffingSummary.overallCoveragePercent}%
                  </div>
                  <div className="text-[11px] text-slate-500">{isFr ? 'Des postes minimaux' : 'Statutory guard minimums'}</div>
                </div>
              </div>

              {/* Understaffed Warning Alert if any */}
              {report.staffingSummary.understaffedBlocks.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold uppercase block">
                      {isFr ? 'Alerte Effectif Minimal Non Atteint :' : 'Understaffed Wing Manning Warning:'}
                    </strong>
                    <span>
                      {report.staffingSummary.understaffedBlocks.map(b => `${b.blockName}: ${b.assignedCount}/${b.requiredCount} officers (-${b.deficit})`).join(' • ')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Official Sign-Off Block for Printed Physical Handover */}
          <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-300 shadow-2xs print-avoid-break">
            <div className="text-xs font-bold uppercase text-slate-500 mb-3 border-b border-slate-200 pb-1">
              {isFr 
                ? 'CERTIFICATION DE TRANSMISSION DU QUART & REGISTRE D\'ÉMARGEMENT' 
                : 'OFFICIAL SHIFT BRIEFING HANDOVER SIGN-OFF & CUSTODY PROTOCOL'}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 text-xs">
              <div className="space-y-8">
                <div>
                  <div className="text-[11px] font-bold text-slate-700">
                    {isFr ? '1. Commandant de Quart Sortant' : '1. Outgoing Shift Commander'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {isFr ? 'Certification des effectifs et consignes' : 'Headcount and arms verified accurate'}
                  </div>
                </div>
                <div className="border-b border-slate-400 pt-6"></div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {isFr ? 'Signature & Date / Heure' : 'Signature & Date / Time'}
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <div className="text-[11px] font-bold text-slate-700">
                    {isFr ? '2. Commandant de Quart Entrant' : '2. Incoming Shift Commander'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {isFr ? 'Prise de service & validation du briefing' : 'Custody accepted & briefing acknowledged'}
                  </div>
                </div>
                <div className="border-b border-slate-400 pt-6"></div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {isFr ? 'Signature & Date / Heure' : 'Signature & Date / Time'}
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <div className="text-[11px] font-bold text-slate-700">
                    {isFr ? '3. Visa du Superintendant / Directeur' : '3. Superintendent / Duty Governor'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {isFr ? 'Approbation administrative & sceau officiel' : 'Official command authority validation'}
                  </div>
                </div>
                <div className="border-b border-slate-400 pt-6"></div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {isFr ? 'Tampon Réglementaire & Signature' : 'Official Seal & Signature Stamp'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer (Screen only) */}
        <div className="no-print p-3.5 bg-slate-100 border-t border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>
              {isFr ? 'Données synchronisées en direct avec le registre Odoo 19' : 'Live synchronized with Odoo 19 Central Database'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isFr ? 'Imprimer cette Fiche' : 'Print Shift Briefing Sheet'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
            >
              {isFr ? 'Fermer' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
