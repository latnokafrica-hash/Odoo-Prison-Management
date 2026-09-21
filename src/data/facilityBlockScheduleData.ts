export interface ScheduledSafetyEvent {
  id: string;
  type: 'safety_inspection' | 'preventative_maintenance';
  title: string;
  facilityId: string;
  facilityName: string;
  blockId: string;
  blockName: string;
  cellRoomName?: string;
  scheduledDate: string; // YYYY-MM-DD format
  scheduledTime: string; // e.g. "08:30 - 10:30"
  category: 
    | 'locks_doors'
    | 'bars_grilles'
    | 'surveillance_cctv'
    | 'ventilation_air'
    | 'plumbing_sanitary'
    | 'electrical_lighting'
    | 'fire_life_safety'
    | 'anti_ligature';
  priority: 'urgent' | 'high' | 'medium' | 'routine';
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue';
  leadPerson: string;
  leadRole: string;
  leadBadge?: string;
  standardRef: string; // e.g. "KPS-SEC-LK01", "MANDELA-R14-VENT", "NFPA-10-KPS"
  mandelaRuleRef?: string;
  notes: string;
  complianceRequirements: string[];
  partsRequired?: string;
  estimatedDuration: string;
  recurrence?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  completedDate?: string;
  completionNotes?: string;
}

export interface FacilityBlockInfo {
  id: string;
  facilityId: string;
  name: string;
  type: 'maximum_security' | 'remand_wing' | 'isolation_segregation' | 'womens_nursery' | 'medium_custody' | 'open_dormitory' | 'workshop_industrial';
  cellCount: number;
  capacity: number;
  currentOccupancy: number;
  tierLevels: number;
  lastInspectedDate: string;
  nextScheduledInspectionDate: string;
  pendingWorkOrdersCount: number;
  overallSafetyRating: 'A' | 'B' | 'C' | 'CRITICAL';
}

