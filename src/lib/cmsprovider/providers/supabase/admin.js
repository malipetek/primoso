import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_CMS_TYPE } from '$env/static/public';
import { PRIVATE_SUPABASE_PRIVATE_KEY } from '$env/static/private';
import { building } from '$app/environment';

const client = building || PUBLIC_CMS_TYPE !== 'supabase'
  ? {}
  : createClient(PUBLIC_SUPABASE_URL, PRIVATE_SUPABASE_PRIVATE_KEY);
export default client;
