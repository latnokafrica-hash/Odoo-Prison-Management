import React, { useState, useEffect } from 'react';
import { Inmate, PrisonFacility, SentenceRecord, RemissionLog, GratuityTransaction, UserRole, Language, RehabilitationEnrollment } from '../../types';
import { USER_ROLES } from '../../data/rolesData';
import { MedicalIntakeView } from './MedicalIntakeView';
import { IncidentTimelineView } from './IncidentTimelineView';
import { CertificateModal } from '../rehab/CertificateModal';
import { UpdateProgressModal } from '../rehab/UpdateProgressModal';
import { PropertyVault } from './PropertyVault';
import { BiometricVerificationModal } from './BiometricVerificationModal';
import { 
  ArrowLeft, 
  Building2, 
  Scale, 
  Gavel, 
  Coins, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Plus, 
  Send, 
  MessageSquare, 
  History, 
  Calendar, 
  Sparkles, 
  Trash2, 
  MapPin, 
  Lock, 
  ShieldCheck, 
  UserCheck, 
  HeartHandshake, 
  LogOut, 
  Car, 
  AlertCircle,
  Stethoscope,
  Activity,
  HeartPulse,
  Award,
  TrendingUp,
  Printer,
  Camera,
  ScanFace,
  Fingerprint,
  Scan
} from 'lucide-react';

interface InmateFormViewProps {
  inmate: Inmate;
  facilities: PrisonFacility[];
  language?: Language;
  onBack: () => void;
  onUpdateInmate: (updated: Inmate) => void;
  onOpenTransferModal: (inmate: Inmate) => void;
  onOpenEscapeModal: (inmate: Inmate) => void;
  onOpenDischargeModal: (inmate: Inmate) => void;
  currentUserRole?: UserRole;
  initialTab?: 'intake' | 'medical' | 'sentence' | 'stages' | 'court' | 'transfers' | 'human_rights' | 'timeline';
}

