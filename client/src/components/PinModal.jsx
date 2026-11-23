import React, { useState } from 'react';
import { Lock, KeyRound, AlertCircle, ArrowRight, Loader2, Delete } from 'lucide-react';
import { apiVerifyPin, setAdminToken } from '../utils/api';

export default function PinModal({ onAuthenticated }) {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleKeyPress = (digit) => {
    if (pin.length < 8) {
      setPin((prev) => prev + digit);
      setError('');
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!pin.trim()) {
      setError('Please enter the Admin PIN');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await apiVerifyPin(pin.trim());
      if (res.success && res.token) {
        setAdminToken(res.token);
        onAuthenticated();
      } else {
        setError(res.message || 'Incorrect PIN');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify PIN.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/80 backdrop-blur-md">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-8 shadow-2xl border border-emerald-100 text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Lock Icon */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-900/30 ring-4 ring-emerald-50">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold text-gray-900">Admin Authentication</h2>
        <p className="text-xs text-gray-500 mt-1 mb-5">
          Enter your secure 4-digit PIN to access the SSF Puthur Sector Dashboard.
        </p>

        {/* PIN Display Dots / Input */}
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <input
              type="password"
              inputMode="numeric"
              maxLength={8}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError('');
              }}
              placeholder="••••"
              className="w-full text-center tracking-[0.5em] text-2xl font-bold font-mono py-2.5 px-4 rounded-2xl border border-gray-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 outline-none transition-all bg-gray-50/50"
              autoFocus
            />
          </div>

          {error && (
            <div className="flex items-center justify-center text-xs text-red-600 bg-red-50 p-2 rounded-xl mb-4 border border-red-100 animate-shake">
              <AlertCircle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeyPress(digit)}
                className="py-3 text-lg font-semibold text-gray-800 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-800 border border-gray-200 hover:border-emerald-300 rounded-xl transition-all active:scale-95 shadow-sm"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="py-3 text-xs font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
            >
              CLEAR
            </button>
            <button
              type="button"
              onClick={() => handleKeyPress(0)}
              className="py-3 text-lg font-semibold text-gray-800 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-800 border border-gray-200 hover:border-emerald-300 rounded-xl transition-all active:scale-95 shadow-sm"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="py-3 flex items-center justify-center text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
              title="Delete"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !pin}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-white font-semibold bg-emerald-800 hover:bg-emerald-900 active:scale-98 transition-all shadow-md shadow-emerald-900/20 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Unlock Dashboard</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </form>

        <p className="text-[11px] text-gray-400 mt-4">
          Local default testing PIN: <span className="font-mono font-semibold text-gray-600">7860</span>
        </p>
      </div>
    </div>
  );
}
