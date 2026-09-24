// Tamper-Evident Security Incident & Handover Audit Logger
// Implements cryptographic SHA-256 hash-chaining for immutable administrative oversight

import { SecurityIncidentAuditEntry, SecurityAuditActionCategory, SecurityAuditSeverity } from '../types';

export const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

// Pure TypeScript standard SHA-256 implementation for synchronous, tamper-evident hash chaining
export function sha256Sync(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const lengthProperty = 'length';
  let i = 0, j = 0; // Used as a counter across the whole file
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii[lengthProperty] * 8;

  // Initial hash value: first 32 bits of the fractional parts of the square roots of the first 8 primes
  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  // First 32 bits of the fractional parts of the cube roots of the first 64 primes 2..311
  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  let compositeClearance = 0;
  for (let candidate = 2; compositeClearance < 64; candidate++) {
    let isPrime = true;
    for (let factor = 2; factor * factor <= candidate; factor++) {
      if (candidate % factor === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) {
      compositeClearance++;
    }
  }

  words[asciiBitLength >> 5] |= 0x80 << (24 - (asciiBitLength % 32));
  words[(((asciiBitLength + 64) >> 9) << 4) + 15] = asciiBitLength;

  for (i = 0; i < ascii[lengthProperty]; i++) {
    const code = ascii.charCodeAt(i);
    words[i >> 2] |= code << (24 - (i % 4) * 8);
  }

  for (let blockIndex = 0; blockIndex < words[lengthProperty]; blockIndex += 16) {
    const w: number[] = [];
    for (i = 0; i < 16; i++) {
      w[i] = words[blockIndex + i] || 0;
    }
    for (i = 16; i < 64; i++) {
      const s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = ((w[i - 16] + s0) + (w[i - 7] + s1)) | 0;
    }

    let a = hash[0];
    let b = hash[1];
    let c = hash[2];
    let d = hash[3];
    let e = hash[4];
    let f = hash[5];
    let g = hash[6];
    let h = hash[7];

    for (i = 0; i < 64; i++) {
      const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + k[i] + w[i]) | 0;
      const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    hash[0] = (hash[0] + a) | 0;
    hash[1] = (hash[1] + b) | 0;
    hash[2] = (hash[2] + c) | 0;
    hash[3] = (hash[3] + d) | 0;
    hash[4] = (hash[4] + e) | 0;
    hash[5] = (hash[5] + f) | 0;
    hash[6] = (hash[6] + g) | 0;
    hash[7] = (hash[7] + h) | 0;
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }

  return result;
}

// Compute the immutable SHA-256 seal for an audit entry
export function computeAuditEntryHash(
  entry: Omit<SecurityIncidentAuditEntry, 'entryHash' | 'isVerifiedIntegrity'>
): string {
  const canonicalString = [
    entry.prevHash,
    entry.sequenceNumber,
    entry.isoTimestamp,
    entry.actionCategory,
    entry.actionName,
    entry.actorBadge,
    entry.entityType,
    entry.entityId || 'null',
    entry.changeSummary,
    entry.previousValue || '',
    entry.newValue || '',
    entry.severity,
  ].join('||');

  return sha256Sync(canonicalString);
}

// Create a new audit entry cryptographically chained to the previous entry
export function createAuditEntry(
  prevEntry: SecurityIncidentAuditEntry | null,
  params: {
    actionCategory: SecurityAuditActionCategory;
    actionName: string;
    actorName: string;
    actorBadge: string;
    actorRole: string;
    ipOrTerminalId?: string;
    entityId?: string;
    entityType: string;
    previousValue?: string;
    newValue?: string;
    changeSummary: string;
    severity?: SecurityAuditSeverity;
    timestamp?: string;
    isoTimestamp?: string;
  }
): SecurityIncidentAuditEntry {
  const seq = prevEntry ? prevEntry.sequenceNumber + 1 : 1;
  const prevHash = prevEntry ? prevEntry.entryHash : GENESIS_HASH;
  const now = new Date();
  const timestamp = params.timestamp || now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const isoTimestamp = params.isoTimestamp || now.toISOString();

  const draft: Omit<SecurityIncidentAuditEntry, 'entryHash' | 'isVerifiedIntegrity'> = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    sequenceNumber: seq,
    timestamp,
    isoTimestamp,
    actionCategory: params.actionCategory,
    actionName: params.actionName,
    actorName: params.actorName,
    actorBadge: params.actorBadge,
    actorRole: params.actorRole,
    ipOrTerminalId: params.ipOrTerminalId || 'TERM-CTRL-01 (10.240.12.44)',
    entityId: params.entityId,
    entityType: params.entityType,
    previousValue: params.previousValue,
    newValue: params.newValue,
    changeSummary: params.changeSummary,
    severity: params.severity || 'routine',
    prevHash,
  };

  const entryHash = computeAuditEntryHash(draft);

  return {
    ...draft,
    entryHash,
    isVerifiedIntegrity: true,
  };
}

