import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, LoadingSpinner, ErrorMessage, EmptyState, Input, Button } from '../../../components/common';
import { fetchAdminLogs } from '../../../services/apiService';
import { ClipboardListIcon, UsersIcon } from '../../../components/icons';
// Fix: Import AdminLog type from types.ts
import type { AdminLog } from '../../../types';

const ITEMS_PER_PAGE = 15;

const ActionLog: React.FC = () => {
    const { data: logs = [], isLoading, isError, refetch } = useQuery<AdminLog[]>({
        queryKey: ['adminLogs'],
        queryFn: fetchAdminLogs,
    });
    
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [adminFilter, setAdminFilter] = useState('');
    
    const filteredLogs = logs.filter(log => {
        const matchesAdmin = !adminFilter || log.adminName === adminFilter;
        const matchesSearch = !searchTerm || log.action.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesAdmin && matchesSearch;
    });

    const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
    const paginatedLogs = filteredLogs.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );
    
    const uniqueAdmins = [...new Set(logs.map(log => log.adminName))];

    return (
        <div>
            <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">گزارش اقدامات مدیران</h2>
            <Card>
                {isLoading ? (
                    <LoadingSpinner />
                ) : isError ? (
                    <ErrorMessage onRetry={() => refetch()} />
                ) : (
                    <>
                        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                             <Input 
                                placeholder="جستجو در اقدامات..." 
                                className="w-full md:max-w-xs" 
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1); // Reset page on search
                                }}
                            />
                            <div className="flex items-center gap-2 w-full md:w-auto self-end md:self-center">
                                <label htmlFor="admin-filter" className="text-sm font-medium whitespace-nowrap">فیلتر مدیر:</label>
                                <select 
                                    id="admin-filter"
                                    value={adminFilter}
                                    onChange={(e) => {
                                        setAdminFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full bg-white dark:bg-navy-gray border border-gray-300 dark:border-navy-gray-light rounded-lg py-2 px-3"
                                >
                                    <option value="">همه مدیران</option>
                                    {uniqueAdmins.map((name: string) => <option key={name} value={name}>{name}</option>)}
                                </select>
                            </div>
                        </div>
                        
                        {paginatedLogs.length > 0 ? (
                             <div className="overflow-x-auto">
                                <table className="w-full text-right">
                                    <thead className="bg-gray-50 dark:bg-navy-gray">
                                        <tr>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">تاریخ و زمان</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">مدیر</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">اقدام انجام شده</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-navy-gray-light">
                                        {paginatedLogs.map(log => (
                                            <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-navy-gray-light/50">
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{log.timestamp}</td>
                                                <td className="px-4 py-4 whitespace-nowrap font-semibold">{log.adminName}</td>
                                                <td className="px-4 py-4 whitespace-nowrap">{log.action}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                             <EmptyState
                                icon={<ClipboardListIcon className="w-full h-full" />}
                                title="گزارشی یافت نشد"
                                description="هیچ گزارشی برای نمایش وجود ندارد یا با فیلتر شما مطابقت ندارد."
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

export default ActionLog;