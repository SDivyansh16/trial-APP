import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface MonthSelectorProps {
  availableMonths: string[];
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

const formatMonth = (monthStr: string, locale: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString(locale, { month: 'long', year: 'numeric' });
};

const MonthSelector: React.FC<MonthSelectorProps> = ({ availableMonths, selectedMonth, onMonthChange }) => {
  const { t, language } = useLanguage();
  
  return (
    <div className="bg-surface backdrop-blur-md p-4 rounded-2xl shadow-lg mb-8 flex items-center space-x-4 border border-border-color">
        <label htmlFor="month-select" className="font-semibold text-text-primary whitespace-nowrap">{t('viewDataFor')}</label>
        <select
            id="month-select"
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="bg-background border border-border-color text-text-primary text-sm rounded-lg focus:ring-primary focus:border-primary block w-full max-w-xs p-2.5 shadow-sm"
        >
            <option value="all">{t('allMonths')}</option>
            {availableMonths.map(month => (
                <option key={month} value={month}>{formatMonth(month, language)}</option>
            ))}
        </select>
    </div>
  );
};

export default MonthSelector;
