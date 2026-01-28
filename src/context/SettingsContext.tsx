
import React, { createContext, useContext, useState } from 'react';

interface Settings {
  enableNewsletter: boolean;
  enableCurrencySelector: boolean;
  enablePromoCodes: boolean;
  storeName: string;
  supportEmail: string;
  showTopBar: boolean;
  topBarMessage: string;
}

interface SettingsContextType {
  settings: Settings;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const DEFAULT_SETTINGS: Settings = {
  enableNewsletter: true,
  enableCurrencySelector: true,
  enablePromoCodes: true,
  storeName: 'Himalaya Vitality',
  supportEmail: 'support@himalayavitality.com',
  showTopBar: true,
  topBarMessage: 'Fall Sale: Free Shipping on 3-Jar Bundles'
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  // Removed localStorage loading/saving effects.

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
