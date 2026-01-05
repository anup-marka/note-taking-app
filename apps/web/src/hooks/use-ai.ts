'use client';

import { useState, useCallback } from 'react';
import type { AIAction } from '@/types/ai';

interface UseAIOptions {
  onComplete?: (result: string) => void;
  onError?: (error: string) => void;
}

export function useAI(options?: UseAIOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStreamedText('');
    setError(null);
  }, []);

  const executeAction = useCallback(
    async (action: AIAction, text: string, context?: string, customPrompt?: string) => {
      setIsLoading(true);
      setStreamedText('');
      setError(null);

      try {
        const response = await fetch('/api/ai/assist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, text, context, customPrompt }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'AI request failed');
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            fullText += chunk;
            setStreamedText(fullText);
          }
        }

        options?.onComplete?.(fullText);
        return fullText;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        options?.onError?.(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  return {
    executeAction,
    isLoading,
    streamedText,
    error,
    reset,
  };
}

export function useAISearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (query: string, notes: Array<{ title: string; plainText: string }>) => {
      setIsLoading(true);
      setAnswer('');
      setError(null);

      try {
        const response = await fetch('/api/ai/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, notes }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Search failed');
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            fullText += chunk;
            setAnswer(fullText);
          }
        }

        return fullText;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { search, isLoading, answer, error };
}

export async function suggestTags(
  title: string,
  content: string
): Promise<string[]> {
  try {
    const response = await fetch('/api/ai/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.tags || [];
  } catch {
    return [];
  }
}
