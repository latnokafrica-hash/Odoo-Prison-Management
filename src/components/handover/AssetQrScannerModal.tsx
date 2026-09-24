import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  EquipmentInventoryItem, 
  EquipmentCondition, 
  AssetMaintenanceLog, 
  AssetHistoryEvent, 
  Language 
} from '../../types';
import { enrichEquipmentWithAssetData } from '../../utils/assetTrackingHelper';
import { 
  QrCode, 
  Scan, 
  ScanLine, 
  Camera, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Wrench, 
  History, 
  Shield, 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Copy, 
  Check, 
  Printer, 
  RotateCcw, 
  Sparkles, 
  Maximize2, 
  Flashlight, 
  Volume2, 
  VolumeX, 
  Plus, 
  FileText, 
  Cpu, 
  Tag, 
  Key, 
  Radio, 
  Battery, 
  Lock 
} from 'lucide-react';

interface AssetQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  equipment: EquipmentInventoryItem[];
  initialSelectedItem?: EquipmentInventoryItem | null;
  onUpdateCondition?: (id: string, condition: EquipmentCondition) => void;
  onUpdateItemLogs?: (updatedItem: EquipmentInventoryItem) => void;
}

export const AssetQrScannerModal: React.FC<AssetQrScannerModalProps> = ({
  isOpen,
  onClose,
  language,
  equipment,
  initialSelectedItem = null,
  onUpdateCondition,
  onUpdateItemLogs
}) => {
  const isFr = language === 'fr';

  // Mode: 'scanner' (live viewfinder) vs 'dossier' (viewing asset history & maintenance)
  const [activeView, setActiveView] = useState<'scanner' | 'dossier'>('scanner');
  const [selectedAsset, setSelectedAsset] = useState<EquipmentInventoryItem | null>(null);

  // Scanner state
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isScanningActive, setIsScanningActive] = useState(true);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cameraMode, setCameraMode] = useState<'optical' | 'handheld_2d' | 'front'>('optical');
  const [scanSuccessPulse, setScanSuccessPulse] = useState(false);

  // Dossier sub-tab: 'maintenance' vs 'history'
  const [dossierTab, setDossierTab] = useState<'maintenance' | 'history'>('maintenance');
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Add Maintenance Log inline form
  const [showAddLogForm, setShowAddLogForm] = useState(false);
  const [newLogServiceType, setNewLogServiceType] = useState<AssetMaintenanceLog['serviceType']>('Routine Inspection');
  const [newLogTechnician, setNewLogTechnician] = useState('Armorer Sgt. Otieno (KP-5521)');
  const [newLogDescription, setNewLogDescription] = useState('');
  const [newLogStatus, setNewLogStatus] = useState<AssetMaintenanceLog['status']>('passed');
  const [newLogWorkOrder, setNewLogWorkOrder] = useState('');

  // Audio confirmation beep
  const playScanBeep = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1900, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // Audio not supported or blocked by browser policy
    }
  };

  // Enrich equipment with full asset tracking metadata
  const enrichedList = useMemo(() => {
    return equipment.map(enrichEquipmentWithAssetData);
  }, [equipment]);

  // Synchronize when modal opens or initial item changes
  useEffect(() => {
    if (isOpen) {
      if (initialSelectedItem) {
        const enriched = enrichEquipmentWithAssetData(initialSelectedItem);
        setSelectedAsset(enriched);
        setActiveView('dossier');
      } else {
        setActiveView('scanner');
        setSelectedAsset(null);
      }
      setScannerError(null);
      setManualCodeInput('');
      setScanSuccessPulse(false);
      setShowAddLogForm(false);
    }
  }, [isOpen, initialSelectedItem]);

  if (!isOpen) return null;

  // Process a scanned or selected asset
  const handleSelectAsset = (item: EquipmentInventoryItem) => {
    const enriched = enrichEquipmentWithAssetData(item);
    setScanSuccessPulse(true);
    playScanBeep();

    setTimeout(() => {
      setSelectedAsset(enriched);
      setActiveView('dossier');
      setScanSuccessPulse(false);
      setScannerError(null);
    }, 400);
  };

  // Handle Manual Code / QR Search
  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCodeInput.trim()) return;

    const query = manualCodeInput.trim().toLowerCase();
    const found = enrichedList.find(item => {
      const matchTag = item.assetTag?.toLowerCase().includes(query);
      const matchQr = item.qrCode?.toLowerCase().includes(query);
      const matchName = item.name.toLowerCase().includes(query);
      const matchId = item.id.toLowerCase() === query;
      const matchSerial = item.serialNumbers?.some(s => s.toLowerCase().includes(query));
      const matchSeal = item.sealNumber?.toLowerCase().includes(query);
      const matchWO = item.workOrderRef?.toLowerCase().includes(query);
      return matchTag || matchQr || matchName || matchId || matchSerial || matchSeal || matchWO;
    });

    if (found) {
      handleSelectAsset(found);
    } else {
      setScannerError(
        isFr 
          ? `Aucun équipement trouvé pour le code "${manualCodeInput}". Vérifiez l'identifiant.` 
          : `No inventory item matches code "${manualCodeInput}". Verify tag or QR content.`
      );
    }
  };

  // Handle Condition Change directly in Dossier
  const handleConditionChange = (newCondition: EquipmentCondition) => {
    if (!selectedAsset) return;
    const isDamaged = newCondition === 'damaged' || newCondition === 'defective';
    const workOrderRef = isDamaged 
      ? (selectedAsset.workOrderRef || `WO-2026-${Math.floor(1000 + Math.random() * 9000)}`) 
      : selectedAsset.workOrderRef;

    const updated: EquipmentInventoryItem = {
      ...selectedAsset,
      condition: newCondition,
      workOrderRef,
      workOrderStatus: isDamaged ? 'pending' : selectedAsset.workOrderStatus,
      workOrderTriggeredAt: isDamaged ? new Date().toISOString() : selectedAsset.workOrderTriggeredAt,
      discrepancyNote: isDamaged 
        ? `[WORK ORDER ${workOrderRef}] Flagged during QR scan audit. Immediate repair ticket issued.` 
        : selectedAsset.discrepancyNote
    };

    // Prepend a history entry
    const newHistoryEvent: AssetHistoryEvent = {
      id: `hist-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      event: 'Condition Flagged',
      officer: 'Current Shift Watch Commander',
      location: selectedAsset.storageLocation,
      details: `Operational condition updated to ${newCondition.toUpperCase()} via QR Scanner Terminal. ${isDamaged ? `Work order ${workOrderRef} triggered.` : ''}`,
    };

    updated.assetHistory = [newHistoryEvent, ...(updated.assetHistory || [])];
    setSelectedAsset(updated);

    if (onUpdateCondition) {
      onUpdateCondition(selectedAsset.id, newCondition);
    }
    if (onUpdateItemLogs) {
      onUpdateItemLogs(updated);
    }
  };

  // Handle Adding a new maintenance log
  const handleAddMaintenanceLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset || !newLogDescription.trim()) return;

    const newLog: AssetMaintenanceLog = {
      id: `mlog-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      technician: newLogTechnician,
      serviceType: newLogServiceType,
      description: newLogDescription.trim(),
      status: newLogStatus,
      workOrderRef: newLogWorkOrder.trim() || undefined,
      nextServiceDueDate: '2026-12-15',
    };

    const updated: EquipmentInventoryItem = {
      ...selectedAsset,
      maintenanceLogs: [newLog, ...(selectedAsset.maintenanceLogs || [])],
      lastInspectedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      inspectedBy: newLogTechnician,
    };

    setSelectedAsset(updated);
    if (onUpdateItemLogs) {
      onUpdateItemLogs(updated);
    }

    setShowAddLogForm(false);
    setNewLogDescription('');
    setNewLogWorkOrder('');
  };

  // Copy QR Payload to clipboard
  const handleCopyPayload = () => {
    if (!selectedAsset?.qrCode) return;
    navigator.clipboard.writeText(selectedAsset.qrCode);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        
        {/* Top Terminal Bar */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-900/30">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  {isFr ? 'Scanner QR & Dossier de Maintenance de l\'Actif' : 'Asset QR Scanner & Maintenance Dossier'}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800">
                  SEC-INV v4.2
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isFr 
                  ? 'Historique complet, carnet de maintenance et traçabilité de garde pour matériel pénitentiaire' 
                  : 'Full lifecycle audit ledger, maintenance dockets & chain of custody for prison security assets'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex bg-slate-800/80 p-1 rounded-lg border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => { setActiveView('scanner'); setScannerError(null); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeView === 'scanner'
                    ? 'bg-cyan-600 text-white shadow-xs font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{isFr ? 'Caméra / Scanner' : 'Live Scanner'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selectedAsset) {
                    setActiveView('dossier');
                  } else if (enrichedList.length > 0) {
                    handleSelectAsset(enrichedList[0]);
                  }
                }}
                disabled={!selectedAsset && enrichedList.length === 0}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeView === 'dossier'
                    ? 'bg-indigo-600 text-white shadow-xs font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{isFr ? 'Dossier d\'Actif' : 'Asset Dossier'}</span>
                {selectedAsset && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse ml-0.5" />
                )}
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isFr ? 'Fermer' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* VIEW A: LIVE SCANNER HUD */}
          {activeView === 'scanner' && (
            <div className="space-y-6">
              {/* Camera Simulation Viewfinder */}
              <div className="relative bg-slate-950 rounded-2xl border-2 border-slate-700/80 overflow-hidden shadow-2xl min-h-[340px] flex flex-col justify-between p-6">
                
                {/* Background optical simulation noise grid */}
                <div 
                  className={`absolute inset-0 transition-opacity duration-300 ${
                    isTorchOn ? 'bg-radial from-slate-700/40 via-slate-950 to-black' : 'bg-slate-950'
                  }`}
                  style={{
                    backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.08) 0%, rgba(15, 23, 42, 0.95) 75%)'
                  }}
                />

                {/* HUD Top Status */}
                <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-cyan-400 font-bold tracking-wider">
                      {isFr ? 'CAPTEUR OPTIQUE ACTIF' : 'OPTICAL SENSOR ACTIVE'}
                    </span>
                    <span className="text-slate-600">|</span>
                    <span>FPS: 60</span>
                    <span className="text-slate-600">|</span>
                    <span>MODE: {cameraMode.toUpperCase()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Torch Toggle */}
                    <button
                      type="button"
                      onClick={() => setIsTorchOn(!isTorchOn)}
                      className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-all ${
                        isTorchOn 
                          ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 shadow-xs shadow-amber-500/20' 
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                      title={isFr ? 'Lampe torche' : 'Torch / Flashlight'}
                    >
                      <Flashlight className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-sans font-semibold">{isTorchOn ? 'ON' : 'TORCH'}</span>
                    </button>

                    {/* Audio Toggle */}
                    <button
                      type="button"
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={`p-1.5 rounded-lg border text-xs transition-all ${
                        soundEnabled 
                          ? 'bg-slate-800 text-cyan-400 border-slate-700' 
                          : 'bg-slate-800 text-slate-500 border-slate-700'
                      }`}
                      title={soundEnabled ? 'Mute Scan Tone' : 'Enable Scan Tone'}
                    >
                      {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                    </button>

                    {/* Camera Selector */}
                    <select
                      value={cameraMode}
                      onChange={e => setCameraMode(e.target.value as 'optical' | 'handheld_2d' | 'front')}
                      className="bg-slate-800 border border-slate-700 text-slate-200 text-[10px] rounded px-2 py-1 font-sans font-medium"
                    >
                      <option value="optical">{isFr ? 'Caméra Haute Résolution' : 'High-Res Optical Cam'}</option>
                      <option value="handheld_2d">{isFr ? 'Lecteur Zebra / Honeywell 2D' : 'Handheld 2D Imager'}</option>
                      <option value="front">{isFr ? 'Caméra Opérateur Avant' : 'Front Terminal Cam'}</option>
                    </select>
                  </div>
                </div>

                {/* Viewfinder Target Reticle in Center */}
                <div className="relative z-10 flex flex-col items-center justify-center my-6">
                  <div className={`relative w-64 h-64 border-2 rounded-2xl transition-all duration-300 flex items-center justify-center ${
                    scanSuccessPulse 
                      ? 'border-emerald-400 bg-emerald-500/20 shadow-lg shadow-emerald-500/40 scale-105' 
                      : 'border-cyan-500/50 bg-slate-900/40 shadow-inner'
                  }`}>
                    
                    {/* Viewfinder HUD Corner Brackets */}
                    <div className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 border-cyan-400 rounded-tl-md" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 border-t-4 border-r-4 border-cyan-400 rounded-tr-md" />
                    <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-4 border-l-4 border-cyan-400 rounded-bl-md" />
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 border-cyan-400 rounded-br-md" />

                    {/* Animated Laser Scanning Line */}
                    {isScanningActive && !scanSuccessPulse && (
                      <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-lg shadow-cyan-400/80 animate-scanline" />
                    )}

                    {/* Central Target Icon & Crosshairs */}
                    <div className="text-center p-4">
                      {scanSuccessPulse ? (
                        <div className="flex flex-col items-center gap-2 animate-bounce">
                          <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                          <span className="font-mono text-xs font-bold text-emerald-300">
                            {isFr ? 'CODE RECONNU !' : 'QR TAG VERIFIED!'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-cyan-400/80">
                          <ScanLine className="w-12 h-12 animate-pulse" />
                          <span className="font-mono text-[11px] text-cyan-300 tracking-wider">
                            {isFr ? 'ALIGNEZ LE CODE QR DE L\'ACTIF' : 'ALIGN ASSET QR CODE IN FRAME'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-400 text-center max-w-md font-sans">
                    {isFr 
                      ? 'Pointez la caméra vers l\'étiquette métallique ou l\'anneau scellé. Les données d\'inspection s\'ouvriront instantanément.' 
                      : 'Point imager at metallic asset tag or security seal ring. Verification and maintenance records will automatically open.'}
                  </p>
                </div>

                {/* Viewfinder Bottom Coordinates */}
                <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>ARMORY SCANNER #04</span>
                  <span>ENCRYPTION: AES-256 GCM</span>
                  <span>LAT/LON: 0.0521° N, 37.6412° E</span>
                </div>
              </div>

              {/* Quick Scan Simulator: Direct Tag Selector for Testing */}
              <div className="bg-slate-800/60 rounded-xl border border-slate-700/80 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>
                      {isFr 
                        ? 'Simulation de Scan Rapide (Cliquez sur un actif étiqueté)' 
                        : 'Quick Scan Simulator (Click to scan any tagged prison asset)'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {enrichedList.length} {isFr ? 'actifs répertoriés' : 'assets registered'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {enrichedList.slice(0, 9).map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectAsset(item)}
                      className={`text-left p-3 rounded-lg border transition-all flex items-start gap-2.5 group ${
                        item.condition === 'damaged'
                          ? 'bg-rose-950/20 border-rose-800/60 hover:border-rose-500 hover:bg-rose-950/40'
                          : 'bg-slate-900/80 border-slate-700/80 hover:border-cyan-500 hover:bg-slate-900'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${
                        item.category === 'keys_security' ? 'bg-amber-950/60 text-amber-400 border border-amber-800/50' :
                        item.category === 'radios_comms' ? 'bg-indigo-950/60 text-indigo-400 border border-indigo-800/50' :
                        item.category === 'armory_firearms' ? 'bg-rose-950/60 text-rose-400 border border-rose-800/50' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {item.category === 'keys_security' ? <Key className="w-4 h-4" /> :
                         item.category === 'radios_comms' ? <Radio className="w-4 h-4" /> :
                         <Shield className="w-4 h-4" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono text-[10px] font-bold text-cyan-400">
                            {item.assetTag}
                          </span>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                            item.condition === 'operational' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                            item.condition === 'damaged' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                            'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}>
                            {item.condition}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-200 truncate mt-0.5 group-hover:text-cyan-300 transition-colors">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1 truncate">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">{item.storageLocation}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual QR / Asset Barcode Search Bar */}
              <div className="bg-slate-800/40 rounded-xl border border-slate-700/60 p-4">
                <form onSubmit={handleManualSearch} className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    {isFr ? 'Saisie Manuelle d\'Identifiant / Code-Barres / Tag QR' : 'Manual Tag ID / Barcode / Work Order Lookup'}
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={manualCodeInput}
                        onChange={e => setManualCodeInput(e.target.value)}
                        placeholder={isFr ? 'ex: AST-KEY-001, MOT-01, WO-2026-0894, SEAL-VAULT...' : 'e.g. AST-KEY-001, MOT-01, WO-2026-0894, SEAL-VAULT...'}
                        className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-hidden focus:border-cyan-500 font-mono"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Scan className="w-4 h-4" />
                      <span>{isFr ? 'Consulter' : 'Lookup'}</span>
                    </button>
                  </div>

                  {scannerError && (
                    <div className="p-2.5 rounded-lg bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2 animate-shake">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{scannerError}</span>
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}

          {/* VIEW B: ASSET DOSSIER & MAINTENANCE / AUDIT LOGS */}
          {activeView === 'dossier' && selectedAsset && (
            <div className="space-y-6">
              
              {/* Top Asset Card */}
              <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-5 shadow-lg relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Visual QR Code Generator */}
                    <div className="relative group shrink-0 bg-white p-2 rounded-xl shadow-md border border-slate-300">
                      {/* High contrast SVG QR Representation */}
                      <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
                        <rect width="100" height="100" fill="white" />
                        {/* QR Position Squares */}
                        <rect x="8" y="8" width="24" height="24" fill="#0f172a" rx="2" />
                        <rect x="12" y="12" width="16" height="16" fill="white" rx="1" />
                        <rect x="16" y="16" width="8" height="8" fill="#0f172a" />
                        
                        <rect x="68" y="8" width="24" height="24" fill="#0f172a" rx="2" />
                        <rect x="72" y="12" width="16" height="16" fill="white" rx="1" />
                        <rect x="76" y="16" width="8" height="8" fill="#0f172a" />

                        <rect x="8" y="68" width="24" height="24" fill="#0f172a" rx="2" />
                        <rect x="12" y="72" width="16" height="16" fill="white" rx="1" />
                        <rect x="16" y="76" width="8" height="8" fill="#0f172a" />

                        {/* Data dots pattern */}
                        <circle cx="40" cy="16" r="3" fill="#0f172a" />
                        <circle cx="52" cy="16" r="3" fill="#0f172a" />
                        <circle cx="46" cy="24" r="3" fill="#0f172a" />
                        <circle cx="40" cy="32" r="3" fill="#0f172a" />
                        <circle cx="56" cy="32" r="3" fill="#0f172a" />
                        <circle cx="16" cy="44" r="3" fill="#0f172a" />
                        <circle cx="28" cy="44" r="3" fill="#0f172a" />
                        <circle cx="36" cy="44" r="3" fill="#0f172a" />
                        <circle cx="48" cy="48" r="4" fill="#0284c7" /> {/* Cyan central anchor */}
                        <circle cx="64" cy="44" r="3" fill="#0f172a" />
                        <circle cx="80" cy="44" r="3" fill="#0f172a" />
                        <circle cx="40" cy="60" r="3" fill="#0f172a" />
                        <circle cx="56" cy="60" r="3" fill="#0f172a" />
                        <circle cx="46" cy="72" r="3" fill="#0f172a" />
                        <circle cx="60" cy="72" r="3" fill="#0f172a" />
                        <circle cx="72" cy="72" r="3" fill="#0f172a" />
                        <circle cx="84" cy="72" r="3" fill="#0f172a" />
                        <circle cx="72" cy="84" r="3" fill="#0f172a" />
                        <circle cx="84" cy="84" r="3" fill="#0f172a" />
                      </svg>
                      
                      <button
                        type="button"
                        onClick={handleCopyPayload}
                        className="absolute inset-0 bg-slate-900/90 text-white rounded-xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-2 text-center"
                        title={isFr ? 'Copier le contenu du QR Code' : 'Copy QR Payload'}
                      >
                        {copiedPayload ? (
                          <>
                            <Check className="w-5 h-5 text-emerald-400 mb-1" />
                            <span className="text-[10px] font-bold text-emerald-300">{isFr ? 'Copié !' : 'Copied!'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-5 h-5 text-cyan-400 mb-1" />
                            <span className="text-[10px] font-bold leading-tight">{isFr ? 'Copier Payload' : 'Copy QR'}</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                          {selectedAsset.assetTag}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          selectedAsset.criticality === 'critical' ? 'bg-rose-950 text-rose-300 border-rose-800' :
                          selectedAsset.criticality === 'high' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                          'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {selectedAsset.criticality || 'standard'} security tier
                        </span>
                        {selectedAsset.workOrderRef && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-700 flex items-center gap-1">
                            <Wrench className="w-3 h-3 text-amber-400" />
                            <span>{selectedAsset.workOrderRef}</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-white tracking-tight">
                        {selectedAsset.name}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>{selectedAsset.storageLocation}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <span>{selectedAsset.assignedCustodian || 'Central Armory'}</span>
                        </div>
                        {selectedAsset.batteryLevel !== undefined && (
                          <div className="flex items-center gap-1 text-emerald-400 font-mono font-semibold">
                            <Battery className="w-3.5 h-3.5" />
                            <span>{selectedAsset.batteryLevel}% battery</span>
                          </div>
                        )}
                        {selectedAsset.sealNumber && (
                          <div className="flex items-center gap-1 text-amber-300 font-mono">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Seal: {selectedAsset.sealNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Operational Condition Selector in Dossier */}
                  <div className="flex flex-col sm:items-end justify-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-700/80">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {isFr ? 'Statut Opérationnel de Garde :' : 'Active Custodial Condition:'}
                    </span>
                    <select
                      value={selectedAsset.condition}
                      onChange={e => handleConditionChange(e.target.value as EquipmentCondition)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase border transition-all cursor-pointer ${
                        selectedAsset.condition === 'operational'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-700 hover:bg-emerald-900'
                          : selectedAsset.condition === 'damaged'
                          ? 'bg-rose-950 text-rose-300 border-rose-700 hover:bg-rose-900'
                          : 'bg-amber-950 text-amber-300 border-amber-700 hover:bg-amber-900'
                      }`}
                    >
                      <option value="operational">OPERATIONAL (Conforme)</option>
                      <option value="damaged">DAMAGED (Auto Work Order)</option>
                      <option value="needs_maintenance">NEEDS MAINTENANCE (Atelier)</option>
                      <option value="defective">DEFECTIVE (Hors Service)</option>
                    </select>

                    <div className="text-[10px] text-slate-400 font-mono">
                      {isFr ? 'Vérifié par les deux capitaines :' : 'Verified by both captains:'}{' '}
                      <span className={selectedAsset.verifiedByBoth ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                        {selectedAsset.verifiedByBoth ? (isFr ? 'OUI' : 'YES') : (isFr ? 'EN ATTENTE' : 'PENDING')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Auto Work Order Banner if Damaged */}
                {selectedAsset.condition === 'damaged' && (
                  <div className="mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center justify-between gap-3 animate-fadeIn">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-rose-900/80 text-rose-300">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold flex items-center gap-2">
                          <span>{isFr ? 'ORDRE DE RÉPARATION ÉMIS' : 'CORRECTIVE WORK ORDER ISSUED'}</span>
                          <span className="font-mono text-[10px] bg-rose-900 px-1.5 py-0.5 rounded text-white">
                            {selectedAsset.workOrderRef || 'WO-2026-PENDING'}
                          </span>
                        </div>
                        <p className="text-[11px] text-rose-300/90 mt-0.5">
                          {selectedAsset.discrepancyNote || 'Flagged during shift inventory scan. Asset routed to armory technical services.'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleConditionChange('operational')}
                      className="px-3 py-1.5 rounded-lg bg-rose-800 hover:bg-rose-700 text-white text-[11px] font-semibold shrink-0 transition-colors"
                    >
                      {isFr ? 'Marquer Réparé' : 'Mark Repaired'}
                    </button>
                  </div>
                )}

                {/* Technical Specs Strip */}
                <div className="mt-4 pt-4 border-t border-slate-700/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">{isFr ? 'Fabricant :' : 'Manufacturer:'}</span>
                    <span className="font-semibold text-slate-200">{selectedAsset.manufacturer || 'Government Tactical Ltd.'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">{isFr ? 'Numéro de Modèle :' : 'Model Number:'}</span>
                    <span className="font-mono font-medium text-slate-300">{selectedAsset.modelNumber || 'MOD-STD-2026'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">{isFr ? 'Prochaine Révision :' : 'Next Service Due:'}</span>
                    <span className="font-mono font-medium text-cyan-400">{selectedAsset.nextServiceDueDate || '2026-12-15'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">{isFr ? 'Quantité Répertoire :' : 'Quantity on Roster:'}</span>
                    <span className="font-semibold text-slate-200">
                      {selectedAsset.countedQty} / {selectedAsset.expectedQty} {selectedAsset.unit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sub-Tabs: Maintenance vs Lifecycle History */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setDossierTab('maintenance')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        dossierTab === 'maintenance'
                          ? 'bg-cyan-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
                      }`}
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>{isFr ? 'Carnet de Maintenance' : 'Maintenance & Service Ledger'}</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900 text-cyan-300 font-mono">
                        {selectedAsset.maintenanceLogs?.length || 0}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDossierTab('history')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        dossierTab === 'history'
                          ? 'bg-cyan-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
                      }`}
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>{isFr ? 'Historique & Chaîne de Garde' : 'Custody & Audit Trail'}</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900 text-cyan-300 font-mono">
                        {selectedAsset.assetHistory?.length || 0}
                      </span>
                    </button>
                  </div>

                  {dossierTab === 'maintenance' && (
                    <button
                      type="button"
                      onClick={() => setShowAddLogForm(!showAddLogForm)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{showAddLogForm ? (isFr ? 'Annuler' : 'Cancel') : (isFr ? 'Nouvelle Entrée' : 'Log Service Record')}</span>
                    </button>
                  )}
                </div>

                {/* TAB 1: MAINTENANCE RECORDS */}
                {dossierTab === 'maintenance' && (
                  <div className="space-y-4">
                    {/* Inline Log Maintenance Form */}
                    {showAddLogForm && (
                      <form onSubmit={handleAddMaintenanceLog} className="p-4 rounded-xl bg-slate-800/90 border border-cyan-800/80 space-y-3 animate-fadeIn">
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Wrench className="w-4 h-4 text-cyan-400" />
                          <span>{isFr ? 'Enregistrer une Intervention de Maintenance' : 'Record New Maintenance / Workshop Inspection'}</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <label className="block text-slate-400 text-[10px] mb-1">{isFr ? 'Type de Service :' : 'Service Type:'}</label>
                            <select
                              value={newLogServiceType}
                              onChange={e => setNewLogServiceType(e.target.value as AssetMaintenanceLog['serviceType'])}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
                            >
                              <option value="Routine Inspection">Routine Inspection</option>
                              <option value="Preventative Service">Preventative Service</option>
                              <option value="Corrective Repair">Corrective Repair</option>
                              <option value="Emergency Calibration">Emergency Calibration</option>
                              <option value="Parts Replacement">Parts Replacement</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-slate-400 text-[10px] mb-1">{isFr ? 'Technicien / Armurier :' : 'Technician / Armorer:'}</label>
                            <input
                              type="text"
                              value={newLogTechnician}
                              onChange={e => setNewLogTechnician(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-slate-400 text-[10px] mb-1">{isFr ? 'Résultat de l\'Inspection :' : 'Service Outcome:'}</label>
                            <select
                              value={newLogStatus}
                              onChange={e => setNewLogStatus(e.target.value as AssetMaintenanceLog['status'])}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
                            >
                              <option value="passed">Passed (Conforme)</option>
                              <option value="repaired">Repaired (Remis en état)</option>
                              <option value="escalated">Escalated (Atelier Central)</option>
                              <option value="decommissioned">Decommissioned (Réformé)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-400 text-[10px] mb-1">
                            {isFr ? 'Observations & Pièces Remplacées :' : 'Observations & Technical Notes:'}
                          </label>
                          <textarea
                            value={newLogDescription}
                            onChange={e => setNewLogDescription(e.target.value)}
                            placeholder={isFr ? 'Détails des tests de tolérance, rivets remplacés, calibrage...' : 'Tolerance testing, replacement rivets, calibration details...'}
                            rows={2}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs"
                            required
                          />
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <input
                            type="text"
                            value={newLogWorkOrder}
                            onChange={e => setNewLogWorkOrder(e.target.value)}
                            placeholder="Réf. Ordre de Réparation (Optionnel, ex: WO-2026-990)"
                            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 font-mono w-64"
                          />

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setShowAddLogForm(false)}
                              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs"
                            >
                              {isFr ? 'Annuler' : 'Cancel'}
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{isFr ? 'Enregistrer le Rapport' : 'Save Docket Entry'}</span>
                            </button>
                          </div>
                        </div>
                      </form>
                    )}

                    {/* Maintenance Log Timeline List */}
                    <div className="space-y-3">
                      {selectedAsset.maintenanceLogs && selectedAsset.maintenanceLogs.length > 0 ? (
                        selectedAsset.maintenanceLogs.map(log => (
                          <div 
                            key={log.id} 
                            className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 hover:border-slate-600 transition-colors space-y-2"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  log.status === 'passed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                                  log.status === 'repaired' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                                  log.status === 'escalated' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                                  'bg-slate-900 text-slate-400 border border-slate-700'
                                }`}>
                                  {log.status}
                                </span>
                                <span className="font-semibold text-xs text-white">
                                  {log.serviceType}
                                </span>
                                {log.workOrderRef && (
                                  <span className="font-mono text-[10px] text-amber-300 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-800">
                                    {log.workOrderRef}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                  <span>{log.date}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <User className="w-3.5 h-3.5 text-slate-500" />
                                  <span>{log.technician}</span>
                                </div>
                              </div>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed">
                              {log.description}
                            </p>

                            {log.partsReplaced && log.partsReplaced.length > 0 && (
                              <div className="flex items-center gap-1.5 text-[11px] text-cyan-300 pt-1">
                                <span className="text-slate-500">{isFr ? 'Pièces remplacées :' : 'Parts replaced:'}</span>
                                {log.partsReplaced.map((part, pIdx) => (
                                  <span key={pIdx} className="bg-slate-900 px-2 py-0.5 rounded border border-slate-700 font-mono text-[10px]">
                                    {part}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center bg-slate-900/60 rounded-xl border border-slate-800 text-slate-400 text-xs">
                          {isFr ? 'Aucun carnet de maintenance enregistré pour cet actif.' : 'No maintenance entries logged for this asset yet.'}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2: AUDIT TRAIL & LIFECYCLE HISTORY */}
                {dossierTab === 'history' && (
                  <div className="space-y-4">
                    <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                      {selectedAsset.assetHistory && selectedAsset.assetHistory.length > 0 ? (
                        selectedAsset.assetHistory.map((item, idx) => (
                          <div key={item.id || idx} className="relative group">
                            {/* Dot on timeline */}
                            <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-cyan-500 flex items-center justify-center group-hover:scale-125 transition-transform">
                              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            </div>

                            <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3.5 space-y-1 hover:border-slate-600 transition-colors">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="font-semibold text-xs text-white flex items-center gap-1.5">
                                  <span>{item.event}</span>
                                </span>
                                <span className="font-mono text-[11px] text-slate-400">
                                  {item.timestamp}
                                </span>
                              </div>

                              <div className="text-xs text-slate-300 leading-relaxed pt-0.5">
                                {item.details}
                              </div>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 pt-1 border-t border-slate-700/50 mt-2 font-mono">
                                <span>{isFr ? 'Officier :' : 'Officer:'} {item.officer}</span>
                                <span>{isFr ? 'Lieu :' : 'Location:'} {item.location}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center bg-slate-900/60 rounded-xl border border-slate-800 text-slate-400 text-xs">
                          {isFr ? 'Aucun événement d\'audit enregistré.' : 'No audit events found.'}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>
              {isFr ? 'Rapport scellé conforme ISO-9001 / Procédure §44' : 'Sealed under ISO-9001 & Prison Security Audit Standard §44'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {activeView === 'dossier' && (
              <button
                type="button"
                onClick={() => { setActiveView('scanner'); setSelectedAsset(null); }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-colors flex items-center gap-1.5"
              >
                <Scan className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isFr ? 'Scanner un Autre Actif' : 'Scan Another Asset'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-xs transition-colors"
            >
              {isFr ? 'Fermer le Terminal' : 'Close Terminal'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
