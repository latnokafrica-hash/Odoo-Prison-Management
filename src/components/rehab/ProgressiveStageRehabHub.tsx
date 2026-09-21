import React, { useState } from 'react';
import { Inmate } from '../../types';
import { VOCATIONAL_PROGRAMS } from '../../data/initialData';
import { EducationalProgramsHub } from './EducationalProgramsHub';
import { 
  GraduationCap, 
  Coins, 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  Users, 
  DollarSign, 
  Wrench, 
  Calendar,
  BookOpen,
  ArrowRight
} from 'lucide-react';

interface ProgressiveStageRehabHubProps {
  inmates: Inmate[];
  onSelectInmate: (inmate: Inmate) => void;
  onUpdateInmate: (inmate: Inmate) => void;
}

export const ProgressiveStageRehabHub: React.FC<ProgressiveStageRehabHubProps> = ({
  inmates,
  onSelectInmate,
  onUpdateInmate
}) => {
  const [rehabTab, setRehabTab] = useState<'educational' | 'progressive'>('educational');
  const [selectedProgramId, setSelectedProgramId] = useState<string>('ALL');

  // Stats across the national prison population
  const totalGratuityDisbursed = inmates.reduce((acc, i) => acc + i.gratuityBalance, 0);
  const enrolledCount = inmates.reduce((acc, i) => acc + i.programs.length, 0);
  const stage4Count = inmates.filter(i => i.progressiveStage === 'stage_4').length;

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-5">
      {/* Module 4 Top Dual-Hub Navigation Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-1.5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-1.5 w-full sm:w-auto">
          <button
            onClick={() => setRehabTab('educational')}
            id="tab-educational-programs"
            className={`flex-1 sm:flex-initial py-2 px-3.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              rehabTab === 'educational'
                ? 'bg-[#714B67] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Educational Programs & Course Hub
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
              rehabTab === 'educational' ? 'bg-purple-800 text-purple-100' : 'bg-slate-200 text-slate-700'
            }`}>
              {enrolledCount} Active
            </span>
          </button>

          <button
            onClick={() => setRehabTab('progressive')}
            id="tab-progressive-stages"
            className={`flex-1 sm:flex-initial py-2 px-3.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              rehabTab === 'progressive'
                ? 'bg-[#714B67] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            4-Stage Progressive Ladder & Gratuity
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
              rehabTab === 'progressive' ? 'bg-purple-800 text-purple-100' : 'bg-slate-200 text-slate-700'
            }`}>
              ${totalGratuityDisbursed.toFixed(2)}
            </span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 pr-3">
          <Award className="w-4 h-4 text-amber-500" />
          <span>Module 4: Inmate Rehabilitation & Earning Schemes</span>
        </div>
      </div>

      {/* RENDER EDUCATIONAL PROGRAMS HUB */}
      {rehabTab === 'educational' && (
        <EducationalProgramsHub
          inmates={inmates}
          onSelectInmate={onSelectInmate}
          onUpdateInmate={onUpdateInmate}
        />
      )}

      {/* RENDER PROGRESSIVE STAGES & GRATUITY VIEW */}
      {rehabTab === 'progressive' && (
        <div className="space-y-6">
          {/* Top Banner */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#714B67]" />
                Classification, Progressive Stage System & Gratuity Schemes
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Module 4: Inmate rehabilitation, vocational trade qualifications, 4-stage progressive ladder, and labor earnings gratuity ledger.
              </p>
            </div>

            {/* Aggregate KPI Badges */}
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-right">
                <div className="text-[10px] uppercase font-bold text-emerald-800">Total Gratuity In Trust</div>
                <div className="text-base font-mono font-bold text-emerald-700">${totalGratuityDisbursed.toFixed(2)}</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-lg text-right">
                <div className="text-[10px] uppercase font-bold text-purple-800">Stage 4 Trust Inmates</div>
                <div className="text-base font-mono font-bold text-purple-900">{stage4Count} / {inmates.length}</div>
              </div>
            </div>
          </div>

          {/* 4-Stage Progressive System Architecture */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#714B67]" />
              National Progressive Stage Framework
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs text-slate-800">Stage 1: Induction</span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                    {inmates.filter(i => i.progressiveStage === 'stage_1').length} Inmates
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Entry period. Strict officer supervision, basic dietary provisions, assessment of security flight risk.
                </p>
                <div className="mt-2 text-[10px] font-semibold text-slate-600 bg-white p-1.5 rounded border border-slate-200">
                  Privilege: 1 visit / month, no gratuity wage
                </div>
              </div>

              <div className="border border-blue-200 rounded-lg p-3 bg-blue-50/40">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs text-blue-900">Stage 2: Standard</span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">
                    {inmates.filter(i => i.progressiveStage === 'stage_2').length} Inmates
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  General population association. Enrolled in literacy, counseling, or introductory maintenance work.
                </p>
                <div className="mt-2 text-[10px] font-semibold text-blue-800 bg-white p-1.5 rounded border border-blue-200">
                  Privilege: 2 visits / month, library & sports
                </div>
              </div>

              <div className="border border-amber-200 rounded-lg p-3 bg-amber-50/40">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs text-amber-900">Stage 3: Advanced</span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                    {inmates.filter(i => i.progressiveStage === 'stage_3').length} Inmates
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Qualified for industrial vocational production (joinery, garments, masonry). Daily labor allowance earned.
                </p>
                <div className="mt-2 text-[10px] font-semibold text-amber-800 bg-white p-1.5 rounded border border-amber-200">
                  Privilege: $2.50-$3.50/day wage, canteen access
                </div>
              </div>

              <div className="border border-emerald-200 rounded-lg p-3 bg-emerald-50/40">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs text-emerald-900">Stage 4: Trust / Open</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                    {inmates.filter(i => i.progressiveStage === 'stage_4').length} Inmates
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Pre-release trust status. Open camp transfers (e.g. Naivasha Farm), community project labor, exit preparation.
                </p>
                <div className="mt-2 text-[10px] font-semibold text-emerald-800 bg-white p-1.5 rounded border border-emerald-200">
                  Privilege: Open movement, max gratuity retention
                </div>
              </div>
            </div>
          </div>

          {/* Vocational Training Workshops Catalogue */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-[#714B67]" />
                  Accredited Industrial Training & Vocational Workshops
                </h3>
                <p className="text-xs text-slate-500">Certified by National Industrial Training Authority (NITA)</p>
              </div>
              <button
                onClick={() => setRehabTab('educational')}
                className="text-xs font-bold text-[#714B67] hover:underline flex items-center gap-1"
              >
                Open Course Enrollments & Certificates Hub
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {VOCATIONAL_PROGRAMS.map(prog => (
                <div key={prog.id} className="border border-slate-200 rounded-lg p-3.5 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-[#714B67] px-2 py-0.5 rounded">
                      {prog.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-700">
                      ${prog.dailyWage.toFixed(2)} / day
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 mt-2">{prog.name}</h4>
                  <div className="text-[11px] text-slate-500 mt-1">Duration: {prog.durationWeeks} Weeks</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Certifier: {prog.certifyingBody}</div>

                  <div className="mt-3 pt-2 border-t border-slate-200/70 text-[10px] text-slate-600 space-y-0.5">
                    <div className="font-semibold text-slate-700">Competencies:</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {prog.skillsLearned.map((s, idx) => (
                        <span key={idx} className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inmate Gratuity Accounts Ledger Table */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-emerald-600" />
                Inmate Gratuity Ledger & Work Performance Roll
              </h3>
              <span className="text-[10px] text-slate-500">
                Click an inmate to record a new labor wage credit or manage stage classification
              </span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Booking #</th>
                  <th className="py-2.5 px-3">Inmate Name</th>
                  <th className="py-2.5 px-3">Facility</th>
                  <th className="py-2.5 px-3">Progressive Stage</th>
                  <th className="py-2.5 px-3">Behavior Score</th>
                  <th className="py-2.5 px-3">Active Vocational Program</th>
                  <th className="py-2.5 px-3 text-right">Gratuity Balance</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inmates.map(inm => {
                  const activeProg = inm.programs[0];
                  return (
                    <tr
                      key={inm.id}
                      onClick={() => onSelectInmate(inm)}
                      className="hover:bg-purple-50/50 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{inm.bookingNumber}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{inm.firstName} {inm.lastName}</td>
                      <td className="py-2.5 px-3 text-slate-600">{inm.facilityName.split(' ')[0]}</td>
                      <td className="py-2.5 px-3 font-medium capitalize">
                        {inm.progressiveStage.replace('_', ' ')}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-700">{inm.behaviorRating}%</span>
                          <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-600 h-full rounded-full"
                              style={{ width: `${inm.behaviorRating}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        {activeProg ? (
                          <span className="text-slate-800 font-medium truncate max-w-[200px] block">
                            {activeProg.programName}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Not enrolled</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                        ${inm.gratuityBalance.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectInmate(inm);
                          }}
                          className="text-xs font-semibold text-[#714B67] hover:underline"
                        >
                          View Ledger
                        </button>
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

