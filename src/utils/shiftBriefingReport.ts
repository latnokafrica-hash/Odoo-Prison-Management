import { 
  PrisonFacility, 
  Inmate, 
  ShiftType, 
  StaffDutyAssignment, 
  CellBlock, 
  FleetConvoy, 
  CellMaintenance,
  Language 
} from '../types';
import { INITIAL_FACILITIES, INITIAL_INMATES } from '../data/initialData';
import { INITIAL_FLEET_CONVOYS, INITIAL_CELL_BLOCKS, INITIAL_CELL_MAINTENANCE } from '../data/newModuleData';
import { INITIAL_STAFF_DUTY_ROSTER, SHIFT_CONFIGS } from '../data/staffDutyData';

export interface FacilityInmateCount {
  facilityId: string;
  facilityCode: string;
  facilityName: string;
  county: string;
  securityRating: string;
  capacity: number;
  currentInmates: number;
  occupancyRate: number;
  remandCount: number;
  convictedCount: number;
  highSecurityCatACount: number;
  mediumCatBCount: number;
  generalCatCCount: number;
  openCatDCount: number;
  status: 'normal' | 'near_capacity' | 'overcrowded';
}

export interface CriticalShiftAlert {
  id: string;
  level: 'CRITICAL_HIGH' | 'HIGH_ALERT' | 'MEDIUM_WARNING';
  category: 'security' | 'medical' | 'court_production' | 'staffing' | 'infrastructure' | 'intelligence';
  titleEn: string;
  titleFr: string;
  descriptionEn: string;
  descriptionFr: string;
  affectedEntity: string; // Inmate name, cell block, or convoy
  facilityName: string;
  actionRequiredEn: string;
  actionRequiredFr: string;
  timeframe: string; // e.g., 'Next 4 Hours', 'Today 09:00', 'Immediate'
  isMandatoryBriefing: boolean;
}

export interface HighRiskMovementInmate {
  name: string;
  bookingNumber: string;
  securityCategory: string;
  alias?: string;
  threatProfile: string;
}

export interface HighRiskMovement {
  id: string;
  missionCode: string;
  movementType: 'armed_court_convoy' | 'tactical_inter_facility_transfer' | 'emergency_medical_extraction';
  threatRating: 'CAT_A_HIGH_THREAT' | 'TACTICAL_HIGH_ESCORT' | 'SPECIAL_OPERATIONS';
  originFacility: string;
  destination: string;
  scheduledTime: string;
  escortCommander: string;
  armedOfficersCount: number;
  vehiclesAssigned: string[];
  inmates: HighRiskMovementInmate[];
  mandatoryPrecautionsEn: string[];
  mandatoryPrecautionsFr: string[];
  status: string;
  radioChannel: string;
}

export interface ShiftStaffingSummary {
  shift: ShiftType;
  shiftHours: string;
  totalOfficersOnDuty: number;
  totalArmedSentinels: number;
  totalStandbyReserves: number;
  understaffedBlocks: {
    blockName: string;
    assignedCount: number;
    requiredCount: number;
    deficit: number;
  }[];
  overallCoveragePercent: number;
}

export interface ShiftBriefingReportData {
  reportId: string;
  classificationNotice: string;
  generatedAtISO: string;
  generatedAtFormatted: string;
  shift: ShiftType;
  shiftHours: string;
  commandingOfficer: string;
  facilityScope: string;
  systemSummary: {
    totalInmates: number;
    totalCapacity: number;
    overallOccupancyRate: number;
    totalRemand: number;
    totalConvicted: number;
    totalCatAHighSecurity: number;
    overcrowdedFacilitiesCount: number;
  };
  facilityCounts: FacilityInmateCount[];
  criticalAlerts: CriticalShiftAlert[];
  highRiskMovements: HighRiskMovement[];
  staffingSummary: ShiftStaffingSummary;
}

export interface ShiftBriefingReportOptions {
  shift?: ShiftType;
  facilities?: PrisonFacility[];
  inmates?: Inmate[];
  roster?: StaffDutyAssignment[];
  cellBlocks?: CellBlock[];
  convoys?: FleetConvoy[];
  maintenanceOrders?: CellMaintenance[];
  commandingOfficer?: string;
  language?: Language;
}

