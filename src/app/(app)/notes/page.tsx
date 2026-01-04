'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Plus } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useNotes } from '@/hooks/use-notes';
import { useDebounce } from '@/hooks/use-debounce';
import { NoteList } from '@/components/notes/note-list';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

function NotesContent() {
  const searchParams = useSearchParams();
  const tagFilter = searchParams.get('tag');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { notes, pinnedNotes, unpinnedNotes, isLoading } = useNotes({
    tag: tagFilter ?? undefined,
    search: debouncedSearch,
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-semibold">
              {tagFilter ? `#${tagFilter}` : 'All Notes'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            </p>
          </div>
          <Link href="/notes/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Note
            </Button>
          </Link>
        </div>

        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <NoteList
          notes={unpinnedNotes}
          pinnedNotes={pinnedNotes}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

function NotesLoading() {
  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-20 mt-1" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>
        <div className="px-6 pb-4">
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function NotesPage() {
  return (
    <Suspense fallback={<NotesLoading />}>
      <NotesContent />
    </Suspense>
  );
}
