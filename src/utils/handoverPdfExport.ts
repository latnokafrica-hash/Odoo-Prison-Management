import { jsPDF } from 'jspdf';
import { ShiftHandoverBriefData, Language } from '../types';
import { INITIAL_HANDOVER_NOTES } from '../data/handoverNotesData';

export function generateHandoverPdf(handover: ShiftHandoverBriefData, language: Language = 'en') {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const isFr = language === 'fr';
  let y = 18;

  // Header band
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(
    isFr ? 'ADMINISTRATION PÉNITENTIAIRE NATIONALE - PROCÈS-VERBAL DE RELÈVE' : 'KENYA PRISONS SERVICE - DIGITAL SHIFT HANDOVER BRIEF',
    14,
    11
  );

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(
    `${isFr ? 'RÉFÉRENCE :' : 'REF :'} ${handover.referenceNumber}  |  ${handover.facilityName.toUpperCase()}  |  ${handover.date}`,
    14,
    18
  );

  y = 32;

  // Subheader: Shift Transition & Status
  doc.setFillColor(241, 245, 249); // slate-100
  doc.roundedRect(14, y, 182, 14, 2, 2, 'F');
  
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  const shiftText = `${isFr ? 'QUART CÉDANT :' : 'RELIEVED SHIFT :'} ${handover.outgoingShift.toUpperCase()}  -->  ${isFr ? 'QUART PRENANT :' : 'RELIEVING SHIFT :'} ${handover.incomingShift.toUpperCase()}`;
  doc.text(shiftText, 18, y + 6);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const statusLabel = `${isFr ? 'STATUT HOMOLOGUÉ :' : 'CERTIFIED STATUS :'} ${handover.status.toUpperCase()} | ${isFr ? 'Vérifié double signature' : 'Two-officer verified'}`;
  doc.text(statusLabel, 18, y + 11);

  y += 20;

  // SECTION 1: CUSTODY HEADCOUNT RECONCILIATION
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(isFr ? '1. RÉCONCILIATION DES EFFECTIFS DÉTENUS (APPEL PHYSIQUE)' : '1. INMATE HEADCOUNT & ROLL RECONCILIATION', 14, y);
  y += 4;

  const hc = handover.headcountSummary;
  const colW = 43;
  const metrics = [
    { label: isFr ? 'Total Détenus' : 'Total Inmates', value: `${hc.totalInmates} / ${hc.certifiedCapacity}` },
    { label: isFr ? 'Prévenus / Remand' : 'Remand Detainees', value: `${hc.remandCount}` },
    { label: isFr ? 'Haute Sécurité CAT A' : 'High Threat CAT A', value: `${hc.highSecurityCount}` },
    { label: isFr ? 'Écart d\'Appel' : 'Discrepancy', value: hc.rollCallDiscrepancy === 0 ? '0 (100% OK)' : `${hc.rollCallDiscrepancy} MISMATCH` }
  ];

  metrics.forEach((m, i) => {
    const x = 14 + i * (colW + 3);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, colW, 13, 1, 1, 'FD');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, x + 3, y + 4.5);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(m.value, x + 3, y + 10);
  });

  y += 18;

  // SECTION 2: SITUATIONAL FACILITY RISKS
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(isFr ? '2. REGISTRE DES RISQUES & VIGILANCE IMMÉDIATE' : '2. ACTIVE FACILITY RISKS & THREAT DIRECTIVES', 14, y);
  y += 4;

  const topRisks = handover.risks.slice(0, 4);
  topRisks.forEach((r, i) => {
    doc.setFillColor(r.severity === 'CRITICAL' ? 254 : 255, r.severity === 'CRITICAL' ? 242 : 251, r.severity === 'CRITICAL' ? 242 : 235);
    doc.setDrawColor(r.severity === 'CRITICAL' ? 254 : 251, r.severity === 'CRITICAL' ? 202 : 191, r.severity === 'CRITICAL' ? 202 : 36);
    doc.roundedRect(14, y, 182, 12, 1, 1, 'FD');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(r.severity === 'CRITICAL' ? 190 : 180, r.severity === 'CRITICAL' ? 18 : 83, r.severity === 'CRITICAL' ? 60 : 9);
    doc.text(`[${r.severity}] ${r.title} (${r.location})`, 18, y + 4.5);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const desc = `${r.description.substring(0, 95)}...`;
    doc.text(desc, 18, y + 8.5);

    const ackText = r.isAcknowledgedByIncoming ? (isFr ? 'VISÉ PAR PRENANT' : 'ACKNOWLEDGED') : (isFr ? 'NON VISÉ' : 'PENDING ACK');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(r.isAcknowledgedByIncoming ? 22 : 185, r.isAcknowledgedByIncoming ? 101 : 28, r.isAcknowledgedByIncoming ? 52 : 28);
    doc.text(ackText, 160, y + 4.5);

    y += 14;
  });

  if (handover.risks.length > 4) {
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139);
    doc.text(`+ ${handover.risks.length - 4} ${isFr ? 'autres risques enregistrés dans la main courante numérique.' : 'additional risks logged in digital occurrence book.'}`, 18, y);
    y += 4;
  }

  y += 4;

  // SECTION 3: PENDING DIRECTIVES & TASKS
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(isFr ? '3. DIRECTIVES & TÂCHES OPÉRATIONNELLES EN COURS' : '3. PENDING OPERATIONAL DIRECTIVES & TASKS', 14, y);
  y += 4;

  const topTasks = handover.tasks.slice(0, 3);
  topTasks.forEach(t => {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, y, 182, 10, 1, 1, 'FD');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`[${t.dueTime}] ${t.title}`, 18, y + 4.5);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`${isFr ? 'Assigné :' : 'Assignee :'} ${t.assignedOfficer} (${t.assignedRole}) | ${t.description.substring(0, 75)}`, 18, y + 8);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(t.status === 'completed' ? 16 : 194, t.status === 'completed' ? 185 : 65, t.status === 'completed' ? 129 : 12);
    doc.text(t.status.toUpperCase(), 165, y + 4.5);

    y += 12;
  });

  y += 4;

  // SECTION 4: EQUIPMENT & ARMORY SUMMARY
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(isFr ? '4. CONTRÔLE CONJOINT ARMURERIE & SÉCURITÉ CLÉS' : '4. ARMORY & SECURITY KEYS CONJOINT AUDIT', 14, y);
  y += 4;

  const topEq = handover.equipment.slice(0, 4);
  topEq.forEach(e => {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, y, 182, 9, 1, 1, 'FD');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${e.name} (${e.storageLocation})`, 18, y + 4);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`${isFr ? 'Prévu :' : 'Exp :'} ${e.expectedQty} | ${isFr ? 'Dénombré :' : 'Count :'} ${e.countedQty} ${e.unit} | ${isFr ? 'État :' : 'Cond :'} ${e.condition.toUpperCase()}`, 18, y + 7.5);

    const isMatch = e.expectedQty === e.countedQty;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(isMatch ? 22 : 225, isMatch ? 101 : 29, isMatch ? 52 : 72);
    doc.text(isMatch ? 'VERIFIED' : 'VARIANCE', 165, y + 5);

    y += 10.5;
  });

  // Footer stamp Page 1
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(148, 163, 184);
  doc.text(
    `CONFIDENTIAL - OFFICIAL CORRECTIONAL BRIEFING RECORD (PAGE 1/2) - GENERATED VIA ODOO 19 CORRECTIONS ERP`,
    14,
    290
  );

  // PAGE 2: STRUCTURED HANDOVER NOTES & DIGITAL SIGN-OFFS
  doc.addPage();
  
  // Header band Page 2
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 20, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(
    isFr ? 'CONSIGNES DE RELÈVE, MAINTENANCE & DIRECTIVES DE SURVEILLANCE' : 'STRUCTURED SHIFT HANDOVER NOTES & WATCH DIRECTIVES',
    14,
    9
  );

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(
    `${isFr ? 'RÉF :' : 'REF :'} ${handover.referenceNumber} | ${handover.facilityName.toUpperCase()} | ${isFr ? 'PAGE 2 SUR 2' : 'PAGE 2 OF 2'}`,
    14,
    15
  );

  y = 28;

  // SECTION 5: SHIFT HANDOVER NOTES
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(
    isFr ? '5. CONSIGNES OPÉRATIONNELLES DU COMMANDANT SORTANT' : '5. OUTGOING COMMANDER STRUCTURED OPERATIONAL DIRECTIVES',
    14,
    y
  );
  y += 5;

  const notesList = (handover.handoverNotes || INITIAL_HANDOVER_NOTES).slice(0, 6);
  notesList.forEach(note => {
    const isWatch = note.category === 'inmate_watch';
    const isMaint = note.category === 'maintenance';
    const isBehav = note.category === 'unusual_behavior';

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, y, 182, 24, 1.5, 1.5, 'FD');

    // Header inside card
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`[${note.urgency.toUpperCase()}] ${note.title.substring(0, 60)}`, 18, y + 5);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`${note.location} | ${note.timestamp} | ${note.authorCommander} (${note.authorBadge})`, 18, y + 9);

    // Body
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);
    doc.text(`${note.content.substring(0, 110)}...`, 18, y + 13.5);

    // Specialized banner
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    if (isWatch && note.inmateWatchDetails) {
      doc.setTextColor(190, 18, 60);
      doc.text(
        `>> INMATE WATCH: ${note.inmateWatchDetails.inmateName} (${note.inmateWatchDetails.inmateId}) | Level: ${note.inmateWatchDetails.watchLevel} (${note.inmateWatchDetails.watchIntervalMinutes}m) | ${note.inmateWatchDetails.specialInstructions.substring(0, 70)}`,
        18,
        y + 18
      );
    } else if (isMaint && note.maintenanceDetails) {
      doc.setTextColor(180, 83, 9);
      doc.text(
        `>> MAINTENANCE: Asset: ${note.maintenanceDetails.equipmentOrAsset} | Trade: ${note.maintenanceDetails.trade} | WO: ${note.maintenanceDetails.workOrderRef} | Contractor: ${note.maintenanceDetails.contractorAccessRequired ? 'YES' : 'NO'}`,
        18,
        y + 18
      );
    } else if (isBehav && note.behaviorDetails) {
      doc.setTextColor(109, 40, 217);
      doc.text(
        `>> ANOMALY: Pattern: ${note.behaviorDetails.behaviorType} | Response: ${note.behaviorDetails.recommendedResponse.substring(0, 75)}`,
        18,
        y + 18
      );
    } else {
      doc.setTextColor(71, 85, 105);
      doc.text(`>> DIRECTIVE: Logged for incoming watch shift compliance.`, 18, y + 18);
    }

    // Visa stamp
    const ackLabel = note.isAcknowledgedByIncoming 
      ? (isFr ? `VISÉ PAR PRENANT (${note.acknowledgedBy || 'Commandant'})` : `ACKNOWLEDGED BY INCOMING`) 
      : (isFr ? 'EN ATTENTE DE VISA' : 'PENDING VISA');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(note.isAcknowledgedByIncoming ? 22 : 185, note.isAcknowledgedByIncoming ? 101 : 28, note.isAcknowledgedByIncoming ? 52 : 28);
    doc.text(ackLabel, 135, y + 5);

    y += 26;
  });

  y += 4;

  // SECTION 6: SIGNATURES & COMMAND RATIFICATION
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(isFr ? '6. ATTESTATIONS LÉGALES & SIGNATURES NUMÉRIQUES' : '6. STATUTORY ATTESTATION & DIGITAL COMMAND SIGN-OFFS', 14, y);
  y += 4;

  const sigBoxW = 58;
  const sigs = [
    {
      role: isFr ? 'Commandant Sortant' : 'Outgoing Commander',
      name: handover.outgoingSignOff?.commanderName || (isFr ? 'Non signé' : 'Unsigned'),
      rank: handover.outgoingSignOff ? `${handover.outgoingSignOff.rank} - #${handover.outgoingSignOff.badgeNumber}` : '',
      date: handover.outgoingSignOff?.signedAt || '-'
    },
    {
      role: isFr ? 'Commandant Prenant' : 'Incoming Commander',
      name: handover.incomingSignOff?.commanderName || (isFr ? 'Non signé' : 'Unsigned'),
      rank: handover.incomingSignOff ? `${handover.incomingSignOff.rank} - #${handover.incomingSignOff.badgeNumber}` : '',
      date: handover.incomingSignOff?.signedAt || '-'
    },
    {
      role: isFr ? 'Directeur / Gouverneur' : 'Superintendent / Governor',
      name: handover.governorSignOff?.commanderName || (isFr ? 'Non visé' : 'Uncertified'),
      rank: handover.governorSignOff?.rank || '',
      date: handover.governorSignOff?.signedAt || '-'
    }
  ];

  sigs.forEach((s, idx) => {
    const x = 14 + idx * (sigBoxW + 4);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(x, y, sigBoxW, 20, 1, 1, 'FD');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text(s.role, x + 3, y + 4.5);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(s.name, x + 3, y + 9.5);

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(s.rank, x + 3, y + 13.5);
    doc.text(s.date, x + 3, y + 17.5);
  });

  // Footer stamp Page 2
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(148, 163, 184);
  doc.text(
    `CONFIDENTIAL - OFFICIAL CORRECTIONAL BRIEFING RECORD (PAGE 2/2) - GENERATED ON ${new Date().toLocaleString()}`,
    14,
    290
  );

  const fileName = `Shift_Handover_Brief_${handover.referenceNumber.replace(/[\/\\]/g, '_')}.pdf`;
  doc.save(fileName);
}
