import React, { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useSettings } from '../context/SettingsContext';
import { apiUploadTicketTemplate, apiUpdateSettings } from '../utils/api';
import {
  LayoutTemplate,
  Upload,
  Save,
  Eye,
  Pencil,
  Trash2,
  Loader2,
  Check,
  AlertCircle,
  QrCode,
  User,
  Hash,
  Building2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RotateCcw,
} from 'lucide-react';

const DEFAULT_CONFIG = {
  qr: { x: 74, y: 58, size: 22 },
  name: { x: 8, y: 42, fontSize: 28, color: '#111827', align: 'left', fontWeight: '700' },
  ticketId: { x: 8, y: 54, fontSize: 20, color: '#0F5132', align: 'left', fontWeight: '700' },
  unit: { x: 8, y: 65, fontSize: 20, color: '#374151', align: 'left', fontWeight: '600' },
};

const SAMPLE_DATA = {
  name: 'Mohammed Fayis',
  ticketId: 'SSF-PUT-100201',
  unit: 'Puthur',
};

const FIELD_META = [
  { key: 'name', label: 'Name', icon: User },
  { key: 'ticketId', label: 'Ticket Number', icon: Hash },
  { key: 'unit', label: 'Unit', icon: Building2 },
  { key: 'qr', label: 'QR Code', icon: QrCode },
];

