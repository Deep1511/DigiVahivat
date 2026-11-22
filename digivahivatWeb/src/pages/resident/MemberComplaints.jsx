/**
 * src/pages/resident/MemberComplaints.jsx
 * Resident Helpdesk & Maintenance Service Requests
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquareWarning,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MessageCircle,
} from 'lucide-react';
import { complaintsAPI } from '../../services/api';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import { fmtDateTime, COMPLAINT_CATEGORIES, COMPLAINT_PRIORITIES } from '../../constants';
import { useToast } from '../../context/ToastContext';

export const MemberComplaints = () => {
  const { showSuccess, showError } = useToast();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Request Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(COMPLAINT_CATEGORIES[0]);
  const [priority, setPriority] = useState('Normal');
  const [submitting, setSubmitting] = useState(false);

  const fetchComplaints = useCallback(async () => {
    try {
      const res = await complaintsAPI.getAll();
      setComplaints(res.data?.data || []);
    } catch (err) {
      showError(err.message || 'Could not fetch complaints.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showError('Please enter a request title and description.');
      return;
    }

    setSubmitting(true);
    try {
      await complaintsAPI.create({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
      });

      showSuccess('Maintenance request submitted to society management!');
      setModalOpen(false);
      setTitle('');
      setDescription('');
      fetchComplaints();
    } catch (err) {
      showError(err.message || 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Helpdesk & Service Requests
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit maintenance issues to your society committee and track resolution progress
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00AFEF] to-[#3E4095] hover:opacity-95 text-white text-xs font-bold shadow-md shadow-sky-500/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Raise New Request
        </button>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-[#00AFEF] animate-spin mx-auto" />
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-2">
            <MessageSquareWarning className="w-8 h-8 mx-auto text-slate-300" />
            <p>No complaints or maintenance requests raised yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {complaints.map((c) => (
              <div key={c._id} className="p-6 space-y-3 hover:bg-slate-50/50 transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700">
                      {c.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {c.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge status={c.priority || 'Normal'} />
                    <Badge status={c.status} />
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {c.description}
                </p>

                {/* Admin Remarks */}
                {c.adminRemarks && (
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700">
                    <span className="font-bold text-[#3E4095]">Committee Response: </span>
                    {c.adminRemarks}
                  </div>
                )}

                <div className="text-[11px] text-slate-400 pt-1">
                  Submitted on {fmtDateTime(c.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Raise Request Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Raise Maintenance Request"
        subtitle="Report an issue to the society management committee"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Issue Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Water leakage in pipeline / Elevator button broken"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white transition"
              >
                {COMPLAINT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white transition"
              >
                {COMPLAINT_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Detailed Description *
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened, exact location, and urgency..."
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
              Submit Request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
