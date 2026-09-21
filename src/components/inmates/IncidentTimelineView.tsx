import React, { useState, useMemo } from 'react';
import { 
  Inmate, 
  PrisonFacility, 
  TimelineIncidentItem, 
  IncidentCategory, 
  IncidentSeverity,
  UserRole,
  RemissionLog
} from '../../types';
import {
  History,
  ShieldAlert,
  AlertTriangle,
  Gavel,
  Scale,
  Stethoscope,
  HeartPulse,
  Syringe,
  Activity,
  Award,
  TrendingUp,
  TrendingDown,
  UserCheck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Info,
  FileText,
  Printer,
  Calendar,
  Clock,
  Building2,
  MapPin,
  X,
  AlertCircle,
  Sparkles,
  ArrowUpDown,
  Lock,
  ChevronRight
} from 'lucide-react';

export interface IncidentTimelineViewProps {
  inmate: Inmate;
  facilities: PrisonFacility[];
  onUpdateInmate: (updated: Inmate) => void;
  currentUserRole?: UserRole;
}

export const IncidentTimelineView: React.FC<IncidentTimelineViewProps> = ({
  inmate,
  facilities,
  onUpdateInmate,
  currentUserRole = 'superintendent'
}) => {
  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | IncidentCategory>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<'ALL' | IncidentSeverity>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); // 'desc' = newest first

  // Modal state for logging new incident
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalCategory, setModalCategory] = useState<IncidentCategory>('disciplinary');
  const [modalTitle, setModalTitle] = useState('');
  const [modalDate, setModalDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [modalTime, setModalTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [modalSeverity, setModalSeverity] = useState<IncidentSeverity>('moderate');
  const [modalEventType, setModalEventType] = useState('Contraband Possession');
  const [modalDescription, setModalDescription] = useState('');
  const [modalActionTaken, setModalActionTaken] = useState('');
  const [modalAuthority, setModalAuthority] = useState('Senior Supt. Mwangi (Disciplinary Board)');
  const [modalRemissionForfeiture, setModalRemissionForfeiture] = useState<number>(0);
  const [modalNewStage, setModalNewStage] = useState<string>('');
  const [modalNewSecurity, setModalNewSecurity] = useState<string>('');
  const [modalMandelaRuleNote, setModalMandelaRuleNote] = useState('');

  // Extract and consolidate all chronological events from the inmate's comprehensive records
  const allConsolidatedEvents = useMemo<TimelineIncidentItem[]>(() => {
    const list: TimelineIncidentItem[] = [];

    // 1. Custom logged timeline events already on inmate
    if (inmate.incidentTimelineEvents && inmate.incidentTimelineEvents.length > 0) {
      list.push(...inmate.incidentTimelineEvents);
    }

    // 2. DISCIPLINARY: Remission Logs (forfeitures and restorations)
    inmate.remissionLogs.forEach(rem => {
      // Avoid duplicate if custom item with same id exists
      if (list.some(item => item.id === rem.id)) return;

      if (rem.type === 'forfeiture_infraction') {
        const absDays = Math.abs(rem.days);
        list.push({
          id: rem.id,
          date: rem.date,
          time: '14:30',
          category: 'disciplinary',
          severity: absDays >= 28 ? 'critical' : absDays >= 14 ? 'high' : 'moderate',
          title: `Disciplinary Forfeiture Penalty (-${absDays} Days)`,
          eventType: 'Remission Forfeiture Infraction',
          description: rem.reason,
          authority: rem.adjudicator || 'Disciplinary Tribunal Adjudicator',
          facilityName: inmate.facilityName,
          cellLocation: inmate.cellLocation,
          actionTaken: `Forfeited ${absDays} statutory remission days under Prisons Act Sec. 46 sentence re-computation.`,
          metrics: [
            { label: 'Remission Lost', value: `-${absDays} Days`, badgeColor: 'rose' },
            { label: 'Legal Basis', value: 'Prisons Act Sec. 46', badgeColor: 'purple' }
          ],
          tags: ['Disciplinary Tribunal', 'Remission Forfeiture', 'Contraband / Infraction'],
          mandelaRuleCompliance: {
            compliant: true,
            ruleNumber: 'Rule 39',
            note: 'Adjudicated by statutory tribunal with formal hearing and defense recording.'
          }
        });
      } else if (rem.type === 'restoration_merit') {
        list.push({
          id: rem.id,
          date: rem.date,
          time: '10:00',
          category: 'reclassification',
          severity: 'positive',
          title: `Merit Remission Restoration (+${rem.days} Days)`,
          eventType: 'Exemplary Conduct Restoration',
          description: rem.reason,
          authority: rem.adjudicator || 'Warden Conduct Review Board',
          facilityName: inmate.facilityName,
          cellLocation: inmate.cellLocation,
          actionTaken: `Restored ${rem.days} remission days in recognition of sustained exemplary behavior and industry.`,
          metrics: [
            { label: 'Remission Restored', value: `+${rem.days} Days`, badgeColor: 'emerald' }
          ],
          tags: ['Merit Award', 'Remission Restored', 'Good Conduct']
        });
      }
    });

    // 3. DISCIPLINARY: Solitary confinement periods from Human Rights Audits
    inmate.humanRightsAudits.forEach(hra => {
      if (hra.consecutiveSolitaryDays && hra.consecutiveSolitaryDays > 0) {
        const isExcessive = hra.consecutiveSolitaryDays > 15;
        list.push({
          id: `audit-solitary-${hra.id}`,
          date: hra.date,
          time: '09:00',
          category: 'disciplinary',
          severity: isExcessive ? 'critical' : hra.consecutiveSolitaryDays > 7 ? 'high' : 'moderate',
          title: `Disciplinary Segregation & Solitary Confinement (${hra.consecutiveSolitaryDays} Days)`,
          eventType: 'Solitary Segregation Sanction',
          description: `Inmate placed under disciplinary segregation. Outdoor exercise allowance: ${hra.outdoorHoursPerDay} hrs/day. Medical checkups logged: ${hra.medicalVisitsCount}. Recommendations: ${hra.recommendations}`,
          authority: hra.auditorName,
          facilityName: inmate.facilityName,
          cellLocation: 'Isolation Wing / Segregation Block',
          actionTaken: `Segregated with daily medical officer clinical rounds and guaranteed outdoor exercise.`,
          metrics: [
            { label: 'Solitary Duration', value: `${hra.consecutiveSolitaryDays} Days`, badgeColor: isExcessive ? 'rose' : 'amber' },
            { label: 'Daily Exercise', value: `${hra.outdoorHoursPerDay} hrs/day`, badgeColor: 'emerald' }
          ],
          tags: ['Mandela Rule 43', 'Solitary Confinement', 'Human Rights Audit'],
          mandelaRuleCompliance: {
            compliant: !isExcessive,
            ruleNumber: 'Rule 43 & 44',
            note: isExcessive 
              ? 'ALERT: Exceeds 15-day Nelson Mandela Rule prohibition limit on solitary confinement.'
              : 'Compliant: Within Mandela Rule 43 limit (<15 days) with mandatory daily health visits.'
          }
        });
      }
    });

    // 4. DISCIPLINARY: Escape & Recapture Incidents (if any)
    if (inmate.escapeIncidents && inmate.escapeIncidents.length > 0) {
      inmate.escapeIncidents.forEach(esc => {
        list.push({
          id: esc.id,
          date: esc.incidentDate,
          time: '23:15',
          category: 'disciplinary',
          severity: 'critical',
          title: `Major Security Breach: Escape Attempt (${esc.status})`,
          eventType: 'Custodial Escape Incident',
          description: `Inmate escaped from ${esc.escapeLocation} at ${esc.facilityName}. Method of escape: ${esc.methodOfEscape}. Recaptured by ${esc.recapturingAgency || 'Tactical Prisons Unit'}.`,
          authority: 'Internal Affairs & Tactical Escape Recapture Unit',
          facilityName: esc.facilityName || inmate.facilityName,
          actionTaken: esc.disciplinaryActionNotes || 'Immediate security category elevation to CAT A Supermax and referral to CID for criminal escape charges.',
          metrics: [
            { label: 'Status', value: esc.status, badgeColor: 'rose' },
            { label: 'Recaptured', value: esc.recaptureDate || 'Pending', badgeColor: 'indigo' }
          ],
          tags: ['Critical Security Incident', 'Escape Protocol', 'Supermax Transfer'],
          mandelaRuleCompliance: {
            compliant: true,
            ruleNumber: 'Rule 89',
            note: 'Formal inquiry conducted; physical security audit executed on perimeter breach point.'
          }
        });
      });
    }

    // 5. MEDICAL: Admission Clinical Intake Screening
    if (inmate.medicalIntake) {
      const med = inmate.medicalIntake;
      const isCritical = med.medicalFlagSeverity === 'critical';
      const isChronic = med.medicalFlagSeverity === 'chronic' || med.chronicConditions?.length > 0;
      list.push({
        id: `med-screening-${med.id}`,
        date: med.screeningDate || inmate.admissionDate,
        time: med.screeningTime || '10:30',
        category: 'medical',
        severity: isCritical ? 'critical' : isChronic ? 'moderate' : 'routine',
        title: `Comprehensive Medical Intake & Fitness for Detention`,
        eventType: 'Clinical Intake Screening',
        description: med.initialScreeningNotes || `Medical examination conducted. Certified ${med.fitnessForDetention.replace(/_/g, ' ')}. Mental health suicide risk evaluated: ${med.mentalHealthScreening?.suicideRiskLevel}.`,
        authority: `${med.examiningOfficer} (${med.medicalOfficerTitle})`,
        facilityName: med.facilityName || inmate.facilityName,
        cellLocation: inmate.cellLocation,
        actionTaken: `Vitals recorded (BP: ${med.vitals.bloodPressureSystolic}/${med.vitals.bloodPressureDiastolic} mmHg, Heart Rate: ${med.vitals.heartRateBpm} bpm). Dietary/housing recommendations: ${med.dietaryMedicalRecommendation || 'Standard custody allocation'}.`,
        metrics: [
          { label: 'Fitness', value: med.fitnessForDetention.replace(/_/g, ' '), badgeColor: 'teal' },
          { label: 'Blood Pressure', value: `${med.vitals.bloodPressureSystolic}/${med.vitals.bloodPressureDiastolic}`, badgeColor: 'indigo' },
          { label: 'BMI', value: `${med.vitals.bmi}`, badgeColor: 'slate' }
        ],
        tags: ['Medical Intake', 'Vitals Baseline', 'Physical Exam', 'Mental Health Triage'],
        mandelaRuleCompliance: {
          compliant: true,
          ruleNumber: 'Rule 24 & 30',
          note: 'Medical examination conducted within 24 hours of admission as mandated by UN Nelson Mandela Rules.'
        }
      });

      // 6. MEDICAL: Vaccinations Administered
      if (med.vaccinations && med.vaccinations.length > 0) {
        med.vaccinations.forEach(vax => {
          list.push({
            id: vax.id,
            date: vax.dateAdministered,
            time: '11:15',
            category: 'medical',
            severity: 'routine',
            title: `Immunization: ${vax.vaccineName} (Dose ${vax.doseNumber})`,
            eventType: 'Vaccine Administration',
            description: `Administered ${vax.vaccineName} (Batch: ${vax.batchLotNumber}). Clinic: ${vax.clinicFacility}. ${vax.notes || 'No adverse post-injection reaction observed.'}`,
            authority: vax.administeredBy,
            facilityName: vax.clinicFacility || inmate.facilityName,
            actionTaken: `Intramuscular immunization entered into institutional health record and national immunization registry.`,
            metrics: [
              { label: 'Dose', value: `Dose #${vax.doseNumber}`, badgeColor: 'teal' },
              { label: 'Status', value: vax.status.toUpperCase(), badgeColor: 'emerald' }
            ],
            tags: ['Vaccination', 'Communicable Disease Prevention', vax.vaccineName]
          });
        });
      }

      // 7. MEDICAL: Allergies Diagnosed
      if (med.allergies && med.allergies.length > 0) {
        med.allergies.forEach(all => {
          const isSevere = all.severity === 'anaphylactic' || all.severity === 'severe';
          list.push({
            id: all.id,
            date: all.diagnosedDate || med.screeningDate || inmate.admissionDate,
            time: '11:45',
            category: 'medical',
            severity: isSevere ? 'critical' : 'high',
            title: `Clinical Allergy Alert: ${all.allergen} (${all.severity.toUpperCase()})`,
            eventType: 'Allergy Diagnosis & Protocol',
            description: `Diagnosed with ${all.type} allergy to ${all.allergen}. Reaction symptom profile: ${all.reaction}. Emergency Action: ${all.emergencyAction || 'Prompt medical bay intervention'}.`,
            authority: all.recordedBy,
            facilityName: inmate.facilityName,
            actionTaken: `Red medical band issued. Catering kitchen and dispensary contraindication logged.`,
            metrics: [
              { label: 'Severity', value: all.severity.toUpperCase(), badgeColor: isSevere ? 'rose' : 'amber' },
              { label: 'Category', value: all.type.toUpperCase(), badgeColor: 'slate' }
            ],
            tags: ['Allergy Flag', 'Critical Clinical Contraindication', all.allergen]
          });
        });
      }

      // 8. MEDICAL: Scheduled Follow-Up Review
      if (med.followUpAppointmentDate) {
        list.push({
          id: `med-followup-${med.id}`,
          date: med.followUpAppointmentDate,
          time: '09:30',
          category: 'medical',
          severity: 'moderate',
          title: `Scheduled Chronic Care & Physician Review`,
          eventType: 'Specialist Clinical Follow-Up',
          description: `Scheduled appointment for chronic disease management (${med.flaggedCondition || med.chronicConditions?.join(', ') || 'General Review'}). Assessing medication efficacy and lung function.`,
          authority: med.examiningOfficer,
          facilityName: inmate.facilityName,
          actionTaken: `Scheduled on clinic duty calendar. Patient escorted to dispensary for pulmonary / chronic check.`,
          tags: ['Scheduled Review', 'Chronic Care Management', 'Physician Appointment']
        });
      }
    }

    // 9. RECLASSIFICATIONS: Admission Day Custody & Security Classification
    list.push({
      id: `class-admission-${inmate.id}`,
      date: inmate.admissionDate,
      time: '08:00',
      category: 'reclassification',
      severity: 'routine',
      title: `Initial Custodial Classification (${inmate.securityCategory})`,
      eventType: 'Intake Security Classification',
      description: `Inmate booked into penitentiary custody following court committal warrant. Assigned initial Security Classification ${inmate.securityCategory} and placed in Progressive Stage ${inmate.progressiveStage.replace('_', ' ').toUpperCase()}. Allocated to ${inmate.cellLocation}.`,
      authority: 'Penal Classification & Admissions Board',
      facilityName: inmate.facilityName,
      cellLocation: inmate.cellLocation,
      actionTaken: `Institutional enrollment completed. Fingerprints cross-matched with National Criminal Records Bureau.`,
      metrics: [
        { label: 'Security Class', value: inmate.securityCategory, badgeColor: 'indigo' },
        { label: 'Stage', value: inmate.progressiveStage.replace('_', ' ').toUpperCase(), badgeColor: 'purple' }
      ],
      tags: ['Admission Day', 'Intake Classification', inmate.securityCategory],
      mandelaRuleCompliance: {
        compliant: true,
        ruleNumber: 'Rule 93 & 94',
        note: 'Individualized classification system based on sentence length, criminal history and risk assessment.'
      }
    });

    // 10. RECLASSIFICATIONS: Security Reclassification Transfers
    inmate.transfers.forEach(trf => {
      if (
        trf.transferReason === 'security_reclassification' || 
        trf.transferReason === 'security_elevation'
      ) {
        list.push({
          id: `class-trf-${trf.id}`,
          date: trf.requisitionDate,
          time: '07:30',
          category: 'reclassification',
          severity: trf.transferReason === 'security_elevation' ? 'high' : 'moderate',
          title: `Inter-Prison Security Reclassification Transfer`,
          eventType: 'Security Elevation & Facility Relocation',
          description: `Security assessment mandated transfer from ${trf.fromFacilityName} to ${trf.toFacilityName}. Escort protocol: ${trf.escortLevel.replace(/_/g, ' ').toUpperCase()}. Authorized by ${trf.authorizedBy || 'Prisons Directorate'}.`,
          authority: trf.authorizedBy || 'Commissioner General of Prisons',
          facilityName: trf.toFacilityName,
          actionTaken: `Executed armed transfer under tactical escort. Physical intake at destination facility confirmed.`,
          metrics: [
            { label: 'Origin', value: trf.fromFacilityName.split(' ')[0], badgeColor: 'slate' },
            { label: 'Destination', value: trf.toFacilityName.split(' ')[0], badgeColor: 'indigo' }
          ],
          tags: ['Security Transfer', 'Facility Relocation', 'Inter-Prison Matrix']
        });
      } else if (
        trf.transferReason === 'medical_specialty' || 
        trf.transferReason === 'medical_treatment'
      ) {
        list.push({
          id: `med-trf-${trf.id}`,
          date: trf.requisitionDate,
          time: '08:15',
          category: 'medical',
          severity: 'high',
          title: `Medical Referral & Specialist Care Transfer`,
          eventType: 'Specialist Clinical Transfer',
          description: `Inmate transferred to ${trf.toFacilityName} for specialized diagnostic and therapeutic care. Authorized clinical escort level: ${trf.escortLevel.replace(/_/g, ' ')}.`,
          authority: trf.authorizedBy || 'Chief Medical Officer',
          facilityName: trf.toFacilityName,
          actionTaken: `Dispatched in medical cell vehicle with clinical officer escort.`,
          tags: ['Medical Transfer', 'Specialist Referral', 'Clinical Care']
        });
      }
    });

    // 11. RECLASSIFICATIONS: Progressive Stage Advancement (if stage 2, 3 or 4)
    if (inmate.progressiveStage !== 'stage_1') {
      const sentenceDate = inmate.sentences[0]?.sentenceDate || inmate.admissionDate;
      // Synthesize formal promotion milestone date
      const promotionDate = new Date(sentenceDate);
      promotionDate.setMonth(promotionDate.getMonth() + 4);
      const promoDateStr = promotionDate.toISOString().slice(0, 10);

      list.push({
        id: `class-stage-promo-${inmate.id}`,
        date: promoDateStr,
        time: '11:00',
        category: 'reclassification',
        severity: 'positive',
        title: `Progressive Stage Promotion: ${inmate.progressiveStage.replace('_', ' ').toUpperCase()}`,
        eventType: 'Progressive Stage Advancement',
        description: `Promoted from Stage 1 to ${inmate.progressiveStage.replace('_', ' ').toUpperCase()} after passing quarterly conduct review. Institutional conduct score: ${inmate.behaviorRating}/100. Disciplinary infractions cleared.`,
        authority: 'Progressive Stage Classification Board',
        facilityName: inmate.facilityName,
        cellLocation: inmate.cellLocation,
        actionTaken: `Work privileges, vocational workshop allowance and expanded visitation rights activated.`,
        metrics: [
          { label: 'New Stage', value: inmate.progressiveStage.replace('_', ' ').toUpperCase(), badgeColor: 'emerald' },
          { label: 'Behavior Score', value: `${inmate.behaviorRating}/100`, badgeColor: 'purple' }
        ],
        tags: ['Progressive Stage', 'Privilege Promotion', 'Rehabilitation Progress']
      });
    }

    // 12. Parse any Chatter Logs that relate to Disciplinary, Medical, or Classification
    inmate.chatterLogs.forEach(chat => {
      // Avoid duplicate
      if (list.some(item => item.id === chat.id)) return;

      const lower = chat.message.toLowerCase();
      const isDisciplinary = 
        lower.includes('disciplinary') || 
        lower.includes('tribunal') || 
        lower.includes('contraband') || 
        lower.includes('infraction') || 
        lower.includes('forfeiture') || 
        lower.includes('misconduct') ||
        lower.includes('cell search');

      const isMedical = 
        lower.includes('medical') || 
        lower.includes('clinic') || 
        lower.includes('doctor') || 
        lower.includes('nurse') || 
        lower.includes('hospital') || 
        lower.includes('asthma') || 
        lower.includes('inhaler') ||
        lower.includes('vitals');

      const isReclassification = 
        lower.includes('reclassified') || 
        lower.includes('category') || 
        lower.includes('stage') || 
        lower.includes('promoted') || 
        lower.includes('demoted') ||
        lower.includes('classification');

      if (isDisciplinary) {
        list.push({
          id: chat.id,
          date: chat.date.split(' ')[0],
          time: chat.date.split(' ')[1] || '12:00',
          category: 'disciplinary',
          severity: lower.includes('forfeiture') ? 'high' : 'moderate',
          title: `Disciplinary Entry: ${chat.author}`,
          eventType: 'Institutional Conduct Log',
          description: chat.message,
          authority: chat.author,
          facilityName: inmate.facilityName,
          actionTaken: 'Logged in institutional judicial register.',
          tags: ['Disciplinary Log', 'Conduct Registry']
        });
      } else if (isMedical) {
        list.push({
          id: chat.id,
          date: chat.date.split(' ')[0],
          time: chat.date.split(' ')[1] || '12:00',
          category: 'medical',
          severity: 'routine',
          title: `Clinical Note: ${chat.author}`,
          eventType: 'Medical Encounter Log',
          description: chat.message,
          authority: chat.author,
          facilityName: inmate.facilityName,
          actionTaken: 'Entered into electronic health record.',
          tags: ['Clinical Note', 'Health Care Log']
        });
      } else if (isReclassification) {
        list.push({
          id: chat.id,
          date: chat.date.split(' ')[0],
          time: chat.date.split(' ')[1] || '12:00',
          category: 'reclassification',
          severity: 'moderate',
          title: `Classification Update: ${chat.author}`,
          eventType: 'Custodial Classification Review',
          description: chat.message,
          authority: chat.author,
          facilityName: inmate.facilityName,
          actionTaken: 'Inmate record updated in prison management database.',
          tags: ['Classification Update', 'Board Review']
        });
      }
    });

    // Deduplicate by ID
    const seenIds = new Set<string>();
    const unique = list.filter(item => {
      if (seenIds.has(item.id)) return false;
      seenIds.add(item.id);
      return true;
    });

    // Sort chronologically
    return unique.sort((a, b) => {
      const cmp = a.date.localeCompare(b.date);
      if (cmp !== 0) return cmp;
      return (a.time || '').localeCompare(b.time || '');
    });
  }, [inmate]);

  // Filtered and Sorted Events
  const filteredEvents = useMemo(() => {
    return allConsolidatedEvents
      .filter(item => {
        // Category filter
        if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
          return false;
        }
        // Severity filter
        if (selectedSeverity !== 'ALL' && item.severity !== selectedSeverity) {
          return false;
        }
        // Text search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = item.title.toLowerCase().includes(q);
          const matchesDesc = item.description.toLowerCase().includes(q);
          const matchesAuth = item.authority.toLowerCase().includes(q);
          const matchesType = item.eventType.toLowerCase().includes(q);
          const matchesAction = (item.actionTaken || '').toLowerCase().includes(q);
          const matchesTags = item.tags.some(t => t.toLowerCase().includes(q));
          if (!matchesTitle && !matchesDesc && !matchesAuth && !matchesType && !matchesAction && !matchesTags) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        const order = sortOrder === 'desc' ? -1 : 1;
        const cmp = a.date.localeCompare(b.date);
        if (cmp !== 0) return cmp * order;
        return (a.time || '').localeCompare(b.time || '') * order;
      });
  }, [allConsolidatedEvents, selectedCategory, selectedSeverity, searchQuery, sortOrder]);

  // Counts by category
  const categoryCounts = useMemo(() => {
    const counts = {
      ALL: allConsolidatedEvents.length,
      disciplinary: 0,
      medical: 0,
      reclassification: 0,
      critical: 0,
      totalRemissionDaysLost: 0
    };

    allConsolidatedEvents.forEach(e => {
      if (e.category === 'disciplinary') {
        counts.disciplinary++;
        // Check if remission forfeiture
        if (e.metrics) {
          const remMetric = e.metrics.find(m => m.label.includes('Remission Lost'));
          if (remMetric) {
            const num = parseInt(remMetric.value.replace(/[^0-9]/g, ''), 10);
            if (!isNaN(num)) counts.totalRemissionDaysLost += num;
          }
        }
      } else if (e.category === 'medical') {
        counts.medical++;
      } else if (e.category === 'reclassification') {
        counts.reclassification++;
      }

      if (e.severity === 'critical') {
        counts.critical++;
      }
    });

    return counts;
  }, [allConsolidatedEvents]);

  // Handle logging a new event from the modal
  const handleSaveNewEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTitle.trim() || !modalDescription.trim()) return;

    const newId = `event-${Date.now()}`;
    const newEvent: TimelineIncidentItem = {
      id: newId,
      date: modalDate,
      time: modalTime,
      category: modalCategory,
      severity: modalSeverity,
      title: modalTitle.trim(),
      eventType: modalEventType,
      description: modalDescription.trim(),
      authority: modalAuthority.trim() || 'Commanding Officer',
      facilityName: inmate.facilityName,
      cellLocation: inmate.cellLocation,
      actionTaken: modalActionTaken.trim() || undefined,
      mandelaRuleCompliance: modalMandelaRuleNote.trim() ? {
        compliant: true,
        ruleNumber: 'Rule 39 & 43',
        note: modalMandelaRuleNote.trim()
      } : undefined,
      metrics: [],
      tags: [
        modalCategory === 'disciplinary' ? 'Disciplinary Incident' : modalCategory === 'medical' ? 'Clinical Intervention' : 'Classification Action',
        modalEventType
      ],
      isCustomLogged: true
    };

    // Prepare updated inmate
    const existingCustomEvents = inmate.incidentTimelineEvents || [];
    const updatedCustomEvents = [...existingCustomEvents, newEvent];

    let updatedRemissionLogs = [...inmate.remissionLogs];
    let updatedSentences = [...inmate.sentences];
    let updatedStage = inmate.progressiveStage;
    let updatedSecurity = inmate.securityCategory;

    // Handle Disciplinary remission forfeiture if specified
    if (modalCategory === 'disciplinary' && modalRemissionForfeiture > 0) {
      const newRemLog: RemissionLog = {
        id: `rem-forfeit-${Date.now()}`,
        date: modalDate,
        type: 'forfeiture_infraction',
        days: -Math.abs(modalRemissionForfeiture),
        reason: `${modalTitle}: ${modalDescription}`,
        adjudicator: modalAuthority
      };
      updatedRemissionLogs = [newRemLog, ...updatedRemissionLogs];

      if (updatedSentences.length > 0) {
        updatedSentences = updatedSentences.map(s => ({
          ...s,
          remissionForfeitedDays: s.remissionForfeitedDays + modalRemissionForfeiture,
          netSentenceDays: (s.netSentenceDays || 0) + modalRemissionForfeiture
        }));
      }

      newEvent.metrics?.push({
        label: 'Remission Forfeited',
        value: `-${modalRemissionForfeiture} Days`,
        badgeColor: 'rose'
      });
    }

    // Handle reclassification stage or security changes
    if (modalCategory === 'reclassification') {
      if (modalNewStage && modalNewStage !== inmate.progressiveStage) {
        updatedStage = modalNewStage as Inmate['progressiveStage'];
        newEvent.metrics?.push({
          label: 'Stage Advanced',
          value: modalNewStage.replace('_', ' ').toUpperCase(),
          badgeColor: 'emerald'
        });
      }
      if (modalNewSecurity && modalNewSecurity !== inmate.securityCategory) {
        updatedSecurity = modalNewSecurity as Inmate['securityCategory'];
        newEvent.metrics?.push({
          label: 'Security Class',
          value: modalNewSecurity,
          badgeColor: 'indigo'
        });
      }
    }

    // Log note in Odoo chatter
    const newChatter = {
      id: `ch-${Date.now()}`,
      date: `${modalDate} ${modalTime}`,
      author: modalAuthority,
      message: `[${modalCategory.toUpperCase()}] ${modalTitle} - ${modalDescription}. Action: ${modalActionTaken || 'Recorded in institutional docket.'}`,
      type: (modalCategory === 'disciplinary' ? 'system' : 'activity') as 'system' | 'activity'
    };

    const updatedInmate: Inmate = {
      ...inmate,
      incidentTimelineEvents: updatedCustomEvents,
      remissionLogs: updatedRemissionLogs,
      sentences: updatedSentences,
      progressiveStage: updatedStage,
      securityCategory: updatedSecurity,
      chatterLogs: [newChatter, ...inmate.chatterLogs]
    };

    onUpdateInmate(updatedInmate);
    setShowAddModal(false);

    // Reset form
    setModalTitle('');
    setModalDescription('');
    setModalActionTaken('');
    setModalRemissionForfeiture(0);
    setModalNewStage('');
    setModalNewSecurity('');
    setModalMandelaRuleNote('');
  };

  // Trigger Print Dossier
  const handlePrintDossier = () => {
    window.print();
  };

  return (
    <div id="incident-timeline-view" className="space-y-6">
      {/* Top Banner & Title */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#4a2e44] text-white p-5 rounded-xl border border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-400 text-slate-950 flex items-center gap-1">
              <History className="w-3 h-3 text-slate-950" />
              Chronological Audit Trail
            </span>
            <span className="text-xs text-slate-300 font-medium">
              Inmate Incident & Intervention Dossier
            </span>
            <span className="text-[10px] text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/40">
              Prisons Act Cap 90 & Mandela Rules
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1.5 flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <span>Incident & Intervention Chronological Timeline</span>
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Consolidated longitudinal tracking of disciplinary sanctions, clinical medical care, and custody reclassifications for{' '}
            <strong className="text-white font-semibold">{inmate.firstName} {inmate.lastName}</strong>{' '}
            (<span className="font-mono text-amber-300">{inmate.bookingNumber}</span>).
          </p>
        </div>

        {/* Action Buttons: Log Incident & Print Dossier */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePrintDossier}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-600 transition-colors shadow-xs cursor-pointer"
            title="Print or export Incident Dossier"
          >
            <Printer className="w-3.5 h-3.5 text-slate-300" />
            <span>Print Dossier</span>
          </button>

          <button
            onClick={() => {
              setModalDate(new Date().toISOString().slice(0, 10));
              setShowAddModal(true);
            }}
            className="px-3.5 py-2 bg-[#714B67] hover:bg-[#5e3d55] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Log Incident / Event</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Card 1: Total Events */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold">
            <span>Total Logged Events</span>
            <History className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-mono font-extrabold text-slate-900">
              {categoryCounts.ALL}
            </span>
            <span className="text-[11px] text-slate-500">entries</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Since {inmate.admissionDate}</span>
          </div>
        </div>

        {/* Card 2: Disciplinary Sanctions & Remission Lost */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-rose-700 text-[11px] font-semibold">
            <span>Disciplinary Actions</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-mono font-extrabold text-rose-900">
              {categoryCounts.disciplinary}
            </span>
            {categoryCounts.totalRemissionDaysLost > 0 && (
              <span className="text-[11px] font-mono font-bold text-rose-600">
                (-{categoryCounts.totalRemissionDaysLost}d lost)
              </span>
            )}
          </div>
          <div className="mt-1 text-[10px] text-slate-500">
            Tribunal hearings & infractions
          </div>
        </div>

        {/* Card 3: Medical Interventions */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-teal-700 text-[11px] font-semibold">
            <span>Medical Interventions</span>
            <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-mono font-extrabold text-teal-900">
              {categoryCounts.medical}
            </span>
            <span className="text-[10px] text-teal-700 font-medium">clinical encounters</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">
            Screening, vaccines & allergies
          </div>
        </div>

        {/* Card 4: Reclassification & Stage Progress */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-indigo-700 text-[11px] font-semibold">
            <span>Current Custody Class</span>
            <Award className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-indigo-950 font-mono">
              {inmate.securityCategory} • {inmate.progressiveStage.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">
            Behavior rating: <strong className="text-slate-800 font-mono">{inmate.behaviorRating}/100</strong>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        {/* Left: Category Filter Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>All Events</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-white/20 text-current">
              {categoryCounts.ALL}
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory('disciplinary')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'disciplinary'
                ? 'bg-rose-700 text-white shadow-2xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Disciplinary Actions</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-white/20 text-current">
              {categoryCounts.disciplinary}
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory('medical')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'medical'
                ? 'bg-teal-700 text-white shadow-2xs'
                : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Medical Interventions</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-white/20 text-current">
              {categoryCounts.medical}
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory('reclassification')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'reclassification'
                ? 'bg-indigo-700 text-white shadow-2xs'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Reclassifications</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-white/20 text-current">
              {categoryCounts.reclassification}
            </span>
          </button>
        </div>

        {/* Right: Search, Severity Filter & Sort Order */}
        <div className="flex items-center gap-2">
          {/* Live Search */}
          <div className="relative flex-1 sm:w-52">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by keyword..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-[#714B67] focus:bg-white transition-all"
            />
          </div>

          {/* Severity Dropdown */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-hidden focus:border-[#714B67] cursor-pointer"
          >
            <option value="ALL">All Severities</option>
            <option value="critical">Critical / Severe</option>
            <option value="high">High Severity</option>
            <option value="moderate">Moderate</option>
            <option value="routine">Routine</option>
            <option value="positive">Positive / Merit</option>
          </select>

          {/* Sort Order Toggle */}
          <button
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
            title={sortOrder === 'desc' ? 'Currently: Newest first (Click for Oldest first)' : 'Currently: Oldest first (Click for Newest first)'}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="font-mono text-[11px] hidden sm:inline">
              {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Vertical Timeline Spine */}
      <div className="relative pl-6 sm:pl-8 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 space-y-6">
        {filteredEvents.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-500">
            <History className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
            <p className="font-semibold text-slate-700">No events matched the selected filters.</p>
            <p className="text-slate-400 mt-1">Try resetting the category filter or clearing the search keyword.</p>
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSelectedSeverity('ALL');
                setSearchQuery('');
              }}
              className="mt-3 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredEvents.map((item, index) => {
            // Category specific visual styling
            const isDisciplinary = item.category === 'disciplinary';
            const isMedical = item.category === 'medical';
            const isReclass = item.category === 'reclassification';

            const dotBg = isDisciplinary
              ? item.severity === 'critical' ? 'bg-rose-600 ring-rose-200' : 'bg-amber-500 ring-amber-200'
              : isMedical
              ? 'bg-teal-600 ring-teal-200'
              : 'bg-indigo-600 ring-indigo-200';

            const categoryBadgeBg = isDisciplinary
              ? 'bg-rose-100 text-rose-800 border-rose-200'
              : isMedical
              ? 'bg-teal-100 text-teal-800 border-teal-200'
              : 'bg-indigo-100 text-indigo-800 border-indigo-200';

            const CategoryIcon = isDisciplinary 
              ? ShieldAlert 
              : isMedical 
              ? Stethoscope 
              : TrendingUp;

            return (
              <div key={item.id} className="relative group">
                {/* Node on vertical spine */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-3.5 w-6 h-6 rounded-full flex items-center justify-center text-white ring-4 transition-transform group-hover:scale-110 shadow-xs ${dotBg}`}
                >
                  <CategoryIcon className="w-3 h-3 text-white" />
                </div>

                {/* Timeline Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs hover:border-slate-300 hover:shadow-md transition-all text-xs">
                  {/* Card Header Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Category Pill */}
                      <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] border flex items-center gap-1 ${categoryBadgeBg}`}>
                        <CategoryIcon className="w-3 h-3" />
                        <span>{item.category}</span>
                      </span>

                      {/* Event Type */}
                      <span className="text-slate-500 font-semibold text-[11px]">
                        • {item.eventType}
                      </span>

                      {/* Severity Pill */}
                      <span className={`px-2 py-0.2 rounded-full font-mono font-bold text-[9px] uppercase ${
                        item.severity === 'critical' ? 'bg-rose-600 text-white' :
                        item.severity === 'high' ? 'bg-amber-500 text-white' :
                        item.severity === 'moderate' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                        item.severity === 'positive' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {item.severity}
                      </span>

                      {item.isCustomLogged && (
                        <span className="px-1.5 py-0.2 rounded bg-purple-50 text-[#714B67] border border-purple-200 font-mono text-[9px] font-bold">
                          OFFICER LOGGED
                        </span>
                      )}
                    </div>

                    {/* Date & Time Timestamp */}
                    <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <strong className="text-slate-800">{item.date}</strong>
                      {item.time && (
                        <>
                          <Clock className="w-3 h-3 text-slate-400 ml-1" />
                          <span>{item.time}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Title & Authority */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-1 text-[11px] text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-200 shrink-0">
                      <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-medium">{item.authority}</span>
                    </div>
                  </div>

                  {/* Narrative Description */}
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Action Taken / Outcome Banner */}
                  {item.actionTaken && (
                    <div className={`mt-3 p-2.5 rounded-lg border text-xs flex items-start gap-2 ${
                      isDisciplinary 
                        ? 'bg-rose-50/70 border-rose-200 text-rose-950' 
                        : isMedical 
                        ? 'bg-teal-50/70 border-teal-200 text-teal-950'
                        : 'bg-indigo-50/70 border-indigo-200 text-indigo-950'
                    }`}>
                      <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${
                        isDisciplinary ? 'text-rose-600' : isMedical ? 'text-teal-600' : 'text-indigo-600'
                      }`} />
                      <div>
                        <strong className="font-semibold block text-[11px]">
                          {isDisciplinary ? 'Sanctions Imposed / Action Executed:' : isMedical ? 'Clinical Treatment & Prescription:' : 'Classification Outcome:'}
                        </strong>
                        <span className="text-xs">{item.actionTaken}</span>
                      </div>
                    </div>
                  )}

                  {/* Metrics Pill Grid (if any) */}
                  {item.metrics && item.metrics.length > 0 && (
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      {item.metrics.map((met, mIdx) => (
                        <div
                          key={mIdx}
                          className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 flex items-center gap-1.5"
                        >
                          <span className="text-slate-500 text-[10px] uppercase font-semibold">{met.label}:</span>
                          <span className={`font-mono font-bold text-xs ${
                            met.badgeColor === 'rose' ? 'text-rose-700' :
                            met.badgeColor === 'emerald' ? 'text-emerald-700' :
                            met.badgeColor === 'indigo' ? 'text-indigo-700' :
                            met.badgeColor === 'teal' ? 'text-teal-700' :
                            'text-slate-800'
                          }`}>
                            {met.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Mandela Rules Compliance Check Box */}
                  {item.mandelaRuleCompliance && (
                    <div className="mt-3 p-2 rounded bg-cyan-50/70 border border-cyan-200 text-[11px] text-cyan-950 flex items-start gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-cyan-700 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold text-cyan-900">
                          Mandela Standards Verification ({item.mandelaRuleCompliance.ruleNumber}):
                        </strong>{' '}
                        <span>{item.mandelaRuleCompliance.note}</span>
                      </div>
                    </div>
                  )}

                  {/* Tags and Location Footer */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {item.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-1 text-slate-400 font-medium">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      <span>{item.facilityName}</span>
                      {item.cellLocation && (
                        <>
                          <span>•</span>
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{item.cellLocation}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: Log New Incident / Intervention */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-[#4a2e44] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Record Incident, Clinical Care, or Reclassification</h3>
                  <p className="text-xs text-slate-300">
                    Official entry for {inmate.firstName} {inmate.lastName} ({inmate.bookingNumber})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveNewEvent} className="p-5 space-y-4 text-xs">
              {/* Category Selector Tabs */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Event Category <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setModalCategory('disciplinary');
                      setModalEventType('Contraband Possession');
                    }}
                    className={`p-2.5 rounded-lg border text-center font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      modalCategory === 'disciplinary'
                        ? 'bg-rose-50 border-rose-400 text-rose-800 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>Disciplinary Action</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setModalCategory('medical');
                      setModalEventType('Clinical Examination');
                    }}
                    className={`p-2.5 rounded-lg border text-center font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      modalCategory === 'medical'
                        ? 'bg-teal-50 border-teal-400 text-teal-800 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Stethoscope className="w-4 h-4 text-teal-600" />
                    <span>Medical Intervention</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setModalCategory('reclassification');
                      setModalEventType('Progressive Stage Review');
                    }}
                    className={`p-2.5 rounded-lg border text-center font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      modalCategory === 'reclassification'
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-800 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    <span>Reclassification</span>
                  </button>
                </div>
              </div>

              {/* Title & Specific Event Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Event Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={modalTitle}
                    onChange={(e) => setModalTitle(e.target.value)}
                    placeholder={
                      modalCategory === 'disciplinary'
                        ? 'e.g., Unauthorized Cell Phone Confiscation'
                        : modalCategory === 'medical'
                        ? 'e.g., Acute Asthma Treatment & Inhaler Dispensation'
                        : 'e.g., Stage 3 Advanced Vocational Promotion'
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-[#714B67] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Specific Sub-Type
                  </label>
                  <select
                    value={modalEventType}
                    onChange={(e) => setModalEventType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-[#714B67] focus:bg-white cursor-pointer"
                  >
                    {modalCategory === 'disciplinary' ? (
                      <>
                        <option value="Contraband Possession">Contraband Possession (SIM/Phone/Drugs)</option>
                        <option value="Physical Altercation">Physical Altercation / Mutual Fighting</option>
                        <option value="Insubordination">Insubordination to Prison Staff</option>
                        <option value="Refusal of Order">Refusal of Muster / Work Order</option>
                        <option value="Property Damage">Intentional Damage to Institutional Property</option>
                        <option value="Illicit Barter">Illicit Commissary Barter / Gambling</option>
                        <option value="Solitary Segregation">Disciplinary Segregation Order</option>
                      </>
                    ) : modalCategory === 'medical' ? (
                      <>
                        <option value="Clinical Examination">Physician Consultation / Sick Bay</option>
                        <option value="Emergency Trauma">Emergency Medical Trauma Treatment</option>
                        <option value="Respiratory Therapy">Respiratory / Asthma Inhalation Care</option>
                        <option value="Psychiatric Consultation">Psychiatric / Mental Health Evaluation</option>
                        <option value="Vaccination Administration">Vaccination / Immunization Booster</option>
                        <option value="Medical Isolation">Communicable Disease Isolation</option>
                        <option value="Hospital Escort">External Hospital Emergency Escort</option>
                      </>
                    ) : (
                      <>
                        <option value="Progressive Stage Promotion">Progressive Stage Promotion</option>
                        <option value="Progressive Stage Demotion">Progressive Stage Demotion</option>
                        <option value="Security Category Elevation">Security Elevation (e.g. CAT B → CAT A)</option>
                        <option value="Security Category Downgrade">Security De-escalation (e.g. CAT A → CAT B)</option>
                        <option value="Cell Tier Reallocation">Cell Block / Tier Housing Reassignment</option>
                        <option value="Work Privilege Restoration">Rehabilitation Work Privilege Restoration</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Date, Time & Severity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Event Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={modalDate}
                    onChange={(e) => setModalDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-hidden focus:border-[#714B67] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Time (24-hr)
                  </label>
                  <input
                    type="text"
                    value={modalTime}
                    onChange={(e) => setModalTime(e.target.value)}
                    placeholder="14:30"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-hidden focus:border-[#714B67] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Severity Level
                  </label>
                  <select
                    value={modalSeverity}
                    onChange={(e) => setModalSeverity(e.target.value as IncidentSeverity)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-[#714B67] focus:bg-white cursor-pointer"
                  >
                    <option value="routine">Routine</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High Severity</option>
                    <option value="critical">Critical / Emergency</option>
                    <option value="positive">Positive / Merit</option>
                  </select>
                </div>
              </div>

              {/* Description & Narrative */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Incident Narrative / Clinical Findings <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={modalDescription}
                  onChange={(e) => setModalDescription(e.target.value)}
                  placeholder="Provide precise factual description of circumstances, items found, symptoms evaluated, or board reasons..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-[#714B67] focus:bg-white"
                />
              </div>

              {/* Action Taken / Penalty / Treatment Prescribed */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Action Taken / Penalty / Care Rendered
                  </label>
                  <input
                    type="text"
                    value={modalActionTaken}
                    onChange={(e) => setModalActionTaken(e.target.value)}
                    placeholder="e.g., Sentenced to 14 days remission loss & 3 days segregation"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-[#714B67] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Authorizing Officer / Medical Doctor / Board
                  </label>
                  <input
                    type="text"
                    value={modalAuthority}
                    onChange={(e) => setModalAuthority(e.target.value)}
                    placeholder="e.g., Dr. Sarah Nduta, MD / Disciplinary Board"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-[#714B67] focus:bg-white"
                  />
                </div>
              </div>

              {/* Category-Specific Modifiers */}
              {modalCategory === 'disciplinary' && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-900 flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-rose-700" />
                      Statutory Remission Penalty Deduction:
                    </span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="90"
                        value={modalRemissionForfeiture}
                        onChange={(e) => setModalRemissionForfeiture(parseInt(e.target.value, 10) || 0)}
                        className="w-20 px-2 py-1 bg-white border border-rose-300 rounded text-xs font-mono font-bold text-rose-700 text-center"
                      />
                      <span className="text-rose-800 font-semibold">Days</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-rose-700">
                    If greater than 0, automatically appends a formal forfeiture entry to inmate's Remission Ledger and updates earliest release calculation.
                  </p>
                </div>
              )}

              {modalCategory === 'reclassification' && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-indigo-900 mb-1">
                      Update Progressive Stage:
                    </label>
                    <select
                      value={modalNewStage}
                      onChange={(e) => setModalNewStage(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-indigo-300 rounded text-xs font-semibold text-indigo-900"
                    >
                      <option value="">Keep Current ({inmate.progressiveStage})</option>
                      <option value="stage_1">Stage 1: Strict Induction Custody</option>
                      <option value="stage_2">Stage 2: Standard Custody</option>
                      <option value="stage_3">Stage 3: Advanced Vocational</option>
                      <option value="stage_4">Stage 4: Pre-Release Special Trust</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-indigo-900 mb-1">
                      Update Security Category:
                    </label>
                    <select
                      value={modalNewSecurity}
                      onChange={(e) => setModalNewSecurity(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-indigo-300 rounded text-xs font-semibold text-indigo-900"
                    >
                      <option value="">Keep Current ({inmate.securityCategory})</option>
                      <option value="CAT_A">CAT A: Maximum Supermax</option>
                      <option value="CAT_B">CAT B: High Security</option>
                      <option value="CAT_C">CAT C: Medium Security</option>
                      <option value="CAT_D">CAT D: Minimum / Open Camp Trust</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Nelson Mandela Rule Note */}
              <div>
                <label className="block font-semibold text-slate-600 mb-1">
                  Human Rights / Mandela Rules Safeguard Notes (Optional)
                </label>
                <input
                  type="text"
                  value={modalMandelaRuleNote}
                  onChange={(e) => setModalMandelaRuleNote(e.target.value)}
                  placeholder="e.g., Mandatory medical review conducted daily; physical restraints not used as sanction"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-[#714B67] focus:bg-white"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#714B67] hover:bg-[#5e3d55] text-white rounded-lg font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Commit to Incident Dossier</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
