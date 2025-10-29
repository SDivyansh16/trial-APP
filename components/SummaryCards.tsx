import React from 'react';
import { FinancialSummary, DrillDownFilter } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface SummaryCardsProps {
    summary: FinancialSummary;
    onDrillDown: (filter: DrillDownFilter) => void;
}

const cardThemes = {
    income: { iconBg: 'bg-green-100', iconText: 'text-green-600', glow: 'hover:shadow-green-500/20' },
    expenses: { iconBg: 'bg-rose-100', iconText: 'text-rose-600', glow: 'hover:shadow-rose-500/20' },
    savings: { iconBg: 'bg-emerald-100', iconText: 'text-emerald-600', glow: 'hover:shadow-emerald-500/20' },
    deficit: { iconBg: 'bg-rose-100', iconText: 'text-rose-600', glow: 'hover:shadow-rose-500/20' },
    debt: { iconBg: 'bg-orange-100', iconText: 'text-orange-600', glow: 'hover:shadow-orange-500/20' },
    receivables: { iconBg: 'bg-sky-100', iconText: 'text-sky-600', glow: 'hover:shadow-sky-500/20' },
    netWorth: { iconBg: 'bg-indigo-100', iconText: 'text-indigo-600', glow: 'hover:shadow-indigo-500/20' },
    netWorthNegative: { iconBg: 'bg-amber-100', iconText: 'text-amber-600', glow: 'hover:shadow-amber-500/20' },
};


const SummaryCard: React.FC<{ title: string; amount: number; theme: typeof cardThemes.income; icon: React.ReactElement, onClick?: () => void }> = ({ title, amount, theme, icon, onClick }) => {
    const isClickable = !!onClick;
    return (
        <div 
          className={`group bg-white/60 backdrop-blur-xl p-6 rounded-2xl shadow-lg flex items-center space-x-4 border border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${theme.glow} ${isClickable ? 'cursor-pointer' : ''}`}
          onClick={onClick}
        >
            <div className={`p-3 rounded-full ${theme.iconBg} ${theme.iconText} transition-transform duration-300 group-hover:scale-110`}>
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


const SummaryCards: React.FC<SummaryCardsProps> = ({ summary, onDrillDown }) => {
    const { totalIncome, totalExpenses, netSavings, totalDebt, totalReceivables, netWorth } = summary;
    const { t } = useLanguage();

    const savingsTheme = netSavings >= 0 ? cardThemes.savings : cardThemes.deficit;
    const savingsTitle = netSavings >= 0 ? t('netSavings') : t('netDeficit');
    const netWorthTheme = netWorth >= 0 ? cardThemes.netWorth : cardThemes.netWorthNegative;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SummaryCard
                title={t('totalIncome')}
                amount={totalIncome}
                theme={cardThemes.income}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>}
                onClick={() => onDrillDown({ type: 'transactionType', value: 'income' })}
            />
            <SummaryCard
                title={t('totalExpenses')}
                amount={totalExpenses}
                theme={cardThemes.expenses}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" /></svg>}
                onClick={() => onDrillDown({ type: 'transactionType', value: 'expense' })}
            />
             <SummaryCard
                title={savingsTitle}
                amount={netSavings}
                theme={savingsTheme}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>}
            />
            <SummaryCard
                title={t('totalDebt')}
                amount={totalDebt}
                theme={cardThemes.debt}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 8h6m-5 4h.01M4 16h16M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
            <SummaryCard
                title={t('receivables')}
                amount={totalReceivables}
                theme={cardThemes.receivables}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
            />
            <SummaryCard
                title={t('netWorth')}
                amount={netWorth}
                theme={netWorthTheme}
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>}
            />
        </div>
    );
};

export default SummaryCards;