import React, { useState } from 'react';
import { Inmate, CourtHearing } from '../../types';
import { 
  Gavel, 
  Calendar, 
  Clock, 
  Video, 
  Car, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  FileText, 
  UserCheck, 
  Scale 
} from 'lucide-react';

interface CourtDocketHubProps {
  inmates: Inmate[];
  onSelectInmate: (inmate: Inmate) => void;
  onUpdateInmate: (inmate: Inmate) => void;
}

export const CourtDocketHub: React.FC<CourtDocketHubProps> = ({
  inmates,
  onSelectInmate,
  onUpdateInmate
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'today' | 'virtual' | 'physical'>('all');

  // Collect all court hearings from all inmates
  const allHearings = inmates.flatMap(i => i.courtCases);

  const filteredHearings = allHearings.filter(h => {
    if (filterMode === 'today') return h.hearingDate === '2026-09-18';
    if (filterMode === 'virtual') return h.courtMode === 'virtual_video_link';
    if (filterMode === 'physical') return h.courtMode === 'physical_court';
    return true;
  });

  const hearingsToday = allHearings.filter(h => h.hearingDate === '2026-09-18');

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Gavel className="w-5 h-5 text-[#714B67]" />
            Court Attendance, Scheduling & Judicial Case Workflow
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Module 5: Production warrants, judicial case tracking, armed escort manifests, and virtual courtroom video links.
          </p>
        </div>

        {/* Quick Tabs / Filters */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-md text-xs">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              filterMode === 'all' ? 'bg-white text-[#714B67] shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Dockets ({allHearings.length})
          </button>
          <button
            onClick={() => setFilterMode('today')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              filterMode === 'today' ? 'bg-white text-amber-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today's Hearings ({hearingsToday.length})
          </button>
          <button
            onClick={() => setFilterMode('virtual')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              filterMode === 'virtual' ? 'bg-white text-purple-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Virtual Video Link
          </button>
          <button
            onClick={() => setFilterMode('physical')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              filterMode === 'physical' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Physical Convoy Escort
          </button>
        </div>
      </div>

      {/* Today's High Priority Judicial Docket Banner */}
      {hearingsToday.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-300 rounded-lg p-4">
          <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5 mb-3">
            <Clock className="w-4 h-4 text-amber-600" />
            Today's Scheduled Court Appearances (Production Warrants Validated)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {hearingsToday.map(h => {
              const matchedInmate = inmates.find(i => i.id === h.inmateId);
              return (
                <div key={h.id} className="bg-white p-3.5 rounded-lg border border-amber-200 shadow-2xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                        {h.caseNumber}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{h.inmateName}</h4>
                      <div className="text-xs text-slate-500 font-mono">Booking: {h.bookingNumber}</div>
                    </div>

                    <div className="text-right">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1 ${
                        h.courtMode === 'virtual_video_link' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {h.courtMode === 'virtual_video_link' ? <Video className="w-3 h-3" /> : <Car className="w-3 h-3" />}
                        {h.courtMode === 'virtual_video_link' ? 'Virtual Booth' : 'Armed Escort'}
                      </span>
                      <div className="text-xs font-bold font-mono text-slate-700 mt-1">{h.hearingTime}</div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-700 pt-2 border-t border-slate-100 flex justify-between">
                    <div><strong>Court:</strong> {h.courtName} (Judge: {h.judgeName})</div>
                    <div><strong>Hearing:</strong> <span className="capitalize font-semibold">{h.hearingType.replace('_', ' ')}</span></div>
                  </div>

                  <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded flex justify-between items-center">
                    <span>Escort: {h.escortTeam} ({h.transportVehicleNumber})</span>
                    {matchedInmate && (
                      <button
                        onClick={() => onSelectInmate(matchedInmate)}
                        className="text-xs font-bold text-[#714B67] hover:underline"
                      >
                        Open Inmate Record ➔
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Case Workflow Stages Guide */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Scale className="w-4 h-4 text-[#714B67]" />
          Judicial Criminal Case Workflow Pipeline
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center text-xs">
          <div className="p-2.5 rounded border border-slate-200 bg-slate-50">
            <div className="font-bold text-slate-700">1. Committal</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Formal charges & warrants</div>
          </div>
          <div className="p-2.5 rounded border border-blue-200 bg-blue-50/50">
            <div className="font-bold text-blue-800">2. Bail Hearing</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Surety review & bond terms</div>
          </div>
          <div className="p-2.5 rounded border border-purple-200 bg-purple-50/50">
            <div className="font-bold text-purple-800">3. Plea & Pre-Trial</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Disclosure & witness roll</div>
          </div>
          <div className="p-2.5 rounded border border-amber-200 bg-amber-50/50">
            <div className="font-bold text-amber-800">4. Trial Hearings</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Prosecution & defense</div>
          </div>
          <div className="p-2.5 rounded border border-slate-200 bg-slate-50">
            <div className="font-bold text-slate-800">5. Judgment</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Guilty / Acquitted</div>
          </div>
          <div className="p-2.5 rounded border border-emerald-200 bg-emerald-50/50">
            <div className="font-bold text-emerald-800">6. Sentence Warrant</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Custodial committal</div>
          </div>
        </div>
      </div>

      {/* Comprehensive Hearings Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            All National Judicial Court Hearings & Escorts
          </h3>
          <span className="text-[10px] text-slate-500">
            Showing {filteredHearings.length} court dockets
          </span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3">Date & Time</th>
              <th className="py-2.5 px-3">Case #</th>
              <th className="py-2.5 px-3">Inmate Name</th>
              <th className="py-2.5 px-3">Court & Judge</th>
              <th className="py-2.5 px-3">Hearing Type</th>
              <th className="py-2.5 px-3">Mode</th>
              <th className="py-2.5 px-3">Escort Detail</th>
              <th className="py-2.5 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredHearings.map(h => {
              const matchedInmate = inmates.find(i => i.id === h.inmateId);
              return (
                <tr
                  key={h.id}
                  onClick={() => matchedInmate && onSelectInmate(matchedInmate)}
                  className="hover:bg-purple-50/50 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                    <div>{h.hearingDate}</div>
                    <div className="text-[10px] text-slate-500">{h.hearingTime}</div>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{h.caseNumber}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{h.inmateName}</td>
                  <td className="py-2.5 px-3">
                    <div className="font-medium text-slate-800">{h.courtName}</div>
                    <div className="text-[10px] text-slate-500">{h.judgeName}</div>
                  </td>
                  <td className="py-2.5 px-3 capitalize font-medium">{h.hearingType.replace('_', ' ')}</td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      h.courtMode === 'virtual_video_link' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {h.courtMode === 'virtual_video_link' ? 'Virtual' : 'Physical'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[11px] text-slate-600">
                    <div>{h.escortTeam}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{h.transportVehicleNumber}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded capitalize">
                      {h.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
