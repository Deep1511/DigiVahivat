/**
 * src/pages/admin/ResidentsRoster.jsx
 * Society Resident Directory & Flat Member Roster
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Home,
  Shield,
  Loader2,
  KeyRound,
} from 'lucide-react';
import { residentsAPI } from '../../services/api';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import { StatCard } from '../../components/StatCard';
import { useToast } from '../../context/ToastContext';

export const ResidentsRoster = () => {
  const { showSuccess, showError } = useToast();
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add/Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('User@1234');
  const [houseOrFlatNo, setHouseOrFlatNo] = useState('');
  const [totalMembers, setTotalMembers] = useState(1);
  const [role, setRole] = useState('Resident');
  const [submitting, setSubmitting] = useState(false);

  const fetchResidents = useCallback(async () => {
    try {
      const res = await residentsAPI.getAll();
      setResidents(res.data?.data?.residents || []);
    } catch (err) {
      showError(err.message || 'Could not fetch residents directory.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchResidents();
  }, [fetchResidents]);

  const handleOpenAdd = () => {
    setEditingResident(null);
    setName('');
    setPhone('');
    setPassword('User@1234');
    setHouseOrFlatNo('');
    setTotalMembers(1);
    setRole('Resident');
    setModalOpen(true);
  };

  const handleOpenEdit = (r) => {
    setEditingResident(r);
    setName(r.name);
    setPhone(r.phone);
    setPassword('');
    setHouseOrFlatNo(r.houseOrFlatNo || '');
    setTotalMembers(r.totalMembers || 1);
    setRole(r.role || 'Resident');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!phone || phone.length !== 10) {
      showError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        houseOrFlatNo: houseOrFlatNo.trim() || undefined,
        totalMembers: Number(totalMembers) || 1,
        role,
      };

      if (!editingResident) {
        payload.password = password.trim() || 'User@1234';
        await residentsAPI.add(payload);
        showSuccess(`Member ${name} enrolled successfully!`);
      } else {
        if (password.trim()) payload.password = password.trim();
        await residentsAPI.update(editingResident._id, payload);
        showSuccess(`Resident ${name} updated successfully!`);
      }

      setModalOpen(false);
      fetchResidents();
    } catch (err) {
      showError(err.message || 'Failed to save resident record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, memberName) => {
    if (!window.confirm(`Remove resident "${memberName}" from society directory?`)) {
      return;
    }
    try {
      await residentsAPI.remove(id);
      showSuccess('Resident removed.');
      fetchResidents();
    } catch (err) {
      showError(err.message || 'Failed to delete resident.');
    }
  };

  const totalMembersSum = residents.reduce((sum, r) => sum + (r.totalMembers || 1), 0);
  const guardCount = residents.filter((r) => r.role === 'Guard' || r.role === 'Gaurd').length;

  const filtered = residents.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.name?.toLowerCase().includes(q) ||
      r.houseOrFlatNo?.toLowerCase().includes(q) ||
      r.phone?.includes(q) ||
      r.role?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Society Resident Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage flat owners, family members, committee admins, and security guards
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00AFEF] to-[#3E4095] hover:opacity-95 text-white text-xs font-bold shadow-md shadow-sky-500/20 transition cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Flats / Units"
          value={residents.length}
          subtitle="Enrolled residences"
          icon={Home}
          variant="blue"
        />
        <StatCard
          title="Total Population"
          value={totalMembersSum}
          subtitle="Family members living in society"
          icon={Users}
          variant="indigo"
        />
        <StatCard
          title="Security Gate Staff"
          value={guardCount}
          subtitle="Enrolled guards with gate access"
          icon={Shield}
          variant="amber"
        />
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by flat, resident name, mobile, role..."
          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs"
        />
      </div>

      {/* Residents Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-[#00AFEF] animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs">
            No residents found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Flat Number</th>
                  <th className="px-5 py-3.5">Resident Name</th>
                  <th className="px-5 py-3.5">Phone Number</th>
                  <th className="px-5 py-3.5">Family Members</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3.5 font-extrabold text-[#3E4095] text-sm">
                      {r.houseOrFlatNo ? `Flat ${r.houseOrFlatNo}` : '-'}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-sky-50 text-[#00AFEF] flex items-center justify-center font-bold text-xs shrink-0">
                          {r.name?.slice(0, 2).toUpperCase()}
                        </div>
                        <span>{r.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 font-mono">
                      +91 {r.phone}
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 font-semibold">
                      {r.totalMembers || 1} Member(s)
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge status={r.role || 'Resident'} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(r)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                          title="Edit Resident"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(r._id, r.name)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
                          title="Remove Resident"
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

      {/* Add / Edit Resident Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingResident ? 'Edit Resident Details' : 'Add New Member to Society'}
        subtitle="Manage flat owner, contact, family size, and portal permissions"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Patel"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mobile Number (10 digits) *
              </label>
              <input
                type="tel"
                required
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="9876543210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Flat / House No (Optional)
              </label>
              <input
                type="text"
                value={houseOrFlatNo}
                onChange={(e) => setHouseOrFlatNo(e.target.value.toUpperCase())}
                placeholder="e.g. A-402"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none uppercase font-bold transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Total Family Members
              </label>
              <input
                type="number"
                min={1}
                max={30}
                required
                value={totalMembers}
                onChange={(e) => setTotalMembers(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Portal Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white transition font-medium"
              >
                <option value="Resident">Resident Member</option>
                <option value="Admin">Society Committee Admin</option>
                <option value="Guard">Security Gate Guard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {editingResident ? 'Update Password (leave empty to keep current)' : 'Password *'}
            </label>
            <input
              type="text"
              required={!editingResident}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="e.g. User@1234"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono transition"
            />
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
              {editingResident ? 'Save Resident' : 'Enrol Resident'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
