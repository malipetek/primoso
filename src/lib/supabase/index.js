import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLIC_KEY } from '$env/static/public';
import { createClient } from '@supabase/supabase-js';
import { building } from '$app/environment';
const client = building ? {} : createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLIC_KEY);
export default client;