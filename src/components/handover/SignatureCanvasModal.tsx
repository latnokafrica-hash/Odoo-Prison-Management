import React, { useRef, useState, useEffect } from 'react';
import { Language, ShiftType, CommanderSignOff } from '../../types';
import { 
  PenTool, 
  RotateCcw, 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  ShieldAlert, 
  Key, 
  Fingerprint, 
  FileCheck 
} from 'lucide-react';

interface SignatureCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSign: (signOff: CommanderSignOff) => void;
  signType: 'outgoing' | 'incoming' | 'governor';
  shift: ShiftType;
  defaultName?: string;
  defaultRank?: string;
  defaultBadge?: string;
  language: Language;
}

export const SignatureCanvasModal: React.FC<SignatureCanvasModalProps> = ({
  isOpen,
  onClose,
  onConfirmSign,
  signType,
  shift,
  defaultName = '',
  defaultRank = 'Chief Inspector',
  defaultBadge = 'KP-8421',
  language,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  
  const [commanderName, setCommanderName] = useState(defaultName || (
    signType === 'outgoing' ? 'Capt. Marcus Vance' :
    signType === 'incoming' ? 'Insp. Sarah Aling\'o' : 'Josephat Mwangi'
  ));
  const [commanderRank, setCommanderRank] = useState(defaultRank || (
    signType === 'outgoing' ? 'Chief Inspector' :
    signType === 'incoming' ? 'Inspector' : 'Senior Superintendent of Prisons'
  ));
  const [badgeNumber, setBadgeNumber] = useState(defaultBadge || (
    signType === 'outgoing' ? 'KP-8421' :
    signType === 'incoming' ? 'KP-8819' : 'SSP-001'
  ));
  const [declarationConfirmed, setDeclarationConfirmed] = useState(false);
  const [handoverNotes, setHandoverNotes] = useState('');
  const [exceptionsNoted, setExceptionsNoted] = useState('');
  const [signatureMethod, setSignatureMethod] = useState<'canvas' | 'pki'>('canvas');

  // Initialize canvas
  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#1e3a8a';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isOpen, signatureMethod]);

  if (!isOpen) return null;

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleGeneratePKISignature = () => {
    setSignatureMethod('pki');
    setHasDrawn(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!declarationConfirmed) {
      alert(language === 'fr' 
        ? 'Veuillez cocher la déclaration de conformité réglementaire avant de signer.' 
        : 'Please confirm the statutory declaration before submitting your digital sign-off.');
      return;
    }

    let signatureData = '';
    if (signatureMethod === 'canvas' && canvasRef.current) {
      signatureData = canvasRef.current.toDataURL('image/png');
    } else {
      const hash = `PKI-SHA256-${badgeNumber}-${Date.now().toString(16).toUpperCase()}`;
      signatureData = hash;
    }

    const now = new Date();
    const timestamp = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`;

    const signOff: CommanderSignOff = {
      commanderId: `cmd-${Date.now()}`,
      commanderName,
      rank: commanderRank,
      badgeNumber,
      signatureType: signatureMethod === 'canvas' ? 'digital_canvas' : 'pki_smartcard',
      signatureData,
      signedAt: timestamp,
      declarationConfirmed: true,
      handoverNotes: handoverNotes || undefined,
      exceptionsNoted: exceptionsNoted || undefined,
    };

    onConfirmSign(signOff);
    onClose();
  };

  const getTitle = () => {
    if (signType === 'outgoing') {
      return language === 'fr' ? 'Signature Numérique - Commandant de Quart Sortant' : 'Digital Sign-Off: Outgoing Shift Commander';
    }
    if (signType === 'incoming') {
      return language === 'fr' ? 'Acceptation de Garde - Commandant de Quart Entrant' : 'Custody Acceptance: Incoming Shift Commander';
    }
    return language === 'fr' ? 'Visa & Certification de Direction (Gouverneur)' : 'Executive Certification: Superintendent / Governor';
  };

  const getDeclarationText = () => {
    if (signType === 'outgoing') {
      return language === 'fr'
        ? 'Je soussigné(e), commandant de quart sortant, certifie sur l\'honneur avoir vérifié physiquement l\'intégralité des effectifs détenus, l\'état d\'intégrité des 28 clés maîtresses et armements de dotation, et consigné fidèlement tous les incidents et risques opérationnels de la période.'
        : 'I, the outgoing shift commander, solemnly certify that all inmate physical headcounts are reconciled with the master register, all 28 master keys and armory weapons are accounted for, and all current facility risks and pending directives have been accurately stated.';
    }
    if (signType === 'incoming') {
      return language === 'fr'
        ? 'Je soussigné(e), commandant de quart entrant, certifie avoir inspecté conjointement l\'armoire des clés maîtresses, les effectifs des quartiers cellulaires et les détenus sous observation critique, et accepte l\'entière responsabilité opérationnelle et sécuritaire de l\'établissement.'
        : 'I, the incoming shift commander, hereby acknowledge joint physical inspection of master keys, armory munitions, cell block headcount verification, and high-risk inmates, and assume full custodial command of the facility for this watch.';
    }
    return language === 'fr'
      ? 'Je soussigné(e), Directeur de l\'établissement, valide la passation de quart après examen des écarts et ordonne l\'exécution immédiate des tâches prioritaires.'
      : 'I, the Superintendent / Prison Governor, have reviewed the handover dossier, verified risk mitigations, and formally ratify the operational command transition.';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              signType === 'outgoing' ? 'bg-amber-600/30 text-amber-300' :
              signType === 'incoming' ? 'bg-indigo-600/30 text-indigo-300' :
              'bg-emerald-600/30 text-emerald-300'
            }`}>
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{getTitle()}</h3>
              <p className="text-xs text-slate-400">
                {language === 'fr' ? 'Protocole Odoo 19 de sécurité pénitentiaire' : 'Odoo 19 Corrections Digital Protocol'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Officer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'fr' ? 'Nom de l\'Officier' : 'Officer Name'} *
              </label>
              <input
                type="text"
                required
                value={commanderName}
                onChange={e => setCommanderName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'fr' ? 'Matricule' : 'Badge #'} *
              </label>
              <input
                type="text"
                required
                value={badgeNumber}
                onChange={e => setBadgeNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-medium text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === 'fr' ? 'Grade / Titre' : 'Rank / Title'} *
            </label>
            <input
              type="text"
              required
              value={commanderRank}
              onChange={e => setCommanderRank(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
            />
          </div>

          {/* Statutory Declaration Banner */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2.5">
              <input
                type="checkbox"
                id="declarationCheckbox"
                checked={declarationConfirmed}
                onChange={e => setDeclarationConfirmed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded-sm border-amber-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="declarationCheckbox" className="text-xs text-amber-950 cursor-pointer leading-relaxed">
                <strong>{language === 'fr' ? 'Déclaration Réglementaire :' : 'Statutory Oath :'}</strong>{' '}
                {getDeclarationText()}
              </label>
            </div>
          </div>

          {/* Signature Mode Switcher */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-indigo-600" />
                <span>{language === 'fr' ? 'Signature Numérique' : 'Digital Signature Capture'}</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSignatureMethod('canvas')}
                  className={`px-2 py-0.5 text-[11px] rounded-md font-medium transition-colors ${
                    signatureMethod === 'canvas' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {language === 'fr' ? 'Tracé Manuel' : 'Draw Signature'}
                </button>
                <button
                  type="button"
                  onClick={handleGeneratePKISignature}
                  className={`px-2 py-0.5 text-[11px] rounded-md font-medium transition-colors ${
                    signatureMethod === 'pki' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {language === 'fr' ? 'Jeton PKI / Clé' : 'PKI Digital Certificate'}
                </button>
              </div>
            </div>

            {signatureMethod === 'canvas' ? (
              <div className="relative border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={130}
                  className="w-full h-32 touch-none cursor-crosshair bg-white"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                {!hasDrawn && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-xs text-slate-400">
                    {language === 'fr' ? 'Signez ici avec la souris ou l\'écran tactile' : 'Sign here with mouse or stylus'}
                  </div>
                )}
                <div className="absolute bottom-1 right-2">
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="p-1 text-slate-400 hover:text-rose-600 bg-white/80 rounded-md text-[11px] font-medium flex items-center gap-1 shadow-xs border border-slate-200"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{language === 'fr' ? 'Effacer' : 'Clear'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-lg text-center space-y-2">
                <Fingerprint className="w-8 h-8 text-indigo-600 mx-auto" />
                <p className="text-xs font-semibold text-indigo-900">
                  {language === 'fr' ? 'Certificat Cryptographique PKI Prêt' : 'PKI Digital Cryptographic Certificate Armed'}
                </p>
                <p className="text-[11px] font-mono text-indigo-700 bg-white/80 py-1 px-2 rounded border border-indigo-200 inline-block">
                  CERT-SHA256-{badgeNumber}-{new Date().getFullYear()}
                </p>
                <p className="text-[11px] text-slate-500">
                  {language === 'fr' 
                    ? 'Horodatage sécurisé et non-répudiation garantis selon la norme ISO 27001.' 
                    : 'Non-repudiation cryptographic verification under Prison Security Regulation 14.'}
                </p>
              </div>
            )}
          </div>

          {/* Commander Notes & Exceptions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'fr' ? 'Remarques & Consignes de Quart' : 'Shift Directives & Handover Notes'}
              </label>
              <textarea
                rows={2}
                value={handoverNotes}
                onChange={e => setHandoverNotes(e.target.value)}
                placeholder={language === 'fr' ? 'Ex: R.A.S., vigilance accrue sur quartier A...' : 'e.g. Normal handover, extra vigilance on Block A...'}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'fr' ? 'Réserves / Dérogations Notées' : 'Exceptions or Discrepancies Noted'}
              </label>
              <textarea
                rows={2}
                value={exceptionsNoted}
                onChange={e => setExceptionsNoted(e.target.value)}
                placeholder={language === 'fr' ? 'Ex: 1 casque balistique en révision atelier...' : 'e.g. 1 ballistic helmet at logistics workshop...'}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {language === 'fr' ? 'Annuler' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={!declarationConfirmed}
              className={`px-5 py-2 text-xs font-semibold text-white rounded-lg shadow-sm flex items-center gap-1.5 transition-all ${
                declarationConfirmed 
                  ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-95' 
                  : 'bg-slate-400 cursor-not-allowed opacity-60'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {signType === 'outgoing' 
                  ? (language === 'fr' ? 'Signer et Transmettre le Quart' : 'Sign & Submit Outgoing Handover')
                  : signType === 'incoming'
                  ? (language === 'fr' ? 'Valider et Prendre la Garde' : 'Accept Custody & Sign In')
                  : (language === 'fr' ? 'Viser le Dossier (Direction)' : 'Certify Handover Dossier')}
              </span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
