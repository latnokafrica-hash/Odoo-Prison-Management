import React, { useState, useEffect, useRef } from 'react';
import { 
  ShiftChatMessage, 
  CommanderChatRole, 
  ChatMessagePriority, 
  ChatMessageType, 
  CommanderPresenceState,
  Language 
} from '../../types';
import { 
  INITIAL_SHIFT_CHAT_MESSAGES, 
  COMMANDER_QUICK_PHRASES, 
  generateChatCryptoSeal, 
  encryptMessageContent 
} from '../../data/shiftChatData';
import {
  MessageSquare,
  Send,
  Lock,
  Unlock,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Radio,
  Volume2,
  VolumeX,
  X,
  Check,
  CheckCheck,
  Clock,
  AlertTriangle,
  Key,
  Users,
  ChevronRight,
  ChevronDown,
  Minimize2,
  Maximize2,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Sliders,
  Sparkles,
  UserCheck,
  Wifi,
  WifiOff,
  FileCheck
} from 'lucide-react';

interface ShiftCommunicationsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  handoverId: string;
  handoverRef: string;
  facilityName: string;
  outgoingShift: string;
  incomingShift: string;
  outgoingCommanderName: string;
  outgoingCommanderBadge: string;
  incomingCommanderName: string;
  incomingCommanderBadge: string;
  language: Language;
  onAuditLog?: (summary: string, category: 'secure_communications', severity: 'low' | 'medium' | 'high' | 'critical') => void;
}

