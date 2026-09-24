import 'dotenv/config';
import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initial seed messages for handover sessions
const SEED_MESSAGES: Record<string, any[]> = {
  'hob-001': [
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
      cryptoSeal: 'e7a03bc214d0f62c8e2193bfa09918a5e01c9b6851239ab761e058921af7b120',
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
      cryptoSeal: '98d2ef1049c81b27af8320491029c8194bfae019481b9487c120938471029481',
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
      cryptoSeal: 'b4820194817a0b271639c01948291048bfae1094817294871629384710294817',
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
      content: 'Understood. Reviewing the duty overlap roster now. Incoming sentinels are at Gatehouse 1 completing biometric check-in.',
      ciphertext: 'VW5kZXJzdG9vZC4gUmV2aWV3aW5nIHRoZSBkdXR5IG92ZXJsYXAgcm9zdGVyIG5vdy4gSW5jb21pbmcgc2VudGluZWxzIGFyZSBhdCBHYXRlaG91c2UgMSBjb21wbGV0aW5n',
      encryptionIv: 'f72183ac9034d8e7b1a29358',
      encryptionAlgorithm: 'AES-256-GCM / SHA-256',
      isEncrypted: true,
      timestamp: '13:42:05',
      isoTimestamp: '2026-09-24T13:42:05.000Z',
      priority: 'routine',
      messageType: 'text',
      cryptoSeal: '8491029481720394817264910294817263910294817263910294817263910294',
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
      content: 'Convoy #4 returned safely at 13:15 under armed escort. All 14 high-risk remandees processed through intake sallyport and medical clearance without incident.',
      ciphertext: 'Q29udm95ICM0IHJldHVybmVkIHNhZmVseSBhdCAxMzoxNSB1bmRlciBhcm1lZCBlc2NvcnQuIEFsbCAxNCBoaWdoLXJpc2sgcmVtYW5kZWVzIHByb2Nlc3NlZA==',
      encryptionIv: 'b39174df92834c01a74e29b4',
      encryptionAlgorithm: 'AES-256-GCM / SHA-256',
      isEncrypted: true,
      timestamp: '13:44:30',
      isoTimestamp: '2026-09-24T13:44:30.000Z',
      priority: 'routine',
      messageType: 'headcount_verification',
      cryptoSeal: '1029384710293847102938471029384710293847102938471029384710293847',
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
      cryptoSeal: '9481726391029481726391029481726391029481726391029481726391029481',
      isReadByOtherCommander: true,
      acknowledgedBy: ['KP-8421'],
    }
  ]
};

// In-memory message store per handover
const SEEDED_STORE: Record<string, any[]> = { ...SEED_MESSAGES };

interface ConnectedClient {
  id: string;
  ws: WebSocket;
  handoverId: string;
  commanderName: string;
  commanderBadge: string;
  role: string;
  isTyping?: boolean;
}

const connectedClients = new Map<WebSocket, ConnectedClient>();

