import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
const { useNavigate } = ReactRouterDOM;
import { Card, Button, Input } from '../../components/common';
import { UserIcon, EmailIcon, PasswordIcon } from '../../components/icons';
import { useUser, useToast } from '../../contexts';

type ActiveTab = 'account' | 'security' | 'payments';

const SettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useUser();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<ActiveTab>('account');

    const [accountData, setAccountData] = useState({ name: user.name, email: user.email });
    const [isAccountChanged, setIsAccountChanged] = useState(false);

    useEffect(() => {
      setAccountData({ name: user.name, email: user.email });
    }, [user]);

    useEffect(() => {
        setIsAccountChanged(accountData.name !== user.name);
    }, [accountData, user.name]);

    const handleAccountSave = (e: React.FormEvent) => {
        e.preventDefault();
        updateUser({ name: accountData.name });
        setIsAccountChanged(false);
        showToast('اطلاعات حساب با موفقیت به‌روزرسانی شد.');
    };

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
        <div className="min-h-screen bg-gray-50 dark:bg-navy-gray-dark p-8">
            <header className="flex justify-between items-center mb-10 max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">تنظیمات کاربر</h1>
                <Button variant="secondary" onClick={() => navigate('/chat')}>بازگشت به چت</Button>
            </header>

            <main className="max-w-4xl mx-auto">
                <div className="border-b border-gray-200 dark:border-navy-gray-light mb-6">
                    <nav className="flex gap-4">
                        <TabButton tabName="account" label="اطلاعات حساب" />
                        <TabButton tabName="security" label="امنیت" />
                        <TabButton tabName="payments" label="تاریخچه پرداخت‌ها" />
                    </nav>
                </div>

                <Card>
                    {activeTab === 'account' && (
                        <form onSubmit={handleAccountSave} className="space-y-6">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">اطلاعات حساب</h2>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">نام کامل</label>
                                <Input 
                                    type="text" 
                                    value={accountData.name}
                                    onChange={(e) => setAccountData({...accountData, name: e.target.value})}
                                    icon={<UserIcon className="w-5 h-5"/>} 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">ایمیل</label>
                                <Input type="email" value={accountData.email} disabled icon={<EmailIcon className="w-5 h-5"/>} className="cursor-not-allowed bg-gray-100 dark:bg-navy-gray" />
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={!isAccountChanged}>ذخیره تغییرات</Button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'security' && (
                        <form className="space-y-6">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">تغییر رمز عبور</h2>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">رمز عبور فعلی</label>
                                <Input type="password" required icon={<PasswordIcon className="w-5 h-5"/>} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">رمز عبور جدید</label>
                                <Input type="password" required icon={<PasswordIcon className="w-5 h-5"/>} />
                            </div>
                             <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">تکرار رمز عبور جدید</label>
                                <Input type="password" required icon={<PasswordIcon className="w-5 h-5"/>} />
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit">تغییر رمز</Button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'payments' && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">تاریخچه پرداخت‌ها</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-right">
                                    <thead className="bg-gray-100 dark:bg-navy-gray">
                                        <tr>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">تاریخ</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">شرح خرید</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">مبلغ</th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">وضعیت</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-navy-gray-light text-gray-800 dark:text-gray-200">
                                        <tr className="hover:bg-gray-50 dark:hover:bg-navy-gray-light/50">
                                            <td className="px-4 py-4 whitespace-nowrap text-sm">۱۴۰۳/۰۵/۰۱</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm">بسته نقره‌ای - ۱۲,۰۰۰ توکن</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm">۱۰۰,۰۰۰ تومان</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm"><span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm">موفق</span></td>
                                        </tr>
                                         <tr className="hover:bg-gray-50 dark:hover:bg-navy-gray-light/50">
                                            <td className="px-4 py-4 whitespace-nowrap text-sm">۱۴۰۳/۰۴/۱۵</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm">بسته برنزی - ۵,۰۰۰ توکن</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm">۵۰,۰۰۰ تومان</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm"><span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm">موفق</span></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </Card>
            </main>
        </div>
    );
};

export default SettingsPage;