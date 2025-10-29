import React, { useState, useMemo } from 'react';
import { Transaction, SpendingAnomaly } from '../types';
import { getSpendingAnomalies } from '../services/geminiService';

interface SpendingTrendsProps {
    transactions: Transaction[]; // Filtered for the selected month
    allTransactions: Transaction[]; // All transactions for historical context
    selectedMonth: string;
}

const getMonthString = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const InsightItem: React.FC<{ title: string; value: string; change?: number; icon: React.ReactElement }> = ({ title, value, change, icon }) => {
    const isIncrease = change && change > 0;
    const changeColor = change ? (isIncrease ? 'text-red-500' : 'text-green-500') : '';
    const changeText = change ? `(${isIncrease ? '▲' : '▼'} ${Math.abs(change).toFixed(1)}%)` : '';

    return (
        <div className="bg-white/50 p-4 rounded-lg flex items-center space-x-4">
            <div className="flex-shrink-0">{icon}</div>
            <div>
                <p className="text-sm font-medium text-text-secondary">{title}</p>
                <p className="text-lg font-bold text-text-primary">{value} <span className={`text-sm font-semibold ${changeColor}`}>{changeText}</span></p>
            </div>
        </div>
    );
};

const SpendingTrends: React.FC<SpendingTrendsProps> = ({ transactions, allTransactions, selectedMonth }) => {
    const [anomalies, setAnomalies] = useState<SpendingAnomaly[] | null>(null);
    const [isLoadingAnomalies, setIsLoadingAnomalies] = useState(false);
    const [errorAnomalies, setErrorAnomalies] = useState<string | null>(null);
    
    const trends = useMemo(() => {
        if (selectedMonth === 'all' || transactions.length === 0) {
            return null;
        }

        // --- Current period calculations ---
        const currentMonthExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const expensesByDay = transactions.reduce((acc, t) => {
            if (t.type === 'expense') {
                const day = t.date.toISOString().split('T')[0];
                acc.set(day, (acc.get(day) || 0) + t.amount);
            }
            return acc;
        }, new Map<string, number>());

        const largestSpendingDay = [...expensesByDay.entries()].sort((a, b) => b[1] - a[1])[0];
        
        const currentCategoryTotals = transactions.reduce((acc, t) => {
            if (t.type === 'expense') {
                acc.set(t.category, (acc.get(t.category) || 0) + t.amount);
            }
            return acc;
        }, new Map<string, number>());
        
        // --- Historical calculations ---
        const monthlyTotals = allTransactions.reduce((acc, t) => {
             if (t.type === 'expense') {
                const month = getMonthString(t.date);
                acc.set(month, (acc.get(month) || 0) + t.amount);
            }
            return acc;
        }, new Map<string, number>());

        const [year, month] = selectedMonth.split('-').map(Number);
        const prevMonthDate = new Date(year, month - 2, 1);
        const prevMonthString = getMonthString(prevMonthDate);
        const prevMonthExpenses = monthlyTotals.get(prevMonthString) || 0;
        
        const averageMonthlySpending = monthlyTotals.size > 0 
            ? [...monthlyTotals.values()].reduce((sum, val) => sum + val, 0) / monthlyTotals.size
            : 0;

        const prevMonthCategoryTotals = allTransactions.reduce((acc, t) => {
            if (t.type === 'expense' && getMonthString(t.date) === prevMonthString) {
                acc.set(t.category, (acc.get(t.category) || 0) + t.amount);
            }
            return acc;
        }, new Map<string, number>());

        let topGrowingCategory = { name: 'N/A', growth: 0 };
        let maxGrowth = -Infinity;

        currentCategoryTotals.forEach((currentAmount, category) => {
            const prevAmount = prevMonthCategoryTotals.get(category) || 0;
            if (prevAmount > 0) {
                const growth = ((currentAmount - prevAmount) / prevAmount) * 100;
                if (growth > maxGrowth) {
                    maxGrowth = growth;
                    topGrowingCategory = { name: category, growth };
                }
            } else if (currentAmount > 0 && maxGrowth < Infinity) { // New spending category
                 maxGrowth = Infinity;
                 topGrowingCategory = { name: category, growth: Infinity };
            }
        });
        
        return {
            vsPrevMonth: prevMonthExpenses > 0 ? ((currentMonthExpenses - prevMonthExpenses) / prevMonthExpenses) * 100 : 0,
            vsAverage: averageMonthlySpending > 0 ? ((currentMonthExpenses - averageMonthlySpending) / averageMonthlySpending) * 100 : 0,
            largestSpendingDay: {
                date: largestSpendingDay ? new Date(largestSpendingDay[0]).toLocaleDateString(undefined, { timeZone: 'UTC' }) : 'N/A',
                amount: largestSpendingDay ? largestSpendingDay[1] : 0,
            },
            topGrowingCategory,
        };
    }, [transactions, allTransactions, selectedMonth]);

    const handleFetchAnomalies = async () => {
        setIsLoadingAnomalies(true);
        setErrorAnomalies(null);
        setAnomalies(null);
        try {
            const result = await getSpendingAnomalies(transactions);
            setAnomalies(result);
        } catch (err) {
            setErrorAnomalies(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoadingAnomalies(false);
        }
    };
    
    if (!trends) {
        return (
            <div>
                 <h3 className="text-xl font-semibold text-text-primary mb-4">Spending Trends & Insights</h3>
                 <p className="text-text-secondary">Select a specific month to view spending trends.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-text-primary">Spending Trends & Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <InsightItem title="vs. Last Month" value={trends.vsPrevMonth !== 0 ? `${Math.abs(trends.vsPrevMonth).toFixed(1)}%` : 'No Change'} change={trends.vsPrevMonth} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
                <InsightItem title="vs. Monthly Avg" value={trends.vsAverage !== 0 ? `${Math.abs(trends.vsAverage).toFixed(1)}%` : 'On Avg'} change={trends.vsAverage} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} />
                <InsightItem title="Top Growing Category" value={trends.topGrowingCategory.name} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>} />
                <InsightItem title="Largest Spend Day" value={`$${trends.largestSpendingDay.amount.toFixed(2)}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>} />
            </div>

            <div>
                <h4 className="text-lg font-semibold text-text-primary mb-2">AI Anomaly Detection</h4>
                 {errorAnomalies && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{errorAnomalies}</div>}
                {isLoadingAnomalies ? (
                    <div className="flex items-center space-x-2 text-text-secondary"><div className="w-5 h-5 border-2 border-t-transparent border-primary rounded-full animate-spin"></div><span>Analyzing transactions...</span></div>
                ) : anomalies ? (
                    anomalies.length > 0 ? (
                        <ul className="space-y-2">
                           {anomalies.map((anomaly, index) => (
                                <li key={index} className="p-3 bg-white/50 rounded-lg">
                                    <p className="font-semibold text-sm text-text-primary">{anomaly.description}</p>
                                    <p className="text-xs text-text-secondary mt-1">{anomaly.justification}</p>
                                </li>
                           ))}
                        </ul>
                    ) : (
                        <p className="text-text-secondary">No significant anomalies detected in this period's transactions.</p>
                    )
                ) : (
                    <button onClick={handleFetchAnomalies} className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-semibold">Analyze for Anomalies</button>
                )}
            </div>
        </div>
    );
};

export default SpendingTrends;