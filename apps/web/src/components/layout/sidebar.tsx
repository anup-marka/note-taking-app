'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FileText,
  Search,
  Settings,
  Plus,
  Hash,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';
import { useAppStore } from '@/stores/app-store';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

const navItems = [
  { href: '/notes', label: 'All Notes', icon: FileText },
  { href: '/search', label: 'AI Search', icon: Search },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useAppStore();

  const tags = useLiveQuery(() => db.tags.toArray()) ?? [];

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 256 : 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="relative flex h-screen flex-col border-r bg-card overflow-hidden"
      >
        <div className="flex h-14 items-center justify-between border-b px-4">
          <Link href="/notes" className="flex items-center gap-2 font-semibold">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            <span>Notes</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleSidebar}
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <Link href="/notes/new">
            <Button className="w-full justify-start gap-2 mb-4" variant="default">
              <Plus className="h-4 w-4" />
              New Note
            </Button>
          </Link>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-secondary text-secondary-foreground'
                      : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {tags.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tags
              </h3>
              <div className="space-y-1">
                {tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/notes?tag=${encodeURIComponent(tag.name)}`}
                    className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
                  >
                    <Hash className="h-3 w-3" style={{ color: tag.color }} />
                    <span className="truncate">{tag.name}</span>
                    <span className="ml-auto text-xs opacity-60">{tag.noteCount}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </motion.aside>

      {!sidebarOpen && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-4 top-3 z-50 h-8 w-8"
          onClick={toggleSidebar}
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
      )}
    </>
  );
}
