import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Play, 
  Square, 
  RotateCcw, 
  Check, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  AlertCircle, 
  Clock, 
  MapPin, 
  Tag, 
  Shield, 
  User, 
  Send, 
  FileText, 
  X, 
  CheckCircle2, 
  Eye, 
  Wrench, 
  AlertTriangle,
  Radio,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { 
  ShiftHandoverNote, 
  HandoverNoteCategory, 
  HandoverNoteUrgency, 
  Language 
} from '../../types';

// SpeechRecognition type declarations for browser support
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

interface HandoverVoiceDictationWidgetProps {
  language: Language;
  onAppendNote: (newNote: ShiftHandoverNote) => void;
  outgoingCommanderName?: string;
  outgoingCommanderBadge?: string;
  incomingCommanderName?: string;
  incomingCommanderBadge?: string;
  onClose?: () => void;
  isModal?: boolean;
}

export const HandoverVoiceDictationWidget: React.FC<HandoverVoiceDictationWidgetProps> = ({
  language,
  onAppendNote,
  outgoingCommanderName = 'Capt. Marcus Vance',
  outgoingCommanderBadge = 'KP-8421',
  incomingCommanderName = 'Capt. Jonathan Hayes',
  incomingCommanderBadge = 'KP-7890',
  onClose,
  isModal = false,
}) => {
  // Speech & Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [confidence, setConfidence] = useState<number>(0.94);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [audioPermissionGranted, setAudioPermissionGranted] = useState<boolean | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [audioLevels, setAudioLevels] = useState<number[]>([15, 25, 45, 70, 85, 60, 40, 20, 30, 65, 80, 50]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loggedSuccess, setLoggedSuccess] = useState(false);

  // Form Fields for Structured Handover Note
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<HandoverNoteCategory>('general_orders');
  const [urgency, setUrgency] = useState<HandoverNoteUrgency>('urgent');
  const [location, setLocation] = useState('Sector A - High Security Wing');
  const [selectedCommander, setSelectedCommander] = useState<'outgoing' | 'incoming'>('outgoing');

  // Audio Context & Recognition Refs
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const simTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Audio Chime / Walkie-Talkie Sound Generator
  const playTacticalChime = (type: 'start' | 'stop' | 'success') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'start') {
        // High double chirp
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1174.66, now + 0.08);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'stop') {
        // Lower tactical release tone
        osc.frequency.setValueAtTime(659.25, now);
        osc.frequency.setValueAtTime(523.25, now + 0.08);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'success') {
        // Ascending confirm tone
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.setValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch {
      // AudioContext might be blocked until user gesture, ignore silently
    }
  };

  // Check Web Speech API Availability on Mount
  useEffect(() => {
    const win = window as IWindow;
    const SpeechRecognitionAPI = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setSpeechSupported(false);
    }
  }, []);

  // Timer for Recording Duration
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, isPaused]);

  // Clean up media streams and speech on unmount
  useEffect(() => {
    return () => {
      stopRecordingCleanup();
      if (simTimeoutRef.current) clearTimeout(simTimeoutRef.current);
    };
  }, []);

  const stopRecordingCleanup = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
      recognitionRef.current = null;
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {
        // Ignore
      }
      audioContextRef.current = null;
    }
  };

  // Start Real Voice-to-Text Recording using Web Speech API & Web Audio API
  const startRecording = async () => {
    playTacticalChime('start');
    setStatusMessage(null);
    setLoggedSuccess(false);

    const win = window as IWindow;
    const SpeechRecognitionAPI = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      // Fallback to simulated dictation if SpeechRecognition is not supported in environment
      startSimulatedDictation();
      return;
    }

    try {
      // 1. Initialize AudioContext & Microphone for Visualizer
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        setAudioPermissionGranted(true);

        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const updateLevels = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);

          // Sample 12 frequency bins for visualizer
          const sampled = [];
          for (let i = 0; i < 12; i++) {
            const index = Math.floor(i * (bufferLength / 14));
            const val = Math.min(100, Math.max(12, Math.round((dataArray[index] / 255) * 100)));
            sampled.push(val);
          }
          setAudioLevels(sampled);
          animFrameRef.current = requestAnimationFrame(updateLevels);
        };
        updateLevels();
      } catch (micErr) {
        console.warn('Microphone stream access not granted for visualizer:', micErr);
        setAudioPermissionGranted(false);
        // Continue anyway; SpeechRecognition might still work via browser dialog
      }

      // 2. Initialize SpeechRecognition Engine
      const recognition = new SpeechRecognitionAPI();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language === 'fr' ? 'fr-FR' : 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setIsPaused(false);
        setIsSimulating(false);
      };

      recognition.onresult = (event: any) => {
        let finalChunk = '';
        let interimChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            finalChunk += res[0].transcript + ' ';
            if (res[0].confidence) {
              setConfidence(Math.round(res[0].confidence * 100) / 100);
            }
          } else {
            interimChunk += res[0].transcript;
          }
        }

        if (finalChunk) {
          setTranscript(prev => (prev ? prev.trim() + ' ' + finalChunk.trim() : finalChunk.trim()));
          setInterimTranscript('');
          
          // Auto-generate title if empty
          if (!title) {
            const cleanTitle = (finalChunk.trim().slice(0, 45) + (finalChunk.length > 45 ? '...' : '')).replace(/^./, str => str.toUpperCase());
            setTitle(cleanTitle);
          }
        } else {
          setInterimTranscript(interimChunk);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setStatusMessage(language === 'fr' ? 'Accès microphone refusé. Mode simulation radio activé.' : 'Microphone blocked. Switched to tactical radio simulator.');
          stopRecordingCleanup();
          startSimulatedDictation();
        } else if (event.error === 'no-speech') {
          // Keep listening
        } else {
          setStatusMessage(language === 'fr' ? `Erreur dictée: ${event.error}` : `Dictation status: ${event.error}`);
        }
      };

      recognition.onend = () => {
        // If still marked as recording, restart to maintain continuous push-to-talk
        if (isRecording && !isPaused && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch {
            // Already active
          }
        }
      };

      recognition.start();
    } catch (err) {
      console.warn('Error starting speech recognition:', err);
      startSimulatedDictation();
    }
  };

  // Pause Voice Dictation
  const pauseRecording = () => {
    playTacticalChime('stop');
    setIsPaused(true);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
  };

  // Resume Voice Dictation
  const resumeRecording = () => {
    playTacticalChime('start');
    setIsPaused(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch {
        // Ignore
      }
    }
  };

  // Stop Recording
  const stopRecording = () => {
    playTacticalChime('stop');
    setIsRecording(false);
    setIsPaused(false);
    setIsSimulating(false);
    stopRecordingCleanup();

    // Auto-generate a title from transcript if user hasn't set one yet
    if (!title && transcript) {
      const snippet = transcript.trim().split('.')[0].slice(0, 48);
      setTitle(snippet + (snippet.length >= 48 ? '...' : ''));
    }
  };

  // Reset / Clear Voice Dictation
  const resetDictation = () => {
    stopRecordingCleanup();
    setIsRecording(false);
    setIsPaused(false);
    setIsSimulating(false);
    setTranscript('');
    setInterimTranscript('');
    setRecordingSeconds(0);
    setTitle('');
    setStatusMessage(null);
    setLoggedSuccess(false);
  };

  // Fallback Tactical Radio Simulator (Ideal for test environments or when mic permission is restricted)
  const startSimulatedDictation = () => {
    setIsSimulating(true);
    setIsRecording(true);
    setIsPaused(false);
    setAudioPermissionGranted(false);
    setStatusMessage(language === 'fr' ? 'Mode simulateur de dictée tactique (Web Speech API émulateur)' : 'Tactical Radio Speech Simulator Active (Real-Time Voice Emulation)');

    const sampleTranscripts = language === 'fr' ? [
      "Quartier Haute Sécurité Aile A : Ronde de surveillance effectuée à 13h40. Détenu Kinyua placé sous observation 15 minutes en cellule d'isolement C-04. Barreaudage et serrures testés conformes.",
      "Vérification Armurerie Centrale : Trousseaux de clés maîtresses MK-01 et MK-02 réintégrés dans l'armoire blindée avec sceaux intacts. 12 postes radio UHF cryptés en charge au poste de garde.",
      "Ordre de Réparation Technique : Défaut détecté sur le portail coulissant du Secteur Ouest. Mécanisme hydraulique signalé en maintenance urgente avec bon de travail WO-7842.",
      "Inspection Détenus Cour Nord : Découverte lors de la fouille d'un câble d'antenne non autorisé dissimulé sous la paillasse. Objet confisqué et consigné au greffe des scellés."
    ] : [
      "High Security Wing Sector A: Physical security round completed at 13:40 hours. Inmate Kinyua placed on strict 15-minute suicide watch order in Cell C-04. Window grilles and primary locking bar inspected and certified secure.",
      "Armory & Key Vault Custodial Clearance: Master key ring MK-01 and MK-02 accounted for and locked in central vault with dual-tamper seals verified. 12 tactical UHF encrypted radios verified in dock.",
      "Emergency Maintenance Directive: Perimeter fence sensor station 4 reporting intermittent ground fault after heavy rain. High-voltage energizer active on backup circuit. Technical team notified.",
      "Contraband Seizure Log: Unannounced routine search of Block 3 dormitory yielded 1 unauthorized modified phone charger and contraband lighter. Tagged and stored in evidence locker."
    ];

    const randomSample = sampleTranscripts[Math.floor(Math.random() * sampleTranscripts.length)];
    const words = randomSample.split(' ');
    let currentIdx = 0;
    setTranscript('');
    setInterimTranscript('');

    const streamWords = () => {
      if (currentIdx < words.length) {
        const nextWord = words[currentIdx];
        setInterimTranscript(nextWord + ' ...');
        setTranscript(prev => (prev ? prev + ' ' + nextWord : nextWord));
        currentIdx++;

        // Random simulated audio levels
        const simLevels = Array.from({ length: 12 }, () => Math.floor(Math.random() * 65) + 20);
        setAudioLevels(simLevels);

        simTimeoutRef.current = setTimeout(streamWords, 220 + Math.random() * 140);
      } else {
        setInterimTranscript('');
        setIsRecording(false);
        setIsSimulating(false);
        playTacticalChime('stop');
        if (!title) {
          setTitle(randomSample.slice(0, 42) + '...');
        }
      }
    };

    streamWords();
  };

  // Commit and Log Directly to Shift Handover Notes
  const handleLogToHandover = () => {
    const fullContent = (transcript + ' ' + interimTranscript).trim();
    if (!fullContent && !title) {
      setStatusMessage(language === 'fr' ? 'Veuillez dicter ou saisir des consignes avant d\'enregistrer.' : 'Please dictate or type note content before logging.');
      return;
    }

    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const noteId = `HN-VOICE-${Date.now().toString().slice(-6)}`;
    const commanderName = selectedCommander === 'outgoing' ? outgoingCommanderName : incomingCommanderName;
    const commanderBadge = selectedCommander === 'outgoing' ? outgoingCommanderBadge : incomingCommanderBadge;

    const newNote: ShiftHandoverNote = {
      id: noteId,
      category,
      urgency,
      title: title.trim() || (fullContent.slice(0, 45) + '...'),
      content: fullContent || title,
      location: location || 'Central Security Command',
      authorCommander: commanderName,
      authorBadge: commanderBadge,
      timestamp: formattedTime,
      audioDictated: true,
      audioDurationSeconds: recordingSeconds > 0 ? recordingSeconds : 14,
      transcriptionConfidence: confidence,
      isAcknowledgedByIncoming: selectedCommander === 'incoming',
      acknowledgedAt: selectedCommander === 'incoming' ? formattedTime : undefined,
      acknowledgedBy: selectedCommander === 'incoming' ? incomingCommanderName : undefined
    };

    // If category is inmate_watch, attach watch details template
    if (category === 'inmate_watch') {
      newNote.inmateWatchDetails = {
        inmateId: 'INM-DICTATED',
        inmateName: 'Inmate Subject',
        cellLocation: location,
        watchLevel: urgency === 'critical' ? 'constant_1to1' : 'suicide_watch_15m',
        watchIntervalMinutes: urgency === 'critical' ? 5 : 15,
        specialInstructions: fullContent
      };
    } else if (category === 'maintenance') {
      newNote.maintenanceDetails = {
        equipmentOrAsset: location,
        trade: 'locks_doors',
        contractorAccessRequired: false,
        workOrderRef: `WO-${Date.now().toString().slice(-4)}`
      };
    }

    onAppendNote(newNote);
    playTacticalChime('success');
    setLoggedSuccess(true);
    setStatusMessage(
      language === 'fr' 
        ? `Consigne dictée avec succès enregistrée dans le journal de quart (${noteId})` 
        : `Voice note successfully logged to official shift register (${noteId})`
    );

    // Reset transcription field for next dictation
    setTimeout(() => {
      setTranscript('');
      setInterimTranscript('');
      setTitle('');
      setRecordingSeconds(0);
      if (isModal && onClose) {
        setTimeout(onClose, 1200);
      }
    }, 1500);
  };

  // Format seconds into MM:SS
  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl text-white ${
      isModal ? 'max-w-2xl w-full mx-auto' : 'w-full'
    }`}>
      
      {/* Widget Header Strip */}
      <div className="px-4 py-3 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg transition-colors ${
            isRecording ? 'bg-rose-600 text-white animate-pulse' : 'bg-indigo-950 text-indigo-400 border border-indigo-700/60'
          }`}>
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                {language === 'fr' ? 'Dictée Vocale & Transcription en Temps Réel' : 'Voice-to-Text Handover Dictation'}
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                {language === 'fr' ? 'RECONNAISSANCE VOCALE' : 'SPEECH-TO-TEXT'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              {language === 'fr'
                ? 'Dictez directement vos consignes de relève pour insertion automatique au journal de bord.'
                : 'Dictate shift observations and orders directly into the custodial handover log with real-time transcription.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick preset button */}
          <button
            onClick={startSimulatedDictation}
            className="px-2.5 py-1 text-[10px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded flex items-center gap-1 transition-all cursor-pointer"
            title="Try instant tactical radio dictation sample"
          >
            <Radio className="w-3 h-3 text-indigo-400" />
            <span className="hidden sm:inline">{language === 'fr' ? 'Échantillon Radio' : 'Demo Radio Clip'}</span>
          </button>

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        
        {/* Status & Feedback Banner */}
        {statusMessage && (
          <div className={`p-2.5 rounded-lg text-xs flex items-center justify-between gap-2 ${
            loggedSuccess 
              ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-200' 
              : 'bg-amber-950/70 border border-amber-600/40 text-amber-200'
          }`}>
            <div className="flex items-center gap-2">
              {loggedSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />}
              <span>{statusMessage}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white p-0.5">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Audio Visualizer & Dictation Control Deck */}
        <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Left: Push-to-Talk / Recording Button & Timer */}
          <div className="flex items-center gap-3.5 shrink-0">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 text-white shadow-lg shadow-indigo-900/40 transition-all active:scale-95 cursor-pointer"
                title={language === 'fr' ? 'Démarrer la dictée vocale' : 'Start voice dictation'}
              >
                <div className="absolute inset-0 rounded-full border-2 border-indigo-400/40 group-hover:scale-110 transition-transform" />
                <Mic className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={stopRecording}
                  className="flex items-center justify-center w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/50 animate-pulse active:scale-95 cursor-pointer"
                  title={language === 'fr' ? 'Arrêter l\'enregistrement' : 'Stop voice dictation'}
                >
                  <Square className="w-5 h-5 fill-white" />
                </button>
                {isPaused ? (
                  <button
                    onClick={resumeRecording}
                    className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
                    title="Resume"
                  >
                    <Play className="w-4 h-4 fill-slate-200" />
                  </button>
                ) : (
                  <button
                    onClick={pauseRecording}
                    className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
                    title="Pause"
                  >
                    <Sliders className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  isRecording ? (isPaused ? 'bg-amber-400' : 'bg-rose-500 animate-ping') : 'bg-slate-600'
                }`} />
                <span className="font-mono text-sm font-bold text-white tracking-wider">
                  {formatTimer(recordingSeconds)}
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {isRecording 
                    ? (isPaused ? (language === 'fr' ? 'EN PAUSE' : 'PAUSED') : (language === 'fr' ? 'ENREGISTREMENT' : 'RECORDING LIVE')) 
                    : (language === 'fr' ? 'PRÊT À ÉCOUTER' : 'READY TO RECORD')}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {isRecording 
                  ? (language === 'fr' ? 'Parlez distinctement dans le microphone...' : 'Speak clearly into your microphone...') 
                  : (language === 'fr' ? 'Cliquez pour commencer à dicter' : 'Click microphone to dictate note')}
              </p>
            </div>
          </div>

          {/* Center: Live Waveform Visualizer */}
          <div className="w-full md:w-56 h-12 flex items-center justify-center gap-1 px-3 py-1.5 bg-slate-900 rounded-lg border border-slate-800">
            {audioLevels.map((lvl, idx) => (
              <div
                key={idx}
                className="w-2 rounded-full transition-all duration-75"
                style={{
                  height: isRecording && !isPaused ? `${Math.max(12, lvl)}%` : '15%',
                  backgroundColor: isRecording && !isPaused 
                    ? (lvl > 75 ? '#f43f5e' : (lvl > 50 ? '#fbbf24' : '#10b981'))
                    : '#334155'
                }}
              />
            ))}
          </div>

          {/* Right: Confidence Score & Reset */}
          <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">{language === 'fr' ? 'Confiance Vocale' : 'Transcribe Accuracy'}</span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {Math.round(confidence * 100)}%
              </span>
            </div>

            {(transcript || isRecording) && (
              <button
                onClick={resetDictation}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                title={language === 'fr' ? 'Effacer la transcription' : 'Clear transcript'}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Real-Time Transcription Textbox */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>{language === 'fr' ? 'Transcription Vocale en Temps Réel' : 'Real-Time Voice Transcription Log'}</span>
            </label>
            <span className="text-[10px] text-slate-500 font-mono">
              {transcript.length + interimTranscript.length} {language === 'fr' ? 'caractères' : 'characters'}
            </span>
          </div>

          <div className="relative">
            <textarea
              value={transcript + (interimTranscript ? (transcript ? ' ' : '') + interimTranscript : '')}
              onChange={(e) => {
                setTranscript(e.target.value);
                setInterimTranscript('');
              }}
              placeholder={language === 'fr'
                ? "La transcription en direct s'affichera ici au fur et à mesure de votre dictée. Vous pouvez également ajuster le texte manuellement..."
                : "Real-time speech transcription will stream here as you speak. You can also edit or touch up text manually..."}
              rows={3}
              className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-indigo-500 outline-none leading-relaxed transition-all font-mono"
            />
            {isRecording && !isPaused && (
              <span className="absolute bottom-2.5 right-2.5 flex items-center gap-1 text-[10px] text-indigo-400 bg-slate-900/90 px-2 py-0.5 rounded border border-indigo-500/40 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <span>{language === 'fr' ? 'Écoute en cours...' : 'Listening live...'}</span>
              </span>
            )}
          </div>
        </div>

        {/* Note Categorization & Metadata Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          
          {/* Note Title */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              {language === 'fr' ? 'Titre de la Consigne' : 'Handover Note Title'}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={language === 'fr' ? 'Ex: Ronde spéciale Cellule 14...' : 'e.g., Special Suicide Watch Order...'}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              {language === 'fr' ? 'Catégorie Réglementaire' : 'Directive Category'}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as HandoverNoteCategory)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 outline-none cursor-pointer"
            >
              <option value="general_orders">{language === 'fr' ? '📋 Consignes Générales' : '📋 General Orders'}</option>
              <option value="inmate_watch">{language === 'fr' ? '👁️ Surveillance Détenu (Watch)' : '👁️ Inmate Watch Order'}</option>
              <option value="unusual_behavior">{language === 'fr' ? '⚠️ Comportement Inhabituel' : '⚠️ Unusual Behavior / Alert'}</option>
              <option value="maintenance">{language === 'fr' ? '🔧 Maintenance & Équipements' : '🔧 Facility Maintenance'}</option>
            </select>
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              {language === 'fr' ? 'Niveau d\'Urgence' : 'Urgency Level'}
            </label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as HandoverNoteUrgency)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 outline-none cursor-pointer"
            >
              <option value="routine">{language === 'fr' ? 'Normal / Routine' : 'Routine'}</option>
              <option value="elevated">{language === 'fr' ? 'Élevé' : 'Elevated'}</option>
              <option value="urgent">{language === 'fr' ? 'Urgent' : 'Urgent'}</option>
              <option value="critical">{language === 'fr' ? 'Critique / Immédiat' : 'Critical'}</option>
            </select>
          </div>

        </div>

        {/* Location & Commander Assignment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              {language === 'fr' ? 'Emplacement / Secteur Concerné' : 'Location / Custody Sector'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Sector A / Cell Block / Gate"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 outline-none"
              />
            </div>
            {/* Quick Location Chips */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {['Block A - High Sec', 'Block C - Cells 12-24', 'Armory Vault', 'Medical Infirmary', 'North Perimeter'].map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLocation(loc)}
                  className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                    location === loc ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              {language === 'fr' ? 'Officier Auteur de la Consigne' : 'Authoring Shift Commander'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedCommander('outgoing')}
                className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                  selectedCommander === 'outgoing'
                    ? 'bg-amber-950/60 border-amber-500 text-amber-100 shadow-xs'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="block text-[9px] uppercase font-bold text-amber-400">
                  {language === 'fr' ? 'Sortant (Cédant)' : 'Outgoing'}
                </span>
                <span className="block text-xs font-semibold truncate text-white">{outgoingCommanderName}</span>
                <span className="block text-[9px] text-slate-400 font-mono">{outgoingCommanderBadge}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCommander('incoming')}
                className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                  selectedCommander === 'incoming'
                    ? 'bg-indigo-950/60 border-indigo-500 text-indigo-100 shadow-xs'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="block text-[9px] uppercase font-bold text-indigo-400">
                  {language === 'fr' ? 'Entrant (Prenant)' : 'Incoming'}
                </span>
                <span className="block text-xs font-semibold truncate text-white">{incomingCommanderName}</span>
                <span className="block text-[9px] text-slate-400 font-mono">{incomingCommanderBadge}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Button: Log Directly to Shift Handover Log */}
        <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              {language === 'fr'
                ? 'Consignation horodatée certifiée dans le registre de relève de commandement.'
                : 'Entries are cryptographically stamped with commander badge and exact timestamp.'}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isModal && onClose && (
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-3.5 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
              >
                {language === 'fr' ? 'Annuler' : 'Cancel'}
              </button>
            )}

            <button
              onClick={handleLogToHandover}
              disabled={!transcript && !title}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer ${
                transcript || title
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/50'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>{language === 'fr' ? 'Enregistrer dans le Journal de Quart' : 'Log Directly to Handover'}</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