/**
 * Generates a complete, structured Shift Briefing Report for the StaffDutyRoster component,
 * summarizing current inmate counts per facility, critical 24-hour situational alerts,
 * and high-risk inmate movements.
 */
export function generateShiftBriefingReport(options: ShiftBriefingReportOptions = {}): ShiftBriefingReportData {
  const shift = options.shift || 'morning';
  const shiftConfig = SHIFT_CONFIGS.find(s => s.id === shift) || SHIFT_CONFIGS[0];
  const facilities = options.facilities && options.facilities.length > 0 
    ? options.facilities 
    : INITIAL_FACILITIES;
  const inmates = options.inmates && options.inmates.length > 0 
    ? options.inmates 
    : INITIAL_INMATES;
  const roster = options.roster && options.roster.length > 0 
    ? options.roster 
    : INITIAL_STAFF_DUTY_ROSTER;
  const cellBlocks = options.cellBlocks && options.cellBlocks.length > 0 
    ? options.cellBlocks 
    : INITIAL_CELL_BLOCKS;
  const convoys = options.convoys && options.convoys.length > 0 
    ? options.convoys 
    : INITIAL_FLEET_CONVOYS;
  const maintenanceOrders = options.maintenanceOrders && options.maintenanceOrders.length > 0 
    ? options.maintenanceOrders 
    : INITIAL_CELL_MAINTENANCE;

  const commandingOfficer = options.commandingOfficer || 'Senior Supt. Josephat Mwangi (Duty Governor)';
  const now = new Date();
  const reportTimestamp = now.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // 1. Summarize Total Current Inmate Counts per Facility
  const facilityCounts: FacilityInmateCount[] = facilities.map((fac) => {
    // Inmates affiliated with this facility
    const facInmates = inmates.filter(
      (inm) => inm.facilityId === fac.id || inm.facilityName.toLowerCase().includes(fac.name.toLowerCase())
    );

    // If we have mapped inmates, count them; otherwise use facility.currentInmates as baseline
    const currentInmates = facInmates.length > 0 ? facInmates.length : fac.currentInmates;
    const capacity = fac.capacity;
    const occupancyRate = capacity > 0 ? Math.round((currentInmates / capacity) * 100) : 0;

    // Custody status counts
    const remandCount = facInmates.length > 0 
      ? facInmates.filter((i) => i.custodyStatus === 'remand').length
      : fac.type === 'remand' ? Math.round(currentInmates * 0.85) : Math.round(currentInmates * 0.28);
    
    const convictedCount = facInmates.length > 0 
      ? facInmates.filter((i) => i.custodyStatus === 'convicted').length
      : currentInmates - remandCount;

    // Security category counts
    const highSecurityCatACount = facInmates.length > 0
      ? facInmates.filter((i) => i.securityCategory === 'CAT_A').length
      : fac.type === 'maximum' ? Math.round(currentInmates * 0.42) : Math.round(currentInmates * 0.05);

    const mediumCatBCount = facInmates.length > 0
      ? facInmates.filter((i) => i.securityCategory === 'CAT_B').length
      : Math.round(currentInmates * 0.35);

    const generalCatCCount = facInmates.length > 0
      ? facInmates.filter((i) => i.securityCategory === 'CAT_C').length
      : Math.round(currentInmates * 0.20);

    const openCatDCount = Math.max(0, currentInmates - highSecurityCatACount - mediumCatBCount - generalCatCCount);

    const status: FacilityInmateCount['status'] = 
      occupancyRate > 100 ? 'overcrowded' : occupancyRate >= 90 ? 'near_capacity' : 'normal';

    return {
      facilityId: fac.id,
      facilityCode: fac.code,
      facilityName: fac.name,
      county: fac.county,
      securityRating: fac.securityRating,
      capacity,
      currentInmates,
      occupancyRate,
      remandCount,
      convictedCount,
      highSecurityCatACount,
      mediumCatBCount,
      generalCatCCount,
      openCatDCount,
      status,
    };
  });

  const totalInmates = facilityCounts.reduce((acc, f) => acc + f.currentInmates, 0);
  const totalCapacity = facilityCounts.reduce((acc, f) => acc + f.capacity, 0);
  const overallOccupancyRate = totalCapacity > 0 ? Math.round((totalInmates / totalCapacity) * 100) : 0;
  const totalRemand = facilityCounts.reduce((acc, f) => acc + f.remandCount, 0);
  const totalConvicted = facilityCounts.reduce((acc, f) => acc + f.convictedCount, 0);
  const totalCatAHighSecurity = facilityCounts.reduce((acc, f) => acc + f.highSecurityCatACount, 0);
  const overcrowdedFacilitiesCount = facilityCounts.filter((f) => f.status === 'overcrowded').length;

  // 2. Critical Alerts for the Next 24 Hours
  const criticalAlerts: CriticalShiftAlert[] = [
    {
      id: 'alt-01',
      level: 'CRITICAL_HIGH',
      category: 'security',
      titleEn: 'Continuous CCTV Observation & High-Risk Suicide Watch',
      titleFr: 'Surveillance Vidéo Continue & Protocole Anti-Suicide Immédiat',
      descriptionEn: 'Inmate Tariq Al-Mansoor (CAT A - High Security Wing A-101) placed on Level 1 continuous observation rubric following acute clinical review. 15-minute physical welfare log mandatory.',
      descriptionFr: 'Le détenu Tariq Al-Mansoor (CAT A - Quartier Haute Sécurité A-101) est placé en observation continue de niveau 1 suite au bilan médical. Pointage physique toutes les 15 minutes obligatoire.',
      affectedEntity: 'Tariq Al-Mansoor (Cell A-101)',
      facilityName: 'Kamiti National Maximum Security Penitentiary',
      actionRequiredEn: 'Floor sentinel must sign physical observation log sheet every 15 minutes. No blunt objects, ties, or standard cutlery authorized.',
      actionRequiredFr: 'La sentinelle de coursive doit signer le registre d\'observation physique toutes les 15 min. Objets tranchants et couverts interdits.',
      timeframe: 'Next 24 Hours (Continuous)',
      isMandatoryBriefing: true,
    },
    {
      id: 'alt-02',
      level: 'CRITICAL_HIGH',
      category: 'court_production',
      titleEn: 'Milimani High Court High-Threat Judicial Extraction Deadline',
      titleFr: 'Extraction Judiciaire Haute Menace - Cour Supérieure de Milimani',
      descriptionEn: 'Mandatory judicial appearance for 3 high-profile detainees before High Court Criminal Division at 09:00 AM. Inter-agency tactical armed escort vehicle required.',
      descriptionFr: 'Comparution judiciaire obligatoire pour 3 détenus sensibles devant la Chambre Criminelle à 09h00. Escorte armée tactique inter-services requise.',
      affectedEntity: 'Convoy CNV/2026/0031 (Tariq Al-Mansoor, Victor Ramos, Devon Vance)',
      facilityName: 'Central Maximum Penitentiary',
      actionRequiredEn: 'Armed escort muster at 07:15 AM at East Sallyport. Armored van PRIS-ARMOR-01 secondary lock verification. Double mechanical leg irons mandatory.',
      actionRequiredFr: 'Rassemblement de l\'escorte armée à 07h15 au sas Est. Vérification des doubles serrures du fourgon blindé PRIS-ARMOR-01. Entraves aux chevilles obligatoires.',
      timeframe: 'Today 07:15 - 13:30',
      isMandatoryBriefing: true,
    },
    {
      id: 'alt-03',
      level: 'HIGH_ALERT',
      category: 'infrastructure',
      titleEn: 'Motorized Lock Sensor Intermittent Failure - Cell Block A',
      titleFr: 'Défaillance Intermittente Verrouillage Électro-Mécanique - Quartier A',
      descriptionEn: 'Work Order WO/2026/0043 active on Cell A-104 motorized deadbolt sensor. Sensor showing unlocked false positives in Control Room console.',
      descriptionFr: 'Ordre de réparation WO/2026/0043 en cours sur le verrou de la cellule A-104. Faux contacts signalés sur la console centrale de contrôle.',
      affectedEntity: 'Cell A-104 (High Security Wing)',
      facilityName: 'Central Maximum Penitentiary',
      actionRequiredEn: 'Manual brass padlock fail-safe protocol must remain engaged. Physical shakedown inspection every hour until Engineering sign-off.',
      actionRequiredFr: 'Le cadenas de sécurité en laiton reste engagé. Contrôle physique horaire obligatoire jusqu\'à validation par les services techniques.',
      timeframe: 'Next 12 Hours',
      isMandatoryBriefing: true,
    },
    {
      id: 'alt-04',
      level: 'HIGH_ALERT',
      category: 'intelligence',
      titleEn: 'Contraband Interception & Perimeter Canine Sweep Alert',
      titleFr: 'Interception Contrebande & Ronde Cynophile Périmétrique',
      descriptionEn: 'Visitor Carl Hendrick intercepted at Main Gate attempting to smuggle micro-SIM cards inside athletic shoes. Security intelligence warns of coordinated drop attempt on North wall perimeter.',
      descriptionFr: 'Le visiteur Carl Hendrick a été intercepté au portail principal avec des puces SIM dissimulées. Renseignement pénitentiaire alerte sur un possible jet de colis mur Nord.',
      affectedEntity: 'North Perimeter & Sallyport Gate',
      facilityName: 'Kamiti National Maximum Security Penitentiary',
      actionRequiredEn: 'Canine patrol unit deployed on North exterior catwalk. Armed watchtower sentinel to maintain continuous spotlight sweep.',
      actionRequiredFr: 'Unité cynophile déployée sur la coursive Nord. Sentinelle du mirador armé chargée d\'un balayage projecteur permanent.',
      timeframe: 'Next 24 Hours',
      isMandatoryBriefing: true,
    },
    {
      id: 'alt-05',
      level: 'MEDIUM_WARNING',
      category: 'medical',
      titleEn: 'Severe Asthmatic Treatment Protocol & Dispensary Dispensing',
      titleFr: 'Protocole Médical Asthme Aigu & Médicaments sous Contrôle',
      descriptionEn: 'Inmate Marcus Kiprono (Cell C-12) requires supervised inhaler administration and morning vitals check at dispensary bay prior to industrial workshop release.',
      descriptionFr: 'Le détenu Marcus Kiprono (Cellule C-12) nécessite une inhalation sous surveillance médicale avant tout accès aux ateliers de menuiserie.',
      affectedEntity: 'Marcus Kiprono (Cell C-12)',
      facilityName: 'Kamiti National Maximum Security Penitentiary',
      actionRequiredEn: 'Escort to Dispensary Station 2 at 07:30 AM before gate unlock.',
      actionRequiredFr: 'Escorter à l\'infirmerie poste 2 à 07h30 avant l\'ouverture des ateliers.',
      timeframe: 'Next 4 Hours',
      isMandatoryBriefing: false,
    },
    {
      id: 'alt-06',
      level: 'HIGH_ALERT',
      category: 'staffing',
      titleEn: 'Overcrowding & Cell Block Minimum Manning Advisory',
      titleFr: 'Alerte Suroccupation & Effectifs Minimaux Réglementaires',
      descriptionEn: 'Kamiti Penitentiary currently at 120% capacity (1,680 inmates vs 1,400 beds). General Remand and High Security wings require strict 100% staff presence during yard transitions.',
      descriptionFr: 'Pénitencier de Kamiti à 120% de sa capacité (1 680 détenus pour 1 400 lits). Présence stricte de 100% des effectifs exigée pendant les mouvements de promenade.',
      affectedEntity: 'Block A (High Security) & Block B (Remand)',
      facilityName: 'Kamiti National Maximum Security Penitentiary',
      actionRequiredEn: 'No unescorted tier movements. All cell unlocks must have minimum 2 correctional officers present with body-worn panic distress alarms.',
      actionRequiredFr: 'Aucun mouvement seul. Tout déverrouillage nécessite au moins 2 surveillants équipés de dispositifs d\'alarme pour travailleur isolé.',
      timeframe: 'Next 24 Hours',
      isMandatoryBriefing: true,
    }
  ];

  // 3. High-Risk Inmate Movements
  const highRiskMovements: HighRiskMovement[] = [
    {
      id: 'mov-01',
      missionCode: 'CNV/2026/0031',
      movementType: 'armed_court_convoy',
      threatRating: 'CAT_A_HIGH_THREAT',
      originFacility: 'Kamiti National Maximum Security Penitentiary',
      destination: 'High Court Criminal Division & Court of Appeal (Milimani)',
      scheduledTime: '07:45 AM Departure (ETA 08:35 AM)',
      escortCommander: 'Chief Inspector Vance (Armed Tactics)',
      armedOfficersCount: 10,
      vehiclesAssigned: ['PRIS-ARMOR-01 (Mercedes Sprinter B6)', 'PRIS-TACTICAL-CHASE-02 (Land Cruiser V8)'],
      radioChannel: 'SEC-TACTICAL-CH4',
      inmates: [
        {
          name: 'Tariq Al-Mansoor',
          bookingNumber: 'INM-2024-0081',
          securityCategory: 'CAT_A',
          alias: 'The Architect',
          threatProfile: 'Extreme flight risk; high-level criminal syndicate leader; mandatory Level 3 mechanical body restraints.',
        },
        {
          name: 'Victor Ramos',
          bookingNumber: 'INM-2023-0941',
          securityCategory: 'CAT_A',
          alias: 'El Lobo',
          threatProfile: 'Aggravated firearms offenses; active gang liaison; no contact with civilian spectators permitted.',
        },
        {
          name: 'Devon Vance',
          bookingNumber: 'INM-2025-0104',
          securityCategory: 'CAT_B',
          alias: 'Hawk',
          threatProfile: 'Key witness under protective segregation; isolated transit cage required inside cellular coach.',
        }
      ],
      mandatoryPrecautionsEn: [
        'Full mechanical body irons (double handcuffs behind back + leg chains + connector link).',
        'Armored tactical chase vehicle maintaining 20m rear perimeter buffer with emergency strobe warning.',
        'Continuous encrypted GPS satellite tracking with automated 10-minute sitrep check-ins.',
        'Immediate emergency route diversion protocol activated if corridor congestion exceeds 4 minutes.'
      ],
      mandatoryPrecautionsFr: [
        'Entraves complètes (menottes doubles dans le dos + fers aux pieds + chaîne de liaison).',
        'Véhicule d\'escorte tactique blindé maintenant une zone tampon de 20m à l\'arrière.',
        'Suivi GPS satellitaire crypté continu avec confirmation radio toutes les 10 minutes.',
        'Protocole d\'évitement d\'urgence activé si le ralentissement sur l\'itinéraire dépasse 4 min.'
      ],
      status: 'Ready for Staging (Sallyport East)',
    },
    {
      id: 'mov-02',
      missionCode: 'TRF/2026/0088',
      movementType: 'tactical_inter_facility_transfer',
      threatRating: 'TACTICAL_HIGH_ESCORT',
      originFacility: "King'ong'o Central Remand & Judicial Holding (FAC-04)",
      destination: 'Kamiti National Maximum Security Penitentiary (FAC-01)',
      scheduledTime: '13:00 Departure (ETA 16:15)',
      escortCommander: 'Inspector David Cole (TPEU Unit 2)',
      armedOfficersCount: 6,
      vehiclesAssigned: ['PRIS-ARMOR-03 (Armored Tactical Escort)', 'PRIS-PATROL-07'],
      radioChannel: 'SEC-INTERFAC-CH2',
      inmates: [
        {
          name: 'Marcus Kiprono',
          bookingNumber: 'INM-2024-0089',
          securityCategory: 'CAT_A',
          alias: 'The Hammer',
          threatProfile: 'Transferred under Section 46 warrant for enhanced solitary holding following disciplinary weapon infraction.',
        }
      ],
      mandatoryPrecautionsEn: [
        'Class 1 armed escort protocol with secondary armed vehicle escort.',
        'Direct gate-to-gate nonstop transit authorization; no civilian rest stops permitted.',
        'Warden-to-Warden biometric verification before opening cellular cage.'
      ],
      mandatoryPrecautionsFr: [
        'Protocole d\'escorte armée classe 1 avec véhicule d\'appui armé secondaire.',
        'Transit direct porte-à-porte sans escale civile.',
        'Vérification biométrique entre chefs d\'établissement avant déverrouillage de la cage.'
      ],
      status: 'Warrant Cleared & Requisition Authorized',
    },
    {
      id: 'mov-03',
      missionCode: 'CNV/2026/0032',
      movementType: 'armed_court_convoy',
      threatRating: 'SPECIAL_OPERATIONS',
      originFacility: 'Western Region Correctional Institution',
      destination: 'Chief Magistrate Court Division 3',
      scheduledTime: '08:30 AM Departure (ETA 09:10 AM)',
      escortCommander: 'Senior Sergeant K. Mwangi',
      armedOfficersCount: 6,
      vehiclesAssigned: ['PRIS-COACH-04 (Heavy Secured Transit Coach)'],
      radioChannel: 'SEC-COURT-CH1',
      inmates: [
        {
          name: 'Marcus Brody & Samuel Mwangi Cohort (6 Inmates)',
          bookingNumber: 'BATCH-REM-0922',
          securityCategory: 'CAT_B & CAT_C',
          threatProfile: 'Remand cohort for pre-trial plea mention; segregated seating inside coach partition.',
        }
      ],
      mandatoryPrecautionsEn: [
        'Individual pat-down search and metal detector pass before boarding.',
        'Dedicated court lockup cells pre-inspected prior to cohort arrival.'
      ],
      mandatoryPrecautionsFr: [
        'Fouille corporelle complète et passage détecteur métaux avant embarquement.',
        'Inspection préalable des cellules d\'attente du tribunal avant l\'arrivée du convoi.'
      ],
      status: 'Staging in Compound Yard',
    }
  ];

  // 4. Shift Staffing & Block Manning Summary
  const currentShiftRoster = roster.filter((r) => r.shift === shift && r.dutyStatus === 'on_duty');
  const totalOfficersOnDuty = currentShiftRoster.length;
  const totalArmedSentinels = currentShiftRoster.filter((r) => r.isArmed).length;
  const totalStandbyReserves = roster.filter((r) => r.shift === shift && r.dutyStatus === 'standby').length;

  const understaffedBlocks = cellBlocks
    .map((block) => {
      const assigned = currentShiftRoster.filter((r) => r.blockId === block.id).length;
      const minRequired = block.blockType === 'high_security' ? 3 : block.blockType === 'remand_wing' ? 3 : 2;
      const deficit = minRequired - assigned;
      return {
        blockName: block.name,
        assignedCount: assigned,
        requiredCount: minRequired,
        deficit: Math.max(0, deficit),
      };
    })
    .filter((b) => b.deficit > 0);

  const totalRequiredAllBlocks = cellBlocks.reduce((sum, b) => {
    return sum + (b.blockType === 'high_security' ? 3 : b.blockType === 'remand_wing' ? 3 : 2);
  }, 0);
  const totalAssignedAllBlocks = currentShiftRoster.filter((r) => r.blockId).length;
  const overallCoveragePercent = totalRequiredAllBlocks > 0 
    ? Math.min(100, Math.round((totalAssignedAllBlocks / totalRequiredAllBlocks) * 100))
    : 100;

  return {
    reportId: `BRF-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${shift.toUpperCase()}`,
    classificationNotice: 'RESTRICTED // CORRECTIONAL COMMAND DUTY BRIEFING // LAW ENFORCEMENT SENSITIVE',
    generatedAtISO: now.toISOString(),
    generatedAtFormatted: reportTimestamp,
    shift,
    shiftHours: shiftConfig.hours,
    commandingOfficer,
    facilityScope: 'All Regional Correctional Commands & Maximum Security Facilities',
    systemSummary: {
      totalInmates,
      totalCapacity,
      overallOccupancyRate,
      totalRemand,
      totalConvicted,
      totalCatAHighSecurity,
      overcrowdedFacilitiesCount,
    },
    facilityCounts,
    criticalAlerts,
    highRiskMovements,
    staffingSummary: {
      shift,
      shiftHours: shiftConfig.hours,
      totalOfficersOnDuty,
      totalArmedSentinels,
      totalStandbyReserves,
      understaffedBlocks,
      overallCoveragePercent,
    }
  };
}

