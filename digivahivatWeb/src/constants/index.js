/**
 * src/constants/index.js
 * DigiVahivat Web - Unified Constants & Configuration
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://digivahivatbackend.onrender.com/api';

export const THEME_COLORS = {
  primary: '#00AFEF',
  primaryDark: '#0090C8',
  primaryLight: 'rgba(0, 175, 239, 0.12)',
  secondary: '#3E4095',
  secondaryDark: '#2F3073',
  secondaryLight: 'rgba(62, 64, 149, 0.12)',
  dark: '#1E1E1E',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
};

export const EXPENSE_CATEGORIES = [
  'Sound & DJ',
  'Decoration & Flowers',
  'Food & Catering',
  'Venue & Tent',
  'Pooja & Rituals',
  'Lighting & Electrician',
  'Photography & Video',
  'Prizes & Mementos',
  'Security & Sanitation',
  'Printing & Banners',
  'Plumbing & Pumps',
  'Lift Maintenance',
  'Repairs & Civil Work',
  'Miscellaneous',
];

export const PAYMENT_MODES = ['Cash', 'UPI'];
export const PAYMENT_STATUSES = ['Paid', 'Pending', 'Partial'];

export const SOS_TYPES = [
  { id: 'Medical', label: 'Medical Crisis', icon: 'HeartPulse', color: '#EF4444', bg: 'bg-red-50 text-red-600 border-red-200', desc: 'Heart attack, elderly fall, severe injury' },
  { id: 'Fire', label: 'Fire / Gas Leak', icon: 'Flame', color: '#F97316', bg: 'bg-orange-50 text-orange-600 border-orange-200', desc: 'Smoke, cylinder leak, fire outbreak' },
  { id: 'LiftStuck', label: 'Lift Stuck', icon: 'ArrowDownUp', color: '#EAB308', bg: 'bg-amber-50 text-amber-600 border-amber-200', desc: 'Trapped inside elevator / power cut' },
  { id: 'Security', label: 'Threat / Intruder', icon: 'ShieldAlert', color: '#8B5CF6', bg: 'bg-purple-50 text-purple-600 border-purple-200', desc: 'Intruder, physical threat, robbery' },
  { id: 'General', label: 'General Danger', icon: 'AlertTriangle', color: '#DC2626', bg: 'bg-red-50 text-red-700 border-red-300', desc: 'Urgent immediate help needed' },
];

export const EMERGENCY_CONTACTS = [
  { name: 'National Emergency', number: '112', badge: 'Police/Fire/Med', color: 'red' },
  { name: 'Ambulance', number: '108', badge: 'Medical Emergency', color: 'rose' },
  { name: 'Fire Brigade', number: '101', badge: 'Fire & Rescue', color: 'orange' },
  { name: 'Police Control', number: '100', badge: 'Police Helpline', color: 'blue' },
];

export const COMPLAINT_CATEGORIES = [
  'Plumbing & Water',
  'Electrical & Lights',
  'Lift & Elevator',
  'Security & Gate',
  'Housekeeping & Garbage',
  'Noise & Disturbance',
  'Parking & Vehicles',
  'Garden & Common Area',
  'Other',
];

export const COMPLAINT_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
export const COMPLAINT_STATUSES = ['Pending', 'InProgress', 'Resolved', 'Rejected'];

export const NOTICE_CATEGORIES = ['All', 'General', 'Maintenance', 'Meeting', 'Festival', 'Emergency', 'Rules'];
export const NOTICE_PRIORITIES = ['Normal', 'High', 'Urgent'];

export const VISITOR_STATUSES = ['PreApproved', 'Inside', 'Exited', 'Cancelled', 'Expired'];

/**
 * Accurately calculates whether an event is active, upcoming, or closed
 */
export function getEventStatus(ev) {
  if (!ev || !ev.isActive) return 'closed';
  const now = Date.now();

  if (ev.endDate) {
    const end = new Date(ev.endDate);
    if (end.getHours() === 0 && end.getMinutes() === 0 && end.getSeconds() === 0) {
      end.setHours(23, 59, 59, 999);
    }
    if (now > end.getTime()) {
      return 'closed';
    }
  }

  if (ev.startDate) {
    const start = new Date(ev.startDate);
    if (start.getTime() > now) {
      return 'upcoming';
    }
  }

  return 'active';
}

export function fmtCurrency(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
}

export function fmtDate(d) {
  if (!d) return '-';
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return '-';
  return dateObj.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function fmtDateTime(d) {
  if (!d) return '-';
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return '-';
  return dateObj.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
