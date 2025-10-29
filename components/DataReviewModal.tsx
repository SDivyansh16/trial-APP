import React from 'react';
import { MalformedRow } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface DataReviewModalProps {
    malformedRows: MalformedRow[];
    validRowCount: number;
    onConfirm: () => void;
    onCancel: () => void;
}

const DataReviewModal: React.FC<DataReviewModalProps> = ({ malformedRows, validRowCount, onConfirm, onCancel }) => {
    const { t } = useLanguage();
    
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-6 rounded-xl shadow-xl w-full max-w-3xl border border-border-color" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-2 text-text-primary">{t('dataReviewTitle')}</h3>
                <p className="text-text-secondary mb-4">
                    {t('dataReviewDescription', validRowCount, malformedRows.length)}
                </p>
                
                <div className="max-h-[55vh] overflow-y-auto pr-2 space-y-2 border-t border-b border-border-color py-4">
                   <table className="w-full text-sm text-left text-text-secondary">
                        <thead className="text-xs text-text-primary uppercase bg-surface/80 sticky top-0">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('tableHeaderRowData')}</th>
                                <th scope="col" className="px-6 py-3">{t('tableHeaderReason')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {malformedRows.map((row, index) => (
                                <tr key={index} className="bg-surface/50 border-b border-border-color hover:bg-surface">
                                    <td className="px-6 py-4 font-mono text-xs opacity-80" title={row.row.join(', ')}>
                                        {row.row.join(', ').substring(0, 80)}...
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-red-400">
                                        {t(row.reason.replace(/\s+/g, ''))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end space-x-3 pt-6">
                    <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-600 text-text-primary rounded-lg hover:bg-gray-500 transition-colors font-semibold">{t('cancelAndFix')}</button>
                    <button type="button" onClick={onConfirm} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-focus transition-colors font-semibold">{t('importValidDataOnly', validRowCount)}</button>
                </div>
            </div>
        </div>
    );
};

export default DataReviewModal;