import React, { useState, useMemo } from 'react';
import { PrisonFacility, Inmate } from '../../types';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Building2,
  Users,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRightLeft,
  Activity,
  Filter,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Maximize2,
  Sliders,
  Scale,
  Sparkles,
  RefreshCw,
  Clock
} from 'lucide-react';

export interface ComparativeGrowthChartProps {
  facilities: PrisonFacility[];
  inmates: Inmate[];
  selectedFacilityId?: string;
  onSelectFacility?: (facilityId: string) => void;
  onNavigateToTransfers?: (facilityId?: string) => void;
}

export type GrowthViewMetric = 'population_vs_capacity' | 'inflow_vs_outflow' | 'cumulative_trajectory';
export type TimeframeSpan = '12m' | '6m' | '3m';

interface MonthlyDataPoint {
  monthKey: string; // e.g. '2025-10'
  monthLabel: string; // e.g. 'Oct 2025'
  shortLabel: string; // e.g. 'Oct'
  year: number;
  monthIndex: number;
  totalInmates: number;
  capacityLimit: number;
  warningThreshold: number; // 90%
  admissions: number; // New committals & remand intakes
  releases: number; // Discharges, bail, court acquittals, transfers out
  netGrowth: number; // admissions - releases
  cumulativeAdmissions: number;
  occupancyRate: number; // percentage
  surplusOrDeficit: number; // totalInmates - capacityLimit
  isOvercrowded: boolean;
  milestoneEvent?: {
    title: string;
    description: string;
    impact: string;
  };
}

// 12-Month institutional growth baseline factors
const HISTORICAL_MONTHS = [
  { key: '2025-10', label: 'Oct 2025', short: 'Oct 25', year: 2025, monthIndex: 9 },
  { key: '2025-11', label: 'Nov 2025', short: 'Nov 25', year: 2025, monthIndex: 10 },
  { key: '2025-12', label: 'Dec 2025', short: 'Dec 25', year: 2025, monthIndex: 11 },
  { key: '2026-01', label: 'Jan 2026', short: 'Jan 26', year: 2026, monthIndex: 0 },
  { key: '2026-02', label: 'Feb 2026', short: 'Feb 26', year: 2026, monthIndex: 1 },
  { key: '2026-03', label: 'Mar 2026', short: 'Mar 26', year: 2026, monthIndex: 2 },
  { key: '2026-04', label: 'Apr 2026', short: 'Apr 26', year: 2026, monthIndex: 3 },
  { key: '2026-05', label: 'May 2026', short: 'May 26', year: 2026, monthIndex: 4 },
  { key: '2026-06', label: 'Jun 2026', short: 'Jun 26', year: 2026, monthIndex: 5 },
  { key: '2026-07', label: 'Jul 2026', short: 'Jul 26', year: 2026, monthIndex: 6 },
  { key: '2026-08', label: 'Aug 2026', short: 'Aug 26', year: 2026, monthIndex: 7 },
  { key: '2026-09', label: 'Sep 2026', short: 'Sep 26', year: 2026, monthIndex: 8 }
];

// Key operational inflection events over the last 12 months
const OPERATIONAL_MILESTONES: Record<string, { title: string; description: string; impact: string }> = {
  '2025-12': {
    title: 'Pre-Holiday Judicial Clearance & Bail Surge',
    description: 'Magistrates courts accelerated bond reviews prior to annual court recess, temporarily moderating remand intakes.',
    impact: 'Releases peaked at +15% above seasonal average'
  },
  '2026-01': {
    title: 'Post-Recess Committal Influx',
    description: 'Resumption of criminal sessions resulted in a sharp spike of high-security committals.',
    impact: 'Kamiti breached 100% capacity threshold'
  },
  '2026-04': {
    title: 'National Anti-Contraband & Crime Sweep',
    description: 'Multi-agency judicial crackdown across Nairobi & Rift Valley led to record monthly remand bookings.',
    impact: 'Peak admission month: 148 new committals'
  },
  '2026-07': {
    title: 'Chief Justice Decrowding Directive',
    description: 'Inter-agency decongestion taskforce approved early release for petty offenders and community service orders.',
    impact: 'Net growth slowed by -32 inmates'
  },
  '2026-09': {
    title: 'Current Operational Custodial State',
    description: 'Ongoing spatial heatmaps and emergency SITREP command monitoring active code-red perimeter alerts.',
    impact: 'National capacity exceeded by +87 beds'
  }
};

