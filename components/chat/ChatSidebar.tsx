import React, { useState, useRef, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
const { useNavigate } = ReactRouterDOM;
import { Conversation } from '../../types';
import { useTheme, useUser, useAppSettings, useToast } from '../../contexts/ThemeContext';
import { LogoIcon, PlusIcon, SunIcon, MoonIcon, ThreeDotsIcon, LogoutIcon, SettingsIcon, CreditCardIcon, EditIcon, TrashIcon } from '../icons';
import { Theme } from '../../types';

interface ChatSidebarProps {
    conversations: Conversation[];
    activeConversationId: string | null;
    onSelectConversation: (id: string) => void;
    onNewChat: () => void;
    onEditConversation: (id: string) => void;
    onDeleteConversation: (id: string) => void;
    onClose: () => void;
}

const ThemeToggleButton: React.FC<{ inMenu?: boolean }> = ({ inMenu=false }) => {
    const { theme, toggleTheme } = useTheme();
    const content = (
        <>
            {theme === Theme.LIGHT ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
            <span className="text-sm">
                {theme === Theme.LIGHT ? 'تم تیره' : 'تم روشن'}
            </span>
        </>
    );

    if (inMenu) {
        return <button onClick={toggleTheme} className="flex w-full items-center gap-3 px-4 py-2 text-right text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-navy-gray-light transition-colors">{content}</button>;
    }
    return <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-navy-gray-light transition-colors">{theme === Theme.LIGHT ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}</button>;
};

const ChatListItem: React.FC<{ conversation: Conversation, isActive: boolean, onSelect: () => void, onEdit: () => void, onDelete: () => void }> = ({ conversation, isActive, onSelect, onEdit, onDelete }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    return(
        <div
            onClick={onSelect}
            className={`p-4 cursor-pointer border-b border-gray-200 dark:border-navy-gray-light transition-colors relative ${
                isActive
                ? 'bg-turquoise/10 dark:bg-turquoise/20'
                : 'hover:bg-gray-100 dark:hover:bg-navy-gray'
            }`}
        >
            <div className="pr-10">
                <h3 className="font-semibold truncate">{conversation.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                    مرجع: {conversation.marja}
                </p>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 left-2" ref={menuRef}>
                <button 
                    onClick={(e) => { e.stopPropagation(); setIsMenuOpen(prev => !prev); }}
                    aria-label={`گزینه‌های گفتگوی ${conversation.title}`}
                    className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-navy-gray-light"
                >
                    <ThreeDotsIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
                {isMenuOpen && (
                    <div className="absolute left-0 top-full mt-2 w-36 bg-white dark:bg-navy-gray rounded-lg shadow-xl border border-gray-200 dark:border-navy-gray-light z-10 py-1">
                        <button onClick={(e) => { e.stopPropagation(); onEdit(); setIsMenuOpen(false); }} className="w-full text-right flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-navy-gray-light"><EditIcon className="w-4 h-4" /><span>ویرایش نام</span></button>
                        <button onClick={(e) => { e.stopPropagation(); onDelete(); setIsMenuOpen(false); }} className="w-full text-right flex items-center gap-2 px-3 py-2 text-sm text-brick hover:bg-brick/10"><TrashIcon className="w-4 h-4" /><span>حذف گفتگو</span></button>
                    </div>
                )}
            </div>
        </div>
    );
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ conversations, activeConversationId, onSelectConversation, onNewChat, onEditConversation, onDeleteConversation, onClose }) => {
    const { user } = useUser();
    const { settings } = useAppSettings();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const handleLogout = () => {
        showToast('با موفقیت خارج شدید. به امید دیدار!');
        navigate('/');
    };
    
    return (
        <div className="flex flex-col w-80 h-full bg-white/50 dark:bg-navy-gray/50 backdrop-blur-lg border-l border-gray-200 dark:border-navy-gray-light">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-navy-gray-light">
                <div className="flex items-center gap-2">
                    {settings.logoUrl ? (
                      <img src={settings.logoUrl} alt="لوگو" className="w-8 h-8 object-contain" />
                    ) : (
                      <LogoIcon className="w-8 h-8 text-turquoise dark:text-turquoise-light" />
                    )}
                    <h1 className="text-xl font-bold">گفتگوها</h1>
                </div>
                <button onClick={onNewChat} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-turquoise/10 hover:bg-turquoise/20 dark:bg-turquoise/20 dark:hover:bg-turquoise/30 text-turquoise dark:text-turquoise-light text-sm font-semibold">
                    <PlusIcon className="w-5 h-5" />
                    <span>جدید</span>
                </button>
            </div>
            <div className="flex-1 overflow-y-auto">
                {conversations.map((convo) => (
                    <ChatListItem 
                        key={convo.id} 
                        conversation={convo}
                        isActive={activeConversationId === convo.id}
                        onSelect={() => {
                            onSelectConversation(convo.id);
                            onClose();
                        }}
                        onEdit={() => onEditConversation(convo.id)}
                        onDelete={() => onDeleteConversation(convo.id)}
                    />
                ))}
            </div>
            <div className="p-2 border-t border-gray-200 dark:border-navy-gray-light relative">
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-gray cursor-pointer" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brick flex-shrink-0 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                             {settings.defaultUserAvatarUrl ? (
                                <img src={settings.defaultUserAvatarUrl} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                user.name.charAt(0)
                            )}
                        </div>
                        <div>
                            <h4 className="font-semibold">{user.name}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{user.tokenBalance.toLocaleString()} توکن باقی مانده</p>
                        </div>
                    </div>
                    <ThreeDotsIcon className="w-6 h-6 text-gray-500" />
                </div>
                {isMenuOpen && (
                    <div className="absolute bottom-full right-2 mb-2 w-56 bg-white dark:bg-navy-gray rounded-lg shadow-xl border border-gray-200 dark:border-navy-gray-light z-30 py-1">
                        <button onClick={() => navigate('/tokens')} className="flex w-full items-center gap-3 px-4 py-2 text-right text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-navy-gray-light transition-colors"><CreditCardIcon className="w-5 h-5" /><span>خرید توکن</span></button>
                        <button onClick={() => navigate('/settings')} className="flex w-full items-center gap-3 px-4 py-2 text-right text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-navy-gray-light transition-colors"><SettingsIcon className="w-5 h-5" /><span>تنظیمات</span></button>
                        <ThemeToggleButton inMenu />
                        <hr className="my-1 border-gray-200 dark:border-navy-gray-light"/>
                        <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-2 text-right text-sm text-brick hover:bg-brick/10 transition-colors"><LogoutIcon className="w-5 h-5" /><span>خروج از حساب</span></button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatSidebar;