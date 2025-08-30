import type { Conversation, AdminUser, Report, ReportCategory, TokenPackage, DiscountCode, GiftCard, Transaction, SuggestedPrompt, SiteAdmin, SelfHostedModel, AdminLog } from '../types';

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
    id: 1, name: 'کاربر نمونه', email: 'user@example.com', joinDate: '۱۴۰۳/۰۵/۰۱', 
    tokenBalance: 1500, status: 'فعال', 
    conversations: [
        { id: 'c1', title: 'ایده استارتاپ', marja: 'آیت‌الله سیستانی', messages: [{id: 'm1', sender: 'user', text: 'چگونه ایده استارتاپ پیدا کنم؟', timestamp: now - 3 * oneDay}, {id: 'm2', sender: 'ai', text: 'با بررسی مشکلات روزمره شروع کنید.', timestamp: now - 3 * oneDay + tenSeconds}]},
        { id: 'c2', title: 'داستان ربات', marja: 'آیت‌الله خامنه‌ای', messages: [{id: 'm3', sender: 'user', text: 'یک داستان کوتاه در مورد یک ربات بنویس.', timestamp: now - 2 * oneDay}, {id: 'm4', sender: 'ai', text: 'روزی روزگاری، رباتی به نام بابی بود...', timestamp: now - 2 * oneDay + tenSeconds}]}
    ] 
  },
  { 
    id: 2, name: 'کاربر تستی', email: 'test@example.com', joinDate: '۱۴۰۳/۰۴/۲۵', 
    tokenBalance: 0, status: 'فعال',
    conversations: [
        { id: 'c3', title: 'سوال عمومی', marja: 'آیت‌الله خامنه‌ای', messages: [{id: 'm5', sender: 'user', text: 'سلام!', timestamp: now - 1 * oneDay}]}
    ]
  },
  { 
    id: 3, name: 'کاربر مسدود', email: 'blocked@example.com', joinDate: '۱۴۰۳/۰۴/۱۰', 
    tokenBalance: 50, status: 'مسدود',
    conversations: []
  },
  ...Array.from({ length: 18 }, (_, i) => ({
    id: i + 4,
    name: `کاربر ${i + 4}`,
    email: `user${i+4}@example.com`,
    joinDate: '۱۴۰۳/۰۵/۰۴',
    tokenBalance: Math.floor(Math.random() * 2000),
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
    id: 4, email: 'user4@example.com', ip: '192.168.1.4', 
    marja: 'آیت‌الله خامنه‌ای',
    conversation: [
        { id: 'rm7', sender: 'user', text: 'سوال در مورد خمس.', timestamp: now - 7 * oneDay },
        { id: 'rm8', sender: 'ai', text: 'پاسخ در مورد خمس.', timestamp: now - 7 * oneDay + tenSeconds }
    ],
    feedback: 'reported', date: '۱۴۰۳/۰۴/۲۹', 
    reportText: 'پاسخ ارائه شده با فتوای مرجع تقلید من مغایرت داشت.',
    category: 'incorrect',
    refunded: true,
    status: 'reviewed'
  }
];

export const mockAdminLogs: AdminLog[] = [
  { id: 1, adminName: 'مدیر کل', action: 'کاربر blocked@example.com را مسدود کرد.', timestamp: '۱۴۰۳/۰۵/۰۳, ۱۱:۳۰:۱۵' },
  { id: 2, adminName: 'مدیر کل', action: 'تنظیمات هدیه معنوی را به‌روزرسانی کرد.', timestamp: '۱۴۰۳/۰۵/۰۲, ۱۸:۰۵:۰۰' },
  { id: 3, adminName: 'پشتیبان', action: 'گزارش شماره 2 را بررسی کرد.', timestamp: '۱۴۰۳/۰۵/۰۲, ۱۷:۴۰:۱۰' },
];
