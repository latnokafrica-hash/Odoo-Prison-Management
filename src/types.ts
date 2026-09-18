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

export type Language = 'en' | 'fr';

export type UserRole = 'superintendent' | 'guard' | 'medical_officer' | 'records_clerk';

export interface UserRoleProfile {
  id: UserRole;
  name: string;
  nameFr: string;
  title: string;
  titleFr: string;
  avatarText: string;
  avatarColor: string;
  badgeBg: string;
  badgeBorder: string;
  odooGroup: string;
  odooGroupXmlId: string;
  description: string;
  descriptionFr: string;
  allowedModules: AppSection[];
  sensitiveRestrictedModules: AppSection[];
  canExecuteDischarge: boolean;
  canRecalculateRemission: boolean;
  canCreateAdmission: boolean;
  canAuthorizeSolitary: boolean;
}

export type AppSection = 
  | 'dashboard'
  | 'inmates'
  | 'facilities'
  | 'rooms'
  | 'court_calendar'
  | 'court'
  | 'fleet'
  | 'meals'
  | 'visitors'
  | 'admissions'
  | 'sentence'
  | 'rehabilitation'
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

export interface VaccinationRecord {
  id: string;
  vaccineName: string;
  dateAdministered: string;
  doseNumber: number; // e.g. 1, 2, Booster
  batchLotNumber: string;
  administeredBy: string;
  clinicFacility: string;
  expiryDate?: string;
  status: 'completed' | 'scheduled' | 'refused';
  notes?: string;
}

export interface AllergyRecord {
  id: string;
  allergen: string;
  type: 'drug' | 'food' | 'environmental' | 'other';
  severity: 'mild' | 'moderate' | 'severe' | 'anaphylactic';
  reaction: string; // e.g., "Hives, bronchospasm", "Severe anaphylaxis"
  diagnosedDate?: string;
  recordedBy: string;
  emergencyAction?: string; // e.g., "EpiPen carrier", "No penicillin products"
}

export interface VitalSigns {
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  heartRateBpm: number;
  respiratoryRate: number;
  bodyTemperatureC: number;
  oxygenSaturationPercent: number;
  weightKg: number;
  heightCm: number;
  bmi: number;
}

export interface MedicalIntakeRecord {
  id: string;
  screeningDate: string;
  screeningTime: string;
  examiningOfficer: string;
  medicalOfficerTitle: string;
  licenseNumber: string;
  facilityName: string;
  fitnessForDetention: 'fit_normal_custody' | 'fit_with_restrictions' | 'unfit_requires_hospitalization' | 'quarantine_required';
  vitals: VitalSigns;
  initialScreeningNotes: string;
  chronicConditions: string[];
  mentalHealthScreening: {
    suicideRiskLevel: 'none' | 'low' | 'moderate' | 'high_observation';
    substanceWithdrawalRisk: boolean;
    priorPsychiatricHistory: boolean;
    observations: string;
  };
  communicableDiseaseScreening: {
    tbSymptomatic: boolean;
    tbChestXRayStatus: 'clear' | 'pending' | 'abnormal_referred';
    covidStatus: 'negative' | 'positive' | 'vaccinated';
    hepatitisScreened: boolean;
    isolationRecommended: boolean;
  };
  vaccinations: VaccinationRecord[];
  allergies: AllergyRecord[];
  currentMedications: {
    name: string;
    dosage: string;
    frequency: string;
    route: 'oral' | 'injection' | 'inhaler' | 'topical';
    heldByClinic: boolean; // Mandela rule: controlled dispensing
  }[];
  dietaryMedicalRecommendation: string;
  followUpAppointmentDate?: string;
  doctorSignOff: boolean;
  doctorSignedAt?: string;
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

