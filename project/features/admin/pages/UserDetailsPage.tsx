import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
const { useParams, useNavigate } = ReactRouterDOM;
import { Card, Button, LoadingSpinner, ErrorMessage } from '../../../components/common';
import { useQuery } from '@tanstack/react-query';
import { fetchUserById } from '../../../services/apiService';

type ActiveTab = 'conversations' | 'transactions';

const UserDetailsPage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    
    const { data: user, isLoading, isError } = useQuery({
        queryKey: ['adminUser', userId],
        queryFn: () => fetchUserById(userId!),
        enabled: !!userId,
    });

    const [activeTab, setActiveTab] = useState<ActiveTab>('conversations');
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

    React.useEffect(() => {
        if (user && user.conversations.length > 0) {
            setActiveConversationId(user.conversations[0].id);
        }
    }, [user]);

    const activeConversation = user?.conversations.find(c => c.id === activeConversationId);
    
    if (isLoading) return <LoadingSpinner fullPage />;
    if (isError || !user) {
        return (
            <div>
                <ErrorMessage message="کاربر یافت نشد." />
                <div className="text-center mt-4">
                    <Button onClick={() => navigate('/admin/users')}>بازگشت به لیست کاربران</Button>
                </div>
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
                    <Card className="w-full md:w-1/3 !p-0 overflow-y-auto">
                        <div className="p-4 border-b dark:border-navy-gray-light">
                            <h4 className="font-semibold text-lg">لیست گفتگوها ({user.conversations.length})</h4>
                        </div>
                        {user.conversations.length > 0 ? (
                            <ul>
                                {user.conversations.map(convo => (
                                    <li key={convo.id}>
                                        <button onClick={() => setActiveConversationId(convo.id)} className={`w-full text-right p-4 border-b dark:border-navy-gray-light transition-colors ${activeConversationId === convo.id ? 'bg-turquoise/10 dark:bg-turquoise/20' : 'hover:bg-gray-50 dark:hover:bg-navy-gray-light/50'}`}>
                                            <p className="font-semibold truncate">{convo.title}</p>
                                            <p className="text-xs text-turquoise dark:text-turquoise-light">{convo.marja}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{convo.messages.length} پیام</p>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="p-4 text-center text-gray-500 dark:text-gray-400">این کاربر هنوز گفتگویی نداشته است.</p>
                        )}
                    </Card>

                    <Card className="flex-1 !p-0 flex flex-col">
                         <div className="p-4 border-b dark:border-navy-gray-light"><h4 className="font-semibold text-lg truncate">محتوای گفتگو: {activeConversation?.title || ''}</h4></div>
                        <div className="p-6 flex-1 overflow-y-auto space-y-4">
                            {activeConversation ? activeConversation.messages.map((msg, index) => (
                                <div key={index} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-lg p-3 rounded-xl ${msg.sender === 'user' ? 'bg-turquoise text-white rounded-br-none' : 'bg-gray-200 dark:bg-navy-gray-light rounded-bl-none'}`}>{msg.text}</div>
                                </div>
                            )) : ( <div className="flex items-center justify-center h-full"><p className="text-gray-500 dark:text-gray-400">یک گفتگو را برای مشاهده انتخاب کنید.</p></div>)}
                        </div>
                    </Card>
                </div>
            )}
            
            {activeTab === 'transactions' && (
                <Card><p className="text-center p-4">بخش تراکنش‌ها در حال ساخت است.</p></Card>
            )}
        </div>
    );
};

export default UserDetailsPage;