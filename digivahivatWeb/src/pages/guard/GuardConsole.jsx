/**
 * src/pages/guard/GuardConsole.jsx
 * Touch-Friendly Security Guard Gate Terminal
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  KeyRound,
  LogIn,
  LogOut,
  Car,
  Users,
  Search,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Loader2,
  PhoneCall,
  Delete,
} from 'lucide-react';
import { visitorsAPI, sosAPI } from '../../services/api';
import { Badge } from '../../components/Badge';
import { fmtDateTime } from '../../constants';
import { useToast } from '../../context/ToastContext';

export const GuardConsole = () => {
  const { showSuccess, showError } = useToast();

  const [passcode, setPasscode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifiedPass, setVerifiedPass] = useState(null);
  const [membersCount, setMembersCount] = useState(1);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);

  // Visitors currently inside
  const [insideVisitors, setInsideVisitors] = useState([]);
  const [loadingInside, setLoadingInside] = useState(true);

  // Active SOS
  const [activeSos, setActiveSos] = useState([]);

  const fetchInside = useCallback(async () => {
    try {
      const res = await visitorsAPI.getSocietyRegister({ status: 'Inside' });
      setInsideVisitors(res.data?.data || []);
    } catch {
      // ignore
    } finally {
      setLoadingInside(false);
    }
  }, []);

  const fetchSos = useCallback(async () => {
    try {
      const res = await sosAPI.getActive();
      setActiveSos(res.data?.data || []);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchInside();
    fetchSos();
    const timer = setInterval(() => {
      fetchInside();
      fetchSos();
    }, 5000);
    return () => clearInterval(timer);
  }, [fetchInside, fetchSos]);

  const handleKeyPress = (num) => {
    if (passcode.length < 6) {
      setPasscode((prev) => prev + num);
    }
  };

  const handleBackspace = () => {
    setPasscode((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPasscode('');
    setVerifiedPass(null);
  };

  const handleVerify = async (e) => {
    e?.preventDefault();
    if (passcode.length < 6) {
      showError('Please enter full 6-digit gate passcode.');
      return;
    }

    setVerifying(true);
    setVerifiedPass(null);
    try {
      const res = await visitorsAPI.verify({ passCode: passcode });
      const data = res.data?.data || res.data;
      setVerifiedPass(data);
      setMembersCount(data.membersCount || 1);
      setVehicleNumber(data.vehicleNumber || '');
      showSuccess(`Visitor verified: ${data.visitorName}`);
    } catch (err) {
      showError(err.message || 'Passcode invalid or already used.');
    } finally {
      setVerifying(false);
    }
  };

  const handleCheckIn = async () => {
    if (!verifiedPass) return;
    setCheckingIn(true);
    try {
      await visitorsAPI.checkin({
        passCode: verifiedPass.passCode,
        membersCount: Number(membersCount) || 1,
        vehicleNumber: vehicleNumber.trim() || undefined,
      });

      showSuccess(`Visitor ${verifiedPass.visitorName} Checked-In! Gate opened.`);
      setPasscode('');
      setVerifiedPass(null);
      fetchInside();
    } catch (err) {
      showError(err.message || 'Failed to check-in visitor.');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async (id, visitorName) => {
    try {
      await visitorsAPI.checkout(id);
      showSuccess(`Checked-Out: ${visitorName}`);
      fetchInside();
    } catch (err) {
      showError(err.message || 'Failed to checkout visitor.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Security Gate Terminal (VMS)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gate Passcode Verification, Instant Check-In, and Live Exit Log
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-700">Gate Console Live</span>
        </div>
      </div>

      {/* High-Priority Active SOS Alert if any */}
      {activeSos.length > 0 && (
        <div className="bg-red-600 text-white rounded-3xl p-5 shadow-xl sos-pulse flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white text-red-600 flex items-center justify-center font-bold shrink-0">
              <AlertOctagon className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md">
                EMERGENCY ALERT IN PROGRESS
              </span>
              <h3 className="text-lg font-black mt-0.5">
                {activeSos[0].type}
                {activeSos[0].residentId?.houseOrFlatNo
                  ? ` at Flat ${activeSos[0].residentId.houseOrFlatNo}`
                  : ''}
              </h3>
              <p className="text-xs text-white/90">
                Resident: {activeSos[0].residentId?.name} ({activeSos[0].residentId?.phone})
              </p>
            </div>
          </div>

          {activeSos[0].residentId?.phone && (
            <a
              href={`tel:${activeSos[0].residentId.phone}`}
              className="px-4 py-2 rounded-xl bg-white text-red-700 font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <PhoneCall className="w-4 h-4" />
              Call Flat
            </a>
          )}
        </div>
      )}

      {/* Split layout: Passcode Keypad + Inside Visitors List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Keypad & Verification Console */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="text-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
              Enter 6-Digit Gate Code
            </span>
            <div className="text-3xl font-black text-[#3E4095] tracking-[0.3em] font-mono my-2 h-12 flex items-center justify-center bg-slate-50 rounded-2xl border border-slate-200">
              {passcode || '------'}
            </div>
          </div>

          {/* Numeric Keypad Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(String(num))}
                className="py-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-sky-50 text-slate-900 font-extrabold text-xl shadow-2xs border border-slate-200/60 transition cursor-pointer"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs uppercase transition cursor-pointer"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="py-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-sky-50 text-slate-900 font-extrabold text-xl shadow-2xs border border-slate-200/60 transition cursor-pointer"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center transition cursor-pointer"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={passcode.length < 6 || verifying}
            className="w-full py-3.5 rounded-2xl bg-[#00AFEF] hover:bg-[#0090C8] text-white font-extrabold text-sm shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
          >
            {verifying ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                Verify Passcode
              </>
            )}
          </button>

          {/* Verified Visitor Details & Check-In */}
          {verifiedPass && (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 uppercase">
                  Valid Pre-Approved Pass
                </span>
                <Badge status={verifiedPass.status} />
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Visitor:</span>
                  <strong className="text-slate-900 font-bold">{verifiedPass.visitorName}</strong>
                </div>
                {verifiedPass.residentId?.houseOrFlatNo && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Visiting Flat:</span>
                    <strong className="text-[#00AFEF] font-extrabold">
                      Flat {verifiedPass.residentId.houseOrFlatNo}
                    </strong>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Host Member:</span>
                  <span className="text-slate-800">{verifiedPass.residentId?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Purpose:</span>
                  <span className="text-slate-800">{verifiedPass.purpose || 'Visit'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-200 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                    Members Count
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={membersCount}
                    onChange={(e) => setMembersCount(e.target.value)}
                    className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                    Vehicle Number
                  </label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                    placeholder="GJ-01-AB-1234"
                    className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white uppercase font-mono"
                  />
                </div>
              </div>

              <button
                onClick={handleCheckIn}
                disabled={checkingIn}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/25 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                {checkingIn ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Allow Gate Entry Check-In
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Live "Inside Now" Visitor Table */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Currently Inside Society ({insideVisitors.length})
              </h3>
              <p className="text-xs text-slate-500">
                Active visitors and guests on society premises
              </p>
            </div>
            <button
              onClick={fetchInside}
              className="text-xs font-bold text-[#00AFEF] hover:underline cursor-pointer"
            >
              Refresh
            </button>
          </div>

          {loadingInside ? (
            <div className="py-12 text-center">
              <Loader2 className="w-6 h-6 text-[#00AFEF] animate-spin mx-auto" />
            </div>
          ) : insideVisitors.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl">
              No visitors currently inside society.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {insideVisitors.map((v) => {
                const resident = v.residentId || {};
                return (
                  <div
                    key={v._id}
                    className="py-3.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 font-bold text-sm">
                          {v.visitorName}
                        </strong>
                        {resident.houseOrFlatNo && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-[#00AFEF]">
                            Flat {resident.houseOrFlatNo}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Host: {resident.name || '-'} • Entry: {fmtDateTime(v.checkInTime)}
                        {v.vehicleNumber && ` • Car: ${v.vehicleNumber}`}
                      </p>
                    </div>

                    <button
                      onClick={() => handleCheckOut(v._id, v.visitorName)}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Check-Out
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
