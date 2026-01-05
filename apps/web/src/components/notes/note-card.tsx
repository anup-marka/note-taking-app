'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Pin, MoreVertical, Trash2, Archive, Star } from 'lucide-react';
import type { Note } from '@/types/note';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { togglePinNote, deleteNote, archiveNote } from '@/hooks/use-notes';

interface NoteCardProps {
  note: Note;
  index?: number;
}

export function NoteCard({ note, index = 0 }: NoteCardProps) {
  const preview = note.plainText.slice(0, 150);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
    >
      <Link href={`/notes/${note.id}`}>
        <div
          className={cn(
            'group relative rounded-xl border bg-card p-4 transition-all hover:border-foreground/20 hover:shadow-md',
            note.isPinned && 'border-indigo-500/30 bg-indigo-500/5'
          )}
        >
          {note.isPinned && (
            <Pin className="absolute right-3 top-3 h-4 w-4 text-indigo-500" />
          )}

          <div className="pr-8">
            <h3 className="font-medium text-foreground line-clamp-1">
              {note.title || 'Untitled'}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {preview || 'No content'}
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {note.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                >
                  {tag}
                </span>
              ))}
              {note.tags.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{note.tags.length - 3}
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {format(new Date(note.updatedAt), 'MMM d')}
            </span>
          </div>

          <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    togglePinNote(note.id);
                  }}
                >
                  <Star className="mr-2 h-4 w-4" />
                  {note.isPinned ? 'Unpin' : 'Pin'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    archiveNote(note.id);
                  }}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    deleteNote(note.id);
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
