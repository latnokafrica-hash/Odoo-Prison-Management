import React from 'react';
import { Inmate } from '../../types';
import { 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Calendar, 
  Coins, 
  Gavel,
  Scale
} from 'lucide-react';

interface InmateListViewProps {
  inmates: Inmate[];
  onSelectInmate: (inmate: Inmate) => void;
  selectedInmateId?: string;
}

export const InmateListView: React.FC<InmateListViewProps> = ({
  inmates,
  onSelectInmate,
  selectedInmateId
}) => {
  const getStatusBadge = (status: Inmate['custodyStatus']) => {
    switch (status) {
      case 'convicted':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Convicted</span>;
      case 'remand':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">Remand (Trial)</span>;
      case 'in_transit':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">In Transit</span>;
      case 'escaped':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-600 text-white animate-bounce shadow-xs">ESCAPED</span>;
      case 'recaptured':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-100 text-purple-800 border border-purple-200">Recaptured</span>;
      case 'on_bail':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-100 text-cyan-800 border border-cyan-200">On Bail</span>;
      case 'discharged':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-200 text-slate-700">Discharged</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600">Draft</span>;
    }
  };

  const getSecurityBadge = (cat: Inmate['securityCategory']) => {
    switch (cat) {
      case 'CAT_A':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">CAT A (Max)</span>;
      case 'CAT_B':
        return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-200">CAT B (High)</span>;
      case 'CAT_C':
        return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">CAT C (Medium)</span>;
      case 'CAT_D':
        return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">CAT D (Open)</span>;
    }
  };

  const getStageBadge = (stage: Inmate['progressiveStage']) => {
    switch (stage) {
      case 'stage_1': return <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">Stage 1 (Induction)</span>;
      case 'stage_2': return <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">Stage 2 (Standard)</span>;
      case 'stage_3': return <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">Stage 3 (Advanced)</span>;
      case 'stage_4': return <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-1.5 py-0.5 rounded">Stage 4 (Trust)</span>;
    }
  };

  if (inmates.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-12 text-center my-4 mx-4">
        <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <h3 className="text-base font-semibold text-slate-700">No Inmate Records Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          No inmate records match the active search filters or selected prison facility.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md border border-slate-200 shadow-xs overflow-hidden m-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 select-none">
              <th className="py-2.5 px-3 w-8">
                <input type="checkbox" className="rounded text-[#714B67] focus:ring-[#714B67]" readOnly />
              </th>
              <th className="py-2.5 px-3">Booking #</th>
              <th className="py-2.5 px-3">Inmate Name</th>
              <th className="py-2.5 px-3">Custody Status</th>
              <th className="py-2.5 px-3">Security Level</th>
              <th className="py-2.5 px-3">Assigned Facility</th>
              <th className="py-2.5 px-3">Progressive Stage</th>
              <th className="py-2.5 px-3">Sentence / Offense</th>
              <th className="py-2.5 px-3">Earliest Release (EDR)</th>
              <th className="py-2.5 px-3 text-right">Gratuity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {inmates.map((inmate) => {
              const primarySentence = inmate.sentences[0];
              const isSelected = selectedInmateId === inmate.id;
              const hasEscapeAlert = inmate.custodyStatus === 'escaped';

              return (
                <tr
                  key={inmate.id}
                  onClick={() => onSelectInmate(inmate)}
                  className={`hover:bg-[#714B67]/5 cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#714B67]/10' : ''
                  } ${hasEscapeAlert ? 'bg-rose-50/60' : ''}`}
                >
                  <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      className="rounded text-[#714B67] focus:ring-[#714B67]" 
                      checked={isSelected}
                      readOnly
                    />
                  </td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                    {inmate.bookingNumber}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={inmate.photoUrl}
                        alt={inmate.firstName}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <span>{inmate.firstName} {inmate.lastName}</span>
                          {inmate.alias && (
                            <span className="text-[10px] text-slate-500 font-normal italic">
                              "{inmate.alias}"
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {inmate.nationalIdNumber}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    {getStatusBadge(inmate.custodyStatus)}
                  </td>
                  <td className="py-2.5 px-3">
                    {getSecurityBadge(inmate.securityCategory)}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-medium text-slate-800 truncate max-w-[170px]" title={inmate.facilityName}>
                      {inmate.facilityName.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {inmate.cellLocation}
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    {getStageBadge(inmate.progressiveStage)}
                  </td>
                  <td className="py-2.5 px-3">
                    {primarySentence ? (
                      <div className="max-w-[200px] truncate" title={primarySentence.offense}>
                        <div className="font-medium text-slate-800 truncate">
                          {primarySentence.termYears} Yrs - {(primarySentence.offense || primarySentence.offenseDescription || 'Sentence').split('(')[0]}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {primarySentence.caseNumber}
                        </div>
                      </div>
                    ) : inmate.courtCases.length > 0 ? (
                      <div className="max-w-[190px]">
                        <span className="text-blue-700 font-medium text-[11px] flex items-center gap-1">
                          <Gavel className="w-3 h-3" /> Remand Docket
                        </span>
                        <div className="text-[10px] text-slate-500 truncate">
                          {inmate.courtCases[0].caseNumber}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">No sentence logged</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-mono">
                    {primarySentence ? (
                      <span className="text-slate-800 font-medium">
                        {primarySentence.earliestReleaseDate}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-700">
                    ${inmate.gratuityBalance.toFixed(2)}
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
