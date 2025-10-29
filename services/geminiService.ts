import { GoogleGenAI, Type } from "@google/genai";
import { 
    FinancialSummary, 
    Transaction, 
    SpendingAnomaly, 
    CreditAdvice, 
    FinancialHealthReport, 
    FinancialTip, 
    Prediction, 
    ScenarioResult 
} from "../types";

// --- Client Initialization ---

/**
 * Checks if the Gemini API is available by checking for the API key in environment variables.
 * @returns {boolean} True if the API key is available and not a placeholder.
 */
export const isGeminiAvailable = (): boolean => {
    const apiKey = import.meta.env.VITE_API_KEY;
    return !!apiKey && 
           apiKey !== "YOUR_API_KEY_HERE" && 
           !apiKey.includes("AIzaSyXXXXXXXXXXXXXXXX");
};

// Singleton instance of the AI client, initialized lazily.
let ai: GoogleGenAI | null = null;

/**
 * Lazily initializes and returns the GoogleGenAI client.
 * Throws an error if the API key is not configured.
 * @returns {GoogleGenAI} The initialized AI client.
 */
function getAiClient(): GoogleGenAI {
    const apiKey = import.meta.env.VITE_API_KEY;

    if (ai) return ai;

    if (!apiKey) {
        throw new Error("Gemini API key is not configured. Please set the VITE_API_KEY environment variable.");
    }

    ai = new GoogleGenAI({ apiKey });
    return ai;
}

