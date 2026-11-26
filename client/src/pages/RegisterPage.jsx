import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import TicketModal from '../components/TicketModal';
import { useSettings } from '../context/SettingsContext';
import {
  apiGetUnits,
  apiRegisterCandidate,
  apiGetCandidateByTicket,
} from '../utils/api';
import {
  User,
  Phone,
  Building,
  Briefcase,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Search,
  Ticket,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ChevronRight,
  ArrowDown,
  Check,
} from 'lucide-react';

const ROLES = [
  'President',
  'General Secretary',
  'Executive Secretary',
  'QD',
  'GD',
  "Let's Smile",
  'Wefi',
  'Smart Core',
  'Public Relation',
  'Secretariat Member',
];

export default function RegisterPage() {
  const { settings, resolveImageUrl } = useSettings();

  const [units, setUnits] = useState([]);
  const [loadingUnits, setLoadingUnits] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    unit: '',
    role: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const [ticketModalData, setTicketModalData] = useState(null);
  const [isNewRegistration, setIsNewRegistration] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const registrationFormRef = useRef(null);

  const scrollToRegistrationForm = () => {
    registrationFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const loadUnits = async () => {
      try {
        const res = await apiGetUnits();
        if (res.success && res.units) {
          setUnits(res.units);
          if (res.units.length > 0 && !formData.unit) {
            setFormData((prev) => ({ ...prev, unit: res.units[0].name }));
          }
        }
      } catch (err) {
        console.warn('Failed to load units:', err);
      } finally {
        setLoadingUnits(false);
      }
    };
    loadUnits();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formData.name.trim()) {
      setFormError('Please enter your full name');
      return;
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!formData.unit) {
      setFormError('Please select your unit');
      return;
    }

    if (!formData.role) {
      setFormError('Please select your role');
      return;
    }

    setSubmitting(true);

    try {
      const res = await apiRegisterCandidate({
        name: formData.name.trim(),
        phone: cleanPhone,
        unit: formData.unit,
        role: formData.role,
      });

      if (res.success && res.candidate) {
        setIsNewRegistration(!res.alreadyRegistered);
        setTicketModalData(res.candidate);

        if (res.alreadyRegistered) {
          setFormSuccess('You are already registered! Here is your official entry ticket.');
        } else {
          setFormSuccess('Registration successful! Your ticket has been generated.');
          setFormData((prev) => ({ ...prev, name: '', phone: '', role: '' }));
        }
      } else {
        setFormError(res.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setFormError(err.message || 'Server connection error during registration.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearchTicket = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchError('');

    try {
      const res = await apiGetCandidateByTicket(searchQuery.trim());
      if (res.success && res.candidate) {
        setIsNewRegistration(false);
        setTicketModalData(res.candidate);
        setSearchQuery('');
      } else {
        setSearchError('No ticket found for this ID.');
      }
    } catch (err) {
      setSearchError(err.message || 'Ticket not found. Please verify details.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF9] text-gray-900">
      <Header isAdmin={false} />

      <main className="flex-1 pb-12">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-emerald-50/40 to-transparent pt-8 pb-10 sm:pt-14 sm:pb-16 border-b border-emerald-100/60">
          <div className="absolute inset-0 bg-[radial-gradient(#15803d_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.04] pointer-events-none"></div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-900 border border-emerald-200 text-xs sm:text-sm font-semibold mb-4 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span>{settings.sectorName || 'SSF PUTHUR SECTOR'}</span>
            </div>

            <h1
              style={{ color: settings.headingColor || '#111827' }}
              className="text-2xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] px-1"
            >
              {settings.eventName || 'SSF PUTHUR SECTOR SAHITYOTSAV & MEET 2026'}
            </h1>

            <p className="mt-3 text-sm sm:text-lg text-emerald-800 font-medium italic px-2">
              "{settings.eventTheme || 'Moral Revolution for Social Reformation'}"
            </p>

            {/* 4-Block Grid (2 rows x 2 columns): Date, Time, Venue, Register Now */}
            <div className="mt-7 grid grid-cols-2 gap-2.5 sm:gap-3.5 max-w-2xl mx-auto text-left text-xs sm:text-sm items-stretch">
              {[
                { icon: Calendar, label: 'Date', value: settings.eventDate || '15 Dec 2026' },
                { icon: Clock, label: 'Time', value: settings.eventTime || '09:00 AM - 05:00 PM' },
                { icon: MapPin, label: 'Venue', value: (settings.venue || 'Town Hall, Puthur').split(',')[0] },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-white/95 backdrop-blur-sm p-3 sm:p-4 rounded-2xl border border-emerald-100 shadow-soft flex items-center space-x-2.5 sm:space-x-3 h-full min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">{label}</span>
                    <span className="font-semibold text-gray-800 truncate block">{value}</span>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={scrollToRegistrationForm}
                className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-900 hover:to-emerald-800 text-white shadow-md shadow-emerald-900/20 flex items-center justify-between space-x-2 h-full active:scale-[0.98] transition-all touch-manipulation text-left"
              >
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-emerald-200 block">
                    Delegate Entry
                  </span>
                  <span className="font-extrabold text-xs sm:text-base block truncate">
                    Register Now
                  </span>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                  <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-6 space-y-6">
          {/* Layered Accented Event Poster Card (directly below Event Details, above Delegate Registration) */}
          {settings.posterUrl && (
            <div className="relative">
              {/* Outer layered emerald accent card */}
              <div className="absolute -inset-1.5 sm:-inset-2 bg-gradient-to-br from-emerald-800/15 via-emerald-500/10 to-emerald-900/15 rounded-[2rem] -rotate-1 pointer-events-none"></div>
              <div className="relative bg-white rounded-3xl p-3 sm:p-4 shadow-elevated border border-emerald-100">
                <div className="rounded-2xl overflow-hidden bg-emerald-50/40 border border-emerald-100/70">
                  <img
                    src={resolveImageUrl(settings.posterUrl)}
                    alt="Event Poster"
                    className="w-full h-auto max-h-[560px] object-contain mx-auto block"
                  />
                </div>
                <div className="mt-2.5 px-1 flex items-center justify-between text-[11px] text-emerald-900/80 font-semibold">
                  <span className="uppercase tracking-wider">Official Event Poster</span>
                  <span className="text-emerald-700">{settings.sectorName || 'SSF PUTHUR SECTOR'}</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Registration Form */}
            <div
              ref={registrationFormRef}
              className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-8 shadow-elevated border border-emerald-100 scroll-mt-24"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
                    Candidate Entry
                  </span>
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                    Delegate Registration
                  </h2>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <Ticket className="w-5 h-5" />
                </div>
              </div>

              {formSuccess && (
                <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs sm:text-sm flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {formError && (
                <div className="mt-4 p-3.5 bg-red-50 border border-red-200 text-red-900 rounded-2xl text-xs sm:text-sm flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="mt-5 space-y-4 text-left">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Mohammed Fayis"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50/70 border border-gray-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-emerald-100 focus:border-emerald-600 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      inputMode="numeric"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50/70 border border-gray-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-emerald-100 focus:border-emerald-600 outline-none transition-all"
                    />
                  </div>
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    Your unique ticket ID & QR code will be linked to this number.
                  </span>
                </div>

                {/* Unit Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      name="unit"
                      required
                      value={formData.unit}
                      onChange={handleChange}
                      disabled={loadingUnits}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50/70 border border-gray-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-emerald-100 focus:border-emerald-600 outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="">
                        {loadingUnits ? 'Loading units...' : '— Select Your Unit —'}
                      </option>
                      {units.map((u) => (
                        <option key={u._id} value={u.name}>
                          {u.name} {u.code ? `(${u.code})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Role Dropdown — REQUIRED NEW FIELD */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      name="role"
                      required
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50/70 border border-gray-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-emerald-100 focus:border-emerald-600 outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="">— Select Your Role —</option>
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-900 hover:to-emerald-800 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-900/20 active:scale-[0.99] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 touch-manipulation"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Generating Entry Pass...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Registration & Get Ticket</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center space-x-2 text-xs text-gray-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Instant QR pass generation • Free & Secure Registration</span>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-5 space-y-5">
              {/* Quick Ticket Lookup */}
              <div className="bg-white rounded-3xl p-5 shadow-soft border border-emerald-100">
                <div className="flex items-center space-x-2.5 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Already Registered?</h3>
                    <p className="text-[11px] text-gray-500">Retrieve your pass anytime</p>
                  </div>
                </div>

                <form onSubmit={handleSearchTicket} className="space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Enter Ticket ID (e.g. SSF-PUT-100201)"
                      className="w-full pl-3 pr-16 py-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 outline-none"
                    />
                    <button
                      type="submit"
                      disabled={searching || !searchQuery}
                      className="absolute right-1 top-1 bottom-1 px-3 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900 disabled:opacity-40 touch-manipulation"
                    >
                      {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Find'}
                    </button>
                  </div>
                  {searchError && (
                    <p className="text-[11px] text-red-600">{searchError}</p>
                  )}
                </form>
              </div>

              {/* Guidelines */}
              <div className="bg-emerald-50/60 rounded-3xl p-5 border border-emerald-100/80">
                <h4 className="font-bold text-emerald-900 text-xs uppercase tracking-wider mb-2.5">
                  Important Guidelines
                </h4>
                <ul className="space-y-2 text-xs text-emerald-950/80">
                  {[
                    'One registration per mobile number is permitted.',
                    'Download or screenshot your QR entry pass after registering.',
                    'Present your pass at the entrance scanner counter for instant verification.',
                  ].map((text, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="w-3.5 h-3.5 mr-2 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <TicketModal
        candidate={ticketModalData}
        isOpen={!!ticketModalData}
        onClose={() => setTicketModalData(null)}
        isNewRegistration={isNewRegistration}
      />

      <Footer />
    </div>
  );
}
