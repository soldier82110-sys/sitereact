import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
const { useNavigate } = ReactRouterDOM;
import { Card, Button, Input, Modal } from '../../components/common';
import { LogoIcon, UserIcon, EmailIcon, PasswordIcon, GoogleIcon, SpinnerIcon } from '../../components/icons';
import { useAppSettings, useUser, useToast } from '../../contexts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { loginUser, registerUser } from '../../services/apiService';

const AuthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const { settings } = useAppSettings();
  const { updateUser } = useUser();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAuthSuccess = (data: { user: any, token: string }) => {
    localStorage.setItem('authToken', data.token);
    updateUser(data.user);
    queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    showToast(`${data.user.name} عزیز، خوش آمدید!`);

    if (data.user.email.toLowerCase() === 'admin@example.com') { // This logic would likely be a role from the backend
      navigate('/admin');
    } else {
      navigate('/select-marja');
    }
  };

  const loginMutation = useMutation({
    mutationFn: () => loginUser({ email, password }),
    onSuccess: handleAuthSuccess,
    onError: (error: Error) => showToast(`خطا در ورود: ${error.message}`, 'error'),
  });

  const registerMutation = useMutation({
    mutationFn: () => registerUser({ name, email, password }),
    onSuccess: handleAuthSuccess,
    onError: (error: Error) => showToast(`خطا در ثبت‌نام: ${error.message}`, 'error'),
  });

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  const validateEmail = (email: string) => {
    if (!email) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'فرمت ایمیل نامعتبر است.';
    return '';
  };

  useEffect(() => {
    if (activeTab === 'register') setEmailError(validateEmail(email));
    else setEmailError('');
  }, [email, activeTab]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'register' && emailError) return;

    if (activeTab === 'login') {
      loginMutation.mutate();
    } else {
      registerMutation.mutate();
    }
  };

  const handleTabChange = (tabName: 'login' | 'register') => {
    setActiveTab(tabName);
    setName(''); setEmail(''); setPassword(''); setEmailError('');
  };
  
  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to call API for password recovery
    showToast('اگر ایمیل شما در سیستم موجود باشد، لینک بازیابی ارسال خواهد شد.');
    setIsModalOpen(false);
  };

  const TabButton: React.FC<{ tabName: 'login' | 'register'; label: string; }> = ({ tabName, label }) => (
    <button
      onClick={() => handleTabChange(tabName)}
      className={`w-1/2 pb-3 font-semibold transition-colors duration-300 border-b-2 ${
        activeTab === tabName
          ? 'text-turquoise dark:text-turquoise-light border-turquoise dark:border-turquoise-light'
          : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-turquoise'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-off-white to-turquoise/10 dark:from-navy-gray-dark dark:to-turquoise/10">
      <Card className="w-full max-w-md mx-4">
        <div className="text-center">
          {settings.loginPage.logoUrl ? (
            <img src={settings.loginPage.logoUrl} alt="لوگو" className="w-16 h-16 mx-auto mb-4 object-contain" />
          ) : settings.logoUrl ? (
            <img src={settings.logoUrl} alt="لوگو" className="w-16 h-16 mx-auto mb-4 object-contain" />
          ) : (
            <LogoIcon className="w-16 h-16 mx-auto text-turquoise dark:text-turquoise-light mb-4" />
          )}
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100" dangerouslySetInnerHTML={{ __html: settings.loginPage.title }}></h1>
           <p className="text-gray-600 dark:text-gray-400 mb-8 px-4" dangerouslySetInnerHTML={{ __html: settings.loginPage.subtitle }} />
        </div>

        <div className="flex mb-6 border-b border-gray-200 dark:border-navy-gray-light">
          <TabButton tabName="login" label="ورود" />
          <TabButton tabName="register" label="عضویت" />
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {activeTab === 'login' ? (
            <>
              <div>
                <Input type="email" placeholder="ایمیل" required icon={<EmailIcon className="w-5 h-5" />} value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Input type="password" placeholder="رمز عبور" required icon={<PasswordIcon className="w-5 h-5" />} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="text-left">
                <a href="#" onClick={(e) => { e.preventDefault(); setIsModalOpen(true); }} className="text-sm text-turquoise hover:underline">
                  رمز عبور خود را فراموش کرده‌اید؟
                </a>
              </div>
            </>
          ) : (
            <>
              <div>
                <Input type="text" placeholder="نام کامل" required icon={<UserIcon className="w-5 h-5" />} value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Input type="email" placeholder="ایمیل" required icon={<EmailIcon className="w-5 h-5" />} value={email} onChange={(e) => setEmail(e.target.value)} className={emailError ? 'border-brick focus:ring-brick' : ''} />
                {emailError && <p className="text-brick text-sm mt-1">{emailError}</p>}
              </div>
              <div>
                <Input type="password" placeholder="رمز عبور" required icon={<PasswordIcon className="w-5 h-5" />} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </>
          )}

          <Button type="submit" className="w-full !mt-6" disabled={isLoading}>
            {isLoading ? <SpinnerIcon className="w-6 h-6 mx-auto" /> : (activeTab === 'login' ? 'ورود به حساب' : 'ایجاد حساب کاربری')}
          </Button>

          <div className="flex items-center my-4">
              <hr className="flex-grow border-gray-300 dark:border-navy-gray-light" />
              <span className="mx-4 text-sm text-gray-500 dark:text-gray-500">یا</span>
              <hr className="flex-grow border-gray-300 dark:border-navy-gray-light" />
          </div>

          <Button type="button" variant="secondary" className="w-full flex items-center justify-center gap-2">
              <GoogleIcon className="w-6 h-6" />
              <span>ورود با حساب گوگل</span>
          </Button>
        </form>
      </Card>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="بازیابی رمز عبور">
          <form className="space-y-4" onSubmit={handleForgotPassword}>
              <p className="text-gray-600 dark:text-gray-400">
                  ایمیل حساب کاربری خود را وارد کنید تا لینک بازیابی برایتان ارسال شود.
              </p>
              <Input type="email" placeholder="ایمیل" required icon={<EmailIcon className="w-5 h-5" />} />
              <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>لغو</Button>
                  <Button type="submit">ارسال لینک</Button>
              </div>
          </form>
      </Modal>
    </div>
  );
};

export default AuthPage;