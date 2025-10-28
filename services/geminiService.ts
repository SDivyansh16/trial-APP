

import { GoogleGenAI, Type } from "@google/genai";
import { FinancialSummary, Transaction, Prediction, FinancialTip, ScenarioResult, SpendingAnomaly, CreditAdvice } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const getFinancialTips = async (summary: FinancialSummary): Promise<FinancialTip[]> => {
    try {
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
                            title: {
                                type: Type.STRING,
                                description: "A short, catchy title for the financial tip."
                            },
                            explanation: {
                                type: Type.STRING,
                                description: "A detailed but concise explanation of the tip and how to implement it."
                            }
                        }
                    }
                }
            }
        });
        
        const jsonText = response.text.trim();
        const parsedTips = JSON.parse(jsonText) as FinancialTip[];
        if (!Array.isArray(parsedTips) || parsedTips.length === 0 || !parsedTips[0].title) {
            throw new Error("AI response is missing required fields for tips.");
        }
        return parsedTips;

    } catch (error) {
        console.error("Error generating financial tips:", error);
        throw new Error("Failed to get financial tips from AI. Please try again.");
    }
};

export const predictNextMonthExpenses = async (transactions: Transaction[], monthsToPredict: number): Promise<Prediction[]> => {
    try {
        const recentTransactions = transactions.slice(-100); // Use a sample for brevity
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
                            month: {
                                type: Type.STRING,
                                description: "The relative month of the prediction (e.g., 'Next Month')."
                            },
                            totalPredictedExpenses: {
                                type: Type.NUMBER,
                                description: "The total predicted expenses for this month."
                            },
                            categoryPredictions: {
                                type: Type.ARRAY,
                                description: "A list of predicted expenses for each category for this month.",
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        category: {
                                            type: Type.STRING,
                                            description: "The name of the expense category."
                                        },
                                        predictedAmount: {
                                            type: Type.NUMBER,
                                            description: "The predicted expense amount for this category."
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        
        const jsonText = response.text.trim();
        const parsedPrediction = JSON.parse(jsonText) as Prediction[];

        if (!Array.isArray(parsedPrediction) || parsedPrediction.length === 0 || !parsedPrediction[0].totalPredictedExpenses) {
            throw new Error("AI response is missing required prediction fields.");
        }

        return parsedPrediction;
    } catch (error) {
        console.error("Error predicting expenses:", error);
        throw new Error("Failed to predict expenses with AI. The model may have returned an invalid format.");
    }
};

export const simulateScenario = async (
    summary: FinancialSummary,
    incomeChange: number,
    expenseChanges: { category: string; amount: number }[]
): Promise<ScenarioResult> => {
    try {
        const expenseChangeText = expenseChanges.length > 0 
            ? expenseChanges.map(c => `${c.category}: ${c.amount > 0 ? '+' : ''}$${c.amount.toFixed(2)}`).join(', ')
            : 'No change in expenses.';

        const prompt = `
            Analyze a "what-if" financial scenario.
            
            Current Monthly Financial Summary (based on provided data):
            - Total Income: $${summary.totalIncome.toFixed(2)}
            - Total Expenses: $${summary.totalExpenses.toFixed(2)}
            - Net Savings: $${summary.netSavings.toFixed(2)}

            Proposed Hypothetical Changes for a month:
            - Change in Income: ${incomeChange >= 0 ? '+' : ''}$${incomeChange.toFixed(2)}
            - Changes in Expenses: ${expenseChangeText}

            Based on these changes, calculate the new financial situation and provide an analysis.
            1. Calculate the new predicted monthly savings.
            2. Write a brief impact analysis explaining what these changes mean for the user's budget.
            3. Provide a few concise, actionable recommendations based on this new scenario, formatted as a string with bullet points (e.g., using '\\n- ').
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        newMonthlySavings: {
                            type: Type.NUMBER,
                            description: "The newly calculated net savings after applying the hypothetical changes."
                        },
                        impactAnalysis: {
                            type: Type.STRING,
                            description: "A short paragraph analyzing the impact of these changes on the user's financial health."
                        },
                        recommendations: {
                            type: Type.STRING,
                            description: "A few bullet points of actionable advice based on the simulated scenario."
                        }
                    },
                    required: ['newMonthlySavings', 'impactAnalysis', 'recommendations']
                }
            }
        });

        const jsonText = response.text.trim();
        const parsedResult = JSON.parse(jsonText) as ScenarioResult;

        if (!parsedResult || typeof parsedResult.newMonthlySavings !== 'number') {
            throw new Error("AI response is missing required scenario fields.");
        }

        return parsedResult;

    } catch (error) {
        console.error("Error simulating scenario:", error);
        throw new Error("Failed to simulate financial scenario with AI. Please try again.");
    }
};


export const categorizeTransactions = async (
    transactions: { id: string, description: string }[],
    categories: string[]
): Promise<Record<string, { category: string, confidence: 'high' | 'medium' | 'low' }>> => {
    if (transactions.length === 0) return {};
    try {
        const prompt = `
            Given a list of financial transaction descriptions and a list of available expense categories,
            categorize each transaction.
            Only use categories from the provided list. If no category fits well, use "Uncategorized".

            Available Categories: ${JSON.stringify(categories.filter(c => c !== 'Uncategorized'))}

            Transactions to categorize: ${JSON.stringify(transactions)}

            Return the result as a single JSON object where keys are the transaction IDs. 
            Each value must be an object with two properties: 'category' (the suggested category string) and 'confidence' (a string: 'high', 'medium', or 'low').
            'low' confidence means you are very unsure about the categorization.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {}, // Allow dynamic keys (transaction IDs)
                    description: "An object mapping transaction IDs to an object containing 'category' and 'confidence' strings."
                }
            }
        });

        const jsonText = response.text.trim();
        const categorizedMap = JSON.parse(jsonText) as Record<string, { category: string, confidence: 'high' | 'medium' | 'low' }>;
        
        if (typeof categorizedMap !== 'object' || categorizedMap === null) {
             throw new Error("AI response was not a valid object for categorization.");
        }
        
        const firstKey = Object.keys(categorizedMap)[0];
        if (firstKey && (typeof categorizedMap[firstKey]?.category !== 'string' || typeof categorizedMap[firstKey]?.confidence !== 'string')) {
            // This is a soft check. If the model fails, it might return an empty object or a different structure.
            console.warn("AI response object may have an incorrect value structure.");
        }

        return categorizedMap;

    } catch (error) {
        console.error("Error categorizing transactions:", error);
        // Fail gracefully, don't block the user flow. They can categorize manually.
        return {};
    }
};

