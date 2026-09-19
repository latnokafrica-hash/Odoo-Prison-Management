import { PrisonFacility, Inmate } from '../types';
import { INITIAL_MEDICAL_INTAKES } from './medicalData';

export const INITIAL_FACILITIES: PrisonFacility[] = [
  {
    id: 'FAC-01',
    code: 'KMS-PEN',
    name: 'Kamiti National Maximum Security Penitentiary',
    type: 'maximum',
    location: 'Kiambu / Nairobi Metro',
    county: 'Nairobi',
    capacity: 1400,
    currentInmates: 1680, // Overcrowded
    wardenName: 'Senior Supt. Josephat Mwangi',
    securityRating: 'Level 5 Supermax',
    coordinates: { x: 55, y: 48 }
  },
  {
    id: 'FAC-02',
    code: 'LWC-PRIS',
    name: "Lang'ata Women's Correctional Centre",
    type: 'womens',
    location: 'Langata Sub-County',
    county: 'Nairobi',
    capacity: 600,
    currentInmates: 492,
    wardenName: 'Supt. Grace Chebet',
    securityRating: 'Level 3 Medium/Close',
    coordinates: { x: 52, y: 52 }
  },
  {
    id: 'FAC-03',
    code: 'SLT-COAST',
    name: 'Shimo La Tewa Medium Security & Remand',
    type: 'medium',
    location: 'Mtwapa / Mombasa Coast',
    county: 'Mombasa',
    capacity: 1200,
    currentInmates: 1140,
    wardenName: 'Asst. Comm. Ali Hassan',
    securityRating: 'Level 3 Medium',
    coordinates: { x: 80, y: 78 }
  },
  {
    id: 'FAC-04',
    code: 'KNG-REM',
    name: "King'ong'o Central Remand & Judicial Holding",
    type: 'remand',
    location: 'Nyeri Highlands',
    county: 'Nyeri',
    capacity: 800,
    currentInmates: 890,
    wardenName: 'Supt. Duncan Kariuki',
    securityRating: 'Level 4 High Security Remand',
    coordinates: { x: 54, y: 38 }
  },
  {
    id: 'FAC-05',
    code: 'NVS-OPEN',
    name: 'Naivasha Open Camp & Agri-Rehab Trust',
    type: 'minimum',
    location: 'Lake Naivasha Basin',
    county: 'Nakuru',
    capacity: 500,
    currentInmates: 385,
    wardenName: 'Chief Inspector David Omondi',
    securityRating: 'Level 1 Open / Pre-Release Trust',
    coordinates: { x: 44, y: 45 }
  }
];

