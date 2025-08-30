import React, { useState, useRef, useLayoutEffect } from 'react';
import { SendIcon } from './icons';

const AutoResizingTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    useLayoutEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [props.value]);

    return <textarea ref={textareaRef} {...props} />;
};


interface MessageInputProps {
    onSendMessage: (message: string) => void;
    initialValue?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, initialValue = '' }) => {
    const [message, setMessage] = useState(initialValue);
    
    React.useEffect(() => {
        setMessage(initialValue);
    }, [initialValue]);

    const handleSendMessage = () => {
        if (!message.trim()) return;
        onSendMessage(message.trim());
        setMessage('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.ctrlKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <footer className="p-4 bg-white/70 dark:bg-navy-gray/70 backdrop-blur-lg border-t border-gray-200 dark:border-navy-gray-light">
            <div className="w-full max-w-4xl mx-auto">
                <div className="flex items-end gap-3">
                    <AutoResizingTextarea
                        rows={1}
                        placeholder="پیام خود را اینجا بنویسید..."
                        className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-navy-gray-dark border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-turquoise resize-none overflow-y-auto max-h-40"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        className="w-11 h-11 flex-shrink-0 bg-turquoise text-white rounded-full hover:bg-turquoise-light transition-colors shadow-md disabled:bg-gray-300 dark:disabled:bg-navy-gray-light disabled:cursor-not-allowed flex items-center justify-center"
                        disabled={!message.trim()}
                        aria-label="ارسال پیام"
                        onClick={handleSendMessage}
                    >
                        <SendIcon className="w-6 h-6 -mr-0.5" />
                    </button>
                </div>
                <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                    هزینه ارسال: ۱ توکن
                </p>
            </div>
        </footer>
    );
};

export default MessageInput;