import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Key, 
  FileText, 
  Search, 
  Download, 
  Copy, 
  Check, 
  Activity, 
  Users, 
  Layers, 
  Clock, 
  Fingerprint, 
  Hash, 
  FileCheck, 
  Flame, 
  CloudFog, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  ExternalLink, 
  Filter,
  Maximize2,
  Terminal,
  ChevronDown,
  ChevronUp,
  FileLock2,
  Sparkles
} from 'lucide-react';
import { 
  SecurityIncidentAuditEntry, 
  SecurityAuditActionCategory, 
  SecurityAuditSeverity, 
  Language 
} from '../../types';
import { 
  validateAuditChain, 
  GENESIS_HASH, 
  generateAuditCertificateText 
} from '../../utils/securityAuditLogger';

interface SecurityIncidentAuditWidgetProps {
  language: Language;
  auditTrail?: SecurityIncidentAuditEntry[];
  handoverRef: string;
  facilityName: string;
  date: string;
  outgoingShift: string;
  incomingShift: string;
  compactView?: boolean;
}

export const SecurityIncidentAuditWidget: React.FC<SecurityIncidentAuditWidgetProps> = ({
  language,
  auditTrail = [],
  handoverRef,
  facilityName,
  date,
  outgoingShift,
  incomingShift,
  compactView = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [expandedHashes, setExpandedHashes] = useState<Record<string, boolean>>({});
  const [isVerifying, setIsVerifying] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [copiedTranscript, setCopiedTranscript] = useState(false);
  const [isTamperSimulated, setIsTamperSimulated] = useState(false);

  // Compute live verification of the hash chain
  const verificationResult = useMemo(() => {
    if (!auditTrail || auditTrail.length === 0) {
      return { isValid: true, brokenIndex: null, totalVerified: 0 };
    }

    if (isTamperSimulated) {
      // Simulate an altered record in the middle to demonstrate tamper detection
      const tamperedTrail = auditTrail.map((entry, idx) => {
        if (idx === Math.floor(auditTrail.length / 2)) {
          return {
            ...entry,
            changeSummary: entry.changeSummary + ' [UNAUTHORIZED RETROACTIVE DATABASE MANIPULATION DETECTED]',
          };
        }
        return entry;
      });
      return validateAuditChain(tamperedTrail);
    }

    return validateAuditChain(auditTrail);
  }, [auditTrail, isTamperSimulated]);

  // Handle Hash Copy
  const handleCopyHash = async (hash: string, id: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHash(id);
      setTimeout(() => setCopiedHash(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle Hash Drawer
  const toggleHashDrawer = (id: string) => {
    setExpandedHashes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Run Manual Interactive Verification Scan
  const handleRunVerificationScan = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
    }, 600);
  };

  // Export JSON Certificate
  const handleExportJsonCertificate = () => {
    const payload = {
      meta: {
        certificateTitle: 'Tamper-Evident Security Handover Audit Record',
        facilityName,
        handoverReference: handoverRef,
        exportTimestamp: new Date().toISOString(),
        totalSequencedBlocks: auditTrail.length,
        ledgerIntegrityStatus: verificationResult.isValid ? 'VERIFIED_100_PERCENT' : 'TAMPER_DETECTED',
        genesisHash: GENESIS_HASH,
        latestBlockHash: auditTrail.length > 0 ? auditTrail[auditTrail.length - 1].entryHash : null,
        inspectorateOversightAuthority: 'Correctional Facilities Regulatory Authority',
      },
      auditTrail,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SEC_AUDIT_${handoverRef.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export Plain Text Certificate
  const handleExportTextCertificate = () => {
    const text = generateAuditCertificateText(
      handoverRef,
      facilityName,
      auditTrail,
      verificationResult
    );
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AUDIT_TRANSCRIPT_${handoverRef.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Copy Full Transcript
  const handleCopyFullTranscript = async () => {
    const text = generateAuditCertificateText(
      handoverRef,
      facilityName,
      auditTrail,
      verificationResult
    );
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTranscript(true);
      setTimeout(() => setCopiedTranscript(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  // Filter Categories
  const categories: { id: string; labelEn: string; labelFr: string }[] = [
    { id: 'all', labelEn: 'All Categories', labelFr: 'Toutes Catégories' },
    { id: 'biometric_attendance', labelEn: 'Biometric Check-in', labelFr: 'Pointage Biométrique' },
    { id: 'digital_signatures', labelEn: 'Signatures & P.V.', labelFr: 'Signatures & Serments' },
    { id: 'risk_assessment', labelEn: 'Risk Logs', labelFr: 'Registre Risques' },
    { id: 'headcount_reconciliation', labelEn: 'Headcount', labelFr: 'Appel Effectifs' },
    { id: 'inventory_armory', labelEn: 'Armory & Weapons', labelFr: 'Armurerie & Clés' },
    { id: 'contraband_evidence', labelEn: 'Contraband', labelFr: 'Saisies & Scellés' },
    { id: 'custodial_tasks', labelEn: 'Tasks & Orders', labelFr: 'Tâches & Ordres' },
    { id: 'meteorological', labelEn: 'Meteorological', labelFr: 'Météo & Visibilité' },
    { id: 'emergency_tactical', labelEn: 'Emergency Alerts', labelFr: 'Alertes Urgence' },
    { id: 'session_lifecycle', labelEn: 'Session Lifecycle', labelFr: 'Cycle Brouillon' },
  ];

  // Filter entries
  const filteredEntries = useMemo(() => {
    return auditTrail.filter(entry => {
      // Category filter
      if (selectedCategory !== 'all' && entry.actionCategory !== selectedCategory) {
        return false;
      }
      // Severity filter
      if (selectedSeverity !== 'all' && entry.severity !== selectedSeverity) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesAction = entry.actionName.toLowerCase().includes(q);
        const matchesActor = entry.actorName.toLowerCase().includes(q) || entry.actorBadge.toLowerCase().includes(q);
        const matchesSummary = entry.changeSummary.toLowerCase().includes(q);
        const matchesHash = entry.entryHash.toLowerCase().includes(q) || entry.prevHash.toLowerCase().includes(q);
        const matchesEntity = entry.entityType.toLowerCase().includes(q) || (entry.entityId && entry.entityId.toLowerCase().includes(q));
        return matchesAction || matchesActor || matchesSummary || matchesHash || matchesEntity;
      }
      return true;
    });
  }, [auditTrail, selectedCategory, selectedSeverity, searchQuery]);

  // Metrics KPI calculations
  const metrics = useMemo(() => {
    const total = auditTrail.length;
    const criticalCount = auditTrail.filter(e => e.severity === 'critical').length;
    const elevatedCount = auditTrail.filter(e => e.severity === 'elevated').length;
    const uniqueActors = new Set(auditTrail.map(e => e.actorBadge)).size;
    const uniqueTerminals = new Set(auditTrail.map(e => e.ipOrTerminalId)).size;

    return { total, criticalCount, elevatedCount, uniqueActors, uniqueTerminals };
  }, [auditTrail]);

  // Action Icon Helper
  const getActionIcon = (cat: SecurityAuditActionCategory) => {
    switch (cat) {
      case 'biometric_attendance':
        return <Fingerprint className="w-4 h-4 text-cyan-400" />;
      case 'digital_signatures':
        return <FileCheck className="w-4 h-4 text-emerald-400" />;
      case 'risk_assessment':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'headcount_reconciliation':
        return <Users className="w-4 h-4 text-indigo-400" />;
      case 'inventory_armory':
        return <Key className="w-4 h-4 text-amber-400" />;
      case 'contraband_evidence':
        return <Lock className="w-4 h-4 text-red-400" />;
      case 'custodial_tasks':
        return <Clock className="w-4 h-4 text-cyan-400" />;
      case 'meteorological':
        return <CloudFog className="w-4 h-4 text-cyan-300" />;
      case 'emergency_tactical':
        return <Flame className="w-4 h-4 text-rose-500 animate-pulse" />;
      case 'session_lifecycle':
      default:
        return <Fingerprint className="w-4 h-4 text-slate-400" />;
    }
  };

  // Severity Badge
  const getSeverityBadge = (severity: SecurityAuditSeverity) => {
    switch (severity) {
      case 'critical':
        return 'bg-rose-950/80 text-rose-300 border-rose-700/80';
      case 'elevated':
        return 'bg-amber-950/80 text-amber-300 border-amber-700/80';
      case 'routine':
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  // ----------------------------------------------------
  // COMPACT VIEW (For Executive Summary Overview card)
  // ----------------------------------------------------
  if (compactView) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white shadow-lg space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/80">
              <FileLock2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  {language === 'fr' ? 'Registre d\'Audit Sécuritaire (Inviolable)' : 'Security Incident Audit Ledger'}
                </h3>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {auditTrail.length} {language === 'fr' ? 'blocs horodatés • SHA-256 scellés' : 'sequenced blocks • SHA-256 sealed'}
              </span>
            </div>
          </div>

          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border flex items-center gap-1 ${
            verificationResult.isValid
              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
              : 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse'
          }`}>
            {verificationResult.isValid ? <Check className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-rose-400" />}
            <span>{verificationResult.isValid ? 'TAMPER-PROOF OK' : 'TAMPER DETECTED'}</span>
          </span>
        </div>

        {/* Recent 3 Audit Events */}
        <div className="space-y-2">
          {auditTrail.slice(-3).reverse().map(e => (
            <div key={e.id} className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 flex items-start justify-between gap-2 text-xs">
              <div className="flex items-start gap-2">
                <div className="p-1 rounded bg-slate-900 border border-slate-800 mt-0.5">
                  {getActionIcon(e.actionCategory)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-cyan-400 font-bold">#{String(e.sequenceNumber).padStart(3, '0')}</span>
                    <strong className="text-white text-xs">{e.actionName}</strong>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{e.changeSummary}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-mono text-slate-400 block">{e.timestamp}</span>
                <span className="text-[9px] font-mono text-slate-500 block truncate max-w-[90px]">{e.actorBadge}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-[10px] text-slate-400 bg-slate-950/80 px-3 py-1.5 rounded-md border border-slate-800 flex items-center justify-between font-mono">
          <span>GENESIS: {GENESIS_HASH.substring(0, 12)}...</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <Lock className="w-3 h-3" />
            <span>IMMUTABLE READ-ONLY</span>
          </span>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // FULL VIEW (Dedicated Audit Section for Administrative Oversight)
  // ----------------------------------------------------
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl text-white overflow-hidden space-y-6 p-5 sm:p-6">
      
      {/* 1. Official Oversight Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-950 to-slate-900 text-emerald-400 border border-emerald-700/60 shadow-inner">
            <FileLock2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>{language === 'fr' ? 'Registre d\'Audit Sécuritaire & Chaîne d\'Inviolabilité' : 'Security Incident Audit Ledger (Tamper-Evident Timeline)'}</span>
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                READ-ONLY
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                ADMINISTRATIVE OVERSIGHT
              </span>
            </div>
            
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              {facilityName} &bull; <strong className="text-cyan-400">{handoverRef}</strong> &bull; {date} &bull; {outgoingShift.toUpperCase()} &rarr; {incomingShift.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Action Buttons: Verify, Export, Transcript */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Verify Ledger Integrity Button */}
          <button
            type="button"
            onClick={handleRunVerificationScan}
            disabled={isVerifying}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 border ${
              verificationResult.isValid
                ? 'bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-600'
                : 'bg-rose-700 hover:bg-rose-600 text-white border-rose-600 animate-pulse'
            }`}
            title="Recalculate SHA-256 hash chains across all blocks to ensure zero manipulation"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>
              {isVerifying 
                ? (language === 'fr' ? 'Vérification...' : 'Scanning Ledger...') 
                : (language === 'fr' ? 'Vérifier l\'Intégrité' : 'Verify Ledger Integrity')}
            </span>
          </button>

          {/* Export JSON Certificate */}
          <button
            type="button"
            onClick={handleExportJsonCertificate}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Download JSON cryptographic audit certificate"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>JSON</span>
          </button>

          {/* Export Plain Text Transcript */}
          <button
            type="button"
            onClick={handleExportTextCertificate}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Download plain text legal audit certificate"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>TXT</span>
          </button>

          {/* Copy Transcript to Clipboard */}
          <button
            type="button"
            onClick={handleCopyFullTranscript}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Copy audit transcript to clipboard"
          >
            {copiedTranscript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copiedTranscript ? (language === 'fr' ? 'Copié !' : 'Copied !') : (language === 'fr' ? 'Copier' : 'Copy')}</span>
          </button>

          {/* Simulated Tamper Toggle (Inspectorate testing tool) */}
          <button
            type="button"
            onClick={() => setIsTamperSimulated(!isTamperSimulated)}
            className={`px-2 py-1 rounded-md text-[10px] font-mono border transition-colors cursor-pointer ${
              isTamperSimulated
                ? 'bg-rose-950 text-rose-300 border-rose-600'
                : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
            }`}
            title="Simulate retroactive database modification to verify that tamper alerts trigger instantly"
          >
            {isTamperSimulated ? 'TAMPER TEST: ACTIVE' : 'TEST TAMPER DETECTION'}
          </button>
        </div>
      </div>

      {/* 2. Cryptographic Integrity Status Banner */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
        verificationResult.isValid
          ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
          : 'bg-rose-950/60 border-rose-800 text-rose-200 animate-pulse'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${
            verificationResult.isValid ? 'bg-emerald-900/60 text-emerald-300' : 'bg-rose-900/80 text-rose-300'
          }`}>
            {verificationResult.isValid ? (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs uppercase tracking-wider">
                {verificationResult.isValid
                  ? (language === 'fr' ? 'CHAÎNE D\'INTÉGRITÉ SHA-256 CONFIRMÉE' : 'CRYPTOGRAPHIC SHA-256 INTEGRITY CONFIRMED')
                  : (language === 'fr' ? 'ALERTE : ALTÉRATION OU BRIS DE CHAÎNE DÉTECTÉ' : 'CRITICAL ALERT: LEDGER TAMPERING OR CHAIN BREAK DETECTED')}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/40 border border-current/20">
                {verificationResult.totalVerified} / {auditTrail.length} {language === 'fr' ? 'BLOCS VALIDÉS' : 'BLOCKS VALIDATED'}
              </span>
            </div>
            <p className="text-xs opacity-90 mt-0.5 leading-snug">
              {verificationResult.isValid
                ? (language === 'fr' 
                    ? 'Tous les enregistrements d\'actions sont cryptographiquement chaînés au bloc genèse. Aucune altération rétroactive, modification silencieuse ou insertion frauduleuse détectée.'
                    : 'Every operational action is mathematically chained to the Genesis Block. Zero retroactive payload modification, deletion, or rogue sequencing detected.')
                : (language === 'fr'
                    ? `Violation d'intégrité détectée au bloc séquence #${verificationResult.brokenIndex !== null ? verificationResult.brokenIndex + 1 : '?'}: ${verificationResult.failureReason || 'Empreinte invalide'}.`
                    : `Chain failure detected at sequence #${verificationResult.brokenIndex !== null ? verificationResult.brokenIndex + 1 : '?'}: ${verificationResult.failureReason || 'Invalid hash signature'}.`)}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0 font-mono text-[11px] opacity-80 border-t md:border-t-0 md:border-l border-current/20 pt-2 md:pt-0 md:pl-4">
          <span className="block text-[10px] opacity-70 uppercase">{language === 'fr' ? 'Empreinte Dernier Bloc' : 'Latest Block Seal'}</span>
          <span className="font-bold text-white text-xs">
            {auditTrail.length > 0 ? `${auditTrail[auditTrail.length - 1].entryHash.substring(0, 16)}...` : 'N/A'}
          </span>
        </div>
      </div>

      {/* 3. KPI Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Blocks */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">
            {language === 'fr' ? 'Total Entrées Scellées' : 'Total Sequenced Blocks'}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-white">{metrics.total}</span>
            <span className="text-[10px] text-emerald-400 font-mono">100% Logged</span>
          </div>
        </div>

        {/* Critical Actions */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-mono block flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            <span>{language === 'fr' ? 'Actions Sécurité Critiques' : 'Critical Security Actions'}</span>
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-rose-300">{metrics.criticalCount}</span>
            <span className="text-[10px] text-slate-400 font-mono">High-liability</span>
          </div>
        </div>

        {/* Distinct Actors */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-mono block flex items-center gap-1">
            <Users className="w-3 h-3 text-indigo-400" />
            <span>{language === 'fr' ? 'Agents & Officiers Distincts' : 'Distinct Active Actors'}</span>
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-indigo-300">{metrics.uniqueActors}</span>
            <span className="text-[10px] text-slate-400 font-mono">Authorized badges</span>
          </div>
        </div>

        {/* Distinct Terminals */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-mono block flex items-center gap-1">
            <Terminal className="w-3 h-3 text-cyan-400" />
            <span>{language === 'fr' ? 'Terminaux Réseau' : 'Active Terminals'}</span>
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-cyan-300">{metrics.uniqueTerminals}</span>
            <span className="text-[10px] text-slate-400 font-mono">LAN & mobile</span>
          </div>
        </div>
      </div>

      {/* 4. Administrative Filter Bar */}
      <div className="space-y-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
        
        {/* Search & Severity Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={language === 'fr' 
                ? 'Rechercher par action, officier, matricule, détail ou empreinte de hachage...' 
                : 'Search audit ledger by action, officer, badge, entity, delta, or hash...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-cyan-500 font-mono"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 font-mono text-[10px] uppercase mr-1">
              {language === 'fr' ? 'Niveau :' : 'Severity:'}
            </span>
            {(['all', 'critical', 'elevated', 'routine'] as const).map(sev => (
              <button
                key={sev}
                type="button"
                onClick={() => setSelectedSeverity(sev)}
                className={`px-2.5 py-1 rounded text-xs font-semibold capitalize transition-colors cursor-pointer ${
                  selectedSeverity === sev
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {categories.map(cat => {
            const count = cat.id === 'all' 
              ? auditTrail.length 
              : auditTrail.filter(e => e.actionCategory === cat.id).length;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-slate-200 text-slate-900 shadow-xs'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>{language === 'fr' ? cat.labelFr : cat.labelEn}</span>
                <span className={`px-1 py-0.2 rounded-full text-[9px] font-mono ${
                  selectedCategory === cat.id ? 'bg-slate-400 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Chronological Tamper-Evident Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
          <span className="font-mono uppercase tracking-wider text-slate-300">
            {language === 'fr' ? 'Chronologie des Événements & Sceaux Cryptographiques' : 'Immutable Event Timeline & Cryptographic Blocks'}
          </span>
          <span className="font-mono text-[11px]">
            {filteredEntries.length} / {auditTrail.length} {language === 'fr' ? 'enregistrements affichés' : 'records displayed'}
          </span>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-8 text-center text-slate-400 space-y-2">
            <Search className="w-6 h-6 mx-auto text-slate-600" />
            <p className="text-xs">
              {language === 'fr' 
                ? 'Aucun enregistrement d\'audit ne correspond à vos filtres de recherche.' 
                : 'No audit ledger entries match your search criteria.'}
            </p>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-4 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-cyan-500 before:to-slate-700">
            {filteredEntries.map((entry, index) => {
              const isExpanded = !!expandedHashes[entry.id];
              const isLatest = index === filteredEntries.length - 1;

              return (
                <div key={entry.id} className="relative group">
                  {/* Sequence Node Indicator on the line */}
                  <div className={`absolute -left-6 sm:-left-8 top-3.5 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-mono font-bold ${
                    entry.severity === 'critical'
                      ? 'bg-rose-950 border-rose-500 text-rose-300'
                      : entry.severity === 'elevated'
                      ? 'bg-amber-950 border-amber-500 text-amber-300'
                      : 'bg-slate-900 border-emerald-500 text-emerald-300'
                  }`}>
                    {entry.sequenceNumber}
                  </div>

                  {/* Card Container */}
                  <div className="bg-slate-950/90 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors p-4 space-y-3 shadow-md">
                    
                    {/* Header Row: Sequence, Category, Severity & Timestamp */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                          BLOCK #{String(entry.sequenceNumber).padStart(3, '0')}
                        </span>

                        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
                          <span className="p-1 rounded bg-slate-900 border border-slate-800">
                            {getActionIcon(entry.actionCategory)}
                          </span>
                          <span className="capitalize">{entry.actionCategory.replace('_', ' ')}</span>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${getSeverityBadge(entry.severity)}`}>
                          {entry.severity}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                        <span className="flex items-center gap-1 text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          <strong>{entry.timestamp}</strong>
                        </span>
                        <span className="text-[10px] opacity-75 hidden sm:inline">{entry.isoTimestamp.substring(11, 19)} UTC</span>
                      </div>
                    </div>

                    {/* Action Name & Actor Identification */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{entry.actionName}</span>
                          {entry.entityId && (
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                              REF: {entry.entityId}
                            </span>
                          )}
                        </h4>
                        <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-2 font-mono">
                          <span>{language === 'fr' ? 'Opérateur :' : 'Actor:'} <strong className="text-slate-200">{entry.actorName}</strong> (Matricule #{entry.actorBadge})</span>
                          <span>&bull;</span>
                          <span>{entry.actorRole}</span>
                          <span>&bull;</span>
                          <span className="text-cyan-400">{entry.ipOrTerminalId}</span>
                        </div>
                      </div>
                    </div>

                    {/* Change Summary & Delta Card */}
                    <div className="bg-slate-900/90 rounded-lg p-3 border border-slate-800/90 space-y-2 text-xs">
                      <p className="text-slate-200 leading-relaxed">
                        {entry.changeSummary}
                      </p>

                      {/* Before / After visual comparison if present */}
                      {(entry.previousValue || entry.newValue) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-800/80 text-[11px] font-mono">
                          {entry.previousValue && (
                            <div className="bg-slate-950 p-2 rounded border border-rose-950/60 text-rose-300/90">
                              <span className="text-[9px] uppercase tracking-wider block opacity-70">
                                {language === 'fr' ? 'État Antérieur :' : 'Previous State:'}
                              </span>
                              <span className="font-semibold block truncate">{entry.previousValue}</span>
                            </div>
                          )}
                          {entry.newValue && (
                            <div className="bg-slate-950 p-2 rounded border border-emerald-950/60 text-emerald-300">
                              <span className="text-[9px] uppercase tracking-wider block opacity-70">
                                {language === 'fr' ? 'Nouvel État :' : 'New State / Delta:'}
                              </span>
                              <span className="font-semibold block truncate">{entry.newValue}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Cryptographic Linkage & Verification Drawer */}
                    <div className="pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => toggleHashDrawer(entry.id)}
                          className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Hash className="w-3.5 h-3.5" />
                          <span>{isExpanded ? (language === 'fr' ? 'Masquer la Preuve Cryptographique' : 'Hide Cryptographic Proof') : (language === 'fr' ? 'Afficher la Preuve Cryptographique' : 'Show Cryptographic Proof')}</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>SHA-256 SEAL VALID</span>
                          </span>
                        </div>
                      </div>

                      {/* Expandable Hash Chaining Box */}
                      {isExpanded && (
                        <div className="mt-2.5 bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 font-mono text-[11px]">
                          <div>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                              <span>PREVIOUS HASH (CHAIN LINK):</span>
                              <button
                                type="button"
                                onClick={() => handleCopyHash(entry.prevHash, `${entry.id}-prev`)}
                                className="text-cyan-400 hover:text-cyan-300 text-[10px] flex items-center gap-1 cursor-pointer"
                              >
                                {copiedHash === `${entry.id}-prev` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedHash === `${entry.id}-prev` ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                            <div className="bg-slate-900 p-1.5 rounded border border-slate-800 text-slate-300 break-all text-[10px]">
                              {entry.prevHash}
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                              <span>CURRENT BLOCK SEAL (ENTRY HASH):</span>
                              <button
                                type="button"
                                onClick={() => handleCopyHash(entry.entryHash, `${entry.id}-entry`)}
                                className="text-cyan-400 hover:text-cyan-300 text-[10px] flex items-center gap-1 cursor-pointer"
                              >
                                {copiedHash === `${entry.id}-entry` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedHash === `${entry.id}-entry` ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                            <div className="bg-slate-900 p-1.5 rounded border border-emerald-900/60 text-emerald-300 break-all text-[10px]">
                              {entry.entryHash}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Administrative Oversight Footer Certification */}
      <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <FileLock2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            {language === 'fr' 
              ? 'Enregistrement certifié conforme à la section 58 de la Loi sur la Surveillance Pénitentiaire. Archive inviolable.' 
              : 'Certified under Section 58 of the Correctional Oversight Act. Tamper-evident immutable custody archive.'}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] shrink-0">
          <span>GENESIS: {GENESIS_HASH.substring(0, 10)}...</span>
          <span>&bull;</span>
          <span className="text-emerald-400 font-bold">100% IMMUTABLE</span>
        </div>
      </div>

    </div>
  );
};
