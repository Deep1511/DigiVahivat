/**
 * src/components/Badge.jsx
 * Unified Status Badge Component
 */
import React from 'react';

const BADGE_STYLES = {
  // Payment Statuses
  Paid: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10',
  Pending: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10',
  Partial: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/10',

  // Event Statuses
  active: 'bg-sky-50 text-sky-700 border-sky-200 ring-sky-500/10',
  upcoming: 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-500/10',
  closed: 'bg-slate-100 text-slate-600 border-slate-200 ring-slate-500/10',

  // Visitor Statuses
  PreApproved: 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-500/10',
  Inside: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10',
  Exited: 'bg-slate-100 text-slate-600 border-slate-200 ring-slate-500/10',
  Cancelled: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/10',
  Expired: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10',

  // Complaint Statuses
  InProgress: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/10',
  Resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10',
  Rejected: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/10',

  // Priorities
  Low: 'bg-slate-100 text-slate-600 border-slate-200',
  Medium: 'bg-blue-50 text-blue-700 border-blue-200',
  Normal: 'bg-slate-100 text-slate-600 border-slate-200',
  High: 'bg-amber-50 text-amber-700 border-amber-200',
  Urgent: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',

  // Roles
  SuperAdmin: 'bg-purple-50 text-purple-700 border-purple-200',
  Admin: 'bg-sky-50 text-sky-700 border-sky-200',
  Resident: 'bg-slate-100 text-slate-700 border-slate-200',
  Guard: 'bg-amber-50 text-amber-700 border-amber-200',
};

export const Badge = ({ status, label, className = '' }) => {
  const style =
    BADGE_STYLES[status] ||
    'bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/10';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ring-1 ring-inset ${style} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {label || status}
    </span>
  );
};
