/**
 * src/pages/admin/GateConsole.jsx
 * Gate Visitor Management Console (VMS) for Admins & Security Staff
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  LogOut,
  LogIn,
  KeyRound,
  User,
  Users,
  Car,
  Clock,
  Plus,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { visitorsAPI } from '../../services/api';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import { StatCard } from '../../components/StatCard';
import { PreApproveVisitorModal } from '../../components/PreApproveVisitorModal';
import { fmtDateTime, fmtDate } from '../../constants';
import { useToast } from '../../context/ToastContext';

export const GateConsole = () => {
  const { showSuccess, showError } = useToast();

  const [visitors, setVisitors] = useState([]);
  const [insideCount, setInsideCount] = useState(0);
  const [preApprovedCount, setPreApprovedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Inside'); // 'Inside' | 'PreApproved' | 'Exited' | 'all'
  const [search, setSearch] = useState('');

  // Pre-approve modal
  const [preApproveOpen, setPreApproveOpen] = useState(false);

  // Verify & Check-In Modal
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifiedPass, setVerifiedPass] = useState(null);
  const [checkinMembers, setCheckinMembers] = useState(1);
  const [checkinVehicle, setCheckinVehicle] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);

  const fetchRegister = useCallback(async () => {
    try {
      const res = await visitorsAPI.getSocietyRegister({
        status: activeTab === 'all' ? undefined : activeTab,
        search: search.trim() || undefined,
      });
      setVisitors(res.data?.data || []);
      setInsideCount(res.data?.insideCount || 0);
      setPreApprovedCount(res.data?.preApprovedCount || 0);
    } catch (err) {
      showError(err.message || 'Could not load visitor register.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, search, showError]);

  useEffect(() => {
    fetchRegister();
    // Poll every 10 seconds for real-time gate entry updates
    const timer = setInterval(fetchRegister, 10000);
    return () => clearInterval(timer);
  }, [fetchRegister]);

  const handleVerifyPass = async (e) => {
    e.preventDefault();
    if (!passcodeInput || passcodeInput.trim().length < 6) {
      showError('Please enter a 6-digit gate passcode.');
      return;
    }

    setVerifying(true);
    setVerifiedPass(null);
    try {
      const res = await visitorsAPI.verify({ passCode: passcodeInput.trim() });
      const passData = res.data?.data || res.data;
      setVerifiedPass(passData);
      setCheckinMembers(passData.membersCount || 1);
      setCheckinVehicle(passData.vehicleNumber || '');
      showSuccess(`Pass valid! Expected visitor: ${passData.visitorName}`);
    } catch (err) {
      showError(err.message || 'Passcode invalid, expired, or already used.');
    } finally {
      setVerifying(false);
    }
  };

  const handleConfirmCheckin = async () => {
    if (!verifiedPass) return;
    setCheckingIn(true);
    try {
      await visitorsAPI.checkin({
        passCode: verifiedPass.passCode,
        membersCount: Number(checkinMembers) || 1,
        vehicleNumber: checkinVehicle.trim() || undefined,
      });
      showSuccess(`Visitor ${verifiedPass.visitorName} checked in successfully!`);
      setVerifyModalOpen(false);
      setPasscodeInput('');
      setVerifiedPass(null);
      fetchRegister();
    } catch (err) {
      showError(err.message || 'Failed to complete check-in.');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckout = async (id, visitorName) => {
    try {
      await visitorsAPI.checkout(id);
      showSuccess(`Visitor ${visitorName} checked out.`);
      fetchRegister();
    } catch (err) {
      showError(err.message || 'Failed to checkout visitor.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Gate Security & Visitor VMS
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pre-approved visitor passes, gate passcode verification, and entry/exit logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setPasscodeInput('');
              setVerifiedPass(null);
              setVerifyModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:opacity-95 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            Verify & Check-In
          </button>
          <button
            onClick={() => setPreApproveOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-2xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#00AFEF]" />
            New Pre-Approval
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Currently Inside"
          value={insideCount}
          subtitle="Visitors currently within society"
          icon={LogIn}
          variant="emerald"
        />
        <StatCard
          title="Expected Pre-Approved"
          value={preApprovedCount}
          subtitle="Awaiting gate arrival"
          icon={Clock}
          variant="indigo"
        />
        <StatCard
          title="Total Register Records"
          value={visitors.length}
          subtitle="Total visitor logs in filter"
          icon={ShieldCheck}
          variant="blue"
        />
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/80 shadow-2xs">
          {[
            { key: 'Inside', label: `Inside Now (${insideCount})` },
            { key: 'PreApproved', label: `Expected (${preApprovedCount})` },
            { key: 'Exited', label: 'Exited History' },
            { key: 'all', label: 'All Logs' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${activeTab === tab.key
                ? 'bg-gradient-to-r from-[#00AFEF] to-[#3E4095] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search visitor, phone, vehicle, flat..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Visitors Register Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-[#00AFEF] animate-spin mx-auto" />
          </div>
        ) : visitors.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs">
            No visitors found in this register view.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Visitor</th>
                  <th className="px-5 py-3.5">Destination Flat</th>
                  <th className="px-5 py-3.5">Host Resident</th>
                  <th className="px-5 py-3.5">Passcode</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Entry Time</th>
                  <th className="px-5 py-3.5 text-right">Gate Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visitors.map((v) => {
                  const resident = v.residentId || {};
                  return (
                    <tr key={v._id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-slate-900 block text-sm">
                          {v.visitorName}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span>{v.purpose || 'Visit'}</span>
                          <span>•</span>
                          <span>{v.membersCount || 1} guest(s)</span>
                          {v.vehicleNumber && (
                            <span className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded font-bold">
                              {v.vehicleNumber}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-extrabold text-[#00AFEF] text-sm">
                        {resident.houseOrFlatNo ? `Flat ${resident.houseOrFlatNo}` : '-'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-700 font-medium">
                        {resident.name || '-'}
                      </td>
                      <td className="px-5 py-3.5 font-mono font-bold text-slate-900 tracking-wider">
                        {v.passCode}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge status={v.status} />
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {v.checkInTime ? fmtDateTime(v.checkInTime) : fmtDate(v.expectedDate)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {v.status === 'Inside' ? (
                          <button
                            onClick={() => handleCheckout(v._id, v.visitorName)}
                            className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1 transition cursor-pointer ml-auto"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            Check-Out
                          </button>
                        ) : v.status === 'PreApproved' ? (
                          <button
                            onClick={() => {
                              setPasscodeInput(v.passCode);
                              setVerifiedPass(v);
                              setCheckinMembers(v.membersCount || 1);
                              setCheckinVehicle(v.vehicleNumber || '');
                              setVerifyModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center gap-1 transition cursor-pointer ml-auto"
                          >
                            <LogIn className="w-3.5 h-3.5" />
                            Gate Entry
                          </button>
                        ) : (
                          <a
                            href={`/pass/${v._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-slate-600 p-1"
                            title="View Pass"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Verify & Check-In Modal */}
      <Modal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        title="Verify Passcode & Gate Entry"
        subtitle="Security Guard Console: verify visitor and log check-in"
      >
        <div className="space-y-4">
          <form onSubmit={handleVerifyPass} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Enter 6-Digit Gate Passcode *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 482910"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-lg font-mono font-black text-center tracking-[0.25em] focus:ring-2 focus:ring-sky-500 focus:outline-none transition uppercase"
                />
                <button
                  type="submit"
                  disabled={verifying}
                  className="px-5 py-2.5 rounded-xl bg-[#00AFEF] hover:bg-[#0090C8] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition disabled:opacity-75 cursor-pointer"
                >
                  {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                </button>
              </div>
            </div>
          </form>

          {/* Verified Pass Preview */}
          {verifiedPass && (
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wide">
                  Passcode Verified ✓
                </span>
                <Badge status={verifiedPass.status} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block">Visitor:</span>
                  <strong className="text-slate-900 font-bold block text-sm">
                    {verifiedPass.visitorName}
                  </strong>
                  <span className="text-slate-500">
                    Purpose: {verifiedPass.purpose || 'Visit'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Destination:</span>
                  <strong className="text-[#00AFEF] font-extrabold text-sm block">
                    {verifiedPass.residentId?.houseOrFlatNo ? `Flat ${verifiedPass.residentId.houseOrFlatNo}` : 'Community Area'}
                  </strong>
                  <span className="text-slate-500">
                    Host: {verifiedPass.residentId?.name || 'Resident'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-200/60">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                    Member Count
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={checkinMembers}
                    onChange={(e) => setCheckinMembers(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                    Vehicle Number
                  </label>
                  <input
                    type="text"
                    value={checkinVehicle}
                    onChange={(e) => setCheckinVehicle(e.target.value.toUpperCase())}
                    placeholder="GJ-01-AB-1234"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-mono uppercase focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleConfirmCheckin}
                disabled={checkingIn}
                className="w-full mt-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition disabled:opacity-75 cursor-pointer"
              >
                {checkingIn ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Confirm Gate Check-In Entry
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* Pre-Approve Modal */}
      <PreApproveVisitorModal
        isOpen={preApproveOpen}
        onClose={() => setPreApproveOpen(false)}
        onSuccess={fetchRegister}
      />
    </div>
  );
};
