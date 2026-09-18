import React from 'react';
import { Inmate, PrisonFacility, Language, UserRole } from '../../types';
import { TRANSLATIONS } from '../../data/translations';
import { USER_ROLES } from '../../data/rolesData';
import { 
  Building2, Users, AlertTriangle, ShieldCheck, 
  Calendar, Utensils, UserCheck, Truck, Scale, 
  Clock, ArrowUpRight, CheckCircle2, ChevronRight, Activity,
  Lock, Shield, Key
} from 'lucide-react';
import { INITIAL_CELL_BLOCKS, INITIAL_MEAL_DISTRIBUTIONS, INITIAL_VISIT_SESSIONS, INITIAL_FLEET_CONVOYS } from '../../data/newModuleData';

interface PrisonDashboardHubProps {
  inmates: Inmate[];
  facilities: PrisonFacility[];
  language: Language;
  onNavigate: (section: any) => void;
  currentUserRole?: UserRole;
  onSelectRole?: (role: UserRole) => void;
}

export const PrisonDashboardHub: React.FC<PrisonDashboardHubProps> = ({
  inmates,
  facilities,
  language,
  onNavigate,
  currentUserRole = 'superintendent',
  onSelectRole,
}) => {
  const t = TRANSLATIONS[language];
  const roleProfile = USER_ROLES[currentUserRole] || USER_ROLES.superintendent;

  // Aggregated operational metrics
  const totalInmates = inmates.length;
  const remandCount = inmates.filter(i => i.custodyStatus === 'remand').length;
  const convictedCount = inmates.filter(i => i.custodyStatus === 'convicted').length;
  const catACount = inmates.filter(i => i.securityCategory === 'CAT_A').length;
  
  const totalCapacity = facilities.reduce((sum, f) => sum + f.capacity, 0);
  const overallOccupancyRate = totalCapacity > 0 ? Math.round((totalInmates / totalCapacity) * 100) : 0;
  const overcrowdedFacilities = facilities.filter(f => f.currentInmates > f.capacity);

  const activeConvoys = INITIAL_FLEET_CONVOYS.filter(c => c.status !== 'completed');
  const totalMealsDispatched = INITIAL_MEAL_DISTRIBUTIONS.reduce((sum, d) => sum + d.totalRations, 0);
  const activeVisits = INITIAL_VISIT_SESSIONS.filter(s => s.status === 'in_progress' || s.status === 'admitted');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-xl p-6 shadow-md border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
                Odoo 19 Enterprise Live Feed
              </span>
              <span className="text-xs text-slate-400">National Directorate Operations</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {language === 'fr' ? 'Tableau de Bord National des Opérations Pénitentiaires' : 'National Corrections Operations Executive Dashboard'}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              {language === 'fr'
                ? 'Supervision en temps réel des centres pénitentiaires, transferts cellulaires, audiences foraines, intendance alimentaire et conformité aux règles Nelson Mandela.'
                : 'Real-time command overview across all correctional facilities, court convoy tracking, daily meal distributions, parloir visiting security, and statutory human rights compliance.'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onNavigate('odoo_code')}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Activity className="w-4 h-4" />
              {language === 'fr' ? 'Architecture Odoo 19' : 'Odoo 19 Architecture'}
            </button>
          </div>
        </div>
      </div>

      {/* Odoo 19 RBAC Session & Access Control Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className={`w-10 h-10 rounded-full ${roleProfile.avatarColor} font-bold text-sm flex items-center justify-center shadow-xs shrink-0 ring-2 ring-purple-100`}>
            {roleProfile.avatarText}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-slate-900">{roleProfile.name}</span>
              <span className="text-xs text-slate-500 font-medium">({language === 'fr' ? roleProfile.titleFr : roleProfile.title})</span>
              <span className="text-[10px] font-mono bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold">
                {roleProfile.odooGroupXmlId}
              </span>
            </div>
            <div className="text-xs text-slate-600 mt-0.5 flex items-center gap-1.5 flex-wrap">
              {roleProfile.sensitiveRestrictedModules.length === 0 ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {language === 'fr' ? 'Accès Super-Administrateur (Tous les 14 modules actifs)' : 'Super-Admin Access (All 14 modules active)'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-medium text-[11px]">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  {language === 'fr'
                    ? 'Modules Sensibles Masqués: Levée d\'Écrou & Calculs de Peines (ir.rule)'
                    : 'Sensitive Modules Hidden: Inmate Discharge & Sentence Remission (ir.rule)'}
                </span>
              )}
              <span className="text-slate-400">•</span>
              <span className="text-[11px] text-slate-500">
                {language === 'fr' ? 'Droits CRUD conformes à ir.model.access.csv' : 'CRUD rights enforced via ir.model.access.csv'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Role Switcher Buttons */}
        {onSelectRole && (
          <div className="flex items-center gap-1.5 flex-wrap bg-slate-50 p-1.5 rounded-lg border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2">
              {language === 'fr' ? 'Rôle:' : 'Role:'}
            </span>
            {(['superintendent', 'guard', 'medical_officer', 'records_clerk'] as UserRole[]).map(roleId => {
              const r = USER_ROLES[roleId];
              const isSelected = currentUserRole === roleId;
              return (
                <button
                  key={roleId}
                  onClick={() => onSelectRole(roleId)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                    isSelected 
                      ? 'bg-[#714B67] text-white shadow-2xs' 
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                  title={`${r.name} - ${language === 'fr' ? r.titleFr : r.title}`}
                >
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-300' : 'bg-slate-400'}`} />
                  <span>
                    {roleId === 'superintendent' ? (language === 'fr' ? 'Directeur' : 'Superintendent') :
                     roleId === 'guard' ? (language === 'fr' ? 'Gardien' : 'Guard') :
                     roleId === 'medical_officer' ? (language === 'fr' ? 'Médecin' : 'Medical') :
                     (language === 'fr' ? 'Greffier' : 'Clerk')}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inmates */}
        <div 
          onClick={() => onNavigate('inmates')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t.totalInmates}
            </span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{totalInmates}</span>
            <span className="text-xs text-slate-500">
              ({remandCount} {language === 'fr' ? 'prévenus' : 'remand'} / {convictedCount} {language === 'fr' ? 'condamnés' : 'convicted'})
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-medium">
            <span>{language === 'fr' ? 'Voir le registre d\'écrou' : 'View Inmate Registry'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Capacity & Overcrowding */}
        <div 
          onClick={() => onNavigate('facilities')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t.occupancyRate}
            </span>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform ${
              overallOccupancyRate > 90 ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
            }`}>
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{overallOccupancyRate}%</span>
            <span className="text-xs text-slate-500">
              ({totalInmates} / {totalCapacity} {t.bedCapacity.toLowerCase()})
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            {overcrowdedFacilities.length > 0 ? (
              <span className="text-rose-600 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {overcrowdedFacilities.length} {language === 'fr' ? 'prisons suroccupées' : 'overcrowded'}
              </span>
            ) : (
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {language === 'fr' ? 'Capacité nominale respectée' : 'Within certified bounds'}
              </span>
            )}
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* Court Convoys */}
        <div 
          onClick={() => onNavigate('fleet')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t.activeConvoys}
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{activeConvoys.length}</span>
            <span className="text-xs text-slate-500">
              {language === 'fr' ? 'missions d\'escorte en cours' : 'active armed escort missions'}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-medium">
            <span>{language === 'fr' ? 'Suivre les convois judiciaires' : 'Track Active Convoys'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Catering & Meals */}
        <div 
          onClick={() => onNavigate('meals')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t.mealsServed}
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Utensils className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">{totalMealsDispatched}</span>
            <span className="text-xs text-slate-500">
              {language === 'fr' ? 'portions distribuées (Déjeuner)' : 'portions dispatched (Lunch)'}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-600 font-medium">
            <span>{language === 'fr' ? 'Détails des rations & régimes' : 'Dietary Breakdown'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Two Column Command Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Operational Highlights */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Convoys and Court Scheduling Widget */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-slate-900 text-sm">
                  {language === 'fr' ? 'Convois d\'Escorte & Extractions Judiciaires en Cours' : 'Live Armed Court Convoy Missions & Transits'}
                </h3>
              </div>
              <button 
                onClick={() => onNavigate('court_calendar')}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
              >
                {language === 'fr' ? 'Ouvrir Calendrier des Audiences' : 'Open Court Calendar'}
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {INITIAL_FLEET_CONVOYS.map(convoy => (
                <div key={convoy.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm">{convoy.missionCode}</span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          convoy.securityRating === 'CAT_A_HIGH_THREAT'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {convoy.securityRating}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          convoy.status === 'at_court'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {convoy.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        <strong>{convoy.facilityName}</strong> ➔ <strong>{convoy.destinationCourt}</strong>
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {language === 'fr' ? 'Détenus transférés : ' : 'Inmates Transported: '}
                        <span className="text-slate-700">{convoy.inmateNames.join(', ')}</span>
                      </p>
                    </div>

                    <div className="text-right text-xs">
                      <span className="text-slate-500">{language === 'fr' ? 'Commandant d\'Escorte :' : 'Commander:'}</span>
                      <p className="font-medium text-slate-800">{convoy.escortCommander}</p>
                      <span className="text-slate-400">{convoy.armedOfficersCount} {language === 'fr' ? 'officiers armés' : 'armed officers'}</span>
                    </div>
                  </div>

                  <div className="mt-2.5 p-2 bg-slate-50 rounded border border-slate-200 text-xs font-mono text-slate-600 flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded font-semibold text-[10px]">RADIO</span>
                    <span>{convoy.radioLog}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cell Blocks Overview */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-slate-900 text-sm">
                  {language === 'fr' ? 'Occupation des Bâtiments & Quartiers Cellulaires' : 'Cell Blocks & Detention Wing Occupancy'}
                </h3>
              </div>
              <button 
                onClick={() => onNavigate('rooms')}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
              >
                {language === 'fr' ? 'Gérer les Cellules' : 'Manage Cells'}
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {INITIAL_CELL_BLOCKS.map(block => (
                <div key={block.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-900">{block.name}</span>
                    <span className="text-xs font-mono text-slate-500">{block.code}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{block.facilityName}</p>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-600 mb-1">
                    <span>{block.currentOccupancy} / {block.capacity} {language === 'fr' ? 'lits occupés' : 'beds'}</span>
                    <span className={`font-semibold ${block.occupancyRate > 90 ? 'text-rose-600' : 'text-slate-700'}`}>
                      {block.occupancyRate}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full ${
                        block.occupancyRate > 90 
                          ? 'bg-rose-500' 
                          : block.occupancyRate > 80 
                            ? 'bg-amber-500' 
                            : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, block.occupancyRate)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Actions & Compliance */}
        <div className="space-y-6">
          {/* Quick Operations Actions */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 className="font-semibold text-slate-900 text-sm mb-3">
              {language === 'fr' ? 'Actions Rapides d\'Exploitation' : 'Operational Quick Actions'}
            </h3>
            <div className="space-y-2">
              <button 
                onClick={() => onNavigate('court_calendar')}
                className="w-full p-2.5 text-left rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 transition-all flex items-center gap-3 text-xs font-medium text-slate-800"
              >
                <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>{language === 'fr' ? 'Consulter le Calendrier des Audiences' : 'View Court Attendance Calendar'}</span>
              </button>

              <button 
                onClick={() => onNavigate('meals')}
                className="w-full p-2.5 text-left rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition-all flex items-center gap-3 text-xs font-medium text-slate-800"
              >
                <Utensils className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{language === 'fr' ? 'Valider les Distributions de Repas (Déjeuner)' : 'Dispatch Lunch Rations to Cell Blocks'}</span>
              </button>

              <button 
                onClick={() => onNavigate('visitors')}
                className="w-full p-2.5 text-left rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-all flex items-center gap-3 text-xs font-medium text-slate-800"
              >
                <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{language === 'fr' ? 'Contrôle Sécuritaire des Parloirs & Visites' : 'Visitor Security Screening & Parloir'}</span>
              </button>

              <button 
                onClick={() => onNavigate('rooms')}
                className="w-full p-2.5 text-left rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 transition-all flex items-center gap-3 text-xs font-medium text-slate-800"
              >
                <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{language === 'fr' ? 'Maintenance des Serrures & Cellules' : 'Cell Hardware & Lock Maintenance'}</span>
              </button>
            </div>
          </div>

          {/* Mandela Rules Human Rights Audits Monitor */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                {language === 'fr' ? 'Règles Nelson Mandela (ONU)' : 'UN Nelson Mandela Rules'}
              </h3>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {language === 'fr' ? 'Conforme' : 'Compliant'}
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              {language === 'fr'
                ? 'Respect strict de la règle 43 (interdiction de l\'isolement cellulaire au-delà de 15 jours consécutifs) et règle 23 (1 heure minimum d\'exercice extérieur par jour).'
                : 'Auditing mandatory 15-day strict limit on solitary confinement (Rule 43) and mandatory 1-hour daily outdoor exercise (Rule 23).'}
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                <span className="text-slate-600">{language === 'fr' ? 'Exercice extérieur quotidien' : 'Daily Outdoor Exercise'}</span>
                <span className="font-semibold text-emerald-600">≥ 1.5 h / {language === 'fr' ? 'jour' : 'day'}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                <span className="text-slate-600">{language === 'fr' ? 'Plafond isolement cellulaire' : 'Max Solitary Confinement'}</span>
                <span className="font-semibold text-slate-900">0 / 15 {language === 'fr' ? 'jours max' : 'days max'}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                <span className="text-slate-600">{language === 'fr' ? 'Température repas servis' : 'Served Food Temp'}</span>
                <span className="font-semibold text-slate-900">69.4 °C (≥ 65°C)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
