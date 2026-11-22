/**
 * src/components/ActiveSosBanner.jsx
 * Urgent Top Emergency SOS Banner for DigiVahivat Web
 */
import React, { useState, useEffect, useCallback } from 'react';
import { AlertOctagon, CheckCircle2, PhoneCall, ChevronRight } from 'lucide-react';
import { sosAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const ActiveSosBanner = ({ onOpenCrisisConsole }) => {
  const { user, isAdmin, isGuard } = useAuth();
  const { showSuccess, showError } = useToast();
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchActive = useCallback(async () => {
    if (!user) return;
    try {
      const res = await sosAPI.getActive();
      setActiveAlerts(res.data?.data || []);
    } catch {
      // Fail silently to avoid interrupting UI
    }
  }, [user]);

  useEffect(() => {
    fetchActive();
    // Poll every 8 seconds for real-time emergency sync
    const timer = setInterval(fetchActive, 8000);
    return () => clearInterval(timer);
  }, [fetchActive]);

  if (activeAlerts.length === 0) return null;

  const current = activeAlerts[0];
  const count = activeAlerts.length;

  const handleAcknowledge = async (id) => {
    setLoading(true);
    try {
      await sosAPI.acknowledge(id);
      showSuccess('Response acknowledged! Gate and community notified.');
      fetchActive();
    } catch (err) {
      showError(err.message || 'Failed to acknowledge SOS.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-4 py-3 shadow-lg sos-pulse sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 animate-bounce">
            <AlertOctagon className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wide uppercase text-xs bg-white text-red-600 px-2 py-0.5 rounded-full shadow-sm">
                ACTIVE SOS ({count})
              </span>
              <h4 className="text-sm font-bold tracking-tight">
                {current.type || 'Emergency Alert'}
                {current.residentId?.houseOrFlatNo && (
                  <> in Flat <span className="underline decoration-white/60">{current.residentId.houseOrFlatNo}</span></>
                )}
              </h4>
            </div>
            <p className="text-xs text-white/90 mt-0.5">
              Triggered by{' '}
              <span className="font-semibold">
                {current.residentId?.name || 'Resident'}
              </span>{' '}
              ({current.residentId?.phone || ''}) • {current.notes || 'Immediate help requested'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {current.residentId?.phone && (
            <a
              href={`tel:${current.residentId.phone}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-sm transition"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Call Flat
            </a>
          )}

          {(isAdmin || isGuard) && current.status === 'Active' && (
            <button
              onClick={() => handleAcknowledge(current._id)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-red-700 hover:bg-red-50 text-xs font-bold shadow-sm transition disabled:opacity-75"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Acknowledge & Respond
            </button>
          )}

          {onOpenCrisisConsole && (
            <button
              onClick={onOpenCrisisConsole}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-black/20 hover:bg-black/30 text-white text-xs font-semibold transition"
            >
              View All
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
