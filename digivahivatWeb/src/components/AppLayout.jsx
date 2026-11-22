/**
 * src/components/AppLayout.jsx
 * Unified Application Shell Layout
 */
import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { ActiveSosBanner } from './ActiveSosBanner';
import { SosTriggerModal } from './SosTriggerModal';
import { useAuth } from '../context/AuthContext';

export const AppLayout = () => {
  const { isSuperAdmin, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);

  const handleOpenCrisisConsole = () => {
    if (isSuperAdmin) {
      navigate('/superadmin');
    } else if (isAdmin) {
      navigate('/admin/sos');
    } else {
      navigate('/resident');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Real-time Emergency SOS Top Banner */}
      <ActiveSosBanner onOpenCrisisConsole={handleOpenCrisisConsole} />

      {/* Main App Navbar */}
      <Navbar
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onOpenSosModal={() => setSosModalOpen(true)}
      />

      <div className="flex-1 flex w-full max-w-[1600px] mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Content Container */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Emergency SOS Trigger Modal */}
      <SosTriggerModal
        isOpen={sosModalOpen}
        onClose={() => setSosModalOpen(false)}
      />
    </div>
  );
};
