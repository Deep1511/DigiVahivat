/**
 * src/components/PreApproveVisitorModal.jsx
 * Pre-Approve Visitor / Gate Pass Creation Modal with QR & 6-Digit Passcode
 */
import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ShieldCheck,
  Share2,
  Copy,
  Check,
  User,
  Phone,
  Car,
  Users,
  Calendar,
  Loader2,
} from 'lucide-react';
import { Modal } from './Modal';
import { visitorsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

export const PreApproveVisitorModal = ({ isOpen, onClose, onSuccess }) => {
  const { showSuccess, showError } = useToast();
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [purpose, setPurpose] = useState('Guest / Family');
  const [membersCount, setMembersCount] = useState(1);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [expectedDate, setExpectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(false);
  const [createdPass, setCreatedPass] = useState(null);
  const [copied, setCopied] = useState(false);

  const resetForm = () => {
    setVisitorName('');
    setVisitorPhone('');
    setPurpose('Guest / Family');
    setMembersCount(1);
    setVehicleNumber('');
    setExpectedDate(new Date().toISOString().split('T')[0]);
    setCreatedPass(null);
    setCopied(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!visitorName.trim()) {
      showError('Please enter visitor name.');
      return;
    }

    setLoading(true);
    try {
      const res = await visitorsAPI.preApprove({
        visitorName: visitorName.trim(),
        visitorPhone: visitorPhone.trim() || undefined,
        purpose,
        membersCount: Number(membersCount) || 1,
        vehicleNumber: vehicleNumber.trim() || undefined,
        expectedDate: expectedDate || undefined,
      });

      const passData = res.data?.data || res.data;
      setCreatedPass(passData);
      showSuccess('Visitor gate pass generated successfully!');
      onSuccess?.();
    } catch (err) {
      showError(err.message || 'Failed to create visitor pass.');
    } finally {
      setLoading(false);
    }
  };

  const passUrl = createdPass
    ? `${window.location.origin}/pass/${createdPass._id}`
    : '';

  const handleCopyLink = () => {
    if (!passUrl) return;
    navigator.clipboard.writeText(passUrl);
    setCopied(true);
    showSuccess('Pass link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    if (!createdPass) return;
    const text = encodeURIComponent(
      `Hello ${createdPass.visitorName},\nHere is your Gate Pass for entry:\n\nPasscode: ${createdPass.passCode}\nView QR Pass: ${passUrl}\n\nPlease show this code to the security guard at the gate.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={createdPass ? 'Visitor Gate Pass Ready' : 'Pre-Approve Visitor / Guest'}
      subtitle={
        createdPass
          ? 'Share this digital pass and 6-digit code with your visitor'
          : 'Allow quick gate entry for your guests, deliveries, or cabs'
      }
      maxWidth="max-w-lg"
    >
      {createdPass ? (
        <div className="space-y-6 text-center py-2">
          {/* 6-digit code display */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-50 to-indigo-50 border border-sky-200">
            <span className="text-xs font-bold text-sky-800 uppercase tracking-widest block">
              6-Digit Gate Entry Code
            </span>
            <div className="text-4xl font-extrabold text-[#3E4095] tracking-[0.25em] my-2 select-all font-mono">
              {createdPass.passCode}
            </div>
            <p className="text-xs text-slate-500">
              Visitor can simply tell this code to the security guard
            </p>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <QRCodeSVG value={passUrl} size={160} level="M" />
            <span className="text-[11px] text-slate-400 mt-2 font-medium">
              Scan at Gate Console for instant check-in
            </span>
          </div>

          {/* Visitor Details Pill */}
          <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 flex justify-between items-center text-left">
            <div>
              <span className="font-bold text-slate-900 block">
                {createdPass.visitorName} ({createdPass.membersCount || 1} guest)
              </span>
              <span className="text-slate-500">
                Purpose: {createdPass.purpose || 'Visit'}
              </span>
            </div>
            {createdPass.vehicleNumber && (
              <span className="bg-white px-2.5 py-1 rounded-md border text-slate-700 font-mono font-bold">
                {createdPass.vehicleNumber}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={handleShareWhatsApp}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              Share on WhatsApp
            </button>
            <button
              onClick={handleCopyLink}
              className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Visitor / Guest Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                placeholder="e.g. Ramesh Bhai / Swiggy Delivery"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  maxLength={10}
                  value={visitorPhone}
                  onChange={(e) => setVisitorPhone(e.target.value)}
                  placeholder="10-digit mobile"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Purpose
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white transition"
              >
                <option value="Guest / Family">Guest / Family</option>
                <option value="Delivery / Courier">Delivery / Courier</option>
                <option value="Cab / Taxi">Cab / Taxi</option>
                <option value="Service / Repair">Service / Repair</option>
                <option value="Maid / Staff">Maid / Daily Staff</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Total Members
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={membersCount}
                  onChange={(e) => setMembersCount(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Vehicle No. (Optional)
              </label>
              <div className="relative">
                <Car className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. GJ 01 AB 1234"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none uppercase font-mono transition"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Expected Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#00AFEF] to-[#3E4095] hover:opacity-95 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition disabled:opacity-75 cursor-pointer mt-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                Generate Pre-Approved Gate Pass
              </>
            )}
          </button>
        </form>
      )}
    </Modal>
  );
};
