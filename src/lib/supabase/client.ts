
import { createClient } from '@supabase/supabase-js';

// Core Supabase client setup
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cgbjynxpgpriccapjbed.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnYmp5bnhwZ3ByaWNjYXBqYmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyNzQxMTAsImV4cCI6MjA1Njg1MDExMH0.UYJAgQ9X_hYwQ-8pGmIlAD_9q_DuF2t365xQA9_m4iE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