// Validate the entire audit chain integrity
export function validateAuditChain(chain: SecurityIncidentAuditEntry[]): {
  isValid: boolean;
  brokenIndex: number | null;
  totalVerified: number;
  failureReason?: string;
} {
  if (!chain || chain.length === 0) {
    return { isValid: true, brokenIndex: null, totalVerified: 0 };
  }

  for (let i = 0; i < chain.length; i++) {
    const current = chain[i];

    // Check sequence monotonic increase
    if (current.sequenceNumber !== i + 1) {
      return {
        isValid: false,
        brokenIndex: i,
        totalVerified: i,
        failureReason: `Sequence gap detected at index ${i}: expected #${i + 1}, found #${current.sequenceNumber}`,
      };
    }

    // Check link to previous hash
    const expectedPrevHash = i === 0 ? GENESIS_HASH : chain[i - 1].entryHash;
    if (current.prevHash !== expectedPrevHash) {
      return {
        isValid: false,
        brokenIndex: i,
        totalVerified: i,
        failureReason: `Hash link broken at sequence #${current.sequenceNumber}. Previous hash mismatch.`,
      };
    }

    // Recompute current entry hash
    const recalculatedHash = computeAuditEntryHash(current);
    if (current.entryHash !== recalculatedHash) {
      return {
        isValid: false,
        brokenIndex: i,
        totalVerified: i,
        failureReason: `Cryptographic payload tampering detected at sequence #${current.sequenceNumber}. Stored hash does not match recalculated hash.`,
      };
    }
  }

  return {
    isValid: true,
    brokenIndex: null,
    totalVerified: chain.length,
  };
}

