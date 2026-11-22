/**
 * src/pages/PublicGatePassPage.jsx
 * Publicly Accessible Digital Visitor Gate Pass (Guest/WhatsApp view)
 */
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  ShieldCheck,
  Building2,
  Calendar,
  User,
  Users,
  Car,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  PhoneCall,
} from 'lucide-react';
import { visitorsAPI } from '../services/api';
import { Badge } from '../components/Badge';
import { fmtDate, fmtDateTime } from '../constants';

export const PublicGatePassPage = () => {
  const { id } = useParams();
  const [pass, setPass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await visitorsAPI.getPublicPass(id);
        setPass(res.data?.data || res.data);
      } catch (err) {
        setError(err.message || 'Visitor pass not found or link has expired.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#00AFEF] animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Verifying gate pass...</p>
        </div>
      </div>
    );
  }

  if (error || !pass) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            Invalid or Expired Pass
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {error || 'This digital gate pass could not be retrieved.'}
          </p>
          <Link
            to="/"
            className="inline-flex px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold transition hover:bg-slate-800"
          >
            Go to DigiVahivat Home
          </Link>
        </div>
      </div>
    );
  }

  const resident = pass.residentId || {};
  const society = pass.societyId || resident.societyId || {};

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 flex flex-col items-center justify-center font-sans selection:bg-sky-500 selection:text-white">
      <div className="max-w-md w-full bg-white rounded-3xl border-2 border-slate-200/90 shadow-2xl overflow-hidden relative">
        {/* Top Header Badge */}
        <div className="bg-gradient-to-r from-[#00AFEF] to-[#3E4095] p-6 text-white text-center relative">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-2 text-white shadow-sm">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-lg font-black tracking-tight">
            {society.name || 'DigiVahivat Community'}
          </h1>
          <p className="text-xs text-white/80 font-medium">
            Pre-Approved Gate Entry Pass
          </p>
          <div className="mt-3">
            <Badge status={pass.status} />
          </div>
        </div>

        {/* 6-Digit Gate Code */}
        <div className="p-6 text-center border-b border-slate-100 bg-slate-50/50">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
            Show Code to Security Guard
          </span>
          <div className="text-4xl font-black text-[#3E4095] tracking-[0.25em] my-1 font-mono select-all">
            {pass.passCode}
          </div>
          <span className="text-xs text-slate-500">
            Valid on {fmtDate(pass.expectedDate || pass.createdAt)}
          </span>
        </div>

        {/* QR Code Section */}
        <div className="p-6 flex flex-col items-center justify-center bg-white">
          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <QRCodeSVG value={window.location.href} size={160} level="H" />
          </div>
          <span className="text-[11px] text-slate-400 mt-2 font-medium">
            Scan at Security Gate Terminal
          </span>
        </div>

        {/* Visitor & Host Info */}
        <div className="p-6 border-t border-slate-100 space-y-3 bg-slate-50/30 text-xs">
          <div className="flex justify-between items-center py-1 border-b border-slate-100">
            <span className="text-slate-400 font-medium">Visitor Name</span>
            <span className="font-extrabold text-slate-900 text-sm">
              {pass.visitorName}
            </span>
          </div>

          {resident.houseOrFlatNo && (
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-400 font-medium">Visiting Flat</span>
              <span className="font-extrabold text-[#00AFEF] text-sm">
                Flat {resident.houseOrFlatNo}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center py-1 border-b border-slate-100">
            <span className="text-slate-400 font-medium">Host Resident</span>
            <span className="font-semibold text-slate-800">
              {resident.name || 'Resident'}
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-100">
            <span className="text-slate-400 font-medium">Purpose</span>
            <span className="font-semibold text-slate-800">
              {pass.purpose || 'Visit'}
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-slate-100">
            <span className="text-slate-400 font-medium">Party Size</span>
            <span className="font-semibold text-slate-800">
              {pass.membersCount || 1} Member(s)
            </span>
          </div>

          {pass.vehicleNumber && (
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-slate-400 font-medium">Vehicle No</span>
              <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                {pass.vehicleNumber}
              </span>
            </div>
          )}

          {pass.checkInTime && (
            <div className="flex justify-between items-center py-1 text-emerald-700 font-medium">
              <span>Entered At</span>
              <span>{fmtDateTime(pass.checkInTime)}</span>
            </div>
          )}

          {pass.checkOutTime && (
            <div className="flex justify-between items-center py-1 text-slate-500 font-medium">
              <span>Exited At</span>
              <span>{fmtDateTime(pass.checkOutTime)}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400">
          Powered by DigiVahivat Gate Pass VMS
        </div>
      </div>
    </div>
  );
};
