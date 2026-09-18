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
  Shield
} from 'lucide-react';
import { PrisonFacility, Inmate } from '../../types';

interface OdooNavbarProps {
  currentModule: string;
  onSelectModule: (moduleId: string) => void;
  facilities: PrisonFacility[];
  selectedFacilityId: string;
  onSelectFacility: (facilityId: string) => void;
  inmates: Inmate[];
  onOpenNewModal: () => void;
}

export const OdooNavbar: React.FC<OdooNavbarProps> = ({
  currentModule,
  onSelectModule,
  facilities,
  selectedFacilityId,
  onSelectFacility,
  inmates,
  onOpenNewModal
}) => {
  const [isAppSwitcherOpen, setIsAppSwitcherOpen] = useState(false);
  const [isFacilityDropdownOpen, setIsFacilityDropdownOpen] = useState(false);

  // Escaped inmates alert count
  const escapedCount = inmates.filter(i => i.custodyStatus === 'escaped').length;
  // Court hearings today (2026-09-18)
  const hearingsTodayCount = inmates.flatMap(i => i.courtCases).filter(c => c.hearingDate === '2026-09-18').length;
  // Discharges pending
  const pendingDischargeCount = inmates.filter(i => i.dischargeRecord && i.dischargeRecord.status !== 'archived').length;

  const currentFacility = facilities.find(f => f.id === selectedFacilityId);

  const modules = [
    { id: 'inmates', name: 'Inmate Records', icon: Users, desc: 'Master custody profiles & booking' },
    { id: 'facilities', name: 'National Directorate', icon: Building2, desc: 'Country-wide prison overview & map' },
    { id: 'admissions', name: 'Admissions & Transfers', icon: ArrowLeftRight, desc: 'Intake, transfers, bail & escapes' },
    { id: 'sentence', name: 'Sentence & Remission', icon: Scale, desc: 'Calculations, 1/3 deductions & legal' },
    { id: 'rehab', name: 'Classification & Gratuity', icon: GraduationCap, desc: 'Progressive stages & inmate earnings' },
    { id: 'court', name: 'Court & Escort Docket', icon: Gavel, desc: 'Judicial tracking & transport manifests' },
    { id: 'discharge', name: 'Discharge & Gate Exit', icon: LogOut, desc: 'Clearance checklist & property return' },
    { id: 'human_rights', name: 'Human Rights & Audits', icon: Shield, desc: 'Nelson Mandela Rules & ombudsman' },
    { id: 'blueprint', name: 'Odoo 19 Architecture', icon: Code2, desc: 'Python models, XML views & manifest' },
  ];

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
                    {modules.map((m) => {
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

        {/* Center: Top Level Quick Menu Items */}
        <nav className="hidden lg:flex items-center space-x-1 text-xs">
          {modules.slice(0, 6).map(m => (
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

          {/* User Profile Avatar */}
          <div className="flex items-center pl-1 border-l border-white/20">
            <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-900 font-bold text-xs flex items-center justify-center border border-white/50 shadow-sm" title="Superintendent Josephat Mwangi (Administrator)">
              JM
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
