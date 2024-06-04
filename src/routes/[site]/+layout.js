import { redirect } from '@sveltejs/kit';
import { getSitePage, getDataSymbols } from '$lib/cmsprovider/client';
/** @type {import('@sveltejs/kit').Load} */
export async function load({ depends, params, parent }) {
  depends('app:data');

  const { cmsprovider, session } = await parent();

  if (!session) {
    // the user is not signed in
    throw redirect(303, '/auth');
  }

  console.log('site layout load fn');
  // Get site and page
  const site_url = params['site'];
  const client_params = params['page']?.split('/') || [];
  const page_url = client_params.pop() || 'index';
  const parent_url = client_params.pop() || null;

  let site, page;

  // Initialize an array to hold the promises for fetching site and page data
  const res = await getSitePage({ site_url, page_url, parent_url });
  console.log('res ', res);
  ({ site, page } = res);

  // Redirect logic based on the existence of the site and page data
  if (!site) {
    // If the site data is not found, redirect the user to the home page
    throw redirect(303, '/');
  } else if (!page && page_url !== 'index') {
    // If the page data is not found and the provided page_url is not 'index',
    // redirect the user to the site's index page
    throw redirect(303, `/${site_url}/index`);
  }

  // Initialize an array to hold the promises for fetching additional data: pages, symbols, and sections
  let { pages, symbols, sections } = await getDataSymbols({ site, page });
  console.log('data symbols ', pages, symbols, sections);
  // Return the fetched data as an object
  return { site, page, pages, symbols, sections };
}
