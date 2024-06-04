import { PUBLIC_CMS_TYPE } from '$env/static/public';

// Directus implementation
import * as directusActions from './providers/directus/actions';
// Supabase implementation
import * as supabaseActions from './providers/supabase/actions';

let actions;

if (PUBLIC_CMS_TYPE === 'directus') {
  actions = directusActions;
} else if (PUBLIC_CMS_TYPE === 'supabase') {
  actions = supabaseActions;
} else {
  throw new Error(`Unsupported CMS type: ${PUBLIC_CMS_TYPE}`);
}

export const { createSite, updateSite, deleteSite } = actions;

export const sites = { ...actions };