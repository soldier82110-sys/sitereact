import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Input, Modal, ConfirmationModal } from '../../components/common';
import { ApiKeyIcon, CheckCircleIcon, XCircleIcon, EditIcon, TrashIcon, LogoIcon, UserIcon, EmailIcon, CpuIcon, PlusIcon, DatabaseIcon } from '../../components/chat/icons';
import { useAppSettings, useToast } from '../../contexts';
import { Marja } from '../../types';
// Fix: logAdminAction is now correctly exported from apiService
import { logAdminAction } from '../../services/apiService';


type ConnectionStatus = 'idle' | 'testing' | 'success' | 'failed';
type Prompt = { id: number; text: string };
type Admin = { id: number; name: string; email: string; role: string };
type ActiveTab = 'general' | 'ai_processing' | 'appearance' | 'seo' | 'maraji' | 'admins' | 'login';
type EmbeddingTab = 'self-hosted' | 'jina';
type SelfHostedModel = {
  id: number;
  name: string;
  apiUrl: string;
  apiKey?: string;
  status: ConnectionStatus;
};

// A self-contained component for API key inputs with a test button
const ApiKeyInput: React.FC<{ label: string }> = ({ label }) => {
    const [status, setStatus] = useState<ConnectionStatus>('idle');
    const { showToast } = useToast();

    const handleTest = () => {
        setStatus('testing');
        setTimeout(() => {
            const isSuccess = Math.random() > 0.3;
            setStatus(isSuccess ? 'success' : 'failed');
            showToast(isSuccess ? 'اتصال با موفقیت برقرار شد.' : 'اتصال ناموفق بود.', isSuccess ? 'success' : 'error');
            setTimeout(() => setStatus('idle'), 3000);
        }, 1000);
    };

    return (
        <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{label}</label>
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
    const [embeddingTab, setEmbeddingTab] = useState<EmbeddingTab>('self-hosted');

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
    const [itemToDelete, setItemToDelete] = useState<{ id: number; name: string; type: 'prompt' | 'marja' | 'admin' | 'selfHostedModel' } | null>(null);

    const [selfHostedModels, setSelfHostedModels] = useState<SelfHostedModel[]>([
        { id: 1, name: 'paraphrase-mpnet-base-v2', apiUrl: 'http://127.0.0.1:8001/embed', status: 'idle', apiKey: 'sec_...' },
    ]);
    const [isSelfHostedModalOpen, setIsSelfHostedModalOpen] = useState(false);
    const [editingSelfHostedModel, setEditingSelfHostedModel] = useState<SelfHostedModel | null>(null);


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
    
    const handleSaveSection = (section: keyof typeof settings | keyof typeof settings.loginPage | 'ai_processing' | 'appearance') => {
        if (section === 'ai_processing') {
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

    const handleDeleteClick = (id: number, name: string, type: 'prompt' | 'marja' | 'admin' | 'selfHostedModel') => {
        setItemToDelete({ id, name, type });
        setIsDeleteModalOpen(true);
    };
    
    const handleOpenSelfHostedModal = (model: SelfHostedModel | null = null) => {
        setEditingSelfHostedModel(model);
        setIsSelfHostedModalOpen(true);
    };

    const handleSaveSelfHostedModel = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const name = (form.elements.namedItem('modelName') as HTMLInputElement).value;
        const host = (form.elements.namedItem('modelHost') as HTMLInputElement).value.trim();
        const port = (form.elements.namedItem('modelPort') as HTMLInputElement).value.trim();
        const path = (form.elements.namedItem('modelPath') as HTMLInputElement).value.trim();
        const apiKey = (form.elements.namedItem('apiKey') as HTMLInputElement).value;

        // Construct URL
        const protocol = host.startsWith('http') ? '' : 'http://';
        const formattedPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';
        const apiUrl = `${protocol}${host}:${port}${formattedPath}`;

        if (editingSelfHostedModel) {
            setSelfHostedModels(selfHostedModels.map(m => 
                m.id === editingSelfHostedModel.id ? { ...m, name, apiUrl, apiKey } : m
            ));
            showToast('مدل با موفقیت ویرایش شد.');
        } else {
            const newModel: SelfHostedModel = {
                id: Date.now(),
                name,
                apiUrl,
                apiKey,
                status: 'idle',
            };
            setSelfHostedModels([...selfHostedModels, newModel]);
            showToast('مدل جدید با موفقیت اضافه شد.');
        }
        setIsSelfHostedModalOpen(false);
        setEditingSelfHostedModel(null);
    };
    
    const parsedUrl = useMemo(() => {
        if (!editingSelfHostedModel?.apiUrl) return { host: '', port: '', path: '' };
        try {
            const url = new URL(editingSelfHostedModel.apiUrl);
            return {
                host: url.hostname,
                port: url.port,
                path: url.pathname,
            };
        } catch (e) {
            const regex = /^(?:https?:\/\/)?([^:\/]+)(?::(\d+))?(.*)$/;
            const match = editingSelfHostedModel.apiUrl.match(regex);
            if (match) {
                return {
                    host: match[1] || '',
                    port: match[2] || '',
                    path: match[3] || '',
                };
            }
            return { host: editingSelfHostedModel.apiUrl, port: '', path: '' };
        }
    }, [editingSelfHostedModel]);


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
            case 'selfHostedModel':
                setSelfHostedModels(selfHostedModels.filter(m => m.id !== itemToDelete.id));
                showToast('مدل Self-Hosted حذف شد.');
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
            case 'selfHostedModel': return 'حذف مدل Self-Hosted';
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

    const EmbeddingTabButton: React.FC<{ tabName: EmbeddingTab; activeTab: EmbeddingTab; label: string, onClick: (tab: EmbeddingTab) => void }> = ({ tabName, activeTab, label, onClick }) => (
        <button
            onClick={() => onClick(tabName)}
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
                 <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">تنظیمات سایت</h2>
            </div>
            
            <div className="border-b border-gray-200 dark:border-navy-gray-light mb-6">
                <nav className="flex flex-wrap gap-4">
                    <TabButton tabName="general" label="تنظیمات عمومی" />
                    <TabButton tabName="ai_processing" label="هوش مصنوعی و پردازش" />
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
                        <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">تنظیمات کاربران و توکن‌ها</h3>
                        <div className="space-y-4 max-w-sm">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">توکن پیش‌فرض کاربران جدید</label>
                                <Input
                                    name="defaultUserTokens"
                                    type="number"
                                    value={localSettings.defaultUserTokens}
                                    onChange={handleSettingsChange}
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">تعداد توکنی که هر کاربر جدید در هنگام ثبت‌نام دریافت می‌کند.</p>
                            </div>
                        </div>
                        <div className="flex justify-end mt-6">
                            <Button onClick={() => handleSaveSection('defaultUserTokens')}>ذخیره تغییرات</Button>
                        </div>
                    </Card>
                )}

                {activeTab === 'ai_processing' && (
                    <div className="space-y-8">
                        <Card>
                            <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 text-gray-800 dark:text-gray-200"><CpuIcon className="w-6 h-6" /> تنظیمات هوش مصنوعی داخلی (Gemini)</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">دستور سیستمی (System Instruction)</label>
                                    <textarea name="ai.systemInstruction" rows={5} className="w-full bg-off-white/50 dark:bg-navy-gray-dark/50 border border-gray-300 dark:border-navy-gray-light rounded-lg p-3" value={localSettings.ai.systemInstruction} onChange={handleSettingsChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">خلاقیت (Temperature): <span className="font-semibold">{localSettings.ai.temperature}</span></label>
                                    <input name="ai.temperature" type="range" min="0" max="1" step="0.1" className="w-full" value={localSettings.ai.temperature} onChange={handleSettingsChange} />
                                </div>
                            </div>
                             <div className="flex justify-end mt-6">
                                <Button onClick={() => handleSaveSection('ai_processing')}>ذخیره تنظیمات Gemini</Button>
                            </div>
                        </Card>

                        <Card>
                            <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">هسته LLM: اتصال به OpenRouter</h3>
                            <div className="space-y-4 max-w-lg">
                                <ApiKeyInput label="کلید API OpenRouter" />
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">شناسه مدل (Model ID)</label>
                                    <Input placeholder="google/gemini-flash-1.5" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">HTTP Referer (اختیاری)</label>
                                    <Input placeholder="https://your-site.com" />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">برخی مدل‌ها برای شناسایی پروژه شما به این مقدار نیاز دارند.</p>
                                </div>
                            </div>
                            <div className="flex justify-end mt-6">
                                <Button onClick={() => showToast('تنظیمات OpenRouter ذخیره شد.')}>ذخیره تنظیمات OpenRouter</Button>
                            </div>
                        </Card>
                        
                        <Card>
                            <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">هسته Embedding</h3>
                            <div className="border-b border-gray-200 dark:border-navy-gray-light mb-4">
                                <nav className="flex gap-4">
                                   <EmbeddingTabButton tabName="self-hosted" activeTab={embeddingTab} label="شخصی (Self-Hosted)" onClick={setEmbeddingTab} />
                                   <EmbeddingTabButton tabName="jina" activeTab={embeddingTab} label="Jina.ai" onClick={setEmbeddingTab} />
                                </nav>
                            </div>
                            {embeddingTab === 'jina' && (
                                <div className="space-y-4 max-w-lg">
                                    <p className="text-gray-600 dark:text-gray-400">از مدل‌های قدرتمند و بهینه Jina.ai استفاده کنید.</p>
                                    <ApiKeyInput label="کلید API Jina.ai" />
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">نام مدل</label>
                                        <Input placeholder="e.g. jina-embeddings-v2-base-fa" defaultValue="jina-embeddings-v2-base-fa" />
                                    </div>
                                     <div className="flex justify-end mt-2">
                                        <Button onClick={() => showToast('تنظیمات Jina.ai ذخیره شد.')}>ذخیره تنظیمات Jina</Button>
                                    </div>
                                </div>
                            )}
                            {embeddingTab === 'self-hosted' && (
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <p className="text-gray-600 dark:text-gray-400">مدل‌های Embedding نصب شده روی سرور شخصی را مدیریت کنید.</p>
                                        <Button onClick={() => handleOpenSelfHostedModal(null)} className="flex items-center gap-2">
                                            <PlusIcon className="w-5 h-5" /> افزودن مدل
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        {selfHostedModels.map(model => (
                                            <div key={model.id} className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 p-2 rounded hover:bg-gray-100 dark:hover:bg-navy-gray-light">
                                                <div className="font-semibold truncate">{model.name}</div>
                                                <div className="text-gray-500 dark:text-gray-400 font-mono text-sm truncate">{model.apiUrl}</div>
                                                <div className="flex justify-start md:justify-end items-center gap-2">
                                                    <Button variant="secondary" className="!px-3 !py-1 text-sm">تست</Button>
                                                    <button onClick={() => handleOpenSelfHostedModal(model)} aria-label="ویرایش" className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-navy-gray"><EditIcon className="w-5 h-5"/></button>
                                                    <button onClick={() => handleDeleteClick(model.id, model.name, 'selfHostedModel')} aria-label="حذف" className="p-1.5 rounded hover:bg-brick/20"><TrashIcon className="w-5 h-5 text-brick"/></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Card>

                         <Card>
                            <h3 className="text-xl font-semibold mb-6 flex items-center gap-3 text-gray-800 dark:text-gray-200"><DatabaseIcon className="w-6 h-6" /> هسته پایگاه داده وکتوری: LlamaIndex</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 -mt-4">تنظیمات اتصال به پایگاه داده وکتوری خود را وارد کنید.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">هاست (Host)</label>
                                    <Input placeholder="localhost" />
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">پورت (Port)</label>
                                    <Input placeholder="8080" type="number" />
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">نام ایندکس/پایگاه داده</label>
                                    <Input placeholder="my-vector-store" />
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">کلید API (اختیاری)</label>
                                    <Input type="password" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <Button variant="secondary">تست اتصال</Button>
                                <Button onClick={() => showToast('تنظیمات LlamaIndex ذخیره شد.')}>ذخیره اتصال</Button>
                            </div>
                        </Card>

                        <Card>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">مدیریت سوالات پیشنهادی</h3>
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
                    </div>
                )}
                
                {activeTab === 'appearance' && (
                     <Card>
                        <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">تصاویر و لوگوها</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">لوگوی سایت</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                                        {localSettings.logoUrl ? <img src={localSettings.logoUrl} alt="پیش‌نمایش لوگو" /> : <LogoIcon className="w-12 h-12 text-gray-400" />}
                                    </div>
                                    <input type="file" id="logo-upload" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'logoUrl')} />
                                    <Button type="button" onClick={() => document.getElementById('logo-upload')?.click()} variant="secondary">انتخاب فایل...</Button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">آواتار مدیر</label>
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
                        <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">تنظیمات سئو و متا</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">عنوان سایت (Title)</label>
                                <Input name="seo.title" value={localSettings.seo.title} onChange={handleSettingsChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">توضیحات متا (Meta Description)</label>
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
                        <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">تنظیمات صفحه ورود</h3>
                        <div className="space-y-6 max-w-lg">
                             <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">لوگوی صفحه ورود</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                                        {localSettings.loginPage.logoUrl ? <img src={localSettings.loginPage.logoUrl} alt="پیش‌نمایش لوگو صفحه ورود" /> : <LogoIcon className="w-12 h-12 text-gray-400" />}
                                    </div>
                                    <input type="file" id="login-logo-upload" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'loginPageLogoUrl')} />
                                    <Button type="button" onClick={() => document.getElementById('login-logo-upload')?.click()} variant="secondary">انتخاب فایل...</Button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">عنوان اصلی</label>
                                <Input
                                    name="loginPage.title"
                                    value={localSettings.loginPage.title}
                                    onChange={handleSettingsChange}
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">زیرنویس</label>
                                <textarea
                                    name="loginPage.subtitle"
                                    rows={4}
                                    className="w-full bg-off-white/50 dark:bg-navy-gray-dark/50 border rounded-lg p-3"
                                    value={localSettings.loginPage.subtitle}
                                    onChange={handleSettingsChange}
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">می‌توانید از تگ <code>&lt;code&gt;</code> برای استایل‌دهی به متن استفاده کنید.</p>
                            </div>
                        </div>
                        <div className="flex justify-end mt-6">
                            <Button onClick={() => handleSaveSection('loginPage')}>ذخیره تنظیمات صفحه ورود</Button>
                        </div>
                    </Card>
                )}
                
                {activeTab === 'maraji' && (
                     <Card>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">مدیریت مراجع تقلید</h3>
                            <Button onClick={() => handleOpenMarjaModal()}>+ افزودن مرجع جدید</Button>
                        </div>
                        <div className="space-y-2">
                            {localSettings.maraji.map(marja => (
                                <div key={marja.id} className="flex justify-between items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-navy-gray-light">
                                    <div className="flex items-center gap-4">
                                        <span className={`px-2 py-0.5 rounded-full text-xs ${marja.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                            {marja.active ? 'فعال' : 'غیرفعال'}
                                        </span>
                                        <span>{marja.name}</span>
                                    </div>
                                    <div>
                                        <button onClick={() => handleOpenMarjaModal(marja)} aria-label="ویرایش" className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-navy-gray"><EditIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleDeleteClick(marja.id, marja.name, 'marja')} aria-label="حذف" className="p-1.5 rounded hover:bg-brick/20"><TrashIcon className="w-5 h-5 text-brick"/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
                
                 {activeTab === 'admins' && (
                     <Card>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">مدیریت مدیران</h3>
                            <Button onClick={() => setIsAdminModalOpen(true)}>+ افزودن مدیر جدید</Button>
                        </div>
                        <div className="space-y-2">
                             {admins.map(admin => (
                                <div key={admin.id} className="flex justify-between items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-navy-gray-light">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-brick flex items-center justify-center text-white font-bold">{admin.name.charAt(0)}</div>
                                        <div>
                                            <p className="font-semibold">{admin.name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{admin.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">{admin.role}</span>
                                         {admin.role !== 'Super Admin' && (
                                            <button onClick={() => handleDeleteClick(admin.id, admin.name, 'admin')} aria-label="حذف" className="p-1.5 rounded hover:bg-brick/20"><TrashIcon className="w-5 h-5 text-brick"/></button>
                                         )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

            </div>
            
            {/* Modals section */}
            <Modal isOpen={isPromptModalOpen} onClose={() => setIsPromptModalOpen(false)} title={editingPrompt ? 'ویرایش سوال' : 'افزودن سوال'}>
                <form onSubmit={handleSavePrompt} className="space-y-4">
                    <Input name="promptText" defaultValue={editingPrompt?.text || ''} required />
                    <div className="flex justify-end gap-3"><Button type="button" variant="secondary" onClick={() => setIsPromptModalOpen(false)}>لغو</Button><Button type="submit">ذخیره</Button></div>
                </form>
            </Modal>
            
            <Modal isOpen={isMarjaModalOpen} onClose={() => setIsMarjaModalOpen(false)} title={editingMarja ? 'ویرایش مرجع تقلید' : 'افزودن مرجع تقلید'}>
                 <form onSubmit={handleSaveMarja} className="space-y-4">
                    <Input name="marjaName" placeholder="نام مرجع" defaultValue={editingMarja?.name || ''} required />
                    <div className="flex justify-end gap-3"><Button type="button" variant="secondary" onClick={() => setIsMarjaModalOpen(false)}>لغو</Button><Button type="submit">ذخیره</Button></div>
                </form>
            </Modal>

            <Modal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} title="افزودن مدیر جدید">
                <form onSubmit={handleSaveNewAdmin} className="space-y-4">
                    <Input icon={<UserIcon className="w-5 h-5"/>} placeholder="نام کامل" value={newAdmin.name} onChange={e => setNewAdmin({...newAdmin, name: e.target.value})} required/>
                    <Input icon={<EmailIcon className="w-5 h-5"/>} type="email" placeholder="ایمیل" value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} required/>
                    <div className="flex justify-end gap-3 pt-4"><Button type="button" variant="secondary" onClick={() => setIsAdminModalOpen(false)}>لغو</Button><Button type="submit">افزودن</Button></div>
                </form>
            </Modal>

            <Modal isOpen={isSelfHostedModalOpen} onClose={() => setIsSelfHostedModalOpen(false)} title={editingSelfHostedModel ? 'ویرایش مدل Self-Hosted' : 'افزودن مدل Self-Hosted'}>
                <form onSubmit={handleSaveSelfHostedModel} className="space-y-4">
                    <div>
                        <label htmlFor="modelName" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">نام مدل</label>
                        <Input id="modelName" name="modelName" placeholder="my-custom-embedding-model" defaultValue={editingSelfHostedModel?.name} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="modelHost" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">هاست/IP</label>
                            <Input id="modelHost" name="modelHost" placeholder="127.0.0.1" defaultValue={parsedUrl.host} required />
                        </div>
                        <div>
                            <label htmlFor="modelPort" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">پورت</label>
                            <Input id="modelPort" name="modelPort" type="number" placeholder="8001" defaultValue={parsedUrl.port} required />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="modelPath" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">مسیر (Path)</label>
                        <Input id="modelPath" name="modelPath" placeholder="/embed" defaultValue={parsedUrl.path} />
                    </div>
                    <div>
                        <label htmlFor="apiKey" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">کلید API (اختیاری)</label>
                        <Input id="apiKey" name="apiKey" type="password" placeholder="اختیاری" defaultValue={editingSelfHostedModel?.apiKey} />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsSelfHostedModalOpen(false)}>لغو</Button>
                        <Button type="submit">{editingSelfHostedModel ? 'ذخیره تغییرات' : 'افزودن'}</Button>
                    </div>
                </form>
            </Modal>

            <ConfirmationModal
                isOpen={isAiConfirmOpen}
                onClose={() => setIsAiConfirmOpen(false)}
                onConfirm={confirmSaveAi}
                title="تایید تغییرات هوش مصنوعی"
                message="تغییر دستور سیستمی می‌تواند رفتار هوش مصنوعی را به طور کامل عوض کند. آیا از این تغییر اطمینان دارید؟"
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