import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
const { useNavigate } = ReactRouterDOM;
import { Card, Button, LoadingSpinner, ErrorMessage, EmptyState } from '../../components/common';
import { ThumbsUpIcon, ThumbsDownIcon, FlagIcon, ExportIcon, CheckCircleIcon, ReportsIcon } from '../../components/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchReports, updateReport, reportCategoryLabels } from '../../services/apiService';
import { Report, ReportStatus, FeedbackStatus, ReportCategory } from '../../types';
import { useAppSettings, useToast } from '../../contexts/ThemeContext';


const ITEMS_PER_PAGE = 10;

const Reports: React.FC = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { settings } = useAppSettings();
    
    const [activeTab, setActiveTab] = useState<ReportStatus | 'all'>('new');
    const [currentPage, setCurrentPage] = useState(1);
    const [categoryFilter, setCategoryFilter] = useState<ReportCategory | 'all'>('all');
    const [marjaFilter, setMarjaFilter] = useState<string>('all');
    
    const { data: reports = [], isLoading, isError, refetch } = useQuery({
      queryKey: ['reports'],
      queryFn: fetchReports,
    });

    const updateReportMutation = useMutation({
        mutationFn: (updatedReport: Partial<Report> & { id: number }) => updateReport(updatedReport),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['reports'] });
            if (data?.refunded) {
                showToast(`توکن با موفقیت به کاربر ${data.email} عودت داده شد.`);
            } else if (data?.status === 'reviewed') {
                showToast('وضعیت گزارش با موفقیت به‌روزرسانی شد.');
            }
        },
        onError: (error: Error) => {
            showToast(`خطا در به‌روزرسانی گزارش: ${error.message}`, 'error');
        }
    });

    const markAsReviewed = (reportId: number) => {
        updateReportMutation.mutate({ id: reportId, status: 'reviewed' });
    };
    
    const handleRefundToken = (reportId: number) => {
        updateReportMutation.mutate({ id: reportId, refunded: true, status: 'reviewed' });
    };

    const handleViewDetails = (reportId: number) => {
        const report = reports.find(r => r.id === reportId);
        if (report && report.status === 'new') {
            markAsReviewed(reportId);
        }
        navigate(`/admin/reports/${reportId}`);
    };

    const FeedbackIcon: React.FC<{status: FeedbackStatus}> = ({status}) => {
        switch(status) {
            case 'liked': return <ThumbsUpIcon className="w-5 h-5 text-green-500" />;
            case 'disliked': return <ThumbsDownIcon className="w-5 h-5 text-amber-500" />;
            case 'reported': return <FlagIcon className="w-5 h-5 text-red-500" />;
            default: return null;
        }
    }

    const filteredReports = reports.filter(report => {
        if (activeTab !== 'all' && report.status !== activeTab) return false;
        if (categoryFilter !== 'all' && report.category !== categoryFilter) return false;
        if (marjaFilter !== 'all' && report.marja !== marjaFilter) return false;
        return true;
    });

    const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);
    const paginatedReports = filteredReports.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const TabButton: React.FC<{ tabName: ReportStatus | 'all'; label: string }> = ({ tabName, label }) => (
        <button
            onClick={() => { setActiveTab(tabName); setCurrentPage(1); }}
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
            <h2 className="text-3xl font-bold mb-8">گزارشات و بازخوردها</h2>
            
            <div className="border-b border-gray-200 dark:border-navy-gray-light mb-6">
                <nav className="flex gap-4">
                    <TabButton tabName="new" label="جدید" />
                    <TabButton tabName="reviewed" label="بررسی شده" />
                    <TabButton tabName="all" label="همه" />
                </nav>
            </div>

            <Card>
                {isLoading ? (
                    <LoadingSpinner />
                ) : isError ? (
                    <ErrorMessage onRetry={() => refetch()} />
                ) : (
                    <>
                        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                                <select 
                                    value={categoryFilter}
                                    onChange={(e) => {
                                        setCategoryFilter(e.target.value as ReportCategory | 'all');
                                        setCurrentPage(1);
                                    }}
                                    className="w-full sm:w-auto bg-white dark:bg-navy-gray border border-gray-300 dark:border-navy-gray-light rounded-lg py-2 px-3">
                                    <option value="all">همه دسته‌بندی‌ها</option>
                                    {Object.entries(reportCategoryLabels).map(([key, value]) => (
                                        <option key={key} value={key}>{value}</option>
                                    ))}
                                </select>
                                <select
                                    value={marjaFilter}
                                    onChange={(e) => {
                                        setMarjaFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full sm:w-auto bg-white dark:bg-navy-gray border border-gray-300 dark:border-navy-gray-light rounded-lg py-2 px-3">
                                    <option value="all">همه مراجع</option>
                                    {settings.maraji.filter(m => m.active).map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                                </select>
                                <input type="date" className="w-full sm:w-auto bg-white dark:bg-navy-gray border border-gray-300 dark:border-navy-gray-light rounded-lg py-2 px-3" />
                            </div>
                            <Button variant="secondary" className="flex items-center gap-2 self-end md:self-center">
                                <ExportIcon className="w-5 h-5" />
                                <span>خروجی CSV</span>
                            </Button>
                        </div>

                        {paginatedReports.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-right">
                                    <thead className="border-b border-gray-200 dark:border-navy-gray-light">
                                        <tr>
                                            <th className="p-3">کاربر</th>
                                            <th className="p-3">مرجع تقلید</th>
                                            <th className="p-3">سوال</th>
                                            <th className="p-3">بازخورد</th>
                                            <th className="p-3">دسته‌بندی</th>
                                            <th className="p-3">تاریخ</th>
                                            <th className="p-3">عملیات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedReports.map(report => (
                                            <tr key={report.id} className={`border-b border-gray-100 dark:border-navy-gray hover:bg-gray-50 dark:hover:bg-navy-gray-light/50 ${report.status === 'new' ? 'bg-sky-50 dark:bg-sky-900/20' : ''}`}>
                                                <td className="p-3 text-sm">{report.email}</td>
                                                <td className="p-3 text-sm">{report.marja}</td>
                                                <td className="p-3 max-w-xs truncate">{report.conversation[0]?.text || 'N/A'}</td>
                                                <td className="p-3 text-center"><FeedbackIcon status={report.feedback} /></td>
                                                <td className="p-3 text-sm">{report.category ? reportCategoryLabels[report.category] : '---'}</td>
                                                <td className="p-3 text-sm">{report.date}</td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-2">
                                                        {(report.feedback === 'reported' || report.feedback === 'disliked') && (
                                                            <Button onClick={() => handleViewDetails(report.id)} variant="secondary" className="!px-3 !py-1 text-sm">مشاهده</Button>
                                                        )}
                                                        
                                                        {report.status === 'new' && (report.feedback === 'disliked' || report.feedback === 'reported') && (
                                                            <Button onClick={() => markAsReviewed(report.id)} variant="secondary" className="!px-3 !py-1 text-sm !bg-green-100 !text-green-800 hover:!bg-green-200 flex items-center gap-1">
                                                                <CheckCircleIcon className="w-4 h-4"/> بررسی شد
                                                            </Button>
                                                        )}
                                                        
                                                        {(report.feedback === 'disliked' || report.feedback === 'reported') && !report.refunded && (
                                                            <Button onClick={() => handleRefundToken(report.id)} variant="secondary" className="!px-3 !py-1 text-sm !bg-amber-100 !text-amber-800 hover:!bg-amber-200">
                                                                عودت توکن
                                                            </Button>
                                                        )}
                                                        {report.refunded && (
                                                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">عودت داده شد</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <EmptyState
                                icon={<ReportsIcon className="w-full h-full" />}
                                title="گزارشی یافت نشد"
                                description="هیچ گزارشی مطابق با فیلترهای شما وجود ندارد."
                            />
                        )}

                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-6">
                                <Button variant="secondary" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                                    قبلی
                                </Button>
                                <span className="text-gray-600 dark:text-gray-400">
                                    صفحه {currentPage} از {totalPages}
                                </span>
                                <Button variant="secondary" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                                    بعدی
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </Card>
        </div>
    );
};

export default Reports;