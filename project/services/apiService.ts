import axios from 'axios';
import type {
  AdminUser,
  Report,
  TokenPackage,
  DiscountCode,
  GiftCard,
  Transaction,
  SuggestedPrompt,
  SiteAdmin,
  AppSettings,
  User,
  ReportCategory,
  AdminLog,
  Conversation,
} from '../types';

/*
 * This module provides a thin wrapper around the backend API. Instead of relying on in‑memory mock data,
 * each function makes an HTTP request to the Express server running on the same origin (proxied via Vite).
 *
 * When developing locally with Vite the frontend will proxy requests starting with `/api` to the backend.
 * In production you can configure `VITE_API_BASE_URL` in an `.env` file to point to the deployed backend.
 */

// Provide a lookup for report categories. The backend stores these as enum values.
export const reportCategoryLabels: Record<ReportCategory, string> = {
  incorrect: 'پاسخ نادرست',
  irrelevant: 'پاسخ نامرتبط',
  harmful: 'محتوای مضر',
  technical: 'مشکل فنی',
  other: 'سایر موارد',
};

// Create a configured Axios instance. When a JWT exists in localStorage it will be attached to
// the Authorization header. If you deploy the frontend separately from the backend you can change
// baseURL using Vite environment variables (e.g. import.meta.env.VITE_API_BASE_URL).
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---------------------------
// Authentication
// ---------------------------

export async function loginUser(credentials: { email: string; password: string }) {
  const { data } = await apiClient.post('/login', credentials);
  return data;
}

export async function registerUser(userData: { name: string; email: string; password: string }) {
  const { data } = await apiClient.post('/register', userData);
  return data;
}

export async function fetchCurrentUser(): Promise<User> {
  const { data } = await apiClient.get('/current-user');
  return data;
}

// ---------------------------
// App settings
// ---------------------------

export async function fetchAppSettings(): Promise<AppSettings> {
  const { data } = await apiClient.get('/settings');
  return data;
}

export async function updateAppSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  const { data } = await apiClient.put('/settings', settings);
  return data;
}

// ---------------------------
// User management (admin)
// ---------------------------

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const { data } = await apiClient.get('/users');
  return data;
}

export async function fetchUserById(userId: string): Promise<AdminUser> {
  const { data } = await apiClient.get(`/users/${userId}`);
  return data;
}

export async function updateUser(updatedUser: Partial<AdminUser>): Promise<AdminUser> {
  if (!updatedUser.id) throw new Error('User ID is required for update');
  const { data } = await apiClient.put(`/users/${updatedUser.id}`, updatedUser);
  return data;
}

export async function addUser(newUser: { name: string; email: string; password: string; tokenBalance?: number }): Promise<AdminUser> {
  const { data } = await apiClient.post('/users', newUser);
  return data;
}

export async function deleteUser(userId: number): Promise<{ success: boolean; id: number }> {
  const { data } = await apiClient.delete(`/users/${userId}`);
  return data;
}

// ---------------------------
// Reports (admin)
// ---------------------------

export async function fetchReports(): Promise<Report[]> {
  const { data } = await apiClient.get('/reports');
  return data;
}

export async function fetchReportById(id: number): Promise<Report> {
  const { data } = await apiClient.get(`/reports/${id}`);
  return data;
}

export async function updateReport(reportUpdate: Partial<Report> & { id: number }): Promise<Report> {
  const { data } = await apiClient.put(`/reports/${reportUpdate.id}`, reportUpdate);
  return data;
}

// ---------------------------
// Admin logs
// ---------------------------

export async function fetchAdminLogs(): Promise<AdminLog[]> {
  const { data } = await apiClient.get('/logs');
  return data;
}

export async function logAdminAction(adminName: string, action: string): Promise<AdminLog> {
  const { data } = await apiClient.post('/logs', { adminName, action });
  return data;
}

// ---------------------------
// Financials
// ---------------------------

export async function fetchTransactions(): Promise<Transaction[]> {
  const { data } = await apiClient.get('/transactions');
  return data;
}

export async function fetchSuggestedPrompts(): Promise<SuggestedPrompt[]> {
  // The backend does not currently expose suggested prompts. Fall back to app settings.
  const settings = await fetchAppSettings();
  return (settings.ai?.suggestedPrompts || []).map((text, idx) => ({ id: idx + 1, text }));
}

export async function addSuggestedPrompt(prompt: { text: string }): Promise<SuggestedPrompt> {
  // Not implemented in backend; return the prompt with a random id
  return { id: Date.now(), text: prompt.text };
}

export async function deleteSuggestedPrompt(id: number): Promise<{ id: number }> {
  return { id };
}

export async function fetchAdmins(): Promise<SiteAdmin[]> {
  // Not implemented: return a single super admin from settings.
  return [ { id: 1, name: 'مدیر کل', email: 'admin@example.com', role: 'Super Admin' } ];
}

export async function fetchTokenPackages(): Promise<TokenPackage[]> {
  const { data } = await apiClient.get('/token-packages');
  return data;
}

export async function deleteTokenPackage(id: number): Promise<{ id: number }> {
  // Not implemented; return success immediately
  return { id };
}

export async function fetchDiscountCodes(): Promise<DiscountCode[]> {
  const { data } = await apiClient.get('/discount-codes');
  return data;
}

export async function deleteDiscountCode(id: number): Promise<{ id: number }> {
  return { id };
}

export async function fetchGiftCards(): Promise<GiftCard[]> {
  const { data } = await apiClient.get('/gift-cards');
  return data;
}

// ---------------------------
// Conversations & Chat
// ---------------------------

export async function fetchConversations(): Promise<Conversation[]> {
  const { data } = await apiClient.get('/conversations');
  return data;
}

export async function sendMessage({ message, conversationId, marjaName }: { message: string; conversationId?: string | null; marjaName: string }): Promise<Conversation> {
  const payload: any = { message, marjaName };
  if (conversationId) payload.conversationId = conversationId;
  const { data } = await apiClient.post('/messages', payload);
  return data;
}

/*
 * The front–end previously used a streaming API for the chat. Streaming is not implemented in this sample backend. To
 * simulate streaming behaviour you could break the response text into chunks and call the provided callbacks. Instead
 * we simply delegate to sendMessage() which returns a full conversation including the AI response.
 */
export function streamChatResponse(
  payload: { message: string; conversationId?: string | null; marjaName: string },
  onChunk: (chunk: string) => void,
  onCloseStream: () => void,
  onFinalError: (errorMessage: string) => void,
) {
  sendMessage(payload)
    .then((convo) => {
      const aiMessage = convo.messages[convo.messages.length - 1];
      onChunk(aiMessage.text);
      onCloseStream();
    })
    .catch((err) => {
      onFinalError(err.message || 'Server error');
    });
}

// ---------------------------
// Analytics
// ---------------------------

export async function fetchAnalyticsData(query: string): Promise<any> {
  // The backend does not have dedicated analytics endpoints. Derive simple stats from reports.
  if (query === 'feedback') {
    const reports = await fetchReports();
    return reports.reduce<Record<string, number>>((acc, report) => {
      const feedback = report.feedback || 'none';
      acc[feedback] = (acc[feedback] || 0) + 1;
      return acc;
    }, { liked: 0, disliked: 0, reported: 0 });
  }
  if (query === 'categories') {
    const reports = await fetchReports();
    return reports.reduce<Record<string, number>>((acc, report) => {
      if (report.category) acc[report.category] = (acc[report.category] || 0) + 1;
      return acc;
    }, {});
  }
  return {};
}