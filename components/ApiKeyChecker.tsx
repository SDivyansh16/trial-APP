import React from 'react';
import { isGeminiAvailable } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';

const ApiKeyChecker: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { t } = useLanguage();
    
    if (!isGeminiAvailable()) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-sky-100 to-rose-100">
                <div className="max-w-lg p-8 text-center bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                        <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mt-5">{t('configErrorTitle')}</h1>
                    {/* FIX: Updated error message to refer to environment variables. */}
                    <p className="mt-3 text-gray-700">
                        {t('configErrorBody1')}{' '}
                        <code className="bg-gray-200 text-sm font-mono p-1 rounded">API_KEY</code>{' '}
                        {t('configErrorBody2')}
                    </p>
                    <p className="mt-4 text-sm text-gray-500">
                       {t('configErrorSecurity')}
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default ApiKeyChecker;