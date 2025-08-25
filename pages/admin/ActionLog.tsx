import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, LoadingSpinner, ErrorMessage, EmptyState, Input, Button } from '../../components/common';
import { fetchAdminLogs, AdminLog } from '../../services/apiService';
import { ClipboardListIcon, UsersIcon } from '../../components/icons';

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
            <h2 className="text-3xl font-bold mb-8">گزارش اقدامات مدیران</h2>
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
                                    <thead className="border-b border-gray-200 dark:border-navy-gray-light">
                                        <tr>
                                            <th className="p-3">تاریخ و زمان</th>
                                            <th className="p-3">مدیر</th>
                                            <th className="p-3">اقدام انجام شده</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedLogs.map(log => (
                                            <tr key={log.id} className="border-b border-gray-100 dark:border-navy-gray hover:bg-gray-50 dark:hover:bg-navy-gray-light/50">
                                                <td className="p-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{log.timestamp}</td>
                                                <td className="p-3 font-semibold">{log.adminName}</td>
                                                <td className="p-3">{log.action}</td>
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