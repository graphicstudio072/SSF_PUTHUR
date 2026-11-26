import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiGetSettings, resolveImageUrl } from '../utils/api';

const SettingsContext = createContext(null);

export const defaultSettings = {
  eventName: 'SSF PUTHUR SECTOR SAHITYOTSAV & REPRESENTATIVE MEET 2026',
  eventSubtitle: 'Sunni Students Federation • Puthur Sector Council',
  eventTheme: 'Moral Revolution for Social Reformation',
  eventDate: 'Sunday, 15 December 2026',
  eventTime: '09:00 AM - 05:00 PM',
  venue: 'Town Hall, Puthur, Dakshina Kannada',
  sectorName: 'SSF PUTHUR SECTOR',
  logoUrl: '',
  posterUrl: '',
  theme: 'white-green',
  headingColor: '#111827',
  ticketTemplateUrl: '',
  ticketTemplateConfig: {
    qr: { x: 74, y: 58, size: 22 },
    name: { x: 8, y: 42, fontSize: 28, color: '#111827', align: 'left', fontWeight: '700' },
    ticketId: { x: 8, y: 54, fontSize: 20, color: '#0F5132', align: 'left', fontWeight: '700' },
    unit: { x: 8, y: 65, fontSize: 20, color: '#374151', align: 'left', fontWeight: '600' },
  },
  contactPhone: '+91 97400 00000',
  contactEmail: 'ssfputhursector@gmail.com',
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await apiGetSettings();
      if (res.success && res.settings) {
        setSettings({ ...defaultSettings, ...res.settings });
      }
    } catch (err) {
      console.warn('Using default settings (backend may be loading):', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings: fetchSettings,
        resolveImageUrl,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
