/**
 * src/pages/resident/ResidentDashboard.jsx
 * Resident Member Portal Home Dashboard
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  CalendarDays,
  CreditCard,
  ShieldCheck,
  MessageSquareWarning,
  AlertOctagon,
  Megaphone,
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  PhoneCall,
  Receipt,
} from 'lucide-react';
import {
  eventsAPI,
  contributionsAPI,
  noticesAPI,
  visitorsAPI,
} from '../../services/api';
import { StatCard } from '../../components/StatCard';
import { ProgressBar } from '../../components/ProgressBar';
import { Badge } from '../../components/Badge';
import { PreApproveVisitorModal } from '../../components/PreApproveVisitorModal';
import { SosTriggerModal } from '../../components/SosTriggerModal';
import { PdfReceiptModal } from '../../components/PdfReceiptModal';
import { fmtCurrency, fmtDate, getEventStatus, EMERGENCY_CONTACTS } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const ResidentDashboard = () => {
  const { user } = useAuth();
  const { showError } = useToast();
  const navigate = useNavigate();

  const [activeEvent, setActiveEvent] = useState(null);
  const [eventDashboard, setEventDashboard] = useState(null);
  const [myContributions, setMyContributions] = useState([]);
  const [notices, setNotices] = useState([]);
  const [expectedVisitors, setExpectedVisitors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [visitorModalOpen, setVisitorModalOpen] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [evRes, cRes, nRes, vRes] = await Promise.all([
        eventsAPI.getAll().catch(() => ({ data: { data: [] } })),
        contributionsAPI.getAll().catch(() => ({ data: { data: [] } })),
        noticesAPI.getAll().catch(() => ({ data: { data: [] } })),
        visitorsAPI.getMyVisitors().catch(() => ({ data: { data: [] } })),
      ]);

      const events = evRes.data?.data || [];
      const active = events.find((e) => getEventStatus(e) === 'active') || events[0] || null;
      setActiveEvent(active);

      if (active) {
        try {
          const dashRes = await eventsAPI.dashboard(active._id);
          setEventDashboard(dashRes.data?.data || null);
        } catch {
          // ignore
        }
      }

      // Filter contributions belonging to this resident
      const allC = cRes.data?.data || [];
      const mine = allC.filter((c) => {
        const rId = c.residentId?._id || c.residentId;
        return rId === user?._id;
      });
      setMyContributions(mine);

      setNotices((nRes.data?.data || []).slice(0, 4));
      setExpectedVisitors((vRes.data?.data || []).filter((v) => v.status === 'PreApproved' || v.status === 'Inside'));
    } catch (err) {
      showError(err.message || 'Failed to load member dashboard.');
    } finally {
      setLoading(false);
    }
  }, [user?._id, showError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-[#00AFEF] animate-spin" />
      </div>
    );
  }

  // Active event user payment status
  const myPaymentForActiveEvent = activeEvent
    ? myContributions.find((c) => (c.eventId?._id || c.eventId) === activeEvent._id)
    : null;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-sky-500 via-[#00AFEF] to-[#3E4095] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-sky-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-sky-100">
            Resident Portal{user?.houseOrFlatNo ? ` • Flat ${user.houseOrFlatNo}` : ''}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
            Welcome, {user?.name || 'Member'}
          </h1>
          <p className="text-xs text-white/90 mt-1 max-w-lg">
            Track society contributions, pre-approve guests, check circulars, and
            report maintenance issues.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setVisitorModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-sm hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-[#00AFEF]" />
            Pre-Approve Guest
          </button>
          <button
            onClick={() => setSosModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
          >
            <AlertOctagon className="w-4 h-4 animate-pulse" />
            SOS Emergency
          </button>
        </div>
      </div>

      {/* Active Event Showcase */}
      {activeEvent && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Badge status={getEventStatus(activeEvent)} />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Current Society Event
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-1">
                {activeEvent.title}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeEvent.description || 'Community festival & project fund'}
              </p>
            </div>

            {/* My flat payment badge */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                My Flat Payment
              </span>
              <div className="mt-0.5">
                {myPaymentForActiveEvent ? (
                  <Badge
                    status={myPaymentForActiveEvent.paymentStatus}
                    label={`Paid: ${fmtCurrency(myPaymentForActiveEvent.amount)}`}
                  />
                ) : (
                  <Badge status="Pending" label="Dues Pending" />
                )}
              </div>
            </div>
          </div>

          <ProgressBar
            collected={eventDashboard?.totalCollected || 0}
            target={activeEvent.targetBudget}
          />

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-100 text-slate-600">
            <div>
              <span className="text-slate-400">Target: </span>
              <strong className="text-slate-900 font-bold">
                {fmtCurrency(activeEvent.targetBudget)}
              </strong>
              <span className="mx-2">•</span>
              <span className="text-slate-400">Quota: </span>
              <strong className="text-slate-900 font-bold">
                {fmtCurrency(activeEvent.perHouseAmount)}/flat
              </strong>
            </div>

            <Link
              to="/resident/payments"
              className="text-xs font-bold text-[#00AFEF] hover:underline flex items-center gap-1"
            >
              View My Receipts
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Grid: Gate Passes & Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expected Visitors Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                My Visitor Gate Passes
              </h3>
              <p className="text-xs text-slate-500">
                Expected or currently checked-in guests
              </p>
            </div>
            <Link
              to="/resident/visitors"
              className="text-xs font-bold text-[#00AFEF] hover:underline"
            >
              View All →
            </Link>
          </div>

          {expectedVisitors.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl">
              No active visitor passes. Click &quot;Pre-Approve Guest&quot; to issue a gate pass.
            </div>
          ) : (
            <div className="space-y-2.5">
              {expectedVisitors.slice(0, 3).map((v) => (
                <div
                  key={v._id}
                  className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between"
                >
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">
                      {v.visitorName}
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      Code: <strong className="font-mono text-[#3E4095]">{v.passCode}</strong> • {v.purpose || 'Visit'}
                    </p>
                  </div>
                  <Badge status={v.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Notices Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Society Circulars & Notices
              </h3>
              <p className="text-xs text-slate-500">Official committee announcements</p>
            </div>
            <Link
              to="/resident/notices"
              className="text-xs font-bold text-[#00AFEF] hover:underline"
            >
              Notice Board →
            </Link>
          </div>

          {notices.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl">
              No recent announcements.
            </div>
          ) : (
            <div className="space-y-2.5">
              {notices.slice(0, 3).map((n) => (
                <div
                  key={n._id}
                  className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      {n.category || 'General'}
                    </span>
                    <Badge status={n.priority || 'Normal'} />
                  </div>
                  <h5 className="font-bold text-slate-900 text-xs truncate">
                    {n.title}
                  </h5>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    {n.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Emergency Hotline Dials */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-3">
        <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
          Direct Emergency Hotlines
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {EMERGENCY_CONTACTS.map((c) => (
            <a
              key={c.number}
              href={`tel:${c.number}`}
              className="p-2.5 rounded-xl border border-slate-200 hover:border-red-300 bg-slate-50 flex items-center justify-between transition text-xs"
            >
              <div>
                <span className="font-extrabold text-slate-900 block">{c.number}</span>
                <span className="text-[10px] text-slate-500 block truncate">{c.name}</span>
              </div>
              <PhoneCall className="w-3.5 h-3.5 text-red-600" />
            </a>
          ))}
        </div>
      </div>

      {/* Modals */}
      <PreApproveVisitorModal
        isOpen={visitorModalOpen}
        onClose={() => setVisitorModalOpen(false)}
        onSuccess={fetchData}
      />
      <SosTriggerModal
        isOpen={sosModalOpen}
        onClose={() => setSosModalOpen(false)}
      />
      <PdfReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        contribution={selectedReceipt}
      />
    </div>
  );
};
