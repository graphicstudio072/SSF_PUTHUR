import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PinModal from '../components/PinModal';
import UnitsManagementTab from '../tabs/UnitsManagementTab';
import QrCheckInTab from '../tabs/QrCheckInTab';
import AttendanceReportTab from '../tabs/AttendanceReportTab';
import CandidatesListTab from '../tabs/CandidatesListTab';
import SettingsTab from '../tabs/SettingsTab';
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
  Copy,
  Check,
  Lock,
  ExternalLink,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState('units');
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

  const handleCopyAdminLink = () => {
    const adminUrl = window.location.origin + '/admin';
    navigator.clipboard.writeText(adminUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handleLogout = () => {
    clearAdminToken();
    setIsAuthenticated(false);
  };

  // If not authenticated, render PIN lock modal
  if (!isAuthenticated && !checkingAuth) {
    return <PinModal onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  const tabs = [
    { id: 'units', label: '7 Units Management', icon: Building2 },
    { id: 'scanner', label: 'QR Scanner & Check-In', icon: QrCode },
    { id: 'reports', label: 'Attendance & WhatsApp Reports', icon: BarChart3 },
    { id: 'candidates', label: 'Candidate Roster', icon: Users },
    { id: 'settings', label: 'Logo, Theme & Posters', icon: Sliders },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF9] text-gray-900">
      {/* Admin Header with Copy Admin Link & Lock Actions */}
      <Header
        isAdmin={true}
        onCopyAdminLink={handleCopyAdminLink}
        onLogout={handleLogout}
        copySuccess={copySuccess}
      />

      {/* Copy link floating feedback toast */}
      {copySuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white text-xs px-4 py-2.5 rounded-2xl shadow-xl flex items-center space-x-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-300" />
          <span>Admin URL copied to clipboard!</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Control Bar with Tab Navigation */}
        <div className="bg-white rounded-3xl p-2.5 sm:p-3 shadow-soft border border-emerald-100 mb-6 overflow-x-auto">
          <nav className="flex space-x-1 sm:space-x-2 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-800 text-white shadow-md shadow-emerald-900/20'
                      : 'text-gray-600 hover:text-emerald-800 hover:bg-emerald-50/70'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content Display */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-emerald-100 min-h-[500px]">
          {activeTab === 'units' && <UnitsManagementTab />}
          {activeTab === 'scanner' && <QrCheckInTab />}
          {activeTab === 'reports' && <AttendanceReportTab />}
          {activeTab === 'candidates' && <CandidatesListTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </main>

      <Footer />
    </div>
  );
}
