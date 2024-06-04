import directusAdmin from './providers/directus/index';
import supabaseAdmin from './providers/supabase';
import { readItems, readUsers } from '@directus/sdk';
import { PUBLIC_CMS_TYPE } from '$env/static/public';

export function createServerSideClient() {
  if (PUBLIC_CMS_TYPE == 'directus') {
    return directusAdmin;
  }
  if (PUBLIC_CMS_TYPE == 'supabase') {
    return supabaseAdmin;
  }
}

export function getSitesById(id) {
  if (PUBLIC_CMS_TYPE == 'directus') {
    return directusAdmin.request(readItems('sites', {
      fields: ['id', 'url'],
      filter: {
        id: {
          _eq: id
        }
      }
    }));
  }
  if (PUBLIC_CMS_TYPE == 'supabase') {
    return supabaseAdmin.from('sites').select('id, url').eq('url', id);
  }
}

export function getPageByName(id, slug) {
  if (PUBLIC_CMS_TYPE == 'directus') {
    return directusAdmin.request(readItems('pages', {
      fields: ['id', 'name', 'site.*'],
      filter: {
        site: {
          id: {
            _eq: id
          },
        },
        name: {
          _eq: name
        }
      }
    }));
  }
  if (PUBLIC_CMS_TYPE == 'supabase') {
    return supabaseAdmin.from('pages').select('id, url, site!inner(*)').match({
      url: slug || 'index',
      'site.url': id
    });
  }
}

export async function getSymbol() {
  if (PUBLIC_CMS_TYPE == 'directus') {
    return directusAdmin.request(readItems('symbols', {
      limit: 1
    }));
  }
  if (PUBLIC_CMS_TYPE == 'supabase') {
    return await (supabaseAdmin
      .from('symbols')
      .select('index')
      .limit(1)).symbol;
  }
}

export async function getAllSites() {
  if (PUBLIC_CMS_TYPE == 'directus') {
    return directusAdmin.request(readItems('sites', {
      fields: ['id', 'url']
    }));
  }
  if (PUBLIC_CMS_TYPE == 'supabase') {
    const { status, error } = await supabaseAdmin.from('sites').select();
    if (error) {
      throw error;
    }
    return status;
  }
}
export async function getAllUsers() {
  if (PUBLIC_CMS_TYPE == 'directus') {
    return directusAdmin.request(readUsers());
  }
  if (PUBLIC_CMS_TYPE == 'supabase') {
    return (await supabaseAdmin.from('users').select('*')).data;
  }
}

export async function getUsersCount() {
  if (PUBLIC_CMS_TYPE == 'directus') {
    return directusAdmin.request(readUsers());
  }
  if (PUBLIC_CMS_TYPE == 'supabase') {
    return (await supabaseAdmin
      .from('users')
      .select('count')).data?.[0]['count'];
  }
}

export default {
  createServerSideClient
  , getSitesById
  , getPageByName
  , getSymbol
  , getAllUsers
  , getAllSites
};