import React, { useState } from 'react';
import { Inmate, Language, CourtHearing } from '../../types';
import { TRANSLATIONS } from '../../data/translations';
import { 
  Calendar as CalendarIcon, Clock, Scale, Truck, Video, 
  MapPin, User, CheckCircle, Plus, ChevronLeft, ChevronRight, Filter
} from 'lucide-react';
import { INITIAL_FLEET_CONVOYS } from '../../data/newModuleData';

interface CourtCalendarHubProps {
  inmates: Inmate[];
  language: Language;
}

export const CourtCalendarHub: React.FC<CourtCalendarHubProps> = ({ inmates, language }) => {
  const t = TRANSLATIONS[language];
  const [selectedView, setSelectedView] = useState<'week' | 'month' | 'day'>('week');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterMode, setFilterMode] = useState<string>('ALL');

  // Collect all court hearings from inmates
  const allHearings = inmates.flatMap(i => 
    i.courtCases.map(c => ({
      ...c,
      inmateName: `${i.firstName} ${i.lastName}`,
      bookingNumber: i.bookingNumber,
      facilityName: i.facilityName,
      securityCategory: i.securityCategory,
      photoUrl: i.photoUrl,
    }))
  );

  const filteredHearings = allHearings.filter(h => {
    if (filterType !== 'ALL' && h.hearingType !== filterType) return false;
    if (filterMode !== 'ALL' && h.courtMode !== filterMode) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header with Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 rounded">
              Odoo 19 Calendar View
            </span>
            <span className="text-xs text-slate-500 font-mono">model: prison.court.hearing</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            {language === 'fr' ? 'Calendrier des Audiences & Extractions Judiciaires' : 'Court Attendance & Judicial Scheduling Calendar'}
          </h2>
          <p className="text-xs text-slate-500">
            {language === 'fr'
              ? 'Planification des comparutions au tribunal, convois d\'escorte armée et visioconférences sécurisées.'
              : 'Docket scheduling, armed transport convoy allocation, and virtual video link hearings.'}
          </p>
        </div>

        {/* View mode buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setSelectedView('day')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                selectedView === 'day' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'fr' ? 'Jour' : 'Day'}
            </button>
            <button
              onClick={() => setSelectedView('week')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                selectedView === 'week' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'fr' ? 'Semaine' : 'Week'}
            </button>
            <button
              onClick={() => setSelectedView('month')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                selectedView === 'month' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'fr' ? 'Mois' : 'Month'}
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs"
            >
              <option value="ALL">{language === 'fr' ? 'Tous types d\'audience' : 'All Hearing Types'}</option>
              <option value="bail_hearing">{language === 'fr' ? 'Demande de liberté sous caution' : 'Bail Application'}</option>
              <option value="trial_hearing">{language === 'fr' ? 'Procès / Témoins' : 'Trial Hearing'}</option>
              <option value="judgment">{language === 'fr' ? 'Délibéré / Jugement' : 'Judgment'}</option>
              <option value="sentencing">{language === 'fr' ? 'Prononcé de la peine' : 'Sentencing'}</option>
            </select>

            <select
              value={filterMode}
              onChange={e => setFilterMode(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs"
            >
              <option value="ALL">{language === 'fr' ? 'Tous modes' : 'All Appearance Modes'}</option>
              <option value="physical_court">{language === 'fr' ? 'Escorte Physique (Convoi)' : 'Physical Convoy Escort'}</option>
              <option value="virtual_video_link">{language === 'fr' ? 'Visioconférence' : 'Virtual Video Link'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Interactive Calendar Docket Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-3">
        {['Monday 15 Sep', 'Tuesday 16 Sep', 'Wednesday 17 Sep', 'Thursday 18 Sep (Today)', 'Friday 19 Sep', 'Saturday 20 Sep', 'Sunday 21 Sep'].map((dayStr, idx) => {
          const isToday = idx === 3;
          return (
            <div 
              key={dayStr}
              className={`rounded-xl border flex flex-col min-h-[420px] ${
                isToday ? 'bg-indigo-50/40 border-indigo-300 ring-1 ring-indigo-300' : 'bg-white border-slate-200'
              }`}
            >
              {/* Day Header */}
              <div className={`p-2.5 border-b text-xs font-semibold flex items-center justify-between ${
                isToday ? 'bg-indigo-100/60 text-indigo-950 border-indigo-200' : 'bg-slate-50 text-slate-700 border-slate-100'
              }`}>
                <span>{dayStr}</span>
                {isToday && (
                  <span className="px-1.5 py-0.2 text-[10px] uppercase font-bold bg-indigo-600 text-white rounded">
                    TODAY
                  </span>
                )}
              </div>

              {/* Hearing Cards for Day */}
              <div className="p-2 space-y-2.5 flex-1 overflow-y-auto">
                {idx === 3 ? (
                  // Hearings on Thursday 18 Sep
                  filteredHearings.map(hearing => (
                    <div 
                      key={hearing.id}
                      className="p-3 rounded-lg border bg-white shadow-xs hover:border-indigo-400 transition-all text-xs space-y-1.5 border-slate-200"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-900">{hearing.hearingTime}</span>
                        <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${
                          hearing.courtMode === 'physical_court'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {hearing.courtMode === 'physical_court' ? 'CONVOY' : 'VIRTUAL'}
                        </span>
                      </div>

                      <div className="font-semibold text-slate-900">
                        {hearing.inmateName}
                      </div>

                      <div className="text-slate-500 font-mono text-[11px]">
                        {hearing.caseNumber}
                      </div>

                      <div className="text-[11px] text-slate-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{hearing.courtName}</span>
                      </div>

                      <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 capitalize">{hearing.hearingType.replace('_', ' ')}</span>
                        <span className={`font-semibold px-1.5 py-0.5 rounded text-[10px] ${
                          hearing.status === 'scheduled' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {hearing.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : idx === 4 ? (
                  // Friday hearings
                  <div className="p-3 rounded-lg border border-slate-200 bg-white shadow-xs text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-900">09:30 AM</span>
                      <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-amber-100 text-amber-800">
                        CONVOY
                      </span>
                    </div>
                    <div className="font-semibold text-slate-900">Marcus Brody</div>
                    <div className="text-slate-500 font-mono text-[11px]">CR-APPEAL-2023-991</div>
                    <div className="text-[11px] text-slate-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>Court of Appeal Div 2</span>
                    </div>
                    <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Appellate Review</span>
                      <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-semibold">Scheduled</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs italic py-8">
                    {language === 'fr' ? 'Aucune audience planifiée' : 'No hearings docketed'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
