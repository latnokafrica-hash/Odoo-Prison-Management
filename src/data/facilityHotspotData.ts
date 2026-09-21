import { FacilityIncident, FacilityMapZone, FacilityHotspotMetrics } from '../types';

export const DEFAULT_FACILITY_ZONES: FacilityMapZone[] = [
  {
    id: 'zone-perim-north',
    facilityId: 'FAC-01',
    code: 'SEC-NW-01',
    name: 'North Perimeter Wall & Watchtower 1',
    type: 'watchtower',
    bounds: { x: 5, y: 5, width: 42, height: 14 },
    securityTier: 'SUPERMAX',
    cctvCoverage: 'PARTIAL',
    activeGuardPost: true,
    guardCount: 4,
    description: 'High perimeter concrete curtain with dual razor wire coils and thermal infrared night sensor beam.'
  },
  {
    id: 'zone-perim-east',
    facilityId: 'FAC-01',
    code: 'SEC-NE-02',
    name: 'East Perimeter Fence & Watchtower 2',
    type: 'perimeter_fence',
    bounds: { x: 75, y: 5, width: 20, height: 42 },
    securityTier: 'SUPERMAX',
    cctvCoverage: 'BLINDSPOT',
    activeGuardPost: true,
    guardCount: 3,
    description: 'Secondary security buffer adjoining forestry terrain. Blindspot identified behind transformer substation.'
  },
  {
    id: 'zone-block-a',
    facilityId: 'FAC-01',
    code: 'BLK-A-MAX',
    name: 'Block A - Supermax & Isolation Wing',
    type: 'cell_block',
    bounds: { x: 12, y: 24, width: 30, height: 28 },
    securityTier: 'SUPERMAX',
    cctvCoverage: 'FULL',
    activeGuardPost: true,
    guardCount: 8,
    description: 'High-profile CAT A convicts, solitary confinement cells, and reinforced steel electronically locked doors.'
  },
  {
    id: 'zone-block-b',
    facilityId: 'FAC-01',
    code: 'BLK-B-REM',
    name: 'Block B - General Remand & Dormitories',
    type: 'cell_block',
    bounds: { x: 12, y: 58, width: 30, height: 28 },
    securityTier: 'HIGH',
    cctvCoverage: 'FULL',
    activeGuardPost: true,
    guardCount: 6,
    description: 'General population holding wing with higher population density, shared bunks, and communal washrooms.'
  },
  {
    id: 'zone-yard',
    facilityId: 'FAC-01',
    code: 'YARD-CTR',
    name: 'Central Exercise Yard & Muster Ground',
    type: 'exercise_yard',
    bounds: { x: 46, y: 24, width: 26, height: 32 },
    securityTier: 'HIGH',
    cctvCoverage: 'FULL',
    activeGuardPost: true,
    guardCount: 5,
    description: 'Open recreation area where daily 1-hour outdoor mandate is exercised. Elevated sniper catwalk overhead.'
  },
  {
    id: 'zone-clinic',
    facilityId: 'FAC-01',
    code: 'MED-CLINIC',
    name: 'Institutional Hospital & Isolation Ward',
    type: 'medical_clinic',
    bounds: { x: 46, y: 60, width: 26, height: 26 },
    securityTier: 'RESTRICTED',
    cctvCoverage: 'FULL',
    activeGuardPost: true,
    guardCount: 3,
    description: 'Triage room, infectious disease quarantine, crash cart station, and dispensary with round-the-clock clinical orderly.'
  },
  {
    id: 'zone-workshop',
    facilityId: 'FAC-01',
    code: 'WRK-IND',
    name: 'Industrial Carpentry & Metalwork Workshop',
    type: 'workshop',
    bounds: { x: 76, y: 52, width: 19, height: 22 },
    securityTier: 'MEDIUM',
    cctvCoverage: 'PARTIAL',
    activeGuardPost: true,
    guardCount: 3,
    description: 'Trade apprenticeship workshop with heavy tooling, welding rigs, and timber stocks requiring strict tool tally control.'
  },
  {
    id: 'zone-mess',
    facilityId: 'FAC-01',
    code: 'KIT-MESS',
    name: 'Central Mess Hall & Kitchen Scullery',
    type: 'mess_kitchen',
    bounds: { x: 76, y: 76, width: 19, height: 18 },
    securityTier: 'MEDIUM',
    cctvCoverage: 'FULL',
    activeGuardPost: true,
    guardCount: 3,
    description: 'Food preparation, steam kettles, dry rations storage, and cutlery distribution area.'
  },
  {
    id: 'zone-sallyport',
    facilityId: 'FAC-01',
    code: 'SALLY-MAIN',
    name: 'Vehicular Sallyport & Electronic Trap',
    type: 'sallyport',
    bounds: { x: 45, y: 88, width: 28, height: 10 },
    securityTier: 'SUPERMAX',
    cctvCoverage: 'FULL',
    activeGuardPost: true,
    guardCount: 5,
    description: 'Double hydraulic gate system for escort convoys, prisoner transit vans, and delivery vehicles with undercarriage mirrors.'
  },
  {
    id: 'zone-admin-gate',
    facilityId: 'FAC-01',
    code: 'ADM-GATE',
    name: 'Superintendent HQ & Visitor Reception',
    type: 'admin_gate',
    bounds: { x: 5, y: 88, width: 36, height: 10 },
    securityTier: 'RESTRICTED',
    cctvCoverage: 'FULL',
    activeGuardPost: true,
    guardCount: 4,
    description: 'Biometric visitor intake, security metal detector archways, administrative registry, and superintendent briefing suite.'
  }
];