export const InmateFormView: React.FC<InmateFormViewProps> = ({
  inmate,
  facilities,
  language = 'en',
  onBack,
  onUpdateInmate,
  onOpenTransferModal,
  onOpenEscapeModal,
  onOpenDischargeModal,
  currentUserRole = 'superintendent',
  initialTab = 'sentence'
}) => {
  const [activeTab, setActiveTab] = useState<'intake' | 'medical' | 'sentence' | 'stages' | 'court' | 'transfers' | 'human_rights' | 'timeline'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, inmate.id]);
  const [newChatterNote, setNewChatterNote] = useState('');
  const [chatterType, setChatterType] = useState<'log_note' | 'activity'>('log_note');

  // Role permissions
  const roleProfile = USER_ROLES[currentUserRole] || USER_ROLES.superintendent;
  const canRecalculateRemission = roleProfile.canRecalculateRemission;
  const canExecuteDischarge = roleProfile.canExecuteDischarge;

  // Remission deduction quick-action state
  const [showRemissionModal, setShowRemissionModal] = useState(false);
  const [remissionAdjustDays, setRemissionAdjustDays] = useState<number>(-14);
  const [remissionReason, setRemissionReason] = useState('Disciplinary Tribunal: Possession of unauthorized contraband');

  // Biometric verification modal state
  const [showBiometricModal, setShowBiometricModal] = useState(false);

  // Wage credit quick-action state
  const [showWageModal, setShowWageModal] = useState(false);
  const [wageAmount, setWageAmount] = useState<number>(25.00);
  const [wageProgram, setWageProgram] = useState('Vocational Workshop Labor Allowance');

  // Rehabilitation & Certificate Modals
  const [selectedCertEnrollment, setSelectedCertEnrollment] = useState<RehabilitationEnrollment | null>(null);
  const [selectedProgressEnrollment, setSelectedProgressEnrollment] = useState<RehabilitationEnrollment | null>(null);

  const handleSaveProgramProgress = (inmateId: string, updatedProg: RehabilitationEnrollment) => {
    const updatedPrograms = inmate.programs.map(p => p.id === updatedProg.id ? updatedProg : p);
    const updated: Inmate = {
      ...inmate,
      programs: updatedPrograms,
      chatterLogs: [
        {
          id: `ch-${Date.now()}`,
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          author: 'Vocational Training Officer',
          message: `Updated course progress for ${updatedProg.programName}: ${updatedProg.progressPercent}% (${updatedProg.status.replace('_', ' ')})`,
          type: 'activity'
        },
        ...inmate.chatterLogs
      ]
    };
    onUpdateInmate(updated);
  };

  const primarySentence = inmate.sentences[0];

  // Calculate remission statistics
  const totalSentenceDays = inmate.sentences.reduce((acc, s) => {
    return acc + (s.termYears * 365) + (s.termMonths * 30) + s.termDays;
  }, 0);

  const statutoryEarned = Math.round(totalSentenceDays * 0.3333);
  const totalForfeited = inmate.remissionLogs
    .filter(r => r.type === 'forfeiture_infraction')
    .reduce((acc, r) => acc + Math.abs(r.days), 0);
  const totalRestored = inmate.remissionLogs
    .filter(r => r.type === 'restoration_merit')
    .reduce((acc, r) => acc + r.days, 0);

  const netRemission = Math.max(0, statutoryEarned - totalForfeited + totalRestored);
  const netDaysToServe = totalSentenceDays - netRemission;

  // Handle stage change
  const handleStageChange = (newStage: Inmate['progressiveStage']) => {
    const updated: Inmate = {
      ...inmate,
      progressiveStage: newStage,
      chatterLogs: [
        {
          id: `ch-${Date.now()}`,
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          author: 'Classification Board Officer',
          message: `Inmate reclassified to ${newStage.toUpperCase().replace('_', ' ')}. Privileges updated accordingly.`,
          type: 'activity'
        },
        ...inmate.chatterLogs
      ]
    };
    onUpdateInmate(updated);
  };

  // Handle Security Category change
  const handleSecurityChange = (newSec: Inmate['securityCategory']) => {
    const updated: Inmate = {
      ...inmate,
      securityCategory: newSec,
      chatterLogs: [
        {
          id: `ch-${Date.now()}`,
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          author: 'Senior Superintendent',
          message: `Security Category reclassified to ${newSec}.`,
          type: 'system'
        },
        ...inmate.chatterLogs
      ]
    };
    onUpdateInmate(updated);
  };

  // Handle adding disciplinary remission forfeiture
  const handleApplyRemissionAdjustment = () => {
    if (!remissionAdjustDays || !remissionReason.trim()) return;

    const newLog: RemissionLog = {
      id: `rem-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      type: remissionAdjustDays < 0 ? 'forfeiture_infraction' : 'restoration_merit',
      days: remissionAdjustDays,
      reason: remissionReason,
      adjudicator: 'Superintendent Disciplinary Board'
    };

    const updated: Inmate = {
      ...inmate,
      remissionLogs: [newLog, ...inmate.remissionLogs],
      chatterLogs: [
        {
          id: `ch-${Date.now()}`,
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          author: 'Disciplinary Tribunal',
          message: `Remission adjustment entered: ${remissionAdjustDays > 0 ? '+' : ''}${remissionAdjustDays} days. Reason: ${remissionReason}`,
          type: 'system'
        },
        ...inmate.chatterLogs
      ]
    };

    onUpdateInmate(updated);
    setShowRemissionModal(false);
    setRemissionReason('');
  };

  // Handle adding gratuity wage credit
  const handleCreditWage = () => {
    if (!wageAmount || wageAmount <= 0) return;

    const newBalance = inmate.gratuityBalance + wageAmount;
    const newTx: GratuityTransaction = {
      id: `gt-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      type: 'wage_credit',
      amount: wageAmount,
      description: wageProgram,
      balanceAfter: newBalance,
      verifiedBy: 'Welfare Officer'
    };

    const updated: Inmate = {
      ...inmate,
      gratuityBalance: newBalance,
      gratuityTransactions: [newTx, ...inmate.gratuityTransactions],
      chatterLogs: [
        {
          id: `ch-${Date.now()}`,
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          author: 'Inmate Accounts',
          message: `Credited $${wageAmount.toFixed(2)} to Gratuity Ledger (${wageProgram}). New Balance: $${newBalance.toFixed(2)}`,
          type: 'log_note'
        },
        ...inmate.chatterLogs
      ]
    };

    onUpdateInmate(updated);
    setShowWageModal(false);
  };

  // Add chatter log note
  const handleAddChatter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatterNote.trim()) return;

    const updated: Inmate = {
      ...inmate,
      chatterLogs: [
        {
          id: `ch-${Date.now()}`,
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          author: 'Warden Josephat Mwangi',
          message: newChatterNote.trim(),
          type: chatterType
        },
        ...inmate.chatterLogs
      ]
    };

    onUpdateInmate(updated);
    setNewChatterNote('');
  };

  return (
    <div className="bg-slate-100 min-h-[calc(100vh-100px)] p-4">
      {/* Back button & Form Title Header */}
      <div className="max-w-6xl mx-auto mb-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-md shadow-2xs hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Inmates List</span>
        </button>

        <div className="text-xs text-slate-500 font-mono">
          Odoo Model: <span className="font-semibold text-slate-700">prison.inmate</span> #{inmate.id}
        </div>
      </div>

      {/* Main Odoo Form Sheet Container */}
      <div className="max-w-6xl mx-auto bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Odoo Header 1: Status Pipeline Bar */}
        <div className="border-b border-slate-200 bg-slate-50/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 select-none">
          {/* Action Buttons Toolbar */}
          <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
            {/* Biometric Verification Button */}
            <button
              onClick={() => setShowBiometricModal(true)}
              className={`px-2.5 py-1 text-xs font-semibold rounded shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer border ${
                inmate.biometrics?.lastVerificationStatus === 'verified'
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300'
                  : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-300'
              }`}
              title="Launch Camera Facial Recognition & AFIS Fingerprint Verification"
            >
              <ScanFace className={`w-3.5 h-3.5 ${
                inmate.biometrics?.lastVerificationStatus === 'verified' ? 'text-emerald-700' : 'text-[#714B67]'
              }`} />
              <span>Biometric Verification</span>
              {inmate.biometrics?.lastVerificationStatus === 'verified' ? (
                <span className="text-[9px] font-mono font-bold bg-emerald-600 text-white px-1.5 py-0.2 rounded-full">
                  VERIFIED
                </span>
              ) : (
                <span className="text-[9px] font-mono font-bold bg-purple-700 text-white px-1.5 py-0.2 rounded-full">
                  SCAN
                </span>
              )}
            </button>

            <button
              onClick={() => onOpenTransferModal(inmate)}
              className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded shadow-2xs transition-colors flex items-center gap-1"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Transfer Facility</span>
            </button>

            {/* Sentence Remission: Restricted to Records Clerk & Superintendent */}
            {canRecalculateRemission ? (
              <button
                onClick={() => setShowRemissionModal(true)}
                className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded shadow-2xs transition-colors flex items-center gap-1"
              >
                <Scale className="w-3.5 h-3.5 text-purple-600" />
                <span>Adjust Remission</span>
              </button>
            ) : (
              <button
                disabled
                className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-400 border border-slate-200 rounded cursor-not-allowed flex items-center gap-1"
                title="Sentence remission adjustment is restricted to Records Clerk & Superintendent (group_prison_records)"
              >
                <Lock className="w-3 h-3 text-slate-400" />
                <span className="line-through">Adjust Remission</span>
              </button>
            )}

            <button
              onClick={() => setShowWageModal(true)}
              className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded shadow-2xs transition-colors flex items-center gap-1"
            >
              <Coins className="w-3.5 h-3.5 text-emerald-600" />
              <span>Log Gratuity Wage</span>
            </button>

            {inmate.custodyStatus === 'escaped' ? (
              <button
                onClick={() => onOpenEscapeModal(inmate)}
                className="px-2.5 py-1 text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white rounded shadow-2xs transition-colors flex items-center gap-1"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
                <span>Process Recapture</span>
              </button>
            ) : (
              <button
                onClick={() => onOpenEscapeModal(inmate)}
                className="px-2.5 py-1 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded shadow-2xs transition-colors flex items-center gap-1"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>Escape Alert</span>
              </button>
            )}

            {/* Discharge & Exit: Strictly restricted to Superintendent */}
            {canExecuteDischarge ? (
              <button
                onClick={() => onOpenDischargeModal(inmate)}
                className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded shadow-2xs transition-colors flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-600" />
                <span>Discharge & Exit</span>
              </button>
            ) : (
              <button
                disabled
                className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-400 border border-slate-200 rounded cursor-not-allowed flex items-center gap-1"
                title="Inmate discharge clearance is strictly restricted to Superintendent (group_prison_superintendent)"
              >
                <Lock className="w-3 h-3 text-slate-400" />
                <span className="line-through">Discharge & Exit</span>
              </button>
            )}
          </div>

          {/* Odoo Status Chevron Pipeline */}
          <div className="flex items-center text-xs font-medium border border-slate-300/80 rounded overflow-hidden shadow-2xs">
            <div className={`px-2.5 py-1 ${inmate.custodyStatus === 'draft' ? 'bg-[#714B67] text-white font-bold' : 'bg-slate-100 text-slate-600'}`}>
              Draft
            </div>
            <div className={`px-2.5 py-1 border-l border-slate-300/80 ${inmate.custodyStatus === 'remand' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-100 text-slate-600'}`}>
              Remand
            </div>
            <div className={`px-2.5 py-1 border-l border-slate-300/80 ${inmate.custodyStatus === 'convicted' ? 'bg-emerald-700 text-white font-bold' : 'bg-slate-100 text-slate-600'}`}>
              Convicted
            </div>
            {inmate.custodyStatus === 'in_transit' && (
              <div className="px-2.5 py-1 border-l border-slate-300/80 bg-amber-500 text-white font-bold">
                In Transit
              </div>
            )}
            {inmate.custodyStatus === 'escaped' && (
              <div className="px-2.5 py-1 border-l border-slate-300/80 bg-rose-600 text-white font-bold animate-pulse">
                ESCAPED
              </div>
            )}
            <div className={`px-2.5 py-1 border-l border-slate-300/80 ${inmate.custodyStatus === 'discharged' ? 'bg-slate-800 text-white font-bold' : 'bg-slate-100 text-slate-500'}`}>
              Discharged
            </div>
          </div>
        </div>

        {/* Odoo Header 2: Smart Stat Buttons Row */}
        <div className="border-b border-slate-200 bg-white px-4 py-2 flex items-center justify-end space-x-2 overflow-x-auto">
          {/* Smart Button 1: Sentences */}
          <button 
            onClick={() => setActiveTab('sentence')}
            className="flex items-center space-x-2 px-3 py-1.5 rounded border border-slate-200 hover:bg-slate-50 text-left transition-colors"
          >
            <Scale className="w-4 h-4 text-purple-600" />
            <div>
              <div className="text-[11px] font-bold text-slate-800 leading-none">
                {inmate.sentences.length} {inmate.sentences.length === 1 ? 'Sentence' : 'Sentences'}
              </div>
              <div className="text-[10px] text-slate-500">Legal Orders</div>
            </div>
          </button>

          {/* Smart Button 2: Remission Earned / Net Days */}
          <button 
            onClick={() => setActiveTab('sentence')}
            className="flex items-center space-x-2 px-3 py-1.5 rounded border border-slate-200 hover:bg-slate-50 text-left transition-colors"
          >
            <Clock className="w-4 h-4 text-blue-600" />
            <div>
              <div className="text-[11px] font-bold text-blue-800 leading-none">
                {netRemission} Days Remitted
              </div>
              <div className="text-[10px] text-slate-500">
                1/3 Statutory Net
              </div>
            </div>
          </button>

          {/* Smart Button 3: Court Hearings */}
          <button 
            onClick={() => setActiveTab('court')}
            className="flex items-center space-x-2 px-3 py-1.5 rounded border border-slate-200 hover:bg-slate-50 text-left transition-colors"
          >
            <Gavel className="w-4 h-4 text-amber-600" />
            <div>
              <div className="text-[11px] font-bold text-slate-800 leading-none">
                {inmate.courtCases.length} Court Dockets
              </div>
              <div className="text-[10px] text-slate-500">Judicial Tracking</div>
            </div>
          </button>

          {/* Smart Button 4: Gratuity Balance */}
          <button 
            onClick={() => setActiveTab('stages')}
            className="flex items-center space-x-2 px-3 py-1.5 rounded border border-slate-200 hover:bg-slate-50 text-left transition-colors"
          >
            <Coins className="w-4 h-4 text-emerald-600" />
            <div>
              <div className="text-[11px] font-bold text-emerald-700 leading-none">
                ${inmate.gratuityBalance.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-500">Gratuity Ledger</div>
            </div>
          </button>

          {/* Smart Button 5: Human Rights Audits */}
          <button 
            onClick={() => setActiveTab('human_rights')}
            className="flex items-center space-x-2 px-3 py-1.5 rounded border border-slate-200 hover:bg-slate-50 text-left transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-cyan-600" />
            <div>
              <div className="text-[11px] font-bold text-cyan-800 leading-none">
                {inmate.humanRightsAudits.length} Audits
              </div>
              <div className="text-[10px] text-slate-500">Mandela Rules</div>
            </div>
          </button>

          {/* Smart Button 6: Medical Intake & Clinical Status */}
          <button 
            onClick={() => setActiveTab('medical')}
            className="flex items-center space-x-2 px-3 py-1.5 rounded border border-teal-200 bg-teal-50/40 hover:bg-teal-50 text-left transition-colors"
          >
            <Stethoscope className="w-4 h-4 text-teal-600" />
            <div>
              <div className="text-[11px] font-bold text-teal-900 leading-none flex items-center gap-1">
                <span>Clinical Intake</span>
                {inmate.medicalIntake?.allergies && inmate.medicalIntake.allergies.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="Active allergies flagged" />
                )}
              </div>
              <div className="text-[10px] text-teal-700">
                {inmate.medicalIntake?.vaccinations ? `${inmate.medicalIntake.vaccinations.length} Vaccines` : 'Screening Ready'}
              </div>
            </div>
          </button>

          {/* Smart Button 7: Incident Timeline */}
          <button 
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded border text-left transition-colors ${
              activeTab === 'timeline' 
                ? 'border-purple-400 bg-purple-50 text-purple-900 shadow-2xs' 
                : 'border-slate-200 hover:bg-slate-50 text-slate-800'
            }`}
          >
            <History className="w-4 h-4 text-purple-600" />
            <div>
              <div className="text-[11px] font-bold leading-none flex items-center gap-1">
                <span>Incident Timeline</span>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              </div>
              <div className="text-[10px] text-slate-500">
                Disciplinary • Medical • Stage
              </div>
            </div>
          </button>
        </div>

        {/* Inmate Profile Title & Core Demographics */}
        <div className="p-6 border-b border-slate-200 bg-white">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={inmate.photoUrl}
                  alt={inmate.firstName}
                  className="w-20 h-20 rounded-lg object-cover border-2 border-slate-200 shadow-xs"
                />
                <span className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/70 text-white text-[9px] font-mono rounded">
                  MUG
                </span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                    {inmate.bookingNumber}
                  </span>
                  <span className="text-xs text-slate-500">
                    National ID: <strong className="font-mono text-slate-700">{inmate.nationalIdNumber}</strong>
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
                  {inmate.firstName} {inmate.lastName}
                  {inmate.alias && (
                    <span className="text-base text-slate-500 font-normal italic ml-2">
                      ("{inmate.alias}")
                    </span>
                  )}
                </h2>
                <div className="flex items-center space-x-3 text-xs text-slate-600 mt-1 flex-wrap gap-y-1">
                  <div className="flex items-center gap-1 font-medium text-[#714B67]">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{inmate.facilityName}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1 text-slate-700 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{inmate.cellLocation}</span>
                  </div>
                  <span>•</span>
                  <span>Admitted: {inmate.admissionDate}</span>
                  <span>•</span>
                  <button
                    onClick={() => setShowBiometricModal(true)}
                    className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-[11px] transition-colors cursor-pointer border ${
                      inmate.biometrics?.lastVerificationStatus === 'verified'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                    }`}
                    title="Click to execute Biometric Camera & Fingerprint Verification"
                  >
                    <ScanFace className="w-3 h-3 text-current" />
                    <span>
                      {inmate.biometrics?.lastVerificationStatus === 'verified'
                        ? `Biometrics Verified (${inmate.biometrics.lastVerificationConfidence || 99}%)`
                        : 'Verify Biometrics (Camera/AFIS)'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Classification Selectors */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              {/* Security Classification */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                  Security Classification
                </label>
                <select
                  value={inmate.securityCategory}
                  onChange={(e) => handleSecurityChange(e.target.value as Inmate['securityCategory'])}
                  className="text-xs font-semibold bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 focus:outline-hidden focus:border-[#714B67]"
                >
                  <option value="CAT_A">Category A: Maximum (Supermax)</option>
                  <option value="CAT_B">Category B: High Security</option>
                  <option value="CAT_C">Category C: Medium Security</option>
                  <option value="CAT_D">Category D: Minimum / Open Camp Trust</option>
                </select>
              </div>

              {/* Progressive Stage */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                  Progressive Stage
                </label>
                <select
                  value={inmate.progressiveStage}
                  onChange={(e) => handleStageChange(e.target.value as Inmate['progressiveStage'])}
                  className="text-xs font-semibold bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 focus:outline-hidden focus:border-[#714B67]"
                >
                  <option value="stage_1">Stage 1: Induction & Strict Custody</option>
                  <option value="stage_2">Stage 2: Standard Custody</option>
                  <option value="stage_3">Stage 3: Advanced Vocational</option>
                  <option value="stage_4">Stage 4: Pre-Release Special Trust</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Notebook Tabs Bar */}
        <div className="border-b border-slate-200 bg-slate-50/70 px-4 flex space-x-1 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('sentence')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'sentence'
                ? 'border-[#714B67] text-[#714B67] font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Sentence & Remission</span>
          </button>

          <button
            onClick={() => setActiveTab('stages')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'stages'
                ? 'border-[#714B67] text-[#714B67] font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Progressive Stages & Gratuity</span>
          </button>

          <button
            onClick={() => setActiveTab('court')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'court'
                ? 'border-[#714B67] text-[#714B67] font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Gavel className="w-3.5 h-3.5" />
            <span>Court Dockets & Transports</span>
          </button>

          <button
            onClick={() => setActiveTab('intake')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'intake'
                ? 'border-[#714B67] text-[#714B67] font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Intake, Biometrics & Property</span>
          </button>

          <button
            onClick={() => setActiveTab('transfers')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'transfers'
                ? 'border-[#714B67] text-[#714B67] font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Transfers, Bail & Escapes</span>
          </button>

          <button
            onClick={() => setActiveTab('human_rights')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'human_rights'
                ? 'border-[#714B67] text-[#714B67] font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Human Rights & Mandela Audits</span>
          </button>

          <button
            onClick={() => setActiveTab('medical')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'medical'
                ? 'border-[#714B67] text-[#714B67] font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
            <span>Medical Intake, Vaccines & Allergies</span>
            {inmate.medicalIntake?.allergies && inmate.medicalIntake.allergies.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-full border border-rose-200">
                {inmate.medicalIntake.allergies.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'timeline'
                ? 'border-[#714B67] text-[#714B67] font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5 text-purple-600" />
            <span>Incident Timeline</span>
            <span className="ml-1 px-1.5 py-0.2 bg-purple-100 text-[#714B67] text-[10px] font-mono font-bold rounded-full border border-purple-200">
              Audit
            </span>
          </button>
        </div>

        {/* Notebook Content Area */}
        <div className="p-6 bg-white min-h-[360px]">

          {/* TAB 1: SENTENCE & REMISSION ENGINE */}
          {activeTab === 'sentence' && (
            <div className="space-y-6">
              {/* Remission Calculation Summary Panel */}
              <div className="bg-purple-50/60 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-[#714B67]" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Statutory Remission & Sentence Administration Engine (Prisons Act Sec. 46)
                    </h3>
                  </div>
                  <span className="text-[11px] bg-[#714B67] text-white px-2 py-0.5 rounded font-mono font-medium">
                    1/3 Standard Statutory Remission
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-white p-3 rounded border border-purple-100 shadow-2xs">
                    <div className="text-[10px] text-slate-500 font-semibold uppercase">Total Sentence Days</div>
                    <div className="text-lg font-bold font-mono text-slate-900 mt-1">
                      {totalSentenceDays > 0 ? `${totalSentenceDays} d` : 'Awaiting Sentence'}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {primarySentence ? `${primarySentence.termYears} Years Conviction` : 'Remand Status'}
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded border border-purple-100 shadow-2xs">
                    <div className="text-[10px] text-emerald-700 font-semibold uppercase">Statutory 1/3 Earned</div>
                    <div className="text-lg font-bold font-mono text-emerald-700 mt-1">
                      +{statutoryEarned} d
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Under Prisons Act</div>
                  </div>

                  <div className="bg-white p-3 rounded border border-purple-100 shadow-2xs">
                    <div className="text-[10px] text-rose-700 font-semibold uppercase">Disciplinary Forfeited</div>
                    <div className="text-lg font-bold font-mono text-rose-700 mt-1">
                      -{totalForfeited} d
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Tribunal Penalties</div>
                  </div>

                  <div className="bg-white p-3 rounded border border-purple-100 shadow-2xs">
                    <div className="text-[10px] text-[#714B67] font-semibold uppercase">Net Custody to Serve</div>
                    <div className="text-lg font-bold font-mono text-[#714B67] mt-1">
                      {netDaysToServe > 0 ? `${netDaysToServe} d` : '0 d'}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">EDR Calculated</div>
                  </div>
                </div>

                {/* Release Dates Bar */}
                {primarySentence && (
                  <div className="mt-4 pt-3 border-t border-purple-200/70 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-slate-500">Earliest Date of Release (EDR): </span>
                      <strong className="text-emerald-700 font-mono text-sm">
                        {primarySentence.earliestReleaseDate}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Parole Eligibility Date (PED): </span>
                      <strong className="text-blue-700 font-mono text-sm">
                        {primarySentence.paroleEligibilityDate}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Latest Date of Release (LDR): </span>
                      <strong className="text-slate-800 font-mono text-sm">
                        {primarySentence.latestReleaseDate}
                      </strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Custodial Sentence Orders Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Judicial Sentences & Committal Warrants
                  </h4>
                </div>

                {inmate.sentences.length > 0 ? (
                  <div className="border border-slate-200 rounded-md overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">Case #</th>
                          <th className="py-2 px-3">Committing Court</th>
                          <th className="py-2 px-3">Offense & Section</th>
                          <th className="py-2 px-3">Term</th>
                          <th className="py-2 px-3">Structure</th>
                          <th className="py-2 px-3">Conviction Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {inmate.sentences.map(s => (
                          <tr key={s.id} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-mono font-semibold text-slate-800">{s.caseNumber}</td>
                            <td className="py-2 px-3">{s.courtName} (Judge: {s.judgeName})</td>
                            <td className="py-2 px-3 font-medium text-slate-900">{s.offense}</td>
                            <td className="py-2 px-3 font-mono font-semibold">{s.termYears} Years {s.termMonths > 0 && `${s.termMonths} Months`}</td>
                            <td className="py-2 px-3">
                              <span className="capitalize px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">
                                {s.structure}
                              </span>
                            </td>
                            <td className="py-2 px-3 font-mono text-slate-600">{s.dateConvicted}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded border border-slate-200 text-center text-xs text-slate-500">
                    No convicted custodial sentences logged. Inmate is currently held on Remand Warrant awaiting trial.
                  </div>
                )}
              </div>

              {/* Remission Log Adjustments History */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Remission Credit & Forfeiture Audit Trail
                  </h4>
                  <button
                    onClick={() => setShowRemissionModal(true)}
                    className="text-xs font-semibold text-[#714B67] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Record Disciplinary Forfeiture
                  </button>
                </div>

                {inmate.remissionLogs.length > 0 ? (
                  <div className="border border-slate-200 rounded-md overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">Date</th>
                          <th className="py-2 px-3">Adjustment Type</th>
                          <th className="py-2 px-3">Days</th>
                          <th className="py-2 px-3">Reason / Tribunal Finding</th>
                          <th className="py-2 px-3">Adjudicator</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {inmate.remissionLogs.map(r => (
                          <tr key={r.id} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-mono text-slate-600">{r.date}</td>
                            <td className="py-2 px-3">
                              {r.type === 'statutory_credit' && (
                                <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold text-[10px]">
                                  Statutory 1/3 Credit
                                </span>
                              )}
                              {r.type === 'forfeiture_infraction' && (
                                <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded font-semibold text-[10px]">
                                  Disciplinary Forfeiture
                                </span>
                              )}
                              {r.type === 'restoration_merit' && (
                                <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-semibold text-[10px]">
                                  Merit Restoration
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 font-mono font-bold">
                              {r.days > 0 ? `+${r.days}` : r.days} d
                            </td>
                            <td className="py-2 px-3 text-slate-800">{r.reason}</td>
                            <td className="py-2 px-3 text-slate-500">{r.adjudicator}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-400 italic text-center">
                    No remission adjustment records.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PROGRESSIVE STAGES & GRATUITY */}
          {activeTab === 'stages' && (
            <div className="space-y-6">
              {/* Progressive Stage Ladder */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h3 className="text-sm font-bold text-slate-900 mb-2">
                  Progressive Stage Classification System
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Inmates advance through 4 structured rehabilitative stages based on behavior ratings, workshop participation, and disciplinary compliance.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {[
                    { id: 'stage_1', name: 'Stage 1: Induction', priv: 'Lockup 18:00, Basic rations, Close security escort', color: 'slate' },
                    { id: 'stage_2', name: 'Stage 2: Standard', priv: 'General association, normal library & canteen access', color: 'blue' },
                    { id: 'stage_3', name: 'Stage 3: Advanced', priv: 'Industrial workshop wage earning, vocational training', color: 'amber' },
                    { id: 'stage_4', name: 'Stage 4: Trust / Open', priv: 'Open farm camp, minimal guard, home visit eligibility', color: 'emerald' },
                  ].map((stg) => {
                    const isCurrent = inmate.progressiveStage === stg.id;
                    return (
                      <div
                        key={stg.id}
                        onClick={() => handleStageChange(stg.id as Inmate['progressiveStage'])}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          isCurrent
                            ? 'bg-white border-[#714B67] ring-2 ring-[#714B67]/20 shadow-xs'
                            : 'bg-white/60 border-slate-200 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-bold ${isCurrent ? 'text-[#714B67]' : 'text-slate-700'}`}>
                            {stg.name}
                          </span>
                          {isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-[#714B67]" />}
                        </div>
                        <div className="text-[10px] text-slate-500 leading-relaxed">
                          {stg.priv}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Inmate Earning Scheme & Gratuity Ledger */}
              <div className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-emerald-600" />
                      Inmate Labor Earning Scheme & Gratuity Ledger
                    </h4>
                    <p className="text-xs text-slate-500">
                      Daily labor stipend for prison workshop production. Gratuity accumulates and is disbursed upon discharge.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-semibold text-slate-500">Current Balance</div>
                    <div className="text-xl font-mono font-bold text-emerald-700">
                      ${inmate.gratuityBalance.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Gratuity Transactions History */}
                {inmate.gratuityTransactions.length > 0 ? (
                  <div className="border border-slate-200 rounded overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">Date</th>
                          <th className="py-2 px-3">Transaction</th>
                          <th className="py-2 px-3">Description</th>
                          <th className="py-2 px-3 text-right">Amount</th>
                          <th className="py-2 px-3 text-right">Balance</th>
                          <th className="py-2 px-3">Verified By</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {inmate.gratuityTransactions.map(gt => (
                          <tr key={gt.id} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-mono text-slate-600">{gt.date}</td>
                            <td className="py-2 px-3">
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                gt.type === 'wage_credit' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                              }`}>
                                {gt.type === 'wage_credit' ? 'Labor Wage Credit' : 'Commissary Debit'}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-800">{gt.description}</td>
                            <td className={`py-2 px-3 text-right font-mono font-semibold ${
                              gt.amount > 0 ? 'text-emerald-700' : 'text-rose-700'
                            }`}>
                              {gt.amount > 0 ? `+$${gt.amount.toFixed(2)}` : `-$${Math.abs(gt.amount).toFixed(2)}`}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                              ${gt.balanceAfter.toFixed(2)}
                            </td>
                            <td className="py-2 px-3 text-slate-500">{gt.verifiedBy}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded border border-slate-200 text-center text-xs text-slate-500">
                    No gratuity transactions yet. Assign inmate to an industrial workshop or vocational trade to record earnings.
                  </div>
                )}
              </div>

              {/* Enrolled Vocational & Rehabilitation Programs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Active Vocational & Rehabilitation Programs ({inmate.programs.length})
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Accredited Curriculum & Trade Tests
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {inmate.programs.map(prg => {
                    const isCompleted = prg.status === 'completed' || prg.progressPercent === 100;
                    return (
                      <div key={prg.id} className="p-3.5 border border-slate-200 rounded-lg bg-white shadow-2xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between">
                            <div>
                              <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                prg.category === 'vocational' ? 'bg-amber-100 text-amber-900' :
                                prg.category === 'education' ? 'bg-blue-100 text-blue-900' :
                                'bg-purple-100 text-purple-900'
                              }`}>
                                {prg.category}
                              </span>
                              <h5 className="font-bold text-xs text-slate-900 mt-1">{prg.programName}</h5>
                              <div className="text-[11px] text-slate-500">Instructor: {prg.instructor}</div>
                              {prg.certifyingBody && (
                                <div className="text-[10px] text-slate-400 mt-0.5">Certifier: {prg.certifyingBody}</div>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-mono font-bold text-emerald-700">
                                {prg.dailyEarningRate > 0 ? `+$${prg.dailyEarningRate.toFixed(2)}/d` : 'Non-wage'}
                              </span>
                              <div className="mt-1">
                                {isCompleted ? (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                    Certified
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                                    In Training
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="mt-3">
                            <div className="flex justify-between text-[10px] text-slate-600 mb-1">
                              <span>Curriculum Mastery: <strong>{prg.progressPercent}%</strong></span>
                              <span className="font-mono">
                                {prg.attendanceHoursCompleted || Math.round((prg.progressPercent / 100) * (prg.totalCourseHours || 400))}h logged
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  isCompleted ? 'bg-emerald-600' : 'bg-[#714B67]'
                                }`}
                                style={{ width: `${prg.progressPercent}%` }}
                              />
                            </div>
                          </div>

                          {prg.certificateNumber && (
                            <div className="mt-2 text-[10px] font-mono text-amber-800 bg-amber-50/80 px-2 py-1 rounded border border-amber-200 flex items-center justify-between">
                              <span className="flex items-center gap-1 font-bold">
                                <Award className="w-3.5 h-3.5 text-amber-600" />
                                {prg.certificateNumber}
                              </span>
                              <span className="text-slate-600">{prg.gradeOrScore || 'Distinction'}</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setSelectedProgressEnrollment(prg)}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded flex items-center gap-1 transition-colors"
                          >
                            <TrendingUp className="w-3.5 h-3.5" />
                            Update Progress
                          </button>

                          {isCompleted ? (
                            <button
                              type="button"
                              onClick={() => setSelectedCertEnrollment(prg)}
                              className="px-2.5 py-1 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded flex items-center gap-1 transition-colors shadow-2xs"
                            >
                              <Award className="w-3.5 h-3.5" />
                              View Certificate
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectedProgressEnrollment(prg)}
                              className="text-[11px] text-[#714B67] hover:underline font-semibold"
                            >
                              Fast-track to Certify
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COURT DOCKET & ESCORT MANIFEST */}
          {activeTab === 'court' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Judicial Appearances & Production Warrants
                  </h3>
                  <p className="text-xs text-slate-500">
                    Court docket scheduling, video link setup, armed transit manifests and case workflow progression.
                  </p>
                </div>
              </div>

              {inmate.courtCases.length > 0 ? (
                <div className="space-y-3">
                  {inmate.courtCases.map(c => (
                    <div key={c.id} className="p-4 border border-slate-200 rounded-lg bg-white shadow-2xs">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                              {c.caseNumber}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              c.courtMode === 'virtual_video_link' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {c.courtMode === 'virtual_video_link' ? 'Virtual Video Link' : 'Physical Court Appearance'}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 mt-1">{c.courtName}</h4>
                          <div className="text-xs text-slate-600">Presiding: <strong>{c.judgeName}</strong></div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs font-bold text-[#714B67] flex items-center md:justify-end gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{c.hearingDate} at {c.hearingTime}</span>
                          </div>
                          <span className="inline-block mt-1 text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded capitalize">
                            {c.hearingType.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Escort & Transport Vehicle Detail */}
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 p-2.5 rounded">
                        <div>
                          <span className="text-slate-500">Assigned Escort Unit: </span>
                          <strong className="text-slate-800">{c.escortTeam}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500">Transport Van / Link: </span>
                          <strong className="text-slate-800">{c.transportVehicleNumber}</strong>
                        </div>
                      </div>

                      {c.outcomeNotes && (
                        <div className="mt-2 text-xs text-slate-700 bg-amber-50/70 border border-amber-200 p-2 rounded">
                          <strong>Judicial Outcome / Minute:</strong> {c.outcomeNotes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 bg-slate-50 border border-slate-200 rounded text-center text-xs text-slate-500">
                  <Gavel className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  No pending court hearings scheduled for this inmate.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: INTAKE, BIOMETRICS & SEALED PROPERTY */}
          {activeTab === 'intake' && (
            <div className="space-y-6">
              {/* Demographics & Admission details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="border border-slate-200 rounded-lg p-3 space-y-2">
                  <h4 className="font-bold text-slate-800 uppercase text-[11px] border-b border-slate-100 pb-1">
                    Booking & Physical Identity
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gender:</span>
                    <span className="font-medium capitalize">{inmate.gender}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date of Birth:</span>
                    <span className="font-mono font-medium">{inmate.dateOfBirth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Admission Type:</span>
                    <span className="font-semibold text-[#714B67] capitalize">{inmate.admissionType.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Biometric Enrollment:</span>
                    <button
                      onClick={() => setShowBiometricModal(true)}
                      className={`font-semibold flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                        inmate.biometrics?.lastVerificationStatus === 'verified'
                          ? 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                          : 'text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200'
                      }`}
                    >
                      {inmate.biometrics?.lastVerificationStatus === 'verified' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>10-Print & Facial Verified ({inmate.biometrics.lastVerificationConfidence || 99}%)</span>
                        </>
                      ) : (
                        <>
                          <ScanFace className="w-3 h-3 text-[#714B67]" />
                          <span>Pending Camera/AFIS Scan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                    <h4 className="font-bold text-slate-800 uppercase text-[11px]">
                      Emergency Contact & Medical Notes
                    </h4>
                    <button
                      onClick={() => setActiveTab('medical')}
                      className="text-[10px] text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1"
                    >
                      <Stethoscope className="w-3 h-3" />
                      <span>Open Medical Dossier →</span>
                    </button>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Contact Person:</span>
                    <span className="font-medium">{inmate.emergencyContact.name} ({inmate.emergencyContact.relationship})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone:</span>
                    <span className="font-mono font-medium">{inmate.emergencyContact.phone}</span>
                  </div>
                  <div className="pt-1">
                    <span className="text-slate-500 block text-[10px]">Medical / Dietary Prescriptions:</span>
                    <span className="text-slate-700 italic">{inmate.dietaryMedicalNotes || 'None recorded. General diet approved.'}</span>
                  </div>
                </div>
              </div>

              {/* Dedicated Biometric Intake & Identity Authentication Suite */}
              <div className="border border-slate-200 rounded-xl bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-4 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#714B67] text-white rounded-lg shadow-xs">
                      <ScanFace className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <span>Biometric Identity Verification & Authentication Station</span>
                        {inmate.biometrics?.lastVerificationStatus === 'verified' && (
                          <span className="px-2 py-0.2 text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                            CERTIFIED ACTIVE
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Requests optical webcam camera access for live facial recognition & simulated AFIS 10-print fingerprint matching.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowBiometricModal(true)}
                    className="px-3.5 py-2 text-xs font-bold text-white bg-[#714B67] hover:bg-[#5c3c54] active:scale-95 rounded-lg shadow-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <Camera className="w-4 h-4 text-amber-300" />
                    <span>Launch Biometric Verification</span>
                  </button>
                </div>

                {/* Status Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* Facial Recognition Module */}
                  <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5 text-cyan-600" />
                        <span>Facial Landmark Mesh</span>
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-500">ISO 19794-5</span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      {inmate.biometrics?.lastVerificationStatus === 'verified' ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Match Confirmed: {inmate.biometrics.facialMatchConfidence || 98.4}%
                        </span>
                      ) : (
                        <span className="text-slate-500">Optical camera stream calibration required</span>
                      )}
                    </div>
                  </div>

                  {/* Fingerprint / AFIS Module */}
                  <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        <Fingerprint className="w-3.5 h-3.5 text-purple-600" />
                        <span>AFIS 10-Print Minutiae</span>
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-500">500 DPI WSQ</span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      {inmate.biometrics?.lastVerificationStatus === 'verified' ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Minutiae Match: {inmate.biometrics.fingerprintMatchConfidence || 99.2}%
                        </span>
                      ) : (
                        <span className="text-slate-500">Platen sensor awaiting finger placement</span>
                      )}
                    </div>
                  </div>

                  {/* Custody Certification Digest */}
                  <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Legal Verification Status</span>
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-500">AUDIT</span>
                    </div>
                    <div className="text-[11px]">
                      {inmate.biometrics?.lastVerificationStatus === 'verified' ? (
                        <div className="text-slate-700 space-y-0.5">
                          <div className="font-semibold text-emerald-800">
                            Verified on {inmate.biometrics.lastVerificationDate?.slice(0, 10)}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            By {inmate.biometrics.verifiedByOfficer || 'Intake Officer'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-amber-700 font-medium">
                          Pending initial admission authentication
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sealed Personal Property Vault & Discharge Export */}
              <div className="pt-2">
                <PropertyVault 
                  inmate={inmate} 
                  onUpdateInmate={onUpdateInmate} 
                  language={language} 
                  showDischargeActions={true} 
                />
              </div>
            </div>
          )}

          {/* TAB 5: TRANSFERS, BAIL & ESCAPES */}
          {activeTab === 'transfers' && (
            <div className="space-y-6">
              {/* Escape & Recapture Incidents (if any) */}
              {inmate.escapeIncidents && inmate.escapeIncidents.length > 0 && (
                <div className="border border-rose-300 bg-rose-50/60 rounded-lg p-4">
                  <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    Escape & Recapture Protocol Incident Record
                  </h4>
                  {inmate.escapeIncidents.map(esc => (
                    <div key={esc.id} className="bg-white border border-rose-200 rounded p-3 text-xs space-y-1.5">
                      <div className="flex justify-between font-semibold text-slate-900">
                        <span>Incident Date: {esc.incidentDate}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          esc.status === 'AT_LARGE' ? 'bg-rose-600 text-white animate-pulse' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {esc.status}
                        </span>
                      </div>
                      <div><strong>Location:</strong> {esc.escapeLocation} ({esc.facilityName})</div>
                      <div><strong>Method of Escape:</strong> {esc.methodOfEscape}</div>
                      {esc.recaptureDate && (
                        <div className="text-emerald-700">
                          <strong>Recapture Details:</strong> {esc.recaptureDate} by {esc.recapturingAgency}
                        </div>
                      )}
                      {esc.disciplinaryActionNotes && (
                        <div className="text-slate-600 italic">
                          <strong>Tribunal Penalty:</strong> {esc.disciplinaryActionNotes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Inter-Prison Transfer Requisitions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Inter-Facility Transfers Matrix
                  </h4>
                  <button
                    onClick={() => onOpenTransferModal(inmate)}
                    className="text-xs font-semibold text-[#714B67] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Transfer Requisition
                  </button>
                </div>

                {inmate.transfers.length > 0 ? (
                  <div className="border border-slate-200 rounded overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">Date</th>
                          <th className="py-2 px-3">Origin Facility</th>
                          <th className="py-2 px-3">Destination Facility</th>
                          <th className="py-2 px-3">Reason</th>
                          <th className="py-2 px-3">Escort Level</th>
                          <th className="py-2 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {inmate.transfers.map(trf => (
                          <tr key={trf.id} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-mono text-slate-600">{trf.requisitionDate}</td>
                            <td className="py-2 px-3">{trf.fromFacilityName}</td>
                            <td className="py-2 px-3 font-medium text-slate-900">{trf.toFacilityName}</td>
                            <td className="py-2 px-3 capitalize">{trf.transferReason.replace(/_/g, ' ')}</td>
                            <td className="py-2 px-3 text-[10px] uppercase font-mono">{trf.escortLevel.replace(/_/g, ' ')}</td>
                            <td className="py-2 px-3">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
                                trf.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-100 text-amber-800 animate-pulse'
                              }`}>
                                {trf.status.replace(/_/g, ' ')}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded text-center text-xs text-slate-500">
                    No transfer history on record. Inmate remains at original admission facility.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: HUMAN RIGHTS & MANDELA RULES AUDITS */}
          {activeTab === 'human_rights' && (
            <div className="space-y-4">
              <div className="bg-cyan-50/60 border border-cyan-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-5 h-5 text-cyan-700" />
                  <h3 className="text-sm font-bold text-slate-900">
                    UN Standard Minimum Rules for the Treatment of Prisoners (Nelson Mandela Rules)
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white p-2.5 rounded border border-cyan-100">
                    <div className="text-slate-500 font-medium">Mandela Rule 23 (Outdoor Exercise):</div>
                    <div className="font-bold text-emerald-700 text-sm mt-0.5">Min. 1 Hour Daily Guaranteed</div>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-cyan-100">
                    <div className="text-slate-500 font-medium">Mandela Rule 43 (Solitary Confinement):</div>
                    <div className="font-bold text-rose-700 text-sm mt-0.5">Strict Cap: Max 15 Consecutive Days</div>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-cyan-100">
                    <div className="text-slate-500 font-medium">Rule 24 (Health-Care Services):</div>
                    <div className="font-bold text-blue-700 text-sm mt-0.5">Daily Clinical Review on Isolation</div>
                  </div>
                </div>
              </div>

              {/* Inspections Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Audit Type</th>
                      <th className="py-2 px-3">Daily Outdoor</th>
                      <th className="py-2 px-3">Solitary Days</th>
                      <th className="py-2 px-3">Compliance</th>
                      <th className="py-2 px-3">Auditor & Ombudsman Findings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inmate.humanRightsAudits.map(hra => (
                      <tr key={hra.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-mono text-slate-600">{hra.date}</td>
                        <td className="py-2 px-3 capitalize">{hra.inspectionType.replace(/_/g, ' ')}</td>
                        <td className="py-2 px-3 font-mono font-medium text-emerald-700">{hra.outdoorHoursPerDay} hrs/day</td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-800">
                          {hra.consecutiveSolitaryDays} / 15 d limit
                        </td>
                        <td className="py-2 px-3">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded capitalize ${
                            hra.complianceStatus === 'compliant' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {hra.complianceStatus}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-700">
                          <div><strong>{hra.auditorName}:</strong> {hra.recommendations}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: MEDICAL INTAKE, VACCINATIONS & ALLERGIES */}
          {activeTab === 'medical' && (
            <MedicalIntakeView
              inmate={inmate}
              language={language}
              currentUserRole={currentUserRole}
              onUpdateInmate={onUpdateInmate}
            />
          )}

          {/* TAB 8: INCIDENT & INTERVENTION CHRONOLOGICAL TIMELINE */}
          {activeTab === 'timeline' && (
            <IncidentTimelineView
              inmate={inmate}
              facilities={facilities}
              onUpdateInmate={onUpdateInmate}
              currentUserRole={currentUserRole}
            />
          )}

        </div>

        {/* Odoo Chatter Panel (`mail.thread`) */}
        <div className="border-t border-slate-200 bg-slate-50 p-6 select-text">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setChatterType('log_note')}
                  className={`text-xs font-semibold px-2.5 py-1 rounded transition-colors ${
                    chatterType === 'log_note'
                      ? 'bg-white text-[#714B67] shadow-2xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Log Note (Audit)
                </button>
                <button
                  onClick={() => setChatterType('activity')}
                  className={`text-xs font-semibold px-2.5 py-1 rounded transition-colors ${
                    chatterType === 'activity'
                      ? 'bg-white text-[#714B67] shadow-2xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Schedule Activity
                </button>
              </div>

              <div className="text-[11px] text-slate-500 font-medium">
                Odoo 19 Mail Thread & Activity Tracking
              </div>
            </div>

            {/* Note Input Box */}
            <form onSubmit={handleAddChatter} className="flex gap-2">
              <input
                type="text"
                value={newChatterNote}
                onChange={(e) => setNewChatterNote(e.target.value)}
                placeholder={chatterType === 'log_note' ? 'Log an official officer entry or disciplinary note...' : 'Schedule court escort, medical checkup or classification review...'}
                className="flex-1 text-xs px-3 py-2 bg-white border border-slate-300 rounded shadow-2xs focus:outline-hidden focus:border-[#714B67]"
              />
              <button
                type="submit"
                className="bg-[#714B67] hover:bg-[#5f3c54] text-white px-4 py-2 rounded text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post</span>
              </button>
            </form>

            {/* Timeline Notes */}
            <div className="space-y-3 pt-2">
              {inmate.chatterLogs.map((log) => (
                <div key={log.id} className="flex items-start space-x-3 text-xs bg-white p-3 rounded border border-slate-200 shadow-2xs">
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                    {log.author.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{log.author}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{log.date}</span>
                    </div>
                    <p className="text-slate-700 mt-1">{log.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* MODAL 1: ADJUST REMISSION DAYS */}
      {showRemissionModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-[#714B67]" />
              Record Disciplinary Remission Forfeiture
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter the number of remission days forfeited (negative) or restored for merit (positive) ordered by the Disciplinary Board.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Days to Adjust (e.g. -14 or +7)</label>
                <input
                  type="number"
                  value={remissionAdjustDays}
                  onChange={(e) => setRemissionAdjustDays(parseInt(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded p-2 text-sm font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason / Disciplinary Tribunal Findings</label>
                <textarea
                  value={remissionReason}
                  onChange={(e) => setRemissionReason(e.target.value)}
                  rows={3}
                  className="w-full border border-slate-300 rounded p-2 text-xs"
                  placeholder="e.g. Possession of illicit contraband, fight in workshop..."
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end space-x-2">
              <button
                onClick={() => setShowRemissionModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyRemissionAdjustment}
                className="px-3 py-1.5 text-xs font-semibold bg-[#714B67] hover:bg-[#5f3c54] text-white rounded shadow-2xs"
              >
                Apply Remission Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: LOG GRATUITY WAGE */}
      {showWageModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-emerald-600" />
              Credit Inmate Gratuity Wage
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Disburse labor earnings to the inmate's custodial savings ledger.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount ($ USD)</label>
                <input
                  type="number"
                  step="0.5"
                  value={wageAmount}
                  onChange={(e) => setWageAmount(parseFloat(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded p-2 text-sm font-mono font-bold text-emerald-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Production Trade / Description</label>
                <input
                  type="text"
                  value={wageProgram}
                  onChange={(e) => setWageProgram(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 text-xs"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end space-x-2">
              <button
                onClick={() => setShowWageModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleCreditWage}
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded shadow-2xs"
              >
                Credit to Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Viewer Modal */}
      {selectedCertEnrollment && (
        <CertificateModal
          isOpen={Boolean(selectedCertEnrollment)}
          onClose={() => setSelectedCertEnrollment(null)}
          inmate={inmate}
          enrollment={selectedCertEnrollment}
        />
      )}

      {/* Biometric Verification Modal (Camera & Fingerprint) */}
      <BiometricVerificationModal
        isOpen={showBiometricModal}
        onClose={() => setShowBiometricModal(false)}
        inmate={inmate}
        onUpdateInmate={onUpdateInmate}
        currentOfficerName={roleProfile.name || 'Biometrics Intake Officer'}
      />

      {/* Update Progress Modal */}
      {selectedProgressEnrollment && (
        <UpdateProgressModal
          isOpen={Boolean(selectedProgressEnrollment)}
          onClose={() => setSelectedProgressEnrollment(null)}
          inmate={inmate}
          enrollment={selectedProgressEnrollment}
          onSave={handleSaveProgramProgress}
          onOpenCertificate={(inm, enr) => {
            setSelectedCertEnrollment(enr);
          }}
        />
      )}

    </div>
  );
};
