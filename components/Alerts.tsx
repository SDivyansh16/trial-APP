import React, { useMemo, useState } from 'react';
import { Bill, Reminder } from '../types';

interface AlertsProps {
    bills: Bill[];
    reminders: Reminder[];
}

const Alerts: React.FC<AlertsProps> = ({ bills, reminders }) => {
    const [isVisible, setIsVisible] = useState(true);

    const upcomingItems = useMemo(() => {
        const items: { date: string, text: string, type: 'Bill' | 'Reminder' }[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);

        bills.forEach(bill => {
            if (!bill.isPaid) {
                const dueDate = new Date(bill.dueDate);
                // Adjust for timezone differences by getting date parts
                const dueDateTime = new Date(dueDate.getUTCFullYear(), dueDate.getUTCMonth(), dueDate.getUTCDate()).getTime();
                if (dueDateTime >= today.getTime() && dueDateTime <= nextWeek.getTime()) {
                    items.push({ date: bill.dueDate, text: `${bill.name} ($${bill.amount.toFixed(2)})`, type: 'Bill' });
                }
            }
        });

        reminders.forEach(reminder => {
            const reminderDate = new Date(reminder.date);
            const reminderDateTime = new Date(reminderDate.getUTCFullYear(), reminderDate.getUTCMonth(), reminderDate.getUTCDate()).getTime();
             if (reminderDateTime >= today.getTime() && reminderDateTime <= nextWeek.getTime()) {
                items.push({ date: reminder.date, text: reminder.title, type: 'Reminder' });
            }
        });

        return items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [bills, reminders]);

    if (!isVisible || upcomingItems.length === 0) {
        return null;
    }

    return (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-r-lg shadow-md mb-8" role="alert">
            <div className="flex">
                <div className="py-1">
                    <svg className="fill-current h-6 w-6 text-yellow-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-5.414V8a1 1 0 112 0v4.586a1 1 0 11-2 0zM10 6a1 1 0 100-2 1 1 0 000 2z"/></svg>
                </div>
                <div className="flex-grow">
                    <p className="font-bold">Upcoming: {upcomingItems.length} item(s) due within 7 days</p>
                    <ul className="list-disc list-inside text-sm mt-1">
                        {upcomingItems.map((item, index) => (
                            <li key={index}>
                                <strong>{new Date(item.date).toLocaleDateString(undefined, { timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric'})}:</strong> {item.text} ({item.type})
                            </li>
                        ))}
                    </ul>
                </div>
                <button onClick={() => setIsVisible(false)} className="ml-auto -mt-2 -mr-2 text-yellow-600 hover:text-yellow-800 text-2xl font-bold">&times;</button>
            </div>
        </div>
    );
};

export default Alerts;
