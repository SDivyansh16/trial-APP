import { GoogleGenAI, Type } from "@google/genai";
import { FinancialSummary, Transaction, SpendingAnomaly, CreditAdvice, FinancialHealthReport, FinancialTip, Prediction, ScenarioResult } from "../types";

// Initialize the Google GenAI client.
// The API key is sourced from an environment variable.
const apiKey = process.env.API_KEY;
if (!apiKey) {
    // This will be visible in the browser console, which is fine for this environment.
    console.error("The API_KEY environment variable is not set. AI features will not work.");
    // We can throw an error to make it clear that the app cannot function without the key.
    throw new Error("The API_KEY environment variable is not set. AI features will be disabled.");
}
const ai = new GoogleGenAI({ apiKey });


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


export const getFinancialHealthReport = async (transactions: Transaction[], summary: FinancialSummary): Promise<FinancialHealthReport> => {
    const transactionSnippets = transactions.slice(0, 20).map(t => `${t.date.toISOString().split('T')[0]}: ${t.description} (${t.type}) - $${t.amount.toFixed(2)}`).join('\n');

    const prompt = `
        You are a friendly and insightful personal finance assistant. Analyze the user's financial summary and recent transaction data to generate a comprehensive "Financial Health Report".
        The tone should be encouraging, clear, and actionable.

        Here is the user's data:
        1.  **Financial Summary (for the selected period):**
            -   Total Income: $${summary.totalIncome.toFixed(2)}
            -   Total Expenses: $${summary.totalExpenses.toFixed(2)}
            -   Net Savings: $${summary.netSavings.toFixed(2)}
            -   Top Spending Categories: ${summary.expensesByCategory.slice(0, 5).map(c => `${c.name}: $${c.value.toFixed(2)}`).join(', ')}
            -   Total Debt (user-tracked, e.g., personal loans): $${summary.totalDebt.toFixed(2)}

        2.  **Recent Transaction Snippets:**
            ${transactionSnippets}

        Based on ALL the data provided, generate a report with the following structure:
        1.  **healthScore:** An overall financial health score from 0 to 100. Consider the savings rate (income vs. expenses), debt levels relative to income, and spending habits. A savings rate over 20% is excellent, 10-20% is good, 0-10% is fair, and negative is poor. The score should be an integer.
        2.  **scoreJustification:** A short, encouraging paragraph (2-3 sentences) explaining the score in simple terms.
        3.  **keyObservations:** A list of 2-4 bullet points. Identify both positive habits ('positive' type) and areas for improvement ('negative' type).
        4.  **recommendations:** A list of 2-3 actionable, personalized recommendations. Each recommendation must have a short 'title' and a 'recommendation' text explaining the step and its benefit.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    healthScore: { type: Type.NUMBER, description: "A score from 0 to 100." },
                    scoreJustification: { type: Type.STRING, description: "A brief explanation of the score." },
                    keyObservations: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                type: { type: Type.STRING, enum: ['positive', 'negative'] },
                                observation: { type: Type.STRING }
                            },
                            required: ["type", "observation"]
                        }
                    },
                    recommendations: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                recommendation: { type: Type.STRING }
                            },
                            required: ["title", "recommendation"]
                        }
                    }
                },
                required: ["healthScore", "scoreJustification", "keyObservations", "recommendations"]
            }
        }
    });

    return extractJsonFromMarkdown(response.text) as FinancialHealthReport;
};


export const categorizeTransactions = async (
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

export const getSpendingAnomalies = async (transactions: Transaction[]): Promise<SpendingAnomaly[]> => {
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

export const getCreditScoreAdvice = async (score: number, summary: FinancialSummary): Promise<CreditAdvice> => {
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

export const getFinancialTips = async (summary: FinancialSummary): Promise<FinancialTip[]> => {
    const prompt = `
        You are a helpful financial advisor. Based on the following financial summary, generate 3-4 concise and actionable tips for financial improvement.
        Each tip should have a 'title' and a brief 'explanation'.
        Focus on the user's key metrics. For example, if savings are low, suggest budgeting methods. If expenses in a category are high, suggest ways to reduce them.

        User's Financial Summary:
        - Total Income: $${summary.totalIncome.toFixed(2)}
        - Total Expenses: $${summary.totalExpenses.toFixed(2)}
        - Net Savings: $${summary.netSavings.toFixed(2)}
        - Top Spending Categories: ${summary.expensesByCategory.slice(0, 3).map(c => `${c.name}: $${c.value.toFixed(2)}`).join(', ')}

        Return ONLY a JSON array of objects, where each object has "title" and "explanation" keys.
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
                    },
                    required: ["title", "explanation"]
                }
            }
        }
    });

    return extractJsonFromMarkdown(response.text) as FinancialTip[];
};

