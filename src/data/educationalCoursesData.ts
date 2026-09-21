export interface CourseCurriculum {
  id: string;
  code: string;
  name: string;
  category: 'vocational' | 'education' | 'substance' | 'faith_based';
  categoryLabel: string;
  description: string;
  durationWeeks: number;
  totalHours: number;
  totalModules: number;
  certifyingBody: string;
  accreditationStandard: string;
  dailyWage: number;
  skillsLearned: string[];
  syllabusModules: {
    moduleNumber: number;
    title: string;
    hours: number;
    description: string;
  }[];
  defaultInstructor: string;
  minStageRequired: 'stage_1' | 'stage_2' | 'stage_3' | 'stage_4';
}

export const EDUCATIONAL_AND_VOCATIONAL_COURSES: CourseCurriculum[] = [
  {
    id: 'VOC-CARPENTRY',
    code: 'NITA-CRF-01',
    name: 'Grade II Joinery & Architectural Timber Craftsmanship',
    category: 'vocational',
    categoryLabel: 'Vocational Trades',
    description: 'Comprehensive industrial joinery, roof truss construction, lathe woodwork, and government institutional furniture fabrication.',
    durationWeeks: 24,
    totalHours: 480,
    totalModules: 6,
    certifyingBody: 'National Industrial Training Authority (NITA)',
    accreditationStandard: 'KNQF Level 3 / NITA Artisan Grade II',
    dailyWage: 2.50,
    defaultInstructor: 'Master Craftsman S. Wekesa',
    minStageRequired: 'stage_2',
    skillsLearned: [
      'Mortise and tenon jointing',
      'Timber seasoning & timber preservation',
      'Industrial lathe spindle turning',
      'Roof truss drafting & assembly',
      'Fine lacquer polishing and finishing'
    ],
    syllabusModules: [
      { moduleNumber: 1, title: 'Workshop Safety & Hand Tool Precision', hours: 60, description: 'Hand plane tuning, chisel sharpening, safety protocols.' },
      { moduleNumber: 2, title: 'Timber Science & Joinery Geometries', hours: 90, description: 'Dovetail, lap, and mortise framing fundamentals.' },
      { moduleNumber: 3, title: 'Machine Woodworking Operations', hours: 100, description: 'Table saw, thicknesser, bandsaw, and spindle shaper.' },
      { moduleNumber: 4, title: 'Institutional Furniture Fabrication', hours: 110, description: 'School desks, prison office cabinetry, and courtroom benches.' },
      { moduleNumber: 5, title: 'Structural Roof Truss Joinery', hours: 70, description: 'Load-bearing timber engineering and truss assembly.' },
      { moduleNumber: 6, title: 'NITA Trade Test Practical Evaluation', hours: 50, description: 'Timed benchmark examination piece under NITA assessors.' }
    ]
  },
  {
    id: 'VOC-TEXTILE',
    code: 'NITA-TEX-02',
    name: 'Industrial Garment Design & High-Volume Tailoring',
    category: 'vocational',
    categoryLabel: 'Vocational Trades',
    description: 'Mass uniform production, pattern drafting, industrial lockstitch machinery, and international export quality control standard compliance.',
    durationWeeks: 36,
    totalHours: 720,
    totalModules: 8,
    certifyingBody: 'Export Processing Zones Authority & NITA',
    accreditationStandard: 'EPZA Export Standards / NITA Grade II Garment Craft',
    dailyWage: 3.50,
    defaultInstructor: 'Senior Instructor M. Nzioka',
    minStageRequired: 'stage_2',
    skillsLearned: [
      'Industrial single-needle & overlock machine operation',
      'Uniform pattern drafting and grading',
      'Computerized embroidery programming',
      'Fabric cutting room layout optimization',
      'Export apparel quality inspection'
    ],
    syllabusModules: [
      { moduleNumber: 1, title: 'Industrial Sewing Machine Calibration', hours: 80, description: 'Juki lockstitch, feed dogs, thread tension, maintenance.' },
      { moduleNumber: 2, title: 'Textile Fiber Mechanics & Pattern Drafting', hours: 90, description: 'Measurement taking, master block generation.' },
      { moduleNumber: 3, title: 'Assembly Line Garment Construction', hours: 120, description: 'Pockets, collars, cuffs, zipper installation.' },
      { moduleNumber: 4, title: 'National Uniform Production Line', hours: 140, description: 'Prison guard tunics, inmate overalls, hospital scrubs.' },
      { moduleNumber: 5, title: 'Embroidery & Automated Stitching', hours: 80, description: 'National insignia and crest digitized embroidery.' },
      { moduleNumber: 6, title: 'Quality Assurance & Export Packaging', hours: 80, description: 'Tensile test, seam integrity, ISO 9001 checklists.' },
      { moduleNumber: 7, title: 'Apparel Costing & Production Planning', hours: 70, description: 'Bill of materials, yardage calculation, lean manufacturing.' },
      { moduleNumber: 8, title: 'NITA Practical Board Examination', hours: 60, description: 'Timed complete garment fabrication assessment.' }
    ]
  },
  {
    id: 'VOC-AGRI',
    code: 'KALRO-AGR-03',
    name: 'Modern Dairy Farming & Greenhouse Drip Irrigation',
    category: 'vocational',
    categoryLabel: 'Agricultural Science',
    description: 'Commercial livestock genetics, silage fermentation, greenhouse microclimate control, and water-efficient drip irrigation agriculture.',
    durationWeeks: 16,
    totalHours: 320,
    totalModules: 5,
    certifyingBody: 'Ministry of Agriculture & Livestock Research',
    accreditationStandard: 'Agricultural Training Centre (ATC) Certified Agri-Practitioner',
    dailyWage: 3.00,
    defaultInstructor: 'Officer J. Wachira (Agricultural Extension)',
    minStageRequired: 'stage_2',
    skillsLearned: [
      'Greenhouse fertigation and soil pH balancing',
      'Automated drip irrigation system maintenance',
      'Friesian dairy cattle herd health & hygiene',
      'Silage preparation and Napier grass cultivation',
      'Commercial horticulture harvesting and packing'
    ],
    syllabusModules: [
      { moduleNumber: 1, title: 'Soil Agronomy & Irrigation Hydraulics', hours: 60, description: 'Soil testing, solar pump operation, drip emitter layout.' },
      { moduleNumber: 2, title: 'Protected Greenhouse Horticulture', hours: 70, description: 'Tomato, capsicum, and cucumber nursery raising.' },
      { moduleNumber: 3, title: 'Integrated Pest Management (IPM)', hours: 50, description: 'Biological controls, non-toxic spraying regimens.' },
      { moduleNumber: 4, title: 'Dairy Herd Management & Milking Hygiene', hours: 80, description: 'Milking machines, mastitis testing, artificial insemination basics.' },
      { moduleNumber: 5, title: 'Pasture Fodder & Silage Preservation', hours: 60, description: 'Bunker silo compaction, molasses additive ratio.' }
    ]
  },
  {
    id: 'VOC-MASONRY',
    code: 'NCA-MAS-04',
    name: 'Interlocking Block Engineering & Architectural Masonry',
    category: 'vocational',
    categoryLabel: 'Vocational Trades',
    description: 'Interlocking Stabilized Soil Block (ISSB) production, structural foundation setting, reinforced masonry, and building plastering.',
    durationWeeks: 20,
    totalHours: 400,
    totalModules: 5,
    certifyingBody: 'National Construction Authority (NCA)',
    accreditationStandard: 'NCA Accredited Building Tradesperson Level 1',
    dailyWage: 2.80,
    defaultInstructor: 'Chief Mason T. Odhiambo',
    minStageRequired: 'stage_2',
    skillsLearned: [
      'ISSB press calibration & hydraulic compaction',
      'Foundation trench alignment and level survey',
      'Mortar batching and slump testing',
      'Structural perimeter walling & lintel casting',
      'Internal wall rendering and sponge finish'
    ],
    syllabusModules: [
      { moduleNumber: 1, title: 'Site Surveying, Levelling & Safety', hours: 60, description: 'Dumpy level operation, profile boards, PPE regulations.' },
      { moduleNumber: 2, title: 'ISSB Hydraulic Machine Production', hours: 80, description: 'Soil-cement ratios, curing protocols, compressive tests.' },
      { moduleNumber: 3, title: 'Foundation Footings & Substructure', hours: 90, description: 'Hardcore compaction, damp proof membranes, concrete pouring.' },
      { moduleNumber: 4, title: 'Superstructure Bricklaying & Mortar Binds', hours: 100, description: 'English bond, Flemish bond, corner plumb alignment.' },
      { moduleNumber: 5, title: 'Lintels, Beams & Wall Finishing', hours: 70, description: 'Formwork shuttering, rebar tying, smooth plaster.' }
    ]
  },
  {
    id: 'EDU-LIT-BASIC',
    code: 'MOE-LIT-05',
    name: 'Adult Basic Literacy, Numeracy & Civic Empowerment',
    category: 'education',
    categoryLabel: 'Adult Literacy & Basic Ed',
    description: 'Foundational reading, writing, mathematical arithmetic, personal budgeting, and civic rights education for adult learners.',
    durationWeeks: 20,
    totalHours: 300,
    totalModules: 5,
    certifyingBody: 'Ministry of Education - Directorate of Adult & Continuing Education',
    accreditationStandard: 'National Adult Literacy Proficiency Level 2 (ALP-2)',
    dailyWage: 1.50,
    defaultInstructor: 'Education Officer Patricia Koech',
    minStageRequired: 'stage_1',
    skillsLearned: [
      'Functional reading comprehension (English & Swahili)',
      'Official letter writing and administrative forms completion',
      'Foundational arithmetic, decimals and commercial percentages',
      'Personal household budgeting and book balancing',
      'Constitutional basic human rights literacy'
    ],
    syllabusModules: [
      { moduleNumber: 1, title: 'Phonetics & Word Building in Dual Languages', hours: 60, description: 'Vowel recognition, syllable blending, basic sight words.' },
      { moduleNumber: 2, title: 'Functional Sentence Composition & Handwriting', hours: 60, description: 'Handwriting clarity, punctuation, filling bank & court forms.' },
      { moduleNumber: 3, title: 'Everyday Arithmetic & Mental Mathematics', hours: 60, description: 'Addition, subtraction, multiplication, division in daily commerce.' },
      { moduleNumber: 4, title: 'Financial Numeracy & Ledger Keeping', hours: 60, description: 'Savings calculation, currency handling, receipt tracking.' },
      { moduleNumber: 5, title: 'Civic Literacy & Constitutional Governance', hours: 60, description: 'Bill of Rights, court procedures, community reintegration rights.' }
    ]
  },
  {
    id: 'EDU-IT',
    code: 'ICTA-DGT-06',
    name: 'Computer Literacy, Office Productivity & Digital Skills',
    category: 'education',
    categoryLabel: 'Information Technology (ICT)',
    description: 'Computer hardware fundamentals, operating systems, touch typing, office suite documents/spreadsheets, and introduction to software logic.',
    durationWeeks: 14,
    totalHours: 280,
    totalModules: 5,
    certifyingBody: 'ICT Authority of Kenya',
    accreditationStandard: 'National Digital Literacy Certificate (NDLC Level 2)',
    dailyWage: 2.00,
    defaultInstructor: 'ICT Instructor Evans Omwenga',
    minStageRequired: 'stage_2',
    skillsLearned: [
      'Operating system file management & security basics',
      'Touch typing at 45+ words per minute with 98% accuracy',
      'Word processing, official business correspondence & resumes',
      'Spreadsheet formulas, data entry and financial tables',
      'Basic algorithmic logic and computational problem-solving'
    ],
    syllabusModules: [
      { moduleNumber: 1, title: 'Computer Architecture & Peripheral Operations', hours: 40, description: 'CPU, RAM, storage, peripheral peripherals, safe shutdown.' },
      { moduleNumber: 2, title: 'Touch Typing & Ergonomic Keyboard Mastery', hours: 50, description: 'QWERTY homerow drills, typing software benchmarks.' },
      { moduleNumber: 3, title: 'Document Publishing & Professional Resumes', hours: 70, description: 'Formatting, styles, tables, mail merges, PDF generation.' },
      { moduleNumber: 4, title: 'Spreadsheets & Data Tabulation Formulas', hours: 70, description: 'SUM, AVERAGE, IF formulas, data validation, chart creation.' },
      { moduleNumber: 5, title: 'Digital Workplace Ethics & Introduction to Logic', hours: 50, description: 'Information security, flowcharts, introductory pseudocode.' }
    ]
  },
  {
    id: 'EDU-LEGAL',
    code: 'NLAS-PAR-07',
    name: 'Paralegal Training & Constitutional Defense Rights Clinic',
    category: 'education',
    categoryLabel: 'Legal Aid & Human Rights',
    description: 'Court procedure mechanics, bail application drafting, appellate court filing guidelines, trial evidence rules, and human rights advocacy.',
    durationWeeks: 12,
    totalHours: 240,
    totalModules: 4,
    certifyingBody: 'National Legal Aid Service (NLAS) & Law Society of Kenya',
    accreditationStandard: 'Certified Prison Community Paralegal Certificate',
    dailyWage: 0.00,
    defaultInstructor: 'Advocate J. Mboya (Legal Aid Trust)',
    minStageRequired: 'stage_2',
    skillsLearned: [
      'Constitutional Bill of Rights (Articles 49 & 50 interpretation)',
      'Criminal trial procedure & charge sheet parsing',
      'Drafting petition of appeal and affidavit preparation',
      'Bail and bond review application procedures',
      'Client interviewing and legal fact-finding'
    ],
    syllabusModules: [
      { moduleNumber: 1, title: 'Constitutional Protections & Nelson Mandela Rules', hours: 60, description: 'Fair trial guarantees, detention conditions jurisprudence.' },
      { moduleNumber: 2, title: 'Criminal Procedure Code & Warrant Analysis', hours: 60, description: 'Committal warrants, summonses, remand rules.' },
      { moduleNumber: 3, title: 'Legal Drafting: Affidavits, Petitions & Appeals', hours: 70, description: 'Writing grounds of appeal, notice of motion.' },
      { moduleNumber: 4, title: 'Judicial Clinic Mock Proceedings & Advocacy', hours: 50, description: 'Simulated court mitigation speeches, cross-examination basics.' }
    ]
  },
  {
    id: 'VOC-AUTO',
    code: 'NITA-MEC-08',
    name: 'Automotive Mechanics & Engine Diagnostics',
    category: 'vocational',
    categoryLabel: 'Vocational Trades',
    description: 'Internal combustion engine overhaul, automotive electrical systems, transmission mechanics, and computerized diagnostic scanning.',
    durationWeeks: 28,
    totalHours: 560,
    totalModules: 7,
    certifyingBody: 'National Industrial Training Authority (NITA)',
    accreditationStandard: 'NITA Artisan Grade II Motor Vehicle Mechanics',
    dailyWage: 3.20,
    defaultInstructor: 'Senior Master Engineer David Kimani',
    minStageRequired: 'stage_2',
    skillsLearned: [
      'Diesel and petrol cylinder head overhaul',
      'Automotive braking and ABS hydraulic servicing',
      'Vehicle electrical wiring, alternator and starter diagnosis',
      'OBD-II scanner fault code interrogation and clearing',
      'Clutch assembly replacement and transmission alignment'
    ],
    syllabusModules: [
      { moduleNumber: 1, title: 'Workshop Safety & Tool Ergonomics', hours: 50, description: 'Pneumatic lifts, torque wrenches, oil disposal protocols.' },
      { moduleNumber: 2, title: 'Engine Dismantling & Top-End Overhaul', hours: 100, description: 'Valve lapping, piston ring gapping, camshaft timing.' },
      { moduleNumber: 3, title: 'Automotive Fuel Injection & Air Induction', hours: 80, description: 'Fuel rails, EFI injectors, throttle bodies, turbochargers.' },
      { moduleNumber: 4, title: 'Vehicle Braking Systems & Suspension', hours: 90, description: 'Disc resurfacing, master cylinders, shock absorber replacement.' },
      { moduleNumber: 5, title: 'Automotive Electrics, Batteries & Starters', hours: 90, description: 'Multimeter diagnostics, relays, fuse boxes, wiring harnesses.' },
      { moduleNumber: 6, title: 'OBD-II Computerized Diagnostics', hours: 80, description: 'Live sensor data streams, ECU troubleshooting.' },
      { moduleNumber: 7, title: 'NITA Practical Mechanical Evaluation', hours: 70, description: 'Fault diagnosis and bench rebuild assessment.' }
    ]
  },
  {
    id: 'VOC-CULINARY',
    code: 'TTRB-CUL-09',
    name: 'Commercial Culinary Arts, Bakery & Food Hygiene Safety',
    category: 'vocational',
    categoryLabel: 'Vocational Trades',
    description: 'Institutional batch cooking, commercial bread baking, pastry confectionery, HACCP food safety standards, and kitchen inventory control.',
    durationWeeks: 16,
    totalHours: 320,
    totalModules: 5,
    certifyingBody: 'Tourism & Catering Training Board / Kenya Utalii College',
    accreditationStandard: 'Certified Institutional Cook Grade I',
    dailyWage: 2.70,
    defaultInstructor: 'Chef Trainer Beatrice Mutua',
    minStageRequired: 'stage_2',
    skillsLearned: [
      'High-volume meal planning and dietary balance',
      'Industrial deck oven bread and pastry baking',
      'HACCP hazard analysis and kitchen sanitation',
      'Knife skills, portion control, and waste minimization',
      'Commercial kitchen inventory ledger keeping'
    ],
    syllabusModules: [
      { moduleNumber: 1, title: 'Food Safety, Hygiene & HACCP Standards', hours: 50, description: 'Foodborne pathogens, cold chain maintenance, hygiene auditing.' },
      { moduleNumber: 2, title: 'Knife Techniques, Mirepoix & Stock Preparation', hours: 60, description: 'French cuts, mother sauces, institutional meat preparation.' },
      { moduleNumber: 3, title: 'Commercial Bakery Operations', hours: 80, description: 'Yeast fermentation, dough kneading, proofing, oven baking.' },
      { moduleNumber: 4, title: 'Institutional Batch Cooking (500+ Meals)', hours: 80, description: 'Steam kettles, bulk grain cooking, balanced correctional menus.' },
      { moduleNumber: 5, title: 'Final Culinary Assessment & Banquet Setup', hours: 50, description: 'Buffet display, timed menu presentation, food cost audit.' }
    ]
  },
  {
    id: 'BEH-CBT',
    code: 'DCW-REL-10',
    name: 'Cognitive Behavioral Therapy (CBT) & Substance Relapse Prevention',
    category: 'substance',
    categoryLabel: 'Behavioral & Life Skills',
    description: 'Evidence-based cognitive reframing, emotional regulation, trigger identification, relapse prevention plans, and restorative community reintegration.',
    durationWeeks: 12,
    totalHours: 180,
    totalModules: 4,
    certifyingBody: 'National Directorate of Correctional Welfare & NACADA',
    accreditationStandard: 'Correctional Wellness & Reintegration Credential',
    dailyWage: 0.00,
    defaultInstructor: 'Senior Psychologist Dr. Faith Cherono',
    minStageRequired: 'stage_1',
    skillsLearned: [
      'Cognitive distortion identification and reframing',
      'Stress inoculation and emotional de-escalation',
      'Personal relapse prevention roadmapping',
      'Constructive communication and conflict resolution',
      'Family reintegration and post-release support networks'
    ],
    syllabusModules: [
      { moduleNumber: 1, title: 'Understanding Thoughts, Emotions & Behavior', hours: 45, description: 'The cognitive model, cycle of antisocial impulses.' },
      { moduleNumber: 2, title: 'Substance Addiction Neurobiology & Triggers', hours: 45, description: 'Craving management, physiological relapse cues.' },
      { moduleNumber: 3, title: 'Interpersonal Effectiveness & Anger Management', hours: 45, description: 'Assertive vs. aggressive behavior, mediation roleplay.' },
      { moduleNumber: 4, title: 'Personal Exit & Relapse Prevention Contract', hours: 45, description: 'Support group mapping, emergency coping pledges.' }
    ]
  }
];
