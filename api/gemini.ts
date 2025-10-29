// This file represents a server-side function.
// In a real deployment (e.g., Vercel, Netlify, Cloud Functions), this file
// would be automatically deployed as a serverless API endpoint accessible at `/api/gemini`.
// The environment running this code would have the API_KEY set as an environment variable.

import { GoogleGenAI, Type } from "@google/genai";
import { FinancialSummary, Transaction, Prediction, FinancialTip, ScenarioResult, SpendingAnomaly, CreditAdvice } from "../types";

/**
 * Extracts a JSON object from a string that might be wrapped in markdown or have surrounding text.
 * @param text The text to parse.
 * @returns The parsed JSON object.
 */
function extractJsonFromMarkdown(text: string): any {
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = text.match(jsonRegex);

    let jsonString = text.trim();

    if (match && match[1]) {
        jsonString = match[1];
    } else {
        // Fallback: find the first '{' or '[' and the last '}' or ']'
        const firstBracket = jsonString.indexOf('{');
        const firstSquare = jsonString.indexOf('[');
        let startIndex = -1;

        if (firstBracket === -1 && firstSquare === -1) {
            throw new Error("No JSON object or array found in the AI response.");
        }

        if (firstBracket === -1) {
            startIndex = firstSquare;
        } else if (firstSquare === -1) {
            startIndex = firstBracket;
        } else {
            startIndex = Math.min(firstBracket, firstSquare);
        }
        
        const lastBracket = jsonString.lastIndexOf('}');
        const lastSquare = jsonString.lastIndexOf(']');
        let endIndex = -1;
        
        if (lastBracket === -1 && lastSquare === -1) {
             throw new Error("No closing bracket for JSON object or array found.");
        }
        
        endIndex = Math.max(lastBracket, lastSquare);
        
        jsonString = jsonString.substring(startIndex, endIndex + 1);
    }

    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("Failed to parse JSON string after extraction:", jsonString);
        throw new Error("Failed to parse JSON response from AI. The format was invalid.");
    }
}


// MOCK SERVER HANDLER: This function simulates a generic serverless function handler.
// It's designed to be platform-agnostic.
// @ts-ignore
export default async function handler(req) {
    // In a real environment, you'd get the method and body from a Request object.
    const { method, body } = req;
    
    if (method !== 'POST') {
        // In a real environment, you'd return a Response object.
        return { status: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    try {
        // Initialize AI client inside the handler for robustness.
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            throw new Error("The API_KEY environment variable is not set on the server.");
        }
        const ai = new GoogleGenAI({ apiKey });

        const { task, payload } = body;
        let result;

        console.log(`Received task: ${task}`);

        switch (task) {
            case 'getFinancialTips':
                result = await getFinancialTips(ai, payload.summary);
                break;
            case 'predictNextMonthExpenses':
                // For date objects to be revived correctly from JSON
                payload.transactions.forEach((t: Transaction) => t.date = new Date(t.date));
                result = await predictNextMonthExpenses(ai, payload.transactions, payload.monthsToPredict);
                break;
            case 'simulateScenario':
                result = await simulateScenario(ai, payload.summary, payload.incomeChange, payload.expenseChanges);
                break;
            case 'categorizeTransactions':
                result = await categorizeTransactions(ai, payload.transactions, payload.categories);
                break;
            case 'getSpendingAnomalies':
                 payload.transactions.forEach((t: Transaction) => t.date = new Date(t.date));
                result = await getSpendingAnomalies(ai, payload.transactions);
                break;
            case 'getCreditScoreAdvice':
                result = await getCreditScoreAdvice(ai, payload.score, payload.summary);
                break;
            default:
                throw new Error(`Unknown task: ${task}`);
        }
        
        return { status: 200, body: JSON.stringify(result) };

    } catch (error) {
        console.error(`Error in API handler for task:`, error);
        return { status: 500, body: JSON.stringify({ error: error instanceof Error ? error.message : 'An internal server error occurred.' }) };
    }
}


// --- SERVER-SIDE GEMINI FUNCTIONS ---

const getFinancialTips = async (ai: GoogleGenAI, summary: FinancialSummary): Promise<FinancialTip[]> => {
    const topCategories = summary.expensesByCategory
        .slice(0, 5)
        .map(c => `${c.name}: $${c.value.toFixed(2)}`)
        .join(', ');

    const prompt = `
        Analyze the following financial summary and provide 3 to 5 actionable, personalized, and encouraging financial tips.
        For each tip, provide a short, clear title and a slightly longer explanation.

        Financial Summary:
        - Total Income: $${summary.totalIncome.toFixed(2)}
        - Total Expenses: $${summary.totalExpenses.toFixed(2)}
        - Net Savings: $${summary.netSavings.toFixed(2)}
        - Top 5 Spending Categories: ${topCategories}

        Based on this, generate the financial tips.
    `;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        explanation: { type: Type.STRING }
                    }
                }
            }
        }
    });
    
    return extractJsonFromMarkdown(response.text) as FinancialTip[];
};

