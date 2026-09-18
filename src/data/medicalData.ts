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
  }
};
