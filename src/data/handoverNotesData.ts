import { ShiftHandoverNote } from '../types';

export const INITIAL_HANDOVER_NOTES: ShiftHandoverNote[] = [
  {
    id: 'note-01',
    category: 'inmate_watch',
    title: 'High Escape-Risk CAT-A Close Surveillance Protocol',
    content: 'Inmate Al-Hassan is subject to ministerial High-Security Order #SO-2026/84. Strict segregation from general population must be enforced. Any cell opening requires minimum 3 armed officers with body-worn cameras activated.',
    urgency: 'critical',
    location: 'Block A - High Security Wing, Cell A-04',
    authorCommander: 'Capt. Marcus Vance',
    authorBadge: 'KP-8421',
    timestamp: '12:45',
    inmateWatchDetails: {
      inmateId: 'KP-8821',
      inmateName: 'Rashid Al-Hassan',
      cellLocation: 'Block A - Tier 1, Cell A-04',
      watchLevel: 'segregation_high_risk',
      watchIntervalMinutes: 30,
      keepSeparatedFrom: ['KP-7940 (David Kimani - State Witness)', 'KP-8115 (Ali Nur - Rival Faction)'],
      specialInstructions: 'Mandatory dual-officer visual verification through wicket hatch every 30 minutes. Cell illuminator must remain set to night-dimmer. Under no circumstances may inmate be permitted in corridor during yard movements.',
      assignedWatchPost: 'Block A Control Guard Station 1'
    },
    isAcknowledgedByIncoming: true,
    acknowledgedAt: '13:50',
    acknowledgedBy: 'Capt. Jonathan Hayes (KP-7890)'
  },
  {
    id: 'note-02',
    category: 'inmate_watch',
    title: 'Mandatory 15-Minute Suicide & Self-Harm Observation Sheet',
    content: 'Under court psychiatric committal review following verbal self-harm warnings in legal room. Tear-resistant safety gown and paper bedding issued. Medical orderly assigned to maintain doorway clipboard.',
    urgency: 'urgent',
    location: 'Infirmary Psychiatric Observation Cell 2',
    authorCommander: 'Capt. Marcus Vance',
    authorBadge: 'KP-8421',
    timestamp: '13:10',
    inmateWatchDetails: {
      inmateId: 'KP-9024',
      inmateName: 'Brian Mutua',
      cellLocation: 'Infirmary Wing - Observation Cell 2',
      watchLevel: 'suicide_watch_15m',
      watchIntervalMinutes: 15,
      specialInstructions: 'Physical eyes-on inspection every 15 minutes. Check for breathing and limb position. No personal pens, strings, or utensils allowed in cell. Contact Dr. Clara Kamau if behavioral distress elevates.',
      assignedWatchPost: 'Infirmary Central Nursing Station'
    },
    isAcknowledgedByIncoming: true,
    acknowledgedAt: '13:52',
    acknowledgedBy: 'Capt. Jonathan Hayes (KP-7890)'
  },
  {
    id: 'note-03',
    category: 'maintenance',
    title: 'Cell B-12 Slam-Lock Solenoid Defect & Emergency Abloy Padlock',
    content: 'Central Control sensor intermittently reports door ajar due to a loose microswitch sensor in the jamb strike. Heavy-duty secondary Abloy padlock #PAD-4402 has been secured over the manual hasp. Locksmith technician contracted to arrive at 15:30.',
    urgency: 'urgent',
    location: 'Block B - General Population, Cell B-12',
    authorCommander: 'Capt. Marcus Vance',
    authorBadge: 'KP-8421',
    timestamp: '11:20',
    maintenanceDetails: {
      equipmentOrAsset: 'Electro-Mechanical Slam-Lock Jamb Sensor & Strike',
      workOrderRef: 'WO-2026-0892',
      trade: 'locks_doors',
      contractorAccessRequired: true,
      contractorName: 'SecureLock Systems Ltd (Tech: Robert Mwenda)',
      estimatedResolution: 'Today, 16:30'
    },
    isAcknowledgedByIncoming: false
  },
  {
    id: 'note-04',
    category: 'unusual_behavior',
    title: 'Sectarian Grouping & Murmuring During Yard 2 Recall',
    content: 'During midday yard exercise recall, inmate Ahmed "Kassim" Rashid was seen repeatedly convening with 4 junior inmates near the blind corner of the sports shed. Tense posture observed; dispersed immediately upon canine team approach.',
    urgency: 'elevated',
    location: 'Main Exercise Yard 2 - South Bleachers',
    authorCommander: 'Capt. Marcus Vance',
    authorBadge: 'KP-8421',
    timestamp: '13:25',
    behaviorDetails: {
      inmateId: 'KP-8492',
      inmateName: 'Ahmed "Kassim" Rashid',
      behaviorType: 'agitating_tensions',
      witnessingOfficers: ['Sgt. Jane Wanjiru (K9 Handler)', 'Cpl. Peter Mwangi (Yard Sentries)'],
      recommendedResponse: 'Prevent congregation exceeding 3 inmates along the south wall during afternoon recreation. Stagger evening dinner release times between Block A Tier 2 and Block B Tier 1.'
    },
    isAcknowledgedByIncoming: false
  },
  {
    id: 'note-05',
    category: 'unusual_behavior',
    title: 'Inmate Refusing Food Trays & Obstructing Door Aperture',
    content: 'Inmate Baraza has refused breakfast and lunch rations and placed folded toilet paper paste over the glass inspection portal in door C-09. Officer ordered removal twice; inmate complied reluctantly with verbal hostility.',
    urgency: 'elevated',
    location: 'Block C - Remand Detention Wing, Cell C-09',
    authorCommander: 'Capt. Marcus Vance',
    authorBadge: 'KP-8421',
    timestamp: '12:50',
    behaviorDetails: {
      inmateId: 'KP-7712',
      inmateName: 'Ezekiel Baraza',
      behaviorType: 'withdrawn_depression',
      witnessingOfficers: ['Officer Kelvin Otieno', 'Sgt. Daniel Kiprop'],
      recommendedResponse: 'Ensure duty psych orderly accompanies the 18:00 dinner distribution. If tray is refused a third time, initiate clinical starvation protocol.'
    },
    isAcknowledgedByIncoming: false
  },
  {
    id: 'note-06',
    category: 'maintenance',
    title: 'North Watchtower #4 Searchlight Gimbal Pan Servo Stutter',
    content: 'Perimeter Xenon searchlight #SL-04 shows 1.5s lag when sweeping azimuth 045° to 090° (covering the outer security ditch). Facilities electrician scheduled for preventive re-greasing.',
    urgency: 'routine',
    location: 'North Perimeter - Watchtower 4',
    authorCommander: 'Capt. Marcus Vance',
    authorBadge: 'KP-8421',
    timestamp: '09:40',
    maintenanceDetails: {
      equipmentOrAsset: 'High-Candela Xenon Searchlight Turret #4',
      workOrderRef: 'WO-2026-0884',
      trade: 'cctv_sensors',
      contractorAccessRequired: false,
      contractorName: 'In-House Facility Works Unit',
      estimatedResolution: 'Today, 17:00'
    },
    isAcknowledgedByIncoming: true,
    acknowledgedAt: '13:54',
    acknowledgedBy: 'Capt. Jonathan Hayes (KP-7890)'
  },
  {
    id: 'note-07',
    category: 'inmate_watch',
    title: 'Post-Operative Convalescence & Nocturnal Glucose Check',
    content: 'Inmate Gitau was discharged from Kenyatta National Hospital post-hernia repair. On dual anti-inflammatory and sliding scale insulin. Requires evening glycemic tally.',
    urgency: 'routine',
    location: 'Hospital Convalescence Ward 3, Bed 4',
    authorCommander: 'Capt. Marcus Vance',
    authorBadge: 'KP-8421',
    timestamp: '10:15',
    inmateWatchDetails: {
      inmateId: 'KP-6310',
      inmateName: 'Samuel Gitau',
      cellLocation: 'Hospital Wing - Bed 4',
      watchLevel: 'medical_convalescence',
      watchIntervalMinutes: 60,
      specialInstructions: 'Verify evening glucose testing by dispensary nurse at 18:00. Inmate is excused from morning muster and hard labor duties for 14 days.',
      assignedWatchPost: 'Infirmary Medical Ward'
    },
    isAcknowledgedByIncoming: true,
    acknowledgedAt: '13:55',
    acknowledgedBy: 'Capt. Jonathan Hayes (KP-7890)'
  }
];
