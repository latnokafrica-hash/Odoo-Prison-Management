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
  | 'inspections'
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
  | 'handover'
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

export interface OngoingSecurityIncident {
  id: string;
  type: 'escape_attempt' | 'disturbance' | 'contraband_lockdown' | 'perimeter_breach' | 'hostage_situation' | 'medical_code_red';
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE';
  reportedTime: string;
  locationZone: string;
  status: 'active_lockdown' | 'tactical_response' | 'contained_investigating';
  description: string;
  tacticalUnitsDeployed?: string[];
  inmatesInvolvedCount?: number;
  containmentEtaMinutes?: number;
}

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
  // Custodial Staffing & Inmate-to-Officer Ratios
  activeOfficers?: number;
  recommendedOfficers?: number;
  // Live Active Incident Alerts
  ongoingSecurityIncidents?: OngoingSecurityIncident[];
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
  completedDate?: string;
  certificateNumber?: string;
  certificateIssuedAt?: string;
  certifyingBody?: string;
  gradeOrScore?: string;
  attendanceHoursCompleted?: number;
  totalCourseHours?: number;
  modulesCompleted?: number;
  totalModules?: number;
  skillsAcquired?: string[];
  instructorRemarks?: string;
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

export type MedicalFlagSeverity = 'critical' | 'needs_specialist' | 'chronic' | 'stable';

export interface MedicalFlagDetails {
  severity: MedicalFlagSeverity;
  label: string; // 'Critical' | 'Needs Specialist' | 'Chronic' | 'Fit / Stable'
  conditionName: string;
  allConditions: string[];
  notes?: string;
  specialistSpecialty?: string;
  requiresHospitalization?: boolean;
  requiresIsolation?: boolean;
  activeMedicationsCount: number;
  allergiesCount: number;
  vitalsSummary?: string;
  screeningDate?: string;
  examiningDoctor?: string;
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
  medicalFlagSeverity?: MedicalFlagSeverity;
  flaggedCondition?: string;
  specialistReferralSpecialty?: string;
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
    lastVerificationDate?: string;
    lastVerificationStatus?: 'verified' | 'unverified' | 'failed';
    lastVerificationConfidence?: number;
    facialMatchConfidence?: number;
    fingerprintMatchConfidence?: number;
    verifiedByOfficer?: string;
    verificationMethod?: 'multimodal_camera_afis' | 'facial_scan' | 'fingerprint_scan';
    capturedPhotoUrl?: string;
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
  
  // Incident & Intervention Chronological Timeline
  incidentTimelineEvents?: TimelineIncidentItem[];

  // Odoo Chatter Notes
  chatterLogs: {
    id: string;
    date: string;
    author: string;
    message: string;
    type: 'log_note' | 'activity' | 'system';
  }[];
}

// Incident Timeline Types
export type IncidentCategory = 'disciplinary' | 'medical' | 'reclassification';
export type IncidentSeverity = 'critical' | 'high' | 'moderate' | 'routine' | 'positive';

