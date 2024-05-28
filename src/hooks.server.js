import { createDirectus, rest, staticToken, authentication, readItems } from '@directus/sdk';
import { PUBLIC_DIRECTUS_URL, PUBLIC_DIRECTUS_PUBLIC_KEY } from '$env/static/public';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ resolve, event }) {
  // Initialize Directus client with REST and static token support
  const directus = createDirectus(PUBLIC_DIRECTUS_URL)
    .with(rest())
    .with(staticToken(PUBLIC_DIRECTUS_PUBLIC_KEY))
    .with(authentication());

  event.locals.directus = directus;

  event.locals.getSession = async () => {
    const token = await directus.getToken();
    return token ? { accessToken: token } : null;
  };

  const response = await resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range';
    },
  });

  const is_preview = event.url.searchParams.has('preview');
  if (is_preview) {
    const [{ data: site }, { data: page }] = await Promise.all([
      directus.request(readItems('sites', {
        filter: { url: { _eq: event.params.site } },
        fields: ['id', 'url'],
        single: true
      })),
      directus.request(readItems('pages', {
        filter: {
          url: { _eq: event.params.page || 'index' },
          'site.url': { _eq: event.params.site }
        },
        fields: ['id', 'url', 'site.*'],
        single: true
      }))
    ]);

    if (!site || !page) return new Response('no page found');

    const file = await directus.request(`${PUBLIC_DIRECTUS_URL}/assets/${site.id}/${page.id}/index.html`);

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

  response.headers.set('Access-Control-Allow-Origin', '*');

  return response;
};