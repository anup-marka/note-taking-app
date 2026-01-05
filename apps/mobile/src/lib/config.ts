// Environment configuration for the mobile app
// In production, these should come from environment variables

export const config = {
  // Supabase configuration
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  },

  // API configuration
  api: {
    baseUrl: process.env.EXPO_PUBLIC_API_URL || '',
  },

  // Feature flags
  features: {
    enableAI: true,
    enableSync: true,
    enableOfflineMode: true,
  },

  // App metadata
  app: {
    name: 'Notes',
    version: '0.1.0',
  },
};

// Validate required configuration
export function validateConfig(): boolean {
  const required = [
    ['SUPABASE_URL', config.supabase.url],
    ['SUPABASE_ANON_KEY', config.supabase.anonKey],
  ];

  const missing = required.filter(([, value]) => !value);

  if (missing.length > 0) {
    console.warn(
      'Missing required configuration:',
      missing.map(([name]) => name).join(', ')
    );
    return false;
  }

  return true;
}
