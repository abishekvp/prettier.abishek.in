'use client';

import React from 'react';
import { SupportedLanguage, PrettierOptions } from '@/types';

interface StatusBarProps {
  language: SupportedLanguage;
  executionMs: number;
  options: PrettierOptions;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  language,
  executionMs,
  options
}) => {
  return (
    <footer className="h-8 bg-surface-card border-t border-surface-border px-4 flex items-center justify-between text-[11px] text-slate-400 select-none flex-shrink-0">
      <div className="flex items-center gap-5">
        <div>
          Engine: <span className="font-semibold text-slate-200">Prettier Engine Core</span>
        </div>
        <div>
          Language: <span className="font-semibold text-blue-400 capitalize">{language}</span>
        </div>
        <div>
          Execution: <span className="font-semibold text-slate-200">{executionMs} ms</span>
        </div>
      </div>

      <div className="text-slate-400 hidden sm:block">
        Rules: <span className="font-mono text-slate-300">
          {options.tabWidth} spaces · {options.semi ? 'semi' : 'no-semi'} · {options.singleQuote ? 'single-quote' : 'double-quote'}
        </span>
      </div>
    </footer>
  );
};
