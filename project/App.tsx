import React, { useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
const { HashRouter, Routes, Route } = ReactRouterDOM;
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, UserProvider, AppSettingsProvider, useAppSettings, ToastProvider, useToast } from './contexts';
import { Toast } from './components/common';

// Feature Pages
import AuthPage from './features/auth/AuthPage';
import UserChatPage from './features/chat/UserChatPage';
import MarjaSelectionPage from './features/chat/MarjaSelectionPage';
import TokenStorePage from './features/store/TokenStorePage';
import SettingsPage from './features/settings/SettingsPage';
import AdminPage from './features/admin/AdminPage';

// Admin Feature Page Components for Routing
import Dashboard from './features/admin/pages/Dashboard';
import UserManagement from './features/admin/pages/UserManagement';
import UserDetailsPage from './features/admin/pages/UserDetailsPage';
import Reports from './features/admin/pages/Reports';
import ReportDetailsPage from './features/admin/pages/ReportDetailsPage';
import Financials from './features/admin/pages/Financials';
import FinancialReports from './features/admin/pages/FinancialReports';
import SiteSettings from './features/admin/pages/SiteSettings';
import Analytics from './features/admin/pages/Analytics';
import ActionLog from './features/admin/pages/ActionLog';

const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  const { settings } = useAppSettings();
  const { toast, hideToast } = useToast();


  useEffect(() => {
    document.title = settings.seo.title || 'پلتفرم چت مدرن';

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

    let faviconLink = document.querySelector('link[rel="icon"]');
    if (!faviconLink) {
      faviconLink = document.createElement('link');
      faviconLink.setAttribute('rel', 'icon');
      document.head.appendChild(faviconLink);
    }
    faviconLink.setAttribute('href', settings.seo.faviconUrl || '/vite.svg');

  }, [settings.seo]);
  
  useEffect(() => {
    // ADVANCED FONT MANAGEMENT
    const { uploadedFamilies, application } = settings.fontSettings;
    const defaultFontFamily = "'Vazirmatn', sans-serif";

    // 1. Generate @font-face rules from uploaded files
    const fontFaceRules = uploadedFamilies.map(family => 
      family.files.map(file => 
        `@font-face {
          font-family: "${family.name}";
          src: url(${file.src}) format('woff2');
          font-weight: ${file.weight};
          font-style: ${file.style};
        }`
      ).join('\n')
    ).join('\n');

    // 2. Apply font families to sections
    const getFamilyCss = (familyId: string) => {
        if (familyId === 'default') return defaultFontFamily;
        const family = uploadedFamilies.find(f => f.id.toString() === familyId);
        return family ? `"${family.name}", ${defaultFontFamily}` : defaultFontFamily;
    };
    
    const bodyFont = getFamilyCss(application.body);
    const headingFont = getFamilyCss(application.headings);
    const chatInputFont = getFamilyCss(application.chatInput);
    const shareCardFont = getFamilyCss(application.shareCard);

    const applicationCss = `
      body, button, input:not(.font-mono), select, textarea { font-family: ${bodyFont}; }
      h1, h2, h3, h4, h5, h6 { font-family: ${headingFont}; }
      .chat-input-textarea { font-family: ${chatInputFont}; }
      .share-card { font-family: ${shareCardFont} !important; }
    `;

    // 3. Inject styles into the head
    const styleTagId = 'dynamic-font-styles';
    let styleEl = document.getElementById(styleTagId) as HTMLStyleElement;
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleTagId;
        document.head.appendChild(styleEl);
    }
    
    const finalCss = fontFaceRules + '\n' + applicationCss;
    if (styleEl.innerHTML !== finalCss) {
        styleEl.innerHTML = finalCss;
    }
    
  }, [settings.fontSettings]);

  return (
    <div className="text-gray-800 dark:text-gray-200">
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
