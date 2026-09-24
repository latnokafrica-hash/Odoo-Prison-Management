// Shift Communications Secure Chat Data & Cryptographic Utilities
// Provides AES-GCM simulation, SHA-256 tamper-evident integrity seals, and initial commander dialog

import { ShiftChatMessage, CommanderChatRole, ChatMessagePriority, ChatMessageType } from '../types';
import { sha256Sync } from '../utils/securityAuditLogger';

// Helper to generate deterministic SHA-256 seal for tamper evidence
export function generateChatCryptoSeal(
  id: string,
  senderBadge: string,
  content: string,
  timestamp: string,
  priority: string
): string {
  const payload = `CHAT_SEAL_V1:${id}:${senderBadge}:${priority}:${timestamp}:${content}`;
  return sha256Sync(payload);
}

// Simulated AES-256-GCM encryption helper that produces real base64 ciphertext blocks with IV and authentication tags
export function encryptMessageContent(plaintext: string, secretKeyHex = '4f8a92b3c1d5e6f7a8b9c0d1e2f3a4b5'): {
  ciphertext: string;
  iv: string;
  authTag: string;
} {
  // Generate pseudo IV (12 bytes / 24 hex chars)
  const randNum = Math.floor(Math.random() * 10000000000);
  const iv = sha256Sync(`IV:${plaintext}:${randNum}`).substring(0, 24);
  
  // Transform to pseudo-ciphertext using XOR keystream + Base64 representation
  const keyStream = sha256Sync(`${secretKeyHex}:${iv}`);
  const chars: string[] = [];
  for (let i = 0; i < plaintext.length; i++) {
    const pCode = plaintext.charCodeAt(i);
    const kCode = keyStream.charCodeAt(i % keyStream.length);
    chars.push(String.fromCharCode(pCode ^ (kCode % 32)));
  }
  
  // Base64 encoding
  let ciphertext = '';
  try {
    ciphertext = btoa(chars.join(''));
  } catch {
    ciphertext = Buffer.from(chars.join('')).toString('base64');
  }

  const authTag = sha256Sync(`AUTH_TAG:${ciphertext}:${iv}:${secretKeyHex}`).substring(0, 16);

  return {
    ciphertext,
    iv,
    authTag
  };
}

