import React, { useState } from 'react';
import { Card, Button, Input, Modal, ErrorMessage, EmptyState, Skeleton, ConfirmationModal } from '../../components/common';
import { EditIcon, TrashIcon, EyeIcon, UserIcon, EmailIcon, PasswordIcon, SpinnerIcon, UsersIcon } from '../../components/icons';
import * as ReactRouterDOM from 'react-router-dom';
const { useNavigate } = ReactRouterDOM;
import { useAppSettings, useToast } from '../../contexts/ThemeContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAdminUsers, updateUser, addUser, logAdminAction } from '../../services/apiService';
import { AdminUser } from '../../types';

type User = AdminUser;

const ITEMS_PER_PAGE = 10;

const UserTableSkeleton: React.FC = () => (
    <div className="overflow-x-auto">
        <table className="w-full text-right">
            <thead className="border-b border-gray-200 dark:border-navy-gray-light">
                <tr>
                    <th className="p-3"><Skeleton className="h-4 w-20" /></th>
                    <th className="p-3"><Skeleton className="h-4 w-32" /></th>
                    <th className="p-3"><Skeleton className="h-4 w-24" /></th>
                    <th className="p-3"><Skeleton className="h-4 w-16" /></th>
                    <th className="p-3"><Skeleton className="h-4 w-16" /></th>
                    <th className="p-3"><Skeleton className="h-4 w-24" /></th>
                </tr>
            </thead>
            <tbody>
                {Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-navy-gray">
                        <td className="p-3"><Skeleton className="h-5 w-24" /></td>
                        <td className="p-3"><Skeleton className="h-5 w-40" /></td>
                        <td className="p-3"><Skeleton className="h-5 w-28" /></td>
                        <td className="p-3"><Skeleton className="h-5 w-20" /></td>
                        <td className="p-3"><Skeleton className="h-6 w-16 rounded-full" /></td>
                        <td className="p-3 flex items-center gap-1">
                            <Skeleton className="h-8 w-8 rounded" />
                            <Skeleton className="h-8 w-8 rounded" />
                            <Skeleton className="h-8 w-8 rounded" />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);


const UserManagement: React.FC = () => {
    const { settings } = useAppSettings();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { showToast } = useToast();
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [originalUserStatus, setOriginalUserStatus] = useState<string | null>(null);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', tokens: settings.defaultUserTokens });
    
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    
    const { data: users = [], isLoading, isError, refetch } = useQuery({
        queryKey: ['adminUsers'],
        queryFn: fetchAdminUsers,
    });
    
    const updateUserMutation = useMutation({
        mutationFn: updateUser,
        onSuccess: (updatedUser) => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            
            // Log if status changed to 'مسدود'
            if(originalUserStatus === 'فعال' && updatedUser.status === 'مسدود') {
                logAdminAction('مدیر کل', `کاربر ${updatedUser.email} را مسدود کرد.`);
            }
             if(originalUserStatus === 'مسدود' && updatedUser.status === 'فعال') {
                logAdminAction('مدیر کل', `کاربر ${updatedUser.email} را از مسدودیت خارج کرد.`);
            }

            setIsEditModalOpen(false);
            setSelectedUser(null);
            setOriginalUserStatus(null);
            showToast('کاربر با موفقیت به‌روزرسانی شد.');
        },
        onError: (error: Error) => {
            showToast(`خطا در به‌روزرسانی: ${error.message}`, 'error');
        },
    });

    const addUserMutation = useMutation({
        mutationFn: addUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            setIsAddModalOpen(false);
            setNewUser({ name: '', email: '', password: '', tokens: settings.defaultUserTokens });
            showToast('کاربر با موفقیت افزوده شد.');
        },
        onError: (error: Error) => {
            showToast(`خطا در افزودن کاربر: ${error.message}`, 'error');
        },
    });

    const handleEditClick = (user: User) => {
        setSelectedUser(JSON.parse(JSON.stringify(user)));
        setOriginalUserStatus(user.status);
        setIsEditModalOpen(true);
    };
    
    const handleDeleteClick = (user: User) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!userToDelete) return;
        // In a real app, you would call a delete mutation:
        // deleteUserMutation.mutate(userToDelete.id);
        logAdminAction('مدیر کل', `کاربر ${userToDelete.email} را حذف کرد.`);
        showToast(`کاربر ${userToDelete.name} حذف شد. (شبیه‌سازی)`);
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
        // On success, invalidate query and show toast
    };

    const handleSaveChanges = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedUser) {
            updateUserMutation.mutate(selectedUser);
        }
    };

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        addUserMutation.mutate(newUser);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div>
            <h2 className="text-3xl font-bold mb-8">مدیریت کاربران</h2>
            <Card>
                {isLoading ? (
                    <UserTableSkeleton />
                ) : isError ? (
                    <ErrorMessage onRetry={() => refetch()} />
                ) : (
                    <>
                        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                            <Input 
                                placeholder="جستجو بر اساس نام یا ایمیل..." 
                                className="w-full md:max-w-xs" 
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1); // Reset page on search
                                }}
                            />
                             <div className="flex items-center gap-2 w-full md:w-auto self-end md:self-center">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full md:w-auto bg-white dark:bg-navy-gray border border-gray-300 dark:border-navy-gray-light rounded-lg py-2.5 px-3"
                                >
                                    <option value="all">همه وضعیت‌ها</option>
                                    <option value="فعال">فعال</option>
                                    <option value="مسدود">مسدود</option>
                                </select>
                                <Button onClick={() => setIsAddModalOpen(true)} className="flex-shrink-0 whitespace-nowrap">+ افزودن کاربر جدید</Button>
                            </div>
                        </div>
                        {paginatedUsers.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-right">
                                    <thead className="border-b border-gray-200 dark:border-navy-gray-light">
                                        <tr>
                                            <th className="p-3">نام</th>
                                            <th className="p-3">ایمیل</th>
                                            <th className="p-3">تاریخ عضویت</th>
                                            <th className="p-3">توکن</th>
                                            <th className="p-3">وضعیت</th>
                                            <th className="p-3">عملیات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedUsers.map(user => (
                                            <tr key={user.id} className="border-b border-gray-100 dark:border-navy-gray hover:bg-gray-50 dark:hover:bg-navy-gray-light/50">
                                                <td className="p-3 font-semibold">{user.name}</td>
                                                <td className="p-3">{user.email}</td>
                                                <td className="p-3">{user.joinDate}</td>
                                                <td className="p-3">{user.tokens.toLocaleString()}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded-full text-sm ${user.status === 'فعال' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td className="p-3 flex items-center gap-1">
                                                    <button onClick={() => navigate(`/admin/users/${user.id}`)} aria-label={`مشاهده کاربر ${user.name}`} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-navy-gray-light"><EyeIcon className="w-5 h-5 text-sky-600" /></button>
                                                    <button onClick={() => handleEditClick(user)} aria-label={`ویرایش کاربر ${user.name}`} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-navy-gray-light"><EditIcon className="w-5 h-5" /></button>
                                                    <button onClick={() => handleDeleteClick(user)} aria-label={`حذف کاربر ${user.name}`} className="p-1.5 rounded hover:bg-brick/20"><TrashIcon className="w-5 h-5 text-brick" /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                             <EmptyState
                                icon={<UsersIcon className="w-full h-full" />}
                                title="کاربری یافت نشد"
                                description="به نظر می‌رسد هنوز هیچ کاربری ثبت‌نام نکرده یا با جستجوی شما مطابقت ندارد."
                                actionText="افزودن کاربر جدید"
                                onActionClick={() => setIsAddModalOpen(true)}
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
            
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="افزودن کاربر جدید">
                <form onSubmit={handleAddUser} className="space-y-4">
                    <Input icon={<UserIcon className="w-5 h-5"/>} placeholder="نام کامل" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} required disabled={addUserMutation.isPending}/>
                    <Input icon={<EmailIcon className="w-5 h-5"/>} type="email" placeholder="ایمیل" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required disabled={addUserMutation.isPending}/>
                    <Input icon={<PasswordIcon className="w-5 h-5"/>} type="password" placeholder="رمز عبور" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required disabled={addUserMutation.isPending}/>
                    <Input type="number" placeholder="تعداد توکن اولیه" value={newUser.tokens} onChange={e => setNewUser({...newUser, tokens: parseInt(e.target.value) || 0})} required disabled={addUserMutation.isPending}/>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)} disabled={addUserMutation.isPending}>لغو</Button>
                        <Button type="submit" disabled={addUserMutation.isPending}>
                            {addUserMutation.isPending ? <SpinnerIcon className="w-5 h-5" /> : 'ایجاد کاربر'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {selectedUser && (
                <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`ویرایش کاربر: ${selectedUser.name}`}>
                    <form onSubmit={handleSaveChanges} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">نام</label>
                            <Input value={selectedUser.name} onChange={e => setSelectedUser({...selectedUser, name: e.target.value})} disabled={updateUserMutation.isPending} />
                        </div>
                        <div>
                             <label className="block text-sm font-medium mb-1">توکن</label>
                            <Input type="number" value={selectedUser.tokens} onChange={e => setSelectedUser({...selectedUser, tokens: parseInt(e.target.value) || 0})} disabled={updateUserMutation.isPending} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">وضعیت</label>
                            <select 
                                value={selectedUser.status} 
                                onChange={e => setSelectedUser({...selectedUser, status: e.target.value})}
                                className="w-full bg-off-white/50 dark:bg-navy-gray-dark/50 border border-gray-300 dark:border-navy-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-turquoise px-4 py-2.5"
                                disabled={updateUserMutation.isPending}
                            >
                                <option value="فعال">فعال</option>
                                <option value="مسدود">مسدود</option>
                            </select>
                        </div>
                         <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)} disabled={updateUserMutation.isPending}>لغو</Button>
                            <Button type="submit" disabled={updateUserMutation.isPending}>
                                {updateUserMutation.isPending ? <SpinnerIcon className="w-5 h-5"/> : 'ذخیره تغییرات'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="حذف کاربر"
                message={`آیا از حذف کاربر "${userToDelete?.name}" اطمینان دارید؟ این عمل قابل بازگشت نیست.`}
                confirmText="حذف کن"
                isDestructive={true}
            />
        </div>
    );
};

export default UserManagement;