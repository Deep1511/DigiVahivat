/**
 * src/components/SosTriggerModal.jsx
 * Resident / Admin Emergency Crisis Trigger Modal
 */
import React, { useState } from 'react';
import {
  HeartPulse,
  Flame,
  ArrowUpDown,
  ShieldAlert,
  AlertTriangle,
  PhoneCall,
  Radio,
  Loader2,
} from 'lucide-react';
import { Modal } from './Modal';
import { SOS_TYPES, EMERGENCY_CONTACTS } from '../constants';
import { sosAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

const ICON_MAP = {
  HeartPulse,
  Flame,
  ArrowDownUp: ArrowUpDown,
  ShieldAlert,
  AlertTriangle,
};

export const SosTriggerModal = ({ isOpen, onClose, onSuccess }) => {
  const { showSuccess, showError } = useToast();
  const [selectedType, setSelectedType] = useState('Medical');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrigger = async () => {
    setLoading(true);
    try {
      await sosAPI.trigger({
        type: selectedType,
        notes: notes.trim() || undefined,
      });
      showSuccess(
        'Emergency SOS Broadcasted! Security and community committee have been alerted.',
        'SOS ACTIVATED'
      );
      setNotes('');
      onClose();
      onSuccess?.();
    } catch (err) {
      showError(err.message || 'Failed to broadcast SOS. Call emergency numbers directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Broadcast Society Emergency SOS"
      subtitle="Instantly alert security guard, committee members, and residents of your society"
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        {/* Warning Banner */}
        <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl flex items-start gap-3 text-red-800 text-xs leading-relaxed">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">CRITICAL NOTICE:</span> Use this only for genuine crises. An urgent alert with your flat number and contact details will immediately trigger sirens for security and management.
          </div>
        </div>

        {/* SOS Type Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Select Nature of Crisis
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {SOS_TYPES.map((type) => {
              const IconComp = ICON_MAP[type.icon] || AlertTriangle;
              const isSelected = selectedType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSelectedType(type.id)}
                  className={`p-3 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                    isSelected
                      ? 'border-red-500 bg-red-50/70 ring-2 ring-red-400 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg shrink-0 ${
                      isSelected ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h5
                      className={`text-sm font-bold ${
                        isSelected ? 'text-red-950' : 'text-slate-800'
                      }`}
                    >
                      {type.label}
                    </h5>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug line-clamp-1">
                      {type.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional details */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Additional Details / Location (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Block B, 4th floor corridor, severe chest pain"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
          />
        </div>

        {/* Trigger Button */}
        <button
          onClick={handleTrigger}
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 transition disabled:opacity-75 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Radio className="w-5 h-5 animate-pulse" />
              BROADCAST SOS ALERT NOW
            </>
          )}
        </button>

        {/* Direct Emergency Dials */}
        <div className="pt-4 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Emergency Hotlines (Direct Dial)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {EMERGENCY_CONTACTS.map((c) => (
              <a
                key={c.number}
                href={`tel:${c.number}`}
                className="p-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 flex items-center justify-between text-xs transition"
              >
                <div>
                  <span className="font-extrabold text-slate-900 block">{c.number}</span>
                  <span className="text-[10px] text-slate-500 truncate block">{c.name}</span>
                </div>
                <PhoneCall className="w-3.5 h-3.5 text-red-600" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
