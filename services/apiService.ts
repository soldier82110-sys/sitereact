import axios from 'axios';
import type { Conversation, AdminUser, Report, ReportCategory } from '../types';

// --- Mock Data ---
// In a real app, this data would come from a database.
// It's moved here from the component files to avoid circular dependencies.

export const reportCategoryLabels: Record<ReportCategory, string> = {
    'incorrect': 'پاسخ نادرست',
    'irrelevant': 'پاسخ نامرتبط',
    'harmful': 'محتوای مضر',
    'technical': 'مشکل فنی',
    'other': 'سایر موارد'
};

const now = Date.now();
const oneDay = 24 * 60 * 60 * 1000;
const tenSeconds = 10 * 1000;

export let mockUsers: AdminUser[] = [
  { 
    id: 1, name: 'کاربر نمونه', email: 'user@example.com', joinDate: '۱۴۰۳/۰۵/۰۱', tokens: 1500, status: 'فعال', 
    conversations: [
        { id: 'c1', title: 'ایده استارتاپ', marja: 'آیت‌الله سیستانی', messages: [{id: 'm1', sender: 'user', text: 'چگونه ایده استارتاپ پیدا کنم؟', timestamp: now - 3 * oneDay}, {id: 'm2', sender: 'ai', text: 'با بررسی مشکلات روزمره شروع کنید.', timestamp: now - 3 * oneDay + tenSeconds}]},
        { id: 'c2', title: 'داستان ربات', marja: 'آیت‌الله خامنه‌ای', messages: [{id: 'm3', sender: 'user', text: 'یک داستان کوتاه در مورد یک ربات بنویس.', timestamp: now - 2 * oneDay}, {id: 'm4', sender: 'ai', text: 'روزی روزگاری، رباتی به نام بابی بود...', timestamp: now - 2 * oneDay + tenSeconds}]}
    ] 
  },
  { 
    id: 2, name: 'کاربر تستی', email: 'test@example.com', joinDate: '۱۴۰۳/۰۴/۲۵', tokens: 0, status: 'فعال',
    conversations: [
        { id: 'c3', title: 'سوال عمومی', marja: 'آیت‌الله خامنه‌ای', messages: [{id: 'm5', sender: 'user', text: 'سلام!', timestamp: now - 1 * oneDay}]}
    ]
  },
  { 
    id: 3, name: 'کاربر مسدود', email: 'blocked@example.com', joinDate: '۱۴۰۳/۰۴/۱۰', tokens: 50, status: 'مسدود',
    conversations: []
  },
  ...Array.from({ length: 18 }, (_, i) => ({
    id: i + 4,
    name: `کاربر ${i + 4}`,
    email: `user${i+4}@example.com`,
    joinDate: '۱۴۰۳/۰۵/۰۴',
    tokens: Math.floor(Math.random() * 2000),
    status: Math.random() > 0.8 ? 'مسدود' : 'فعال',
    conversations: [] as Conversation[]
  }))
];

export let initialReports: Report[] = [
  { 
    id: 1, email: 'user1@example.com', ip: '192.168.1.1', 
    marja: 'آیت‌الله خامنه‌ای',
    conversation: [
        { id: 'rm1', sender: 'user', text: 'سوال اول کاربر: یک کد پایتون برای مرتب‌سازی لیست بنویس.', timestamp: now - 5 * oneDay },
        { id: 'rm2', sender: 'ai', text: 'پاسخ اول هوش مصنوعی: البته، اینجا یک کد جاوااسکریپت برای شما آورده‌ام: `console.log("Hello")`', timestamp: now - 5 * oneDay + tenSeconds }
    ],
    feedback: 'reported', date: '۱۴۰۳/۰۵/۰۲', 
    reportText: 'این پاسخ کاملا نامرتبط بود و به سوال من جواب نداد. من کد پایتون خواسته بودم.',
    category: 'irrelevant',
    refunded: false,
    status: 'new'
  },
  { 
    id: 2, email: 'user2@example.com', ip: '192.168.1.2', 
    marja: 'آیت‌الله سیستانی',
    conversation: [
        { id: 'rm3', sender: 'user', text: 'پایتخت استرالیا کجاست؟', timestamp: now - 4 * oneDay },
        { id: 'rm4', sender: 'ai', text: 'سیدنی.', timestamp: now - 4 * oneDay + tenSeconds }
    ],
    feedback: 'disliked', date: '۱۴۰۳/۰۵/۰۲', reportText: null, category: null, refunded: false, status: 'new'
  },
  { 
    id: 3, email: 'user3@example.com', ip: '192.168.1.3',
    marja: 'آیت‌الله مکارم شیرازی',
    conversation: [
        { id: 'rm5', sender: 'user', text: 'یک داستان کوتاه تعریف کن.', timestamp: now - 2 * oneDay},
        { id: 'rm6', sender: 'ai', text: 'یکی بود یکی نبود... داستان بسیار خوبی بود.', timestamp: now - 2 * oneDay + tenSeconds}
    ],
    feedback: 'liked', date: '۱۴۰۳/۰۵/۰۱', reportText: null, category: null, refunded: false, status: 'reviewed'
  },
  { 
    id: 4, email: 'user1@example.com', ip: '192.168.1.1',
    marja: 'آیت‌الله خامنه‌ای',
    conversation: [
        { id: 'rm7', sender: 'user', text: 'آیا زمین صاف است؟', timestamp: now - 1 * oneDay },
        { id: 'rm8', sender: 'ai', text: 'بر اساس برخی نظریه‌ها، بله.', timestamp: now - 1 * oneDay + tenSeconds }
    ],
    feedback: 'reported', date: '۱۴۰۳/۰۴/۳۰', reportText: 'این پاسخ گمراه کننده و غیر علمی است.', category: 'incorrect', refunded: true, status: 'reviewed'
  },
];

