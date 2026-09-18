import React, { useState } from 'react';
import { Inmate } from '../../types';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Activity, 
  Sun, 
  Lock, 
  MessageSquareQuote,
  Plus
} from 'lucide-react';

interface HumanRightsHubProps {
  inmates: Inmate[];
  onSelectInmate: (inmate: Inmate) => void;
  onUpdateInmate: (inmate: Inmate) => void;
}

export const HumanRightsHub: React.FC<HumanRightsHubProps> = ({
  inmates,
  onSelectInmate,
  onUpdateInmate
}) => {
  // Collect all human rights audits
  const allAudits = inmates.flatMap(i => 
    i.humanRightsAudits.map(a => ({ ...a, inmateName: `${i.firstName} ${i.lastName}`, bookingNumber: i.bookingNumber, facilityName: i.facilityName }))
  );

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] bg-cyan-700 text-white font-mono font-bold px-2 py-0.5 rounded">
              UN STANDARDS COMPLIANCE
            </span>
            <span className="text-xs text-slate-500">Nelson Mandela & Bangkok Rules Oversight</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-700" />
            Correctional Human Rights & Ombudsman Inspection Oversight
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Independent oversight of custodial conditions, solitary confinement duration thresholds, daily outdoor exercise, and confidential inmate petitions.
          </p>
        </div>
      </div>

      {/* Core Nelson Mandela Standards Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-2">
          <div className="flex items-center space-x-2 text-amber-600">
            <Sun className="w-5 h-5" />
            <h3 className="font-bold text-xs text-slate-900">Rule 23: Fresh Air & Exercise</h3>
          </div>
          <p className="text-xs text-slate-600">
            Mandatory minimum 1 hour of suitable outdoor exercise daily for all prisoners, regardless of security classification or disciplinary status.
          </p>
          <div className="pt-2 text-xs font-semibold text-emerald-700">
            National Average: 2.1 Hours / Day (100% Compliant)
          </div>
        </div>

        <div className="bg-white border border-rose-200 rounded-lg p-4 shadow-xs space-y-2 bg-rose-50/30">
          <div className="flex items-center space-x-2 text-rose-600">
            <Lock className="w-5 h-5" />
            <h3 className="font-bold text-xs text-slate-900">Rule 43: Solitary Confinement Cap</h3>
          </div>
          <p className="text-xs text-slate-600">
            Strict prohibition of prolonged solitary confinement. The maximum allowable continuous solitary period is capped at 15 consecutive days.
          </p>
          <div className="pt-2 text-xs font-semibold text-rose-700">
            Active Watchlist: 1 Inmate at Day 14 (Rotation Required)
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-2">
          <div className="flex items-center space-x-2 text-blue-600">
            <MessageSquareQuote className="w-5 h-5" />
            <h3 className="font-bold text-xs text-slate-900">Rule 56: Grievance Redress</h3>
          </div>
          <p className="text-xs text-slate-600">
            Uncensored right to submit sealed complaints to the Prison Ombudsman, Judiciary, and Commission on Human Rights without retribution.
          </p>
          <div className="pt-2 text-xs font-semibold text-blue-700">
            All Grievances Registered & Digitized
          </div>
        </div>
      </div>

      {/* Inspections Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Mandela Rules Inspection & Ombudsman Audit Log
          </h3>
          <span className="text-[10px] text-slate-500">
            Independent Inspections by KNCHR, UNODC & Internal Medical Officers
          </span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3">Date</th>
              <th className="py-2.5 px-3">Inmate Profile</th>
              <th className="py-2.5 px-3">Facility</th>
              <th className="py-2.5 px-3">Audit Scope</th>
              <th className="py-2.5 px-3">Outdoor Time</th>
              <th className="py-2.5 px-3">Solitary Duration</th>
              <th className="py-2.5 px-3">Compliance</th>
              <th className="py-2.5 px-3">Recommendations & Directives</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {allAudits.map((a, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-mono text-slate-600">{a.date}</td>
                <td className="py-2.5 px-3">
                  <div className="font-semibold text-slate-900">{a.inmateName}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{a.bookingNumber}</div>
                </td>
                <td className="py-2.5 px-3">{a.facilityName.split(' ')[0]}</td>
                <td className="py-2.5 px-3 capitalize font-medium">{a.inspectionType.replace(/_/g, ' ')}</td>
                <td className="py-2.5 px-3 font-mono font-semibold text-emerald-700">{a.outdoorHoursPerDay} hrs/d</td>
                <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                  <span className={a.consecutiveSolitaryDays >= 14 ? 'text-rose-700 bg-rose-50 px-1 py-0.5 rounded' : ''}>
                    {a.consecutiveSolitaryDays} / 15 d
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                    a.complianceStatus === 'compliant' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {a.complianceStatus.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-slate-700 max-w-sm">
                  <div><strong>{a.auditorName}:</strong> {a.recommendations}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
