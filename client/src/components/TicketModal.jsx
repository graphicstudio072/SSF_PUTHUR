import React, { useState } from 'react';
import TicketCard from './TicketCard';
import { downloadTicketAsPng, printTicket } from '../utils/ticketDownload';
import { Download, Printer, Share2, X, Check, Copy } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TicketModal({ candidate, isOpen, onClose, isNewRegistration = false }) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (isOpen && isNewRegistration) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0F5132', '#16A34A', '#4ADE80', '#FCD34D'],
        });
      } catch (e) {
        // confetti fallback
      }
    }
  }, [isOpen, isNewRegistration]);

  if (!isOpen || !candidate) return null;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadTicketAsPng('printable-ticket', `SSF-TICKET-${candidate.ticketId}.png`);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  const handleShareWhatsApp = () => {
    const message = `🎉 *SSF PUTHUR SECTOR - EVENT ENTRY TICKET*\n\n` +
      `👤 *Candidate:* ${candidate.name}\n` +
      `📌 *Unit:* ${candidate.unit}\n` +
      `🎫 *Ticket ID:* ${candidate.ticketId}\n` +
      `📱 *Mobile:* ${candidate.phone}\n\n` +
      `Please present this ticket at the registration counter for entry.`;
    
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleCopyTicketId = () => {
    navigator.clipboard.writeText(candidate.ticketId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-emerald-100 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-1.5 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mb-1">
            {isNewRegistration ? '🎉 Registration Confirmed!' : '🎫 Event Pass'}
          </span>
          <h2 className="text-xl font-bold text-gray-900">Your Official Entry Ticket</h2>
          <p className="text-xs text-gray-500">
            Save or download your ticket card to show at the venue.
          </p>
        </div>

        {/* Render Ticket Card */}
        <div className="mb-5 flex justify-center">
          <TicketCard candidate={candidate} id="printable-ticket" />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-medium">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1.5 bg-emerald-700 hover:bg-emerald-800 text-white py-2.5 px-3 rounded-xl shadow-md transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Saving...' : 'Download'}</span>
          </button>

          <button
            type="button"
            onClick={printTicket}
            className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2.5 px-3 rounded-xl transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-3 rounded-xl transition-all shadow-sm"
          >
            <Share2 className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleCopyTicketId}
            className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2.5 px-3 rounded-xl transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy ID'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
