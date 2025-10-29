import React, { useState, useMemo } from 'react';
import { Budget, Transaction } from '../types';

interface BudgetTrackerProps {
    transactions: Transaction[];
    categories: string[];
    budgets: Budget[];
    onAddBudget: (budget: Budget) => void;
    onUpdateBudget: (budget: Budget) => void;
    onDeleteBudget: (category: string) => void;
    selectedMonth: string;
}

const formatMonthDisplay = (monthStr: string) => {
    if (monthStr === 'all') return 'All Time';
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
};


const BudgetModal: React.FC<{
    budget: Budget | null;
    existingBudgets: Budget[];
    allCategories: string[];
    onClose: () => void;
    onSave: (budget: Budget) => void;
}> = ({ budget, existingBudgets, allCategories, onClose, onSave }) => {
    const [category, setCategory] = useState(budget?.category || '');
    const [amount, setAmount] = useState(budget?.amount.toString() || '');
    const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

    const availableCategories = useMemo(() => {
        const budgetedCategories = new Set(existingBudgets.map(b => b.category));
        const specialCategories = new Set(['Uncategorized', 'Savings Goal']);
        return allCategories.filter(c => !specialCategories.has(c) && (!budgetedCategories.has(c) || c === budget?.category));
    }, [allCategories, existingBudgets, budget]);

    const validate = () => {
        const newErrors: Partial<Record<string, string>> = {};
        if (!category) newErrors.category = "Please select a category.";
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            newErrors.amount = "Please enter a valid positive budget amount.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSave({ category, amount: parseFloat(amount) });
        }
    };
    
    const isFormValid = () => {
        const numericAmount = parseFloat(amount);
        return category && !isNaN(numericAmount) && numericAmount > 0;
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20" onClick={onClose}>
            <div className="bg-card p-6 rounded-xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-6 text-text-primary">{budget ? 'Edit Budget' : 'Add New Budget'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="category" className="block mb-2 text-sm font-medium text-text-secondary">Category</label>
                        <select id="category" value={category} onChange={e => setCategory(e.target.value)} required disabled={!!budget} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 disabled:bg-gray-200">
                            <option value="" disabled>Select a category</option>
                            {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
                             {budget && !availableCategories.includes(budget.category) && <option value={budget.category}>{budget.category}</option>}
                        </select>
                        {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category}</p>}
                    </div>
                    <div>
                        <label htmlFor="amount" className="block mb-2 text-sm font-medium text-text-secondary">Budget Amount ($)</label>
                        <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} required min="1" step="0.01" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5" placeholder="e.g., 500" />
                        {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount}</p>}
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-text-secondary rounded-lg hover:bg-gray-300 transition-colors font-semibold">Cancel</button>
                        <button type="submit" disabled={!isFormValid()} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-focus transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed">Save Budget</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const BudgetTracker: React.FC<BudgetTrackerProps> = ({ transactions, categories, budgets, onAddBudget, onUpdateBudget, onDeleteBudget, selectedMonth }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

    const spendingByCategory = useMemo(() => {
        const spendingMap = new Map<string, number>();
        transactions.forEach(t => {
            if (t.type === 'expense') {
                const currentAmount = spendingMap.get(t.category) || 0;
                spendingMap.set(t.category, currentAmount + t.amount);
            }
        });
        return spendingMap;
    }, [transactions]);
    
    const handleOpenModal = (budget: Budget | null = null) => {
        setEditingBudget(budget);
        setIsModalOpen(true);
    };

    const handleSaveBudget = (budget: Budget) => {
        if (budgets.some(b => b.category === budget.category)) {
            onUpdateBudget(budget);
        } else {
            onAddBudget(budget);
        }
        setIsModalOpen(false);
    };

    const renderProgressBar = (spent: number, budget: number) => {
        const percentage = budget > 0 ? (spent / budget) * 100 : 0;
        let colorClass = 'bg-green-500';
        if (percentage > 100) colorClass = 'bg-red-500';
        else if (percentage > 90) colorClass = 'bg-yellow-500';

        return (
             <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-text-primary">Monthly Budget Tracker ({formatMonthDisplay(selectedMonth)})</h3>
                <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold">+ Add Budget</button>
            </div>

            {isModalOpen && <BudgetModal budget={editingBudget} existingBudgets={budgets} allCategories={categories} onClose={() => setIsModalOpen(false)} onSave={handleSaveBudget} />}

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {budgets.length === 0 && <p className="text-center text-text-secondary py-8">No budgets set for this month. Add one to start tracking!</p>}
                {budgets.map(budget => {
                    const spent = spendingByCategory.get(budget.category) || 0;
                    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
                    return (
                        <div key={budget.category} className="bg-white/50 p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-text-primary">{budget.category}</span>
                                <div className="flex items-center space-x-2">
                                    {percentage > 100 && <span title="Overbudget!" className="text-red-500 font-bold">!</span>}
                                    {percentage > 90 && percentage <= 100 && <span title="Nearing budget" className="text-yellow-500 font-bold">!</span>}
                                    <button onClick={() => handleOpenModal(budget)} className="text-sm font-semibold text-blue-600 hover:text-blue-800">Edit</button>
                                    <button onClick={() => onDeleteBudget(budget.category)} className="text-sm font-semibold text-red-600 hover:text-red-800">Delete</button>
                                </div>
                            </div>
                            {renderProgressBar(spent, budget.amount)}
                            <div className="flex justify-between text-sm text-text-secondary mt-1">
                                <span>${spent.toFixed(2)} spent</span>
                                <span>of ${budget.amount.toFixed(2)}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BudgetTracker;