export const predictNextMonthExpenses = async (transactions: Transaction[], monthsToPredict: number): Promise<Prediction[]> => {
    const recentExpenses = transactions
        .filter(t => t.type === 'expense')
        .slice(-100) // Use last 100 expenses for context
        .map(t => ({ date: t.date.toISOString().split('T')[0], amount: t.amount, category: t.category }));

    const prompt = `
        You are a financial forecasting AI. Based on the user's recent transaction history, predict their total expenses and top 3-5 spending categories for the next ${monthsToPredict} month(s).
        Analyze patterns, seasonality (if any), and recurring costs from the data provided.

        Recent Expense Data (last 100 transactions):
        ${JSON.stringify(recentExpenses)}

        Current Date: ${new Date().toISOString().split('T')[0]}

        Provide your prediction as a JSON array. Each object in the array should represent a future month and have the following structure:
        - "month": The month name and year (e.g., "October 2024").
        - "totalPredictedExpenses": The total estimated expense amount for that month (as a number).
        - "categoryPredictions": An array of objects for the top 3-5 predicted spending categories, each with "category" (string) and "predictedAmount" (number).
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro', // Use pro for better reasoning
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
                                },
                                required: ["category", "predictedAmount"]
                            }
                        }
                    },
                    required: ["month", "totalPredictedExpenses", "categoryPredictions"]
                }
            }
        }
    });

    return extractJsonFromMarkdown(response.text) as Prediction[];
};

export const simulateScenario = async (summary: FinancialSummary, incomeChange: number, expenseChanges: { category: string, amount: number }[]): Promise<ScenarioResult> => {
    const prompt = `
        You are a financial scenario simulator. A user wants to understand the impact of potential changes to their finances.
        
        Their Current Monthly Financial Summary:
        - Total Income: $${summary.totalIncome.toFixed(2)}
        - Total Expenses: $${summary.totalExpenses.toFixed(2)}
        - Net Savings: $${summary.netSavings.toFixed(2)}

        Proposed Changes:
        - Monthly Income Change: $${incomeChange.toFixed(2)}
        - Monthly Expense Changes: ${expenseChanges.length > 0 ? expenseChanges.map(c => `${c.category}: $${c.amount.toFixed(2)}`).join(', ') : 'None'}

        Calculate the new estimated monthly savings. Then, provide a brief 'impactAnalysis' (2-3 sentences) explaining how these changes affect their financial situation (e.g., savings rate, ability to reach goals). Finally, provide a concise 'recommendations' paragraph (2-3 sentences) suggesting what they should do or consider based on this new scenario.

        Return the result as a single JSON object with the keys "newMonthlySavings", "impactAnalysis", and "recommendations".
    `;

    // Manual calculation for accuracy
    const newIncome = summary.totalIncome + incomeChange;
    const expenseChangeTotal = expenseChanges.reduce((sum, change) => sum + change.amount, 0);
    const newExpenses = summary.totalExpenses + expenseChangeTotal;
    const newMonthlySavings = newIncome - newExpenses;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    newMonthlySavings: { type: Type.NUMBER }, // The model will generate this, but we'll override it with our precise calculation.
                    impactAnalysis: { type: Type.STRING },
                    recommendations: { type: Type.STRING }
                },
                required: ["newMonthlySavings", "impactAnalysis", "recommendations"]
            }
        }
    });

    const result = extractJsonFromMarkdown(response.text) as ScenarioResult;
    // Override the model's calculation with our own for precision.
    result.newMonthlySavings = newMonthlySavings;

    return result;
};