function broadcastToHandover(handoverId: string, payload: any, exceptWs?: WebSocket) {
  const data = JSON.stringify(payload);
  for (const [ws, client] of connectedClients.entries()) {
    if (client.handoverId === handoverId && ws !== exceptWs && ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  }
}

function getPresenceList(handoverId: string) {
  const result: any[] = [];
  const seenBadges = new Set<string>();
  for (const client of connectedClients.values()) {
    if (client.handoverId === handoverId && !seenBadges.has(client.commanderBadge)) {
      seenBadges.add(client.commanderBadge);
      result.push({
        commanderName: client.commanderName,
        commanderBadge: client.commanderBadge,
        role: client.role,
        isOnline: true,
        isTyping: Boolean(client.isTyping),
        lastActive: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
    }
  }
  return result;
}

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/api/ws/shift-chat' });

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '10mb' }));

  // WebSocket Server Handler
  wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (raw: string) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === 'join') {
          const client: ConnectedClient = {
            id: `client-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            ws,
            handoverId: msg.handoverId || 'hob-001',
            commanderName: msg.commanderName || 'Duty Officer',
            commanderBadge: msg.commanderBadge || 'KP-0000',
            role: msg.role || 'incoming_commander',
            isTyping: false
          };
          connectedClients.set(ws, client);

          if (!SEEDED_STORE[client.handoverId]) {
            SEEDED_STORE[client.handoverId] = SEED_MESSAGES[client.handoverId] ? [...SEED_MESSAGES[client.handoverId]] : [];
          }

          ws.send(JSON.stringify({
            type: 'history',
            messages: SEEDED_STORE[client.handoverId]
          }));

          broadcastToHandover(client.handoverId, {
            type: 'presence',
            activeOfficers: getPresenceList(client.handoverId)
          });
        } else if (msg.type === 'message:send') {
          const client = connectedClients.get(ws);
          const handoverId = client?.handoverId || msg.handoverId || 'hob-001';

          if (!SEEDED_STORE[handoverId]) {
            SEEDED_STORE[handoverId] = [];
          }

          const now = new Date();
          const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          const seal = crypto.createHash('sha256')
            .update(`CHAT_SEAL_V1:${msg.id || Date.now()}:${msg.senderBadge || client?.commanderBadge}:${msg.priority || 'routine'}:${formattedTime}:${msg.content}`)
            .digest('hex');

          const newMsg = {
            id: msg.id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            handoverId,
            senderCommander: msg.senderCommander || client?.commanderName || 'Duty Commander',
            senderBadge: msg.senderBadge || client?.commanderBadge || 'KP-0000',
            senderRole: msg.senderRole || client?.role || 'incoming_commander',
            senderCallSign: msg.senderCallSign || 'DUTY-LEAD',
            content: msg.content,
            ciphertext: msg.ciphertext,
            encryptionIv: msg.encryptionIv,
            encryptionAlgorithm: msg.encryptionAlgorithm || 'AES-256-GCM / SHA-256',
            isEncrypted: msg.isEncrypted !== false,
            timestamp: formattedTime,
            isoTimestamp: now.toISOString(),
            priority: msg.priority || 'routine',
            messageType: msg.messageType || 'text',
            cryptoSeal: msg.cryptoSeal || seal,
            isReadByOtherCommander: false,
            acknowledgedBy: msg.acknowledgedBy || []
          };

          SEEDED_STORE[handoverId].push(newMsg);

          // Broadcast to all connected clients in room
          broadcastToHandover(handoverId, {
            type: 'message:new',
            message: newMsg
          });
        } else if (msg.type === 'typing') {
          const client = connectedClients.get(ws);
          if (client) {
            client.isTyping = Boolean(msg.isTyping);
            broadcastToHandover(client.handoverId, {
              type: 'typing',
              commanderName: client.commanderName,
              commanderBadge: client.commanderBadge,
              isTyping: client.isTyping
            }, ws);
          }
        } else if (msg.type === 'message:ack') {
          const client = connectedClients.get(ws);
          const handoverId = client?.handoverId || msg.handoverId;
          if (handoverId && SEEDED_STORE[handoverId]) {
            const target = SEEDED_STORE[handoverId].find((m: any) => m.id === msg.messageId);
            if (target) {
              target.acknowledgedBy = target.acknowledgedBy || [];
              if (!target.acknowledgedBy.includes(msg.badgeNumber)) {
                target.acknowledgedBy.push(msg.badgeNumber);
              }
              broadcastToHandover(handoverId, {
                type: 'message:acknowledged',
                messageId: msg.messageId,
                badgeNumber: msg.badgeNumber,
                acknowledgedBy: target.acknowledgedBy
              });
            }
          }
        }
      } catch (e) {
        console.error('WS message processing error:', e);
      }
    });

    ws.on('close', () => {
      const client = connectedClients.get(ws);
      if (client) {
        connectedClients.delete(ws);
        broadcastToHandover(client.handoverId, {
          type: 'presence',
          activeOfficers: getPresenceList(client.handoverId)
        });
      }
    });
  });

  // REST API Endpoints for Shift Chat History
  app.get('/api/handover/:handoverId/messages', (req, res) => {
    const handoverId = req.params.handoverId;
    if (!SEEDED_STORE[handoverId]) {
      SEEDED_STORE[handoverId] = SEED_MESSAGES[handoverId] ? [...SEED_MESSAGES[handoverId]] : [];
    }
    res.json({
      success: true,
      handoverId,
      messages: SEEDED_STORE[handoverId]
    });
  });

  app.post('/api/handover/:handoverId/messages', (req, res) => {
    const handoverId = req.params.handoverId;
    if (!SEEDED_STORE[handoverId]) {
      SEEDED_STORE[handoverId] = SEED_MESSAGES[handoverId] ? [...SEED_MESSAGES[handoverId]] : [];
    }
    const body = req.body;
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const seal = crypto.createHash('sha256')
      .update(`CHAT_SEAL_V1:${body.id || Date.now()}:${body.senderBadge}:${body.priority || 'routine'}:${formattedTime}:${body.content}`)
      .digest('hex');

    const newMsg = {
      id: body.id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      handoverId,
      senderCommander: body.senderCommander || 'Duty Commander',
      senderBadge: body.senderBadge || 'KP-0000',
      senderRole: body.senderRole || 'incoming_commander',
      senderCallSign: body.senderCallSign || 'DUTY-LEAD',
      content: body.content,
      ciphertext: body.ciphertext,
      encryptionIv: body.encryptionIv,
      encryptionAlgorithm: body.encryptionAlgorithm || 'AES-256-GCM / SHA-256',
      isEncrypted: body.isEncrypted !== false,
      timestamp: formattedTime,
      isoTimestamp: now.toISOString(),
      priority: body.priority || 'routine',
      messageType: body.messageType || 'text',
      cryptoSeal: body.cryptoSeal || seal,
      isReadByOtherCommander: false,
      acknowledgedBy: []
    };

    SEEDED_STORE[handoverId].push(newMsg);
    broadcastToHandover(handoverId, {
      type: 'message:new',
      message: newMsg
    });

    res.json({ success: true, message: newMsg });
  });

  // Initialize server-side Gemini client per skill specifications
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // API endpoint for Gemini Shift Executive Summary generation
  app.post('/api/gemini/shift-executive-summary', async (req, res) => {
    try {
      const {
        facilityName = 'Kamiti Maximum Security Prison',
        outgoingShift = 'Morning Watch',
        incomingShift = 'Evening Patrol',
        date = new Date().toISOString().split('T')[0],
        outgoingCommander = 'Capt. Marcus Vance',
        contraband = [],
        tasks = [],
        notes = [],
        language = 'en',
        tone = 'command',
      } = req.body;

      // Extract critical metrics
      const contrabandCount = Array.isArray(contraband) ? contraband.length : 0;
      const tasksCount = Array.isArray(tasks) ? tasks.length : 0;
      const notesCount = Array.isArray(notes) ? notes.length : 0;
      const criticalThreatsCount = (Array.isArray(contraband) ? contraband : []).filter(
        (c: any) => c.severityLevel === 'critical' || c.severityLevel === 'high'
      ).length;

      // Format input data for Gemini prompt
      const contrabandSummary = (Array.isArray(contraband) ? contraband : [])
        .map((c: any, i: number) => {
          const desc = c.itemDescription || c.name || 'Prohibited object';
          const sev = (c.severityLevel || 'medium').toUpperCase();
          const cat = (c.category || 'general').replace(/_/g, ' ');
          const loc = c.seizedLocation || c.locationFound || 'Facility Grounds';
          const inmate = c.seizedFromInmateName ? `from Inmate ${c.seizedFromInmateName}` : 'unclaimed/common area';
          const custody = c.chainOfCustodyRef ? `(Custody Docket #${c.chainOfCustodyRef})` : '';
          const disp = (c.disposalStatus || 'secured_in_evidence').replace(/_/g, ' ');
          return `  [${sev} SEVERITY] ${desc} (${cat}, Qty: ${c.quantity || 1} ${c.unit || 'units'}), seized at ${loc} ${inmate}, stored in ${c.storageLocation || 'Evidence Vault'} ${custody}, status: ${disp}.`;
        })
        .join('\n');

      const mandatoryTasksSummary = (Array.isArray(tasks) ? tasks : [])
        .map((t: any) => {
          const prio = (t.priority || 'medium').toUpperCase();
          const status = (t.status || 'pending').replace(/_/g, ' ');
          const due = t.dueTime ? `due by ${t.dueTime}` : 'due this shift';
          const officer = t.assignedOfficer || t.assignedRole || 'Duty Sentinel';
          return `  [${prio} PRIORITY - ${status.toUpperCase()}] ${t.title}: ${t.description || ''} (Assigned to: ${officer}, ${due}).`;
        })
        .join('\n');

      const digitalNotesSummary = (Array.isArray(notes) ? notes : [])
        .map((n: any) => {
          const urg = (n.urgency || 'routine').toUpperCase();
          const cat = (n.category || 'general').replace(/_/g, ' ');
          const time = n.timestamp || 'recorded during shift';
          const author = n.authorCommander || n.authorName || 'Duty Officer';
          const inmateWatch = n.inmateWatchDetails
            ? ` [WATCH ALERT: Inmate ${n.inmateWatchDetails.inmateName || n.inmateWatchDetails.inmateId} on ${n.inmateWatchDetails.watchLevel} every ${n.inmateWatchDetails.watchIntervalMinutes}m]`
            : '';
          return `  [${urg} - ${cat}] at ${time} by ${author}: "${n.content || n.noteText || n.title || ''}"${inmateWatch}`;
        })
        .join('\n');

      const prompt = `You are a Senior Correctional Superintendent and Prison Intelligence Director compiling an official, high-level Shift Executive Summary for the Facility Warden and incoming Command Staff.

FACILITY CONTEXT:
- Facility: ${facilityName}
- Shift Handover: ${outgoingShift} transition into ${incomingShift}
- Date: ${date}
- Outgoing Watch Commander: ${outgoingCommander}
- Requested Language: ${language === 'fr' ? 'French (Français)' : 'English'}
- Command Tone: ${tone === 'security' ? 'Maximum Security & Threat Mitigation' : tone === 'compliance' ? 'Statutory Human Rights & Procedural Compliance' : 'Standard Military-Correctional Command Briefing'}

DATA CAPTURED DURING THIS WATCH:

1. CONTRABAND CONFISCATIONS & EVIDENCE CHAIN OF CUSTODY (${contrabandCount} items):
${contrabandSummary || 'No contraband confiscated during this watch period.'}

2. MANDATORY OPERATIONAL TASKS & OUTSTANDING ACTION ITEMS (${tasksCount} tasks):
${mandatoryTasksSummary || 'All routine post orders executed.'}

3. DIGITAL COMMAND DIRECTIVES, SENTINEL LOGS & INMATE OBSERVATION WATCHES (${notesCount} entries):
${digitalNotesSummary || 'Routine watch logs maintained.'}

STRICT WRITING DIRECTIVE:
Generate a single, cohesive, highly articulate, and authoritative executive summary paragraph (strictly between 3 to 5 sentences).
It MUST systematically synthesize:
1. Contraband seizures: summarize critical or high-threat confiscated items (especially fabricated weapons, unauthorized electronics/SIMs, or narcotics), affirming their physical chain of custody in the armory or evidence safe.
2. Mandatory tasks: specify key handover action items requiring priority execution or supervisory continuity by the incoming watch (such as court convoy returns, drainage/tier shakedowns, master evening headcounts, or medical distributions).
3. Active command notes: highlight vital operational directives or high-urgency prisoner observations (such as close surveillance protocols, suicide watches, or lock sensor defects).

STRICT CONSTRAINTS:
- Provide ONLY ONE continuous paragraph.
- DO NOT use bullet points, numbered items, greeting headers, sign-off signatures, or markdown formatting like lists.
- Use precise correctional command terminology (e.g., 'physical chain of custody', 'dual-sentinel visual checks', 'statutory lock-down count', 'mandated vigilance').`;

      let summaryText = '';
      let isLiveAi = false;
      let activeModel = 'gemini-3.8-flash';

      if (ai) {
        // Attempt 1: Preferred gemini-3.8-flash
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              temperature: 0.25,
              systemInstruction:
                'You are the Chief Intelligence and Operations Officer for a national maximum security correctional service. You write terse, authoritative, and flawless executive summaries.',
            },
          });

          summaryText = response.text?.trim() || '';
          if (summaryText) {
            isLiveAi = true;
            activeModel = 'gemini-3.8-flash';
          }
        } catch (apiError: any) {
          console.warn('Gemini 3.8 Flash temporary spike, attempting gemini-2.5-flash:', apiError?.message);
          
          // Attempt 2: gemini-2.5-flash fallback on transient 503/429
          try {
            const fallbackResponse = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
              config: {
                temperature: 0.25,
                systemInstruction:
                  'You are the Chief Intelligence and Operations Officer for a national maximum security correctional service. You write terse, authoritative, and flawless executive summaries.',
              },
            });

            summaryText = fallbackResponse.text?.trim() || '';
            if (summaryText) {
              isLiveAi = true;
              activeModel = 'gemini-2.5-flash';
            }
          } catch (fallbackError: any) {
            console.warn('Gemini 2.5 Flash also unavailable, generating deterministic fallback:', fallbackError?.message);
          }
        }
      }

      // Clean any accidental markdown bold wrappers or bullet characters
      if (summaryText) {
        summaryText = summaryText
          .replace(/^\*\*Executive Summary:\*\*\s*/i, '')
          .replace(/^"|"$/g, '')
          .replace(/\n+/g, ' ')
          .trim();
      }

      // If live API was not called or returned empty, generate a tailored fallback
      if (!summaryText) {
        const topContraband = (Array.isArray(contraband) ? contraband : []).slice(0, 2);
        const topTasks = (Array.isArray(tasks) ? tasks : []).filter((t: any) => t.priority === 'urgent' || t.priority === 'high').slice(0, 2);
        const topNotes = (Array.isArray(notes) ? notes : []).filter((n: any) => n.urgency === 'critical' || n.urgency === 'urgent').slice(0, 2);

        if (language === 'fr') {
          summaryText = `Au cours du quart ${outgoingShift} à l'établissement ${facilityName}, les rondes de sécurité ont permis la saisie de ${contrabandCount} objet(s) prohibé(s)${topContraband.length > 0 ? `, notamment ${topContraband.map((c: any) => c.itemDescription || c.name).join(' et ')}` : ''}, tous consignés sous scellés avec chaîne de garde vérifiée. La relève montante du quart ${incomingShift} doit immédiatement prioriser l'exécution des tâches impératives en suspens${topTasks.length > 0 ? `, en particulier ${topTasks.map((t: any) => t.title).join(' ainsi que ')}` : ''}, tout en maintenant une vigilance accrue sur les consignes d'observation spéciale${topNotes.length > 0 ? ` incluant ${topNotes.map((n: any) => n.title).join(' et ')}` : ''} avant le verrouillage nocturne général.`;
        } else {
          summaryText = `During the ${outgoingShift} at ${facilityName}, tactical search operations accounted for ${contrabandCount} confiscated contraband item(s)${topContraband.length > 0 ? `, notably ${topContraband.map((c: any) => c.itemDescription || c.name).join(' and ')}` : ''}, with all articles secured under dual-custody seal in the central evidence repository. The incoming ${incomingShift} command must immediately assume operational control over outstanding mandatory duties${topTasks.length > 0 ? `, specifically prioritizing ${topTasks.map((t: any) => t.title).join(' alongside ')}` : ''}, while strictly enforcing active command watch orders${topNotes.length > 0 ? ` regarding ${topNotes.map((n: any) => n.title).join(' and ')}` : ''} throughout the impending muster and cell lock-down sequence.`;
        }
        activeModel = 'gemini-3.8-flash (Offline Synthesis)';
      }

      return res.json({
        success: true,
        summary: summaryText,
        model: activeModel,
        generatedAt: new Date().toISOString(),
        isLiveAi,
        sourceCounts: {
          contrabandCount,
          mandatoryTasksCount: tasksCount,
          digitalNotesCount: notesCount,
          criticalThreatsCount,
        },
      });
    } catch (err: any) {
      console.error('Shift Executive Summary server error:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Internal server error while generating executive summary',
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Odoo 19 Corrections ERP Backend',
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // Mount Vite middleware in development or static dist in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`Corrections ERP Full-Stack Server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
