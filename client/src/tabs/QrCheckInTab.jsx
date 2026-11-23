import React, { useState, useEffect, useRef } from 'react';
import { apiCheckInCandidate } from '../utils/api';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
  QrCode,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Phone,
  Building,
  Ticket,
  Loader2,
  Volume2,
  History,
} from 'lucide-react';

// Audio feedback synthesizer using Web Audio API
const playTone = (isSuccess) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (isSuccess) {
      // Pleasant high double beep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else {
      // Warning low buzzer
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    }
  } catch (e) {
    // audio fallback
  }
};

export default function QrCheckInTab() {
  const [ticketInput, setTicketInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const scannerRef = useRef(null);

  // Initialize camera scanner
  useEffect(() => {
    if (scannerActive) {
      const scanner = new Html5QrcodeScanner(
        'reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
          aspectRatio: 1.0,
        },
        false
      );

      scanner.render(
        (decodedText) => {
          handleVerify(decodedText);
        },
        (error) => {
          // scanning continuous search
        }
      );

      scannerRef.current = scanner;
    } else {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [scannerActive]);

  const handleVerify = async (rawCode) => {
    const code = rawCode || ticketInput;
    if (!code || !code.trim() || verifying) return;

    setVerifying(true);

    try {
      const res = await apiCheckInCandidate(code.trim());

      if (res.alreadyAttended) {
        playTone(false);
        setLastResult({
          type: 'warning',
          message: res.message,
          candidate: res.candidate,
          time: new Date(),
        });
      } else if (res.success && res.candidate) {
        playTone(true);
        setLastResult({
          type: 'success',
          message: res.message,
          candidate: res.candidate,
          time: new Date(),
        });
        setScanHistory((prev) => [
          {
            candidate: res.candidate,
            time: new Date(),
            type: 'success',
          },
          ...prev.slice(0, 9),
        ]);
        setTicketInput('');
      } else {
        playTone(false);
        setLastResult({
          type: 'error',
          message: res.message || 'Check-in failed.',
          time: new Date(),
        });
      }
    } catch (err) {
      playTone(false);
      setLastResult({
        type: 'error',
        message: err.message || 'Ticket ID not recognized or server error.',
        time: new Date(),
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="pb-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <QrCode className="w-5 h-5 mr-2 text-emerald-700" />
            Live QR Scanner & Gate Check-In
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Scan attendee QR codes with device camera or enter Ticket ID manually.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setScannerActive((prev) => !prev)}
          className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all ${
            scannerActive
              ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
              : 'bg-emerald-800 text-white hover:bg-emerald-900'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>{scannerActive ? 'Turn Off Camera' : 'Start Camera Scanner'}</span>
        </button>
      </div>

      {/* Main Grid: Scanner & Manual Fallback */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Col: Camera & Manual Input */}
        <div className="lg:col-span-6 space-y-4">
          {/* Camera Region */}
          {scannerActive && (
            <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm overflow-hidden">
              <div id="reader" className="w-full rounded-2xl overflow-hidden"></div>
              <p className="text-center text-[11px] text-gray-400 mt-2">
                Point camera at attendee QR code for automatic verification
              </p>
            </div>
          )}

          {/* Manual Input Fallback */}
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
              Manual Ticket Verification
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerify();
              }}
              className="space-y-3"
            >
              <div className="relative">
                <input
                  type="text"
                  value={ticketInput}
                  onChange={(e) => setTicketInput(e.target.value)}
                  placeholder="Enter Ticket ID (e.g. SSF-PUT-100201)"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-sm font-mono uppercase tracking-wider focus:bg-white focus:ring-4 focus:ring-emerald-100 focus:border-emerald-600 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={verifying || !ticketInput.trim()}
                className="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {verifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Pass...</span>
                  </>
                ) : (
                  <>
                    <Ticket className="w-4 h-4" />
                    <span>Check-In Ticket</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: Live Verification Result & Warning Card */}
        <div className="lg:col-span-6 space-y-4">
          {lastResult ? (
            <div
              className={`p-6 rounded-3xl border shadow-lg transition-all ${
                lastResult.type === 'success'
                  ? 'bg-gradient-to-br from-emerald-50 to-white border-emerald-300 shadow-emerald-900/10'
                  : lastResult.type === 'warning'
                  ? 'bg-gradient-to-br from-amber-50 to-white border-amber-300 shadow-amber-900/10'
                  : 'bg-gradient-to-br from-red-50 to-white border-red-300 shadow-red-900/10'
              }`}
            >
              {/* Status Header */}
              <div className="flex items-start space-x-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-md ${
                    lastResult.type === 'success'
                      ? 'bg-emerald-700'
                      : lastResult.type === 'warning'
                      ? 'bg-amber-600'
                      : 'bg-red-600'
                  }`}
                >
                  {lastResult.type === 'success' ? (
                    <CheckCircle2 className="w-7 h-7" />
                  ) : lastResult.type === 'warning' ? (
                    <AlertTriangle className="w-7 h-7" />
                  ) : (
                    <AlertTriangle className="w-7 h-7" />
                  )}
                </div>

                <div className="flex-1">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${
                      lastResult.type === 'success'
                        ? 'bg-emerald-100 text-emerald-800'
                        : lastResult.type === 'warning'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-red-100 text-red-900'
                    }`}
                  >
                    {lastResult.type === 'success'
                      ? 'CHECK-IN CONFIRMED'
                      : lastResult.type === 'warning'
                      ? 'ALREADY ATTENDED WARNING'
                      : 'INVALID TICKET'}
                  </span>

                  <h3
                    className={`text-base font-bold mt-1 ${
                      lastResult.type === 'success'
                        ? 'text-emerald-950'
                        : lastResult.type === 'warning'
                        ? 'text-amber-950'
                        : 'text-red-950'
                    }`}
                  >
                    {lastResult.message}
                  </h3>
                </div>
              </div>

              {/* Candidate Info Details */}
              {lastResult.candidate && (
                <div className="mt-5 pt-4 border-t border-gray-200/80 space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-500 flex items-center">
                      <User className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                      Candidate Name:
                    </span>
                    <span className="font-bold text-gray-900 text-sm">
                      {lastResult.candidate.name}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-500 flex items-center">
                      <Building className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                      Sector Unit:
                    </span>
                    <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {lastResult.candidate.unit}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-500 flex items-center">
                      <Ticket className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                      Ticket ID:
                    </span>
                    <span className="font-mono font-bold text-gray-900">
                      {lastResult.candidate.ticketId}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-500 flex items-center">
                      <Phone className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                      Mobile Number:
                    </span>
                    <span className="font-semibold text-gray-800">
                      {lastResult.candidate.phone}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-500 flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                      Verified At:
                    </span>
                    <span className="font-semibold text-gray-700">
                      {lastResult.candidate.checkInTime
                        ? new Date(lastResult.candidate.checkInTime).toLocaleString()
                        : 'Just now'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 bg-gray-50/60 rounded-3xl border border-dashed border-gray-300 text-center text-xs text-gray-400">
              <QrCode className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <span>Ready for entry scanning. Scanned attendee details will appear here.</span>
            </div>
          )}

          {/* Recent Scans Mini History */}
          {scanHistory.length > 0 && (
            <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-gray-700 mb-3">
                <History className="w-3.5 h-3.5 text-emerald-700" />
                <span>Recent Check-Ins ({scanHistory.length})</span>
              </div>
              <div className="divide-y divide-gray-100 text-xs">
                {scanHistory.map((item, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-800">{item.candidate.name}</span>
                      <span className="text-gray-400 text-[10px] ml-2">({item.candidate.unit})</span>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-700 font-semibold">
                      {item.candidate.ticketId}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
