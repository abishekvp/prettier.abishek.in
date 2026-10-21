'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { SupportedLanguage, ViewMode, PrettierOptions, DiffRow } from '@/types';
import {
  formatGenericCode,
  minifyCode,
  computeDiff,
  SAMPLES
} from '@/lib/prettier';
import { Header } from '@/components/Header';
import { OptionsDrawer } from '@/components/OptionsDrawer';
import { EditorView } from '@/components/EditorView';
import { DiffView } from '@/components/DiffView';
import { StatusBar } from '@/components/StatusBar';

const EXTENSIONS: Record<SupportedLanguage, string> = {
  javascript: 'js',
  typescript: 'ts',
  html: 'html',
  css: 'css',
  scss: 'scss',
  json: 'json',
  markdown: 'md',
  yaml: 'yaml',
  sql: 'sql',
  python: 'py',
  graphql: 'graphql',
  xml: 'xml'
};

export default function PrettierPage() {
  const [language, setLanguage] = useState<SupportedLanguage>('javascript');
  const [rawCode, setRawCode] = useState<string>(SAMPLES.javascript);
  const [formattedCode, setFormattedCode] = useState<string>('');
  const [diffRows, setDiffRows] = useState<DiffRow[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('editor');
  const [isOptionsOpen, setIsOptionsOpen] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [executionMs, setExecutionMs] = useState<number>(0);

  const [options, setOptions] = useState<PrettierOptions>({
    tabWidth: 2,
    useTabs: false,
    semi: true,
    singleQuote: true,
    trailingComma: 'es5',
    printWidth: 80,
    bracketSpacing: true,
    arrowParens: 'always'
  });

  const handleFormat = useCallback(() => {
    setError('');
    if (!rawCode.trim()) {
      setFormattedCode('');
      setDiffRows([]);
      setExecutionMs(0);
      return;
    }

    const start = performance.now();
    try {
      const result = formatGenericCode(rawCode, language, options);
      setFormattedCode(result);
      const elapsed = Math.round(performance.now() - start);
      setExecutionMs(elapsed);
      const diffs = computeDiff(rawCode, result);
      setDiffRows(diffs);
    } catch (err: any) {
      setError(err?.message || 'Formatting failed');
    }
  }, [rawCode, language, options]);

  const handleMinify = () => {
    setError('');
    if (!rawCode.trim()) return;
    const start = performance.now();
    try {
      const result = minifyCode(rawCode, language);
      setFormattedCode(result);
      const elapsed = Math.round(performance.now() - start);
      setExecutionMs(elapsed);
      const diffs = computeDiff(rawCode, result);
      setDiffRows(diffs);
    } catch (err: any) {
      setError(err?.message || 'Minification failed');
    }
  };

  // Language change loads sample
  useEffect(() => {
    if (SAMPLES[language]) {
      setRawCode(SAMPLES[language]);
      setError('');
    }
  }, [language]);

  // Initial format on mount
  useEffect(() => {
    handleFormat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard shortcut Ctrl+Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleFormat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFormat]);

  const handleDownload = () => {
    if (!formattedCode) return;
    const ext = EXTENSIONS[language] || 'txt';
    const blob = new Blob([formattedCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `formatted-code.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="flex flex-col h-screen w-screen overflow-hidden bg-surface-darker text-slate-100">
      <Header
        language={language}
        setLanguage={setLanguage}
        viewMode={viewMode}
        setViewMode={setViewMode}
        isOptionsOpen={isOptionsOpen}
        setIsOptionsOpen={setIsOptionsOpen}
        onFormat={handleFormat}
        onMinify={handleMinify}
      />

      <OptionsDrawer
        isOpen={isOptionsOpen}
        options={options}
        setOptions={setOptions}
      />

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {viewMode === 'editor' ? (
          <EditorView
            rawCode={rawCode}
            setRawCode={setRawCode}
            formattedCode={formattedCode}
            error={error}
            onLoadSample={() => setRawCode(SAMPLES[language])}
            onClear={() => {
              setRawCode('');
              setFormattedCode('');
              setDiffRows([]);
              setError('');
            }}
            onDownload={handleDownload}
          />
        ) : (
          <DiffView diffRows={diffRows} />
        )}
      </div>

      <StatusBar
        language={language}
        executionMs={executionMs}
        options={options}
      />
    </main>
  );
}
