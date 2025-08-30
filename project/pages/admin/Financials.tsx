import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Input, ConfirmationModal } from '../../components/common';
import { EditIcon, TrashIcon, AnalyticsIcon } from '../../components/chat/icons';
import { useAppSettings, useToast } from '../../contexts';

type ActiveTab = 'packages' | 'discounts' | 'gifts' | 'spiritual';

const mockPackages = [{ id: 1, name: 'بسته نقره‌ای', tokens: 12000, price: 100000, special: true }];
const mockDiscounts = [{ id: 1, code: 'BAHAR', value: '20%', expiry: '۱۴۰۳/۰۶/۳۱', usageLimit: 100, used: 25 }];
const mockGifts = [{ id: 1, title: 'هدیه عید غدیر', code: 'GIFT-ABCD-1234', tokens: 5000, usedBy: 'user@example.com' }];
const mockUsage = [{ email: 'user1@example.com', date: '۱۴۰۳/۰۵/۰۱' }, { email: 'user2@example.com', date: '۱۴۰۳/۰۵/۰۲' }];

const SpiritualGiftSettings: React.FC = () => {
    const { settings, updateSettings } = useAppSettings();
    const { showToast } = useToast();
    const [localSettings, setLocalSettings] = useState(settings.spiritualGift);

    useEffect(() => {
        setLocalSettings(settings.spiritualGift);
    }, [settings.spiritualGift]);
    
    const handleSave = () => {
        updateSettings({ spiritualGift: localSettings });
        showToast('تنظیمات هدیه معنوی ذخیره شد.');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, type, value, checked } = e.target;
        setLocalSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : parseInt(value) || 0,
        }));
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">تنظیمات هدیه معنوی (توکن صلواتی)</h3>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
                <label htmlFor="spiritual-gift-toggle" className="font-medium text-gray-800 dark:text-gray-200">
                    فعال‌سازی بخش هدیه معنوی در سایت
                </label>
                <label className="inline-flex relative items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="spiritual-gift-toggle"
                    name="enabled"
                    checked={localSettings.enabled}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-turquoise"></div>
                </label>
            </div>

            <div className={`space-y-4 max-w-md transition-opacity duration-300 ${localSettings.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">مدت انتظار (ثانیه)</label>
                    <Input name="cooldownSeconds" type="number" value={localSettings.cooldownSeconds} onChange={handleChange} disabled={!localSettings.enabled} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">تعداد توکن در هر بار</label>
                    <Input name="tokensPerClick" type="number" value={localSettings.tokensPerClick} onChange={handleChange} disabled={!localSettings.enabled} />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">حداکثر توکن هدیه در روز</label>
                    <Input name="maxDailyTokens" type="number" value={localSettings.maxDailyTokens} onChange={handleChange} disabled={!localSettings.enabled} />
                </div>
            </div>
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-navy-gray-light">
                <Button onClick={handleSave}>ذخیره تغییرات</Button>
            </div>
        </div>
    );
};

const Financials: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('packages');
    const { showToast } = useToast();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<Omit<ActiveTab, 'spiritual'> | null>(null);
    
    const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: number; name: string; type: string } | null>(null);

    // State for modal forms
    const [packageForm, setPackageForm] = useState({ name: '', tokens: '', price: '' });
    const [discountForm, setDiscountForm] = useState({ code: '', value: '', expiry: '', usageLimit: '' });
    const [giftForm, setGiftForm] = useState({ title: '', code: '', tokens: '' });

    const handleOpenModal = (type: Omit<ActiveTab, 'spiritual'>) => {
        setModalType(type);
        // Reset forms
        setPackageForm({ name: '', tokens: '', price: '' });
        setDiscountForm({ code: '', value: '', expiry: '', usageLimit: '' });
        setGiftForm({ title: '', code: '', tokens: '' });
        setIsModalOpen(true);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const typeText = modalType === 'packages' ? 'بسته' : modalType === 'discounts' ? 'کد تخفیف' : 'کارت هدیه';
        showToast(`${typeText} با موفقیت ایجاد شد. (شبیه‌سازی)`);
        setIsModalOpen(false);
    };

    const handleDeleteClick = (item: {id: number, name: string}, type: string) => {
        setItemToDelete({ ...item, type });
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!itemToDelete) return;
        showToast(`${itemToDelete.type} "${itemToDelete.name}" با موفقیت حذف شد. (شبیه‌سازی)`);
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
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
        <div>
            <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">مدیریت مالی</h2>
            
            <div className="border-b border-gray-200 dark:border-navy-gray-light mb-6">
                <nav className="flex gap-4">
                    <TabButton tabName="packages" label="بسته‌های توکن" />
                    <TabButton tabName="discounts" label="کدهای تخفیف" />
                    <TabButton tabName="gifts" label="کارت‌های هدیه" />
                    <TabButton tabName="spiritual" label="هدیه معنوی" />
                </nav>
            </div>
            
            <Card>
                {activeTab === 'packages' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">بسته‌های توکن</h3>
                            <Button onClick={() => handleOpenModal('packages')}>+ ایجاد بسته جدید</Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead className="bg-gray-50 dark:bg-navy-gray"><tr><th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">نام بسته</th><th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">تعداد توکن</th><th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">قیمت (تومان)</th><th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">عملیات</th></tr></thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-navy-gray-light">{mockPackages.map(p => (<tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-navy-gray-light/50">
                                    <td className="p-3 font-semibold">{p.name}{p.special && <span className="text-xs bg-turquoise text-white px-2 py-0.5 rounded-full mr-2">ویژه</span>}</td>
                                    <td className="p-3">{p.tokens.toLocaleString()}</td><td className="p-3">{p.price.toLocaleString()}</td>
                                    <td className="p-3">
                                        <button aria-label={`ویرایش بسته ${p.name}`} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-navy-gray"><EditIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleDeleteClick({id: p.id, name: p.name}, 'بسته')} aria-label={`حذف بسته ${p.name}`} className="p-1.5 rounded hover:bg-brick/20"><TrashIcon className="w-5 h-5 text-brick"/></button>
                                    </td></tr>))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {activeTab === 'discounts' && (
                     <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">کدهای تخفیف</h3>
                            <Button onClick={() => handleOpenModal('discounts')}>+ ایجاد کد تخفیف</Button>
                        </div>
                         <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead className="bg-gray-50 dark:bg-navy-gray"><tr><th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">کد</th><th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">مقدار</th><th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">تاریخ انقضا</th><th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">استفاده (شده/کل)</th><th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">عملیات</th></tr></thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-navy-gray-light">{mockDiscounts.map(d => (<tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-navy-gray-light/50">
                                    <td className="p-3 font-semibold font-mono">{d.code}</td><td className="p-3">{d.value}</td><td className="p-3">{d.expiry}</td><td className="p-3">{d.used}/{d.usageLimit}</td>
                                    <td className="p-3">
                                        <button onClick={() => setIsUsageModalOpen(true)} aria-label={`آمار استفاده کد ${d.code}`} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-navy-gray"><AnalyticsIcon className="w-5 h-5"/></button>
                                        <button aria-label={`ویرایش کد ${d.code}`} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-navy-gray"><EditIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleDeleteClick({id: d.id, name: d.code}, 'کد تخفیف')} aria-label={`حذف کد ${d.code}`} className="p-1.5 rounded hover:bg-brick/20"><TrashIcon className="w-5 h-5 text-brick"/></button>
                                    </td></tr>))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {activeTab === 'gifts' && (
                     <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">کارت‌های هدیه</h3>
                            <Button onClick={() => handleOpenModal('gifts')}>+ ایجاد کارت هدیه</Button>
                        </div>
                         <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead className="bg-gray-50 dark:bg-navy-gray"><tr><th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">عنوان</th><th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">کد</th><th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">مقدار توکن</th><th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">استفاده شده توسط</th><th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">عملیات</th></tr></thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-navy-gray-light">{mockGifts.map(g => (<tr key={g.id} className="hover:bg-gray-50 dark:hover:bg-navy-gray-light/50">
                                    <td className="p-3 font-semibold">{g.title}</td>
                                    <td className="p-3 font-mono">{g.code}</td>
                                    <td className="p-3">{g.tokens.toLocaleString()}</td>
                                    <td className="p-3">{g.usedBy || 'استفاده نشده'}</td>
                                    <td className="p-3">
                                        <button onClick={() => handleDeleteClick({id: g.id, name: g.code}, 'کارت هدیه')} aria-label={`حذف کارت هدیه ${g.code}`} className="p-1.5 rounded hover:bg-brick/20"><TrashIcon className="w-5 h-5 text-brick"/></button>
                                    </td></tr>))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {activeTab === 'spiritual' && <SpiritualGiftSettings />}
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`ایجاد ${modalType === 'packages' ? 'بسته' : modalType === 'discounts' ? 'کد تخفیف' : 'کارت هدیه'}`}>
                <form onSubmit={handleFormSubmit}>
                    {modalType === 'packages' && <div className="space-y-4">
                        <Input placeholder="نام بسته" value={packageForm.name} onChange={e => setPackageForm({...packageForm, name: e.target.value})} required/>
                        <Input placeholder="تعداد توکن" type="number" value={packageForm.tokens} onChange={e => setPackageForm({...packageForm, tokens: e.target.value})} required/>
                        <Input placeholder="قیمت (تومان)" type="number" value={packageForm.price} onChange={e => setPackageForm({...packageForm, price: e.target.value})} required/>
                    </div>}
                    {modalType === 'discounts' && <div className="space-y-4">
                        <Input placeholder="کد تخفیف (مثلا: BAHAR)" value={discountForm.code} onChange={e => setDiscountForm({...discountForm, code: e.target.value})} required/>
                        <Input placeholder="مقدار (مثلا: 20% یا 10000)" value={discountForm.value} onChange={e => setDiscountForm({...discountForm, value: e.target.value})} required/>
                        <Input placeholder="تاریخ انقضا" type="date" value={discountForm.expiry} onChange={e => setDiscountForm({...discountForm, expiry: e.target.value})} required/>
                        <Input placeholder="محدودیت تعداد استفاده" type="number" value={discountForm.usageLimit} onChange={e => setDiscountForm({...discountForm, usageLimit: e.target.value})} required/>
                    </div>}
                    {modalType === 'gifts' && <div className="space-y-4">
                        <Input placeholder="عنوان کارت هدیه" value={giftForm.title} onChange={e => setGiftForm({...giftForm, title: e.target.value})} required/>
                        <Input placeholder="کد اختصاصی" value={giftForm.code} onChange={e => setGiftForm({...giftForm, code: e.target.value})} required/>
                        <Input placeholder="مقدار توکن هدیه" type="number" value={giftForm.tokens} onChange={e => setGiftForm({...giftForm, tokens: e.target.value})} required/>
                    </div>}
                    <div className="flex justify-end gap-3 pt-4"><Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>لغو</Button><Button type="submit">ایجاد</Button></div>
                </form>
            </Modal>
            
            <Modal isOpen={isUsageModalOpen} onClose={() => setIsUsageModalOpen(false)} title="مشاهده استفاده از کد تخفیف">
                <div className="max-h-80 overflow-y-auto">
                    <table className="w-full text-right">
                        <thead className="bg-gray-50 dark:bg-navy-gray"><tr><th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ایمیل کاربر</th><th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">تاریخ استفاده</th></tr></thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-navy-gray-light">{mockUsage.map((u, i) => <tr key={i}><td className="p-2">{u.email}</td><td className="p-2">{u.date}</td></tr>)}</tbody>
                    </table>
                </div>
                 <div className="flex justify-end gap-3 pt-4"><Button variant="secondary" onClick={() => setIsUsageModalOpen(false)}>بستن</Button></div>
            </Modal>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title={`حذف ${itemToDelete?.type}`}
                message={`آیا از حذف "${itemToDelete?.name}" اطمینان دارید؟ این عمل قابل بازگشت نیست.`}
                confirmText="حذف کن"
                isDestructive
            />
        </div>
    );
};

export default Financials;