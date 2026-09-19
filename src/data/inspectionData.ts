import { 
  CellBlockInspectionRecord, 
  InfrastructureCheckItem, 
  MaintenanceWorkOrder, 
  SanitationViolation,
  InfrastructureCategory
} from '../types';

export const STANDARD_INFRASTRUCTURE_ITEMS: Omit<InfrastructureCheckItem, 'id' | 'status' | 'notes' | 'lastChecked'>[] = [
  // 1. Locks & Heavy Doors
  {
    category: 'locks_doors',
    name: 'Mechanical Cell Deadbolts & Heavy Tumbler Locks',
    standardCode: 'KPS-SEC-LK01'
  },
  {
    category: 'locks_doors',
    name: 'Interlocking Tier Sallyport & Gate Electronic Strike',
    standardCode: 'KPS-SEC-LK02'
  },
  {
    category: 'locks_doors',
    name: 'Heavy Steel Door Hinges, Anchor Bolts & Latch Clearance',
    standardCode: 'KPS-SEC-LK03'
  },
  {
    category: 'locks_doors',
    name: 'Observation Vision Ports & Armored Polycarbonate Panels',
    standardCode: 'KPS-SEC-LK04'
  },

  // 2. Bars & Security Grilles
  {
    category: 'bars_grilles',
    name: 'Cell Window Manganese Bar Integrity & Acoustic Ring Test',
    standardCode: 'KPS-BAR-01'
  },
  {
    category: 'bars_grilles',
    name: 'Perimeter Catwalk Guard Rails & Anti-Climb Grilles',
    standardCode: 'KPS-BAR-02'
  },
  {
    category: 'bars_grilles',
    name: 'Perimeter Wall Wire Mesh & Razor Ribbon Reinforcement',
    standardCode: 'KPS-BAR-03'
  },

  // 3. Surveillance & Optical Coverage
  {
    category: 'surveillance_cctv',
    name: 'PTZ & Fixed Dome CCTV Camera Optics & Zero-Blindspot Sweep',
    standardCode: 'KPS-SURV-01'
  },
  {
    category: 'surveillance_cctv',
    name: 'Night Infrared Illumination & Video Frame Latency Check',
    standardCode: 'KPS-SURV-02'
  },
  {
    category: 'surveillance_cctv',
    name: 'Guard Patrol Duress Intercom & Sound-Level Audio Monitor',
    standardCode: 'KPS-SURV-03'
  },

  // 4. Ventilation & Environmental
  {
    category: 'ventilation_air',
    name: 'Mandela Rule 14 Natural Air Circulation & Cross-Draft Velocity',
    standardCode: 'MANDELA-R14-VENT'
  },
  {
    category: 'ventilation_air',
    name: 'Forced Mechanical Exhaust Ducts & Air Duct Grille Security',
    standardCode: 'KPS-ENV-02'
  },
  {
    category: 'ventilation_air',
    name: 'Natural Daylight Ingress Windows & Clean Louver Vents',
    standardCode: 'MANDELA-R14-LGT'
  },

  // 5. Plumbing & Sanitary Installations
  {
    category: 'plumbing_sanitary',
    name: 'Mandela Rule 13 Push-Button Sanitary Toilet & Flush Pressure',
    standardCode: 'MANDELA-R13-SAN'
  },
  {
    category: 'plumbing_sanitary',
    name: 'Potable Drinking Water Faucet Ingress & Anti-Tamper Basin',
    standardCode: 'MANDELA-R13-WTR'
  },
  {
    category: 'plumbing_sanitary',
    name: 'Floor Drainage Traps, Anti-Contraband Grates & Sewer Flow',
    standardCode: 'KPS-PLB-03'
  },

  // 6. Electrical & Illumination
  {
    category: 'electrical_lighting',
    name: 'Vandal-Proof Tamper-Resistant Ceiling Luminaire (Min 100 Lux)',
    standardCode: 'MANDELA-R14-ELEC'
  },
  {
    category: 'electrical_lighting',
    name: 'Emergency Standby Circuit & Battery Inverter Night Lights',
    standardCode: 'KPS-ELEC-02'
  },
  {
    category: 'electrical_lighting',
    name: 'Concealed Conduit Integrity & Zero Exposed Wire Splices',
    standardCode: 'KPS-ELEC-03'
  },

  // 7. Fire & Life Safety
  {
    category: 'fire_life_safety',
    name: 'Dry Powder & CO2 Fire Extinguisher Gauges & Monthly Seal Tag',
    standardCode: 'NFPA-10-KPS'
  },
  {
    category: 'fire_life_safety',
    name: 'Primary & Emergency Egress Corridors Clear of Obstruction',
    standardCode: 'NFPA-101-LIFE'
  },
  {
    category: 'fire_life_safety',
    name: 'Acoustic Smoke Detectors & Fire Alarm Beacon Annunciator',
    standardCode: 'KPS-FIRE-03'
  },

  // 8. Anti-Ligature & Suicide Prevention
  {
    category: 'anti_ligature',
    name: 'Anti-Ligature Coat Pegs, Door Knobs & Flush Fixtures',
    standardCode: 'WHO-PRIS-LIG01'
  },
  {
    category: 'anti_ligature',
    name: 'Bunk Bed Safety Welds, Smooth Edges & Barricade Resistance',
    standardCode: 'KPS-SEC-BED'
  }
];

