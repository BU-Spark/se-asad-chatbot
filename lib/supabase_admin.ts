import { createClient } from '@supabase/supabase-js';

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

const supabaseUrl = requireEnv('PUBLIC_SUPABASE_URL');
const supabaseServiceKey = requireEnv('SUPABASE_SECRET_KEY');

export const supabase_admin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});
