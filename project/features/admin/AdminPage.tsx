import React from 'react';
import { useTheme, useAppSettings, useUser, useToast } from '../../contexts';
import { Theme } from '../../types';
import { DashboardIcon, UsersIcon, ReportsIcon, SettingsIcon, SunIcon, MoonIcon, LogoutIcon, CreditCardIcon, CashIcon, AnalyticsIcon, ClipboardListIcon, FontIcon } from '../../components/icons';
import * as ReactRouterDOM from 'react-router-dom';
const { useNavigate, NavLink, Outlet } = ReactRouterDOM;

const ThemeToggleButton: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    return (
        <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-navy-gray-light transition-colors"
            aria-label={`تغییر به تم ${theme === Theme.LIGHT ? 'تیره' : 'روشن'}`}
        >
            {theme === Theme.LIGHT ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
        </button>
    );
};

const AdminPage: React.FC = () => {
    const navigate = useNavigate();
    const { settings } = useAppSettings();
    const { user } = useUser();
    const { showToast } = useToast();
    
    const isSuperAdmin = user.email === 'admin@example.com';

    const menuItems = [
        { id: 'dashboard', path: '/admin/dashboard', icon: DashboardIcon, label: 'داشبورد', visible: true },
        { id: 'users', path: '/admin/users', icon: UsersIcon, label: 'مدیریت کاربران', visible: true },
        { id: 'reports', path: '/admin/reports', icon: ReportsIcon, label: 'بازخورد کاربران', visible: true },
        { id: 'financials', path: '/admin/financials', icon: CreditCardIcon, label: 'مدیریت مالی', visible: true },
        { id: 'financial-reports', path: '/admin/financial-reports', icon: CashIcon, label: 'گزارشات مالی', visible: true },
        { id: 'analytics', path: '/admin/analytics', icon: AnalyticsIcon, label: 'تجزیه و تحلیل', visible: true },
        { id: 'action-log', path: '/admin/action-log', icon: ClipboardListIcon, label: 'گزارش اقدامات', visible: isSuperAdmin },
        { id: 'settings', path: '/admin/settings', icon: SettingsIcon, label: 'تنظیمات', visible: true },
    ] as const;
    
    const handleLogout = () => {
        showToast('با موفقیت خارج شدید. به امید دیدار!');
        navigate('/');
    };

  return (
    <div className="flex h-screen w-full bg-off-white dark:bg-navy-gray-dark text-gray-800 dark:text-gray-200">
      <nav className="flex flex-col w-72 bg-white dark:bg-navy-gray p-4 border-l border-gray-200 dark:border-navy-gray-light">
        <div className="text-center py-4 mb-6">
          <h1 className="text-2xl font-bold text-turquoise dark:text-turquoise-light">پنل مدیریت</h1>
        </div>
        <ul className="flex-1 space-y-2">
            {menuItems.filter(item => item.visible).map((item) => (
                <li key={item.id}>
                    <NavLink 
                        to={item.path}
                        end={item.path.endsWith('dashboard') || item.path.endsWith('/admin')}
                        className={({ isActive }) => `w-full flex items-center gap-4 p-3 rounded-lg transition-colors text-right relative ${
                            isActive 
                            ? 'bg-turquoise/10 dark:bg-turquoise/20 text-turquoise dark:text-turquoise-light font-semibold' 
                            : 'hover:bg-gray-100 dark:hover:bg-navy-gray-light'}`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && <div className="absolute right-0 top-2 bottom-2 w-1 bg-turquoise rounded-full"></div>}
                                <item.icon className="w-6 h-6" />
                                <span>{item.label}</span>
                            </>
                        )}
                    </NavLink>
                </li>
            ))}
        </ul>
        <div className="pt-4 border-t border-gray-200 dark:border-navy-gray-light">
             <button onClick={() => navigate('/chat')} className="w-full text-center text-sm text-gray-500 dark:text-gray-400 hover:text-turquoise mb-4">
                بازگشت به چت
            </button>
            <button onClick={handleLogout} className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-brick/10 text-brick">
              <LogoutIcon className="w-6 h-6" />
              <span>خروج</span>
            </button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between p-4 bg-white dark:bg-navy-gray border-b border-gray-200 dark:border-navy-gray-light">
          <div className="flex items-center gap-4">
              {settings.adminAvatarUrl ? (
                  <img src={settings.adminAvatarUrl} alt="Admin Avatar" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                  <div className="w-12 h-12 rounded-full bg-brick flex items-center justify-center text-white text-xl font-bold">
                      A
                  </div>
              )}
              <div>
                  <h3 className="font-semibold">مدیر سیستم</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
          </div>
          <div className="flex items-center gap-2">
             <ThemeToggleButton />
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto bg-gray-50 dark:bg-navy-gray-dark">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminPage;