import React, { useState } from 'react';
import { Inmate } from '../../types';
import { MedicalFlagSeverity, deriveMedicalFlag, MEDICAL_FLAG_STYLES } from '../../utils/medicalFlagUtils';
import { MedicalFlagIndicator } from './MedicalFlagIndicator';
import { 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Calendar, 
  Coins, 
  Gavel,
  Scale,
  HeartPulse,
  Stethoscope,
  Activity,
  Filter,
  X,
  AlertTriangle,
  ArrowUpDown
} from 'lucide-react';

interface InmateListViewProps {
  inmates: Inmate[];
  onSelectInmate: (inmate: Inmate, initialTab?: 'intake' | 'medical' | 'sentence' | 'stages' | 'court' | 'transfers' | 'human_rights') => void;
  selectedInmateId?: string;
  onOpenMedicalIntake?: (inmate: Inmate) => void;
}

export const InmateListView: React.FC<InmateListViewProps> = ({
  inmates,
  onSelectInmate,
  selectedInmateId,
  onOpenMedicalIntake
}) => {
  const [medicalFilter, setMedicalFilter] = useState<MedicalFlagSeverity | 'all'>('all');

  // Calculate medical acuity counts
  const medicalCounts = {
    all: inmates.length,
    critical: inmates.filter(i => deriveMedicalFlag(i).severity === 'critical').length,
    needs_specialist: inmates.filter(i => deriveMedicalFlag(i).severity === 'needs_specialist').length,
    chronic: inmates.filter(i => deriveMedicalFlag(i).severity === 'chronic').length,
    stable: inmates.filter(i => deriveMedicalFlag(i).severity === 'stable').length,
  };

  // Filter inmates by medical acuity if selected
  const displayedInmates = medicalFilter === 'all'
    ? inmates
    : inmates.filter(i => deriveMedicalFlag(i).severity === medicalFilter);

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

  const criticalInmates = inmates.filter(i => deriveMedicalFlag(i).severity === 'critical');

  return (
    <div className="space-y-3 m-4">
      {/* Critical Medical Acuity Banner if any critical condition exists */}
      {criticalInmates.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-rose-600 text-white rounded-md shrink-0 animate-pulse">
              <HeartPulse className="w-4 h-4" />
            </span>
            <div>
              <div className="text-xs font-bold text-rose-950 flex items-center gap-2">
                <span>Critical Medical Flag Alert ({criticalInmates.length})</span>
                <span className="text-[10px] font-medium bg-rose-200/80 text-rose-900 px-1.5 py-0.2 rounded">
                  Immediate Clinical Protocol Required
                </span>
              </div>
              <div className="text-[11px] text-rose-800">
                Inmates requiring emergency referral ward hospitalization, hemodialysis, or active psychiatric observation.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMedicalFilter('critical')}
            className="px-2.5 py-1 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded transition-colors shrink-0"
          >
            Filter Critical Inmates ({criticalInmates.length})
          </button>
        </div>
      )}

      {/* Top Controls: Medical Flag Severity Filter Bar */}
      <div className="bg-white rounded-md border border-slate-200 px-3 py-2 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-700">Filter by Medical Flag:</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* All Filter */}
          <button
            type="button"
            onClick={() => setMedicalFilter('all')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
              medicalFilter === 'all'
                ? 'bg-slate-900 text-white font-semibold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Medical ({medicalCounts.all})
          </button>

          {/* Critical Filter */}
          <button
            type="button"
            onClick={() => setMedicalFilter('critical')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
              medicalFilter === 'critical'
                ? 'bg-rose-600 text-white font-bold shadow-xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span>Critical</span>
            <span className="font-bold ml-0.5">({medicalCounts.critical})</span>
          </button>

          {/* Needs Specialist Filter */}
          <button
            type="button"
            onClick={() => setMedicalFilter('needs_specialist')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
              medicalFilter === 'needs_specialist'
                ? 'bg-amber-600 text-white font-bold shadow-xs'
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>Needs Specialist</span>
            <span className="font-bold ml-0.5">({medicalCounts.needs_specialist})</span>
          </button>

          {/* Chronic Filter */}
          <button
            type="button"
            onClick={() => setMedicalFilter('chronic')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
              medicalFilter === 'chronic'
                ? 'bg-sky-600 text-white font-bold shadow-xs'
                : 'bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
            <span>Chronic</span>
            <span className="font-bold ml-0.5">({medicalCounts.chronic})</span>
          </button>

          {/* Fit / Stable Filter */}
          <button
            type="button"
            onClick={() => setMedicalFilter('stable')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
              medicalFilter === 'stable'
                ? 'bg-emerald-700 text-white font-bold shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Fit / Clear</span>
            <span className="font-bold ml-0.5">({medicalCounts.stable})</span>
          </button>

          {/* Reset Filter Button if active */}
          {medicalFilter !== 'all' && (
            <button
              type="button"
              onClick={() => setMedicalFilter('all')}
              className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Clear medical filter"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Inmates Table */}
      {displayedInmates.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-slate-700">No Inmates Found Under Active Filter</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            There are currently no inmates flagged with severity "{medicalFilter.replace('_', ' ')}".
          </p>
          <button
            type="button"
            onClick={() => setMedicalFilter('all')}
            className="mt-3 px-3 py-1.5 text-xs font-medium bg-slate-800 text-white rounded hover:bg-slate-700"
          >
            Reset Medical Filter
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-md border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 select-none">
                  <th className="py-2.5 px-3 w-8">
                    <input type="checkbox" className="rounded text-[#714B67] focus:ring-[#714B67]" readOnly />
                  </th>
                  <th className="py-2.5 px-3">Booking #</th>
                  <th className="py-2.5 px-3">Inmate Name</th>
                  {/* Dynamic Medical Flag Header with Tooltip Guidance */}
                  <th className="py-2.5 px-3 min-w-[155px]">
                    <div className="flex items-center gap-1.5 text-slate-800">
                      <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
                      <span>Medical Flag</span>
                      <span className="text-[10px] font-normal text-slate-400">(Severity)</span>
                    </div>
                  </th>
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
                {displayedInmates.map((inmate) => {
                  const primarySentence = inmate.sentences[0];
                  const isSelected = selectedInmateId === inmate.id;
                  const hasEscapeAlert = inmate.custodyStatus === 'escaped';
                  const medicalFlag = deriveMedicalFlag(inmate);

                  return (
                    <tr
                      key={inmate.id}
                      onClick={() => onSelectInmate(inmate)}
                      className={`hover:bg-[#714B67]/5 cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#714B67]/10' : ''
                      } ${hasEscapeAlert ? 'bg-rose-50/60' : ''} ${
                        medicalFlag.severity === 'critical' ? 'hover:bg-rose-50/40' : ''
                      }`}
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
                          <div className="relative">
                            <img
                              src={inmate.photoUrl}
                              alt={inmate.firstName}
                              className="w-7 h-7 rounded-full object-cover border border-slate-200"
                            />
                            {medicalFlag.severity === 'critical' && (
                              <span 
                                title="Critical Medical Alert Attached" 
                                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-600 rounded-full border-2 border-white animate-pulse"
                              />
                            )}
                          </div>
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

                      {/* Medical Flag Cell with Dynamic Color & Interactive Tooltip */}
                      <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                        <MedicalFlagIndicator
                          inmate={inmate}
                          onOpenMedicalIntake={(inm) => {
                            if (onOpenMedicalIntake) {
                              onOpenMedicalIntake(inm);
                            } else {
                              onSelectInmate(inm, 'medical');
                            }
                          }}
                          showConditionPreview={true}
                        />
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
      )}
    </div>
  );
};