// Initial realistic handover conversation between outgoing and incoming watch commanders
export const INITIAL_SHIFT_CHAT_MESSAGES: ShiftChatMessage[] = [
  {
    id: 'msg-001',
    handoverId: 'hob-001',
    senderCommander: 'Capt. Marcus Vance',
    senderBadge: 'KP-8421',
    senderRole: 'outgoing_commander',
    senderCallSign: 'SENTINEL-LEAD-1',
    content: 'Good day Captain Hayes. Morning Watch handover dossier initialized on terminal TERM-CTRL-01. Custody roll-call conducted at 13:30 with zero discrepancy across all 2,842 inmates.',
    ciphertext: 'V2F0Y2ggbW9ybmluZyBoYW5kb3ZlciBkb3NzaWVyIGluaXRpYWxpemVkIG9uIHRlcm1pbmFsIFRFUk0tQ1RSTC0wMS4gQ3VzdG9keSByb2xsLWNhbGw=',
    encryptionIv: '8f921bc4e92a48df01a23847',
    encryptionAlgorithm: 'AES-256-GCM / SHA-256',
    isEncrypted: true,
    timestamp: '13:35:12',
    isoTimestamp: '2026-09-24T13:35:12.000Z',
    priority: 'routine',
    messageType: 'text',
    cryptoSeal: generateChatCryptoSeal('msg-001', 'KP-8421', 'Good day Captain Hayes. Morning Watch handover dossier initialized on terminal TERM-CTRL-01. Custody roll-call conducted at 13:30 with zero discrepancy across all 2,842 inmates.', '13:35:12', 'routine'),
    isReadByOtherCommander: true,
    acknowledgedBy: ['KP-7890'],
  },
  {
    id: 'msg-002',
    handoverId: 'hob-001',
    senderCommander: 'Capt. Jonathan Hayes',
    senderBadge: 'KP-7890',
    senderRole: 'incoming_commander',
    senderCallSign: 'EAGLE-LEAD-2',
    content: 'Copy that, Captain Vance. I am reviewing the custody numbers on Station 2. Can you confirm physical status of the 28 grand master keys and armory air-lock seals?',
    ciphertext: 'Q29weSB0aGF0LCBDYXB0YWluIFZhbmNlLiBJIGFtIHJldmlld2luZyB0aGUgY3VzdG9keSBudW1iZXJzIG9uIFN0YXRpb24gMi4gQ2FuIHlvdSBjb25maXJt',
    encryptionIv: '39a2f10b78c93de458291a4b',
    encryptionAlgorithm: 'AES-256-GCM / SHA-256',
    isEncrypted: true,
    timestamp: '13:37:44',
    isoTimestamp: '2026-09-24T13:37:44.000Z',
    priority: 'urgent',
    messageType: 'key_handover_query',
    cryptoSeal: generateChatCryptoSeal('msg-002', 'KP-7890', 'Copy that, Captain Vance. I am reviewing the custody numbers on Station 2. Can you confirm physical status of the 28 grand master keys and armory air-lock seals?', '13:37:44', 'urgent'),
    isReadByOtherCommander: true,
    acknowledgedBy: ['KP-8421'],
  },
  {
    id: 'msg-003',
    handoverId: 'hob-001',
    senderCommander: 'Capt. Marcus Vance',
    senderBadge: 'KP-8421',
    senderRole: 'outgoing_commander',
    senderCallSign: 'SENTINEL-LEAD-1',
    content: 'Confirmed. All 28 master keys are physically in Safe 1, tamper seal #SL-8849 intact. Armory air-lock inspection passed dual-sentinel check at 13:20 with Officer Barasa.',
    ciphertext: 'Q29uZmlybWVkLiBBbGwgMjggbWFzdGVyIGtleXMgYXJlIHBoeXNpY2FsbHkgaW4gU2FmZSAxLCB0YW1wZXIgc2VhbCAjU0wtODg0OSBpbnRhY3Qu',
    encryptionIv: 'a48f29c01824b37d99824c15',
    encryptionAlgorithm: 'AES-256-GCM / SHA-256',
    isEncrypted: true,
    timestamp: '13:39:10',
    isoTimestamp: '2026-09-24T13:39:10.000Z',
    priority: 'routine',
    messageType: 'tactical_directive',
    cryptoSeal: generateChatCryptoSeal('msg-003', 'KP-8421', 'Confirmed. All 28 master keys are physically in Safe 1, tamper seal #SL-8849 intact. Armory air-lock inspection passed dual-sentinel check at 13:20 with Officer Barasa.', '13:39:10', 'routine'),
    isReadByOtherCommander: true,
    acknowledgedBy: ['KP-7890'],
  },
  {
    id: 'msg-004',
    handoverId: 'hob-001',
    senderCommander: 'Capt. Jonathan Hayes',
    senderBadge: 'KP-7890',
    senderRole: 'incoming_commander',
    senderCallSign: 'EAGLE-LEAD-2',
    content: 'Excellent. What is the disposition of the Milimani court convoy? Our incoming roster had them flagged for potential transit delays.',
    ciphertext: 'RXhjZWxsZW50LiBXaGF0IGlzIHRoZSBkaXNwb3NpdGlvbiBvZiB0aGUgTWlsaW1hbmkgY291cnQgY29udm95PyBPdXIgaW5jb21pbmcgcm9zdGVy',
    encryptionIv: 'f72183ac9034d8e7b1a29358',
    encryptionAlgorithm: 'AES-256-GCM / SHA-256',
    isEncrypted: true,
    timestamp: '13:42:05',
    isoTimestamp: '2026-09-24T13:42:05.000Z',
    priority: 'routine',
    messageType: 'text',
    cryptoSeal: generateChatCryptoSeal('msg-004', 'KP-7890', 'Excellent. What is the disposition of the Milimani court convoy? Our incoming roster had them flagged for potential transit delays.', '13:42:05', 'routine'),
    isReadByOtherCommander: true,
    acknowledgedBy: ['KP-8421'],
  },
  {
    id: 'msg-005',
    handoverId: 'hob-001',
    senderCommander: 'Capt. Marcus Vance',
    senderBadge: 'KP-8421',
    senderRole: 'outgoing_commander',
    senderCallSign: 'SENTINEL-LEAD-1',
    content: 'Convoy #4 returned safely at 13:15 under armed escort. All 14 high-risk remandees processed through intake sallyport and medical clearance without incident. Medical logs updated.',
    ciphertext: 'Q29udm95ICM0IHJldHVybmVkIHNhZmVseSBhdCAxMzoxNSB1bmRlciBhcm1lZCBlc2NvcnQuIEFsbCAxNCBoaWdoLXJpc2sgcmVtYW5kZWVzIHByb2Nlc3NlZA==',
    encryptionIv: 'b39174df92834c01a74e29b4',
    encryptionAlgorithm: 'AES-256-GCM / SHA-256',
    isEncrypted: true,
    timestamp: '13:44:30',
    isoTimestamp: '2026-09-24T13:44:30.000Z',
    priority: 'routine',
    messageType: 'headcount_verification',
    cryptoSeal: generateChatCryptoSeal('msg-005', 'KP-8421', 'Convoy #4 returned safely at 13:15 under armed escort. All 14 high-risk remandees processed through intake sallyport and medical clearance without incident. Medical logs updated.', '13:44:30', 'routine'),
    isReadByOtherCommander: true,
    acknowledgedBy: ['KP-7890'],
  },
  {
    id: 'msg-006',
    handoverId: 'hob-001',
    senderCommander: 'Capt. Jonathan Hayes',
    senderBadge: 'KP-7890',
    senderRole: 'incoming_commander',
    senderCallSign: 'EAGLE-LEAD-2',
    content: 'ATTENTION: Note that thick fog is setting in along the north perimeter wall (visibility under 0.8 km). I am commanding Tower 4 and Tower 7 sentinels to activate high-output auxiliary halogen floodlights.',
    ciphertext: 'QVRURU5USU9OOiBOb3RlIHRoYXQgdGhpY2sgZm9nIGlzIHNldHRpbmcgaW4gYWxvbmcgdGhlIG5vcnRoIHBlcmltZXRlciB3YWxsICh2aXNpYmlsaXR5',
    encryptionIv: '1249b8af74c93810e74b9234',
    encryptionAlgorithm: 'AES-256-GCM / SHA-256',
    isEncrypted: true,
    timestamp: '13:48:19',
    isoTimestamp: '2026-09-24T13:48:19.000Z',
    priority: 'critical',
    messageType: 'tactical_directive',
    cryptoSeal: generateChatCryptoSeal('msg-006', 'KP-7890', 'ATTENTION: Note that thick fog is setting in along the north perimeter wall (visibility under 0.8 km). I am commanding Tower 4 and Tower 7 sentinels to activate high-output auxiliary halogen floodlights.', '13:48:19', 'critical'),
    isReadByOtherCommander: true,
    acknowledgedBy: ['KP-8421'],
  },
  {
    id: 'msg-007',
    handoverId: 'hob-001',
    senderCommander: 'Capt. Marcus Vance',
    senderBadge: 'KP-8421',
    senderRole: 'outgoing_commander',
    senderCallSign: 'SENTINEL-LEAD-1',
    content: 'Standing order affirmed. Outdoor yard activities remain suspended. The biometric check-in muster is 100% complete at Gatehouse 1. I am ready to sign the outgoing declaration.',
    ciphertext: 'U3RhbmRpbmcgb3JkZXIgYWZmaXJtZWQuIE91dGRvb3IgeWFyZCBhY3Rpdml0aWVzIHJlbWFpbiBzdXNwZW5kZWQuIFRoZSBiaW9tZXRyaWMgY2hlY2staW4=',
    encryptionIv: 'c90184b23849df74a1239841',
    encryptionAlgorithm: 'AES-256-GCM / SHA-256',
    isEncrypted: true,
    timestamp: '13:51:02',
    isoTimestamp: '2026-09-24T13:51:02.000Z',
    priority: 'urgent',
    messageType: 'signoff_readiness',
    cryptoSeal: generateChatCryptoSeal('msg-007', 'KP-8421', 'Standing order affirmed. Outdoor yard activities remain suspended. The biometric check-in muster is 100% complete at Gatehouse 1. I am ready to sign the outgoing declaration.', '13:51:02', 'urgent'),
    isReadByOtherCommander: true,
    acknowledgedBy: ['KP-7890'],
  }
];

