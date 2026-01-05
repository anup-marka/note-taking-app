export const APP_NAME = 'Notes';

export const TAG_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#84cc16', // lime
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#ec4899', // pink
];

export const DEFAULT_TAG_COLOR = '#6366f1';

export const AUTO_SAVE_DELAY = 1000; // ms

export const SEARCH_DEBOUNCE_DELAY = 300; // ms

export const AI_ACTIONS = {
  improve: {
    label: 'Improve writing',
    icon: 'Sparkles',
    description: 'Make the text clearer and more engaging',
  },
  expand: {
    label: 'Expand',
    icon: 'Maximize2',
    description: 'Add more detail and explanation',
  },
  summarize: {
    label: 'Summarize',
    icon: 'Minimize2',
    description: 'Create a concise summary',
  },
  simplify: {
    label: 'Simplify',
    icon: 'FileText',
    description: 'Use simpler language',
  },
  'fix-grammar': {
    label: 'Fix grammar',
    icon: 'Check',
    description: 'Correct spelling and grammar',
  },
  continue: {
    label: 'Continue writing',
    icon: 'ArrowRight',
    description: 'Continue from where you left off',
  },
} as const;

// Sync constants
export const SYNC_INTERVAL = 30000; // 30 seconds
export const SYNC_RETRY_DELAY = 5000; // 5 seconds
export const MAX_SYNC_RETRIES = 3;
