import { MedicalIntakeRecord } from '../types';

export const INITIAL_MEDICAL_INTAKES: Record<string, MedicalIntakeRecord> = {
  'inm-101': {
    id: 'med-101',
    screeningDate: '2024-02-15',
    screeningTime: '10:45 AM',
    examiningOfficer: 'Dr. Sarah Nduta, MD',
    medicalOfficerTitle: 'Senior Medical Officer & Prison Physician',
    licenseNumber: 'KMPDC-REG-48920',
    facilityName: 'Kamiti National Maximum Security Penitentiary',
    fitnessForDetention: 'fit_with_restrictions',
    vitals: {
      bloodPressureSystolic: 128,
      bloodPressureDiastolic: 82,
      heartRateBpm: 74,
      respiratoryRate: 16,
      bodyTemperatureC: 36.8,
      oxygenSaturationPercent: 98,
      weightKg: 78.5,
      heightCm: 182,
      bmi: 23.7
    },
    initialScreeningNotes: 'Inmate arrived in stable condition via judicial escort from Milimani High Court. Alert, oriented x3. No signs of acute trauma, contusions, or fresh abrasions. Moderate bronchial wheezing on deep expiration consistent with reported moderate persistent asthma. Chest expansion symmetric. Abdomen soft, non-tender. Dental inspection clean. Skin clear with healed 4cm scar on left forearm. Authorized for standard cell placement with lower bunk recommendation and prompt inhaler access.',
    chronicConditions: [
      'Moderate Persistent Bronchial Asthma (ICD-10 J45.40)',
      'Mild Tension Cephalea'
    ],
    medicalFlagSeverity: 'chronic',
    flaggedCondition: 'Moderate Persistent Bronchial Asthma',
    mentalHealthScreening: {
      suicideRiskLevel: 'low',
      substanceWithdrawalRisk: false,
      priorPsychiatricHistory: false,
      observations: 'Cooperative during psychiatric intake rubric. Denies suicidal or self-harm ideation. No psychotic symptoms or perceptual disturbances detected. Score 2/27 on PHQ-9.'
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
        id: 'vax-101-1',
        vaccineName: 'Tetanus Toxoid (TT Booster)',
        dateAdministered: '2024-02-15',
        doseNumber: 1,
        batchLotNumber: 'SER-TT-9482A',
        administeredBy: 'Nurse Officer Mary Wambui',
        clinicFacility: 'Kamiti Health Dispensary',
        expiryDate: '2027-01-30',
        status: 'completed',
        notes: 'Routine intake immunization given intramuscularly left deltoid.'
      },
      {
        id: 'vax-101-2',
        vaccineName: 'Hepatitis B Recombinant (HepB Dose 1)',
        dateAdministered: '2024-02-15',
        doseNumber: 1,
        batchLotNumber: 'BIO-HB-3301C',
        administeredBy: 'Nurse Officer Mary Wambui',
        clinicFacility: 'Kamiti Health Dispensary',
        expiryDate: '2026-11-15',
        status: 'completed',
        notes: 'Prison intake institutional protocol.'
      },
      {
        id: 'vax-101-3',
        vaccineName: 'Hepatitis B Recombinant (HepB Dose 2)',
        dateAdministered: '2024-03-18',
        doseNumber: 2,
        batchLotNumber: 'BIO-HB-3388K',
        administeredBy: 'Clinical Officer Peter Otieno',
        clinicFacility: 'Kamiti Health Dispensary',
        expiryDate: '2026-12-01',
        status: 'completed',
        notes: 'One month booster administered without adverse event.'
      },
      {
        id: 'vax-101-4',
        vaccineName: 'COVID-19 Bivalent mRNA (Pfizer-BioNTech)',
        dateAdministered: '2023-10-04',
        doseNumber: 3,
        batchLotNumber: 'PZ-CV23-8812',
        administeredBy: 'Nairobi Metro Health Service',
        clinicFacility: 'Nairobi Health Annex',
        status: 'completed',
        notes: 'Verified via National MoH Chanjo Portal.'
      },
      {
        id: 'vax-101-5',
        vaccineName: 'Seasonal Influenza (Quadrivalent)',
        dateAdministered: '2025-05-12',
        doseNumber: 1,
        batchLotNumber: 'FLU-QUAD-2025',
        administeredBy: 'Nurse Officer Mary Wambui',
        clinicFacility: 'Kamiti Health Dispensary',
        status: 'scheduled',
        notes: 'Annual seasonal prison influenza campaign.'
      }
    ],
    allergies: [
      {
        id: 'alg-101-1',
        allergen: 'Penicillin (Amoxicillin / Ampicillin)',
        type: 'drug',
        severity: 'severe',
        reaction: 'Generalized urticaria, facial angioedema, and wheezing (documented in 2019)',
        diagnosedDate: '2019-06-12',
        recordedBy: 'Dr. Sarah Nduta, MD',
        emergencyAction: 'STRICT CONTRAINDICATION: Red Medical Allergy Band placed. Use Macrolides (Azithromycin) or Fluoroquinolones as alternatives.'
      },
      {
        id: 'alg-101-2',
        allergen: 'Non-Steroidal Anti-Inflammatory Drugs (NSAIDs - Aspirin/Ibuprofen)',
        type: 'drug',
        severity: 'moderate',
        reaction: 'Bronchospasm exacerbation and epigastric burning',
        diagnosedDate: '2021-04-09',
        recordedBy: 'Dr. Sarah Nduta, MD',
        emergencyAction: 'Prescribe Paracetamol for analgesia; avoid Ketorolac, Ibuprofen, Diclofenac.'
      },
      {
        id: 'alg-101-3',
        allergen: 'Peanuts and Tree Nuts',
        type: 'food',
        severity: 'moderate',
        reaction: 'Oral itching, periorbital edema',
        diagnosedDate: '2015-08-20',
        recordedBy: 'Dr. Sarah Nduta, MD',
        emergencyAction: 'Flagged on Kitchen Nutrition Sheet: Peanut-free meal tray only.'
      }
    ],
    currentMedications: [
      {
        name: 'Salbutamol Metered Dose Inhaler (100mcg/puff)',
        dosage: '2 puffs PRN as needed for acute wheeze or shortness of breath',
        frequency: 'PRN (Max 4 times daily)',
        route: 'inhaler',
        heldByClinic: false // Kept with inmate in cell upon Warden medical clearance
      },
      {
        name: 'Beclomethasone Dipropionate Inhaler (200mcg)',
        dosage: '1 puff twice daily after meals',
        frequency: 'BID (07:00 & 19:00)',
        route: 'inhaler',
        heldByClinic: true
      },
      {
        name: 'Cetirizine Hydrochloride 10mg',
        dosage: '1 tablet nightly',
        frequency: 'Nocte',
        route: 'oral',
        heldByClinic: true
      }
    ],
    dietaryMedicalRecommendation: 'Peanut-free tray. Avoid sulfurous preservatives. Adequate hydration during vocational carpentry shifts.',
    followUpAppointmentDate: '2026-10-12',
    doctorSignOff: true,
    doctorSignedAt: '2024-02-15 11:30'
  },
  'inm-102': {
    id: 'med-102',
    screeningDate: '2026-08-01',
    screeningTime: '09:15 AM',
    examiningOfficer: 'Dr. Edwin Kiprop, MBChB',
    medicalOfficerTitle: 'Central Remand Medical Superintendent',
    licenseNumber: 'KMPDC-REG-39102',
    facilityName: "King'ong'o Central Remand & Judicial Holding",
    fitnessForDetention: 'fit_normal_custody',
    vitals: {
      bloodPressureSystolic: 118,
      bloodPressureDiastolic: 76,
      heartRateBpm: 68,
      respiratoryRate: 14,
      bodyTemperatureC: 36.6,
      oxygenSaturationPercent: 99,
      weightKg: 72.0,
      heightCm: 175,
      bmi: 23.5
    },
    initialScreeningNotes: 'Remand arrival from Central Police Station. General physical appearance unremarkable. No active complaints. Normal heart sounds, chest clear bilaterally. Cranial nerves intact. No visible bodily marks, scars, or signs of physical abuse during police custody. Certified completely fit for standard remand dormitory association.',
    chronicConditions: [],
    medicalFlagSeverity: 'stable',
    flaggedCondition: 'Fit for Standard Dormitory (Normal)',
    mentalHealthScreening: {
      suicideRiskLevel: 'none',
      substanceWithdrawalRisk: false,
      priorPsychiatricHistory: false,
      observations: 'Appropriately oriented, calm demeanor. Demonstrates understanding of pending court process. No signs of anxiety or depression.'
    },
    communicableDiseaseScreening: {
      tbSymptomatic: false,
      tbChestXRayStatus: 'clear',
      covidStatus: 'negative',
      hepatitisScreened: true,
      isolationRecommended: false
    },
    vaccinations: [
      {
        id: 'vax-102-1',
        vaccineName: 'Tetanus Toxoid (TT Intake)',
        dateAdministered: '2026-08-01',
        doseNumber: 1,
        batchLotNumber: 'TT-REM-2601',
        administeredBy: 'Nurse J. Wanjiku',
        clinicFacility: "King'ong'o Remand Clinic",
        expiryDate: '2028-03-15',
        status: 'completed',
        notes: 'Standard remand admission shot.'
      },
      {
        id: 'vax-102-2',
        vaccineName: 'Typhoid Conjugate Vaccine (TCV)',
        dateAdministered: '2026-08-01',
        doseNumber: 1,
        batchLotNumber: 'TYPH-K-7712',
        administeredBy: 'Nurse J. Wanjiku',
        clinicFacility: "King'ong'o Remand Clinic",
        status: 'completed',
        notes: 'Community containment prevention.'
      }
    ],
    allergies: [
      {
        id: 'alg-102-1',
        allergen: 'Sulfonamides (Bactrim / Septra)',
        type: 'drug',
        severity: 'mild',
        reaction: 'Maculopapular rash on trunk and arms',
        diagnosedDate: '2022-03-10',
        recordedBy: 'Dr. Edwin Kiprop, MBChB',
        emergencyAction: 'Avoid sulfa-containing antibiotics and diuretics.'
      }
    ],
    currentMedications: [],
    dietaryMedicalRecommendation: 'Standard institutional remand diet. No therapeutic modifications necessary.',
    followUpAppointmentDate: '2026-11-01',
    doctorSignOff: true,
    doctorSignedAt: '2026-08-01 10:00'
  },
  'inm-104': {
    id: 'med-104',
    screeningDate: '2021-03-10',
    screeningTime: '11:00 AM',
    examiningOfficer: 'Dr. Beatrice Mwangi, MD',
    medicalOfficerTitle: 'Women Correctional Health Director',
    licenseNumber: 'KMPDC-REG-51209',
    facilityName: "Lang'ata Women's Correctional Centre",
    fitnessForDetention: 'fit_with_restrictions',
    vitals: {
      bloodPressureSystolic: 134,
      bloodPressureDiastolic: 86,
      heartRateBpm: 76,
      respiratoryRate: 16,
      bodyTemperatureC: 36.7,
      oxygenSaturationPercent: 98,
      weightKg: 64.0,
      heightCm: 162,
      bmi: 24.4
    },
    initialScreeningNotes: 'Admitted on convicted committal. Female prisoner evaluated under UN Bangkok Rules. G2P2, no active gynecological complaints. Primary hypertension diagnosed stage 1 on intake vitals. Thyroid gland normal. Well-nourished, ambulating freely. Prescribed low-sodium diet and anti-hypertensive maintenance.',
    chronicConditions: [
      'Essential Hypertension (Stage 1 - ICD-10 I10)'
    ],
    medicalFlagSeverity: 'chronic',
    flaggedCondition: 'Essential Hypertension (Stage 1)',
    mentalHealthScreening: {
      suicideRiskLevel: 'low',
      substanceWithdrawalRisk: false,
      priorPsychiatricHistory: false,
      observations: 'Stable mood, cooperative, responsive to psycho-social intake counselor. Actively engaged in tailoring and vocational planning.'
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
        id: 'vax-104-1',
        vaccineName: 'Tetanus Toxoid (TT Booster)',
        dateAdministered: '2021-03-10',
        doseNumber: 1,
        batchLotNumber: 'TT-LWC-112',
        administeredBy: 'Nurse Regina Muthoni',
        clinicFacility: "Lang'ata Medical Dispensary",
        status: 'completed'
      },
      {
        id: 'vax-104-2',
        vaccineName: 'Hepatitis B Vaccine',
        dateAdministered: '2021-03-10',
        doseNumber: 1,
        batchLotNumber: 'HB-LWC-908',
        administeredBy: 'Nurse Regina Muthoni',
        clinicFacility: "Lang'ata Medical Dispensary",
        status: 'completed'
      },
      {
        id: 'vax-104-3',
        vaccineName: 'Hepatitis B Vaccine',
        dateAdministered: '2021-04-12',
        doseNumber: 2,
        batchLotNumber: 'HB-LWC-940',
        administeredBy: 'Nurse Regina Muthoni',
        clinicFacility: "Lang'ata Medical Dispensary",
        status: 'completed'
      },
      {
        id: 'vax-104-4',
        vaccineName: 'Human Papillomavirus (HPV Quadrivalent)',
        dateAdministered: '2022-01-15',
        doseNumber: 1,
        batchLotNumber: 'HPV-902-A',
        administeredBy: 'Dr. Beatrice Mwangi, MD',
        clinicFacility: "Lang'ata Medical Dispensary",
        status: 'completed'
      }
    ],
    allergies: [
      {
        id: 'alg-104-1',
        allergen: 'Shellfish & Crustaceans',
        type: 'food',
        severity: 'moderate',
        reaction: 'Abdominal cramping and urticaria',
        diagnosedDate: '2016-11-04',
        recordedBy: 'Dr. Beatrice Mwangi, MD',
        emergencyAction: 'Non-seafood kitchen profile.'
      }
    ],
    currentMedications: [
      {
        name: 'Amlodipine Besylate 5mg',
        dosage: '1 tablet once daily every morning',
        frequency: 'OD (08:00 AM)',
        route: 'oral',
        heldByClinic: true
      }
    ],
    dietaryMedicalRecommendation: 'Renal / Low Sodium Diet (<2,000mg sodium daily). Daily fresh fruit ration.',
    followUpAppointmentDate: '2026-09-19',
    doctorSignOff: true,
    doctorSignedAt: '2021-03-10 12:00'
  },
  'inm-103': {
    id: 'med-103',
    screeningDate: '2023-11-04',
    screeningTime: '14:30 PM',
    examiningOfficer: 'Dr. Sarah Nduta, MD',
    medicalOfficerTitle: 'Senior Medical Officer & Prison Physician',
    licenseNumber: 'KMPDC-REG-48920',
    facilityName: 'Kamiti National Maximum Security Penitentiary',
    fitnessForDetention: 'fit_with_restrictions',
    vitals: {
      bloodPressureSystolic: 136,
      bloodPressureDiastolic: 88,
      heartRateBpm: 82,
      respiratoryRate: 18,
      bodyTemperatureC: 37.1,
      oxygenSaturationPercent: 97,
      weightKg: 81.0,
      heightCm: 178,
      bmi: 25.6
    },
    initialScreeningNotes: 'Specialist Referral Mandate (Mandela Rule 43/45): Evaluated after 14 days solitary confinement following recapture. Displays marked hyper-vigilance, nocturnal panic, claustrophobia, and reported blunt head trauma prior to custody. Mandated for prompt external Forensic Psychiatry Consultation at Mathari National Hospital. Plain chest radiography reveals right apical haziness requiring Pulmonology specialist workup.',
    chronicConditions: [
      'Post-Traumatic Stress Syndrome with Psychomotor Agitation',
      'Suspicious Apical Pulmonary Infiltrate (Rule Out Subacute TB)'
    ],
    medicalFlagSeverity: 'needs_specialist',
    flaggedCondition: 'Psychiatric Review (Mandela R43) & Pulmonology CXR Consult',
    specialistReferralSpecialty: 'Forensic Psychiatry & Pulmonology',
    mentalHealthScreening: {
      suicideRiskLevel: 'moderate',
      substanceWithdrawalRisk: false,
      priorPsychiatricHistory: true,
      observations: 'Agitated affect, intermittent auditory hallucinations reported during solitary isolation. Mandated rotation out of solitary within 24 hours.'
    },
    communicableDiseaseScreening: {
      tbSymptomatic: false,
      tbChestXRayStatus: 'abnormal_referred',
      covidStatus: 'vaccinated',
      hepatitisScreened: true,
      isolationRecommended: false
    },
    vaccinations: [
      {
        id: 'vax-103-1',
        vaccineName: 'Tetanus Toxoid (TT Intake)',
        dateAdministered: '2023-11-04',
        doseNumber: 1,
        batchLotNumber: 'TT-KMS-2391',
        administeredBy: 'Nurse Officer Mary Wambui',
        clinicFacility: 'Kamiti Health Dispensary',
        status: 'completed'
      }
    ],
    allergies: [],
    currentMedications: [
      {
        name: 'Olanzapine 5mg',
        dosage: '1 tablet nocte (bedtime)',
        frequency: 'Daily Nocte',
        route: 'oral',
        heldByClinic: true
      }
    ],
    dietaryMedicalRecommendation: 'High-calorie nutritional support. Minimum 2 hours outdoor yard access as per Mandela Rule 23.',
    followUpAppointmentDate: '2026-09-22',
    doctorSignOff: true,
    doctorSignedAt: '2023-11-04 16:00'
  },
  'inm-105': {
    id: 'med-105',
    screeningDate: '2023-08-12',
    screeningTime: '08:45 AM',
    examiningOfficer: 'Dr. Kenneth Odhiambo, MBChB',
    medicalOfficerTitle: 'Naivasha District Medical Officer',
    licenseNumber: 'KMPDC-REG-44109',
    facilityName: 'Naivasha Open Camp & Agri-Rehab Trust',
    fitnessForDetention: 'fit_normal_custody',
    vitals: {
      bloodPressureSystolic: 116,
      bloodPressureDiastolic: 74,
      heartRateBpm: 64,
      respiratoryRate: 14,
      bodyTemperatureC: 36.5,
      oxygenSaturationPercent: 99,
      weightKg: 69.5,
      heightCm: 172,
      bmi: 23.5
    },
    initialScreeningNotes: 'Transferred from Kamiti to Naivasha Open Agri-Camp. Physical examination normal. Excellent cardiopulmonary reserve. Musculoskeletal integrity intact. Certified completely fit for open greenhouse farming and dairy livestock labor.',
    chronicConditions: [],
    medicalFlagSeverity: 'stable',
    flaggedCondition: 'Fit for Agricultural Open Trust Labor',
    mentalHealthScreening: {
      suicideRiskLevel: 'none',
      substanceWithdrawalRisk: false,
      priorPsychiatricHistory: false,
      observations: 'Enthusiastic, positive attitude towards vocational dairy farming certification.'
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
        id: 'vax-105-1',
        vaccineName: 'Tetanus Toxoid Booster',
        dateAdministered: '2023-08-12',
        doseNumber: 1,
        batchLotNumber: 'TT-NVS-881',
        administeredBy: 'Staff Nurse K. Langat',
        clinicFacility: 'Naivasha Camp Dispensary',
        status: 'completed'
      }
    ],
    allergies: [],
    currentMedications: [],
    dietaryMedicalRecommendation: 'Standard agricultural farm ration with high hydration during greenhouse shifts.',
    followUpAppointmentDate: '2026-12-10',
    doctorSignOff: true,
    doctorSignedAt: '2023-08-12 09:30'
  },
  'inm-106': {
    id: 'med-106',
    screeningDate: '2025-01-12',
    screeningTime: '11:15 AM',
    examiningOfficer: 'Dr. Fatuma Juma, MD',
    medicalOfficerTitle: 'Coast Regional Medical Superintendent',
    licenseNumber: 'KMPDC-REG-41908',
    facilityName: 'Shimo La Tewa Medium Security & Remand',
    fitnessForDetention: 'fit_with_restrictions',
    vitals: {
      bloodPressureSystolic: 124,
      bloodPressureDiastolic: 80,
      heartRateBpm: 72,
      respiratoryRate: 15,
      bodyTemperatureC: 36.8,
      oxygenSaturationPercent: 98,
      weightKg: 75.0,
      heightCm: 176,
      bmi: 24.2
    },
    initialScreeningNotes: 'Evaluated upon committal at Coast Remand. Endoscopic history of recurrent peptic ulcer disease and gastroesophageal reflux. Abdomen soft with mild epigastric tenderness on deep palpation. Controlled with daily proton pump inhibitor therapy. Inmate cleared for transfer convoy with medication supply held by escort commander.',
    chronicConditions: [
      'Chronic Peptic Ulcer Disease (ICD-10 K27.9)',
      'Gastroesophageal Reflux Disease with Mild Esophagitis'
    ],
    medicalFlagSeverity: 'chronic',
    flaggedCondition: 'Chronic Peptic Ulcer Disease (Omeprazole Protocol)',
    mentalHealthScreening: {
      suicideRiskLevel: 'none',
      substanceWithdrawalRisk: false,
      priorPsychiatricHistory: false,
      observations: 'Calm, cooperative, cooperative with convoy escort instructions.'
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
        id: 'vax-106-1',
        vaccineName: 'Tetanus Toxoid Intake',
        dateAdministered: '2025-01-12',
        doseNumber: 1,
        batchLotNumber: 'TT-SLT-2501',
        administeredBy: 'Nurse Omar Mbarak',
        clinicFacility: 'Shimo La Tewa Medical Centre',
        status: 'completed'
      }
    ],
    allergies: [],
    currentMedications: [
      {
        name: 'Omeprazole 40mg Delayed Release',
        dosage: '1 capsule 30 minutes before breakfast',
        frequency: 'OD mane',
        route: 'oral',
        heldByClinic: true
      }
    ],
    dietaryMedicalRecommendation: 'Bland non-spicy diet. Small frequent meal schedule.',
    followUpAppointmentDate: '2026-10-15',
    doctorSignOff: true,
    doctorSignedAt: '2025-01-12 12:00'
  },
  'inm-107': {
    id: 'med-107',
    screeningDate: '2026-01-05',
    screeningTime: '15:20 PM',
    examiningOfficer: 'Dr. Sarah Nduta, MD',
    medicalOfficerTitle: 'Senior Medical Officer & Prison Physician',
    licenseNumber: 'KMPDC-REG-48920',
    facilityName: 'Kamiti National Maximum Security Penitentiary',
    fitnessForDetention: 'unfit_requires_hospitalization',
    vitals: {
      bloodPressureSystolic: 188,
      bloodPressureDiastolic: 114,
      heartRateBpm: 92,
      respiratoryRate: 22,
      bodyTemperatureC: 37.2,
      oxygenSaturationPercent: 94,
      weightKg: 84.0,
      heightCm: 179,
      bmi: 26.2
    },
    initialScreeningNotes: 'CRITICAL HEALTH ALERT: Inmate has Stage 5 Chronic Kidney Disease (End-Stage Renal Disease) requiring bi-weekly hemodialysis via left forearm AV fistula. Severe hypertensive crisis (BP 188/114 mmHg) with bilateral pedal edema and acute hyperkalemia vulnerability. Mandated for continuous armed referral ward hospitalization at Kenyatta National Hospital. High flight risk alert attached to medical transport.',
    chronicConditions: [
      'End-Stage Renal Disease - ESRD Stage 5 (ICD-10 N18.5)',
      'Hypertensive Emergency / Nephrosclerosis (ICD-10 I12.0)',
      'Left Forearm Radiocephalic AV Fistula'
    ],
    medicalFlagSeverity: 'critical',
    flaggedCondition: 'CRITICAL: End-Stage Renal Disease (Emergency Hemodialysis Required)',
    specialistReferralSpecialty: 'Nephrology & Renal Dialysis Unit',
    mentalHealthScreening: {
      suicideRiskLevel: 'low',
      substanceWithdrawalRisk: false,
      priorPsychiatricHistory: false,
      observations: 'Alert but physically fatigued and visibly anxious regarding dialysis continuity.'
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
        id: 'vax-107-1',
        vaccineName: 'Hepatitis B High-Dose Dialysis Protocol',
        dateAdministered: '2026-01-06',
        doseNumber: 1,
        batchLotNumber: 'HB-DIAL-901',
        administeredBy: 'Nurse Officer Mary Wambui',
        clinicFacility: 'Kenyatta National Hospital Ward 4',
        status: 'completed'
      }
    ],
    allergies: [
      {
        id: 'alg-107-1',
        allergen: 'Iodinated Radiographic Contrast Media',
        type: 'drug',
        severity: 'severe',
        reaction: 'Severe urticaria and acute bronchospasm',
        diagnosedDate: '2024-05-18',
        recordedBy: 'Dr. Sarah Nduta, MD',
        emergencyAction: 'Strict contrast media contraindication. Use non-contrast ultrasound or MRI.'
      }
    ],
    currentMedications: [
      {
        name: 'Amlodipine Besylate 10mg',
        dosage: '1 tablet once daily in morning',
        frequency: 'OD (08:00)',
        route: 'oral',
        heldByClinic: true
      },
      {
        name: 'Furosemide 40mg',
        dosage: '1 tablet twice daily',
        frequency: 'BID',
        route: 'oral',
        heldByClinic: true
      },
      {
        name: 'Calcium Acetate 667mg (PhosLo)',
        dosage: '2 tablets with each meal',
        frequency: 'TID with meals',
        route: 'oral',
        heldByClinic: true
      }
    ],
    dietaryMedicalRecommendation: 'Strict Renal Diet: Potassium-restricted (<2g/day), low phosphorus, low sodium (<1.5g/day), fluid restriction 1.2L/day.',
    followUpAppointmentDate: '2026-09-20',
    doctorSignOff: true,
    doctorSignedAt: '2026-01-05 17:00'
  },
  'inm-108': {
    id: 'med-108',
    screeningDate: '2026-09-14',
    screeningTime: '17:10 PM',
    examiningOfficer: 'Dr. Edwin Kiprop, MBChB',
    medicalOfficerTitle: 'Central Remand Medical Superintendent',
    licenseNumber: 'KMPDC-REG-39102',
    facilityName: "King'ong'o Central Remand & Judicial Holding",
    fitnessForDetention: 'fit_with_restrictions',
    vitals: {
      bloodPressureSystolic: 130,
      bloodPressureDiastolic: 84,
      heartRateBpm: 78,
      respiratoryRate: 16,
      bodyTemperatureC: 36.9,
      oxygenSaturationPercent: 98,
      weightKg: 76.0,
      heightCm: 177,
      bmi: 24.3
    },
    initialScreeningNotes: 'Specialist Referral Pending: Remanded from court following bail revocation. Presents with marked right wrist deformity, swelling, and severe tenderness following a pre-arrest scuffle. Temporary plaster backslab applied. Plain X-rays show displaced intra-articular comminuted distal radius fracture with dorsal tilt. Mandated for immediate Orthopedic Surgeon consultation at Nyeri Provincial General Hospital for surgical reduction and casting.',
    chronicConditions: [
      'Displaced Intra-Articular Distal Radius Fracture - Right (ICD-10 S52.5)',
      'Acute Post-Traumatic Wrist Contusion & Edema'
    ],
    medicalFlagSeverity: 'needs_specialist',
    flaggedCondition: 'Orthopedic Surgery Consult (Displaced Distal Radius Fracture)',
    specialistReferralSpecialty: 'Orthopedic Surgery',
    mentalHealthScreening: {
      suicideRiskLevel: 'none',
      substanceWithdrawalRisk: false,
      priorPsychiatricHistory: false,
      observations: 'Oriented, distress secondary to acute wrist pain. Cooperating with medical protocol.'
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
        id: 'vax-108-1',
        vaccineName: 'Tetanus Toxoid Booster',
        dateAdministered: '2026-09-14',
        doseNumber: 1,
        batchLotNumber: 'TT-REM-2609',
        administeredBy: 'Nurse J. Wanjiku',
        clinicFacility: "King'ong'o Remand Clinic",
        status: 'completed'
      }
    ],
    allergies: [],
    currentMedications: [
      {
        name: 'Tramadol Hydrochloride 50mg',
        dosage: '1 capsule every 8 hours as needed for severe pain',
        frequency: 'TDS PRN',
        route: 'oral',
        heldByClinic: true
      },
      {
        name: 'Paracetamol 1000mg',
        dosage: '2 tablets every 6 hours',
        frequency: 'QID',
        route: 'oral',
        heldByClinic: true
      }
    ],
    dietaryMedicalRecommendation: 'Standard remand diet. Right arm arm-sling elevation maintained constantly.',
    followUpAppointmentDate: '2026-09-20',
    doctorSignOff: true,
    doctorSignedAt: '2026-09-14 18:00'
  }
};

