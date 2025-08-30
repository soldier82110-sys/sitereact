import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
const { useNavigate } = ReactRouterDOM;
import { Card, Button, Input } from '../../components/common';
import { useUser, useAppSettings, useToast } from '../../contexts';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface SpiritualGiftStatus {
    date: string;
    dailyCount: number;
}

const TokenStorePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, addToken } = useUser();
  const { settings } = useAppSettings();
  const { showToast } = useToast();
  const { spiritualGift } = settings;
  const [salawatTimer, setSalawatTimer] = useState(0);
  const [discountCode, setDiscountCode] = useState('');
  const [discountError, setDiscountError] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [balanceUpdateKey, setBalanceUpdateKey] = useState(0);
  const [giftStatus, setGiftStatus] = useLocalStorage<SpiritualGiftStatus>('spiritualGiftStatus', { date: '', dailyCount: 0 });

  const initialPrices = {
    bronze: 50000,
    silver: 100000,
    gold: 200000,
  };
  const [prices, setPrices] = useState(initialPrices);

  useEffect(() => {
    // On component mount, check if it's a new day. If so, reset the daily count.
    const today = new Date().toLocaleDateString('fa-IR');
    if (giftStatus.date !== today) {
        setGiftStatus({ date: today, dailyCount: 0 });
    }
  }, []); // Run only once on mount

  useEffect(() => {
    let timer: number;
    if (salawatTimer > 0) {
      timer = window.setInterval(() => {
        setSalawatTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [salawatTimer]);

  const handleSalawatClick = () => {
    if (giftStatus.dailyCount >= spiritualGift.maxDailyTokens) {
        showToast(`شما به حد مجاز ${spiritualGift.maxDailyTokens} توکن هدیه در روز رسیده‌اید.`, 'error');
        return;
    }

    addToken(spiritualGift.tokensPerClick);
    setSalawatTimer(spiritualGift.cooldownSeconds);
    showToast(`${spiritualGift.tokensPerClick} توکن هدیه با موفقیت به حساب شما اضافه شد!`);
    setBalanceUpdateKey(prev => prev + 1);

    const newStatus = { ...giftStatus, dailyCount: giftStatus.dailyCount + spiritualGift.tokensPerClick };
    setGiftStatus(newStatus);
  };

  const handleApplyDiscount = () => {
    setDiscountError('');
    if(discountCode.toUpperCase() === 'BAHAR') {
        setDiscountApplied(true);
        setPrices({
            bronze: initialPrices.bronze * 0.8,
            silver: initialPrices.silver * 0.8,
            gold: initialPrices.gold * 0.8,
        });
        showToast('کد تخفیف ۲۰٪ با موفقیت اعمال شد!');
    } else {
        setDiscountError('کد تخفیف نامعتبر یا منقضی شده است.');
    }
  };
  
  const tokensLeftToday = spiritualGift.maxDailyTokens - giftStatus.dailyCount;

  return (
    <>
      <div className="min-h-screen bg-off-white dark:bg-navy-gray-dark p-8">
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">فروشگاه توکن</h1>
            <div className="flex items-center gap-4">
                <div className="text-lg text-gray-800 dark:text-gray-200">
                    موجودی شما: 
                    <span 
                        key={balanceUpdateKey}
                        className="font-bold text-turquoise dark:text-turquoise-light inline-block animate-pulse-green"
                    >
                        {' '}{user.tokenBalance.toLocaleString()}
                    </span> توکن
                </div>
                <Button variant="secondary" onClick={() => navigate('/chat')}>بازگشت به چت</Button>
            </div>
        </header>

        <div className="max-w-5xl mx-auto">
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
                هر پیام ارسالی به هوش مصنوعی، معادل یک توکن است. با خرید بسته‌های بزرگ‌تر، هزینه هر گفتگو را کاهش دهید.
            </p>
            <section className="mb-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="text-center border-2 border-transparent hover:border-turquoise transition-all">
                        <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">بسته برنزی</h3>
                        <p className="text-4xl font-bold my-4 text-turquoise dark:text-turquoise-light">۵,۰۰۰</p>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">توکن</p>
                        <Button className="w-full">
                            {discountApplied ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="line-through text-gray-300/80 text-sm">{initialPrices.bronze.toLocaleString()}</span>
                                    <span>{prices.bronze.toLocaleString()} تومان</span>
                                </span>
                            ) : `${prices.bronze.toLocaleString()} تومان`}
                        </Button>
                    </Card>
                    <Card className="text-center relative border-2 border-turquoise shadow-turquoise/20 dark:shadow-turquoise/10">
                        <span className="absolute -top-3 right-1/2 translate-x-1/2 bg-turquoise text-white px-4 py-1 rounded-full text-sm font-semibold">محبوب‌ترین انتخاب</span>
                        <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">بسته نقره‌ای</h3>
                        <p className="text-4xl font-bold my-4 text-turquoise dark:text-turquoise-light">۱۲,۰۰۰</p>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">توکن <span className="font-semibold text-green-600 dark:text-green-400">(۲۰٪ توکن بیشتر!)</span></p>
                        <Button className="w-full">
                             {discountApplied ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="line-through text-gray-300/80 text-sm">{initialPrices.silver.toLocaleString()}</span>
                                    <span>{prices.silver.toLocaleString()} تومان</span>
                                </span>
                            ) : `${prices.silver.toLocaleString()} تومان`}
                        </Button>
                    </Card>
                    <Card className="text-center border-2 border-transparent hover:border-turquoise transition-all">
                        <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">بسته طلایی</h3>
                        <p className="text-4xl font-bold my-4 text-turquoise dark:text-turquoise-light">۳۰,۰۰۰</p>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">توکن <span className="font-semibold text-green-600 dark:text-green-400">(بهترین ارزش)</span></p>
                        <Button className="w-full">
                            {discountApplied ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="line-through text-gray-300/80 text-sm">{initialPrices.gold.toLocaleString()}</span>
                                    <span>{prices.gold.toLocaleString()} تومان</span>
                                </span>
                            ) : `${prices.gold.toLocaleString()} تومان`}
                        </Button>
                    </Card>
                </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <Card>
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">کد تخفیف</h3>
                    <div className="flex gap-2">
                        <Input 
                            placeholder="کد تخفیف (تست: BAHAR)" 
                            className="text-center" 
                            value={discountCode}
                            onChange={(e) => setDiscountCode(e.target.value)}
                        />
                        <Button onClick={handleApplyDiscount} disabled={discountApplied}>اعمال</Button>
                    </div>
                    {discountError && <p className="text-brick text-sm mt-2 text-center">{discountError}</p>}
                </Card>
                <Card>
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">کارت هدیه</h3>
                    <div className="flex gap-2">
                        <Input placeholder="کد کارت هدیه را وارد کنید" className="text-center" />
                        <Button>اعمال</Button>
                    </div>
                </Card>
            </section>

            {spiritualGift.enabled && (
                <section>
                    <Card className="text-center bg-gradient-to-br from-turquoise/5 to-transparent dark:from-turquoise/10 dark:to-transparent border border-turquoise/20">
                        <h2 className="text-2xl font-bold text-turquoise dark:text-turquoise-light mb-4">هدیه معنوی (توکن صلواتی)</h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
                            به پاس همراهی شما و برای ترویج فرهنگ معنوی، می‌توانید با فرستادن یک صلوات برای سلامتی و فرج امام زمان (عج)، هر {spiritualGift.cooldownSeconds} ثانیه {spiritualGift.tokensPerClick} توکن هدیه بگیرید.
                            شما امروز می‌توانید <span className="font-bold text-turquoise">{tokensLeftToday > 0 ? tokensLeftToday : 0}</span> توکن دیگر دریافت کنید.
                        </p>
                        <Button 
                            onClick={handleSalawatClick} 
                            disabled={salawatTimer > 0 || tokensLeftToday <= 0}
                            className="min-w-[250px]"
                        >
                            {salawatTimer > 0 ? `لطفا ${salawatTimer} ثانیه صبر کنید` : "صلوات فرستادم و هدیه را دریافت می‌کنم"}
                        </Button>
                    </Card>
                </section>
            )}

            <footer className="mt-12 text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-4">درگاه‌های پرداخت امن</p>
                <div className="flex justify-center items-center gap-6">
                    {settings.paymentGatewayLogo1 && (
                        <div dangerouslySetInnerHTML={{ __html: settings.paymentGatewayLogo1 }} />
                    )}
                    {settings.paymentGatewayLogo2 && (
                        <div dangerouslySetInnerHTML={{ __html: settings.paymentGatewayLogo2 }} />
                    )}
                </div>
            </footer>
        </div>
      </div>
    </>
  );
};

export default TokenStorePage;