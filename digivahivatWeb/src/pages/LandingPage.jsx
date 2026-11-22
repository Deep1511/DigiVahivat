/**
 * src/pages/LandingPage.jsx
 * DigiVahivat Modern Landing Page & Product Overview
 */
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  ShieldCheck,
  Receipt,
  AlertOctagon,
  Users,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Smartphone,
  Lock,
  Sparkles,
  HeartHandshake,
  QrCode,
  FileSpreadsheet,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const handleDashboardRedirect = () => {
    if (role === 'SuperAdmin') navigate('/superadmin');
    else if (role === 'Guard') navigate('/guard');
    else if (role === 'Admin') navigate('/admin');
    else navigate('/resident');
  };

  const demoCredentials = [
    {
      role: 'SuperAdmin',
      phone: '9876543210',
      pass: 'Admin@1234',
      badge: 'Platform Owner',
      desc: 'Create societies, provision society admins, global control',
      color: 'from-purple-500 to-indigo-600',
    },
    {
      role: 'Society Admin',
      phone: '9876543210',
      pass: 'Admin@1234',
      badge: 'Committee ERP',
      desc: 'Collect Falo, log expenses, manage maintenance & gates',
      color: 'from-[#00AFEF] to-[#3E4095]',
    },
    {
      role: 'Resident',
      phone: '9876543211',
      pass: 'User@1234',
      badge: 'Flat Member',
      desc: 'Track contributions, pre-approve visitors, instant SOS',
      color: 'from-emerald-500 to-teal-700',
    },
    {
      role: 'Security Guard',
      phone: '9876543212',
      pass: 'Guard@1234',
      badge: 'Gate Console',
      desc: 'Verify 6-digit gate passes, 1-tap check-in & check-out',
      color: 'from-amber-500 to-orange-600',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-sky-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00AFEF] to-[#3E4095] flex items-center justify-center text-white shadow-md">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                Digi<span className="text-[#00AFEF]">Vahivat</span>
              </span>
              <span className="hidden sm:inline-block text-[11px] font-semibold text-slate-400 ml-2 border-l pl-2 border-slate-200">
                Society Governance ERP
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={handleDashboardRedirect}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00AFEF] to-[#3E4095] text-white font-bold text-xs shadow-md shadow-sky-500/20 hover:opacity-95 transition flex items-center gap-1.5 cursor-pointer"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-slate-700 hover:text-slate-900 font-semibold text-xs transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2.5 rounded-xl bg-[#00AFEF] hover:bg-[#0090C8] text-white font-bold text-xs shadow-sm transition"
                >
                  Join Society
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(#00afef18_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200/80 text-sky-800 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              COMPLETE DIGITAL VAHIVAT PLATFORM
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
              Smart Society Management &{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00AFEF] to-[#3E4095]">
                Financial Transparency
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
              Eliminate bookkeeping errors, manage event collections (Falo),
              track maintenance dues, automate visitor gate security, and trigger
              instant society-wide SOS emergency broadcasts.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                to="/login"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#00AFEF] to-[#3E4095] hover:opacity-95 text-white font-extrabold text-sm shadow-xl shadow-sky-500/25 flex items-center justify-center gap-2 transition"
              >
                Access Portal
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#demo-credentials"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border border-slate-200 shadow-sm flex items-center justify-center gap-2 transition"
              >
                View Demo Roles
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Built for Modern Indian Communities
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Everything your housing society, apartment complex, or village
              committee needs in one unified dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-lg hover:border-sky-300 transition duration-200 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-sky-100 text-[#00AFEF] flex items-center justify-center">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Falo & Event Contributions
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Record Navratri, Ganesh Utsav, and festival collections. Instant
                PDF receipts with authorized verification and WhatsApp sharing.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-lg hover:border-indigo-300 transition duration-200 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-[#3E4095] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Gate Pass & Visitor Security
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Residents pre-approve guests with 6-digit codes and dynamic QR
                passes. Security guards check-in and check-out in 1 tap.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-lg hover:border-red-300 transition duration-200 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Instant Emergency SOS
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Medical, Fire, Lift Stuck, or Intruder alerts broadcast to the
                entire community and gate monitor within seconds with live siren
                banners.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-lg hover:border-emerald-300 transition duration-200 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Excel Financial Audits
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generate 1-click comprehensive financial balance sheets and
                itemized expense reports ready for annual society general meetings.
              </p>
            </div>

            {/* Card 5 */}
            <div className="p-6 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-lg hover:border-amber-300 transition duration-200 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Maintenance Tracker & Dues
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Track annual and monthly maintenance dues by flat. Filter Paid
                and Pending residents and collect payments with single-tap modals.
              </p>
            </div>

            {/* Card 6 */}
            <div className="p-6 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-lg hover:border-sky-300 transition duration-200 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-sky-100 text-[#00AFEF] flex items-center justify-center">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Web + Mobile Synergy
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Seamless real-time synchronization between the React web console
                and React Native mobile application for residents and security.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Credentials Showcase */}
      <section id="demo-credentials" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#00AFEF]">
              Instant Access
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
              Test All 4 Roles Live
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Select any role below to test DigiVahivat’s specialized portals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {demoCredentials.map((demo) => (
              <div
                key={demo.role}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] font-bold text-white px-2.5 py-0.5 rounded-full bg-gradient-to-r ${demo.color}`}
                    >
                      {demo.badge}
                    </span>
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    {demo.role}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {demo.desc}
                  </p>

                  <div className="mt-4 p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1 font-mono text-[11px] text-slate-700">
                    <div>
                      <span className="text-slate-400 select-none">Phone: </span>
                      <strong className="select-all">{demo.phone}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 select-none">Pass: </span>
                      <strong className="select-all">{demo.pass}</strong>
                    </div>
                  </div>
                </div>

                <Link
                  to={`/login?phone=${demo.phone}&role=${demo.role}`}
                  className="mt-4 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  Sign In as {demo.role}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#00AFEF]" />
            <span className="font-bold text-slate-800">DigiVahivat</span>
            <span>— Smart Society & Village Governance</span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-slate-900">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-slate-900">
              Terms of Service
            </Link>
            <Link to="/support" className="hover:text-slate-900">
              Helpdesk & Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
