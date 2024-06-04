import { createDirectus, rest, authentication, readItems, createItems, updateItem, deleteItems } from '@directus/sdk';
import { PUBLIC_CMS_URL } from '$env/static/public';
import { uploadPreview } from './storage';

// Function to create a new site
export async function createSite(data, preview = null, cmsprovider) {
  const client = cmsprovider;
  const token = await client.getToken();
  console.log('token ', token);
  const site = await client.request(createItems('sites', { ...data.site }));

  const { pages, symbols, sections } = data;
  const home_page = pages.find((page) => page.url === 'index');
  const root_pages = pages.filter((page) => page.parent === null && page.id !== home_page.id);
  const child_pages = pages.filter((page) => page.parent !== null);

  await client.request(createItems('pages', home_page));
  await Promise.all([
    client.request(createItems('symbols', symbols)),
    client.request(createItems('pages', root_pages)),
  ]);

  if (preview) {
    await uploadPreview({ site, preview });
    // Assuming there is a custom endpoint for uploading previews
  }

  await client.request(createItems('pages', child_pages));
  await client.request(createItems('sections', sections));
}

// Function to update an existing site
export async function updateSite(id, props) {
  await client.request(updateItem('sites', id, props));
}

// Function to delete an existing site
export async function deleteSite(site, { delete_repo, delete_files }) {
  const pages = await client.request(readItems('pages', { filter: { site: site.id } }));
  const sections = await client.request(readItems('sections', { filter: { 'page.site': site.id } }));
  const symbols = await client.request(readItems('symbols', { filter: { site: site.id } }));

  const backup_json = JSON.stringify({
    site,
    pages,
    sections: sections.map((section) => ({ ...section, page: section.page.id })),
    symbols,
    version: 2,
  });

  // Assuming there is a custom endpoint for uploading backups
  await fetch(`${PUBLIC_CMS_URL}/custom/upload-backup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      backup: backup_json,
      siteId: site.id,
    }),
  });

  await Promise.all(
    sections.map((section) => client.request(deleteItems('sections', { filter: { id: section.id } })))
  );

  await Promise.all([
    client.request(deleteItems('pages', { filter: { site: site.id } })),
    client.request(deleteItems('symbols', { filter: { site: site.id } })),
    client.request(deleteItems('invitations', { filter: { site: site.id } })),
    client.request(deleteItems('collaborators', { filter: { site: site.id } })),
  ]);

  if (delete_files) {
    // Implement file deletion logic here
  }

  if (delete_repo) {
    await fetch('/api/deploy/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ site }),
    });
  }

  await client.request(deleteItems('sites', { filter: { id: site.id } }));
}

export default {
  createSite,
  updateSite,
  deleteSite,
};