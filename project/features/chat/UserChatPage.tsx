import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
const { useNavigate, useLocation } = ReactRouterDOM;
import { useTheme, useUser, useAppSettings, useToast } from '../../contexts';
import { Theme, Message, Conversation } from '../../types';
import { SunIcon, MoonIcon, MenuIcon, CloseIcon } from '../../components/icons';
import { Modal, Button, ConfirmationModal, LoadingSpinner } from '../../components/common';
// Fix: Import ShareModal to handle sharing functionality.
import { ChatSidebar, WelcomeScreen, ChatWindow, MessageInput, EditConversationModal, ShareModal } from './components';
import { streamChatResponse, fetchConversations } from '../../services/apiService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';


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
    const queryClient = useQueryClient();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [newConversationMarja, setNewConversationMarja] = useState<string | null>(null);
    
    // Modals state
    // Fix: Add 'share' to the possible modal states.
    const [modal, setModal] = useState<'edit' | 'delete' | 'report' | 'share' | null>(null);
    const [conversationToManage, setConversationToManage] = useState<Conversation | null>(null);
    const [reportDetails, setReportDetails] = useState({ reason: '', category: 'other' });
    // Fix: Add state to hold the content for the share modal.
    const [shareContent, setShareContent] = useState<{ userMessage: Message, aiMessage: Message } | null>(null);

    const { data: conversations = [], isLoading: conversationsLoading } = useQuery<Conversation[]>({
        queryKey: ['conversations'],
        queryFn: fetchConversations
    });
    
    const activeConversation = conversations.find(c => c.id === activeConversationId);
    
    useEffect(() => {
        const selectedMarjaFromState = location.state?.selectedMarja as string | undefined;
        if (selectedMarjaFromState) {
            setActiveConversationId(null);
            setNewConversationMarja(selectedMarjaFromState);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    const sendMessageMutation = useMutation({
        mutationFn: async (messageText: string) => {
            if (user.tokenBalance <= 0) {
                showToast('متاسفانه توکن کافی برای ارسال پیام ندارید.', 'error');
                return;
            }
            const userMessage: Message = { id: crypto.randomUUID(), text: messageText, sender: 'user', timestamp: Date.now(), status: 'sending' };
            
            let targetConvoId: string;
            let targetMarja: string;
            let isNewConversation = false;
            
            if (activeConversation) {
                targetConvoId = activeConversation.id;
                targetMarja = activeConversation.marja;
                queryClient.setQueryData(['conversations'], (old: Conversation[] | undefined) => old?.map(c => c.id === targetConvoId ? {...c, messages: [...c.messages, userMessage]} : c));
            } else if (newConversationMarja) {
                targetMarja = newConversationMarja;
                const newConvo: Conversation = { id: crypto.randomUUID(), title: messageText.substring(0, 40), messages: [userMessage], marja: targetMarja };
                targetConvoId = newConvo.id;
                isNewConversation = true;
                queryClient.setQueryData(['conversations'], (old: Conversation[] | undefined) => old ? [newConvo, ...old] : [newConvo]);
                setActiveConversationId(targetConvoId);
                setNewConversationMarja(null);
            } else {
                navigate('/select-marja');
                return;
            }
            
            deductToken();
            const aiMessageId = crypto.randomUUID();
            
            // Optimistically add AI placeholder
            queryClient.setQueryData(['conversations'], (old: Conversation[] | undefined) => old?.map(c => c.id === targetConvoId ? {...c, messages: [...c.messages, { id: aiMessageId, text: '', sender: 'ai', timestamp: Date.now() }]} : c));

            streamChatResponse(
                { message: userMessage.text, conversationId: targetConvoId, marjaName: targetMarja },
                (chunk) => {
                    queryClient.setQueryData(['conversations'], (old: Conversation[] | undefined) => old?.map(c => c.id === targetConvoId ? {...c, messages: c.messages.map(m => m.id === aiMessageId ? { ...m, text: m.text + chunk } : m) } : c));
                },
                () => { // onCloseStream
                    queryClient.setQueryData(['conversations'], (old: Conversation[] | undefined) => old?.map(c => c.id === targetConvoId ? {...c, messages: c.messages.map(m => m.id === userMessage.id ? {...m, status: 'sent'} : m)} : c));
                    if(isNewConversation) queryClient.invalidateQueries({ queryKey: ['conversations']}); // Refetch to get real ID from server
                },
                (errorMessage) => { 
                    showToast(errorMessage, 'error');
                    queryClient.setQueryData(['conversations'], (old: Conversation[] | undefined) => old?.map(c => c.id === targetConvoId ? {...c, messages: c.messages.filter(m => m.id !== aiMessageId).map(m => m.id === userMessage.id ? {...m, status: 'error'} : m)} : c));
                }
            );
        }
    });

    const handleOpenModal = (type: 'edit' | 'delete', convoId: string) => {
        const conversation = conversations.find(c => c.id === convoId);
        if (conversation) {
            setConversationToManage(conversation);
            setModal(type);
        }
    };

    // Fix: Add a handler for the share functionality.
    const handleShareClick = (userMessage: Message, aiMessage: Message) => {
        setShareContent({ userMessage, aiMessage });
        setModal('share');
    };
    
    return (
        <div className="flex h-screen w-full bg-off-white dark:bg-navy-gray-dark overflow-hidden">
            <div className={`transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} absolute md:relative right-0 h-full z-20`}>
                {conversationsLoading ? <LoadingSpinner /> : (
                    <ChatSidebar
                        conversations={conversations}
                        activeConversationId={activeConversationId}
                        onSelectConversation={(id) => { setActiveConversationId(id); setNewConversationMarja(null); setIsSidebarOpen(false); }}
                        onNewChat={() => navigate('/select-marja')}
                        onEditConversation={(id) => handleOpenModal('edit', id)}
                        onDeleteConversation={(id) => handleOpenModal('delete', id)}
                        onClose={() => setIsSidebarOpen(false)}
                    />
                )}
            </div>

            <div className="flex-1 flex flex-col">
                <header className="flex items-center justify-between p-4 bg-white/70 dark:bg-navy-gray/70 backdrop-blur-lg border-b border-gray-200 dark:border-navy-gray-light">
                     <div className="flex-1 truncate">
                        <h2 className="text-xl font-semibold truncate text-gray-900 dark:text-gray-100">{activeConversation?.title || (newConversationMarja ? 'گفتگوی جدید' : 'محراب')}</h2>
                        {(activeConversation || newConversationMarja) && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                                مرجع تقلید: {activeConversation?.marja || newConversationMarja}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="hidden md:block"><ThemeToggleButtonHeader /></div>
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden p-2" aria-label="Toggle menu">
                            {isSidebarOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
                        </button>
                    </div>
                </header>

                <div className="flex-1 flex flex-col overflow-y-auto">
                    {activeConversation ? (
                        // Fix: Pass the onShareClick prop to the ChatWindow component.
                        <ChatWindow messages={activeConversation.messages} isAiTyping={sendMessageMutation.isPending} onReportClick={() => setModal('report')} onRetryMessage={(id) => console.log(id)} onShareClick={handleShareClick} />
                    ) : (
                        <WelcomeScreen userName={user.name} prompts={settings.ai.suggestedPrompts || []} onPromptClick={(p) => sendMessageMutation.mutate(p)} isReadyForNewChat={!!newConversationMarja} newChatMarjaName={newConversationMarja} />
                    )}
                </div>

                <MessageInput onSendMessage={(text) => sendMessageMutation.mutate(text)} disabled={sendMessageMutation.isPending} />
            </div>

            <Modal isOpen={modal === 'report'} onClose={() => setModal(null)} title="گزارش پیام"> {/* ... form ... */}</Modal>
            {conversationToManage && (<EditConversationModal isOpen={modal === 'edit'} onClose={() => setModal(null)} onSave={(name) => console.log(name)} currentName={conversationToManage.title} />)}
            {conversationToManage && (<ConfirmationModal isOpen={modal === 'delete'} onClose={() => setModal(null)} onConfirm={() => console.log('delete')} title="حذف گفتگو" message={`آیا از حذف گفتگوی "${conversationToManage.title}" اطمینان دارید؟`} confirmText="حذف کن" isDestructive={true} />)}
            {/* Fix: Render the ShareModal when its state is active. */}
            <ShareModal
                isOpen={modal === 'share'}
                onClose={() => setModal(null)}
                content={shareContent}
            />
        </div>
    );
};

export default UserChatPage;