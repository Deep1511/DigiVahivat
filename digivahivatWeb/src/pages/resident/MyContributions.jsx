/**
 * src/pages/resident/MyContributions.jsx
 * Resident Personal Payment History & Official Receipts Portal
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  Receipt,
  Download,
  Printer,
  Calendar,
  CheckCircle,
  Loader2,
  Building2,
} from 'lucide-react';
import { contributionsAPI } from '../../services/api';
import { Badge } from '../../components/Badge';
import { StatCard } from '../../components/StatCard';
import { PdfReceiptModal } from '../../components/PdfReceiptModal';
import { fmtCurrency, fmtDate } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const MyContributions = () => {
  const { user } = useAuth();
  const { showError } = useToast();
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);

  // PDF Receipt Modal
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  const fetchMyPayments = useCallback(async () => {
    if (!user?._id) return;
    try {
      const res = await contributionsAPI.getAll({ residentId: user._id });
      // In case backend returns all, filter client-side as safeguard
      const list = (res.data?.data || []).filter((c) => {
        const rId = c.residentId?._id || c.residentId;
        return rId === user._id;
      });
      setContributions(list);
    } catch (err) {
      showError(err.message || 'Could not fetch payment records.');
    } finally {
      setLoading(false);
    }
  }, [user?._id, showError]);

  useEffect(() => {
    fetchMyPayments();
  }, [fetchMyPayments]);

  const totalPaid = contributions
    .filter((c) => c.paymentStatus === 'Paid')
    .reduce((sum, c) => sum + (c.amount || 0), 0);

  const handleOpenReceipt = (c) => {
    setSelectedReceipt({
      ...c,
      residentId: user,
    });
    setReceiptModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          My Contributions & Maintenance
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {user?.houseOrFlatNo ? `Flat ${user.houseOrFlatNo} • ` : ''}Personal payment vouchers and verified digital receipts
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Paid Dues"
          value={fmtCurrency(totalPaid)}
          subtitle="All festival & maintenance contributions"
          icon={CreditCard}
          variant="emerald"
        />
        <StatCard
          title="Receipts Issued"
          value={contributions.length}
          subtitle="Authorized digital vouchers"
          icon={Receipt}
          variant="blue"
        />
        <StatCard
          title="Payment Standing"
          value="Good Standing"
          subtitle="No recorded overdue notices"
          icon={CheckCircle}
          variant="indigo"
        />
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Payment History Ledger
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant access to view, print, or download official receipts
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-[#00AFEF] animate-spin mx-auto" />
          </div>
        ) : contributions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No payments recorded yet{user?.houseOrFlatNo ? ` for Flat ${user.houseOrFlatNo}` : ''}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Receipt No</th>
                  <th className="px-6 py-4">Purpose / Event</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Mode</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">View Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contributions.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4 font-mono font-bold text-slate-700">
                      #{c.receiptNumber || String(c._id).slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                      {c.contributionType === 'Annual'
                        ? `Maintenance ${c.annualYear || ''}`
                        : c.eventId?.title || 'Society Event Falo'}
                    </td>
                    <td className="px-6 py-4 font-extrabold text-[#3E4095] text-sm">
                      {fmtCurrency(c.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                        {c.paymentMode || 'Cash'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={c.paymentStatus} />
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {fmtDate(c.date || c.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenReceipt(c)}
                        className="px-3.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-[#00AFEF] font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ml-auto"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PDF Receipt Modal */}
      <PdfReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        contribution={selectedReceipt}
      />
    </div>
  );
};