export const INITIAL_FACILITY_INCIDENTS: FacilityIncident[] = [
  // Kamiti Maximum Security (FAC-01) - Historical Incidents
  {
    id: 'inc-kms-001',
    facilityId: 'FAC-01',
    facilityName: 'Kamiti National Maximum Security Penitentiary',
    title: 'North Watchtower Perimeter Wall Scaling Attempt',
    category: 'escape_attempt',
    severity: 'CRITICAL',
    incidentDate: '2026-06-14',
    incidentTime: '02:40',
    locationZoneId: 'zone-perim-north',
    locationZoneName: 'North Perimeter Wall & Watchtower 1',
    coordinates: { x: 22, y: 9 },
    inmateId: 'inm-103',
    inmateName: 'Stephen Wanyonyi',
    bookingNumber: 'INM-2022-0198',
    description: 'Two inmates breached the inner security fence using an improvised wire hook ladder during a localized perimeter spotlight power surge.',
    methodOrCause: 'Fabricated bedsheet rope with metal rebar grappling hook; timed during generator switchover.',
    status: 'foiled',
    actionTaken: 'Thermal motion beam triggered automated alarm. Perimeter guard fired warning shot; inmates intercepted before crossing outer sterile zone.',
    superintendentDirective: 'Installed auxiliary battery-buffered LED floodlights and commissioned dual-dog perimeter K9 patrol along North sector.',
    casualtiesOrInjuries: 'Minor abrasions from concertina razor wire.',
    densityWeight: 5,
    reportedByOfficer: 'Sgt. Philip Koech (Sentry Post 1)'
  },
  {
    id: 'inc-kms-002',
    facilityId: 'FAC-01',
    facilityName: 'Kamiti National Maximum Security Penitentiary',
    title: 'Ventilation Shaft Sawing & Tool Breach in Workshop',
    category: 'escape_attempt',
    severity: 'HIGH',
    incidentDate: '2025-11-20',
    incidentTime: '17:15',
    locationZoneId: 'zone-workshop',
    locationZoneName: 'Industrial Carpentry & Metalwork Workshop',
    coordinates: { x: 84, y: 62 },
    inmateId: 'inm-108',
    inmateName: 'David Mwangi Kariuki',
    bookingNumber: 'INM-2023-0412',
    description: 'Inmate concealed a broken hacksaw blade inside the hollow leg of a wooden carpentry bench and made repeated cuts into the exhaust air duct.',
    methodOrCause: 'Concealed metal hacksaw blade smuggled from welding stock; 75% severed vertical grill bars discovered during weekly magnet shakedown.',
    status: 'foiled',
    actionTaken: 'Duct immediately welded shut with solid 12mm manganese steel plate. Tool inventory registry updated with biometric checkout.',
    superintendentDirective: 'Mandated daily magnet sweep and confiscated non-registered abrasive materials in all vocational shops.',
    densityWeight: 4,
    reportedByOfficer: 'Inspector Geoffrey Kiprotich'
  },
  {
    id: 'inc-kms-003',
    facilityId: 'FAC-01',
    facilityName: 'Kamiti National Maximum Security Penitentiary',
    title: 'Transit Delivery Lorry Undercarriage Concealment',
    category: 'escape_attempt',
    severity: 'CRITICAL',
    incidentDate: '2026-03-08',
    incidentTime: '11:20',
    locationZoneId: 'zone-sallyport',
    locationZoneName: 'Vehicular Sallyport & Electronic Trap',
    coordinates: { x: 58, y: 92 },
    inmateId: 'inm-107',
    inmateName: "Jackson Ndung'u",
    bookingNumber: 'INM-2026-0012',
    description: 'Inmate assigned to vegetable unloading slipped between the transmission axle and chassis frame of an outgoing commercial produce truck.',
    methodOrCause: 'Strapped torso to exhaust manifold heat shield using nylon sacking ties.',
    status: 'foiled',
    actionTaken: 'Sallyport mirror check and underbody infrared scanner detected human heat signature prior to opening outer gate.',
    superintendentDirective: 'Banned all convict direct loading at main sallyport; restricted loading details to minimum-security trusted trusties.',
    densityWeight: 5,
    reportedByOfficer: 'Chief Guard Peter Wambua'
  },
  {
    id: 'inc-kms-004',
    facilityId: 'FAC-01',
    facilityName: 'Kamiti National Maximum Security Penitentiary',
    title: 'Acute Myocardial Infarction & Ventricular Fibrillation',
    category: 'medical_alert',
    severity: 'CRITICAL',
    incidentDate: '2026-08-04',
    incidentTime: '03:15',
    locationZoneId: 'zone-block-a',
    locationZoneName: 'Block A - Supermax & Isolation Wing',
    coordinates: { x: 26, y: 38 },
    inmateId: 'inm-101',
    inmateName: 'Marcus Kiprono',
    bookingNumber: 'INM-2024-0089',
    description: 'Inmate collapsed in cell A-12 with acute retrosternal chest pain and loss of consciousness during pre-dawn headcount check.',
    methodOrCause: 'Acute cardiac arrest secondary to severe ischemic coronary thrombosis.',
    status: 'hospitalized',
    actionTaken: 'Duty orderly applied automated external defibrillator (AED) delivering 1 shock with return of spontaneous circulation. Code Red ambulance transfer to Kenyatta National Hospital.',
    superintendentDirective: 'Installed dedicated AED units inside Block A and B guard stations; mandated weekly ECG screenings for inmates over 45.',
    casualtiesOrInjuries: 'Stabilized in Intensive Care Unit; returned to medical convalescent wing.',
    densityWeight: 5,
    reportedByOfficer: 'Dr. Naomi Otieno (Medical Officer)'
  },
  {
    id: 'inc-kms-005',
    facilityId: 'FAC-01',
    facilityName: 'Kamiti National Maximum Security Penitentiary',
    title: 'Status Epilepticus with Respiratory Hypoxia',
    category: 'medical_alert',
    severity: 'HIGH',
    incidentDate: '2026-05-19',
    incidentTime: '21:40',
    locationZoneId: 'zone-block-b',
    locationZoneName: 'Block B - General Remand & Dormitories',
    coordinates: { x: 22, y: 72 },
    inmateId: 'inm-102',
    inmateName: 'Emanuel Kipchumba',
    bookingNumber: 'INM-2023-0144',
    description: 'Continuous generalized tonic-clonic seizure exceeding 12 minutes with airway obstruction and cyanosis in dormitory 4.',
    methodOrCause: 'Abrupt anticonvulsant medication default combined with severe crowding dehydration.',
    status: 'resolved',
    actionTaken: 'Administered 10mg IV diazepam followed by high-flow oxygen. Resuscitated in prison clinic trauma bay.',
    superintendentDirective: 'Directly Observed Therapy (DOT) mandated for all psychiatric and neurological prescriptions at cell doors.',
    densityWeight: 4,
    reportedByOfficer: 'Nurse Sgt. Mary Mumo'
  },
  {
    id: 'inc-kms-006',
    facilityId: 'FAC-01',
    facilityName: 'Kamiti National Maximum Security Penitentiary',
    title: 'Severe Anaphylactic Shock from Ingestion',
    category: 'medical_alert',
    severity: 'CRITICAL',
    incidentDate: '2026-07-22',
    incidentTime: '13:05',
    locationZoneId: 'zone-mess',
    locationZoneName: 'Central Mess Hall & Kitchen Scullery',
    coordinates: { x: 86, y: 84 },
    inmateId: 'inm-104',
    inmateName: 'Samuel Ochieng',
    bookingNumber: 'INM-2024-0311',
    description: 'Acute airway laryngeal edema and systemic urticaria following accidental cross-contamination of peanut allergen in bean stew.',
    methodOrCause: 'Known severe legume allergy triggered by shared cooking ladle in scullery.',
    status: 'resolved',
    actionTaken: 'Intramuscular epinephrine (EpiPen 0.3mg) administered within 4 minutes. Inmate stabilized under oxygen tent.',
    superintendentDirective: 'Implemented color-coded dietary wristbands and isolated cookware station for marked medical diet inmates.',
    densityWeight: 4,
    reportedByOfficer: 'Dr. Naomi Otieno'
  },
  {
    id: 'inc-kms-007',
    facilityId: 'FAC-01',
    facilityName: 'Kamiti National Maximum Security Penitentiary',
    title: 'Mass Heat Exhaustion & Dehydration Collapse',
    category: 'medical_alert',
    severity: 'MODERATE',
    incidentDate: '2026-02-18',
    incidentTime: '14:30',
    locationZoneId: 'zone-yard',
    locationZoneName: 'Central Exercise Yard & Muster Ground',
    coordinates: { x: 58, y: 40 },
    inmateId: 'inm-105',
    inmateName: 'Patrick Muthomi',
    bookingNumber: 'INM-2025-0902',
    description: 'Three inmates collapsed simultaneously during prolonged afternoon sunshine roll call in 34°C ambient heat.',
    methodOrCause: 'Acute solar hyperthermia and lack of shaded staging during facility-wide muster count.',
    status: 'resolved',
    actionTaken: 'Hydration rehydration salts administered; inmates moved to shaded dispensary porch.',
    superintendentDirective: 'Constructed shade canopies over exercise yard corners and capped outdoor midday assemblies to 45 minutes.',
    densityWeight: 3,
    reportedByOfficer: 'Officer Daniel Mutua'
  },
  {
    id: 'inc-kms-008',
    facilityId: 'FAC-01',
    facilityName: 'Kamiti National Maximum Security Penitentiary',
    title: 'Improvised Metal Shiv Altercation & Laceration',
    category: 'violence_contraband',
    severity: 'HIGH',
    incidentDate: '2026-04-11',
    incidentTime: '16:50',
    locationZoneId: 'zone-yard',
    locationZoneName: 'Central Exercise Yard & Muster Ground',
    coordinates: { x: 62, y: 32 },
    inmateId: 'inm-101',
    inmateName: 'Marcus Kiprono',
    bookingNumber: 'INM-2024-0089',
    description: 'Gang-related territorial dispute erupted near the basketball backboard resulting in an improvised 15cm sharpened iron rod weapon.',
    methodOrCause: 'Contraband iron rod ground against masonry steps.',
    status: 'resolved',
    actionTaken: 'Tactical sentries deployed pepper vapor; both combatants restrained within 90 seconds. 12 stitches administered.',
    superintendentDirective: '30-day solitary disciplinary segregation, remission forfeited, and compound metal sweep executed.',
    densityWeight: 4,
    reportedByOfficer: 'Capt. Marcus Vance'
  },
  {
    id: 'inc-kms-009',
    facilityId: 'FAC-01',
    facilityName: 'Kamiti National Maximum Security Penitentiary',
    title: 'Contraband Drone Delivery Interception on East Perimeter',
    category: 'structural_breach',
    severity: 'HIGH',
    incidentDate: '2026-01-29',
    incidentTime: '01:15',
    locationZoneId: 'zone-perim-east',
    locationZoneName: 'East Perimeter Fence & Watchtower 2',
    coordinates: { x: 88, y: 22 },
    description: 'Quad-copter drone flew over eastern pine plantation and dropped a taped payload containing 4 smartphones, 6 SIM cards, and 120g cannabis.',
    methodOrCause: 'GPS-guided drone payload drop hooked onto exterior transformer fence line.',
    status: 'resolved',
    actionTaken: 'Payload intercepted by canine patrol before collection. Radio jamming sweep initiated across perimeter boundary.',
    superintendentDirective: 'Procured directional RF drone jammer on Watchtower 2 and installed overhead wire mesh over open courtyards.',
    densityWeight: 4,
    reportedByOfficer: 'Sgt. Collins Barasa'
  },
  {
    id: 'inc-kms-010',
    facilityId: 'FAC-01',
    facilityName: 'Kamiti National Maximum Security Penitentiary',
    title: 'Acute Psychiatric Self-Harm Crisis & Ligature Alert',
    category: 'medical_alert',
    severity: 'CRITICAL',
    incidentDate: '2026-09-02',
    incidentTime: '00:45',
    locationZoneId: 'zone-block-a',
    locationZoneName: 'Block A - Supermax & Isolation Wing',
    coordinates: { x: 18, y: 30 },
    inmateId: 'inm-106',
    inmateName: 'Tariq Al-Mansoor',
    bookingNumber: 'INM-2023-0014',
    description: 'Duty watchman heard erratic vocal distress and observed inmate attempting ligature suspension from window bar mesh.',
    methodOrCause: 'Torn blanket strips tied to window transom vent.',
    status: 'resolved',
    actionTaken: 'Cell entered under emergency two-officer protocol. Ligature severed; inmate placed on anti-suicide suicide watch smock.',
    superintendentDirective: 'Fitted flush anti-ligature window cowlings across all Block A segregation cells; continuous 15-minute log required.',
    densityWeight: 5,
    reportedByOfficer: 'Officer Bernard Kiptoo'
  },
  {
    id: 'inc-kms-011',
    facilityId: 'FAC-01',
    facilityName: 'Kamiti National Maximum Security Penitentiary',
    title: 'Suspected Multi-Drug Resistant TB Hemoptysis Outbreak',
    category: 'medical_alert',
    severity: 'CRITICAL',
    incidentDate: '2026-08-15',
    incidentTime: '10:00',
    locationZoneId: 'zone-clinic',
    locationZoneName: 'Institutional Hospital & Isolation Ward',
    coordinates: { x: 55, y: 72 },
    inmateId: 'inm-109',
    inmateName: 'Hassan Juma',
    bookingNumber: 'INM-2025-0188',
    description: 'Inmate presented with massive cough of blood (hemoptysis >300ml) in the clinic waiting queue; immediate negative-pressure isolation activated.',
    methodOrCause: 'Reactivated pulmonary tuberculosis with cavitary lesion.',
    status: 'hospitalized',
    actionTaken: 'Negative pressure room sealed; GeneXpert sputum confirmed positive. Cohort contact tracing initiated across Block B Tier 1.',
    superintendentDirective: 'Facility-wide chest X-ray mobile van screening ordered for 450 inmates in Block B; UV germicidal lamps installed.',
    densityWeight: 5,
    reportedByOfficer: 'Dr. Naomi Otieno'
  },

  // Shimo La Tewa Medium Security & Remand (FAC-03)
  {
    id: 'inc-slt-001',
    facilityId: 'FAC-03',
    facilityName: 'Shimo La Tewa Medium Security & Remand',
    title: 'Perimeter Wall Sector 4 External Breach',
    category: 'escape_attempt',
    severity: 'CRITICAL',
    incidentDate: '2023-10-18',
    incidentTime: '03:10',
    locationZoneId: 'zone-perim-north',
    locationZoneName: 'North Perimeter Wall & Watchtower 1',
    coordinates: { x: 28, y: 12 },
    inmateId: 'inm-103',
    inmateName: 'Stephen Wanyonyi',
    bookingNumber: 'INM-2022-0198',
    description: 'Scaled inner perimeter fence using fabricated rope ladder during electrical blackout caused by coastal thunderstorm.',
    methodOrCause: 'Fabricated nylon rope ladder with bamboo rungs; scaled wall while sentry shelter roof was leaking.',
    status: 'recaptured',
    actionTaken: 'Multi-agency roadblock set up across Mtwapa bridge; fugitive recaptured 14 hours later attempting to board dhow at Kilifi creek.',
    superintendentDirective: 'All perimeter security lights wired to uninterruptible solar battery backup; raised wall height by 1.2m with razor wire.',
    densityWeight: 5,
    reportedByOfficer: 'Asst. Comm. Ali Hassan'
  },
  {
    id: 'inc-slt-002',
    facilityId: 'FAC-03',
    facilityName: 'Shimo La Tewa Medium Security & Remand',
    title: 'Acute Malaria Coma with Cerebral Impairment',
    category: 'medical_alert',
    severity: 'CRITICAL',
    incidentDate: '2026-05-10',
    incidentTime: '06:30',
    locationZoneId: 'zone-clinic',
    locationZoneName: 'Institutional Hospital & Isolation Ward',
    coordinates: { x: 60, y: 68 },
    inmateId: 'inm-301',
    inmateName: 'Rashid Bakari',
    bookingNumber: 'INM-2024-0812',
    description: 'Inmate found non-responsive on cot with GCS 7/15 and high fever of 40.5°C; thick blood smear confirmed Plasmodium falciparum 4+.',
    methodOrCause: 'Severe cerebral malaria infection.',
    status: 'resolved',
    actionTaken: 'Intravenous Artesunate loading dose delivered followed by intensive fluid management. Fully regained consciousness after 36 hours.',
    superintendentDirective: 'Indoor residual spraying of all dormitories and issued long-lasting insecticide treated bednets to all cells.',
    densityWeight: 4,
    reportedByOfficer: 'Clinical Officer Salim Mwakio'
  },

  // Lang'ata Women's Correctional Centre (FAC-02)
  {
    id: 'inc-lwc-001',
    facilityId: 'FAC-02',
    facilityName: "Lang'ata Women's Correctional Centre",
    title: 'Visitor Reception Disguise Breach Attempt',
    category: 'escape_attempt',
    severity: 'HIGH',
    incidentDate: '2025-12-04',
    incidentTime: '15:10',
    locationZoneId: 'zone-admin-gate',
    locationZoneName: 'Superintendent HQ & Visitor Reception',
    coordinates: { x: 25, y: 90 },
    inmateId: 'inm-201',
    inmateName: 'Beatrice Wangari',
    bookingNumber: 'INM-2024-0551',
    description: 'Inmate attempted to walk out through the main visitor exit gate wearing civilian headscarf and clothing smuggled in during family visit.',
    methodOrCause: 'Exchanged clothing in visitor cubicle restroom; forged paper visitor gate pass.',
    status: 'foiled',
    actionTaken: 'Biometric UV hand stamp verification at gatehouse failed match; inmate detained and returned to custody.',
    superintendentDirective: 'Implemented digital UV invisible ink hand stamping for all incoming visitors and full body scanner prior to exit.',
    densityWeight: 4,
    reportedByOfficer: 'Inspector Catherine Njeri'
  },
  {
    id: 'inc-lwc-002',
    facilityId: 'FAC-02',
    facilityName: "Lang'ata Women's Correctional Centre",
    title: 'Eclampsia Obstetric Emergency in Maternal Wing',
    category: 'medical_alert',
    severity: 'CRITICAL',
    incidentDate: '2026-06-28',
    incidentTime: '01:50',
    locationZoneId: 'zone-clinic',
    locationZoneName: 'Institutional Hospital & Isolation Ward',
    coordinates: { x: 52, y: 70 },
    inmateId: 'inm-204',
    inmateName: 'Zainab Hussein',
    bookingNumber: 'INM-2025-0723',
    description: 'Pregnant inmate (34 weeks) presented with severe pre-eclamptic seizures, systolic blood pressure 195/120 mmHg, and fetal bradycardia.',
    methodOrCause: 'Acute severe eclampsia.',
    status: 'hospitalized',
    actionTaken: 'Intravenous magnesium sulfate protocol initiated immediately; blue-light emergency escort to Pumwani Maternity Hospital for emergency C-section.',
    superintendentDirective: 'Both mother and infant survived in stable condition. Dedicated antenatal clinic established with weekly OB/GYN visiting doctor.',
    densityWeight: 5,
    reportedByOfficer: 'Senior Nurse Joy Mutua'
  },

  // King'ong'o Central Remand (FAC-04)
  {
    id: 'inc-kng-001',
    facilityId: 'FAC-04',
    facilityName: "King'ong'o Central Remand & Judicial Holding",
    title: 'Court Transit Sallyport Window Grate Breach',
    category: 'escape_attempt',
    severity: 'HIGH',
    incidentDate: '2026-03-24',
    incidentTime: '08:15',
    locationZoneId: 'zone-sallyport',
    locationZoneName: 'Vehicular Sallyport & Electronic Trap',
    coordinates: { x: 65, y: 90 },
    inmateId: 'inm-401',
    inmateName: 'Kariuki Ndegwa',
    bookingNumber: 'INM-2026-0119',
    description: 'Remand prisoner severed loose mesh on transport bus window while parked in sallyport queue awaiting judicial escort.',
    methodOrCause: 'Twisted rusted window grille with pipe wrench stolen during plumbing maintenance.',
    status: 'foiled',
    actionTaken: 'Escort commander spotted movement in bus side mirror; containment perimeter sealed inside sallyport airlock.',
    superintendentDirective: 'Fleet retrofit of all prison transit cages with 8mm polycarbonate shatterproof screens and dual crossbar locks.',
    densityWeight: 4,
    reportedByOfficer: 'Supt. Duncan Kariuki'
  },
  {
    id: 'inc-kng-002',
    facilityId: 'FAC-04',
    facilityName: "King'ong'o Central Remand & Judicial Holding",
    title: 'Acute Alcohol Withdrawal Delirium Tremens',
    category: 'medical_alert',
    severity: 'HIGH',
    incidentDate: '2026-07-09',
    incidentTime: '22:15',
    locationZoneId: 'zone-block-b',
    locationZoneName: 'Block B - General Remand & Dormitories',
    coordinates: { x: 28, y: 65 },
    inmateId: 'inm-405',
    inmateName: 'Dennis Mathenge',
    bookingNumber: 'INM-2026-0304',
    description: 'New remand committal developed severe visual hallucinations, tremors, severe tachycardia (145 bpm), and autonomic instability 48h post-arrest.',
    methodOrCause: 'Acute alcohol withdrawal syndrome / Delirium Tremens.',
    status: 'resolved',
    actionTaken: 'High-dose benzodiazepine sedation protocol administered under medical supervision; transferred to observation cell.',
    superintendentDirective: 'Intake medical screening revised to mandate CIWA alcohol withdrawal protocol for all remand admissions.',
    densityWeight: 4,
    reportedByOfficer: 'Clinical Officer Peter Maina'
  },

  // Naivasha Open Camp (FAC-05)
  {
    id: 'inc-nvs-001',
    facilityId: 'FAC-05',
    facilityName: 'Naivasha Open Camp & Agri-Rehab Trust',
    title: 'Agricultural Farm Plot Walkaway Attempt',
    category: 'escape_attempt',
    severity: 'MODERATE',
    incidentDate: '2025-08-14',
    incidentTime: '16:00',
    locationZoneId: 'zone-workshop',
    locationZoneName: 'Industrial Carpentry & Metalwork Workshop',
    coordinates: { x: 80, y: 60 },
    inmateId: 'inm-501',
    inmateName: 'Johnston Odhiambo',
    bookingNumber: 'INM-2023-0091',
    description: 'Minimum-security trusty walked beyond the designated greenhouse perimeter boundary into surrounding acacia bushland.',
    methodOrCause: 'Left farming crew during afternoon harvest rotation.',
    status: 'recaptured',
    actionTaken: 'Mounted equestrian patrol dispatched; inmate located within 45 minutes resting near lakeshore road. Reclassified to closed custody.',
    superintendentDirective: 'Instituted GPS solar ankle trackers for all inmates on unsupervised farm perimeter details.',
    densityWeight: 3,
    reportedByOfficer: 'Chief Inspector David Omondi'
  },
  {
    id: 'inc-nvs-002',
    facilityId: 'FAC-05',
    facilityName: 'Naivasha Open Camp & Agri-Rehab Trust',
    title: 'Venomous Snakebite during Horticultural Labor',
    category: 'medical_alert',
    severity: 'CRITICAL',
    incidentDate: '2026-01-12',
    incidentTime: '11:45',
    locationZoneId: 'zone-yard',
    locationZoneName: 'Central Exercise Yard & Muster Ground',
    coordinates: { x: 50, y: 35 },
    inmateId: 'inm-503',
    inmateName: 'Simon Kiprotich',
    bookingNumber: 'INM-2024-0419',
    description: 'Bitten on right ankle by puff adder (Bitis arietans) while clearing dry brush along irrigation canal.',
    methodOrCause: 'Envenomation with rapid swelling and hematological tissue necrosis.',
    status: 'resolved',
    actionTaken: 'Pressure immobilization applied; polyvalent antivenom (SAIMR) administered intravenously within 35 minutes at Naivasha Sub-County Hospital.',
    superintendentDirective: 'Issued heavy protective puncture-resistant gaiters and leather safety boots for all agricultural labor gangs.',
    densityWeight: 5,
    reportedByOfficer: 'Officer Moses Koech'
  }
];

