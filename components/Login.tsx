import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from './LanguageSelector';


interface LoginProps {
  onLogin: (username: string) => void;
  onNewUpload: (username: string) => void;
}

const Feature: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; }> = ({ icon, title, children }) => (
    <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            {icon}
        </div>
        <div>
            <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
            <p className="mt-1 text-text-secondary">{children}</p>
        </div>
    </div>
);


const Login: React.FC<LoginProps> = ({ onLogin, onNewUpload }) => {
  const [username, setUsername] = useState('');
  const [dataExists, setDataExists] = useState(false);
  const { t } = useLanguage();


  useEffect(() => {
    if (username.trim()) {
      const storedData = localStorage.getItem(`financial_dashboard_${username.trim()}`);
      setDataExists(!!storedData);
    } else {
      setDataExists(false);
    }
  }, [username]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim());
    }
  };

  const handleNewUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onNewUpload(username.trim());
    }
  };

  const isUsernameValid = username.trim().length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="container mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left Column: Feature Showcase */}
        <div className="space-y-8">
            <div className="flex items-center space-x-4">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-10H9v2h2v2h2v-2h2V9h-2V7h-2v2z"/>
                </svg>
                <h1 className="text-4xl font-bold text-text-primary">{t('appTitle')}</h1>
            </div>
            <p className="text-lg text-text-secondary">
                {t('appSubtitle')}
            </p>
            <div className="space-y-6">
                <Feature title={t('feature1Title')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}>
                    {t('feature1Desc')}
                </Feature>
                <Feature title={t('feature2Title')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}>
                    {t('feature2Desc')}
                </Feature>
                <Feature title={t('feature3Title')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>}>
                    {t('feature3Desc')}
                </Feature>
                 <Feature title={t('feature4Title')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>}>
                    {t('feature4Desc')}
                </Feature>
            </div>
        </div>
        
        {/* Right Column: Login Form */}
        <div className="bg-surface p-8 rounded-xl shadow-lg border border-border-color">
            <div className="flex justify-between items-center mb-6 text-center">
                 <h2 className="text-2xl font-bold text-text-primary">{t('getStarted')}</h2>
                 <LanguageSelector />
            </div>
            
            <p className="text-text-secondary mt-2 mb-8 text-center">
                {t('loginPrompt')}
            </p>
            <form className="space-y-6">
                <div>
                    <label htmlFor="username" className="sr-only">{t('usernamePlaceholder')}</label>
                    <input
                        id="username"
                        name="username"
                        type="text"
                        autoComplete="username"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="appearance-none rounded-lg relative block w-full px-4 py-3 bg-background border border-border-color placeholder-gray-500 text-text-primary focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                        placeholder={t('usernamePlaceholder')}
                    />
                </div>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                     <button
                        onClick={handleLogin}
                        disabled={!isUsernameValid || !dataExists}
                        className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                        {t('loadData')}
                    </button>
                     <button
                        onClick={handleNewUpload}
                        disabled={!isUsernameValid}
                        className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-secondary hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-secondary disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                        {t('uploadNewCSV')}
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
