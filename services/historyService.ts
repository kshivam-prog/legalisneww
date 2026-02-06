import { AnalysisResult } from "../types";

const STORAGE_KEY = 'legalis_history_v1';
const MAX_HISTORY_ITEMS = 20;

export const getHistory = (): AnalysisResult[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load history", e);
    return [];
  }
};

export const saveToHistory = (result: AnalysisResult): AnalysisResult[] => {
  try {
    const currentHistory = getHistory();
    
    // Create new item with ID and Timestamp if missing
    const newItem: AnalysisResult = {
      ...result,
      id: result.id || crypto.randomUUID(),
      timestamp: result.timestamp || Date.now(),
    };

    // Add to front, filter out duplicates if any (though UUID prevents this), and limit size
    const updatedHistory = [newItem, ...currentHistory].slice(0, MAX_HISTORY_ITEMS);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    return updatedHistory;
  } catch (e) {
    console.error("Failed to save history", e);
    return [];
  }
};

export const clearHistory = () => {
  localStorage.removeItem(STORAGE_KEY);
};
