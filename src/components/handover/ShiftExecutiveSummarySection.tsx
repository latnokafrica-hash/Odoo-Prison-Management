import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldAlert,
  ListChecks,
  FileText,
  Check,
  Copy,
  Edit3,
  Save,
  RefreshCw,
  Zap,
  CheckCircle2,
  Quote,
  Clock,
  ArrowRight,
  SlidersHorizontal,
  PlusCircle,
  FileDown
} from 'lucide-react';
import {
  ShiftHandoverBriefData,
  ContrabandItem,
  PendingTaskItem,
  ShiftHandoverNote,
  Language,
} from '../../types';

interface ShiftExecutiveSummarySectionProps {
  language: Language;
  handover: ShiftHandoverBriefData;
  contrabandItems: ContrabandItem[];
  tasks: PendingTaskItem[];
  notes: ShiftHandoverNote[];
  onUpdateExecutiveSummary: (summary: string) => void;
  onAppendToNotes?: (noteText: string) => void;
  onProceedToSignOff?: () => void;
  compactView?: boolean;
}

export const ShiftExecutiveSummarySection: React.FC<ShiftExecutiveSummarySectionProps> = ({
  language,
  handover,
  contrabandItems,
  tasks,
  notes,
  onUpdateExecutiveSummary,
  onAppendToNotes,
  onProceedToSignOff,
  compactView = false,
}) => {
  const [summaryText, setSummaryText] = useState<string>(handover.executiveSummaryText || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState<string>(handover.executiveSummaryText || '');
  const [copied, setCopied] = useState(false);
  const [appended, setAppended] = useState(false);
  const [tone, setTone] = useState<'command' | 'security' | 'compliance'>('command');
  const [isLiveAi, setIsLiveAi] = useState<boolean>(true);
  const [lastGeneratedAt, setLastGeneratedAt] = useState<string | null>(handover.executiveSummaryGeneratedAt || null);

  // Sync when handover changes
  useEffect(() => {
    if (handover.executiveSummaryText && handover.executiveSummaryText !== summaryText) {
      setSummaryText(handover.executiveSummaryText);
      setEditedText(handover.executiveSummaryText);
    }
  }, [handover.executiveSummaryText]);

  // Derived input metrics for context pills
  const criticalContrabandCount = contrabandItems.filter(
    (c) => c.severityLevel === 'critical' || c.severityLevel === 'high'
  ).length;

  const urgentTasksCount = tasks.filter(
    (t) => t.priority === 'urgent' || t.priority === 'high'
  ).length;

  const criticalNotesCount = notes.filter(
    (n) => n.urgency === 'critical' || n.urgency === 'urgent'
  ).length;

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    setError(null);
    setGenerationStep(
      language === 'fr'
        ? 'Agrégation des saisies de contrebande...'
        : 'Aggregating seized contraband repository...'
    );

    try {
      // Small simulated step progression for UI responsiveness
      setTimeout(() => {
        setGenerationStep(
          language === 'fr'
            ? 'Analyse des tâches impératives et ordres de relève...'
            : 'Evaluating mandatory task deadlines & watch orders...'
        );
      }, 500);

      setTimeout(() => {
        setGenerationStep(
          language === 'fr'
            ? 'Synthèse du paragraphe avec Gemini 3.8 Flash...'
            : 'Synthesizing concise briefing paragraph via Gemini 3.8 Flash...'
        );
      }, 1100);

      const response = await fetch('/api/gemini/shift-executive-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityName: handover.facilityName,
          outgoingShift: handover.outgoingShift,
          incomingShift: handover.incomingShift,
          date: handover.date,
          outgoingCommander: handover.outgoingSignOff?.commanderName || 'Capt. Marcus Vance',
          contraband: contrabandItems,
          tasks,
          notes,
          language,
          tone,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.summary) {
        setSummaryText(data.summary);
        setEditedText(data.summary);
        setIsLiveAi(Boolean(data.isLiveAi));
        const genTime = data.generatedAt || new Date().toISOString();
        setLastGeneratedAt(genTime);
        onUpdateExecutiveSummary(data.summary);
      } else {
        throw new Error(data.error || 'No summary returned');
      }
    } catch (err: any) {
      console.error('Failed to generate summary with Gemini:', err);
      setError(
        language === 'fr'
          ? 'Impossible de joindre le service Gemini AI. Veuillez réessayer.'
          : 'Unable to reach Gemini AI service. Please verify server connection.'
      );
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleSaveEdit = () => {
    setSummaryText(editedText);
    setIsEditing(false);
    onUpdateExecutiveSummary(editedText);
  };

  const handleCopyToClipboard = async () => {
    if (!summaryText) return;
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
    }
  };

  const handleAppendToHandoverNotes = () => {
    if (!summaryText || !onAppendToNotes) return;
    onAppendToNotes(summaryText);
    setAppended(true);
    setTimeout(() => setAppended(false), 3000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl transition-all">
      {/* Top Intelligence Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/80 px-4 py-3 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
            <Sparkles className="w-4 h-4 text-indigo-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
                <span>{language === 'fr' ? 'RÉSUMÉ EXÉCUTIF DU QUART' : 'SHIFT EXECUTIVE SUMMARY'}</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Zap className="w-2.5 h-2.5 text-indigo-400" />
                <span>Gemini 3.8 Flash</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {language === 'fr'
                ? 'Paragraphe officiel synthétisant les objets saisis, les tâches impératives et les notes numériques'
                : 'Operational high-command paragraph auto-synthesized from seized contraband, mandatory tasks & digital notes'}
            </p>
          </div>
        </div>

        {/* Tone Selector & Main Action Button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tone Selector */}
          <div className="flex items-center bg-slate-950/90 border border-slate-800 rounded-lg p-0.5 text-[11px]">
            <span className="text-slate-500 px-2 py-0.5 flex items-center gap-1 text-[10px] uppercase font-bold">
              <SlidersHorizontal className="w-3 h-3" />
              <span className="hidden sm:inline">{language === 'fr' ? 'Angle' : 'Tone'}:</span>
            </span>
            <button
              type="button"
              onClick={() => setTone('command')}
              className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                tone === 'command'
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {language === 'fr' ? 'Commandement' : 'Command'}
            </button>
            <button
              type="button"
              onClick={() => setTone('security')}
              className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                tone === 'security'
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {language === 'fr' ? 'Sécurité & Menaces' : 'Security Threat'}
            </button>
            <button
              type="button"
              onClick={() => setTone('compliance')}
              className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                tone === 'compliance'
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {language === 'fr' ? 'Conformité' : 'Compliance'}
            </button>
          </div>

          {/* Generate / Regenerate Button */}
          <button
            type="button"
            onClick={handleGenerateSummary}
            disabled={isGenerating}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold text-white transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isGenerating
                ? 'bg-indigo-700'
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-95'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>
              {isGenerating
                ? (language === 'fr' ? 'Génération IA...' : 'Generating AI Briefing...')
                : summaryText
                ? (language === 'fr' ? 'Régénérer Synthèse' : 'Regenerate Briefing')
                : (language === 'fr' ? 'Générer avec Gemini' : 'Generate with Gemini AI')}
            </span>
          </button>
        </div>
      </div>

      {/* Synthesis Source Context Bar */}
      <div className="bg-slate-950/60 px-4 py-2 border-b border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {language === 'fr' ? 'Données Incluses :' : 'Data Feeds Analyzed:'}
          </span>

          {/* Contraband Pill */}
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-rose-950/40 text-rose-300 border border-rose-800/40 text-[11px]">
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            <span>
              <strong>{contrabandItems.length}</strong> {language === 'fr' ? 'objets saisis' : 'contraband seized'}
            </span>
            {criticalContrabandCount > 0 && (
              <span className="ml-1 px-1 py-0.2 rounded bg-rose-600 text-white font-mono text-[9px] font-bold">
                {criticalContrabandCount} {language === 'fr' ? 'critiques' : 'high-risk'}
              </span>
            )}
          </span>

          {/* Mandatory Tasks Pill */}
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-950/40 text-amber-300 border border-amber-800/40 text-[11px]">
            <ListChecks className="w-3 h-3 text-amber-400" />
            <span>
              <strong>{tasks.length}</strong> {language === 'fr' ? 'tâches de quart' : 'shift tasks'}
            </span>
            {urgentTasksCount > 0 && (
              <span className="ml-1 px-1 py-0.2 rounded bg-amber-600 text-slate-950 font-mono text-[9px] font-bold">
                {urgentTasksCount} {language === 'fr' ? 'urgentes' : 'urgent'}
              </span>
            )}
          </span>

          {/* Digital Notes Pill */}
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-indigo-950/40 text-indigo-300 border border-indigo-800/40 text-[11px]">
            <FileText className="w-3 h-3 text-indigo-400" />
            <span>
              <strong>{notes.length}</strong> {language === 'fr' ? 'notes consignées' : 'digital notes logged'}
            </span>
            {criticalNotesCount > 0 && (
              <span className="ml-1 px-1 py-0.2 rounded bg-indigo-600 text-white font-mono text-[9px] font-bold">
                {criticalNotesCount} {language === 'fr' ? 'vigilance' : 'watch alerts'}
              </span>
            )}
          </span>
        </div>

        {/* Shift Details */}
        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-slate-500" />
          <span>
            {handover.outgoingShift} &rarr; {handover.incomingShift}
          </span>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 sm:p-5">
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={handleGenerateSummary}
              className="px-2 py-1 bg-rose-800 text-white rounded text-[11px] font-semibold hover:bg-rose-700 cursor-pointer"
            >
              {language === 'fr' ? 'Réessayer' : 'Retry'}
            </button>
          </div>
        )}

        {/* Loading state during generation */}
        {isGenerating ? (
          <div className="py-8 px-4 rounded-xl bg-slate-950/80 border border-indigo-500/20 text-center space-y-3 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/5 to-transparent animate-pulse" />
            <div className="inline-flex p-3 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 shadow-md">
              <Sparkles className="w-6 h-6 animate-spin text-indigo-300" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                {language === 'fr' ? 'Génération de la Synthèse Exécutive...' : 'Generating Shift Executive Briefing...'}
              </p>
              <p className="text-xs text-indigo-300 font-mono mt-1 animate-pulse">
                {generationStep}
              </p>
            </div>
            <div className="max-w-md mx-auto h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 w-2/3 animate-pulse rounded-full" />
            </div>
          </div>
        ) : summaryText ? (
          /* Generated Summary Box */
          <div className="space-y-3">
            <div className="relative rounded-xl bg-slate-950/90 border border-indigo-500/30 p-4 sm:p-5 shadow-lg group">
              <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-90">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40">
                  {summaryText.trim().split(/\s+/).length} {language === 'fr' ? 'mots' : 'words'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>{language === 'fr' ? 'Prêt pour Ratification' : 'Ratification Ready'}</span>
                </span>
              </div>

              {/* Decorative quotation icon */}
              <div className="flex items-start gap-3">
                <Quote className="w-6 h-6 text-indigo-400 shrink-0 mt-0.5 opacity-80" />

                <div className="flex-1 pr-16 sm:pr-24">
                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        rows={4}
                        className="w-full bg-slate-900 border border-indigo-500 rounded-lg p-3 text-sm text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-400 leading-relaxed font-sans"
                        placeholder="Edit shift executive summary..."
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleSaveEdit}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Save className="w-3 h-3" />
                          <span>{language === 'fr' ? 'Sauvegarder' : 'Save Changes'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditedText(summaryText);
                            setIsEditing(false);
                          }}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium cursor-pointer"
                        >
                          {language === 'fr' ? 'Annuler' : 'Cancel'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm sm:text-[15px] font-normal text-slate-100 leading-relaxed tracking-normal font-sans select-text selection:bg-indigo-600 selection:text-white">
                      {summaryText}
                    </p>
                  )}
                </div>
              </div>

              {/* Card Footer Bar */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="font-semibold text-slate-300">
                    {language === 'fr' ? 'Généré par :' : 'Synthesized by:'}
                  </span>
                  <span className="font-mono text-indigo-300">
                    Gemini 3.8 Flash {isLiveAi ? '(Live API)' : '(Synthesis Engine)'}
                  </span>
                  {lastGeneratedAt && (
                    <span className="text-slate-500">
                      • {new Date(lastGeneratedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleCopyToClipboard}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer border border-slate-700"
                    title="Copy executive paragraph to clipboard"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">{language === 'fr' ? 'Copié !' : 'Copied!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>{language === 'fr' ? 'Copier' : 'Copy'}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer border border-slate-700"
                    title="Edit summary paragraph"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{isEditing ? (language === 'fr' ? 'Fermer' : 'Close') : (language === 'fr' ? 'Modifier' : 'Edit')}</span>
                  </button>

                  {onAppendToNotes && (
                    <button
                      type="button"
                      onClick={handleAppendToHandoverNotes}
                      className="px-2.5 py-1 rounded bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer border border-indigo-700/60"
                      title="Append to Official Handover Notes"
                    >
                      {appended ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300">{language === 'fr' ? 'Ajouté aux Notes !' : 'Appended to Notes!'}</span>
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{language === 'fr' ? 'Ajouter aux Notes' : 'Append to Notes'}</span>
                        </>
                      )}
                    </button>
                  )}

                  {onProceedToSignOff && (
                    <button
                      type="button"
                      onClick={onProceedToSignOff}
                      className="px-3 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs ml-1"
                    >
                      <span>{language === 'fr' ? 'Ratifier Rapport' : 'Proceed to Sign-Off'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Call to Action */
          <div className="py-6 px-4 rounded-xl bg-slate-950/50 border border-slate-800/80 text-center space-y-3">
            <div className="inline-flex p-3 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="max-w-xl mx-auto">
              <h4 className="text-sm font-bold text-slate-200">
                {language === 'fr'
                  ? 'Générer le Paragraphe Exécutif avec Gemini AI'
                  : 'Synthesize Shift Executive Summary with Gemini AI'}
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {language === 'fr'
                  ? `Combinez automatiquement les ${contrabandItems.length} saisies d'armes ou stupéfiants, les ${tasks.length} tâches opérationnelles impératives et les ${notes.length} directives de surveillance en un paragraphe officiel prêt pour le cahier de rapport du Directeur.`
                  : `Instantly distill all ${contrabandItems.length} confiscated contraband items, ${tasks.length} mandatory shift tasks, and ${notes.length} digital commander directives into a concise, authoritative operational paragraph for the Warden's briefing docket.`}
              </p>
            </div>
            <button
              type="button"
              onClick={handleGenerateSummary}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-lg text-xs font-bold transition-all shadow-md inline-flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>
                {language === 'fr'
                  ? 'Générer la Synthèse Opérationnelle'
                  : 'Auto-Generate Executive Summary Paragraph'}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