export const INITIAL_INMATES: Inmate[] = [
  {
    id: 'inm-101',
    bookingNumber: 'INM-2024-0089',
    firstName: 'Marcus',
    lastName: 'Kiprono',
    alias: 'The Hammer',
    gender: 'male',
    dateOfBirth: '1988-04-12',
    nationalIdNumber: 'ID-24890123',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    facilityId: 'FAC-01',
    facilityName: 'Kamiti National Maximum Security Penitentiary',
    cellLocation: 'Block C-12 (Isolation Wing)',
    admissionDate: '2024-02-15',
    admissionType: 'court_committal',
    custodyStatus: 'convicted',
    securityCategory: 'CAT_A',
    progressiveStage: 'stage_2',
    behaviorRating: 68,
    sentences: [
      {
        id: 'sen-01',
        courtName: 'Milimani High Court - Anti-Corruption & Robbery',
        caseNumber: 'HCC-CR-112/2023',
        judgeName: 'Hon. Justice Lady Ouko',
        dateConvicted: '2024-02-14',
        offense: 'Armed Robbery with Aggravating Circumstances (Cap 63 Sec 296)',
        termYears: 7,
        termMonths: 0,
        termDays: 0,
        sentenceType: 'determinate',
        structure: 'concurrent',
        statutoryRemissionFraction: 0.3333,
        remissionEarnedDays: 852, // 1/3 of 2,556 days
        remissionForfeitedDays: 28, // Disciplinary forfeiture for contraband phone
        netSentenceDays: 1732,
        earliestReleaseDate: '2028-11-12',
        latestReleaseDate: '2031-02-14',
        paroleEligibilityDate: '2027-05-15'
      }
    ],
    remissionLogs: [
      {
        id: 'rem-01',
        date: '2024-02-15',
        type: 'statutory_credit',
        days: 852,
        reason: 'Statutory 1/3 remission entitlement upon warrant validation (Prisons Act Sec 46)',
        adjudicator: 'Registrar of Warrants P. Ndegwa'
      },
      {
        id: 'rem-02',
        date: '2024-08-10',
        type: 'forfeiture_infraction',
        days: -28,
        reason: 'Disciplinary Tribunal Order: Possession of illicit SIM card in Cell C-12',
        adjudicator: 'Senior Supt. Josephat Mwangi (Disciplinary Board)'
      }
    ],
    propertyItems: [
      {
        id: 'prop-01',
        description: 'Citizen Eco-Drive Stainless Steel Watch',
        category: 'jewelry',
        quantity: 1,
        serialOrDetail: 'SN-449102-E',
        condition: 'Good working order',
        sealBagNumber: 'VAULT-SEC-8891',
        status: 'held_in_vault'
      },
      {
        id: 'prop-02',
        description: 'Cash Currency (KES)',
        category: 'cash',
        quantity: 18500,
        condition: 'Mint notes',
        sealBagNumber: 'VAULT-CASH-1022',
        status: 'held_in_vault'
      },
      {
        id: 'prop-03',
        description: 'Samsung Galaxy A53 Smartphone',
        category: 'electronics',
        quantity: 1,
        serialOrDetail: 'IMEI-3589920192',
        condition: 'Minor scratch on rear glass',
        sealBagNumber: 'VAULT-ELEC-4402',
        status: 'held_in_vault'
      }
    ],
    gratuityBalance: 245.50,
    gratuityTransactions: [
      {
        id: 'gt-01',
        date: '2024-06-30',
        type: 'wage_credit',
        amount: 85.00,
        description: 'Masonry workshop labor allowance (34 days @ $2.50)',
        balanceAfter: 85.00,
        verifiedBy: 'Welfare Officer R. Kimani'
      },
      {
        id: 'gt-02',
        date: '2024-07-15',
        type: 'commissary_debit',
        amount: -25.00,
        description: 'Approved toiletries and stamp requisition',
        balanceAfter: 60.00,
        verifiedBy: 'Storekeeper Sgt. Otieno'
      },
      {
        id: 'gt-03',
        date: '2024-11-30',
        type: 'wage_credit',
        amount: 185.50,
        description: 'Carpentry & Joinery furniture production wage share',
        balanceAfter: 245.50,
        verifiedBy: 'Industrial Training Master C. Mboya'
      }
    ],
    programs: [
      {
        id: 'prg-01',
        programId: 'VOC-CARPENTRY',
        programName: 'Grade II Joinery & Timber Craftsmanship',
        category: 'vocational',
        enrollmentDate: '2024-04-01',
        progressPercent: 78,
        status: 'in_progress',
        dailyEarningRate: 2.50,
        instructor: 'Master Craftsman S. Wekesa'
      }
    ],
    courtCases: [
      {
        id: 'crt-01',
        inmateId: 'inm-101',
        inmateName: 'Marcus Kiprono',
        bookingNumber: 'INM-2024-0089',
        caseNumber: 'CA-CR-22/2024',
        courtName: 'Court of Appeal - Criminal Division',
        hearingDate: '2026-09-24',
        hearingTime: '09:30 AM',
        hearingType: 'appeal',
        courtMode: 'physical_court',
        escortTeam: 'Tactical Prison Escort Unit (TPEU Alpha 2)',
        transportVehicleNumber: 'GK-B842A (Armored Cell Van)',
        status: 'scheduled',
        judgeName: 'Hon. Justice Gatembu Kairu'
      }
    ],
    transfers: [
      {
        id: 'trf-01',
        inmateId: 'inm-101',
        inmateName: 'Marcus Kiprono',
        bookingNumber: 'INM-2024-0089',
        fromFacilityId: 'FAC-04',
        fromFacilityName: "King'ong'o Central Remand",
        toFacilityId: 'FAC-01',
        toFacilityName: 'Kamiti National Maximum Security',
        requisitionDate: '2024-02-15',
        transferReason: 'security_reclassification',
        authorizedBy: 'Commissioner General of Prisons',
        escortLevel: 'armed_tactical',
        status: 'completed',
        transitDispatchedAt: '2024-02-15 06:00',
        arrivalConfirmedAt: '2024-02-15 11:30'
      }
    ],
    humanRightsAudits: [
      {
        id: 'hra-01',
        inmateId: 'inm-101',
        date: '2024-08-15',
        inspectionType: 'solitary_review',
        complianceStatus: 'compliant',
        outdoorHoursPerDay: 1.5,
        consecutiveSolitaryDays: 4,
        medicalVisitsCount: 4,
        complaintsLogged: ['Requested additional blanket during cold spell'],
        auditorName: 'Dr. Sarah Nduta (Medical Officer of Health)',
        recommendations: 'Solitary confinement within Nelson Mandela Rules limit (<15 days). Certified fit.'
      }
    ],
    dietaryMedicalNotes: 'Asthmatic. Salbutamol inhaler registered with Medical Bay.',
    medicalIntake: INITIAL_MEDICAL_INTAKES['inm-101'],
    emergencyContact: {
      name: 'Esther Chemutai',
      relationship: 'Sister',
      phone: '+254 722 918 201'
    },
    chatterLogs: [
      {
        id: 'ch-01',
        date: '2024-02-15 08:30',
        author: 'Admissions Officer Sgt. Barasa',
        message: 'Admission completed. Fingerprints cross-checked with National Criminal Records Bureau. Tagged CAT A.',
        type: 'log_note'
      },
      {
        id: 'ch-02',
        date: '2024-08-10 14:15',
        author: 'Disciplinary Clerk Mwangi',
        message: 'Hearing concluded for illicit phone possession. Forfeiture of 28 statutory remission days entered.',
        type: 'system'
      }
    ]
  },
  {
    id: 'inm-102',
    bookingNumber: 'REM-2026-0412',
    firstName: 'Brian',
    lastName: 'Omondi',
    alias: 'Professor',
    gender: 'male',
    dateOfBirth: '1995-11-03',
    nationalIdNumber: 'ID-32904812',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    facilityId: 'FAC-04',
    facilityName: "King'ong'o Central Remand & Judicial Holding",
    cellLocation: 'Remand Dormitory 4',
    admissionDate: '2026-08-01',
    admissionType: 'court_committal',
    custodyStatus: 'remand',
    securityCategory: 'CAT_C',
    progressiveStage: 'stage_1',
    behaviorRating: 85,
    sentences: [],
    remissionLogs: [],
    propertyItems: [
      {
        id: 'prop-102-1',
        description: 'Leather Wallet with Identity Card and Bank Cards',
        category: 'documents',
        quantity: 1,
        condition: 'Good',
        sealBagNumber: 'REM-BAG-771',
        status: 'held_in_vault'
      },
      {
        id: 'prop-102-2',
        description: 'Silver Wedding Band',
        category: 'jewelry',
        quantity: 1,
        condition: 'Good',
        sealBagNumber: 'REM-BAG-772',
        status: 'held_in_vault'
      }
    ],
    gratuityBalance: 0,
    gratuityTransactions: [],
    programs: [
      {
        id: 'prg-102-1',
        programId: 'EDU-LEGAL',
        programName: 'Legal Aid & Paralegal Defense Rights Clinic',
        category: 'education',
        enrollmentDate: '2026-08-10',
        progressPercent: 45,
        status: 'in_progress',
        dailyEarningRate: 0,
        instructor: 'Advocate J. Mboya (Legal Aid Trust)'
      }
    ],
    courtCases: [
      {
        id: 'crt-102-1',
        inmateId: 'inm-102',
        inmateName: 'Brian Omondi',
        bookingNumber: 'REM-2026-0412',
        caseNumber: 'NYR-MC-CR-459/2026',
        courtName: 'Nyeri Chief Magistrate Criminal Court 2',
        hearingDate: '2026-09-18', // Today!
        hearingTime: '10:00 AM',
        hearingType: 'bail_hearing',
        courtMode: 'virtual_video_link',
        escortTeam: 'Judicial Video Link Booth 3 (Virtual)',
        transportVehicleNumber: 'N/A (Virtual Appearance)',
        status: 'at_court',
        judgeName: 'Hon. Chief Magistrate W. Cheruiyot',
        outcomeNotes: 'Bail review pending sureties verification'
      },
      {
        id: 'crt-102-2',
        inmateId: 'inm-102',
        inmateName: 'Brian Omondi',
        bookingNumber: 'REM-2026-0412',
        caseNumber: 'NYR-MC-CR-459/2026',
        courtName: 'Nyeri Chief Magistrate Criminal Court 2',
        hearingDate: '2026-10-04',
        hearingTime: '09:00 AM',
        hearingType: 'trial_hearing',
        courtMode: 'physical_court',
        escortTeam: 'Remand Escort Unit Delta',
        transportVehicleNumber: 'GK-B102P',
        status: 'scheduled',
        judgeName: 'Hon. Chief Magistrate W. Cheruiyot'
      }
    ],
    transfers: [],
    humanRightsAudits: [
      {
        id: 'hra-102-1',
        inmateId: 'inm-102',
        date: '2026-08-20',
        inspectionType: 'un_mandela_rules',
        complianceStatus: 'compliant',
        outdoorHoursPerDay: 2.0,
        consecutiveSolitaryDays: 0,
        medicalVisitsCount: 2,
        complaintsLogged: [],
        auditorName: 'Kenya National Commission on Human Rights (KNCHR)',
        recommendations: 'Remand classification confirmed. Access to defense counsel regular.'
      }
    ],
    medicalIntake: INITIAL_MEDICAL_INTAKES['inm-102'],
    emergencyContact: {
      name: 'Beatrice Omondi',
      relationship: 'Spouse',
      phone: '+254 711 384 920'
    },
    chatterLogs: [
      {
        id: 'ch-102-1',
        date: '2026-08-01 11:20',
        author: 'Intake Desk Nyeri',
        message: 'Admitted on remand warrant from Central Police Station. Awaiting bail ruling.',
        type: 'log_note'
      }
    ]
  },
  {
    id: 'inm-103',
    bookingNumber: 'INM-2022-0198',
    firstName: 'Stephen',
    lastName: 'Wanyonyi',
    alias: 'Fox',
    gender: 'male',
    dateOfBirth: '1982-07-22',
    nationalIdNumber: 'ID-18290344',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
    facilityId: 'FAC-01',
    facilityName: 'Kamiti National Maximum Security Penitentiary',
    cellLocation: 'High Security Isolation Isolation Unit #2',
    admissionDate: '2022-05-18',
    admissionType: 'recaptured',
    custodyStatus: 'recaptured',
    securityCategory: 'CAT_A',
    progressiveStage: 'stage_1',
    behaviorRating: 40,
    sentences: [
      {
        id: 'sen-103-1',
        courtName: 'High Court at Bungoma',
        caseNumber: 'BGM-HC-CR-89/2021',
        judgeName: 'Hon. Justice Stephen Radido',
        dateConvicted: '2022-05-10',
        offense: 'Escape from Lawful Custody & Aggravated Assault on Officer',
        termYears: 10,
        termMonths: 6,
        termDays: 0,
        sentenceType: 'determinate',
        structure: 'consecutive',
        statutoryRemissionFraction: 0.3333,
        remissionEarnedDays: 1278,
        remissionForfeitedDays: 180, // Heavy forfeiture after recapture
        netSentenceDays: 2735,
        earliestReleaseDate: '2030-08-19',
        latestReleaseDate: '2032-11-18',
        paroleEligibilityDate: '2029-01-10'
      }
    ],
    remissionLogs: [
      {
        id: 'rem-103-1',
        date: '2022-05-18',
        type: 'statutory_credit',
        days: 1278,
        reason: 'Statutory 1/3 remission calculation on 10.5 year sentence',
        adjudicator: 'Prisons Board'
      },
      {
        id: 'rem-103-2',
        date: '2023-11-04',
        type: 'forfeiture_infraction',
        days: -180,
        reason: 'Court Sentence Penalty: Forfeiture of all accrued remission following escape and recapture in Busia border',
        adjudicator: 'Hon. Magistrate / Special Inquiry Court'
      }
    ],
    propertyItems: [],
    gratuityBalance: 12.00,
    gratuityTransactions: [],
    programs: [],
    courtCases: [],
    transfers: [
      {
        id: 'trf-103-1',
        inmateId: 'inm-103',
        inmateName: 'Stephen Wanyonyi',
        bookingNumber: 'INM-2022-0198',
        fromFacilityId: 'FAC-03',
        fromFacilityName: 'Shimo La Tewa Medium Security',
        toFacilityId: 'FAC-01',
        toFacilityName: 'Kamiti National Maximum Security',
        requisitionDate: '2023-11-15',
        transferReason: 'security_reclassification',
        authorizedBy: 'Inspector General of Prisons',
        escortLevel: 'armed_tactical',
        status: 'completed',
        transitDispatchedAt: '2023-11-15 04:00',
        arrivalConfirmedAt: '2023-11-15 13:45'
      }
    ],
    escapeIncidents: [
      {
        id: 'esc-01',
        inmateId: 'inm-103',
        inmateName: 'Stephen Wanyonyi',
        bookingNumber: 'INM-2022-0198',
        incidentDate: '2023-10-18',
        escapeLocation: 'Perimeter Wall Sector 4 - External Perimeter Breach',
        facilityId: 'FAC-03',
        facilityName: 'Shimo La Tewa Medium Security',
        methodOfEscape: 'Scaled inner perimeter fence using fabricated rope ladder during electrical blackout.',
        dangerLevel: 'EXTREME',
        status: 'RECAPTURED',
        recaptureDate: '2023-11-02',
        recapturingAgency: 'Joint Anti-Terror & Flying Squad DCI Unit at Malaba Border',
        disciplinaryActionNotes: 'Demoted from Stage 3 to Stage 1. 180 days remission forfeited. Transfer to Maximum Supermax isolation.',
        remissionDaysForfeited: 180
      }
    ],
    humanRightsAudits: [
      {
        id: 'hra-103-1',
        inmateId: 'inm-103',
        date: '2024-03-12',
        inspectionType: 'solitary_review',
        complianceStatus: 'minor_issue',
        outdoorHoursPerDay: 1.0,
        consecutiveSolitaryDays: 14, // Near 15 days limit
        medicalVisitsCount: 6,
        complaintsLogged: ['Complains of lack of natural light in isolation wing'],
        auditorName: 'Ombudsman Officer L. Odhiambo',
        recommendations: 'CRITICAL: Must rotate out of solitary confinement within 24 hours to prevent Mandela Rule 43 violation.'
      }
    ],
    medicalIntake: INITIAL_MEDICAL_INTAKES['inm-103'],
    emergencyContact: {
      name: 'Geoffrey Wanyonyi',
      relationship: 'Brother',
      phone: '+254 733 881 922'
    },
    chatterLogs: [
      {
        id: 'ch-103-1',
        date: '2023-11-03 09:00',
        author: 'Commandant Operations',
        message: 'Recaptured fugitive processed at Busia, escorted under high security to Kamiti Supermax. Red Alert cancelled.',
        type: 'activity'
      }
    ]
  },
  {
    id: 'inm-104',
    bookingNumber: 'INM-2021-0842',
    firstName: 'Grace',
    lastName: 'Achieng',
    alias: 'Mama Joy',
    gender: 'female',
    dateOfBirth: '1979-09-14',
    nationalIdNumber: 'ID-14890234',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    facilityId: 'FAC-02',
    facilityName: "Lang'ata Women's Correctional Centre",
    cellLocation: 'Progression Hostel Block A',
    admissionDate: '2021-03-10',
    admissionType: 'court_committal',
    custodyStatus: 'convicted',
    securityCategory: 'CAT_C',
    progressiveStage: 'stage_4',
    behaviorRating: 98,
    sentences: [
      {
        id: 'sen-104-1',
        courtName: 'Nairobi High Court Criminal Division',
        caseNumber: 'CR-772/2020',
        judgeName: 'Hon. Justice Daniel Musinga',
        dateConvicted: '2021-03-05',
        offense: 'Embezzlement of Public Funds (Anti-Corruption & Economic Crimes Act)',
        termYears: 5,
        termMonths: 0,
        termDays: 0,
        sentenceType: 'determinate',
        structure: 'concurrent',
        statutoryRemissionFraction: 0.3333,
        remissionEarnedDays: 608,
        remissionForfeitedDays: 0,
        netSentenceDays: 1218,
        earliestReleaseDate: '2024-07-06',
        latestReleaseDate: '2026-03-05',
        paroleEligibilityDate: '2023-10-15'
      }
    ],
    remissionLogs: [
      {
        id: 'rem-104-1',
        date: '2021-03-10',
        type: 'statutory_credit',
        days: 608,
        reason: 'Statutory 1/3 remission clean record computation',
        adjudicator: 'Prisons Registrar'
      },
      {
        id: 'rem-104-2',
        date: '2023-12-12',
        type: 'restoration_merit',
        days: 15,
        reason: 'Special Jamhuri Day Presidential Merit Commendation for teaching peer literacy',
        adjudicator: 'Power of Mercy Advisory Committee'
      }
    ],
    propertyItems: [
      {
        id: 'prop-104-1',
        description: 'Gold Chain with Locket',
        category: 'jewelry',
        quantity: 1,
        condition: 'Intact',
        sealBagNumber: 'LWC-VAULT-419',
        status: 'held_in_vault'
      },
      {
        id: 'prop-104-2',
        description: 'Personal Identity & Academic Certificates (Degree in Accounting)',
        category: 'documents',
        quantity: 3,
        condition: 'Laminated, preserved',
        sealBagNumber: 'LWC-DOC-112',
        status: 'held_in_vault'
      }
    ],
    gratuityBalance: 612.80,
    gratuityTransactions: [
      {
        id: 'gt-104-1',
        date: '2024-01-31',
        type: 'wage_credit',
        amount: 140.00,
        description: 'Instructor allowance: Head of Tailoring & Garment Export Project',
        balanceAfter: 612.80,
        verifiedBy: 'Welfare Supt. G. Chebet'
      }
    ],
    programs: [
      {
        id: 'prg-104-1',
        programId: 'VOC-TEXTILE',
        programName: 'Industrial Garment Design & Export Quality Control',
        category: 'vocational',
        enrollmentDate: '2021-06-01',
        progressPercent: 100,
        status: 'completed',
        dailyEarningRate: 3.50,
        instructor: 'Senior Instructor M. Nzioka'
      }
    ],
    courtCases: [],
    transfers: [],
    humanRightsAudits: [
      {
        id: 'hra-104-1',
        date: '2024-06-05',
        inmateId: 'inm-104',
        inspectionType: 'un_mandela_rules',
        complianceStatus: 'compliant',
        outdoorHoursPerDay: 4.5,
        consecutiveSolitaryDays: 0,
        medicalVisitsCount: 5,
        complaintsLogged: [],
        auditorName: 'UNODC Corrections Monitoring Mission',
        recommendations: 'Exemplary compliance with Bangkok Rules for Women Prisoners.'
      }
    ],
    dischargeRecord: {
      id: 'dis-104-1',
      inmateId: 'inm-104',
      dischargeDate: '2026-09-20', // Due in 2 days!
      dischargeType: 'sentence_expiry',
      fingerprintVerified: true,
      noHoldWarrantVerified: true,
      propertyHandoverCompleted: false, // In progress
      gratuitySettledAmount: 612.80,
      gratuityDisbursed: false,
      transportVoucherIssued: true,
      aftercareOfficerAssigned: 'Probation Officer Faith Mutiso (Nairobi West)',
      gatePassNumber: 'GP-LWC-2026-089',
      status: 'checklist_in_progress'
    },
    medicalIntake: INITIAL_MEDICAL_INTAKES['inm-104'],
    emergencyContact: {
      name: 'Daniel Otieno',
      relationship: 'Son',
      phone: '+254 721 908 112'
    },
    chatterLogs: [
      {
        id: 'ch-104-1',
        date: '2026-09-15 10:00',
        author: 'Discharge Officer Insp. Kilonzo',
        message: 'Exit checklist initiated. Fingerprint biometric cleared. Pending final property locker opening and gratuity cash voucher.',
        type: 'activity'
      }
    ]
  },
  {
    id: 'inm-105',
    bookingNumber: 'INM-2023-0914',
    firstName: 'Peter',
    lastName: 'Kariuki',
    alias: 'Karis',
    gender: 'male',
    dateOfBirth: '1991-03-30',
    nationalIdNumber: 'ID-28190554',
    photoUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300&auto=format&fit=crop&q=80',
    facilityId: 'FAC-05',
    facilityName: 'Naivasha Open Camp & Agri-Rehab Trust',
    cellLocation: 'Open Dormitory B, Bed 12',
    admissionDate: '2023-08-11',
    admissionType: 'transfer_in',
    custodyStatus: 'convicted',
    securityCategory: 'CAT_D',
    progressiveStage: 'stage_4',
    behaviorRating: 94,
    sentences: [
      {
        id: 'sen-105-1',
        courtName: 'Nakuru Magistrate Court',
        caseNumber: 'NK-CR-1102/2023',
        judgeName: 'Hon. Senior Resident Magistrate Kimondo',
        dateConvicted: '2023-08-01',
        offense: 'Stock Theft (Recovered livestock)',
        termYears: 3,
        termMonths: 0,
        termDays: 0,
        sentenceType: 'determinate',
        structure: 'concurrent',
        statutoryRemissionFraction: 0.3333,
        remissionEarnedDays: 365,
        remissionForfeitedDays: 0,
        netSentenceDays: 730,
        earliestReleaseDate: '2025-08-01',
        latestReleaseDate: '2026-08-01',
        paroleEligibilityDate: '2024-12-01'
      }
    ],
    remissionLogs: [],
    propertyItems: [],
    gratuityBalance: 420.00,
    gratuityTransactions: [
      {
        id: 'gt-105-1',
        date: '2024-05-31',
        type: 'wage_credit',
        amount: 90.00,
        description: 'Horticulture greenhouse cultivation & dairy cattle management',
        balanceAfter: 420.00,
        verifiedBy: 'Agri-Manager Officer Wachira'
      }
    ],
    programs: [
      {
        id: 'prg-105-1',
        programId: 'VOC-AGRI',
        programName: 'Modern Dairy Farming & Greenhouse Drip Irrigation',
        category: 'vocational',
        enrollmentDate: '2023-09-01',
        progressPercent: 90,
        status: 'in_progress',
        dailyEarningRate: 3.00,
        instructor: 'Officer J. Wachira (Agricultural Extension)'
      }
    ],
    courtCases: [],
    transfers: [
      {
        id: 'trf-105-1',
        inmateId: 'inm-105',
        inmateName: 'Peter Kariuki',
        bookingNumber: 'INM-2023-0914',
        fromFacilityId: 'FAC-01',
        fromFacilityName: 'Kamiti Maximum Security',
        toFacilityId: 'FAC-05',
        toFacilityName: 'Naivasha Open Camp',
        requisitionDate: '2023-08-10',
        transferReason: 'vocational_training',
        authorizedBy: 'Classification Board',
        escortLevel: 'minimum_custody',
        status: 'completed',
        transitDispatchedAt: '2023-08-11 07:00',
        arrivalConfirmedAt: '2023-08-11 10:30'
      }
    ],
    humanRightsAudits: [],
    medicalIntake: INITIAL_MEDICAL_INTAKES['inm-105'],
    emergencyContact: {
      name: 'Mary Wanjiku',
      relationship: 'Mother',
      phone: '+254 723 118 902'
    },
    chatterLogs: []
  },
  {
    id: 'inm-106',
    bookingNumber: 'INM-2025-0114',
    firstName: 'Hassan',
    lastName: 'Abdalla',
    alias: 'Captain',
    gender: 'male',
    dateOfBirth: '1985-02-18',
    nationalIdNumber: 'ID-21098453',
    photoUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=300&auto=format&fit=crop&q=80',
    facilityId: 'FAC-03',
    facilityName: 'Shimo La Tewa Medium Security & Remand',
    cellLocation: 'Block D (Transit Holding)',
    admissionDate: '2025-01-12',
    admissionType: 'court_committal',
    custodyStatus: 'in_transit',
    securityCategory: 'CAT_B',
    progressiveStage: 'stage_2',
    behaviorRating: 72,
    sentences: [
      {
        id: 'sen-106-1',
        courtName: 'Mombasa High Court',
        caseNumber: 'MSA-CR-301/2024',
        judgeName: 'Hon. Justice Eric Ogola',
        dateConvicted: '2025-01-10',
        offense: 'Maritime Smuggling & Contraband Transit (Customs Act)',
        termYears: 4,
        termMonths: 0,
        termDays: 0,
        sentenceType: 'determinate',
        structure: 'concurrent',
        statutoryRemissionFraction: 0.3333,
        remissionEarnedDays: 486,
        remissionForfeitedDays: 0,
        netSentenceDays: 974,
        earliestReleaseDate: '2027-09-12',
        latestReleaseDate: '2029-01-10',
        paroleEligibilityDate: '2026-05-10'
      }
    ],
    remissionLogs: [],
    propertyItems: [],
    gratuityBalance: 88.00,
    gratuityTransactions: [],
    programs: [],
    courtCases: [],
    transfers: [
      {
        id: 'trf-106-1',
        inmateId: 'inm-106',
        inmateName: 'Hassan Abdalla',
        bookingNumber: 'INM-2025-0114',
        fromFacilityId: 'FAC-03',
        fromFacilityName: 'Shimo La Tewa Medium Security',
        toFacilityId: 'FAC-01',
        toFacilityName: 'Kamiti National Maximum Security',
        requisitionDate: '2026-09-17',
        transferReason: 'overcrowding_relief',
        authorizedBy: 'Director of Custody Operations',
        escortLevel: 'standard_escort',
        status: 'in_transit',
        transitDispatchedAt: '2026-09-18 05:30' // Dispatched today
      }
    ],
    humanRightsAudits: [],
    medicalIntake: INITIAL_MEDICAL_INTAKES['inm-106'],
    emergencyContact: {
      name: 'Amina Abdalla',
      relationship: 'Spouse',
      phone: '+254 734 509 118'
    },
    chatterLogs: [
      {
        id: 'ch-106-1',
        date: '2026-09-18 05:45',
        author: 'Transport Convoy Leader Sgt. Wambua',
        message: 'Departed Mombasa for Nairobi in Armed Convoy GK-B771. Expected transit time 7 hours.',
        type: 'activity'
      }
    ]
  },
  {
    id: 'inm-107',
    bookingNumber: 'INM-2026-0012',
    firstName: 'Jackson',
    lastName: 'Ndung\'u',
    alias: 'Smiley',
    gender: 'male',
    dateOfBirth: '1992-12-05',
    nationalIdNumber: 'ID-29845112',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80',
    facilityId: 'FAC-01',
    facilityName: 'Kamiti National Maximum Security Penitentiary',
    cellLocation: 'Special Alert Block S-1',
    admissionDate: '2026-01-05',
    admissionType: 'court_committal',
    custodyStatus: 'escaped',
    securityCategory: 'CAT_A',
    progressiveStage: 'stage_1',
    behaviorRating: 30,
    sentences: [
      {
        id: 'sen-107-1',
        courtName: 'Kajiado High Court',
        caseNumber: 'KJD-CR-99/2025',
        judgeName: 'Hon. Justice Nyakundi',
        dateConvicted: '2026-01-04',
        offense: 'Organized Carjacking & Firearm Possession',
        termYears: 8,
        termMonths: 0,
        termDays: 0,
        sentenceType: 'determinate',
        structure: 'concurrent',
        statutoryRemissionFraction: 0.3333,
        remissionEarnedDays: 973,
        remissionForfeitedDays: 0,
        netSentenceDays: 1947,
        earliestReleaseDate: '2031-05-02',
        latestReleaseDate: '2034-01-04',
        paroleEligibilityDate: '2029-08-01'
      }
    ],
    remissionLogs: [],
    propertyItems: [],
    gratuityBalance: 0,
    gratuityTransactions: [],
    programs: [],
    courtCases: [],
    transfers: [],
    escapeIncidents: [
      {
        id: 'esc-107-1',
        inmateId: 'inm-107',
        inmateName: 'Jackson Ndung\'u',
        bookingNumber: 'INM-2026-0012',
        incidentDate: '2026-09-16', // 2 days ago
        escapeLocation: 'Kenyatta National Hospital Referral Ward 4 (Under Armed Guard)',
        facilityId: 'FAC-01',
        facilityName: 'Kamiti National Maximum Security',
        methodOfEscape: 'Slipped handcuffs in bathroom while receiving emergency kidney dialysis; accomplice provided getaway motorbike.',
        dangerLevel: 'EXTREME',
        status: 'AT_LARGE',
        disciplinaryActionNotes: 'Red Alert broadcast to all border posts, DCI Cyber Crime and Interpol. Lockdown protocol initiated.'
      }
    ],
    humanRightsAudits: [],
    medicalIntake: INITIAL_MEDICAL_INTAKES['inm-107'],
    emergencyContact: {
      name: 'Samuel Ndung\'u',
      relationship: 'Father',
      phone: '+254 722 001 928'
    },
    chatterLogs: [
      {
        id: 'ch-107-1',
        date: '2026-09-16 22:40',
        author: 'Commandant Operations',
        message: 'CRITICAL ALERT: Prisoner escaped from medical referral ward. Red Notice dispatched.',
        type: 'system'
      }
    ]
  },
  {
    id: 'inm-108',
    bookingNumber: 'REM-2026-0819',
    firstName: 'Victor',
    lastName: 'Kiptoo',
    alias: 'Ruto',
    gender: 'male',
    dateOfBirth: '1997-06-11',
    nationalIdNumber: 'ID-34901822',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    facilityId: 'FAC-04',
    facilityName: "King'ong'o Central Remand & Judicial Holding",
    cellLocation: 'Bail Re-admissions Holding Wing',
    admissionDate: '2026-09-14',
    admissionType: 'bail_revocation',
    custodyStatus: 'remand',
    securityCategory: 'CAT_B',
    progressiveStage: 'stage_1',
    behaviorRating: 60,
    sentences: [],
    remissionLogs: [],
    propertyItems: [
      {
        id: 'prop-108-1',
        description: 'Bail Revocation Warrant & Police Surrender Notice',
        category: 'documents',
        quantity: 1,
        condition: 'Official court seal',
        sealBagNumber: 'REM-NYR-221',
        status: 'held_in_vault'
      }
    ],
    gratuityBalance: 0,
    gratuityTransactions: [],
    programs: [],
    courtCases: [
      {
        id: 'crt-108-1',
        inmateId: 'inm-108',
        inmateName: 'Victor Kiptoo',
        bookingNumber: 'REM-2026-0819',
        caseNumber: 'NYR-CR-892/2026',
        courtName: 'Nyeri Chief Magistrate Court 1',
        hearingDate: '2026-09-19', // Tomorrow
        hearingTime: '09:00 AM',
        hearingType: 'mention',
        courtMode: 'physical_court',
        escortTeam: 'Remand Escort Unit Alpha',
        transportVehicleNumber: 'GK-B102P',
        status: 'scheduled',
        judgeName: 'Hon. Principal Magistrate Kariuki',
        outcomeNotes: 'Bail forfeited due to witness tampering allegation; committal to trial docket.'
      }
    ],
    transfers: [],
    humanRightsAudits: [],
    medicalIntake: INITIAL_MEDICAL_INTAKES['inm-108'],
    emergencyContact: {
      name: 'Priscilla Kiptoo',
      relationship: 'Mother',
      phone: '+254 728 991 204'
    },
    chatterLogs: [
      {
        id: 'ch-108-1',
        date: '2026-09-14 16:30',
        author: 'Prosecution Liaison Desk',
        message: 'Re-admitted after High Court cancelled cash bail of KES 500,000 for failure to surrender passport.',
        type: 'log_note'
      }
    ]
  }
];

