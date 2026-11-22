/**
 * src/components/PdfReceiptModal.jsx
 * Printable & Downloadable Digital Receipt Modal for DigiVahivat Web
 */
import React, { useRef } from 'react';
import {
  Printer,
  Download,
  Share2,
  CheckCircle,
  Building2,
  Receipt,
} from 'lucide-react';
import { Modal } from './Modal';
import { fmtCurrency, fmtDate } from '../constants';
import { contributionsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

export const PdfReceiptModal = ({ isOpen, onClose, contribution }) => {
  const { showSuccess, showError } = useToast();
  const printRef = useRef(null);

  if (!contribution) return null;

  const resident = contribution.residentId || {};
  const event = contribution.eventId || {};
  const society = contribution.societyId || resident.societyId || {};

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadApiPdf = async () => {
    try {
      const res = await contributionsAPI.getPdfReceipt(contribution._id);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Receipt_${contribution.receiptNumber || contribution._id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showSuccess('Receipt PDF downloaded successfully!');
    } catch (err) {
      showError(err.message || 'Could not download PDF from server. Using local print instead.');
      window.print();
    }
  };

  const handleShare = () => {
    const text = encodeURIComponent(
      `Official Payment Receipt: ${society.name || 'DigiVahivat'}\nReceipt No: ${
        contribution.receiptNumber || contribution._id
      }\nAmount: ${fmtCurrency(contribution.amount)}\nPaid by: ${
        resident.name
      }${resident.houseOrFlatNo ? ` (Flat ${resident.houseOrFlatNo})` : ''}\nStatus: ${contribution.paymentStatus}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Payment Receipt"
      subtitle="Official Society Contribution & Maintenance Voucher"
      maxWidth="max-w-xl"
    >
      <div className="space-y-6">
        {/* Printable Receipt Paper Container */}
        <div
          ref={printRef}
          id="receipt-print-area"
          className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden"
        >
          {/* Subtle Watermark Badge */}
          <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none select-none">
            <Building2 className="w-48 h-48 text-[#3E4095]" />
          </div>

          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#00AFEF] to-[#3E4095] flex items-center justify-center text-white shadow-sm shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-[#3E4095] tracking-tight">
                  {society.name || 'DigiVahivat Society'}
                </h4>
                <p className="text-xs text-slate-500">
                  {society.address || society.city || 'Digital Vahivat Community'}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle className="w-3 h-3" />
                {contribution.paymentStatus || 'Paid'}
              </span>
              <p className="text-[11px] text-slate-400 font-mono mt-1">
                #{contribution.receiptNumber || String(contribution._id).slice(-8).toUpperCase()}
              </p>
            </div>
          </div>

          {/* Amount Showcase Banner */}
          <div className="my-5 p-4 rounded-xl bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block">
                Total Amount Received
              </span>
              <span className="text-3xl font-extrabold text-[#3E4095]">
                {fmtCurrency(contribution.amount)}
              </span>
            </div>
            <div className="text-right text-xs text-slate-600 font-medium">
              <span className="block text-slate-400 text-[10px] uppercase font-bold">Payment Mode</span>
              <span className="font-bold text-slate-800">{contribution.paymentMode || 'Cash'}</span>
              {contribution.transactionId && (
                <span className="block text-[10px] font-mono text-slate-500 mt-0.5">
                  Ref: {contribution.transactionId}
                </span>
              )}
            </div>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs py-2 border-b border-slate-100">
            <div>
              <span className="text-slate-400 font-medium block">Received From:</span>
              <span className="font-bold text-slate-900 text-sm block mt-0.5">
                {resident.name || 'Member'}
              </span>
              {resident.houseOrFlatNo && (
                <span className="text-slate-500 block">
                  Flat / House: <strong className="text-slate-700">{resident.houseOrFlatNo}</strong>
                </span>
              )}
              {resident.phone && (
                <span className="block text-slate-400 text-[11px]">Phone: {resident.phone}</span>
              )}
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Purpose / Event:</span>
              <span className="font-bold text-slate-900 text-sm block mt-0.5">
                {contribution.contributionType === 'Annual'
                  ? `Annual Maintenance ${contribution.annualYear || new Date().getFullYear()}`
                  : event.title || 'Society Event Falo'}
              </span>
              <span className="text-slate-500">
                Date: <strong className="text-slate-700">{fmtDate(contribution.date || contribution.createdAt)}</strong>
              </span>
            </div>
          </div>

          {/* Notes or remarks */}
          {contribution.notes && (
            <div className="mt-3 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-700">Remarks: </span>
              {contribution.notes}
            </div>
          )}

          {/* Footer & Signature */}
          <div className="mt-6 pt-3 flex items-end justify-between text-[11px] text-slate-400">
            <div>
              <span className="block">Recorded By: {contribution.recordedBy?.name || 'Society Admin'}</span>
              <span className="block text-[10px]">Digitally verified by DigiVahivat ERP</span>
            </div>
            <div className="text-center">
              <div className="w-28 border-b border-slate-300 mb-1" />
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                Authorized Signatory
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap gap-2.5 justify-end">
          <button
            onClick={handleShare}
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-emerald-600" />
            Share WhatsApp
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            Print Receipt
          </button>
          <button
            onClick={handleDownloadApiPdf}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00AFEF] to-[#3E4095] hover:opacity-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download Server PDF
          </button>
        </div>
      </div>
    </Modal>
  );
};