export default function TicketTemplateTab() {
  const { settings, refreshSettings, resolveImageUrl } = useSettings();

  const [config, setConfig] = useState(() => ({
    qr: { ...DEFAULT_CONFIG.qr, ...(settings.ticketTemplateConfig?.qr || {}) },
    name: { ...DEFAULT_CONFIG.name, ...(settings.ticketTemplateConfig?.name || {}) },
    ticketId: { ...DEFAULT_CONFIG.ticketId, ...(settings.ticketTemplateConfig?.ticketId || {}) },
    unit: { ...DEFAULT_CONFIG.unit, ...(settings.ticketTemplateConfig?.unit || {}) },
  }));

  const [selectedField, setSelectedField] = useState('name');
  const [previewMode, setPreviewMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({ type: '', text: '' });

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const [canvasWidth, setCanvasWidth] = useState(600);
  const dragStateRef = useRef(null);

  // Sync config when settings load from backend
  useEffect(() => {
    if (settings.ticketTemplateConfig) {
      setConfig({
        qr: { ...DEFAULT_CONFIG.qr, ...(settings.ticketTemplateConfig.qr || {}) },
        name: { ...DEFAULT_CONFIG.name, ...(settings.ticketTemplateConfig.name || {}) },
        ticketId: { ...DEFAULT_CONFIG.ticketId, ...(settings.ticketTemplateConfig.ticketId || {}) },
        unit: { ...DEFAULT_CONFIG.unit, ...(settings.ticketTemplateConfig.unit || {}) },
      });
    }
  }, [settings.ticketTemplateConfig]);

  // Observe canvas width for proportional font & QR scaling
  useEffect(() => {
    if (!canvasRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setCanvasWidth(entry.contentRect.width);
        }
      }
    });
    observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, [settings.ticketTemplateUrl]);

  const scale = canvasWidth / 800;

  const handleUploadTemplate = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setNotice({ type: 'error', text: 'Template image must be 5MB or smaller.' });
      return;
    }

    setUploading(true);
    setNotice({ type: '', text: '' });
    try {
      const res = await apiUploadTicketTemplate(file);
      if (res.success) {
        setNotice({ type: 'success', text: 'Ticket template uploaded and saved persistently!' });
        await refreshSettings();
      } else {
        setNotice({ type: 'error', text: res.message || 'Failed to upload template' });
      }
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Upload error' });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveTemplate = async () => {
    setNotice({ type: '', text: '' });
    try {
      const res = await apiUpdateSettings({ ticketTemplateUrl: '' });
      if (res.success) {
        setNotice({ type: 'success', text: 'Ticket template removed.' });
        await refreshSettings();
      }
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Failed to remove template' });
    }
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    setNotice({ type: '', text: '' });
    try {
      const res = await apiUpdateSettings({ ticketTemplateConfig: config });
      if (res.success) {
        setNotice({ type: 'success', text: 'Ticket template configuration saved!' });
        await refreshSettings();
      } else {
        setNotice({ type: 'error', text: res.message || 'Failed to save configuration' });
      }
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Server error saving configuration' });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (fieldKey, patch) => {
    setConfig((prev) => ({
      ...prev,
      [fieldKey]: { ...prev[fieldKey], ...patch },
    }));
  };

  // Drag handlers using Pointer Events (mouse + touch)
  const handlePointerDown = (e, fieldKey) => {
    if (previewMode) return;
    e.preventDefault();
    e.stopPropagation();
    setSelectedField(fieldKey);

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    dragStateRef.current = {
      fieldKey,
      startX: e.clientX,
      startY: e.clientY,
      origX: config[fieldKey].x,
      origY: config[fieldKey].y,
      rectWidth: rect.width,
      rectHeight: rect.height,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    const drag = dragStateRef.current;
    if (!drag) return;

    const dxPct = ((e.clientX - drag.startX) / drag.rectWidth) * 100;
    const dyPct = ((e.clientY - drag.startY) / drag.rectHeight) * 100;

    const nextX = Math.min(98, Math.max(2, Number((drag.origX + dxPct).toFixed(1))));
    const nextY = Math.min(98, Math.max(2, Number((drag.origY + dyPct).toFixed(1))));

    updateField(drag.fieldKey, { x: nextX, y: nextY });
  };

  const handlePointerUp = () => {
    dragStateRef.current = null;
  };

  const getTransform = (align) => {
    if (align === 'center') return 'translate(-50%, -50%)';
    if (align === 'right') return 'translate(-100%, -50%)';
    return 'translate(0%, -50%)';
  };

  const activeCfg = config[selectedField];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <LayoutTemplate className="w-5 h-5 mr-2 text-emerald-700" />
            Ticket Template Settings
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Upload a custom ticket background and position ONLY Name, Ticket Number, Unit, and QR Code.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUploadTemplate}
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            <span>{settings.ticketTemplateUrl ? 'Replace Template' : 'Upload Template'}</span>
          </button>

          {settings.ticketTemplateUrl && (
            <>
              <button
                type="button"
                onClick={() => setPreviewMode((prev) => !prev)}
                className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  previewMode
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {previewMode ? <Pencil className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{previewMode ? 'Back to Editor' : 'Sample Preview'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveConfig}
                disabled={saving}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Template Configuration</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Notice */}
      {notice.text && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center ${
            notice.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {notice.type === 'success' ? (
            <Check className="w-4 h-4 mr-2 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 mr-2 text-red-600 flex-shrink-0" />
          )}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Empty State Prompt when no template is uploaded */}
      {!settings.ticketTemplateUrl ? (
        <div className="p-10 bg-emerald-50/40 rounded-3xl border-2 border-dashed border-emerald-200 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <LayoutTemplate className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-gray-900">No Custom Ticket Template Uploaded</h3>
            <p className="text-xs text-gray-500 mt-1">
              Upload your designed ticket background image (PNG, JPG, or WebP, max 5MB). Once uploaded, you can drag and style the Name, Ticket Number, Unit, and QR Code directly on top of it.
            </p>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-md transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Uploading...' : 'Upload Ticket Template Image'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Interactive Drag & Drop Canvas */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {previewMode
                  ? 'Sample Preview Mode (showing dummy registrant data)'
                  : 'Drag any of the 4 fields on the template to position them'}
              </span>
              <button
                type="button"
                onClick={handleRemoveTemplate}
                className="inline-flex items-center space-x-1 text-red-600 hover:text-red-700 font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Template</span>
              </button>
            </div>

            <div className="bg-gray-100 p-2 sm:p-3 rounded-2xl border border-gray-200 overflow-hidden">
              <div
                ref={canvasRef}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className="relative w-full select-none overflow-hidden rounded-xl shadow-md bg-white touch-none"
              >
                <img
                  src={resolveImageUrl(settings.ticketTemplateUrl)}
                  alt="Ticket Template"
                  draggable={false}
                  className="w-full h-auto block pointer-events-none"
                />

                {/* 1. Name */}
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'name')}
                  style={{
                    position: 'absolute',
                    left: `${config.name.x}%`,
                    top: `${config.name.y}%`,
                    transform: getTransform(config.name.align),
                    fontSize: `${Math.max(8, config.name.fontSize * scale)}px`,
                    color: config.name.color,
                    fontWeight: config.name.fontWeight,
                    textAlign: config.name.align,
                    lineHeight: 1.15,
                    whiteSpace: 'nowrap',
                  }}
                  className={`${
                    previewMode
                      ? ''
                      : `cursor-move px-1.5 py-0.5 rounded border ${
                          selectedField === 'name'
                            ? 'border-emerald-600 bg-emerald-500/15 ring-2 ring-emerald-500/40'
                            : 'border-dashed border-gray-400/70 bg-white/30 hover:border-emerald-500'
                        }`
                  }`}
                >
                  {SAMPLE_DATA.name}
                </div>

                {/* 2. Ticket Number */}
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'ticketId')}
                  style={{
                    position: 'absolute',
                    left: `${config.ticketId.x}%`,
                    top: `${config.ticketId.y}%`,
                    transform: getTransform(config.ticketId.align),
                    fontSize: `${Math.max(8, config.ticketId.fontSize * scale)}px`,
                    color: config.ticketId.color,
                    fontWeight: config.ticketId.fontWeight,
                    textAlign: config.ticketId.align,
                    lineHeight: 1.15,
                    whiteSpace: 'nowrap',
                  }}
                  className={`font-mono ${
                    previewMode
                      ? ''
                      : `cursor-move px-1.5 py-0.5 rounded border ${
                          selectedField === 'ticketId'
                            ? 'border-emerald-600 bg-emerald-500/15 ring-2 ring-emerald-500/40'
                            : 'border-dashed border-gray-400/70 bg-white/30 hover:border-emerald-500'
                        }`
                  }`}
                >
                  {SAMPLE_DATA.ticketId}
                </div>

                {/* 3. Unit */}
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'unit')}
                  style={{
                    position: 'absolute',
                    left: `${config.unit.x}%`,
                    top: `${config.unit.y}%`,
                    transform: getTransform(config.unit.align),
                    fontSize: `${Math.max(8, config.unit.fontSize * scale)}px`,
                    color: config.unit.color,
                    fontWeight: config.unit.fontWeight,
                    textAlign: config.unit.align,
                    lineHeight: 1.15,
                    whiteSpace: 'nowrap',
                  }}
                  className={`${
                    previewMode
                      ? ''
                      : `cursor-move px-1.5 py-0.5 rounded border ${
                          selectedField === 'unit'
                            ? 'border-emerald-600 bg-emerald-500/15 ring-2 ring-emerald-500/40'
                            : 'border-dashed border-gray-400/70 bg-white/30 hover:border-emerald-500'
                        }`
                  }`}
                >
                  {SAMPLE_DATA.unit}
                </div>

                {/* 4. QR Code */}
                <div
                  onPointerDown={(e) => handlePointerDown(e, 'qr')}
                  style={{
                    position: 'absolute',
                    left: `${config.qr.x}%`,
                    top: `${config.qr.y}%`,
                    transform: 'translate(-50%, -50%)',
                    width: `${Math.max(24, (config.qr.size / 100) * canvasWidth)}px`,
                    height: `${Math.max(24, (config.qr.size / 100) * canvasWidth)}px`,
                  }}
                  className={`bg-white p-1 rounded-lg shadow-sm ${
                    previewMode
                      ? ''
                      : `cursor-move border-2 ${
                          selectedField === 'qr'
                            ? 'border-emerald-600 ring-2 ring-emerald-500/40'
                            : 'border-dashed border-gray-400 hover:border-emerald-500'
                        }`
                  }`}
                >
                  <QRCodeSVG
                    value={JSON.stringify({ ticketId: SAMPLE_DATA.ticketId, name: SAMPLE_DATA.name, unit: SAMPLE_DATA.unit })}
                    size={Math.max(20, (config.qr.size / 100) * canvasWidth - 8)}
                    level="H"
                    includeMargin={false}
                    fgColor="#0F5132"
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Field Controls */}
          <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-5">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                Select Field to Edit
              </span>
              <div className="grid grid-cols-2 gap-2">
                {FIELD_META.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedField(key)}
                    className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      selectedField === key
                        ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-emerald-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Position X% and Y% */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  X Position ({activeCfg.x}%)
                </label>
                <input
                  type="range"
                  min={2}
                  max={98}
                  step={0.5}
                  value={activeCfg.x}
                  onChange={(e) => updateField(selectedField, { x: Number(e.target.value) })}
                  className="w-full accent-emerald-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Y Position ({activeCfg.y}%)
                </label>
                <input
                  type="range"
                  min={2}
                  max={98}
                  step={0.5}
                  value={activeCfg.y}
                  onChange={(e) => updateField(selectedField, { y: Number(e.target.value) })}
                  className="w-full accent-emerald-700"
                />
              </div>
            </div>

            {selectedField === 'qr' ? (
              <div className="text-xs">
                <label className="block font-semibold text-gray-700 mb-1">
                  QR Code Width ({config.qr.size}% of template)
                </label>
                <input
                  type="range"
                  min={8}
                  max={45}
                  step={1}
                  value={config.qr.size}
                  onChange={(e) => updateField('qr', { size: Number(e.target.value) })}
                  className="w-full accent-emerald-700"
                />
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Font Size */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Font Size ({activeCfg.fontSize}px @ 800w)
                  </label>
                  <input
                    type="range"
                    min={12}
                    max={64}
                    step={1}
                    value={activeCfg.fontSize}
                    onChange={(e) => updateField(selectedField, { fontSize: Number(e.target.value) })}
                    className="w-full accent-emerald-700"
                  />
                </div>

                {/* Color & Font Weight */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Text Color</label>
                    <div className="flex items-center space-x-2 p-1.5 bg-gray-50 border border-gray-200 rounded-xl">
                      <input
                        type="color"
                        value={activeCfg.color}
                        onChange={(e) => updateField(selectedField, { color: e.target.value })}
                        className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent"
                      />
                      <span className="font-mono text-[11px] uppercase text-gray-700">
                        {activeCfg.color}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Font Weight</label>
                    <select
                      value={activeCfg.fontWeight}
                      onChange={(e) => updateField(selectedField, { fontWeight: e.target.value })}
                      className="w-full px-2.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-800 outline-none"
                    >
                      <option value="400">Regular (400)</option>
                      <option value="500">Medium (500)</option>
                      <option value="600">SemiBold (600)</option>
                      <option value="700">Bold (700)</option>
                      <option value="800">ExtraBold (800)</option>
                    </select>
                  </div>
                </div>

                {/* Alignment */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Alignment</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: 'left', icon: AlignLeft, label: 'Left' },
                      { val: 'center', icon: AlignCenter, label: 'Center' },
                      { val: 'right', icon: AlignRight, label: 'Right' },
                    ].map(({ val, icon: Icon, label }) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => updateField(selectedField, { align: val })}
                        className={`flex items-center justify-center space-x-1 py-2 rounded-xl border font-semibold transition-all ${
                          activeCfg.align === val
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setConfig(DEFAULT_CONFIG)}
                className="inline-flex items-center space-x-1 text-xs font-semibold text-gray-500 hover:text-gray-800"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Positions</span>
              </button>

              <button
                type="button"
                onClick={handleSaveConfig}
                disabled={saving}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Configuration</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
