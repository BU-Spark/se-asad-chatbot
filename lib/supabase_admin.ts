import { createClient } from '@supabase/supabase-js';

export const supabase_admin = createClient(process.env.PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);
