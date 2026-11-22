/**
 * src/pages/resident/ExpensesFeed.jsx
 * Resident Financial Transparency Feed of Society Expenditures
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Receipt,
  Search,
  Filter,
  Eye,
  Building2,
  Calendar,
  Loader2,
} from 'lucide-react';
import { expensesAPI } from '../../services/api';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import { StatCard } from '../../components/StatCard';
import { fmtCurrency, fmtDate, EXPENSE_CATEGORIES } from '../../constants';
import { useToast } from '../../context/ToastContext';

export const ExpensesFeed = () => {
  const { showError } = useToast();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewImageUrl, setViewImageUrl] = useState(null);

  const fetchExpenses = useCallback(async () => {
    try {
      const res = await expensesAPI.getAll();
      setExpenses(res.data?.data || []);
    } catch (err) {
      showError(err.message || 'Could not fetch expenses.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  const filtered = expenses.filter((e) => {
    if (selectedCategory !== 'All' && e.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Society Expenditure Transparency
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          100% open financial ledger showing all society bills and festival expense receipts
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title="Total Community Spend"
          value={fmtCurrency(totalSpent)}
          subtitle="All festival, repair, and utility expenses"
          icon={Receipt}
          variant="rose"
        />
        <StatCard
          title="Verified Invoices"
          value={expenses.length}
          subtitle="Audited expense vouchers"
          icon={Building2}
          variant="blue"
        />
      </div>

      {/* Categories */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            selectedCategory === 'All'
              ? 'bg-slate-900 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Categories
        </button>
        {EXPENSE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#00AFEF] text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-[#00AFEF] animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs">
            No expenses found in this category.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Expense Item</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Event / Fund</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((e) => (
                  <tr key={e._id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                      {e.title}
                      {e.description && (
                        <span className="block text-xs font-normal text-slate-500 line-clamp-1 mt-0.5">
                          {e.description}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700">
                        {e.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-slate-900 text-sm">
                      {fmtCurrency(e.amount)}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {e.eventId?.title || 'General Society Maintenance'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={e.status || 'Approved'} />
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {fmtDate(e.date || e.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {e.receiptUrl ? (
                        <button
                          onClick={() => setViewImageUrl(e.receiptUrl)}
                          className="px-3 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#00AFEF] font-bold text-xs flex items-center gap-1 transition cursor-pointer ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Receipt
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs">No Bill</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bill View Modal */}
      <Modal
        isOpen={Boolean(viewImageUrl)}
        onClose={() => setViewImageUrl(null)}
        title="Expense Receipt Photo"
        subtitle="Audited invoice uploaded by society committee"
        maxWidth="max-w-2xl"
      >
        <div className="flex items-center justify-center p-2 bg-slate-900 rounded-2xl overflow-hidden">
          {viewImageUrl && (
            <img
              src={viewImageUrl}
              alt="Receipt photo"
              className="max-h-[70vh] object-contain rounded-lg"
            />
          )}
        </div>
      </Modal>
    </div>
  );
};
