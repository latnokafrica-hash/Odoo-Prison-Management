import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Area, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { Language } from '../../types';
import { 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  Activity, 
  AlertCircle, 
  Calendar, 
  Flame, 
  Zap, 
  Filter 
} from 'lucide-react';

interface Contraband30DayTrendChartProps {
  language: Language;
}

// 30-day historical data points
const CONTRABAND_30DAY_SERIES = [
  { date: '08/25', day: 'D-30', weapons: 1, narcotics: 2, electronics: 1, tools: 0, total: 4 },
  { date: '08/26', day: 'D-29', weapons: 0, narcotics: 1, electronics: 0, tools: 1, total: 2 },
  { date: '08/27', day: 'D-28', weapons: 2, narcotics: 0, electronics: 1, tools: 0, total: 3 },
  { date: '08/28', day: 'D-27', weapons: 0, narcotics: 3, electronics: 1, tools: 0, total: 4 },
  { date: '08/29', day: 'D-26', weapons: 1, narcotics: 1, electronics: 0, tools: 0, total: 2 },
  { date: '08/30', day: 'D-25', weapons: 0, narcotics: 2, electronics: 2, tools: 1, total: 5 },
  { date: '08/31', day: 'D-24', weapons: 0, narcotics: 0, electronics: 0, tools: 0, total: 0 },
  { date: '09/01', day: 'D-23', weapons: 1, narcotics: 2, electronics: 1, tools: 0, total: 4 },
  { date: '09/02', day: 'D-22', weapons: 0, narcotics: 1, electronics: 0, tools: 0, total: 1 },
  { date: '09/03', day: 'D-21', weapons: 3, narcotics: 4, electronics: 2, tools: 1, total: 10, event: 'Surprise Sweep Tier-3' },
  { date: '09/04', day: 'D-20', weapons: 0, narcotics: 1, electronics: 0, tools: 0, total: 1 },
  { date: '09/05', day: 'D-19', weapons: 1, narcotics: 0, electronics: 1, tools: 0, total: 2 },
  { date: '09/06', day: 'D-18', weapons: 0, narcotics: 2, electronics: 1, tools: 0, total: 3 },
  { date: '09/07', day: 'D-17', weapons: 0, narcotics: 1, electronics: 0, tools: 1, total: 2 },
  { date: '09/08', day: 'D-16', weapons: 1, narcotics: 3, electronics: 2, tools: 0, total: 6 },
  { date: '09/09', day: 'D-15', weapons: 0, narcotics: 0, electronics: 1, tools: 0, total: 1 },
  { date: '09/10', day: 'D-14', weapons: 2, narcotics: 2, electronics: 0, tools: 0, total: 4 },
  { date: '09/11', day: 'D-13', weapons: 0, narcotics: 1, electronics: 1, tools: 0, total: 2 },
  { date: '09/12', day: 'D-12', weapons: 1, narcotics: 0, electronics: 0, tools: 0, total: 1 },
  { date: '09/13', day: 'D-11', weapons: 0, narcotics: 2, electronics: 1, tools: 1, total: 4 },
  { date: '09/14', day: 'D-10', weapons: 0, narcotics: 1, electronics: 0, tools: 0, total: 1 },
  { date: '09/15', day: 'D-09', weapons: 2, narcotics: 3, electronics: 1, tools: 0, total: 6 },
  { date: '09/16', day: 'D-08', weapons: 0, narcotics: 1, electronics: 0, tools: 0, total: 1 },
  { date: '09/17', day: 'D-07', weapons: 1, narcotics: 0, electronics: 2, tools: 0, total: 3 },
  { date: '09/18', day: 'D-06', weapons: 4, narcotics: 5, electronics: 3, tools: 2, total: 14, event: 'General Lockdown Shakedown' },
  { date: '09/19', day: 'D-05', weapons: 0, narcotics: 1, electronics: 0, tools: 0, total: 1 },
  { date: '09/20', day: 'D-04', weapons: 1, narcotics: 2, electronics: 1, tools: 0, total: 4 },
  { date: '09/21', day: 'D-03', weapons: 0, narcotics: 1, electronics: 0, tools: 0, total: 1 },
  { date: '09/22', day: 'D-02', weapons: 1, narcotics: 2, electronics: 1, tools: 1, total: 5 },
  { date: '09/23', day: 'Today', weapons: 2, narcotics: 3, electronics: 1, tools: 0, total: 6 },
];

