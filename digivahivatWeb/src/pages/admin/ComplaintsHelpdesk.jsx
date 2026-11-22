/**
 * src/pages/admin/ComplaintsHelpdesk.jsx
 * Member Helpdesk & Society Maintenance Requests Console
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquareWarning,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Edit2,
  Trash2,
  Loader2,
  Home,
  MessageCircle,
} from 'lucide-react';
import { complaintsAPI } from '../../services/api';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import { StatCard } from '../../components/StatCard';
import { fmtDateTime, COMPLAINT_CATEGORIES, COMPLAINT_STATUSES } from '../../constants';
import { useToast } from '../../context/ToastContext';

export const ComplaintsHelpdesk = () => {
  const { showSuccess, showError } = useToast();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState('All');
  const [search, setSearch] = useState('');

  // Status update modal
  const [modalOpen, setModalOpen] = useState(false);
  const [targetComplaint, setTargetComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('InProgress');
  const [adminRemarks, setAdminRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchComplaints = useCallback(async () => {
    try {
      const res = await complaintsAPI.getAll({
        status: activeStatus === 'All' ? undefined : activeStatus,
      });
      setComplaints(res.data?.data || []);
    } catch (err) {
      showError(err.message || 'Could not fetch complaints.');
    } finally {
      setLoading(false);
    }
  }, [activeStatus, showError]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleOpenStatusModal = (comp) => {
    setTargetComplaint(comp);
    setNewStatus(comp.status || 'InProgress');
    setAdminRemarks(comp.adminRemarks || '');
    setModalOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!targetComplaint) return;

    setSubmitting(true);
    try {
      await complaintsAPI.updateStatus(targetComplaint._id, {
        status: newStatus,
        adminRemarks: adminRemarks.trim() || undefined,
      });

      showSuccess(`Complaint updated to "${newStatus}"!`);
      setModalOpen(false);
      fetchComplaints();
    } catch (err) {
      showError(err.message || 'Failed to update complaint status.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete request "${title}"?`)) return;
    try {
      await complaintsAPI.remove(id);
      showSuccess('Complaint removed.');
      fetchComplaints();
    } catch (err) {
      showError(err.message || 'Failed to delete complaint.');
    }
  };

  const pendingCount = complaints.filter((c) => c.status === 'Pending').length;
  const inProgressCount = complaints.filter((c) => c.status === 'InProgress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;

  const filtered = complaints.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.title?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c.category?.toLowerCase().includes(q) ||
      c.residentId?.name?.toLowerCase().includes(q) ||
      c.residentId?.houseOrFlatNo?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Member Requests & Helpdesk
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Track resident service complaints, assign priority, and record resolution remarks
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Pending Requests"
          value={pendingCount}
          subtitle="Awaiting committee review"
          icon={AlertCircle}
          variant="amber"
        />
        <StatCard
          title="In Progress"
          value={inProgressCount}
          subtitle="Work order currently assigned"
          icon={Clock}
          variant="blue"
        />
        <StatCard
          title="Resolved Issues"
          value={resolvedCount}
          subtitle="Closed issues with notes"
          icon={CheckCircle2}
          variant="emerald"
        />
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/80 shadow-2xs">
          {['All', 'Pending', 'InProgress', 'Resolved', 'Rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeStatus === status
                  ? 'bg-gradient-to-r from-[#00AFEF] to-[#3E4095] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search complaint, flat, member..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Complaints List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-[#00AFEF] animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs">
            No complaints found in this status.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((item) => {
              const resObj = item.residentId || {};
              return (
                <div
                  key={item._id}
                  className="p-5 hover:bg-slate-50/70 transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      {resObj.houseOrFlatNo && (
                        <span className="font-extrabold text-[#00AFEF] text-sm bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100 font-mono">
                          Flat {resObj.houseOrFlatNo}
                        </span>
                      )}
                      <h4 className="text-base font-bold text-slate-900">
                        {item.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge status={item.priority || 'Normal'} />
                      <Badge status={item.status} />
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Admin Remarks callout if available */}
                  {item.adminRemarks && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                      <span className="font-bold text-[#3E4095]">Committee Response: </span>
                      {item.adminRemarks}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <div>
                      <span>Raised by: </span>
                      <strong className="text-slate-800">{resObj.name || 'Resident'}</strong>
                      {resObj.phone && <span> (Ph: {resObj.phone})</span>}
                      <span> • {fmtDateTime(item.createdAt)}</span>
                      <span> • Category: </span>
                      <strong className="text-slate-700">{item.category}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenStatusModal(item)}
                        className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#00AFEF] font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Update Status
                      </button>
                      <button
                        onClick={() => handleDelete(item._id, item.title)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Update Status Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Update Request Status"
        subtitle={`Complaint: ${targetComplaint?.title || ''}`}
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Resolution Status *
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white transition font-semibold"
            >
              <option value="Pending">Pending Review</option>
              <option value="InProgress">In Progress (Assigned)</option>
              <option value="Resolved">Resolved (Completed)</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Resolution Remarks / Notes for Resident
            </label>
            <textarea
              rows={3}
              value={adminRemarks}
              onChange={(e) => setAdminRemarks(e.target.value)}
              placeholder="e.g. Electrician visited Flat A-402, replaced faulty common corridor bulb."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#00AFEF] to-[#3E4095] text-white text-xs font-bold shadow-sm transition disabled:opacity-75 flex items-center gap-1.5 cursor-pointer"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Status & Notify Resident
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
