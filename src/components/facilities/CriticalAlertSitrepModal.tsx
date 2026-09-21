import React, { useState } from 'react';
import { PrisonFacility, OngoingSecurityIncident } from '../../types';
import {
  Siren,
  ShieldAlert,
  AlertTriangle,
  Users,
  Radio,
  Clock,
  Shield,
  MapPin,
  CheckCircle2,
  X,
  ArrowRightLeft,
  Flame,
  FileText,
  Lock,
  PhoneCall,
  Send,
  Zap,
  Activity,
  Crosshair,
  BadgeAlert
} from 'lucide-react';

interface CriticalAlertSitrepModalProps {
  facility: PrisonFacility;
  onClose: () => void;
  onNavigateToTransfers?: (facilityId?: string) => void;
  onOpenHotspotView?: (facilityId: string) => void;
}

export const CriticalAlertSitrepModal: React.FC<CriticalAlertSitrepModalProps> = ({
  facility,
  onClose,
  onNavigateToTransfers,
  onOpenHotspotView
}) => {
  const [qrfDispatched, setQrfDispatched] = useState(false);
  const [lockdownEnforced, setLockdownEnforced] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [activeTab, setActiveTab] = useState<'sitrep' | 'staffing' | 'protocols'>('sitrep');

  // Staffing calculations
  const activeOfficers = facility.activeOfficers || Math.max(1, Math.round(facility.capacity / 6));
  const recommendedOfficers = facility.recommendedOfficers || Math.ceil(facility.currentInmates / 6);
  const ratio = Number((facility.currentInmates / activeOfficers).toFixed(1));
  const officerDeficit = Math.max(0, recommendedOfficers - activeOfficers);
  const isHighRatio = ratio >= 10.0;
  const occupancyRate = Math.round((facility.currentInmates / facility.capacity) * 100);

  const ongoingIncidents = facility.ongoingSecurityIncidents || [];
  const hasOngoingIncidents = ongoingIncidents.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-xl shadow-2xl border-2 border-rose-500 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Emergency Header */}
        <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-amber-900 text-white p-4 sm:p-5 flex items-start justify-between gap-4 border-b-2 border-rose-600">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-rose-600 rounded-lg shrink-0 shadow-md animate-pulse">
              <Siren className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-rose-500 text-white text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded tracking-wider shadow-xs">
                  CRITICAL OPERATIONAL SITREP
                </span>
                <span className="bg-black/40 text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-amber-400/30">
                  CODE RED ALERT
                </span>
                <span className="text-xs text-rose-200 font-mono">
                  INCIDENT REF: SITREP-{facility.code}-{new Date().toISOString().slice(0, 10)}
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-white mt-1">
                {facility.name}
              </h2>
              <p className="text-xs text-rose-100 flex items-center gap-2 mt-0.5">
                <span>Superintendent: <strong>{facility.wardenName}</strong></span>
                <span>•</span>
                <span>Security Level: <strong className="font-mono text-amber-200">{facility.securityRating}</strong></span>
                <span>•</span>
                <span>County: <strong>{facility.county}</strong></span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-black/30 hover:bg-black/50 text-white/80 hover:text-white transition-colors"
            title="Close SITREP Dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Emergency Status Bar */}
        <div className="bg-rose-50 border-b border-rose-200 p-3 px-5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            {isHighRatio && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold bg-rose-600 text-white shadow-xs">
                <Users className="w-3.5 h-3.5" />
                Custodial Ratio: {ratio}:1 [Deficit: -{officerDeficit} Officers]
              </span>
            )}
            {hasOngoingIncidents && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold bg-amber-600 text-white shadow-xs animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" />
                {ongoingIncidents.length} Ongoing Security Incident(s) in Progress
              </span>
            )}
            <span className="text-slate-600 font-medium">
              Occupancy: <strong className="text-slate-900 font-mono">{occupancyRate}%</strong> ({facility.currentInmates}/{facility.capacity} beds)
            </span>
          </div>

          {/* Quick Action Navigation Tabs */}
          <div className="flex items-center bg-white rounded-lg p-0.5 border border-slate-200 shadow-2xs">
            <button
              onClick={() => setActiveTab('sitrep')}
              className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                activeTab === 'sitrep'
                  ? 'bg-rose-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Incidents SITREP ({ongoingIncidents.length})
            </button>
            <button
              onClick={() => setActiveTab('staffing')}
              className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                activeTab === 'staffing'
                  ? 'bg-rose-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Staffing Ratio Analysis
            </button>
            <button
              onClick={() => setActiveTab('protocols')}
              className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                activeTab === 'protocols'
                  ? 'bg-rose-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tactical SOPs
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-slate-800">
          {activeTab === 'sitrep' && (
            <div className="space-y-4">
              {hasOngoingIncidents ? (
                ongoingIncidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="p-4 rounded-xl border-2 border-rose-300 bg-rose-50/50 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-rose-600 text-white rounded-md shadow-2xs">
                          <Siren className="w-4 h-4 animate-pulse" />
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-rose-200 text-rose-900 border border-rose-300">
                              {incident.severity} SEVERITY
                            </span>
                            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
                              {incident.status.replace('_', ' ')}
                            </span>
                          </div>
                          <h4 className="text-base font-extrabold text-slate-900 mt-1">
                            {incident.title}
                          </h4>
                        </div>
                      </div>

                      <div className="text-right text-xs text-slate-500 font-mono">
                        <div className="flex items-center justify-end gap-1 text-rose-700 font-bold">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{incident.reportedTime}</span>
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5">
                          Zone: <strong>{incident.locationZone}</strong>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed bg-white/80 p-3 rounded-lg border border-rose-100">
                      {incident.description}
                    </p>

                    {/* Tactical Units & Inmates Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1 mb-1.5">
                          <Shield className="w-3 h-3 text-rose-600" />
                          <span>Tactical Units Deployed On-Site</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {incident.tacticalUnitsDeployed && incident.tacticalUnitsDeployed.length > 0 ? (
                            incident.tacticalUnitsDeployed.map((unit, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] font-medium bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200"
                              >
                                {unit}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 italic">No external tactical units recorded</span>
                          )}
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1 mb-1.5">
                          <Activity className="w-3 h-3 text-amber-600" />
                          <span>Containment Parameters</span>
                        </div>
                        <div className="space-y-1 text-xs text-slate-700">
                          <div>
                            Inmates Involved in Disturbance:{' '}
                            <strong className="text-rose-700 font-mono font-bold">
                              {incident.inmatesInvolvedCount ?? 'Unconfirmed'}
                            </strong>
                          </div>
                          <div>
                            Estimated Containment Window:{' '}
                            <strong className="text-slate-900 font-mono">
                              {incident.containmentEtaMinutes ? `${incident.containmentEtaMinutes} Minutes` : 'Active / Indefinite'}
                            </strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-900">No Active Security Incidents in Progress</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Perimeter sectors, internal cell blocks, and sallyports report green routine status. However, custodial staffing ratios remain under active surveillance.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'staffing' && (
            <div className="space-y-4">
              {/* Ratio Comparison Card */}
              <div className="p-4 rounded-xl border-2 border-rose-200 bg-rose-50/40">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-rose-600" />
                    <span>Custodial Supervision Ratio Assessment</span>
                  </h4>
                  <span className={`text-xs font-mono font-extrabold px-2.5 py-0.5 rounded-full ${
                    isHighRatio ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    {ratio}:1 Ratio {isHighRatio ? '[CRITICAL DEFICIT]' : '[COMPLIANT]'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Active Inmates</div>
                    <div className="text-xl font-mono font-bold text-slate-900 mt-0.5">
                      {facility.currentInmates}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Officers on Duty</div>
                    <div className="text-xl font-mono font-bold text-rose-700 mt-0.5">
                      {activeOfficers}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Statutory Standard</div>
                    <div className="text-xl font-mono font-bold text-emerald-700 mt-0.5">
                      6.0:1
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Staffing Deficit</div>
                    <div className="text-xl font-mono font-bold text-rose-600 mt-0.5">
                      -{officerDeficit}
                    </div>
                  </div>
                </div>

                {/* Visual Ratio Comparison Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-600">Custodial Supervision Load:</span>
                    <span className="font-mono font-bold text-rose-700">
                      {ratio} Inmates per 1 Custodial Guard (Max Safe Limit: 8.0:1)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full"
                      style={{ width: `${Math.min(100, (6 / ratio) * 100)}%` }}
                      title="Safe Statutory Threshold (6:1)"
                    />
                    <div
                      className="bg-rose-600 h-full animate-pulse"
                      style={{ width: `${Math.max(0, 100 - (6 / ratio) * 100)}%` }}
                      title="Excess Custodial Stress"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>1:1 (Optimal)</span>
                    <span>6:1 (Nelson Mandela Standard)</span>
                    <span className="text-rose-600 font-bold">{ratio}:1 (Current Facility)</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-white rounded-lg border border-rose-200 text-xs text-slate-700 space-y-1">
                  <div className="font-bold text-rose-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Statutory Custody Warning (Kenya Prisons Act Cap 90)</span>
                  </div>
                  <p className="leading-relaxed">
                    A ratio of {ratio}:1 severely strains guard post rotations, watchtower sightline vigilance, and cell muster counts. Combined with {occupancyRate}% bed occupancy, this increases escape vulnerability and contraband smuggling.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'protocols' && (
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-slate-700" />
                  <span>Mandatory Emergency Standing Orders</span>
                </h4>
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-start gap-2 p-2.5 bg-white rounded border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 font-bold font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <strong>Immediate Sentry Double-Posting</strong>: Freeze non-essential staff leave; reinforce North and East perimeter watchtowers with armed carbine details.
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2.5 bg-white rounded border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 font-bold font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <strong>Vehicular Sallyport Lockout</strong>: Halt all non-emergency commercial deliveries, produce trucks, and civil visitor entries until headcount reconciliation.
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2.5 bg-white rounded border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 font-bold font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <strong>Inter-Prison Inmate Re-allocation</strong>: Dispatch priority transfer warrants to relieve overcrowded CAT-A blocks to low-congestion annexes (Naivasha).
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Command Action Dispatch Buttons */}
          <div className="p-4 bg-slate-900 rounded-xl text-white space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
                <span>Superintendent Incident Command Dispatch</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Directives Logged to National HQ Audit
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* QRF Dispatch */}
              <button
                onClick={() => setQrfDispatched(!qrfDispatched)}
                className={`px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                  qrfDispatched
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-xs'
                    : 'bg-rose-700 hover:bg-rose-600 border-rose-600 text-white shadow-xs'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>
                  {qrfDispatched ? '✓ QRF Reinforcements En Route (ETA 14m)' : 'Mobilize Regional QRF Reinforcements'}
                </span>
              </button>

              {/* Perimeter Lockdown */}
              <button
                onClick={() => setLockdownEnforced(!lockdownEnforced)}
                className={`px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                  lockdownEnforced
                    ? 'bg-amber-600 border-amber-500 text-white shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>
                  {lockdownEnforced ? '✓ Compound Perimeter Lockout Engaged' : 'Engage Perimeter Sallyport Lockout'}
                </span>
              </button>

              {/* Open Hotspot View */}
              {onOpenHotspotView && (
                <button
                  onClick={() => {
                    onOpenHotspotView(facility.id);
                    onClose();
                  }}
                  className="px-3 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <Flame className="w-4 h-4 text-slate-950" />
                  <span>Inspect Tactical Hotspot Map</span>
                </button>
              )}

              {/* Inmate Re-allocation */}
              {onNavigateToTransfers && (
                <button
                  onClick={() => {
                    onNavigateToTransfers(facility.id);
                    onClose();
                  }}
                  className="px-3 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Initiate Emergency Re-allocation</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 p-4 px-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
            <span>HQ Command Channel: Encrypted VHF-Link Online</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setAcknowledged(true);
                setTimeout(() => {
                  onClose();
                }, 400);
              }}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                acknowledged
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-900 text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{acknowledged ? 'SITREP Acknowledged' : 'Acknowledge SITREP'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
