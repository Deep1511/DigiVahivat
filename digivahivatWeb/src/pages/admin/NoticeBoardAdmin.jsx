/**
 * src/pages/admin/NoticeBoardAdmin.jsx
 * Society Notice Board & Official Announcements Manager
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Megaphone,
  Plus,
  Pin,
  Trash2,
  Calendar,
  AlertTriangle,
  Loader2,
  Bell,
  Eye,
} from 'lucide-react';
import { noticesAPI } from '../../services/api';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import { fmtDateTime, NOTICE_CATEGORIES, NOTICE_PRIORITIES } from '../../constants';
import { useToast } from '../../context/ToastContext';

export const NoticeBoardAdmin = () => {
  const { showSuccess, showError } = useToast();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Create notice modal
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [priority, setPriority] = useState('Normal');
  const [pinned, setPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Read full notice modal
  const [activeNotice, setActiveNotice] = useState(null);

  const fetchNotices = useCallback(async () => {
    try {
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      const res = await noticesAPI.getAll(params);
      setNotices(res.data?.data || []);
    } catch (err) {
      showError(err.message || 'Could not fetch notices.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, showError]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showError('Please enter notice title and details.');
      return;
    }

    setSubmitting(true);
    try {
      await noticesAPI.create({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        pinned,
      });

      showSuccess('Announcement published and broadcasted to members!');
      setModalOpen(false);
      setTitle('');
      setDescription('');
      setCategory('General');
      setPriority('Normal');
      setPinned(false);
      fetchNotices();
    } catch (err) {
      showError(err.message || 'Failed to publish notice.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNotice = async (id, noticeTitle) => {
    if (!window.confirm(`Delete notice "${noticeTitle}"?`)) return;
    try {
      await noticesAPI.remove(id);
      showSuccess('Notice deleted.');
      fetchNotices();
    } catch (err) {
      showError(err.message || 'Could not delete notice.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Society Notice Board
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Publish official announcements, maintenance schedules, and meeting circulars
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00AFEF] to-[#3E4095] hover:opacity-95 text-white text-xs font-bold shadow-md shadow-sky-500/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Publish Notice
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {NOTICE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-[#00AFEF] to-[#3E4095] text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notices Grid */}
      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 text-[#00AFEF] animate-spin mx-auto" />
        </div>
      ) : notices.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
          No notices found in this category. Click &quot;Publish Notice&quot; above to post an announcement.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {notices.map((n) => (
            <div
              key={n._id}
              className={`bg-white rounded-2xl p-5 border shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4 ${
                n.pinned
                  ? 'border-sky-300 ring-2 ring-sky-100 bg-gradient-to-b from-sky-50/20 to-white'
                  : 'border-slate-200/90'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {n.category || 'General'}
                    </span>
                    {n.pinned && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                        <Pin className="w-3 h-3 text-sky-600 rotate-45" />
                        Pinned
                      </span>
                    )}
                  </div>
                  <Badge status={n.priority || 'Normal'} />
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {n.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-3 leading-relaxed">
                    {n.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>{fmtDateTime(n.createdAt)}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveNotice(n)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                    title="View Notice"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteNotice(n._id, n.title)}
                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
                    title="Delete Notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Publish Notice Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Publish Society Announcement"
        subtitle="Broadcast circular to all registered residents"
      >
        <form onSubmit={handleCreateNotice} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Notice Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Annual General Body Meeting (AGM) / Water Tank Cleaning"
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
                {NOTICE_CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>
                    {c}
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
                {NOTICE_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Full Circular / Details *
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details regarding timing, venue, agenda, or guidelines..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
            />
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            <input
              type="checkbox"
              id="pinNotice"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="w-4 h-4 rounded text-[#00AFEF] focus:ring-sky-500"
            />
            <label htmlFor="pinNotice" className="text-xs font-semibold text-slate-700">
              Pin this notice to top of resident notice board
            </label>
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
              Publish Notice
            </button>
          </div>
        </form>
      </Modal>

      {/* View Notice Detail Modal */}
      <Modal
        isOpen={Boolean(activeNotice)}
        onClose={() => setActiveNotice(null)}
        title={activeNotice?.title || 'Notice'}
        subtitle={`Published on ${fmtDateTime(activeNotice?.createdAt)}`}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
              {activeNotice?.category}
            </span>
            <Badge status={activeNotice?.priority || 'Normal'} />
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
            {activeNotice?.description}
          </div>
        </div>
      </Modal>
    </div>
  );
};