export function getFacilityZones(facilityId: string): FacilityMapZone[] {
  // Returns zones adapted to the facility
  return DEFAULT_FACILITY_ZONES.map(z => ({
    ...z,
    facilityId
  }));
}

export function getFacilityIncidents(facilityId: string): FacilityIncident[] {
  return INITIAL_FACILITY_INCIDENTS.filter(inc => inc.facilityId === facilityId);
}

export function calculateZoneRiskMetrics(
  zones: FacilityMapZone[],
  incidents: FacilityIncident[]
): (FacilityMapZone & {
  incidentCount: number;
  escapeCount: number;
  medicalCount: number;
  violenceCount: number;
  calculatedRiskScore: number;
  recentIncident?: FacilityIncident;
})[] {
  return zones.map(zone => {
    // Find incidents in this zone
    const zoneIncidents = incidents.filter(inc => {
      // Check zone id match or spatial bounds containment
      if (inc.locationZoneId === zone.id) return true;
      const { x, y, width, height } = zone.bounds;
      return (
        inc.coordinates.x >= x &&
        inc.coordinates.x <= x + width &&
        inc.coordinates.y >= y &&
        inc.coordinates.y <= y + height
      );
    });

    const escapeCount = zoneIncidents.filter(i => i.category === 'escape_attempt').length;
    const medicalCount = zoneIncidents.filter(i => i.category === 'medical_alert').length;
    const violenceCount = zoneIncidents.filter(i => i.category === 'violence_contraband' || i.category === 'structural_breach').length;

    // Weight score: escapes = 25 pts, critical medical = 18 pts, regular medical = 12 pts, violence = 15 pts, blindspot penalty = 10 pts
    let riskPoints = 0;
    zoneIncidents.forEach(inc => {
      if (inc.category === 'escape_attempt') riskPoints += 25;
      else if (inc.category === 'medical_alert') riskPoints += inc.severity === 'CRITICAL' ? 20 : 12;
      else riskPoints += 15;
    });

    if (zone.cctvCoverage === 'BLINDSPOT') riskPoints += 10;
    if (zone.securityTier === 'SUPERMAX') riskPoints += 5;

    const calculatedRiskScore = Math.min(Math.round(riskPoints), 100);

    // Sort to find most recent
    const sorted = [...zoneIncidents].sort(
      (a, b) => new Date(b.incidentDate).getTime() - new Date(a.incidentDate).getTime()
    );

    return {
      ...zone,
      incidentCount: zoneIncidents.length,
      escapeCount,
      medicalCount,
      violenceCount,
      calculatedRiskScore,
      recentIncident: sorted[0]
    };
  });
}