/**
 * Formats the Shift Briefing Report as clean plain text suitable for
 * radio broadcast transcripts, daily shift handover telex, or clipboard copying.
 */
export function formatReportPlainText(report: ShiftBriefingReportData, language: Language = 'en'): string {
  const isFr = language === 'fr';
  const sep = '='.repeat(78);
  const thin = '-'.repeat(78);

  const lines: string[] = [
    sep,
    isFr 
      ? `RAPPORT OFFICIEL DE BRIEFING DE QUART - ÉTAT DE SITUATION & SÉCURITÉ`
      : `OFFICIAL SHIFT BRIEFING & SITUATIONAL SECURITY REPORT`,
    `${report.classificationNotice}`,
    sep,
    isFr ? `RÉFÉRENCE RAPPORT   : ${report.reportId}` : `REPORT ID           : ${report.reportId}`,
    isFr ? `QUART DE SERVICE    : ${report.shift.toUpperCase()} (${report.shiftHours})` : `DUTY SHIFT          : ${report.shift.toUpperCase()} (${report.shiftHours})`,
    isFr ? `DATE & HEURE ÉMISSION: ${report.generatedAtFormatted}` : `ISSUED DATE & TIME  : ${report.generatedAtFormatted}`,
    isFr ? `OFFICIER DE COMMANDE : ${report.commandingOfficer}` : `DUTY COMMANDER      : ${report.commandingOfficer}`,
    isFr ? `PÉRIMÈTRE OPÉRATION : ${report.facilityScope}` : `FACILITY JURISDICTION: ${report.facilityScope}`,
    thin,
    '',
    isFr 
      ? `[1] ÉTAT DES EFFECTIFS CARCÉRAUX PAR ÉTABLISSEMENT (RECENSEMENT ACTUEL)`
      : `[1] TOTAL CURRENT INMATE POPULATION BY PRISON FACILITY`,
    thin,
    `System Total Population: ${report.systemSummary.totalInmates.toLocaleString()} / ${report.systemSummary.totalCapacity.toLocaleString()} beds (${report.systemSummary.overallOccupancyRate}% Occupancy)`,
    `Remand: ${report.systemSummary.totalRemand.toLocaleString()} | Convicted: ${report.systemSummary.totalConvicted.toLocaleString()} | CAT A High Security: ${report.systemSummary.totalCatAHighSecurity.toLocaleString()}`,
    `Overcrowded Facilities Alert: ${report.systemSummary.overcrowdedFacilitiesCount} facilities currently exceed 100% capacity`,
    '',
    // Facility table
    'FACILITY NAME                            | CODE     | COUNT / CAP  | OCC% | REMAND | CONVICT | CAT A',
    '-'.repeat(85),
    ...report.facilityCounts.map(f => {
      const name = f.facilityName.padEnd(40, ' ').substring(0, 40);
      const code = f.facilityCode.padEnd(8, ' ');
      const counts = `${f.currentInmates}/${f.capacity}`.padStart(12, ' ');
      const occ = `${f.occupancyRate}%`.padStart(5, ' ');
      const rem = `${f.remandCount}`.padStart(7, ' ');
      const con = `${f.convictedCount}`.padStart(8, ' ');
      const catA = `${f.highSecurityCatACount}`.padStart(6, ' ');
      return `${name} | ${code} | ${counts} | ${occ} | ${rem} | ${con} | ${catA}`;
    }),
    '',
    thin,
    isFr 
      ? `[2] ALERTES CRITIQUES POUR LES PROCHAINES 24 HEURES (${report.criticalAlerts.length} ACTIVES)`
      : `[2] CRITICAL SITUATIONAL ALERTS FOR NEXT 24 HOURS (${report.criticalAlerts.length} ACTIVE)`,
    thin,
    ...report.criticalAlerts.map((a, idx) => {
      const title = isFr ? a.titleFr : a.titleEn;
      const desc = isFr ? a.descriptionFr : a.descriptionEn;
      const action = isFr ? a.actionRequiredFr : a.actionRequiredEn;
      return [
        `ALERT #${idx + 1} [${a.level}] - CATEGORY: ${a.category.toUpperCase()}`,
        `TIMEFRAME: ${a.timeframe} | TARGET: ${a.affectedEntity} (${a.facilityName})`,
        `TITLE    : ${title}`,
        `BRIEFING : ${desc}`,
        `MANDATORY ACTION: ${action}`,
        '',
      ].join('\n');
    }),
    thin,
    isFr 
      ? `[3] MOUVEMENTS DE DÉTENUS À HAUT RISQUE & CONVOIS ARMÉS (${report.highRiskMovements.length} MISSIONS)`
      : `[3] HIGH-RISK INMATE MOVEMENTS & ARMED CONVOYS (${report.highRiskMovements.length} MISSIONS)`,
    thin,
    ...report.highRiskMovements.map((m, idx) => {
      const precautions = isFr ? m.mandatoryPrecautionsFr : m.mandatoryPrecautionsEn;
      const inmatesList = m.inmates.map(i => `  * ${i.name} (${i.securityCategory}) - ${i.threatProfile}`).join('\n');
      const precList = precautions.map(p => `  - ${p}`).join('\n');
      return [
        `MISSION #${idx + 1}: ${m.missionCode} [${m.threatRating}] - ${m.movementType.toUpperCase()}`,
        `ORIGIN     : ${m.originFacility}`,
        `DESTINATION: ${m.destination}`,
        `TIMELINE   : ${m.scheduledTime} | STATUS: ${m.status}`,
        `ESCORT     : ${m.escortCommander} (${m.armedOfficersCount} Armed Guards) | COMMS: ${m.radioChannel}`,
        `VEHICLES   : ${m.vehiclesAssigned.join(', ')}`,
        `INMATES IN TRANSIT:`,
        inmatesList,
        `MANDATORY TACTICAL PRECAUTIONS:`,
        precList,
        '',
      ].join('\n');
    }),
    thin,
    isFr 
      ? `[4] DISPOSITIF DU PERSONNEL DU QUART & COUVERTURE DES QUARTIERS`
      : `[4] SHIFT PERSONNEL MANNING & CELL BLOCK COVERAGE`,
    thin,
    `On Duty Sentinels: ${report.staffingSummary.totalOfficersOnDuty} | Armed Sentinels: ${report.staffingSummary.totalArmedSentinels} | Standby Reserves: ${report.staffingSummary.totalStandbyReserves}`,
    `Block Statutory Manning Compliance: ${report.staffingSummary.overallCoveragePercent}%`,
    report.staffingSummary.understaffedBlocks.length > 0
      ? `ATTENTION - UNDERSTAFFED BLOCKS:\n` + report.staffingSummary.understaffedBlocks.map(b => `  ! ${b.blockName}: ${b.assignedCount}/${b.requiredCount} officers (Deficit: -${b.deficit})`).join('\n')
      : `All active cell blocks meet minimum statutory security guard thresholds.`,
    '',
    sep,
    isFr ? `SIGNATURE DU COMMANDANT DE QUART SORTANT: ________________________________` : `OUTGOING SHIFT COMMANDER SIGNATURE: ____________________________________`,
    isFr ? `SIGNATURE DU COMMANDANT DE QUART ENTRANT: ________________________________` : `INCOMING SHIFT COMMANDER SIGNATURE: ____________________________________`,
    isFr ? `VISA & TAMPON DU SUPERINTENDANT DE GARDE : ________________________________` : `SUPERINTENDENT GOVERNOR APPROVAL  : ____________________________________`,
    sep,
  ];

  return lines.join('\n');
}
