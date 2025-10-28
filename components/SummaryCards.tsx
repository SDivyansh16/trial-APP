import React from 'react';
import { FinancialSummary } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface SummaryCardsProps {
    summary: FinancialSummary;
}

const SummaryCard: React.FC<{ title: string; amount: number; colorClass: string; icon: React.ReactElement }> = ({ title, amount, colorClass, icon }) => {
    return (
        <div className="bg-surface backdrop-blur-xl p-6 rounded-2xl shadow-lg flex items-center space-x-4 border border-border-color transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-primary">
            <div className={`p-3 rounded-full ${colorClass}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-text-secondary font-medium">{title}</p>
                <p className="text-2xl font-bold text-text-primary">
                    ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
            </div>
        </div>
    );
};


const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
    const { totalIncome, totalExpenses, netSavings, totalDebt, totalReceivables, netWorth } = summary;
    const { t } = useLanguage();

    const savingsColor = netSavings >= 0 ? 'bg-emerald-900/50 text-emerald-300' : 'bg-red-900/50 text-red-300';
    const savingsTitle = netSavings >= 0 ? t('netSavings') : t('netDeficit');

    const netWorthColor = netWorth >= 0 ? 'bg-indigo-900/50 text-indigo-300' : 'bg-pink-900/50 text-pink-300';


    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SummaryCard
                title={t('totalIncome')}
                amount={totalIncome}
                colorClass="bg-green-900/50 text-green-300"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>}
            />
            <SummaryCard
                title={t('totalExpenses')}
                amount={totalExpenses}
                colorClass="bg-red-900/50 text-red-300"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" /></svg>}
            />
             <SummaryCard
                title={savingsTitle}
                amount={netSavings}
                colorClass={savingsColor}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>}
            />
            <SummaryCard
                title={t('totalDebt')}
                amount={totalDebt}
                colorClass="bg-amber-900/50 text-amber-300"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 8h6m-5 4h.01M4 16h16M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
            <SummaryCard
                title={t('receivables')}
                amount={totalReceivables}
                colorClass="bg-sky-900/50 text-sky-300"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
            />
            <SummaryCard
                title={t('netWorth')}
                amount={netWorth}
                colorClass={netWorthColor}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>}
            />
        </div>
    );
};

export default SummaryCards;
