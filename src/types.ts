export type CustodyStatus = 
  | 'draft'
  | 'remand'
  | 'convicted'
  | 'in_transit'
  | 'on_bail'
  | 'escaped'
  | 'recaptured'
  | 'discharged';

export type SecurityCategory = 
  | 'CAT_A' // Maximum Security (Extreme risk)
  | 'CAT_B' // High Security
  | 'CAT_C' // Medium Security
  | 'CAT_D'; // Minimum / Open Camp (Trust)

export type ProgressiveStage = 
  | 'stage_1' // Induction / Strict Supervision
  | 'stage_2' // Normal / General Association
  | 'stage_3' // Advanced / Vocational Training
  | 'stage_4'; // Pre-Release / Open Camp Trust

export type ViewMode = 'list' | 'kanban' | 'form';

export type AppSection = 
  | 'inmates'
  | 'facilities'
  | 'admissions'
  | 'sentence'
  | 'rehabilitation'
  | 'court'
  | 'discharge'
  | 'human_rights'
  | 'odoo_code';

export type AdmissionType = 
  | 'court_committal'
  | 'transfer_in'
  | 'bail_revocation'
  | 'recaptured'
  | 'new_remand'
  | 'conviction';

export type CourtCaseStatus = 
  | 'investigation'
  | 'committal'
  | 'bail_hearing'
  | 'trial'
  | 'judgement_pending'
  | 'sentenced'
  | 'appealing';

export type SentenceType = 'determinate' | 'indeterminate' | 'life' | 'fine_default';
export type SentenceStructure = 'concurrent' | 'consecutive';

export interface PrisonFacility {
  id: string;
  code: string;
  name: string;
  type: 'maximum' | 'medium' | 'minimum' | 'remand' | 'womens';
  location: string;
  county: string;
  capacity: number;
  currentInmates: number;
  wardenName: string;
  securityRating: string;
  coordinates: { x: number; y: number }; // For visual national map
}

export interface InmatePropertyItem {
  id: string;
  description: string;
  category: 'cash' | 'electronics' | 'jewelry' | 'clothing' | 'documents';
  quantity: number;
  serialOrDetail?: string;
  condition: string;
  sealBagNumber: string;
  status: 'held_in_vault' | 'returned_on_exit' | 'confiscated' | 'vaulted';
}

export interface SentenceRecord {
  id: string;
  inmateId?: string;
  courtName: string;
  caseNumber: string;
  judgeName?: string;
  dateConvicted?: string;
  sentenceDate?: string;
  offense?: string;
  offenseDescription?: string;
  termYears: number;
  termMonths: number;
  termDays: number;
  sentenceType: SentenceType;
  structure?: SentenceStructure;
  isConsecutive?: boolean;
  statutoryRemissionFraction?: number; // usually 0.3333 (1/3)
  statutoryRemissionRate?: string;
  remissionEarnedDays: number;
  remissionForfeitedDays: number;
  netSentenceDays?: number;
  earliestReleaseDate: string;
  latestReleaseDate: string;
  paroleEligibilityDate: string;
}

export interface RemissionLog {
  id: string;
  date: string;
  type: 'statutory_credit' | 'forfeiture_infraction' | 'restoration_merit';
  days: number;
  reason: string;
  adjudicator: string;
}

export interface ProgressiveStageRecord {
  currentStage: ProgressiveStage;
  stageDate: string;
  behaviorScore: number; // 0 to 100
  conductReportsCount: number;
  promotedBy: string;
  workPrivilegeLevel: string;
  cellBlock: string;
}

export interface RehabilitationEnrollment {
  id: string;
  programId: string;
  programName: string;
  category: 'vocational' | 'education' | 'substance' | 'faith_based';
  enrollmentDate: string;
  progressPercent: number;
  status: 'in_progress' | 'completed' | 'withdrawn';
  dailyEarningRate: number; // e.g. $2.50 / day
  instructor: string;
}

export interface GratuityTransaction {
  id: string;
  date: string;
  type: 'wage_credit' | 'commissary_debit' | 'fine_deduction' | 'exit_payout';
  amount: number;
  description: string;
  balanceAfter: number;
  verifiedBy: string;
}

export interface CourtHearing {
  id: string;
  inmateId: string;
  inmateName: string;
  bookingNumber: string;
  caseNumber: string;
  courtName: string;
  hearingDate: string;
  hearingTime: string;
  hearingType: 'bail_hearing' | 'bail_application' | 'mention' | 'plea' | 'trial_hearing' | 'judgment' | 'sentencing' | 'appeal';
  courtMode: 'physical_court' | 'virtual_video_link';
  escortTeam: string;
  transportVehicleNumber: string;
  status: 'scheduled' | 'in_transit' | 'at_court' | 'returned_remanded' | 'admitted_bail' | 'acquitted' | 'sentenced';
  outcomeNotes?: string;
  judgeName: string;
  charges?: string;
}

