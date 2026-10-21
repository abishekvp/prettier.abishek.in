'use client';

import React, { useRef, useState } from 'react';
import { bytesToSize } from '@/lib/prettier';
import {
  FileCode,
  Sparkles,
  UploadCloud,
  ClipboardPaste,
  Trash2,
  Copy,
  Check,
  Download,
  AlertCircle
} from 'lucide-react';

interface EditorViewProps {
  rawCode: string;
  setRawCode: (val: string) => void;
  formattedCode: string;
  error: string;
  onLoadSample: () => void;
  onClear: () => void;
  onDownload: () => void;
}

export const EditorView: React.FC<EditorViewProps> = ({
  rawCode,
  setRawCode,
  formattedCode,
  error,
  onLoadSample,
  onClear,
  onDownload
}) => {
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = () => {
    if (!formattedCode) return;
    navigator.clipboard.writeText(formattedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setRawCode(text);
    } catch (e) {
      // ignore
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setRawCode(evt.target?.result as string);
    };
    reader.readAsText(file);
  };

  const renderLines = (code: string) => {
    const count = Math.max(code.split('\n').length, 1);
    return Array.from({ length: count }, (_, i) => i + 1).join('\n');
  };

  const rawBytes = new TextEncoder().encode(rawCode).length;
  const rawLines = rawCode.trim() ? rawCode.split('\n').length : 0;

  const formBytes = new TextEncoder().encode(formattedCode).length;
  const formLines = formattedCode.trim() ? formattedCode.split('\n').length : 0;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-surface-darker">
      {error && (
        <div className="bg-red-500/10 border-b border-red-500/30 px-4 py-2 text-xs text-red-400 flex items-center gap-2 flex-shrink-0">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Main Dual Columns */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-surface-border min-h-0">
        {/* Left Column: Raw Input */}
        <div className="flex flex-col h-full bg-surface-card min-h-0">
          <div className="h-9 px-3 border-b border-surface-border flex items-center justify-between text-xs text-slate-400 bg-surface-subtle/50 select-none flex-shrink-0">
            <div className="flex items-center gap-2 font-semibold text-slate-200">
              <FileCode className="w-3.5 h-3.5 text-blue-400" />
              <span>Raw / Unformatted Code</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 mr-1 hidden sm:inline">
                {rawLines} lines · {bytesToSize(rawBytes)}
              </span>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1 hover:text-white rounded hover:bg-surface-hover"
                title="Upload code file"
              >
                <UploadCloud className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onLoadSample}
                className="px-2 py-0.5 rounded bg-surface-subtle hover:bg-surface-hover text-slate-300 hover:text-white text-[11px]"
              >
                Sample
              </button>

              <button
                onClick={handlePaste}
                className="p-1 hover:text-white rounded hover:bg-surface-hover"
                title="Paste from clipboard"
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onClear}
                className="p-1 hover:text-red-400 rounded hover:bg-surface-hover"
                title="Clear code"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex min-h-0 relative bg-[#0d131f]">
            <div className="w-10 py-3 bg-[#090d16] border-r border-surface-border/50 text-right pr-2 select-none text-[12px] font-mono text-slate-600 leading-relaxed overflow-hidden">
              <pre className="m-0 p-0">{renderLines(rawCode)}</pre>
            </div>
            <textarea
              value={rawCode}
              onChange={(e) => setRawCode(e.target.value)}
              placeholder="Paste or type unformatted code here..."
              spellCheck={false}
              className="flex-1 p-3 bg-transparent text-slate-100 font-mono text-[12px] leading-relaxed resize-none focus:outline-none selection:bg-blue-600/30 overflow-auto whitespace-pre"
            />
          </div>
        </div>

        {/* Right Column: Formatted Output */}
        <div className="flex flex-col h-full bg-surface-card min-h-0">
          <div className="h-9 px-3 border-b border-surface-border flex items-center justify-between text-xs text-slate-400 bg-surface-subtle/50 select-none flex-shrink-0">
            <div className="flex items-center gap-2 font-semibold text-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Formatted Output</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 mr-2">
                {formLines} lines · {bytesToSize(formBytes)}
              </span>

              <button
                onClick={handleCopy}
                disabled={!formattedCode}
                className="flex items-center gap-1 px-2.5 py-0.5 text-xs text-slate-300 hover:text-white rounded hover:bg-surface-hover disabled:opacity-30 disabled:pointer-events-none font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={onDownload}
                disabled={!formattedCode}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-surface-hover disabled:opacity-30 disabled:pointer-events-none"
                title="Download Formatted File"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex min-h-0 relative bg-[#0d131f]">
            <div className="w-10 py-3 bg-[#090d16] border-r border-surface-border/50 text-right pr-2 select-none text-[12px] font-mono text-slate-600 leading-relaxed overflow-hidden">
              <pre className="m-0 p-0">{renderLines(formattedCode)}</pre>
            </div>
            <textarea
              readOnly
              value={formattedCode}
              placeholder="Formatted output will appear here after clicking Format Code..."
              spellCheck={false}
              className="flex-1 p-3 bg-transparent text-slate-100 font-mono text-[12px] leading-relaxed resize-none focus:outline-none selection:bg-blue-600/30 overflow-auto whitespace-pre"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
