import { FinancialSummary, Transaction, Prediction, FinancialTip, ScenarioResult, SpendingAnomaly, CreditAdvice } from "../types";

// Helper function to call our secure backend API
async function callApi<T>(task: string, payload: object): Promise<T> {
    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ task, payload }),
        });

        const data = await response.json();

        if (!response.ok) {
            // Use the error message from the server if available
            throw new Error(data.error || `API call for task '${task}' failed with status ${response.status}`);
        }

        return data as T;
    } catch (error) {
        console.error(`Error calling API for task '${task}':`, error);
        // Re-throw the error so the component can catch it and display a message
        throw error;
    }
}


export const getFinancialTips = async (summary: FinancialSummary): Promise<FinancialTip[]> => {
    return callApi<FinancialTip[]>('getFinancialTips', { summary });
};

export const predictNextMonthExpenses = async (transactions: Transaction[], monthsToPredict: number): Promise<Prediction[]> => {
    return callApi<Prediction[]>('predictNextMonthExpenses', { transactions, monthsToPredict });
};

export const simulateScenario = async (
    summary: FinancialSummary,
    incomeChange: number,
    expenseChanges: { category: string; amount: number }[]
): Promise<ScenarioResult> => {
    return callApi<ScenarioResult>('simulateScenario', { summary, incomeChange, expenseChanges });
};

export const categorizeTransactions = async (
    transactions: { id: string, description: string }[],
    categories: string[]
): Promise<Record<string, { category: string, confidence: 'high' | 'medium' | 'low' }>> => {
    return callApi<Record<string, { category: string, confidence: 'high' | 'medium' | 'low' }>>('categorizeTransactions', { transactions, categories });
};

export const getSpendingAnomalies = async (transactions: Transaction[]): Promise<SpendingAnomaly[]> => {
    return callApi<SpendingAnomaly[]>('getSpendingAnomalies', { transactions });
};

export const getCreditScoreAdvice = async (score: number, summary: FinancialSummary): Promise<CreditAdvice> => {
    return callApi<CreditAdvice>('getCreditScoreAdvice', { score, summary });
};
