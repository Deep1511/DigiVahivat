/**
 * src/components/Navbar.jsx
 * Top Header Navigation with Role Indicator, Society Branding & Emergency SOS Trigger
 */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  Building2,
  AlertOctagon,
  LogOut,
  User,
  ChevronDown,
  ShieldAlert,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Badge } from './Badge';

export const Navbar = ({ onToggleSidebar, onOpenSosModal }) => {
  const { user, logout, role } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    navigate('/login');
  };

  const societyName =
    user?.societyId?.name || (role === 'SuperAdmin' ? 'Platform Administration' : 'DigiVahivat Community');

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 shadow-2xs">
        {/* Left: Mobile Toggle & Society Identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00AFEF] to-[#3E4095] flex items-center justify-center text-white shadow-sm transition group-hover:scale-105">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <span className="font-extrabold text-base tracking-tight text-slate-900 block leading-tight">
                Digi<span className="text-[#00AFEF]">Vahivat</span>
              </span>
              <span className="text-[11px] text-slate-500 font-medium block truncate max-w-[220px]">
                {societyName}
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Emergency SOS Button, API Indicator & User Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Quick SOS Trigger Button */}
          <button
            onClick={onOpenSosModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm shadow-red-500/20 transition cursor-pointer"
          >
            <AlertOctagon className="w-4 h-4 animate-pulse" />
            <span className="hidden sm:inline">Emergency</span> SOS
          </button>

          {/* User profile menu */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-sky-100 text-[#00AFEF] flex items-center justify-center font-bold text-xs ring-2 ring-white">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
              </div>
              <div className="hidden lg:block text-left">
                <span className="text-xs font-bold text-slate-800 block leading-tight truncate max-w-[120px]">
                  {user?.name || 'User'}
                </span>
                <span className="text-[10px] text-slate-500 font-medium block">
                  {user?.houseOrFlatNo ? `Flat ${user.houseOrFlatNo}` : role}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {profileOpen && (
              <div
                onClick={() => setProfileOpen(false)}
                className="fixed inset-0 z-40"
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-4 top-16 w-60 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {user?.name}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {user?.phone ? `+91 ${user.phone}` : ''}
                    </p>
                    <div className="mt-2">
                      <Badge status={role} />
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/support"
                      onClick={() => setProfileOpen(false)}
                      className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition"
                    >
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                      Help & Support
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 font-semibold flex items-center gap-2.5 transition cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
