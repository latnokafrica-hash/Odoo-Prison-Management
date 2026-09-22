import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { Language } from '../../types';
import { TrendingDown, ShieldAlert, Activity, AlertCircle } from 'lucide-react';

interface ShiftIncidentTrendChartProps {
  language: Language;
}

export const ShiftIncidentTrendChart: React.FC<ShiftIncidentTrendChartProps> = ({ language }) => {
  const isFr = language === 'fr';

  const data = [
    {
      shift: isFr ? 'J-2 Nuit' : 'D-2 Night',
      critical: 2,
      minor: 5,
      medical: 2,
      total: 9,
    },
    {
      shift: isFr ? 'J-1 Matin' : 'D-1 Morn',
      critical: 1,
      minor: 6,
      medical: 3,
      total: 10,
    },
    {
      shift: isFr ? 'J-1 Après' : 'D-1 Aftn',
      critical: 2,
      minor: 4,
      medical: 1,
      total: 7,
    },
    {
      shift: isFr ? 'J-1 Nuit' : 'D-1 Night',
      critical: 1,
      minor: 3,
      medical: 1,
      total: 5,
    },
    {
      shift: isFr ? 'Auj Matin' : 'Today Morn',
      critical: 0,
      minor: 4,
      medical: 2,
      total: 6,
    },
    {
      shift: isFr ? 'Auj Après' : 'Today Aftn',
      critical: 1,
      minor: 3,
      medical: 1,
      total: 5,
    },
    {
      shift: isFr ? 'Quart Actif' : 'Active Watch',
      critical: 0,
      minor: 2,
      medical: 1,
      total: 3,
    },
  ];

  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl p-4 border border-slate-800 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase">
              {isFr ? 'Fréquence des Incidents sur les 7 Derniers Quarts' : 'Incident Frequency Over Last 7 Shifts'}
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isFr 
              ? 'Tendance opérationnelle : alertes critiques, infractions mineures & urgences médicales' 
              : 'Rolling 7-shift trend : critical alerts, minor infractions, and medical emergencies'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>-57% {isFr ? 'Baisse nette' : 'Net Decline'}</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
            {isFr ? 'Seuil d\'alerte : < 6/quart' : 'Target Threshold: < 6/shift'}
          </span>
        </div>
      </div>

      <div className="h-52 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="shift" 
              tick={{ fill: '#94a3b8', fontSize: 10 }} 
              axisLine={{ stroke: '#475569' }}
              tickLine={{ stroke: '#475569' }}
            />
            <YAxis 
              allowDecimals={false} 
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              axisLine={{ stroke: '#475569' }}
              tickLine={{ stroke: '#475569' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0f172a', 
                borderColor: '#334155', 
                borderRadius: '8px', 
                fontSize: '11px',
                color: '#f8fafc',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
              }}
              labelStyle={{ fontWeight: 'bold', color: '#cbd5e1', marginBottom: '4px' }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }}
              formatter={(value) => {
                if (value === 'critical') return isFr ? 'Critique / Sécurité' : 'Critical Threats';
                if (value === 'minor') return isFr ? 'Infractions Mineures' : 'Minor Infractions';
                if (value === 'medical') return isFr ? 'Urgences Médicales' : 'Medical Evacs';
                return value;
              }}
            />
            <Line 
              type="monotone" 
              dataKey="critical" 
              name="critical" 
              stroke="#f43f5e" 
              strokeWidth={2.5} 
              dot={{ r: 3.5, fill: '#f43f5e' }} 
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="minor" 
              name="minor" 
              stroke="#f59e0b" 
              strokeWidth={2} 
              strokeDasharray="4 4"
              dot={{ r: 3, fill: '#f59e0b' }} 
            />
            <Line 
              type="monotone" 
              dataKey="medical" 
              name="medical" 
              stroke="#38bdf8" 
              strokeWidth={2} 
              dot={{ r: 3, fill: '#38bdf8' }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-[10px]">
        <div className="p-1.5 bg-slate-800/50 rounded border border-slate-700/50">
          <span className="text-slate-400 block">{isFr ? 'Moyenne 7 Quarts' : '7-Shift Avg'}</span>
          <strong className="text-slate-200 text-xs font-mono">6.4 {isFr ? 'incidents/q' : 'inc/shift'}</strong>
        </div>
        <div className="p-1.5 bg-slate-800/50 rounded border border-slate-700/50">
          <span className="text-slate-400 block">{isFr ? 'Quart Actuel' : 'Current Shift'}</span>
          <strong className="text-emerald-400 text-xs font-mono">3 {isFr ? 'enregistrés' : 'logged'}</strong>
        </div>
        <div className="p-1.5 bg-slate-800/50 rounded border border-slate-700/50">
          <span className="text-slate-400 block">{isFr ? 'Poste de Sécurité' : 'Security Posture'}</span>
          <strong className="text-indigo-300 text-xs font-mono">{isFr ? 'STABLE & NORMAL' : 'STABILIZED / DEFCON 4'}</strong>
        </div>
      </div>
    </div>
  );
};
