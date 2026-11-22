/**
 * src/pages/resident/MyVisitors.jsx
 * Resident Visitor Pre-Approval & Gate Passes Manager
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  Share2,
  Copy,
  Check,
  XCircle,
  ExternalLink,
  QrCode,
  Users,
  Car,
  Clock,
  Loader2,
} from 'lucide-react';
import { visitorsAPI } from '../../services/api';
import { PreApproveVisitorModal } from '../../components/PreApproveVisitorModal';
import { Badge } from '../../components/Badge';
import { fmtDateTime, fmtDate } from '../../constants';
import { useToast } from '../../context/ToastContext';

export const MyVisitors = () => {
  const { showSuccess, showError } = useToast();
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'PreApproved' | 'Inside' | 'Exited'
  const [modalOpen, setModalOpen] = useState(false);

  const fetchVisitors = useCallback(async () => {
    try {
      const res = await visitorsAPI.getMyVisitors();
      setVisitors(res.data?.data || []);
    } catch (err) {
      showError(err.message || 'Could not fetch your visitors.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchVisitors();
    const timer = setInterval(fetchVisitors, 8000);
    return () => clearInterval(timer);
  }, [fetchVisitors]);

  const handleCancelPass = async (item) => {
    if (
      !window.confirm(
        `Cancel pre-approved gate pass for "${item.visitorName}"? They will not be permitted entry.`
      )
    ) {
      return;
    }

    try {
      await visitorsAPI.cancel(item._id);
      showSuccess(`Pass for ${item.visitorName} cancelled.`);
      fetchVisitors();
    } catch (err) {
      showError(err.message || 'Failed to cancel pass.');
    }
  };

  const filtered = visitors.filter((v) => {
    if (activeTab !== 'all' && v.status !== activeTab) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Visitor Gate Passes
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pre-approve guests, delivery couriers, or cabs with instant 6-digit codes and QR passes
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00AFEF] to-[#3E4095] hover:opacity-95 text-white text-xs font-bold shadow-md shadow-sky-500/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Pre-Approve Visitor
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/80 shadow-2xs max-w-md">
        {[
          { key: 'all', label: 'All Passes' },
          { key: 'PreApproved', label: 'Expected' },
          { key: 'Inside', label: 'Inside Now' },
          { key: 'Exited', label: 'Exited' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer text-center ${
              activeTab === tab.key
                ? 'bg-gradient-to-r from-[#00AFEF] to-[#3E4095] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Passes Grid */}
      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 text-[#00AFEF] animate-spin mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-200 space-y-2">
          <ShieldCheck className="w-8 h-8 mx-auto text-slate-300" />
          <p>No visitor passes found in this view.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((v) => {
            const passUrl = `${window.location.origin}/pass/${v._id}`;
            return (
              <div
                key={v._id}
                className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge status={v.status} />
                    <span className="text-[11px] text-slate-400 font-medium">
                      {fmtDate(v.expectedDate || v.createdAt)}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-900">
                      {v.visitorName}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {v.purpose || 'Visitor'} • {v.membersCount || 1} Person(s)
                      {v.vehicleNumber && ` • ${v.vehicleNumber}`}
                    </p>
                  </div>

                  {/* 6-Digit Gate Code Showcase */}
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-sky-50 to-indigo-50/70 border border-sky-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-sky-800 uppercase tracking-widest block">
                        Gate Entry Code
                      </span>
                      <span className="text-2xl font-black text-[#3E4095] tracking-[0.2em] font-mono select-all">
                        {v.passCode}
                      </span>
                    </div>

                    <a
                      href={passUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-white border border-slate-200 text-[#00AFEF] hover:bg-sky-50 transition"
                      title="Open Public QR Pass Page"
                    >
                      <QrCode className="w-5 h-5" />
                    </a>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `Hello ${v.visitorName},\nGate Pass Code: ${v.passCode}\nView QR Pass: ${passUrl}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    WhatsApp
                  </a>

                  {v.status === 'PreApproved' && (
                    <button
                      onClick={() => handleCancelPass(v)}
                      className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Cancel Pass
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pre-Approve Modal */}
      <PreApproveVisitorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchVisitors}
      />
    </div>
  );
};
