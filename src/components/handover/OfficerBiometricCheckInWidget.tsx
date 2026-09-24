import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Fingerprint, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  UserCheck, 
  UserX, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Download, 
  Copy, 
  Check, 
  Terminal, 
  Hash, 
  Activity, 
  Users, 
  Volume2, 
  VolumeX, 
  Sliders, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Flame, 
  Lock, 
  Shield, 
  Thermometer, 
  Cpu, 
  FileLock2, 
  Award, 
  Radio, 
  Crosshair, 
  Sparkles 
} from 'lucide-react';
import { 
  BiometricCheckInRecord, 
  BiometricScanStatus, 
  SecurityOfficer, 
  ShiftType, 
  Language, 
  OfficerDutyStatus 
} from '../../types';
import { INITIAL_SECURITY_OFFICERS } from '../../data/personnelData';
import { generateBiometricHash } from '../../data/biometricAttendanceData';
import { sha256Sync } from '../../utils/securityAuditLogger';

interface OfficerBiometricCheckInWidgetProps {
  language: Language;
  currentShift: ShiftType;
  facilityName: string;
  handoverRef: string;
  checkInRecords: BiometricCheckInRecord[];
  officersList?: SecurityOfficer[];
  onRecordCheckIn: (record: BiometricCheckInRecord) => void;
  commanderName?: string;
  commanderBadge?: string;
  compactView?: boolean;
}

