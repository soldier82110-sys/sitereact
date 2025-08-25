import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
const { useParams, useNavigate } = ReactRouterDOM;
import { initialReports, reportCategoryLabels } from '../../services/apiService';
import { Card, Button } from '../../components/common';

const ReportDetailsPage: React.FC = () => {
    const { reportId } = useParams<{ reportId: string }>();
    const navigate = useNavigate();
    
    const report = initialReports.find(r => r.id.toString() === reportId);

    if (!report) {
        return (
            <div>
                <h2 className="text-2xl font-bold mb-4 text-red-500">گزارش یافت نشد</h2>
                <Button onClick={() => navigate('/admin/reports')}>بازگشت به لیست گزارشات</Button>
            </div>
        );
    }
    
    const feedbackMessageIndex = report.conversation.findIndex(msg => msg.sender === 'ai');

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <h2 className="text-3xl font-bold">
                        {report.feedback === 'reported' ? 'جزئیات گزارش از' : 'بررسی بازخورد از'}: {report.email}
                    </h2>
                    {report.category && (
                        <span className="bg-gray-200 dark:bg-navy-gray-light text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full font-semibold">
                           دسته: {reportCategoryLabels[report.category]}
                        </span>
                    )}
                </div>
                <Button variant="secondary" onClick={() => navigate('/admin/reports')}>بازگشت به لیست</Button>
            </div>
            
            {report.feedback === 'reported' && report.reportText && (
                 <Card className="mb-8">
                    <h3 className="text-xl font-semibold mb-4">متن گزارش کاربر:</h3>
                    <p className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg text-red-800 dark:text-red-200 whitespace-pre-wrap">
                        {report.reportText}
                    </p>
                </Card>
            )}

            <Card>
                <h3 className="text-xl font-semibold mb-4">گفتگوی کامل:</h3>
                <div className="p-4 bg-gray-50 dark:bg-navy-gray-dark rounded-lg space-y-4 max-h-[60vh] overflow-y-auto">
                    {report.conversation.map((msg, index) => (
                        <div
                            key={index}
                            className={`p-4 rounded-xl max-w-xl ${
                                msg.sender === 'user'
                                ? 'bg-turquoise text-white rounded-br-none ml-auto'
                                : `bg-gray-200 dark:bg-navy-gray-light rounded-bl-none mr-auto ${index === feedbackMessageIndex ? 'ring-2 ring-offset-2 dark:ring-offset-navy-gray-dark ' + (report.feedback === 'reported' ? 'ring-red-500' : 'ring-amber-500') : ''}`
                            }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <p className="font-bold">{msg.sender === 'user' ? 'کاربر' : 'هوش مصنوعی'}</p>
                                {index === feedbackMessageIndex && (
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full inline-block ${
                                        report.feedback === 'reported'
                                        ? 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50'
                                        : 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50'
                                    }`}>
                                        {report.feedback === 'reported' ? 'گزارش شده' : 'نپسندیده'}
                                    </span>
                                )}
                            </div>
                            <p>{msg.text}</p>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default ReportDetailsPage;