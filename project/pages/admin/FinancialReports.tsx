import React, { useState } from 'react';
import { Card, Input } from '../../components/common';

const mockTransactions = [
  { id: 'TXN7C3B', user: 'user@example.com', package: 'بسته نقره‌ای', amount: 100000, status: 'موفق', date: '۱۴۰۳/۰۵/۰۳' },
  { id: 'TXN8A1D', user: 'test@example.com', package: 'بسته برنزی', amount: 50000, status: 'ناموفق', date: '۱۴۰۳/۰۵/۰۳' },
  { id: 'TXN9B2E', user: 'new@example.com', package: 'بسته طلایی', amount: 200000, status: 'در انتظار', date: '۱۴۰۳/۰۵/۰۲' },
  { id: 'TXN6F4A', user: 'user@example.com', package: 'بسته برنزی', amount: 50000, status: 'موفق', date: '۱۴۰۳/۰۴/۱۵' },
  { id: 'TXN5E5C', user: 'blocked@example.com', package: 'بسته برنزی', amount: 50000, status: 'موفق', date: '۱۴۰۳/۰۴/۱۱' },
];

const FinancialReports: React.FC = () => {
  const [transactions] = useState(mockTransactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'موفق': return 'bg-green-100 text-green-700';
      case 'ناموفق': return 'bg-red-100 text-red-700';
      case 'در انتظار': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };
  
  const filteredTransactions = transactions.filter(tx => {
      const matchesSearch = tx.user.toLowerCase().includes(searchTerm.toLowerCase()) || tx.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
      return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">گزارشات مالی</h2>
      <Card>
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <Input 
            placeholder="جستجو بر اساس ایمیل یا شناسه تراکنش..." 
            className="w-full md:max-w-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="w-full md:w-auto bg-white dark:bg-navy-gray border border-gray-300 dark:border-navy-gray-light rounded-lg py-2.5 px-3"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="موفق">موفق</option>
            <option value="ناموفق">ناموفق</option>
            <option value="در انتظار">در انتظار</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-100 dark:bg-navy-gray">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">شناسه تراکنش</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">کاربر</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">بسته</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">مبلغ</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">وضعیت</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">تاریخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-navy-gray-light text-gray-800 dark:text-gray-200">
              {filteredTransactions.map(tx => (
                <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-navy-gray-light/50">
                  <td className="px-4 py-4 whitespace-nowrap font-mono text-sm">{tx.id}</td>
                  <td className="px-4 py-4 whitespace-nowrap">{tx.user}</td>
                  <td className="px-4 py-4 whitespace-nowrap">{tx.package}</td>
                  <td className="px-4 py-4 whitespace-nowrap">{tx.amount.toLocaleString()} تومان</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(tx.status)}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">{tx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center mt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">صفحه‌بندی در اینجا قرار می‌گیرد.</p>
        </div>
      </Card>
    </div>
  );
};

export default FinancialReports;