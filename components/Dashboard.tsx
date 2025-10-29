import React, { useMemo, useState } from 'react';
import { Transaction, FinancialSummary, Goal, Bill, Debt, Budget, Asset, Liability, Reminder, DrillDownFilter } from '../types';
import SummaryCards from './SummaryCards';
import ExpenseChart from './ExpenseChart';
import MonthlyTrendChart from './MonthlyTrendChart';
import TransactionTable from './TransactionTable';
import FinancialInsights from './FinancialInsights';
import GoalTracker from './GoalTracker';
import UpcomingBills from './UpcomingBills';
import DebtTracker from './DebtTracker';
import BudgetTracker from './BudgetTracker';
import NetWorthTracker from './NetWorthTracker';
import FinancialCalendar from './FinancialCalendar';
import AddTransactionModal from './AddTransactionModal';
import Alerts from './Alerts';
import SpendingTrends from './SpendingTrends';
import CreditScoreMonitor from './CreditScoreMonitor';
import DashboardFilters from './DashboardFilters';
import { useLanguage } from '../contexts/LanguageContext';


interface DashboardProps {
  transactions: Transaction[];
  allTransactions: Transaction[];
  categories: string[];
  goals: Goal[];
  bills: Bill[];
  debts: Debt[];
  budgets: Budget[];
  assets: Asset[];
  liabilities: Liability[];
  reminders: Reminder[];
  creditScore: number | null;
  availableMonths: string[];
  selectedMonth: string;
  selectedCategories: string[];
  selectedType: 'all' | 'income' | 'expense';
  onMonthChange: (month: string) => void;
  onCategoryChange: (categories: string[]) => void;
  onTypeChange: (type: 'all' | 'income' | 'expense') => void;
  onAddTransaction: (transactionData: Omit<Transaction, 'id'>) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (transactionId: string) => void;
  onAddGoal: (goalData: Omit<Goal, 'id' | 'savedAmount'>) => void;
  onUpdateGoal: (updatedGoal: Goal) => void;
  onDeleteGoal: (goalId: string) => void;
  onAddContribution: (goalId: string, amount: number) => void;
  onAddBill: (billData: Omit<Bill, 'id' | 'isPaid'>) => void;
  onUpdateBill: (updatedBill: Bill) => void;
  onDeleteBill: (billId: string) => void;
  onAddDebt: (debtData: Omit<Debt, 'id' | 'isSettled'>) => void;
  onUpdateDebt: (updatedDebt: Debt) => void;
  onDeleteDebt: (debtId: string) => void;
  onAddBudget: (budget: Budget) => void;
  onUpdateBudget: (budget: Budget) => void;
  onDeleteBudget: (category: string) => void;
  onAddAsset: (assetData: Omit<Asset, 'id'>) => void;
  onUpdateAsset: (updatedAsset: Asset) => void;
  onDeleteAsset: (assetId: string) => void;
  onAddLiability: (liabilityData: Omit<Liability, 'id'>) => void;
  onUpdateLiability: (updatedLiability: Liability) => void;
  onDeleteLiability: (liabilityId: string) => void;
  onAddReminder: (reminderData: Omit<Reminder, 'id'>) => void;
  onUpdateReminder: (updatedReminder: Reminder) => void;
  onDeleteReminder: (reminderId: string) => void;
  onUpdateCreditScore: (score: number) => void;
}

