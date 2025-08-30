import React from 'react';
import { LogoIcon } from './icons';
import { useAppSettings } from '../../contexts';

interface WelcomeScreenProps {
    userName: string;
    prompts: string[];
    onPromptClick: (prompt: string) => void;
    isReadyForNewChat: boolean;
    newChatMarjaName: string | null;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ userName, prompts, onPromptClick, isReadyForNewChat, newChatMarjaName }) => {
    const { settings } = useAppSettings();
    
    const welcomeMessage = () => {
        if (isReadyForNewChat) {
            return `شما آماده شروع گفتگو بر اساس فتاوای ${newChatMarjaName} هستید.`;
        }
        if (userName && userName !== 'شما') {
            return `${userName} عزیز، خوش آمدید!`;
        }
        return 'گفتگو را شروع کنید';
    };

    return (
        <div className="flex flex-col items-center justify-start md:justify-center min-h-full text-center p-8 pt-12 md:pt-8">
            {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="لوگو" className="w-24 h-24 mb-6 object-contain" />
            ) : (
                <LogoIcon className="w-24 h-24 text-turquoise/50 dark:text-turquoise-light/50 mb-6" />
            )}
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                 {welcomeMessage()}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm">
                {isReadyForNewChat 
                    ? 'سوال خود را بپرسید یا از موارد زیر استفاده کنید.'
                    : 'برای شروع، یک گفتگوی جدید از منوی کنار ایجاد کنید یا یکی از سوالات پیشنهادی را انتخاب کنید.'
                }
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                {prompts.map((prompt, index) => (
                    <button
                        key={index}
                        onClick={() => onPromptClick(prompt)}
                        className="p-4 bg-white dark:bg-navy-gray rounded-lg text-right hover:bg-gray-100 dark:hover:bg-navy-gray-light transition-colors shadow-sm text-gray-800 dark:text-gray-200"
                    >
                        {prompt}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default WelcomeScreen;