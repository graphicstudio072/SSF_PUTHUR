import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { ShieldCheck, Phone, Mail, Heart } from 'lucide-react';

export default function Footer() {
  const { settings } = useSettings();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-emerald-100 mt-auto text-gray-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Col 1: Org Branding */}
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <span className="font-bold text-gray-900 text-sm tracking-wide">
                {settings.sectorName || 'SSF PUTHUR SECTOR'}
              </span>
            </div>
            <p className="mt-1 text-gray-500">
              {settings.eventTheme || 'Moral Revolution for Social Reformation'}
            </p>
          </div>

          {/* Col 2: Contact Info */}
          <div className="flex flex-col sm:flex-row md:justify-center items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-gray-600">
            {settings.contactPhone && (
              <a
                href={`tel:${settings.contactPhone}`}
                className="flex items-center hover:text-emerald-700 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                <span>{settings.contactPhone}</span>
              </a>
            )}
            {settings.contactEmail && (
              <a
                href={`mailto:${settings.contactEmail}`}
                className="flex items-center hover:text-emerald-700 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                <span>{settings.contactEmail}</span>
              </a>
            )}
          </div>

          {/* Col 3: Copyright */}
          <div className="md:text-right text-gray-500">
            <p className="flex items-center md:justify-end">
              <span>Official Event Registration Portal</span>
              <ShieldCheck className="w-3.5 h-3.5 ml-1 text-emerald-600 inline" />
            </p>
            <p className="mt-0.5">© {currentYear} SSF Puthur Sector. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
