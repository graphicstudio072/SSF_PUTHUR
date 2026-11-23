import React, { useState, useEffect } from 'react';
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
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Search,
  Sparkles,
  Ticket,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ChevronRight,
  Check,
} from 'lucide-react';

export default function RegisterPage() {
  const { settings, resolveImageUrl } = useSettings();

  // Units list from MongoDB
  const [units, setUnits] = useState([]);
  const [loadingUnits, setLoadingUnits] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    unit: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Ticket modal state
  const [ticketModalData, setTicketModalData] = useState(null);
  const [isNewRegistration, setIsNewRegistration] = useState(false);

  // Search existing ticket state
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Fetch dynamic units from backend
  useEffect(() => {
    const loadUnits = async () => {
      try {
        const res = await apiGetUnits();
        if (res.success && res.units) {
          setUnits(res.units);
          if (res.units.length > 0 && !formData.unit) {
            // default to first unit if not selected
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

    // Validation
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

    setSubmitting(true);

    try {
      const res = await apiRegisterCandidate({
        name: formData.name.trim(),
        phone: cleanPhone,
        unit: formData.unit,
      });

      if (res.success && res.candidate) {
        setIsNewRegistration(!res.alreadyRegistered);
        setTicketModalData(res.candidate);

        if (res.alreadyRegistered) {
          setFormSuccess(
            'You are already registered! Here is your official entry ticket.'
          );
        } else {
          setFormSuccess('Registration successful! Your ticket has been generated.');
          setFormData((prev) => ({ ...prev, name: '', phone: '' }));
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
        setSearchError('No ticket found for this ID or Mobile Number.');
      }
    } catch (err) {
      setSearchError(err.message || 'Ticket not found. Please verify details.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF9] text-gray-900">
      {/* Header (Strictly public, NO admin links) */}
      <Header isAdmin={false} />

      <main className="flex-1 pb-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-emerald-50/40 to-transparent pt-10 pb-12 sm:pt-14 sm:pb-16 border-b border-emerald-100/60">
          <div className="absolute inset-0 bg-[radial-gradient(#15803d_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.04] pointer-events-none"></div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
            {/* Sector Pill */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-900 border border-emerald-200 text-xs sm:text-sm font-semibold mb-5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span>{settings.sectorName || 'SSF PUTHUR SECTOR'}</span>
            </div>

            {/* Event Main Title */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight sm:leading-tight">
              {settings.eventName || 'SSF PUTHUR SECTOR SAHITYOTSAV & MEET 2026'}
            </h1>

            {/* Event Theme */}
            <p className="mt-3 text-base sm:text-lg text-emerald-800 font-medium italic">
              "{settings.eventTheme || 'Moral Revolution for Social Reformation'}"
            </p>

            {/* Event Key Highlights Grid */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left text-xs sm:text-sm">
              <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-emerald-100 shadow-soft flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Date</span>
                  <span className="font-semibold text-gray-800">{settings.eventDate || '15 Dec 2026'}</span>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-emerald-100 shadow-soft flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Time</span>
                  <span className="font-semibold text-gray-800">{settings.eventTime || '09:00 AM - 05:00 PM'}</span>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-emerald-100 shadow-soft flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Venue</span>
                  <span className="font-semibold text-gray-800 line-clamp-1">{settings.venue || 'Town Hall, Puthur'}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Container */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Col: Registration Form Card */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-elevated border border-emerald-100 relative">
              <div className="flex items-center justify-between pb-5 border-b border-gray-100">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
                    Candidate Entry
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Delegate Registration
                  </h2>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
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

              {/* Registration Form */}
              <form onSubmit={handleRegister} className="mt-6 space-y-4 text-left">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <User className="w-4 h-4" />
                    </div>
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
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50/70 border border-gray-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-emerald-100 focus:border-emerald-600 outline-none transition-all"
                    />
                  </div>
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    Your unique ticket ID & QR code will be linked to this number.
                  </span>
                </div>

                {/* Unit Dropdown (Populated from MongoDB 7 Units) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Unit Selection <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Building className="w-4 h-4" />
                    </div>
                    <select
                      name="unit"
                      required
                      value={formData.unit}
                      onChange={handleChange}
                      disabled={loadingUnits}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50/70 border border-gray-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-emerald-100 focus:border-emerald-600 outline-none transition-all appearance-none cursor-pointer"
                    >
                      {loadingUnits ? (
                        <option value="">Loading sector units...</option>
                      ) : (
                        units.map((u) => (
                          <option key={u._id} value={u.name}>
                            {u.name} {u.code ? `(${u.code})` : ''}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-900 hover:to-emerald-800 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-900/20 active:scale-[0.99] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
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
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Instant QR pass generation • Free & Secure Registration</span>
              </div>
            </div>

            {/* Right Col: Poster, Instructions & Ticket Lookup */}
            <div className="lg:col-span-5 space-y-6">
              {/* Event Poster Card if available */}
              {settings.posterUrl && (
                <div className="bg-white rounded-3xl p-3 shadow-soft border border-emerald-100 overflow-hidden">
                  <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-emerald-950/20 relative group">
                    <img
                      src={resolveImageUrl(settings.posterUrl)}
                      alt="Event Poster"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                      <span className="text-white font-semibold text-xs tracking-wide">
                        Official Event Announcement
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Already Registered? Quick Ticket Lookup */}
              <div className="bg-white rounded-3xl p-6 shadow-soft border border-emerald-100">
                <div className="flex items-center space-x-2.5 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Already Registered?</h3>
                    <p className="text-[11px] text-gray-500">Retrieve your pass anytime</p>
                  </div>
                </div>

                <form onSubmit={handleSearchTicket} className="mt-3 space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Enter Ticket ID (e.g. SSF-PUT-100201)"
                      className="w-full pl-3 pr-20 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 outline-none"
                    />
                    <button
                      type="submit"
                      disabled={searching || !searchQuery}
                      className="absolute right-1 top-1 bottom-1 px-3 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900 disabled:opacity-40"
                    >
                      {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Find'}
                    </button>
                  </div>
                  {searchError && (
                    <p className="text-[11px] text-red-600 mt-1">{searchError}</p>
                  )}
                </form>
              </div>

              {/* Event Guidelines Card */}
              <div className="bg-emerald-50/60 rounded-3xl p-6 border border-emerald-100/80">
                <h4 className="font-bold text-emerald-900 text-xs uppercase tracking-wider mb-2">
                  Important Guidelines
                </h4>
                <ul className="space-y-2 text-xs text-emerald-950/80">
                  <li className="flex items-start">
                    <Check className="w-3.5 h-3.5 mr-2 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>One registration per mobile number is permitted.</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-3.5 h-3.5 mr-2 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Download or screenshot your QR entry pass after registering.</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-3.5 h-3.5 mr-2 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Present your pass at the entrance scanner counter for instant verification.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Ticket Modal popup */}
      <TicketModal
        candidate={ticketModalData}
        isOpen={!!ticketModalData}
        onClose={() => setTicketModalData(null)}
        isNewRegistration={isNewRegistration}
      />

      {/* Footer (Clean, no admin link) */}
      <Footer />
    </div>
  );
}
