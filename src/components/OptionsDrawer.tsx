'use client';

import React from 'react';
import { PrettierOptions } from '@/types';

interface OptionsDrawerProps {
  isOpen: boolean;
  options: PrettierOptions;
  setOptions: React.Dispatch<React.SetStateAction<PrettierOptions>>;
}

export const OptionsDrawer: React.FC<OptionsDrawerProps> = ({
  isOpen,
  options,
  setOptions
}) => {
  if (!isOpen) return null;

  const update = (key: keyof PrettierOptions, val: any) => {
    setOptions((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <div className="bg-surface-card border-b border-surface-border px-4 py-2.5 flex flex-wrap items-center gap-4 text-xs z-30 flex-shrink-0 animate-in slide-in-from-top-2 duration-150">
      <div className="flex items-center gap-1.5">
        <span className="text-slate-400 font-medium">Tab Width:</span>
        <select
          value={options.tabWidth}
          onChange={(e) => update('tabWidth', parseInt(e.target.value, 10))}
          className="bg-surface-subtle border border-surface-border rounded px-2 py-0.5 text-slate-200"
        >
          <option value="2">2 spaces</option>
          <option value="4">4 spaces</option>
          <option value="8">8 spaces</option>
        </select>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-slate-400 font-medium">Indentation:</span>
        <select
          value={String(options.useTabs)}
          onChange={(e) => update('useTabs', e.target.value === 'true')}
          className="bg-surface-subtle border border-surface-border rounded px-2 py-0.5 text-slate-200"
        >
          <option value="false">Spaces</option>
          <option value="true">Tabs</option>
        </select>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-slate-400 font-medium">Semicolons:</span>
        <select
          value={String(options.semi)}
          onChange={(e) => update('semi', e.target.value === 'true')}
          className="bg-surface-subtle border border-surface-border rounded px-2 py-0.5 text-slate-200"
        >
          <option value="true">true (add ;)</option>
          <option value="false">false (omit ;)</option>
        </select>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-slate-400 font-medium">Quotes:</span>
        <select
          value={String(options.singleQuote)}
          onChange={(e) => update('singleQuote', e.target.value === 'true')}
          className="bg-surface-subtle border border-surface-border rounded px-2 py-0.5 text-slate-200"
        >
          <option value="true">Single (&apos;...&apos;)</option>
          <option value="false">Double (&quot;...&quot;)</option>
        </select>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-slate-400 font-medium">Trailing Commas:</span>
        <select
          value={options.trailingComma}
          onChange={(e) => update('trailingComma', e.target.value as any)}
          className="bg-surface-subtle border border-surface-border rounded px-2 py-0.5 text-slate-200"
        >
          <option value="es5">es5</option>
          <option value="all">all</option>
          <option value="none">none</option>
        </select>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-slate-400 font-medium">Print Width:</span>
        <select
          value={options.printWidth}
          onChange={(e) => update('printWidth', parseInt(e.target.value, 10))}
          className="bg-surface-subtle border border-surface-border rounded px-2 py-0.5 text-slate-200"
        >
          <option value="80">80 chars</option>
          <option value="100">100 chars</option>
          <option value="120">120 chars</option>
        </select>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-slate-400 font-medium">Bracket Spacing:</span>
        <select
          value={String(options.bracketSpacing)}
          onChange={(e) => update('bracketSpacing', e.target.value === 'true')}
          className="bg-surface-subtle border border-surface-border rounded px-2 py-0.5 text-slate-200"
        >
          <option value="true">&#123; foo: bar &#125;</option>
          <option value="false">&#123;foo: bar&#125;</option>
        </select>
      </div>
    </div>
  );
};
