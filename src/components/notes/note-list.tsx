'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FileText } from 'lucide-react';
import type { Note } from '@/types/note';
import { NoteCard } from './note-card';

interface NoteListProps {
  notes: Note[];
  pinnedNotes?: Note[];
  isLoading?: boolean;
}

export function NoteList({ notes, pinnedNotes = [], isLoading }: NoteListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-xl border bg-muted"
          />
        ))}
      </div>
    );
  }

  if (notes.length === 0 && pinnedNotes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="rounded-full bg-muted p-4 mb-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">No notes yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Create your first note to get started
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="popLayout">
        {pinnedNotes.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Pinned
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pinnedNotes.map((note, index) => (
                <NoteCard key={note.id} note={note} index={index} />
              ))}
            </div>
          </motion.div>
        )}

        {notes.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {pinnedNotes.length > 0 && (
              <h2 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                All Notes
              </h2>
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {notes.map((note, index) => (
                <NoteCard key={note.id} note={note} index={index} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