export function getFacilityHotspotSummary(
  facilityId: string,
  incidents: FacilityIncident[]
): FacilityHotspotMetrics {
  const facilityIncidents = incidents.filter(i => i.facilityId === facilityId);
  const escapeAttempts = facilityIncidents.filter(i => i.category === 'escape_attempt').length;
  const medicalAlerts = facilityIncidents.filter(i => i.category === 'medical_alert').length;
  const violenceContraband = facilityIncidents.filter(i => i.category === 'violence_contraband' || i.category === 'structural_breach').length;
  const criticalThreats = facilityIncidents.filter(i => i.severity === 'CRITICAL' && (i.status === 'active_investigation' || i.status === 'foiled')).length;

  // Calculate highest risk zone
  const zones = calculateZoneRiskMetrics(DEFAULT_FACILITY_ZONES, facilityIncidents);
  const sortedZones = [...zones].sort((a, b) => b.calculatedRiskScore - a.calculatedRiskScore);
  const highest = sortedZones[0];

  // Overall facility risk score based on incidents and severity
  let baseScore = (escapeAttempts * 20) + (medicalAlerts * 12) + (violenceContraband * 10);
  const overallFacilityRiskScore = Math.min(Math.round(baseScore / 2), 98);

  return {
    totalIncidents: facilityIncidents.length,
    escapeAttempts,
    medicalAlerts,
    violenceContraband,
    highestRiskZoneName: highest ? `${highest.name} (${highest.calculatedRiskScore}/100)` : 'None Flagged',
    overallFacilityRiskScore: Math.max(overallFacilityRiskScore, 35),
    criticalActiveThreats: criticalThreats
  };
}
