/**
 * src/components/StatCard.jsx
 * Dashboard KPI / Metric Card
 */
import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'blue',
  trend,
  onClick,
}) => {
  const variants = {
    blue: {
      bg: 'bg-white',
      border: 'border-slate-200/80',
      iconBg: 'bg-sky-50 text-[#00AFEF]',
      hover: 'hover:border-sky-300',
    },
    indigo: {
      bg: 'bg-white',
      border: 'border-slate-200/80',
      iconBg: 'bg-indigo-50 text-[#3E4095]',
      hover: 'hover:border-indigo-300',
    },
    emerald: {
      bg: 'bg-white',
      border: 'border-slate-200/80',
      iconBg: 'bg-emerald-50 text-emerald-600',
      hover: 'hover:border-emerald-300',
    },
    rose: {
      bg: 'bg-white',
      border: 'border-slate-200/80',
      iconBg: 'bg-rose-50 text-rose-600',
      hover: 'hover:border-rose-300',
    },
    amber: {
      bg: 'bg-white',
      border: 'border-slate-200/80',
      iconBg: 'bg-amber-50 text-amber-600',
      hover: 'hover:border-amber-300',
    },
  };

  const style = variants[variant] || variants.blue;

  return (
    <div
      onClick={onClick}
      className={`relative p-5 rounded-2xl border ${style.border} ${style.bg} ${style.hover} shadow-sm transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${style.iconBg}`}
          >
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">
          <span
            className={
              trend.positive ? 'text-emerald-600 font-semibold' : 'text-slate-600 font-semibold'
            }
          >
            {trend.value}
          </span>
          <span>{trend.label}</span>
        </div>
      )}
    </div>
  );
};
