import React, { useState, useRef, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import {
  Calendar,
  MapPin,
  Menu,
  User,
  Link2,
  Check,
  Lock,
  ShieldCheck,
} from 'lucide-react';

export default function Header({
  isAdmin = false,
  onToggleDrawer,
  onCopyAdminLink,
  onLogout,
  copySuccess,
}) {
  const { settings, resolveImageUrl } = useSettings();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close profile popover on outside click or Escape key
  useEffect(() => {
    if (!profileOpen) return;

    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setProfileOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [profileOpen]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3 gap-3">
          {/* Left: Hamburger (Admin only) + Logo & Branding */}
          <div className="flex items-center space-x-3 min-w-0">
            {isAdmin && onToggleDrawer && (
              <button
                type="button"
                onClick={onToggleDrawer}
                aria-label="Open navigation menu"
                className="p-2 rounded-xl text-gray-700 hover:text-emerald-800 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-200 transition-colors touch-manipulation flex-shrink-0"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 flex items-center justify-center text-white shadow-md shadow-emerald-900/20 ring-2 ring-emerald-600/30 overflow-hidden flex-shrink-0">
              {settings.logoUrl ? (
                <img
                  src={resolveImageUrl(settings.logoUrl)}
                  alt="SSF Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center font-black tracking-tighter text-xs">
                  <span className="text-[14px] text-emerald-300 font-extrabold leading-none">
                    SSF
                  </span>
                  <span className="text-[8px] text-emerald-100 tracking-widest font-semibold uppercase">
                    Puthur
                  </span>
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h1 className="text-sm sm:text-lg font-bold text-gray-900 leading-tight truncate">
                  {settings.sectorName || 'SSF PUTHUR SECTOR'}
                </h1>
                {isAdmin && (
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 flex-shrink-0">
                    Admin Portal
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-800/80 font-medium line-clamp-1">
                {settings.eventSubtitle || 'Sunni Students Federation • Registration & Check-In Portal'}
              </p>
            </div>
          </div>

          {/* Right Action: Profile Icon Popover ONLY on Admin page, STRICTLY NOTHING admin-related on Public page */}
          {isAdmin ? (
            <div className="relative flex-shrink-0" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((prev) => !prev)}
                aria-label="Admin profile and actions"
                aria-expanded={profileOpen}
                className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all shadow-sm touch-manipulation ${
                  profileOpen
                    ? 'bg-emerald-800 text-white border-emerald-800 ring-4 ring-emerald-100'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <User className="w-5 h-5" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-emerald-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* Admin Status Header */}
                  <div className="px-4 py-2.5 border-b border-gray-100 flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">Admin Portal</p>
                      <p className="text-[11px] text-emerald-700 font-medium">Authenticated Session</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-1.5 space-y-1">
                    {onCopyAdminLink && (
                      <button
                        type="button"
                        onClick={() => {
                          onCopyAdminLink();
                        }}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors touch-manipulation"
                      >
                        <span className="flex items-center space-x-2.5">
                          {copySuccess ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Link2 className="w-4 h-4 text-emerald-700" />
                          )}
                          <span>{copySuccess ? 'Link Copied!' : 'Copy Admin Link'}</span>
                        </span>
                        {copySuccess && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                            ✓
                          </span>
                        )}
                      </button>
                    )}

                    {onLogout && (
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors touch-manipulation"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Lock</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Public navigation helper */
            <div className="hidden md:flex items-center space-x-4 text-xs font-medium text-gray-600">
              <span className="inline-flex items-center text-emerald-800 bg-emerald-50/80 px-2.5 py-1 rounded-full border border-emerald-100">
                <Calendar className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                {settings.eventDate || 'Dec 2026'}
              </span>
              <span className="inline-flex items-center text-gray-600 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200">
                <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
                {settings.venue ? settings.venue.split(',')[0] : 'Puthur'}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
