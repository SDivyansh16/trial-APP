import React, { useState } from 'react';
import { FinancialSummary, Transaction, FinancialHealthReport as Report } from '../types';
import { getFinancialHealthReport } from '../services/geminiService';

interface FinancialHealthReportProps {
    summary: FinancialSummary;
    transactions: Transaction[];
}

const LoadingState: React.FC = () => {
    const messages = [
        "Analyzing your spending patterns...",
        "Comparing income vs. expenses...",
        "Identifying financial habits...",
        "Crafting personalized recommendations...",
        "Finalizing your report...",
    ];
    const [message, setMessage] = useState(messages[0]);
    
    React.useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            index = (index + 1) % messages.length;
            setMessage(messages[index]);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center bg-white/50 rounded-2xl">
            <div className="w-10 h-10 border-4 border-t-transparent border-primary rounded-full animate-spin"></div>
            <p className="text-text-primary font-semibold text-lg">Generating Your Report</p>
            <p className="text-text-secondary">{message}</p>
        </div>
    );
};

const ScoreGauge: React.FC<{ score: number }> = ({ score }) => {
    const getScoreColor = (s: number) => {
        if (s < 40) return '#ef4444'; // red-500
        if (s < 70) return '#f59e0b'; // amber-500
        return '#22c55e'; // green-500
    };
    const color = getScoreColor(score);
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="relative w-40 h-40">
            <svg className="transform -rotate-90" width="100%" height="100%" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" stroke="#e5e7eb" strokeWidth="10" fill="transparent" />
                <circle
                    cx="50" cy="50" r="45"
                    stroke={color}
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold" style={{ color }}>{score}</span>
                <span className="text-sm font-semibold text-text-secondary">/ 100</span>
            </div>
        </div>
    );
};

const FinancialHealthReport: React.FC<FinancialHealthReportProps> = ({ summary, transactions }) => {
    const [report, setReport] = useState<Report | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateReport = async () => {
        setIsLoading(true);
        setError(null);
        setReport(null);
        try {
            const result = await getFinancialHealthReport(transactions, summary);
            setReport(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred while generating the report.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/20"><LoadingState /></div>;
    }
    
    if (error) {
        return (
            <div className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/20 text-center">
                <p className="text-red-500 font-semibold mb-4">{error}</p>
                <button onClick={handleGenerateReport} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-focus transition-colors font-semibold">Try Again</button>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="bg-white/60 backdrop-blur-xl p-8 rounded-2xl shadow-lg border border-white/20 text-center">
                <h3 className="text-2xl font-bold text-text-primary mb-2">AI Financial Health Report</h3>
                <p className="text-text-secondary mb-6 max-w-2xl mx-auto">Get a personalized analysis of your financial health, including a wellness score, key observations, and actionable recommendations based on your data.</p>
                <button onClick={handleGenerateReport} className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-xl hover:scale-105 transition-all font-semibold text-lg">
                    Generate My Report
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/20">
            <h3 className="text-2xl font-bold text-text-primary mb-6 text-center">Your Financial Health Report</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                <div className="flex flex-col items-center justify-center md:col-span-1">
                    <ScoreGauge score={report.healthScore} />
                    <p className="text-center text-text-secondary mt-4 text-sm italic">{report.scoreJustification}</p>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <div>
                        <h4 className="font-semibold text-lg text-text-primary mb-2">Key Observations</h4>
                        <ul className="space-y-3">
                            {report.keyObservations.map((item, index) => (
                                <li key={index} className="flex items-start space-x-3">
                                    <div className={`flex-shrink-0 mt-1 h-5 w-5 rounded-full flex items-center justify-center ${item.type === 'positive' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {item.type === 'positive' ? '✓' : '!'}
                                    </div>
                                    <p className="text-sm text-text-secondary">{item.observation}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold text-lg text-text-primary mb-2">Top Recommendations</h4>
                        <ul className="space-y-3">
                            {report.recommendations.map((item, index) => (
                                <li key={index} className="p-3 bg-primary/5 rounded-lg">
                                    <p className="font-semibold text-sm text-primary">{item.title}</p>
                                    <p className="text-sm text-text-secondary mt-1">{item.recommendation}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
             <div className="text-center mt-8">
                <button onClick={handleGenerateReport} className="px-6 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors font-semibold text-sm">Regenerate Report</button>
            </div>
        </div>
    );
};

export default FinancialHealthReport;