export const VOCATIONAL_PROGRAMS = [
  {
    id: 'VOC-CARPENTRY',
    name: 'Grade II Joinery & Timber Craftsmanship',
    category: 'vocational',
    dailyWage: 2.50,
    durationWeeks: 24,
    skillsLearned: ['Furniture fabrication', 'Roof truss joinery', 'Wood lathe finishing'],
    certifyingBody: 'National Industrial Training Authority (NITA)'
  },
  {
    id: 'VOC-TEXTILE',
    name: 'Industrial Garment Design & Tailoring',
    category: 'vocational',
    dailyWage: 3.50,
    durationWeeks: 36,
    skillsLearned: ['Uniform mass production', 'Embroidery', 'Export quality control'],
    certifyingBody: 'Export Processing Zones Authority & NITA'
  },
  {
    id: 'VOC-AGRI',
    name: 'Modern Dairy Farming & Greenhouse Drip Irrigation',
    category: 'vocational',
    dailyWage: 3.00,
    durationWeeks: 16,
    skillsLearned: ['Hydroponics', 'Dairy herd genetics', 'Silage preservation'],
    certifyingBody: 'Ministry of Agriculture & Livestock Research'
  },
  {
    id: 'VOC-IT',
    name: 'Computer Literacy, Data Entry & Coding Basics',
    category: 'education',
    dailyWage: 2.00,
    durationWeeks: 12,
    skillsLearned: ['Office Productivity', 'Web Fundamentals', 'Typing 50wpm'],
    certifyingBody: 'ICT Authority Kenya'
  },
  {
    id: 'VOC-MASONRY',
    name: 'Brick Making & Architectural Masonry',
    category: 'vocational',
    dailyWage: 2.80,
    durationWeeks: 20,
    skillsLearned: ['Interlocking stabilized soil blocks', 'Concreting', 'Plastering'],
    certifyingBody: 'National Construction Authority'
  }
];

