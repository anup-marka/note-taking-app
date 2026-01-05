'use client';

import type { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Link as LinkIcon,
  Highlighter,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface BubbleMenuProps {
  editor: Editor;
  setLink: () => void;
  onAIAction?: (action: string, text: string) => void;
}

interface MenuButtonProps {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
}

function MenuButton({ onClick, isActive, children }: MenuButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn('h-7 w-7', isActive && 'bg-secondary')}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export function EditorBubbleMenu({ editor, setLink, onAIAction }: BubbleMenuProps) {
  const selectedText = editor.state.doc.textBetween(
    editor.state.selection.from,
    editor.state.selection.to,
    ' '
  );

  return (
    <>
      <MenuButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
      >
        <Bold className="h-3.5 w-3.5" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
      >
        <Italic className="h-3.5 w-3.5" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
      >
        <Underline className="h-3.5 w-3.5" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
      >
        <Strikethrough className="h-3.5 w-3.5" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        isActive={editor.isActive('highlight')}
      >
        <Highlighter className="h-3.5 w-3.5" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
      >
        <Code className="h-3.5 w-3.5" />
      </MenuButton>
      <MenuButton onClick={setLink} isActive={editor.isActive('link')}>
        <LinkIcon className="h-3.5 w-3.5" />
      </MenuButton>

      <div className="w-px h-5 bg-border mx-1" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 px-2 gap-1">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            <span className="text-xs">AI</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem onClick={() => onAIAction?.('improve', selectedText)}>
            Improve writing
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAIAction?.('fix-grammar', selectedText)}>
            Fix grammar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAIAction?.('simplify', selectedText)}>
            Simplify
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onAIAction?.('expand', selectedText)}>
            Expand
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onAIAction?.('summarize', selectedText)}>
            Summarize
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onAIAction?.('continue', selectedText)}>
            Continue writing
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
