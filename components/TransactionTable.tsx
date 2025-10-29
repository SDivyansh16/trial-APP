import React, { useState, useMemo } from 'react';
import { Transaction, DrillDownFilter } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface TransactionTableProps {
    transactions: Transaction[];
    categories: string[];
    drillDownFilter: DrillDownFilter | null;
    onUpdateTransaction: (transaction: Transaction) => void;
    onDeleteTransaction: (transactionId: string) => void;
    onClearDrillDown: () => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, categories, drillDownFilter, onUpdateTransaction, onDeleteTransaction, onClearDrillDown }) => {
    const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction; direction: 'ascending' | 'descending' } | null>({ key: 'date', direction: 'descending' });
    const [editingRowId, setEditingRowId] = useState<string | null>(null);
    const [editedData, setEditedData] = useState<Partial<Transaction>>({});
    const { t } = useLanguage();

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
            return '↕';
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

    const DrillDownHeader = () => {
        if (!drillDownFilter) return null;

        const filterText = drillDownFilter.type === 'category' 
            ? drillDownFilter.value 
            : `${drillDownFilter.value.charAt(0).toUpperCase()}${drillDownFilter.value.slice(1)}`;

        return (
            <div className="bg-primary/10 text-primary-focus p-2 rounded-lg mb-4 flex justify-between items-center text-sm">
                <span><strong>{t('showingTransactionsFor')}</strong> {filterText}</span>
                <button onClick={onClearDrillDown} className="font-semibold hover:underline">
                   {t('clearFilter')} &times;
                </button>
            </div>
        );
    };

    return (
        <div>
            <DrillDownHeader />
            <div className="max-h-[400px] overflow-y-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-text-secondary uppercase bg-white/60 backdrop-blur-sm sticky top-0">
                        <tr>
                            {['date', 'description', 'category', 'amount', 'actions'].map((key) => (
                                <th key={key} scope="col" className="px-6 py-3">
                                    <button className="flex items-center space-x-1" onClick={() => requestSort(key as keyof Transaction)}>
                                        <span>{t(key as any, key.charAt(0).toUpperCase() + key.slice(1))}</span>
                                        <span className="text-gray-400">{key !== 'actions' && getSortIndicator(key as keyof Transaction)}</span>
                                    </button>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedTransactions.map((transaction, index) => {
                            const isEditing = editingRowId === transaction.id;
                            return (
                                <tr key={transaction.id} className={`border-b border-border-color ${index % 2 === 0 ? 'bg-white/30' : 'bg-sky-50/30'} hover:bg-primary/10`}>
                                    <td className="px-6 py-4 text-text-secondary">{isEditing ? (
                                        <input type="date" value={new Date(editedData.date!).toISOString().split('T')[0]} onChange={(e) => setEditedData({...editedData, date: new Date(e.target.value)})} className="bg-white/80 border border-border-color text-text-primary text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-1.5" />
                                    ) : transaction.date.toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-medium text-text-primary whitespace-nowrap">{isEditing ? (
                                        <input type="text" value={editedData.description} onChange={(e) => handleInputChange(e, 'description')} className="bg-white/80 border border-border-color text-text-primary text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-1.5" />
                                    ) : transaction.description}</td>
                                    <td className="px-6 py-4 text-text-secondary">{isEditing ? (
                                        <select value={editedData.category} onChange={(e) => handleInputChange(e, 'category')} className="bg-white/80 border border-border-color text-text-primary text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-1.5">
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    ) : transaction.category}</td>
                                    <td className={`px-6 py-4 font-semibold ${transaction.type === 'income' ? 'text-green-500' : 'text-rose-500'}`}>
                                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 space-x-4 flex items-center">
                                        {isEditing ? (
                                            <>
                                                <button onClick={handleSave} className="font-medium text-primary hover:text-primary-focus">Save</button>
                                                <button onClick={handleCancel} className="font-medium text-text-secondary hover:text-text-primary">Cancel</button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => handleEdit(transaction)} className="font-medium text-primary hover:text-primary-focus">Edit</button>
                                                <button onClick={() => onDeleteTransaction(transaction.id)} className="font-medium text-secondary hover:text-secondary-focus">Delete</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TransactionTable;