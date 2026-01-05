'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, Loader2 } from 'lucide-react';
import { useNotes } from '@/hooks/use-notes';
import { useAISearch } from '@/hooks/use-ai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const { notes } = useNotes();
  const { search, isLoading, answer, error } = useAISearch();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    await search(
      query,
      notes.map((n) => ({ title: n.title, plainText: n.plainText }))
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm"
      >
        <div className="px-6 py-4">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-indigo-500" />
            AI Search
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ask questions about your notes and get AI-powered answers
          </p>
        </div>
      </motion.header>

      {/* Search */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about your notes..."
              className="pl-12 pr-24 h-14 text-lg rounded-xl"
            />
            <Button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Ask AI
                </>
              )}
            </Button>
          </form>

          {/* Suggestions */}
          {!answer && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8"
            >
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Try asking
              </h3>
              <div className="space-y-2">
                {[
                  'What are my main project ideas?',
                  'Summarize my meeting notes',
                  'What tasks do I need to complete?',
                  'What did I write about last week?',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setQuery(suggestion)}
                    className="block w-full text-left px-4 py-3 rounded-lg border bg-card hover:bg-secondary/50 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 p-4 rounded-lg border border-destructive/50 bg-destructive/10"
            >
              <p className="text-sm text-destructive">{error}</p>
            </motion.div>
          )}

          {/* Answer */}
          {answer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                </div>
                <span className="font-medium">AI Answer</span>
              </div>
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <div className="p-6 rounded-xl border bg-card">
                  {answer.split('\n').map((line, i) => (
                    <p key={i} className={line ? '' : 'h-4'}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Loading */}
          {isLoading && !answer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 flex items-center justify-center py-12"
            >
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                <p className="text-sm text-muted-foreground">
                  Searching through your notes...
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