export interface TransferRecord {
  id: string;
  inmateId: string;
  inmateName: string;
  bookingNumber?: string;
  fromFacilityId: string;
  fromFacilityName: string;
  toFacilityId: string;
  toFacilityName: string;
  requisitionDate: string;
  transferReason: 'overcrowding_relief' | 'security_reclassification' | 'court_proximity' | 'medical_specialty' | 'vocational_training' | 'medical_treatment' | 'security_elevation';
  authorizedBy?: string;
  escortLevel: 'armed_tactical' | 'standard_escort' | 'minimum_custody' | 'armed_convoy' | 'special_operations_unit' | 'standard';
  status: 'pending_approval' | 'authorized' | 'in_transit' | 'completed' | 'cancelled';
  transitDispatchedAt?: string;
  arrivalConfirmedAt?: string;
  transitVehicleNumber?: string;
  escortCommander?: string;
}

export interface EscapeRecaptureIncident {
  id: string;
  inmateId: string;
  inmateName: string;
  bookingNumber: string;
  incidentDate: string;
  escapeLocation: string;
  facilityId: string;
  facilityName: string;
  methodOfEscape: string;
  dangerLevel: 'EXTREME' | 'HIGH' | 'MODERATE';
  status: 'AT_LARGE' | 'RECAPTURED' | 'INVESTIGATION_CLOSED';
  recaptureDate?: string;
  recapturingAgency?: string;
  disciplinaryActionNotes?: string;
  remissionDaysForfeited?: number;
}

export interface HumanRightsAudit {
  id: string;
  inmateId: string;
  date: string;
  inspectionType: 'un_mandela_rules' | 'independent_ombudsman' | 'medical_welfare' | 'solitary_review';
  complianceStatus: 'compliant' | 'minor_issue' | 'violation_flagged';
  outdoorHoursPerDay: number; // Minimum 1 hr as per Mandela Rule 23
  consecutiveSolitaryDays: number; // Max 15 days limit
  medicalVisitsCount: number;
  complaintsLogged: string[];
  auditorName: string;
  recommendations: string;
}

export interface DischargeClearance {
  id: string;
  inmateId: string;
  dischargeDate: string;
  dischargeType: 'sentence_expiry' | 'presidential_pardon' | 'bail_granted' | 'acquittal' | 'medical_parole';
  fingerprintVerified: boolean;
  noHoldWarrantVerified: boolean;
  propertyHandoverCompleted: boolean;
  gratuitySettledAmount: number;
  gratuityDisbursed: boolean;
  transportVoucherIssued: boolean;
  aftercareOfficerAssigned: string;
  gatePassNumber: string;
  status: 'checklist_in_progress' | 'approved_by_warden' | 'cleared_gate' | 'archived';
}

export interface Inmate {
  id: string;
  bookingNumber: string;
  firstName: string;
  lastName: string;
  alias?: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  nationalIdNumber: string;
  photoUrl: string;
  facilityId: string;
  facilityName: string;
  cellLocation: string; // e.g. Block B, Cell 04
  admissionDate: string;
  admissionType: AdmissionType;
  custodyStatus: CustodyStatus;
  securityCategory: SecurityCategory;
  progressiveStage: ProgressiveStage;
  behaviorRating: number; // 0 - 100
  biometrics?: {
    fingerprintsEnrolled: boolean;
    irisScanCaptured: boolean;
    dnaSampleRef?: string;
    scarsTattoosMarks?: string;
  };
  progressiveStageHistory?: any[];
  
  // Sentence and remission
  sentences: SentenceRecord[];
  remissionLogs: RemissionLog[];
  
  // Property & finance
  propertyItems: InmatePropertyItem[];
  gratuityBalance: number;
  gratuityTransactions: GratuityTransaction[];
  
  // Rehabilitation
  programs: RehabilitationEnrollment[];
  
  // Court & Movements
  courtCases: CourtHearing[];
  transfers: TransferRecord[];
  escapeIncidents?: EscapeRecaptureIncident[];
  
  // Human Rights & Welfare
  humanRightsAudits: HumanRightsAudit[];
  dietaryMedicalNotes?: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  
  // Discharge
  dischargeRecord?: DischargeClearance;
  
  // Odoo Chatter Notes
  chatterLogs: {
    id: string;
    date: string;
    author: string;
    message: string;
    type: 'log_note' | 'activity' | 'system';
  }[];
}
