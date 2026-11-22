/**
 * src/pages/admin/EventsManagement.jsx
 * Admin Society Events & Falo Funds Management Console
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarDays,
  Plus,
  Search,
  FileSpreadsheet,
  Edit2,
  Trash2,
  BarChart2,
  ArrowRight,
  Loader2,
  Calendar,
} from 'lucide-react';
import { eventsAPI, residentsAPI } from '../../services/api';
import { Modal } from '../../components/Modal';
import { ProgressBar } from '../../components/ProgressBar';
import { Badge } from '../../components/Badge';
import { fmtCurrency, fmtDate, getEventStatus } from '../../constants';
import { useToast } from '../../context/ToastContext';

export const EventsManagement = () => {
  const { showSuccess, showError } = useToast();
  const [events, setEvents] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'active' | 'upcoming' | 'closed'
  const [search, setSearch] = useState('');

  // Event Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetBudget, setTargetBudget] = useState('');
  const [perHouseAmount, setPerHouseAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      const [evRes, resRes] = await Promise.all([
        eventsAPI.getAll(),
        residentsAPI.getAll().catch(() => ({ data: { data: { residents: [] } } })),
      ]);
      setEvents(evRes.data?.data || []);
      const rList =
        resRes.data?.data?.residents ||
        (Array.isArray(resRes.data?.data) ? resRes.data.data : []);
      setResidents(rList);
    } catch (err) {
      showError(err.message || 'Failed to fetch events.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleOpenCreate = () => {
    setEditingEvent(null);
    setTitle('');
    setDescription('');
    setTargetBudget('');
    setPerHouseAmount('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setModalOpen(true);
  };

  const handleOpenEdit = (ev) => {
    setEditingEvent(ev);
    setTitle(ev.title);
    setDescription(ev.description || '');
    setTargetBudget(String(ev.targetBudget || ''));
    setPerHouseAmount(String(ev.perHouseAmount || ''));
    setStartDate(ev.startDate ? ev.startDate.split('T')[0] : '');
    setEndDate(ev.endDate ? ev.endDate.split('T')[0] : '');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showError('Please enter event title.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        targetBudget: Number(targetBudget) || 0,
        perHouseAmount: Number(perHouseAmount) || 0,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      if (editingEvent) {
        await eventsAPI.update(editingEvent._id, payload);
        showSuccess(`Event "${title}" updated successfully!`);
      } else {
        await eventsAPI.create(payload);
        showSuccess(`Event "${title}" created and broadcasted to society!`);
      }
      setModalOpen(false);
      fetchEvents();
    } catch (err) {
      showError(err.message || 'Failed to save event.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, evTitle) => {
    if (!window.confirm(`Delete event "${evTitle}"? All linked records will be archived.`)) {
      return;
    }
    try {
      await eventsAPI.remove(id);
      showSuccess(`Event "${evTitle}" deleted.`);
      fetchEvents();
    } catch (err) {
      showError(err.message || 'Could not delete event.');
    }
  };

  const handleExportExcel = async (id, evTitle) => {
    try {
      showSuccess(`Generating Excel audit report for "${evTitle}"...`);
      const res = await eventsAPI.exportExcel(id);
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Audit_${evTitle.replace(/\s+/g, '_')}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showSuccess('Excel downloaded successfully!');
    } catch (err) {
      showError(err.message || 'Export failed.');
    }
  };

  const filteredEvents = events.filter((e) => {
    const status = getEventStatus(e);
    if (activeTab !== 'all' && status !== activeTab) return false;
    if (
      search &&
      !e.title?.toLowerCase().includes(search.toLowerCase()) &&
      !e.description?.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Events & Falo Funds
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage festival collections, community projects, and audit balance sheets
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00AFEF] to-[#3E4095] hover:opacity-95 text-white text-xs font-bold shadow-md shadow-sky-500/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create New Event
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/80 shadow-2xs">
          {['all', 'active', 'upcoming', 'closed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition cursor-pointer ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-[#00AFEF] to-[#3E4095] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab === 'all' ? 'All Events' : tab}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="py-16 text-center">
          <Loader2 className="w-8 h-8 text-[#00AFEF] animate-spin mx-auto" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
          No events found. Click &quot;Create New Event&quot; above to announce a new festival or fund.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((ev) => {
            const status = getEventStatus(ev);
            return (
              <div
                key={ev._id}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge status={status} />
                    <span className="text-[11px] font-mono text-slate-400">
                      Quota: {fmtCurrency(ev.perHouseAmount)}/flat
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {ev.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {ev.description || 'Society festival & contribution project'}
                    </p>
                  </div>

                  {/* Target budget showcase */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">
                        Target Budget
                      </span>
                      <strong className="text-slate-900 font-extrabold text-sm">
                        {fmtCurrency(ev.targetBudget)}
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">
                        Timeline
                      </span>
                      <span className="text-slate-700 font-medium">
                        {fmtDate(ev.startDate)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleExportExcel(ev._id, ev.title)}
                    className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 border border-emerald-200 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                    title="Export Audit Sheet in Excel"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Excel
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(ev)}
                      className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                      title="Edit Event"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(ev._id, ev.title)}
                      className="p-2 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
                      title="Delete Event"
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

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingEvent ? 'Edit Society Event' : 'Create Society Event'}
        subtitle="Configure title, budget, per-house quota, and timeline"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Navratri Mahotsav 2026 / Building Lift Overhaul"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Program itinerary, pooja schedules, instructions..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Budget (₹)
              </label>
              <input
                type="number"
                min={0}
                value={targetBudget}
                onChange={(e) => setTargetBudget(e.target.value)}
                placeholder="e.g. 150000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Per Flat Amount (₹)
              </label>
              <input
                type="number"
                min={0}
                value={perHouseAmount}
                onChange={(e) => setPerHouseAmount(e.target.value)}
                placeholder="e.g. 2500"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
              />
            </div>
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
              {editingEvent ? 'Save Changes' : 'Publish Event'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
