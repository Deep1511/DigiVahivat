/**
 * src/pages/admin/AdminDashboard.jsx
 * Society Administrator Master Financial & Operational Dashboard
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CalendarDays,
  CreditCard,
  Receipt,
  Users,
  Building2,
  TrendingUp,
  Download,
  Plus,
  ArrowRight,
  ShieldAlert,
  Loader2,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';
import {
  eventsAPI,
  contributionsAPI,
  residentsAPI,
} from '../../services/api';
import { StatCard } from '../../components/StatCard';
import { ProgressBar } from '../../components/ProgressBar';
import { Badge } from '../../components/Badge';
import { PdfReceiptModal } from '../../components/PdfReceiptModal';
import { fmtCurrency, fmtDate, getEventStatus } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);
  const [eventDashboard, setEventDashboard] = useState(null);
  const [residents, setResidents] = useState([]);
  const [recentContributions, setRecentContributions] = useState([]);
  const [loading, setLoading] = useState(true);

  // PDF Receipt Modal
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [evRes, resRes, contRes] = await Promise.all([
        eventsAPI.getAll().catch(() => ({ data: { data: [] } })),
        residentsAPI.getAll().catch(() => ({ data: { data: { residents: [] } } })),
        contributionsAPI.getAll().catch(() => ({ data: { data: [] } })),
      ]);

      const evList = evRes.data?.data || [];
      setEvents(evList);

      const rList =
        resRes.data?.data?.residents ||
        (Array.isArray(resRes.data?.data) ? resRes.data.data : []);
      setResidents(rList);

      const cList = contRes.data?.data || [];
      setRecentContributions(cList.slice(0, 7));

      // Find currently active event
      const active = evList.find((e) => getEventStatus(e) === 'active') || evList[0] || null;
      setActiveEvent(active);

      if (active) {
        try {
          const dashRes = await eventsAPI.dashboard(active._id);
          setEventDashboard(dashRes.data?.data || null);
        } catch {
          // ignore dashboard fetch error
        }
      }
    } catch (err) {
      showError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExportExcel = async (eventId, title) => {
    try {
      showSuccess(`Generating Excel financial audit for "${title}"...`);
      const res = await eventsAPI.exportExcel(eventId);
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Financial_Audit_${title.replace(/\s+/g, '_')}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showSuccess('Excel sheet downloaded successfully!');
    } catch (err) {
      showError(err.message || 'Could not export Excel audit.');
    }
  };

  const handleViewReceipt = (item) => {
    setSelectedReceipt(item);
    setReceiptModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-[#00AFEF] animate-spin" />
      </div>
    );
  }

  const totalCollected = eventDashboard?.totalCollected || 0;
  const totalExpenses = eventDashboard?.totalExpenses || 0;
  const netBalance = totalCollected - totalExpenses;

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Society Financial ERP
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time financial status, active events, dues, and gate operations
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/admin/collect')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#00AFEF] to-[#3E4095] hover:opacity-95 text-white text-xs font-bold shadow-md shadow-sky-500/20 transition cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            + Collect Falo
          </button>
          <button
            onClick={() => navigate('/admin/expenses')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-2xs transition cursor-pointer"
          >
            <Receipt className="w-4 h-4 text-emerald-600" />
            + Log Expense
          </button>
          <button
            onClick={() => navigate('/admin/residents')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-2xs transition cursor-pointer"
          >
            <Users className="w-4 h-4 text-sky-600" />
            + Add Resident
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Collection"
          value={fmtCurrency(totalCollected)}
          subtitle={activeEvent ? `For ${activeEvent.title}` : 'All collections'}
          icon={CreditCard}
          variant="blue"
        />
        <StatCard
          title="Total Expenses"
          value={fmtCurrency(totalExpenses)}
          subtitle="Itemized society spend"
          icon={Receipt}
          variant="rose"
        />
        <StatCard
          title="Net Fund Balance"
          value={fmtCurrency(netBalance)}
          subtitle="Remaining event balance"
          icon={TrendingUp}
          variant={netBalance >= 0 ? 'emerald' : 'rose'}
        />
        <StatCard
          title="Society Residents"
          value={residents.length}
          subtitle="Total enrolled members"
          icon={Users}
          variant="indigo"
        />
      </div>

      {/* Active Event Showcase Card */}
      {activeEvent && (
        <div className="bg-gradient-to-br from-white to-sky-50/40 rounded-2xl p-6 border border-sky-100 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Badge status={getEventStatus(activeEvent)} />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Featured Society Event
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-900 mt-1">
                {activeEvent.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeEvent.description || 'Society event and contribution fund'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportExcel(activeEvent._id, activeEvent.title)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Download Excel Audit
              </button>
              <button
                onClick={() => navigate('/admin/events')}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#00AFEF] hover:bg-[#0090C8] text-white text-xs font-bold shadow-2xs transition cursor-pointer"
              >
                Manage Events
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <ProgressBar
            collected={totalCollected}
            target={activeEvent.targetBudget}
          />

          <div className="pt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600 border-t border-slate-100">
            <div>
              <span className="text-slate-400 font-medium">Per Flat Quota: </span>
              <strong className="text-slate-900 font-bold">
                {fmtCurrency(activeEvent.perHouseAmount)}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Timeline: </span>
              <strong className="text-slate-800">
                {fmtDate(activeEvent.startDate)} - {fmtDate(activeEvent.endDate)}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Paid Flats: </span>
              <strong className="text-emerald-700 font-bold">
                {eventDashboard?.paidCount || 0} / {residents.length}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* Recent Collections Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Recent Contributions & Collections
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live transaction ledger across all events and annual maintenance
            </p>
          </div>
          <Link
            to="/admin/collect"
            className="text-xs font-bold text-[#00AFEF] hover:underline flex items-center gap-1"
          >
            Collect Payment
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentContributions.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs">
            No payments recorded yet. Click &quot;+ Collect Falo&quot; above to record a payment.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Resident / Flat</th>
                  <th className="px-5 py-3.5">Event / Purpose</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Mode</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentContributions.map((c) => {
                  const resObj = c.residentId || {};
                  return (
                    <tr key={c._id} className="hover:bg-slate-50/80 transition">
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        <span>{resObj.name || 'Member'}</span>
                        {resObj.houseOrFlatNo && (
                          <span className="block text-[11px] text-[#00AFEF] font-mono">
                            Flat {resObj.houseOrFlatNo}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-slate-700">
                        {c.contributionType === 'Annual'
                          ? `Maintenance ${c.annualYear || ''}`
                          : c.eventId?.title || 'Event Falo'}
                      </td>
                      <td className="px-5 py-3.5 font-extrabold text-slate-900">
                        {fmtCurrency(c.amount)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {c.paymentMode || 'Cash'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge status={c.paymentStatus} />
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {fmtDate(c.date || c.createdAt)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleViewReceipt(c)}
                          className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#00AFEF] font-bold text-[11px] transition cursor-pointer"
                        >
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
