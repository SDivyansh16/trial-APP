import React, { useState } from 'react';

interface CategoryManagerProps {
    categories: string[];
    onAddCategory: (category: string) => void;
    onUpdateCategory: (oldCategory: string, newCategory: string) => void;
    onDeleteCategory: (category: string) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onAddCategory, onUpdateCategory, onDeleteCategory }) => {
    const [newCategory, setNewCategory] = useState('');
    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [editedName, setEditedName] = useState('');

    const handleAdd = () => {
        onAddCategory(newCategory.trim());
        setNewCategory('');
    };

    const handleEditStart = (category: string) => {
        setEditingCategory(category);
        setEditedName(category);
    };

    const handleEditCancel = () => {
        setEditingCategory(null);
        setEditedName('');
    };

    const handleEditSave = () => {
        if (editingCategory) {
            onUpdateCategory(editingCategory, editedName.trim());
            handleEditCancel();
        }
    };

    const specialCategories = ['Uncategorized', 'Savings Goal'];

    return (
        <div className="space-y-4">
            <div className="flex space-x-2">
                <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New category name"
                    className="flex-grow bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                />
                <button onClick={handleAdd} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold">Add</button>
            </div>
            <div className="max-h-[300px] overflow-y-auto pr-2">
                <ul className="space-y-2">
                    {categories.filter(c => !specialCategories.includes(c)).map(category => (
                        <li key={category} className="flex items-center justify-between bg-white/50 p-2 rounded-md">
                            {editingCategory === category ? (
                                <input 
                                    type="text"
                                    value={editedName}
                                    onChange={(e) => setEditedName(e.target.value)}
                                    className="flex-grow bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-1.5"
                                />
                            ) : (
                                <span className="text-sm font-medium text-text-primary">{category}</span>
                            )}
                            <div className="flex items-center space-x-2 ml-2">
                                {editingCategory === category ? (
                                    <>
                                        <button onClick={handleEditSave} className="text-sm font-semibold text-green-600 hover:text-green-800">Save</button>
                                        <button onClick={handleEditCancel} className="text-sm font-semibold text-gray-600 hover:text-gray-800">Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => handleEditStart(category)} className="text-sm font-semibold text-blue-600 hover:text-blue-800">Edit</button>
                                        <button onClick={() => onDeleteCategory(category)} className="text-sm font-semibold text-red-600 hover:text-red-800">Delete</button>
                                    </>
                                )}
                            </div>
                        </li>
                    ))}
                    {specialCategories.map(sc => {
                        if (categories.includes(sc)) {
                            return (
                                <li key={sc} className="flex items-center justify-between bg-white/30 p-2 rounded-md">
                                    <span className="text-sm font-medium text-gray-500 italic">{sc}</span>
                                </li>
                            )
                        }
                        return null;
                    })}
                </ul>
            </div>
        </div>
    );
};

export default CategoryManager;