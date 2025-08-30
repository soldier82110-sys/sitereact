export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export type MessageSender = 'user' | 'ai';

export interface Message {
  id: string;
  text: string;
  sender: MessageSender;
  timestamp: number;
  status?: 'sending' | 'sent' | 'error';
}

export interface Marja {
  id: number;
  name: string;
  active: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  marja: string;
  messages: Message[];
}

export interface User {
  name: string;
  email: string;
  tokenBalance: number;
}

export interface AdminUser extends User {
    id: number;
    joinDate: string;
    status: string;
    conversations: Conversation[];
}

export type FeedbackStatus = 'liked' | 'disliked' | 'reported' | null;
export type ReportCategory = 'incorrect' | 'irrelevant' | 'harmful' | 'technical' | 'other';
export type ReportStatus = 'new' | 'reviewed';

export interface Report {
    id: number;
    email: string;
    ip: string;
    marja: string;
    conversation: Message[];
    feedback: FeedbackStatus;
    date: string;
    reportText: string | null;
    category: ReportCategory | null;
    refunded?: boolean;
    status: ReportStatus;
}

export interface TokenPackage {
    id: number;
    name: string;
    tokens: number;
    price: number;
    special?: boolean;
}

export interface DiscountCode {
    id: number;
    code: string;
    value: string; // e.g. "20%" or "10000"
    expiry: string;
    usageLimit: number;
    used: number;
}

export interface GiftCard {
    id: number;
    title: string;
    code: string;
    tokens: number;
    usedBy: string | null;
}

export interface Transaction {
    id: string;
    user: string; // email
    package: string;
    amount: number;
    status: 'موفق' | 'ناموفق' | 'در انتظار';
    date: string;
}

export interface SuggestedPrompt {
  id: number;
  text: string;
}

export interface SiteAdmin {
  id: number;
  name: string;
  email: string;
  role: 'Super Admin' | 'Admin' | 'Support';
}

export interface SelfHostedModel {
  id: number;
  name: string;
  apiUrl: string;
  apiKey?: string;
  status: 'idle' | 'testing' | 'success' | 'failed';
}

// Advanced Font Management Types
export interface FontFile {
  weight: number;
  style: 'normal' | 'italic';
  src: string; // base64 data URL
}

export interface UploadedFontFamily {
  id: number;
  name: string;
  files: FontFile[];
}

export interface FontApplicationSetting {
  body: string; // id of UploadedFontFamily or 'default'
  headings: string; // id of UploadedFontFamily or 'default'
  chatInput: string; // id of UploadedFontFamily or 'default'
  shareCard: string; // id of UploadedFontFamily or 'default'
}

export interface FontSettings {
  uploadedFamilies: UploadedFontFamily[];
  application: FontApplicationSetting;
}


// Global App Settings Types
export interface AISettings {
    systemInstruction: string;
    temperature: number;
    suggestedPrompts?: string[];
}

export interface SpiritualGiftSettings {
    enabled: boolean;
    cooldownSeconds: number;
    tokensPerClick: number;
    maxDailyTokens: number;
}

export interface SeoSettings {
    title: string;
    description: string;
    keywords: string;
    faviconUrl: string | null;
}

export interface LoginPageSettings {
    title: string;
    subtitle: string;
    logoUrl: string | null;
}

export interface AppSettings {
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
  shareCardTemplate: string;
  fontSettings: FontSettings;
}

export interface AdminLog {
  id: number;
  adminName: string;
  action: string;
  timestamp: string;
}