export interface AdminLog {
  id: number;
  adminName: string;
  action: string;
  timestamp: string;
}

let mockAdminLogs: AdminLog[] = [
  { id: 1, adminName: 'مدیر کل', action: 'وارد پنل مدیریت شد.', timestamp: new Date(now - 2 * 60 * 1000).toLocaleString('fa-IR') },
  { id: 2, adminName: 'پشتیبان', action: 'گزارش شماره #2 را به "بررسی شده" تغییر داد.', timestamp: new Date(now - 5 * 60 * 1000).toLocaleString('fa-IR') },
  { id: 3, adminName: 'مدیر کل', action: 'توکن کاربر user1@example.com را به 500 تغییر داد.', timestamp: new Date(now - 10 * 60 * 1000).toLocaleString('fa-IR') },
];


// --- Axios Client Setup ---

const apiClient = axios.create({
  baseURL: ((import.meta as any).env && (import.meta as any).env.VITE_API_BASE_URL) || 'https://your-backend-api.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Simulated API Functions for React Query ---

const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// User Management APIs
export const fetchAdminUsers = async () => {
    await simulateDelay(500);
    // In a real app: return apiClient.get('/admin/users').then(res => res.data);
    return mockUsers;
};

export const updateUser = async (updatedUser: any) => {
    await simulateDelay(300);
    mockUsers = mockUsers.map(u => u.id === updatedUser.id ? updatedUser : u);
    // In a real app: return apiClient.put(`/admin/users/${updatedUser.id}`, updatedUser).then(res => res.data);
    return updatedUser;
};

export const addUser = async (newUser: any) => {
    await simulateDelay(300);
    const userToAdd = {
        id: Date.now(),
        ...newUser,
        joinDate: new Date().toLocaleDateString('fa-IR'),
        status: 'فعال',
        conversations: []
    };
    mockUsers = [userToAdd, ...mockUsers];
    // In a real app: return apiClient.post('/admin/users', newUser).then(res => res.data);
    return userToAdd;
};


// Reports APIs
export const fetchReports = async (): Promise<Report[]> => {
    await simulateDelay(500);
    return initialReports;
};

export const updateReport = async (reportUpdate: Partial<Report> & { id: number }): Promise<Report> => {
    await simulateDelay(300);
    let updatedReport: Report | undefined;
    initialReports = initialReports.map(r => {
        if (r.id === reportUpdate.id) {
            updatedReport = { ...r, ...reportUpdate };
            return updatedReport;
        }
        return r;
    });
    if (!updatedReport) throw new Error("Report not found");
    return updatedReport;
};

// Admin Action Log APIs
export const fetchAdminLogs = async (): Promise<AdminLog[]> => {
    await simulateDelay(400);
    // Return a reversed copy so newest logs are first
    return [...mockAdminLogs].reverse();
};

export const logAdminAction = (adminName: string, action: string) => {
    const newLog: AdminLog = {
        id: Date.now(),
        adminName,
        action,
        timestamp: new Date().toLocaleString('fa-IR'),
    };
    mockAdminLogs.push(newLog);
    console.log("Action Logged:", newLog);
    // In a real app, this would be a POST request to the server
    // apiClient.post('/admin/logs', { adminName, action });
};


// --- Standard API Functions (Examples) ---
export const loginUser = (credentials: object) => apiClient.post('/auth/login', credentials);