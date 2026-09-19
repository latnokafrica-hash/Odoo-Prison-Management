import { Inmate, MedicalIntakeRecord, MedicalFlagSeverity, MedicalFlagDetails } from '../types';

export type { MedicalFlagSeverity, MedicalFlagDetails };

/**
 * Dynamically derives the Medical Flag and clinical severity from an inmate's medical intake report.
 * Evaluates:
 * 1. Explicit medicalFlagSeverity on the intake record
 * 2. Fitness for detention (e.g., unfit_requires_hospitalization or quarantine)
 * 3. Communicable disease alerts (e.g., active TB, isolation recommendations)
 * 4. Mental health screening acuity (e.g., suicide high observation, psychiatric referral)
 * 5. Abnormal referrals & specialty consultations (e.g., abnormal chest x-ray, orthopedic, nephrology)
 * 6. Chronic disease profile & maintenance pharmacotherapy (e.g., asthma, hypertension, diabetes)
 * 7. Acute vitals thresholds (hypertensive crisis, severe hypoxemia)
 */
export function deriveMedicalFlag(inmate: Inmate): MedicalFlagDetails {
  const intake: MedicalIntakeRecord | undefined = inmate.medicalIntake;
  const dietaryNotes = (inmate.dietaryMedicalNotes || '').toLowerCase();

  // If completely un-screened and no intake or notes, default to stable
  if (!intake) {
    if (dietaryNotes.includes('asthma') || dietaryNotes.includes('diabet') || dietaryNotes.includes('hypertens')) {
      return {
        severity: 'chronic',
        label: 'Chronic',
        conditionName: dietaryNotes.includes('asthma') ? 'Bronchial Asthma (Dietary Record)' : 'Chronic Condition (Intake Note)',
        allConditions: [inmate.dietaryMedicalNotes || 'Chronic condition noted'],
        notes: inmate.dietaryMedicalNotes,
        activeMedicationsCount: 1,
        allergiesCount: 0,
        screeningDate: inmate.admissionDate
      };
    }
    return {
      severity: 'stable',
      label: 'Fit / Stable',
      conditionName: 'Intake Pending / Clear',
      allConditions: [],
      activeMedicationsCount: 0,
      allergiesCount: 0,
      screeningDate: inmate.admissionDate
    };
  }

  const chronicList = intake.chronicConditions || [];
  const notesLower = (intake.initialScreeningNotes || '').toLowerCase();
  const vitals = intake.vitals;
  const allergies = intake.allergies || [];
  const meds = intake.currentMedications || [];
  const suicideRisk = intake.mentalHealthScreening?.suicideRiskLevel;
  const tbXray = intake.communicableDiseaseScreening?.tbChestXRayStatus;
  const isolationReq = intake.communicableDiseaseScreening?.isolationRecommended;
  const tbSymptom = intake.communicableDiseaseScreening?.tbSymptomatic;

  // -------------------------------------------------------------
  // 1. EVALUATE CRITICAL SEVERITY (Red / Rose)
  // -------------------------------------------------------------
  const isExplicitCritical = intake.medicalFlagSeverity === 'critical';
  const isUnfitHospital = intake.fitnessForDetention === 'unfit_requires_hospitalization';
  const isQuarantine = intake.fitnessForDetention === 'quarantine_required';
  const isSuicideHigh = suicideRisk === 'high_observation';
  const isSevereVitals = vitals && (
    vitals.oxygenSaturationPercent < 92 ||
    vitals.bloodPressureSystolic >= 180 ||
    vitals.bloodPressureDiastolic >= 115 ||
    vitals.bodyTemperatureC >= 39.0
  );
  const isAnaphylacticAllergy = allergies.some(a => a.severity === 'anaphylactic');
  const isCriticalKeyword = 
    notesLower.includes('critical') || 
    notesLower.includes('dialysis') || 
    notesLower.includes('end-stage') || 
    notesLower.includes('emergency hospitalization') ||
    notesLower.includes('severe hyperkalemia') ||
    chronicList.some(c => {
      const cl = c.toLowerCase();
      return cl.includes('end-stage') || cl.includes('dialysis') || cl.includes('renal failure') || cl.includes('crisis');
    });

  if (
    isExplicitCritical || 
    isUnfitHospital || 
    isQuarantine || 
    isolationReq || 
    tbSymptom || 
    isSuicideHigh || 
    isSevereVitals || 
    isCriticalKeyword
  ) {
    let conditionName = intake.flaggedCondition || '';
    if (!conditionName) {
      if (notesLower.includes('dialysis') || chronicList.some(c => c.toLowerCase().includes('renal'))) {
        conditionName = 'End-Stage Renal Disease (Emergency Dialysis)';
      } else if (isSuicideHigh) {
        conditionName = 'High Suicide Risk (Constant Observation)';
      } else if (tbSymptom || isolationReq || isQuarantine) {
        conditionName = 'Communicable Disease (Isolation Mandated)';
      } else if (isSevereVitals) {
        conditionName = `Hypertensive Emergency (BP ${vitals?.bloodPressureSystolic}/${vitals?.bloodPressureDiastolic})`;
      } else if (isAnaphylacticAllergy) {
        conditionName = 'Life-Threatening Anaphylactic Allergy';
      } else if (chronicList.length > 0) {
        conditionName = chronicList[0].split('(')[0].trim();
      } else {
        conditionName = 'Critical Condition (Requires Hospitalization)';
      }
    }

    return {
      severity: 'critical',
      label: 'Critical',
      conditionName,
      allConditions: chronicList.length > 0 ? chronicList : [conditionName],
      notes: intake.initialScreeningNotes,
      requiresHospitalization: isUnfitHospital || isCriticalKeyword,
      requiresIsolation: Boolean(isolationReq || isQuarantine || tbSymptom),
      activeMedicationsCount: meds.length,
      allergiesCount: allergies.length,
      vitalsSummary: vitals ? `BP: ${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic} mmHg • HR: ${vitals.heartRateBpm} bpm • SpO2: ${vitals.oxygenSaturationPercent}%` : undefined,
      screeningDate: intake.screeningDate,
      examiningDoctor: intake.examiningOfficer
    };
  }

  // -------------------------------------------------------------
  // 2. EVALUATE NEEDS SPECIALIST SEVERITY (Amber / Orange)
  // -------------------------------------------------------------
  const isExplicitSpecialist = intake.medicalFlagSeverity === 'needs_specialist';
  const isSpecialistKeyword = 
    notesLower.includes('specialist') || 
    notesLower.includes('referral') || 
    notesLower.includes('referred to') || 
    notesLower.includes('psychiatrist') || 
    notesLower.includes('orthopedic') || 
    notesLower.includes('fracture') || 
    notesLower.includes('cardiology') || 
    notesLower.includes('nephrologist') ||
    notesLower.includes('consultant');
  const isAbnormalChestXRay = tbXray === 'abnormal_referred';
  const isSuicideModerate = suicideRisk === 'moderate';
  const hasPsychHistory = intake.mentalHealthScreening?.priorPsychiatricHistory;
  const hasWithdrawalRisk = intake.mentalHealthScreening?.substanceWithdrawalRisk;

  if (
    isExplicitSpecialist || 
    isSpecialistKeyword || 
    isAbnormalChestXRay || 
    isSuicideModerate || 
    (intake.fitnessForDetention === 'fit_with_restrictions' && (hasPsychHistory || hasWithdrawalRisk || isSpecialistKeyword))
  ) {
    let conditionName = intake.flaggedCondition || '';
    let specialty = intake.specialistReferralSpecialty || '';

    if (!conditionName) {
      if (notesLower.includes('psychiat') || isSuicideModerate || hasPsychHistory) {
        conditionName = 'Psychiatric Consultant Referral';
        specialty = 'Forensic Psychiatry';
      } else if (notesLower.includes('orthopedic') || notesLower.includes('fracture')) {
        conditionName = 'Orthopedic Consult (Fracture Care)';
        specialty = 'Orthopedic Surgery';
      } else if (isAbnormalChestXRay) {
        conditionName = 'Abnormal Chest X-Ray (Pulmonology)';
        specialty = 'Pulmonology / TB Clinic';
      } else if (chronicList.length > 0) {
        conditionName = `Specialist Review: ${chronicList[0].split('(')[0].trim()}`;
        specialty = 'Internal Medicine';
      } else {
        conditionName = 'Clinical Specialist Referral Needed';
        specialty = 'Consultant Physician';
      }
    }

    return {
      severity: 'needs_specialist',
      label: 'Needs Specialist',
      conditionName,
      allConditions: chronicList.length > 0 ? chronicList : [conditionName],
      notes: intake.initialScreeningNotes,
      specialistSpecialty: specialty,
      requiresHospitalization: false,
      requiresIsolation: false,
      activeMedicationsCount: meds.length,
      allergiesCount: allergies.length,
      vitalsSummary: vitals ? `BP: ${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic} mmHg • HR: ${vitals.heartRateBpm} bpm` : undefined,
      screeningDate: intake.screeningDate,
      examiningDoctor: intake.examiningOfficer
    };
  }

  // -------------------------------------------------------------
  // 3. EVALUATE CHRONIC SEVERITY (Blue / Sky)
  // -------------------------------------------------------------
  const isExplicitChronic = intake.medicalFlagSeverity === 'chronic';
  const hasChronicList = chronicList.length > 0;
  const hasDailyMeds = meds.length > 0;
  const isFitRestrictions = intake.fitnessForDetention === 'fit_with_restrictions';
  const hasDietaryMedical = Boolean(
    intake.dietaryMedicalRecommendation &&
    (
      intake.dietaryMedicalRecommendation.toLowerCase().includes('salt') ||
      intake.dietaryMedicalRecommendation.toLowerCase().includes('sodium') ||
      intake.dietaryMedicalRecommendation.toLowerCase().includes('diabetic') ||
      intake.dietaryMedicalRecommendation.toLowerCase().includes('renal')
    )
  );

  if (isExplicitChronic || hasChronicList || (isFitRestrictions && (hasDailyMeds || hasDietaryMedical))) {
    let conditionName = intake.flaggedCondition || '';
    if (!conditionName) {
      if (chronicList.length > 0) {
        conditionName = chronicList[0].split('(')[0].trim();
      } else if (meds.length > 0) {
        conditionName = `Chronic Maintenance (${meds[0].name.split(' ')[0]})`;
      } else {
        conditionName = 'Chronic Medical Monitoring';
      }
    }

    return {
      severity: 'chronic',
      label: 'Chronic',
      conditionName,
      allConditions: chronicList.length > 0 ? chronicList : [conditionName],
      notes: intake.initialScreeningNotes,
      requiresHospitalization: false,
      requiresIsolation: false,
      activeMedicationsCount: meds.length,
      allergiesCount: allergies.length,
      vitalsSummary: vitals ? `BP: ${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic} mmHg • SpO2: ${vitals.oxygenSaturationPercent}%` : undefined,
      screeningDate: intake.screeningDate,
      examiningDoctor: intake.examiningOfficer
    };
  }

  // -------------------------------------------------------------
  // 4. DEFAULT STABLE / FIT (Emerald / Slate)
  // -------------------------------------------------------------
  return {
    severity: 'stable',
    label: 'Fit / Stable',
    conditionName: 'Fit (Normal Custody)',
    allConditions: [],
    notes: intake.initialScreeningNotes || 'No active chronic pathology detected at intake.',
    activeMedicationsCount: meds.length,
    allergiesCount: allergies.length,
    vitalsSummary: vitals ? `BP: ${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic} mmHg • Normal Vitals` : undefined,
    screeningDate: intake.screeningDate,
    examiningDoctor: intake.examiningOfficer
  };
}

