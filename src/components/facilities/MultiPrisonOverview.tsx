import React, { useState, useMemo } from 'react';
import { PrisonFacility, Inmate, OngoingSecurityIncident } from '../../types';
import { FacilityHotspotView } from './FacilityHotspotView';
import { CapacityProjectionChart } from './CapacityProjectionChart';
import { ComparativeGrowthChart } from './ComparativeGrowthChart';
import { CriticalAlertSitrepModal } from './CriticalAlertSitrepModal';
import { HighRiskFacilityReportModal } from './HighRiskFacilityReportModal';
import { FacilityInspectionMaintenanceSidebar } from './FacilityInspectionMaintenanceSidebar';
import { 
  Building2, 
  Users, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRightLeft, 
  MapPin, 
  Shield,
  PieChart as PieChartIcon,
  TrendingUp,
  Activity,
  Maximize2,
  Truck,
  ArrowRight,
  Filter,
  Info,
  ExternalLink,
  ChevronRight,
  Flame,
  Map as MapIcon,
  Siren,
  Radio,
  Lock,
  Zap,
  BadgeAlert,
  Printer,
  FileText,
  CalendarDays,
  Wrench,
  ClipboardCheck
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface MultiPrisonOverviewProps {
  facilities: PrisonFacility[];
  inmates: Inmate[];
  selectedFacilityId: string;
  onSelectFacility: (id: string) => void;
  onOpenNewModal: () => void;
  onNavigateToTransfers?: (facilityId?: string) => void;
  onOpenTransferModal?: (inmate: Inmate) => void;
}

// Facility brand colors designed for contrast and semantic recognition
const FACILITY_COLORS = [
  '#DC2626', // Red - Kamiti / High Overcrowding
  '#714B67', // Odoo Plum - Lang'ata Women's
  '#D97706', // Amber - Shimo La Tewa Coast
  '#EA580C', // Orange - King'ong'o Remand
  '#059669', // Emerald - Naivasha Open
  '#2563EB', // Blue
  '#7C3AED', // Violet
  '#0891B2', // Cyan
];

export const MultiPrisonOverview: React.FC<MultiPrisonOverviewProps> = ({
  facilities,
  inmates,
  selectedFacilityId,
  onSelectFacility,
  onOpenNewModal,
  onNavigateToTransfers,
  onOpenTransferModal
}) => {
  const [activeView, setActiveView] = useState<'capacity' | 'growth' | 'hotspot'>('capacity');
  const [capacityFilter, setCapacityFilter] = useState<'all' | 'criticalAlert' | 'exceeding90' | 'overcrowded' | 'normal'>('all');
  const [selectedSitrepFacility, setSelectedSitrepFacility] = useState<PrisonFacility | null>(null);
  const [securityHeatmapEnabled, setSecurityHeatmapEnabled] = useState<boolean>(true);
  const [securityHeatmapMetric, setSecurityHeatmapMetric] = useState<'composite' | 'density' | 'ratio' | 'incidents'>('composite');
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [reportInitialFilter, setReportInitialFilter] = useState<'all_high_risk' | 'critical_alerts' | 'overcrowded' | 'all'>('all_high_risk');
  const [isCalendarSidebarOpen, setIsCalendarSidebarOpen] = useState<boolean>(false);
  const [isCalendarSidebarDocked, setIsCalendarSidebarDocked] = useState<boolean>(false);

  const totalCapacity = facilities.reduce((acc, f) => acc + f.capacity, 0);
  const totalCurrentInmates = facilities.reduce((acc, f) => acc + f.currentInmates, 0);
  const nationalOccupancy = Math.round((totalCurrentInmates / totalCapacity) * 100);

  // Critical Alert Evaluation Map: Inmate-to-Officer ratios and Ongoing Security Incidents
  const facilityAlertMap = useMemo(() => {
    const map = new Map<string, {
      activeOfficers: number;
      recommendedOfficers: number;
      ratio: number;
      isHighRatio: boolean;
      officerDeficit: number;
      ongoingIncidents: OngoingSecurityIncident[];
      hasOngoingIncidents: boolean;
      isCriticalAlert: boolean;
      criticalAlertReasons: string[];
    }>();

    facilities.forEach(fac => {
      const activeOfficers = fac.activeOfficers || Math.max(1, Math.round(fac.capacity / 6));
      const recommendedOfficers = fac.recommendedOfficers || Math.ceil(fac.currentInmates / 6);
      const ratio = Number((fac.currentInmates / activeOfficers).toFixed(1));
      const officerDeficit = Math.max(0, recommendedOfficers - activeOfficers);
      // High ratio threshold is >= 10:1 (international standard is 4:1 to 6:1; statutory warning > 8:1)
      const isHighRatio = ratio >= 10.0;
      const ongoingIncidents = fac.ongoingSecurityIncidents || [];
      const hasOngoingIncidents = ongoingIncidents.length > 0;
      const isCriticalAlert = isHighRatio || hasOngoingIncidents;

      const criticalAlertReasons: string[] = [];
      if (isHighRatio) {
        criticalAlertReasons.push(`High Inmate-to-Officer Ratio: ${ratio}:1 (Deficit: -${officerDeficit} Officers)`);
      }
      if (hasOngoingIncidents) {
        criticalAlertReasons.push(`${ongoingIncidents.length} Ongoing Security Incident(s)`);
      }

      map.set(fac.id, {
        activeOfficers,
        recommendedOfficers,
        ratio,
        isHighRatio,
        officerDeficit,
        ongoingIncidents,
        hasOngoingIncidents,
        isCriticalAlert,
        criticalAlertReasons
      });
    });

    return map;
  }, [facilities]);

  const criticalAlertFacilities = facilities.filter(f => facilityAlertMap.get(f.id)?.isCriticalAlert);
  const criticalAlertCount = criticalAlertFacilities.length;

  // Prepare chart data: each facility's real-time capacity usage percentage
  const chartData = facilities.map((fac, idx) => {
    const occupancyRate = Math.round((fac.currentInmates / fac.capacity) * 100);
    const isOvercrowded = fac.currentInmates > fac.capacity;
    const isExceeding90 = occupancyRate >= 90;
    const alertData = facilityAlertMap.get(fac.id);

    return {
      id: fac.id,
      name: fac.name,
      code: fac.code,
      value: occupancyRate, // Capacity usage percentage
      occupancyRate,
      currentInmates: fac.currentInmates,
      capacity: fac.capacity,
      location: fac.location,
      county: fac.county,
      type: fac.type,
      isOvercrowded,
      isExceeding90,
      isCriticalAlert: alertData?.isCriticalAlert ?? false,
      ratio: alertData?.ratio ?? 6.0,
      activeOfficers: alertData?.activeOfficers ?? 100,
      hasOngoingIncidents: alertData?.hasOngoingIncidents ?? false,
      wardenName: fac.wardenName,
      color: FACILITY_COLORS[idx % FACILITY_COLORS.length]
    };
  });

  const overcrowdedCount = chartData.filter(d => d.occupancyRate > 100).length;
  const high90To100Count = chartData.filter(d => d.occupancyRate >= 90 && d.occupancyRate <= 100).length;
  const exceeding90Count = chartData.filter(d => d.occupancyRate >= 90).length;
  const optimalCount = chartData.filter(d => d.occupancyRate < 90).length;

  const exceeding90Facilities = facilities.filter(f => Math.round((f.currentInmates / f.capacity) * 100) >= 90);

  // Filter facilities for grid display based on active filter
  const displayedFacilities = facilities.filter(fac => {
    const alertData = facilityAlertMap.get(fac.id);
    if (capacityFilter === 'criticalAlert') return alertData?.isCriticalAlert;
    const rate = Math.round((fac.currentInmates / fac.capacity) * 100);
    if (capacityFilter === 'exceeding90') return rate >= 90;
    if (capacityFilter === 'overcrowded') return rate > 100;
    if (capacityFilter === 'normal') return rate < 90;
    return true;
  });

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      {/* Top Directorate Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] bg-[#714B67] text-white font-mono font-bold px-2 py-0.5 rounded">
              NATIONAL HEADQUARTERS
            </span>
            <span className="text-xs text-slate-500">Ministry of Interior & National Administration</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#714B67]" />
            National Directorate of Correctional Services - Multi-Prison ERP
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Centralized capacity surveillance, operational critical alert overlays, and rapid inter-prison transfer re-allocation engine.
          </p>
        </div>

        {/* National Aggregates with Critical Alert Card */}
        <div className="flex items-center space-x-3 text-right flex-wrap sm:flex-nowrap">
          {/* Critical Alerts Metric Badge */}
          <button
            onClick={() => setCapacityFilter(capacityFilter === 'criticalAlert' ? 'all' : 'criticalAlert')}
            className={`border p-2.5 rounded-lg text-right transition-all cursor-pointer ${
              capacityFilter === 'criticalAlert'
                ? 'bg-rose-100 border-rose-400 ring-2 ring-rose-400/40 shadow-xs'
                : criticalAlertCount > 0
                ? 'bg-rose-50/80 hover:bg-rose-100/90 border-rose-300'
                : 'bg-slate-50 border-slate-200'
            }`}
            title="Toggle Critical Alert facilities (High ratio or active incident)"
          >
            <div className="text-[10px] uppercase font-bold text-rose-800 flex items-center justify-end gap-1">
              <Siren className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
              <span>Critical Alerts</span>
            </div>
            <div className="text-xl font-mono font-extrabold text-rose-600 flex items-center justify-end gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
              {criticalAlertCount} {criticalAlertCount === 1 ? 'Facility' : 'Facilities'}
            </div>
            <div className="text-[9px] text-rose-700 font-medium">
              High Ratio / Incidents
            </div>
          </button>

          <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
            <div className="text-[10px] uppercase font-bold text-slate-500">National Occupancy</div>
            <div className={`text-xl font-mono font-extrabold ${nationalOccupancy > 100 ? 'text-rose-600' : nationalOccupancy >= 90 ? 'text-amber-600' : 'text-slate-900'}`}>
              {nationalOccupancy}%
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
            <div className="text-[10px] uppercase font-bold text-slate-500">Total Inmates / Beds</div>
            <div className="text-xl font-mono font-bold text-slate-800">
              {totalCurrentInmates} / {totalCapacity}
            </div>
          </div>

          {/* Block Safety & Preventative Maintenance Calendar Banner Quick-Launch */}
          <button
            onClick={() => setIsCalendarSidebarOpen(true)}
            className="border border-purple-200 bg-purple-50 hover:bg-purple-100 text-[#714B67] p-2.5 rounded-lg text-right transition-all cursor-pointer shadow-2xs group shrink-0"
            title="Open Calendar-View Sidebar to track upcoming safety inspections and preventative maintenance for specific facility blocks"
          >
            <div className="text-[10px] uppercase font-bold text-[#714B67] flex items-center justify-end gap-1">
              <CalendarDays className="w-3.5 h-3.5 text-[#714B67] group-hover:scale-110 transition-transform" />
              <span>Block Maintenance</span>
            </div>
            <div className="text-sm font-mono font-extrabold text-[#714B67] flex items-center justify-end gap-1.5 mt-0.5">
              <span>Safety Cal</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold bg-[#714B67] text-white">
                VIEW
              </span>
            </div>
            <div className="text-[9px] text-purple-700 font-medium">
              Upcoming Inspections & PM
            </div>
          </button>

          {/* High-Risk Facilities Printable Report Tool Button */}
          <button
            onClick={() => {
              setReportInitialFilter('all_high_risk');
              setIsReportModalOpen(true);
            }}
            className="border border-slate-700 bg-slate-900 hover:bg-slate-800 text-white p-2.5 rounded-lg text-right transition-all cursor-pointer shadow-xs hover:shadow-md group shrink-0"
            title="Open printable PDF-ready summary report of high-risk facilities, incident counts and capacity usage"
          >
            <div className="text-[10px] uppercase font-bold text-amber-400 flex items-center justify-end gap-1">
              <Printer className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>Reporting Tool</span>
            </div>
            <div className="text-sm font-mono font-extrabold text-white flex items-center justify-end gap-1.5 mt-0.5">
              <span>PDF Report</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold bg-amber-400 text-slate-950">
                AUDIT
              </span>
            </div>
            <div className="text-[9px] text-slate-400 font-medium">
              High-Risk Facilities Summary
            </div>
          </button>
        </div>
      </div>

      {/* Top View Mode Switcher & Security Heatmap Toggle */}
      <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveView('capacity')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeView === 'capacity'
                ? 'bg-[#714B67] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <PieChartIcon className="w-4 h-4" />
            <span>National Capacity & Transfers</span>
          </button>

          <button
            onClick={() => setActiveView('growth')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeView === 'growth'
                ? 'bg-[#714B67] text-white shadow-xs'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
            }`}
          >
            <TrendingUp className={`w-4 h-4 ${activeView === 'growth' ? 'text-white' : 'text-emerald-700'}`} />
            <span>Comparative Growth (12M)</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
              activeView === 'growth' ? 'bg-white text-[#714B67]' : 'bg-emerald-700 text-white'
            }`}>
              12-MO
            </span>
          </button>

          <button
            onClick={() => setActiveView('hotspot')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeView === 'hotspot'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
            }`}
          >
            <Flame className={`w-4 h-4 ${activeView === 'hotspot' ? 'text-slate-950' : 'text-amber-600'}`} />
            <span>Facility Hotspots & Risk Map</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
              activeView === 'hotspot' ? 'bg-slate-900 text-amber-400' : 'bg-rose-600 text-white animate-pulse'
            }`}>
              HOTSPOT
            </span>
          </button>

          {/* Security Heatmap Overlay Toggle */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1">
            <button
              onClick={() => {
                const next = !securityHeatmapEnabled;
                setSecurityHeatmapEnabled(next);
                if (next && activeView !== 'hotspot') {
                  setActiveView('hotspot');
                }
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${
                securityHeatmapEnabled
                  ? 'bg-gradient-to-r from-emerald-600 via-amber-600 to-rose-600 text-white shadow-xs ring-1 ring-rose-400/50'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
              }`}
              title="Toggle Security Heatmap: visualizes facility density, officer-to-inmate ratios, and incident frequency as green-to-red gradients on the facility map"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Security Heatmap:</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                securityHeatmapEnabled ? 'bg-black/40 text-amber-300' : 'bg-slate-200 text-slate-600'
              }`}>
                {securityHeatmapEnabled ? 'ENABLED' : 'DISABLED'}
              </span>
              <span className={`w-2 h-2 rounded-full ${securityHeatmapEnabled ? 'bg-emerald-300 animate-pulse' : 'bg-slate-400'}`} />
            </button>

            {securityHeatmapEnabled && (
              <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" title="Low Density / Safe Ratio" />
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" title="Moderate Load / Strained" />
                <span className="w-2.5 h-2.5 rounded-xs bg-rose-600" title="Critical Overcrowding / High Ratio" />
                <span className="text-[9px] text-slate-500 ml-1 font-mono">Green→Red</span>
              </div>
            )}
          </div>

          {/* Quick Nav: 12-Month Growth Chart */}
          <button
            onClick={() => {
              if (activeView !== 'capacity') setActiveView('capacity');
              setTimeout(() => {
                document.getElementById('comparative-growth-chart-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-pointer"
            title="Jump to 12-Month Inmate Admission Trends vs Capacity Limits Recharts Chart"
          >
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>12M Growth Chart</span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold bg-emerald-600 text-white">
              CHART
            </span>
          </button>

          <button
            onClick={() => {
              setActiveView('capacity');
              setTimeout(() => {
                document.getElementById('capacity-projection-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 cursor-pointer"
            title="Jump to 30-Day Capacity Projection Line Chart"
          >
            <TrendingUp className="w-4 h-4 text-[#714B67]" />
            <span>30-Day Forecast</span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold bg-[#714B67]/15 text-[#714B67]">
              TREND
            </span>
          </button>

          {/* High-Risk Printable PDF Summary Report Trigger */}
          <button
            onClick={() => {
              setReportInitialFilter('all_high_risk');
              setIsReportModalOpen(true);
            }}
            className="px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-300 cursor-pointer shadow-2xs"
            title="Generate a printable PDF-ready summary of high-risk facilities, incident counts and capacity usage"
          >
            <Printer className="w-4 h-4 text-rose-600" />
            <span>High-Risk Report</span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold bg-rose-600 text-white">
              PDF
            </span>
          </button>

          {/* Calendar-View Sidebar Trigger for Safety Inspections & Preventative Maintenance */}
          <button
            onClick={() => setIsCalendarSidebarOpen(prev => !prev)}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs border ${
              isCalendarSidebarOpen
                ? 'bg-[#714B67] text-white border-[#5a3b52] ring-2 ring-purple-300'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-200'
            }`}
            title="Open Calendar-View Sidebar to track upcoming safety inspections and preventative maintenance for specific facility blocks"
          >
            <CalendarDays className={`w-4 h-4 ${isCalendarSidebarOpen ? 'text-amber-300' : 'text-[#714B67]'}`} />
            <span>Block Safety & Maintenance</span>
            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
              isCalendarSidebarOpen ? 'bg-amber-400 text-slate-950' : 'bg-[#714B67] text-white'
            }`}>
              CALENDAR
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          {activeView === 'growth'
            ? 'Longitudinal 12-Month Surveillance: Inmate admission trends, physical muster vs. statutory capacity limits'
            : activeView === 'capacity'
            ? 'Monitoring real-time bed capacities, overcrowding ratios, and re-allocations'
            : securityHeatmapEnabled
            ? 'Security Heatmap Active: Visualizing facility density, guard ratios & incident frequency as green-to-red gradients'
            : 'Spatial density overlays of escape attempts, medical code reds, and compound perimeter breaches'}
        </div>
      </div>

      {activeView === 'growth' ? (
        <div className="space-y-6">
          <ComparativeGrowthChart
            facilities={facilities}
            inmates={inmates}
            selectedFacilityId={selectedFacilityId}
            onSelectFacility={onSelectFacility}
            onNavigateToTransfers={onNavigateToTransfers}
          />
        </div>
      ) : activeView === 'hotspot' ? (
        <FacilityHotspotView
          facilities={facilities}
          inmates={inmates}
          selectedFacilityId={selectedFacilityId}
          onSelectFacility={onSelectFacility}
          onNavigateToTransfers={onNavigateToTransfers}
          onOpenTransferModal={onOpenTransferModal}
          securityHeatmapEnabled={securityHeatmapEnabled}
          onToggleSecurityHeatmap={setSecurityHeatmapEnabled}
          securityHeatmapMetric={securityHeatmapMetric}
          onSelectSecurityHeatmapMetric={setSecurityHeatmapMetric}
        />
      ) : (
        <>
          {/* CRITICAL SECURITY ALERT BROADCAST BANNER */}
          {criticalAlertCount > 0 && (
            <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-amber-900 text-white border-2 border-rose-500 rounded-xl p-4 sm:p-4.5 shadow-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-rose-600 rounded-xl shrink-0 shadow-sm animate-pulse mt-0.5">
                  <Siren className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-black/40 text-amber-300 border border-amber-400/30">
                      CRITICAL ALERT OVERLAY ENGAGED
                    </span>
                    <span className="text-sm font-extrabold text-white">
                      {criticalAlertCount} of {facilities.length} Facilities Under Severe Operational Strain
                    </span>
                  </div>
                  <p className="text-xs text-rose-100 mt-1 leading-relaxed max-w-3xl">
                    Dangerous custodial conditions detected in{' '}
                    <strong className="text-white font-semibold underline decoration-rose-300">
                      {criticalAlertFacilities.map(f => {
                        const a = facilityAlertMap.get(f.id);
                        return `${f.name} (${a?.ratio}:1 Ratio${a?.hasOngoingIncidents ? ' • Active Incident' : ''})`;
                      }).join(', ')}
                    </strong>.
                    Staffing ratios exceed 10.0:1 statutory safety ceiling or ongoing active security incidents remain uncontained. Rapid emergency re-allocation and situational monitoring required.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => setCapacityFilter(capacityFilter === 'criticalAlert' ? 'all' : 'criticalAlert')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                    capacityFilter === 'criticalAlert'
                      ? 'bg-white text-rose-900 shadow-md font-black'
                      : 'bg-rose-700 hover:bg-rose-600 text-white border border-rose-400'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>{capacityFilter === 'criticalAlert' ? 'Showing Alerts Only' : `Filter Critical Alerts (${criticalAlertCount})`}</span>
                </button>

                {criticalAlertFacilities.length > 0 && (
                  <button
                    onClick={() => setSelectedSitrepFacility(criticalAlertFacilities[0])}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all"
                    title="Open Emergency SITREP Briefing for most critical facility"
                  >
                    <Radio className="w-3.5 h-3.5 text-slate-950 animate-pulse" />
                    <span>Open SITREP</span>
                  </button>
                )}

                {/* Print Critical Alerts Report Button */}
                <button
                  onClick={() => {
                    setReportInitialFilter('critical_alerts');
                    setIsReportModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-rose-950/90 hover:bg-rose-900 text-amber-300 border border-amber-400/40 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  title="Generate printable PDF SITREP report for critical alert facilities"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  <span>Print Alert Report</span>
                </button>
              </div>
            </div>
          )}

          {/* URGENT CAPACITY ADVISORY BANNER FOR FACILITIES EXCEEDING 90% */}
      {exceeding90Count > 0 && (
        <div className="bg-rose-50/90 border-2 border-rose-300 rounded-lg p-4 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-rose-600 text-white rounded-lg shrink-0 mt-0.5 shadow-xs">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-rose-200 text-rose-900 border border-rose-300">
                  CRITICAL CAPACITY ADVISORY
                </span>
                <span className="text-sm font-bold text-rose-950">
                  {exceeding90Count} of {facilities.length} Facilities Exceed 90% Capacity Threshold
                </span>
              </div>
              <p className="text-xs text-rose-900 mt-1 leading-relaxed">
                Severe bed congestion detected in{' '}
                <strong className="font-semibold text-rose-950">
                  {exceeding90Facilities.map(f => `${f.name} (${Math.round((f.currentInmates / f.capacity) * 100)}%)`).join(', ')}
                </strong>.
                Overcrowding compromises custodial hygiene and violates Nelson Mandela Minimum Standards. Urgent inter-prison inmate re-allocation is strongly advised.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setCapacityFilter(capacityFilter === 'exceeding90' ? 'all' : 'exceeding90')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                capacityFilter === 'exceeding90'
                  ? 'bg-rose-200 border-rose-400 text-rose-900'
                  : 'bg-white hover:bg-rose-100 border-rose-300 text-rose-800'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{capacityFilter === 'exceeding90' ? 'Showing >90% Only' : `Filter >90% (${exceeding90Count})`}</span>
            </button>

            {/* Print Overcrowded Facilities Capacity Report */}
            <button
              onClick={() => {
                setReportInitialFilter('overcrowded');
                setIsReportModalOpen(true);
              }}
              className="px-3 py-2 bg-white hover:bg-rose-100 border border-rose-300 text-rose-900 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer transition-all whitespace-nowrap"
              title="Generate printable capacity report for overcrowded facilities"
            >
              <Printer className="w-3.5 h-3.5 text-rose-600" />
              <span>Print Capacity Audit</span>
            </button>

            {onNavigateToTransfers && (
              <button
                onClick={() => onNavigateToTransfers()}
                className="flex-1 sm:flex-initial px-4 py-2 bg-rose-700 hover:bg-rose-800 active:bg-rose-900 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all whitespace-nowrap"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>Initiate Urgent Re-allocation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Real-time Capacity Usage Pie Chart Card */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        {/* Section Header */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#714B67]/10 text-[#714B67] rounded-md">
              <PieChartIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Real-Time Facility Capacity Usage Percentage
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
                  Live Recharts Telemetry
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Interactive distribution of bed occupancy rates (%) across all correctional facilities. Click any slice to filter.
              </p>
            </div>
          </div>

          {/* KPI Summary Badges & Quick Filter Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setCapacityFilter(capacityFilter === 'exceeding90' ? 'all' : 'exceeding90')}
              className={`text-[11px] font-bold px-2.5 py-1 rounded transition-all flex items-center gap-1.5 border ${
                capacityFilter === 'exceeding90'
                  ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                  : 'bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100'
              }`}
              title="Click to toggle facilities exceeding 90% capacity"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{exceeding90Count} Exceeding 90%</span>
            </button>

            <button
              onClick={() => setCapacityFilter(capacityFilter === 'overcrowded' ? 'all' : 'overcrowded')}
              className={`text-[11px] font-medium px-2.5 py-1 rounded transition-all flex items-center gap-1 border ${
                capacityFilter === 'overcrowded'
                  ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                  : 'bg-rose-50/60 border-rose-200 text-rose-700 hover:bg-rose-100'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>{overcrowdedCount} Overcrowded (&gt;100%)</span>
            </button>

            <button
              onClick={() => setCapacityFilter(capacityFilter === 'normal' ? 'all' : 'normal')}
              className={`text-[11px] font-medium px-2.5 py-1 rounded transition-all border ${
                capacityFilter === 'normal'
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <span>{optimalCount} Normal (&lt;90%)</span>
            </button>
          </div>
        </div>

        {/* Chart Content Area */}
        <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Pie Chart Visualizer */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative min-h-[300px]">
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white rounded-lg shadow-xl p-3 text-xs border border-slate-700 max-w-xs z-50">
                          <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-slate-800">
                            <span className="font-mono font-bold text-amber-400">{data.code}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                              data.occupancyRate > 100 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                              data.occupancyRate >= 90 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                              'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            }`}>
                              {data.occupancyRate > 100 ? 'Overcrowded' : data.occupancyRate >= 90 ? 'High (>90%)' : 'Normal'}
                            </span>
                          </div>
                          <p className="font-bold text-slate-100 text-sm mb-1 leading-snug">{data.name}</p>
                          <div className="space-y-1 text-slate-300">
                            <div className="flex justify-between">
                              <span>Capacity Usage:</span>
                              <span className="font-mono font-bold text-white">{data.occupancyRate}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Headcount / Capacity:</span>
                              <span className="font-mono text-slate-200">{data.currentInmates} / {data.capacity} beds</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                              <span>Location:</span>
                              <span>{data.location}</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                              <span>Security:</span>
                              <span className="capitalize">{data.type}</span>
                            </div>
                          </div>
                          {data.occupancyRate >= 90 && (
                            <div className="mt-2 pt-1.5 border-t border-rose-500/30 text-[10px] text-rose-300 font-medium">
                              ⚠️ Exceeds 90% threshold: Inmate re-allocation recommended.
                            </div>
                          )}
                          <div className="mt-1 text-[10px] text-amber-300/90 italic">
                            Click slice to filter facility
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={68}
                    outerRadius={105}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="code"
                    onClick={(entry: any) => {
                      const targetId = entry?.payload?.id || entry?.id;
                      if (targetId) onSelectFacility(targetId === selectedFacilityId ? '' : targetId);
                    }}
                    cursor="pointer"
                    label={(props: any) => {
                      const code = props?.payload?.code || props?.name || '';
                      return `${code}: ${props?.value}%`;
                    }}
                    labelLine={true}
                  >
                    {chartData.map((entry) => {
                      const isSelected = selectedFacilityId === entry.id;
                      return (
                        <Cell
                          key={`cell-${entry.id}`}
                          fill={entry.color}
                          stroke={isSelected ? '#0f172a' : '#ffffff'}
                          strokeWidth={isSelected ? 3 : 2}
                          className="transition-all duration-300 hover:opacity-90 cursor-pointer"
                        />
                      );
                    })}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Centered Donut Summary Label */}
            <div className="absolute pointer-events-none flex flex-col items-center justify-center text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Avg Usage</span>
              <span className={`text-2xl font-mono font-extrabold ${nationalOccupancy > 100 ? 'text-rose-600' : nationalOccupancy >= 90 ? 'text-amber-600' : 'text-slate-900'}`}>
                {nationalOccupancy}%
              </span>
              <span className="text-[10px] text-slate-500 font-medium">National Avg</span>
            </div>
          </div>

          {/* Facility Breakdown & Direct Selection List */}
          <div className="lg:col-span-6 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 pb-1 border-b border-slate-100">
              <span>Facility Capacity Utilization Breakdown</span>
              <span>Status & Action</span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {chartData.map((item) => {
                const isSelected = selectedFacilityId === item.id;
                const isOver90 = item.occupancyRate >= 90;
                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectFacility(item.id)}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#714B67]/5 border-[#714B67] ring-1 ring-[#714B67]/30 shadow-xs'
                        : isOver90
                        ? 'bg-rose-50/40 hover:bg-rose-50/70 border-rose-200'
                        : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs border border-white"
                        style={{ backgroundColor: item.color }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-slate-900">{item.code}</span>
                          <span className="text-[10px] text-slate-500 truncate max-w-[140px] sm:max-w-[190px]">
                            {item.name}
                          </span>
                        </div>
                        <div className="w-32 sm:w-44 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full ${
                              item.occupancyRate > 100
                                ? 'bg-rose-600'
                                : item.occupancyRate >= 90
                                ? 'bg-amber-500'
                                : 'bg-emerald-600'
                            }`}
                            style={{ width: `${Math.min(item.occupancyRate, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Visual Status Indicator Badges */}
                          {item.isCriticalAlert ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const f = facilities.find(fac => fac.id === item.id);
                                if (f) setSelectedSitrepFacility(f);
                              }}
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-600 hover:bg-rose-700 text-white shadow-2xs flex items-center gap-1 transition-colors"
                              title="Click to inspect Critical Alert SITREP"
                            >
                              <Siren className="w-3 h-3 animate-pulse text-white" />
                              ALERT ({item.ratio}:1)
                            </button>
                          ) : item.occupancyRate > 100 ? (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                              {item.occupancyRate}% Critical
                            </span>
                          ) : item.occupancyRate >= 90 ? (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                              <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                              {item.occupancyRate}% Warning
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono font-bold text-slate-700">
                              {item.occupancyRate}%
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {item.currentInmates}/{item.capacity} beds • {item.activeOfficers} guards
                        </div>
                      </div>

                      {/* Re-allocation Link Button for >90% Facilities */}
                      {isOver90 && onNavigateToTransfers && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateToTransfers(item.id);
                          }}
                          className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold flex items-center gap-1 shadow-xs transition-colors"
                          title="Open transfer module to re-allocate inmates from this facility"
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                          <span className="hidden sm:inline">Re-allocate</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-200">
              <span className="flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-[#714B67]" />
                Selected: <strong className="text-slate-800 font-mono">{selectedFacilityId || 'ALL'}</strong>
                {capacityFilter !== 'all' && (
                  <span className="ml-2 font-semibold text-rose-700">
                    [Filter: {capacityFilter}]
                  </span>
                )}
              </span>
              <button
                onClick={() => {
                  onSelectFacility('');
                  setCapacityFilter('all');
                }}
                className={`text-[11px] font-semibold underline hover:text-[#714B67] ${
                  !selectedFacilityId && capacityFilter === 'all' ? 'text-slate-400 cursor-default' : 'text-[#714B67]'
                }`}
                disabled={!selectedFacilityId && capacityFilter === 'all'}
              >
                Reset All Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 30-Day Predictive Inmate Capacity Trends & Court Release Forecasting Line Chart */}
      <CapacityProjectionChart
        facilities={facilities}
        inmates={inmates}
        selectedFacilityId={selectedFacilityId}
        onSelectFacility={onSelectFacility}
        onNavigateToTransfers={onNavigateToTransfers}
      />

      {/* 12-Month Comparative Growth Chart: Inmate Admission Trends vs. Capacity Limits */}
      <ComparativeGrowthChart
        facilities={facilities}
        inmates={inmates}
        selectedFacilityId={selectedFacilityId}
        onSelectFacility={onSelectFacility}
        onNavigateToTransfers={onNavigateToTransfers}
      />

      {/* Facilities Grid Section Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Penitentiary Roster & Inmate Re-allocation Status ({displayedFacilities.length} Facilities)
          </h3>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-500 mr-1">Filter by Status:</span>
          <button
            onClick={() => setCapacityFilter('all')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
              capacityFilter === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            All ({facilities.length})
          </button>
          <button
            onClick={() => setCapacityFilter('criticalAlert')}
            className={`px-2.5 py-1 rounded text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs ${
              capacityFilter === 'criticalAlert'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 border border-rose-300 text-rose-800 hover:bg-rose-100'
            }`}
            title="Show facilities with high inmate-to-officer ratios or active security incidents"
          >
            <Siren className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            <span>Critical Alerts ({criticalAlertCount})</span>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
          </button>
          <button
            onClick={() => setCapacityFilter('exceeding90')}
            className={`px-2.5 py-1 rounded text-xs font-bold transition-colors flex items-center gap-1 ${
              capacityFilter === 'exceeding90'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 border border-rose-300 text-rose-800 hover:bg-rose-100'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>&gt;90% Capacity ({exceeding90Count})</span>
          </button>
          <button
            onClick={() => setCapacityFilter('normal')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
              capacityFilter === 'normal'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Normal ({optimalCount})
          </button>
        </div>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayedFacilities.map(fac => {
          const occupancyRate = Math.round((fac.currentInmates / fac.capacity) * 100);
          const isOvercrowded = fac.currentInmates > fac.capacity;
          const isExceeding90 = occupancyRate >= 90;
          const isSelected = selectedFacilityId === fac.id;
          const alertData = facilityAlertMap.get(fac.id);
          const isCriticalAlert = alertData?.isCriticalAlert ?? false;
          const facilityInmates = inmates.filter(i => i.facilityId === fac.id);
          const transferableInmates = facilityInmates.filter(
            i => i.custodyStatus !== 'escaped' && i.custodyStatus !== 'discharged'
          );
          const bedsRemaining = fac.capacity - fac.currentInmates;
          const inmatesOver = fac.currentInmates - fac.capacity;

          return (
            <div
              key={fac.id}
              className={`bg-white rounded-lg border transition-all shadow-xs p-5 flex flex-col justify-between ${
                isSelected
                  ? 'border-[#714B67] ring-2 ring-[#714B67]/20 shadow-md'
                  : isCriticalAlert
                  ? 'border-rose-500 ring-2 ring-rose-500/50 shadow-md bg-gradient-to-b from-rose-50/40 via-white to-white relative overflow-hidden'
                  : isOvercrowded
                  ? 'border-rose-300 ring-1 ring-rose-300/60 hover:border-rose-400'
                  : isExceeding90
                  ? 'border-amber-300 ring-1 ring-amber-300/50 hover:border-amber-400'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                {/* CRITICAL ALERT OVERLAY TOP BANNER */}
                {isCriticalAlert && (
                  <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-amber-700 text-white px-3.5 py-2 -mx-5 -mt-5 mb-3.5 flex items-center justify-between gap-2 shadow-xs border-b border-rose-800">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1 bg-white/20 rounded animate-pulse shrink-0">
                        <Siren className="w-4 h-4 text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-black/40 px-1.5 py-0.5 rounded">
                            CRITICAL ALERT
                          </span>
                          <span className="text-xs font-bold truncate">
                            {alertData?.hasOngoingIncidents && alertData?.isHighRatio
                              ? 'High Custody Ratio & Active Incident'
                              : alertData?.hasOngoingIncidents
                              ? 'Active Security Incident in Progress'
                              : 'High Inmate-to-Officer Ratio'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSitrepFacility(fac);
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-rose-100 text-rose-900 rounded text-[10px] font-black tracking-wide uppercase transition-colors shrink-0 shadow-xs flex items-center gap-1"
                      title="Open Emergency SITREP & Incident Command"
                    >
                      <Radio className="w-3 h-3 text-rose-700 animate-pulse" />
                      <span>SITREP</span>
                    </button>
                  </div>
                )}

                {/* Header: Code & Type badge + High Capacity Badge */}
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      {fac.code}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      fac.type === 'maximum' ? 'bg-rose-100 text-rose-800' :
                      fac.type === 'womens' ? 'bg-purple-100 text-purple-800' :
                      fac.type === 'minimum' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {fac.type}
                    </span>
                  </div>

                  {/* VISUAL STATUS INDICATOR BADGES FOR CAPACITY & RATIO */}
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {isCriticalAlert && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow-xs animate-pulse">
                        <Siren className="w-3 h-3 text-white" />
                        RATIO {alertData?.ratio}:1
                      </span>
                    )}
                    {isOvercrowded ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 shadow-xs">
                        <ShieldAlert className="w-3 h-3 text-rose-600" />
                        CRITICAL: {occupancyRate}%
                      </span>
                    ) : isExceeding90 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-xs">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        ALERT: {occupancyRate}% (&gt;90%)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Normal: {occupancyRate}%
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-2.5 leading-snug">
                  {fac.name}
                </h3>
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{fac.location} ({fac.county} County)</span>
                </div>

                {/* CRITICAL ALERT OVERLAY BOX: Custodial Ratio & Active Incidents */}
                {isCriticalAlert && alertData && (
                  <div className="mt-3 p-3 rounded-lg border-2 border-rose-300 bg-rose-50/80 space-y-2.5">
                    {/* Ratio breakdown */}
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-rose-950 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-rose-600" />
                          <span>Custodial Supervision Ratio</span>
                        </span>
                        <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded ${
                          alertData.isHighRatio ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                        }`}>
                          {alertData.ratio}:1 RATIO
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-700 flex justify-between items-center mt-1">
                        <span>{alertData.activeOfficers} Active Guards / {fac.currentInmates} Inmates</span>
                        <span className="font-mono font-bold text-rose-700">Deficit: -{alertData.officerDeficit} Guards</span>
                      </div>

                      {/* Visual Staffing Bar */}
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex mt-1.5">
                        <div
                          className="bg-emerald-500 h-full"
                          style={{ width: `${Math.min(100, (6 / alertData.ratio) * 100)}%` }}
                          title="Mandela Standard (6:1)"
                        />
                        <div
                          className="bg-rose-600 h-full animate-pulse"
                          style={{ width: `${Math.max(0, 100 - (6 / alertData.ratio) * 100)}%` }}
                          title="Dangerous supervisory strain"
                        />
                      </div>
                      <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-0.5">
                        <span>6:1 Standard</span>
                        <span className="text-rose-700 font-bold">{alertData.ratio}:1 Current Load</span>
                      </div>
                    </div>

                    {/* Ongoing Security Incident Detail */}
                    {alertData.hasOngoingIncidents && (
                      <div className="pt-2 border-t border-rose-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-slate-900 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                            <span>Active Security Incident</span>
                          </span>
                          <span className="text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                            {alertData.ongoingIncidents[0].status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-[11px] text-rose-950 font-medium line-clamp-2">
                          {alertData.ongoingIncidents[0].title}
                        </p>
                      </div>
                    )}

                    {/* Quick Action Button in Critical Alert Card */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSitrepFacility(fac);
                        }}
                        className="flex-1 px-2.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                      >
                        <Radio className="w-3 h-3 text-white animate-pulse" />
                        <span>SITREP Command</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectFacility(fac.id);
                          setActiveView('hotspot');
                        }}
                        className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded text-[11px] font-bold flex items-center justify-center gap-1 shadow-2xs transition-colors"
                        title="Inspect live tactical hotspot map"
                      >
                        <Flame className="w-3 h-3 text-slate-950" />
                        <span>Hotspot</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Overcrowding meter */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="text-slate-600 font-medium">Beds Occupied:</span>
                    <span className={`font-mono font-bold ${isOvercrowded ? 'text-rose-600' : isExceeding90 ? 'text-amber-700' : 'text-slate-900'}`}>
                      {fac.currentInmates} / {fac.capacity} ({occupancyRate}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        occupancyRate > 100
                          ? 'bg-rose-600'
                          : occupancyRate >= 90
                          ? 'bg-amber-500'
                          : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                    />
                  </div>

                  {/* URGENT RE-ALLOCATION ACTION CALLOUT FOR FACILITIES EXCEEDING 90% */}
                  {isExceeding90 ? (
                    <div className={`mt-3 p-3 rounded-lg border flex flex-col gap-2.5 ${
                      isOvercrowded 
                        ? 'bg-rose-50 border-rose-200 text-rose-950' 
                        : 'bg-amber-50 border-amber-200 text-amber-950'
                    }`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-extrabold flex items-center gap-1.5">
                          {isOvercrowded ? (
                            <>
                              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                              <span>Urgent Inmate Re-allocation Mandated</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>Capacity Warning: Near Bed Limit</span>
                            </>
                          )}
                        </span>
                        <span className={`text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded border ${
                          isOvercrowded ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}>
                          {isOvercrowded ? `DEFICIT +${inmatesOver}` : `${bedsRemaining} BEDS LEFT`}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {isOvercrowded
                          ? `Overcrowded by +${inmatesOver} inmates above statutory quota. Dispatch transfer convoys to redistribute population to Naivasha or regional annexes.`
                          : `Operating at ${occupancyRate}% capacity with only ${bedsRemaining} beds in reserve. Early dispersal transfer recommended.`}
                      </p>

                      {/* Direct Action Link to the Transfer Module */}
                      <div className="flex items-center gap-2 pt-0.5">
                        <button
                          onClick={() => onNavigateToTransfers && onNavigateToTransfers(fac.id)}
                          className={`flex-1 px-3 py-2 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors ${
                            isOvercrowded
                              ? 'bg-rose-600 hover:bg-rose-700 text-white'
                              : 'bg-amber-600 hover:bg-amber-700 text-white'
                          }`}
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          <span>Initiate Urgent Re-allocation</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        {transferableInmates.length > 0 && onOpenTransferModal && (
                          <button
                            onClick={() => onOpenTransferModal(transferableInmates[0])}
                            title={`Dispatch immediate transfer for ${transferableInmates[0].firstName} ${transferableInmates[0].lastName}`}
                            className="px-2.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-md text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors shrink-0"
                          >
                            <Truck className="w-3.5 h-3.5 text-slate-600" />
                            <span className="hidden sm:inline">Transfer Profile</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 text-[11px] text-emerald-800 font-medium flex items-center gap-1 bg-emerald-50 px-2.5 py-1.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{bedsRemaining} beds available • Available destination for re-allocated inmates</span>
                    </div>
                  )}
                </div>

                {/* Warden & Rating */}
                <div className="mt-4 text-xs text-slate-600 space-y-1">
                  <div>Superintendent: <strong>{fac.wardenName}</strong></div>
                  <div>Security Specification: <span className="font-mono text-slate-700 font-medium">{fac.securityRating}</span></div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  {facilityInmates.length} Sample Profiles
                </span>
                <div className="flex items-center gap-1.5">
                  {isCriticalAlert && (
                    <button
                      onClick={() => setSelectedSitrepFacility(fac)}
                      className="px-2 py-1.5 rounded text-xs font-bold text-rose-900 bg-rose-100 hover:bg-rose-200 border border-rose-300 flex items-center gap-1 transition-colors"
                      title="Open Critical Alert Incident SITREP"
                    >
                      <Radio className="w-3.5 h-3.5 text-rose-700 animate-pulse" />
                      <span>SITREP</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onSelectFacility(fac.id);
                      setActiveView('hotspot');
                    }}
                    className="px-2.5 py-1.5 rounded text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 flex items-center gap-1 transition-colors"
                    title={`Inspect ${fac.name} Incident Hotspot Map`}
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-600" />
                    <span>Hotspot</span>
                  </button>
                  <button
                    onClick={() => {
                      onSelectFacility(fac.id);
                      setIsCalendarSidebarOpen(true);
                    }}
                    className="px-2.5 py-1.5 rounded text-xs font-bold text-[#714B67] bg-purple-50 hover:bg-purple-100 border border-purple-200 flex items-center gap-1 transition-colors"
                    title={`View upcoming safety inspections & preventative maintenance for ${fac.name} blocks`}
                  >
                    <CalendarDays className="w-3.5 h-3.5 text-[#714B67]" />
                    <span>Block Cal</span>
                  </button>
                  <button
                    onClick={() => onSelectFacility(isSelected ? '' : fac.id)}
                    className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                      isSelected
                        ? 'bg-[#714B67] text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    {isSelected ? 'Active Context' : 'Filter Facility'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
        </>
      )}

      {/* Critical Alert SITREP & Incident Command Modal */}
      {selectedSitrepFacility && (
        <CriticalAlertSitrepModal
          facility={selectedSitrepFacility}
          onClose={() => setSelectedSitrepFacility(null)}
          onNavigateToTransfers={onNavigateToTransfers}
          onOpenHotspotView={(facId) => {
            onSelectFacility(facId);
            setActiveView('hotspot');
          }}
        />
      )}

      {/* Printable PDF-Ready High-Risk Facility Reporting Tool Modal */}
      {isReportModalOpen && (
        <HighRiskFacilityReportModal
          facilities={facilities}
          inmates={inmates}
          onClose={() => setIsReportModalOpen(false)}
          onNavigateToTransfers={onNavigateToTransfers}
          onSelectFacility={onSelectFacility}
          initialFilter={reportInitialFilter}
        />
      )}

      {/* Calendar-View Sidebar for Tracking Safety Inspections and Preventative Maintenance */}
      <FacilityInspectionMaintenanceSidebar
        isOpen={isCalendarSidebarOpen}
        onClose={() => setIsCalendarSidebarOpen(false)}
        facilities={facilities}
        selectedFacilityId={selectedFacilityId}
        onSelectFacility={onSelectFacility}
        isDocked={isCalendarSidebarDocked}
        onToggleDock={() => setIsCalendarSidebarDocked(prev => !prev)}
      />
    </div>
  );
};

