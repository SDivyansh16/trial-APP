import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from './LanguageSelector';


interface LoginProps {
  onLogin: (username: string) => void;
  onNewUpload: (username: string) => void;
  onLoadSampleData: (username: string) => void;
}

const Feature: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; }> = ({ icon, title, children }) => (
    <div className="bg-white/60 backdrop-blur-xl border border-white/20 rounded-xl p-6 transition-all duration-300 hover:border-white/50 hover:-translate-y-1 hover:scale-105 hover:shadow-2xl hover:shadow-primary/10">
        <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                {icon}
            </div>
            <div>
                <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
                <p className="mt-1 text-text-secondary text-sm">{children}</p>
            </div>
        </div>
    </div>
);


const Login: React.FC<LoginProps> = ({ onLogin, onNewUpload, onLoadSampleData }) => {
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
  
  const handleLoadSample = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onLoadSampleData(username.trim());
    }
  };

  const isUsernameValid = username.trim().length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="container mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left Column: Feature Showcase */}
        <div className="space-y-8">
            <div className="flex items-center space-x-4">
                 <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-10H9v2h2v2h2v-2h2V9h-2V7h-2v2z"/>
                    </svg>
                 </div>
                <h1 className="text-4xl font-bold text-text-primary">{t('appTitle')}</h1>
            </div>
            <p className="text-lg text-text-secondary">
                {t('appSubtitle')}
            </p>
            <div className="grid grid-cols-1 gap-6">
                <Feature title={t('feature1Title')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}>
                    {t('feature1Desc')}
                </Feature>
                <Feature title={t('feature2Title')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}>
                    {t('feature2Desc')}
                </Feature>
                 <Feature title={t('featureCsvTitle')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}>
                    <ul className="list-disc list-inside text-sm space-y-1 text-text-secondary">
                        <li><strong>{t('csvRule1Title')}:</strong> {t('csvRule1Desc')}</li>
                        <li><strong>{t('csvRule2Title')}:</strong> {t('csvRule2Desc')}</li>
                        <li><strong>{t('csvRule3Title')}:</strong> {t('csvRule3Desc')}</li>
                        <li><strong>{t('csvRule4Title')}:</strong> {t('csvRule4Desc')}</li>
                        <li><strong>{t('csvRule5Title')}:</strong> {t('csvRule5Desc')}</li>
                    </ul>
                </Feature>
            </div>
        </div>
        
        {/* Right Column: Login Form */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-6 text-center">
                 <h2 className="text-2xl font-bold text-text-primary">{t('getStarted')}</h2>
                 <LanguageSelector />
            </div>
            
            <p className="text-text-secondary mt-2 mb-4 text-center">
                {t('loginPrompt')}
            </p>
            <form className="space-y-4">
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
                        className="appearance-none rounded-lg relative block w-full px-4 py-3 bg-white/70 border border-border-color placeholder-gray-500 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                        placeholder={t('usernamePlaceholder')}
                    />
                </div>
                <div className="flex flex-col space-y-4">
                     <button
                        onClick={handleLogin}
                        disabled={!isUsernameValid || !dataExists}
                        className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                    >
                        {t('loadData')}
                    </button>
                    
                    <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-border-color"></div>
                        <span className="flex-shrink mx-4 text-text-secondary text-xs">{t('or')}</span>
                        <div className="flex-grow border-t border-border-color"></div>
                    </div>

                     <button
                        onClick={handleNewUpload}
                        disabled={!isUsernameValid}
                        className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-secondary hover:bg-secondary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-secondary disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                    >
                        {t('uploadNewCSV')}
                    </button>
                    <button
                        onClick={handleLoadSample}
                        disabled={!isUsernameValid}
                        className="w-full flex justify-center py-3 px-4 border border-primary/50 text-sm font-medium rounded-lg text-primary bg-white hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary disabled:border-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                    >
                        {t('tryWithSampleData')}
                    </button>
                </div>
            </form>
             <p className="text-text-secondary mt-6 text-center text-sm">
                {t('sampleDataPrompt')}
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;