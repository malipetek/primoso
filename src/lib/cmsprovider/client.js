import createDirectusClient from './providers/directus/client';
import createSupabaseClient from './providers/supabase/client';
import { PUBLIC_CMS_TYPE } from '$env/static/public';
import { readItems, readUser } from '@directus/sdk';
import { parseJwt } from '$lib/utils';
let directusClient, supabaseClient;

export default function () {
  if (PUBLIC_CMS_TYPE === 'directus') {
    directusClient = createDirectusClient.apply(this, arguments);
    return directusClient;
  }
  if (PUBLIC_CMS_TYPE === 'supabase') {
    supabaseClient = createSupabaseClient.apply(this, arguments);
    return supabaseClient;
  }
};

export async function getSession() {
  if (PUBLIC_CMS_TYPE === 'directus') return await directusClient.getToken();
  if (PUBLIC_CMS_TYPE === 'supabase') {
    const {
      data: { session },
    } = await supabaseClient.auth.getSession();

    return session;
  }
}
export async function getAllSites() {
  if (PUBLIC_CMS_TYPE === 'directus') {
    const sites = await directusClient.request(readItems('sites', {
      fields: ['*'],
      sort: ['created_at'],
    }));
    return sites;
  }
  if (PUBLIC_CMS_TYPE === 'supabase') {
    const { data: sites } = await supabaseClient
      .from('sites')
      .select('id, name, url, active_deployment, collaborators (*)')
      .order('created_at', { ascending: true });
    return sites;
  }
}

export async function getUserRecords(userid) {
  if (PUBLIC_CMS_TYPE === 'directus') {
    const userPayload = parseJwt(userid);
    const user = await directusClient.request(readUser(userPayload.id, {
      fields: ['*', {
        role: ['*']
      }],
    }));

    return {
      ...user
      , server_member: true
      , admin: user.role.name == 'Administrator'
      // TODO: we will make role editor or collaborator
      , role: 'editor'
    };
  }
  if (PUBLIC_CMS_TYPE === 'supabase') {
    const { data: user } = await supabaseClient
      .from('users')
      .select('*, server_members (admin, role), collaborators (role)')
      .eq('id', userid)
      .single();
    const [server_member] = user.server_members;
    const [collaborator] = user.collaborators;

    const user_final = server_member
      ? {
        ...user,
        server_member: true,
        admin: server_member.admin,
        role: server_member.role,
      }
      : {
        ...user,
        server_member: false,
        admin: false,
        role: collaborator.role,
      };
    return user_final;
  }
}

export async function getSitePage({ site_url, page_url, parent_url }) {
  if (PUBLIC_CMS_TYPE == 'directus') {
    return await Promise.all([
      directusClient.request(readItems('sites', {
        fields: ['*'],
        filter: {
          url: {
            _eq: site_url
          }
        }
      })),
      parent_url ? directusClient.request(readItems('pages', {
        fields: ['*',
          { site: ['id', 'url'] },
          { parent: ['id', 'url'] },
        ],
        filter: {
          url: {
            _eq: page_url
          },
          site: {
            url: {
              _eq: site_url
            }
          },
          parent: {
            url: {
              _eq: parent_url
            }
          }
        }
      })) : directusClient.request(readItems('pages', {
        fields: ['*',
          { site: ['id', 'url'] }
        ],
        filter: {
          url: {
            _eq: page_url
          },
          site: {
            url: {
              _eq: site_url
            }
          },
          parent: {
            _null: true
          }
        }
      }))
    ]).then(([sites, pages]) => {
      return {
        site: sites[0],
        page: pages[0]
      };
    });
  }
  if (PUBLIC_CMS_TYPE == 'supabase') {
    return await Promise.all([
      // Create a promise to fetch the site data from the 'sites' table where the URL matches the provided site_url
      supabaseClient.from('sites').select().filter('url', 'eq', site_url).single(),

      // Conditionally create a promise to fetch the page data based on the presence of parent_url
      parent_url
        ? // If parent_url is provided, create a promise to fetch the page data
        // from the 'pages' table where the URL matches the provided page_url,
        // the site's URL matches the provided site_url, and the parent's URL matches the provided parent_url.
        // Also include inner join relationships with the 'site' and 'parent' tables.
        supabaseClient.from('pages').select(`*, site!inner(id, url), parent!inner(id, url)`)
          .match({ url: page_url, 'site.url': site_url, 'parent.url': parent_url }).single()
        : // If parent_url is not provided, create a promise to fetch the page data
        // from the 'pages' table where the URL matches the provided page_url,
        // the site's URL matches the provided site_url, and the parent is null.
        // Also include an inner join relationship with the 'site' table.
        supabaseClient.from('pages').select(`*, site!inner(id, url)`)
          .match({ url: page_url, 'site.url': site_url }).is('parent', null).single(),
    ]).then(([site, page]) => {
      return {
        site: site.data,
        page: page.data,
      };
    });
  }

}

export async function getDataSymbols({ site, page }) {
  if (PUBLIC_CMS_TYPE == 'directus') {
    return await Promise.all([
      // Create a promise to fetch the site data from the 'sites' table where the URL matches the provided site_url
      directusClient.request(readItems('pages', {
        fields: ['*'],
        filter: {
          site: {
            _eq: site.id
          }
        },
        sort: ['-created_at']
      })),
      // Create a promise to fetch the page data from the 'pages' table where the URL matches the provided page_url
      directusClient.request(readItems('symbols', {
        fields: ['*'],
        filter: {
          site: {
            _eq: site.id
          }
        },
        sort: ['-created_at']
      })),
      // Create a promise to fetch the page data from the 'pages' table where the URL matches the provided page_url
      directusClient.request(readItems('sections', {
        fields: ['id', 'page', 'index', 'content', 'symbol'],
        filter: {
          page: {
            _eq: page.id
          }
        },
        sort: ['index']
      }))
    ]).then(([pages, symbols, sections]) => ({
      pages,
      symbols,
      sections
    }));
  }
  if (PUBLIC_CMS_TYPE == 'supabase') {
    return Promise.all([
      // Create a promise to fetch all pages related to the site from the 'pages' table,
      // where the site ID matches, and order the results by the creation date in ascending order
      supabaseClient.from('pages').select().match({ site: site.id }).order('created_at', { ascending: true }),

      // Create a promise to fetch all symbols related to the site from the 'symbols' table,
      // where the site ID matches, and order the results by the index in ascending order
      supabaseClient.from('symbols').select().match({ site: site.id }).order('index', { ascending: true }),

      // Create a promise to fetch all sections related to the current page from the 'sections' table,
      // where the page ID matches, and order the results by the index in ascending order.
      // Only select specific fields: id, page, index, content, and symbol
      supabaseClient.from('sections').select('id, page, index, content, symbol').match({ page: page.id }).order('index', { ascending: true }),
    ]).then(([pages, symbols, sections]) => {
      return {
        pages: pages.data,
        symbols: symbols.data,
        sections: sections.data,
      };
    });
  }
}