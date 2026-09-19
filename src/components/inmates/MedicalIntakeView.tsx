import React, { useState } from 'react';
import { 
  Inmate, 
  MedicalIntakeRecord, 
  VaccinationRecord, 
  AllergyRecord, 
  Language, 
  UserRole,
  MedicalFlagSeverity 
} from '../../types';
import { deriveMedicalFlag, MEDICAL_FLAG_STYLES } from '../../utils/medicalFlagUtils';
import { 
  Stethoscope, 
  ShieldAlert, 
  Syringe, 
  AlertOctagon, 
  HeartPulse, 
  FileText, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Activity, 
  Calendar, 
  User, 
  Building2, 
  Lock, 
  ClipboardCheck, 
  Thermometer, 
  AlertTriangle,
  FileCheck,
  Pill,
  Edit3,
  Check,
  X
} from 'lucide-react';

interface MedicalIntakeViewProps {
  inmate: Inmate;
  language: Language;
  currentUserRole?: UserRole;
  onUpdateInmate: (updatedInmate: Inmate) => void;
}

export const MedicalIntakeView: React.FC<MedicalIntakeViewProps> = ({
  inmate,
  language,
  currentUserRole = 'superintendent',
  onUpdateInmate
}) => {
  const isFr = language === 'fr';

  // Default empty medical record if not present
  const defaultMedicalRecord: MedicalIntakeRecord = {
    id: `med-${inmate.id}`,
    screeningDate: inmate.admissionDate || new Date().toISOString().split('T')[0],
    screeningTime: '09:00 AM',
    examiningOfficer: 'Dr. Sarah Nduta, MD',
    medicalOfficerTitle: 'Senior Medical Officer',
    licenseNumber: 'KMPDC-REG-48920',
    facilityName: inmate.facilityName,
    fitnessForDetention: 'fit_normal_custody',
    vitals: {
      bloodPressureSystolic: 120,
      bloodPressureDiastolic: 80,
      heartRateBpm: 72,
      respiratoryRate: 16,
      bodyTemperatureC: 36.6,
      oxygenSaturationPercent: 99,
      weightKg: 72,
      heightCm: 175,
      bmi: 23.5
    },
    initialScreeningNotes: inmate.dietaryMedicalNotes 
      ? `Intake screening noted: ${inmate.dietaryMedicalNotes}`
      : 'Initial clinical screening completed upon reception into correctional facility. Normal examination, Nelson Mandela Rule 30 triage satisfied.',
    chronicConditions: [],
    mentalHealthScreening: {
      suicideRiskLevel: 'none',
      substanceWithdrawalRisk: false,
      priorPsychiatricHistory: false,
      observations: 'Stable, alert and oriented. No distress noted.'
    },
    communicableDiseaseScreening: {
      tbSymptomatic: false,
      tbChestXRayStatus: 'clear',
      covidStatus: 'vaccinated',
      hepatitisScreened: true,
      isolationRecommended: false
    },
    vaccinations: [
      {
        id: `vax-init-${Date.now()}`,
        vaccineName: 'Tetanus Toxoid (TT Booster)',
        dateAdministered: inmate.admissionDate || new Date().toISOString().split('T')[0],
        doseNumber: 1,
        batchLotNumber: 'TT-ADM-881',
        administeredBy: 'Staff Nurse on Duty',
        clinicFacility: `${inmate.facilityName} Health Post`,
        status: 'completed',
        notes: 'Administered at intake'
      }
    ],
    allergies: inmate.dietaryMedicalNotes?.toLowerCase().includes('asthma') ? [
      {
        id: `alg-init-${Date.now()}`,
        allergen: 'NSAIDs (Aspirin/Ibuprofen)',
        type: 'drug',
        severity: 'moderate',
        reaction: 'Bronchospasm trigger',
        diagnosedDate: '2022-01-10',
        recordedBy: 'Clinical Officer',
        emergencyAction: 'Avoid NSAIDs, use Paracetamol'
      }
    ] : [],
    currentMedications: [],
    dietaryMedicalRecommendation: inmate.dietaryMedicalNotes || 'Standard balanced correctional diet.',
    doctorSignOff: true,
    doctorSignedAt: `${inmate.admissionDate} 10:30`
  };

  const medicalData: MedicalIntakeRecord = inmate.medicalIntake || defaultMedicalRecord;

  // Modals / forms states for adding vaccination and allergy
  const [showAddVaccineModal, setShowAddVaccineModal] = useState(false);
  const [newVaccineName, setNewVaccineName] = useState('Hepatitis B Vaccine');
  const [newVaccineDate, setNewVaccineDate] = useState(new Date().toISOString().split('T')[0]);
  const [newVaccineDose, setNewVaccineDose] = useState(1);
  const [newVaccineBatch, setNewVaccineBatch] = useState('LOT-VAC-2026-');
  const [newVaccineProvider, setNewVaccineProvider] = useState('Nurse Officer On Duty');
  const [newVaccineStatus, setNewVaccineStatus] = useState<'completed' | 'scheduled' | 'refused'>('completed');
  const [newVaccineNotes, setNewVaccineNotes] = useState('');

  const [showAddAllergyModal, setShowAddAllergyModal] = useState(false);
  const [newAllergen, setNewAllergen] = useState('');
  const [newAllergyType, setNewAllergyType] = useState<'drug' | 'food' | 'environmental' | 'other'>('drug');
  const [newAllergySeverity, setNewAllergySeverity] = useState<'mild' | 'moderate' | 'severe' | 'anaphylactic'>('severe');
  const [newAllergyReaction, setNewAllergyReaction] = useState('');
  const [newAllergyAction, setNewAllergyAction] = useState('');

  // Editing initial screening notes
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(medicalData.initialScreeningNotes);
  const [fitnessDraft, setFitnessDraft] = useState(medicalData.fitnessForDetention);

  // Derived medical flag
  const derivedFlag = deriveMedicalFlag(inmate);

  // Editing medical flag and chronic conditions
  const [isEditingFlag, setIsEditingFlag] = useState(false);
  const [flagSeverityDraft, setFlagSeverityDraft] = useState<MedicalFlagSeverity>(
    medicalData.medicalFlagSeverity || derivedFlag.severity
  );
  const [flaggedConditionDraft, setFlaggedConditionDraft] = useState(
    medicalData.flaggedCondition || derivedFlag.conditionName
  );
  const [specialistSpecialtyDraft, setSpecialistSpecialtyDraft] = useState(
    medicalData.specialistReferralSpecialty || derivedFlag.specialistSpecialty || ''
  );
  const [chronicConditionsDraft, setChronicConditionsDraft] = useState<string[]>(
    medicalData.chronicConditions || []
  );
  const [newChronicInput, setNewChronicInput] = useState('');

  // Permission check: medical officers and superintendents have write permissions
  const canEditMedical = currentUserRole === 'medical_officer' || currentUserRole === 'superintendent';

  // Handler: Save Medical Flag & Chronic Conditions
  const handleSaveMedicalFlag = () => {
    const updatedRecord: MedicalIntakeRecord = {
      ...medicalData,
      medicalFlagSeverity: flagSeverityDraft,
      flaggedCondition: flaggedConditionDraft.trim(),
      specialistReferralSpecialty: specialistSpecialtyDraft.trim() || undefined,
      chronicConditions: chronicConditionsDraft
    };
    saveMedicalRecord(
      updatedRecord,
      `Medical Flag & Clinical Triage updated: Severity set to "${flagSeverityDraft.toUpperCase()}" (${flaggedConditionDraft}).`
    );
    setIsEditingFlag(false);
  };

  // Handler: Add Chronic Condition
  const handleAddChronicCondition = () => {
    if (!newChronicInput.trim()) return;
    setChronicConditionsDraft(prev => [...prev, newChronicInput.trim()]);
    setNewChronicInput('');
  };

  // Handler: Remove Chronic Condition
  const handleRemoveChronicCondition = (index: number) => {
    setChronicConditionsDraft(prev => prev.filter((_, i) => i !== index));
  };

  // Save updated medical intake
  const saveMedicalRecord = (updatedRecord: MedicalIntakeRecord, logMsg: string) => {
    const updatedInmate: Inmate = {
      ...inmate,
      medicalIntake: updatedRecord,
      chatterLogs: [
        {
          id: `ch-${Date.now()}`,
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          author: currentUserRole === 'medical_officer' ? 'Medical Officer of Health' : 'Correctional Superintendent',
          message: logMsg,
          type: 'log_note'
        },
        ...inmate.chatterLogs
      ]
    };
    onUpdateInmate(updatedInmate);
  };

  // Add vaccination handler
  const handleAddVaccination = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVaccineName.trim()) return;

    const newVac: VaccinationRecord = {
      id: `vax-${Date.now()}`,
      vaccineName: newVaccineName.trim(),
      dateAdministered: newVaccineDate,
      doseNumber: Number(newVaccineDose),
      batchLotNumber: newVaccineBatch.trim() || 'LOT-UNSPECIFIED',
      administeredBy: newVaccineProvider.trim() || 'Correctional Medical Officer',
      clinicFacility: medicalData.facilityName,
      status: newVaccineStatus,
      notes: newVaccineNotes.trim() || undefined
    };

    const updatedRecord: MedicalIntakeRecord = {
      ...medicalData,
      vaccinations: [newVac, ...medicalData.vaccinations]
    };

    saveMedicalRecord(
      updatedRecord,
      `Clinical Record Updated: Administered ${newVaccineName} (Dose ${newVaccineDose}) to inmate.`
    );

    setShowAddVaccineModal(false);
    setNewVaccineName('Hepatitis B Vaccine');
    setNewVaccineBatch('LOT-VAC-2026-');
    setNewVaccineNotes('');
  };

  // Remove vaccination
  const handleRemoveVaccination = (vacId: string) => {
    if (!canEditMedical) return;
    const toRemove = medicalData.vaccinations.find(v => v.id === vacId);
    const updatedRecord: MedicalIntakeRecord = {
      ...medicalData,
      vaccinations: medicalData.vaccinations.filter(v => v.id !== vacId)
    };
    saveMedicalRecord(
      updatedRecord,
      `Vaccination entry removed: ${toRemove?.vaccineName || 'Record'}`
    );
  };

  // Add allergy handler
  const handleAddAllergy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAllergen.trim()) return;

    const newAlg: AllergyRecord = {
      id: `alg-${Date.now()}`,
      allergen: newAllergen.trim(),
      type: newAllergyType,
      severity: newAllergySeverity,
      reaction: newAllergyReaction.trim() || 'Allergic sensitization reaction',
      diagnosedDate: new Date().toISOString().split('T')[0],
      recordedBy: currentUserRole === 'medical_officer' ? 'Attending Medical Officer' : 'Correctional Staff',
      emergencyAction: newAllergyAction.trim() || undefined
    };

    const updatedRecord: MedicalIntakeRecord = {
      ...medicalData,
      allergies: [newAlg, ...medicalData.allergies]
    };

    saveMedicalRecord(
      updatedRecord,
      `CRITICAL MEDICAL ALLERGY FLAGGED: Added ${newAllergen} (${newAllergySeverity.toUpperCase()}) to inmate clinical file.`
    );

    setShowAddAllergyModal(false);
    setNewAllergen('');
    setNewAllergyReaction('');
    setNewAllergyAction('');
  };

  // Remove allergy
  const handleRemoveAllergy = (algId: string) => {
    if (!canEditMedical) return;
    const toRemove = medicalData.allergies.find(a => a.id === algId);
    const updatedRecord: MedicalIntakeRecord = {
      ...medicalData,
      allergies: medicalData.allergies.filter(a => a.id !== algId)
    };
    saveMedicalRecord(
      updatedRecord,
      `Allergy removed from medical file: ${toRemove?.allergen || 'Record'}`
    );
  };

  // Save notes draft
  const handleSaveNotes = () => {
    const updatedRecord: MedicalIntakeRecord = {
      ...medicalData,
      initialScreeningNotes: notesDraft,
      fitnessForDetention: fitnessDraft
    };
    saveMedicalRecord(
      updatedRecord,
      `Initial health screening examination notes updated by medical staff.`
    );
    setIsEditingNotes(false);
  };

  const getFitnessBadge = (fitness: MedicalIntakeRecord['fitnessForDetention']) => {
    switch (fitness) {
      case 'fit_normal_custody':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {isFr ? 'Apte - Détention Normale' : 'Fit for Normal Custody'}
          </span>
        );
      case 'fit_with_restrictions':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            {isFr ? 'Apte avec Restrictions Cliniques' : 'Fit with Clinical Restrictions'}
          </span>
        );
      case 'unfit_requires_hospitalization':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
            {isFr ? 'Inapte - Hospitalisation Immédiate' : 'Unfit - Immediate Hospitalization'}
          </span>
        );
      case 'quarantine_required':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
            <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
            {isFr ? 'Isolement Sanitaire Obligatoire' : 'Quarantine / Isolation Required'}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner: Clinical Intake & Mandela Rule 30 Protocol */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white rounded-xl p-5 shadow-sm border border-teal-800/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center shrink-0">
              <Stethoscope className="w-6 h-6 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold tracking-tight">
                  {isFr ? 'Examen Médical d\'Entrée & Dossier Clinique' : 'Intake Medical Screening & Clinical History'}
                </h3>
                <span className="text-[10px] font-mono font-bold bg-teal-400/20 text-teal-300 px-2 py-0.5 rounded border border-teal-300/30">
                  Odoo Model: medical.intake
                </span>
                <span className="text-[10px] bg-white/10 text-white/90 px-2 py-0.5 rounded font-medium">
                  Nelson Mandela Rule 30 & 31
                </span>
              </div>
              <p className="text-xs text-teal-100/80 mt-1 max-w-3xl leading-relaxed">
                {isFr 
                  ? 'Évaluation médicale obligatoire dans les 24 heures suivant l\'admission pénitentiaire. Dépistage des pathologies transmissibles, allergies médicamenteuses, vaccinations et aptitude physique à la détention.'
                  : 'Mandatory clinical evaluation performed within 24 hours of reception. Enforces contagious disease screening, drug/food allergy tracking, immunization prophylaxis, and fitness for custody.'}
              </p>
            </div>
          </div>

          <div className="flex flex-row lg:flex-col items-end justify-between lg:justify-center gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-white/10">
            <div className="text-right">
              <div className="text-[10px] text-teal-200/70 uppercase tracking-wider font-semibold">
                {isFr ? 'Statut d\'Aptitude' : 'Custody Fitness'}
              </div>
              <div className="mt-1">
                {getFitnessBadge(medicalData.fitnessForDetention)}
              </div>
            </div>
            <div className="text-right text-[11px] text-teal-200/80 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-300" />
              <span>{medicalData.screeningDate} at {medicalData.screeningTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Role Notice if Restricted */}
      {!canEditMedical && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {isFr
                ? 'Mode consultation seule : Connectez-vous avec le rôle Médecin (Medical Officer) ou Directeur pour prescrire des vaccins ou modifier les allergies.'
                : 'Read-only clinical view: Switch role to Medical Officer or Superintendent to add vaccination records, flag allergies, or amend screening notes.'}
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold bg-amber-200/60 text-amber-900 px-2 py-0.5 rounded">
            ir.rule: group_prison_medical
          </span>
        </div>
      )}

      {/* 2. Key Clinical Vital Signs & Biometrics Grid */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3.5">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-rose-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              {isFr ? 'Constantes Vitales & Triage d\'Accueil' : 'Intake Vital Signs & Triage Metrics'}
            </h4>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>{isFr ? 'Examinateur' : 'Examiner'}: <strong>{medicalData.examiningOfficer}</strong> ({medicalData.licenseNumber})</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 text-center">
            <span className="text-[10px] font-semibold text-slate-500 uppercase block">{isFr ? 'Tension (BP)' : 'Blood Pressure'}</span>
            <div className="text-sm font-mono font-bold text-slate-900 mt-1">
              {medicalData.vitals.bloodPressureSystolic}/{medicalData.vitals.bloodPressureDiastolic}
            </div>
            <span className="text-[9px] text-slate-400">mmHg</span>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 text-center">
            <span className="text-[10px] font-semibold text-slate-500 uppercase block">{isFr ? 'Fréquence Card.' : 'Heart Rate'}</span>
            <div className="text-sm font-mono font-bold text-slate-900 mt-1">
              {medicalData.vitals.heartRateBpm}
            </div>
            <span className="text-[9px] text-slate-400">bpm</span>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 text-center">
            <span className="text-[10px] font-semibold text-slate-500 uppercase block">{isFr ? 'Température' : 'Temp'}</span>
            <div className="text-sm font-mono font-bold text-slate-900 mt-1">
              {medicalData.vitals.bodyTemperatureC}°C
            </div>
            <span className="text-[9px] text-slate-400">tympanic</span>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 text-center">
            <span className="text-[10px] font-semibold text-slate-500 uppercase block">{isFr ? 'Saturation O₂' : 'SpO2'}</span>
            <div className="text-sm font-mono font-bold text-emerald-700 mt-1">
              {medicalData.vitals.oxygenSaturationPercent}%
            </div>
            <span className="text-[9px] text-slate-400">room air</span>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 text-center">
            <span className="text-[10px] font-semibold text-slate-500 uppercase block">{isFr ? 'Fréq. Resp.' : 'Resp Rate'}</span>
            <div className="text-sm font-mono font-bold text-slate-900 mt-1">
              {medicalData.vitals.respiratoryRate}
            </div>
            <span className="text-[9px] text-slate-400">breaths/min</span>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 text-center">
            <span className="text-[10px] font-semibold text-slate-500 uppercase block">{isFr ? 'Poids' : 'Weight'}</span>
            <div className="text-sm font-mono font-bold text-slate-900 mt-1">
              {medicalData.vitals.weightKg}
            </div>
            <span className="text-[9px] text-slate-400">kg</span>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 text-center">
            <span className="text-[10px] font-semibold text-slate-500 uppercase block">{isFr ? 'Taille' : 'Height'}</span>
            <div className="text-sm font-mono font-bold text-slate-900 mt-1">
              {medicalData.vitals.heightCm}
            </div>
            <span className="text-[9px] text-slate-400">cm</span>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 text-center">
            <span className="text-[10px] font-semibold text-slate-500 uppercase block">BMI</span>
            <div className="text-sm font-mono font-bold text-slate-900 mt-1">
              {medicalData.vitals.bmi}
            </div>
            <span className="text-[9px] text-emerald-600 font-medium">normal</span>
          </div>
        </div>
      </div>

      {/* 2.5 Dynamic Medical Flag & Chronic Pathology Assessment Panel */}
      <div className={`rounded-xl border p-5 shadow-2xs transition-all ${
        derivedFlag.severity === 'critical' ? 'bg-rose-50/40 border-rose-200' :
        derivedFlag.severity === 'needs_specialist' ? 'bg-amber-50/40 border-amber-200' :
        derivedFlag.severity === 'chronic' ? 'bg-sky-50/40 border-sky-200' :
        'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-3 mb-4 border-current/10">
          <div className="flex items-center gap-2.5">
            <span className={`p-2 rounded-lg text-white shrink-0 ${
              derivedFlag.severity === 'critical' ? 'bg-rose-600 animate-pulse' :
              derivedFlag.severity === 'needs_specialist' ? 'bg-amber-600' :
              derivedFlag.severity === 'chronic' ? 'bg-sky-600' :
              'bg-emerald-600'
            }`}>
              <Activity className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-slate-900">
                  {isFr ? 'Drapeau Médical & Pathologies Chroniques' : 'Medical Flag & Chronic Health Conditions'}
                </h4>
                <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-1.5 py-0.5 rounded border border-slate-200">
                  Syncs to Inmate List Flag
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {isFr 
                  ? 'Niveau de gravité clinique déterminé pour les alertes de détention et le triage pénitentiaire'
                  : 'Derived severity rating drives operational badges and medical alerts across facility rosters'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canEditMedical && !isEditingFlag && (
              <button
                type="button"
                onClick={() => {
                  setFlagSeverityDraft(medicalData.medicalFlagSeverity || derivedFlag.severity);
                  setFlaggedConditionDraft(medicalData.flaggedCondition || derivedFlag.conditionName);
                  setSpecialistSpecialtyDraft(medicalData.specialistReferralSpecialty || derivedFlag.specialistSpecialty || '');
                  setChronicConditionsDraft(medicalData.chronicConditions || []);
                  setIsEditingFlag(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>{isFr ? 'Modifier Drapeau Médical' : 'Edit Medical Flag & Conditions'}</span>
              </button>
            )}
          </div>
        </div>

        {/* View Mode */}
        {!isEditingFlag ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Primary Severity Badge Box */}
            <div className="bg-white rounded-lg p-3.5 border border-slate-200/80 shadow-2xs space-y-2">
              <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider block">
                Assigned Clinical Severity
              </span>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold border shadow-2xs ${
                  MEDICAL_FLAG_STYLES[derivedFlag.severity].badge
                }`}>
                  <span className={`w-2 h-2 rounded-full ${MEDICAL_FLAG_STYLES[derivedFlag.severity].dot} ${
                    derivedFlag.severity === 'critical' ? 'animate-ping' : ''
                  }`}></span>
                  <span>{derivedFlag.label}</span>
                </span>
              </div>
              <div className="text-[11px] text-slate-600 leading-snug pt-1">
                {derivedFlag.severity === 'critical' && 'Requires immediate tertiary referral, constant monitoring, or acute inpatient care.'}
                {derivedFlag.severity === 'needs_specialist' && 'Requires external consultant appointment or specialist diagnostic evaluation.'}
                {derivedFlag.severity === 'chronic' && 'Requires daily maintenance pharmacotherapy and routine dispensary follow-up.'}
                {derivedFlag.severity === 'stable' && 'Cleared for standard correctional custody without restrictions.'}
              </div>
            </div>

            {/* Flagged Condition Details */}
            <div className="bg-white rounded-lg p-3.5 border border-slate-200/80 shadow-2xs space-y-2">
              <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider block">
                Flagged Health Condition
              </span>
              <div className="font-bold text-slate-900 text-xs">
                {derivedFlag.conditionName}
              </div>
              {derivedFlag.specialistSpecialty && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[11px] font-semibold border border-amber-200">
                  <Stethoscope className="w-3 h-3 text-amber-700" />
                  <span>Specialist: {derivedFlag.specialistSpecialty}</span>
                </div>
              )}
              {derivedFlag.requiresHospitalization && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[11px] font-bold border border-rose-200">
                  <AlertOctagon className="w-3 h-3 text-rose-700" />
                  <span>Inpatient Hospitalization Warranted</span>
                </div>
              )}
            </div>

            {/* Chronic Conditions List */}
            <div className="bg-white rounded-lg p-3.5 border border-slate-200/80 shadow-2xs space-y-2">
              <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider block">
                Diagnosed Chronic Conditions ({medicalData.chronicConditions?.length || 0})
              </span>
              {medicalData.chronicConditions && medicalData.chronicConditions.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {medicalData.chronicConditions.map((cond, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-0.5 bg-slate-100 text-slate-800 border border-slate-200 rounded text-[11px] font-medium"
                    >
                      {cond}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-slate-400 italic text-[11px]">
                  No chronic illnesses recorded on intake.
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Edit Mode for Medical Officer / Superintendent */
          <div className="bg-white rounded-lg p-4 border border-slate-200 space-y-4 shadow-sm animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b pb-2">
              <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Update Medical Flag & Pathology Profile
              </h5>
              <span className="text-[11px] text-slate-500">
                All changes immediately propagate to the inmate registry table.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Severity Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Medical Flag Severity Level:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['critical', 'needs_specialist', 'chronic', 'stable'] as MedicalFlagSeverity[]).map((sev) => {
                    const sevStyle = MEDICAL_FLAG_STYLES[sev];
                    const isSelected = flagSeverityDraft === sev;
                    return (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => setFlagSeverityDraft(sev)}
                        className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all ${
                          isSelected 
                            ? `${sevStyle.badge} ring-2 ring-slate-800 font-bold`
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${sevStyle.dot} shrink-0`} />
                        <span className="text-xs capitalize">{sev.replace('_', ' ')}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Primary Condition Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Primary Flagged Health Condition / Diagnosis:
                </label>
                <input
                  type="text"
                  value={flaggedConditionDraft}
                  onChange={(e) => setFlaggedConditionDraft(e.target.value)}
                  placeholder="e.g. End-Stage Renal Disease (Stage 5 CKD)"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />

                <label className="block text-xs font-semibold text-slate-700 mt-2.5 mb-1">
                  Specialist Referral Specialty (if applicable):
                </label>
                <input
                  type="text"
                  value={specialistSpecialtyDraft}
                  onChange={(e) => setSpecialistSpecialtyDraft(e.target.value)}
                  placeholder="e.g. Nephrology / Dialysis Unit, Psychiatry, Pulmonology"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Chronic Conditions Multi-Tag Manager */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Chronic Pathologies & ICD-10 Diagnosis Codes:
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newChronicInput}
                  onChange={(e) => setNewChronicInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddChronicCondition();
                    }
                  }}
                  placeholder="Type condition (e.g. ICD-10 I10 Essential Hypertension) and press Enter"
                  className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddChronicCondition}
                  className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-700"
                >
                  Add
                </button>
              </div>

              {/* Tag Suggestions */}
              <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                <span className="text-[10px] text-slate-400">Quick Insert:</span>
                {[
                  'ICD-10 J45.40 Bronchial Asthma',
                  'ICD-10 I10 Essential Hypertension',
                  'ICD-10 E11 Type 2 Diabetes Mellitus',
                  'ICD-10 N18.5 End-Stage Renal Disease',
                  'ICD-10 K25 Peptic Ulcer Disease'
                ].map((sugg) => (
                  <button
                    key={sugg}
                    type="button"
                    onClick={() => {
                      if (!chronicConditionsDraft.includes(sugg)) {
                        setChronicConditionsDraft(prev => [...prev, sugg]);
                      }
                    }}
                    className="text-[10px] bg-slate-100 hover:bg-teal-50 hover:text-teal-800 hover:border-teal-300 px-2 py-0.5 rounded border border-slate-200 transition-colors"
                  >
                    + {sugg.split(' ')[1]} {sugg.split(' ')[2]}
                  </button>
                ))}
              </div>

              {/* Existing Tags */}
              <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-slate-50 rounded-lg border border-slate-200">
                {chronicConditionsDraft.length === 0 ? (
                  <span className="text-slate-400 text-xs italic">No chronic conditions added yet.</span>
                ) : (
                  chronicConditionsDraft.map((c, i) => (
                    <span 
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-300 rounded-md text-xs font-medium text-slate-800 shadow-2xs"
                    >
                      <span>{c}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveChronicCondition(i)}
                        className="text-slate-400 hover:text-rose-600 ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setIsEditingFlag(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMedicalFlag}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Medical Flag & Synchronize</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Two-Column Focus: (A) Allergies & Medical Contraindications + (B) Vaccination History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SECTION A: ALLERGIES & CONTRAINDICATIONS */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-rose-600" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {isFr ? 'Allergies & Contre-Indications' : 'Allergies & Contraindications'}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {isFr ? 'Pharmacovigilance et alertes alimentaires cuisine' : 'Pharmacovigilance, drug warnings & kitchen dietary flags'}
                  </p>
                </div>
              </div>

              {canEditMedical && (
                <button
                  onClick={() => setShowAddAllergyModal(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isFr ? 'Ajouter Allergie' : 'Add Allergy'}</span>
                </button>
              )}
            </div>

            {medicalData.allergies.length > 0 ? (
              <div className="space-y-3">
                {medicalData.allergies.map(alg => (
                  <div 
                    key={alg.id}
                    className={`p-3.5 rounded-lg border text-xs transition-all ${
                      alg.severity === 'anaphylactic' || alg.severity === 'severe'
                        ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                        : alg.severity === 'moderate'
                        ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-900">{alg.allergen}</span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            alg.severity === 'anaphylactic' || alg.severity === 'severe'
                              ? 'bg-rose-200 text-rose-800 font-mono'
                              : 'bg-amber-200 text-amber-800'
                          }`}>
                            {alg.severity}
                          </span>
                          <span className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600 capitalize">
                            {alg.type} {isFr ? 'allergie' : 'allergy'}
                          </span>
                        </div>
                        <div className="mt-1.5 text-xs text-slate-700">
                          <strong>{isFr ? 'Réaction clinique' : 'Clinical Reaction'}:</strong> {alg.reaction}
                        </div>
                        {alg.emergencyAction && (
                          <div className="mt-1.5 text-[11px] font-medium text-rose-900 bg-white/80 border border-rose-200/70 p-2 rounded">
                            <span className="font-bold text-rose-700 uppercase tracking-wide mr-1">
                              {isFr ? 'Protocole Urgence' : 'Emergency Action'}:
                            </span>
                            {alg.emergencyAction}
                          </div>
                        )}
                        <div className="mt-2 text-[10px] text-slate-500">
                          {isFr ? 'Enregistré par' : 'Documented by'}: {alg.recordedBy} {alg.diagnosedDate && `(${alg.diagnosedDate})`}
                        </div>
                      </div>

                      {canEditMedical && (
                        <button
                          onClick={() => handleRemoveAllergy(alg.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Remove allergy"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5 opacity-80" />
                <p className="text-xs font-semibold text-slate-700">
                  {isFr ? 'Aucune allergie connue répertoriée (NKA)' : 'No Known Allergies (NKA) Documented'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isFr ? 'Détenu sans intolérance médicamenteuse ou alimentaire signalée.' : 'Inmate screened negative for severe drug, food, or environmental hypersensitivity.'}
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{isFr ? 'Synchronisation cuisine & dispensaire' : 'Syncs with kitchen diet sheet & clinic dispensary'}</span>
            <span className="font-bold text-slate-700">{medicalData.allergies.length} {isFr ? 'enregistrements' : 'active records'}</span>
          </div>
        </div>

        {/* SECTION B: VACCINATION & IMMUNIZATION HISTORY */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Syringe className="w-5 h-5 text-teal-600" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {isFr ? 'Historique des Vaccinations' : 'Vaccination & Immunization History'}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {isFr ? 'Calendrier vaccinal pénitentiaire et rappels' : 'Correctional immunization schedule, boosters & batch tracking'}
                  </p>
                </div>
              </div>

              {canEditMedical && (
                <button
                  onClick={() => setShowAddVaccineModal(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isFr ? 'Ajouter Vaccin' : 'Add Vaccination'}</span>
                </button>
              )}
            </div>

            {medicalData.vaccinations.length > 0 ? (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                {medicalData.vaccinations.map(vac => (
                  <div key={vac.id} className="p-3.5 hover:bg-slate-50/80 transition-colors flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">{vac.vaccineName}</span>
                        <span className="text-[10px] font-mono bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded font-bold">
                          Dose {vac.doseNumber}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                          vac.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : vac.status === 'scheduled'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {vac.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-slate-600 text-[11px] flex-wrap">
                        <span className="flex items-center gap-1 font-mono text-slate-700">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {vac.dateAdministered}
                        </span>
                        <span>•</span>
                        <span>Lot: <strong className="font-mono text-slate-800">{vac.batchLotNumber}</strong></span>
                        <span>•</span>
                        <span>{isFr ? 'Par' : 'By'}: {vac.administeredBy}</span>
                      </div>

                      {vac.notes && (
                        <p className="text-[11px] text-slate-500 italic mt-0.5">
                          "{vac.notes}"
                        </p>
                      )}
                    </div>

                    {canEditMedical && (
                      <button
                        onClick={() => handleRemoveVaccination(vac.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors shrink-0"
                        title="Delete vaccination"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <Syringe className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-slate-700">
                  {isFr ? 'Aucun vaccin enregistré' : 'No Vaccinations Recorded'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isFr ? 'Veuillez saisir les vaccins administrés lors de l\'admission.' : 'Administer standard intake Tetanus Toxoid and Hepatitis B per institutional protocol.'}
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{isFr ? 'Protocole National de Santé Pénitentiaire' : 'Correctional Prophylaxis & Immunization Protocol'}</span>
            <span className="font-bold text-slate-700">{medicalData.vaccinations.length} {isFr ? 'doses administrées' : 'doses tracked'}</span>
          </div>
        </div>

      </div>

      {/* 4. Initial Health Screening Notes & Medical Sign-Off */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              {isFr ? 'Notes d\'Examen Clinique Initial & Observations Médicales' : 'Initial Health Screening Notes & Physician Observations'}
            </h4>
          </div>

          {canEditMedical && !isEditingNotes && (
            <button
              onClick={() => {
                setNotesDraft(medicalData.initialScreeningNotes);
                setFitnessDraft(medicalData.fitnessForDetention);
                setIsEditingNotes(true);
              }}
              className="text-xs text-[#714B67] hover:text-[#5e3c55] font-semibold flex items-center gap-1"
            >
              <span>{isFr ? 'Modifier Notes' : 'Edit Screening Notes'}</span>
            </button>
          )}
        </div>

        {isEditingNotes ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isFr ? 'Aptitude à la Détention (Fitness for Custody)' : 'Fitness for Detention Assessment'}
              </label>
              <select
                value={fitnessDraft}
                onChange={e => setFitnessDraft(e.target.value as any)}
                className="w-full sm:w-80 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-purple-600"
              >
                <option value="fit_normal_custody">Fit for Normal Custody</option>
                <option value="fit_with_restrictions">Fit with Clinical Restrictions</option>
                <option value="unfit_requires_hospitalization">Unfit - Requires Hospitalization</option>
                <option value="quarantine_required">Quarantine / Isolation Required</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isFr ? 'Observations Médicales Détaillées' : 'Detailed Clinical Observations & Examination Notes'}
              </label>
              <textarea
                rows={5}
                value={notesDraft}
                onChange={e => setNotesDraft(e.target.value)}
                className="w-full p-3 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-purple-600 font-sans"
                placeholder="Document physical exam, HEENT, cardiovascular, respiratory, trauma check, psychological evaluation..."
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditingNotes(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
              >
                {isFr ? 'Annuler' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSaveNotes}
                className="px-4 py-1.5 text-xs bg-[#714B67] text-white rounded-lg font-bold hover:bg-[#5e3c55] shadow-xs"
              >
                {isFr ? 'Enregistrer Observations' : 'Save Observations'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-4 text-xs text-slate-800 leading-relaxed whitespace-pre-line font-sans">
              {medicalData.initialScreeningNotes}
            </div>

            {/* Communicable Disease & Mental Health Screening Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-blue-50/50 border border-blue-200/80 rounded-lg space-y-1.5">
                <div className="font-bold text-blue-950 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-blue-700" />
                  <span>{isFr ? 'Dépistage Maladies Transmissibles' : 'Communicable Disease Protocol'}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-700">
                  <span>{isFr ? 'Tuberculose (TB) Symptomatique' : 'TB Symptomatic'}:</span>
                  <strong className={medicalData.communicableDiseaseScreening.tbSymptomatic ? 'text-rose-600' : 'text-emerald-700'}>
                    {medicalData.communicableDiseaseScreening.tbSymptomatic ? 'Positive Flag' : 'Negative / Asymptomatic'}
                  </strong>
                </div>
                <div className="flex justify-between text-[11px] text-slate-700">
                  <span>{isFr ? 'Radiographie Thoracique' : 'Chest X-Ray Status'}:</span>
                  <strong className="capitalize text-slate-800">{medicalData.communicableDiseaseScreening.tbChestXRayStatus}</strong>
                </div>
                <div className="flex justify-between text-[11px] text-slate-700">
                  <span>COVID-19 Status:</span>
                  <strong className="capitalize text-slate-800">{medicalData.communicableDiseaseScreening.covidStatus}</strong>
                </div>
              </div>

              <div className="p-3 bg-purple-50/50 border border-purple-200/80 rounded-lg space-y-1.5">
                <div className="font-bold text-purple-950 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-purple-700" />
                  <span>{isFr ? 'Évaluation Psycho-Sociale & Suicidaire' : 'Mental Health & Suicide Risk Triage'}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-700">
                  <span>{isFr ? 'Niveau de Risque Suicidaire' : 'Suicide Risk Level'}:</span>
                  <span className={`font-bold px-2 py-0.2 rounded text-[10px] uppercase ${
                    medicalData.mentalHealthScreening.suicideRiskLevel === 'none' 
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {medicalData.mentalHealthScreening.suicideRiskLevel}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-700">
                  <span>{isFr ? 'Risque Sevrage Toxique' : 'Substance Withdrawal Risk'}:</span>
                  <strong>{medicalData.mentalHealthScreening.substanceWithdrawalRisk ? 'Yes - Monitor' : 'None Detected'}</strong>
                </div>
                <div className="text-[10px] text-slate-600 italic">
                  "{medicalData.mentalHealthScreening.observations}"
                </div>
              </div>
            </div>

            {/* Official Physician Sign-Off & Seal */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>
                  {isFr ? 'Examen validé et signé par' : 'Screening certified & signed by'}:{' '}
                  <strong className="text-slate-900">{medicalData.examiningOfficer}</strong> ({medicalData.medicalOfficerTitle})
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
                <span>Signed: {medicalData.doctorSignedAt || medicalData.screeningDate}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. MODAL: Add Vaccination Record */}
      {showAddVaccineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="bg-[#714B67] text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Syringe className="w-4 h-4" />
                <h3 className="font-bold text-sm">
                  {isFr ? 'Enregistrer une Vaccination' : 'Administer / Record Vaccination'}
                </h3>
              </div>
              <button 
                onClick={() => setShowAddVaccineModal(false)}
                className="text-white/80 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddVaccination} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isFr ? 'Nom du Vaccin' : 'Vaccine Name'} *
                </label>
                <select
                  value={newVaccineName}
                  onChange={e => setNewVaccineName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-purple-600"
                  required
                >
                  <option value="Tetanus Toxoid (TT Booster)">Tetanus Toxoid (TT Booster)</option>
                  <option value="Hepatitis B Recombinant">Hepatitis B Recombinant</option>
                  <option value="Typhoid Conjugate Vaccine (TCV)">Typhoid Conjugate Vaccine (TCV)</option>
                  <option value="COVID-19 Bivalent mRNA">COVID-19 Bivalent mRNA</option>
                  <option value="Seasonal Influenza (Quadrivalent)">Seasonal Influenza (Quadrivalent)</option>
                  <option value="Yellow Fever Vaccine">Yellow Fever Vaccine</option>
                  <option value="Meningococcal ACWY Conjugate">Meningococcal ACWY Conjugate</option>
                  <option value="Human Papillomavirus (HPV)">Human Papillomavirus (HPV)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isFr ? 'Date d\'Administration' : 'Date Administered'} *
                  </label>
                  <input
                    type="date"
                    value={newVaccineDate}
                    onChange={e => setNewVaccineDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-purple-600"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isFr ? 'Numéro de Dose' : 'Dose Number'} *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={newVaccineDose}
                    onChange={e => setNewVaccineDose(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-purple-600 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isFr ? 'Numéro de Lot (Batch)' : 'Batch / Lot Number'} *
                  </label>
                  <input
                    type="text"
                    value={newVaccineBatch}
                    onChange={e => setNewVaccineBatch(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-purple-600 font-mono"
                    placeholder="LOT-2026-..."
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isFr ? 'Statut' : 'Status'}
                  </label>
                  <select
                    value={newVaccineStatus}
                    onChange={e => setNewVaccineStatus(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-purple-600 capitalize"
                  >
                    <option value="completed">Completed</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="refused">Refused by Inmate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isFr ? 'Administré par (Praticien)' : 'Administered By (Practitioner)'} *
                </label>
                <input
                  type="text"
                  value={newVaccineProvider}
                  onChange={e => setNewVaccineProvider(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-purple-600"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isFr ? 'Notes Cliniques / Site d\'Injection' : 'Clinical Notes / Site'}
                </label>
                <input
                  type="text"
                  value={newVaccineNotes}
                  onChange={e => setNewVaccineNotes(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-purple-600"
                  placeholder="e.g., Left deltoid IM, no immediate adverse reaction"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddVaccineModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  {isFr ? 'Annuler' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#714B67] text-white rounded-lg font-bold hover:bg-[#5e3c55] shadow-xs"
                >
                  {isFr ? 'Valider Vaccination' : 'Record Vaccination'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: Add Allergy Record */}
      {showAddAllergyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="bg-rose-700 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-4 h-4" />
                <h3 className="font-bold text-sm">
                  {isFr ? 'Signaler une Allergie Médicale' : 'Flag Clinical Allergy / Contraindication'}
                </h3>
              </div>
              <button 
                onClick={() => setShowAddAllergyModal(false)}
                className="text-white/80 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAllergy} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isFr ? 'Agent Allergène / Médicament' : 'Allergen / Substance / Drug Name'} *
                </label>
                <input
                  type="text"
                  value={newAllergen}
                  onChange={e => setNewAllergen(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-rose-600 font-semibold"
                  placeholder="e.g. Penicillin, Sulfa drugs, Peanuts, Latex..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isFr ? 'Catégorie' : 'Category'} *
                  </label>
                  <select
                    value={newAllergyType}
                    onChange={e => setNewAllergyType(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-rose-600"
                  >
                    <option value="drug">Drug / Medication</option>
                    <option value="food">Food / Dietary</option>
                    <option value="environmental">Environmental</option>
                    <option value="other">Other / Contact</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isFr ? 'Gravité' : 'Severity'} *
                  </label>
                  <select
                    value={newAllergySeverity}
                    onChange={e => setNewAllergySeverity(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-rose-600 font-bold capitalize text-rose-700"
                  >
                    <option value="severe">Severe</option>
                    <option value="anaphylactic">Anaphylactic (Life Threatening)</option>
                    <option value="moderate">Moderate</option>
                    <option value="mild">Mild</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isFr ? 'Description de la Réaction' : 'Reaction Manifestation'} *
                </label>
                <input
                  type="text"
                  value={newAllergyReaction}
                  onChange={e => setNewAllergyReaction(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-rose-600"
                  placeholder="e.g. Angioedema, bronchospasm, hives, anaphylactic shock"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isFr ? 'Conduite d\'Urgence / Remplacement' : 'Emergency Action & Safer Alternatives'}
                </label>
                <input
                  type="text"
                  value={newAllergyAction}
                  onChange={e => setNewAllergyAction(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-rose-600"
                  placeholder="e.g. Red wristband; substitute with Azithromycin; EpiPen ready"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddAllergyModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  {isFr ? 'Annuler' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 shadow-xs"
                >
                  {isFr ? 'Enregistrer l\'Alerte' : 'Flag Allergy Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
