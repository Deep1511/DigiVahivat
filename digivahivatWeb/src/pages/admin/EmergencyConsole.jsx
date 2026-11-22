/**
 * src/pages/admin/EmergencyConsole.jsx
 * Society Emergency SOS Command Center for Admins & Gate Security
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Radio,
  AlertOctagon,
  CheckCircle2,
  PhoneCall,
  Flame,
  HeartPulse,
  ShieldAlert,
  ArrowUpDown,
  AlertTriangle,
  Clock,
  Check,
  XCircle,
  Loader2,
} from 'lucide-react';
import { sosAPI } from '../../services/api';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import { StatCard } from '../../components/StatCard';
import { fmtDateTime, EMERGENCY_CONTACTS, SOS_TYPES } from '../../constants';
import { useToast } from '../../context/ToastContext';

export const EmergencyConsole = () => {
  const { showSuccess, showError } = useToast();
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [historyAlerts, setHistoryAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Resolve Modal
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [targetSos, setTargetSos] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAlerts = useCallback(async () => {
    try {
      const [actRes, histRes] = await Promise.all([
        sosAPI.getActive().catch(() => ({ data: { data: [] } })),
        sosAPI.getHistory().catch(() => ({ data: { data: [] } })),
      ]);
      setActiveAlerts(actRes.data?.data || []);
      setHistoryAlerts(histRes.data?.data || []);
    } catch (err) {
      showError(err.message || 'Failed to fetch emergency alerts.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchAlerts();
    const timer = setInterval(fetchAlerts, 6000);
    return () => clearInterval(timer);
  }, [fetchAlerts]);

  const handleAcknowledge = async (id) => {
    try {
      await sosAPI.acknowledge(id);
      showSuccess('Response acknowledged! Gate security & team marked dispatched.');
      fetchAlerts();
    } catch (err) {
      showError(err.message || 'Could not acknowledge alert.');
    }
  };

  const handleOpenResolve = (item) => {
    setTargetSos(item);
    setResolutionNotes('');
    setResolveModalOpen(true);
  };

  const handleConfirmResolve = async (e) => {
    e.preventDefault();
    if (!targetSos) return;
    setSubmitting(true);
    try {
      await sosAPI.resolve(targetSos._id, {
        resolutionNotes: resolutionNotes.trim() || 'Incident attended & resolved.',
      });
      showSuccess('Emergency alert marked resolved and archived.');
      setResolveModalOpen(false);
      fetchAlerts();
    } catch (err) {
      showError(err.message || 'Could not resolve alert.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Emergency SOS Command Center
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time crisis monitoring, dispatch response, and incident resolution tracking
        </p>
      </div>

      {/* Emergency Hotlines Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {EMERGENCY_CONTACTS.map((c) => (
          <a
            key={c.number}
            href={`tel:${c.number}`}
            className="p-3.5 rounded-2xl border border-red-200 bg-red-50/60 hover:bg-red-50 transition flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-bold text-red-950 block">{c.name}</span>
              <span className="text-xl font-black text-red-600 block mt-0.5">
                {c.number}
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
              <PhoneCall className="w-4 h-4" />
            </div>
          </a>
        ))}
      </div>

      {/* Active Alerts Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
            Active Emergency Incidents ({activeAlerts.length})
          </h3>
        </div>

        {activeAlerts.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-500 flex flex-col items-center justify-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            <span className="font-bold text-slate-800 text-sm">
              All Clear — No Active Crises
            </span>
            <p className="text-slate-400">
              The community has no open emergency alerts at this moment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeAlerts.map((sos) => {
              const resObj = sos.residentId || {};
              return (
                <div
                  key={sos._id}
                  className="bg-white rounded-3xl p-6 border-2 border-red-500 shadow-xl shadow-red-500/10 sos-pulse space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md">
                        <AlertOctagon className="w-7 h-7 animate-bounce" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-800">
                            {sos.type || 'Emergency'}
                          </span>
                          <span className="text-xs text-red-600 font-bold">
                            Status: {sos.status}
                          </span>
                        </div>
                        <h4 className="text-xl font-black text-slate-900 mt-0.5">
                          {resObj.houseOrFlatNo ? `Flat ${resObj.houseOrFlatNo} — ` : ''}{resObj.name || 'Resident'}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {resObj.phone && (
                        <a
                          href={`tel:${resObj.phone}`}
                          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition"
                        >
                          <PhoneCall className="w-4 h-4 text-emerald-400" />
                          Call Flat ({resObj.phone})
                        </a>
                      )}
                    </div>
                  </div>

                  {sos.notes && (
                    <div className="p-3 bg-red-50/50 rounded-xl border border-red-200 text-xs text-red-950 font-medium">
                      <strong>Crisis Details: </strong>
                      {sos.notes}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
                    <div>
                      <span>Triggered: {fmtDateTime(sos.createdAt)}</span>
                      {sos.acknowledgedBy && (
                        <span className="block text-emerald-600 font-semibold mt-0.5">
                          ✓ Acknowledged by: {sos.acknowledgedBy.name || 'Admin'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {sos.status === 'Active' && (
                        <button
                          onClick={() => handleAcknowledge(sos._id)}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                        >
                          Acknowledge & Dispatch Help
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenResolve(sos)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                      >
                        Resolve Incident
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Incident History Archive Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">
            Emergency Incident History Archive
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Log of resolved emergency alerts and audit reports
          </p>
        </div>

        {historyAlerts.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No past emergency incidents recorded.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Crisis Type</th>
                  <th className="px-5 py-3.5">Flat Number</th>
                  <th className="px-5 py-3.5">Resident</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Triggered At</th>
                  <th className="px-5 py-3.5">Resolution Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historyAlerts.map((h) => {
                  const resObj = h.residentId || {};
                  return (
                    <tr key={h._id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        {h.type}
                      </td>
                      <td className="px-5 py-3.5 font-extrabold text-[#00AFEF]">
                        {resObj.houseOrFlatNo ? `Flat ${resObj.houseOrFlatNo}` : '-'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-700">
                        {resObj.name || '-'}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge status={h.status} />
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {fmtDateTime(h.createdAt)}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate">
                        {h.resolutionNotes || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resolve Incident Modal */}
      <Modal
        isOpen={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        title="Resolve Emergency Incident"
        subtitle="Record completion notes and archive crisis report"
      >
        <form onSubmit={handleConfirmResolve} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Resolution Remarks / Incident Notes *
            </label>
            <textarea
              rows={3}
              required
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="e.g. Ambulance arrived at Gate 2, resident transported to Civil Hospital. Situation under control."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setResolveModalOpen(false)}
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
              Confirm Resolution
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