// Quick Tactical Directive chips for rapid commander transmission
export const COMMANDER_QUICK_PHRASES = [
  {
    en: 'Confirm all 28 master keys verified in safe',
    fr: 'Confirmer la présence des 28 clés maîtresses au coffre',
    priority: 'urgent' as ChatMessagePriority,
    type: 'key_handover_query' as ChatMessageType,
  },
  {
    en: 'Milimani court transport armed escort confirmed return',
    fr: 'Retour confirmé de l\'escorte armée du convoi de Milimani',
    priority: 'routine' as ChatMessagePriority,
    type: 'headcount_verification' as ChatMessageType,
  },
  {
    en: 'Cell shakedown Block B complete — evidence sealed',
    fr: 'Fouille Block B terminée — objets sous scellés au greffe',
    priority: 'routine' as ChatMessagePriority,
    type: 'contraband_alert' as ChatMessageType,
  },
  {
    en: 'Tower floodlights activated — low visibility protocol active',
    fr: 'Projecteurs des miradors activés — protocole brouillard enclenché',
    priority: 'critical' as ChatMessagePriority,
    type: 'tactical_directive' as ChatMessageType,
  },
  {
    en: 'Incoming shift sentinels mustered & biometrically verified',
    fr: 'Surveillants montants rassemblés et pointage biométrique validé',
    priority: 'routine' as ChatMessagePriority,
    type: 'text' as ChatMessageType,
  },
  {
    en: 'Ready to execute custody transfer official sign-off',
    fr: 'Prêt pour l\'apposition de la signature officielle de passation',
    priority: 'urgent' as ChatMessagePriority,
    type: 'signoff_readiness' as ChatMessageType,
  },
];
