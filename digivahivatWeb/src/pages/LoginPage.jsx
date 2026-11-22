/**
 * src/pages/LoginPage.jsx
 * Unified Role-Based Login Screen with Quick-Fill Presets & Seed Admin Fallback
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Building2,
  Lock,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, user: currentUser, role } = useAuth();
  const { showSuccess, showError } = useToast();

  const [phone, setPhone] = useState(searchParams.get('phone') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // If user is already logged in, redirect them to their home portal
  useEffect(() => {
    if (currentUser && role) {
      if (role === 'SuperAdmin') navigate('/superadmin', { replace: true });
      else if (role === 'Guard' || role === 'Gaurd') navigate('/guard', { replace: true });
      else if (role === 'Admin') navigate('/admin', { replace: true });
      else navigate('/resident', { replace: true });
    }
  }, [currentUser, role, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || !password) {
      showError('Please enter both mobile number and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.login({
        phone: phone.trim(),
        password: password.trim(),
      });

      const raw = res.data?.data || res.data;
      const token = raw.token || res.data?.token;

      // Ensure user object is properly structured regardless of flat or nested response shape
      const userData = raw.user || {
        _id: raw._id,
        name: raw.name || 'User',
        phone: raw.phone || phone.trim(),
        houseOrFlatNo: raw.houseOrFlatNo || null,
        totalMembers: raw.totalMembers || 1,
        role: raw.role || 'Resident',
        societyId: raw.societyId || null,
      };

      if (!token) {
        throw new Error('Authentication token missing from server response.');
      }

      // Persist auth state
      login(userData, token);
      showSuccess(`Welcome back, ${userData.name}!`);

      // Role-based routing
      const targetRole = userData.role;
      if (targetRole === 'SuperAdmin') {
        navigate('/superadmin', { replace: true });
      } else if (targetRole === 'Guard' || targetRole === 'Gaurd') {
        navigate('/guard', { replace: true });
      } else if (targetRole === 'Admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/resident', { replace: true });
      }
    } catch (err) {
      showError(err.message || 'Invalid credentials. Please verify phone & password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-sky-500 selection:text-white">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(#00afef12_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-6 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#00AFEF] to-[#3E4095] flex items-center justify-center text-white shadow-lg transition group-hover:scale-105">
            <Building2 className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900">
            Digi<span className="text-[#00AFEF]">Vahivat</span>
          </span>
        </Link>

        <h2 className="text-center text-2xl font-black tracking-tight text-slate-900">
          Sign In to Portal
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Enter your registered 10-digit mobile number and password
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-5 sm:px-8 rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit mobile number"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/support"
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#00AFEF] to-[#3E4095] hover:opacity-95 text-white font-extrabold text-sm shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 transition disabled:opacity-75 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* New Member Registration Callout */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              New resident or flat owner?{' '}
              <Link
                to="/register"
                className="font-bold text-[#00AFEF] hover:underline"
              >
                Register Here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