export const OfficerBiometricCheckInWidget: React.FC<OfficerBiometricCheckInWidgetProps> = ({
  language,
  currentShift = 'morning',
  facilityName,
  handoverRef,
  checkInRecords = [],
  officersList = INITIAL_SECURITY_OFFICERS,
  onRecordCheckIn,
  commanderName = 'Capt. Marcus Vance',
  commanderBadge = 'KP-8421',
  compactView = false,
}) => {
  // Sound toggle
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  // Selected officer for check-in
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>(() => {
    // Pick the first officer that hasn't checked in yet, or the first officer
    const unchecked = officersList.find(o => !checkInRecords.some(r => r.officerId === o.id));
    return unchecked ? unchecked.id : (officersList[0]?.id || 'off-01');
  });

  // Selected finger type
  const [selectedFinger, setSelectedFinger] = useState<'Right Index' | 'Right Thumb' | 'Left Index' | 'Left Thumb'>('Right Index');

  // Scanner simulation phase
  // 'idle' | 'calibrating' | 'sweeping' | 'matching' | 'verified' | 'rejected'
  const [scanPhase, setScanPhase] = useState<'idle' | 'calibrating' | 'sweeping' | 'matching' | 'verified' | 'rejected'>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [lastScannedRecord, setLastScannedRecord] = useState<BiometricCheckInRecord | null>(null);

  // Minutiae discovery points (randomized or deterministic for visual HUD)
  const [minutiaeCount, setMinutiaeCount] = useState(0);

  // Manual Override Modal
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideOfficerId, setOverrideOfficerId] = useState('');

  // Table filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [copiedHashId, setCopiedHashId] = useState<string | null>(null);
  const [copiedTranscript, setCopiedTranscript] = useState(false);

  // Expanded hash drawers in table
  const [expandedHashes, setExpandedHashes] = useState<Record<string, boolean>>({});

  // Active terminal ID
  const terminalId = 'BIO-GATE-ALPHA-01';

  // Target selected officer
  const selectedOfficer = useMemo(() => {
    return officersList.find(o => o.id === selectedOfficerId) || officersList[0];
  }, [officersList, selectedOfficerId]);

  // Check if selected officer is already verified
  const selectedOfficerExistingRecord = useMemo(() => {
    return checkInRecords.find(r => r.officerId === selectedOfficerId);
  }, [checkInRecords, selectedOfficerId]);

  // Audio Feedback Synthesizer using Web Audio API
  const playAudio = (type: 'beep' | 'success' | 'fail') => {
    if (!isSoundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      if (type === 'beep') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(750, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'success') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(783.99, now + 0.1); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.2); // C6
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'fail') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.setValueAtTime(120, now + 0.12);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch {
      // AudioContext unavailable or restricted
    }
  };

  // Run Biometric Scan Simulation
  const handleStartFingerprintScan = (officerToScan?: SecurityOfficer, forceReject = false) => {
    const target = officerToScan || selectedOfficer;
    if (!target) return;

    // Reset state & start
    setScanPhase('calibrating');
    setScanProgress(5);
    setMinutiaeCount(0);
    playAudio('beep');

    // Timer sequence for hyper-realistic animation
    // Step 1: Calibrating optical glass & skin contact (0.3s)
    setTimeout(() => {
      setScanPhase('sweeping');
      setScanProgress(30);
      setMinutiaeCount(24);
      playAudio('beep');

      // Step 2: Sweeping laser beam & ridge contour analysis (0.8s)
      setTimeout(() => {
        setScanProgress(72);
        setMinutiaeCount(58);

        // Step 3: Cryptographic matching & database inquiry (1.4s)
        setTimeout(() => {
          setScanPhase('matching');
          setScanProgress(94);
          setMinutiaeCount(forceReject ? 14 : 76);

          // Step 4: Outcome (2.0s)
          setTimeout(() => {
            if (forceReject) {
              setScanPhase('rejected');
              setScanProgress(100);
              playAudio('fail');
            } else {
              setScanPhase('verified');
              setScanProgress(100);
              playAudio('success');

              const now = new Date();
              const formattedDate = now.toISOString().replace('T', ' ').substring(0, 19);
              const hhmm = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const confidence = parseFloat((99.1 + Math.random() * 0.8).toFixed(1));
              const pts = 72 + Math.floor(Math.random() * 8);

              const newRecord: BiometricCheckInRecord = {
                id: `bio-scan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                officerId: target.id,
                officerName: target.name,
                badgeNumber: target.badgeNumber,
                rank: target.rank,
                role: target.role,
                assignedSector: target.assignedSector,
                assignedPost: target.assignedPost,
                shift: currentShift,
                checkInTimestamp: formattedDate,
                checkInTime: hhmm,
                isoTimestamp: now.toISOString(),
                biometricType: 'fingerprint_optical',
                scannerTerminalId: terminalId,
                confidenceScore: confidence,
                minutiaePointsMatched: pts,
                verificationStatus: 'verified',
                dutyStatusAssigned: 'active_post',
                fingerScanned: selectedFinger,
                verificationHash: generateBiometricHash(target.badgeNumber, formattedDate, terminalId, pts, selectedFinger),
                bodyTempDegC: parseFloat((36.4 + Math.random() * 0.5).toFixed(1)),
                verifiedByCommander: `${commanderName} (${commanderBadge})`,
                notes: `Biometric attendance verified on ${terminalId}. All credentials and muster oath confirmed.`,
              };

              setLastScannedRecord(newRecord);
              onRecordCheckIn(newRecord);

              // Auto-advance selected officer to next pending officer
              const remainingUnchecked = officersList.filter(
                o => o.id !== target.id && !checkInRecords.some(r => r.officerId === o.id)
              );
              if (remainingUnchecked.length > 0) {
                setTimeout(() => {
                  setSelectedOfficerId(remainingUnchecked[0].id);
                }, 1200);
              }
            }
          }, 600);

        }, 500);

      }, 500);

    }, 400);
  };

  // Reset Scanner Pad to Idle
  const handleResetScanner = () => {
    setScanPhase('idle');
    setScanProgress(0);
    setMinutiaeCount(0);
  };

  // Execute Manual Override
  const handleConfirmManualOverride = () => {
    const target = officersList.find(o => o.id === overrideOfficerId);
    if (!target || !overrideReason.trim()) return;

    const now = new Date();
    const formattedDate = now.toISOString().replace('T', ' ').substring(0, 19);
    const hhmm = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const overrideRecord: BiometricCheckInRecord = {
      id: `bio-override-${Date.now()}`,
      officerId: target.id,
      officerName: target.name,
      badgeNumber: target.badgeNumber,
      rank: target.rank,
      role: target.role,
      assignedSector: target.assignedSector,
      assignedPost: target.assignedPost,
      shift: currentShift,
      checkInTimestamp: formattedDate,
      checkInTime: hhmm,
      isoTimestamp: now.toISOString(),
      biometricType: 'fingerprint_optical',
      scannerTerminalId: terminalId,
      confidenceScore: 100.0,
      minutiaePointsMatched: 0,
      verificationStatus: 'manual_override',
      dutyStatusAssigned: 'active_post',
      fingerScanned: selectedFinger,
      verificationHash: sha256Sync(`OVERRIDE|${target.badgeNumber}|${formattedDate}|${commanderBadge}|${overrideReason}`),
      bodyTempDegC: 36.6,
      overrideReason: overrideReason.trim(),
      verifiedByCommander: `${commanderName} (${commanderBadge})`,
      notes: `Manual attendance authorized by Watch Commander. Reason: ${overrideReason.trim()}`,
    };

    onRecordCheckIn(overrideRecord);
    setIsOverrideModalOpen(false);
    setOverrideReason('');
    setOverrideOfficerId('');
    playAudio('success');
  };

  // Copy Hash
  const handleCopyHash = async (hash: string, id: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHashId(id);
      setTimeout(() => setCopiedHashId(null), 2000);
    } catch {
      // ignore
    }
  };

  // Toggle Hash Accordion
  const toggleHashDrawer = (id: string) => {
    setExpandedHashes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Copy Full Biometric Muster Transcript
  const handleCopyTranscript = async () => {
    const lines = [
      `========================================================================`,
      `OFFICIAL BIOMETRIC OFFICER ATTENDANCE RECORD - SHIFT MUSTER`,
      `Facility: ${facilityName}`,
      `Handover Reference: ${handoverRef}`,
      `Shift: ${currentShift.toUpperCase()} | Terminal: ${terminalId}`,
      `Generated: ${new Date().toISOString()}`,
      `Supervising Watch Commander: ${commanderName} (${commanderBadge})`,
      `========================================================================`,
      `Total Scheduled Officers: ${officersList.length}`,
      `Biometrically Verified: ${checkInRecords.filter(r => r.verificationStatus === 'verified').length}`,
      `Manual Supervised Overrides: ${checkInRecords.filter(r => r.verificationStatus === 'manual_override').length}`,
      `Pending Check-in: ${officersList.length - checkInRecords.length}`,
      `------------------------------------------------------------------------`,
      `ATTENDANCE LEDGER:`,
    ];

    officersList.forEach(officer => {
      const record = checkInRecords.find(r => r.officerId === officer.id);
      if (record) {
        lines.push(
          `[VERIFIED ${record.checkInTime}] ${officer.rank} ${officer.name} (${officer.badgeNumber}) - ${officer.assignedPost} | Conf: ${record.confidenceScore}% | Seal: ${record.verificationHash.substring(0, 16)}...`
        );
      } else {
        lines.push(
          `[PENDING] ${officer.rank} ${officer.name} (${officer.badgeNumber}) - ${officer.assignedPost}`
        );
      }
    });

    lines.push(`========================================================================`);
    lines.push(`Certified under Section 42 of Prison Operational Security Standards.`);

    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopiedTranscript(true);
      setTimeout(() => setCopiedTranscript(false), 2500);
    } catch {
      // ignore
    }
  };

  // Export JSON Manifest
  const handleExportJson = () => {
    const payload = {
      meta: {
        facilityName,
        handoverRef,
        currentShift,
        terminalId,
        commander: commanderName,
        commanderBadge,
        exportTimestamp: new Date().toISOString(),
        totalScheduled: officersList.length,
        totalCheckedIn: checkInRecords.length,
      },
      checkInRecords,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BIOMETRIC_ATTENDANCE_${handoverRef.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // KPIs & Attendance Stats
  const stats = useMemo(() => {
    const total = officersList.length;
    const verified = checkInRecords.filter(r => r.verificationStatus === 'verified').length;
    const overrides = checkInRecords.filter(r => r.verificationStatus === 'manual_override').length;
    const checkedInCount = verified + overrides;
    const pending = Math.max(0, total - checkedInCount);
    const complianceRate = total > 0 ? Math.round((checkedInCount / total) * 100) : 100;
    
    // Average body temp
    const temps = checkInRecords.map(r => r.bodyTempDegC).filter(Boolean) as number[];
    const avgTemp = temps.length > 0 ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1) : '36.6';

    return { total, verified, overrides, checkedInCount, pending, complianceRate, avgTemp };
  }, [officersList, checkInRecords]);

  // Sectors for filter
  const sectors = useMemo(() => {
    const set = new Set<string>();
    officersList.forEach(o => {
      if (o.assignedSector) set.add(o.assignedSector);
    });
    return Array.from(set);
  }, [officersList]);

  // Filtered officers list for roster table
  const filteredOfficers = useMemo(() => {
    return officersList.filter(officer => {
      const record = checkInRecords.find(r => r.officerId === officer.id);
      
      // Status filter
      if (statusFilter === 'verified' && !record) return false;
      if (statusFilter === 'pending' && record) return false;

      // Sector filter
      if (sectorFilter !== 'all' && officer.assignedSector !== sectorFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = officer.name.toLowerCase().includes(q);
        const matchesBadge = officer.badgeNumber.toLowerCase().includes(q);
        const matchesPost = officer.assignedPost.toLowerCase().includes(q);
        const matchesRole = officer.role.toLowerCase().includes(q);
        const matchesRank = officer.rank.toLowerCase().includes(q);
        return matchesName || matchesBadge || matchesPost || matchesRole || matchesRank;
      }

      return true;
    });
  }, [officersList, checkInRecords, statusFilter, sectorFilter, searchQuery]);

  // ----------------------------------------------------
  // COMPACT VIEW (For Executive Summary Overview Card)
  // ----------------------------------------------------
  if (compactView) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white shadow-lg space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/80">
              <Fingerprint className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  {language === 'fr' ? 'Pointage Biométrique des Agents' : 'Officer Biometric Check-in'}
                </h3>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {stats.checkedInCount} / {stats.total} {language === 'fr' ? 'agents émargés' : 'officers verified'} ({stats.complianceRate}%)
              </span>
            </div>
          </div>

          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border flex items-center gap-1 ${
            stats.complianceRate >= 90
              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
              : stats.complianceRate >= 70
              ? 'bg-amber-950 text-amber-300 border-amber-800'
              : 'bg-rose-950 text-rose-300 border-rose-800'
          }`}>
            <CheckCircle2 className="w-3 h-3" />
            <span>{stats.complianceRate}% {language === 'fr' ? 'CONFORME' : 'MUSTERING'}</span>
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
          <div 
            className="bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 h-full transition-all duration-500"
            style={{ width: `${stats.complianceRate}%` }}
          />
        </div>

        {/* Recent 3 Checked-In Officers */}
        <div className="space-y-1.5">
          {checkInRecords.slice(-3).reverse().map(rec => (
            <div key={rec.id} className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <div>
                  <span className="font-semibold text-white text-xs">{rec.officerName}</span>
                  <span className="text-[10px] text-slate-400 font-mono block">{rec.badgeNumber} &bull; {rec.assignedPost}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-cyan-400 font-bold">{rec.checkInTime}</span>
                <span className="text-[9px] font-mono text-slate-500 block">{rec.confidenceScore}% conf</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-[10px] text-slate-400 bg-slate-950/80 px-3 py-1.5 rounded-md border border-slate-800 flex items-center justify-between font-mono">
          <span>TERMINAL: {terminalId}</span>
          <span className="text-cyan-400 flex items-center gap-1">
            <Cpu className="w-3 h-3" />
            <span>OPTICAL 500 DPI</span>
          </span>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // FULL VIEW (Dedicated Biometric Check-In Center)
  // ----------------------------------------------------
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl text-white overflow-hidden space-y-6 p-5 sm:p-6">
      
      {/* 1. Header & Terminal HUD */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-950 to-slate-900 text-cyan-400 border border-cyan-700/60 shadow-inner">
            <Fingerprint className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>{language === 'fr' ? 'Poste de Pointage Biométrique des Surveillants' : 'Officer Biometric Check-In & Time-Stamped Attendance'}</span>
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                LIVE HARDWARE HUD
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>ANTI-SPOOF ACTIVE</span>
              </span>
            </div>
            
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              {facilityName} &bull; <strong className="text-cyan-400">{handoverRef}</strong> &bull; {currentShift.toUpperCase()} SHIFT MUSTER &bull; <span className="text-slate-300">{terminalId}</span>
            </p>
          </div>
        </div>

        {/* Quick Actions: Sound, Manual Override, Export, Copy */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            className={`p-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
              isSoundEnabled 
                ? 'bg-slate-800 text-cyan-400 border-slate-700' 
                : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
            title={isSoundEnabled ? 'Audio feedback enabled' : 'Audio feedback muted'}
          >
            {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Manual Override Button */}
          <button
            type="button"
            onClick={() => {
              setOverrideOfficerId(selectedOfficerId);
              setIsOverrideModalOpen(true);
            }}
            className="px-2.5 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 hover:text-white border border-indigo-700/80 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Manual supervisor override for bandaged or injured finger"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>{language === 'fr' ? 'Dérogation Superviseur' : 'Manual Override'}</span>
          </button>

          {/* Export JSON */}
          <button
            type="button"
            onClick={handleExportJson}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Download JSON Biometric Records"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>JSON</span>
          </button>

          {/* Copy Transcript */}
          <button
            type="button"
            onClick={handleCopyTranscript}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Copy biometric muster manifest to clipboard"
          >
            {copiedTranscript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copiedTranscript ? (language === 'fr' ? 'Copié !' : 'Copied !') : (language === 'fr' ? 'Copier Émargement' : 'Copy Manifest')}</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Total Scheduled */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">
            {language === 'fr' ? 'Effectif Prévu' : 'Total Scheduled'}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-white">{stats.total}</span>
            <span className="text-[10px] text-slate-400 font-mono">Officers</span>
          </div>
        </div>

        {/* Biometrically Verified */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-mono block flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>{language === 'fr' ? 'Émargés par Empreinte' : 'Biometric Verified'}</span>
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-400">{stats.verified}</span>
            <span className="text-[10px] text-emerald-400/80 font-mono">Confirmed</span>
          </div>
        </div>

        {/* Pending Muster */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-mono block flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>{language === 'fr' ? 'En Attente de Pointage' : 'Pending Muster'}</span>
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-2xl font-black ${stats.pending > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
              {stats.pending}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">{stats.pending > 0 ? 'Awaiting Scan' : 'All Clear'}</span>
          </div>
        </div>

        {/* Muster Compliance Rate */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">
            {language === 'fr' ? 'Taux d\'Émargement' : 'Muster Compliance'}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-cyan-300">{stats.complianceRate}%</span>
            <span className="text-[10px] text-cyan-400 font-mono">Target: 100%</span>
          </div>
        </div>

        {/* Average Vitals Screen */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono block flex items-center gap-1">
            <Thermometer className="w-3 h-3 text-rose-400" />
            <span>{language === 'fr' ? 'Télémétrie Thermique' : 'Thermal Vital Check'}</span>
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-rose-300">{stats.avgTemp}&deg;C</span>
            <span className="text-[10px] text-emerald-400 font-mono">Normal Range</span>
          </div>
        </div>
      </div>

      {/* 3. Main Scanner Interactive Deck (Split View: Interactive Scanner + Officer Staging) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT / CENTER: The High-Tech Optical Fingerprint Scanner Glass (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col items-center justify-between text-center relative overflow-hidden shadow-2xl">
          
          {/* Subtle Cyber Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

          {/* Top Bezel Status */}
          <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-400 z-10 border-b border-slate-800 pb-2 mb-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-cyan-400 font-bold uppercase">{terminalId}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>PRISM 500 DPI</span>
              <span>&bull;</span>
              <span className="text-emerald-400">READY</span>
            </div>
          </div>

          {/* Finger Selection Pills */}
          <div className="w-full flex items-center justify-center gap-1 mb-4 z-10">
            {(['Right Index', 'Right Thumb', 'Left Index', 'Left Thumb'] as const).map(finger => (
              <button
                key={finger}
                type="button"
                onClick={() => setSelectedFinger(finger)}
                disabled={scanPhase !== 'idle' && scanPhase !== 'verified' && scanPhase !== 'rejected'}
                className={`px-2 py-1 rounded text-[10px] font-mono font-semibold transition-all cursor-pointer ${
                  selectedFinger === finger
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {finger}
              </button>
            ))}
          </div>

          {/* THE OPTICAL GLASS PRISM SCANNER PAD */}
          <div className="relative my-2 z-10 group">
            
            {/* Outer Protective Bezel */}
            <div className={`w-52 h-64 sm:w-56 sm:h-72 rounded-3xl p-3 flex flex-col items-center justify-center transition-all duration-500 relative cursor-pointer select-none ${
              scanPhase === 'verified'
                ? 'bg-gradient-to-b from-emerald-950 to-slate-950 border-2 border-emerald-500 shadow-[0_0_35px_rgba(16,185,129,0.35)]'
                : scanPhase === 'rejected'
                ? 'bg-gradient-to-b from-rose-950 to-slate-950 border-2 border-rose-500 shadow-[0_0_35px_rgba(244,63,94,0.35)]'
                : scanPhase === 'sweeping' || scanPhase === 'matching'
                ? 'bg-gradient-to-b from-cyan-950 to-slate-950 border-2 border-cyan-400 animate-scan-glow'
                : 'bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-slate-700 hover:border-cyan-500 shadow-lg'
            }`}
            onClick={() => {
              if (scanPhase === 'idle' || scanPhase === 'verified' || scanPhase === 'rejected') {
                handleStartFingerprintScan();
              }
            }}
            >
              {/* Four Corner Reticle Brackets */}
              <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
              <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
              <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

              {/* Concentric Guide Rings */}
              <div className="absolute inset-4 rounded-2xl border border-dashed border-cyan-500/20 pointer-events-none" />
              <div className="absolute w-36 h-48 rounded-full border border-cyan-500/15 pointer-events-none" />

              {/* LASER SWEEP BEAM (Active during scan) */}
              {(scanPhase === 'calibrating' || scanPhase === 'sweeping' || scanPhase === 'matching') && (
                <div 
                  className="absolute left-2 right-2 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-laser-sweep pointer-events-none z-20"
                />
              )}

              {/* FINGERPRINT SVG GLYPH WITH MINUTIAE OVERLAY */}
              <div className="relative w-28 h-40 flex items-center justify-center">
                <svg 
                  viewBox="0 0 24 24" 
                  className={`w-28 h-40 transition-colors duration-300 ${
                    scanPhase === 'verified'
                      ? 'text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.8)]'
                      : scanPhase === 'rejected'
                      ? 'text-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.8)]'
                      : scanPhase === 'sweeping' || scanPhase === 'matching'
                      ? 'text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]'
                      : 'text-slate-600 group-hover:text-cyan-500/70'
                  }`}
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
                  <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
                  <path d="M2 16h.01" />
                  <path d="M21.8 16c.2-2 .131-5.354 0-6" />
                  <path d="M9 6.8a6 6 0 0 1 9 5.2v2" />
                  <path d="M5.5 10A8.5 8.5 0 0 1 12 4a8.5 8.5 0 0 1 8.5 6c0 1.8.1 4.5 0 6.5" />
                  <path d="M17.5 17.5c-.5 1.5-1.5 3.5-3.5 4.5" />
                  <path d="M6 14.5c.5 2 1.5 4.5 3.5 5.5" />
                  <path d="M9 13a3 3 0 0 1 6 0v2" />
                  <path d="M4 18c0-3 0-6 1-8" />
                  <path d="M12 2v2" />
                  <path d="M7 3.5 8 5" />
                  <path d="M17 3.5 16 5" />
                </svg>

                {/* Simulated Minutiae Bifurcation Points (Glowing yellow/cyan dots) */}
                {(scanPhase === 'sweeping' || scanPhase === 'matching' || scanPhase === 'verified') && (
                  <>
                    <div className="absolute top-4 left-6 w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_6px_#67e8f9] animate-ping" />
                    <div className="absolute top-10 right-7 w-1.5 h-1.5 rounded-full bg-emerald-300 shadow-[0_0_6px_#6ee7b7]" />
                    <div className="absolute top-16 left-9 w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_#fcd34d]" />
                    <div className="absolute bottom-10 right-9 w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_6px_#67e8f9]" />
                    <div className="absolute bottom-6 left-8 w-1.5 h-1.5 rounded-full bg-emerald-300 shadow-[0_0_6px_#6ee7b7]" />
                  </>
                )}

                {/* Verification Overlay Badge */}
                {scanPhase === 'verified' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 rounded-2xl animate-in zoom-in-75 duration-200">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                    <span className="text-xs font-black text-emerald-300 font-mono tracking-widest mt-1">
                      MATCH CONFIRMED
                    </span>
                    <span className="text-[10px] text-slate-300 font-mono">99.6% Confidence</span>
                  </div>
                )}

                {scanPhase === 'rejected' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 rounded-2xl animate-in zoom-in-75 duration-200">
                    <XCircle className="w-12 h-12 text-rose-500" />
                    <span className="text-xs font-black text-rose-300 font-mono tracking-widest mt-1">
                      REJECTED
                    </span>
                    <span className="text-[10px] text-slate-300 font-mono">Minutiae Discrepancy</span>
                  </div>
                )}
              </div>

              {/* Touch Instruction */}
              <div className="mt-3 text-[11px] font-mono tracking-wider font-semibold z-10">
                {scanPhase === 'idle' && (
                  <span className="text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1">
                    <Crosshair className="w-3.5 h-3.5 animate-spin" />
                    <span>{language === 'fr' ? 'TOUCHER POUR SCANNER' : 'TOUCH TO ACQUIRE SCAN'}</span>
                  </span>
                )}
                {scanPhase === 'calibrating' && (
                  <span className="text-cyan-300 animate-pulse">
                    {language === 'fr' ? 'CALIBRATION OPTIQUE...' : 'CALIBRATING OPTICAL SENSOR...'}
                  </span>
                )}
                {scanPhase === 'sweeping' && (
                  <span className="text-cyan-300 animate-pulse">
                    {language === 'fr' ? 'EXTRACTION DES MINUTIES...' : 'EXTRACTING MINUTIAE RIDGES...'}
                  </span>
                )}
                {scanPhase === 'matching' && (
                  <span className="text-indigo-300 animate-pulse">
                    {language === 'fr' ? 'RECHERCHE BASE NATIONALE...' : 'MATCHING AGAINST CORRECTIONAL DB...'}
                  </span>
                )}
                {scanPhase === 'verified' && (
                  <span className="text-emerald-400 font-bold">
                    {language === 'fr' ? 'IDENTITÉ AUTHENTIFIÉE' : 'IDENTITY CONFIRMED'}
                  </span>
                )}
                {scanPhase === 'rejected' && (
                  <span className="text-rose-400 font-bold">
                    {language === 'fr' ? 'REJET - CONTRÔLE ÉCHOUÉ' : 'REJECTED - MATCH FAILED'}
                  </span>
                )}
              </div>

            </div>
          </div>

          {/* Progress Bar & Minutiae Telemetry */}
          <div className="w-full space-y-2 mt-2 z-10">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>SCAN PROGRESS: {scanProgress}%</span>
              <span>MINUTIAE: {minutiaeCount} PTS</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
              <div 
                className={`h-full transition-all duration-300 ${
                  scanPhase === 'verified' ? 'bg-emerald-400' :
                  scanPhase === 'rejected' ? 'bg-rose-500' :
                  'bg-cyan-400'
                }`}
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </div>

          {/* Trigger & Testing Buttons */}
          <div className="w-full grid grid-cols-2 gap-2 mt-4 z-10">
            <button
              type="button"
              onClick={() => handleStartFingerprintScan()}
              disabled={scanPhase !== 'idle' && scanPhase !== 'verified' && scanPhase !== 'rejected'}
              className="px-3 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Fingerprint className="w-4 h-4" />
              <span>{language === 'fr' ? 'Scanner Empreinte' : 'Scan Fingerprint'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleStartFingerprintScan(undefined, true)}
              disabled={scanPhase !== 'idle' && scanPhase !== 'verified' && scanPhase !== 'rejected'}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 text-xs font-semibold transition-all border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
              title="Demonstrate rejection handling for unverified or smudged fingerprint"
            >
              <XCircle className="w-4 h-4 text-rose-400" />
              <span>{language === 'fr' ? 'Tester Rejet' : 'Test Reject'}</span>
            </button>
          </div>

          {/* Scanner Reset Link if completed */}
          {(scanPhase === 'verified' || scanPhase === 'rejected') && (
            <button
              type="button"
              onClick={handleResetScanner}
              className="mt-2 text-[11px] font-mono text-cyan-400 hover:underline cursor-pointer"
            >
              {language === 'fr' ? 'Réinitialiser le lecteur pour le prochain agent' : 'Reset scanner pad for next officer'} &rarr;
            </button>
          )}

        </div>

        {/* RIGHT: Selected Officer Staging Card & Recent Scan Seal (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          
          {/* Active Staged Officer Card */}
          <div className="bg-slate-950/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  {language === 'fr' ? 'Surveillant Présenté au Lecteur' : 'Officer Staged for Biometric Acquisition'}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <h3 className="text-base font-black text-white">{selectedOfficer.name}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {selectedOfficer.badgeNumber}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div>
                {selectedOfficerExistingRecord ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{language === 'fr' ? 'ÉMARGÉ À' : 'CHECKED IN AT'} {selectedOfficerExistingRecord.checkInTime}</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1.5 animate-pulse">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{language === 'fr' ? 'EN ATTENTE D\'ÉMARGEMENT' : 'PENDING BIOMETRIC SCAN'}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Officer Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">{language === 'fr' ? 'Grade & Rôle' : 'Rank & Duty Role'}</span>
                <strong className="text-white block mt-0.5 text-xs truncate">{selectedOfficer.rank}</strong>
                <span className="text-[11px] text-slate-400 truncate block">{selectedOfficer.role}</span>
              </div>

              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">{language === 'fr' ? 'Poste d\'Affectation' : 'Assigned Post'}</span>
                <strong className="text-cyan-300 block mt-0.5 text-xs truncate">{selectedOfficer.assignedPost}</strong>
                <span className="text-[11px] text-slate-400 truncate block">{selectedOfficer.assignedSector}</span>
              </div>

              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">{language === 'fr' ? 'Indicatif Radio' : 'Radio & Comm'}</span>
                <strong className="text-indigo-300 block mt-0.5 text-xs truncate">{selectedOfficer.callSign}</strong>
                <span className="text-[11px] text-slate-400 truncate block">{selectedOfficer.radioChannel}</span>
              </div>
            </div>

            {/* Equipment & Tactical Vest Assignment */}
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                <span><strong>Arme :</strong> {selectedOfficer.weaponIssued}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <span><strong>Caméra :</strong> {selectedOfficer.bodyCamIssued}</span>
                <span>&bull;</span>
                <span className={selectedOfficer.tacticalVest ? 'text-emerald-400' : 'text-slate-500'}>
                  {selectedOfficer.tacticalVest ? 'Gilet Pare-balles OK' : 'No Vest'}
                </span>
              </div>
            </div>

            {/* Rapid Selector for other scheduled officers */}
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1.5">
                {language === 'fr' ? 'Changer d\'agent à faire pointer :' : 'Select officer to stage for check-in:'}
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedOfficerId}
                  onChange={e => setSelectedOfficerId(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
                >
                  {officersList.map(off => {
                    const isChecked = checkInRecords.some(r => r.officerId === off.id);
                    return (
                      <option key={off.id} value={off.id}>
                        {isChecked ? '✓' : '⏳'} {off.badgeNumber} - {off.rank} {off.name} ({off.assignedPost})
                      </option>
                    );
                  })}
                </select>

                <button
                  type="button"
                  onClick={() => {
                    const unchecked = officersList.find(o => !checkInRecords.some(r => r.officerId === o.id));
                    if (unchecked) setSelectedOfficerId(unchecked.id);
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors shrink-0 cursor-pointer"
                  title="Select next officer waiting for check-in"
                >
                  {language === 'fr' ? 'Suivant Non Émargé' : 'Next Pending'} &rarr;
                </button>
              </div>
            </div>

          </div>

          {/* Cryptographic Proof Card of the Last Verified Check-In */}
          {lastScannedRecord && (
            <div className="bg-emerald-950/30 border border-emerald-800/80 rounded-2xl p-4 space-y-2 text-xs animate-in fade-in-50 duration-300">
              <div className="flex items-center justify-between border-b border-emerald-800/50 pb-2">
                <div className="flex items-center gap-2">
                  <FileLock2 className="w-4 h-4 text-emerald-400" />
                  <strong className="text-emerald-300 uppercase tracking-wider font-mono text-[11px]">
                    {language === 'fr' ? 'Sceau Cryptographique SHA-256 Confirmé' : 'Biometric Timestamp & SHA-256 Ledger Seal'}
                  </strong>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  {lastScannedRecord.checkInTime}
                </span>
              </div>

              <p className="text-slate-300 leading-relaxed text-xs">
                {lastScannedRecord.officerName} ({lastScannedRecord.badgeNumber}) {language === 'fr' ? 'a validé sa prise de service par empreinte digitale' : 'has recorded verified biometric attendance'} ({lastScannedRecord.fingerScanned}) {language === 'fr' ? 'au terminal' : 'on terminal'} {lastScannedRecord.scannerTerminalId}. Minuties : {lastScannedRecord.minutiaePointsMatched} pts.
              </p>

              <div className="flex items-center justify-between text-[10px] font-mono bg-slate-950/80 p-2 rounded-lg border border-emerald-900/60 text-slate-400">
                <span className="truncate max-w-[280px] sm:max-w-md text-emerald-400 font-mono">
                  SHA-256: {lastScannedRecord.verificationHash}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyHash(lastScannedRecord.verificationHash, 'last-scan')}
                  className="text-cyan-400 hover:text-cyan-300 shrink-0 ml-2 cursor-pointer flex items-center gap-1"
                >
                  {copiedHashId === 'last-scan' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedHashId === 'last-scan' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 4. Complete Shift Muster Roster & Biometric Attendance Ledger */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>{language === 'fr' ? 'Registre d\'Appel & Statut Biométrique du Poste' : 'Shift Muster Attendance & Biometric Status Roster'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {language === 'fr' 
                ? 'Statut en temps réel de chaque poste fixe et sentinelle armée. Pointage inviolable.' 
                : 'Real-time muster status for every mandatory fixed post and armed sentry.'}
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={language === 'fr' ? 'Filtrer agent, matricule, poste...' : 'Search officer, badge, post...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-cyan-500 font-mono"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 text-xs">
              {(['all', 'verified', 'pending'] as const).map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold capitalize transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Sector Dropdown */}
            <select
              value={sectorFilter}
              onChange={e => setSectorFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 font-mono"
            >
              <option value="all">{language === 'fr' ? 'Tous les secteurs' : 'All Sectors'}</option>
              {sectors.map(sec => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-slate-950/80 rounded-xl border border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <th className="py-2.5 px-3">{language === 'fr' ? 'Agent & Matricule' : 'Officer & Badge'}</th>
                <th className="py-2.5 px-3">{language === 'fr' ? 'Poste & Secteur' : 'Post & Sector'}</th>
                <th className="py-2.5 px-3">{language === 'fr' ? 'Statut Biométrique' : 'Biometric Attendance'}</th>
                <th className="py-2.5 px-3">{language === 'fr' ? 'Heure Pointage' : 'Timestamp'}</th>
                <th className="py-2.5 px-3">{language === 'fr' ? 'Sceau & Minuties' : 'Minutiae / Confidence'}</th>
                <th className="py-2.5 px-3 text-right">{language === 'fr' ? 'Actions' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredOfficers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-500 font-mono">
                    {language === 'fr' ? 'Aucun surveillant ne correspond aux filtres' : 'No officers match current filter'}
                  </td>
                </tr>
              ) : (
                filteredOfficers.map(officer => {
                  const record = checkInRecords.find(r => r.officerId === officer.id);
                  const isVerified = record?.verificationStatus === 'verified';
                  const isOverride = record?.verificationStatus === 'manual_override';
                  const isSelected = officer.id === selectedOfficerId;
                  const isExpanded = !!expandedHashes[officer.id];

                  return (
                    <React.Fragment key={officer.id}>
                      <tr className={`hover:bg-slate-900/60 transition-colors ${
                        isSelected ? 'bg-cyan-950/20' : ''
                      }`}>
                        
                        {/* Officer & Badge */}
                        <td className="py-2.5 px-3 font-mono">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              isVerified ? 'bg-emerald-400' : isOverride ? 'bg-indigo-400' : 'bg-amber-400 animate-pulse'
                            }`} />
                            <div>
                              <strong className="text-white block text-xs">{officer.name}</strong>
                              <span className="text-[10px] text-slate-400">{officer.badgeNumber} &bull; {officer.rank}</span>
                            </div>
                          </div>
                        </td>

                        {/* Post & Sector */}
                        <td className="py-2.5 px-3">
                          <span className="text-xs text-slate-200 block font-medium">{officer.assignedPost}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{officer.assignedSector}</span>
                        </td>

                        {/* Status Badge */}
                        <td className="py-2.5 px-3">
                          {isVerified ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>VERIFIED FINGERPRINT</span>
                            </span>
                          ) : isOverride ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                              <Shield className="w-3 h-3 text-indigo-400" />
                              <span>SUPERVISED OVERRIDE</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800 animate-pulse">
                              <Clock className="w-3 h-3 text-amber-400" />
                              <span>PENDING CHECK-IN</span>
                            </span>
                          )}
                        </td>

                        {/* Timestamp */}
                        <td className="py-2.5 px-3 font-mono text-xs">
                          {record ? (
                            <div>
                              <strong className="text-white text-xs block">{record.checkInTime}</strong>
                              <span className="text-[10px] text-slate-500">{record.checkInTimestamp.substring(11, 19)}</span>
                            </div>
                          ) : (
                            <span className="text-slate-600 font-mono text-[10px]">&mdash; Awaiting Muster &mdash;</span>
                          )}
                        </td>

                        {/* Minutiae / Confidence & Hash Link */}
                        <td className="py-2.5 px-3 font-mono text-[11px]">
                          {record ? (
                            <div>
                              <div className="flex items-center gap-1 text-slate-300">
                                <span className="text-emerald-400 font-bold">{record.confidenceScore}%</span>
                                <span>&bull;</span>
                                <span>{record.minutiaePointsMatched} pts</span>
                                <span>&bull;</span>
                                <span className="text-rose-300">{record.bodyTempDegC}&deg;C</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => toggleHashDrawer(officer.id)}
                                className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 mt-0.5 cursor-pointer"
                              >
                                <span>SHA-256 Seal</span>
                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-600 font-mono text-[10px]">&mdash;</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-2.5 px-3 text-right">
                          {record ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedOfficerId(officer.id);
                                handleStartFingerprintScan(officer);
                              }}
                              className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-[10px] font-mono transition-colors cursor-pointer"
                              title="Re-scan or re-verify biometric credentials"
                            >
                              Re-Scan
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedOfficerId(officer.id);
                                handleStartFingerprintScan(officer);
                              }}
                              className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-[10px] shadow-xs transition-all cursor-pointer active:scale-95 flex items-center gap-1 ml-auto"
                            >
                              <Fingerprint className="w-3 h-3" />
                              <span>Scan Now</span>
                            </button>
                          )}
                        </td>

                      </tr>

                      {/* Expandable Cryptographic Seal Row */}
                      {isExpanded && record && (
                        <tr className="bg-slate-950">
                          <td colSpan={6} className="p-3 border-t border-slate-800">
                            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1.5 font-mono text-[11px]">
                              <div className="flex items-center justify-between text-[10px] text-slate-400">
                                <span>VERIFICATION HASH (SHA-256 IMMUTABLE SEAL):</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyHash(record.verificationHash, officer.id)}
                                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                                >
                                  {copiedHashId === officer.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                  <span>{copiedHashId === officer.id ? 'Copied' : 'Copy'}</span>
                                </button>
                              </div>
                              <div className="bg-slate-950 p-2 rounded border border-slate-800 text-emerald-400 break-all text-[10px]">
                                {record.verificationHash}
                              </div>
                              <div className="text-[10px] text-slate-400 flex flex-wrap items-center gap-3 pt-1">
                                <span>Terminal: {record.scannerTerminalId}</span>
                                <span>&bull;</span>
                                <span>Finger: {record.fingerScanned}</span>
                                <span>&bull;</span>
                                <span>Supervisor: {record.verifiedByCommander}</span>
                                {record.overrideReason && (
                                  <>
                                    <span>&bull;</span>
                                    <span className="text-amber-300">Justification: {record.overrideReason}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}

                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MODAL: Manual Supervisor Attendance Override */}
      {isOverrideModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in-50 duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {language === 'fr' ? 'Dérogation Manuelle de Pointage' : 'Supervised Biometric Override'}
                  </h3>
                  <p className="text-[10px] font-mono text-slate-400">
                    {language === 'fr' ? 'Attestation officielle sous serment' : 'Executive Muster Discretion'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOverrideModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {language === 'fr' 
                ? 'Cette dérogation autorise l\'émargement exceptionnel d\'un surveillant présentant une blessure au doigt, un pansement ou une défaillance cutanée temporaire.'
                : 'Authorize an exception for an officer unable to acquire an optical fingerprint due to dermatological injury, medical dressing, or physical obstruction.'}
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                  {language === 'fr' ? 'Surveillant Concerné :' : 'Target Officer:'}
                </label>
                <select
                  value={overrideOfficerId}
                  onChange={e => setOverrideOfficerId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono"
                >
                  {officersList.map(off => (
                    <option key={off.id} value={off.id}>
                      {off.badgeNumber} - {off.rank} {off.name} ({off.assignedPost})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                  {language === 'fr' ? 'Motif Obligatoire de la Dérogation :' : 'Mandatory Override Justification (Logged to Tamper Audit):'}
                </label>
                <textarea
                  rows={3}
                  value={overrideReason}
                  onChange={e => setOverrideReason(e.target.value)}
                  placeholder={language === 'fr' 
                    ? 'Ex: Pansement médical à l\'index droit suite à une coupure en atelier. Identité vérifiée visuellement par le commandant.' 
                    : 'e.g., Medical dressing on right index finger following workshop maintenance cut. Identity visually confirmed by Watch Commander.'}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="bg-indigo-950/40 p-3 rounded-lg border border-indigo-900/60 text-[11px] font-mono text-indigo-300">
                <span className="block font-bold">AUTHORIZING SUPERVISOR:</span>
                <span>{commanderName} (Badge #{commanderBadge})</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsOverrideModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                {language === 'fr' ? 'Annuler' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmManualOverride}
                disabled={!overrideReason.trim()}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                {language === 'fr' ? 'Enregistrer la Dérogation' : 'Confirm Override & Seal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Footer Legal Compliance Certification */}
      <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            {language === 'fr' 
              ? 'Émargement biométrique conforme à la section 42 des Normes de Sécurité Pénitentiaire. Horodatage infalsifiable.' 
              : 'Biometric muster certified under Section 42 of Prison Safety Operational Standards. Non-repudiation enforced.'}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] shrink-0">
          <span>TERMINAL {terminalId}</span>
          <span>&bull;</span>
          <span className="text-cyan-400 font-bold">100% ACCOUNTABLE</span>
        </div>
      </div>

    </div>
  );
};
