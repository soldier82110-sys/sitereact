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

export interface AdminUser {
    id: number;
    name: string;
    email: string;
    joinDate: string;
    tokens: number;
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