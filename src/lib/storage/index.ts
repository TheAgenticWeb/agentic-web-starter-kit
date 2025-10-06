/**
 * Storage factory - automatically chooses the right adapter based on environment
 */

import { LocalStorageChatAdapter } from './localStorage';
import { SupabaseChatAdapter } from './supabase';
import type { ChatStorageAdapter } from './interface';

export * from './interface';
export { LocalStorageChatAdapter } from './localStorage';
export { SupabaseChatAdapter } from './supabase';

/**
 * Create a chat storage adapter based on environment configuration
 * Automatically falls back to localStorage if Supabase is not configured
 */
export function createChatStorage(userId?: string): ChatStorageAdapter {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Use Supabase if configured
  if (supabaseUrl && supabaseKey) {
    try {
      // Dynamic import to avoid errors if @supabase/supabase-js is not installed
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);
      return new SupabaseChatAdapter(supabase, userId);
    } catch (error) {
      console.warn(
        'Supabase configured but @supabase/supabase-js not found. Install with: pnpm add @supabase/supabase-js'
      );
      console.warn('Falling back to localStorage');
    }
  }

  // Fallback to localStorage
  return new LocalStorageChatAdapter();
}
