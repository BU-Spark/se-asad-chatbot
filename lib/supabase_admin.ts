import { createClient } from '@supabase/supabase-js';

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}


if (!process.env.PUBLIC_SUPABASE_URL) throw new Error('PUBLIC_SUPABASE_URL missing');
if (!process.env.SUPABASE_SECRET_KEY) throw new Error('SUPABASE_SECRET_KEY missing');

export const supabase_admin = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
});
