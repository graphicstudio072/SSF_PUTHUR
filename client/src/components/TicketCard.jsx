import React, { useRef, useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useSettings } from '../context/SettingsContext';
import { AlertTriangle } from 'lucide-react';

const DEFAULT_CONFIG = {
  qr: { x: 74, y: 58, size: 22 },
  name: { x: 8, y: 42, fontSize: 28, color: '#111827', align: 'left', fontWeight: '700' },
  ticketId: { x: 8, y: 54, fontSize: 20, color: '#0F5132', align: 'left', fontWeight: '700' },
  unit: { x: 8, y: 65, fontSize: 20, color: '#374151', align: 'left', fontWeight: '600' },
};

const getTransform = (align) => {
  if (align === 'center') return 'translate(-50%, -50%)';
  if (align === 'right') return 'translate(-100%, -50%)';
  return 'translate(0%, -50%)';
};

export default function TicketCard({ candidate, id = 'printable-ticket' }) {
  const { settings, resolveImageUrl } = useSettings();
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(440);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [settings.ticketTemplateUrl]);

  if (!candidate) return null;

  // Payload encoded in the QR code (preserves existing verification logic)
  const qrPayload = JSON.stringify({
    ticketId: candidate.ticketId,
    name: candidate.name,
    unit: candidate.unit,
    phone: candidate.phone,
  });

  const cfg = {
    qr: { ...DEFAULT_CONFIG.qr, ...(settings.ticketTemplateConfig?.qr || {}) },
    name: { ...DEFAULT_CONFIG.name, ...(settings.ticketTemplateConfig?.name || {}) },
    ticketId: { ...DEFAULT_CONFIG.ticketId, ...(settings.ticketTemplateConfig?.ticketId || {}) },
    unit: { ...DEFAULT_CONFIG.unit, ...(settings.ticketTemplateConfig?.unit || {}) },
  };

  // Fallback when no custom template has been uploaded by the Admin yet
  if (!settings.ticketTemplateUrl) {
    return (
      <div
        id={id}
        className="w-full max-w-md mx-auto bg-white rounded-3xl p-6 shadow-xl border border-emerald-100 text-gray-900 space-y-5"
      >
        <div className="flex items-start space-x-2.5 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <span>
            No custom ticket template has been uploaded yet. Please configure one in Admin → Ticket Template Settings.
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2 min-w-0 flex-1">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                Name
              </span>
              <p className="text-lg font-extrabold text-gray-900 truncate">{candidate.name}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                Ticket Number
              </span>
              <p className="text-sm font-mono font-bold text-emerald-800">{candidate.ticketId}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                Unit
              </span>
              <p className="text-sm font-semibold text-gray-700">{candidate.unit}</p>
            </div>
          </div>

          <div className="p-2 bg-white rounded-2xl border border-emerald-100 shadow-sm flex-shrink-0">
            <QRCodeSVG
              value={qrPayload}
              size={104}
              level="H"
              includeMargin={false}
              fgColor="#0F5132"
            />
          </div>
        </div>
      </div>
    );
  }

  const scale = containerWidth / 800;
  const qrSizePx = Math.max(24, (cfg.qr.size / 100) * containerWidth);

  return (
    <div
      id={id}
      ref={containerRef}
      className="relative w-full max-w-lg mx-auto overflow-hidden rounded-2xl shadow-2xl bg-white select-none"
    >
      <img
        src={resolveImageUrl(settings.ticketTemplateUrl)}
        alt="Event Ticket Template"
        className="w-full h-auto block"
      />

      {/* 1. Name */}
      <div
        style={{
          position: 'absolute',
          left: `${cfg.name.x}%`,
          top: `${cfg.name.y}%`,
          transform: getTransform(cfg.name.align),
          fontSize: `${Math.max(8, cfg.name.fontSize * scale)}px`,
          color: cfg.name.color,
          fontWeight: cfg.name.fontWeight,
          textAlign: cfg.name.align,
          lineHeight: 1.15,
          whiteSpace: 'nowrap',
        }}
      >
        {candidate.name}
      </div>

      {/* 2. Ticket Number */}
      <div
        style={{
          position: 'absolute',
          left: `${cfg.ticketId.x}%`,
          top: `${cfg.ticketId.y}%`,
          transform: getTransform(cfg.ticketId.align),
          fontSize: `${Math.max(8, cfg.ticketId.fontSize * scale)}px`,
          color: cfg.ticketId.color,
          fontWeight: cfg.ticketId.fontWeight,
          textAlign: cfg.ticketId.align,
          lineHeight: 1.15,
          whiteSpace: 'nowrap',
        }}
        className="font-mono"
      >
        {candidate.ticketId}
      </div>

      {/* 3. Unit */}
      <div
        style={{
          position: 'absolute',
          left: `${cfg.unit.x}%`,
          top: `${cfg.unit.y}%`,
          transform: getTransform(cfg.unit.align),
          fontSize: `${Math.max(8, cfg.unit.fontSize * scale)}px`,
          color: cfg.unit.color,
          fontWeight: cfg.unit.fontWeight,
          textAlign: cfg.unit.align,
          lineHeight: 1.15,
          whiteSpace: 'nowrap',
        }}
      >
        {candidate.unit}
      </div>

      {/* 4. QR Code */}
      <div
        style={{
          position: 'absolute',
          left: `${cfg.qr.x}%`,
          top: `${cfg.qr.y}%`,
          transform: 'translate(-50%, -50%)',
          width: `${qrSizePx}px`,
          height: `${qrSizePx}px`,
        }}
        className="bg-white p-1 rounded-lg shadow-sm"
      >
        <QRCodeSVG
          value={qrPayload}
          size={Math.max(20, qrSizePx - 8)}
          level="H"
          includeMargin={false}
          fgColor="#0F5132"
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
