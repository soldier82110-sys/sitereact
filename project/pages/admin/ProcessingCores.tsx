import React, { useState } from 'react';
import { Card, Button, Input, Modal } from '../../components/common';
import { ApiKeyIcon, CheckCircleIcon, XCircleIcon, TrashIcon, EditIcon, PlusIcon } from '../../components/chat/icons';
import { useToast } from '../../contexts';

type ConnectionStatus = 'idle' | 'testing' | 'success' | 'failed';
type EmbeddingTab = 'self-hosted' | 'jina';
type SelfHostedModel = {
  id: number;
  name: string;
  url: string;
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


const ProcessingCores: React.FC = () => {
    const { showToast } = useToast();
    const [embeddingTab, setEmbeddingTab] = useState<EmbeddingTab>('self-hosted');

    const [selfHostedModels, setSelfHostedModels] = useState<SelfHostedModel[]>([
        { id: 1, name: 'paraphrase-mpnet-base-v2', url: 'http://127.0.0.1:8001/embed', status: 'idle' },
        { id: 2, name: 'distiluse-base-multilingual-cased-v1', url: 'http://127.0.0.1:8002/embed', status: 'idle' },
    ]);
    const [isModelModalOpen, setIsModelModalOpen] = useState(false);

    const handleSave = (section: string) => {
        showToast(`تنظیمات ${section} با موفقیت ذخیره شد. (شبیه‌سازی)`);
    };
    
    const TabButton: React.FC<{ tabName: EmbeddingTab; activeTab: EmbeddingTab; label: string, onClick: (tab: EmbeddingTab) => void }> = ({ tabName, activeTab, label, onClick }) => (
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
            <h2 className="text-3xl font-bold mb-8">هسته های پردازشی</h2>
            <div className="space-y-8">
                {/* Card 1: LLM Core (OpenRouter) */}
                <Card>
                    <h3 className="text-xl font-semibold mb-6">هسته LLM: اتصال به OpenRouter</h3>
                    <div className="space-y-4 max-w-lg">
                        <ApiKeyInput label="کلید API OpenRouter" />
                        <div>
                            <label className="block text-sm font-medium mb-1">HTTP Referer (اختیاری)</label>
                            <Input placeholder="https://your-site.com" />
                            <p className="text-xs text-gray-500 mt-1">برخی مدل‌ها برای شناسایی پروژه شما به این مقدار نیاز دارند.</p>
                        </div>
                    </div>
                    <div className="flex justify-end mt-6">
                        <Button onClick={() => handleSave('OpenRouter')}>ذخیره تنظیمات OpenRouter</Button>
                    </div>
                </Card>

                {/* Card 2: Embedding */}
                <Card>
                    <h3 className="text-xl font-semibold mb-6">هسته Embedding</h3>
                    <div className="border-b border-gray-200 dark:border-navy-gray-light mb-4">
                        <nav className="flex gap-4">
                           <TabButton tabName="self-hosted" activeTab={embeddingTab} label="شخصی (Self-Hosted)" onClick={setEmbeddingTab} />
                           <TabButton tabName="jina" activeTab={embeddingTab} label="Jina.ai" onClick={setEmbeddingTab} />
                        </nav>
                    </div>
                    
                    {embeddingTab === 'self-hosted' && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-gray-600 dark:text-gray-400">مدل‌های Embedding نصب شده روی سرور شخصی را مدیریت کنید.</p>
                                <Button onClick={() => setIsModelModalOpen(true)} className="flex items-center gap-2">
                                    <PlusIcon className="w-5 h-5" /> افزودن مدل
                                </Button>
                            </div>
                            <div className="space-y-2">
                                {selfHostedModels.map(model => (
                                    <div key={model.id} className="grid grid-cols-3 items-center gap-4 p-2 rounded hover:bg-gray-100 dark:hover:bg-navy-gray-light">
                                        <div className="font-semibold">{model.name}</div>
                                        <div className="text-gray-500 dark:text-gray-400 font-mono text-sm">{model.url}</div>
                                        <div className="flex justify-end items-center gap-2">
                                            <Button variant="secondary" className="!px-3 !py-1 text-sm">تست</Button>
                                            <button aria-label="ویرایش" className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-navy-gray"><EditIcon className="w-5 h-5"/></button>
                                            <button aria-label="حذف" className="p-1.5 rounded hover:bg-brick/20"><TrashIcon className="w-5 h-5 text-brick"/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {embeddingTab === 'jina' && (
                        <div className="space-y-4 max-w-lg">
                            <p className="text-gray-600 dark:text-gray-400">از مدل‌های قدرتمند و بهینه Jina.ai استفاده کنید.</p>
                            <ApiKeyInput label="کلید API Jina.ai" />
                            <div>
                                <label className="block text-sm font-medium mb-1">نام مدل</label>
                                <Input placeholder="e.g. jina-embeddings-v2-base-fa" defaultValue="jina-embeddings-v2-base-fa" />
                            </div>
                             <div className="flex justify-end mt-2">
                                <Button onClick={() => handleSave('Jina.ai')}>ذخیره تنظیمات Jina</Button>
                            </div>
                        </div>
                    )}
                </Card>

                {/* Card 3: Vector DB */}
                <Card>
                    <h3 className="text-xl font-semibold mb-6">هسته پایگاه داده وکتوری: LlamaIndex</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 -mt-4">تنظیمات اتصال به پایگاه داده وکتوری خود را وارد کنید.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
                        <div>
                            <label className="block text-sm font-medium mb-1">هاست (Host)</label>
                            <Input placeholder="localhost" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium mb-1">پورت (Port)</label>
                            <Input placeholder="8080" type="number" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium mb-1">نام ایندکس/پایگاه داده</label>
                            <Input placeholder="my-vector-store" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium mb-1">کلید API (اختیاری)</label>
                            <Input type="password" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                        <Button variant="secondary">تست اتصال</Button>
                        <Button onClick={() => handleSave('LlamaIndex')}>ذخیره اتصال</Button>
                    </div>
                </Card>
            </div>
            
            <Modal isOpen={isModelModalOpen} onClose={() => setIsModelModalOpen(false)} title="افزودن مدل Self-Hosted">
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">نام مدل</label>
                        <Input placeholder="my-custom-embedding-model" required/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">آدرس API</label>
                        <Input placeholder="http://..." required/>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setIsModelModalOpen(false)}>لغو</Button>
                        <Button type="submit">افزودن</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ProcessingCores;