export const INITIAL_INSPECTIONS: CellBlockInspectionRecord[] = [
  {
    id: 'insp-001',
    inspectionCode: 'INSP/2026/09/014',
    facilityId: 'FAC-01',
    facilityName: 'Kamiti National Maximum Security Penitentiary',
    blockId: 'blk-01',
    blockName: 'Block A - High Security Custody (Tier 1 & 2)',
    inspectionType: 'routine_daily',
    inspectionDate: '2026-09-18',
    inspectionTime: '06:30',
    leadInspectorName: 'Senior Inspector David Kiprop',
    leadInspectorRank: 'Senior Inspector',
    leadInspectorBadge: 'KPS-8841',
    accompanyingOfficer: 'Sgt. John Kimani (KPS-9204)',
    status: 'passed',
    complianceScore: 94,
    cellsCheckedCount: 24,
    cellsTotalCount: 24,
    infrastructureChecks: [
      {
        id: 'chk-001-1',
        category: 'locks_doors',
        name: 'Mechanical Cell Deadbolts & Heavy Tumbler Locks',
        standardCode: 'KPS-SEC-LK01',
        status: 'pass',
        notes: 'All 24 deadbolts engaged cleanly during double-lock test.',
        lastChecked: '2026-09-18 06:45'
      },
      {
        id: 'chk-001-2',
        category: 'bars_grilles',
        name: 'Cell Window Manganese Bar Integrity & Acoustic Ring Test',
        standardCode: 'KPS-BAR-01',
        status: 'pass',
        notes: 'High-pitch harmonic resonance confirmed on all window bars; no cut marks or hacksaw abrasions.',
        lastChecked: '2026-09-18 07:10'
      },
      {
        id: 'chk-001-3',
        category: 'surveillance_cctv',
        name: 'PTZ & Fixed Dome CCTV Camera Optics & Zero-Blindspot Sweep',
        standardCode: 'KPS-SURV-01',
        status: 'pass',
        notes: 'Cameras CAM-A01 through CAM-A08 streaming at 1080p 30fps without distortion.',
        lastChecked: '2026-09-18 07:20'
      },
      {
        id: 'chk-001-4',
        category: 'plumbing_sanitary',
        name: 'Mandela Rule 13 Push-Button Sanitary Toilet & Flush Pressure',
        standardCode: 'MANDELA-R13-SAN',
        status: 'flagged',
        notes: 'Cell A-108 push-valve pressure slightly delayed (12s refill cycle). Maintenance ticket issued.',
        lastChecked: '2026-09-18 07:35'
      },
      {
        id: 'chk-001-5',
        category: 'anti_ligature',
        name: 'Anti-Ligature Coat Pegs, Door Knobs & Flush Fixtures',
        standardCode: 'WHO-PRIS-LIG01',
        status: 'pass',
        notes: 'Zero improvised anchor points detected in isolation segregation tier.',
        lastChecked: '2026-09-18 07:50'
      }
    ],
    contrabandFoundSummary: 'None discovered. 2 unauthorized plastic spoons confiscated for destruction.',
    maintenanceOrdersGenerated: ['WO/2026/0091'],
    sanitationViolationsGenerated: [],
    summaryFindings: 'Overall custodial physical security is in exceptional order. Guard locks and sallyport interlocks functioned flawlessly under load testing.',
    correctiveDirectives: 'Replace push-button diaphragm in Cell A-108 within 24 hours.',
    signature: 'D. Kiprop / KPS-8841'
  },
  {
    id: 'insp-002',
    inspectionCode: 'INSP/2026/09/015',
    facilityId: 'FAC-01',
    facilityName: 'Kamiti National Maximum Security Penitentiary',
    blockId: 'blk-02',
    blockName: 'Block B - General Remand Wing',
    inspectionType: 'weekly_comprehensive',
    inspectionDate: '2026-09-17',
    inspectionTime: '09:00',
    leadInspectorName: 'Chief Inspector Evans Mutua',
    leadInspectorRank: 'Chief Inspector',
    leadInspectorBadge: 'KPS-7120',
    accompanyingOfficer: 'Correctional Officer Grace Mumbua',
    status: 'minor_issues',
    complianceScore: 82,
    cellsCheckedCount: 40,
    cellsTotalCount: 40,
    infrastructureChecks: [
      {
        id: 'chk-002-1',
        category: 'locks_doors',
        name: 'Mechanical Cell Deadbolts & Heavy Tumbler Locks',
        standardCode: 'KPS-SEC-LK01',
        status: 'pass',
        notes: 'All perimeter lockboxes aligned.',
        lastChecked: '2026-09-17 09:30'
      },
      {
        id: 'chk-002-2',
        category: 'plumbing_sanitary',
        name: 'Floor Drainage Traps, Anti-Contraband Grates & Sewer Flow',
        standardCode: 'KPS-PLB-03',
        status: 'flagged',
        notes: 'Partial grease-trap blockage in communal wash section causing slow drainage.',
        lastChecked: '2026-09-17 10:15'
      },
      {
        id: 'chk-002-3',
        category: 'ventilation_air',
        name: 'Mandela Rule 14 Natural Air Circulation & Cross-Draft Velocity',
        standardCode: 'MANDELA-R14-VENT',
        status: 'pass',
        notes: 'Cross-draft measured at 0.42 m/s, exceeds minimum statutory standard.',
        lastChecked: '2026-09-17 10:45'
      },
      {
        id: 'chk-002-4',
        category: 'electrical_lighting',
        name: 'Vandal-Proof Tamper-Resistant Ceiling Luminaire (Min 100 Lux)',
        standardCode: 'MANDELA-R14-ELEC',
        status: 'flagged',
        notes: 'Cell B-204 luminaire lens cracked by accidental contact during cleaning.',
        lastChecked: '2026-09-17 11:10'
      }
    ],
    contrabandFoundSummary: 'One unauthorized wire loop wire hanger removed from Cell B-212.',
    maintenanceOrdersGenerated: ['WO/2026/0088', 'WO/2026/0089'],
    sanitationViolationsGenerated: ['SAN/2026/0045'],
    summaryFindings: 'High density remand wing requires proactive plumbing cleanouts. Structural integrity remains robust.',
    correctiveDirectives: 'Desilt main block drain and replace cracked luminaire fixture before night muster.',
    signature: 'E. Mutua / KPS-7120'
  },
  {
    id: 'insp-003',
    inspectionCode: 'INSP/2026/09/016',
    facilityId: 'FAC-02',
    facilityName: "Lang'ata Women's Correctional Centre",
    blockId: 'blk-w01',
    blockName: 'Block W1 - Mother & Child Nursery & Rehabilitation Wing',
    inspectionType: 'mandela_sanitation_audit',
    inspectionDate: '2026-09-16',
    inspectionTime: '14:00',
    leadInspectorName: 'Dr. Beatrice Achieng',
    leadInspectorRank: 'Chief Medical Officer',
    leadInspectorBadge: 'MED-5509',
    accompanyingOfficer: 'Senior Matron Ann Wanjiku',
    status: 'passed',
    complianceScore: 98,
    cellsCheckedCount: 16,
    cellsTotalCount: 16,
    infrastructureChecks: [
      {
        id: 'chk-003-1',
        category: 'plumbing_sanitary',
        name: 'Potable Drinking Water Faucet Ingress & Anti-Tamper Basin',
        standardCode: 'MANDELA-R13-WTR',
        status: 'pass',
        notes: 'Water filtration cartridges active, bacterial swab culture negative.',
        lastChecked: '2026-09-16 14:30'
      },
      {
        id: 'chk-003-2',
        category: 'ventilation_air',
        name: 'Natural Daylight Ingress Windows & Clean Louver Vents',
        standardCode: 'MANDELA-R14-LGT',
        status: 'pass',
        notes: 'Abundant natural light; nursery play area well ventilated.',
        lastChecked: '2026-09-16 15:00'
      },
      {
        id: 'chk-003-3',
        category: 'anti_ligature',
        name: 'Anti-Ligature Coat Pegs, Door Knobs & Flush Fixtures',
        standardCode: 'WHO-PRIS-LIG01',
        status: 'pass',
        notes: 'All fittings compliant with postpartum psychological welfare protocols.',
        lastChecked: '2026-09-16 15:20'
      }
    ],
    contrabandFoundSummary: 'Zero contraband. Sanitary items fully stocked.',
    maintenanceOrdersGenerated: [],
    sanitationViolationsGenerated: [],
    summaryFindings: 'Superb adherence to Bangkok Rules (UN Rules for the Treatment of Women Prisoners) and Mandela hygiene standards. Nursery beds clean and sterile.',
    correctiveDirectives: 'Maintain bi-weekly antiseptic fogging schedule.',
    signature: 'Dr. B. Achieng / MED-5509'
  },
  {
    id: 'insp-004',
    inspectionCode: 'INSP/2026/09/017',
    facilityId: 'FAC-03',
    facilityName: 'Shimo La Tewa Medium Security & Remand',
    blockId: 'blk-c01',
    blockName: 'Coastal Block C - Medium Security Tier',
    inspectionType: 'monthly_structural',
    inspectionDate: '2026-09-15',
    inspectionTime: '10:00',
    leadInspectorName: 'Inspector Ali Hassan Jr.',
    leadInspectorRank: 'Inspector (Civil Eng)',
    leadInspectorBadge: 'KPS-6401',
    accompanyingOfficer: 'Sgt. Peter Otieno',
    status: 'critical_fail',
    complianceScore: 68,
    cellsCheckedCount: 30,
    cellsTotalCount: 30,
    infrastructureChecks: [
      {
        id: 'chk-004-1',
        category: 'bars_grilles',
        name: 'Cell Window Manganese Bar Integrity & Acoustic Ring Test',
        standardCode: 'KPS-BAR-01',
        status: 'critical_fail',
        notes: 'Heavy marine salt air rust pitting observed on window bars in Cells C-110 & C-112. Structural thickness compromised by 18%.',
        lastChecked: '2026-09-15 10:40'
      },
      {
        id: 'chk-004-2',
        category: 'fire_life_safety',
        name: 'Dry Powder & CO2 Fire Extinguisher Gauges & Monthly Seal Tag',
        standardCode: 'NFPA-10-KPS',
        status: 'flagged',
        notes: 'Fire extinguisher EXT-C03 pressure gauge needle in red recharge zone.',
        lastChecked: '2026-09-15 11:15'
      },
      {
        id: 'chk-004-3',
        category: 'plumbing_sanitary',
        name: 'Floor Drainage Traps, Anti-Contraband Grates & Sewer Flow',
        standardCode: 'KPS-PLB-03',
        status: 'flagged',
        notes: 'Salt encrustation around shower drains.',
        lastChecked: '2026-09-15 11:45'
      }
    ],
    contrabandFoundSummary: 'Improvised iron scraper fashioned from salt-decayed pipe bracket.',
    maintenanceOrdersGenerated: ['WO/2026/0074', 'WO/2026/0075'],
    sanitationViolationsGenerated: ['SAN/2026/0039'],
    summaryFindings: 'CRITICAL WARNING: Coastal salt atmosphere has accelerated oxidation on exterior security bars of Tier 1. Immediate welding reinforcement and zinc anti-corrosion barrier paint mandatory.',
    correctiveDirectives: 'Condemn Cells C-110 and C-112 temporarily. Relocate 4 inmates to Block C-East until welded replacement bars are installed and certified.',
    signature: 'A. Hassan / KPS-6401'
  },
  {
    id: 'insp-005',
    inspectionCode: 'INSP/2026/09/018',
    facilityId: 'FAC-04',
    facilityName: "King'ong'o Central Remand & Judicial Holding",
    blockId: 'blk-k01',
    blockName: 'Holding Block 1 - Judicial Transit Cells',
    inspectionType: 'surprise_shakedown',
    inspectionDate: '2026-09-14',
    inspectionTime: '21:30',
    leadInspectorName: 'Capt. Duncan Kariuki',
    leadInspectorRank: 'Superintendent',
    leadInspectorBadge: 'KPS-5002',
    accompanyingOfficer: 'Special Operations Tactical Guard Squad (4 Officers)',
    status: 'minor_issues',
    complianceScore: 88,
    cellsCheckedCount: 20,
    cellsTotalCount: 20,
    infrastructureChecks: [
      {
        id: 'chk-005-1',
        category: 'locks_doors',
        name: 'Mechanical Cell Deadbolts & Heavy Tumbler Locks',
        standardCode: 'KPS-SEC-LK01',
        status: 'pass',
        notes: 'All 20 slam-shut doors verified locked under mechanical tension.',
        lastChecked: '2026-09-14 21:50'
      },
      {
        id: 'chk-005-2',
        category: 'surveillance_cctv',
        name: 'Night Infrared Illumination & Video Frame Latency Check',
        standardCode: 'KPS-SURV-02',
        status: 'pass',
        notes: 'IR illuminators functioning across dark transit corridor.',
        lastChecked: '2026-09-14 22:15'
      },
      {
        id: 'chk-005-3',
        category: 'plumbing_sanitary',
        name: 'Mandela Rule 13 Push-Button Sanitary Toilet & Flush Pressure',
        standardCode: 'MANDELA-R13-SAN',
        status: 'pass',
        notes: 'Sanitary toilets operable.',
        lastChecked: '2026-09-14 22:40'
      }
    ],
    contrabandFoundSummary: '2 unauthorized matches and 1 roll of tobacco found tucked behind wooden bench slat.',
    maintenanceOrdersGenerated: [],
    sanitationViolationsGenerated: [],
    summaryFindings: 'Transit holding cells secure. Inmates scheduled for Nyeri High Court morning convoy searched and certified ready.',
    correctiveDirectives: 'Remove wooden bench slats and replace with welded tamper-proof steel bench.',
    signature: 'D. Kariuki / KPS-5002'
  }
];

