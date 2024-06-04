import createClient, { getSession, getAllSites, getUserRecords } from '$lib/cmsprovider/client';
import { redirect } from '@sveltejs/kit';
import { building } from '$app/environment';

/** @type {import('@sveltejs/kit').Load} */
export async function load(event) {
  event.depends('cmsprovider:auth');
  event.depends('app:data');

  if (building) {
    return;
  }
  const cmsprovider = createClient(event?.data?.session);
  const session = await getSession();

  if (!session && !event.url.pathname.startsWith('/auth')) {
    throw redirect(303, '/auth');
  } else if (session) {
    // const site = event.params['site']
    const [sites, user] = await Promise.all([
      getAllSites(),
      getUserRecords(session?.user?.id || session),
    ]);

    // TODO: do this w/ sql
    const user_sites = sites?.filter(
      (site) =>
        /*user is server member*/ user.server_member ||
        /*user is site collaborator*/ site.collaborators.some(
        (collaborator) => collaborator.user === user.id
      )
    );

    return {
      cmsprovider,
      session,
      user,
      sites: user_sites,
    };
  }
}
