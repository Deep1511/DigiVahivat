/**
 * src/pages/superadmin/SocietiesManagement.jsx
 * SuperAdmin Society & Admin Creation & Management Console
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  ShieldCheck,
  Users,
  MapPin,
  CheckCircle2,
  XCircle,
  Loader2,
  UserPlus,
} from 'lucide-react';
import { societiesAPI, residentsAPI } from '../../services/api';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import { useToast } from '../../context/ToastContext';

export const SocietiesManagement = () => {
  const { showSuccess, showError } = useToast();
  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Society Add/Edit Modal
  const [socModalOpen, setSocModalOpen] = useState(false);
  const [editingSoc, setEditingSoc] = useState(null);
  const [socName, setSocName] = useState('');
  const [socCity, setSocCity] = useState('');
  const [socAddress, setSocAddress] = useState('');
  const [socActive, setSocActive] = useState(true);
  const [savingSoc, setSavingSoc] = useState(false);

  // Society Admins Modal
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [selectedSoc, setSelectedSoc] = useState(null);
  const [adminsList, setAdminsList] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  // Add Admin form inside Admins Modal
  const [showAddAdminForm, setShowAddAdminForm] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('Admin@1234');
  const [adminFlat, setAdminFlat] = useState('');
  const [savingAdmin, setSavingAdmin] = useState(false);

  const fetchSocieties = useCallback(async () => {
    try {
      const res = await societiesAPI.getAll();
      setSocieties(res.data?.data || []);
    } catch (err) {
      showError(err.message || 'Failed to fetch societies.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchSocieties();
  }, [fetchSocieties]);

  const handleOpenAddSoc = () => {
    setEditingSoc(null);
    setSocName('');
    setSocCity('');
    setSocAddress('');
    setSocActive(true);
    setSocModalOpen(true);
  };

  const handleOpenEditSoc = (soc) => {
    setEditingSoc(soc);
    setSocName(soc.name);
    setSocCity(soc.city || '');
    setSocAddress(soc.address || '');
    setSocActive(soc.isActive !== false);
    setSocModalOpen(true);
  };

  const handleSaveSociety = async (e) => {
    e.preventDefault();
    if (!socName.trim()) {
      showError('Please enter a society name.');
      return;
    }

    setSavingSoc(true);
    try {
      const payload = {
        name: socName.trim(),
        city: socCity.trim() || undefined,
        address: socAddress.trim() || undefined,
        isActive: socActive,
      };

      if (editingSoc) {
        await societiesAPI.update(editingSoc._id, payload);
        showSuccess('Society updated successfully!');
      } else {
        await societiesAPI.create(payload);
        showSuccess('New society created successfully!');
      }
      setSocModalOpen(false);
      fetchSocieties();
    } catch (err) {
      showError(err.message || 'Failed to save society.');
    } finally {
      setSavingSoc(false);
    }
  };

  const handleDeleteSociety = async (id, name) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await societiesAPI.remove(id);
      showSuccess(`Society "${name}" deleted.`);
      fetchSocieties();
    } catch (err) {
      showError(err.message || 'Failed to delete society.');
    }
  };

  // ─── ADMIN MANAGEMENT FOR SOCIETY ─────────────────────────────
  const handleOpenAdminsModal = async (soc) => {
    setSelectedSoc(soc);
    setAdminModalOpen(true);
    setShowAddAdminForm(false);
    setLoadingAdmins(true);
    try {
      const res = await societiesAPI.getAdmins(soc._id);
      setAdminsList(res.data?.data || []);
    } catch (err) {
      showError(err.message || 'Could not fetch admins for this society.');
    } finally {
      setLoadingAdmins(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!adminPhone || adminPhone.length !== 10) {
      showError('Enter a valid 10-digit mobile number.');
      return;
    }

    setSavingAdmin(true);
    try {
      await residentsAPI.add({
        societyId: selectedSoc._id,
        name: adminName.trim(),
        phone: adminPhone.trim(),
        password: adminPassword.trim(),
        houseOrFlatNo: adminFlat.trim() || undefined,
        totalMembers: 1,
        role: 'Admin',
      });

      showSuccess(`Admin ${adminName} assigned to ${selectedSoc.name}!`);
      setAdminName('');
      setAdminPhone('');
      setAdminFlat('');
      setShowAddAdminForm(false);

      // Refresh admins list
      const res = await societiesAPI.getAdmins(selectedSoc._id);
      setAdminsList(res.data?.data || []);
    } catch (err) {
      showError(err.message || 'Failed to assign admin.');
    } finally {
      setSavingAdmin(false);
    }
  };

  const filteredSocieties = societies.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.city?.toLowerCase().includes(search.toLowerCase()) ||
      s.address?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Societies Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create societies, update details, and provision management committee admins
          </p>
        </div>

        <button
          onClick={handleOpenAddSoc}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00AFEF] to-[#3E4095] hover:opacity-95 text-white text-xs font-bold shadow-md shadow-sky-500/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add New Society
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by society name, city, address..."
          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white transition shadow-2xs"
        />
      </div>

      {/* Societies List Cards / Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-[#00AFEF] animate-spin mx-auto" />
          </div>
        ) : filteredSocieties.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-2">
            <Building2 className="w-8 h-8 mx-auto text-slate-300" />
            <p>No societies found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Society Name</th>
                  <th className="px-5 py-3.5">City / Region</th>
                  <th className="px-5 py-3.5">Address</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-center">Admins</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSocieties.map((soc) => (
                  <tr key={soc._id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#00AFEF] flex items-center justify-center font-bold text-xs shrink-0">
                          {soc.name?.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="block text-sm">{soc.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ID: {soc._id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600 font-medium">
                      {soc.city || '-'}
                    </td>
                    <td className="px-5 py-4 text-slate-500 truncate max-w-xs">
                      {soc.address || '-'}
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        status={soc.isActive !== false ? 'Paid' : 'Expired'}
                        label={soc.isActive !== false ? 'Active' : 'Inactive'}
                      />
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => handleOpenAdminsModal(soc)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-[#3E4095] text-[11px] font-bold transition cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Manage Admins
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditSoc(soc)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                          title="Edit Society"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSociety(soc._id, soc.name)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
                          title="Delete Society"
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

      {/* Create / Edit Society Modal */}
      <Modal
        isOpen={socModalOpen}
        onClose={() => setSocModalOpen(false)}
        title={editingSoc ? 'Edit Society' : 'Create New Society'}
        subtitle="Manage society master details and address"
      >
        <form onSubmit={handleSaveSociety} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Society Name *
            </label>
            <input
              type="text"
              required
              value={socName}
              onChange={(e) => setSocName(e.target.value)}
              placeholder="e.g. Shivalik Heights / Gokuldham Society"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              City
            </label>
            <input
              type="text"
              value={socCity}
              onChange={(e) => setSocCity(e.target.value)}
              placeholder="e.g. Ahmedabad / Surat / Vadodara"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Address / Landmark
            </label>
            <textarea
              rows={3}
              value={socAddress}
              onChange={(e) => setSocAddress(e.target.value)}
              placeholder="e.g. Near Science City, S.G. Highway"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
            />
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            <input
              type="checkbox"
              id="socActive"
              checked={socActive}
              onChange={(e) => setSocActive(e.target.checked)}
              className="w-4 h-4 rounded text-[#00AFEF] focus:ring-sky-500"
            />
            <label htmlFor="socActive" className="text-xs font-semibold text-slate-700">
              Active Society on DigiVahivat
            </label>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setSocModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingSoc}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#00AFEF] to-[#3E4095] text-white text-xs font-bold shadow-sm transition disabled:opacity-75 flex items-center gap-1.5"
            >
              {savingSoc && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {editingSoc ? 'Save Changes' : 'Create Society'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Society Admins Management Modal */}
      <Modal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        title={`Admins for ${selectedSoc?.name || 'Society'}`}
        subtitle="View existing administrators or provision new committee admins"
        maxWidth="max-w-xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Current Society Administrators
            </h4>
            <button
              onClick={() => setShowAddAdminForm(!showAddAdminForm)}
              className="px-3 py-1.5 rounded-lg bg-[#00AFEF] hover:bg-[#0090C8] text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              {showAddAdminForm ? 'Close Form' : 'Assign New Admin'}
            </button>
          </div>

          {/* Add Admin Form */}
          {showAddAdminForm && (
            <form
              onSubmit={handleAddAdmin}
              className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 animate-in fade-in"
            >
              <h5 className="text-xs font-bold text-slate-800">
                Provision New Committee Administrator
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                    Admin Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="e.g. Secretary Name"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                    Phone (10 digits) *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                    Flat / House No (Optional)
                  </label>
                  <input
                    type="text"
                    value={adminFlat}
                    onChange={(e) => setAdminFlat(e.target.value)}
                    placeholder="e.g. Block A-101"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                    Default Password *
                  </label>
                  <input
                    type="text"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingAdmin}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-[#00AFEF] to-[#3E4095] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                {savingAdmin && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm & Create Admin Account
              </button>
            </form>
          )}

          {/* List of Admins */}
          {loadingAdmins ? (
            <div className="py-8 text-center">
              <Loader2 className="w-6 h-6 text-[#00AFEF] animate-spin mx-auto" />
            </div>
          ) : adminsList.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
              No administrator accounts assigned yet. Click &quot;Assign New Admin&quot; above.
            </div>
          ) : (
            <div className="space-y-2">
              {adminsList.map((adm) => (
                <div
                  key={adm._id}
                  className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-50 text-[#3E4095] flex items-center justify-center font-bold text-xs">
                      {adm.name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs">
                        {adm.name}
                      </h5>
                      <p className="text-[11px] text-slate-500 font-mono">
                        +91 {adm.phone} {adm.houseOrFlatNo ? `• Flat ${adm.houseOrFlatNo}` : ''}
                      </p>
                    </div>
                  </div>
                  <Badge status="Admin" />
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
