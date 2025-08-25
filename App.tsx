import React, { useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
const { HashRouter, Routes, Route } = ReactRouterDOM;
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, UserProvider, AppSettingsProvider, useAppSettings, ToastProvider, useToast } from './contexts/ThemeContext';
import AuthPage from './pages/AuthPage';
import UserChatPage from './pages/UserChatPage';
import AdminPage from './pages/AdminPage';
import TokenStorePage from './pages/TokenStorePage';
import SettingsPage from './pages/SettingsPage';
import MarjaSelectionPage from './pages/MarjaSelectionPage';
import { Toast } from './components/common';

// Admin Page Components for Routing
import Dashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import UserDetailsPage from './pages/admin/UserDetailsPage';
import Reports from './pages/admin/Reports';
import ReportDetailsPage from './pages/admin/ReportDetailsPage';
import Financials from './pages/admin/Financials';
import FinancialReports from './pages/admin/FinancialReports';
import SiteSettings from './pages/admin/SiteSettings';
import Analytics from './pages/admin/Analytics';
import ActionLog from './pages/admin/ActionLog';

const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  const { settings } = useAppSettings();
  const { toast, hideToast } = useToast();


  useEffect(() => {
    document.title = settings.seo.title || 'پلتفرم چت مدرن';

    // Helper to create or update meta tags
    const updateMetaTag = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    updateMetaTag('description', settings.seo.description || '');
    updateMetaTag('keywords', settings.seo.keywords || '');

    // Update or create favicon
    let faviconLink = document.querySelector('link[rel="icon"]');
    if (!faviconLink) {
      faviconLink = document.createElement('link');
      faviconLink.setAttribute('rel', 'icon');
      document.head.appendChild(faviconLink);
    }
    faviconLink.setAttribute('href', settings.seo.faviconUrl || '/vite.svg');

  }, [settings.seo]);

  return (
    <div className="font-vazir text-slate-800 dark:text-slate-200">
      <HashRouter>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/select-marja" element={<MarjaSelectionPage />} />
          <Route path="/chat" element={<UserChatPage />} />
          <Route path="/tokens" element={<TokenStorePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          
          {/* Nested Admin Routes */}
          <Route path="/admin" element={<AdminPage />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="users/:userId" element={<UserDetailsPage />} />
            <Route path="reports" element={<Reports />} />
            <Route path="reports/:reportId" element={<ReportDetailsPage />} />
            <Route path="financials" element={<Financials />} />
            <Route path="financial-reports" element={<FinancialReports />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<SiteSettings />} />
            <Route path="action-log" element={<ActionLog />} />
          </Route>
        </Routes>
      </HashRouter>
       <Toast message={toast.message} onClose={hideToast} visible={toast.visible} type={toast.type} />
    </div>
  );
};


function App(): React.ReactNode {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <UserProvider>
            <AppSettingsProvider>
              <AppContent />
            </AppSettingsProvider>
          </UserProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;