// Generate rich initial seed audit history for existing sessions
export function createInitialAuditTrail(facilityName = 'Kalyan Central Maximum Security Penitentiary'): SecurityIncidentAuditEntry[] {
  const trail: SecurityIncidentAuditEntry[] = [];
  const baseTime = new Date();
  baseTime.setHours(6, 0, 0, 0);

  const addSeed = (params: Parameters<typeof createAuditEntry>[1], minuteOffset: number) => {
    const t = new Date(baseTime.getTime() + minuteOffset * 60000);
    const prev = trail.length > 0 ? trail[trail.length - 1] : null;
    const entry = createAuditEntry(prev, {
      ...params,
      timestamp: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      isoTimestamp: t.toISOString(),
    });
    trail.push(entry);
  };

  // Block #1: Genesis Session Initialization
  addSeed({
    actionCategory: 'session_lifecycle',
    actionName: 'Handover Session Initialized (Genesis Block)',
    actorName: 'Capt. Marcus Vance',
    actorBadge: 'KP-8421',
    actorRole: 'Outgoing Watch Commander',
    ipOrTerminalId: 'TERM-CTRL-01 (10.240.12.44)',
    entityType: 'ShiftHandoverBriefData',
    entityId: 'hob-2026-09-19-day',
    previousValue: 'N/A (Genesis State)',
    newValue: 'Session Active [Draft]',
    changeSummary: `Initialized official shift handover register for Morning Duty shift at ${facilityName}. Reference: SEC/HOB/2026/09/001.`,
    severity: 'routine',
  }, 0);

  // Block #2: Headcount Reconciliation
  addSeed({
    actionCategory: 'headcount_reconciliation',
    actionName: 'Master Physical Roll Call Reconciliation',
    actorName: 'Capt. Marcus Vance',
    actorBadge: 'KP-8421',
    actorRole: 'Outgoing Watch Commander',
    ipOrTerminalId: 'TERM-CTRL-01 (10.240.12.44)',
    entityType: 'HeadcountSummary',
    previousValue: 'Unverified (Previous Night Count 849)',
    newValue: '850 Inmates Physically Accounted (0 Discrepancy)',
    changeSummary: 'Conducted mandatory zero-movement muster. Certified capacity: 800 | Count: 850 (220 Remand, 630 Convicted, 42 High-Sec, 6 Solitary, 14 Hospital, 4 Court). Discrepancy: 0.',
    severity: 'routine',
  }, 15);

  // Block #3: Critical Armory & Security Keys Clearance
  addSeed({
    actionCategory: 'inventory_armory',
    actionName: 'Armory Master Key Vault & Lethal Firearms Clearance',
    actorName: 'Lt. Sarah Jenkins',
    actorBadge: 'KP-9102',
    actorRole: 'Armory Custody Officer',
    ipOrTerminalId: 'TERM-ARMORY-02 (10.240.14.12)',
    entityType: 'EquipmentInventoryItem',
    entityId: 'eq-01',
    previousValue: 'Pending Custodial Dual-Sign',
    newValue: 'Verified (Counted: 48, Expected: 48)',
    changeSummary: 'Master Key Brass Ring Set (Ring A1-A8) physically verified in pegboard lockbox. No broken tethers, zero unauthorized duplicates logged.',
    severity: 'elevated',
  }, 30);

  // Block #4: Risk Assessment Logged
  addSeed({
    actionCategory: 'risk_assessment',
    actionName: 'High Escape-Risk Inmate Classified (CAT A)',
    actorName: 'Capt. Marcus Vance',
    actorBadge: 'KP-8421',
    actorRole: 'Outgoing Watch Commander',
    ipOrTerminalId: 'TERM-CTRL-01 (10.240.12.44)',
    entityType: 'FacilityRiskItem',
    entityId: 'risk-01',
    previousValue: 'Standard Tier Watch',
    newValue: 'CRITICAL ESCAPE RISK (30-min Bed Check)',
    changeSummary: 'Logged inmate #KP-8821 in Cell A-04 under mandatory continuous electronic PTZ camera watch and secondary magnetic deadbolt protocol.',
    severity: 'critical',
  }, 45);

  // Block #5: Mechanical Lock Fault Logged
  addSeed({
    actionCategory: 'risk_assessment',
    actionName: 'Motorized Lock & Deadbolt Sensor Variance',
    actorName: 'Sgt. Daniel Kiprop',
    actorBadge: 'KP-7734',
    actorRole: 'Tier 1 Floor Supervisor',
    ipOrTerminalId: 'TERM-WING-B-01 (10.240.13.08)',
    entityType: 'FacilityRiskItem',
    entityId: 'risk-02',
    previousValue: 'Operational',
    newValue: 'HIGH SEVERITY LOCK FAULT',
    changeSummary: 'Cell B-12 slam-lock sensor intermittently signaling open state on Central Control console. Manual Abloy padlock applied as physical fail-safe.',
    severity: 'elevated',
  }, 75);

  // Block #6: Contraband Weapon Confiscated
  addSeed({
    actionCategory: 'contraband_evidence',
    actionName: 'Lethal Weapon Confiscated & Chain-of-Custody Sealed',
    actorName: 'Officer Michael Kiprono',
    actorBadge: 'KP-7892',
    actorRole: 'Courtyard Tactical Search Officer',
    ipOrTerminalId: 'TERM-EVID-VAULT (10.240.15.02)',
    entityType: 'ContrabandItem',
    entityId: 'cnt-01',
    previousValue: 'Undetected in Yard',
    newValue: 'Confiscated & Vaulted (Seal #EVD-2026-0842)',
    changeSummary: 'Seized 7-inch ceramic blade with taped nylon handle from Inmate J. Marwa in Yard Quadrant 2. Logged under Critical Lethal severity; chain-of-custody sealed.',
    severity: 'critical',
  }, 110);

  // Block #7: QR Code Equipment Asset Audit
  addSeed({
    actionCategory: 'inventory_armory',
    actionName: 'QR Code Optical Hardware Scan Verified',
    actorName: 'Capt. Marcus Vance',
    actorBadge: 'KP-8421',
    actorRole: 'Outgoing Watch Commander',
    ipOrTerminalId: 'MOBILE-SCAN-04 (10.240.16.88)',
    entityType: 'EquipmentInventoryItem',
    entityId: 'eq-04',
    previousValue: 'Last Inspected: Yesterday 18:00',
    newValue: 'QR Verified (Serial #HK-MP5-90412)',
    changeSummary: 'Scanned optical QR code on Armory Submachine Gun HK-MP5-90412. Firing pin, safety selector, and magazine retention verified 100% operational.',
    severity: 'routine',
  }, 150);

  // Block #8: Meteorological & Visibility Alert
  addSeed({
    actionCategory: 'meteorological',
    actionName: 'Meteorological Hazard Advisory Ratified',
    actorName: 'Capt. Marcus Vance',
    actorBadge: 'KP-8421',
    actorRole: 'Outgoing Watch Commander',
    ipOrTerminalId: 'TERM-CTRL-01 (10.240.12.44)',
    entityType: 'WeatherData',
    entityId: 'K-PEN-MET-SENSOR-01',
    previousValue: 'Clear Weather Profile',
    newValue: 'Dense Autumn Fog (< 1.0 km Visibility)',
    changeSummary: 'Ratified tactical weather directive: Visibility 0.8 km. Outdoor courtyard recreation suspended. Watchtower searchlights activated continuously.',
    severity: 'elevated',
  }, 185);

  // Block #9: Mandatory Security Task Created
  addSeed({
    actionCategory: 'custodial_tasks',
    actionName: 'Emergency Perimeter Culvert Patrol Assigned',
    actorName: 'Capt. Marcus Vance',
    actorBadge: 'KP-8421',
    actorRole: 'Outgoing Watch Commander',
    ipOrTerminalId: 'TERM-CTRL-01 (10.240.12.44)',
    entityType: 'PendingTaskItem',
    entityId: 'task-01',
    previousValue: 'N/A',
    newValue: 'Assigned: High Priority (Due 16:00)',
    changeSummary: 'Assigned K-9 and thermal FLIR patrol along North perimeter drainage culvert during low-visibility weather window.',
    severity: 'elevated',
  }, 220);

  // Block #10: Outgoing Commander Digital Sign-Off
  addSeed({
    actionCategory: 'digital_signatures',
    actionName: 'Outgoing Watch Commander Official Declaration Signed',
    actorName: 'Capt. Marcus Vance',
    actorBadge: 'KP-8421',
    actorRole: 'Outgoing Watch Commander',
    ipOrTerminalId: 'TERM-CTRL-01 (10.240.12.44)',
    entityType: 'CommanderSignOff',
    entityId: 'sign-outgoing-8421',
    previousValue: 'Unsigned [Draft]',
    newValue: 'Outgoing Signed & Sealed',
    changeSummary: 'Commander Vance executed digital signature oath certifying headcount, armory key ledger, and critical risks under penalty of custodial perjury.',
    severity: 'critical',
  }, 240);

  return trail;
}

