import React, { useState, useRef, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import {
  apiUpdateSettings,
  apiUploadLogo,
  apiUploadPoster,
  apiChangePin,
} from '../utils/api';
import {
  Sliders,
  Image,
  Upload,
  Palette,
  KeyRound,
  Save,
  Check,
  AlertCircle,
  Loader2,
  Trash2,
  Link as LinkIcon,
} from 'lucide-react';

export default function SettingsTab() {
  const { settings, refreshSettings, resolveImageUrl } = useSettings();

  // Settings form state
  const [formData, setFormData] = useState({
    eventName: settings.eventName || '',
    eventSubtitle: settings.eventSubtitle || '',
    eventTheme: settings.eventTheme || '',
    eventDate: settings.eventDate || '',
    eventTime: settings.eventTime || '',
    venue: settings.venue || '',
    sectorName: settings.sectorName || '',
    theme: settings.theme || 'white-green',
    headingColor: settings.headingColor || '#111827',
    contactPhone: settings.contactPhone || '',
    contactEmail: settings.contactEmail || '',
  });

  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsNotice, setSettingsNotice] = useState({ type: '', text: '' });

  // File upload state
  const logoInputRef = useRef(null);
  const posterInputRef = useRef(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [logoUrlInput, setLogoUrlInput] = useState('');

  // PIN change state
  const [pinForm, setPinForm] = useState({ currentPin: '', newPin: '' });
  const [savingPin, setSavingPin] = useState(false);
  const [pinNotice, setPinNotice] = useState({ type: '', text: '' });

  // Sync form fields when settings finish loading from MongoDB
  useEffect(() => {
    setFormData({
      eventName: settings.eventName || '',
      eventSubtitle: settings.eventSubtitle || '',
      eventTheme: settings.eventTheme || '',
      eventDate: settings.eventDate || '',
      eventTime: settings.eventTime || '',
      venue: settings.venue || '',
      sectorName: settings.sectorName || '',
      theme: settings.theme || 'white-green',
      headingColor: settings.headingColor || '#111827',
      contactPhone: settings.contactPhone || '',
      contactEmail: settings.contactEmail || '',
    });
  }, [settings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsNotice({ type: '', text: '' });

    try {
      const res = await apiUpdateSettings(formData);
      if (res.success) {
        setSettingsNotice({ type: 'success', text: 'Event & site settings saved successfully!' });
        refreshSettings();
      } else {
        setSettingsNotice({ type: 'error', text: res.message || 'Failed to save settings' });
      }
    } catch (err) {
      setSettingsNotice({ type: 'error', text: err.message || 'Server error saving settings' });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleLogoFileChange = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setSettingsNotice({ type: 'error', text: 'Logo image must be 5MB or smaller.' });
      return;
    }

    setUploadingLogo(true);
    setSettingsNotice({ type: '', text: '' });

    try {
      const res = await apiUploadLogo(file);
      if (res.success) {
        setSettingsNotice({
          type: 'success',
          text: 'Website Logo uploaded and saved persistently in MongoDB!',
        });
        await refreshSettings();
      } else {
        setSettingsNotice({ type: 'error', text: res.message || 'Failed to upload logo' });
      }
    } catch (err) {
      setSettingsNotice({ type: 'error', text: err.message || 'Upload error' });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSetLogoUrl = async () => {
    if (!logoUrlInput.trim()) return;
    setUploadingLogo(true);
    setSettingsNotice({ type: '', text: '' });

    try {
      const res = await apiUpdateSettings({ logoUrl: logoUrlInput.trim() });
      if (res.success) {
        setLogoUrlInput('');
        setSettingsNotice({
          type: 'success',
          text: 'Website Logo URL saved across header and passes!',
        });
        await refreshSettings();
      } else {
        setSettingsNotice({ type: 'error', text: res.message || 'Failed to update logo URL' });
      }
    } catch (err) {
      setSettingsNotice({ type: 'error', text: err.message || 'Server error updating logo URL' });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveAsset = async (field, label) => {
    setSettingsNotice({ type: '', text: '' });
    try {
      const res = await apiUpdateSettings({ [field]: '' });
      if (res.success) {
        setSettingsNotice({ type: 'success', text: `${label} removed.` });
        await refreshSettings();
      }
    } catch (err) {
      setSettingsNotice({ type: 'error', text: err.message || `Failed to remove ${label}` });
    }
  };

  const handlePosterFileChange = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setSettingsNotice({ type: 'error', text: 'Poster image must be 5MB or smaller.' });
      return;
    }

    setUploadingPoster(true);
    setSettingsNotice({ type: '', text: '' });

    try {
      const res = await apiUploadPoster(file);
      if (res.success) {
        setSettingsNotice({
          type: 'success',
          text: 'Event Poster uploaded and saved persistently in MongoDB!',
        });
        await refreshSettings();
      } else {
        setSettingsNotice({ type: 'error', text: res.message || 'Failed to upload poster' });
      }
    } catch (err) {
      setSettingsNotice({ type: 'error', text: err.message || 'Upload error' });
    } finally {
      setUploadingPoster(false);
    }
  };

  const handleChangePin = async (e) => {
    e.preventDefault();
    if (!pinForm.currentPin || !pinForm.newPin) return;

    setSavingPin(true);
    setPinNotice({ type: '', text: '' });

    try {
      const res = await apiChangePin(pinForm.currentPin, pinForm.newPin);
      if (res.success) {
        setPinNotice({ type: 'success', text: 'Admin PIN updated successfully.' });
        setPinForm({ currentPin: '', newPin: '' });
      } else {
        setPinNotice({ type: 'error', text: res.message || 'Failed to change PIN' });
      }
    } catch (err) {
      setPinNotice({ type: 'error', text: err.message || 'Error changing PIN' });
    } finally {
      setSavingPin(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Sliders className="w-5 h-5 mr-2 text-emerald-700" />
          Logo, Theme & Event Poster Settings
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Customize website branding, uploaded logos, event posters, theme styles, and security PIN.
        </p>
      </div>

      {/* Global Status Alert */}
      {settingsNotice.text && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center ${
            settingsNotice.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {settingsNotice.type === 'success' ? (
            <Check className="w-4 h-4 mr-2 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 mr-2 text-red-600 flex-shrink-0" />
          )}
          <span>{settingsNotice.text}</span>
        </div>
      )}

      {/* SECTION 1: Brand Assets (Website Logo & Event Poster Upload) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Logo Card */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Image className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Website Logo</h3>
              <p className="text-[11px] text-gray-400">Updates Header, Admin bar & Ticket passes</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 pt-2">
            <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden relative flex-shrink-0">
              {settings.logoUrl ? (
                <img
                  src={resolveImageUrl(settings.logoUrl)}
                  alt="Logo Preview"
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <span className="font-extrabold text-xs text-gray-400">SSF LOGO</span>
              )}
            </div>

            <div className="space-y-2 flex-1 min-w-0">
              <input
                type="file"
                ref={logoInputRef}
                onChange={handleLogoFileChange}
                accept="image/*"
                className="hidden"
              />
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                >
                  {uploadingLogo ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>{uploadingLogo ? 'Uploading...' : 'Upload New Logo'}</span>
                </button>

                {settings.logoUrl && (
                  <button
                    type="button"
                    onClick={() => handleRemoveAsset('logoUrl', 'Website Logo')}
                    className="inline-flex items-center space-x-1 px-2.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-semibold transition-all"
                    title="Remove Logo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 pt-1">
                <div className="relative flex-1">
                  <LinkIcon className="w-3 h-3 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="url"
                    value={logoUrlInput}
                    onChange={(e) => setLogoUrlInput(e.target.value)}
                    placeholder="Or paste logo image URL..."
                    className="w-full pl-7 pr-2 py-1.5 text-[11px] bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSetLogoUrl}
                  disabled={uploadingLogo || !logoUrlInput.trim()}
                  className="px-2.5 py-1.5 bg-gray-800 hover:bg-black text-white rounded-lg text-[11px] font-semibold disabled:opacity-40"
                >
                  Set URL
                </button>
              </div>

              <p className="text-[10px] text-gray-400">PNG, JPG, SVG or WEBP (Max 5MB, saved in MongoDB)</p>
            </div>
          </div>
        </div>

        {/* Upload Event Poster Card */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Image className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Event Poster Image</h3>
              <p className="text-[11px] text-gray-400">
                Reflected on candidate registration & ticket passes
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
            <div className="w-full sm:w-44 min-h-[96px] rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 p-1.5 overflow-hidden relative flex-shrink-0">
              {settings.posterUrl ? (
                <img
                  src={resolveImageUrl(settings.posterUrl)}
                  alt="Poster Preview"
                  className="w-auto h-auto max-w-full max-h-44 object-contain rounded-xl"
                />
              ) : (
                <span className="text-[10px] text-gray-400 text-center px-2">No Poster</span>
              )}
            </div>

            <div className="space-y-2 flex-1 min-w-0">
              <input
                type="file"
                ref={posterInputRef}
                onChange={handlePosterFileChange}
                accept="image/*"
                className="hidden"
              />
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => posterInputRef.current?.click()}
                  disabled={uploadingPoster}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                >
                  {uploadingPoster ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>{uploadingPoster ? 'Uploading...' : 'Upload Event Poster'}</span>
                </button>

                {settings.posterUrl && (
                  <button
                    type="button"
                    onClick={() => handleRemoveAsset('posterUrl', 'Event Poster')}
                    className="inline-flex items-center space-x-1 px-2.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-semibold transition-all"
                    title="Remove Poster"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
              <p className="text-[10px] text-gray-400">Landscape or Portrait Banner (Max 5MB, saved in MongoDB)</p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Event Details & Theme Form */}
      <form onSubmit={handleSaveSettings} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-gray-900 flex items-center">
          <Palette className="w-4 h-4 mr-1.5 text-emerald-700" />
          Event Details & Portal Theme
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Sector Name */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Sector Name</label>
            <input
              type="text"
              name="sectorName"
              value={formData.sectorName}
              onChange={handleChange}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 outline-none"
            />
          </div>

          {/* Event Name */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Event Main Title</label>
            <input
              type="text"
              name="eventName"
              value={formData.eventName}
              onChange={handleChange}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 outline-none"
            />
          </div>

          {/* Event Theme / Motto */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Event Theme / Slogan</label>
            <input
              type="text"
              name="eventTheme"
              value={formData.eventTheme}
              onChange={handleChange}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 outline-none"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Subtitle / Council</label>
            <input
              type="text"
              name="eventSubtitle"
              value={formData.eventSubtitle}
              onChange={handleChange}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 outline-none"
            />
          </div>

          {/* Event Date */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Event Date</label>
            <input
              type="text"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleChange}
              placeholder="e.g. Sunday, 15 December 2026"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 outline-none"
            />
          </div>

          {/* Event Time */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Event Time</label>
            <input
              type="text"
              name="eventTime"
              value={formData.eventTime}
              onChange={handleChange}
              placeholder="e.g. 09:00 AM - 05:00 PM"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 outline-none"
            />
          </div>

          {/* Venue */}
          <div className="sm:col-span-2">
            <label className="block font-semibold text-gray-700 mb-1">Event Venue</label>
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              placeholder="e.g. Town Hall, Puthur, Dakshina Kannada"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 outline-none"
            />
          </div>

          {/* Main Program Heading Color */}
          <div className="sm:col-span-2">
            <label className="block font-semibold text-gray-700 mb-1.5">
              Main Program Heading Color
            </label>
            <div className="flex flex-wrap items-center gap-3 p-3 rounded-2xl border border-gray-200 bg-gray-50/70">
              <input
                type="color"
                name="headingColor"
                value={formData.headingColor || '#111827'}
                onChange={handleChange}
                className="w-10 h-10 rounded-xl border border-gray-300 cursor-pointer bg-white p-0.5"
              />
              <div className="flex-1 min-w-[140px]">
                <span className="text-xs font-mono font-bold text-gray-800 uppercase block">
                  {formData.headingColor || '#111827'}
                </span>
                <span className="text-[11px] text-gray-500">
                  Applies to the main hero heading on the public registration page
                </span>
              </div>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, headingColor: '#111827' }))}
                className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-xl text-[11px] font-semibold transition-colors"
              >
                Reset to Default
              </button>
            </div>
          </div>

          {/* Theme Palette Selection */}
          <div className="sm:col-span-2">
            <label className="block font-semibold text-gray-700 mb-1.5">
              Portal Theme Color Scheme
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'white-green', label: 'Classic White & Green', color: 'bg-emerald-800' },
                { id: 'emerald', label: 'Deep Emerald', color: 'bg-emerald-600' },
                { id: 'forest', label: 'Forest Green', color: 'bg-green-900' },
                { id: 'teal', label: 'Teal Green', color: 'bg-teal-800' },
              ].map((t) => (
                <label
                  key={t.id}
                  className={`flex items-center space-x-2 p-3 rounded-2xl border cursor-pointer transition-all ${
                    formData.theme === t.id
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-200'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="theme"
                    value={t.id}
                    checked={formData.theme === t.id}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <span className={`w-4 h-4 rounded-full ${t.color}`}></span>
                  <span className="font-semibold text-gray-800 text-xs">{t.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={savingSettings}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50"
        >
          {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Changes</span>
        </button>
      </form>

      {/* SECTION 3: Admin Security PIN Change */}
      <form onSubmit={handleChangePin} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-gray-900 flex items-center">
          <KeyRound className="w-4 h-4 mr-1.5 text-emerald-700" />
          Update Admin Security PIN
        </h3>
        <p className="text-xs text-gray-500">
          Change the numeric PIN required to unlock this /admin dashboard.
        </p>

        {pinNotice.text && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center ${
              pinNotice.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {pinNotice.type === 'success' ? (
              <Check className="w-4 h-4 mr-2 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
            )}
            <span>{pinNotice.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Current PIN</label>
            <input
              type="password"
              inputMode="numeric"
              value={pinForm.currentPin}
              onChange={(e) => setPinForm((prev) => ({ ...prev, currentPin: e.target.value }))}
              placeholder="Enter current PIN"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">New PIN</label>
            <input
              type="password"
              inputMode="numeric"
              value={pinForm.newPin}
              onChange={(e) => setPinForm((prev) => ({ ...prev, newPin: e.target.value }))}
              placeholder="Enter new 4+ digit PIN"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-200 outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={savingPin || !pinForm.currentPin || !pinForm.newPin}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
        >
          {savingPin ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
          <span>Update PIN</span>
        </button>
      </form>
    </div>
  );
}
