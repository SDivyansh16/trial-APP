import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface CategorizationReviewModalProps {
    transactionsToReview: Transaction[];
    categories: string[];
    onConfirm: (reviewedTransactions: Transaction[]) => void;
    onCancel: () => void;
}

const CategorizationReviewModal: React.FC<CategorizationReviewModalProps> = ({ transactionsToReview, categories, onConfirm, onCancel }) => {
    const [reviewedTransactions, setReviewedTransactions] = useState<Transaction[]>(transactionsToReview);
    const [searchTerm, setSearchTerm] = useState('');
    const { t } = useLanguage();

    const handleCategoryChange = (transactionId: string, newCategory: string) => {
        setReviewedTransactions(prev =>
            prev.map(t => (t.id === transactionId ? { ...t, category: newCategory } : t))
        );
    };

    const filteredTransactions = useMemo(() => {
        if (!searchTerm) {
            return reviewedTransactions;
        }
        return reviewedTransactions.filter(t =>
            t.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [reviewedTransactions, searchTerm]);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-6 rounded-xl shadow-xl w-full max-w-3xl border border-border-color" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-2 text-text-primary">{t('reviewAITitle')}</h3>
                <p className="text-text-secondary mb-4">{t('reviewAIDescription')}</p>

                <div className="mb-4">
                    <input
                        type="search"
                        placeholder={t('searchByDescription')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-background border border-border-color text-text-primary text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                    />
                </div>
                
                <div className="max-h-[55vh] overflow-y-auto pr-2 space-y-2 border-t border-b border-border-color py-4">
                    {/* FIX: Renamed map parameter from 't' to 'transaction' to avoid shadowing the 't' function from useLanguage. */}
                    {filteredTransactions.map(transaction => {
                        const isLowConfidence = transaction.confidence === 'low';
                        return (
                             <div key={transaction.id} className={`grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-3 rounded-lg transition-colors ${
                                isLowConfidence ? 'bg-yellow-900/40' : 'bg-surface/50'
                            }`}>
                                <div className="col-span-1 md:col-span-1">
                                    <p className="font-medium text-sm text-text-primary truncate" title={transaction.description}>{transaction.description}</p>
                                    <p className="text-xs text-text-secondary">{transaction.date.toLocaleDateString()}</p>
                                </div>
                                <div className="text-left md:text-right">
                                    <p className="font-semibold text-sm text-red-400">-${transaction.amount.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                     {isLowConfidence && (
                                        <div title={t('lowConfidenceTooltip')}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                    <select 
                                        value={transaction.category} 
                                        onChange={e => handleCategoryChange(transaction.id, e.target.value)} 
                                        className="bg-background border border-border-color text-text-primary text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2"
                                    >
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-end space-x-3 pt-6">
                    <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-600 text-text-primary rounded-lg hover:bg-gray-500 transition-colors font-semibold">{t('cancelUpload')}</button>
                    <button type="button" onClick={() => onConfirm(reviewedTransactions)} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-focus transition-colors font-semibold">{t('confirmAndFinish')}</button>
                </div>
            </div>
        </div>
    );
};

export default CategorizationReviewModal;
