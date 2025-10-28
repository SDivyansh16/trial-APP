import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, StoredData, Goal, Bill, Debt, Budget, Asset, Liability, Reminder } from './types';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import { parseCSV } from './utils/csvParser';
import { categorizeTransactions } from './services/geminiService';
import CategorizationReviewModal from './components/CategorizationReviewModal';
import { useLanguage } from './contexts/LanguageContext';
import LanguageSelector from './components/LanguageSelector';


const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Utilities', 'Entertainment', 'Health', 'Uncategorized'];

const App: React.FC = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [creditScore, setCreditScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [stagedTransactions, setStagedTransactions] = useState<{categorized: Transaction[], toReview: Transaction[]} | null>(null);
  const { t, language, setLanguage } = useLanguage();


  // Auto-save data to localStorage whenever data changes for a logged-in user.
  useEffect(() => {
    if (username) {
      try {
        const dataToStore: StoredData = { transactions, categories, goals, bills, debts, budgets, assets, liabilities, reminders, creditScore };
        localStorage.setItem(`financial_dashboard_${username}`, JSON.stringify(dataToStore));
        localStorage.setItem(`financial_dashboard_lang_${username}`, language);
      } catch (e) {
        console.error("Failed to save data to local storage:", e);
        setError("Could not save your data. Your browser's storage might be full.");
      }
    }
  }, [transactions, categories, goals, bills, debts, budgets, assets, liabilities, reminders, creditScore, username, language]);

  // Calculate available months from transactions for the filter dropdown
  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    transactions.forEach(t => {
      monthSet.add(`${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, '0')}`);
    });
    return Array.from(monthSet).sort().reverse();
  }, [transactions]);

  // Filter transactions based on the selected month
  const filteredTransactions = useMemo(() => {
    if (selectedMonth === 'all') {
      return transactions;
    }
    return transactions.filter(t => {
      const transactionMonth = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, '0')}`;
      return transactionMonth === selectedMonth;
    });
  }, [transactions, selectedMonth]);

  const updateCategoriesFromTransactions = (transactions: Transaction[]) => {
    const newCategories = new Set(categories);
    transactions.forEach(t => {
        if(t.type === 'expense' && !newCategories.has(t.category)) {
            newCategories.add(t.category);
        }
    });
    setCategories(Array.from(newCategories).sort());
  };

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setStagedTransactions(null);
    try {
      let parsedTransactions = await parseCSV(file);

      const uncategorized = parsedTransactions.filter(t => t.category === 'Uncategorized' && t.type === 'expense');
      const preCategorized = parsedTransactions.filter(t => t.category !== 'Uncategorized' || t.type !== 'expense');

      if (uncategorized.length > 0) {
          const transactionsToCategorize = uncategorized.map(t => ({ id: t.id, description: t.description }));
          try {
              const suggestions = await categorizeTransactions(transactionsToCategorize, categories);
              const toReview = uncategorized.map(t => {
                  const suggestion = suggestions[t.id];
                  if (suggestion && categories.includes(suggestion.category)) {
                      return { ...t, category: suggestion.category, confidence: suggestion.confidence };
                  }
                  return t;
              });
              setStagedTransactions({ categorized: preCategorized, toReview: toReview });
              setIsLoading(false);
          } catch (e) {
              console.warn("AI categorization failed, proceeding as 'Uncategorized'.", e);
              setTransactions(parsedTransactions);
              updateCategoriesFromTransactions(parsedTransactions);
              setIsLoading(false);
          }
      } else {
        setTransactions(parsedTransactions);
        updateCategoriesFromTransactions(parsedTransactions);
        setSelectedMonth('all');
        setIsLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during parsing.');
      setTransactions([]);
      setIsLoading(false);
    }
  };

  const handleReviewConfirm = (reviewedTransactions: Transaction[]) => {
    if (!stagedTransactions) return;
    const finalTransactions = [...stagedTransactions.categorized, ...reviewedTransactions];
    setTransactions(finalTransactions);
    updateCategoriesFromTransactions(finalTransactions);
    setSelectedMonth('all');
    setStagedTransactions(null);
  };

  const handleReviewCancel = () => {
    setStagedTransactions(null);
    setError("Categorization was cancelled. Please upload your file again.");
  };
  
  const handleLogin = (user: string) => {
    try {
        const storedDataString = localStorage.getItem(`financial_dashboard_${user}`);
        const storedLang = localStorage.getItem(`financial_dashboard_lang_${user}`);

        if (storedLang) {
          setLanguage(storedLang);
        }

        if (storedDataString) {
            const storedData: StoredData = JSON.parse(storedDataString);
            const parsedTransactions = storedData.transactions.map(t => ({ ...t, date: new Date(t.date) }));
            setTransactions(parsedTransactions);
            setCategories(storedData.categories);
            setGoals(storedData.goals || []);
            setBills(storedData.bills || []);
            setDebts(storedData.debts || []);
            setBudgets(storedData.budgets || []);
            setAssets(storedData.assets || []);
            setLiabilities(storedData.liabilities || []);
            setReminders(storedData.reminders || []);
            setCreditScore(storedData.creditScore || null);
            setUsername(user);
            setError(null);
            setSelectedMonth('all');
        } else {
             setError("No data found for this user. Please upload a file to start.");
        }
    } catch(e) {
        console.error("Failed to load or parse data from local storage:", e);
        setError("Failed to load your data. It might be corrupted.");
        localStorage.removeItem(`financial_dashboard_${user}`);
    }
  };

  const handleNewUploadSession = (user: string) => {
    setUsername(user);
    setTransactions([]);
    setCategories(DEFAULT_CATEGORIES);
    setGoals([]);
    setBills([]);
    setDebts([]);
    setBudgets([]);
    setAssets([]);
    setLiabilities([]);
    setReminders([]);
    setCreditScore(null);
    setError(null);
    setSelectedMonth('all');
    localStorage.removeItem(`financial_dashboard_${user}`);
  };

  const handleSwitchUser = () => {
    setUsername(null);
    setTransactions([]);
    setCategories(DEFAULT_CATEGORIES);
    setGoals([]);
    setBills([]);
    setDebts([]);
    setBudgets([]);
    setAssets([]);
    setLiabilities([]);
    setReminders([]);
    setCreditScore(null);
    setError(null);
  };
  
  // --- Transaction Handlers ---
  const handleAddTransaction = (transactionData: Omit<Transaction, 'id' | 'confidence'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: `txn-${Date.now()}`,
    };
    setTransactions([...transactions, newTransaction]);
    if (newTransaction.type === 'expense' && !categories.includes(newTransaction.category)) {
      setCategories([...categories, newTransaction.category].sort());
    }
  };

  const handleUpdateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(transactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
  };
  
  const handleDeleteTransaction = (transactionId: string) => {
    setTransactions(transactions.filter(t => t.id !== transactionId));
  };

  // --- Goal Handlers ---
  const handleAddGoal = (goalData: Omit<Goal, 'id' | 'savedAmount'>) => {
    const newGoal: Goal = { ...goalData, id: `goal-${Date.now()}`, savedAmount: 0 };
    setGoals([...goals, newGoal]);
  };
  const handleUpdateGoal = (updatedGoal: Goal) => setGoals(goals.map(g => (g.id === updatedGoal.id ? updatedGoal : g)));
  const handleDeleteGoal = (goalId: string) => setGoals(goals.filter(g => g.id !== goalId));
  const handleAddContribution = (goalId: string, amount: number) => {
    const targetGoal = goals.find(g => g.id === goalId);
    if (!targetGoal) return;
    setGoals(goals.map(g => g.id === goalId ? { ...g, savedAmount: g.savedAmount + amount } : g));
    const contributionTransaction: Transaction = {
      id: `txn-${Date.now()}`, date: new Date(), description: `Contribution to: ${targetGoal.name}`,
      category: 'Savings Goal', amount: amount, type: 'expense',
    };
    setTransactions([...transactions, contributionTransaction]);
    if (!categories.includes('Savings Goal')) setCategories([...categories, 'Savings Goal'].sort());
  };

  // --- Bill Handlers ---
  const handleAddBill = (billData: Omit<Bill, 'id' | 'isPaid'>) => {
    const newBill: Bill = { ...billData, id: `bill-${Date.now()}`, isPaid: false };
    setBills([...bills, newBill].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
  };
  const handleUpdateBill = (updatedBill: Bill) => setBills(bills.map(b => (b.id === updatedBill.id ? updatedBill : b)));
  const handleDeleteBill = (billId: string) => setBills(bills.filter(b => b.id !== billId));

  // --- Debt Handlers ---
  const handleAddDebt = (debtData: Omit<Debt, 'id' | 'isSettled'>) => {
    const newDebt: Debt = { ...debtData, id: `debt-${Date.now()}`, isSettled: false };
    setDebts([...debts, newDebt]);
  };
  const handleUpdateDebt = (updatedDebt: Debt) => setDebts(debts.map(d => (d.id === updatedDebt.id ? updatedDebt : d)));
  const handleDeleteDebt = (debtId: string) => setDebts(debts.filter(d => d.id !== debtId));

  // --- Budget Handlers ---
  const handleAddBudget = (budget: Budget) => {
    if (!budgets.some(b => b.category === budget.category)) setBudgets([...budgets, budget].sort((a, b) => a.category.localeCompare(b.category)));
  };
  const handleUpdateBudget = (updatedBudget: Budget) => setBudgets(budgets.map(b => b.category === updatedBudget.category ? updatedBudget : b));
  const handleDeleteBudget = (category: string) => setBudgets(budgets.filter(b => b.category !== category));

  // --- Asset Handlers ---
  const handleAddAsset = (assetData: Omit<Asset, 'id'>) => setAssets([...assets, { ...assetData, id: `asset-${Date.now()}` }]);
  const handleUpdateAsset = (updatedAsset: Asset) => setAssets(assets.map(a => a.id === updatedAsset.id ? updatedAsset : a));
  const handleDeleteAsset = (assetId: string) => setAssets(assets.filter(a => a.id !== assetId));

  // --- Liability Handlers ---
  const handleAddLiability = (liabilityData: Omit<Liability, 'id'>) => setLiabilities([...liabilities, { ...liabilityData, id: `liability-${Date.now()}` }]);
  const handleUpdateLiability = (updatedLiability: Liability) => setLiabilities(liabilities.map(l => l.id === updatedLiability.id ? updatedLiability : l));
  const handleDeleteLiability = (liabilityId: string) => setLiabilities(liabilities.filter(l => l.id !== liabilityId));

  // --- Reminder Handlers ---
  const handleAddReminder = (reminderData: Omit<Reminder, 'id'>) => setReminders([...reminders, { ...reminderData, id: `reminder-${Date.now()}` }]);
  const handleUpdateReminder = (updatedReminder: Reminder) => setReminders(reminders.map(r => r.id === updatedReminder.id ? updatedReminder : r));
  const handleDeleteReminder = (reminderId: string) => setReminders(reminders.filter(r => r.id !== reminderId));

  // --- Credit Score Handler ---
  const handleUpdateCreditScore = (score: number) => setCreditScore(score);

  if (stagedTransactions) {
    return (
        <CategorizationReviewModal 
            transactionsToReview={stagedTransactions.toReview}
            categories={categories}
            onConfirm={handleReviewConfirm}
            onCancel={handleReviewCancel}
        />
    );
  }

  if (!username) {
    return <Login onLogin={handleLogin} onNewUpload={handleNewUploadSession} />;
  }

  return (
    <div className="min-h-screen font-sans">
      <header className="bg-surface/80 backdrop-blur-md sticky top-0 z-10 border-b border-border-color">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-10H9v2h2v2h2v-2h2V9h-2V7h-2v2z"/>
            </svg>
            <div>
                 <h1 className="text-2xl font-bold text-text-primary">{t('appTitle')}</h1>
                 <p className="text-sm text-text-secondary">{t('welcomeUser', username)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            <button
                onClick={handleSwitchUser}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-focus transition-colors duration-300 font-semibold"
              >
                {t('switchUser')}
              </button>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {transactions.length === 0 ? (
          <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} error={error} />
        ) : (
          <Dashboard 
            transactions={filteredTransactions} 
            allTransactions={transactions}
            categories={categories}
            goals={goals}
            bills={bills}
            debts={debts}
            budgets={budgets}
            assets={assets}
            liabilities={liabilities}
            reminders={reminders}
            creditScore={creditScore}
            availableMonths={availableMonths}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            onAddTransaction={handleAddTransaction}
            onUpdateTransaction={handleUpdateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onAddGoal={handleAddGoal}
            onUpdateGoal={handleUpdateGoal}
            onDeleteGoal={handleDeleteGoal}
            onAddContribution={handleAddContribution}
            onAddBill={handleAddBill}
            onUpdateBill={handleUpdateBill}
            onDeleteBill={handleDeleteBill}
            onAddDebt={handleAddDebt}
            onUpdateDebt={handleUpdateDebt}
            onDeleteDebt={handleDeleteDebt}
            onAddBudget={handleAddBudget}
            onUpdateBudget={handleUpdateBudget}
            onDeleteBudget={handleDeleteBudget}
            onAddAsset={handleAddAsset}
            onUpdateAsset={handleUpdateAsset}
            onDeleteAsset={handleDeleteAsset}
            onAddLiability={handleAddLiability}
            onUpdateLiability={handleUpdateLiability}
            onDeleteLiability={handleDeleteLiability}
            onAddReminder={handleAddReminder}
            onUpdateReminder={handleUpdateReminder}
            onDeleteReminder={handleDeleteReminder}
            onUpdateCreditScore={handleUpdateCreditScore}
          />
        )}
      </main>
    </div>
  );
};

export default App;
