import React, { useState } from 'react';
import { Language, VisitorRecord, VisitSession } from '../../types';
import { TRANSLATIONS } from '../../data/translations';
import { 
  UserCheck, ShieldAlert, CheckCircle2, XCircle, 
  Clock, MapPin, Eye, AlertTriangle, UserPlus, Search, Phone
} from 'lucide-react';
import { INITIAL_VISITORS, INITIAL_VISIT_SESSIONS } from '../../data/newModuleData';

interface PrisonVisitorHubProps {
  language: Language;
}

export const PrisonVisitorHub: React.FC<PrisonVisitorHubProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'sessions' | 'registry'>('sessions');
  const [sessions, setSessions] = useState<VisitSession[]>(INITIAL_VISIT_SESSIONS);
  const [visitors] = useState<VisitorRecord[]>(INITIAL_VISITORS);

  const handleAdmitVisitor = (id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, status: 'admitted' } : s));
  };

  const handleStartSession = (id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, status: 'in_progress' } : s));
  };

  const handleCompleteSession = (id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, status: 'completed' } : s));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 rounded">
              Odoo 19 Visitation Security
            </span>
            <span className="text-xs text-slate-500 font-mono">model: prison.visit.session</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            {language === 'fr' ? 'Gestion des Visites & Parloirs des Détenus' : 'Inmate Visitors & Parloir Session Management'}
          </h2>
          <p className="text-xs text-slate-500">
            {language === 'fr'
              ? 'Habilitation des visiteurs, contrôle des stupéfiants (K9), parloirs hygiaphone (CAT A) et salons d\'avocat confidentiels.'
              : 'Visitor security vetting, K9 contraband detection, non-contact security glass booths, and privileged counsel rooms.'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'sessions' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'fr' ? 'Séances de Parloir' : 'Parloir Sessions'}
          </button>
          <button
            onClick={() => setActiveTab('registry')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'registry' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'fr' ? 'Registre des Visiteurs' : 'Visitor Registry'}
          </button>
        </div>
      </div>

      {activeTab === 'sessions' ? (
        /* Sessions List */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sessions.map(session => (
              <div key={session.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-500">{session.bookingRef}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      session.status === 'in_progress'
                        ? 'bg-amber-100 text-amber-800'
                        : session.status === 'admitted'
                          ? 'bg-blue-100 text-blue-800'
                          : session.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                    }`}>
                      {session.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="mt-2">
                    <span className="text-xs text-slate-500">{language === 'fr' ? 'Détenu :' : 'Inmate:'}</span>
                    <h4 className="font-bold text-slate-900 text-sm">{session.inmateName}</h4>
                  </div>

                  <div className="mt-1">
                    <span className="text-xs text-slate-500">{language === 'fr' ? 'Visiteur :' : 'Visitor:'}</span>
                    <p className="font-semibold text-indigo-900 text-sm">{session.visitorName}</p>
                    <span className="text-xs text-slate-500">({session.relationship})</span>
                  </div>

                  <div className="mt-3 p-2 rounded bg-slate-50 text-xs space-y-1 border border-slate-100">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>{language === 'fr' ? 'Horaire :' : 'Time Slot:'}</span>
                      <span className="font-medium text-slate-800">{session.scheduledTime}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>{language === 'fr' ? 'Parloir :' : 'Booth:'}</span>
                      <span className="font-medium text-slate-800">{session.visitingBooth}</span>
                    </div>
                  </div>

                  {/* 4-Step Security Verification Badges */}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">
                      {language === 'fr' ? 'Contrôle Sécurité & Fouille :' : 'Mandatory Screening:'}
                    </span>
                    <div className="grid grid-cols-2 gap-1 text-[11px]">
                      <span className={`flex items-center gap-1 ${session.chkIdVerified ? 'text-emerald-700' : 'text-slate-400'}`}>
                        <CheckCircle2 className="w-3 h-3" />
                        ID Scanned
                      </span>
                      <span className={`flex items-center gap-1 ${session.chkMetalDetectorCleared ? 'text-emerald-700' : 'text-slate-400'}`}>
                        <CheckCircle2 className="w-3 h-3" />
                        Metal Detector
                      </span>
                      <span className={`flex items-center gap-1 ${session.chkCanineNarcoticsCleared ? 'text-emerald-700' : 'text-slate-400'}`}>
                        <CheckCircle2 className="w-3 h-3" />
                        K9 Narcotics
                      </span>
                      <span className={`flex items-center gap-1 ${session.chkPersonalItemsVaulted ? 'text-emerald-700' : 'text-slate-400'}`}>
                        <CheckCircle2 className="w-3 h-3" />
                        Phone Vaulted
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                  {session.status === 'booked' && (
                    <button
                      onClick={() => handleAdmitVisitor(session.id)}
                      className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      {language === 'fr' ? 'Admettre au Poste Sécurité' : 'Admit at Security Gate'}
                    </button>
                  )}
                  {session.status === 'admitted' && (
                    <button
                      onClick={() => handleStartSession(session.id)}
                      className="w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      {language === 'fr' ? 'Démarrer Entretien Parloir' : 'Start Booth Session'}
                    </button>
                  )}
                  {session.status === 'in_progress' && (
                    <button
                      onClick={() => handleCompleteSession(session.id)}
                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      {language === 'fr' ? 'Clôturer la Visite' : 'Conclude Visit'}
                    </button>
                  )}
                  {session.status === 'completed' && (
                    <span className="text-xs text-emerald-600 font-medium py-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {language === 'fr' ? 'Visite Conclue avec Succès' : 'Visit Lawfully Completed'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Visitors Registry Tab */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              {language === 'fr' ? 'Registre National des Visiteurs Agréés & Antécédents' : 'Registered Visitor Profiles & Security Clearance'}
            </h3>
          </div>

          <div className="divide-y divide-slate-100">
            {visitors.map(v => (
              <div key={v.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{v.name}</span>
                    <span className="text-xs font-mono text-slate-500">{v.nationalId}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      v.vettingStatus === 'cleared'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {v.vettingStatus === 'cleared' ? 'CLEARED' : 'BARRED / BLACKLISTED'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1">
                    {language === 'fr' ? 'Lien de parenté : ' : 'Relationship: '}
                    <strong className="capitalize">{v.relationship.replace('_', ' ')}</strong> • 
                    <span className="text-slate-500 ml-2">{v.phone}</span>
                  </p>

                  {v.barredReason && (
                    <div className="mt-2 p-2 rounded bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{v.barredReason}</span>
                    </div>
                  )}
                </div>

                <div className="text-right text-xs">
                  <span className="text-slate-500">{language === 'fr' ? 'Visites effectuées' : 'Visits Completed'}</span>
                  <p className="text-lg font-bold text-slate-900">{v.totalVisits}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
