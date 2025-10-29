import React, { useState, useMemo } from 'react';
import { Debt } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface DebtTrackerProps {
    debts: Debt[];
    onAddDebt: (debtData: Omit<Debt, 'id' | 'isSettled'>) => void;
    onUpdateDebt: (updatedDebt: Debt) => void;
    onDeleteDebt: (debtId: string) => void;
}

const DebtModal: React.FC<{
    debt: Omit<Debt, 'id' | 'isSettled'> | null;
    onClose: () => void;
    onSave: (data: Omit<Debt, 'id' | 'isSettled'>) => void;
}> = ({ debt, onClose, onSave }) => {
    const [description, setDescription] = useState(debt?.description || '');
    const [amount, setAmount] = useState(debt?.amount.toString() || '');
    const [type, setType] = useState<'owed' | 'iou'>(debt?.type || 'owed');
    const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

    const validate = () => {
        const newErrors: Partial<Record<string, string>> = {};
        if (!description.trim()) newErrors.description = "Description cannot be empty.";
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            newErrors.amount = "Please enter a valid positive amount.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSave({ description: description.trim(), amount: parseFloat(amount), type });
        }
    };

    const isFormValid = () => {
        const numericAmount = parseFloat(amount);
        return description.trim() && !isNaN(numericAmount) && numericAmount > 0;
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20" onClick={onClose}>
            <div className="bg-card p-6 rounded-xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-6 text-text-primary">Add Debt or IOU</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input type="text" value={description} onChange={e => setDescription(e.target.value)} required placeholder="Description (e.g., Loan from John)" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5" />
                        {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
                    </div>
                    <div>
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required min="0.01" step="0.01" placeholder="Amount ($)" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5" />
                        {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount}</p>}
                    </div>
                    <div className="flex space-x-4">
                        <label className="flex items-center"><input type="radio" name="type" value="owed" checked={type === 'owed'} onChange={() => setType('owed')} className="mr-2" /> I Owe</label>
                        <label className="flex items-center"><input type="radio" name="type" value="iou" checked={type === 'iou'} onChange={() => setType('iou')} className="mr-2" /> Owed to Me</label>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-text-secondary rounded-lg hover:bg-gray-300 transition-colors font-semibold">Cancel</button>
                        <button type="submit" disabled={!isFormValid()} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-focus transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DebtTracker: React.FC<DebtTrackerProps> = ({ debts, onAddDebt, onUpdateDebt, onDeleteDebt }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { t } = useLanguage();

    const { debtsOwed, ious } = useMemo(() => {
        return {
            debtsOwed: debts.filter(d => d.type === 'owed' && !d.isSettled),
            ious: debts.filter(d => d.type === 'iou' && !d.isSettled)
        };
    }, [debts]);
    
    const handleMarkSettled = (debt: Debt) => {
        onUpdateDebt({ ...debt, isSettled: true });
    };

    const renderDebtList = (list: Debt[], title: string, type: 'owed' | 'iou') => (
        <div>
            <h4 className={`font-semibold mb-2 text-md ${type === 'owed' ? 'text-secondary' : 'text-emerald-600'}`}>{title}</h4>
            <div className="space-y-2">
                {list.length > 0 ? list.map(debt => (
                    <div key={debt.id} className={`p-2 rounded-lg flex items-center justify-between ${type === 'owed' ? 'bg-rose-50' : 'bg-emerald-50'}`}>
                        <span className="text-sm text-text-primary">{debt.description}</span>
                        <div className="flex items-center space-x-3">
                            <span className="font-semibold text-sm text-text-primary">${debt.amount.toFixed(2)}</span>
                            <button onClick={() => handleMarkSettled(debt)} title="Mark as Settled" className="font-bold text-emerald-500 hover:text-emerald-700">✓</button>
                            <button onClick={() => onDeleteDebt(debt.id)} title="Delete" className="font-bold text-rose-500 hover:text-rose-700">×</button>
                        </div>
                    </div>
                )) : <p className="text-xs text-text-secondary px-2">None.</p>}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full">
            <div className="text-right mb-4">
                <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm">+ Add Item</button>
            </div>

            {isModalOpen && <DebtModal debt={null} onClose={() => setIsModalOpen(false)} onSave={(data) => { onAddDebt(data); setIsModalOpen(false); }} />}

            <div className="flex-grow space-y-4 max-h-[350px] overflow-y-auto pr-2">
                {renderDebtList(debtsOwed, t('moneyIOwe'), 'owed')}
                {renderDebtList(ious, t('moneyOwedToMe'), 'iou')}
            </div>
        </div>
    );
};

export default DebtTracker;