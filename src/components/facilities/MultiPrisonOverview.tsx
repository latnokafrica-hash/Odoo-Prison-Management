import React, { useState } from 'react';
import { PrisonFacility, Inmate } from '../../types';
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
  ChevronRight
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
  const [capacityFilter, setCapacityFilter] = useState<'all' | 'exceeding90' | 'overcrowded' | 'normal'>('all');

  const totalCapacity = facilities.reduce((acc, f) => acc + f.capacity, 0);
  const totalCurrentInmates = facilities.reduce((acc, f) => acc + f.currentInmates, 0);
  const nationalOccupancy = Math.round((totalCurrentInmates / totalCapacity) * 100);

  // Prepare chart data: each facility's real-time capacity usage percentage
  const chartData = facilities.map((fac, idx) => {
    const occupancyRate = Math.round((fac.currentInmates / fac.capacity) * 100);
    const isOvercrowded = fac.currentInmates > fac.capacity;
    const isExceeding90 = occupancyRate >= 90;
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
            Centralized capacity surveillance, overcrowding alerts, and rapid inter-prison transfer re-allocation engine.
          </p>
        </div>

        {/* National Aggregates */}
        <div className="flex items-center space-x-3 text-right">
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
        </div>
      </div>

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
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Visual Status Indicator Badges */}
                          {item.occupancyRate > 100 ? (
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
                          {item.currentInmates}/{item.capacity} beds
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

      {/* Facilities Grid Section Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Penitentiary Roster & Inmate Re-allocation Status ({displayedFacilities.length} Facilities)
          </h3>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-500 mr-1">Filter by Capacity:</span>
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
                  : isOvercrowded
                  ? 'border-rose-300 ring-1 ring-rose-300/60 hover:border-rose-400'
                  : isExceeding90
                  ? 'border-amber-300 ring-1 ring-amber-300/50 hover:border-amber-400'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
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

                  {/* VISUAL STATUS INDICATOR BADGES FOR CAPACITY */}
                  {isOvercrowded ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 shadow-xs animate-pulse">
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

                <h3 className="text-base font-bold text-slate-900 mt-2.5 leading-snug">
                  {fac.name}
                </h3>
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{fac.location} ({fac.county} County)</span>
                </div>

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
    </div>
  );
};

