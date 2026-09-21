import React, { useState, useMemo } from 'react';
import { PrisonFacility, Inmate, OngoingSecurityIncident } from '../../types';
import { INITIAL_FACILITY_INCIDENTS } from '../../data/facilityHotspotData';
import {
  Printer,
  FileText,
  X,
  AlertTriangle,
  Siren,
  Users,
  Building2,
  ShieldAlert,
  ArrowRightLeft,
  CheckCircle2,
  TrendingUp,
  Download,
  Copy,
  Clock,
  Radio,
  Lock,
  Layers,
  Activity,
  Check,
  ChevronDown,
  Filter,
  Eye,
  BadgeAlert
} from 'lucide-react';

interface HighRiskFacilityReportModalProps {
  facilities: PrisonFacility[];
  inmates: Inmate[];
  onClose: () => void;
  onNavigateToTransfers?: (facilityId?: string) => void;
  onSelectFacility?: (facilityId: string) => void;
  initialFilter?: 'all_high_risk' | 'critical_alerts' | 'overcrowded' | 'all';
}

export const HighRiskFacilityReportModal: React.FC<HighRiskFacilityReportModalProps> = ({
  facilities,
  inmates,
  onClose,
  onNavigateToTransfers,
  onSelectFacility,
  initialFilter = 'all_high_risk'
}) => {
  const [filterScope, setFilterScope] = useState<'all_high_risk' | 'critical_alerts' | 'overcrowded' | 'all'>(initialFilter);
  const [showIncidentBreakdown, setShowIncidentBreakdown] = useState(true);
  const [showStaffingDetails, setShowStaffingDetails] = useState(true);
  const [showDirectives, setShowDirectives] = useState(true);
  const [showComparisonMatrix, setShowComparisonMatrix] = useState(true);
  const [showSignatures, setShowSignatures] = useState(true);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Generate document metadata
  const reportDate = new Date();
  const reportTimestamp = reportDate.toISOString().slice(0, 16).replace('T', ' ') + ' HRS';
  const reportRefNumber = `DOCS-REP-${reportDate.getFullYear()}-Q${Math.floor(reportDate.getMonth() / 3) + 1}-HRF-${String(reportDate.getDate()).padStart(2, '0')}`;

  // Evaluate risk factors for each facility
  const facilityDossiers = useMemo(() => {
    return facilities.map(fac => {
      const activeOfficers = fac.activeOfficers || Math.max(1, Math.round(fac.capacity / 6));
      const recommendedOfficers = fac.recommendedOfficers || Math.ceil(fac.currentInmates / 6);
      const ratio = Number((fac.currentInmates / activeOfficers).toFixed(1));
      const officerDeficit = Math.max(0, recommendedOfficers - activeOfficers);
      const occupancyRate = Math.round((fac.currentInmates / fac.capacity) * 100);
      const surplusInmates = Math.max(0, fac.currentInmates - fac.capacity);
      
      const isOvercrowded = fac.currentInmates > fac.capacity;
      const isNearCapacity = occupancyRate >= 90 && occupancyRate <= 100;
      const isHighRatio = ratio >= 10.0;
      const isModerateRatio = ratio >= 6.5 && ratio < 10.0;
      
      const liveIncidents = fac.ongoingSecurityIncidents || [];
      const hasLiveIncidents = liveIncidents.length > 0;
      
      const historicalIncidents = INITIAL_FACILITY_INCIDENTS.filter(inc => inc.facilityId === fac.id);
      const totalIncidentCount = liveIncidents.length + historicalIncidents.length;
      
      // Breakdown counts
      const criticalIncidentsCount = liveIncidents.filter(i => i.severity === 'CRITICAL').length +
        historicalIncidents.filter(i => i.severity === 'CRITICAL').length;
      const highIncidentsCount = liveIncidents.filter(i => i.severity === 'HIGH').length +
        historicalIncidents.filter(i => i.severity === 'HIGH').length;
      const escapeAttemptsCount = liveIncidents.filter(i => i.type === 'escape_attempt').length +
        historicalIncidents.filter(i => i.category === 'escape_attempt').length;
      const medicalIncidentsCount = liveIncidents.filter(i => i.type === 'medical_code_red').length +
        historicalIncidents.filter(i => i.category === 'medical_alert').length;
      const disturbanceCount = liveIncidents.filter(i => i.type === 'disturbance' || i.type === 'contraband_lockdown').length +
        historicalIncidents.filter(i => i.category === 'violence_contraband' || i.category === 'structural_breach').length;

      // Calculate composite risk score (0-100)
      let riskScore = 0;
      if (occupancyRate > 120) riskScore += 35;
      else if (occupancyRate > 100) riskScore += 25;
      else if (occupancyRate >= 90) riskScore += 15;

      if (ratio >= 14) riskScore += 35;
      else if (ratio >= 10) riskScore += 25;
      else if (ratio >= 7) riskScore += 15;

      if (hasLiveIncidents) riskScore += 25;
      riskScore += Math.min(15, totalIncidentCount * 2);
      riskScore = Math.min(100, Math.max(10, riskScore));

      const isCriticalAlert = isHighRatio || hasLiveIncidents;
      const isHighRisk = isCriticalAlert || occupancyRate >= 90 || riskScore >= 50;

      const riskReasons: string[] = [];
      if (isHighRatio) riskReasons.push(`High Inmate-to-Officer Ratio: ${ratio}:1 (Deficit: -${officerDeficit} officers)`);
      if (isOvercrowded) riskReasons.push(`Overcrowded: ${occupancyRate}% Capacity (+${surplusInmates} inmate bed deficit)`);
      if (isNearCapacity) riskReasons.push(`Near Capacity Warning: ${occupancyRate}% Bed Usage`);
      if (hasLiveIncidents) riskReasons.push(`${liveIncidents.length} Active Code-Red Security Incident(s)`);
      if (criticalIncidentsCount > 0) riskReasons.push(`${criticalIncidentsCount} Critical Severity Incidents Recorded`);

      return {
        facility: fac,
        activeOfficers,
        recommendedOfficers,
        ratio,
        officerDeficit,
        occupancyRate,
        surplusInmates,
        isOvercrowded,
        isNearCapacity,
        isHighRatio,
        isModerateRatio,
        liveIncidents,
        hasLiveIncidents,
        historicalIncidents,
        totalIncidentCount,
        criticalIncidentsCount,
        highIncidentsCount,
        escapeAttemptsCount,
        medicalIncidentsCount,
        disturbanceCount,
        riskScore,
        isCriticalAlert,
        isHighRisk,
        riskReasons
      };
    });
  }, [facilities]);

  // Filtered dossiers according to user selection
  const filteredDossiers = useMemo(() => {
    switch (filterScope) {
      case 'critical_alerts':
        return facilityDossiers.filter(d => d.isCriticalAlert);
      case 'overcrowded':
        return facilityDossiers.filter(d => d.occupancyRate >= 90);
      case 'all':
        return facilityDossiers;
      case 'all_high_risk':
      default:
        return facilityDossiers.filter(d => d.isHighRisk);
    }
  }, [facilityDossiers, filterScope]);

  // Summary aggregates across the filtered high-risk facilities
  const summaryAggregates = useMemo(() => {
    const totalFacilities = filteredDossiers.length;
    const totalInmates = filteredDossiers.reduce((acc, d) => acc + d.facility.currentInmates, 0);
    const totalCapacity = filteredDossiers.reduce((acc, d) => acc + d.facility.capacity, 0);
    const avgOccupancy = totalCapacity > 0 ? Math.round((totalInmates / totalCapacity) * 100) : 0;
    const totalSurplus = filteredDossiers.reduce((acc, d) => acc + d.surplusInmates, 0);
    const totalLiveIncidents = filteredDossiers.reduce((acc, d) => acc + d.liveIncidents.length, 0);
    const totalIncidents = filteredDossiers.reduce((acc, d) => acc + d.totalIncidentCount, 0);
    const totalOfficerDeficit = filteredDossiers.reduce((acc, d) => acc + d.officerDeficit, 0);
    const criticalFacilitiesCount = filteredDossiers.filter(d => d.isCriticalAlert).length;

    return {
      totalFacilities,
      totalInmates,
      totalCapacity,
      avgOccupancy,
      totalSurplus,
      totalLiveIncidents,
      totalIncidents,
      totalOfficerDeficit,
      criticalFacilitiesCount
    };
  }, [filteredDossiers]);

  // Handler for triggering browser print / save as PDF
  const handlePrint = () => {
    window.print();
  };

  // Copy Markdown summary for fast executive dispatch
  const handleCopyMarkdown = () => {
    let md = `# NATIONAL PRISON SURVEILLANCE DIRECTIVE: HIGH-RISK FACILITIES AUDIT\n`;
    md += `**Document Ref:** ${reportRefNumber} | **Generated:** ${reportTimestamp}\n`;
    md += `**Classification:** OFFICIAL / RESTRICTED - COMMAND LEVEL DISTRIBUTION\n\n`;
    md += `## EXECUTIVE SUMMARY\n`;
    md += `- **High-Risk Facilities:** ${summaryAggregates.totalFacilities}\n`;
    md += `- **Total Inmates In Custody:** ${summaryAggregates.totalInmates.toLocaleString()} / ${summaryAggregates.totalCapacity.toLocaleString()} (${summaryAggregates.avgOccupancy}% Occupancy)\n`;
    md += `- **Net Capacity Overrun:** +${summaryAggregates.totalSurplus.toLocaleString()} surplus inmates\n`;
    md += `- **Active Security Incidents:** ${summaryAggregates.totalLiveIncidents}\n`;
    md += `- **Custodial Staff Deficit:** -${summaryAggregates.totalOfficerDeficit} officers\n\n`;
    md += `## HIGH-RISK FACILITY PROFILES\n\n`;

    filteredDossiers.forEach(d => {
      md += `### ${d.facility.name} (${d.facility.code})\n`;
      md += `- **Security Level:** ${d.facility.securityRating} | **County:** ${d.facility.county}\n`;
      md += `- **Warden:** ${d.facility.wardenName}\n`;
      md += `- **Capacity Usage:** ${d.facility.currentInmates}/${d.facility.capacity} (${d.occupancyRate}%)${d.isOvercrowded ? ` [OVERCROWDED +${d.surplusInmates}]` : ''}\n`;
      md += `- **Officer Ratio:** ${d.ratio}:1 (Active: ${d.activeOfficers}, Deficit: -${d.officerDeficit})\n`;
      md += `- **Incident Count:** ${d.totalIncidentCount} total (${d.liveIncidents.length} active live)\n`;
      if (d.liveIncidents.length > 0) {
        md += `  - **Active Incident:** ${d.liveIncidents[0].title} (${d.liveIncidents[0].severity})\n`;
      }
      md += `- **Risk Drivers:** ${d.riskReasons.join('; ')}\n\n`;
    });

    navigator.clipboard.writeText(md);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto printable-modal-backdrop">
      <div 
        className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden text-slate-900 printable-report-modal my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* INTERACTIVE CONTROLS TOOLBAR (HIDDEN IN PRINT) */}
        <div className="no-print bg-slate-900 text-white p-3 sm:p-4 border-b border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#714B67] rounded-lg text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-amber-400 text-slate-950">
                  PRINTABLE PDF TOOL
                </span>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                  {reportRefNumber}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                High-Risk Facility Situation & Capacity Report
              </h2>
            </div>
          </div>

          {/* Action Buttons & Filter Dropdown */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
            {/* Filter Scope Selector */}
            <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
              <select
                value={filterScope}
                onChange={(e) => setFilterScope(e.target.value as any)}
                className="bg-transparent text-white font-medium focus:outline-hidden cursor-pointer text-xs pr-2"
                title="Filter report facility scope"
              >
                <option value="all_high_risk" className="bg-slate-900 text-white">
                  High-Risk Facilities (Alerts + Overcrowded) ({facilityDossiers.filter(d => d.isHighRisk).length})
                </option>
                <option value="critical_alerts" className="bg-slate-900 text-white">
                  Critical Alerts Only (Ratio ≥10:1 / Incidents) ({facilityDossiers.filter(d => d.isCriticalAlert).length})
                </option>
                <option value="overcrowded" className="bg-slate-900 text-white">
                  Overcrowded Facilities (≥90% Beds) ({facilityDossiers.filter(d => d.occupancyRate >= 90).length})
                </option>
                <option value="all" className="bg-slate-900 text-white">
                  All National Facilities ({facilityDossiers.length})
                </option>
              </select>
            </div>

            {/* Copy SITREP text button */}
            <button
              onClick={handleCopyMarkdown}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Copy formatted Markdown SITREP to clipboard"
            >
              {copiedNotification ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedNotification ? 'Copied!' : 'Copy SITREP'}</span>
            </button>

            {/* Print / Save as PDF Primary Button */}
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-[#714B67] hover:bg-[#85587a] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ring-1 ring-white/20"
              title="Trigger browser print dialog (Save as PDF or print to paper)"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close report dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SECTION CUSTOMIZER STRIP (HIDDEN IN PRINT) */}
        <div className="no-print bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center justify-between gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-bold text-slate-600 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              Include In Printout:
            </span>
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={showIncidentBreakdown}
                onChange={e => setShowIncidentBreakdown(e.target.checked)}
                className="rounded text-[#714B67] focus:ring-[#714B67]"
              />
              <span>Incident Breakdown</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={showStaffingDetails}
                onChange={e => setShowStaffingDetails(e.target.checked)}
                className="rounded text-[#714B67] focus:ring-[#714B67]"
              />
              <span>Staffing Ratios & Deficits</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={showDirectives}
                onChange={e => setShowDirectives(e.target.checked)}
                className="rounded text-[#714B67] focus:ring-[#714B67]"
              />
              <span>Directives & Reallocations</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={showComparisonMatrix}
                onChange={e => setShowComparisonMatrix(e.target.checked)}
                className="rounded text-[#714B67] focus:ring-[#714B67]"
              />
              <span>National Comparison Table</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={showSignatures}
                onChange={e => setShowSignatures(e.target.checked)}
                className="rounded text-[#714B67] focus:ring-[#714B67]"
              />
              <span>Officer Sign-Off</span>
            </label>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            Showing <strong className="text-slate-800">{filteredDossiers.length}</strong> of {facilities.length} facilities
          </div>
        </div>

        {/* PRINTABLE DOCUMENT BODY */}
        <div className="overflow-y-auto p-4 sm:p-8 space-y-6 bg-white print:p-0 print:overflow-visible">
          {/* OFFICIAL DIRECTORATE LETTERHEAD (PRINT HEADER) */}
          <div className="border-b-2 border-slate-900 pb-4 print:pb-3 space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="h-4 w-1 bg-red-600 inline-block rounded-xs" />
                  <span className="text-[11px] font-mono uppercase tracking-widest font-black text-slate-700">
                    REPUBLIC OF KENYA • MINISTRY OF INTERIOR & NATIONAL ADMINISTRATION
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase">
                  State Department for Correctional Services
                </h1>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                  National Directorate of Operations, Custody & Surveillance Headquarters — Nairobi
                </p>
              </div>

              <div className="text-right shrink-0 border-l border-slate-200 pl-4">
                <div className="inline-block bg-rose-600 text-white text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded tracking-wider shadow-2xs">
                  RESTRICTED // LAW ENFORCEMENT SENSITIVE
                </div>
                <div className="text-[11px] font-mono font-bold text-slate-700 mt-1">
                  REF: {reportRefNumber}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  DATE: {reportTimestamp}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs flex-wrap gap-2">
              <div className="font-bold text-slate-800 flex items-center gap-2">
                <BadgeAlert className="w-4 h-4 text-rose-600" />
                <span>EXECUTIVE SITUATION REPORT: HIGH-RISK FACILITIES, INCIDENT FREQUENCY & CAPACITY SURVEILLANCE</span>
              </div>
              <div className="text-slate-500 text-[11px] font-mono">
                Mandate: Cap 90 Laws of Kenya / Statutory Duty Security Audit
              </div>
            </div>
          </div>

          {/* EXECUTIVE KEY METRICS SUMMARY STRIP */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 print:border-slate-400 print:bg-slate-50/50 print-avoid-break">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center justify-between">
              <span>National Tactical Threat Assessment Summary</span>
              <span className="text-rose-700 font-mono font-black text-[10px] bg-rose-100 px-2 py-0.5 rounded">
                THREAT LEVEL: ELEVATED TACTICAL SURVEILLANCE
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* Metric 1 */}
              <div className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-2xs">
                <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-slate-600" />
                  <span>Flagged Facilities</span>
                </div>
                <div className="text-xl font-mono font-black text-slate-900 mt-0.5">
                  {summaryAggregates.totalFacilities}
                </div>
                <div className="text-[10px] text-slate-500">
                  {summaryAggregates.criticalFacilitiesCount} under critical alert
                </div>
              </div>

              {/* Metric 2 */}
              <div className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-2xs">
                <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                  <Users className="w-3 h-3 text-slate-600" />
                  <span>Inmates in Flagged Units</span>
                </div>
                <div className="text-xl font-mono font-black text-slate-900 mt-0.5">
                  {summaryAggregates.totalInmates.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500">
                  Capacity: {summaryAggregates.totalCapacity.toLocaleString()}
                </div>
              </div>

              {/* Metric 3 */}
              <div className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-2xs">
                <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-amber-600" />
                  <span>Average Capacity Usage</span>
                </div>
                <div className={`text-xl font-mono font-black mt-0.5 ${
                  summaryAggregates.avgOccupancy > 100 ? 'text-rose-600' : 'text-amber-600'
                }`}>
                  {summaryAggregates.avgOccupancy}%
                </div>
                <div className="text-[10px] font-bold text-rose-600">
                  +{summaryAggregates.totalSurplus} surplus inmates
                </div>
              </div>

              {/* Metric 4 */}
              <div className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-2xs">
                <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                  <Siren className="w-3 h-3 text-rose-600" />
                  <span>Active Live Incidents</span>
                </div>
                <div className="text-xl font-mono font-black text-rose-600 mt-0.5">
                  {summaryAggregates.totalLiveIncidents}
                </div>
                <div className="text-[10px] text-rose-600 font-bold">
                  Code-red lockdowns
                </div>
              </div>

              {/* Metric 5 */}
              <div className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-2xs">
                <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-slate-600" />
                  <span>Total Incidents Recorded</span>
                </div>
                <div className="text-xl font-mono font-black text-slate-800 mt-0.5">
                  {summaryAggregates.totalIncidents}
                </div>
                <div className="text-[10px] text-slate-500">
                  Breaches & Medicals
                </div>
              </div>

              {/* Metric 6 */}
              <div className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-2xs">
                <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-rose-600" />
                  <span>Custodial Staff Deficit</span>
                </div>
                <div className="text-xl font-mono font-black text-rose-600 mt-0.5">
                  -{summaryAggregates.totalOfficerDeficit}
                </div>
                <div className="text-[10px] text-rose-700 font-bold">
                  Immediate reinforcement
                </div>
              </div>
            </div>
          </div>

          {/* NATIONAL COMPARISON & SURVEILLANCE TABLE */}
          {showComparisonMatrix && (
            <div className="space-y-2 print-avoid-break">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-slate-600" />
                  <span>Table 1: Institutional Risk, Capacity & Incident Matrix</span>
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">
                  Benchmark: Ratio ≤6:1, Capacity ≤100%
                </span>
              </div>

              <div className="border border-slate-300 rounded-lg overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-300">
                    <tr>
                      <th className="p-2.5">Facility / Code</th>
                      <th className="p-2.5">Security Level</th>
                      <th className="p-2.5 text-right">Capacity</th>
                      <th className="p-2.5 text-right">Population</th>
                      <th className="p-2.5 text-center">Capacity Usage</th>
                      <th className="p-2.5 text-center">Staff Ratio</th>
                      <th className="p-2.5 text-center">Staff Deficit</th>
                      <th className="p-2.5 text-center">Active Incidents</th>
                      <th className="p-2.5 text-center">Total Incidents</th>
                      <th className="p-2.5 text-center">Risk Index</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                    {filteredDossiers.map(d => (
                      <tr 
                        key={`matrix-${d.facility.id}`}
                        className={`hover:bg-slate-50 transition-colors ${
                          d.isCriticalAlert ? 'bg-rose-50/50 font-medium' : ''
                        }`}
                      >
                        <td className="p-2.5 font-sans font-bold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            {d.isCriticalAlert && (
                              <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                            )}
                            <span>{d.facility.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">({d.facility.code})</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-sans font-normal">
                            {d.facility.wardenName} • {d.facility.county}
                          </div>
                        </td>
                        <td className="p-2.5 text-slate-700 font-sans">
                          {d.facility.securityRating}
                        </td>
                        <td className="p-2.5 text-right text-slate-700">
                          {d.facility.capacity}
                        </td>
                        <td className="p-2.5 text-right font-bold text-slate-900">
                          {d.facility.currentInmates}
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            d.occupancyRate > 100
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : d.occupancyRate >= 90
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}>
                            {d.occupancyRate}% {d.isOvercrowded ? `(+${d.surplusInmates})` : ''}
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            d.ratio >= 10
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : d.ratio >= 6.5
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}>
                            {d.ratio} : 1
                          </span>
                        </td>
                        <td className="p-2.5 text-center font-bold text-rose-600">
                          {d.officerDeficit > 0 ? `-${d.officerDeficit}` : '0'}
                        </td>
                        <td className="p-2.5 text-center">
                          {d.liveIncidents.length > 0 ? (
                            <span className="px-1.5 py-0.5 bg-rose-600 text-white rounded font-bold text-[10px]">
                              {d.liveIncidents.length} LIVE
                            </span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </td>
                        <td className="p-2.5 text-center text-slate-800 font-bold">
                          {d.totalIncidentCount}
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
                            d.riskScore >= 75
                              ? 'bg-rose-600 text-white'
                              : d.riskScore >= 50
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-200 text-slate-800'
                          }`}>
                            {d.riskScore}/100
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* DETAILED HIGH-RISK FACILITY PROFILES & INCIDENT DOSSIERS */}
          <div className="space-y-6">
            <div className="border-b border-slate-300 pb-1.5 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Section 2: High-Risk Institutional Vulnerability Dossiers</span>
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">
                Individual Facility Inspection & Security Audit
              </span>
            </div>

            {filteredDossiers.map((dossier, idx) => {
              const { facility } = dossier;
              return (
                <div 
                  key={`dossier-${facility.id}`}
                  className="border-2 border-slate-300 rounded-xl overflow-hidden shadow-xs print:shadow-none print:border-slate-400 print-avoid-break bg-white"
                >
                  {/* Facility Card Header */}
                  <div className={`p-3.5 sm:p-4 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    dossier.isCriticalAlert
                      ? 'bg-rose-50/90 border-rose-300 text-slate-900'
                      : 'bg-slate-100 border-slate-300 text-slate-900'
                  }`}>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-slate-900 text-white">
                          ITEM 2.{idx + 1}
                        </span>
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-800 border border-slate-300">
                          {facility.code}
                        </span>
                        {dossier.isCriticalAlert && (
                          <span className="bg-rose-600 text-white text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1 shadow-2xs">
                            <Siren className="w-3 h-3" />
                            CRITICAL ALERT FACILITY
                          </span>
                        )}
                        {dossier.isOvercrowded && (
                          <span className="bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-bold px-2 py-0.5 rounded">
                            OVERCROWDED (+{dossier.surplusInmates} INMATES)
                          </span>
                        )}
                      </div>

                      <h4 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                        {facility.name}
                      </h4>
                      <p className="text-xs text-slate-600 flex items-center gap-2 mt-0.5 flex-wrap">
                        <span>Superintendent: <strong>{facility.wardenName}</strong></span>
                        <span>•</span>
                        <span>Security Level: <strong>{facility.securityRating}</strong></span>
                        <span>•</span>
                        <span>Location: <strong>{facility.location}, {facility.county}</strong></span>
                      </p>
                    </div>

                    <div className="text-right shrink-0 bg-white border border-slate-300 rounded-lg p-2 sm:px-3 sm:py-1.5 shadow-2xs">
                      <div className="text-[10px] font-bold uppercase text-slate-500">
                        Facility Risk Score
                      </div>
                      <div className={`text-xl font-mono font-black ${
                        dossier.riskScore >= 75 ? 'text-rose-600' : dossier.riskScore >= 50 ? 'text-amber-600' : 'text-slate-800'
                      }`}>
                        {dossier.riskScore} <span className="text-xs font-normal text-slate-500">/ 100</span>
                      </div>
                      <div className="text-[10px] font-bold text-rose-700 uppercase">
                        {dossier.riskScore >= 75 ? 'Critical Priority' : dossier.riskScore >= 50 ? 'High Priority' : 'Guarded'}
                      </div>
                    </div>
                  </div>

                  {/* Facility Card Content */}
                  <div className="p-4 sm:p-5 space-y-4 text-xs">
                    {/* Primary Highlight Columns: Capacity Usage & Staffing Ratios */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Capacity Usage Highlight Box */}
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-700 flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-slate-600" />
                            <span>Capacity & Occupancy Analysis</span>
                          </span>
                          <span className={`font-mono font-extrabold text-xs px-2 py-0.5 rounded ${
                            dossier.occupancyRate > 100
                              ? 'bg-rose-600 text-white'
                              : dossier.occupancyRate >= 90
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-emerald-600 text-white'
                          }`}>
                            {dossier.occupancyRate}% OCCUPANCY
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex border border-slate-300">
                            <div 
                              className={`h-full transition-all ${
                                dossier.occupancyRate > 100
                                  ? 'bg-rose-600'
                                  : dossier.occupancyRate >= 90
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-600'
                              }`}
                              style={{ width: `${Math.min(100, dossier.occupancyRate)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] font-mono text-slate-500">
                            <span>0 beds</span>
                            <span>Design Cap: {facility.capacity}</span>
                            <span className="font-bold text-slate-900">Current: {facility.currentInmates}</span>
                          </div>
                        </div>

                        {/* Detailed Capacity Breakdown */}
                        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200 text-center font-mono">
                          <div>
                            <div className="text-[10px] text-slate-500 font-sans">Design Beds</div>
                            <div className="font-bold text-slate-800">{facility.capacity}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-500 font-sans">Current Inmates</div>
                            <div className="font-bold text-slate-900">{facility.currentInmates}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-500 font-sans">Net Surplus / Deficit</div>
                            <div className={`font-bold ${dossier.isOvercrowded ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {dossier.isOvercrowded ? `+${dossier.surplusInmates} Over` : `${facility.capacity - facility.currentInmates} Free`}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Staffing & Supervision Ratio Highlight Box */}
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-700 flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-slate-600" />
                            <span>Custodial Staffing & Safety Ratios</span>
                          </span>
                          <span className={`font-mono font-extrabold text-xs px-2 py-0.5 rounded ${
                            dossier.ratio >= 10.0
                              ? 'bg-rose-600 text-white'
                              : dossier.ratio >= 6.5
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-emerald-600 text-white'
                          }`}>
                            {dossier.ratio} : 1 RATIO
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center font-mono py-1">
                          <div className="bg-white p-2 rounded border border-slate-200">
                            <div className="text-[10px] text-slate-500 font-sans">Active Guards</div>
                            <div className="font-bold text-slate-800 text-sm">{dossier.activeOfficers}</div>
                          </div>
                          <div className="bg-white p-2 rounded border border-slate-200">
                            <div className="text-[10px] text-slate-500 font-sans">Required (6:1)</div>
                            <div className="font-bold text-slate-800 text-sm">{dossier.recommendedOfficers}</div>
                          </div>
                          <div className="bg-white p-2 rounded border border-slate-200">
                            <div className="text-[10px] text-slate-500 font-sans">Officer Deficit</div>
                            <div className="font-bold text-rose-600 text-sm">
                              {dossier.officerDeficit > 0 ? `-${dossier.officerDeficit}` : '0'}
                            </div>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200">
                          <strong>Standard Compliance:</strong> Statutory baseline requires a 4:1 to 6:1 custody ratio. Ratios exceeding 10:1 present critical vulnerability during cell block muster and recreation periods.
                        </div>
                      </div>
                    </div>

                    {/* Incident Counts & Threat Distribution Highlight */}
                    {showIncidentBreakdown && (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5">
                            <Siren className="w-4 h-4 text-rose-600" />
                            <span>Incident Intelligence & Risk Counts</span>
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            Total Recorded: <strong className="text-slate-900">{dossier.totalIncidentCount}</strong> (Live Active: <strong className="text-rose-600">{dossier.liveIncidents.length}</strong>)
                          </span>
                        </div>

                        {/* Category Distribution Pills */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                          <div className="bg-rose-50 border border-rose-200 p-2 rounded-lg">
                            <div className="text-[10px] uppercase font-bold text-rose-700">Escape Breaches</div>
                            <div className="text-base font-mono font-bold text-rose-900">{dossier.escapeAttemptsCount}</div>
                          </div>
                          <div className="bg-amber-50 border border-amber-200 p-2 rounded-lg">
                            <div className="text-[10px] uppercase font-bold text-amber-700">Disturbances / Weapons</div>
                            <div className="text-base font-mono font-bold text-amber-900">{dossier.disturbanceCount}</div>
                          </div>
                          <div className="bg-blue-50 border border-blue-200 p-2 rounded-lg">
                            <div className="text-[10px] uppercase font-bold text-blue-700">Medical Code Reds</div>
                            <div className="text-base font-mono font-bold text-blue-900">{dossier.medicalIncidentsCount}</div>
                          </div>
                          <div className="bg-slate-100 border border-slate-200 p-2 rounded-lg">
                            <div className="text-[10px] uppercase font-bold text-slate-700">Critical Severity</div>
                            <div className="text-base font-mono font-bold text-slate-900">{dossier.criticalIncidentsCount}</div>
                          </div>
                        </div>

                        {/* Ongoing Live Security Incidents Details (if any) */}
                        {dossier.liveIncidents.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-[11px] font-bold uppercase text-rose-800 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                              <span>Ongoing Active Security Incident Details:</span>
                            </div>
                            {dossier.liveIncidents.map(inc => (
                              <div 
                                key={`live-${inc.id}`}
                                className="bg-rose-50 border border-rose-300 rounded-lg p-3 space-y-1.5 text-slate-800"
                              >
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="bg-rose-600 text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded">
                                      {inc.severity}
                                    </span>
                                    <span className="font-bold text-slate-900 text-xs">
                                      {inc.title}
                                    </span>
                                  </div>
                                  <div className="text-[10px] font-mono text-slate-600">
                                    Reported: {inc.reportedTime} • Zone: <strong>{inc.locationZone}</strong>
                                  </div>
                                </div>
                                <p className="text-xs text-slate-700">
                                  {inc.description}
                                </p>
                                {inc.tacticalUnitsDeployed && inc.tacticalUnitsDeployed.length > 0 && (
                                  <div className="text-[10px] text-slate-600 flex items-center gap-1.5 pt-1">
                                    <strong className="text-slate-800">Tactical Response Deployed:</strong>
                                    <span>{inc.tacticalUnitsDeployed.join(', ')}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Operational Directives & Inter-Prison Reallocations */}
                    {showDirectives && (
                      <div className="bg-slate-100/80 border border-slate-200 rounded-lg p-3 space-y-1.5">
                        <div className="font-bold text-slate-800 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <ArrowRightLeft className="w-3.5 h-3.5 text-[#714B67]" />
                            <span>Directorate Operational Directives & Transfer Re-Allocation</span>
                          </span>
                          <span className="text-[10px] font-mono font-bold text-[#714B67]">
                            DIRECTIVE REF: DIR-{facility.code}-2026
                          </span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px]">
                          {dossier.isOvercrowded && (
                            <li>
                              <strong>Mandatory Decrowding Requisition:</strong> Requisition immediate inter-prison transfer of at least <strong>{Math.min(150, dossier.surplusInmates)}</strong> convicted inmates to regional medium/open camps (Naivasha Open Camp / Lang'ata Trust) to restore operational headcount within rated capacity.
                            </li>
                          )}
                          {dossier.isHighRatio && (
                            <li>
                              <strong>Custodial Reinforcement Detail:</strong> Deploy a detachment of <strong>{Math.min(30, dossier.officerDeficit)}</strong> standby correctional officers from the National Tactical Reinforcement Unit to mitigate severe supervision exposure.
                            </li>
                          )}
                          {dossier.hasLiveIncidents && (
                            <li>
                              <strong>Code-Red Containment Protocol:</strong> Maintain red perimeter perimeter lockdown, K9 perimeter sweeps, and continuous biometric muster roll calls until final containment sign-off.
                            </li>
                          )}
                          <li>
                            <strong>Warden Bi-Hourly SITREP:</strong> Facility Warden ({facility.wardenName}) to submit encrypted radio SITREP updates every two hours directly to the National Command Bunker.
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* STATUTORY SIGN-OFF & OFFICIAL CHAIN OF CUSTODY (PRINT FOOTER) */}
          {showSignatures && (
            <div className="border-t-2 border-slate-900 pt-5 print:pt-4 space-y-4 print-avoid-break">
              <div className="text-[10px] font-mono uppercase tracking-widest font-black text-slate-600">
                Section 3: Statutory Certification & Endorsement
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                {/* Sign-off 1 */}
                <div className="border border-slate-300 rounded-lg p-3 space-y-2 bg-slate-50/50">
                  <div className="text-[10px] font-bold uppercase text-slate-500">Prepared By:</div>
                  <div className="h-10 border-b border-dashed border-slate-400 flex items-end">
                    <span className="font-serif italic text-sm text-slate-800">Capt. Marcus Vance</span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-800">Chief Intelligence & Surveillance Officer</div>
                  <div className="text-[10px] text-slate-500 font-mono">Service No: CP-89201 • Shift Alpha</div>
                </div>

                {/* Sign-off 2 */}
                <div className="border border-slate-300 rounded-lg p-3 space-y-2 bg-slate-50/50">
                  <div className="text-[10px] font-bold uppercase text-slate-500">Verified & Approved By:</div>
                  <div className="h-10 border-b border-dashed border-slate-400 flex items-end">
                    <span className="font-serif italic text-sm text-slate-800">Brig. Gen. (Rtd.) Patrick Mwangi</span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-800">Director of Operations & Custodial Services</div>
                  <div className="text-[10px] text-slate-500 font-mono">National Directorate HQ • Nairobi</div>
                </div>

                {/* Sign-off 3: Official Seal */}
                <div className="border border-slate-300 rounded-lg p-3 flex flex-col items-center justify-center text-center bg-slate-50/50">
                  <div className="w-14 h-14 rounded-full border-2 border-slate-400 flex flex-col items-center justify-center text-[8px] font-mono text-slate-500 uppercase tracking-tighter">
                    <span>★ OFFICIAL ★</span>
                    <span className="font-bold text-[9px] text-slate-700">KENYA PRISONS</span>
                    <span>HEADQUARTERS</span>
                  </div>
                  <div className="text-[9px] font-mono text-slate-500 mt-1">
                    SEALED & ARCHIVED • {reportTimestamp}
                  </div>
                </div>
              </div>

              {/* Legal Disclaimer */}
              <div className="text-[9px] text-slate-500 text-center font-mono pt-2 border-t border-slate-200">
                CONFIDENTIAL LEGAL NOTICE: This official surveillance audit report is prepared under the statutory authority of the Kenya Prisons Act (Cap 90). Unauthorized reproduction or external dissemination is strictly prohibited under the Official Secrets Act.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
