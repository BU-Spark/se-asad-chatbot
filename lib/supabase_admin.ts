// Server-side (service role key, bypass RLS)

import { createClient } from '@supabase/supabase-js';

if (!process.env.PUBLIC_SUPABASE_URL) throw new Error('PUBLIC_SUPABASE_URL missing');
if (!process.env.SUPABASE_SECRET_KEY) throw new Error('SUPABASE_SECRET_KEY missing');

export const supabase_admin = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
});
