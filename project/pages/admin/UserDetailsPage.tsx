import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
const { useParams, useNavigate } = ReactRouterDOM;
// Fix: Import mockUsers from mockData.ts
import { mockUsers } from '../../services/mockData';
import { Card, Button } from '../../components/common';

type ActiveTab = 'conversations' | 'transactions';

const UserDetailsPage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    
    const user = mockUsers.find(u => u.id.toString() === userId);
    
    const [activeTab, setActiveTab] = useState<ActiveTab>('conversations');
    const [activeConversationId, setActiveConversationId] = useState<string | null>(user?.conversations[0]?.id || null);

    const activeConversation = user?.conversations.find(c => c.id === activeConversationId);
    
    const mockTransactions = [
      { id: 't1', type: 'خرید بسته', description: 'بسته نقره‌ای', tokens: '+12,000', amount: '100,000 تومان', date: '۱۴۰۳/۰۵/۰۱' },
      { id: 't2', type: 'هدیه معنوی', description: 'توکن صلواتی', tokens: '+1', amount: '-', date: '۱۴۰۳/۰۵/۰۲' },
      { id: 't3', type: 'کارت هدیه', description: 'کد: GIFT-ABCD-1234', tokens: '+5,000', amount: '-', date: '۱۴۰۳/۰۵/۰۳' },
    ];

    if (!user) {
        return (
            <div>
                <h2 className="text-2xl font-bold mb-4 text-red-500">کاربر یافت نشد</h2>
                <Button onClick={() => navigate('/admin/users')}>بازگشت به لیست کاربران</Button>
            </div>
        );
    }

    const TabButton: React.FC<{ tabName: ActiveTab; label: string }> = ({ tabName, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-4 py-2 font-semibold rounded-t-lg transition-colors duration-300 border-b-2 ${
                activeTab === tabName
                ? 'text-turquoise dark:text-turquoise-light border-turquoise dark:border-turquoise-light bg-turquoise/5 dark:bg-turquoise/10'
                : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-turquoise'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">مشاهده کاربر: {user.name}</h2>
                <Button variant="secondary" onClick={() => navigate('/admin/users')}>بازگشت به لیست</Button>
            </div>
            
            <Card className="mb-8">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                    <div><span className="font-semibold">ایمیل:</span> {user.email}</div>
                    <div><span className="font-semibold">تاریخ عضویت:</span> {user.joinDate}</div>
                    {/* Fix: Changed 'tokens' to 'tokenBalance' to match the AdminUser type. */}
                    <div><span className="font-semibold">توکن باقی‌مانده:</span> {user.tokenBalance.toLocaleString()}</div>
                    <div><span className="font-semibold">وضعیت:</span> <span className={`px-2 py-1 rounded-full text-xs ${user.status === 'فعال' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{user.status}</span></div>
                </div>
            </Card>

            <div className="border-b border-gray-200 dark:border-navy-gray-light mb-6">
                <nav className="flex gap-4">
                    <TabButton tabName="conversations" label="تاریخچه گفتگوها" />
                    <TabButton tabName="transactions" label="تراکنش‌ها" />
                </nav>
            </div>

            {activeTab === 'conversations' && (
                 <div className="flex flex-col md:flex-row gap-6 h-[60vh]">
                    {/* Conversations List */}
                    <Card className="w-full md:w-1/3 !p-0 overflow-y-auto">
                        <div className="p-4 border-b dark:border-navy-gray-light">
                            <h4 className="font-semibold text-lg">لیست گفتگوها ({user.conversations.length})</h4>
                        </div>
                        {user.conversations.length > 0 ? (
                            <ul>
                                {user.conversations.map(convo => (
                                    <li key={convo.id}>
                                        <button 
                                            onClick={() => setActiveConversationId(convo.id)}
                                            className={`w-full text-right p-4 border-b dark:border-navy-gray-light transition-colors ${activeConversationId === convo.id ? 'bg-turquoise/10 dark:bg-turquoise/20' : 'hover:bg-gray-50 dark:hover:bg-navy-gray-light/50'}`}
                                        >
                                            <p className="font-semibold truncate">{convo.title}</p>
                                            <p className="text-xs text-turquoise dark:text-turquoise-light">{convo.marja}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                {convo.messages.length} پیام
                                            </p>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="p-4 text-center text-gray-500 dark:text-gray-400">این کاربر هنوز گفتگویی نداشته است.</p>
                        )}
                    </Card>

                    {/* Messages View */}
                    <Card className="flex-1 !p-0 flex flex-col">
                         <div className="p-4 border-b dark:border-navy-gray-light">
                            <h4 className="font-semibold text-lg truncate">محتوای گفتگو: {activeConversation?.title || ''}</h4>
                        </div>
                        <div className="p-6 flex-1 overflow-y-auto space-y-4">
                            {activeConversation ? activeConversation.messages.map((msg, index) => (
                                <div key={index} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-lg p-3 rounded-xl ${msg.sender === 'user' ? 'bg-turquoise text-white rounded-br-none' : 'bg-gray-200 dark:bg-navy-gray-light rounded-bl-none'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            )) : (
                                 <div className="flex items-center justify-center h-full">
                                    <p className="text-gray-500 dark:text-gray-400">یک گفتگو را برای مشاهده انتخاب کنید.</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            )}
            
            {activeTab === 'transactions' && (
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-gray-50 dark:bg-navy-gray">
                                <tr>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">تاریخ</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">نوع تراکنش</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">توضیحات</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">مقدار توکن</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">مبلغ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-navy-gray-light">
                                {mockTransactions.map(tx => (
                                    <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-navy-gray-light/50">
                                        <td className="px-4 py-4 whitespace-nowrap text-sm">{tx.date}</td>
                                        <td className="px-4 py-4 whitespace-nowrap">{tx.type}</td>
                                        <td className="px-4 py-4 whitespace-nowrap">{tx.description}</td>
                                        <td className="px-4 py-4 whitespace-nowrap font-semibold text-green-600 dark:text-green-400">{tx.tokens}</td>
                                        <td className="px-4 py-4 whitespace-nowrap">{tx.amount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                         {mockTransactions.length === 0 && <p className="text-center p-4 text-gray-500 dark:text-gray-400">تراکنشی برای این کاربر ثبت نشده است.</p>}
                    </div>
                </Card>
            )}
        </div>
    );
};

export default UserDetailsPage;