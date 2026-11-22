/**
 * src/pages/admin/ExpensesLedger.jsx
 * Society Expense Ledger with Receipt Photo Uploads & Committee Approvals
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Trash2,
  Upload,
  FileText,
  Loader2,
  Building2,
} from 'lucide-react';
import { expensesAPI, eventsAPI } from '../../services/api';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import { StatCard } from '../../components/StatCard';
import { fmtCurrency, fmtDate, EXPENSE_CATEGORIES } from '../../constants';
import { useToast } from '../../context/ToastContext';

export const ExpensesLedger = () => {
  const { showSuccess, showError } = useToast();
  const [expenses, setExpenses] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Log Expense Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [eventId, setEventId] = useState('');
  const [description, setDescription] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // View Receipt Image Modal
  const [viewImageUrl, setViewImageUrl] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [expRes, evRes] = await Promise.all([
        expensesAPI.getAll(),
        eventsAPI.getAll().catch(() => ({ data: { data: [] } })),
      ]);
      setExpenses(expRes.data?.data || []);
      const evList = evRes.data?.data || [];
      setEvents(evList);
      if (evList.length > 0 && !eventId) {
        setEventId(evList[0]._id);
      }
    } catch (err) {
      showError(err.message || 'Failed to fetch expenses.');
    } finally {
      setLoading(false);
    }
  }, [eventId, showError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  const handleLogExpense = async (e) => {
    e.preventDefault();
    if (!title.trim() || !amount || Number(amount) <= 0) {
      showError('Please enter a valid expense title and amount.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('amount', amount);
      formData.append('category', category);
      if (eventId) formData.append('eventId', eventId);
      if (description.trim()) formData.append('description', description.trim());
      if (receiptFile) formData.append('receipt', receiptFile);

      await expensesAPI.log(formData);
      showSuccess(`Expense "${title}" logged successfully!`);
      setModalOpen(false);
      setTitle('');
      setAmount('');
      setDescription('');
      setReceiptFile(null);
      setReceiptPreview(null);
      fetchData();
    } catch (err) {
      showError(err.message || 'Failed to log expense.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await expensesAPI.updateStatus(id, { status: newStatus });
      showSuccess(`Expense marked as ${newStatus}!`);
      fetchData();
    } catch (err) {
      showError(err.message || 'Failed to update expense status.');
    }
  };

  const handleDeleteExpense = async (id, expTitle) => {
    if (!window.confirm(`Delete expense "${expTitle}"?`)) return;
    try {
      await expensesAPI.remove(id);
      showSuccess('Expense removed.');
      fetchData();
    } catch (err) {
      showError(err.message || 'Failed to delete expense.');
    }
  };

  const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const approvedTotal = expenses
    .filter((e) => e.status === 'Approved')
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const filteredExpenses = expenses.filter((e) => {
    if (selectedCategory !== 'All' && e.category !== selectedCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        e.title?.toLowerCase().includes(q) ||
        e.category?.toLowerCase().includes(q) ||
        e.recordedBy?.name?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Society Expenses Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log bills, upload invoices & receipts, and manage committee expense approvals
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00AFEF] to-[#3E4095] hover:opacity-95 text-white text-xs font-bold shadow-md shadow-sky-500/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Log New Expense
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Outflow"
          value={fmtCurrency(totalSpent)}
          subtitle="All recorded society expenses"
          icon={Receipt}
          variant="rose"
        />
        <StatCard
          title="Approved Expenses"
          value={fmtCurrency(approvedTotal)}
          subtitle="Verified with committee receipts"
          icon={CheckCircle2}
          variant="emerald"
        />
        <StatCard
          title="Total Invoices"
          value={expenses.length}
          subtitle="Bills & vouchers logged"
          icon={FileText}
          variant="blue"
        />
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-xl">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Categories
          </button>
          {EXPENSE_CATEGORIES.slice(0, 5).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#00AFEF] text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search expenses, vendor, bill..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-[#00AFEF] animate-spin mx-auto" />
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs">
            No expenses found. Click &quot;Log New Expense&quot; to add a society bill.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Expense Item</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Event</th>
                  <th className="px-5 py-3.5">Logged By</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {exp.receiptUrl ? (
                          <button
                            onClick={() => setViewImageUrl(exp.receiptUrl)}
                            className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shrink-0 hover:opacity-80 transition cursor-pointer"
                            title="Click to view full receipt"
                          >
                            <img
                              src={exp.receiptUrl}
                              alt="Receipt"
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                            <Receipt className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-slate-900 block text-sm">
                            {exp.title}
                          </span>
                          {exp.description && (
                            <span className="text-[11px] text-slate-500 line-clamp-1">
                              {exp.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-100">
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-extrabold text-slate-900 text-sm">
                      {fmtCurrency(exp.amount)}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {exp.eventId?.title || 'General Fund'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {exp.recordedBy?.name || 'Admin'}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge status={exp.status || 'Approved'} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {fmtDate(exp.date || exp.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {exp.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(exp._id, 'Approved')}
                              className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 transition"
                              title="Approve Expense"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(exp._id, 'Rejected')}
                              className="p-1 rounded-md text-rose-600 hover:bg-rose-50 transition"
                              title="Reject Expense"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDeleteExpense(exp._id, exp.title)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Expense"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Expense Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Log Society Expense"
        subtitle="Record vendor bill with category and optional invoice photo"
      >
        <form onSubmit={handleLogExpense} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Expense Item Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. DJ Sound Setup for Navratri / Lift Motor Oil"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Amount (₹) *
              </label>
              <input
                type="number"
                min={1}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 8500"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white transition"
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Linked Event / Fund
            </label>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white transition"
            >
              <option value="">General Society Maintenance</option>
              {events.map((ev) => (
                <option key={ev._id} value={ev._id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description / Vendor Details (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Vendor name, bill number, items breakdown..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
            />
          </div>

          {/* Receipt Image File Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Upload Bill / Receipt Photo (Optional)
            </label>
            <div className="border-2 border-dashed border-slate-200 hover:border-sky-400 rounded-2xl p-4 text-center transition cursor-pointer relative bg-slate-50/50">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              {receiptPreview ? (
                <div className="flex items-center justify-center gap-3">
                  <img
                    src={receiptPreview}
                    alt="Receipt preview"
                    className="w-16 h-16 object-cover rounded-xl border"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    File selected (Click to change)
                  </span>
                </div>
              ) : (
                <div className="space-y-1">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-600 font-medium">
                    Click to select bill image (PNG, JPG)
                  </p>
                </div>
              )}
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
              Save Expense Voucher
            </button>
          </div>
        </form>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        isOpen={Boolean(viewImageUrl)}
        onClose={() => setViewImageUrl(null)}
        title="Receipt Photo"
        subtitle="Original invoice uploaded by committee"
        maxWidth="max-w-2xl"
      >
        <div className="flex items-center justify-center p-2 bg-slate-900 rounded-2xl overflow-hidden">
          {viewImageUrl && (
            <img
              src={viewImageUrl}
              alt="Full Receipt"
              className="max-h-[70vh] object-contain rounded-lg"
            />
          )}
        </div>
      </Modal>
    </div>
  );
};