export interface TimelineIncidentItem {
  id: string;
  date: string;
  time?: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  title: string;
  eventType: string;
  description: string;
  authority: string;
  facilityName: string;
  cellLocation?: string;
  actionTaken?: string;
  mandelaRuleCompliance?: {
    compliant: boolean;
    ruleNumber: string;
    note: string;
  };
  metrics?: {
    label: string;
    value: string;
    badgeColor?: string;
  }[];
  tags: string[];
  isCustomLogged?: boolean;
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

// Staff Duty Roster Interfaces
export type ShiftType = 'morning' | 'afternoon' | 'night' | 'standby';
export type DutyStatus = 'on_duty' | 'on_break' | 'standby' | 'off_duty';
export type OfficerRank = 
  | 'Chief Inspector'
  | 'Inspector'
  | 'Senior Sergeant'
  | 'Chief Sergeant'
  | 'Sergeant'
  | 'Corporal'
  | 'Senior Officer'
  | 'Correctional Officer'
  | 'Tactical Specialist';

export interface StaffDutyAssignment {
  id: string;
  officerId: string;
  badgeNumber: string;
  officerName: string;
  rank: OfficerRank;
  facilityId: string;
  facilityName: string;
  blockId: string;
  blockName: string;
  shift: ShiftType;
  shiftHours: string;
  roleOnDuty: string; // e.g. 'Block Supervisor', 'Tier Sentinel', 'Control Room Operator'
  dutyStatus: DutyStatus;
  isArmed: boolean;
  weaponType?: string;
  radioCallSign: string;
  contactExtension: string;
  musterCheckInTime?: string;
  specialization?: string;
  avatarUrl?: string;
  notes?: string;
}

// Shift Handover Brief Interfaces
export type RiskSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type RiskCategory = 
  | 'security_inmate' 
  | 'structural_locks' 
  | 'perimeter_surveillance' 
  | 'medical_mental' 
  | 'contraband_tension' 
  | 'overcrowding';

export interface FacilityRiskItem {
  id: string;
  category: RiskCategory;
  title: string;
  description: string;
  severity: RiskSeverity;
  location: string;
  mitigation: string;
  reportedBy: string;
  reportedAt: string;
  isAcknowledgedByIncoming: boolean;
}

export type TaskPriority = 'urgent' | 'high' | 'routine';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'deferred';
export type TaskCategory = 
  | 'court_returns' 
  | 'meal_distribution' 
  | 'headcount_lockdown' 
  | 'medical_escort' 
  | 'maintenance' 
  | 'visitor_reconciliation';

export interface PendingTaskItem {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  assignedRole: string;
  assignedOfficer: string;
  dueTime: string;
  status: TaskStatus;
  category: TaskCategory;
  notes?: string;
  completedAt?: string;
}

export type EquipmentCategory = 
  | 'keys_security' 
  | 'armory_firearms' 
  | 'tactical_protection' 
  | 'radios_comms' 
  | 'body_cameras' 
  | 'restraints_cuffs';

export type EquipmentCondition = 'operational' | 'defective' | 'missing' | 'maintenance';

export interface EquipmentInventoryItem {
  id: string;
  category: EquipmentCategory;
  name: string;
  expectedQty: number;
  countedQty: number;
  unit: string;
  condition: EquipmentCondition;
  storageLocation: string;
  discrepancyNote?: string;
  serialNumbers?: string[];
  verifiedByBoth: boolean;
  lastInspectedAt?: string;
  inspectedBy?: string;
  criticality?: 'critical' | 'high' | 'standard';
  batteryLevel?: number; // for radios/body cameras
  sealNumber?: string; // for key rings and armory lockboxes
}

export interface CommanderSignOff {
  commanderId: string;
  commanderName: string;
  rank: string;
  badgeNumber: string;
  signatureType: 'digital_canvas' | 'biometric_token' | 'pki_smartcard';
  signatureData: string; // Base64 dataURL or digital signature certificate string
  signedAt: string;
  declarationConfirmed: boolean;
  handoverNotes?: string;
  exceptionsNoted?: string;
}

export type HandoverStatus = 
  | 'draft' 
  | 'outgoing_signed' 
  | 'fully_signed' 
  | 'governor_certified' 
  | 'archived';

// Shift Personnel Tracking & Safety Staffing Interfaces
export type OfficerDutyStatus = 
  | 'active_post'
  | 'armed_patrol'
  | 'relief_break'
  | 'convoy_escort'
  | 'standby_qrf';

export interface SecurityOfficer {
  id: string;
  badgeNumber: string;
  name: string;
  rank: OfficerRank;
  role: string;
  assignedSector: string;
  assignedPost: string;
  shift: ShiftType;
  callSign: string;
  radioChannel: string;
  checkInTime: string;
  status: OfficerDutyStatus;
  weaponIssued: string;
  bodyCamIssued: string;
  tacticalVest: boolean;
  notes?: string;
}

export type LeaveRequestType = 
  | 'annual_furlough'
  | 'medical_sick'
  | 'emergency_compassionate'
  | 'training_recert'
  | 'compensatory_rest';

export type LeaveRequestStatus = 'pending' | 'approved' | 'rejected' | 'deferred';

export interface LeaveRequest {
  id: string;
  officerId: string;
  officerName: string;
  badgeNumber: string;
  rank: OfficerRank;
  leaveType: LeaveRequestType;
  startDate: string;
  endDate: string;
  shiftsCovered: ShiftType[];
  impactRisk: 'low' | 'moderate' | 'high_critical';
  impactAssessment: string;
  replacementOfficer?: string;
  status: LeaveRequestStatus;
  submittedAt: string;
  decisionBy?: string;
  decisionNotes?: string;
}

export interface ShiftStaffingRequirement {
  facilityId: string;
  shift: ShiftType;
  minimumRequiredOfficers: number;
  deployedOfficersCount: number;
  mandatoryFixedPostsCount: number;
  fixedPostsMannedCount: number;
  qrfStandbyCount: number;
  minimumQrfRequired: number;
  guardToInmateRatio: string;
  safetyComplianceRatio: number; // e.g. 1.18 = 118%
  safetyStatus: 'OPTIMAL' | 'COMPLIANT' | 'BORDERLINE' | 'CRITICAL_DEFICIT';
  recommendedAction?: string;
}

export interface ShiftHandoverBriefData {
  id: string;
  referenceNumber: string;
  facilityId: string;
  facilityName: string;
  date: string;
  outgoingShift: ShiftType;
  incomingShift: ShiftType;
  status: HandoverStatus;
  headcountSummary: {
    totalInmates: number;
    certifiedCapacity: number;
    remandCount: number;
    convictedCount: number;
    highSecurityCount: number;
    solitaryCount: number;
    hospitalCount: number;
    courtTransitCount: number;
    rollCallDiscrepancy: number; // 0 = perfect match
  };
  risks: FacilityRiskItem[];
  tasks: PendingTaskItem[];
  equipment: EquipmentInventoryItem[];
  personnelSummary?: {
    staffing: ShiftStaffingRequirement;
    officers: SecurityOfficer[];
    leaveRequests: LeaveRequest[];
  };
  timelineEvents?: ShiftTimelineEvent[];
  handoverNotes?: ShiftHandoverNote[];
  outgoingSignOff: CommanderSignOff | null;
  incomingSignOff: CommanderSignOff | null;
  governorSignOff: CommanderSignOff | null;
  generalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// Shift Handover Notes: Structured Commander Directives & Observations
export type HandoverNoteCategory = 'maintenance' | 'unusual_behavior' | 'inmate_watch' | 'general_orders';
export type HandoverNoteUrgency = 'routine' | 'elevated' | 'urgent' | 'critical';
export type InmateWatchLevel = 
  | 'standard' 
  | 'suicide_watch_15m' 
  | 'constant_1to1' 
  | 'keep_separate' 
  | 'medical_convalescence' 
  | 'segregation_high_risk';

export interface HandoverMaintenanceDetails {
  equipmentOrAsset: string;
  workOrderRef?: string;
  trade: 'plumbing' | 'electrical' | 'locks_doors' | 'hvac' | 'cctv_sensors' | 'perimeter_fencing' | 'structural';
  contractorAccessRequired: boolean;
  contractorName?: string;
  estimatedResolution?: string;
}

export interface HandoverBehaviorDetails {
  inmateId?: string;
  inmateName?: string;
  behaviorType: 'agitating_tensions' | 'withdrawn_depression' | 'gang_posturing' | 'hoarding_contraband' | 'verbal_altercation' | 'unusual_solicitation' | 'paranoia_anxiety';
  witnessingOfficers?: string[];
  recommendedResponse: string;
}

export interface HandoverInmateWatchDetails {
  inmateId: string;
  inmateName: string;
  cellLocation: string;
  watchLevel: InmateWatchLevel;
  watchIntervalMinutes: number; // e.g. 15 for 15-minute rounds
  keepSeparatedFrom?: string[]; // IDs/names of incompatible inmates
  specialInstructions: string;
  assignedWatchPost?: string;
}

export interface ShiftHandoverNote {
  id: string;
  category: HandoverNoteCategory;
  title: string;
  content: string;
  urgency: HandoverNoteUrgency;
  location: string;
  authorCommander: string;
  authorBadge: string;
  timestamp: string; // e.g. "13:35"
  maintenanceDetails?: HandoverMaintenanceDetails;
  behaviorDetails?: HandoverBehaviorDetails;
  inmateWatchDetails?: HandoverInmateWatchDetails;
  isAcknowledgedByIncoming?: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

// Shift Interactive Timeline & Chronological Operational Log
export type ShiftEventType = 
  | 'headcount_muster'
  | 'security_incident'
  | 'contraband_discovery'
  | 'medical_emergency'
  | 'escort_transit'
  | 'visitation_event'
  | 'perimeter_alert'
  | 'maintenance_issue'
  | 'command_directive'
  | 'routine_patrol';

export type ShiftEventSeverity = 'routine' | 'notable' | 'urgent' | 'critical';

export interface ShiftTimelineEvent {
  id: string;
  timestamp: string; // e.g. "06:15"
  title: string;
  description: string;
  category: ShiftEventType;
  severity: ShiftEventSeverity;
  location: string;
  loggedBy: string;
  badgeNumber?: string;
  relatedInmate?: string;
  actionTaken?: string;
  isVerified?: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  shift?: ShiftType;
}

// Facility Inspection, Infrastructure & Sanitation Interfaces
export type InspectionType = 
  | 'routine_daily'
  | 'weekly_comprehensive'
  | 'monthly_structural'
  | 'surprise_shakedown'
  | 'mandela_sanitation_audit';

export type InspectionStatus = 
  | 'passed'
  | 'minor_issues'
  | 'critical_fail'
  | 'in_progress';

export type InfrastructureCategory = 
  | 'locks_doors'
  | 'bars_grilles'
  | 'surveillance_cctv'
  | 'ventilation_air'
  | 'plumbing_sanitary'
  | 'electrical_lighting'
  | 'fire_life_safety'
  | 'anti_ligature';

export interface InfrastructureCheckItem {
  id: string;
  category: InfrastructureCategory;
  name: string;
  standardCode: string; // e.g. 'KPS-SEC-01', 'MANDELA-R14', 'NFPA-101'
  status: 'pass' | 'flagged' | 'critical_fail' | 'na';
  notes?: string;
  lastChecked: string;
}

export interface MaintenanceWorkOrder {
  id: string;
  orderNumber: string;
  facilityId: string;
  facilityName: string;
  blockId: string;
  blockName: string;
  cellRoomId?: string;
  cellRoomName?: string;
  category: 'lock_mechanism' | 'bars_grille' | 'sanitary_plumbing' | 'lighting_electrical' | 'ventilation' | 'structural_masonry' | 'cctv_sensor';
  priority: 'low' | 'medium' | 'high' | 'urgent_security_breach';
  title: string;
  description: string;
  reportedBy: string;
  assignedTechnician?: string;
  reportedDate: string;
  targetCompletionDate: string;
  completedDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold';
  estimatedCostKes?: number;
  partsRequired?: string;
}

export interface SanitationViolation {
  id: string;
  caseNumber: string;
  facilityId: string;
  facilityName: string;
  blockId: string;
  blockName: string;
  locationDetail: string;
  violationType: 'black_mold_infestation' | 'sewage_leak' | 'blocked_drainage' | 'vermin_pest_activity' | 'inadequate_ventilation' | 'unpotable_water' | 'waste_accumulation' | 'soiled_bedding';
  severity: 'minor' | 'major' | 'critical_health_hazard';
  mandelaRuleRef: string;
  description: string;
  remedialAction: string;
  reportedDate: string;
  remedyDeadline: string;
  inspectedByOfficer: string;
  assignedHealthOfficer?: string;
  status: 'active' | 'fumigation_scheduled' | 'rectification_underway' | 'rectified' | 'reinspected_resolved' | 'closed';
}

export interface CellBlockInspectionRecord {
  id: string;
  inspectionCode: string;
  facilityId: string;
  facilityName: string;
  blockId: string;
  blockName: string;
  inspectionType: InspectionType;
  inspectionDate: string;
  inspectionTime: string;
  leadInspectorName: string;
  leadInspectorRank: string;
  leadInspectorBadge: string;
  accompanyingOfficer?: string;
  status: InspectionStatus;
  complianceScore: number;
  cellsCheckedCount: number;
  cellsTotalCount: number;
  infrastructureChecks: InfrastructureCheckItem[];
  contrabandFoundSummary?: string;
  maintenanceOrdersGenerated: string[];
  sanitationViolationsGenerated: string[];
  summaryFindings: string;
  correctiveDirectives?: string;
  signature?: string;
}

// Facility Hotspot & Tactical Map Interfaces
export type FacilityIncidentCategory = 'escape_attempt' | 'medical_alert' | 'violence_contraband' | 'structural_breach';
export type FacilityIncidentSeverity = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';

export interface FacilityIncident {
  id: string;
  facilityId: string;
  facilityName: string;
  title: string;
  category: FacilityIncidentCategory;
  severity: FacilityIncidentSeverity;
  incidentDate: string; // YYYY-MM-DD
  incidentTime?: string; // HH:mm
  locationZoneId: string;
  locationZoneName: string;
  coordinates: { x: number; y: number }; // Percentage 0-100 on prison map
  inmateId?: string;
  inmateName?: string;
  bookingNumber?: string;
  description: string;
  methodOrCause: string;
  status: 'resolved' | 'active_investigation' | 'recaptured' | 'hospitalized' | 'foiled';
  actionTaken: string;
  superintendentDirective: string;
  casualtiesOrInjuries?: string;
  densityWeight: number; // 1 to 5 weighting for heatmap calculation
  reportedByOfficer: string;
}

export interface FacilityMapZone {
  id: string;
  facilityId: string;
  code: string;
  name: string;
  type: 'cell_block' | 'perimeter_fence' | 'watchtower' | 'medical_clinic' | 'mess_kitchen' | 'workshop' | 'exercise_yard' | 'sallyport' | 'admin_gate';
  bounds: { x: number; y: number; width: number; height: number }; // Percentage coordinates
  securityTier: 'SUPERMAX' | 'HIGH' | 'MEDIUM' | 'RESTRICTED';
  cctvCoverage: 'FULL' | 'PARTIAL' | 'BLINDSPOT';
  activeGuardPost: boolean;
  guardCount: number;
  description: string;
}

export interface FacilityHotspotMetrics {
  totalIncidents: number;
  escapeAttempts: number;
  medicalAlerts: number;
  violenceContraband: number;
  highestRiskZoneName: string;
  overallFacilityRiskScore: number; // 0-100
  criticalActiveThreats: number;
}

