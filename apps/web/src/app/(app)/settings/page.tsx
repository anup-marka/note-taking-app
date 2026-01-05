'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Moon, Sun, Trash2, Download, Key } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { db, clearDatabase } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const notes = useLiveQuery(() => db.notes.count());

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleExportNotes = async () => {
    const allNotes = await db.notes.toArray();
    const dataStr = JSON.stringify(allNotes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearData = async () => {
    if (confirm('Are you sure you want to delete all notes? This cannot be undone.')) {
      await clearDatabase();
    }
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
            <Settings className="h-6 w-6" />
            Settings
          </h1>
        </div>
      </motion.header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Appearance */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Appearance</h2>
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Theme</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose between light and dark mode
                  </p>
                </div>
                {mounted && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant={theme === 'light' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme('light')}
                      className="gap-2"
                    >
                      <Sun className="h-4 w-4" />
                      Light
                    </Button>
                    <Button
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme('dark')}
                      className="gap-2"
                    >
                      <Moon className="h-4 w-4" />
                      Dark
                    </Button>
                    <Button
                      variant={theme === 'system' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme('system')}
                    >
                      System
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* AI */}
          <section>
            <h2 className="text-lg font-semibold mb-4">AI Settings</h2>
            <div className="rounded-xl border bg-card p-4 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium">API Key</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Your Anthropic API key is configured via environment variables.
                  Set the ANTHROPIC_API_KEY in your .env.local file.
                </p>
                <Input
                  type="password"
                  placeholder="sk-ant-..."
                  disabled
                  className="max-w-md"
                />
              </div>
            </div>
          </section>

          {/* Data */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Data</h2>
            <div className="rounded-xl border bg-card p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Storage</h3>
                  <p className="text-sm text-muted-foreground">
                    {notes ?? 0} notes stored locally
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <h3 className="font-medium">Export Notes</h3>
                  <p className="text-sm text-muted-foreground">
                    Download all your notes as JSON
                  </p>
                </div>
                <Button variant="outline" onClick={handleExportNotes} className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <h3 className="font-medium text-destructive">Clear All Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete all notes
                  </p>
                </div>
                <Button variant="destructive" onClick={handleClearData} className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Clear Data
                </Button>
              </div>
            </div>
          </section>

          {/* About */}
          <section>
            <h2 className="text-lg font-semibold mb-4">About</h2>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-sm text-muted-foreground">
                Notes is an AI-powered note-taking app built with Next.js, Tiptap, and Claude.
                All your data is stored locally in your browser.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