const Dashboard: React.FC<DashboardProps> = (props) => {
  const { 
    transactions, allTransactions, categories, goals, bills, debts, budgets, assets, liabilities, reminders, creditScore,
    availableMonths, selectedMonth, selectedCategories, selectedType, onMonthChange, onCategoryChange, onTypeChange,
    onAddTransaction, onUpdateTransaction, onDeleteTransaction,
    onAddGoal, onUpdateGoal, onDeleteGoal, onAddContribution, onAddBill, onUpdateBill, onDeleteBill,
    onAddDebt, onUpdateDebt, onDeleteDebt, onAddBudget, onUpdateBudget, onDeleteBudget,
    onAddAsset, onUpdateAsset, onDeleteAsset, onAddLiability, onUpdateLiability, onDeleteLiability,
    onAddReminder, onUpdateReminder, onDeleteReminder, onUpdateCreditScore
  } = props;
  
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [drillDownFilter, setDrillDownFilter] = useState<DrillDownFilter | null>(null);
  const { t } = useLanguage();

  const summary: FinancialSummary = useMemo(() => {
    const summaryData: FinancialSummary = {
      totalIncome: 0,
      totalExpenses: 0,
      netSavings: 0,
      totalDebt: 0,
      totalReceivables: 0,
      netWorth: 0,
      expensesByCategory: [],
      monthlyData: [],
    };

    const expensesByCategoryMap = new Map<string, number>();
    const monthlyDataMap = new Map<string, { income: number; expenses: number }>();

    transactions.forEach(t => {
      if (t.type === 'income') summaryData.totalIncome += t.amount;
      else {
        summaryData.totalExpenses += t.amount;
        const currentCategoryAmount = expensesByCategoryMap.get(t.category) || 0;
        expensesByCategoryMap.set(t.category, currentCategoryAmount + t.amount);
      }
      
      const monthKey = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, '0')}`;
      const currentMonthData = monthlyDataMap.get(monthKey) || { income: 0, expenses: 0 };
      if (t.type === 'income') currentMonthData.income += t.amount;
      else currentMonthData.expenses += t.amount;
      monthlyDataMap.set(monthKey, currentMonthData);
    });

    debts.forEach(debt => {
      if (!debt.isSettled) {
        if (debt.type === 'owed') summaryData.totalDebt += debt.amount;
        else if (debt.type === 'iou') summaryData.totalReceivables += debt.amount;
      }
    });

    const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
    const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.value, 0);
    summaryData.netWorth = totalAssets - totalLiabilities;

    summaryData.netSavings = summaryData.totalIncome - summaryData.totalExpenses;
    summaryData.expensesByCategory = Array.from(expensesByCategoryMap.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    summaryData.monthlyData = Array.from(monthlyDataMap.entries()).map(([month, data]) => ({ month, ...data })).sort((a,b) => a.month.localeCompare(b.month));

    return summaryData;
  }, [transactions, debts, assets, liabilities]);
  
  const transactionsForTable = useMemo(() => {
    if (!drillDownFilter) {
      return transactions;
    }
    return transactions.filter(t => {
      if (drillDownFilter.type === 'category') {
        return t.category === drillDownFilter.value;
      }
      if (drillDownFilter.type === 'transactionType') {
        return t.type === drillDownFilter.value;
      }
      return true;
    });
  }, [transactions, drillDownFilter]);

  const baseCardClasses = "bg-white/60 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/20";

  return (
    <div className="space-y-8">
      {isAddTransactionModalOpen && (
        <AddTransactionModal 
            categories={categories}
            onClose={() => setIsAddTransactionModalOpen(false)}
            onSave={(data) => {
                onAddTransaction(data);
                setIsAddTransactionModalOpen(false);
            }}
        />
      )}
      
      <Alerts bills={bills} reminders={reminders} />
      
      <DashboardFilters 
        availableMonths={availableMonths} 
        selectedMonth={selectedMonth} 
        onMonthChange={onMonthChange}
        allCategories={categories}
        selectedCategories={selectedCategories}
        onCategoryChange={onCategoryChange}
        selectedType={selectedType}
        onTypeChange={onTypeChange}
      />

      <SummaryCards summary={summary} onDrillDown={setDrillDownFilter} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={`${baseCardClasses} lg:col-span-2`}>
          <h3 className="text-xl font-semibold mb-4 text-text-primary">{t('monthlyTrends')}</h3>
          <MonthlyTrendChart data={summary.monthlyData} />
        </div>
        <div className={`${baseCardClasses}`}>
          <h3 className="text-xl font-semibold mb-4 text-text-primary">{t('expenseBreakdown')}</h3>
          <ExpenseChart data={summary.expensesByCategory} onDrillDown={setDrillDownFilter} />
        </div>
      </div>
      
      <div className={`${baseCardClasses}`}>
        <SpendingTrends transactions={transactions} allTransactions={allTransactions} selectedMonth={selectedMonth} />
      </div>

       <div className={`${baseCardClasses}`}>
        <BudgetTracker transactions={transactions} categories={categories} budgets={budgets} onAddBudget={onAddBudget} onUpdateBudget={onUpdateBudget} onDeleteBudget={onDeleteBudget} selectedMonth={selectedMonth} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={`${baseCardClasses} flex flex-col`}>
            <NetWorthTracker assets={assets} liabilities={liabilities} onAddAsset={onAddAsset} onUpdateAsset={onUpdateAsset} onDeleteAsset={onDeleteAsset} onAddLiability={onAddLiability} onUpdateLiability={onUpdateLiability} onDeleteLiability={onDeleteLiability} />
        </div>
         <div className={`${baseCardClasses} flex flex-col`}>
            <CreditScoreMonitor creditScore={creditScore} summary={summary} onUpdateCreditScore={onUpdateCreditScore} />
        </div>
        <div className={`${baseCardClasses} flex flex-col`}>
            <FinancialCalendar bills={bills} debts={debts} reminders={reminders} onAddReminder={onAddReminder} onUpdateReminder={onUpdateReminder} onDeleteReminder={onDeleteReminder} />
        </div>
      </div>

      <FinancialInsights summary={summary} transactions={allTransactions} categories={categories} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={`${baseCardClasses} flex flex-col`}>
          <h3 className="text-xl font-semibold mb-4 text-text-primary">{t('financialGoals')}</h3>
          <GoalTracker goals={goals} onAddGoal={onAddGoal} onUpdateGoal={onUpdateGoal} onDeleteGoal={onDeleteGoal} onAddContribution={onAddContribution} />
        </div>
        <div className={`${baseCardClasses} flex flex-col`}>
          <h3 className="text-xl font-semibold mb-4 text-text-primary">{t('debtsAndIOUs')}</h3>
          <DebtTracker debts={debts} onAddDebt={onAddDebt} onUpdateDebt={onUpdateDebt} onDeleteDebt={onDeleteDebt} />
        </div>
        <div className={`${baseCardClasses} flex flex-col`}>
          <h3 className="text-xl font-semibold mb-4 text-text-primary">{t('upcomingBills')}</h3>
          <UpcomingBills bills={bills} onAddBill={onAddBill} onUpdateBill={onUpdateBill} onDeleteBill={onDeleteBill} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={`${baseCardClasses} lg:col-span-3`}>
           <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-text-primary">{t('allTransactions')}</h3>
              <button 
                  onClick={() => setIsAddTransactionModalOpen(true)}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-focus transition-colors font-semibold text-sm"
              >
                  {t('addTransaction')}
              </button>
          </div>
          <TransactionTable 
            transactions={transactionsForTable} 
            categories={categories} 
            drillDownFilter={drillDownFilter}
            onClearDrillDown={() => setDrillDownFilter(null)}
            onUpdateTransaction={onUpdateTransaction} 
            onDeleteTransaction={onDeleteTransaction} 
          />
        </div>
      </div>

    </div>
  );
};

export default Dashboard;