import {
  PUBLIC_CMS_URL,
  PUBLIC_CMS_PUBLIC_KEY,
  PUBLIC_CMS_TYPE
} from '$env/static/public';
import { createSupabaseLoadClient } from '@supabase/auth-helpers-sveltekit';
import { building } from '$app/environment';
export let client;
const getClient = building || PUBLIC_CMS_TYPE != 'supabase'
  ? () => null
  : (session) => {
    client = client || createSupabaseLoadClient({
      supabaseUrl: PUBLIC_SUPABASE_URL,
      supabaseKey: PUBLIC_SUPABASE_PUBLIC_KEY,
      event: { fetch },
      serverSession: session,
    });
    return client;
  };
export default getClient;
