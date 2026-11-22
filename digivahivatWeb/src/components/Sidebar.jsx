/**
 * src/components/Sidebar.jsx
 * Role-Aware Navigation Sidebar
 */
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  CalendarDays,
  CreditCard,
  Wrench,
  Receipt,
  Users,
  ShieldCheck,
  MessageSquareWarning,
  Megaphone,
  Radio,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { role, isSuperAdmin, isAdmin, isGuard, isResident } = useAuth();

  const superAdminLinks = [
    { to: '/superadmin', label: 'Platform Overview', icon: LayoutDashboard },
    { to: '/superadmin/societies', label: 'Manage Societies', icon: Building2 },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/events', label: 'Events & Falo', icon: CalendarDays },
    { to: '/admin/collect', label: 'Collect Payment', icon: CreditCard },
    { to: '/admin/maintenance', label: 'Maintenance Fund', icon: Wrench },
    { to: '/admin/expenses', label: 'Expense Ledger', icon: Receipt },
    { to: '/admin/residents', label: 'Resident Directory', icon: Users },
    { to: '/admin/visitors', label: 'Gate Security & VMS', icon: ShieldCheck },
    { to: '/admin/complaints', label: 'Member Complaints', icon: MessageSquareWarning },
    { to: '/admin/notices', label: 'Notice Board', icon: Megaphone },
    { to: '/admin/sos', label: 'Emergency Console', icon: Radio },
  ];

  const residentLinks = [
    { to: '/resident', label: 'My Dashboard', icon: LayoutDashboard },
    { to: '/resident/payments', label: 'My Contributions', icon: CreditCard },
    { to: '/resident/visitors', label: 'Visitor Gate Passes', icon: ShieldCheck },
    { to: '/resident/complaints', label: 'Helpdesk & Requests', icon: MessageSquareWarning },
    { to: '/resident/notices', label: 'Notice Board', icon: Megaphone },
    { to: '/resident/expenses', label: 'Society Expenses', icon: Receipt },
  ];

  const guardLinks = [
    { to: '/guard', label: 'Gate Console & Passes', icon: ShieldCheck },
    { to: '/guard/sos', label: 'Emergency Monitor', icon: Radio },
    { to: '/guard/notices', label: 'Notice Board', icon: Megaphone },
  ];

  const links = isSuperAdmin
    ? superAdminLinks
    : isGuard
    ? guardLinks
    : isAdmin
    ? adminLinks
    : residentLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-16 left-0 h-screen lg:h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200/80 z-40 lg:z-10 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 overflow-y-auto flex-1">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00AFEF] to-[#3E4095] flex items-center justify-center text-white font-bold text-xs">
                DV
              </div>
              <span className="font-extrabold text-slate-900 text-sm">
                DigiVahivat
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          </div>

          <div className="px-2 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              {role} Navigation
            </span>
          </div>

          <nav className="space-y-1">
            {links.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/admin' || item.to === '/resident' || item.to === '/superadmin' || item.to === '/guard'}
                  onClick={() => onClose?.()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition duration-150 ${
                      isActive
                        ? 'bg-gradient-to-r from-sky-50 to-indigo-50/60 text-[#3E4095] font-bold border-l-4 border-[#00AFEF] shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0 text-slate-500" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Links */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-500 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">DigiVahivat ERP</span>
            <span className="bg-sky-100 text-[#00AFEF] px-1.5 py-0.5 rounded text-[10px] font-bold">
              v1.0 Web
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <NavLink to="/privacy" className="hover:text-slate-600">
              Privacy
            </NavLink>
            <span>•</span>
            <NavLink to="/terms" className="hover:text-slate-600">
              Terms
            </NavLink>
            <span>•</span>
            <NavLink to="/support" className="hover:text-slate-600">
              Support
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  );
};
