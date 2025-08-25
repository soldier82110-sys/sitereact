import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Theme, ThemeContextType, Marja } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useLocalStorage<Theme>('theme', () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? Theme.DARK : Theme.LIGHT;
    }
    return Theme.LIGHT;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT);
    root.classList.add(theme);
    // localStorage persistence is now handled by the useLocalStorage hook
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// --- User Context ---
interface User {
  name: string;
  email: string;
  tokenBalance: number;
}

interface UserContextType {
  user: User;
  deductToken: () => void;
  addToken: (amount: number) => void;
  updateUser: (newDetails: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useLocalStorage<User>('currentUser', {
    name: 'شما',
    email: '',
    tokenBalance: 1500,
  });

  const deductToken = () => {
    setUser(prevUser => ({
      ...prevUser,
      tokenBalance: prevUser.tokenBalance > 0 ? prevUser.tokenBalance - 1 : 0,
    }));
  };

  const addToken = (amount: number) => {
    setUser(prevUser => ({
      ...prevUser,
      tokenBalance: prevUser.tokenBalance + amount,
    }));
  };
  
  const updateUser = (newDetails: Partial<User>) => {
    setUser(prevUser => ({
      ...prevUser,
      ...newDetails
    }));
  };

  return (
    <UserContext.Provider value={{ user, deductToken, addToken, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// --- App Settings Context ---
interface AISettings {
    systemInstruction: string;
    temperature: number;
}

interface SpiritualGiftSettings {
    enabled: boolean;
    cooldownSeconds: number;
    tokensPerClick: number;
    maxDailyTokens: number;
}

interface SeoSettings {
    title: string;
    description: string;
    keywords: string;
    faviconUrl: string | null;
}

interface LoginPageSettings {
    title: string;
    subtitle: string;
    logoUrl: string | null;
}

interface AppSettings {
  logoUrl: string | null;
  adminAvatarUrl: string | null;
  defaultUserAvatarUrl: string | null;
  ai: AISettings;
  spiritualGift: SpiritualGiftSettings;
  defaultUserTokens: number;
  paymentGatewayLogo1: string;
  paymentGatewayLogo2: string;
  maraji: Marja[];
  seo: SeoSettings;
  loginPage: LoginPageSettings;
}

interface AppSettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export const AppSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>({
    logoUrl: null,
    adminAvatarUrl: null,
    defaultUserAvatarUrl: null,
    ai: {
        systemInstruction: "You are a helpful, spiritual assistant with a calm and modern tone. Respond in Persian.",
        temperature: 0.7,
    },
    spiritualGift: {
        enabled: true,
        cooldownSeconds: 60,
        tokensPerClick: 1,
        maxDailyTokens: 10,
    },
    defaultUserTokens: 100,
    paymentGatewayLogo1: `<svg class="h-12 w-auto" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.36 5.82a1.93 1.93 0 01.9-1.37 1.93 1.93 0 012.27.3l4.63 4.2a.48.48 0 00.68 0l2.3-2.1a.48.48 0 01.68 0l2.3 2.1a.48.48 0 00.68 0l4.63-4.2a1.93 1.93 0 013.17 1.07v10.36a1.93 1.93 0 01-1.93 1.93H4.29a1.93 1.93 0 01-1.93-1.93V5.82z" fill="#F4B400"/><path d="M2.36 5.82a1.93 1.93 0 01.9-1.37 1.93 1.93 0 012.27.3l4.63 4.2a.48.48 0 00.68 0l2.3-2.1a.48.48 0 01.68 0l2.3 2.1a.48.48 0 00.68 0l4.63-4.2a1.93 1.93 0 013.17 1.07" stroke="#222" stroke-width=".5" stroke-linecap="round" stroke-linejoin="round"/><path d="M2.36 5.82V16.18A1.93 1.93 0 004.29 18.1h15.42a1.93 1.93 0 001.93-1.93V5.82" stroke="#222" stroke-width=".5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    paymentGatewayLogo2: `<svg class="h-10 w-auto" viewBox="0 0 100 35" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="35" rx="4" fill="#E4002B"/><path d="M20.2 24.5V10.8h2.5v11.2l8-11.2h3.2v13.7h-2.5V13.3l-8 11.2h-3.2zM40.8 24.5h-9.5V10.8h9.5v2.3h-7v3.2h6.5v2.3h-6.5v4.6h7v2.3zM58.5 24.5h-2.7l-6.8-13.7h3l5.5 11 5.5-11h3l-6.8 13.7h-2.7zM79 24.5h-9.5V10.8H79v2.3h-7v3.2h6.5v2.3h-6.5v4.6h7v2.3z" fill="#fff"/></svg>`,
    maraji: [
        { id: 1, name: 'آیت‌الله خامنه‌ای', active: true },
        { id: 2, name: 'آیت‌الله سیستانی', active: true },
        { id: 3, name: 'آیت‌الله مکارم شیرازی', active: true },
        { id: 4, name: 'آیت‌الله وحید خراسانی', active: false },
    ],
    seo: {
        title: 'پلتفرم چت مدرن',
        description: 'یک پلتفرم چت مدرن و معنوی با استفاده از هوش مصنوعی.',
        keywords: 'چت, هوش مصنوعی, معنوی, مدرن',
        faviconUrl: null,
    },
    loginPage: {
      title: 'به پلتفرم خوش آمدید',
      subtitle: 'برای ورود به پنل ادمین از ایمیل <code class="dir-ltr inline-block bg-gray-200 dark:bg-navy-gray px-1 rounded text-sm">admin@example.com</code> و برای کاربر عادی از هر ایمیل دیگری استفاده کنید.',
      logoUrl: null,
    },
  });

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings,
      ai: {
        ...prevSettings.ai,
        ...newSettings.ai,
      },
      spiritualGift: {
        ...prevSettings.spiritualGift,
        ...newSettings.spiritualGift,
      },
      maraji: newSettings.maraji || prevSettings.maraji,
      seo: {
          ...prevSettings.seo,
          ...newSettings.seo,
      },
      loginPage: {
        ...prevSettings.loginPage,
        ...newSettings.loginPage
      }
    }));
  };

  return (
    <AppSettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettings = (): AppSettingsContextType => {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
};


// --- Toast Context ---
interface ToastState {
  message: string;
  type: 'success' | 'error';
  visible: boolean;
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error') => void;
  toast: ToastState;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'success', visible: false });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type, visible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };
  
  return (
    <ToastContext.Provider value={{ showToast, toast, hideToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};