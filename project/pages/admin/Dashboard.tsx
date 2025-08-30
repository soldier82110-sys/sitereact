import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
const { Link } = ReactRouterDOM;
import { Card, Button, Skeleton } from '../../components/common';
import { UsersIcon, RevenueIcon, ReportsIcon } from '../../components/chat/icons';
import { useQuery } from '@tanstack/react-query';
import { fetchReports } from '../../services/apiService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const userGrowthData = [
  { name: 'فروردین', users: 400 },
  { name: 'اردیبهشت', users: 600 },
  { name: 'خرداد', users: 550 },
  { name: 'تیر', users: 800 },
  { name: 'مرداد', users: 950 },
  { name: 'شهریور', users: 1234 },
];

const revenueData = [
  { name: 'فروردین', 'درآمد': 2400000 },
  { name: 'اردیبهشت', 'درآمد': 3500000 },
  { name: 'خرداد', 'درآمد': 4200000 },
  { name: 'تیر', 'درآمد': 6800000 },
  { name: 'مرداد', 'درآمد': 8100000 },
  { name: 'شهریور', 'درآمد': 12500000 },
];

const StatCard: React.FC<{ title: string; value: string; icon: React.FC<{className?: string}>; color: string; }> = ({ title, value, icon: Icon, color }) => (
    <Card className="!p-6 flex items-center gap-4">
        <div className={`p-3 rounded-full ${color}`}>
            <Icon className="w-7 h-7 text-white" />
        </div>
        <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        </div>
    </Card>
);

const DashboardSkeleton: React.FC = () => (
    <div>
        <h2 className="text-3xl font-bold mb-8">
            <Skeleton className="h-9 w-40" />
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({length: 4}).map((_, i) => (
                <Card key={i} className="!p-6 flex items-center gap-4">
                    <Skeleton className="w-14 h-14 rounded-full" />
                    <div className="flex-1">
                        <Skeleton className="h-5 w-24 mb-2" />
                        <Skeleton className="h-8 w-16" />
                    </div>
                </Card>
            ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card>
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-64 w-full" />
            </Card>
            <Card>
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-64 w-full" />
            </Card>
        </div>
        <Card>
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        </Card>
    </div>
);


const Dashboard: React.FC = () => {
    const [timeFilter, setTimeFilter] = useState('30d');
    const { data: reports = [], isLoading } = useQuery({
        queryKey: ['reports'],
        queryFn: fetchReports,
    });
    const newReportsCount = reports.filter(r => r.status === 'new' && r.feedback === 'reported').length;
    
    if (isLoading) {
        return <DashboardSkeleton />;
    }

    return (
        <div>
            <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">داشبورد</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="مجموع کاربران" value="۱,۲۳۴" icon={UsersIcon} color="bg-sky-500" />
                <StatCard title="درآمد کل" value="۱۲,۵۰۰,۰۰۰ ت" icon={RevenueIcon} color="bg-green-500" />
                <StatCard title="کاربران جدید (۲۴س)" value="+۱۵" icon={UsersIcon} color="bg-amber-500" />
                
                <Link to="/admin/reports" className="block h-full">
                    <Card className="!p-6 flex items-center gap-4 h-full hover:shadow-xl transition-shadow duration-300">
                        <div className="p-3 rounded-full bg-indigo-500">
                            <ReportsIcon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">گزارشات جدید</h3>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{newReportsCount}</p>
                        </div>
                    </Card>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">رشد کاربران</h3>
                        <div className="flex gap-1">
                            <Button variant={timeFilter === '7d' ? 'primary' : 'secondary'} onClick={() => setTimeFilter('7d')} className="!px-3 !py-1 text-sm">هفته</Button>
                            <Button variant={timeFilter === '30d' ? 'primary' : 'secondary'} onClick={() => setTimeFilter('30d')} className="!px-3 !py-1 text-sm">ماه</Button>
                            <Button variant={timeFilter === '1y' ? 'primary' : 'secondary'} onClick={() => setTimeFilter('1y')} className="!px-3 !py-1 text-sm">سال</Button>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={256}>
                      <LineChart data={userGrowthData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="users" name="کاربران" stroke="#14b8a6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                </Card>
                <Card>
                     <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">نمودار درآمد</h3>
                     <ResponsiveContainer width="100%" height={256}>
                        <BarChart data={revenueData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value: number) => `${value.toLocaleString()} تومان`} />
                            <Legend />
                            <Bar dataKey="درآمد" fill="#14b8a6" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>
            
            <Card>
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">آخرین فعالیت‌ها</h3>
                <ul className="space-y-3">
                    <li className="flex items-center justify-between p-2 rounded hover:bg-gray-100 dark:hover:bg-navy-gray-light">
                        <div>
                           <p className="text-gray-800 dark:text-gray-200">کاربر <span className="font-semibold">user@example.com</span> بسته طلایی را خریداری کرد.</p>
                           <p className="text-xs text-gray-500 dark:text-gray-400">۵ دقیقه پیش</p>
                        </div>
                        <span className="text-green-600 dark:text-green-400 font-semibold">+۲۰۰,۰۰۰ ت</span>
                    </li>
                     <li className="flex items-center justify-between p-2 rounded hover:bg-gray-100 dark:hover:bg-navy-gray-light">
                        <div>
                           <p className="text-gray-800 dark:text-gray-200"><span className="font-semibold">۵ گزارش</span> جدید ثبت شد.</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">۱ ساعت پیش</p>
                        </div>
                         <span className="text-amber-600 dark:text-amber-400">نیاز به بررسی</span>
                    </li>
                     <li className="flex items-center justify-between p-2 rounded hover:bg-gray-100 dark:hover:bg-navy-gray-light">
                        <div>
                           <p className="text-gray-800 dark:text-gray-200">کاربر جدید <span className="font-semibold">new@example.com</span> ثبت‌نام کرد.</p>
                           <p className="text-xs text-gray-500 dark:text-gray-400">۳ ساعت پیش</p>
                        </div>
                    </li>
                </ul>
            </Card>
        </div>
    );
};

export default Dashboard;