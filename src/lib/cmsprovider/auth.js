import { auth as directusAuth } from './providers/directus';
import { auth as supabaseAuth } from './providers/supabase';
import { PUBLIC_CMS_TYPE } from '$env/static/public';

export function getSession() {
  if (PUBLIC_CMS_TYPE === 'directus') {
    return directusAuth.getSession();
  }
  if (PUBLIC_CMS_TYPE === 'supabase') {
    return supabaseAuth.getSession();
  }
}

export default () => {
  if (PUBLIC_CMS_TYPE === 'directus') {
    return directusAuth;
  }
  if (PUBLIC_CMS_TYPE === 'supabase') {
    return supabaseAuth;
  }
};