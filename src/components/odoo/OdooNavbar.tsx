import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  ArrowLeftRight, 
  Scale, 
  GraduationCap, 
  Gavel, 
  LogOut, 
  ShieldAlert, 
  Code2, 
  ChevronDown, 
  Bell, 
  Search,
  CheckCircle2,
  AlertTriangle,
  Building,
  Menu,
  Shield,
  Activity,
  Calendar,
  Utensils,
  UserCheck,
  Truck,
  Languages,
  Lock,
  Key,
  Check
} from 'lucide-react';
import { PrisonFacility, Inmate, Language, UserRole } from '../../types';
import { TRANSLATIONS } from '../../data/translations';
import { USER_ROLES } from '../../data/rolesData';
import { AccessControlMatrixModal } from './AccessControlMatrixModal';

interface OdooNavbarProps {
  currentModule: string;
  onSelectModule: (moduleId: string) => void;
  facilities: PrisonFacility[];
  selectedFacilityId: string;
  onSelectFacility: (facilityId: string) => void;
  inmates: Inmate[];
  onOpenNewModal: () => void;
  language: Language;
  onToggleLanguage: (lang: Language) => void;
  currentUserRole: UserRole;
  onSelectRole: (role: UserRole) => void;
}

export const OdooNavbar: React.FC<OdooNavbarProps> = ({
  currentModule,
  onSelectModule,
  facilities,
  selectedFacilityId,
  onSelectFacility,
  inmates,
  onOpenNewModal,
  language,
  onToggleLanguage,
  currentUserRole,
  onSelectRole,
}) => {
  const [isAppSwitcherOpen, setIsAppSwitcherOpen] = useState(false);
  const [isFacilityDropdownOpen, setIsFacilityDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isMatrixModalOpen, setIsMatrixModalOpen] = useState(false);

  const t = TRANSLATIONS[language];
  const roleProfile = USER_ROLES[currentUserRole];
  const allowedModuleIds = new Set(roleProfile.allowedModules);

  // Escaped inmates alert count
  const escapedCount = inmates.filter(i => i.custodyStatus === 'escaped').length;
  // Court hearings today (2026-09-18)
  const hearingsTodayCount = inmates.flatMap(i => i.courtCases).filter(c => c.hearingDate === '2026-09-18').length;
  // Discharges pending
  const pendingDischargeCount = inmates.filter(i => i.dischargeRecord && i.dischargeRecord.status !== 'archived').length;

  const currentFacility = facilities.find(f => f.id === selectedFacilityId);

  const modules = [
    { 
      id: 'dashboard', 
      name: language === 'fr' ? 'Tableau de Bord' : 'Operations Dashboard', 
      icon: Activity, 
      desc: language === 'fr' ? 'Indicateurs clés & alertes temps réel' : 'Real-time KPIs & national overview' 
    },
    { 
      id: 'inmates', 
      name: language === 'fr' ? 'Registre d\'Écrou' : 'Inmate Records', 
      icon: Users, 
      desc: language === 'fr' ? 'Dossiers écrou & biométrie' : 'Master custody profiles & booking' 
    },
    { 
      id: 'court_calendar', 
      name: language === 'fr' ? 'Calendrier Audiences' : 'Court Calendar', 
      icon: Calendar, 
      desc: language === 'fr' ? 'Planification foraine & comparutions' : 'Judicial dockets & appearances' 
    },
    { 
      id: 'meals', 
      name: language === 'fr' ? 'Restauration & Repas' : 'Meals & Catering', 
      icon: Utensils, 
      desc: language === 'fr' ? 'Régimes alimentaires & Mandela 22' : 'Lunch distributions & diets' 
    },
    { 
      id: 'visitors', 
      name: language === 'fr' ? 'Visites & Parloirs' : 'Visitors & Parloir', 
      icon: UserCheck, 
      desc: language === 'fr' ? 'Contrôle stupéfiants & parloirs' : 'Vetting, K9 screening & booths' 
    },
    { 
      id: 'rooms', 
      name: language === 'fr' ? 'Cellules & Chambres' : 'Cells & Rooms', 
      icon: Building2, 
      desc: language === 'fr' ? 'Capacités en lits & maintenance' : 'Bed capacity & lock work orders' 
    },
    { 
      id: 'fleet', 
      name: language === 'fr' ? 'Flotte & Convois' : 'Court Escort Fleet', 
      icon: Truck, 
      desc: language === 'fr' ? 'Fourgons blindés B6 & extractions' : 'Armored cellular transport & convoys' 
    },
    { 
      id: 'facilities', 
      name: language === 'fr' ? 'Établissements' : 'Prison Facilities', 
      icon: Building, 
      desc: language === 'fr' ? 'Centres pénitentiaires nationaux' : 'Country-wide prison overview & map' 
    },
    { 
      id: 'admissions', 
      name: language === 'fr' ? 'Admissions & Évasions' : 'Admissions & Transfers', 
      icon: ArrowLeftRight, 
      desc: language === 'fr' ? 'Entrées, transferts & réadmissions' : 'Intake, transfers, bail & escapes' 
    },
    { 
      id: 'sentence', 
      name: language === 'fr' ? 'Exécution des Peines' : 'Sentence & Remission', 
      icon: Scale, 
      desc: language === 'fr' ? 'Calculs de réduction 1/3 légale' : 'Calculations, 1/3 deductions & legal' 
    },
    { 
      id: 'rehabilitation', 
      name: language === 'fr' ? 'Réinsertion & Pécule' : 'Classification & Rehab', 
      icon: GraduationCap, 
      desc: language === 'fr' ? 'Stages progressifs & compte pécule' : 'Progressive stages & inmate earnings' 
    },
    { 
      id: 'discharge', 
      name: language === 'fr' ? 'Levée d\'Écrou' : 'Discharge & Exit', 
      icon: LogOut, 
      desc: language === 'fr' ? 'Formalités de sortie & restitution' : 'Clearance checklist & property return' 
    },
    { 
      id: 'human_rights', 
      name: language === 'fr' ? 'Règles Nelson Mandela' : 'UN Mandela Rules', 
      icon: Shield, 
      desc: language === 'fr' ? 'Audits droits humains & isolement' : 'Nelson Mandela Rules & ombudsman' 
    },
    { 
      id: 'odoo_code', 
      name: language === 'fr' ? 'Architecture Odoo 19' : 'Odoo 19 Blueprint', 
      icon: Code2, 
      desc: language === 'fr' ? 'Modèles Python, XML & i18n fr.po' : 'Python models, XML views & manifest' 
    },
  ];

  const visibleModules = modules.filter(m => allowedModuleIds.has(m.id as any));
  const restrictedModules = modules.filter(m => !allowedModuleIds.has(m.id as any));

  return (
    <header className="sticky top-0 z-40 bg-[#714B67] text-white shadow-md select-none border-b border-[#5e3c55]">
      <div className="flex items-center justify-between px-3 h-12">
        {/* Left: App Switcher & App Title */}
        <div className="flex items-center space-x-3">
          {/* Odoo 9-dots App Launcher */}
          <div className="relative">
            <button
              id="odoo-app-switcher-btn"
              onClick={() => setIsAppSwitcherOpen(!isAppSwitcherOpen)}
              className="p-1.5 rounded hover:bg-[#5f3c54] active:bg-[#4f3146] transition-colors flex items-center justify-center text-white/90 hover:text-white"
              title="Odoo 19 Application Menu"
            >
              <div className="grid grid-cols-3 gap-0.5 w-5 h-5 p-0.5">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="w-1 h-1 bg-white rounded-[0.5px]" />
                ))}
              </div>
            </button>

            {/* App Launcher Dropdown */}
            {isAppSwitcherOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]" 
                  onClick={() => setIsAppSwitcherOpen(false)}
                />
                <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-2xl border border-slate-200 z-50 py-2 text-slate-800 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Odoo 19 Corrections ERP
                    </span>
                    <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-mono font-semibold">
                      v19.0 Enterprise
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-0.5 p-1 max-h-[75vh] overflow-y-auto">
                    {visibleModules.map((m) => {
                      const Icon = m.icon;
                      const isSelected = currentModule === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => {
                            onSelectModule(m.id);
                            setIsAppSwitcherOpen(false);
                          }}
                          className={`flex items-start space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                            isSelected 
                              ? 'bg-[#714B67]/10 text-[#714B67] font-semibold' 
                              : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <div className={`p-2 rounded-md mt-0.5 ${isSelected ? 'bg-[#714B67] text-white' : 'bg-slate-100 text-slate-600'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-medium leading-snug">{m.name}</div>
                            <div className="text-xs text-slate-500 font-normal">{m.desc}</div>
                          </div>
                        </button>
                      );
                    })}

                    {/* Restricted Modules section (Odoo Access Control) */}
                    {restrictedModules.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200">
                        <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                          <span className="flex items-center gap-1 text-slate-500">
                            <Lock className="w-3 h-3 text-amber-600" />
                            {language === 'fr' ? 'Modules Masqués (Odoo ir.rule)' : 'Restricted Modules (Odoo ir.rule)'}
                          </span>
                          <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded font-mono">
                            {restrictedModules.length} {language === 'fr' ? 'verrouillés' : 'locked'}
                          </span>
                        </div>
                        <div className="p-1 space-y-0.5">
                          {restrictedModules.map(m => {
                            const Icon = m.icon;
                            return (
                              <button
                                key={m.id}
                                onClick={() => {
                                  onSelectModule(m.id);
                                  setIsAppSwitcherOpen(false);
                                }}
                                className="w-full flex items-start space-x-3 px-3 py-1.5 rounded-md text-left opacity-60 hover:opacity-100 hover:bg-rose-50/60 transition-all group"
                                title={language === 'fr' ? 'Accès restreint par les règles de sécurité Odoo' : 'Access restricted by Odoo security groups'}
                              >
                                <div className="p-2 rounded-md mt-0.5 bg-slate-100 text-slate-400 group-hover:text-rose-600">
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium text-slate-600 flex items-center justify-between">
                                    <span>{m.name}</span>
                                    <Lock className="w-3 h-3 text-slate-400 group-hover:text-rose-600" />
                                  </div>
                                  <div className="text-[10px] text-rose-600/90 font-mono truncate">
                                    {m.id === 'discharge' ? 'group_prison_superintendent' : m.id === 'sentence' ? 'group_prison_records' : 'restricted'}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Current App Brand / Module Name */}
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-sm tracking-tight text-white flex items-center gap-1.5">
              <span className="bg-[#00A09D] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">ODOO 19</span>
              Corrections & Prisons ERP
            </span>
          </div>

          {/* Active Module Title */}
          <div className="hidden md:flex items-center text-xs text-purple-200 border-l border-white/20 pl-3">
            <span className="text-white font-medium">
              {modules.find(m => m.id === currentModule)?.name}
            </span>
          </div>
        </div>

        {/* Center: Top Level Quick Menu Items (Filtered by Role Permissions) */}
        <nav className="hidden lg:flex items-center space-x-1 text-xs">
          {visibleModules.slice(0, 6).map(m => (
            <button
              key={m.id}
              onClick={() => onSelectModule(m.id)}
              className={`px-2.5 py-1 rounded transition-colors ${
                currentModule === m.id
                  ? 'bg-white/20 font-medium text-white shadow-inner'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              {m.name}
            </button>
          ))}
        </nav>

        {/* Right: Multi-Facility Switcher & Status Alerts */}
        <div className="flex items-center space-x-2">
          {/* Facility Selector (Multi-Company / Multi-Prison) */}
          <div className="relative">
            <button
              id="facility-switcher-btn"
              onClick={() => setIsFacilityDropdownOpen(!isFacilityDropdownOpen)}
              className="flex items-center space-x-1.5 bg-black/20 hover:bg-black/30 px-2.5 py-1 rounded text-xs text-purple-100 border border-white/10 transition-colors"
            >
              <Building className="w-3.5 h-3.5 text-amber-300" />
              <span className="max-w-[130px] truncate font-medium">
                {selectedFacilityId === 'ALL' ? 'All National Prisons' : currentFacility?.name.split(' ')[0]}
              </span>
              <ChevronDown className="w-3 h-3 text-white/70" />
            </button>

            {isFacilityDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsFacilityDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-slate-200 z-50 py-1.5 text-slate-800">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Switch Active Prison Facility
                  </div>
                  <button
                    onClick={() => {
                      onSelectFacility('ALL');
                      setIsFacilityDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                      selectedFacilityId === 'ALL' ? 'bg-purple-50 text-[#714B67] font-bold' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-purple-600" />
                      <div>
                        <div className="font-medium">All National Prisons (Countrywide)</div>
                        <div className="text-[10px] text-slate-500">5 Facilities • 4,597 Inmates Total</div>
                      </div>
                    </div>
                    {selectedFacilityId === 'ALL' && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />}
                  </button>

                  <div className="border-t border-slate-100 my-1" />

                  {facilities.map(fac => {
                    const isOver = fac.currentInmates > fac.capacity;
                    return (
                      <button
                        key={fac.id}
                        onClick={() => {
                          onSelectFacility(fac.id);
                          setIsFacilityDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                          selectedFacilityId === fac.id ? 'bg-purple-50 text-[#714B67] font-bold' : ''
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="font-medium truncate">{fac.name}</div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                            <span>{fac.code}</span>
                            <span>•</span>
                            <span className={isOver ? 'text-rose-600 font-semibold' : ''}>
                              {fac.currentInmates} / {fac.capacity} beds
                            </span>
                          </div>
                        </div>
                        {selectedFacilityId === fac.id && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Escape Alert Red Badge if any active */}
          {escapedCount > 0 && (
            <button
              onClick={() => onSelectModule('admissions')}
              className="flex items-center space-x-1 bg-rose-600 hover:bg-rose-700 text-white px-2 py-0.5 rounded text-xs font-bold animate-pulse shadow-sm"
              title={`${escapedCount} Inmate(s) at large - Escape Alert`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{escapedCount} ESCAPED</span>
            </button>
          )}

          {/* Quick Court Docket Badge */}
          {hearingsTodayCount > 0 && (
            <button
              onClick={() => onSelectModule('court')}
              className="hidden sm:flex items-center space-x-1 bg-amber-500/80 hover:bg-amber-600 text-white px-2 py-0.5 rounded text-xs font-medium"
              title={`${hearingsTodayCount} Court Appearance(s) Scheduled Today`}
            >
              <Gavel className="w-3.5 h-3.5" />
              <span>{hearingsTodayCount} In Court</span>
            </button>
          )}

          {/* Notifications Icon */}
          <button 
            className="p-1.5 rounded hover:bg-white/10 text-white/80 hover:text-white relative"
            title="System Audit & Activity Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          </button>

          {/* Language Switcher Button (EN / FR) */}
          <div className="flex items-center bg-black/25 rounded-md p-0.5 border border-white/10 text-xs">
            <button
              onClick={() => onToggleLanguage('en')}
              className={`px-2 py-0.5 rounded font-bold transition-colors ${
                language === 'en' ? 'bg-white text-[#714B67] shadow-xs' : 'text-white/70 hover:text-white'
              }`}
              title="Switch to English"
            >
              EN
            </button>
            <button
              onClick={() => onToggleLanguage('fr')}
              className={`px-2 py-0.5 rounded font-bold transition-colors ${
                language === 'fr' ? 'bg-white text-[#714B67] shadow-xs' : 'text-white/70 hover:text-white'
              }`}
              title="Passer en Français (i18n)"
            >
              FR
            </button>
          </div>

          {/* User Profile & Mock Role Switcher Dropdown */}
          <div className="relative pl-1 border-l border-white/20">
            <button
              id="user-role-switcher-btn"
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center space-x-1.5 p-1 rounded hover:bg-white/10 transition-colors focus:outline-hidden"
              title={`${roleProfile.name} • ${language === 'fr' ? roleProfile.titleFr : roleProfile.title}`}
            >
              <div className={`w-7 h-7 rounded-full ${roleProfile.avatarColor} font-bold text-xs flex items-center justify-center border border-white/50 shadow-sm ring-1 ring-white/20`}>
                {roleProfile.avatarText}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-none">
                <span className="text-xs font-semibold text-white truncate max-w-[110px]">
                  {roleProfile.name.split(' ')[0]}
                </span>
                <span className="text-[10px] text-purple-200 truncate max-w-[110px]">
                  {roleProfile.id === 'superintendent' ? 'Superintendent' : roleProfile.id === 'guard' ? 'Guard' : roleProfile.id === 'medical_officer' ? 'Medical' : 'Records'}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-white/70" />
            </button>

            {/* Role Switcher Popover */}
            {isRoleDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsRoleDropdownOpen(false)} 
                />
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-2xl border border-slate-200 z-50 py-2 text-slate-800 animate-in fade-in zoom-in-95 duration-100">
                  {/* Current Active User Banner */}
                  <div className="px-3.5 py-2 border-b border-slate-100 bg-slate-50/70">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      {language === 'fr' ? 'Session Utilisateur Odoo 19' : 'Active User Session'}
                    </div>
                    <div className="flex items-center space-x-2.5">
                      <div className={`w-8 h-8 rounded-full ${roleProfile.avatarColor} font-bold text-xs flex items-center justify-center shadow-xs`}>
                        {roleProfile.avatarText}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">{roleProfile.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{language === 'fr' ? roleProfile.titleFr : roleProfile.title}</div>
                      </div>
                    </div>
                    <div className="mt-1.5 text-[10px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 flex items-center justify-between">
                      <span className="truncate">{roleProfile.odooGroupXmlId}</span>
                      <span className="font-bold">v19.0</span>
                    </div>
                  </div>

                  {/* Switch Role Selection Header */}
                  <div className="px-3.5 pt-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>{language === 'fr' ? 'Changer de Rôle (Test RBAC)' : 'Switch Role (Test RBAC)'}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-normal">
                      res.groups
                    </span>
                  </div>

                  {/* Role Option List */}
                  <div className="p-1 space-y-1">
                    {(Object.values(USER_ROLES)).map(r => {
                      const isSelected = currentUserRole === r.id;
                      return (
                        <button
                          key={r.id}
                          onClick={() => {
                            onSelectRole(r.id);
                            setIsRoleDropdownOpen(false);
                          }}
                          className={`w-full text-left p-2 rounded-md transition-all flex items-start space-x-2.5 ${
                            isSelected 
                              ? 'bg-purple-50 text-[#714B67] border border-purple-200' 
                              : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full ${r.avatarColor} font-bold text-[10px] flex items-center justify-center mt-0.5 shadow-2xs shrink-0`}>
                            {r.avatarText}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {r.name}
                              </span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-purple-700 shrink-0 ml-1" />}
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium truncate">
                              {language === 'fr' ? r.titleFr : r.title}
                            </div>
                            
                            {/* Sensitive isolation tag */}
                            {r.sensitiveRestrictedModules.length > 0 ? (
                              <div className="text-[9px] text-amber-700 bg-amber-50 rounded px-1.5 py-0.2 mt-0.5 inline-flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" />
                                <span>
                                  {language === 'fr' 
                                    ? `Masque: Levée d'écrou & peines` 
                                    : `Hides: Discharge & sentence`}
                                </span>
                              </div>
                            ) : (
                              <div className="text-[9px] text-emerald-700 bg-emerald-50 rounded px-1.5 py-0.2 mt-0.5 inline-flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                <span>{language === 'fr' ? 'Accès total tous modules' : 'Full access to all modules'}</span>
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Action Link: View ir.model.access.csv Matrix */}
                  <div className="px-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setIsRoleDropdownOpen(false);
                        setIsMatrixModalOpen(true);
                      }}
                      className="w-full py-1.5 px-2.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5 text-purple-600" />
                      <span>{language === 'fr' ? 'Voir Matrice ir.model.access.csv' : 'View Access Control Matrix'}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Access Control Matrix Modal */}
      <AccessControlMatrixModal
        isOpen={isMatrixModalOpen}
        onClose={() => setIsMatrixModalOpen(false)}
        currentRole={currentUserRole}
        onSelectRole={onSelectRole}
        language={language}
      />
    </header>
  );
};
