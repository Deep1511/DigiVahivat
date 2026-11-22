/**
 * src/pages/RegisterPage.jsx
 * Resident Registration Form for DigiVahivat Web
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  Lock,
  Phone,
  User,
  Home,
  Users,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { authAPI, societiesAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [societies, setSocieties] = useState([]);
  const [loadingSocieties, setLoadingSocieties] = useState(true);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [societyId, setSocietyId] = useState('');
  const [houseOrFlatNo, setHouseOrFlatNo] = useState('');
  const [totalMembers, setTotalMembers] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await societiesAPI.getAll();
        const list = res.data?.data || [];
        setSocieties(list);
        if (list.length > 0) {
          setSocietyId(list[0]._id);
        }
      } catch (err) {
        console.warn('Could not fetch societies for registration dropdown', err);
      } finally {
        setLoadingSocieties(false);
      }
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!phone || phone.length !== 10) {
      showError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!password || password.length < 6) {
      showError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      await authAPI.register({
        name: name.trim(),
        phone: phone.trim(),
        password: password.trim(),
        societyId: societyId || undefined,
        houseOrFlatNo: houseOrFlatNo.trim() || undefined,
        totalMembers: Number(totalMembers) || 1,
      });

      showSuccess('Registration successful! Please sign in with your credentials.');
      navigate(`/login?phone=${phone.trim()}`);
    } catch (err) {
      showError(err.message || 'Registration failed. Phone number might already be registered.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-sky-500 selection:text-white">
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
          Resident Registration
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Register your flat & family details with your society
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-5 sm:px-8 rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Society Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Select Society *
              </label>
              {loadingSocieties ? (
                <div className="h-10 rounded-xl bg-slate-100 animate-pulse" />
              ) : societies.length > 0 ? (
                <select
                  required
                  value={societyId}
                  onChange={(e) => setSocietyId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white transition"
                >
                  {societies.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.city || 'Gujarat'})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="Enter Society Name or ID"
                  value={societyId}
                  onChange={(e) => setSocietyId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                />
              )}
            </div>

            {/* Resident Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mukesh Patel"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mobile Number *
              </label>
              <div className="relative">
                <Phone className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
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

            {/* Flat Number & Members Count */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Flat / House No (Optional)
                </label>
                <div className="relative">
                  <Home className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={houseOrFlatNo}
                    onChange={(e) => setHouseOrFlatNo(e.target.value)}
                    placeholder="e.g. A-402"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Family Members *
                </label>
                <div className="relative">
                  <Users className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="number"
                    min={1}
                    max={30}
                    required
                    value={totalMembers}
                    onChange={(e) => setTotalMembers(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password * (min 6 chars)
              </label>
              <div className="relative">
                <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
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
              disabled={submitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#00AFEF] to-[#3E4095] hover:opacity-95 text-white font-extrabold text-sm shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 transition disabled:opacity-75 cursor-pointer"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Register as Resident
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              Already registered?{' '}
              <Link to="/login" className="font-bold text-[#00AFEF] hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