export const getSpendingAnomalies = async (transactions: Transaction[]): Promise<SpendingAnomaly[]> => {
    try {
        const prompt = `
            Act as a financial analyst. Review the following list of recent transactions and identify up to 3 potential anomalies or unusual spending patterns.
            An anomaly could be an unusually large purchase, a sudden increase in spending in a category, or a new type of recurring expense.
            For each anomaly found, provide a concise description of the transaction/pattern and a brief justification for why it's considered an anomaly.

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
                            description: {
                                type: Type.STRING,
                                description: "A short description of the anomalous transaction or pattern."
                            },
                            justification: {
                                type: Type.STRING,
                                description: "A brief explanation of why this is considered an anomaly."
                            }
                        },
                        required: ["description", "justification"]
                    }
                }
            }
        });

        const jsonText = response.text.trim();
        const anomalies = JSON.parse(jsonText) as SpendingAnomaly[];

        if (!Array.isArray(anomalies)) {
            throw new Error("AI response was not a valid array for anomalies.");
        }

        return anomalies;

    } catch (error) {
        console.error("Error getting spending anomalies:", error);
        throw new Error("Failed to get spending anomalies from AI. Please try again.");
    }
};


export const getCreditScoreAdvice = async (score: number, summary: FinancialSummary): Promise<CreditAdvice> => {
    try {
        const prompt = `
            A user has a credit score of ${score}.
            Here is their current financial summary for the selected period:
            - Monthly Income: $${summary.totalIncome.toFixed(2)}
            - Monthly Expenses: $${summary.totalExpenses.toFixed(2)}
            - Monthly Net Savings: $${summary.netSavings.toFixed(2)}
            - Total Debt (from loans, etc.): $${summary.totalDebt.toFixed(2)}

            Act as a friendly financial advisor. Based on BOTH the credit score and their financial summary, provide:
            1. A brief, one-sentence 'summary' classifying the score (e.g., Excellent, Good, Fair, Poor).
            2. A list of 3-4 actionable 'tips' to either improve or maintain this score. These tips MUST be personalized based on their income, savings, and debt. For example, if they have high debt, suggest a repayment strategy. If they have good savings, suggest how to use it wisely. Each tip should have a 'title' and a short 'explanation'.

            Credit score ranges:
            - 300-579: Poor
            - 580-669: Fair
            - 670-739: Good
            - 740-799: Very Good
            - 800-850: Excellent
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: {
                            type: Type.STRING,
                            description: "A one-sentence summary classifying the credit score."
                        },
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

        const jsonText = response.text.trim();
        const advice = JSON.parse(jsonText) as CreditAdvice;

        if (!advice.summary || !Array.isArray(advice.tips)) {
            throw new Error("AI response was missing required fields for credit advice.");
        }

        return advice;

    } catch (error) {
        console.error("Error getting credit score advice:", error);
        throw new Error("Failed to get credit score advice from AI. Please try again.");
    }
};
