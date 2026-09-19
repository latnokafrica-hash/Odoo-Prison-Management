import React, { useState, useRef, useEffect } from 'react';
import { Inmate } from '../../types';
import { deriveMedicalFlag, MEDICAL_FLAG_STYLES } from '../../utils/medicalFlagUtils';
import { 
  HeartPulse, 
  Stethoscope, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Pill, 
  ExternalLink,
  ShieldAlert,
  Info,
  ChevronRight
} from 'lucide-react';

interface MedicalFlagIndicatorProps {
  inmate: Inmate;
  onOpenMedicalIntake?: (inmate: Inmate) => void;
  showConditionPreview?: boolean;
  compact?: boolean;
}

export const MedicalFlagIndicator: React.FC<MedicalFlagIndicatorProps> = ({
  inmate,
  onOpenMedicalIntake,
  showConditionPreview = true,
  compact = false
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<'bottom' | 'top'>('bottom');
  const badgeRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const flag = deriveMedicalFlag(inmate);
  const style = MEDICAL_FLAG_STYLES[flag.severity];

  // Adjust tooltip positioning if near bottom of screen
  useEffect(() => {
    if (showTooltip && badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 280) {
        setTooltipPos('top');
      } else {
        setTooltipPos('bottom');
      }
    }
  }, [showTooltip]);

  // Icon mapping
  const renderIcon = () => {
    switch (flag.severity) {
      case 'critical':
        return <HeartPulse className="w-3.5 h-3.5 text-rose-600 shrink-0 animate-pulse" />;
      case 'needs_specialist':
        return <Stethoscope className="w-3.5 h-3.5 text-amber-700 shrink-0" />;
      case 'chronic':
        return <Activity className="w-3.5 h-3.5 text-sky-700 shrink-0" />;
      case 'stable':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
    }
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenMedicalIntake) {
      onOpenMedicalIntake(inmate);
    }
  };

  return (
    <div 
      className="relative inline-block"
      ref={badgeRef}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Interactive Medical Flag Badge */}
      <div
        id={`medical-flag-${inmate.id}`}
        onClick={handleActionClick}
        title="Click to inspect medical intake report"
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs transition-all duration-150 cursor-pointer select-none group shadow-2xs ${style.badge}`}
      >
        {/* Severity Dot with Pulse for Critical */}
        <span className="relative flex h-2 w-2 shrink-0">
          {flag.severity === 'critical' && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${style.dot}`}></span>
        </span>

        {renderIcon()}

        {/* Severity Label */}
        <span className="font-bold tracking-tight uppercase text-[10px]">
          {flag.label}
        </span>

        {/* Short Condition Summary Preview if requested and space permits */}
        {showConditionPreview && !compact && flag.severity !== 'stable' && (
          <span className="text-[10.5px] font-normal opacity-90 max-w-[125px] truncate border-l border-current/20 pl-1.5 hidden xl:inline-block">
            {flag.conditionName.split('(')[0].trim()}
          </span>
        )}
      </div>

      {/* Hover Clinical Drawer / Tooltip Card */}
      {showTooltip && (
        <div
          ref={tooltipRef}
          onClick={(e) => e.stopPropagation()}
          className={`absolute left-0 z-50 w-72 bg-white rounded-lg shadow-xl border border-slate-200 text-slate-800 text-xs overflow-hidden pointer-events-auto transition-opacity animate-in fade-in zoom-in-95 duration-100 ${
            tooltipPos === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          }`}
        >
          {/* Tooltip Header */}
          <div className={`px-3 py-2 flex items-center justify-between border-b ${
            flag.severity === 'critical' ? 'bg-rose-50 border-rose-200 text-rose-900' :
            flag.severity === 'needs_specialist' ? 'bg-amber-50 border-amber-200 text-amber-900' :
            flag.severity === 'chronic' ? 'bg-sky-50 border-sky-200 text-sky-900' :
            'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}>
            <div className="flex items-center gap-1.5 font-semibold text-[11px]">
              {renderIcon()}
              <span>Medical Status: {flag.label}</span>
            </div>
            {flag.requiresHospitalization && (
              <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white text-[9px] font-bold">
                HOSPITAL
              </span>
            )}
            {flag.specialistSpecialty && (
              <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 text-[9px] font-semibold truncate max-w-[90px]">
                {flag.specialistSpecialty.split(' ')[0]}
              </span>
            )}
          </div>

          {/* Condition Content */}
          <div className="p-3 space-y-2">
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Flagged Condition</div>
              <div className="text-xs font-bold text-slate-900 mt-0.5 leading-snug">
                {flag.conditionName}
              </div>
            </div>

            {/* Vitals Strip if available */}
            {flag.vitalsSummary && (
              <div className="bg-slate-50 rounded p-1.5 text-[11px] font-mono text-slate-700 border border-slate-100 flex items-center gap-1">
                <span className="text-slate-400 font-sans text-[10px]">Vitals:</span>
                <span className="truncate">{flag.vitalsSummary}</span>
              </div>
            )}

            {/* Clinical Highlights */}
            <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-1">
              <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                <span className="text-slate-500 text-[10px] block">Prescriptions</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <Pill className="w-3 h-3 text-slate-400" />
                  {flag.activeMedicationsCount} Daily Held
                </span>
              </div>
              <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                <span className="text-slate-500 text-[10px] block">Allergies</span>
                <span className={`font-semibold flex items-center gap-1 ${flag.allergiesCount > 0 ? 'text-amber-700' : 'text-slate-700'}`}>
                  <AlertTriangle className="w-3 h-3" />
                  {flag.allergiesCount > 0 ? `${flag.allergiesCount} Flagged` : 'None Logged'}
                </span>
              </div>
            </div>

            {/* Screening notes snippet */}
            {flag.notes && (
              <div className="text-[11px] text-slate-600 line-clamp-2 italic bg-slate-50/50 p-1.5 rounded border border-slate-100">
                "{flag.notes}"
              </div>
            )}

            {/* Doctor Info */}
            {flag.examiningDoctor && (
              <div className="text-[10px] text-slate-500 flex items-center justify-between pt-0.5 border-t border-slate-100">
                <span className="truncate">Attending: {flag.examiningDoctor}</span>
                <span className="font-mono text-[9.5px]">{flag.screeningDate}</span>
              </div>
            )}

            {/* Direct Link Action */}
            {onOpenMedicalIntake && (
              <button
                type="button"
                onClick={handleActionClick}
                className="w-full mt-1.5 py-1.5 px-2 rounded bg-slate-900 text-white hover:bg-slate-800 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>View Full Medical Intake</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
