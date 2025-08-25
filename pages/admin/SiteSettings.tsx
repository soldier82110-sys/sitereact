import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Modal, ConfirmationModal } from '../../components/common';
import { ApiKeyIcon, CheckCircleIcon, XCircleIcon, EditIcon, TrashIcon, LogoIcon, UserIcon, EmailIcon } from '../../components/icons';
import { useAppSettings, useToast } from '../../contexts/ThemeContext';
import { Marja } from '../../types';
import { logAdminAction } from '../../services/apiService';


type ConnectionStatus = 'idle' | 'testing' | 'success' | 'failed';
type Prompt = { id: number; text: string };
type Admin = { id: number; name: string; email: string; role: string };
type ActiveTab = 'general' | 'ai' | 'appearance' | 'seo' | 'maraji' | 'admins' | 'login';

const ApiKeyInput: React.FC<{ label: string }> = ({ label }) => {
    const [status, setStatus] = useState<ConnectionStatus>('idle');
    const handleTest = () => {
        setStatus('testing');
        setTimeout(() => {
            const isSuccess = Math.random() > 0.3;
            setStatus(isSuccess ? 'success' : 'failed');
            setTimeout(() => setStatus('idle'), 3000);
        }, 1000);
    };

    return (
        <div>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <div className="flex gap-2 items-center">
                <Input type="password" placeholder="کلید API را وارد کنید" icon={<ApiKeyIcon className="w-5 h-5"/>} className="flex-grow" />
                <Button variant="secondary" onClick={handleTest} disabled={status === 'testing'}>
                    {status === 'testing' ? 'در حال تست...' : 'تست اتصال'}
                </Button>
                {status === 'success' && <CheckCircleIcon className="w-6 h-6 text-green-500" />}
                {status === 'failed' && <XCircleIcon className="w-6 h-6 text-red-500" />}
            </div>
        </div>
    );
};

