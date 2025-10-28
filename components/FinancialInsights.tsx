import React, { useState } from 'react';
import { FinancialSummary, Transaction, Prediction, FinancialTip } from '../types';
import { getFinancialTips, predictNextMonthExpenses } from '../services/geminiService';
import ScenarioSimulator from './ScenarioSimulator';

interface FinancialInsightsProps {
    summary: FinancialSummary;
    transactions: Transaction[];
    categories: string[];
}

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center space-x-2">
        <div className="w-5 h-5 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
        <span className="text-text-secondary">Generating Insights...</span>
    </div>
);

const InsightCard: React.FC<{ title: string; icon: React.ReactElement; children: React.ReactNode; }> = ({ title, icon, children }) => (
     <div className="bg-surface backdrop-blur-xl p-6 rounded-2xl shadow-lg h-full flex flex-col border border-border-color">
        <div className="flex items-center space-x-3 mb-4">
            {icon}
            <h4 className="text-lg font-semibold text-text-primary">{title}</h4>
        </div>
        <div className="flex-grow">{children}</div>
    </div>
);


const FinancialInsights: React.FC<FinancialInsightsProps> = ({ summary, transactions, categories }) => {
    const [tips, setTips] = useState<FinancialTip[] | null>(null);
    const [prediction, setPrediction] = useState<Prediction[] | null>(null);
    const [isLoadingTips, setIsLoadingTips] = useState(false);
    const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [predictionMonths, setPredictionMonths] = useState(1);

    const handleGetTips = async () => {
        setIsLoadingTips(true);
        setError(null);
        setTips(null);
        try {
            const result = await getFinancialTips(summary);
            setTips(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoadingTips(false);
        }
    };

    const handlePredictExpenses = async () => {
        setIsLoadingPrediction(true);
        setError(null);
        setPrediction(null);
        try {
            const result = await predictNextMonthExpenses(transactions, predictionMonths);
            setPrediction(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoadingPrediction(false);
        }
    };

    return (
        <div>
             <h3 className="text-xl font-semibold mb-4 text-text-primary">AI-Powered Insights</h3>
             {error && <div className="mb-4 p-3 bg-red-900/50 text-red-300 rounded-lg border border-red-500/50">{error}</div>}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                 <InsightCard title="Financial Tips" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}>
                     {isLoadingTips ? <LoadingSpinner /> : (
                         tips ? (
                            <ul className="space-y-4 max-h-56 overflow-y-auto pr-2">
                               {tips.map((tip, index) => (
                                   <li key={index} className="flex items-start space-x-3">
                                       <div className="flex-shrink-0 pt-1">
                                           <svg className="h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                               <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                           </svg>
                                       </div>
                                       <div>
                                           <h5 className="font-semibold text-sm text-text-primary">{tip.title}</h5>
                                           <p className="text-sm text-text-secondary">{tip.explanation}</p>
                                       </div>
                                   </li>
                               ))}
                           </ul>
                         ) : <button onClick={handleGetTips} className="w-full bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-focus transition-colors">Generate Tips</button>
                     )}
                 </InsightCard>
                <InsightCard title="Expense Prediction" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}>
                    {isLoadingPrediction ? <LoadingSpinner /> : (
                        prediction ? (
                            <div className="space-y-4 max-h-56 overflow-y-auto pr-2">
                                {prediction.map((p, index) => (
                                    <div key={index}>
                                        <p className="text-md font-bold text-text-primary">{p.month}: ${p.totalPredictedExpenses.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                                        <ul className="mt-1 space-y-1 text-sm text-text-secondary pl-2">
                                            {p.categoryPredictions.slice(0, 3).map(pred => (
                                                <li key={pred.category}>- {pred.category}: ${pred.predictedAmount.toFixed(2)}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        ) : (
                             <div className="flex flex-col items-center justify-center space-y-4 h-full">
                                <div className="text-sm font-medium text-text-secondary">Select prediction period:</div>
                                <div className="flex space-x-2">
                                    {[1, 2, 3].map(months => (
                                        <button 
                                            key={months}
                                            onClick={() => setPredictionMonths(months)}
                                            className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors ${predictionMonths === months ? 'bg-secondary text-white' : 'bg-gray-700 text-text-secondary hover:bg-gray-600'}`}
                                        >
                                            {months} Month{months > 1 ? 's' : ''}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={handlePredictExpenses} className="w-full bg-secondary text-white font-semibold py-2 px-4 rounded-lg hover:bg-secondary-focus transition-colors mt-auto">
                                    Predict Next {predictionMonths} Month{predictionMonths > 1 ? 's' : ''}
                                </button>
                            </div>
                        )
                    )}
                 </InsightCard>
             </div>
             <div className="grid grid-cols-1 gap-6">
                 <InsightCard title="What-If Scenario Simulator" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}>
                    <ScenarioSimulator summary={summary} categories={categories} />
                 </InsightCard>
             </div>
        </div>
    );
};

export default FinancialInsights;