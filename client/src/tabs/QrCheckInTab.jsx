import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Briefcase,
  History,
} from 'lucide-react';

// ─── Mobile-safe Web Audio API helpers ───────────────────────────────────────
// A single AudioContext is created lazily on the first user gesture and reused.
let sharedAudioCtx = null;

const getAudioCtx = () => {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!sharedAudioCtx) {
    sharedAudioCtx = new AC();
  }
  return sharedAudioCtx;
};

const unlockAudio = () => {
  const ctx = getAudioCtx();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
};

/**
 * playBeep(type)
 *   'success'  — crisp ascending two-note chime  (D5 → A5, sine, ~300 ms)
 *   'warning'  — double low buzz (sawtooth 220 Hz × 2, ~500 ms)
 *   'error'    — descending low buzz (sawtooth 220→165 Hz, ~400 ms)
 */
const playBeep = (type = 'success') => {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const now = ctx.currentTime;

    if (type === 'success') {
      // Note 1: D5 (587 Hz), 0–150 ms
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.18, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.15);

      // Note 2: A5 (880 Hz), 160–320 ms
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.16);
      gain2.gain.setValueAtTime(0.18, now + 0.16);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.16);
      osc2.stop(now + 0.36);
    } else if (type === 'warning') {
      // Double low buzz for already-scanned
      [0, 0.22].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now + offset);
        gain.gain.setValueAtTime(0.15, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.18);
      });
    } else {
      // Error: descending buzz
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(165, now + 0.4);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  } catch (e) {
    // silence audio errors silently
  }
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function QrCheckInTab() {
  const [ticketInput, setTicketInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const scannerRef = useRef(null);
  const scanLockRef = useRef(false); // debounce rapid duplicate scans

  // Initialize camera scanner
  useEffect(() => {
    if (scannerActive) {
      const scanner = new Html5QrcodeScanner(
        'qr-reader-box',
        {
          fps: 10,
          qrbox: { width: 240, height: 240 },
          rememberLastUsedCamera: true,
          aspectRatio: 1.0,
        },
        false
      );

      scanner.render(
        (decodedText) => {
          if (scanLockRef.current) return;
          scanLockRef.current = true;
          handleVerify(decodedText).finally(() => {
            setTimeout(() => {
              scanLockRef.current = false;
            }, 2000); // 2-second cooldown between scans
          });
        },
        () => {} // ignore scan errors
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

  const handleVerify = useCallback(
    async (rawCode) => {
      const code = rawCode || ticketInput;
      if (!code || !code.trim() || verifying) return;

      setVerifying(true);

      try {
        const res = await apiCheckInCandidate(code.trim());

        if (res.alreadyAttended) {
          playBeep('warning');
          setLastResult({
            type: 'warning',
            message: res.message,
            candidate: res.candidate,
            time: new Date(),
          });
        } else if (res.success && res.candidate) {
          playBeep('success');
          setLastResult({
            type: 'success',
            message: res.message,
            candidate: res.candidate,
            time: new Date(),
          });
          setScanHistory((prev) => [
            { candidate: res.candidate, time: new Date(), type: 'success' },
            ...prev.slice(0, 9),
          ]);
          setTicketInput('');
        } else {
          playBeep('error');
          setLastResult({
            type: 'error',
            message: res.message || 'Check-in failed.',
            time: new Date(),
          });
        }
      } catch (err) {
        playBeep('error');
        setLastResult({
          type: 'error',
          message: err.message || 'Ticket ID not recognized or server error.',
          time: new Date(),
        });
      } finally {
        setVerifying(false);
      }
    },
    [ticketInput, verifying]
  );

  // Colour helpers
  const resultColors = {
    success: {
      card: 'bg-gradient-to-br from-emerald-50 to-white border-emerald-300 shadow-emerald-900/10',
      icon: 'bg-emerald-700',
      badge: 'bg-emerald-100 text-emerald-800',
      title: 'text-emerald-950',
      label: 'CHECK-IN CONFIRMED',
    },
    warning: {
      card: 'bg-gradient-to-br from-amber-50 to-white border-amber-300 shadow-amber-900/10',
      icon: 'bg-amber-600',
      badge: 'bg-amber-100 text-amber-900',
      title: 'text-amber-950',
      label: 'ALREADY ATTENDED',
    },
    error: {
      card: 'bg-gradient-to-br from-red-50 to-white border-red-300 shadow-red-900/10',
      icon: 'bg-red-600',
      badge: 'bg-red-100 text-red-900',
      title: 'text-red-950',
      label: 'INVALID TICKET',
    },
  };
  const rc = lastResult ? resultColors[lastResult.type] : null;

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="pb-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <QrCode className="w-5 h-5 mr-2 text-emerald-700" />
            Live QR Scanner &amp; Gate Check-In
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Scan attendee QR codes with device camera or enter Ticket ID manually.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            unlockAudio(); // unlock AudioContext on the user gesture
            setScannerActive((prev) => !prev);
          }}
          className={`inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all touch-manipulation ${
            scannerActive
              ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
              : 'bg-emerald-800 text-white hover:bg-emerald-900'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>{scannerActive ? 'Turn Off Camera' : 'Start Camera Scanner'}</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Camera + Manual Input */}
        <div className="lg:col-span-6 space-y-4">
          {/* Camera Region */}
          {scannerActive && (
            <div className="bg-white p-3 sm:p-4 rounded-3xl border border-emerald-100 shadow-sm overflow-hidden">
              {/* html5-qrcode renders into this div */}
              <div
                id="qr-reader-box"
                className="w-full max-w-xs mx-auto rounded-2xl overflow-hidden"
              />
              <p className="text-center text-[11px] text-gray-400 mt-2">
                Point camera at attendee QR code for automatic verification
              </p>
            </div>
          )}

          {/* Manual Input */}
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
              Manual Ticket Verification
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                unlockAudio();
                handleVerify();
              }}
              className="space-y-3"
            >
              <input
                type="text"
                value={ticketInput}
                onChange={(e) => setTicketInput(e.target.value)}
                placeholder="Enter Ticket ID (e.g. SSF-PUT-100201)"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-sm font-mono uppercase tracking-wider focus:bg-white focus:ring-4 focus:ring-emerald-100 focus:border-emerald-600 outline-none"
              />

              <button
                type="submit"
                disabled={verifying || !ticketInput.trim()}
                onClick={unlockAudio}
                className="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 touch-manipulation"
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

        {/* Right: Verification Result + History */}
        <div className="lg:col-span-6 space-y-4">
          {lastResult && rc ? (
            <div
              className={`p-5 sm:p-6 rounded-3xl border shadow-lg transition-all ${rc.card}`}
            >
              {/* Status Header */}
              <div className="flex items-start space-x-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-md ${rc.icon}`}
                >
                  {lastResult.type === 'success' ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <AlertTriangle className="w-6 h-6" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${rc.badge}`}
                  >
                    {rc.label}
                  </span>
                  <h3
                    className={`text-sm font-bold mt-1 leading-snug ${rc.title}`}
                  >
                    {lastResult.message}
                  </h3>
                </div>
              </div>

              {/* Candidate Info */}
              {lastResult.candidate && (
                <div className="mt-4 pt-4 border-t border-gray-200/80 space-y-2 text-xs">
                  {/* Name */}
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-500 flex items-center shrink-0 mr-2">
                      <User className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                      Candidate:
                    </span>
                    <span className="font-bold text-gray-900 text-sm text-right">
                      {lastResult.candidate.name}
                    </span>
                  </div>

                  {/* Unit */}
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-500 flex items-center shrink-0 mr-2">
                      <Building className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                      Unit:
                    </span>
                    <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-right">
                      {lastResult.candidate.unit}
                    </span>
                  </div>

                  {/* Role — shown only if present */}
                  {lastResult.candidate.role && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-500 flex items-center shrink-0 mr-2">
                        <Briefcase className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                        Role:
                      </span>
                      <span className="font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 text-right">
                        {lastResult.candidate.role}
                      </span>
                    </div>
                  )}

                  {/* Ticket ID */}
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-500 flex items-center shrink-0 mr-2">
                      <Ticket className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                      Ticket ID:
                    </span>
                    <span className="font-mono font-bold text-gray-900 text-right">
                      {lastResult.candidate.ticketId}
                    </span>
                  </div>

                  {/* Phone */}
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-500 flex items-center shrink-0 mr-2">
                      <Phone className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                      Mobile:
                    </span>
                    <span className="font-semibold text-gray-800 text-right">
                      {lastResult.candidate.phone}
                    </span>
                  </div>

                  {/* Verified At */}
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-500 flex items-center shrink-0 mr-2">
                      <Clock className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                      Verified At:
                    </span>
                    <span className="font-semibold text-gray-700 text-right">
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
                  <div key={idx} className="py-2 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="font-bold text-gray-800 block truncate">
                        {item.candidate.name}
                      </span>
                      <span className="text-gray-400 text-[10px]">
                        {item.candidate.unit}
                        {item.candidate.role ? ` · ${item.candidate.role}` : ''}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-700 font-semibold shrink-0">
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