const SiteSettings: React.FC = () => {
    const { settings, updateSettings } = useAppSettings();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<ActiveTab>('general');
    const [localSettings, setLocalSettings] = useState({ ...settings });
    const [isAiConfirmOpen, setIsAiConfirmOpen] = useState(false);

    const [prompts, setPrompts] = useState<Prompt[]>([
        { id: 1, text: 'حکم شرعی گوش دادن به موسیقی چیست؟' },
        { id: 2, text: 'آیا پرداخت خمس بر حقوق کارمندان واجب است؟' },
        { id: 3, text: 'شرایط و نحوه خواندن نماز آیات چگونه است؟' },
        { id: 4, text: 'حکم روزه گرفتن در سفرهای کوتاه مدت چیست؟' },
    ]);
    const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
    const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);

    const [isMarjaModalOpen, setIsMarjaModalOpen] = useState(false);
    const [editingMarja, setEditingMarja] = useState<Marja | null>(null);
    
    const [admins, setAdmins] = useState<Admin[]>([
        { id: 1, name: 'مدیر کل', email: 'admin@example.com', role: 'Super Admin' },
        { id: 2, name: 'پشتیبان', email: 'support@example.com', role: 'Support' },
    ]);
    const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
    const [newAdmin, setNewAdmin] = useState({ name: '', email: '', role: 'Admin' });
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: number; name: string; type: 'prompt' | 'marja' | 'admin' } | null>(null);


    useEffect(() => {
        setLocalSettings({...settings});
    }, [settings]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'adminAvatarUrl' | 'defaultUserAvatarUrl' | 'faviconUrl' | 'loginPageLogoUrl') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                if (field === 'faviconUrl') {
                    setLocalSettings(prev => ({ ...prev, seo: { ...prev.seo, [field]: result } }));
                } else if (field === 'loginPageLogoUrl') {
                    setLocalSettings(prev => ({ ...prev, loginPage: { ...prev.loginPage, logoUrl: result } }));
                } else {
                    setLocalSettings(prev => ({ ...prev, [field]: result }));
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const [section, field] = name.split('.');

        if (section && field) {
            setLocalSettings(prev => ({
                ...prev,
                [section]: {
                    ...(prev[section as keyof typeof prev] as object),
                    [field]: e.target.type === 'number' ? parseFloat(value) : value
                }
            }));
        } else {
            setLocalSettings(prev => ({ ...prev, [name]: e.target.type === 'number' ? parseInt(value) || 0 : value }));
        }
    };
    
    const handleSaveSection = (section: keyof typeof settings | keyof typeof settings.loginPage | 'ai' | 'appearance') => {
        if (section === 'ai') {
            setIsAiConfirmOpen(true);
            return;
        }

        let updatePayload = {};
        if (section === 'appearance') {
            updatePayload = {
                logoUrl: localSettings.logoUrl,
                adminAvatarUrl: localSettings.adminAvatarUrl,
            };
        } else {
            updatePayload = { [section]: localSettings[section as keyof typeof localSettings] };
        }
        
        updateSettings(updatePayload);
        showToast('تنظیمات با موفقیت ذخیره شد.');
    };

    const confirmSaveAi = () => {
        updateSettings({ ai: localSettings.ai });
        logAdminAction('مدیر کل', 'دستور سیستمی هوش مصنوعی را تغییر داد.');
        showToast('تنظیمات هوش مصنوعی با موفقیت ذخیره شد.');
        setIsAiConfirmOpen(false);
    };

    const handleOpenPromptModal = (prompt: Prompt | null = null) => {
        setEditingPrompt(prompt);
        setIsPromptModalOpen(true);
    };

    const handleSavePrompt = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const text = (e.currentTarget.elements.namedItem('promptText') as HTMLInputElement).value;
        if (editingPrompt) {
            setPrompts(prompts.map(p => p.id === editingPrompt.id ? { ...p, text } : p));
        } else {
            setPrompts([...prompts, { id: Date.now(), text }]);
        }
        setIsPromptModalOpen(false);
        setEditingPrompt(null);
        showToast('سوال پیشنهادی ذخیره شد.');
    };

    const handleOpenMarjaModal = (marja: Marja | null = null) => {
        setEditingMarja(marja);
        setIsMarjaModalOpen(true);
    };

    const handleSaveMarja = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const name = (e.currentTarget.elements.namedItem('marjaName') as HTMLInputElement).value;
        if (editingMarja) {
            updateSettings({ maraji: settings.maraji.map(m => m.id === editingMarja.id ? { ...m, name } : m) });
        } else {
            updateSettings({ maraji: [...settings.maraji, { id: Date.now(), name, active: true }] });
        }
        setIsMarjaModalOpen(false);
        setEditingMarja(null);
        showToast('لیست مراجع تقلید به‌روزرسانی شد.');
    };

    const handleSaveNewAdmin = (e: React.FormEvent) => {
        e.preventDefault();
        setAdmins([...admins, { ...newAdmin, id: Date.now() }]);
        setNewAdmin({ name: '', email: '', role: 'Admin' });
        setIsAdminModalOpen(false);
        showToast('مدیر جدید با موفقیت اضافه شد.');
    };

    const handleDeleteClick = (id: number, name: string, type: 'prompt' | 'marja' | 'admin') => {
        setItemToDelete({ id, name, type });
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!itemToDelete) return;

        switch (itemToDelete.type) {
            case 'prompt':
                setPrompts(prompts.filter(p => p.id !== itemToDelete.id));
                showToast('سوال پیشنهادی حذف شد.');
                break;
            case 'marja':
                updateSettings({ maraji: settings.maraji.filter(m => m.id !== itemToDelete.id) });
                showToast('مرجع تقلید حذف شد.');
                logAdminAction('مدیر کل', `مرجع تقلید "${itemToDelete.name}" را حذف کرد.`);
                break;
            case 'admin':
                setAdmins(admins.filter(a => a.id !== itemToDelete.id));
                showToast('مدیر حذف شد.');
                break;
        }

        setIsDeleteModalOpen(false);
        setItemToDelete(null);
    };

    const getDeleteModalTitle = () => {
        if (!itemToDelete) return "حذف";
        switch (itemToDelete.type) {
            case 'prompt': return 'حذف سوال پیشنهادی';
            case 'marja': return 'حذف مرجع تقلید';
            case 'admin': return 'حذف مدیر';
            default: return 'حذف';
        }
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
            <div className="flex items-center justify-between mb-8">
                 <h2 className="text-3xl font-bold">تنظیمات سایت</h2>
            </div>
            
            <div className="border-b border-gray-200 dark:border-navy-gray-light mb-6">
                <nav className="flex flex-wrap gap-4">
                    <TabButton tabName="general" label="تنظیمات عمومی" />
                    <TabButton tabName="ai" label="هوش مصنوعی" />
                    <TabButton tabName="appearance" label="تنظیمات ظاهری" />
                    <TabButton tabName="seo" label="سئو و متا" />
                    <TabButton tabName="login" label="صفحه ورود" />
                    <TabButton tabName="maraji" label="مراجع تقلید" />
                    <TabButton tabName="admins" label="مدیریت مدیران" />
                </nav>
            </div>

            <div className="space-y-8">
                {activeTab === 'general' && (
                    <Card>
                        <h3 className="text-xl font-semibold mb-6">تنظیمات کاربران و توکن‌ها</h3>
                        <div className="space-y-4 max-w-sm">
                            <div>
                                <label className="block text-sm font-medium mb-1">توکن پیش‌فرض کاربران جدید</label>
                                <Input
                                    name="defaultUserTokens"
                                    type="number"
                                    value={localSettings.defaultUserTokens}
                                    onChange={handleSettingsChange}
                                />
                                <p className="text-xs text-gray-500 mt-1">تعداد توکنی که هر کاربر جدید در هنگام ثبت‌نام دریافت می‌کند.</p>
                            </div>
                        </div>
                        <div className="flex justify-end mt-6">
                            <Button onClick={() => handleSaveSection('defaultUserTokens')}>ذخیره تغییرات</Button>
                        </div>
                    </Card>
                )}

                {activeTab === 'ai' && (
                    <>
                        <Card>
                            <h3 className="text-xl font-semibold mb-6">تنظیمات هوش مصنوعی</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">دستور سیستمی (System Instruction)</label>
                                    <textarea name="ai.systemInstruction" rows={5} className="w-full bg-off-white/50 dark:bg-navy-gray-dark/50 border border-gray-300 dark:border-navy-gray-light rounded-lg p-3" value={localSettings.ai.systemInstruction} onChange={handleSettingsChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">خلاقیت (Temperature): <span className="font-semibold">{localSettings.ai.temperature}</span></label>
                                    <input name="ai.temperature" type="range" min="0" max="1" step="0.1" className="w-full" value={localSettings.ai.temperature} onChange={handleSettingsChange} />
                                </div>
                            </div>
                             <div className="flex justify-end mt-6">
                                <Button onClick={() => handleSaveSection('ai')}>ذخیره تنظیمات AI</Button>
                            </div>
                        </Card>
                        <Card>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold">مدیریت سوالات پیشنهادی</h3>
                                <Button onClick={() => handleOpenPromptModal()}>+ افزودن سوال جدید</Button>
                            </div>
                            <div className="space-y-2">
                                {prompts.map(prompt => (
                                    <div key={prompt.id} className="flex justify-between items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-navy-gray-light">
                                        <p>{prompt.text}</p>
                                        <div>
                                            <button onClick={() => handleOpenPromptModal(prompt)} aria-label={`ویرایش سوال: ${prompt.text}`} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-navy-gray-light"><EditIcon className="w-5 h-5"/></button>
                                            <button onClick={() => handleDeleteClick(prompt.id, prompt.text, 'prompt')} aria-label={`حذف سوال: ${prompt.text}`} className="p-1.5 rounded hover:bg-brick/20"><TrashIcon className="w-5 h-5 text-brick"/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </>
                )}
                
                {activeTab === 'appearance' && (
                     <Card>
                        <h3 className="text-xl font-semibold mb-6">تصاویر و لوگوها</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">لوگوی سایت</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                                        {localSettings.logoUrl ? <img src={localSettings.logoUrl} alt="پیش‌نمایش لوگو" /> : <LogoIcon className="w-12 h-12 text-gray-400" />}
                                    </div>
                                    <input type="file" id="logo-upload" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'logoUrl')} />
                                    <Button type="button" onClick={() => document.getElementById('logo-upload')?.click()} variant="secondary">انتخاب فایل...</Button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">آواتار مدیر</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                        {localSettings.adminAvatarUrl ? <img src={localSettings.adminAvatarUrl} alt="پیش‌نمایش آواتار مدیر" className="w-full h-full object-cover"/> : <UserIcon className="w-12 h-12 text-gray-400" />}
                                    </div>
                                    <input type="file" id="admin-avatar-upload" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'adminAvatarUrl')} />
                                    <Button type="button" onClick={() => document.getElementById('admin-avatar-upload')?.click()} variant="secondary">انتخاب فایل...</Button>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end mt-6">
                            <Button onClick={() => handleSaveSection('appearance')}>ذخیره تنظیمات ظاهری</Button>
                        </div>
                    </Card>
                )}
                
                {activeTab === 'seo' && (
                     <Card>
                        <h3 className="text-xl font-semibold mb-6">تنظیمات سئو و متا</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">عنوان سایت (Title)</label>
                                <Input name="seo.title" value={localSettings.seo.title} onChange={handleSettingsChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">توضیحات متا (Meta Description)</label>
                                <textarea name="seo.description" rows={3} className="w-full bg-off-white/50 dark:bg-navy-gray-dark/50 border rounded-lg p-3" value={localSettings.seo.description} onChange={handleSettingsChange} />
                            </div>
                        </div>
                        <div className="flex justify-end mt-6">
                            <Button onClick={() => handleSaveSection('seo')}>ذخیره تنظیمات سئو</Button>
                        </div>
                    </Card>
                )}
                
                 {activeTab === 'login' && (
                    <Card>
                        <h3 className="text-xl font-semibold mb-6">تنظیمات صفحه ورود</h3>
                        <div className="space-y-6 max-w-lg">
                             <div>
                                <label className="block text-sm font-medium mb-2">لوگوی صفحه ورود</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                                        {localSettings.loginPage.logoUrl ? <img src={localSettings.loginPage.logoUrl} alt="پیش‌نمایش لوگو صفحه ورود" /> : <LogoIcon className="w-12 h-12 text-gray-400" />}
                                    </div>
                                    <input type="file" id="login-logo-upload" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'loginPageLogoUrl')} />
                                    <Button type="button" onClick={() => document.getElementById('login-logo-upload')?.click()} variant="secondary">انتخاب فایل...</Button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">عنوان اصلی</label>
                                <Input
                                    name="loginPage.title"
                                    value={localSettings.loginPage.title}
                                    onChange={handleSettingsChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">متن زیر عنوان (پشتیبانی از HTML)</label>
                                <textarea
                                    name="loginPage.subtitle"
                                    rows={4}
                                    className="w-full bg-off-white/50 dark:bg-navy-gray-dark/50 border border-gray-300 dark:border-navy-gray-light rounded-lg p-3"
                                    value={localSettings.loginPage.subtitle}
                                    onChange={handleSettingsChange}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end mt-6">
                            <Button onClick={() => handleSaveSection('loginPage')}>ذخیره تغییرات</Button>
                        </div>
                    </Card>
                )}

                {activeTab === 'maraji' && (
                    <Card>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">مدیریت لیست مراجع تقلید</h3>
                            <Button onClick={() => handleOpenMarjaModal()}>+ افزودن مرجع جدید</Button>
                        </div>
                        <div className="space-y-2">
                            {settings.maraji.map(marja => (
                                <div key={marja.id} className="flex justify-between items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-navy-gray-light">
                                    <p className={marja.active ? '' : 'text-gray-400 line-through'}>{marja.name}</p>
                                    <div className="flex items-center gap-4">
                                        <label className="inline-flex relative items-center cursor-pointer">
                                          <input type="checkbox" checked={marja.active} onChange={() => updateSettings({ maraji: settings.maraji.map(m => m.id === marja.id ? { ...m, active: !m.active } : m) })} className="sr-only peer" />
                                          <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:bg-turquoise"></div>
                                        </label>
                                        <button onClick={() => handleOpenMarjaModal(marja)} aria-label={`ویرایش مرجع: ${marja.name}`} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-navy-gray-light"><EditIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleDeleteClick(marja.id, marja.name, 'marja')} aria-label={`حذف مرجع: ${marja.name}`} className="p-1.5 rounded hover:bg-brick/20"><TrashIcon className="w-5 h-5 text-brick"/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {activeTab === 'admins' && (
                     <Card>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">مدیریت ادمین‌ها</h3>
                            <Button onClick={() => setIsAdminModalOpen(true)}>+ افزودن مدیر جدید</Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead className="border-b"><tr><th className="p-3">نام</th><th className="p-3">ایمیل</th><th className="p-3">نقش</th><th className="p-3">عملیات</th></tr></thead>
                                <tbody>{admins.map(admin => (
                                    <tr key={admin.id} className="border-b dark:border-navy-gray">
                                        <td className="p-3 font-semibold">{admin.name}</td>
                                        <td className="p-3">{admin.email}</td>
                                        <td className="p-3"><span className="bg-sky-100 text-sky-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-sky-900 dark:text-sky-300">{admin.role}</span></td>
                                        <td className="p-3">
                                            <button onClick={() => handleDeleteClick(admin.id, admin.name, 'admin')} aria-label={`حذف مدیر: ${admin.name}`} className="p-1.5 rounded hover:bg-brick/20"><TrashIcon className="w-5 h-5 text-brick"/></button>
                                        </td>
                                    </tr>))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </div>
            
            <Modal isOpen={isPromptModalOpen} onClose={() => setIsPromptModalOpen(false)} title={editingPrompt ? 'ویرایش سوال' : 'افزودن سوال جدید'}>
                <form onSubmit={handleSavePrompt} className="space-y-4">
                    <Input name="promptText" defaultValue={editingPrompt?.text || ''} placeholder="متن سوال پیشنهادی" required />
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsPromptModalOpen(false)}>لغو</Button>
                        <Button type="submit">ذخیره</Button>
                    </div>
                </form>
            </Modal>
            
            <Modal isOpen={isMarjaModalOpen} onClose={() => setIsMarjaModalOpen(false)} title={editingMarja ? 'ویرایش مرجع' : 'افزودن مرجع جدید'}>
                <form onSubmit={handleSaveMarja} className="space-y-4">
                    <Input name="marjaName" defaultValue={editingMarja?.name || ''} placeholder="نام مرجع تقلید" required />
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsMarjaModalOpen(false)}>لغو</Button>
                        <Button type="submit">ذخیره</Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} title="افزودن مدیر جدید">
                <form onSubmit={handleSaveNewAdmin} className="space-y-4">
                    <Input icon={<UserIcon className="w-5 h-5"/>} placeholder="نام کامل" value={newAdmin.name} onChange={e => setNewAdmin({...newAdmin, name: e.target.value})} required/>
                    <Input icon={<EmailIcon className="w-5 h-5"/>} type="email" placeholder="ایمیل" value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} required/>
                    <div>
                        <label className="block text-sm font-medium mb-1">نقش</label>
                        <select 
                            value={newAdmin.role} 
                            onChange={e => setNewAdmin({...newAdmin, role: e.target.value})}
                            className="w-full bg-off-white/50 dark:bg-navy-gray-dark/50 border border-gray-300 dark:border-navy-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-turquoise px-4 py-2.5"
                        >
                            <option value="Admin">Admin</option>
                            <option value="Support">Support</option>
                            <option value="Content Moderator">Content Moderator</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsAdminModalOpen(false)}>لغو</Button>
                        <Button type="submit">افزودن</Button>
                    </div>
                </form>
            </Modal>
            
            <ConfirmationModal
                isOpen={isAiConfirmOpen}
                onClose={() => setIsAiConfirmOpen(false)}
                onConfirm={confirmSaveAi}
                title="تایید تغییرات هوش مصنوعی"
                message="آیا از تغییر تنظیمات هوش مصنوعی اطمینان دارید؟ این عمل ممکن است رفتار و کیفیت پاسخ‌های سیستم را به طور قابل توجهی تغییر دهد."
                confirmText="بله، ذخیره کن"
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title={getDeleteModalTitle()}
                message={`آیا از حذف "${itemToDelete?.name}" اطمینان دارید؟ این عمل قابل بازگشت نیست.`}
                confirmText="حذف کن"
                isDestructive
            />
        </div>
    );
};

export default SiteSettings;