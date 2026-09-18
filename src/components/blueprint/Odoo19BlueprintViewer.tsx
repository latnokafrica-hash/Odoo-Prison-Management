import React, { useState } from 'react';
import JSZip from 'jszip';
import { ODOO_19_MODULE_FILES, OdooFile } from '../../data/odoo19Files';
import { 
  FolderTree, 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  Terminal, 
  ShieldCheck, 
  CheckCircle2, 
  Package, 
  Layers, 
  Cpu, 
  Info,
  ExternalLink
} from 'lucide-react';

export const Odoo19BlueprintViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<OdooFile>(ODOO_19_MODULE_FILES[1]); // __manifest__.py default
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredFiles = activeCategory === 'all' 
    ? ODOO_19_MODULE_FILES 
    : ODOO_19_MODULE_FILES.filter(f => f.category === activeCategory);

  const handleCopy = () => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      
      ODOO_19_MODULE_FILES.forEach(file => {
        zip.file(file.path, file.content);
      });

      // Add readme and license
      zip.file('prison_management/README.md', `# Prison Management Enterprise Suite for Odoo 19

This module delivers end-to-end correctional operations management under Odoo 19 Enterprise.

### Installation
1. Place this \`prison_management\` directory in your Odoo \`addons_path\`.
2. Restart your Odoo 19 instance.
3. Enable Developer Mode in Settings.
4. Go to Apps > Update Apps List.
5. Search for "Prison Management Enterprise" and click Install.

### Requirements
- Odoo 19.0 Enterprise Edition
- Python 3.11+
- Dependencies: base, mail, resource, hr, web
`);

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'prison_management_odoo19.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate ZIP archive', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0 text-indigo-400">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">Odoo 19 Enterprise Module Package</h2>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Odoo 19 Compatible
              </span>
            </div>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Fully compliant Odoo 19 module package (`prison_management`). Includes strict load-order manifest, models with chatter mixins, security ACLs, XML views, wizards, and QWeb print reports.
            </p>
          </div>
        </div>
        <button
          onClick={handleDownloadZip}
          disabled={isZipping}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-lg transition-all shrink-0 cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isZipping ? 'Generating Package...' : 'Download prison_management.zip'}
        </button>
      </div>

      {/* Compliance Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-medium text-slate-700 dark:text-slate-300">Security ACLs & Rules</div>
            <div className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">4-tier RBAC + Multi-facility record rules in ir.model.access.csv</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-3">
          <Cpu className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-medium text-slate-700 dark:text-slate-300">Remission Engine</div>
            <div className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">Automated 1/3 statutory deduction & disciplinary forfeiture ledger</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-3">
          <Layers className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-medium text-slate-700 dark:text-slate-300">Odoo 19 Manifest Order</div>
            <div className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">Strict load-order: security -&gt; data -&gt; views -&gt; wizards -&gt; reports</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-medium text-slate-700 dark:text-slate-300">Mandela Compliance</div>
            <div className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">Automated 15-day solitary confinement ceiling & outdoor hours check</div>
          </div>
        </div>
      </div>

      {/* Code Explorer & Tree */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: File Directory Tree */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
              <FolderTree className="w-4 h-4 text-indigo-500" />
              <span>Module File Tree</span>
            </div>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">
              {ODOO_19_MODULE_FILES.length} Files
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-1 bg-slate-50/50 dark:bg-slate-900/50">
            {['all', 'manifest', 'model', 'security', 'view', 'data'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium capitalize transition-colors ${
                  activeCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Files List */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[600px] overflow-y-auto">
            {filteredFiles.map((file) => {
              const isSelected = selectedFile?.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-3 flex items-start gap-3 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-l-4 border-indigo-600'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <FileCode className={`w-4 h-4 shrink-0 mt-0.5 ${
                    file.language === 'python' ? 'text-amber-500' : file.language === 'xml' ? 'text-blue-500' : 'text-emerald-500'
                  }`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-xs font-medium truncate ${isSelected ? 'text-indigo-700 dark:text-indigo-300 font-semibold' : 'text-slate-700 dark:text-slate-300'}`}>
                        {file.path.replace('prison_management/', '')}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {file.language}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 truncate mt-0.5">
                      {file.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Code Viewer */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
          {/* File Top Bar */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                {selectedFile.path}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                {selectedFile.language.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Code'}
              </button>
            </div>
          </div>

          {/* Description banner */}
          <div className="px-4 py-2 bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/30 flex items-center gap-2 text-xs text-indigo-900 dark:text-indigo-200">
            <Info className="w-3.5 h-3.5 shrink-0 text-indigo-600 dark:text-indigo-400" />
            <span>{selectedFile.description}</span>
          </div>

          {/* Code Viewer Box */}
          <div className="p-4 bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed overflow-x-auto max-h-[550px] overflow-y-auto">
            <pre>
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Installation Instructions in Odoo 19 */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-100">
          <Terminal className="w-5 h-5 text-indigo-600" />
          <span>Odoo 19 Enterprise Installation &amp; Deployment Guide</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">1</span>
              Deploy Addon Folder
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Extract the downloaded <code className="text-indigo-600 dark:text-indigo-400">prison_management</code> folder into your custom addons directory:
            </p>
            <div className="p-2 bg-slate-950 text-slate-200 rounded font-mono text-[11px] overflow-x-auto">
              unzip prison_management_odoo19.zip -d /odoo/custom_addons/
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">2</span>
              CLI Install / Upgrade
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Execute installation directly on your Odoo database using standard CLI:
            </p>
            <div className="p-2 bg-slate-950 text-slate-200 rounded font-mono text-[11px] overflow-x-auto">
              odoo-bin -c /etc/odoo/odoo.conf -d corrections_db -i prison_management
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">3</span>
              Web Client Activation
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              In Odoo web interface:
            </p>
            <ol className="list-decimal list-inside text-slate-600 dark:text-slate-400 space-y-1">
              <li>Activate Developer Mode in Settings.</li>
              <li>Go to <strong>Apps</strong> &gt; <strong>Update Apps List</strong>.</li>
              <li>Search for <code className="text-indigo-600 dark:text-indigo-400">prison_management</code> and click <strong>Install</strong>.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
