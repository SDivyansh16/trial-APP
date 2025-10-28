// This file represents a server-side function.
// In a real deployment (e.g., Vercel, Netlify, Cloud Functions), this file
// would be automatically deployed as a serverless API endpoint accessible at `/api/gemini`.
// The environment running this code would have the API_KEY set as an environment variable.

import { GoogleGenAI, Type } from "@google/genai";
import { FinancialSummary, Transaction, Prediction, FinancialTip, ScenarioResult, SpendingAnomaly, CreditAdvice } from "../types";

// This is a server-side file. The API key is securely accessed here from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

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
        // const { task, payload } = await body.json(); // For real Request objects
        const { task, payload } = body; // For this simulated environment
        let result;

        console.log(`Received task: ${task}`);

        switch (task) {
            case 'getFinancialTips':
                result = await getFinancialTips(payload.summary);
                break;
            case 'predictNextMonthExpenses':
                // For date objects to be revived correctly from JSON
                payload.transactions.forEach((t: Transaction) => t.date = new Date(t.date));
                result = await predictNextMonthExpenses(payload.transactions, payload.monthsToPredict);
                break;
            case 'simulateScenario':
                result = await simulateScenario(payload.summary, payload.incomeChange, payload.expenseChanges);
                break;
            case 'categorizeTransactions':
                result = await categorizeTransactions(payload.transactions, payload.categories);
                break;
            case 'getSpendingAnomalies':
                 payload.transactions.forEach((t: Transaction) => t.date = new Date(t.date));
                result = await getSpendingAnomalies(payload.transactions);
                break;
            case 'getCreditScoreAdvice':
                result = await getCreditScoreAdvice(payload.score, payload.summary);
                break;
            default:
                throw new Error(`Unknown task: ${task}`);
        }
        
        // This is a mock response. In a real serverless function, you'd return `new Response(JSON.stringify(result), { status: 200 })`
        return { status: 200, body: JSON.stringify(result) };

    } catch (error) {
        console.error(`Error in API handler for task:`, error);
        // In a real serverless function, you'd return `new Response(JSON.stringify({ error: ... }), { status: 500 })`
        return { status: 500, body: JSON.stringify({ error: error instanceof Error ? error.message : 'An internal server error occurred.' }) };
    }
}


// --- SERVER-SIDE GEMINI FUNCTIONS ---
// These functions are the original implementations, now running securely on the server.

const getFinancialTips = async (summary: FinancialSummary): Promise<FinancialTip[]> => {
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
    
    return JSON.parse(response.text) as FinancialTip[];
};

const predictNextMonthExpenses = async (transactions: Transaction[], monthsToPredict: number): Promise<Prediction[]> => {
    const recentTransactions = transactions.slice(-100);
    const prompt = `
        Based on the following list of recent financial transactions, predict the total expenses for the next ${monthsToPredict} month(s).
        Provide a monthly breakdown, and for each month, also provide a breakdown of predicted expenses by category.
        For the 'month' field, use relative terms like "Next Month", "In 2 Months", etc.
        Transactions: ${JSON.stringify(recentTransactions.map(t => ({ date: t.date.toISOString().split('T')[0], category: t.category, amount: t.amount, type: t.type })))}
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
    
    return JSON.parse(response.text) as Prediction[];
};

const simulateScenario = async (
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

    return JSON.parse(response.text) as ScenarioResult;
};

const categorizeTransactions = async (
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

    return JSON.parse(response.text) as Record<string, { category: string, confidence: 'high' | 'medium' | 'low' }>;
};

const getSpendingAnomalies = async (transactions: Transaction[]): Promise<SpendingAnomaly[]> => {
    const prompt = `
        Act as a financial analyst. Review these transactions and identify up to 3 potential anomalies (unusually large purchase, new recurring expense, etc.).
        For each, provide a 'description' and a 'justification'.
        Transactions: ${JSON.stringify(transactions.map(t => ({ date: t.date.toISOString().split('T')[0], category: t.category, amount: t.amount, description: t.description })))}
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

    return JSON.parse(response.text) as SpendingAnomaly[];
};

const getCreditScoreAdvice = async (score: number, summary: FinancialSummary): Promise<CreditAdvice> => {
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

    return JSON.parse(response.text) as CreditAdvice;
};
