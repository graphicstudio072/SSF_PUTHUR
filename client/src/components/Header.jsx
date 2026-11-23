import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { Calendar, MapPin, Award } from 'lucide-react';

export default function Header({ isAdmin = false, onCopyAdminLink, onLogout, copySuccess }) {
  const { settings, resolveImageUrl } = useSettings();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 flex items-center justify-center text-white shadow-md shadow-emerald-900/20 ring-2 ring-emerald-600/30 overflow-hidden flex-shrink-0">
              {settings.logoUrl ? (
                <img
                  src={resolveImageUrl(settings.logoUrl)}
                  alt="SSF Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center font-black tracking-tighter text-xs">
                  <span className="text-[14px] text-emerald-300 font-extrabold leading-none">SSF</span>
                  <span className="text-[8px] text-emerald-100 tracking-widest font-semibold uppercase">Puthur</span>
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                  {settings.sectorName || 'SSF PUTHUR SECTOR'}
                </h1>
                {isAdmin && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Admin Portal
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-800/80 font-medium line-clamp-1">
                {settings.eventSubtitle || 'Sunni Students Federation • Registration & Check-In Portal'}
              </p>
            </div>
          </div>

          {/* Right Action: ONLY on Admin page, STRICTLY NOTHING on Public page */}
          {isAdmin ? (
            <div className="flex items-center space-x-2.5">
              {onCopyAdminLink && (
                <button
                  type="button"
                  onClick={onCopyAdminLink}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors shadow-sm"
                  title="Copy Admin link to clipboard"
                >
                  <span>{copySuccess ? '✓ Copied' : '🔗 Copy Admin Link'}</span>
                </button>
              )}
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-red-700 bg-gray-100 hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-lg transition-colors"
                >
                  Lock
                </button>
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
