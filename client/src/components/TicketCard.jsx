import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useSettings } from '../context/SettingsContext';
import { Calendar, Clock, MapPin, CheckCircle, ShieldCheck } from 'lucide-react';

export default function TicketCard({ candidate, id = 'printable-ticket' }) {
  const { settings, resolveImageUrl } = useSettings();

  if (!candidate) return null;

  // Payload encoded in the QR code (JSON string with ticketId)
  const qrPayload = JSON.stringify({
    ticketId: candidate.ticketId,
    name: candidate.name,
    unit: candidate.unit,
    phone: candidate.phone,
  });

  return (
    <div
      id={id}
      className="w-full max-w-md mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl border border-emerald-100 relative text-gray-800 transition-all"
    >
      {/* Top Emerald Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 text-white p-5 sm:p-6 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-emerald-500/10 pointer-events-none blur-xl"></div>
        <div className="absolute -left-8 -bottom-8 w-28 h-28 rounded-full bg-emerald-400/10 pointer-events-none blur-lg"></div>

        <div className="flex items-center justify-between mb-3 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center p-1 border border-white/20">
              {settings.logoUrl ? (
                <img
                  src={resolveImageUrl(settings.logoUrl)}
                  alt="Event Logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="font-extrabold text-sm tracking-wider text-emerald-200">SSF</span>
              )}
            </div>
            <div>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-emerald-300 block">
                {settings.sectorName || 'SSF PUTHUR SECTOR'}
              </span>
              <span className="text-xs text-white/90 font-medium">OFFICIAL ENTRY PASS</span>
            </div>
          </div>

          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase shadow-sm ${
              candidate.attended
                ? 'bg-blue-500/20 text-blue-200 border border-blue-400/30'
                : 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/40'
            }`}
          >
            <ShieldCheck className="w-3 h-3 mr-1 inline" />
            {candidate.attended ? 'VERIFIED' : 'CONFIRMED'}
          </span>
        </div>

        {/* Event Title */}
        <h3 className="text-base sm:text-lg font-bold text-white leading-snug line-clamp-2">
          {settings.eventName || 'SSF PUTHUR SECTOR SAHITYOTSAV 2026'}
        </h3>
        <p className="text-xs text-emerald-200/90 mt-1 line-clamp-1 italic">
          "{settings.eventTheme || 'Moral Revolution for Social Reformation'}"
        </p>

        {/* Optional Event Poster Preview thumbnail if exists */}
        {settings.posterUrl && (
          <div className="mt-3 w-full h-24 rounded-lg overflow-hidden border border-white/20 bg-emerald-950/40">
            <img
              src={resolveImageUrl(settings.posterUrl)}
              alt="Event Poster"
              className="w-full h-full object-cover object-top"
            />
          </div>
        )}
      </div>

      {/* Candidate Profile Details */}
      <div className="p-5 sm:p-6 bg-white space-y-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block">
            Delegate Name
          </span>
          <h4 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
            {candidate.name}
          </h4>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100">
            <span className="text-[10px] font-semibold uppercase text-emerald-800/70 block">
              Unit
            </span>
            <span className="font-bold text-emerald-900 text-sm">{candidate.unit}</span>
          </div>

          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
            <span className="text-[10px] font-semibold uppercase text-gray-500 block">
              Mobile No
            </span>
            <span className="font-semibold text-gray-800 text-sm">{candidate.phone}</span>
          </div>
        </div>

        {/* Venue, Date & Time info */}
        <div className="pt-2 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
          <div className="flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-2 text-emerald-700 flex-shrink-0" />
            <span className="font-medium text-gray-800">{settings.eventDate || '15 Dec 2026'}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-3.5 h-3.5 mr-2 text-emerald-700 flex-shrink-0" />
            <span>{settings.eventTime || '09:00 AM - 05:00 PM'}</span>
          </div>
          <div className="flex items-start">
            <MapPin className="w-3.5 h-3.5 mr-2 text-emerald-700 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-1">{settings.venue || 'Town Hall, Puthur'}</span>
          </div>
        </div>
      </div>

      {/* Perforated Tear-off line with Cutout Notches */}
      <div className="relative flex items-center justify-between px-3 py-2 bg-emerald-50/40">
        <div className="w-4 h-4 rounded-full bg-[#F8FAF9] -ml-5 shadow-inner"></div>
        <div className="flex-1 border-t-2 border-dashed border-emerald-200 mx-2"></div>
        <span className="text-[9px] font-mono tracking-widest text-emerald-800/70 uppercase">
          SCAN AT ENTRY GATE
        </span>
        <div className="flex-1 border-t-2 border-dashed border-emerald-200 mx-2"></div>
        <div className="w-4 h-4 rounded-full bg-[#F8FAF9] -mr-5 shadow-inner"></div>
      </div>

      {/* Bottom QR Code & Ticket ID Section */}
      <div className="p-5 sm:p-6 bg-gradient-to-b from-emerald-50/20 to-white flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Ticket ID Box */}
        <div className="text-center sm:text-left flex-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
            Unique Ticket ID
          </span>
          <div className="inline-block mt-0.5 px-3 py-1 rounded-lg bg-emerald-900 text-emerald-200 font-mono font-bold text-sm sm:text-base tracking-widest shadow-inner">
            {candidate.ticketId}
          </div>
          <p className="text-[10px] text-gray-500 mt-2">
            Present this QR code or Ticket ID at the sector registration desk upon arrival.
          </p>
        </div>

        {/* Crisp QR Code */}
        <div className="p-2.5 bg-white rounded-2xl shadow-md border border-emerald-100 flex-shrink-0">
          <QRCodeSVG
            value={qrPayload}
            size={110}
            level="H"
            includeMargin={false}
            fgColor="#0F5132"
          />
        </div>
      </div>

      {/* Security watermark footer */}
      <div className="bg-emerald-900 text-emerald-300 text-[9px] py-1.5 px-4 text-center tracking-wider uppercase font-semibold">
        SSF Puthur Sector Verification System • Non-Transferable
      </div>
    </div>
  );
}
