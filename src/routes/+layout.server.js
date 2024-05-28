import { redirect } from '@sveltejs/kit';
import { readItems } from '@directus/sdk';

export const load = async ({ url, locals: { directus, getSession } }) => {
  const { data: symbol } = await directus.request(
    readItems('symbols', {
      fields: ['index'],
      limit: 1
    })
  );

  if (url.pathname !== '/update-notice' && url.pathname !== '/auth') {
    if (!symbol) {
      throw redirect(303, '/update-notice?alert=missing-symbol-index');
    }
  } else if (url.pathname === '/update-notice') {
    if (symbol && url.searchParams.get('alert') === 'missing-symbol-index') {
      throw redirect(303, '/');
    }
  }

  return {
    props: {
      symbol
    }
  };
};