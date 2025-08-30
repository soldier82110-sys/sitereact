import React from 'react';
import { Card, LoadingSpinner, ErrorMessage } from '../../../components/common';
import { fetchAnalyticsData, reportCategoryLabels } from '../../../services/apiService';
import { useQuery } from '@tanstack/react-query';
import { ThumbsUpIcon, ThumbsDownIcon, FlagIcon } from '../../../components/icons';
import { ReportCategory } from '../../../types';

interface ChartBarProps {
    label: string;
    value: number;
    maxValue: number;
    color: string;
    icon?: React.ReactNode;
}

const ChartBar: React.FC<ChartBarProps> = ({ label, value, maxValue, color, icon }) => {
    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
    return (
        <div className="flex items-center gap-4">
            <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">{icon}</div>
            <div className="flex-1">
                <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{value}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div className={`${color} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
                </div>
            </div>
        </div>
    );
};

const Analytics: React.FC = () => {
    const { data: feedbackData, isLoading: feedbackLoading, isError: feedbackError } = useQuery<Record<string, number>>({
        queryKey: ['analyticsFeedback'],
        queryFn: () => fetchAnalyticsData('feedback'),
    });

    const { data: categoryData, isLoading: categoryLoading, isError: categoryError } = useQuery<Record<string, number>>({
        queryKey: ['analyticsCategories'],
        queryFn: () => fetchAnalyticsData('categories'),
    });

    const maxFeedbackValue = feedbackData ? Math.max(...Object.values(feedbackData)) : 0;
    const maxCategoryValue = categoryData ? Math.max(...Object.values(categoryData)) : 0;

    return (
        <div>
            <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">تجزیه و تحلیل</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">خلاصه بازخوردها</h3>
                    {feedbackLoading && <LoadingSpinner />}
                    {feedbackError && <ErrorMessage />}
                    {feedbackData && (
                        <div className="space-y-6">
                            <ChartBar label="پسندیده‌ها" value={feedbackData.liked || 0} maxValue={maxFeedbackValue} color="bg-green-500" icon={<ThumbsUpIcon className="w-6 h-6 text-green-500" />} />
                            <ChartBar label="نپسندیده‌ها" value={feedbackData.disliked || 0} maxValue={maxFeedbackValue} color="bg-amber-500" icon={<ThumbsDownIcon className="w-6 h-6 text-amber-500" />} />
                            <ChartBar label="گزارش‌شده‌ها" value={feedbackData.reported || 0} maxValue={maxFeedbackValue} color="bg-red-500" icon={<FlagIcon className="w-6 h-6 text-red-500" />} />
                        </div>
                    )}
                </Card>
                <Card>
                    <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">دسته‌بندی گزارشات</h3>
                    {categoryLoading && <LoadingSpinner />}
                    {categoryError && <ErrorMessage />}
                    {categoryData && (
                         <div className="space-y-4">
                            {Object.entries(categoryData).length > 0 ? (
                                Object.entries(categoryData).map(([key, value]) => (
                                    <ChartBar key={key} label={reportCategoryLabels[key as ReportCategory]} value={value} maxValue={maxCategoryValue} color="bg-sky-500" />
                                ))
                            ) : (
                                 <p className="text-center text-gray-500 dark:text-gray-400 py-8">هیچ گزارشی با دسته‌بندی ثبت نشده است.</p>
                            )}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default Analytics;