  // Medical Intake Screening & Clinical Profile (Odoo medical.intake)
  medicalIntake?: MedicalIntakeRecord;
  
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

// Meal & Nutrition Interfaces
export interface MealMenu {
  id: string;
  code: string;
  name: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'special_ration';
  dietCategory: 'standard' | 'halal' | 'kosher' | 'diabetic' | 'vegetarian' | 'renal_low_sodium';
  caloriesKcal: number;
  proteinGrams: number;
  allergens: string;
  certifiedByNutritionist: boolean;
  description: string;
}

export interface MealDistribution {
  id: string;
  manifestNumber: string;
  facilityId: string;
  facilityName: string;
  blockName: string;
  distributionDate: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'special_ration';
  menuName: string;
  standardPortions: number;
  halalPortions: number;
  diabeticPortions: number;
  vegetarianPortions: number;
  totalRations: number;
  foodTempCelsius: number;
  hygieneCertified: boolean;
  officerSignoff: string;
  status: 'prep' | 'dispatched' | 'served';
}

// Visitor & Parloir Interfaces
export interface VisitorRecord {
  id: string;
  name: string;
  nationalId: string;
  relationship: 'spouse' | 'parent' | 'child' | 'sibling' | 'legal_counsel' | 'religious_clergy' | 'friend';
  phone: string;
  photoUrl?: string;
  vettingStatus: 'cleared' | 'pending_review' | 'barred' | 'suspended';
  totalVisits: number;
  barredReason?: string;
}

export interface VisitSession {
  id: string;
  bookingRef: string;
  inmateId: string;
  inmateName: string;
  visitorId: string;
  visitorName: string;
  relationship: string;
  facilityName: string;
  visitDate: string;
  scheduledTime: string;
  visitingBooth: string;
  boothType: 'glass_partition' | 'open_table' | 'legal_conference';
  chkIdVerified: boolean;
  chkMetalDetectorCleared: boolean;
  chkCanineNarcoticsCleared: boolean;
  chkPersonalItemsVaulted: boolean;
  supervisingGuard: string;
  status: 'booked' | 'admitted' | 'in_progress' | 'completed' | 'denied';
  notes?: string;
}

// Cell Facilities & Rooms Interfaces
export interface CellBlock {
  id: string;
  code: string;
  name: string;
  facilityId: string;
  facilityName: string;
  blockType: 'general_population' | 'high_security' | 'remand_wing' | 'hospital_wing' | 'juvenile_wing';
  supervisor: string;
  totalCells: number;
  capacity: number;
  currentOccupancy: number;
  occupancyRate: number;
}

export interface CellRoom {
  id: string;
  name: string;
  blockId: string;
  blockName: string;
  facilityId: string;
  facilityName: string;
  cellType: 'single_cell' | 'double_cell' | 'dormitory' | 'medical_cell';
  securityLevel: SecurityCategory;
  capacity: number;
  currentOccupancy: number;
  conditionStatus: 'operational' | 'minor_repair' | 'condemned' | 'quarantine';
  hasBunkBeds: boolean;
  hasSanitaryToilet: boolean;
  hasRunningWater: boolean;
  hasNaturalWindow: boolean;
  hasCCTV: boolean;
  lastShakedownDate: string;
  inmateNames: string[];
}

export interface CellMaintenance {
  id: string;
  orderRef: string;
  cellName: string;
  facilityName: string;
  requestDate: string;
  maintenanceType: 'lock_mechanism' | 'sanitary_plumbing' | 'lighting_electrical' | 'bars_grille' | 'ventilation';
  priority: 'low' | 'medium' | 'urgent';
  reportedBy: string;
  status: 'draft' | 'in_progress' | 'completed';
  notes: string;
}

// Fleet & Court Escort Interfaces
export interface FleetVehicle {
  id: string;
  callSign: string;
  facilityName: string;
  model: string;
  vehicleType: 'armored_cellular_van' | 'convoy_chase_car' | 'bus_mass_transit';
  armorLevel: 'level_b6' | 'level_b4' | 'standard_caged';
  cellularCagesCapacity: number;
  armedGuardCapacity: number;
  gpsTrackerId: string;
  fuelLevel: number;
  status: 'ready' | 'in_convoy' | 'maintenance';
}

export interface FleetConvoy {
  id: string;
  missionCode: string;
  facilityName: string;
  destinationCourt: string;
  departureTime: string;
  escortCommander: string;
  armedOfficersCount: number;
  inmateCount: number;
  vehiclesAssigned: string[];
  inmateNames: string[];
  securityRating: 'CAT_A_HIGH_THREAT' | 'STANDARD_SECURE' | 'MINIMUM_ESCORT';
  status: 'planned' | 'staging' | 'en_route_court' | 'at_court' | 'en_route_prison' | 'completed';
  radioLog: string;
}

