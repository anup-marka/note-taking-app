import { useState, useCallback } from 'react';
import type { AIAction, AISearchRequest } from '@note-app/shared-types';
import { config } from '../lib/config';

interface UseAIResult {
  result: string;
  isLoading: boolean;
  error: string | null;
  execute: (action: AIAction, text: string, customPrompt?: string) => Promise<string>;
  reset: () => void;
}

interface UseAISearchResult {
  answer: string;
  isLoading: boolean;
  error: string | null;
  search: (query: string, noteContents: Array<{ id: string; title: string; content: string }>) => Promise<void>;
  reset: () => void;
}

/**
 * Hook for AI writing assistance
 * TODO: Connect to actual Supabase Edge Function
 */
export function useAI(): UseAIResult {
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (action: AIAction, text: string, customPrompt?: string): Promise<string> => {
    if (!text.trim()) {
      setError('No text provided');
      return '';
    }

    setIsLoading(true);
    setError(null);
    setResult('');

    try {
      // TODO: Replace with actual Supabase Edge Function call
      // const { data, error } = await supabase.functions.invoke('ai-assist', {
      //   body: { action, text, customPrompt },
      // });

      // Placeholder: Simulate AI response
      await new Promise((resolve) => setTimeout(resolve, 1500));

      let simulatedResult = '';
      switch (action) {
        case 'improve':
          simulatedResult = `[Improved version of your text would appear here]\n\n${text}`;
          break;
        case 'expand':
          simulatedResult = `${text}\n\n[Additional expanded content would appear here with more details and examples.]`;
          break;
        case 'summarize':
          simulatedResult = `Summary: ${text.substring(0, 100)}...`;
          break;
        case 'simplify':
          simulatedResult = `[Simplified version]: ${text}`;
          break;
        case 'fix-grammar':
          simulatedResult = text; // Would return corrected text
          break;
        case 'continue':
          simulatedResult = `${text}\n\n[The AI would continue writing from here, maintaining your style and tone...]`;
          break;
        default:
          simulatedResult = text;
      }

      setResult(simulatedResult);
      return simulatedResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'AI request failed';
      setError(errorMessage);
      return '';
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult('');
    setError(null);
    setIsLoading(false);
  }, []);

  return { result, isLoading, error, execute, reset };
}

/**
 * Hook for AI-powered search over notes
 * TODO: Connect to actual Supabase Edge Function
 */
export function useAISearch(): UseAISearchResult {
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (
    query: string,
    noteContents: Array<{ id: string; title: string; content: string }>
  ): Promise<void> => {
    if (!query.trim()) {
      setError('No query provided');
      return;
    }

    if (noteContents.length === 0) {
      setError('No notes to search');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnswer('');

    try {
      // TODO: Replace with actual Supabase Edge Function call
      // const { data, error } = await supabase.functions.invoke('ai-search', {
      //   body: { query, notes: noteContents },
      // });

      // Placeholder: Simulate AI search response
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const noteTitles = noteContents.map((n) => n.title).join(', ');
      const simulatedAnswer = `Based on your notes (${noteTitles}), here's what I found regarding "${query}":\n\n` +
        `This is a placeholder response. When connected to the AI backend, this will provide intelligent answers based on your actual note content.\n\n` +
        `**Sources:** ${noteContents.slice(0, 3).map((n) => n.title).join(', ')}`;

      setAnswer(simulatedAnswer);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setAnswer('');
    setError(null);
    setIsLoading(false);
  }, []);

  return { answer, isLoading, error, search, reset };
}

/**
 * Function to suggest tags for a note
 * TODO: Connect to actual Supabase Edge Function
 */
export async function suggestTags(title: string, content: string): Promise<string[]> {
  if (!content.trim()) {
    return [];
  }

  try {
    // TODO: Replace with actual Supabase Edge Function call
    // const { data, error } = await supabase.functions.invoke('ai-tags', {
    //   body: { title, content },
    // });

    // Placeholder: Return dummy tags based on content keywords
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const words = content.toLowerCase().split(/\s+/);
    const commonWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'and', 'but', 'if', 'or', 'because', 'until', 'while', 'this', 'that', 'these', 'those', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom']);

    const wordFreq = new Map<string, number>();
    for (const word of words) {
      if (word.length > 3 && !commonWords.has(word)) {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      }
    }

    const sortedWords = Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([word]) => word);

    return sortedWords;
  } catch (err) {
    console.error('Failed to suggest tags:', err);
    return [];
  }
}
