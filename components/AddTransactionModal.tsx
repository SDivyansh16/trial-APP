import React, { useState } from 'react';
import { Transaction } from '../types';

interface AddTransactionModalProps {
    categories: string[];
    onClose: () => void;
    onSave: (data: Omit<Transaction, 'id'>) => void;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ categories, onClose, onSave }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [newCategory, setNewCategory] = useState('');
    const [errors, setErrors] = useState<Partial<Record<string, string>>>({});


    const expenseCategories = categories.filter(c => c !== 'Uncategorized' && c !== 'Savings Goal' && c !== 'Income');

    const validate = () => {
        const newErrors: Partial<Record<string, string>> = {};
        if (!description.trim()) newErrors.description = "Description cannot be empty.";
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            newErrors.amount = "Please enter a valid positive amount.";
        }
        if (type === 'expense') {
            if (!category) newErrors.category = "Please select a category.";
            if (category === 'new' && !newCategory.trim()) {
                newErrors.newCategory = "New category name cannot be empty.";
            }
        }
        if (!date) newErrors.date = "Please select a date.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            const numericAmount = parseFloat(amount);
            const finalCategory = type === 'income' ? 'Income' : (category === 'new' ? newCategory.trim() : category);
            onSave({
                date: new Date(date),
                description: description.trim(),
                category: finalCategory,
                amount: numericAmount,
                type,
            });
        }
    };

    const isFormValid = () => {
        const numericAmount = parseFloat(amount);
        if (!description.trim() || !date || isNaN(numericAmount) || numericAmount <= 0) return false;
        if (type === 'expense') {
            if (!category) return false;
            if (category === 'new' && !newCategory.trim()) return false;
        }
        return true;
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20" onClick={onClose}>
            <div className="bg-card p-6 rounded-xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-6 text-text-primary">Add New Transaction</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    <div>
                        <label htmlFor="date" className="block mb-2 text-sm font-medium text-text-secondary">Date</label>
                        <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} required className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5" />
                        {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
                    </div>

                    <div>
                        <label htmlFor="description" className="block mb-2 text-sm font-medium text-text-secondary">Description</label>
                        <input type="text" id="description" value={description} onChange={e => setDescription(e.target.value)} required placeholder="e.g., Coffee with friend" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5" />
                        {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
                    </div>
                    
                    <div>
                        <label className="block mb-2 text-sm font-medium text-text-secondary">Type</label>
                        <div className="flex space-x-4 p-2 bg-gray-100 rounded-lg">
                            <label className={`flex-1 text-center py-1 rounded-md cursor-pointer transition-colors ${type === 'expense' ? 'bg-red-500 text-white shadow' : 'hover:bg-gray-200'}`}>
                                <input type="radio" name="type" value="expense" checked={type === 'expense'} onChange={() => { setType('expense'); setCategory(''); }} className="sr-only" /> 
                                Expense
                            </label>
                            <label className={`flex-1 text-center py-1 rounded-md cursor-pointer transition-colors ${type === 'income' ? 'bg-green-500 text-white shadow' : 'hover:bg-gray-200'}`}>
                                <input type="radio" name="type" value="income" checked={type === 'income'} onChange={() => setType('income')} className="sr-only" /> 
                                Income
                            </label>
                        </div>
                    </div>

                    {type === 'expense' && (
                        <>
                            <div>
                                <label htmlFor="category" className="block mb-2 text-sm font-medium text-text-secondary">Category</label>
                                <select id="category" value={category} onChange={e => setCategory(e.target.value)} required className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5">
                                    <option value="" disabled>Select a category</option>
                                    {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                    <option value="new">-- Add New Category --</option>
                                </select>
                                {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category}</p>}
                            </div>
                            {category === 'new' && (
                                <div>
                                    <label htmlFor="newCategory" className="block mb-2 text-sm font-medium text-text-secondary">New Category Name</label>
                                    <input type="text" id="newCategory" value={newCategory} onChange={e => setNewCategory(e.target.value)} required placeholder="e.g., Subscriptions" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5" />
                                    {errors.newCategory && <p className="text-red-400 text-xs mt-1">{errors.newCategory}</p>}
                                </div>
                            )}
                        </>
                    )}

                    <div>
                        <label htmlFor="amount" className="block mb-2 text-sm font-medium text-text-secondary">Amount ($)</label>
                        <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} required min="0.01" step="0.01" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5" placeholder="e.g., 5.75" />
                        {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount}</p>}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-text-secondary rounded-lg hover:bg-gray-300 transition-colors font-semibold">Cancel</button>
                        <button type="submit" disabled={!isFormValid()} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-focus transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed">Save Transaction</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTransactionModal;