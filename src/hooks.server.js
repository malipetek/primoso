import { createServerSideClient, getSitesById, getPageByName } from '$lib/cmsprovider/admin';
import { getIndexFileByPage } from '$lib/cmsprovider/storage';
import { getSession } from '$lib/cmsprovider/auth';
import { redirect } from '@sveltejs/kit';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ resolve, event }) {
  event.locals.cmsAdmin = createServerSideClient();

  event.locals.getSession = getSession;

  const response = await resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range';
    },
  });

  const is_preview = event.url.searchParams.has('preview');
  if (is_preview) {
    // retrieve site and page from db
    const [{ data: [site] }, { data: [page] }] = await Promise.all([
      getSitesById(event.params.site),
      getPageByName(event.params.site, event.params.page),
    ]);

    if (!site || !page) return new Response('no page found');

    const file = await getIndexFileByPage(site.id, page.id);

    return new Response(file || 'no preview found', {
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  if (event.request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }

  if (response.status == 401) {
    // return redirect(401, '/auth');
    console.log('token expired, do something');
  }

  response.headers.set('Access-Control-Allow-Origin', '*');

  return response;
};