export const Contraband30DayTrendChart: React.FC<Contraband30DayTrendChartProps> = ({ language }) => {
  const isFr = language === 'fr';
  const [chartMode, setChartMode] = useState<'stacked' | 'category' | 'trendline'>('stacked');

  // Computed metrics
  const totals = useMemo(() => {
    return CONTRABAND_30DAY_SERIES.reduce(
      (acc, curr) => {
        acc.weapons += curr.weapons;
        acc.narcotics += curr.narcotics;
        acc.electronics += curr.electronics;
        acc.tools += curr.tools;
        acc.total += curr.total;
        return acc;
      },
      { weapons: 0, narcotics: 0, electronics: 0, tools: 0, total: 0 }
    );
  }, []);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      const currentEntry = CONTRABAND_30DAY_SERIES.find(d => d.date === label);
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs text-slate-200 min-w-[210px] space-y-1.5 font-sans">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1">
            <span className="font-mono font-bold text-white flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isFr ? 'Date :' : 'Date:'} {label} ({currentEntry?.day})</span>
            </span>
            <span className="font-mono text-xs font-bold text-amber-300 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-800">
              {currentEntry?.total} {isFr ? 'saisies' : 'items'}
            </span>
          </div>

          {currentEntry?.event && (
            <div className="p-1 rounded bg-rose-950/80 border border-rose-800 text-[10px] font-bold text-rose-300">
              ⚡ {currentEntry.event}
            </div>
          )}

          <div className="space-y-1 pt-1 font-mono text-[11px]">
            {payload.map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="capitalize text-slate-400">{entry.name}:</span>
                </span>
                <span className="font-bold text-white">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-slate-100 space-y-4">
      
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-950/40">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                {isFr ? 'Analyse des Saisies de Contrebande (30 Derniers Jours)' : 'Contraband Seizures Trend (Last 30 Days)'}
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                THREAT INTEL
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {isFr 
                ? 'Volume temporel, détection des pics de fouilles et identification des corridors d\'infiltration' 
                : 'Longitudinal seizure volumes, sweep spike correlation, and contraband vector analysis'}
            </p>
          </div>
        </div>

        {/* View Mode Controls */}
        <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
          <button
            type="button"
            onClick={() => setChartMode('stacked')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              chartMode === 'stacked' ? 'bg-indigo-600 text-white shadow-xs font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isFr ? 'Aires Cumulées' : 'Volume Area'}
          </button>
          <button
            type="button"
            onClick={() => setChartMode('category')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              chartMode === 'category' ? 'bg-indigo-600 text-white shadow-xs font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isFr ? 'Histogramme' : 'Category Bars'}
          </button>
          <button
            type="button"
            onClick={() => setChartMode('trendline')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              chartMode === 'trendline' ? 'bg-indigo-600 text-white shadow-xs font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isFr ? 'Ligne & Pic' : 'Trend Line'}
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
          <span className="text-slate-400 text-[10px] uppercase font-bold block">{isFr ? 'Total Saisies' : 'Total Seized'}</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-mono font-black text-white">{totals.total}</span>
            <span className="text-[10px] text-emerald-400 flex items-center font-bold">
              <TrendingDown className="w-3 h-3 mr-0.5" /> -14%
            </span>
          </div>
        </div>

        <div className="bg-rose-950/30 p-3 rounded-xl border border-rose-800/50">
          <span className="text-rose-300 text-[10px] uppercase font-bold block">{isFr ? 'Armes & Lames' : 'Weapons & Shanks'}</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-mono font-black text-rose-400">{totals.weapons}</span>
            <span className="text-[10px] text-slate-400 font-mono">({Math.round((totals.weapons / totals.total) * 100)}%)</span>
          </div>
        </div>

        <div className="bg-amber-950/30 p-3 rounded-xl border border-amber-800/50">
          <span className="text-amber-300 text-[10px] uppercase font-bold block">{isFr ? 'Stupéfiants & Pilules' : 'Narcotics & Drugs'}</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-mono font-black text-amber-400">{totals.narcotics}</span>
            <span className="text-[10px] text-slate-400 font-mono">({Math.round((totals.narcotics / totals.total) * 100)}%)</span>
          </div>
        </div>

        <div className="bg-blue-950/30 p-3 rounded-xl border border-blue-800/50">
          <span className="text-blue-300 text-[10px] uppercase font-bold block">{isFr ? 'Smartphones / Comms' : 'Electronics & Comms'}</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-mono font-black text-blue-400">{totals.electronics}</span>
            <span className="text-[10px] text-slate-400 font-mono">({Math.round((totals.electronics / totals.total) * 100)}%)</span>
          </div>
        </div>

        <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 col-span-2 sm:col-span-1">
          <span className="text-purple-300 text-[10px] uppercase font-bold block">{isFr ? 'Outils Altérés' : 'Altered Tools'}</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-mono font-black text-purple-400">{totals.tools}</span>
            <span className="text-[10px] text-slate-400 font-mono">({Math.round((totals.tools / totals.total) * 100)}%)</span>
          </div>
        </div>
      </div>

      {/* Main Recharts Visualization Canvas */}
      <div className="w-full h-72 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartMode === 'stacked' ? (
            <ComposedChart data={CONTRABAND_30DAY_SERIES} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="colorNarcotics" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 10 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                formatter={(value) => <span className="text-slate-300 capitalize">{value}</span>}
              />
              <Area type="monotone" dataKey="total" name={isFr ? 'Volume Total' : 'Total Seizures'} stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
              <Line type="monotone" dataKey="weapons" name={isFr ? 'Armes Blanches' : 'Weapons'} stroke="#e11d48" strokeWidth={2.5} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="narcotics" name={isFr ? 'Stupéfiants' : 'Narcotics'} stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="electronics" name={isFr ? 'Électronique' : 'Electronics'} stroke="#38bdf8" strokeWidth={1.5} dot={{ r: 2 }} />
            </ComposedChart>
          ) : chartMode === 'category' ? (
            <ComposedChart data={CONTRABAND_30DAY_SERIES} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 10 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                formatter={(value) => <span className="text-slate-300 capitalize">{value}</span>}
              />
              <Bar dataKey="weapons" name={isFr ? 'Armes' : 'Weapons'} stackId="a" fill="#e11d48" />
              <Bar dataKey="narcotics" name={isFr ? 'Stupéfiants' : 'Narcotics'} stackId="a" fill="#f59e0b" />
              <Bar dataKey="electronics" name={isFr ? 'Électronique' : 'Electronics'} stackId="a" fill="#38bdf8" />
              <Bar dataKey="tools" name={isFr ? 'Outils' : 'Tools'} stackId="a" fill="#a855f7" />
            </ComposedChart>
          ) : (
            <ComposedChart data={CONTRABAND_30DAY_SERIES} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 10 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                formatter={(value) => <span className="text-slate-300 capitalize">{value}</span>}
              />
              <Line type="stepAfter" dataKey="total" name={isFr ? 'Tendance Globale' : 'Total Seizures'} stroke="#f43f5e" strokeWidth={3} dot={{ r: 3, fill: '#f43f5e' }} activeDot={{ r: 6 }} />
              <Bar dataKey="weapons" name={isFr ? 'Armes Détectées' : 'Weapons Detected'} fill="#f43f5e" opacity={0.4} />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Intelligence Findings Note */}
      <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-start gap-2 text-xs text-slate-300">
        <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white block font-semibold">
            {isFr ? 'Rapport Tactique du Renseignement Pénitentiaire :' : 'Prison Intelligence Tactical Analysis:'}
          </strong>
          <span className="text-slate-300">
            {isFr
              ? 'Pic majeur identifié le 18/09 (14 articles) lors du confinement général du Bloc C. Le ratio armes/détenu a diminué de 22% suite aux fouilles aléatoires aux rayons X installés au couloir central.'
              : 'Primary spike detected on 09/18 (14 items) following surprise general lockdown in Tier-3. Shank fabrication is down 22% month-over-month following installation of walkthrough millimeter-wave portals.'}
          </span>
        </div>
      </div>

    </div>
  );
};