export const INITIAL_MAINTENANCE_ORDERS: MaintenanceWorkOrder[] = [
  {
    id: 'wo-01',
    orderNumber: 'WO/2026/0091',
    facilityId: 'FAC-01',
    facilityName: 'Kamiti National Maximum Security Penitentiary',
    blockId: 'blk-01',
    blockName: 'Block A - High Security Custody (Tier 1 & 2)',
    cellRoomId: 'cell-108',
    cellRoomName: 'Cell A-108',
    category: 'sanitary_plumbing',
    priority: 'medium',
    title: 'Cell A-108 Push-Button Flush Valve Pressure Diaphragm Replacement',
    description: 'Push-button flush valve takes over 12 seconds to refill. Install heavy-duty brass commercial flushometer seal kit to prevent water waste and foul odors.',
    reportedBy: 'Senior Inspector David Kiprop',
    assignedTechnician: 'Engineer Peter Ndwiga (Facilities Maintenance)',
    reportedDate: '2026-09-18',
    targetCompletionDate: '2026-09-19',
    status: 'in_progress',
    estimatedCostKes: 4500,
    partsRequired: 'Brass Flush Valve Diaphragm Assembly (Model SL-99), 1/2-inch EPDM gaskets'
  },
  {
    id: 'wo-02',
    orderNumber: 'WO/2026/0088',
    facilityId: 'FAC-01',
    facilityName: 'Kamiti National Maximum Security Penitentiary',
    blockId: 'blk-02',
    blockName: 'Block B - General Remand Wing',
    cellRoomId: 'cell-204',
    cellRoomName: 'Cell B-204',
    category: 'lighting_electrical',
    priority: 'high',
    title: 'Replace Vandal-Proof Polycarbonate Luminaire Lens & LED Driver',
    description: 'Impact fracture on protective ceiling cover. Inmates could access wiring if lens deteriorates further. Install replacement IK10 security diffuser.',
    reportedBy: 'Chief Inspector Evans Mutua',
    assignedTechnician: 'Electrician Stephen Kariuki',
    reportedDate: '2026-09-17',
    targetCompletionDate: '2026-09-18',
    completedDate: '2026-09-18 16:30',
    status: 'completed',
    estimatedCostKes: 8200,
    partsRequired: 'IK10 Polycarbonate Enclosure 600mm, Tamper-Proof Torx Security Screws M6'
  },
  {
    id: 'wo-03',
    orderNumber: 'WO/2026/0089',
    facilityId: 'FAC-01',
    facilityName: 'Kamiti National Maximum Security Penitentiary',
    blockId: 'blk-02',
    blockName: 'Block B - General Remand Wing',
    category: 'sanitary_plumbing',
    priority: 'high',
    title: 'High-Pressure Hydro-Jet Desilting of Communal Wash Drain Trunk',
    description: 'Grease and debris buildup causing slow sewer flow. Mechanical rotary snake and hydro-jetting required from inspection chamber IC-04.',
    reportedBy: 'Chief Inspector Evans Mutua',
    assignedTechnician: 'Nairobi Metro Sanitation Drainage Crew',
    reportedDate: '2026-09-17',
    targetCompletionDate: '2026-09-19',
    status: 'in_progress',
    estimatedCostKes: 15000,
    partsRequired: 'Biological enzyme drain flush, heavy-duty drain rod snake'
  },
  {
    id: 'wo-04',
    orderNumber: 'WO/2026/0074',
    facilityId: 'FAC-03',
    facilityName: 'Shimo La Tewa Medium Security & Remand',
    blockId: 'blk-c01',
    blockName: 'Coastal Block C - Medium Security Tier',
    cellRoomId: 'cell-110',
    cellRoomName: 'Cell C-110 & C-112',
    category: 'bars_grille',
    priority: 'urgent_security_breach',
    title: 'Emergency Manganese Bar Cut-Out & Welded Armor Replacement',
    description: 'Severe salt-spray corrosion weakened 2 exterior window bars. Immediate hot-welding of high-tensile 25mm case-hardened steel bars with zinc primer barrier.',
    reportedBy: 'Inspector Ali Hassan Jr.',
    assignedTechnician: 'Chief Prison Blacksmith & Armor Fabrication Unit',
    reportedDate: '2026-09-15',
    targetCompletionDate: '2026-09-17',
    status: 'in_progress',
    estimatedCostKes: 32000,
    partsRequired: '4x 25mm Case-Hardened Round Steel Bars (1200mm), E7018 Welding Rods, Marine Epoxy Zinc Primer'
  },
  {
    id: 'wo-05',
    orderNumber: 'WO/2026/0075',
    facilityId: 'FAC-03',
    facilityName: 'Shimo La Tewa Medium Security & Remand',
    blockId: 'blk-c01',
    blockName: 'Coastal Block C - Medium Security Tier',
    category: 'structural_masonry',
    priority: 'medium',
    title: 'Recharge & Inspect 6 Dry Chemical Powder Fire Extinguishers',
    description: 'EXT-C01 through EXT-C06 due for hydrostatic pressure certification and ABC powder refill per fire department regulations.',
    reportedBy: 'Inspector Ali Hassan Jr.',
    assignedTechnician: 'Mombasa Coast Safety & Fire Services Ltd',
    reportedDate: '2026-09-15',
    targetCompletionDate: '2026-09-22',
    status: 'pending',
    estimatedCostKes: 18000,
    partsRequired: '6x 9kg ABC Dry Chemical Powder refill kits, nitrogen pressurization cartridges'
  },
  {
    id: 'wo-06',
    orderNumber: 'WO/2026/0062',
    facilityId: 'FAC-05',
    facilityName: 'Naivasha Open Camp & Agri-Rehab Trust',
    blockId: 'blk-d01',
    blockName: 'Dormitory Ward 1 - Agri-Vocational Cohort',
    category: 'ventilation',
    priority: 'low',
    title: 'Service Roof Wind Turbine Whirlybird Ventilators',
    description: 'Inspect bearings and lubricate 4 rooftop passive rotary ventilators to maintain optimal natural airflow during dry season.',
    reportedBy: 'Chief Inspector David Omondi',
    assignedTechnician: 'Prison Carpentry & Mechanical Apprentice Crew',
    reportedDate: '2026-09-12',
    targetCompletionDate: '2026-09-25',
    status: 'pending',
    estimatedCostKes: 3500,
    partsRequired: 'High-temperature lithium grease, 4x replacement rubber dust seals'
  }
];

