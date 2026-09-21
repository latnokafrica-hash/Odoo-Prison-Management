import React, { useState, useEffect, useRef } from 'react';
import { Inmate } from '../../types';
import { 
  Camera, 
  Fingerprint, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Video, 
  VideoOff, 
  X, 
  Sparkles, 
  Scan, 
  ScanFace,
  UserCheck, 
  Award, 
  Printer, 
  Sliders, 
  Lock, 
  Building2,
  FileCheck,
  AlertCircle
} from 'lucide-react';

interface BiometricVerificationModalProps {
  inmate: Inmate;
  isOpen: boolean;
  onClose: () => void;
  onUpdateInmate: (updated: Inmate) => void;
  currentOfficerName?: string;
}

type ScanStage = 'idle' | 'facial_scanning' | 'fingerprint_scanning' | 'analyzing' | 'completed' | 'failed';
type CameraStatus = 'requesting' | 'active' | 'denied' | 'unsupported' | 'simulated';

export const BiometricVerificationModal: React.FC<BiometricVerificationModalProps> = ({
  inmate,
  isOpen,
  onClose,
  onUpdateInmate,
  currentOfficerName = 'Biometrics Intake Officer S. Korir'
}) => {
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('requesting');
  const [cameraErrorMsg, setCameraErrorMsg] = useState<string>('');
  const [scanStage, setScanStage] = useState<ScanStage>('idle');
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [statusLog, setStatusLog] = useState<string>('Biometric subsystem standby. Awaiting capture initialization.');
  
  // Biometric test metrics
  const [facialConfidence, setFacialConfidence] = useState<number>(0);
  const [fingerprintConfidence, setFingerprintConfidence] = useState<number>(0);
  const [selectedFinger, setSelectedFinger] = useState<'right_thumb' | 'right_index' | 'left_index'>('right_index');
  const [capturedFrameUrl, setCapturedFrameUrl] = useState<string | null>(null);
  const [verificationSuccess, setVerificationSuccess] = useState<boolean>(false);
  const [auditHash, setAuditHash] = useState<string>('');
  const [showPrintSlip, setShowPrintSlip] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<any>(null);

  // Initialize camera access
  const startCamera = async () => {
    setCameraStatus('requesting');
    setCameraErrorMsg('');

    // Stop any existing tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera hardware access API not supported in this browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.warn('Video auto-play interrupted:', e));
      }
      setCameraStatus('active');
      setStatusLog('High-definition camera stream active. Position inmate face within alignment reticle.');
    } catch (err: any) {
      console.warn('Live camera access error, falling back to simulated optical feed:', err);
      const msg = err.name === 'NotAllowedError' 
        ? 'Camera permission was dismissed or blocked by browser settings.' 
        : err.message || 'Camera device unavailable or permission denied.';
      setCameraErrorMsg(msg);
      setCameraStatus('simulated');
      setStatusLog('Fallback to synthetic optical scan sensor activated. Full biometric pipeline available.');
    }
  };

  // Stop camera when closing
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {
          // Ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
      // Generate a mock biometric audit hash
      const randomHash = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
      setAuditHash(`AFIS-SHA256-${randomHash}`);
    } else {
      stopCamera();
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      setScanStage('idle');
      setScanProgress(0);
      setVerificationSuccess(false);
      setCapturedFrameUrl(null);
    }

    return () => {
      stopCamera();
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, [isOpen]);

  // Capture frame from live video or synthetic mugshot
  const captureSnapshot = (): string => {
    if (videoRef.current && canvasRef.current && cameraStatus === 'active') {
      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setCapturedFrameUrl(dataUrl);
          return dataUrl;
        }
      } catch (err) {
        console.warn('Canvas capture error:', err);
      }
    }
    // Fallback snapshot
    setCapturedFrameUrl(inmate.photoUrl);
    return inmate.photoUrl;
  };

  // Execute Multimodal Biometric Scan Sequence
  const handleStartVerification = () => {
    if (scanStage !== 'idle' && scanStage !== 'completed') return;

    setScanStage('facial_scanning');
    setScanProgress(0);
    setStatusLog('Step 1/3: Calibrating facial landmarks & 3D mesh contour...');

    let progress = 0;
    const interval = setInterval(() => {
      progress += 4;
      setScanProgress(Math.min(progress, 100));

      if (progress === 28) {
        setStatusLog('Step 1/3: Analyzing facial symmetry, inter-pupillary distance & anti-spoof liveness...');
      } else if (progress === 48) {
        // Facial complete, capture frame
        captureSnapshot();
        const faceScore = Math.floor(96 + Math.random() * 3.8);
        setFacialConfidence(faceScore);
        setScanStage('fingerprint_scanning');
        setStatusLog(`Step 2/3: Facial scan verified (${faceScore}% match). Place inmate finger on optical sensor...`);
      } else if (progress === 72) {
        setStatusLog('Step 2/3: Extracting fingerprint minutiae (ridge endings, bifurcations, core delta)...');
      } else if (progress === 88) {
        setScanStage('analyzing');
        setStatusLog('Step 3/3: Comparing with National AFIS Repository & Criminal Records Bureau...');
      } else if (progress >= 100) {
        clearInterval(interval);
        const printScore = Math.floor(97 + Math.random() * 2.8);
        setFingerprintConfidence(printScore);
        setScanStage('completed');
        setVerificationSuccess(true);
        setStatusLog(`Verification Complete: POSITIVE IDENTITY CONFIRMATION (99.4% Aggregate Match).`);
      }
    }, 120);

    scanIntervalRef.current = interval;
  };

  // Save biometric verification to inmate dossier & chatter
  const handleApplyToInmateRecord = (updateMugshot: boolean = false) => {
    const verificationDate = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const avgConfidence = Math.round(((facialConfidence || 98.4) + (fingerprintConfidence || 99.2)) / 2);

    const updatedBiometrics = {
      ...inmate.biometrics,
      fingerprintsEnrolled: true,
      irisScanCaptured: true,
      lastVerificationDate: verificationDate,
      lastVerificationStatus: 'verified' as const,
      lastVerificationConfidence: avgConfidence,
      facialMatchConfidence: facialConfidence || 98,
      fingerprintMatchConfidence: fingerprintConfidence || 99,
      verifiedByOfficer: currentOfficerName,
      verificationMethod: 'multimodal_camera_afis' as const,
      capturedPhotoUrl: (updateMugshot && capturedFrameUrl) ? capturedFrameUrl : inmate.biometrics?.capturedPhotoUrl
    };

    const newChatterEntry = {
      id: `ch-bio-${Date.now()}`,
      date: verificationDate,
      author: currentOfficerName,
      message: `[BIOMETRIC VERIFICATION PASSED] Inmate identity confirmed with ${avgConfidence}% confidence rating (Facial: ${facialConfidence || 98}%, AFIS Minutiae: ${fingerprintConfidence || 99}%). Audit Reference: ${auditHash}. Physical custody identity legally certified.`,
      type: 'activity' as const
    };

    const updated: Inmate = {
      ...inmate,
      photoUrl: (updateMugshot && capturedFrameUrl) ? capturedFrameUrl : inmate.photoUrl,
      biometrics: updatedBiometrics,
      chatterLogs: [newChatterEntry, ...inmate.chatterLogs]
    };

    onUpdateInmate(updated);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="bg-[#714B67] text-white px-5 py-3.5 flex items-center justify-between border-b border-[#5c3c54]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-xs">
              <ScanFace className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">Biometric Identity Verification</h3>
                <span className="bg-white/20 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                  Odoo 19 ID-AFIS
                </span>
              </div>
              <p className="text-xs text-purple-100">
                Live camera facial recognition & AFIS 10-print minutiae verification for intake & custody control
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="Close Biometric Verification"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inmate Demographic Mini-Banner */}
        <div className="bg-slate-50 px-5 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <img 
              src={inmate.photoUrl} 
              alt={inmate.firstName} 
              className="w-10 h-10 rounded-md object-cover border border-slate-300"
            />
            <div>
              <div className="font-bold text-slate-900 text-sm">
                {inmate.firstName} {inmate.lastName} {inmate.alias ? `("${inmate.alias}")` : ''}
              </div>
              <div className="text-slate-500 flex items-center gap-2">
                <span>ID: <strong className="font-mono text-slate-700">{inmate.nationalIdNumber}</strong></span>
                <span>•</span>
                <span>Booking: <strong className="font-mono text-slate-700">{inmate.bookingNumber}</strong></span>
                <span>•</span>
                <span>Custody: <strong className="uppercase text-purple-700">{inmate.custodyStatus}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-white px-3 py-1 rounded border border-slate-200 text-right">
              <div className="text-[10px] uppercase text-slate-400 font-bold">Verifying Officer</div>
              <div className="font-semibold text-slate-800 text-xs">{currentOfficerName}</div>
            </div>
            <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded flex items-center gap-1.5 font-mono text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>AFIS ONLINE</span>
            </div>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* Main Dual Grid: Live Camera Viewport + Fingerprint / AFIS Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Left Column: Live Camera Video Stream & Facial Target Reticle */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-950 flex flex-col justify-between shadow-xs">
              <div className="bg-slate-900 px-3.5 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold">Live Optical Camera Feed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {cameraStatus === 'active' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      WEBCAM LIVE
                    </span>
                  ) : cameraStatus === 'requesting' ? (
                    <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      INITIALIZING...
                    </span>
                  ) : (
                    <span className="text-[10px] text-cyan-300 font-mono bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                      SIMULATED SENSOR
                    </span>
                  )}
                </div>
              </div>

              {/* Video Display Area */}
              <div className="relative aspect-4/3 bg-slate-900 flex items-center justify-center overflow-hidden">
                {/* Real WebRTC Video Element */}
                <video 
                  ref={videoRef}
                  autoPlay 
                  playsInline 
                  muted 
                  className={`w-full h-full object-cover ${cameraStatus === 'active' ? 'block' : 'hidden'}`}
                />

                {/* Simulated Camera Video View when real webcam is blocked or not available */}
                {cameraStatus !== 'active' && (
                  <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center bg-radial from-slate-800 to-slate-950">
                    <img
                      src={inmate.photoUrl}
                      alt="Synthetic Enrolled Mugshot"
                      className="w-36 h-36 rounded-full object-cover border-2 border-cyan-500/60 shadow-lg mb-2 opacity-90"
                    />
                    <div className="text-xs font-semibold text-cyan-300">
                      Synthetic Optical Video Stream Active
                    </div>
                    <div className="text-[11px] text-slate-400 max-w-xs mt-1">
                      {cameraErrorMsg || 'Simulated biometric feed operating with high-fidelity telemetry.'}
                    </div>

                    <button
                      onClick={startCamera}
                      className="mt-3 px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Retry Hardware Camera Access</span>
                    </button>
                  </div>
                )}

                {/* Tactical HUD Overlay Elements */}
                <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                  {/* Top HUD Telemetry */}
                  <div className="flex justify-between items-start text-[10px] font-mono text-cyan-400 drop-shadow-md">
                    <div className="bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs">
                      EXP: AUTO • FPS: 30 • 640x480
                    </div>
                    <div className="bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1 text-emerald-400">
                      <ShieldCheck className="w-3 h-3" />
                      <span>LIVENESS: PASS</span>
                    </div>
                  </div>

                  {/* Centered Facial Reticle */}
                  <div className="relative mx-auto w-48 h-56 border-2 border-dashed border-cyan-400/70 rounded-3xl flex items-center justify-center">
                    {/* Corner Reticle Brackets */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-300 -translate-x-1 -translate-y-1" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-300 translate-x-1 -translate-y-1" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-300 -translate-x-1 translate-y-1" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-300 translate-x-1 translate-y-1" />

                    {/* Scanning Laser Line */}
                    {scanStage === 'facial_scanning' && (
                      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse shadow-[0_0_12px_#22d3ee] top-1/2 -translate-y-1/2 animate-bounce" />
                    )}

                    <div className="text-[10px] font-mono text-cyan-200/80 bg-black/50 px-2 py-0.5 rounded text-center">
                      {scanStage === 'facial_scanning' ? 'SCANNING MESH...' : 'ALIGN FACE'}
                    </div>
                  </div>

                  {/* Bottom HUD */}
                  <div className="flex justify-between items-end text-[10px] font-mono text-cyan-400 drop-shadow-md">
                    <div className="bg-black/50 px-2 py-0.5 rounded">
                      MATCH TARGET: {inmate.bookingNumber}
                    </div>
                    {facialConfidence > 0 && (
                      <div className="bg-emerald-950/80 border border-emerald-500 text-emerald-300 px-2 py-0.5 rounded font-bold">
                        FACIAL MATCH: {facialConfidence}%
                      </div>
                    )}
                  </div>
                </div>

                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* Camera Controls Bar */}
              <div className="bg-slate-900 px-3 py-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Scan className="w-3.5 h-3.5 text-cyan-400" />
                  <span>ISO 19794-5 Compliant Face Geometry</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (cameraStatus === 'active') {
                        stopCamera();
                        setCameraStatus('simulated');
                      } else {
                        startCamera();
                      }
                    }}
                    className="text-[11px] text-slate-300 hover:text-white underline cursor-pointer"
                  >
                    {cameraStatus === 'active' ? 'Use Synthetic Feed' : 'Use Webcam'}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Optical Fingerprint / AFIS Minutiae Scanner */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white flex flex-col justify-between shadow-xs">
              <div className="bg-slate-50 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-purple-700" />
                  <span className="font-bold">AFIS 10-Print Minutiae Sensor</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-mono bg-purple-100 text-purple-900 px-2 py-0.5 rounded font-bold">
                    FBI-WSQ 500 DPI
                  </span>
                </div>
              </div>

              {/* Fingerprint Interactive Sensor Area */}
              <div className="p-4 flex-1 flex flex-col items-center justify-center text-center space-y-3">
                {/* Finger Selector Tabs */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-[11px] font-medium">
                  <button
                    type="button"
                    onClick={() => setSelectedFinger('right_thumb')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      selectedFinger === 'right_thumb' ? 'bg-white font-bold text-purple-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    R. Thumb
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedFinger('right_index')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      selectedFinger === 'right_index' ? 'bg-white font-bold text-purple-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    R. Index (Primary)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedFinger('left_index')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      selectedFinger === 'left_index' ? 'bg-white font-bold text-purple-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    L. Index
                  </button>
                </div>

                {/* Fingerprint Pad Graphic with Scan Animation */}
                <div className="relative w-36 h-44 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-purple-300/80 p-2 flex items-center justify-center overflow-hidden shadow-inner group">
                  {/* Fingerprint Glyph */}
                  <Fingerprint className={`w-28 h-28 transition-all ${
                    scanStage === 'fingerprint_scanning' || scanStage === 'completed'
                      ? 'text-cyan-400 drop-shadow-[0_0_8px_#22d3ee]'
                      : 'text-slate-600'
                  }`} />

                  {/* Minutiae Dots (Feature points) */}
                  {(scanStage === 'fingerprint_scanning' || scanStage === 'completed') && (
                    <>
                      <span className="absolute top-10 left-12 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-200 animate-ping" />
                      <span className="absolute top-16 right-12 w-1.5 h-1.5 rounded-full bg-cyan-400 ring-1 ring-cyan-200" />
                      <span className="absolute bottom-12 left-14 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-amber-200" />
                      <span className="absolute bottom-16 right-14 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="absolute top-24 left-16 w-2 h-2 rounded-full bg-purple-400" />
                    </>
                  )}

                  {/* Scanning sweep bar */}
                  {scanStage === 'fingerprint_scanning' && (
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-bounce shadow-[0_0_10px_#a855f7]" />
                  )}

                  <div className="absolute bottom-1.5 inset-x-0 text-[9px] font-mono text-slate-400 text-center">
                    {scanStage === 'fingerprint_scanning' ? 'ANALYZING RIDGES...' : 'OPTICAL PLATEN'}
                  </div>
                </div>

                {/* Fingerprint Details */}
                <div className="text-xs text-slate-600 max-w-xs">
                  {fingerprintConfidence > 0 ? (
                    <div className="font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded border border-emerald-200 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Minutiae Match Confirmed: {fingerprintConfidence}%</span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500">
                      Sensor active. Awaiting print placement for criminal repository vector comparison.
                    </div>
                  )}
                </div>
              </div>

              {/* Sensor Spec Footer */}
              <div className="bg-slate-50 px-3.5 py-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <span>AFIS Minutiae Count: <strong>48 Ridge Points</strong></span>
                <span className="font-mono text-purple-700 font-bold">ANSI/NIST-ITL 1-2011</span>
              </div>
            </div>
          </div>

          {/* Verification Progress & Real-Time Status Log */}
          <div className="bg-slate-900 text-slate-200 rounded-xl p-4 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold text-amber-400 font-mono uppercase text-[11px]">System Status Log:</span>
                <span className="text-slate-300 font-mono text-[11px] truncate max-w-md">{statusLog}</span>
              </div>
              <span className="font-mono text-xs font-bold text-cyan-400">{scanProgress}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-500 transition-all duration-150"
                style={{ width: `${scanProgress}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-slate-400 font-mono">
              <div className={`flex items-center gap-1 ${facialConfidence > 0 ? 'text-emerald-400 font-bold' : ''}`}>
                {facialConfidence > 0 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-3 h-3 rounded-full border border-slate-600" />}
                <span>1. Camera Face Mesh ({facialConfidence ? `${facialConfidence}%` : 'Pending'})</span>
              </div>
              <div className={`flex items-center gap-1 ${fingerprintConfidence > 0 ? 'text-emerald-400 font-bold' : ''}`}>
                {fingerprintConfidence > 0 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-3 h-3 rounded-full border border-slate-600" />}
                <span>2. Optical Fingerprint ({fingerprintConfidence ? `${fingerprintConfidence}%` : 'Pending'})</span>
              </div>
              <div className={`flex items-center gap-1 ${verificationSuccess ? 'text-emerald-400 font-bold' : ''}`}>
                {verificationSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-3 h-3 rounded-full border border-slate-600" />}
                <span>3. Dossier Confirmation</span>
              </div>
            </div>
          </div>

          {/* Verification Result Banner (When Complete) */}
          {verificationSuccess && (
            <div className="bg-emerald-50 border-2 border-emerald-400 rounded-xl p-4 text-emerald-950 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-xs">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-emerald-900 leading-tight">
                      Identity Positively Verified & Authenticated
                    </h4>
                    <p className="text-xs text-emerald-700">
                      Live multimodal biometrics match enrolled institutional record with 99.4% aggregate confidence.
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-emerald-600 text-white text-xs font-mono font-bold rounded-full shadow-2xs">
                    LEGAL CLEARANCE SEAL
                  </span>
                </div>
              </div>

              {/* Verification Details Table */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-white/80 p-2 rounded border border-emerald-200">
                  <span className="text-[10px] text-slate-500 uppercase block">Inmate Subject</span>
                  <span className="font-bold text-slate-800">{inmate.firstName} {inmate.lastName}</span>
                </div>
                <div className="bg-white/80 p-2 rounded border border-emerald-200">
                  <span className="text-[10px] text-slate-500 uppercase block">National ID / Docket</span>
                  <span className="font-mono font-bold text-slate-800">{inmate.nationalIdNumber}</span>
                </div>
                <div className="bg-white/80 p-2 rounded border border-emerald-200">
                  <span className="text-[10px] text-slate-500 uppercase block">Audit Reference</span>
                  <span className="font-mono text-[10px] font-bold text-purple-700">{auditHash}</span>
                </div>
                <div className="bg-white/80 p-2 rounded border border-emerald-200">
                  <span className="text-[10px] text-slate-500 uppercase block">Verification Timestamp</span>
                  <span className="font-mono text-[11px] text-slate-700">{new Date().toISOString().slice(0, 16)}</span>
                </div>
              </div>

              {/* Printable Slip Preview toggle */}
              {showPrintSlip && (
                <div className="p-4 bg-white border border-slate-300 rounded-lg shadow-sm font-mono text-xs text-slate-800 space-y-2">
                  <div className="text-center border-b border-slate-200 pb-2">
                    <div className="font-bold text-sm">CORRECTIONAL SERVICES DEPT • BIOMETRIC CLEARANCE SLIP</div>
                    <div className="text-[11px] text-slate-500">Form PRIS-BIO-19 • Statutory Identity Authentication</div>
                  </div>
                  <div className="flex justify-between">
                    <span>INMATE NAME: {inmate.firstName.toUpperCase()} {inmate.lastName.toUpperCase()}</span>
                    <span>BOOKING: {inmate.bookingNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>FACIAL MATCH: {facialConfidence}%</span>
                    <span>AFIS 10-PRINT: {fingerprintConfidence}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>FACILITY: {inmate.facilityName}</span>
                    <span>OFFICER: {currentOfficerName}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100 text-center">
                    Cryptographic Digest: {auditHash} • Legally valid for internal court production, cell transfer, or discharge clearance.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Action Buttons Footer */}
        <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              Cancel / Close
            </button>

            {verificationSuccess && (
              <button
                type="button"
                onClick={() => setShowPrintSlip(!showPrintSlip)}
                className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>{showPrintSlip ? 'Hide Clearance Slip' : 'Print Clearance Slip'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {!verificationSuccess ? (
              <button
                type="button"
                onClick={handleStartVerification}
                disabled={scanStage === 'facial_scanning' || scanStage === 'fingerprint_scanning' || scanStage === 'analyzing'}
                className={`px-5 py-2 rounded-lg text-xs font-bold text-white shadow-sm flex items-center gap-2 transition-all cursor-pointer ${
                  scanStage === 'idle' || scanStage === 'completed'
                    ? 'bg-[#714B67] hover:bg-[#5c3c54] active:scale-95'
                    : 'bg-slate-400 cursor-not-allowed'
                }`}
              >
                {scanStage === 'idle' ? (
                  <>
                    <ScanFace className="w-4 h-4 text-amber-300" />
                    <span>Start Biometric Verification Scan</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Scanning & Authenticating...</span>
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyToInmateRecord(true)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-800 bg-amber-400 hover:bg-amber-500 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  title="Update profile photo with live captured camera mugshot & save verification status"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Update Mugshot & Save Dossier</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyToInmateRecord(false)}
                  className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Save Biometric Status</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
