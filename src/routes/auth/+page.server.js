import { redirect } from '@sveltejs/kit';
import directus from '$lib/directus/admin';
import { PUBLIC_DIRECTUS_URL } from '$env/static/public';
import { readItems, login, aggregate, createUser, createItem } from '@directus/sdk';
/** @type {import('@sveltejs/kit').Load} */
export async function load({ url, parent }) {
  const { session } = await parent();

  const signing_up = url.searchParams.has('signup');
  const joining_server = url.pathname.includes('set-password');

  if (!session && !signing_up && !joining_server) {
    const existing_users = await directus.request(readItems('users'));
    const initiated = existing_users?.length > 0;
    if (!initiated) {
      throw redirect(303, '?signup');
    }
  } else if (session && !joining_server) {
    throw redirect(303, '/');
  }
}

/** @type {import('./$types').Actions} */
export const actions = {
  sign_in: async ({ request, locals: { supabase } }) => {
    const data = await request.formData();
    const email = data.get('email');
    if (!email || typeof email !== 'string') {
      return {
        success: false,
        error: 'Email is required'
      };
    }
    const password = data.get('password');
    if (!password || typeof password !== 'string') {
      return {
        success: false,
        error: 'Password is required'
      };
    }
    try {
      const result = await directus.request(login(email, password));

      return {
        success: true,
        error: null
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        error: error.message
      };
    }
    // if invitation exists, send signup to server to create user and add to workspace/editors

  },
  sign_up: async ({ request, locals: { supabase } }) => {
    // Only the server owner signs up, all others are invited (i.e. auto-signed up)

    // ensure server is provisioned
    const { success, error } = await server_provisioned();
    if (!success) {
      return {
        success: false,
        error
      };
    }

    const [{ count }] = await (directus.request(aggregate('users', {
      aggregate: {
        count: '*',
      }
    })));
    if (count !== null && count > 0) {
      return {
        success: false,
        error: 'Server already initialized. Sign in as the server owner to invite users.'
      };
    }

    const data = await request.formData();
    const email = data.get('email');
    const password = data.get('password');

    try {
      const res = await directus.request(createUser({
        // @ts-ignore
        email: email,
        // @ts-ignore
        password: password,
        email_confirm: true,
      }));

      try {

        const signedin = await directus.request(login(email, password));
        await directus
          .request(createItem('users', {
            id: res.user?.id,
            email: res.user?.email
          }));
        await directus.request(createItem('server_members', {
          user: res.user?.id,
          role: 'DEV',
          admin: true
        }));
        return {
          success: true,
          error: signedin
        };
      } catch (auth_error) {
        return {
          success: false,
          error: auth_error.message
        };
      }

    } catch (error) {


    }

  },
};

async function server_provisioned() {
  try {
    const sites = await directus.request(readItems('sites'));

    return { success: true, error: null };
  } catch (error) {

    return { success: false, error: `Unknown error` };
    return { success: false, error: `Could not connect your Supabase backend. Ensure you've correctly connected your environment variables.` };
  }
}