import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Input, ConfirmationModal, LoadingSpinner, ErrorMessage } from '../../../components/common';
import { EditIcon, TrashIcon, AnalyticsIcon } from '../../../components/icons';
import { useAppSettings, useToast } from '../../../contexts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTokenPackages, deleteTokenPackage, fetchDiscountCodes, deleteDiscountCode, fetchGiftCards, deleteGiftCard } from '../../../services/apiService';
import { TokenPackage, DiscountCode, GiftCard } from '../../../types';

type ActiveTab = 'packages' | 'discounts' | 'gifts' | 'spiritual';

const Financials: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('packages');
    const { settings, updateSettings } = useAppSettings();
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    
    // State for modals and forms
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<Omit<ActiveTab, 'spiritual'> | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: number; name: string; type: string } | null>(null);

    // Queries
    const { data: packages = [], isLoading: packagesLoading, isError: packagesError } = useQuery<TokenPackage[]>({ queryKey: ['tokenPackages'], queryFn: fetchTokenPackages });
    const { data: discounts = [], isLoading: discountsLoading, isError: discountsError } = useQuery<DiscountCode[]>({ queryKey: ['discountCodes'], queryFn: fetchDiscountCodes });
    const { data: gifts = [], isLoading: giftsLoading, isError: giftsError } = useQuery<GiftCard[]>({ queryKey: ['giftCards'], queryFn: fetchGiftCards });

    // Mutations
    const deletePackageMutation = useMutation({
        mutationFn: deleteTokenPackage,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tokenPackages']});
            showToast('بسته با موفقیت حذف شد.');
        }
    });
    const deleteDiscountMutation = useMutation({
        mutationFn: deleteDiscountCode,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['discountCodes']});
            showToast('کد تخفیف با موفقیت حذف شد.');
        }
    });
     const deleteGiftCardMutation = useMutation({
        mutationFn: deleteGiftCard,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['giftCards']});
            showToast('کارت هدیه با موفقیت حذف شد.');
        }
    });

    const handleDeleteClick = (item: {id: number, name: string}, type: string) => {
        setItemToDelete({ ...item, type });
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!itemToDelete) return;
        if (itemToDelete.type === 'بسته') {
            deletePackageMutation.mutate(itemToDelete.id);
        } else if (itemToDelete.type === 'کد تخفیف') {
            deleteDiscountMutation.mutate(itemToDelete.id);
        } else if (itemToDelete.type === 'کارت هدیه') {
            deleteGiftCardMutation.mutate(itemToDelete.id);
        }
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
    };
    
    // Spiritual Gift Settings Logic
    const [localSpiritualSettings, setLocalSpiritualSettings] = useState(settings.spiritualGift);
    useEffect(() => { setLocalSpiritualSettings(settings.spiritualGift); }, [settings.spiritualGift]);
    const handleSpiritualSave = () => {
        updateSettings({ spiritualGift: localSpiritualSettings });
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

    const renderContent = () => {
        if ((activeTab === 'packages' && packagesLoading) || (activeTab === 'discounts' && discountsLoading) || (activeTab === 'gifts' && giftsLoading)) {
            return <LoadingSpinner />;
        }
        if ((activeTab === 'packages' && packagesError) || (activeTab === 'discounts' && discountsError) || (activeTab === 'gifts' && giftsError)) {
            return <ErrorMessage />;
        }

        switch(activeTab) {
            case 'packages':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-semibold">بسته‌های توکن</h3><Button>+ ایجاد بسته</Button></div>
                        <div className="overflow-x-auto">
                           <table className="w-full text-right">
                                <thead className="bg-gray-50 dark:bg-navy-gray"><tr><th className="p-3">نام</th><th className="p-3">توکن</th><th className="p-3">قیمت</th><th className="p-3">عملیات</th></tr></thead>
                                <tbody className="divide-y dark:divide-navy-gray-light">{packages.map(p => (<tr key={p.id}>
                                    <td className="p-3">{p.name}{p.special && <span className="text-xs bg-turquoise text-white px-2 py-0.5 rounded-full mr-2">ویژه</span>}</td>
                                    <td className="p-3">{p.tokens.toLocaleString()}</td><td className="p-3">{p.price.toLocaleString()} تومان</td>
                                    <td className="p-3">
                                        <button className="p-1.5"><EditIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleDeleteClick({id: p.id, name: p.name}, 'بسته')} className="p-1.5"><TrashIcon className="w-5 h-5 text-brick"/></button>
                                    </td></tr>))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'discounts': 
                return (
                     <div>
                        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-semibold">کدهای تخفیف</h3><Button>+ ایجاد کد تخفیف</Button></div>
                         <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead className="bg-gray-50 dark:bg-navy-gray"><tr><th className="p-3">کد</th><th className="p-3">مقدار</th><th className="p-3">انقضا</th><th className="p-3">استفاده</th><th className="p-3">عملیات</th></tr></thead>
                                <tbody className="divide-y dark:divide-navy-gray-light">{discounts.map(d => (<tr key={d.id}>
                                    <td className="p-3 font-mono">{d.code}</td><td className="p-3">{d.value}</td><td className="p-3">{d.expiry}</td><td className="p-3">{d.used}/{d.usageLimit}</td>
                                    <td className="p-3">
                                        <button className="p-1.5"><AnalyticsIcon className="w-5 h-5"/></button>
                                        <button className="p-1.5"><EditIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleDeleteClick({id: d.id, name: d.code}, 'کد تخفیف')} className="p-1.5"><TrashIcon className="w-5 h-5 text-brick"/></button>
                                    </td></tr>))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'gifts':
                return (
                     <div>
                        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-semibold">کارت‌های هدیه</h3><Button>+ ایجاد کارت هدیه</Button></div>
                         <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead className="bg-gray-50 dark:bg-navy-gray"><tr><th className="p-3">عنوان</th><th className="p-3">کد</th><th className="p-3">توکن</th><th className="p-3">استفاده شده توسط</th><th className="p-3">عملیات</th></tr></thead>
                                <tbody className="divide-y dark:divide-navy-gray-light">{gifts.map(g => (<tr key={g.id}>
                                    <td className="p-3">{g.title}</td><td className="p-3 font-mono">{g.code}</td><td className="p-3">{g.tokens.toLocaleString()}</td><td className="p-3">{g.usedBy || '---'}</td>
                                    <td className="p-3"><button onClick={() => handleDeleteClick({id: g.id, name: g.code}, 'کارت هدیه')} className="p-1.5"><TrashIcon className="w-5 h-5 text-brick"/></button></td>
                                </tr>))}</tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'spiritual':
                 return (
                    <div>
                        <h3 className="text-xl font-semibold mb-6">تنظیمات هدیه معنوی</h3>
                         <div className="space-y-4 max-w-md">
                            <div className="flex items-center gap-4"><label htmlFor="spiritual-gift-toggle">فعال‌سازی</label><input type="checkbox" id="spiritual-gift-toggle" name="enabled" checked={localSpiritualSettings.enabled} onChange={(e) => setLocalSpiritualSettings(p => ({...p, enabled: e.target.checked}))} /></div>
                            <div><label>مدت انتظار (ثانیه)</label><Input name="cooldownSeconds" type="number" value={localSpiritualSettings.cooldownSeconds} onChange={(e) => setLocalSpiritualSettings(p => ({...p, cooldownSeconds: +e.target.value}))}/></div>
                            <div><label>توکن در هر بار</label><Input name="tokensPerClick" type="number" value={localSpiritualSettings.tokensPerClick} onChange={(e) => setLocalSpiritualSettings(p => ({...p, tokensPerClick: +e.target.value}))}/></div>
                            <div><label>حداکثر توکن روزانه</label><Input name="maxDailyTokens" type="number" value={localSpiritualSettings.maxDailyTokens} onChange={(e) => setLocalSpiritualSettings(p => ({...p, maxDailyTokens: +e.target.value}))}/></div>
                        </div>
                        <div className="pt-4 mt-4 border-t dark:border-navy-gray-light"><Button onClick={handleSpiritualSave}>ذخیره تغییرات</Button></div>
                    </div>
                );
        }
    }

    return (
        <div>
            <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">مدیریت مالی</h2>
            <div className="border-b border-gray-200 dark:border-navy-gray-light mb-6"><nav className="flex gap-4"><TabButton tabName="packages" label="بسته‌های توکن" /><TabButton tabName="discounts" label="کدهای تخفیف" /><TabButton tabName="gifts" label="کارت‌های هدیه" /><TabButton tabName="spiritual" label="هدیه معنوی" /></nav></div>
            <Card>{renderContent()}</Card>
            <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} title={`حذف ${itemToDelete?.type}`} message={`آیا از حذف "${itemToDelete?.name}" اطمینان دارید؟`} confirmText="حذف کن" isDestructive />
        </div>
    );
};

export default Financials;