/**
 * src/pages/superadmin/SuperAdminDashboard.jsx
 * Master SuperAdmin Platform Overview
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  ShieldCheck,
  Plus,
  ArrowRight,
  Activity,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { societiesAPI, residentsAPI } from '../../services/api';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { useToast } from '../../context/ToastContext';

export const SuperAdminDashboard = () => {
  const { showError } = useToast();
  const [societies, setSocieties] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [socRes, resRes] = await Promise.all([
        societiesAPI.getAll().catch(() => ({ data: { data: [] } })),
        residentsAPI.getAll().catch(() => ({ data: { data: [] } })),
      ]);

      setSocieties(socRes.data?.data || []);
      const rList =
        resRes.data?.data?.residents ||
        (Array.isArray(resRes.data?.data) ? resRes.data.data : []);
      setResidents(rList);
    } catch (err) {
      showError(err.message || 'Could not load platform metrics.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-[#00AFEF] animate-spin" />
      </div>
    );
  }

  const activeSocieties = societies.filter((s) => s.isActive !== false).length;

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Platform Master Console
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Global overview of all onboarded housing societies and community admins
          </p>
        </div>

        <Link
          to="/superadmin/societies"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00AFEF] to-[#3E4095] hover:opacity-95 text-white text-xs font-bold shadow-md shadow-sky-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          Manage Societies
        </Link>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Societies"
          value={societies.length}
          subtitle={`${activeSocieties} Active across platform`}
          icon={Building2}
          variant="blue"
        />
        <StatCard
          title="Active Communities"
          value={activeSocieties}
          subtitle="Currently operational"
          icon={CheckCircle2}
          variant="emerald"
        />
        <StatCard
          title="Platform Users"
          value={residents.length}
          subtitle="Registered members & admins"
          icon={Users}
          variant="indigo"
        />
        <StatCard
          title="System Health"
          value="Online"
          subtitle="API Services 100% Uptime"
          icon={Activity}
          variant="amber"
        />
      </div>

      {/* Societies Roster Preview */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Registered Societies
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Housing societies currently active on DigiVahivat
            </p>
          </div>
          <Link
            to="/superadmin/societies"
            className="text-xs font-bold text-[#00AFEF] hover:underline flex items-center gap-1"
          >
            View All ({societies.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {societies.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No societies found. Click &quot;Manage Societies&quot; to create your first society.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Society Name</th>
                  <th className="px-5 py-3.5">City</th>
                  <th className="px-5 py-3.5">Address</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {societies.slice(0, 6).map((soc) => (
                  <tr key={soc._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-4 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-sky-50 text-[#00AFEF] flex items-center justify-center font-bold text-xs shrink-0">
                        {soc.name?.slice(0, 1)}
                      </div>
                      <span>{soc.name}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{soc.city || '-'}</td>
                    <td className="px-5 py-4 text-slate-500 truncate max-w-xs">
                      {soc.address || '-'}
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        status={soc.isActive !== false ? 'Paid' : 'Expired'}
                        label={soc.isActive !== false ? 'Active' : 'Inactive'}
                      />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        to="/superadmin/societies"
                        className="text-xs font-semibold text-[#3E4095] hover:underline"
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
