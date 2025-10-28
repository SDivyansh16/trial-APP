import React, { useState, useMemo } from 'react';
import { CreditAdvice, FinancialSummary } from '../types';
import { getCreditScoreAdvice } from '../services/geminiService';

interface CreditScoreMonitorProps {
    creditScore: number | null;
    summary: FinancialSummary;
    onUpdateCreditScore: (score: number) => void;
}

const getScoreCategory = (score: number | null) => {
    if (score === null) return { name: 'Unknown', color: 'text-gray-500', bg: 'bg-gray-200', stroke: '#d1d5db' };
    if (score < 580) return { name: 'Poor', color: 'text-red-600', bg: 'bg-red-100', stroke: '#ef4444' };
    if (score < 670) return { name: 'Fair', color: 'text-orange-600', bg: 'bg-orange-100', stroke: '#f97316' };
    if (score < 740) return { name: 'Good', color: 'text-yellow-600', bg: 'bg-yellow-100', stroke: '#f59e0b' };
    if (score < 800) return { name: 'Very Good', color: 'text-green-600', bg: 'bg-green-100', stroke: '#10b981' };
    return { name: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-100', stroke: '#059669' };
};

const CreditScoreMonitor: React.FC<CreditScoreMonitorProps> = ({ creditScore, summary, onUpdateCreditScore }) => {
    const [scoreInput, setScoreInput] = useState(creditScore?.toString() || '');
    const [isEditing, setIsEditing] = useState(false);
    const [advice, setAdvice] = useState<CreditAdvice | null>(null);
    const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const scoreInfo = useMemo(() => getScoreCategory(creditScore), [creditScore]);

    const handleSaveScore = (e: React.FormEvent) => {
        e.preventDefault();
        const score = parseInt(scoreInput, 10);
        if (score >= 300 && score <= 850) {
            onUpdateCreditScore(score);
            setIsEditing(false);
            setError(null);
        } else {
            setError('Please enter a valid credit score between 300 and 850.');
        }
    };

    const handleGetAdvice = async () => {
        if (creditScore === null) return;
        setIsLoadingAdvice(true);
        setAdvice(null);
        setError(null);
        try {
            const result = await getCreditScoreAdvice(creditScore, summary);
            setAdvice(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoadingAdvice(false);
        }
    };

    const circumference = 2 * Math.PI * 45;
    const scorePercentage = creditScore ? ((creditScore - 300) / 550) : 0;
    const strokeDashoffset = circumference - scorePercentage * circumference;

    if (creditScore === null && !isEditing) {
        return (
            <div className="flex flex-col h-full w-full justify-center items-center text-center">
                <h3 className="text-xl font-semibold mb-4 text-text-primary">Credit Score Monitor</h3>
                <p className="text-text-secondary mb-4">Enter your credit score to get personalized insights and tips.</p>
                <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold">
                    Add Credit Score
                </button>
            </div>
        );
    }
    
    if (isEditing) {
        return (
             <div className="flex flex-col h-full w-full justify-center">
                 <h3 className="text-xl font-semibold mb-4 text-text-primary text-center">Update Credit Score</h3>
                 <form onSubmit={handleSaveScore} className="space-y-4">
                     <input
                        type="number"
                        value={scoreInput}
                        onChange={e => setScoreInput(e.target.value)}
                        required
                        min="300" max="850"
                        placeholder="e.g., 720"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                    />
                    {error && <p className="text-red-500 text-xs">{error}</p>}
                    <div className="flex justify-center space-x-3">
                        <button type="button" onClick={() => {setIsEditing(false); setError(null);}} className="px-4 py-2 bg-gray-200 text-text-secondary rounded-lg hover:bg-gray-300 transition-colors font-semibold">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold">Save</button>
                    </div>
                 </form>
            </div>
        );
    }

    return (
        <div className="w-full">
            <h3 className="text-xl font-semibold mb-4 text-text-primary">Credit Score Monitor</h3>
            <div className="flex flex-col items-center space-y-4">
                <div className="relative w-40 h-40">
                    <svg className="transform -rotate-90" width="100%" height="100%" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" stroke="#e5e7eb" strokeWidth="10" fill="transparent" />
                        <circle
                            cx="50" cy="50" r="45"
                            stroke={scoreInfo.stroke}
                            strokeWidth="10"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-text-primary">{creditScore}</span>
                        <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${scoreInfo.bg} ${scoreInfo.color}`}>{scoreInfo.name}</span>
                    </div>
                </div>
                 <button onClick={() => setIsEditing(true)} className="text-sm font-semibold text-primary hover:underline">Update Score</button>
            </div>
            
            <div className="mt-6">
                {isLoadingAdvice ? (
                     <div className="flex items-center justify-center space-x-2 text-text-secondary"><div className="w-5 h-5 border-2 border-t-transparent border-primary rounded-full animate-spin"></div><span>Getting Advice...</span></div>
                ) : advice ? (
                    <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                        <p className="text-sm text-text-secondary italic"><strong>AI Summary:</strong> {advice.summary}</p>
                        <ul className="space-y-2">
                            {advice.tips.map((tip, index) => (
                                <li key={index} className="text-xs border-l-2 pl-2 border-indigo-200">
                                    <p className="font-semibold text-text-primary">{tip.title}</p>
                                    <p className="text-text-secondary">{tip.explanation}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <button onClick={handleGetAdvice} className="w-full bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-600 transition-colors">Get AI Improvement Tips</button>
                )}
                 {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            </div>
        </div>
    );
};

export default CreditScoreMonitor;
