import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';

interface TransactionTableProps {
    transactions: Transaction[];
    categories: string[];
    onUpdateTransaction: (transaction: Transaction) => void;
    onDeleteTransaction: (transactionId: string) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, categories, onUpdateTransaction, onDeleteTransaction }) => {
    const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction; direction: 'ascending' | 'descending' } | null>({ key: 'date', direction: 'descending' });
    const [editingRowId, setEditingRowId] = useState<string | null>(null);
    const [editedData, setEditedData] = useState<Partial<Transaction>>({});

    const sortedTransactions = useMemo(() => {
        let sortableItems = [...transactions];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [transactions, sortConfig]);

    const requestSort = (key: keyof Transaction) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key: keyof Transaction) => {
        if (!sortConfig || sortConfig.key !== key) {
            return null;
        }
        return sortConfig.direction === 'ascending' ? '▲' : '▼';
    }

    const handleEdit = (transaction: Transaction) => {
        setEditingRowId(transaction.id);
        setEditedData(transaction);
    };

    const handleCancel = () => {
        setEditingRowId(null);
        setEditedData({});
    };

    const handleSave = () => {
        onUpdateTransaction(editedData as Transaction);
        handleCancel();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, field: keyof Transaction) => {
        setEditedData({ ...editedData, [field]: e.target.value });
    };

    return (
        <div className="max-h-[400px] overflow-y-auto">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-white/40 sticky top-0 backdrop-blur-sm">
                    <tr>
                        {['date', 'description', 'category', 'amount', 'actions'].map((key) => (
                            <th key={key} scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort(key as keyof Transaction)}>
                                {key.charAt(0).toUpperCase() + key.slice(1)} {key !== 'actions' && getSortIndicator(key as keyof Transaction)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sortedTransactions.map((transaction) => {
                        const isEditing = editingRowId === transaction.id;
                        return (
                            <tr key={transaction.id} className="bg-white/50 border-b border-white/30 hover:bg-white/70">
                                <td className="px-6 py-4">{isEditing ? (
                                    <input type="date" value={new Date(editedData.date!).toISOString().split('T')[0]} onChange={(e) => setEditedData({...editedData, date: new Date(e.target.value)})} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5" />
                                ) : transaction.date.toLocaleDateString()}</td>
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{isEditing ? (
                                    <input type="text" value={editedData.description} onChange={(e) => handleInputChange(e, 'description')} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5" />
                                ) : transaction.description}</td>
                                <td className="px-6 py-4">{isEditing ? (
                                    <select value={editedData.category} onChange={(e) => handleInputChange(e, 'category')} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5">
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                ) : transaction.category}</td>
                                <td className={`px-6 py-4 font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 space-x-2 flex items-center">
                                    {isEditing ? (
                                        <>
                                            <button onClick={handleSave} className="font-medium text-blue-600 hover:underline">Save</button>
                                            <button onClick={handleCancel} className="font-medium text-gray-600 hover:underline">Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => handleEdit(transaction)} className="font-medium text-blue-600 hover:underline">Edit</button>
                                            <button onClick={() => onDeleteTransaction(transaction.id)} className="font-medium text-red-600 hover:underline">Delete</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default TransactionTable;