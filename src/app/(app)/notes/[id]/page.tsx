'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Pin,
  Trash2,
  MoreVertical,
  Save,
  Sparkles,
  X,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Editor } from '@/components/editor/editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useNote,
  createNote,
  updateNote,
  deleteNote,
  togglePinNote,
} from '@/hooks/use-notes';
import { useDebouncedCallback } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils/cn';

export default function NoteEditorPage() {
  const params = useParams();
  const router = useRouter();
  const noteId = params.id as string;
  const isNew = noteId === 'new';

  const { note, isLoading } = useNote(isNew ? null : noteId);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [plainText, setPlainText] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);

  // Initialize form when note loads
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setPlainText(note.plainText);
      setTags(note.tags);
      setCurrentNoteId(note.id);
      setHasChanges(false);
    } else if (isNew) {
      setTitle('');
      setContent('');
      setPlainText('');
      setTags([]);
      setCurrentNoteId(null);
      setHasChanges(false);
    }
  }, [note, isNew]);

  const saveNote = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      if (currentNoteId) {
        await updateNote(currentNoteId, {
          title: title || 'Untitled',
          content,
          plainText,
          tags,
        });
      } else {
        const newNote = await createNote({
          title: title || 'Untitled',
          content,
          plainText,
          tags,
        });
        setCurrentNoteId(newNote.id);
        // Update URL without navigation
        window.history.replaceState(null, '', `/notes/${newNote.id}`);
      }
      setLastSaved(new Date());
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setIsSaving(false);
    }
  }, [currentNoteId, title, content, plainText, tags, isSaving]);

  const debouncedSave = useDebouncedCallback(saveNote, 1000);

  const handleContentChange = useCallback(
    (html: string, text: string) => {
      setContent(html);
      setPlainText(text);
      setHasChanges(true);
      debouncedSave();
    },
    [debouncedSave]
  );

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.target.value);
      setHasChanges(true);
      debouncedSave();
    },
    [debouncedSave]
  );

  const handleAddTag = useCallback(() => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      const newTags = [...tags, tagInput.trim().toLowerCase()];
      setTags(newTags);
      setTagInput('');
      setHasChanges(true);
      debouncedSave();
    }
  }, [tagInput, tags, debouncedSave]);

  const handleRemoveTag = useCallback(
    (tagToRemove: string) => {
      const newTags = tags.filter((t) => t !== tagToRemove);
      setTags(newTags);
      setHasChanges(true);
      debouncedSave();
    },
    [tags, debouncedSave]
  );

  const handleDelete = useCallback(async () => {
    if (currentNoteId && confirm('Move this note to trash?')) {
      await deleteNote(currentNoteId);
      router.push('/notes');
    }
  }, [currentNoteId, router]);

  const handlePin = useCallback(async () => {
    if (currentNoteId) {
      await togglePinNote(currentNoteId);
    }
  }, [currentNoteId]);

  if (isLoading && !isNew) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Link href="/notes">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isSaving ? (
                <span className="flex items-center gap-1">
                  <Save className="h-3 w-3 animate-pulse" />
                  Saving...
                </span>
              ) : lastSaved ? (
                <span className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-green-500" />
                  Saved {format(lastSaved, 'h:mm a')}
                </span>
              ) : hasChanges ? (
                <span>Unsaved changes</span>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentNoteId && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn('h-8 w-8', note?.isPinned && 'text-indigo-500')}
                  onClick={handlePin}
                >
                  <Pin className="h-4 w-4" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Sparkles className="mr-2 h-4 w-4" />
                      AI Summary
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </motion.header>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {/* Title */}
          <Input
            value={title}
            onChange={handleTitleChange}
            placeholder="Untitled"
            className="border-none text-3xl font-bold placeholder:text-muted-foreground/50 focus-visible:ring-0 px-0 h-auto py-2"
          />

          {/* Tags */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm"
              >
                #{tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Add tag..."
              className="w-24 border-none text-sm placeholder:text-muted-foreground/50 focus-visible:ring-0 px-0 h-auto py-1"
            />
          </div>

          {/* Content */}
          <div className="mt-6">
            <Editor
              content={content}
              onChange={handleContentChange}
              placeholder="Start writing..."
              autoFocus={isNew}
            />
          </div>

          {/* Word count */}
          <div className="mt-8 pt-4 border-t text-xs text-muted-foreground">
            {plainText.split(/\s+/).filter(Boolean).length} words
          </div>
        </div>
      </div>
    </div>
  );
}
