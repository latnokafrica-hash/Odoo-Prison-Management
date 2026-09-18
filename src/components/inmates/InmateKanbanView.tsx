import React from 'react';
import { Inmate } from '../../types';
import { 
  ShieldAlert, 
  Clock, 
  MapPin, 
  Calendar, 
  Coins, 
  Gavel, 
  CheckCircle2, 
  AlertTriangle,
  Building
} from 'lucide-react';

interface InmateKanbanViewProps {
  inmates: Inmate[];
  onSelectInmate: (inmate: Inmate) => void;
}

export const InmateKanbanView: React.FC<InmateKanbanViewProps> = ({
  inmates,
  onSelectInmate
}) => {
  const columns = [
    {
      id: 'stage_1',
      title: 'Stage 1: Induction & Strict Custody',
      desc: 'Initial entry, forensic verification & maximum supervision',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-300'
    },
    {
      id: 'stage_2',
      title: 'Stage 2: Standard Custody',
      desc: 'General association, normal work detail & counseling',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-300'
    },
    {
      id: 'stage_3',
      title: 'Stage 3: Advanced Vocational',
      desc: 'Specialized trades, wage earnings & merit privileges',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300'
    },
    {
      id: 'stage_4',
      title: 'Stage 4: Pre-Release & Trust',
      desc: 'Open camp trust, community re-integration & gratuity payout',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300'
    }
  ];

  const getSecurityBadge = (cat: Inmate['securityCategory']) => {
    switch (cat) {
      case 'CAT_A':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">CAT A Max</span>;
      case 'CAT_B':
        return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-200">CAT B</span>;
      case 'CAT_C':
        return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">CAT C</span>;
      case 'CAT_D':
        return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">CAT D Open</span>;
    }
  };

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto min-h-[calc(100vh-160px)]">
      {columns.map(col => {
        const colInmates = inmates.filter(i => i.progressiveStage === col.id);

        return (
          <div key={col.id} className="bg-slate-100/70 rounded-lg p-2.5 flex flex-col border border-slate-200">
            {/* Column Header */}
            <div className="mb-2.5 px-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 tracking-tight">
                  {col.title.split(':')[0]}
                </span>
                <span className="text-[11px] font-mono font-bold bg-white text-slate-700 px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                  {colInmates.length}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                {col.desc}
              </p>
            </div>

            {/* Cards Container */}
            <div className="flex-1 space-y-2.5 overflow-y-auto">
              {colInmates.map(inmate => {
                const isEscaped = inmate.custodyStatus === 'escaped';
                const isTransit = inmate.custodyStatus === 'in_transit';

                return (
                  <div
                    key={inmate.id}
                    onClick={() => onSelectInmate(inmate)}
                    className={`bg-white rounded-md border p-3 shadow-xs hover:shadow-md transition-all cursor-pointer select-none group relative ${
                      isEscaped
                        ? 'border-rose-400 bg-rose-50/40 ring-1 ring-rose-500'
                        : 'border-slate-200/90 hover:border-[#714B67]'
                    }`}
                  >
                    {/* Top Row: Mugshot, Name & ID */}
                    <div className="flex items-start space-x-2.5">
                      <img
                        src={inmate.photoUrl}
                        alt={inmate.firstName}
                        className="w-10 h-10 rounded-md object-cover border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-500 font-semibold">
                            {inmate.bookingNumber}
                          </span>
                          {getSecurityBadge(inmate.securityCategory)}
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5 group-hover:text-[#714B67]">
                          {inmate.firstName} {inmate.lastName}
                        </h4>
                        {inmate.alias && (
                          <div className="text-[10px] text-slate-500 italic truncate">
                            "{inmate.alias}"
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Alert Banner if Escaped or In Transit */}
                    {isEscaped && (
                      <div className="mt-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
                        <ShieldAlert className="w-3 h-3" />
                        <span>ACTIVE ESCAPE RED NOTICE</span>
                      </div>
                    )}

                    {isTransit && (
                      <div className="mt-2 bg-amber-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>CONVOY IN TRANSIT</span>
                      </div>
                    )}

                    {/* Facility and Cell location */}
                    <div className="mt-2 text-[11px] text-slate-600 space-y-1 pt-1.5 border-t border-slate-100">
                      <div className="flex items-center gap-1 text-slate-500 truncate">
                        <Building className="w-3 h-3 shrink-0" />
                        <span className="truncate">{inmate.facilityName.split(' ')[0]}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600 text-[10px]">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate font-medium">{inmate.cellLocation}</span>
                      </div>
                    </div>

                    {/* Footer: Sentence EDR & Gratuity */}
                    <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      {inmate.sentences.length > 0 ? (
                        <div className="text-slate-600">
                          <span className="text-slate-400">EDR: </span>
                          <span className="font-mono font-medium text-slate-800">
                            {inmate.sentences[0].earliestReleaseDate}
                          </span>
                        </div>
                      ) : (
                        <div className="text-blue-600 font-medium">
                          Remand Hearing
                        </div>
                      )}

                      <div className="font-mono font-semibold text-emerald-700 flex items-center gap-0.5">
                        <Coins className="w-3 h-3" />
                        ${inmate.gratuityBalance.toFixed(2)}
                      </div>
                    </div>

                    {/* Behavior score meter */}
                    <div className="mt-2">
                      <div className="flex justify-between text-[9px] text-slate-400 mb-0.5">
                        <span>Conduct Rating</span>
                        <span className="font-bold text-slate-700">{inmate.behaviorRating}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            inmate.behaviorRating > 80
                              ? 'bg-emerald-500'
                              : inmate.behaviorRating > 50
                              ? 'bg-blue-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${inmate.behaviorRating}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {colInmates.length === 0 && (
                <div className="border border-dashed border-slate-200 rounded p-4 text-center text-slate-400 text-xs">
                  No inmates in this stage
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
