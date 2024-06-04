import { PUBLIC_CMS_TYPE, PUBLIC_CMS_URL } from '$env/static/public';
import * as directusStorage from './providers/directus/storage';
import * as supabaseStorage from './providers/supabase/storage';
import supabase from './providers/supabase/client';
import { client as directus } from './providers/directus/client';
import { readFiles, readFolder, readFolders } from '@directus/sdk';
// import { file } from '@directus/sdk';
let storage;

if (PUBLIC_CMS_TYPE === 'directus') {
  storage = directusStorage;
} else if (PUBLIC_CMS_TYPE === 'supabase') {
  storage = supabaseStorage;
} else {
  throw new Error(`Unsupported CMS type: ${PUBLIC_CMS_TYPE}`);
}

export const { getFiles, getFile } = storage;

export async function getIndexFileByPage(siteId, pageId) {
  if (PUBLIC_CMS_TYPE === 'directus') {
    try {
      const response = await directus.request(() => ({
        path: `/assets/sites/${siteId}/${pageId}/index.html`,
        method: 'GET',
      }));
      if (!response.ok) {
        console.warn(`Error fetching index file: ${response.statusText}`);
        return null;
      }
      return await response.text();
    } catch (error) {
      console.warn(`Error fetching index file: ${error}`);
    }
  } else if (PUBLIC_CMS_TYPE === 'supabase') {
    const { data, error } = await supabase
      .storage
      .from('sites')
      .download(`${siteId}/${pageId}/index.html`);

    if (error) {
      console.warn(`Error downloading index file: ${error.message}`);
      return null;
    }

    return data;
  } else {
    throw new Error(`Unsupported CMS type: ${PUBLIC_CMS_TYPE}`);
  }
}

export async function getSiteHtml(site_id) {
  if (PUBLIC_CMS_TYPE === 'directus') {
    try {
      const [siteFolder] = await directus.request(readFolders({
        filter: {
          name: {
            _eq: site_id
          }
        }
      }));
      const files = await directus.request(readFiles({
        filter: {
          folder: {
            _eq: siteFolder.id
          }
        }
      }));
      const indexFile = files.find(f => f.title == 'preview');

      return await directus.request(() => ({
        path: `/assets/${indexFile.id}`,
        method: 'GET',
      }));
    } catch (error) {
      console.warn(`Error fetching index file: ${error}`);
    }
  }
  if (PUBLIC_CMS_TYPE === 'supabase') {
    return supabaseStorage.getSiteHtml(site_id);
  }
}