export const ComparativeGrowthChart: React.FC<ComparativeGrowthChartProps> = ({
  facilities,
  inmates,
  selectedFacilityId,
  onSelectFacility,
  onNavigateToTransfers
}) => {
  const [activeScope, setActiveScope] = useState<string>(selectedFacilityId || 'ALL');
  const [metricView, setMetricView] = useState<GrowthViewMetric>('population_vs_capacity');
  const [timeframe, setTimeframe] = useState<TimeframeSpan>('12m');
  const [showThreshold90, setShowThreshold90] = useState<boolean>(true);
  const [showMilestones, setShowMilestones] = useState<boolean>(true);

  // Sync external selectedFacilityId prop
  React.useEffect(() => {
    if (selectedFacilityId) {
      setActiveScope(selectedFacilityId);
    }
  }, [selectedFacilityId]);

  // Generate 12-month data series based on current facilities
  const allFacilitiesMonthlyData = useMemo(() => {
    // Generate monthly series for each facility
    const facilitySeriesMap = new Map<string, MonthlyDataPoint[]>();

    facilities.forEach((fac) => {
      const currentPop = fac.currentInmates;
      const capacity = fac.capacity;
      const points: MonthlyDataPoint[] = [];

      // Determine facility growth pattern based on facility profile
      // Kamiti & King'ong'o experienced higher relative growth leading to current overcrowding
      let growthFactor = 0.88; // population 12 months ago as fraction of current
      if (fac.code === 'KMS-PEN') growthFactor = 0.82; // started at ~1,377
      else if (fac.code === 'KNG-REM') growthFactor = 0.80; // started at ~712
      else if (fac.code === 'LWC-PRIS') growthFactor = 0.85; // started at ~418
      else if (fac.code === 'SLT-COAST') growthFactor = 0.87; // started at ~991
      else if (fac.code === 'NVS-OPEN') growthFactor = 0.86; // started at ~331

      const startPop = Math.round(currentPop * growthFactor);
      const totalDelta = currentPop - startPop;

      // Distribution weights across 12 months (indices 0 to 11)
      // April (index 6) has highest intake, Dec (index 2) has higher releases
      const monthlyIntakeWeights = [0.07, 0.08, 0.09, 0.11, 0.09, 0.10, 0.14, 0.09, 0.08, 0.07, 0.08, 0.09];
      const monthlyReleaseWeights = [0.08, 0.07, 0.13, 0.07, 0.08, 0.08, 0.06, 0.08, 0.08, 0.12, 0.08, 0.07];

      let runningPop = startPop;
      let cumAdmissions = 0;

      HISTORICAL_MONTHS.forEach((m, idx) => {
        // Calculate monthly admissions & releases proportionally
        const baseMonthlyInflow = Math.round((fac.currentInmates / 14) * (monthlyIntakeWeights[idx] / 0.083));
        const admissions = Math.max(12, baseMonthlyInflow);

        // Outflow based on release weights
        const baseMonthlyOutflow = Math.round((fac.currentInmates / 16) * (monthlyReleaseWeights[idx] / 0.083));
        const releases = Math.max(8, baseMonthlyOutflow);

        // Adjust running population to ensure month 11 ends exactly at fac.currentInmates
        if (idx === 11) {
          runningPop = fac.currentInmates;
        } else {
          const projectedStep = Math.round(startPop + (totalDelta * ((idx + 1) / 12)));
          // Add subtle monthly organic fluctuation
          const variance = Math.round(Math.sin(idx * 1.5) * 8);
          runningPop = Math.max(Math.round(capacity * 0.4), projectedStep + variance);
        }

        const netGrowth = admissions - releases;
        cumAdmissions += admissions;
        const occupancyRate = Math.round((runningPop / capacity) * 100);
        const warningThreshold = Math.round(capacity * 0.9);
        const surplusOrDeficit = runningPop - capacity;
        const isOvercrowded = runningPop > capacity;

        points.push({
          monthKey: m.key,
          monthLabel: m.label,
          shortLabel: m.short,
          year: m.year,
          monthIndex: m.monthIndex,
          totalInmates: runningPop,
          capacityLimit: capacity,
          warningThreshold,
          admissions,
          releases,
          netGrowth,
          cumulativeAdmissions: cumAdmissions,
          occupancyRate,
          surplusOrDeficit,
          isOvercrowded,
          milestoneEvent: OPERATIONAL_MILESTONES[m.key]
        });
      });

      facilitySeriesMap.set(fac.id, points);
    });

    // Create National Aggregate Series (Sum across all facilities)
    const nationalPoints: MonthlyDataPoint[] = [];
    const totalCapacity = facilities.reduce((acc, f) => acc + f.capacity, 0);

    HISTORICAL_MONTHS.forEach((m, idx) => {
      let aggregateInmates = 0;
      let aggregateAdmissions = 0;
      let aggregateReleases = 0;
      let aggregateCumulative = 0;

      facilities.forEach((fac) => {
        const facPoints = facilitySeriesMap.get(fac.id);
        if (facPoints && facPoints[idx]) {
          aggregateInmates += facPoints[idx].totalInmates;
          aggregateAdmissions += facPoints[idx].admissions;
          aggregateReleases += facPoints[idx].releases;
          aggregateCumulative += facPoints[idx].cumulativeAdmissions;
        }
      });

      const warningThreshold = Math.round(totalCapacity * 0.9);
      const occupancyRate = Math.round((aggregateInmates / totalCapacity) * 100);
      const surplusOrDeficit = aggregateInmates - totalCapacity;
      const isOvercrowded = aggregateInmates > totalCapacity;

      nationalPoints.push({
        monthKey: m.key,
        monthLabel: m.label,
        shortLabel: m.short,
        year: m.year,
        monthIndex: m.monthIndex,
        totalInmates: aggregateInmates,
        capacityLimit: totalCapacity,
        warningThreshold,
        admissions: aggregateAdmissions,
        releases: aggregateReleases,
        netGrowth: aggregateAdmissions - aggregateReleases,
        cumulativeAdmissions: aggregateCumulative,
        occupancyRate,
        surplusOrDeficit,
        isOvercrowded,
        milestoneEvent: OPERATIONAL_MILESTONES[m.key]
      });
    });

    facilitySeriesMap.set('ALL', nationalPoints);
    return facilitySeriesMap;
  }, [facilities]);

  // Active series for the selected scope
  const rawChartData = useMemo(() => {
    return allFacilitiesMonthlyData.get(activeScope) || allFacilitiesMonthlyData.get('ALL') || [];
  }, [allFacilitiesMonthlyData, activeScope]);

  // Filter according to timeframe
  const displayChartData = useMemo(() => {
    if (timeframe === '3m') {
      return rawChartData.slice(9);
    }
    if (timeframe === '6m') {
      return rawChartData.slice(6);
    }
    return rawChartData; // 12m
  }, [rawChartData, timeframe]);

  // Current scope meta
  const activeFacilityMeta = useMemo(() => {
    if (activeScope === 'ALL') {
      const totalCapacity = facilities.reduce((acc, f) => acc + f.capacity, 0);
      const totalInmates = facilities.reduce((acc, f) => acc + f.currentInmates, 0);
      const occupancy = Math.round((totalInmates / totalCapacity) * 100);
      return {
        id: 'ALL',
        name: 'National Penitentiary System (All Facilities)',
        code: 'KEN-NAT',
        type: 'aggregate',
        capacity: totalCapacity,
        currentInmates: totalInmates,
        occupancy,
        isOvercrowded: totalInmates > totalCapacity,
        surplus: Math.max(0, totalInmates - totalCapacity)
      };
    }
    const found = facilities.find((f) => f.id === activeScope);
    if (found) {
      const occupancy = Math.round((found.currentInmates / found.capacity) * 100);
      return {
        ...found,
        occupancy,
        isOvercrowded: found.currentInmates > found.capacity,
        surplus: Math.max(0, found.currentInmates - found.capacity)
      };
    }
    return null;
  }, [facilities, activeScope]);

  // Compute 12-Month Analytical KPIs
  const analyticalKpis = useMemo(() => {
    if (!rawChartData || rawChartData.length === 0) {
      return {
        totalAdmissions: 0,
        totalReleases: 0,
        netDelta: 0,
        growthPercentage: 0,
        peakAdmissionMonth: 'N/A',
        peakAdmissionCount: 0,
        avgMonthlyInflow: 0,
        monthsAboveCapacity: 0,
        initialPopulation: 0,
        currentPopulation: 0,
        currentCapacity: 0
      };
    }

    const firstPoint = rawChartData[0];
    const lastPoint = rawChartData[rawChartData.length - 1];
    const totalAdmissions = rawChartData.reduce((acc, d) => acc + d.admissions, 0);
    const totalReleases = rawChartData.reduce((acc, d) => acc + d.releases, 0);
    const netDelta = lastPoint.totalInmates - firstPoint.totalInmates;
    const growthPercentage = firstPoint.totalInmates > 0 
      ? Number(((netDelta / firstPoint.totalInmates) * 100).toFixed(1)) 
      : 0;

    let peakAdmissionCount = 0;
    let peakAdmissionMonth = '';
    let monthsAboveCapacity = 0;

    rawChartData.forEach((d) => {
      if (d.admissions > peakAdmissionCount) {
        peakAdmissionCount = d.admissions;
        peakAdmissionMonth = d.monthLabel;
      }
      if (d.isOvercrowded) {
        monthsAboveCapacity++;
      }
    });

    const avgMonthlyInflow = Math.round(totalAdmissions / rawChartData.length);

    return {
      totalAdmissions,
      totalReleases,
      netDelta,
      growthPercentage,
      peakAdmissionMonth,
      peakAdmissionCount,
      avgMonthlyInflow,
      monthsAboveCapacity,
      initialPopulation: firstPoint.totalInmates,
      currentPopulation: lastPoint.totalInmates,
      currentCapacity: lastPoint.capacityLimit
    };
  }, [rawChartData]);

  // Handle facility scope change
  const handleScopeChange = (facilityId: string) => {
    setActiveScope(facilityId);
    if (onSelectFacility) {
      onSelectFacility(facilityId === 'ALL' ? '' : facilityId);
    }
  };

  // Custom Chart Tooltip
  const CustomGrowthTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data: MonthlyDataPoint = payload[0]?.payload;
    if (!data) return null;

    return (
      <div className="bg-slate-900 text-white rounded-lg p-3.5 shadow-xl border border-slate-700 text-xs max-w-xs sm:max-w-sm">
        <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-2">
          <div className="flex items-center gap-1.5 font-bold">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>{data.monthLabel}</span>
          </div>
          <span className={`px-2 py-0.5 rounded font-mono font-black text-[10px] ${
            data.isOvercrowded 
              ? 'bg-rose-500 text-white' 
              : data.occupancyRate >= 90 
              ? 'bg-amber-400 text-slate-950' 
              : 'bg-emerald-500 text-white'
          }`}>
            {data.occupancyRate}% OCCUPANCY
          </span>
        </div>

        <div className="space-y-1.5 font-mono">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-sans flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#714B67]" />
              Active Population:
            </span>
            <span className="font-bold text-white text-sm">
              {data.totalInmates.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-sans flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" />
              Design Bed Capacity:
            </span>
            <span className="font-bold text-slate-200">
              {data.capacityLimit.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-sans flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400" />
              Monthly Admissions:
            </span>
            <span className="font-bold text-emerald-400">
              +{data.admissions}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-sans flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-blue-400" />
              Monthly Releases / Discharges:
            </span>
            <span className="font-bold text-blue-400">
              -{data.releases}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-slate-800 pt-1.5">
            <span className="text-slate-400 font-sans">Net Growth This Month:</span>
            <span className={`font-bold ${data.netGrowth >= 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {data.netGrowth > 0 ? `+${data.netGrowth}` : data.netGrowth}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-sans">Capacity Surplus / Deficit:</span>
            <span className={`font-bold ${data.surplusOrDeficit > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {data.surplusOrDeficit > 0 ? `+${data.surplusOrDeficit} Over Beds` : `${Math.abs(data.surplusOrDeficit)} Available`}
            </span>
          </div>
        </div>

        {/* Milestone Callout in Tooltip */}
        {data.milestoneEvent && (
          <div className="mt-2.5 pt-2 border-t border-slate-700/80 bg-slate-800/60 -mx-3.5 -mb-3.5 p-2.5 rounded-b-lg text-[11px] font-sans">
            <div className="font-bold text-amber-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{data.milestoneEvent.title}</span>
            </div>
            <p className="text-slate-300 text-[10px] mt-0.5 leading-snug">
              {data.milestoneEvent.description}
            </p>
            <div className="text-[9px] text-amber-400/90 font-mono mt-1 font-semibold">
              Impact: {data.milestoneEvent.impact}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      id="comparative-growth-chart-section" 
      className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden transition-all scroll-mt-6"
    >
      {/* SECTION HEADER & CONTROL BAR */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="p-1.5 bg-[#714B67] text-white rounded-lg shadow-2xs">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#714B67]/10 text-[#714B67] border border-[#714B67]/20">
              12-MONTH RECHARTS TELEMETRY
            </span>
            <span className="text-xs font-mono text-slate-500">
              Oct 2025 – Sep 2026
            </span>
            {activeFacilityMeta?.isOvercrowded && (
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-rose-600" />
                Capacity Breached (+{activeFacilityMeta.surplus} Beds)
              </span>
            )}
          </div>

          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            Comparative Growth: Inmate Admission Trends vs. Capacity Limits
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 max-w-3xl">
            Longitudinal multi-facility surveillance tracking new committal admissions, physical muster growth, and statutory rated bed limits across Kenyan correctional institutions over the past 12 months.
          </p>
        </div>

        {/* CONTROLS: SCOPE SELECTOR & METRIC SWITCHER */}
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto justify-start xl:justify-end">
          {/* Facility Scope Dropdown */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg p-1 shadow-2xs text-xs">
            <Building2 className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
            <select
              value={activeScope}
              onChange={(e) => handleScopeChange(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-hidden cursor-pointer text-xs pr-2 py-0.5"
              title="Select facility scope for 12-month trend comparison"
            >
              <option value="ALL">National Aggregate (All Facilities)</option>
              {facilities.map((f) => (
                <option key={`opt-${f.id}`} value={f.id}>
                  {f.code} - {f.name} ({f.currentInmates}/{f.capacity})
                </option>
              ))}
            </select>
          </div>

          {/* Timeframe selector */}
          <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs font-bold text-slate-700 border border-slate-300">
            <button
              onClick={() => setTimeframe('12m')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                timeframe === '12m' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
              }`}
            >
              12 Months
            </button>
            <button
              onClick={() => setTimeframe('6m')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                timeframe === '6m' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
              }`}
            >
              6 Months
            </button>
            <button
              onClick={() => setTimeframe('3m')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                timeframe === '3m' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
              }`}
            >
              Q3 2026
            </button>
          </div>

          {/* Metric View Mode Toggle */}
          <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs font-bold text-slate-700 border border-slate-300">
            <button
              onClick={() => setMetricView('population_vs_capacity')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                metricView === 'population_vs_capacity' ? 'bg-[#714B67] text-white shadow-2xs' : 'hover:text-slate-900'
              }`}
              title="Compare total muster population against statutory rated capacity limit"
            >
              <span>Muster vs. Capacity</span>
            </button>
            <button
              onClick={() => setMetricView('inflow_vs_outflow')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                metricView === 'inflow_vs_outflow' ? 'bg-[#714B67] text-white shadow-2xs' : 'hover:text-slate-900'
              }`}
              title="Compare monthly admissions vs releases"
            >
              <span>Inflow vs. Outflow</span>
            </button>
            <button
              onClick={() => setMetricView('cumulative_trajectory')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                metricView === 'cumulative_trajectory' ? 'bg-[#714B67] text-white shadow-2xs' : 'hover:text-slate-900'
              }`}
              title="Track cumulative admissions volume over time"
            >
              <span>Cumulative Intake</span>
            </button>
          </div>
        </div>
      </div>

      {/* EXECUTIVE KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 sm:p-5 border-b border-slate-200 bg-white">
        {/* KPI 1: 12-Month Admissions */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-between">
            <span>12M Admissions</span>
            <Users className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-mono font-black text-slate-900 mt-1">
            {analyticalKpis.totalAdmissions.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Avg {analyticalKpis.avgMonthlyInflow} intakes / mo
          </div>
        </div>

        {/* KPI 2: Net Growth Rate */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-between">
            <span>Net 12M Delta</span>
            {analyticalKpis.netDelta >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
            )}
          </div>
          <div className={`text-xl font-mono font-black mt-1 ${
            analyticalKpis.netDelta > 0 ? 'text-rose-600' : 'text-emerald-600'
          }`}>
            {analyticalKpis.netDelta > 0 ? `+${analyticalKpis.netDelta}` : analyticalKpis.netDelta}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
            {analyticalKpis.growthPercentage >= 0 ? `+${analyticalKpis.growthPercentage}%` : `${analyticalKpis.growthPercentage}%`} YoY expansion
          </div>
        </div>

        {/* KPI 3: Current Capacity Limit */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-between">
            <span>Bed Capacity Limit</span>
            <Building2 className="w-3.5 h-3.5 text-slate-600" />
          </div>
          <div className="text-xl font-mono font-black text-slate-900 mt-1">
            {analyticalKpis.currentCapacity.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Statutory design rating
          </div>
        </div>

        {/* KPI 4: Current Inmate Muster */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-between">
            <span>Current Population</span>
            <Layers className="w-3.5 h-3.5 text-[#714B67]" />
          </div>
          <div className={`text-xl font-mono font-black mt-1 ${
            analyticalKpis.currentPopulation > analyticalKpis.currentCapacity ? 'text-rose-600' : 'text-slate-900'
          }`}>
            {analyticalKpis.currentPopulation.toLocaleString()}
          </div>
          <div className={`text-[10px] font-bold mt-0.5 ${
            analyticalKpis.currentPopulation > analyticalKpis.currentCapacity ? 'text-rose-700' : 'text-emerald-700'
          }`}>
            {activeFacilityMeta?.occupancy}% occupancy
          </div>
        </div>

        {/* KPI 5: Peak Admission Surge Month */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-between">
            <span>Peak Intake Month</span>
            <Activity className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-base font-bold text-slate-900 mt-1 truncate" title={analyticalKpis.peakAdmissionMonth}>
            {analyticalKpis.peakAdmissionMonth}
          </div>
          <div className="text-[10px] text-amber-700 font-mono font-bold mt-0.5">
            +{analyticalKpis.peakAdmissionCount} committals
          </div>
        </div>

        {/* KPI 6: Overcrowding Status / Months Above Limit */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-between">
            <span>Months Over Limit</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className={`text-xl font-mono font-black mt-1 ${
            analyticalKpis.monthsAboveCapacity > 0 ? 'text-rose-600' : 'text-emerald-600'
          }`}>
            {analyticalKpis.monthsAboveCapacity} <span className="text-xs font-normal text-slate-500">/ 12 mos</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {analyticalKpis.monthsAboveCapacity > 0 ? 'Chronic bed deficit' : 'Nominal capacity'}
          </div>
        </div>
      </div>

      {/* MAIN RECHARTS VISUALIZATION CONTAINER */}
      <div className="p-4 sm:p-6 bg-white space-y-4">
        {/* Toggle options bar above chart */}
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-semibold select-none">
              <input
                type="checkbox"
                checked={showThreshold90}
                onChange={(e) => setShowThreshold90(e.target.checked)}
                className="rounded text-amber-500 focus:ring-amber-500 cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-amber-500 border border-amber-500 border-dashed inline-block" />
                Show 90% Statutory Warning Level
              </span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-semibold select-none">
              <input
                type="checkbox"
                checked={showMilestones}
                onChange={(e) => setShowMilestones(e.target.checked)}
                className="rounded text-[#714B67] focus:ring-[#714B67] cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Show Judicial & Operational Milestones
              </span>
            </label>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            {activeFacilityMeta?.name} • Design Limit: <strong className="text-slate-800">{activeFacilityMeta?.capacity} beds</strong>
          </div>
        </div>

        {/* SVG Recharts Container */}
        <div className="w-full h-80 sm:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={displayChartData}
              margin={{ top: 20, right: 25, left: 10, bottom: 25 }}
            >
              <defs>
                {/* Population Area Gradient */}
                <linearGradient id="growthPopulationGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#714B67" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#714B67" stopOpacity={0.02} />
                </linearGradient>
                {/* Admissions Bar Gradient */}
                <linearGradient id="growthAdmissionsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.7} />
                </linearGradient>
                {/* Releases Bar Gradient */}
                <linearGradient id="growthReleasesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0.7} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              
              <XAxis
                dataKey="shortLabel"
                stroke="#64748b"
                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                tickMargin={8}
              />

              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'monospace' }}
                tickFormatter={(val) => val.toLocaleString()}
                domain={['dataMin - 50', 'dataMax + 80']}
              />

              <Tooltip content={<CustomGrowthTooltip />} />
              
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 12, fontSize: 12, fontWeight: 600 }}
              />

              {/* Reference line for Design Bed Capacity */}
              <ReferenceLine
                y={activeFacilityMeta?.capacity}
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{
                  value: `Capacity Limit (${activeFacilityMeta?.capacity} beds)`,
                  position: 'insideTopRight',
                  fill: '#b91c1c',
                  fontSize: 11,
                  fontWeight: 700,
                  offset: 8
                }}
              />

              {/* Reference line for 90% Warning Threshold */}
              {showThreshold90 && (
                <ReferenceLine
                  y={Math.round((activeFacilityMeta?.capacity || 0) * 0.9)}
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  label={{
                    value: '90% Warning Level',
                    position: 'insideBottomRight',
                    fill: '#d97706',
                    fontSize: 10,
                    fontWeight: 600,
                    offset: 8
                  }}
                />
              )}

              {/* Metric View 1: Muster Population vs Capacity */}
              {metricView === 'population_vs_capacity' && (
                <>
                  <Area
                    type="monotone"
                    dataKey="totalInmates"
                    name="Inmate Population (Muster)"
                    stroke="#714B67"
                    strokeWidth={3}
                    fill="url(#growthPopulationGrad)"
                    dot={{ r: 4, fill: '#714B67', strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 7, stroke: '#714B67', strokeWidth: 2, fill: '#ffffff' }}
                  />
                  <Bar
                    dataKey="admissions"
                    name="Monthly New Admissions"
                    fill="url(#growthAdmissionsGrad)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                  <Line
                    type="monotone"
                    dataKey="releases"
                    name="Monthly Releases"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    dot={{ r: 3, fill: '#3b82f6' }}
                  />
                </>
              )}

              {/* Metric View 2: Inflow vs Outflow Dynamics */}
              {metricView === 'inflow_vs_outflow' && (
                <>
                  <Bar
                    dataKey="admissions"
                    name="New Committals / Intakes"
                    fill="url(#growthAdmissionsGrad)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                  <Bar
                    dataKey="releases"
                    name="Discharges / Remission Exits"
                    fill="url(#growthReleasesGrad)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={28}
                  />
                  <Line
                    type="monotone"
                    dataKey="netGrowth"
                    name="Net Growth Delta"
                    stroke="#d97706"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#d97706', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                  <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={1} />
                </>
              )}

              {/* Metric View 3: Cumulative Intake Trajectory */}
              {metricView === 'cumulative_trajectory' && (
                <>
                  <Area
                    type="monotone"
                    dataKey="cumulativeAdmissions"
                    name="Cumulative Admissions Intake"
                    stroke="#10b981"
                    strokeWidth={3}
                    fill="#10b981"
                    fillOpacity={0.15}
                    dot={{ r: 4, fill: '#10b981' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalInmates"
                    name="Active Muster Population"
                    stroke="#714B67"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#714B67' }}
                  />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* TIMELINE ANNOTATIONS / MILESTONES BAR */}
        {showMilestones && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Operational Timeline & Judicial Committal Inflection Points</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Key events driving capacity shifts
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {Object.entries(OPERATIONAL_MILESTONES).slice(0, 4).map(([monthKey, milestone]) => (
                <div 
                  key={`mile-${monthKey}`}
                  className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {monthKey}
                    </span>
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                      INFLECTION
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 text-[11px]">
                    {milestone.title}
                  </div>
                  <p className="text-[10px] text-slate-600 line-clamp-2 leading-relaxed">
                    {milestone.description}
                  </p>
                  <div className="text-[9px] text-[#714B67] font-semibold font-mono pt-0.5">
                    {milestone.impact}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COMPARATIVE MULTI-FACILITY INSTITUTIONAL GROWTH MATRIX */}
        <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
          <div className="bg-slate-100/90 px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2 text-xs font-bold text-slate-800">
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-slate-600" />
              <span>Institutional 12-Month Growth & Capacity Limit Matrix</span>
            </span>
            <span className="text-[11px] font-mono text-slate-500 font-normal">
              Click any facility to isolate its 12-month admission trajectory
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Facility / Code</th>
                  <th className="p-2.5 text-center">Security Rating</th>
                  <th className="p-2.5 text-right">Oct 2025 (12M Ago)</th>
                  <th className="p-2.5 text-right">Sep 2026 (Current)</th>
                  <th className="p-2.5 text-right">Capacity Limit</th>
                  <th className="p-2.5 text-center">Occupancy Rate</th>
                  <th className="p-2.5 text-center">12M Net Delta</th>
                  <th className="p-2.5 text-center">12M Total Intakes</th>
                  <th className="p-2.5 text-center">Status / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {facilities.map((fac) => {
                  const facSeries = allFacilitiesMonthlyData.get(fac.id);
                  const startPop = facSeries ? facSeries[0].totalInmates : Math.round(fac.currentInmates * 0.85);
                  const delta = fac.currentInmates - startPop;
                  const deltaPct = startPop > 0 ? Number(((delta / startPop) * 100).toFixed(1)) : 0;
                  const totalIntakes = facSeries ? facSeries.reduce((acc, d) => acc + d.admissions, 0) : 0;
                  const occupancy = Math.round((fac.currentInmates / fac.capacity) * 100);
                  const isSelected = activeScope === fac.id;
                  const isOver = fac.currentInmates > fac.capacity;

                  return (
                    <tr
                      key={`matrix-fac-${fac.id}`}
                      onClick={() => handleScopeChange(fac.id)}
                      className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#714B67]/5 font-semibold' : ''
                      }`}
                    >
                      <td className="p-2.5 font-sans font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${isOver ? 'bg-rose-600' : 'bg-emerald-500'}`} />
                          <span>{fac.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">({fac.code})</span>
                        </div>
                      </td>
                      <td className="p-2.5 text-center text-slate-600 font-sans">
                        {fac.securityRating}
                      </td>
                      <td className="p-2.5 text-right text-slate-600">
                        {startPop.toLocaleString()}
                      </td>
                      <td className="p-2.5 text-right font-bold text-slate-900">
                        {fac.currentInmates.toLocaleString()}
                      </td>
                      <td className="p-2.5 text-right text-slate-700">
                        {fac.capacity.toLocaleString()}
                      </td>
                      <td className="p-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          occupancy > 100 
                            ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                            : occupancy >= 90 
                            ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}>
                          {occupancy}%
                        </span>
                      </td>
                      <td className="p-2.5 text-center font-bold">
                        <span className={delta > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                          {delta > 0 ? `+${delta}` : delta} ({deltaPct > 0 ? `+${deltaPct}%` : `${deltaPct}%`})
                        </span>
                      </td>
                      <td className="p-2.5 text-center font-bold text-slate-800">
                        {totalIntakes.toLocaleString()}
                      </td>
                      <td className="p-2.5 text-center font-sans">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleScopeChange(fac.id);
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                              isSelected ? 'bg-[#714B67] text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                            }`}
                          >
                            {isSelected ? 'Viewing' : 'Inspect'}
                          </button>
                          {isOver && onNavigateToTransfers && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigateToTransfers(fac.id);
                              }}
                              className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-2xs"
                              title="Initiate urgent decongestion transfer"
                            >
                              Transfer
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* BOTTOM ACTION / DISPATCH BAR */}
        <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="text-slate-600 flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              Longitudinal analysis reveals consistent net positive admission rates across 4 out of 5 penal stations. Facilities surpassing 90% require transfer convoys to agricultural and open trusts to avoid structural breaches.
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeScope !== 'ALL' && (
              <button
                onClick={() => handleScopeChange('ALL')}
                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 text-slate-600" />
                <span>Reset to National View</span>
              </button>
            )}

            {onNavigateToTransfers && (
              <button
                onClick={() => onNavigateToTransfers(activeScope === 'ALL' ? undefined : activeScope)}
                className="px-3 py-1.5 rounded-lg bg-[#714B67] hover:bg-[#85587a] text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Decongestion Transfers</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