/**
 * Visual styling theme configuration for each Medical Flag severity level.
 */
export const MEDICAL_FLAG_STYLES = {
  critical: {
    bg: 'bg-rose-50',
    border: 'border-rose-300',
    text: 'text-rose-900',
    badge: 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100 hover:border-rose-400',
    solidBadge: 'bg-rose-600 text-white font-bold',
    dot: 'bg-rose-600 animate-pulse',
    accentLine: 'bg-rose-500',
    rowTint: 'bg-rose-50/40 hover:bg-rose-50/80',
    ring: 'ring-rose-300',
    iconColor: 'text-rose-600',
    tooltipHeaderBg: 'bg-rose-900 text-white',
    label: 'CRITICAL',
    description: 'Acute emergency, severe organ failure, or active hospitalization requirement'
  },
  needs_specialist: {
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    text: 'text-amber-900',
    badge: 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 hover:border-amber-400',
    solidBadge: 'bg-amber-500 text-slate-900 font-bold',
    dot: 'bg-amber-500',
    accentLine: 'bg-amber-500',
    rowTint: 'bg-amber-50/30 hover:bg-amber-50/70',
    ring: 'ring-amber-300',
    iconColor: 'text-amber-600',
    tooltipHeaderBg: 'bg-amber-800 text-white',
    label: 'NEEDS SPECIALIST',
    description: 'Requires external consultant, surgical, psychiatric, or specialized clinic referral'
  },
  chronic: {
    bg: 'bg-sky-50',
    border: 'border-sky-300',
    text: 'text-sky-900',
    badge: 'bg-sky-50 text-sky-800 border-sky-300 hover:bg-sky-100 hover:border-sky-400',
    solidBadge: 'bg-sky-600 text-white font-bold',
    dot: 'bg-sky-500',
    accentLine: 'bg-sky-500',
    rowTint: 'hover:bg-sky-50/30',
    ring: 'ring-sky-200',
    iconColor: 'text-sky-600',
    tooltipHeaderBg: 'bg-sky-900 text-white',
    label: 'CHRONIC',
    description: 'Under active medical protocol for long-term health condition & maintenance medication'
  },
  stable: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
    solidBadge: 'bg-emerald-600 text-white font-semibold',
    dot: 'bg-emerald-500',
    accentLine: 'bg-emerald-500',
    rowTint: '',
    ring: 'ring-emerald-200',
    iconColor: 'text-emerald-600',
    tooltipHeaderBg: 'bg-emerald-900 text-white',
    label: 'FIT / STABLE',
    description: 'Certified medically fit for standard custodial placement without active restrictions'
  }
} as const;