const predictNextMonthExpenses = async (ai: GoogleGenAI, transactions: Transaction[], monthsToPredict: number): Promise<Prediction[]> => {
    // 1. Pre-process data
    const monthlySpending: { [month: string]: { [category: string]: number } } = {};
    const categoryTotals: { [category: string]: number } = {};
    const monthCounts: { [category: string]: number } = {};

    transactions.forEach(t => {
        if (t.type === 'expense') {
            const month = t.date.toISOString().slice(0, 7); // YYYY-MM
            if (!monthlySpending[month]) {
                monthlySpending[month] = {};
            }
            if (!monthlySpending[month][t.category]) {
                monthlySpending[month][t.category] = 0;
            }
            monthlySpending[month][t.category] += t.amount;
        }
    });

    const sortedMonths = Object.keys(monthlySpending).sort();

    for (const month of sortedMonths) {
        for (const category in monthlySpending[month]) {
            if (!categoryTotals[category]) {
                categoryTotals[category] = 0;
                monthCounts[category] = 0;
            }
            categoryTotals[category] += monthlySpending[month][category];
            monthCounts[category]++;
        }
    }

    const categoryAverages: { [category: string]: number } = {};
    for (const category in categoryTotals) {
        categoryAverages[category] = categoryTotals[category] / monthCounts[category];
    }
    
    const lastMonthData = sortedMonths.length > 0 ? monthlySpending[sortedMonths[sortedMonths.length - 1]] : {};

    const summaryForAI = {
        categoryAverages,
        lastMonthSpending: lastMonthData,
        overallMonthlyAverage: Object.values(categoryAverages).reduce((sum, avg) => sum + avg, 0),
        monthsOfHistory: sortedMonths.length
    };
    
    const prompt = `
        Act as a financial analyst. Based on the provided summary of historical spending data, predict the total expenses for the next ${monthsToPredict} month(s).
        The user wants a monthly breakdown. For each month, predict the total expenses and a breakdown for the top spending categories.
        
        Historical Data Summary:
        - Average Monthly Spending per Category: ${JSON.stringify(summaryForAI.categoryAverages)}
        - Last Month's Spending per Category: ${JSON.stringify(summaryForAI.lastMonthSpending)}
        - Overall Average Monthly Expense: $${summaryForAI.overallMonthlyAverage.toFixed(2)}
        - Total Months of Data: ${summaryForAI.monthsOfHistory}
        
        Consider recent trends (differences between last month and the average) when making your prediction.
        For the 'month' field in your response, use relative terms like "Next Month", "In 2 Months", etc.
    `;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        month: { type: Type.STRING },
                        totalPredictedExpenses: { type: Type.NUMBER },
                        categoryPredictions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    category: { type: Type.STRING },
                                    predictedAmount: { type: Type.NUMBER }
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    
    return extractJsonFromMarkdown(response.text) as Prediction[];
};