// Generate plain text export transcript for prison inspectorate
export function generateAuditCertificateText(
  handoverRef: string,
  facilityName: string,
  entries: SecurityIncidentAuditEntry[],
  verificationResult: { isValid: boolean; totalVerified: number }
): string {
  const now = new Date().toISOString();
  const header = `================================================================================
CORRECTIONAL FACILITIES REGULATORY AUTHORITY - PRISON OVERSIGHT AUDIT
TAMPER-EVIDENT HANDOVER LEDGER CERTIFICATE (READ-ONLY INSPECTION LOG)
================================================================================
Facility Name:        ${facilityName}
Handover Reference:   ${handoverRef}
Audit Date / Time:    ${now}
Ledger Chain Length:  ${entries.length} Sequenced Blocks
Verification Status:  ${verificationResult.isValid ? 'TAMPER-PROOF VERIFIED (100% SHA-256 HASH INTEGRITY)' : 'TAMPER DETECTED / CHAIN BROKEN'}
Genesis Block Hash:   ${GENESIS_HASH}
Latest Block Hash:    ${entries.length > 0 ? entries[entries.length - 1].entryHash : 'N/A'}
================================================================================

CHRONOLOGICAL IMMUTABLE AUDIT TRAIL:
`;

  const rows = entries.map(e => `[BLOCK #${String(e.sequenceNumber).padStart(3, '0')}] ${e.timestamp} | ${e.isoTimestamp}
Action:      ${e.actionName} [${e.actionCategory.toUpperCase()}]
Severity:    ${e.severity.toUpperCase()}
Actor:       ${e.actorName} (Badge #${e.actorBadge} - ${e.actorRole})
Terminal:    ${e.ipOrTerminalId}
Entity:      ${e.entityType} ${e.entityId ? `[ID: ${e.entityId}]` : ''}
${e.previousValue ? `Prev Value:  ${e.previousValue}\n` : ''}${e.newValue ? `New Value:   ${e.newValue}\n` : ''}Details:     ${e.changeSummary}
Prev Hash:   ${e.prevHash}
Entry Hash:  ${e.entryHash}
--------------------------------------------------------------------------------`).join('\n\n');

  const footer = `\n================================================================================
END OF OFFICIAL TAMPER-EVIDENT AUDIT TRANSCRIPT - CONFIDENTIAL LEGAL RECORD
State Inspectorate for Correctional Security & Custodial Governance
================================================================================`;

  return header + rows + footer;
}
