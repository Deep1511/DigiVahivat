/**
 * src/pages/admin/MaintenanceTracker.jsx
 * Society Annual Maintenance & Dues Tracker Console
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Wrench,
  Search,
  CheckCircle,
  Clock,
  Filter,
  DollarSign,
  CreditCard,
  Building2,
  Trash2,
  Loader2,
  FileSpreadsheet,
} from 'lucide-react';
import { residentsAPI, contributionsAPI } from '../../services/api';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { PdfReceiptModal } from '../../components/PdfReceiptModal';
import { fmtCurrency, fmtDate } from '../../constants';
import { useToast } from '../../context/ToastContext';

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2];

export const MaintenanceTracker = () => {
  const { showSuccess, showError } = useToast();

  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [residents, setResidents] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Paid' | 'Pending'
  const [search, setSearch] = useState('');

  // Quick Collect Modal
  const [collectModalOpen, setCollectModalOpen] = useState(false);
  const [targetResident, setTargetResident] = useState(null);
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // PDF Receipt Modal
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [resRes, cRes] = await Promise.all([
        residentsAPI.getAll(),
        contributionsAPI.getAll({
          contributionType: 'Annual',
          annualYear: selectedYear,
        }),
      ]);
      setResidents(resRes.data?.data?.residents || []);
      setContributions(cRes.data?.data || []);
    } catch (err) {
      showError(err.message || 'Failed to fetch maintenance records.');
    } finally {
      setLoading(false);
    }
  }, [selectedYear, showError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Map contributions by residentId
  const contributionMap = useMemo(() => {
    const map = {};
    contributions.forEach((c) => {
      const rId = c.residentId?._id || c.residentId;
      if (rId) {
        map[rId] = c;
      }
    });
    return map;
  }, [contributions]);

  // Calculate metrics
  const totalCollected = contributions.reduce((sum, c) => sum + (c.amount || 0), 0);
  const paidCount = Object.keys(contributionMap).length;
  const pendingCount = Math.max(residents.length - paidCount, 0);

  // Open Collect Modal for a specific resident
  const handleOpenCollect = (resObj) => {
    setTargetResident(resObj);
    setAmount('12000'); // default yearly or blank
    setPaymentMode('Cash');
    setTransactionId('');
    setNotes('');
    setCollectModalOpen(true);
  };

  const handleCollectSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      showError('Please enter a valid amount.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await contributionsAPI.record({
        contributionType: 'Annual',
        annualYear: Number(selectedYear),
        residentId: targetResident._id,
        amount: Number(amount),
        paymentMode,
        paymentStatus: 'Paid',
        transactionId: paymentMode === 'UPI' ? transactionId.trim() || undefined : undefined,
        notes: notes.trim() || undefined,
      });

      confetti({ particleCount: 50, spread: 60 });
      showSuccess(`Maintenance collected for Flat ${targetResident.houseOrFlatNo}!`);
      setCollectModalOpen(false);

      const newRec = res.data?.data || res.data;
      setSelectedReceipt({
        ...newRec,
        residentId: targetResident,
      });
      setReceiptModalOpen(true);

      fetchData();
    } catch (err) {
      showError(err.message || 'Failed to record maintenance payment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePayment = async (cId, flatNo) => {
    if (!window.confirm(`Delete maintenance payment record for Flat ${flatNo}?`)) {
      return;
    }
    try {
      await contributionsAPI.remove(cId);
      showSuccess('Payment record deleted.');
      fetchData();
    } catch (err) {
      showError(err.message || 'Could not delete record.');
    }
  };

  // Filter flats
  const flatRows = useMemo(() => {
    return residents
      .map((r) => {
        const payment = contributionMap[r._id];
        const isPaid = Boolean(payment && payment.paymentStatus === 'Paid');
        return {
          resident: r,
          payment,
          isPaid,
        };
      })
      .filter((item) => {
        if (activeTab === 'Paid' && !item.isPaid) return false;
        if (activeTab === 'Pending' && item.isPaid) return false;
        if (search) {
          const q = search.toLowerCase();
          const r = item.resident;
          return (
            r.name?.toLowerCase().includes(q) ||
            r.houseOrFlatNo?.toLowerCase().includes(q) ||
            r.phone?.includes(q)
          );
        }
        return true;
      });
  }, [residents, contributionMap, activeTab, search]);

  return (
    <div className="space-y-6">
      {/* Title & Year Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Society Maintenance Fund
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Yearly society maintenance collection and pending dues tracker
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Fiscal Year:
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {YEAR_OPTIONS.map((yr) => (
              <option key={yr} value={yr}>
                Year {yr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Maintenance Collected"
          value={fmtCurrency(totalCollected)}
          subtitle={`Year ${selectedYear} Total`}
          icon={Wrench}
          variant="blue"
        />
        <StatCard
          title="Paid Flats"
          value={`${paidCount} / ${residents.length}`}
          subtitle={`${Math.round((paidCount / (residents.length || 1)) * 100)}% compliance`}
          icon={CheckCircle}
          variant="emerald"
        />
        <StatCard
          title="Pending Flats"
          value={pendingCount}
          subtitle="Dues yet to be received"
          icon={Clock}
          variant={pendingCount > 0 ? 'rose' : 'emerald'}
        />
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/80 shadow-2xs">
          {['All', 'Paid', 'Pending'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-[#00AFEF] to-[#3E4095] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab} Flats
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search flat number, member, phone..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Flats Maintenance Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-[#00AFEF] animate-spin mx-auto" />
          </div>
        ) : flatRows.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs">
            No flats match your filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Flat Number</th>
                  <th className="px-5 py-3.5">Resident Name</th>
                  <th className="px-5 py-3.5">Phone Number</th>
                  <th className="px-5 py-3.5">Amount Paid</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {flatRows.map(({ resident: r, payment, isPaid }) => (
                  <tr key={r._id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3.5 font-extrabold text-[#3E4095] text-sm">
                      {r.houseOrFlatNo ? `Flat ${r.houseOrFlatNo}` : '-'}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      {r.name}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 font-mono">
                      +91 {r.phone}
                    </td>
                    <td className="px-5 py-3.5 font-extrabold text-slate-900">
                      {isPaid ? fmtCurrency(payment?.amount) : '₹0'}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        status={isPaid ? 'Paid' : 'Pending'}
                        label={isPaid ? 'Paid' : 'Dues Pending'}
                      />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {isPaid ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedReceipt({ ...payment, residentId: r });
                              setReceiptModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#00AFEF] font-bold text-[11px] transition cursor-pointer"
                          >
                            Receipt
                          </button>
                          <button
                            onClick={() => handleDeletePayment(payment._id, r.houseOrFlatNo)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Payment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenCollect(r)}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs transition cursor-pointer"
                        >
                          + Collect
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Collect Maintenance Modal */}
      <Modal
        isOpen={collectModalOpen}
        onClose={() => setCollectModalOpen(false)}
        title={`Collect Maintenance ${targetResident?.houseOrFlatNo ? `for Flat ${targetResident.houseOrFlatNo}` : `for ${targetResident?.name || 'Member'}`}`}
        subtitle={`Resident: ${targetResident?.name || ''} • Year: ${selectedYear}`}
      >
        <form onSubmit={handleCollectSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Maintenance Amount (₹) *
            </label>
            <input
              type="number"
              min={1}
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 12000"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Payment Mode
            </label>
            <div className="flex gap-2">
              {['Cash', 'UPI'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMode(m)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                    paymentMode === m
                      ? 'border-sky-500 bg-sky-50 text-[#00AFEF]'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {paymentMode === 'UPI' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                UPI Reference / Transaction ID
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g. UPI-REF-91829"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Paid for entire year 2026"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCollectModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-75 flex items-center gap-1.5 cursor-pointer"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Confirm Collection & Print Receipt
            </button>
          </div>
        </form>
      </Modal>

      {/* PDF Receipt Viewer */}
      <PdfReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        contribution={selectedReceipt}
      />
    </div>
  );
};
