import React, { useState } from 'react';
import { Goal } from '../types';

interface GoalTrackerProps {
  goals: Goal[];
  onAddGoal: (goalData: Omit<Goal, 'id' | 'savedAmount'>) => void;
  onUpdateGoal: (updatedGoal: Goal) => void;
  onDeleteGoal: (goalId: string) => void;
  onAddContribution: (goalId: string, amount: number) => void;
}

const getDaysLeft = (deadline: string) => {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - new Date().getTime();
    if (diff < 0) return { days: 0, text: 'Overdue' };
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return { days, text: `${days} day${days !== 1 ? 's' : ''} left`};
};

const GoalModal: React.FC<{
    goal: Goal | null;
    onClose: () => void;
    onSave: (data: Omit<Goal, 'id' | 'savedAmount'> | Goal) => void;
}> = ({ goal, onClose, onSave }) => {
    const [name, setName] = useState(goal?.name || '');
    const [targetAmount, setTargetAmount] = useState(goal?.targetAmount.toString() || '');
    const [deadline, setDeadline] = useState(goal?.deadline || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericTarget = parseFloat(targetAmount);
        if (name.trim() && !isNaN(numericTarget) && numericTarget > 0) {
            if (goal) {
                onSave({ ...goal, name, targetAmount: numericTarget, deadline });
            } else {
                onSave({ name, targetAmount: numericTarget, deadline });
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20" onClick={onClose}>
            <div className="bg-card p-6 rounded-xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-6 text-text-primary">{goal ? 'Edit Goal' : 'Add a New Goal'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="goalName" className="block mb-2 text-sm font-medium text-text-secondary">Goal Name</label>
                        <input type="text" id="goalName" value={name} onChange={e => setName(e.target.value)} required className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5" placeholder="e.g., Vacation Fund" />
                    </div>
                    <div>
                        <label htmlFor="targetAmount" className="block mb-2 text-sm font-medium text-text-secondary">Target Amount ($)</label>
                        <input type="number" id="targetAmount" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} required min="1" step="0.01" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5" placeholder="e.g., 2000" />
                    </div>
                    <div>
                        <label htmlFor="deadline" className="block mb-2 text-sm font-medium text-text-secondary">Deadline (Optional)</label>
                        <input type="date" id="deadline" value={deadline} onChange={e => setDeadline(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5" />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-text-secondary rounded-lg hover:bg-gray-300 transition-colors font-semibold">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold">Save Goal</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const GoalItem: React.FC<{
    goal: Goal;
    onEdit: (goal: Goal) => void;
    onDelete: (id: string) => void;
    onContribute: (id: string, amount: number) => void;
}> = ({ goal, onEdit, onDelete, onContribute }) => {
    const [isContributing, setIsContributing] = useState(false);
    const [amount, setAmount] = useState('');
    
    const progress = goal.targetAmount > 0 ? Math.min((goal.savedAmount / goal.targetAmount) * 100, 100) : 0;
    const daysLeftInfo = getDaysLeft(goal.deadline);
    const isCompleted = progress >= 100;

    const handleContributeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount);
        if (!isNaN(numericAmount) && numericAmount > 0) {
            onContribute(goal.id, numericAmount);
            setAmount('');
            setIsContributing(false);
        }
    };

    return (
        <div className="bg-white/50 p-4 rounded-lg">
            <div className="flex flex-wrap justify-between items-start gap-2">
                <div>
                    <h4 className="font-bold text-text-primary flex items-center">{goal.name}
                        {isCompleted && <span className="ml-2 text-xs font-semibold text-white bg-green-500 px-2 py-0.5 rounded-full">Completed!</span>}
                    </h4>
                    <p className="text-sm text-text-secondary">{daysLeftInfo?.text}</p>
                </div>
                <div className="flex items-center space-x-2">
                    {!isCompleted && <button onClick={() => setIsContributing(true)} className="text-sm font-semibold text-primary hover:text-indigo-800">Contribute</button>}
                    <button onClick={() => onEdit(goal)} className="text-sm font-semibold text-blue-600 hover:text-blue-800">Edit</button>
                    <button onClick={() => onDelete(goal.id)} className="text-sm font-semibold text-red-600 hover:text-red-800">Delete</button>
                </div>
            </div>
            <div className="mt-3">
                <div className="flex justify-between text-sm font-medium text-text-secondary mb-1">
                    <span>${goal.savedAmount.toLocaleString()}</span>
                    <span>${goal.targetAmount.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
            {isContributing && (
                <form onSubmit={handleContributeSubmit} className="mt-4 flex items-center space-x-2">
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" min="0.01" step="0.01" required className="flex-grow bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2" />
                    <button type="submit" className="px-3 py-2 text-sm bg-secondary text-white rounded-lg hover:bg-emerald-700 font-semibold">Add</button>
                    <button type="button" onClick={() => setIsContributing(false)} className="px-3 py-2 text-sm bg-gray-200 text-text-secondary rounded-lg hover:bg-gray-300 font-semibold">Cancel</button>
                </form>
            )}
        </div>
    );
};


const GoalTracker: React.FC<GoalTrackerProps> = ({ goals, onAddGoal, onUpdateGoal, onDeleteGoal, onAddContribution }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

    const handleOpenModal = (goal: Goal | null = null) => {
        setEditingGoal(goal);
        setIsModalOpen(true);
    };

    const handleSaveGoal = (goalData: Omit<Goal, 'id' | 'savedAmount'> | Goal) => {
        if ('id' in goalData) {
            onUpdateGoal(goalData);
        } else {
            onAddGoal(goalData);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-4">
            <div className="text-right">
                <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold">
                    + Add New Goal
                </button>
            </div>

            {isModalOpen && <GoalModal goal={editingGoal} onClose={() => setIsModalOpen(false)} onSave={handleSaveGoal} />}
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {goals.length === 0 && <p className="text-center text-text-secondary py-8">No goals set yet. Add one to get started!</p>}
                {goals.map(goal => (
                    <GoalItem 
                        key={goal.id} 
                        goal={goal}
                        onEdit={handleOpenModal}
                        onDelete={onDeleteGoal}
                        onContribute={onAddContribution}
                    />
                ))}
            </div>
        </div>
    );
};

export default GoalTracker;
