import {
  PUBLIC_DIRECTUS_PUBLIC_KEY,
  PUBLIC_DIRECTUS_URL,
} from '$env/static/public';
import { redirect } from '@sveltejs/kit';
import { createDirectus, rest, staticToken, readItems, readMe } from '@directus/sdk';

/** @type {import('@sveltejs/kit').Load} */
export async function load(event) {
  event.depends('directus:auth');
  event.depends('app:data');

  const directus = createDirectus(PUBLIC_DIRECTUS_URL)
    .with(rest())
    .with(staticToken(PUBLIC_DIRECTUS_PUBLIC_KEY));

  const token = await directus.getToken();

  if (!token && !event.url.pathname.startsWith('/auth')) {
    throw redirect(303, '/auth');
  } else if (token) {
    const { sites, user } = await Promise.all([
      directus.request(readItems('sites', {
        fields: ['id', 'name', 'url', 'active_deployment', 'collaborators.*'],
        sort: ['created_at'],
      })),
      directus.request(readMe({
        fields: ['*'],
      })),
    ]).then(([{ data: sites }, user]) => {
      const [server_member] = user.server_members || [];
      const [collaborator] = user.collaborators || [];

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
          role: collaborator ? collaborator.role : null,
        };

      return {
        sites: sites || [],
        user: user_final,
      };
    });

    const user_sites = sites?.filter(
      (site) =>
        user.server_member ||
        site.collaborators.some(
          (collaborator) => collaborator.user === user.id
        )
    );

    return {
      directus,
      session: { user },
      user,
      sites: user_sites,
    };
  }
}