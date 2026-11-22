/**
 * src/components/ProgressBar.jsx
 * Budget & Collection Progress Bar
 */
import React from 'react';
import { fmtCurrency } from '../constants';

export const ProgressBar = ({
  collected = 0,
  target = 0,
  showLabels = true,
  className = '',
}) => {
  const c = Number(collected || 0);
  const t = Number(target || 0);
  const percentage = t > 0 ? Math.min(Math.round((c / t) * 100), 100) : 0;

  return (
    <div className={`space-y-2 ${className}`}>
      {showLabels && (
        <div className="flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className="font-bold text-sky-600">{fmtCurrency(c)}</span>
            <span className="text-slate-400">of</span>
            <span className="font-semibold text-slate-900">{fmtCurrency(t)}</span>
          </div>
          <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md">
            {percentage}%
          </span>
        </div>
      )}
      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
        <div
          className="h-full bg-gradient-to-r from-[#00AFEF] to-[#3E4095] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
