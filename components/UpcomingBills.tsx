import React, { useState, useMemo } from 'react';
import { Bill } from '../types';

interface UpcomingBillsProps {
    bills: Bill[];
    onAddBill: (billData: Omit<Bill, 'id' | 'isPaid'>) => void;
    onUpdateBill: (updatedBill: Bill) => void;
    onDeleteBill: (billId: string) => void;
}

const BillModal: React.FC<{
    bill: Omit<Bill, 'id' | 'isPaid'> | null;
    onClose: () => void;
    onSave: (data: Omit<Bill, 'id' | 'isPaid'>) => void;
}> = ({ bill, onClose, onSave }) => {
    const [name, setName] = useState(bill?.name || '');
    const [amount, setAmount] = useState(bill?.amount.toString() || '');
    const [dueDate, setDueDate] = useState(bill?.dueDate || new Date().toISOString().split('T')[0]);
    const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

    const validate = () => {
        const newErrors: Partial<Record<string, string>> = {};
        if (!name.trim()) newErrors.name = "Bill name cannot be empty.";
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            newErrors.amount = "Please enter a valid positive amount.";
        }
        if (!dueDate) newErrors.dueDate = "Please select a due date.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSave({ name: name.trim(), amount: parseFloat(amount), dueDate });
        }
    };
    
    const isFormValid = () => {
        const numericAmount = parseFloat(amount);
        return name.trim() && !isNaN(numericAmount) && numericAmount > 0 && dueDate;
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20" onClick={onClose}>
            <div className="bg-card p-6 rounded-xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-6 text-text-primary">Add New Bill</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Bill Name (e.g., Netflix)" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5" />
                        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required min="0.01" step="0.01" placeholder="Amount ($)" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5" />
                        {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount}</p>}
                    </div>
                    <div>
                        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5" />
                        {errors.dueDate && <p className="text-red-400 text-xs mt-1">{errors.dueDate}</p>}
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-text-secondary rounded-lg hover:bg-gray-300 transition-colors font-semibold">Cancel</button>
                        <button type="submit" disabled={!isFormValid()} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-focus transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed">Save Bill</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const UpcomingBills: React.FC<UpcomingBillsProps> = ({ bills, onAddBill, onUpdateBill, onDeleteBill }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const { unpaidBills, paidBills } = useMemo(() => {
        const today = new Date().setHours(0,0,0,0);
        const unpaid = bills.filter(b => !b.isPaid).map(b => ({
            ...b,
            isOverdue: new Date(b.dueDate).setHours(0,0,0,0) < today
        })).sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        
        const paid = bills.filter(b => b.isPaid).sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

        return { unpaidBills: unpaid, paidBills: paid };
    }, [bills]);

    const handleMarkAsPaid = (bill: Bill) => {
        onUpdateBill({ ...bill, isPaid: true });
    };

    return (
        <div className="flex flex-col h-full">
            <div className="text-right mb-4">
                <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm">+ Add Bill</button>
            </div>
            
            {isModalOpen && <BillModal bill={null} onClose={() => setIsModalOpen(false)} onSave={(data) => { onAddBill(data); setIsModalOpen(false); }} />}

            <div className="flex-grow space-y-4 max-h-[350px] overflow-y-auto pr-2">
                {unpaidBills.length > 0 ? unpaidBills.map(bill => (
                    <div key={bill.id} className={`p-3 rounded-lg flex items-center justify-between ${bill.isOverdue ? 'bg-rose-100 border-l-4 border-rose-400' : 'bg-sky-50 border-l-4 border-sky-300'}`}>
                        <div>
                            <p className="font-semibold text-text-primary">{bill.name}</p>
                            <p className={`text-sm ${bill.isOverdue ? 'text-rose-700' : 'text-text-secondary'}`}>
                                Due: {new Date(bill.dueDate).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-lg text-text-primary">${bill.amount.toFixed(2)}</p>
                            <div className="flex items-center space-x-2">
                                <button onClick={() => handleMarkAsPaid(bill)} className="text-xs font-semibold text-emerald-600 hover:text-emerald-800">Paid</button>
                                <button onClick={() => onDeleteBill(bill.id)} className="text-xs font-semibold text-rose-600 hover:text-rose-800">Del</button>
                            </div>
                        </div>
                    </div>
                )) : <p className="text-center text-text-secondary py-8">No upcoming bills. You're all caught up!</p>}
                
                {paidBills.length > 0 && (
                     <details className="pt-4">
                        <summary className="cursor-pointer text-sm font-semibold text-text-secondary">View Recently Paid</summary>
                        <div className="mt-2 space-y-2">
                            {paidBills.slice(0, 5).map(bill => (
                                <div key={bill.id} className="p-3 rounded-lg bg-gray-100 flex items-center justify-between opacity-70">
                                    <div>
                                        <p className="font-medium text-text-secondary line-through">{bill.name}</p>
                                        <p className="text-xs text-gray-500">Paid on {new Date(bill.dueDate).toLocaleDateString()}</p>
                                    </div>
                                    <p className="font-semibold text-text-secondary line-through">${bill.amount.toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </details>
                )}
            </div>
        </div>
    );
};

export default UpcomingBills;