export const FACILITY_BLOCKS: FacilityBlockInfo[] = [
  // Kamiti (FAC-01)
  {
    id: 'blk-01',
    facilityId: 'FAC-01',
    name: 'Block A - High Security Custody (Tier 1 & 2)',
    type: 'maximum_security',
    cellCount: 24,
    capacity: 240,
    currentOccupancy: 288,
    tierLevels: 2,
    lastInspectedDate: '2026-09-18',
    nextScheduledInspectionDate: '2026-09-21',
    pendingWorkOrdersCount: 2,
    overallSafetyRating: 'B'
  },
  {
    id: 'blk-02',
    facilityId: 'FAC-01',
    name: 'Block B - General Remand Wing',
    type: 'remand_wing',
    cellCount: 40,
    capacity: 400,
    currentOccupancy: 490,
    tierLevels: 3,
    lastInspectedDate: '2026-09-17',
    nextScheduledInspectionDate: '2026-09-21',
    pendingWorkOrdersCount: 3,
    overallSafetyRating: 'B'
  },
  {
    id: 'blk-03',
    facilityId: 'FAC-01',
    name: 'Block C - Isolation & Segregation Tier',
    type: 'isolation_segregation',
    cellCount: 16,
    capacity: 16,
    currentOccupancy: 15,
    tierLevels: 1,
    lastInspectedDate: '2026-09-10',
    nextScheduledInspectionDate: '2026-09-24',
    pendingWorkOrdersCount: 1,
    overallSafetyRating: 'A'
  },

  // Lang'ata Women's (FAC-02)
  {
    id: 'blk-w01',
    facilityId: 'FAC-02',
    name: 'Block W1 - Mother & Child Nursery & Rehab Wing',
    type: 'womens_nursery',
    cellCount: 20,
    capacity: 120,
    currentOccupancy: 98,
    tierLevels: 2,
    lastInspectedDate: '2026-09-16',
    nextScheduledInspectionDate: '2026-09-22',
    pendingWorkOrdersCount: 0,
    overallSafetyRating: 'A'
  },
  {
    id: 'blk-w02',
    facilityId: 'FAC-02',
    name: 'Block W2 - Remand & Trial Intake Ward',
    type: 'remand_wing',
    cellCount: 25,
    capacity: 200,
    currentOccupancy: 174,
    tierLevels: 2,
    lastInspectedDate: '2026-09-12',
    nextScheduledInspectionDate: '2026-09-25',
    pendingWorkOrdersCount: 1,
    overallSafetyRating: 'A'
  },
  {
    id: 'blk-w03',
    facilityId: 'FAC-02',
    name: 'Block W3 - Vocational Skills & Tailoring Compound',
    type: 'workshop_industrial',
    cellCount: 12,
    capacity: 150,
    currentOccupancy: 110,
    tierLevels: 1,
    lastInspectedDate: '2026-09-08',
    nextScheduledInspectionDate: '2026-10-08',
    pendingWorkOrdersCount: 1,
    overallSafetyRating: 'B'
  },

  // Shimo La Tewa (FAC-03)
  {
    id: 'blk-c01',
    facilityId: 'FAC-03',
    name: 'Coastal Block C - Medium Security Tier',
    type: 'medium_custody',
    cellCount: 30,
    capacity: 350,
    currentOccupancy: 395,
    tierLevels: 2,
    lastInspectedDate: '2026-09-15',
    nextScheduledInspectionDate: '2026-09-21',
    pendingWorkOrdersCount: 4,
    overallSafetyRating: 'CRITICAL'
  },
  {
    id: 'blk-c02',
    facilityId: 'FAC-03',
    name: 'Coastal Block D - Industrial Workshop Wing',
    type: 'workshop_industrial',
    cellCount: 18,
    capacity: 220,
    currentOccupancy: 195,
    tierLevels: 1,
    lastInspectedDate: '2026-09-11',
    nextScheduledInspectionDate: '2026-09-30',
    pendingWorkOrdersCount: 2,
    overallSafetyRating: 'B'
  },

  // King'ong'o (FAC-04)
  {
    id: 'blk-k01',
    facilityId: 'FAC-04',
    name: 'Holding Block 1 - Judicial Transit Cells',
    type: 'remand_wing',
    cellCount: 20,
    capacity: 200,
    currentOccupancy: 245,
    tierLevels: 1,
    lastInspectedDate: '2026-09-14',
    nextScheduledInspectionDate: '2026-09-23',
    pendingWorkOrdersCount: 2,
    overallSafetyRating: 'B'
  },
  {
    id: 'blk-k02',
    facilityId: 'FAC-04',
    name: 'Holding Block 2 - Youth Remand Section',
    type: 'remand_wing',
    cellCount: 15,
    capacity: 150,
    currentOccupancy: 165,
    tierLevels: 1,
    lastInspectedDate: '2026-09-09',
    nextScheduledInspectionDate: '2026-10-02',
    pendingWorkOrdersCount: 1,
    overallSafetyRating: 'B'
  },

  // Naivasha Open Camp (FAC-05)
  {
    id: 'blk-d01',
    facilityId: 'FAC-05',
    name: 'Dormitory Ward 1 - Agri-Vocational Cohort',
    type: 'open_dormitory',
    cellCount: 8,
    capacity: 300,
    currentOccupancy: 260,
    tierLevels: 1,
    lastInspectedDate: '2026-09-12',
    nextScheduledInspectionDate: '2026-09-23',
    pendingWorkOrdersCount: 2,
    overallSafetyRating: 'A'
  },
  {
    id: 'blk-d02',
    facilityId: 'FAC-05',
    name: 'Dormitory Ward 2 - Pre-Release Transition Camp',
    type: 'open_dormitory',
    cellCount: 6,
    capacity: 200,
    currentOccupancy: 175,
    tierLevels: 1,
    lastInspectedDate: '2026-09-05',
    nextScheduledInspectionDate: '2026-10-06',
    pendingWorkOrdersCount: 0,
    overallSafetyRating: 'A'
  }
];

