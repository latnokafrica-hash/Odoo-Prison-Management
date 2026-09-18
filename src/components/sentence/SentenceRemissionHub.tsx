import React, { useState } from 'react';
import { Inmate } from '../../types';
import { 
  Scale, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Calculator, 
  Calendar, 
  CheckCircle2, 
  FileText, 
  UserCheck 
} from 'lucide-react';

interface SentenceRemissionHubProps {
  inmates: Inmate[];
  onSelectInmate: (inmate: Inmate) => void;
  onUpdateInmate: (inmate: Inmate) => void;
}

export const SentenceRemissionHub: React.FC<SentenceRemissionHubProps> = ({
  inmates,
  onSelectInmate,
  onUpdateInmate
}) => {
  // Interactive Remission Simulator state
  const [simYears, setSimYears] = useState<number>(5);
  const [simMonths, setSimMonths] = useState<number>(0);
  const [simDays, setSimDays] = useState<number>(0);
  const [simInfractionDays, setSimInfractionDays] = useState<number>(28);
  const [simSentenceType, setSimSentenceType] = useState<'determinate' | 'life'>('determinate');

  // Simulation calculations
  const totalSimDays = (simYears * 365) + (simMonths * 30) + simDays;
  const statutoryEarnedSim = Math.round(totalSimDays * (1 / 3)); // Standard 1/3
  const netCustodyDaysSim = Math.max(0, totalSimDays - statutoryEarnedSim + simInfractionDays);

  // Inmates nearing Earliest Date of Release (< 90 days)
  const today = new Date('2026-09-18');
  const convictedInmates = inmates.filter(i => i.custodyStatus === 'convicted');

  // Human rights solitary confinement alerts (approaching 15 days limit)
  const solitaryAlerts = inmates.filter(i => 
    i.humanRightsAudits.some(a => a.consecutiveSolitaryDays >= 10)
  );

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#714B67]" />
            Sentence Administration, Statutory Remission & Human Rights
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Module 3: Automatic statutory 1/3 remission computation, consecutive/concurrent sentence aggregation, parole dates, and UN Nelson Mandela Rules compliance.
          </p>
        </div>
      </div>

      {/* 2-Column Grid: Remission Simulator & National Remission Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Odoo Remission Calculator Widget */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-[#714B67]" />
              Odoo 19 Statutory Remission Calculator
            </h3>
            <span className="text-[10px] bg-purple-100 text-purple-800 font-mono font-bold px-2 py-0.5 rounded">
              Prisons Act Cap 90
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Sentence Years</label>
              <input
                type="number"
                min="0"
                value={simYears}
                onChange={(e) => setSimYears(parseInt(e.target.value) || 0)}
                className="w-full border border-slate-300 rounded p-2 text-sm font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Months</label>
              <input
                type="number"
                min="0"
                max="11"
                value={simMonths}
                onChange={(e) => setSimMonths(parseInt(e.target.value) || 0)}
                className="w-full border border-slate-300 rounded p-2 text-sm font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Days</label>
              <input
                type="number"
                min="0"
                max="30"
                value={simDays}
                onChange={(e) => setSimDays(parseInt(e.target.value) || 0)}
                className="w-full border border-slate-300 rounded p-2 text-sm font-mono font-bold"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-semibold text-slate-700 mb-1">
              Disciplinary Forfeiture Penalty (Days deducted from remission)
            </label>
            <input
              type="number"
              min="0"
              value={simInfractionDays}
              onChange={(e) => setSimInfractionDays(parseInt(e.target.value) || 0)}
              className="w-full border border-slate-300 rounded p-2 text-xs font-mono text-rose-700 font-bold"
            />
          </div>

          {/* Calculator Output Display */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Total Nominal Custodial Term:</span>
              <span className="font-mono font-bold text-slate-900">{totalSimDays} days ({simYears}y {simMonths}m)</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-emerald-700 font-semibold">Statutory Remission (1/3 deduction):</span>
              <span className="font-mono font-bold text-emerald-700">-{statutoryEarnedSim} days</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-rose-700 font-semibold">Loss of Remission (Infractions):</span>
              <span className="font-mono font-bold text-rose-700">+{simInfractionDays} days reinstated</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-900">Net Days Required in Prison:</span>
              <span className="text-lg font-mono font-extrabold text-[#714B67]">{netCustodyDaysSim} days</span>
            </div>
          </div>
        </div>

        {/* Right: Human Rights & Nelson Mandela Compliance */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-700" />
              UN Nelson Mandela Rules & Human Rights Compliance
            </h3>
            <span className="text-[10px] bg-cyan-100 text-cyan-800 font-mono font-bold px-2 py-0.5 rounded">
              Audits Active
            </span>
          </div>

          {/* Solitary Confinement Watch List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1 text-rose-700">
                <AlertTriangle className="w-3.5 h-3.5" />
                Solitary Confinement Threshold (Rule 43: Max 15 Days)
              </h4>
            </div>

            <div className="space-y-2">
              {solitaryAlerts.map(inm => {
                const audit = inm.humanRightsAudits[0];
                return (
                  <div key={inm.id} className="p-3 border border-rose-200 bg-rose-50/50 rounded-md text-xs space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-900">{inm.firstName} {inm.lastName} ({inm.bookingNumber})</span>
                      <span className="font-mono font-bold text-rose-700">
                        Day {audit.consecutiveSolitaryDays} / 15 Limit
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      <strong>Ombudsman Note:</strong> {audit.recommendations}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mandated Standards Cards */}
          <div className="grid grid-cols-2 gap-3 text-xs pt-2">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
              <div className="font-bold text-slate-800">Rule 23: Exercise</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Every prisoner must have at least one hour of suitable exercise in the open air daily.</p>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
              <div className="font-bold text-slate-800">Rule 56: Complaints</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Uncensored right to submit confidential petitions to central inspection bodies.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Convicted Inmates Sentence Roster */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Convicted Inmates Sentence & Remission Ledger
          </h3>
          <span className="text-[10px] text-slate-500">
            Click an inmate to open their full legal file and adjust remission logs
          </span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3">Booking #</th>
              <th className="py-2.5 px-3">Inmate Name</th>
              <th className="py-2.5 px-3">Committing Court</th>
              <th className="py-2.5 px-3">Term</th>
              <th className="py-2.5 px-3">Statutory Remission</th>
              <th className="py-2.5 px-3">Loss of Remission</th>
              <th className="py-2.5 px-3">Earliest Release (EDR)</th>
              <th className="py-2.5 px-3">Parole Eligibility</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {convictedInmates.map(inm => {
              const sen = inm.sentences[0];
              if (!sen) return null;

              return (
                <tr
                  key={inm.id}
                  onClick={() => onSelectInmate(inm)}
                  className="hover:bg-purple-50/50 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{inm.bookingNumber}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{inm.firstName} {inm.lastName}</td>
                  <td className="py-2.5 px-3 text-slate-600">{sen.courtName}</td>
                  <td className="py-2.5 px-3 font-mono font-bold">{sen.termYears} Years</td>
                  <td className="py-2.5 px-3 font-mono text-emerald-700 font-semibold">+{sen.remissionEarnedDays} d</td>
                  <td className="py-2.5 px-3 font-mono text-rose-700 font-semibold">
                    {sen.remissionForfeitedDays > 0 ? `-${sen.remissionForfeitedDays} d` : '0 d'}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-[#714B67]">{sen.earliestReleaseDate}</td>
                  <td className="py-2.5 px-3 font-mono text-blue-700">{sen.paroleEligibilityDate}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