export const ODOO_19_CODE_BLUEPRINTS = {
  manifest: `// Odoo 19 Corrections ERP - __manifest__.py
{
    'name': 'Odoo 19 Corrections & Prison Management ERP',
    'version': '19.0.1.0.0',
    'category': 'Public Administration/Security',
    'summary': 'End-to-end Prison & Inmate Lifecycle Management for National Correctional Services',
    'author': 'Directorate of Correctional Services / Odoo ERP Experts',
    'license': 'LGPL-3',
    'depends': [
        'base',
        'mail',
        'resource',
        'hr',
        'account',
        'fleet',
        'board'
    ],
    'data': [
        'security/prison_security.xml',
        'security/ir.model.access.csv',
        'data/prison_stage_data.xml',
        'data/remission_rule_data.xml',
        'views/prison_facility_views.xml',
        'views/prison_inmate_views.xml',
        'views/prison_sentence_views.xml',
        'views/prison_court_views.xml',
        'views/prison_transfer_views.xml',
        'views/prison_discharge_views.xml',
        'views/prison_human_rights_views.xml',
        'views/prison_gratuity_views.xml',
        'views/prison_menu_views.xml',
        'report/inmate_badge_report.xml',
        'report/gate_pass_clearance_report.xml',
        'report/remission_certificate_report.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'prison_management/static/src/scss/prison_dashboard.scss',
            'prison_management/static/src/js/remission_calculator_widget.js',
            'prison_management/static/src/xml/inmate_kanban_templates.xml',
        ],
    },
    'application': True,
    'installable': True,
    'auto_install': False,
}`,
  pythonModels: `# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError, UserError
from datetime import date, timedelta
from dateutil.relativedelta import relativedelta

class PrisonFacility(models.Model):
    _name = 'prison.facility'
    _description = 'Correctional Facility / Prison'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char(string='Facility Name', required=True, tracking=True)
    code = fields.Char(string='Facility Code', required=True, index=True)
    facility_type = fields.Selection([
        ('maximum', 'Maximum Security Penitentiary'),
        ('medium', 'Medium Security Facility'),
        ('minimum', 'Minimum Security / Open Camp'),
        ('remand', 'Remand & Judicial Holding Center'),
        ('womens', "Women's Correctional Center"),
        ('youth', 'Youth Borstal Institution'),
    ], string='Classification Level', required=True, default='medium')
    capacity = fields.Integer(string='Standard Bed Capacity', required=True)
    current_inmate_count = fields.Integer(
        string='Current Inmates', compute='_compute_inmate_stats', store=True
    )
    occupancy_rate = fields.Float(
        string='Occupancy Rate (%)', compute='_compute_inmate_stats', store=True
    )
    is_overcrowded = fields.Boolean(
        string='Overcrowded Alert', compute='_compute_inmate_stats', store=True
    )
    warden_id = fields.Many2one('res.users', string='Superintendent / Warden', tracking=True)
    inmate_ids = fields.One2many('prison.inmate', 'facility_id', string='Inmate Population')

    @api.depends('capacity', 'inmate_ids.custody_status')
    def _compute_inmate_stats(self):
        for fac in self:
            active_inmates = fac.inmate_ids.filtered(
                lambda i: i.custody_status in ['remand', 'convicted', 'recaptured']
            )
            count = len(active_inmates)
            fac.current_inmate_count = count
            rate = (count / fac.capacity * 100.0) if fac.capacity > 0 else 0.0
            fac.occupancy_rate = round(rate, 1)
            fac.is_overcrowded = rate > 100.0


class PrisonInmate(models.Model):
    _name = 'prison.inmate'
    _description = 'Inmate / Prisoner Profile'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'admission_date desc, id desc'

    name = fields.Char(string='Full Legal Name', required=True, tracking=True)
    booking_number = fields.Char(
        string='Booking Number', readonly=True, copy=False, default=lambda self: _('New')
    )
    alias = fields.Char(string='Street Alias / Moniker')
    gender = fields.Selection([('male', 'Male'), ('female', 'Female'), ('other', 'Other')], required=True)
    dob = fields.Date(string='Date of Birth', required=True)
    national_id = fields.Char(string='National ID / Passport #', index=True)
    photo = fields.Binary(string='Booking Mugshot', attachment=True)
    
    facility_id = fields.Many2one(
        'prison.facility', string='Current Prison Facility', required=True, tracking=True
    )
    cell_location = fields.Char(string='Cell / Ward Block', tracking=True)
    admission_date = fields.Date(string='Admission Date', default=fields.Date.today, required=True)
    admission_type = fields.Selection([
        ('court_committal', 'Fresh Court Committal Warrant'),
        ('transfer_in', 'Inter-Prison Transfer Inward'),
        ('bail_revocation', 'Re-Admit After Bail Cancellation'),
        ('recaptured', 'Recapture After Escape Incident'),
    ], string='Admission Type', required=True, default='court_committal')

    custody_status = fields.Selection([
        ('draft', 'Booking in Progress'),
        ('remand', 'Remand (Awaiting Trial)'),
        ('convicted', 'Serving Custodial Sentence'),
        ('in_transit', 'In Transit / Transfer Convoy'),
        ('on_bail', 'Temporarily Released on Court Bail'),
        ('escaped', 'RED ALERT: Escaped from Custody'),
        ('recaptured', 'Recaptured (Disciplinary Review)'),
        ('discharged', 'Lawfully Discharged & Exited'),
    ], string='Custody Status', default='draft', tracking=True, required=True)

    security_category = fields.Selection([
        ('CAT_A', 'Category A: Maximum Security (High Risk)'),
        ('CAT_B', 'Category B: High Security'),
        ('CAT_C', 'Category C: Medium Security'),
        ('CAT_D', 'Category D: Minimum / Open Camp Trust'),
    ], string='Security Classification', default='CAT_C', tracking=True, required=True)

    progressive_stage = fields.Selection([
        ('stage_1', 'Stage 1: Induction & Strict Custody'),
        ('stage_2', 'Stage 2: Standard Custody (General Population)'),
        ('stage_3', 'Stage 3: Advanced Progression (Workshop Privileges)'),
        ('stage_4', 'Stage 4: Pre-Release Special Trust (Open Farm Work)'),
    ], string='Progressive Stage', default='stage_1', tracking=True)

    behavior_score = fields.Integer(string='Conduct & Merit Score (0-100)', default=75)

    sentence_ids = fields.One2many('prison.sentence', 'inmate_id', string='Custodial Sentences')
    remission_log_ids = fields.One2many('prison.remission.log', 'inmate_id', string='Remission Adjustments')
    hearing_ids = fields.One2many('prison.court.hearing', 'inmate_id', string='Court Appearances')
    transfer_ids = fields.One2many('prison.transfer', 'inmate_id', string='Transfer History')
    gratuity_balance = fields.Monetary(
        string='Accumulated Gratuity Ledger', compute='_compute_gratuity_balance', store=True
    )
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.company.currency_id)

    # Remission & Dates
    statutory_remission_days = fields.Integer(
        string='Statutory Remission Earned (Days)', compute='_compute_release_dates', store=True
    )
    forfeited_remission_days = fields.Integer(
        string='Remission Forfeited (Infractions)', compute='_compute_release_dates', store=True
    )
    earliest_date_of_release = fields.Date(
        string='Earliest Date of Release (EDR)', compute='_compute_release_dates', store=True
    )
    latest_date_of_release = fields.Date(
        string='Latest Date of Release (LDR)', compute='_compute_release_dates', store=True
    )

    @api.model
    def create(self, vals):
        if vals.get('booking_number', _('New')) == _('New'):
            vals['booking_number'] = self.env['ir.sequence'].next_by_code('prison.inmate.seq') or _('New')
        return super(PrisonInmate, self).create(vals)

    @api.depends('sentence_ids.term_days', 'sentence_ids.term_years', 'remission_log_ids.days')
    def _compute_release_dates(self):
        for inmate in self:
            total_sentence_days = sum(
                (s.term_years * 365) + (s.term_months * 30) + s.term_days
                for s in inmate.sentence_ids
            )
            # Standard 1/3 statutory remission under Prisons Act
            statutory_earned = int(total_sentence_days * (1.0 / 3.0))
            forfeited = sum(
                abs(l.days) for l in inmate.remission_log_ids if l.log_type == 'forfeiture'
            )
            restored = sum(
                l.days for l in inmate.remission_log_ids if l.log_type == 'merit_restoration'
            )
            net_remission = max(0, statutory_earned - forfeited + restored)
            
            inmate.statutory_remission_days = statutory_earned
            inmate.forfeited_remission_days = forfeited

            if inmate.admission_date and total_sentence_days > 0:
                inmate.latest_date_of_release = inmate.admission_date + timedelta(days=total_sentence_days)
                inmate.earliest_date_of_release = inmate.admission_date + timedelta(days=(total_sentence_days - net_remission))
            else:
                inmate.latest_date_of_release = False
                inmate.earliest_date_of_release = False

    def action_trigger_escape_alert(self):
        self.ensure_one()
        self.write({'custody_status': 'escaped'})
        # Create escape record & broadcast system alert
        self.env['prison.incident'].create({
            'inmate_id': self.id,
            'incident_type': 'escape',
            'danger_level': 'EXTREME' if self.security_category in ['CAT_A', 'CAT_B'] else 'HIGH',
            'facility_id': self.facility_id.id,
        })
        self.message_post(
            body=_('RED ALERT: Inmate marked as ESCAPED from custody. National Law Enforcement notified.'),
            subject=_('PRISONER ESCAPE ALERT'),
            message_type='notification',
            subtype_xmlid='mail.mt_comment'
        )

    def action_record_recapture(self, penalty_days=60):
        self.ensure_one()
        self.write({
            'custody_status': 'recaptured',
            'progressive_stage': 'stage_1',
            'security_category': 'CAT_A',
        })
        # Forfeit remission
        self.env['prison.remission.log'].create({
            'inmate_id': self.id,
            'log_type': 'forfeiture',
            'days': -penalty_days,
            'reason': _('Automatic remission forfeiture following escape and recapture incident.'),
        })
        self.message_post(body=_('Fugitive recaptured and returned to custody. Demoted to Stage 1. Penalty applied.'))

    def action_process_discharge(self):
        self.ensure_one()
        if self.custody_status not in ['convicted', 'remand']:
            raise UserError(_('Only convicted or remanded inmates may be discharged.'))
        return {
            'name': _('Discharge & Exit Clearance Wizard'),
            'type': 'ir.actions.act_window',
            'res_model': 'prison.discharge.wizard',
            'view_mode': 'form',
            'target': 'new',
            'context': {'default_inmate_id': self.id}
        }
`
};
