import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface DashboardFiltersProps {
  availableMonths: string[];
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  allCategories: string[];
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  selectedType: 'all' | 'income' | 'expense';
  onTypeChange: (type: 'all' | 'income' | 'expense') => void;
}

const formatMonth = (monthStr: string, locale: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString(locale, { month: 'long', year: 'numeric' });
};

const DashboardFilters: React.FC<DashboardFiltersProps> = (props) => {
  const { 
    availableMonths, selectedMonth, onMonthChange,
    allCategories, selectedCategories, onCategoryChange,
    selectedType, onTypeChange
  } = props;
  const { t, language } = useLanguage();

  const handleCategorySelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // FIX: Add explicit type to `option` to resolve TypeScript error.
    const values = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value);
    onCategoryChange(values);
  };
  
  const expenseCategories = allCategories.filter(c => c !== 'Income');

  return (
    <div className="bg-white/60 backdrop-blur-xl p-4 rounded-2xl shadow-lg mb-8 border border-white/20">
      <h3 className="text-lg font-semibold text-text-primary mb-4">{t('filtersAndSettings')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Month Filter */}
        <div>
          <label htmlFor="month-select" className="block text-sm font-medium text-text-secondary mb-1">{t('viewDataFor')}</label>
          <div className="relative">
            <select
              id="month-select"
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              className="bg-white/70 border border-border-color text-text-primary text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 shadow-sm appearance-none pr-10 hover:border-primary/50 transition-colors"
            >
              <option className="bg-white text-text-primary" value="all">{t('allMonths')}</option>
              {availableMonths.map(month => (
                  <option key={month} value={month} className="bg-white text-text-primary">{formatMonth(month, language)}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-secondary">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>
        
        {/* Category Filter */}
        <div>
          <label htmlFor="category-select" className="block text-sm font-medium text-text-secondary mb-1">{t('category')}</label>
          <select
            id="category-select"
            multiple
            value={selectedCategories}
            onChange={handleCategorySelection}
            className="bg-white/70 border border-border-color text-text-primary text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 shadow-sm h-24"
          >
            {expenseCategories.map(cat => (
              <option key={cat} value={cat} className="p-2 checked:bg-primary/20">{cat}</option>
            ))}
          </select>
        </div>
        
        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">{t('transactionType')}</label>
          <div className="flex space-x-2 bg-white/50 p-1 rounded-lg">
            {(['all', 'income', 'expense'] as const).map(type => (
              <button 
                key={type}
                onClick={() => onTypeChange(type)}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${selectedType === type ? 'bg-primary text-white shadow-lg' : 'bg-transparent text-text-secondary hover:bg-gray-200'}`}
              >
                {t(type === 'all' ? 'allTypes' : type)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardFilters;