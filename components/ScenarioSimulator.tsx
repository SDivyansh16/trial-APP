import React, { useState } from 'react';
import { FinancialSummary, ScenarioResult } from '../types';
import { simulateScenario } from '../services/geminiService';

interface ScenarioSimulatorProps {
    summary: FinancialSummary;
    categories: string[];
}

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center space-x-2">
        <div className="w-5 h-5 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
        <span className="text-text-secondary">Simulating...</span>
    </div>
);

const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({ summary, categories }) => {
    const [incomeChange, setIncomeChange] = useState<number>(0);
    const [expenseCategory, setExpenseCategory] = useState<string>(categories[0] || '');
    const [expenseAmount, setExpenseAmount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<ScenarioResult | null>(null);
    
    const expenseCategories = categories.filter(c => c !== 'Uncategorized' && c !== 'Savings Goal');

    const handleSimulate = async () => {
        setIsLoading(true);
        setError(null);
        setResult(null);

        const expenseChanges = expenseAmount !== 0 ? [{ category: expenseCategory, amount: expenseAmount }] : [];

        try {
            const simulationResult = await simulateScenario(summary, incomeChange, expenseChanges);
            setResult(simulationResult);
        } catch (err) {
             setError(err instanceof Error ? err.message : 'An unknown error occurred during simulation.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="space-y-4">
             {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="incomeChange" className="block text-sm font-medium text-text-secondary">Monthly Income Change</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                         <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                            <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                            type="number"
                            name="incomeChange"
                            id="incomeChange"
                            className="bg-gray-50 border border-gray-300 text-gray-900 focus:ring-primary focus:border-primary block w-full pl-7 pr-12 sm:text-sm rounded-md py-2"
                            placeholder="0.00"
                            value={incomeChange}
                            onChange={(e) => setIncomeChange(parseFloat(e.target.value) || 0)}
                        />
                    </div>
                </div>
                 <div>
                    <label htmlFor="expenseAmount" className="block text-sm font-medium text-text-secondary">Monthly Expense Change</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                         <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                            <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                            type="number"
                            name="expenseAmount"
                            id="expenseAmount"
                            className="bg-gray-50 border border-gray-300 text-gray-900 focus:ring-primary focus:border-primary block w-full pl-7 pr-12 sm:text-sm rounded-md py-2"
                            placeholder="0.00"
                            value={expenseAmount}
                            onChange={(e) => setExpenseAmount(parseFloat(e.target.value) || 0)}
                        />
                    </div>
                </div>
                 <div className="sm:col-span-2">
                     <label htmlFor="expenseCategory" className="block text-sm font-medium text-text-secondary">For Category</label>
                    <select
                        id="expenseCategory"
                        name="expenseCategory"
                        value={expenseCategory}
                        onChange={(e) => setExpenseCategory(e.target.value)}
                        className="mt-1 block w-full bg-gray-50 border border-gray-300 text-gray-900 py-2 px-3 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    >
                        {expenseCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
            </div>

            <button
                onClick={handleSimulate}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Simulating...' : 'Run Simulation'}
            </button>
            
            {isLoading && <div className="pt-4"><LoadingSpinner /></div>}
            
            {result && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    <h5 className="font-bold text-md text-text-primary">Simulation Results:</h5>
                    <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-blue-800">New Predicted Monthly Savings</p>
                        <p className={`text-xl font-bold ${result.newMonthlySavings >= 0 ? 'text-blue-900' : 'text-red-600'}`}>
                            ${result.newMonthlySavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div>
                         <h6 className="font-semibold text-sm text-text-primary">Impact Analysis</h6>
                         <p className="text-sm text-text-secondary">{result.impactAnalysis}</p>
                    </div>
                     <div>
                         <h6 className="font-semibold text-sm text-text-primary">Recommendations</h6>
                         <p className="text-sm text-text-secondary whitespace-pre-wrap">{result.recommendations}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScenarioSimulator;