export const INITIAL_SCHEDULED_EVENTS: ScheduledSafetyEvent[] = [
  // Today: 2026-09-21
  {
    id: 'evt-001',
    type: 'preventative_maintenance',
    title: 'Mechanical Cell Deadbolts & Tier Sallyport Strike Lubrication',
    facilityId: 'FAC-01',
    facilityName: 'Kamiti National Maximum Security Penitentiary',
    blockId: 'blk-01',
    blockName: 'Block A - High Security Custody (Tier 1 & 2)',
    cellRoomName: 'Cells A-101 through A-124',
    scheduledDate: '2026-09-21',
    scheduledTime: '08:00 - 10:30',
    category: 'locks_doors',
    priority: 'high',
    status: 'in_progress',
    leadPerson: 'Chief Armorer Benson Ndwiga',
    leadRole: 'Senior Security Locksmith Specialist',
    leadBadge: 'KPS-TECH-409',
    standardRef: 'KPS-SEC-LK01',
    notes: 'Bimonthly preventative servicing of heavy mechanical dual-throw deadbolts and electronic strike contacts. Apply graphite micro-lubricant and torque-check hinge mounting plates.',
    complianceRequirements: [
      'Dual officer escort during tier deadbolt servicing',
      'Test key retention mechanism on all 24 lockboxes',
      'Log torque specifications (minimum 45 Nm anchor bolts)'
    ],
    partsRequired: 'Synthetic dry graphite lubricant, 8x M10 tamper-resistant security shear bolts',
    estimatedDuration: '2.5 hrs',
    recurrence: 'biweekly'
  },
  {
    id: 'evt-002',
    type: 'safety_inspection',
    title: 'Mandela Rule 13/14 Sanitation & Anti-Contraband Tier Sweep',
    facilityId: 'FAC-01',
    facilityName: 'Kamiti National Maximum Security Penitentiary',
    blockId: 'blk-02',
    blockName: 'Block B - General Remand Wing',
    cellRoomName: 'Remand Tier 2 (Cells B-201 to B-220)',
    scheduledDate: '2026-09-21',
    scheduledTime: '11:00 - 13:00',
    category: 'plumbing_sanitary',
    priority: 'routine',
    status: 'scheduled',
    leadPerson: 'Chief Inspector Evans Mutua',
    leadRole: 'Lead Custodial Safety Inspector',
    leadBadge: 'KPS-7120',
    standardRef: 'MANDELA-R13-SAN',
    mandelaRuleRef: 'Mandela Rule 13 (Hygiene) & Rule 14 (Ventilation)',
    notes: 'Verify push-valve water pressure, ceiling vents air-flow velocity, and examine drain grates for contraband concealment cavities.',
    complianceRequirements: [
      'Minimum water pressure 1.5 bar at drinking faucets',
      'Acoustic resonance check on ceiling air ducts',
      'Mandatory chemical sanitation log recording'
    ],
    estimatedDuration: '2.0 hrs',
    recurrence: 'weekly'
  },
  {
    id: 'evt-003',
    type: 'safety_inspection',
    title: 'Coastal Marine Bar Rust & Ultrasonic Steel Wall Thickness Audit',
    facilityId: 'FAC-03',
    facilityName: 'Shimo La Tewa Medium Security & Remand',
    blockId: 'blk-c01',
    blockName: 'Coastal Block C - Medium Security Tier',
    cellRoomName: 'Cells C-101 to C-130',
    scheduledDate: '2026-09-21',
    scheduledTime: '14:00 - 16:30',
    category: 'bars_grilles',
    priority: 'urgent',
    status: 'scheduled',
    leadPerson: 'Inspector Ali Hassan Jr.',
    leadRole: 'Perimeter Infrastructure Inspector',
    leadBadge: 'KPS-6401',
    standardRef: 'KPS-BAR-01',
    notes: 'URGENT SECURITY AUDIT: High salinity sea breeze has caused localized pitting. Ultrasonic non-destructive gauge scan to verify 25mm manganese bar core integrity.',
    complianceRequirements: [
      'Calibrated ultrasonic thickness gauge reading on all 60 window bars',
      'Immediate red-flag condemnation if wall thinning exceeds 15%',
      'Verify zinc oxide epoxy primer coverage'
    ],
    partsRequired: 'Ultrasonic thickness meter, zinc anti-corrosion touchup enamel',
    estimatedDuration: '2.5 hrs',
    recurrence: 'biweekly'
  },

  // Tomorrow: 2026-09-22
  {
    id: 'evt-004',
    type: 'preventative_maintenance',
    title: 'Fire Extinguisher Hydrostatic Re-tagging & ABC Powder Recharge',
    facilityId: 'FAC-03',
    facilityName: 'Shimo La Tewa Medium Security & Remand',
    blockId: 'blk-c01',
    blockName: 'Coastal Block C - Medium Security Tier',
    cellRoomName: 'Corridors & Sallyport Stations',
    scheduledDate: '2026-09-22',
    scheduledTime: '09:00 - 11:30',
    category: 'fire_life_safety',
    priority: 'high',
    status: 'scheduled',
    leadPerson: 'Mombasa Coast Safety & Fire Services Crew',
    leadRole: 'Certified Life Safety Contractor',
    leadBadge: 'FIRE-MBS-902',
    standardRef: 'NFPA-10-KPS',
    notes: 'Recharge 6 units of 9kg dry chemical powder extinguishers EXT-C01 through EXT-C06; replace tamper seal tags and update monthly maintenance card.',
    complianceRequirements: [
      'Gauge pressure check at 14 bar operating rating',
      'Tamper-evident wire security seals with 2026 certification sticker',
      'Verify unobstructed 1-meter access zone in sallyport'
    ],
    partsRequired: '6x 9kg ABC powder recharge kits, 6x tamper seals',
    estimatedDuration: '2.5 hrs',
    recurrence: 'monthly'
  },
  {
    id: 'evt-005',
    type: 'safety_inspection',
    title: 'Nursery Wing Natural Air Flow & Environmental Health Certification',
    facilityId: 'FAC-02',
    facilityName: "Lang'ata Women's Correctional Centre",
    blockId: 'blk-w01',
    blockName: 'Block W1 - Mother & Child Nursery & Rehab Wing',
    cellRoomName: 'Wards W1-A & W1-B',
    scheduledDate: '2026-09-22',
    scheduledTime: '10:00 - 12:00',
    category: 'ventilation_air',
    priority: 'routine',
    status: 'scheduled',
    leadPerson: 'Dr. Esther Wanjiku (M.O.) & Supt. Grace Chebet',
    leadRole: 'Correctional Medical & Custodial Inspection Board',
    leadBadge: 'KPS-MED-110',
    standardRef: 'MANDELA-R14-VENT',
    mandelaRuleRef: 'Mandela Rule 14 & Bangkok Rule 48 (Mothers in Prison)',
    notes: 'Annual mandatory review of natural air circulation velocity, window daylight ingress, nursery temperature humidity controls, and infant crib anti-ligature compliance.',
    complianceRequirements: [
      'Anemometer airflow reading at window louvers (>0.3 m/s)',
      'Ambient lighting lux meter check (>150 Lux daylight)',
      'Water potable chlorine residual test'
    ],
    estimatedDuration: '2.0 hrs',
    recurrence: 'monthly'
  },

  // 2026-09-23
  {
    id: 'evt-006',
    type: 'preventative_maintenance',
    title: 'Night Infrared Illumination & PTZ CCTV Blindspot Sweep',
    facilityId: 'FAC-04',
    facilityName: "King'ong'o Central Remand & Judicial Holding",
    blockId: 'blk-k01',
    blockName: 'Holding Block 1 - Judicial Transit Cells',
    cellRoomName: 'Transit Holding Corridors & Perimeter Walk',
    scheduledDate: '2026-09-23',
    scheduledTime: '13:00 - 15:30',
    category: 'surveillance_cctv',
    priority: 'medium',
    status: 'scheduled',
    leadPerson: 'Technician Francis Macharia',
    leadRole: 'CCTV Telecommunications Engineer',
    leadBadge: 'KPS-CCTV-082',
    standardRef: 'KPS-SURV-01',
    notes: 'Recalibrate PTZ pan-tilt sweeps on cameras CAM-K01 through CAM-K06. Clean optical domes, replace IR LED matrix on CAM-K03, verify 30-day NVR retention.',
    complianceRequirements: [
      'Zero blindspot in prisoner holding bullpen',
      'Minimum 1080p stream bitrate at 25 fps',
      'Backup battery inverter transfer latency < 50ms'
    ],
    partsRequired: 'IR replacement ring array, optical anti-fog cleaning spray',
    estimatedDuration: '2.5 hrs',
    recurrence: 'monthly'
  },
  {
    id: 'evt-007',
    type: 'preventative_maintenance',
    title: 'Borehole Water Purification & Anti-Tamper Plumbing Pressure Overhaul',
    facilityId: 'FAC-05',
    facilityName: 'Naivasha Open Camp & Agri-Rehab Trust',
    blockId: 'blk-d01',
    blockName: 'Dormitory Ward 1 - Agri-Vocational Cohort',
    cellRoomName: 'Ablution Block D1',
    scheduledDate: '2026-09-23',
    scheduledTime: '08:30 - 11:00',
    category: 'plumbing_sanitary',
    priority: 'routine',
    status: 'scheduled',
    leadPerson: 'Chief Inspector David Omondi',
    leadRole: 'Station Facilities & Farm Engineer',
    leadBadge: 'KPS-FAC-331',
    standardRef: 'MANDELA-R13-WTR',
    notes: 'Flush quartz sand filters in water treatment header tank. Inspect tamper-proof push-taps and clean silt buildup in perimeter settling traps.',
    complianceRequirements: [
      'Flow rate minimum 10 liters/min at main troughs',
      'Zero chemical leaks in dosing pump',
      'Test water safety pH 7.2 - 7.6'
    ],
    partsRequired: '2x 50-micron sediment filter cartridges',
    estimatedDuration: '2.5 hrs',
    recurrence: 'monthly'
  },

  // 2026-09-24
  {
    id: 'evt-008',
    type: 'safety_inspection',
    title: 'Anti-Ligature & Barricade Resistance Physical Security Sweep',
    facilityId: 'FAC-01',
    facilityName: 'Kamiti National Maximum Security Penitentiary',
    blockId: 'blk-03',
    blockName: 'Block C - Isolation & Segregation Tier',
    cellRoomName: 'Solitary Cells C-01 through C-16',
    scheduledDate: '2026-09-24',
    scheduledTime: '09:00 - 11:30',
    category: 'anti_ligature',
    priority: 'urgent',
    status: 'scheduled',
    leadPerson: 'Senior Inspector David Kiprop',
    leadRole: 'Senior Prison Safety Inspector',
    leadBadge: 'KPS-8841',
    standardRef: 'WHO-PRIS-LIG01',
    mandelaRuleRef: 'Mandela Rules 43-45 (Disciplinary Measures & Segregation)',
    notes: 'Rigorous anti-suicide anchor point evaluation in all isolation cells. Inspect rounded door furniture, recessed luminaire bezels, flush radiator grills, and smooth bunk welds.',
    complianceRequirements: [
      'Zero load-bearing anchor points over 10kg force',
      'Recessed observation window glass shatter-resistance test',
      'Duress intercom two-way audio verification'
    ],
    estimatedDuration: '2.5 hrs',
    recurrence: 'biweekly'
  },

  // 2026-09-25
  {
    id: 'evt-009',
    type: 'preventative_maintenance',
    title: 'Service Rooftop Wind Turbine Whirlybird Ventilators',
    facilityId: 'FAC-05',
    facilityName: 'Naivasha Open Camp & Agri-Rehab Trust',
    blockId: 'blk-d01',
    blockName: 'Dormitory Ward 1 - Agri-Vocational Cohort',
    cellRoomName: 'Rooftop Ventilation Trunks',
    scheduledDate: '2026-09-25',
    scheduledTime: '10:00 - 13:00',
    category: 'ventilation_air',
    priority: 'medium',
    status: 'scheduled',
    leadPerson: 'Prison Carpentry & Mechanical Apprentice Crew',
    leadRole: 'Vocational Engineering Apprentice Unit',
    leadBadge: 'KPS-VOC-89',
    standardRef: 'KPS-ENV-02',
    notes: 'Service 4 rooftop spinning ventilator turbines; inspect roller bearings, remove bird debris, lubricate with high-temp lithium grease.',
    complianceRequirements: [
      'Roof tether fall-protection safety harness protocol',
      'Free spin velocity test under 5 knot breeze',
      'Mesh anti-bird screen wire tie security check'
    ],
    partsRequired: 'High-temp lithium grease, 4x rubber dust seals',
    estimatedDuration: '3.0 hrs',
    recurrence: 'quarterly'
  },
  {
    id: 'evt-010',
    type: 'preventative_maintenance',
    title: 'Standby Diesel Generator Automatic Transfer Switch (ATS) Load Test',
    facilityId: 'FAC-02',
    facilityName: "Lang'ata Women's Correctional Centre",
    blockId: 'blk-w02',
    blockName: 'Block W2 - Remand & Trial Intake Ward',
    cellRoomName: 'Power Substation & Intake Tier Switchgear',
    scheduledDate: '2026-09-25',
    scheduledTime: '14:00 - 16:00',
    category: 'electrical_lighting',
    priority: 'high',
    status: 'scheduled',
    leadPerson: 'Kenya Power Correctional Liaison Engineer',
    leadRole: 'Certified High Voltage Electrical Engineer',
    leadBadge: 'KPLC-SEC-55',
    standardRef: 'KPS-ELEC-02',
    notes: 'Simulate utility grid failure to test 250kVA Perkins emergency generator and verify automatic switchover under full block illumination load in < 8 seconds.',
    complianceRequirements: [
      'ATS trigger time must not exceed 10 seconds',
      'Emergency tier nightlights continuous lux test',
      'Fuel reserve tank reading (minimum 72-hour autonomy)'
    ],
    partsRequired: 'Primary diesel fuel filter, 24V starter battery water top-up',
    estimatedDuration: '2.0 hrs',
    recurrence: 'monthly'
  },

  // 2026-09-28
  {
    id: 'evt-011',
    type: 'safety_inspection',
    title: 'Quarterly Structural Concrete & Manganese Bar Ultrasonic Scan',
    facilityId: 'FAC-01',
    facilityName: 'Kamiti National Maximum Security Penitentiary',
    blockId: 'blk-01',
    blockName: 'Block A - High Security Custody (Tier 1 & 2)',
    cellRoomName: 'Foundation Footings & Tier 1 Slabs',
    scheduledDate: '2026-09-28',
    scheduledTime: '08:30 - 12:00',
    category: 'bars_grilles',
    priority: 'high',
    status: 'scheduled',
    leadPerson: 'Ministry of Public Works Structural Engineering Team',
    leadRole: 'Government Structural Safety Inspector',
    leadBadge: 'PWD-STR-012',
    standardRef: 'KPS-BAR-02',
    notes: 'Quarterly comprehensive structural integrity assessment following seasonal rains. Check for foundation settlement, spalling concrete, and corrosion in load-bearing columns.',
    complianceRequirements: [
      'Rebar cover depth ultrasonic check',
      'Crack gauge measurement documentation',
      'Perimeter catwalk structural bracket vibration test'
    ],
    estimatedDuration: '3.5 hrs',
    recurrence: 'quarterly'
  },

  // 2026-09-30
  {
    id: 'evt-012',
    type: 'safety_inspection',
    title: 'Workshop Industrial Machinery Safety Guard & Emergency Stop Interlock Audit',
    facilityId: 'FAC-03',
    facilityName: 'Shimo La Tewa Medium Security & Remand',
    blockId: 'blk-c02',
    blockName: 'Coastal Block D - Industrial Workshop Wing',
    cellRoomName: 'Woodworking & Metal Fabrication Benches',
    scheduledDate: '2026-09-30',
    scheduledTime: '09:30 - 12:30',
    category: 'electrical_lighting',
    priority: 'routine',
    status: 'scheduled',
    leadPerson: 'Inspector Ali Hassan Jr. & OSHA Inspector Wachira',
    leadRole: 'Industrial Safety & Correctional Compliance Officer',
    leadBadge: 'OSHA-COAST-77',
    standardRef: 'KPS-SEC-LK03',
    notes: 'Audit emergency push-button kill-switches on 8 heavy carpentry table saws and metal lathes. Ensure tool shadow-boards and locked master power relays are functioning.',
    complianceRequirements: [
      'Emergency stop brake engagement < 0.5s',
      'Eye wash station flow verification',
      'Tool lockbox serial inventory audit'
    ],
    estimatedDuration: '3.0 hrs',
    recurrence: 'monthly'
  },

  // 2026-10-02
  {
    id: 'evt-013',
    type: 'preventative_maintenance',
    title: 'Sanitary Sewer Mainline Hydro-Jet Desilting & Grease Trap Clearing',
    facilityId: 'FAC-04',
    facilityName: "King'ong'o Central Remand & Judicial Holding",
    blockId: 'blk-k02',
    blockName: 'Holding Block 2 - Youth Remand Section',
    cellRoomName: 'Main Sewer Trunk Chamber MH-02 to MH-05',
    scheduledDate: '2026-10-02',
    scheduledTime: '09:00 - 12:00',
    category: 'plumbing_sanitary',
    priority: 'medium',
    status: 'scheduled',
    leadPerson: 'Nyeri County Water & Sanitation Technical Team',
    leadRole: 'Municipal Sewerage Operations Unit',
    leadBadge: 'NYERI-SAN-19',
    standardRef: 'KPS-PLB-03',
    notes: 'Bimonthly hydro-jet flushing of main 300mm PVC sewer line to prevent grease blockages and backup into ground-floor holding cells.',
    complianceRequirements: [
      'Zero overflow risk during live flush',
      'Inspect anti-contraband security trap grates',
      'Disinfect inspection chambers with biodegradable biocide'
    ],
    partsRequired: 'Heavy-duty rotary jetting nozzles, biocide flush solution',
    estimatedDuration: '3.0 hrs',
    recurrence: 'monthly'
  },

  // 2026-10-05
  {
    id: 'evt-014',
    type: 'preventative_maintenance',
    title: 'Push-Button Flush Diaphragm Overhaul & Water Conservation Tuning',
    facilityId: 'FAC-01',
    facilityName: 'Kamiti National Maximum Security Penitentiary',
    blockId: 'blk-02',
    blockName: 'Block B - General Remand Wing',
    cellRoomName: 'Cells B-101 to B-120 Ablution Banks',
    scheduledDate: '2026-10-05',
    scheduledTime: '10:00 - 13:00',
    category: 'plumbing_sanitary',
    priority: 'routine',
    status: 'scheduled',
    leadPerson: 'Plumbing Foreman John Mwangi',
    leadRole: 'Correctional Plumbing Superintendent',
    leadBadge: 'KPS-PLB-04',
    standardRef: 'MANDELA-R13-SAN',
    notes: 'Replace worn rubber diaphragms in 20 heavy brass push-valves to reduce water waste and prevent continuous running toilets.',
    complianceRequirements: [
      'Calibrate flush volume to 6.0 liters per cycle',
      'Replace split pins and brass filter cups',
      'Verify zero back-siphonage into potable lines'
    ],
    partsRequired: '20x Neoprene push-valve diaphragms, Teflon sealing tape',
    estimatedDuration: '3.0 hrs',
    recurrence: 'monthly'
  },

  // 2026-10-08
  {
    id: 'evt-015',
    type: 'safety_inspection',
    title: 'Fire Alarm Strobe Annunciator & Smoke Extraction Negative-Pressure Test',
    facilityId: 'FAC-02',
    facilityName: "Lang'ata Women's Correctional Centre",
    blockId: 'blk-w03',
    blockName: 'Block W3 - Vocational Skills & Tailoring Compound',
    cellRoomName: 'Fabric Store & Main Sewing Hall',
    scheduledDate: '2026-10-08',
    scheduledTime: '11:00 - 13:00',
    category: 'fire_life_safety',
    priority: 'high',
    status: 'scheduled',
    leadPerson: 'Chief Inspector Evans Mutua & Nairobi Fire Brigade',
    leadRole: 'Joint Fire & Life Safety Commission',
    leadBadge: 'KPS-FIRE-03',
    standardRef: 'NFPA-101-LIFE',
    notes: 'Test acoustic alarm decibel level (minimum 85 dB at pillow height), strobe visibility in high lint storage, and automatic smoke damper release.',
    complianceRequirements: [
      'Audible alarm across all work areas',
      'Manual pull station tamper glass inspection',
      'Secondary battery backup voltage check'
    ],
    estimatedDuration: '2.0 hrs',
    recurrence: 'monthly'
  }
];
