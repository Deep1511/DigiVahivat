/**
 * src/pages/admin/CollectFalo.jsx
 * Admin Payment Collection Form with Interactive Resident Picker & Receipt Generator
 */
import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  CreditCard,
  User,
  Calendar,
  CheckCircle,
  Search,
  Receipt,
  FileText,
  DollarSign,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { residentsAPI, eventsAPI, contributionsAPI } from '../../services/api';
import { PdfReceiptModal } from '../../components/PdfReceiptModal';
import { fmtCurrency, getEventStatus } from '../../constants';
import { useToast } from '../../context/ToastContext';

export const CollectFalo = () => {
  const { showSuccess, showError } = useToast();

  const [residents, setResidents] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [contributionType, setContributionType] = useState('Event'); // 'Event' | 'Annual'
  const [selectedEventId, setSelectedEventId] = useState('');
  const [annualYear, setAnnualYear] = useState(new Date().getFullYear());
  const [selectedResidentId, setSelectedResidentId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash'); // 'Cash' | 'UPI'
  const [transactionId, setTransactionId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('Paid');
  const [notes, setNotes] = useState('');
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Search filter for resident picker
  const [residentSearch, setResidentSearch] = useState('');

  // Generated receipt preview
  const [createdReceipt, setCreatedReceipt] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [rRes, eRes] = await Promise.all([
          residentsAPI.getAll(),
          eventsAPI.getAll(),
        ]);
        const rList = rRes.data?.data?.residents || [];
        setResidents(rList);

        const eList = eRes.data?.data || [];
        setEvents(eList);

        // Auto-select active event
        const active = eList.find((e) => getEventStatus(e) === 'active') || eList[0];
        if (active) {
          setSelectedEventId(active._id);
          if (active.perHouseAmount > 0) {
            setAmount(String(active.perHouseAmount));
          }
        }
      } catch (err) {
        showError(err.message || 'Could not load residents or events.');
      } finally {
        setLoading(false);
      }
    })();
  }, [showError]);

  const handleEventChange = (eId) => {
    setSelectedEventId(eId);
    const ev = events.find((item) => item._id === eId);
    if (ev && ev.perHouseAmount > 0) {
      setAmount(String(ev.perHouseAmount));
    }
  };

  const filteredResidents = useMemo(() => {
    if (!residentSearch.trim()) return residents;
    const q = residentSearch.toLowerCase();
    return residents.filter(
      (r) =>
        r.name?.toLowerCase().includes(q) ||
        r.houseOrFlatNo?.toLowerCase().includes(q) ||
        r.phone?.includes(q)
    );
  }, [residents, residentSearch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedResidentId) {
      showError('Please select a resident / flat member.');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      showError('Please enter a valid contribution amount.');
      return;
    }
    if (contributionType === 'Event' && !selectedEventId) {
      showError('Please select an event for this payment.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        contributionType,
        residentId: selectedResidentId,
        amount: Number(amount),
        paymentMode,
        paymentStatus,
        transactionId: paymentMode === 'UPI' ? transactionId.trim() || undefined : undefined,
        notes: notes.trim() || undefined,
        date: paymentDate || undefined,
        ...(contributionType === 'Event' ? { eventId: selectedEventId } : { annualYear: Number(annualYear) }),
      };

      const res = await contributionsAPI.record(payload);
      const newContribution = res.data?.data || res.data;

      // Celebrate with confetti
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });

      showSuccess('Payment recorded & verified successfully!');

      // Populate populated objects for receipt modal
      const residentObj = residents.find((r) => r._id === selectedResidentId);
      const eventObj = events.find((ev) => ev._id === selectedEventId);

      setCreatedReceipt({
        ...newContribution,
        residentId: residentObj || newContribution.residentId,
        eventId: eventObj || newContribution.eventId,
      });
      setShowReceiptModal(true);

      // Reset transaction id & notes
      setTransactionId('');
      setNotes('');
    } catch (err) {
      showError(err.message || 'Failed to record contribution.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Collect Falo (Contribution)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Record resident payments for society events, festivals, or annual maintenance
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contribution Type Toggle */}
          <div className="p-1 bg-slate-100 rounded-xl flex max-w-sm">
            <button
              type="button"
              onClick={() => setContributionType('Event')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${contributionType === 'Event'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              Event / Festival Falo
            </button>
            <button
              type="button"
              onClick={() => setContributionType('Annual')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${contributionType === 'Annual'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              Annual Maintenance
            </button>
          </div>

          {/* Event or Year Selector */}
          {contributionType === 'Event' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Society Event *
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => handleEventChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white transition"
              >
                {events.map((ev) => (
                  <option key={ev._id} value={ev._id}>
                    {ev.title} (Quota: {fmtCurrency(ev.perHouseAmount)})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Maintenance Year *
              </label>
              <select
                value={annualYear}
                onChange={(e) => setAnnualYear(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white transition"
              >
                {[2026, 2025, 2024, 2023].map((yr) => (
                  <option key={yr} value={yr}>
                    Year {yr}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Resident Picker with Instant Search */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Resident / Flat Member *
            </label>
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={residentSearch}
                  onChange={(e) => setResidentSearch(e.target.value)}
                  placeholder="Filter by resident name, flat number, or phone..."
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <select
                required
                size={5}
                value={selectedResidentId}
                onChange={(e) => setSelectedResidentId(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white transition font-medium"
              >
                {filteredResidents.map((r) => (
                  <option
                    key={r._id}
                    value={r._id}
                    className="p-2 hover:bg-sky-50 rounded-lg cursor-pointer"
                  >
                    {r.houseOrFlatNo ? `Flat ${r.houseOrFlatNo} — ` : ''}{r.name} (Phone: {r.phone})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Amount Received (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  min={1}
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 2500"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Payment Date
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Payment Mode & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Payment Mode
              </label>
              <div className="flex gap-2">
                {['Cash', 'UPI'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPaymentMode(mode)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${paymentMode === mode
                      ? 'border-sky-500 bg-sky-50 text-[#00AFEF]'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white transition font-medium"
              >
                <option value="Paid">Paid (Full)</option>
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
              </select>
            </div>
          </div>

          {/* Conditional UPI Reference */}
          {paymentMode === 'UPI' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                UPI Reference / UTR Number (Optional)
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g. 329182910291"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Remarks / Cheque No. (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Paid in cash at society office"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00AFEF] to-[#3E4095] hover:opacity-95 text-white font-extrabold text-sm shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 transition disabled:opacity-75 cursor-pointer"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Receipt className="w-5 h-5" />
                Record Payment & Generate Official Receipt
              </>
            )}
          </button>
        </form>
      </div>

      {/* Generated Receipt Viewer */}
      <PdfReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        contribution={createdReceipt}
      />
    </div>
  );
};
