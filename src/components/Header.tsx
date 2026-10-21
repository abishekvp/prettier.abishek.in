'use client';

import React, { useState } from 'react';
import { SupportedLanguage, ViewMode } from '@/types';
import {
  Sparkles,
  ChevronDown,
  Columns,
  GitCompare,
  SlidersHorizontal,
  Maximize,
  Minimize,
  ExternalLink,
  Play,
  FileCode
} from 'lucide-react';

interface HeaderProps {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isOptionsOpen: boolean;
  setIsOptionsOpen: (open: boolean) => void;
  onFormat: () => void;
  onMinify: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  setLanguage,
  viewMode,
  setViewMode,
  isOptionsOpen,
  setIsOptionsOpen,
  onFormat,
  onMinify
}) => {
  const [suiteOpen, setSuiteOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <header className="h-14 bg-surface-card border-b border-surface-border px-4 flex items-center justify-between gap-4 select-none flex-shrink-0 z-40">
      {/* Brand & Suite Switcher */}
      <div className="flex items-center gap-3">
        <a href="https://apps.abishek.in" className="flex items-center gap-2 group text-white">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-tight text-white">
              Prettier<span className="text-blue-400">Studio</span>
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              CLEAN
            </span>
          </div>
        </a>

        {/* Suite Switcher */}
        <div className="relative">
          <button
            onClick={() => setSuiteOpen(!suiteOpen)}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-surface-subtle hover:bg-surface-hover border border-surface-border px-2.5 py-1.5 rounded-md transition-colors"
          >
            <span>All Tools</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {suiteOpen && (
            <div
              className="absolute top-full left-0 mt-1.5 w-60 bg-surface-card border border-surface-border rounded-xl shadow-2xl p-1.5 z-50 flex flex-col gap-0.5"
              onMouseLeave={() => setSuiteOpen(false)}
            >
              <a href="https://apps.abishek.in" className="flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-blue-400 hover:bg-blue-500/10 rounded-lg">
                Tools & Apps Hub (apps.abishek.in)
              </a>
              <div className="h-px bg-surface-border my-1" />
              <a href="https://prettier.abishek.in" className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-white bg-blue-600/20 rounded-lg">
                Prettier Code Formatter
              </a>
              <a href="https://base64.abishek.in" className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-surface-hover rounded-lg">
                Base64 Studio
              </a>
              <a href="https://compiler.abishek.in" className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-surface-hover rounded-lg">
                Web Compiler (HTML/CSS/JS)
              </a>
              <a href="https://json.abishek.in" className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-surface-hover rounded-lg">
                JSON Master Suite
              </a>
              <a href="https://md.abishek.in" className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-surface-hover rounded-lg">
                Markdown Studio Pro
              </a>
              <a href="https://image.abishek.in" className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-surface-hover rounded-lg">
                Image Compressor Pro
              </a>
              <a href="https://pdf.abishek.in" className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-surface-hover rounded-lg">
                PDF Toolkit
              </a>
              <a href="https://youtube.abishek.in" className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-surface-hover rounded-lg">
                YouTube Downloader
              </a>
            </div>
          )}
        </div>

        {/* Language Picker */}
        <div className="flex items-center gap-1.5 ml-2">
          <FileCode className="w-3.5 h-3.5 text-blue-400" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
            className="bg-surface-subtle border border-surface-border rounded-md px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="javascript">JavaScript (ES6+)</option>
            <option value="typescript">TypeScript</option>
            <option value="html">HTML / XHTML</option>
            <option value="css">CSS</option>
            <option value="scss">SCSS / SASS</option>
            <option value="json">JSON</option>
            <option value="markdown">Markdown</option>
            <option value="yaml">YAML</option>
            <option value="sql">SQL</option>
            <option value="python">Python</option>
            <option value="graphql">GraphQL</option>
            <option value="xml">XML</option>
          </select>
        </div>
      </div>

      {/* Center Actions: Format, Minify, View Mode, Options */}
      <div className="flex items-center gap-2">
        <button
          onClick={onFormat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all"
          title="Format Code (Ctrl+Enter)"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Format Code</span>
          <span className="text-[10px] opacity-75 font-mono hidden lg:inline">Ctrl+↵</span>
        </button>

        <button
          onClick={onMinify}
          className="px-2.5 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-hover border border-surface-border text-slate-300 hover:text-white text-xs font-medium transition-colors"
          title="Minify / Compact Code"
        >
          Minify
        </button>

        <div className="inline-flex rounded-lg bg-surface-subtle p-0.5 border border-surface-border">
          <button
            onClick={() => setViewMode('editor')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              viewMode === 'editor' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Editor</span>
          </button>
          <button
            onClick={() => setViewMode('diff')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              viewMode === 'diff' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Diff</span>
          </button>
        </div>

        <button
          onClick={() => setIsOptionsOpen(!isOptionsOpen)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
            isOptionsOpen ? 'bg-blue-600/20 text-blue-400 border-blue-500/30' : 'bg-surface-subtle text-slate-300 border-surface-border hover:text-white'
          }`}
          title="Formatting Rules & Settings"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Options</span>
        </button>
      </div>

      {/* Right Actions: Fullscreen & Hub */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleFullscreen}
          className="w-8 h-8 rounded-lg bg-surface-subtle hover:bg-surface-hover border border-surface-border flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>

        <a
          href="https://apps.abishek.in"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold hover:opacity-90 shadow-sm"
        >
          <span>All Apps</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </header>
  );
};
