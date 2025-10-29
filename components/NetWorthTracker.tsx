import React, { useState, useMemo } from 'react';
import { Asset, Liability } from '../types';

interface NetWorthTrackerProps {
    assets: Asset[];
    liabilities: Liability[];
    onAddAsset: (assetData: Omit<Asset, 'id'>) => void;
    onUpdateAsset: (updatedAsset: Asset) => void;
    onDeleteAsset: (assetId: string) => void;
    onAddLiability: (liabilityData: Omit<Liability, 'id'>) => void;
    onUpdateLiability: (updatedLiability: Liability) => void;
    onDeleteLiability: (liabilityId: string) => void;
}

type Item = Asset | Liability;
type ItemType = 'Asset' | 'Liability';

const ItemModal: React.FC<{
    item: Item | null;
    itemType: ItemType;
    onClose: () => void;
    onSave: (data: Omit<Asset, 'id'> | Omit<Liability, 'id'> | Asset | Liability) => void;
}> = ({ item, itemType, onClose, onSave }) => {
    const [name, setName] = useState(item?.name || '');
    const [value, setValue] = useState(item?.value.toString() || '');
    const [type, setType] = useState<Asset['type'] | Liability['type']>(item?.type || (itemType === 'Asset' ? 'Cash' : 'Loan'));
    const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

    const assetTypes = ['Cash', 'Investment', 'Property', 'Other'];
    const liabilityTypes = ['Loan', 'Credit Card', 'Mortgage', 'Other'];

    const validate = () => {
        const newErrors: Partial<Record<string, string>> = {};
        if (!name.trim()) newErrors.name = "Name cannot be empty.";
        const numericValue = parseFloat(value);
        if (isNaN(numericValue) || numericValue < 0) {
            newErrors.value = "Please enter a valid non-negative value.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            const numericValue = parseFloat(value);
            const baseData = { name: name.trim(), value: numericValue, type };
            if (item) {
                onSave({ ...item, ...baseData });
            } else {
                onSave(baseData as Omit<Asset, 'id'> | Omit<Liability, 'id'>);
            }
        }
    };

    const isFormValid = () => {
        const numericValue = parseFloat(value);
        return name.trim() && !isNaN(numericValue) && numericValue >= 0;
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20" onClick={onClose}>
            <div className="bg-card p-6 rounded-xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-6 text-text-primary">{item ? 'Edit' : 'Add'} {itemType}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Name (e.g., Savings Account)" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5" />
                        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <input type="number" value={value} onChange={e => setValue(e.target.value)} required min="0" step="0.01" placeholder="Value ($)" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5" />
                        {errors.value && <p className="text-red-400 text-xs mt-1">{errors.value}</p>}
                    </div>
                    <select value={type} onChange={e => setType(e.target.value as Asset['type'] | Liability['type'])} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5">
                        {(itemType === 'Asset' ? assetTypes : liabilityTypes).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-text-secondary rounded-lg hover:bg-gray-300 transition-colors font-semibold">Cancel</button>
                        <button type="submit" disabled={!isFormValid()} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-focus transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const NetWorthTracker: React.FC<NetWorthTrackerProps> = (props) => {
    const { assets, liabilities, onAddAsset, onUpdateAsset, onDeleteAsset, onAddLiability, onUpdateLiability, onDeleteLiability } = props;
    const [modalState, setModalState] = useState<{ isOpen: boolean; item: Item | null; type: ItemType }>({ isOpen: false, item: null, type: 'Asset' });
    
    const { totalAssets, totalLiabilities, netWorth } = useMemo(() => {
        const totalAssets = assets.reduce((sum, a) => sum + a.value, 0);
        const totalLiabilities = liabilities.reduce((sum, l) => sum + l.value, 0);
        return { totalAssets, totalLiabilities, netWorth: totalAssets - totalLiabilities };
    }, [assets, liabilities]);

    const handleOpenModal = (itemType: ItemType, item: Item | null = null) => {
        setModalState({ isOpen: true, item, type: itemType });
    };

    const handleSave = (data: Omit<Asset, 'id'> | Omit<Liability, 'id'> | Asset | Liability) => {
        if (modalState.type === 'Asset') {
            'id' in data ? onUpdateAsset(data as Asset) : onAddAsset(data as Omit<Asset, 'id'>);
        } else {
            'id' in data ? onUpdateLiability(data as Liability) : onAddLiability(data as Omit<Liability, 'id'>);
        }
        setModalState({ isOpen: false, item: null, type: 'Asset' });
    };

    const renderItemList = (list: Item[], type: ItemType, onDelete: (id: string) => void) => (
        <div className="space-y-2">
            {list.length > 0 ? list.map(item => (
                <div key={item.id} className="p-2 rounded-md bg-white/50 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-text-primary">{item.name}</p>
                        <p className="text-xs text-text-secondary">{item.type}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className="font-semibold text-sm text-text-primary">${item.value.toLocaleString()}</span>
                        <button onClick={() => handleOpenModal(type, item)} className="text-xs font-semibold text-blue-600 hover:text-blue-800">Edit</button>
                        <button onClick={() => onDelete(item.id)} className="text-xs font-semibold text-red-600 hover:text-red-800">Del</button>
                    </div>
                </div>
            )) : <p className="text-xs text-text-secondary px-2 text-center">None yet.</p>}
        </div>
    );
    
    const assetPercentage = (totalAssets + totalLiabilities > 0) ? (totalAssets / (totalAssets + totalLiabilities)) * 100 : 50;

    return (
        <div className="flex flex-col h-full w-full">
            {modalState.isOpen && <ItemModal item={modalState.item} itemType={modalState.type} onClose={() => setModalState({ ...modalState, isOpen: false })} onSave={handleSave} />}
            <h3 className="text-xl font-semibold mb-4 text-text-primary">Net Worth Tracker</h3>

            <div className="bg-white/50 p-4 rounded-lg mb-4 text-center">
                <p className="text-sm text-text-secondary">Total Net Worth</p>
                <p className={`text-3xl font-bold ${netWorth >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>${netWorth.toLocaleString()}</p>
                <div className="w-full bg-red-200 rounded-full h-2.5 mt-2">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${assetPercentage}%` }}></div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow max-h-[300px] overflow-y-auto pr-2">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-green-600">Assets (${totalAssets.toLocaleString()})</h4>
                        <button onClick={() => handleOpenModal('Asset')} className="text-xs bg-green-500 text-white rounded-full h-5 w-5 flex items-center justify-center">+</button>
                    </div>
                    {renderItemList(assets, 'Asset', onDeleteAsset)}
                </div>
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-red-600">Liabilities (${totalLiabilities.toLocaleString()})</h4>
                        <button onClick={() => handleOpenModal('Liability')} className="text-xs bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center">+</button>
                    </div>
                    {renderItemList(liabilities, 'Liability', onDeleteLiability)}
                </div>
            </div>
        </div>
    );
};

export default NetWorthTracker;