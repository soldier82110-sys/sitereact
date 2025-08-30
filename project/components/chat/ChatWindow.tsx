import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Message } from '../../types';
import { CopyIcon, ThumbsUpIcon, ThumbsDownIcon, FlagIcon, RetryIcon, XCircleIcon } from './icons';
import { useUser, useAppSettings, useToast } from '../../contexts';

interface ChatWindowProps {
    messages: Message[];
    isAiTyping: boolean;
    onReportClick: () => void;
    onRetryMessage: (messageId: string) => void;
}

const TypingIndicator = () => (
    <div className="flex justify-start w-full">
        <div className="bg-gray-100 dark:bg-navy-gray p-4 rounded-b-xl rounded-tr-xl shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-0"></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></span>
        </div>
    </div>
);

const FeedbackActions: React.FC<{ messageText: string; onReportClick: () => void; }> = ({ messageText, onReportClick }) => {
  const [feedback, setFeedback] = useState<'liked' | 'disliked' | null>(null);
  const { showToast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    showToast('پیام کپی شد!');
  };
  
  const handleLike = () => {
    const newFeedback = feedback === 'liked' ? null : 'liked';
    setFeedback(newFeedback);
    if (newFeedback === 'liked') {
      showToast('از بازخورد شما متشکریم!');
    }
  };

  const handleDislike = () => {
    const newFeedback = feedback === 'disliked' ? null : 'disliked';
    setFeedback(newFeedback);
    if (newFeedback === 'disliked') {
      showToast('از بازخورد شما متشکریم!');
    }
  };

  return (
    <div className="flex items-center gap-2 ml-auto">
      <button onClick={handleCopy} aria-label="کپی کردن پیام" className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-navy-gray-light">
        <CopyIcon className="w-4 h-4 text-gray-500" />
      </button>
      <button
        onClick={handleLike}
        aria-label="پسندیدن"
        className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-navy-gray-light transition-colors ${feedback === 'liked' ? 'text-turquoise' : 'text-gray-500'}`}
      >
        <ThumbsUpIcon className="w-4 h-4" />
      </button>
      <button
        onClick={handleDislike}
        aria-label="نپسندیدن"
        className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-navy-gray-light transition-colors ${feedback === 'disliked' ? 'text-brick' : 'text-gray-500'}`}
      >
        <ThumbsDownIcon className="w-4 h-4" />
      </button>
      <button onClick={onReportClick} aria-label="گزارش پیام" className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-navy-gray-light">
        <FlagIcon className="w-4 h-4 text-gray-500" />
      </button>
    </div>
  );
};


const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isAiTyping, onReportClick, onRetryMessage }) => {
    const { user } = useUser();
    const { settings } = useAppSettings();
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isAiTyping]);

    const messagesWithSeparators = useMemo(() => {
        const isSameDay = (d1: Date, d2: Date) => {
            return d1.getFullYear() === d2.getFullYear() &&
                   d1.getMonth() === d2.getMonth() &&
                   d1.getDate() === d2.getDate();
        };

        const formatDateSeparator = (timestamp: number): string => {
            const messageDate = new Date(timestamp);
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            if (isSameDay(messageDate, today)) return 'امروز';
            if (isSameDay(messageDate, yesterday)) return 'دیروز';
            return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(messageDate);
        };

        const items: (Message | { type: 'separator'; date: string; id: string })[] = [];
        let lastDate: string | null = null;

        messages.forEach(msg => {
            if (!msg.timestamp) return;
            const messageDate = new Date(msg.timestamp);
            const dateString = messageDate.toLocaleDateString('fa-IR');

            if (dateString !== lastDate) {
                items.push({
                    type: 'separator',
                    date: formatDateSeparator(msg.timestamp),
                    id: `sep-${msg.id}`
                });
                lastDate = dateString;
            }
            items.push(msg);
        });
        return items;
    }, [messages]);

    const UserAvatar = () => {
        return (
            <div className="w-10 h-10 rounded-full bg-brick flex-shrink-0 flex items-center justify-center text-white font-bold overflow-hidden">
                {settings.defaultUserAvatarUrl ? (
                    <img src={settings.defaultUserAvatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                    user.name.charAt(0)
                )}
            </div>
        );
    };

    return (
        <main ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
                {messagesWithSeparators.map((item) => {
                    if ('type' in item && item.type === 'separator') {
                        return (
                            <div key={item.id} className="flex justify-center">
                                <span className="bg-gray-200 dark:bg-navy-gray-light text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-semibold">
                                    {item.date}
                                </span>
                            </div>
                        );
                    }
                    const msg = item as Message;
                    return (
                        <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'user' ? (
                                <div className="flex items-end gap-3 max-w-lg">
                                    {msg.status === 'error' && (
                                        <div className="flex flex-col items-center self-center text-brick">
                                            <XCircleIcon className="w-6 h-6 mb-1"/>
                                            <button onClick={() => onRetryMessage(msg.id)} aria-label="تلاش مجدد برای ارسال پیام" className="p-1 rounded-full hover:bg-brick/10">
                                                <RetryIcon className="w-5 h-5"/>
                                            </button>
                                        </div>
                                    )}
                                    <div className={`bg-turquoise text-white p-4 rounded-b-xl rounded-tl-xl shadow-sm ${msg.status === 'error' ? 'bg-opacity-70' : ''}`}>
                                        <p className="whitespace-pre-wrap">{msg.text}</p>
                                        {msg.status === 'error' && <p className="text-xs mt-2 text-white/80">ارسال نشد</p>}
                                    </div>
                                    <UserAvatar />
                                </div>
                            ) : (
                                <div className="flex flex-col items-start gap-2 max-w-lg">
                                    <div className="bg-gray-100 dark:bg-navy-gray p-4 rounded-b-xl rounded-tr-xl shadow-sm">
                                        <p className="whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                    <FeedbackActions messageText={msg.text} onReportClick={onReportClick} />
                                </div>
                            )}
                        </div>
                    );
                })}
                {isAiTyping && <TypingIndicator />}
            </div>
        </main>
    );
};

export default ChatWindow;