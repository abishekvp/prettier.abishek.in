'use client';

import React from 'react';
import { DiffRow } from '@/types';
import { GitCompare } from 'lucide-react';

interface DiffViewProps {
  diffRows: DiffRow[];
}

export const DiffView: React.FC<DiffViewProps> = ({ diffRows }) => {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-surface-darker">
      <div className="h-9 px-4 border-b border-surface-border flex items-center justify-between text-xs bg-surface-card flex-shrink-0 select-none">
        <div className="flex items-center gap-2 font-bold text-white">
          <GitCompare className="w-4 h-4 text-blue-400" />
          <span>Line-by-Line Code Diff</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500" />
            <span>+ Formatted Line</span>
          </div>
          <div className="flex items-center gap-1.5 text-red-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500" />
            <span>- Original Line</span>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-auto font-mono text-[12px] space-y-0.5 select-text">
        {diffRows.length === 0 ? (
          <div className="text-slate-500 text-center py-16">
            Click &quot;Format Code&quot; to inspect line-by-line changes.
          </div>
        ) : (
          diffRows.map((row, idx) => (
            <div
              key={idx}
              className={`px-3 py-1 rounded flex items-start gap-3 ${
                row.type === 'added'
                  ? 'bg-emerald-500/10 text-emerald-300 font-medium'
                  : row.type === 'removed'
                  ? 'bg-red-500/10 text-red-400 font-medium line-through'
                  : 'text-slate-300'
              }`}
            >
              <span className="select-none text-slate-500 w-6 text-right flex-shrink-0">
                {row.type === 'added' ? '+' : row.type === 'removed' ? '-' : ' '}
              </span>
              <span className="flex-1 whitespace-pre-wrap break-all leading-tight">
                {row.text || '\u00A0'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
