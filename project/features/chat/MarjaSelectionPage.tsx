import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
const { useNavigate } = ReactRouterDOM;
import { Card } from '../../components/common';
import { useAppSettings } from '../../contexts';
import { LogoIcon } from '../../components/icons';

const MarjaSelectionPage: React.FC = () => {
    const navigate = useNavigate();
    const { settings } = useAppSettings();

    const handleSelectMarja = (name: string) => {
        navigate('/chat', { state: { selectedMarja: name } });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-off-white to-turquoise/10 dark:from-navy-gray-dark dark:to-turquoise/10 p-4">
            <Card className="w-full max-w-2xl mx-auto">
                <div className="text-center">
                    {settings.logoUrl ? (
                        <img src={settings.logoUrl} alt="لوگو" className="w-16 h-16 mx-auto mb-4 object-contain" />
                    ) : (
                        <LogoIcon className="w-16 h-16 mx-auto text-turquoise dark:text-turquoise-light mb-4" />
                    )}
                    <h1 className="text-3xl font-bold mb-2">انتخاب مرجع تقلید</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        برای دریافت پاسخ‌های دقیق‌تر بر اساس احکام شرعی، لطفا مرجع تقلید خود را برای این گفتگو انتخاب کنید.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {settings.maraji.map((marja) => (
                        <button
                            key={marja.id}
                            onClick={() => handleSelectMarja(marja.name)}
                            disabled={!marja.active}
                            className={`p-6 rounded-lg text-lg font-semibold text-center border-2 transition-all duration-300 shadow-md ${
                                marja.active 
                                ? 'bg-white/50 dark:bg-navy-gray/50 hover:bg-turquoise/10 dark:hover:bg-turquoise/20 hover:text-turquoise dark:hover:text-turquoise-light border-transparent hover:border-turquoise cursor-pointer' 
                                : 'bg-gray-100 dark:bg-navy-gray-dark/50 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-navy-gray-light cursor-not-allowed'
                            }`}
                        >
                            {marja.name}
                        </button>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default MarjaSelectionPage;