export const ShiftCommunicationsSidebar: React.FC<ShiftCommunicationsSidebarProps> = ({
  isOpen,
  onClose,
  handoverId,
  handoverRef,
  facilityName,
  outgoingShift,
  incomingShift,
  outgoingCommanderName,
  outgoingCommanderBadge,
  incomingCommanderName,
  incomingCommanderBadge,
  language,
  onAuditLog
}) => {
  // Active commander perspective: can be toggled by the user
  const [activeCommanderRole, setActiveCommanderRole] = useState<CommanderChatRole>('incoming_commander');
  const [messages, setMessages] = useState<ShiftChatMessage[]>(INITIAL_SHIFT_CHAT_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [priority, setPriority] = useState<ChatMessagePriority>('routine');
  const [messageType, setMessageType] = useState<ChatMessageType>('text');
  const [showEncryptedDetails, setShowEncryptedDetails] = useState<Record<string, boolean>>({});
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'offline'>('connecting');
  const [typingCommander, setTypingCommander] = useState<string | null>(null);
  const [quickPhrasesOpen, setQuickPhrasesOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<'all' | 'urgent' | 'critical'>('all');

  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Derived current user identity based on active perspective
  const currentCommander = activeCommanderRole === 'incoming_commander'
    ? {
        name: incomingCommanderName || 'Capt. Jonathan Hayes',
        badge: incomingCommanderBadge || 'KP-7890',
        role: 'incoming_commander' as CommanderChatRole,
        callSign: 'EAGLE-LEAD-2',
        rank: 'Watch Commander (Incoming)'
      }
    : activeCommanderRole === 'outgoing_commander'
    ? {
        name: outgoingCommanderName || 'Capt. Marcus Vance',
        badge: outgoingCommanderBadge || 'KP-8421',
        role: 'outgoing_commander' as CommanderChatRole,
        callSign: 'SENTINEL-LEAD-1',
        rank: 'Watch Commander (Outgoing)'
      }
    : {
        name: 'Senior Supt. Arthur Pendelton',
        badge: 'KP-5011',
        role: 'superintendent' as CommanderChatRole,
        callSign: 'COMMAND-OVERWATCH',
        rank: 'Facility Superintendent'
      };

  // Sound generator
  const playAudioTone = (tone: 'send' | 'receive' | 'alert') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (tone === 'send') {
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (tone === 'receive') {
        osc.frequency.setValueAtTime(1050, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (tone === 'alert') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(680, ctx.currentTime + 0.18);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      }
    } catch {
      // AudioContext unavailable or suspended
    }
  };

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingCommander]);

  // Connect to WebSocket on mount
  useEffect(() => {
    let isSubscribed = true;

    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api/ws/shift-chat`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!isSubscribed) return;
          setConnectionStatus('connected');
          // Announce presence and join handover room
          ws.send(JSON.stringify({
            type: 'join',
            handoverId: handoverId || 'hob-001',
            commanderName: currentCommander.name,
            commanderBadge: currentCommander.badge,
            role: currentCommander.role
          }));
        };

        ws.onmessage = (event) => {
          if (!isSubscribed) return;
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'history' && Array.isArray(data.messages) && data.messages.length > 0) {
              setMessages(data.messages);
            } else if (data.type === 'message:new' && data.message) {
              setMessages(prev => {
                // Deduplicate by ID
                if (prev.some(m => m.id === data.message.id)) {
                  return prev;
                }
                return [...prev, data.message];
              });

              if (data.message.senderBadge !== currentCommander.badge) {
                if (data.message.priority === 'critical') {
                  playAudioTone('alert');
                } else {
                  playAudioTone('receive');
                }
              }
            } else if (data.type === 'typing') {
              if (data.commanderBadge !== currentCommander.badge && data.isTyping) {
                setTypingCommander(data.commanderName);
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(() => {
                  setTypingCommander(null);
                }, 3000);
              } else if (!data.isTyping) {
                setTypingCommander(null);
              }
            } else if (data.type === 'message:acknowledged') {
              setMessages(prev => prev.map(m => {
                if (m.id === data.messageId) {
                  const acks = Array.isArray(m.acknowledgedBy) ? [...m.acknowledgedBy] : [];
                  if (!acks.includes(data.badgeNumber)) acks.push(data.badgeNumber);
                  return { ...m, acknowledgedBy: acks };
                }
                return m;
              }));
            }
          } catch (e) {
            console.error('WS parse error:', e);
          }
        };

        ws.onclose = () => {
          if (!isSubscribed) return;
          setConnectionStatus('offline');
          // Fallback fetch history via REST
          fetch(`/api/handover/${handoverId || 'hob-001'}/messages`)
            .then(res => res.json())
            .then(data => {
              if (data.success && Array.isArray(data.messages) && isSubscribed) {
                setMessages(data.messages);
              }
            })
            .catch(() => {});
        };

        ws.onerror = () => {
          if (!isSubscribed) return;
          setConnectionStatus('offline');
        };
      } catch (err) {
        setConnectionStatus('offline');
      }
    };

    connectWebSocket();

    return () => {
      isSubscribed = false;
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [handoverId, activeCommanderRole]);

  // Handle typing signal
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        isTyping: e.target.value.trim().length > 0
      }));
    }
  };

  // Send message
  const handleSendMessage = async (customContent?: string, customPriority?: ChatMessagePriority, customType?: ChatMessageType) => {
    const textToSend = (customContent || inputText).trim();
    if (!textToSend) return;

    const chosenPriority = customPriority || priority;
    const chosenType = customType || messageType;
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Cryptographic sealing & AES simulation
    const encResult = encryptMessageContent(textToSend);
    const cryptoSeal = generateChatCryptoSeal(
      messageId,
      currentCommander.badge,
      textToSend,
      formattedTime,
      chosenPriority
    );

    const newMessage: ShiftChatMessage = {
      id: messageId,
      handoverId: handoverId || 'hob-001',
      senderCommander: currentCommander.name,
      senderBadge: currentCommander.badge,
      senderRole: currentCommander.role,
      senderCallSign: currentCommander.callSign,
      content: textToSend,
      ciphertext: encResult.ciphertext,
      encryptionIv: encResult.iv,
      encryptionAlgorithm: 'AES-256-GCM / SHA-256',
      isEncrypted: true,
      timestamp: formattedTime,
      isoTimestamp: now.toISOString(),
      priority: chosenPriority,
      messageType: chosenType,
      cryptoSeal,
      isReadByOtherCommander: false,
      acknowledgedBy: [currentCommander.badge]
    };

    playAudioTone(chosenPriority === 'critical' ? 'alert' : 'send');

    // Send via WebSocket if connected, else fallback to REST
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'message:send',
        ...newMessage
      }));
    } else {
      // Optimistic update
      setMessages(prev => [...prev, newMessage]);
      try {
        await fetch(`/api/handover/${handoverId || 'hob-001'}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMessage)
        });
      } catch (err) {
        console.warn('REST send failed:', err);
      }
    }

    // Reset input fields
    setInputText('');
    setPriority('routine');
    setMessageType('text');

    // Notify typing stopped
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        isTyping: false
      }));
    }

    // Audit log if high severity or tactical directive
    if (onAuditLog && (chosenPriority === 'critical' || chosenPriority === 'urgent' || chosenType === 'tactical_directive' || chosenType === 'key_handover_query')) {
      onAuditLog(
        `Secure Comms: [${chosenPriority.toUpperCase()}] ${currentCommander.name} (${currentCommander.badge}) transmitted directive: "${textToSend.substring(0, 60)}..." [SHA-256 Seal: ${cryptoSeal.substring(0, 8)}]`,
        'secure_communications',
        chosenPriority === 'critical' ? 'critical' : 'high'
      );
    }
  };

  // Acknowledge a message
  const handleAcknowledge = (messageId: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'message:ack',
        handoverId: handoverId || 'hob-001',
        messageId,
        badgeNumber: currentCommander.badge
      }));
    } else {
      setMessages(prev => prev.map(m => {
        if (m.id === messageId) {
          const acks = Array.isArray(m.acknowledgedBy) ? [...m.acknowledgedBy] : [];
          if (!acks.includes(currentCommander.badge)) acks.push(currentCommander.badge);
          return { ...m, acknowledgedBy: acks };
        }
        return m;
      }));
    }

    playAudioTone('send');

    if (onAuditLog) {
      onAuditLog(
        `Commander Acknowledgment: ${currentCommander.name} verified and acknowledged message #${messageId}`,
        'secure_communications',
        'low'
      );
    }
  };

  // Toggle cipher details view
  const toggleCipherView = (id: string) => {
    setShowEncryptedDetails(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter messages
  const filteredMessages = messages.filter(m => {
    if (filterPriority === 'all') return true;
    return m.priority === filterPriority;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] md:w-[480px] bg-slate-900 border-l border-cyan-500/30 shadow-2xl flex flex-col font-sans transition-all duration-300">
      
      {/* SIDEBAR HEADER */}
      <div className="bg-slate-950/90 border-b border-slate-800 p-3.5 backdrop-blur-md">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-500/20">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  {language === 'fr' ? 'Canal Sécurisé de Relève' : 'Shift Communications'}
                </h3>
                <span className="flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  {connectionStatus === 'connected' ? 'WSS LIVE' : 'REST'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                {handoverRef || 'SEC/HOB/2026/09/002'} &bull; {facilityName}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute Radio Audio' : 'Unmute Radio Audio'}
              className={`p-1.5 rounded text-xs transition-colors ${
                soundEnabled ? 'text-cyan-400 hover:bg-cyan-950/50' : 'text-slate-500 hover:bg-slate-800'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Comms Sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SECURITY & ENCRYPTION TELEMETRY BAR */}
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-[9.5px]">
            <Lock className="w-3 h-3 text-cyan-400" />
            <span>AES-256-GCM / SHA-256 SEAL</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-mono">{filteredMessages.length} trans.</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
              2 Commanders Sync
            </span>
          </div>
        </div>

        {/* COMMANDER PERSPECTIVE SWITCHER */}
        <div className="mt-2.5 p-2 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[10.5px]">
            <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400 text-[10px] uppercase font-bold">
              {language === 'fr' ? 'Émetteur Actif :' : 'Operator Identity:'}
            </span>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-slate-800">
            <button
              onClick={() => setActiveCommanderRole('outgoing_commander')}
              className={`px-2 py-1 rounded text-[10px] font-semibold transition-all flex items-center gap-1 ${
                activeCommanderRole === 'outgoing_commander'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Outgoing Watch Commander (Capt. Vance)"
            >
              <span>Vance (Sortant)</span>
            </button>
            <button
              onClick={() => setActiveCommanderRole('incoming_commander')}
              className={`px-2 py-1 rounded text-[10px] font-semibold transition-all flex items-center gap-1 ${
                activeCommanderRole === 'incoming_commander'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Incoming Watch Commander (Capt. Hayes)"
            >
              <span>Hayes (Entrant)</span>
            </button>
            <button
              onClick={() => setActiveCommanderRole('superintendent')}
              className={`px-2 py-1 rounded text-[10px] font-semibold transition-all flex items-center gap-1 ${
                activeCommanderRole === 'superintendent'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Prison Warden / Superintendent"
            >
              <span>Warden</span>
            </button>
          </div>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="px-3 py-1.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-1 text-slate-400 font-mono">
          <span>FILTERS:</span>
          <button
            onClick={() => setFilterPriority('all')}
            className={`px-2 py-0.5 rounded font-bold uppercase transition-colors ${
              filterPriority === 'all' ? 'bg-slate-700 text-white' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            All ({messages.length})
          </button>
          <button
            onClick={() => setFilterPriority('urgent')}
            className={`px-2 py-0.5 rounded font-bold uppercase transition-colors ${
              filterPriority === 'urgent' ? 'bg-amber-900/80 text-amber-200 border border-amber-600/40' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            Urgent ({messages.filter(m => m.priority === 'urgent').length})
          </button>
          <button
            onClick={() => setFilterPriority('critical')}
            className={`px-2 py-0.5 rounded font-bold uppercase transition-colors ${
              filterPriority === 'critical' ? 'bg-rose-900/80 text-rose-200 border border-rose-600/40' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            Critical ({messages.filter(m => m.priority === 'critical').length})
          </button>
        </div>

        <button
          onClick={() => setQuickPhrasesOpen(!quickPhrasesOpen)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded font-mono font-bold uppercase transition-colors ${
            quickPhrasesOpen ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
        >
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>{language === 'fr' ? 'Ordres Types' : 'Directives'}</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${quickPhrasesOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* QUICK DIRECTIVES ACCORDION */}
      {quickPhrasesOpen && (
        <div className="p-3 bg-slate-950 border-b border-slate-800 animate-fadeIn space-y-1.5 max-h-48 overflow-y-auto">
          <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            {language === 'fr' ? 'DIRECTIVES TACTIQUES PRÉDÉFINIES :' : 'STANDARD COMMAND PHRASES :'}
          </span>
          <div className="grid grid-cols-1 gap-1.5">
            {COMMANDER_QUICK_PHRASES.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => {
                  handleSendMessage(language === 'fr' ? qp.fr : qp.en, qp.priority, qp.type);
                  setQuickPhrasesOpen(false);
                }}
                className="text-left p-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-[10.5px] text-slate-200 flex items-center justify-between gap-2 transition-all group"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    qp.priority === 'critical' ? 'bg-rose-500 animate-ping' :
                    qp.priority === 'urgent' ? 'bg-amber-400' : 'bg-cyan-400'
                  }`} />
                  <span className="group-hover:text-cyan-300 font-medium">{language === 'fr' ? qp.fr : qp.en}</span>
                </div>
                <span className={`text-[8.5px] font-mono font-bold uppercase px-1 rounded ${
                  qp.priority === 'critical' ? 'bg-rose-950 text-rose-300 border border-rose-600/30' :
                  qp.priority === 'urgent' ? 'bg-amber-950 text-amber-300 border border-amber-600/30' :
                  'bg-slate-800 text-slate-400'
                }`}>
                  {qp.priority}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MESSAGES FEED */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-gradient-to-b from-slate-900 to-slate-950">
        {filteredMessages.map((msg) => {
          const isMe = msg.senderBadge === currentCommander.badge;
          const isOutgoing = msg.senderRole === 'outgoing_commander';
          const isSuperintendent = msg.senderRole === 'superintendent';
          const isAcknowledged = Array.isArray(msg.acknowledgedBy) && msg.acknowledgedBy.length > 1;
          const showCipher = Boolean(showEncryptedDetails[msg.id]);

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group animate-fadeIn`}
            >
              {/* SENDER LABEL & CALLSIGN */}
              <div className="flex items-center gap-1.5 mb-1 px-1">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  isSuperintendent ? 'bg-emerald-400' :
                  isOutgoing ? 'bg-amber-400' : 'bg-indigo-400'
                }`} />
                <span className="text-[10px] font-bold text-slate-300">
                  {msg.senderCommander}
                </span>
                <span className="font-mono text-[9px] text-slate-500">
                  ({msg.senderCallSign || msg.senderBadge})
                </span>
                <span className="font-mono text-[9px] text-slate-500">&bull; {msg.timestamp}</span>

                {/* Priority Badge */}
                {msg.priority !== 'routine' && (
                  <span className={`px-1.5 py-0.2 text-[8.5px] font-mono font-bold uppercase rounded ${
                    msg.priority === 'critical' 
                      ? 'bg-rose-950 text-rose-300 border border-rose-500/50 animate-pulse' 
                      : 'bg-amber-950 text-amber-300 border border-amber-500/50'
                  }`}>
                    {msg.priority}
                  </span>
                )}
              </div>

              {/* MESSAGE BUBBLE */}
              <div
                className={`max-w-[88%] rounded-xl p-3 text-[11.5px] shadow-md transition-all ${
                  msg.priority === 'critical'
                    ? 'bg-rose-950/60 border-2 border-rose-500/70 text-rose-100 shadow-rose-900/30'
                    : isMe
                    ? isOutgoing
                      ? 'bg-amber-950/70 border border-amber-600/40 text-amber-50'
                      : 'bg-indigo-950/70 border border-indigo-600/40 text-indigo-50'
                    : 'bg-slate-800/90 border border-slate-700 text-slate-200'
                }`}
              >
                {/* Tactical directive tag */}
                {msg.messageType !== 'text' && (
                  <div className="flex items-center gap-1 mb-1.5 pb-1 border-b border-white/10 text-[9.5px] font-mono uppercase tracking-wider text-cyan-300">
                    {msg.messageType === 'key_handover_query' && <Key className="w-3 h-3 text-amber-400" />}
                    {msg.messageType === 'tactical_directive' && <ShieldAlert className="w-3 h-3 text-rose-400" />}
                    {msg.messageType === 'signoff_readiness' && <FileCheck className="w-3 h-3 text-emerald-400" />}
                    {msg.messageType === 'headcount_verification' && <Users className="w-3 h-3 text-indigo-400" />}
                    <span>{msg.messageType.replace(/_/g, ' ')}</span>
                  </div>
                )}

                {/* Plaintext Content */}
                <div className="leading-relaxed break-words whitespace-pre-wrap">
                  {msg.content}
                </div>

                {/* CIPHERTEXT INSPECTOR TOGGLE */}
                {showCipher && (
                  <div className="mt-2.5 p-2 rounded bg-slate-950 border border-cyan-500/30 font-mono text-[9px] text-cyan-300 space-y-1 animate-fadeIn">
                    <div className="flex items-center justify-between text-cyan-400 font-bold border-b border-cyan-900 pb-0.5">
                      <span>AES-256-GCM CIPHERTEXT</span>
                      <button 
                        onClick={() => handleCopy(msg.ciphertext || '', `cip-${msg.id}`)}
                        className="hover:text-white"
                        title="Copy Ciphertext"
                      >
                        {copiedId === `cip-${msg.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <div className="break-all text-slate-400">{msg.ciphertext || 'ENCRYPTED_BLOCK_SIMULATION'}</div>
                    <div className="flex items-center justify-between text-slate-500 text-[8.5px] pt-1 border-t border-slate-900">
                      <span>IV: {msg.encryptionIv || '00a12b...'}</span>
                      <span>ALGO: {msg.encryptionAlgorithm}</span>
                    </div>
                    <div className="text-[8px] text-slate-500 truncate">
                      SEAL: {msg.cryptoSeal}
                    </div>
                  </div>
                )}

                {/* FOOTER BAR: ACK & SEALS */}
                <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between gap-2 text-[9.5px] font-mono">
                  <button
                    onClick={() => toggleCipherView(msg.id)}
                    className="flex items-center gap-1 text-cyan-400/80 hover:text-cyan-300 transition-colors"
                    title="Inspect Cryptographic Seal & Ciphertext"
                  >
                    <Lock className="w-2.5 h-2.5" />
                    <span>{showCipher ? 'Hide Cipher' : 'Seal & IV'}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* Acknowledgment button for the other commander */}
                    {!isMe && !msg.acknowledgedBy?.includes(currentCommander.badge) && (
                      <button
                        onClick={() => handleAcknowledge(msg.id)}
                        className="px-1.5 py-0.5 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold flex items-center gap-1 transition-all"
                        title="Confirm receipt and acknowledge directive"
                      >
                        <Check className="w-2.5 h-2.5" />
                        <span>{language === 'fr' ? 'Accuser Réception' : 'Acknowledge'}</span>
                      </button>
                    )}

                    {/* Acknowledged Checkmark */}
                    {isAcknowledged ? (
                      <span className="flex items-center gap-0.5 text-emerald-400 font-bold" title="Acknowledged by both commanders">
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span className="text-[8.5px]">ACK</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-slate-500" title="Delivered & sealed">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* TYPING INDICATOR */}
        {typingCommander && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-[10.5px] text-slate-400 font-mono animate-pulse">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>{typingCommander} {language === 'fr' ? 'rédige une consigne...' : 'is typing transmission...'}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* COMPOSER / INPUT SECTION */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-2">
        
        {/* TRANSMISSION CONTROLS: PRIORITY & TYPE */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px]">
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-mono font-bold">PRIO:</span>
            <button
              onClick={() => setPriority('routine')}
              className={`px-1.5 py-0.5 rounded font-mono font-bold uppercase transition-colors ${
                priority === 'routine' ? 'bg-slate-700 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              Routine
            </button>
            <button
              onClick={() => setPriority('urgent')}
              className={`px-1.5 py-0.5 rounded font-mono font-bold uppercase transition-colors ${
                priority === 'urgent' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-amber-400'
              }`}
            >
              Urgent
            </button>
            <button
              onClick={() => setPriority('critical')}
              className={`px-1.5 py-0.5 rounded font-mono font-bold uppercase transition-colors ${
                priority === 'critical' ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-900 text-slate-400 hover:text-rose-400'
              }`}
            >
              Critical
            </button>
          </div>

          <div className="flex items-center gap-1 font-mono text-slate-400">
            <select
              value={messageType}
              onChange={(e) => setMessageType(e.target.value as ChatMessageType)}
              className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="text">{language === 'fr' ? 'Transmission Générale' : 'General Transmission'}</option>
              <option value="tactical_directive">{language === 'fr' ? 'Consigne Tactique' : 'Tactical Directive'}</option>
              <option value="key_handover_query">{language === 'fr' ? 'Contrôle Clés & Armurerie' : 'Key / Armory Query'}</option>
              <option value="headcount_verification">{language === 'fr' ? 'Point d\'Appel Effectif' : 'Headcount Verification'}</option>
              <option value="signoff_readiness">{language === 'fr' ? 'Validation Signature' : 'Sign-Off Readiness'}</option>
            </select>
          </div>
        </div>

        {/* TEXT INPUT AREA */}
        <div className="relative">
          <textarea
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={
              language === 'fr'
                ? `Transmettre une consigne chiffrée en tant que ${currentCommander.name}... (Entrée pour envoyer)`
                : `Transmit encrypted directive as ${currentCommander.name}... (Enter to send)`
            }
            rows={2}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 resize-none font-sans"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim()}
            className={`absolute right-2 bottom-2.5 p-2 rounded-lg font-semibold flex items-center justify-center transition-all ${
              inputText.trim()
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/30'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
            title="Send Encrypted Transmission"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* SENDER SIGNATURE STATUS */}
        <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
          <span className="flex items-center gap-1 text-slate-400">
            <Lock className="w-2.5 h-2.5 text-cyan-400" />
            <span>End-to-end Encrypted Channel</span>
          </span>
          <span>Station: {currentCommander.callSign} (#{currentCommander.badge})</span>
        </div>

      </div>

    </div>
  );
};