const simulateScenario = async (
    ai: GoogleGenAI,
    summary: FinancialSummary,
    incomeChange: number,
    expenseChanges: { category: string; amount: number }[]
): Promise<ScenarioResult> => {
    const expenseChangeText = expenseChanges.length > 0 
        ? expenseChanges.map(c => `${c.category}: ${c.amount > 0 ? '+' : ''}$${c.amount.toFixed(2)}`).join(', ')
        : 'No change in expenses.';

    const prompt = `
        Analyze a "what-if" financial scenario.
        Current Monthly Financial Summary:
        - Total Income: $${summary.totalIncome.toFixed(2)}
        - Total Expenses: $${summary.totalExpenses.toFixed(2)}
        - Net Savings: $${summary.netSavings.toFixed(2)}
        Proposed Hypothetical Changes:
        - Change in Income: ${incomeChange >= 0 ? '+' : ''}$${incomeChange.toFixed(2)}
        - Changes in Expenses: ${expenseChangeText}
        Based on these changes:
        1. Calculate the new predicted monthly savings.
        2. Write a brief impact analysis.
        3. Provide concise, actionable recommendations as a string with bullet points (e.g., using '\\n- ').
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    newMonthlySavings: { type: Type.NUMBER },
                    impactAnalysis: { type: Type.STRING },
                    recommendations: { type: Type.STRING }
                },
                required: ['newMonthlySavings', 'impactAnalysis', 'recommendations']
            }
        }
    });

    return extractJsonFromMarkdown(response.text) as ScenarioResult;
};

const categorizeTransactions = async (
    ai: GoogleGenAI,
    transactions: { id: string, description: string }[],
    categories: string[]
): Promise<Record<string, { category: string, confidence: 'high' | 'medium' | 'low' }>> => {
    if (transactions.length === 0) return {};
    const prompt = `
        Given a list of transactions and available expense categories, categorize each transaction.
        Only use categories from this list: ${JSON.stringify(categories.filter(c => c !== 'Uncategorized'))}.
        If no category fits well, use "Uncategorized".
        Transactions: ${JSON.stringify(transactions)}
        Return a single JSON object where keys are transaction IDs. Each value must be an object with 'category' (string) and 'confidence' ('high', 'medium', or 'low').
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {},
                description: "An object mapping transaction IDs to an object containing 'category' and 'confidence'."
            }
        }
    });

    return extractJsonFromMarkdown(response.text) as Record<string, { category: string, confidence: 'high' | 'medium' | 'low' }>;
};

const getSpendingAnomalies = async (ai: GoogleGenAI, transactions: Transaction[]): Promise<SpendingAnomaly[]> => {
    if (transactions.length < 5) return [];

    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const totalSpending = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    const averageTransactionAmount = totalSpending / expenseTransactions.length;
    const sortedExpenses = [...expenseTransactions].sort((a, b) => b.amount - a.amount);
    const largestTransactions = sortedExpenses.slice(0, 3).map(t => ({ description: t.description, amount: t.amount, category: t.category }));
    
    const summaryForAI = {
        totalTransactions: expenseTransactions.length,
        totalSpending: totalSpending,
        averageTransactionAmount: averageTransactionAmount,
        largestTransactions: largestTransactions,
    };

    const prompt = `
        Act as a financial data analyst. Review the following summary of transactions for a specific period and identify up to 3 potential anomalies.
        An anomaly could be an unusually large purchase compared to the average, a transaction that seems out of place, or a pattern that deviates from the norm.
        For each anomaly you identify, provide a concise 'description' of the transaction and a 'justification' explaining why it's considered an anomaly based on the summary data provided.
        If no significant anomalies are found, return an empty array.

        Transaction Summary:
        - Total Expense Transactions: ${summaryForAI.totalTransactions}
        - Total Spending: $${summaryForAI.totalSpending.toFixed(2)}
        - Average Transaction Amount: $${summaryForAI.averageTransactionAmount.toFixed(2)}
        - Top 3 Largest Transactions: ${JSON.stringify(summaryForAI.largestTransactions)}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        description: { type: Type.STRING },
                        justification: { type: Type.STRING }
                    },
                    required: ["description", "justification"]
                }
            }
        }
    });

    return extractJsonFromMarkdown(response.text) as SpendingAnomaly[];
};

const getCreditScoreAdvice = async (ai: GoogleGenAI, score: number, summary: FinancialSummary): Promise<CreditAdvice> => {
    const prompt = `
        A user has a credit score of ${score} and this financial summary:
        - Monthly Income: $${summary.totalIncome.toFixed(2)}
        - Monthly Expenses: $${summary.totalExpenses.toFixed(2)}
        - Total Debt: $${summary.totalDebt.toFixed(2)}
        Act as a financial advisor. Based on BOTH the score and summary, provide:
        1. A brief, one-sentence 'summary' classifying the score (e.g., Excellent, Good, Fair, Poor).
        2. A list of 3-4 actionable 'tips' to improve or maintain the score, personalized to their income/debt. Each tip should have a 'title' and 'explanation'.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    summary: { type: Type.STRING },
                    tips: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                explanation: { type: Type.STRING }
                            },
                            required: ["title", "explanation"]
                        }
                    }
                },
                required: ["summary", "tips"]
            }
        }
    });

    return extractJsonFromMarkdown(response.text) as CreditAdvice;
};
