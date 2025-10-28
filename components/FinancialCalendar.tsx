import React, { useState, useMemo } from 'react';
import { Bill, Debt, Reminder } from '../types';

interface FinancialCalendarProps {
    bills: Bill[];
    debts: Debt[];
    reminders: Reminder[];
    onAddReminder: (reminderData: Omit<Reminder, 'id'>) => void;
    onUpdateReminder: (updatedReminder: Reminder) => void;
    onDeleteReminder: (reminderId: string) => void;
}

const ReminderModal: React.FC<{
    reminder: Reminder | null;
    initialDate: string;
    onClose: () => void;
    onSave: (data: Omit<Reminder, 'id'> | Reminder) => void;
    onDelete?: (id: string) => void;
}> = ({ reminder, initialDate, onClose, onSave, onDelete }) => {
    const [title, setTitle] = useState(reminder?.title || '');
    const [date, setDate] = useState(reminder?.date || initialDate);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim() && date) {
            if (reminder) {
                onSave({ ...reminder, title, date });
            } else {
                onSave({ title, date });
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20" onClick={onClose}>
            <div className="bg-card p-6 rounded-xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-6 text-text-primary">{reminder ? 'Edit Reminder' : 'Add Reminder'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Reminder title" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5" />
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5" />
                    <div className="flex justify-between items-center pt-4">
                         {reminder && onDelete && <button type="button" onClick={() => onDelete(reminder.id)} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold">Delete</button>}
                        <div className="flex-grow flex justify-end space-x-3">
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-text-secondary rounded-lg hover:bg-gray-300 transition-colors font-semibold">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold">Save</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};


const FinancialCalendar: React.FC<FinancialCalendarProps> = ({ bills, debts, reminders, onAddReminder, onUpdateReminder, onDeleteReminder }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [modalState, setModalState] = useState<{ isOpen: boolean; reminder: Reminder | null; date: string }>({ isOpen: false, reminder: null, date: '' });
    
    const eventsByDate = useMemo(() => {
        const events = new Map<string, { type: 'bill' | 'debt' | 'reminder', text: string, item: any }[]>();
        
        bills.forEach(bill => {
            if (!bill.isPaid) {
                const dateKey = bill.dueDate;
                if (!events.has(dateKey)) events.set(dateKey, []);
                events.get(dateKey)!.push({ type: 'bill', text: bill.name, item: bill });
            }
        });
        reminders.forEach(reminder => {
            const dateKey = reminder.date;
            if (!events.has(dateKey)) events.set(dateKey, []);
            events.get(dateKey)!.push({ type: 'reminder', text: reminder.title, item: reminder });
        });

        return events;
    }, [bills, debts, reminders]);

    const handleOpenModal = (date: Date, reminder: Reminder | null = null) => {
        setModalState({ isOpen: true, reminder, date: date.toISOString().split('T')[0] });
    };

    const handleSaveReminder = (data: Omit<Reminder, 'id'> | Reminder) => {
        'id' in data ? onUpdateReminder(data) : onAddReminder(data);
        setModalState({ isOpen: false, reminder: null, date: '' });
    };
    
    const handleDeleteAndClose = (id: string) => {
        onDeleteReminder(id);
         setModalState({ isOpen: false, reminder: null, date: '' });
    };

    const changeMonth = (offset: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    };

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
        days.push(new Date(startDate));
        startDate.setDate(startDate.getDate() + 1);
    }
    
    const today = new Date();
    today.setHours(0,0,0,0);

    return (
        <div className="w-full">
            {modalState.isOpen && <ReminderModal reminder={modalState.reminder} initialDate={modalState.date} onClose={() => setModalState({ ...modalState, isOpen: false })} onSave={handleSaveReminder} onDelete={handleDeleteAndClose} />}
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="px-3 py-1 bg-gray-200 rounded-md">‹</button>
                <h3 className="text-xl font-semibold text-text-primary">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                <button onClick={() => changeMonth(1)} className="px-3 py-1 bg-gray-200 rounded-md">›</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-text-secondary">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 mt-1">
                {days.map((day, index) => {
                    const dateKey = day.toISOString().split('T')[0];
                    const dayEvents = eventsByDate.get(dateKey) || [];
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                    const isToday = day.getTime() === today.getTime();

                    return (
                        <div key={index} className={`relative p-1.5 h-24 rounded-lg border ${isCurrentMonth ? 'bg-white/50' : 'bg-gray-50/50'} ${isToday ? 'border-indigo-500' : 'border-transparent'}`}>
                           <span className={`font-semibold ${isCurrentMonth ? 'text-text-primary' : 'text-gray-400'}`}>{day.getDate()}</span>
                           <div className="mt-1 space-y-0.5 text-left text-[10px] overflow-y-auto max-h-16">
                               {dayEvents.map((event, i) => (
                                   <div key={i} onClick={() => event.type === 'reminder' && handleOpenModal(day, event.item)} className={`px-1 rounded truncate cursor-pointer ${event.type === 'bill' ? 'bg-red-200 text-red-800' : 'bg-blue-200 text-blue-800'}`}>{event.text}</div>
                               ))}
                           </div>
                           <button onClick={() => handleOpenModal(day)} className="absolute bottom-1 right-1 text-gray-400 hover:text-primary text-xs bg-gray-200/50 rounded-full h-4 w-4 flex items-center justify-center">+</button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FinancialCalendar;