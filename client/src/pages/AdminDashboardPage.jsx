import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PinModal from '../components/PinModal';
import UnitsManagementTab from '../tabs/UnitsManagementTab';
import QrCheckInTab from '../tabs/QrCheckInTab';
import AttendanceReportTab from '../tabs/AttendanceReportTab';
import CandidatesListTab from '../tabs/CandidatesListTab';
import SettingsTab from '../tabs/SettingsTab';
import TicketTemplateTab from '../tabs/TicketTemplateTab';
import { useSettings } from '../context/SettingsContext';
import {
  apiVerifySession,
  getAdminToken,
  clearAdminToken,
} from '../utils/api';
import {
  Building2,
  QrCode,
  BarChart3,
  Users,
  Sliders,
  LayoutTemplate,
  Check,
  X,
  ChevronRight,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { settings, resolveImageUrl } = useSettings();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState('units');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Check existing token on mount
  useEffect(() => {
    const checkSession = async () => {
      const token = getAdminToken();
      if (!token) {
        setIsAuthenticated(false);
        setCheckingAuth(false);
        return;
      }

      try {
        const res = await apiVerifySession();
        if (res.success && res.valid) {
          setIsAuthenticated(true);
        } else {
          clearAdminToken();
          setIsAuthenticated(false);
        }
      } catch (err) {
        clearAdminToken();
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkSession();
  }, []);

  // Close drawer on Escape key
  useEffect(() => {
    if (!drawerOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [drawerOpen]);

  const handleCopyAdminLink = () => {
    const adminUrl = window.location.origin + '/admin';
    navigator.clipboard.writeText(adminUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handleLogout = () => {
    clearAdminToken();
    setDrawerOpen(false);
    setIsAuthenticated(false);
  };

  // If not authenticated, render PIN lock modal
  if (!isAuthenticated && !checkingAuth) {
    return <PinModal onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  const navItems = [
    {
      id: 'units',
      label: '7 Units Management',
      subtitle: 'Add, edit & remove sector units',
      icon: Building2,
    },
    {
      id: 'scanner',
      label: 'QR Scanner & Check-In',
      subtitle: 'Gate verification & manual check-in',
      icon: QrCode,
    },
    {
      id: 'reports',
      label: 'Attendance & WhatsApp Report',
      subtitle: 'Unit turnout & WhatsApp share',
      icon: BarChart3,
    },
    {
      id: 'candidates',
      label: 'Candidate Roster',
      subtitle: 'Registered delegates & export',
      icon: Users,
    },
    {
      id: 'settings',
      label: 'Logo, Theme & Posters',
      subtitle: 'Branding, event details & PIN',
      icon: Sliders,
    },
    {
      id: 'ticket-template',
      label: 'Ticket Template Settings',
      subtitle: 'Custom template & field placement',
      icon: LayoutTemplate,
    },
  ];

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    setDrawerOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF9] text-gray-900">
      {/* Top Header with Hamburger (left) and Profile Popover (right) */}
      <Header
        isAdmin={true}
        onToggleDrawer={() => setDrawerOpen((prev) => !prev)}
        onCopyAdminLink={handleCopyAdminLink}
        onLogout={handleLogout}
        copySuccess={copySuccess}
      />

      {/* Slide-out Collapsible Navigation Drawer */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-200 ${
          drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!drawerOpen}
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-emerald-950/40 backdrop-blur-xs"
          onClick={() => setDrawerOpen(false)}
        />

        {/* Drawer Panel */}
        <aside
          className={`fixed top-0 left-0 bottom-0 w-72 sm:w-80 max-w-[85vw] bg-white shadow-2xl border-r border-emerald-100 flex flex-col transform transition-transform duration-250 ease-out ${
            drawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Drawer Header */}
          <div className="px-5 py-4 border-b border-emerald-100 flex items-center justify-between bg-gradient-to-r from-emerald-900 to-emerald-800 text-white">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                {settings.logoUrl ? (
                  <img
                    src={resolveImageUrl(settings.logoUrl)}
                    alt="SSF Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-extrabold text-emerald-200">SSF</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold tracking-wide truncate">
                  {settings.sectorName || 'SSF PUTHUR SECTOR'}
                </p>
                <p className="text-[10px] text-emerald-200 uppercase tracking-widest font-semibold">
                  Admin Navigation
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close navigation menu"
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors touch-manipulation"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Navigation Items */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-left transition-all touch-manipulation ${
                    isActive
                      ? 'bg-emerald-800 text-white shadow-md shadow-emerald-900/20'
                      : 'text-gray-700 hover:bg-emerald-50/80 hover:text-emerald-900'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isActive
                          ? 'bg-white/15 text-white'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold block truncate">{item.label}</span>
                      <span
                        className={`text-[10px] block truncate ${
                          isActive ? 'text-emerald-100' : 'text-gray-400'
                        }`}
                      >
                        {item.subtitle}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 flex-shrink-0 ${
                      isActive ? 'text-emerald-200' : 'text-gray-300'
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          {/* Drawer Footer */}
          <div className="px-5 py-3 border-t border-gray-100 text-[10px] text-gray-400 text-center">
            SSF Puthur Sector • Admin Portal
          </div>
        </aside>
      </div>

      {/* Copy link floating feedback toast */}
      {copySuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white text-xs px-4 py-2.5 rounded-2xl shadow-xl flex items-center space-x-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-300" />
          <span>Admin URL copied to clipboard!</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Active Section Content Display */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-soft border border-emerald-100 min-h-[500px]">
          {activeTab === 'units' && <UnitsManagementTab />}
          {activeTab === 'scanner' && <QrCheckInTab />}
          {activeTab === 'reports' && <AttendanceReportTab />}
          {activeTab === 'candidates' && <CandidatesListTab />}
          {activeTab === 'settings' && <SettingsTab />}
          {activeTab === 'ticket-template' && <TicketTemplateTab />}
        </div>
      </main>

      <Footer />
    </div>
  );
}
