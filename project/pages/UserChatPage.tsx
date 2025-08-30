import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
const { useNavigate, useLocation } = ReactRouterDOM;
import { useTheme, useUser, useAppSettings, useToast } from '../contexts';
import { Theme, Message, Conversation } from '../types';
import { SunIcon, MoonIcon, MenuIcon, CloseIcon } from '../components/chat/icons';
import { Modal, Button, ConfirmationModal } from '../components/common';
import { ChatSidebar, WelcomeScreen, ChatWindow, MessageInput, EditConversationModal } from '../components/chat';
import { streamAiResponse } from '../services/geminiService';
import { useLocalStorage } from '../hooks/useLocalStorage';


const ThemeToggleButtonHeader: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    return <button onClick={toggleTheme} aria-label={`تغییر به تم ${theme === Theme.LIGHT ? 'تیره' : 'روشن'}`} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-navy-gray-light transition-colors">{theme === Theme.LIGHT ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}</button>;
};

const UserChatPage: React.FC = () => {
    const { user, deductToken } = useUser();
    const { settings } = useAppSettings();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportCategory, setReportCategory] = useState('other');
    const [isAiTyping, setIsAiTyping] = useState(false);
    const [messageInputValue, setMessageInputValue] = useState('');
    const [newConversationMarja, setNewConversationMarja] = useState<string | null>(null);
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [conversationToManage, setConversationToManage] = useState<Conversation | null>(null);

    const [conversations, setConversations] = useLocalStorage<Conversation[]>('chatConversations', []);
    const [activeConversationId, setActiveConversationId] = useLocalStorage<string | null>('activeConversationId', null);
    
    const selectedMarjaFromState = location.state?.selectedMarja as string | undefined;

    useEffect(() => {
        if (selectedMarjaFromState) {
            setActiveConversationId(null);
            setNewConversationMarja(selectedMarjaFromState);
            setMessageInputValue('');
            // Clear the state to prevent re-triggering on refresh
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [selectedMarjaFromState, navigate, setActiveConversationId, setNewConversationMarja, setMessageInputValue]);


    const [suggestedPrompts] = useState([
        'حکم شرعی گوش دادن به موسیقی چیست؟',
        'آیا پرداخت خمس بر حقوق کارمندان واجب است؟',
        'شرایط و نحوه خواندن نماز آیات چگونه است؟',
        'حکم روزه گرفتن در سفرهای کوتاه مدت چیست؟',
    ]);

    const reportCategories = {
        'incorrect': 'پاسخ نادرست یا گمراه‌کننده',
        'irrelevant': 'پاسخ نامرتبط',
        'harmful': 'محتوای مضر یا توهین‌آمیز',
        'technical': 'مشکل فنی یا خطا در پاسخ',
        'other': 'سایر موارد'
    };


    const activeConversation = conversations.find(c => c.id === activeConversationId);

    const handleSuggestionClick = (prompt: string) => {
        if (!activeConversationId && !newConversationMarja) {
             navigate('/select-marja');
        } else {
            setMessageInputValue(prompt);
        }
    };

    const handleReportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you would send the report with the category and reason.
        console.log({ 
            category: reportCategory, 
            reason: reportReason,
            marja: activeConversation?.marja 
        });
        setIsReportModalOpen(false);
        setReportReason('');
        setReportCategory('other');
        showToast('گزارش شما با موفقیت ثبت شد.');
    };

    const handleNewChat = () => {
        navigate('/select-marja');
    };

    const triggerAiStream = async (convoId: string, userMessageId: string, marjaName: string, prompt: string) => {
        setIsAiTyping(true);

        const aiMessageId = crypto.randomUUID();
        let fullAiResponse = "";
        let errorOccurred = false;

        // Add a placeholder for the AI message
        setConversations(prev => prev.map(c => {
            if (c.id === convoId) {
                const aiMessage: Message = { id: aiMessageId, text: '', sender: 'ai', timestamp: Date.now() };
                return { ...c, messages: [...c.messages, aiMessage] };
            }
            return c;
        }));

        const aiSettingsWithMarja = {
            ...settings.ai,
            systemInstruction: `${settings.ai.systemInstruction}\n\nYou must answer based on the rulings of Marja' ${marjaName}.`,
        };

        await streamAiResponse(
            convoId,
            prompt,
            aiSettingsWithMarja,
            (chunk) => {
                fullAiResponse += chunk;
                setConversations(prev => prev.map(c =>
                    c.id === convoId ? {
                        ...c,
                        messages: c.messages.map(m =>
                            m.id === aiMessageId ? { ...m, text: fullAiResponse } : m
                        )
                    } : c
                ));
            },
            (errorText) => { // onFinalError callback
                 errorOccurred = true;
                 showToast("خطا در ارتباط با سرور. لطفا دوباره تلاش کنید.", 'error');
                 setConversations(prev => prev.map(c => {
                    if (c.id === convoId) {
                        return {
                            ...c,
                            messages: c.messages
                                .filter(m => m.id !== aiMessageId) // Remove AI placeholder
                                .map(m => m.id === userMessageId ? { ...m, status: 'error' } : m)
                        };
                    }
                    return c;
                }));
            },
            () => { // onClose callback
                setIsAiTyping(false);
                if (!errorOccurred) {
                    setConversations(prev => prev.map(c =>
                        c.id === convoId ? {
                            ...c,
                            messages: c.messages.map(m =>
                                m.id === userMessageId ? { ...m, status: 'sent' } : m
                            )
                        } : c
                    ));
                }
            }
        );
    };

    const handleSendMessage = async (messageText: string) => {
        if (user.tokenBalance <= 0) {
            showToast('متاسفانه توکن کافی برای ارسال پیام ندارید.', 'error');
            return;
        }
    
        const userMessage: Message = {
            id: crypto.randomUUID(),
            text: messageText,
            sender: 'user',
            timestamp: Date.now(),
            status: 'sending',
        };

        let conversationIdToStream: string;
        let marjaForThisChat: string;

        if (!activeConversationId) {
            if (!newConversationMarja) {
                navigate('/select-marja');
                return;
            }
            marjaForThisChat = newConversationMarja;
            const newConvo: Conversation = {
                id: crypto.randomUUID(),
                title: messageText.substring(0, 40) + (messageText.length > 40 ? '...' : ''),
                messages: [userMessage], // Add user message immediately
                marja: marjaForThisChat,
            };
            
            conversationIdToStream = newConvo.id;
            setConversations(prev => [newConvo, ...prev]);
            setActiveConversationId(newConvo.id);
            setNewConversationMarja(null);
        } else {
            const currentConvo = conversations.find(c => c.id === activeConversationId);
            if (!currentConvo) {
                showToast('گفتگوی فعلی یافت نشد. لطفاً یک گفتگوی دیگر انتخاب کنید.', 'error');
                setActiveConversationId(null);
                return;
            }
            
            conversationIdToStream = activeConversationId;
            marjaForThisChat = currentConvo.marja;
            setConversations(prev => prev.map(c =>
                c.id === activeConversationId ? { ...c, messages: [...c.messages, userMessage] } : c
            ));
        }

        deductToken();
        await triggerAiStream(conversationIdToStream, userMessage.id, marjaForThisChat, messageText);
    };
    
    const handleRetryMessage = async (messageId: string) => {
        if (!activeConversation) return;

        const messageToRetry = activeConversation.messages.find(m => m.id === messageId);
        if (!messageToRetry || messageToRetry.sender !== 'user' || user.tokenBalance <= 0) {
            if (user.tokenBalance <= 0) showToast('توکن کافی برای تلاش مجدد ندارید.', 'error');
            return;
        }

        // Reset status to 'sending'
        setConversations(prev => prev.map(c => 
            c.id === activeConversationId ? {
                ...c,
                messages: c.messages.map(m => m.id === messageId ? { ...m, status: 'sending' } : m)
            } : c
        ));

        deductToken();
        await triggerAiStream(activeConversation.id, messageToRetry.id, activeConversation.marja, messageToRetry.text);
    };


    const handleOpenEditModal = (conversationId: string) => {
        const conversation = conversations.find(c => c.id === conversationId);
        if (conversation) {
            setConversationToManage(conversation);
            setIsEditModalOpen(true);
        }
    };
    
    const handleOpenDeleteModal = (conversationId: string) => {
        const conversation = conversations.find(c => c.id === conversationId);
        if (conversation) {
            setConversationToManage(conversation);
            setIsDeleteModalOpen(true);
        }
    };

    const handleRenameConversation = (newName: string) => {
        if (!conversationToManage) return;
        setConversations(prev => prev.map(c => 
            c.id === conversationToManage.id ? { ...c, title: newName } : c
        ));
        setIsEditModalOpen(false);
        setConversationToManage(null);
        showToast('نام گفتگو با موفقیت تغییر کرد.');
    };

    const handleDeleteConversation = () => {
        if (!conversationToManage) return;
        setConversations(prev => prev.filter(c => c.id !== conversationToManage.id));

        if (activeConversationId === conversationToManage.id) {
            setActiveConversationId(null);
        }

        setIsDeleteModalOpen(false);
        setConversationToManage(null);
        showToast('گفتگو با موفقیت حذف شد.');
    };

    return (
        <div className="flex h-screen w-full bg-off-white dark:bg-navy-gray-dark overflow-hidden">
            <div className={`transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} absolute md:relative right-0 h-full z-20`}>
                <ChatSidebar
                    conversations={conversations}
                    activeConversationId={activeConversationId}
                    onSelectConversation={(id) => {
                        setActiveConversationId(id);
                        setNewConversationMarja(null); // Clear new chat state when selecting an old one
                        setMessageInputValue('');
                    }}
                    onNewChat={handleNewChat}
                    onEditConversation={handleOpenEditModal}
                    onDeleteConversation={handleOpenDeleteModal}
                    onClose={() => setIsSidebarOpen(false)}
                />
            </div>

            <div className="flex-1 flex flex-col">
                <header className="flex items-center justify-between p-4 bg-white/70 dark:bg-navy-gray/70 backdrop-blur-lg border-b border-gray-200 dark:border-navy-gray-light">
                    <div className="flex-1 truncate">
                        <h2 className="text-xl font-semibold truncate text-gray-900 dark:text-gray-100">{activeConversation?.title || 'گفتگوی جدید'}</h2>
                        {activeConversation && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                                مرجع تقلید: {activeConversation.marja}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="hidden md:block">
                            <ThemeToggleButtonHeader />
                        </div>
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden p-2" aria-label={isSidebarOpen ? "بستن منو" : "باز کردن منو"}>
                            {isSidebarOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
                        </button>
                    </div>
                </header>

                <div className="flex-1 flex flex-col overflow-y-auto">
                    {activeConversation ? (
                        <ChatWindow
                            messages={activeConversation.messages}
                            isAiTyping={isAiTyping}
                            onReportClick={() => setIsReportModalOpen(true)}
                            onRetryMessage={handleRetryMessage}
                        />
                    ) : (
                        <WelcomeScreen 
                            userName={user.name}
                            prompts={suggestedPrompts} 
                            onPromptClick={handleSuggestionClick} 
                            isReadyForNewChat={!!newConversationMarja}
                            newChatMarjaName={newConversationMarja}
                        />
                    )}
                </div>

                <MessageInput onSendMessage={handleSendMessage} initialValue={messageInputValue} />
            </div>

            <Modal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} title="گزارش پیام">
                <form onSubmit={handleReportSubmit} className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        لطفاً دلیل گزارش این پیام را انتخاب کنید. بازخورد شما به ما در بهبود سیستم کمک می‌کند.
                    </p>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">دسته‌بندی گزارش</label>
                        <select
                            value={reportCategory}
                            onChange={(e) => setReportCategory(e.target.value)}
                            className="w-full bg-off-white/50 dark:bg-navy-gray-dark/50 border border-gray-300 dark:border-navy-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-turquoise p-3"
                        >
                            {Object.entries(reportCategories).map(([key, value]) => (
                                <option key={key} value={key}>{value}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                         <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">توضیحات (اختیاری)</label>
                        <textarea
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            rows={4}
                            placeholder="توضیحات بیشتر..."
                            className="w-full bg-off-white/50 dark:bg-navy-gray-dark/50 border border-gray-300 dark:border-navy-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-turquoise p-3 resize-y"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="secondary" onClick={() => setIsReportModalOpen(false)}>لغو</Button>
                        <Button type="submit">ارسال گزارش</Button>
                    </div>
                </form>
            </Modal>
            
            {conversationToManage && (
                <EditConversationModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleRenameConversation}
                    currentName={conversationToManage.title}
                />
            )}
            
            {conversationToManage && (
                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDeleteConversation}
                    title="حذف گفتگو"
                    message={`آیا از حذف گفتگوی "${conversationToManage.title}" اطمینان دارید؟ این عمل قابل بازگشت نیست.`}
                    confirmText="حذف کن"
                    isDestructive={true}
                />
            )}
        </div>
    );
};

export default UserChatPage;