export const INITIAL_SANITATION_VIOLATIONS: SanitationViolation[] = [
  {
    id: 'san-01',
    caseNumber: 'SAN/2026/0045',
    facilityId: 'FAC-01',
    facilityName: 'Kamiti National Maximum Security Penitentiary',
    blockId: 'blk-02',
    blockName: 'Block B - General Remand Wing',
    locationDetail: 'Block B Ground Floor Ablution & Washbasin Trough',
    violationType: 'blocked_drainage',
    severity: 'major',
    mandelaRuleRef: 'Mandela Rule 13 (Sanitary Installations & Constant Water)',
    description: 'Stagnant wastewater pooling around wash trough due to cracked tile grouting and hair/cloth lint entrapment. Creates slippery hazard and mosquito breeding risk.',
    remedialAction: 'Full chemical sanitization, desilting of drainage trap, and regrouting of floor tiles with anti-microbial epoxy.',
    reportedDate: '2026-09-17',
    remedyDeadline: '2026-09-20',
    inspectedByOfficer: 'Chief Inspector Evans Mutua',
    assignedHealthOfficer: 'Public Health Officer Patrick Nderitu',
    status: 'rectification_underway'
  },
  {
    id: 'san-02',
    caseNumber: 'SAN/2026/0039',
    facilityId: 'FAC-03',
    facilityName: 'Shimo La Tewa Medium Security & Remand',
    blockId: 'blk-c01',
    blockName: 'Coastal Block C - Medium Security Tier',
    locationDetail: 'Showers & Latrine Corridor Tier 1 East',
    violationType: 'black_mold_infestation',
    severity: 'critical_health_hazard',
    mandelaRuleRef: 'Mandela Rule 14 & 15 (Ventilation & Cleanliness)',
    description: 'Extensive black mold (Cladosporium/Aspergillus) colonies on unpainted upper ceiling corners caused by tropical humidity and obstructed louver vents.',
    remedialAction: 'Scrape affected plaster, apply antifungal copper sulphate wash, install high-flow exhaust blower, and recoat with anti-fungal chlorinated rubber paint.',
    reportedDate: '2026-09-15',
    remedyDeadline: '2026-09-18',
    inspectedByOfficer: 'Inspector Ali Hassan Jr.',
    assignedHealthOfficer: 'Environmental Health Officer Amina Rashid',
    status: 'fumigation_scheduled'
  },
  {
    id: 'san-03',
    caseNumber: 'SAN/2026/0032',
    facilityId: 'FAC-04',
    facilityName: "King'ong'o Central Remand & Judicial Holding",
    blockId: 'blk-k01',
    blockName: 'Holding Block 1 - Judicial Transit Cells',
    locationDetail: 'Cell T-03 & T-04 Dormitory Bunk Frames',
    violationType: 'vermin_pest_activity',
    severity: 'major',
    mandelaRuleRef: 'Mandela Rule 17 (Clean Bedding & Pest Free Accommodation)',
    description: 'Bedbug (Cimex lectularius) nymphs detected along wooden mattress support slats in transit cells. Inmates reported bite irritation.',
    remedialAction: 'Heat steam treatment (60°C) of metal frames, chemical pyrethroid fogging, disposal and autoclaving of infested straw mattresses.',
    reportedDate: '2026-09-11',
    remedyDeadline: '2026-09-14',
    inspectedByOfficer: 'Capt. Duncan Kariuki',
    assignedHealthOfficer: 'District Vector Control Unit Officer James Mwangi',
    status: 'reinspected_resolved'
  },
  {
    id: 'san-04',
    caseNumber: 'SAN/2026/0028',
    facilityId: 'FAC-01',
    facilityName: 'Kamiti National Maximum Security Penitentiary',
    blockId: 'blk-01',
    blockName: 'Block A - High Security Custody',
    locationDetail: 'Yard Perimeter Waste Dumpster Sump',
    violationType: 'waste_accumulation',
    severity: 'minor',
    mandelaRuleRef: 'Mandela Rule 15 (Maintenance of Premises Cleanliness)',
    description: 'Secondary refuse containers overfilled following weekend security sweep. Lids left unsealed attracting corvids and stray animals.',
    remedialAction: 'Compacted collection into sealed municipal skip and chlorine solution spray on concrete apron.',
    reportedDate: '2026-09-10',
    remedyDeadline: '2026-09-11',
    inspectedByOfficer: 'Senior Inspector David Kiprop',
    assignedHealthOfficer: 'Sanitation Officer Patrick Nderitu',
    status: 'closed'
  }
];
