import createClient from './client';
import { getFiles } from './storage';
import { invalidate } from '$app/navigation';

const supabase = createClient();

export async function createSite(data, preview = null) {
  await supabase.from('sites').insert(data.site);

  const { pages, symbols, sections } = data;
  const home_page = pages.find((page) => page.url === 'index');
  const root_pages = pages.filter((page) => page.parent === null && page.id !== home_page.id);
  const child_pages = pages.filter((page) => page.parent !== null);

  await supabase.from('pages').insert(home_page);
  await Promise.all([
    supabase.from('symbols').insert(symbols),
    supabase.from('pages').insert(root_pages),
  ]);

  if (preview) {
    await supabase.storage
      .from('sites')
      .upload(`${data.site.id}/preview.html`, preview);
  }

  await supabase.from('pages').insert(child_pages);
  await supabase.from('sections').insert(sections);
}

export async function updateSite(id, props) {
  await supabase.from('sites').update(props).eq('id', id);
}

export async function deleteSite(site, { delete_repo, delete_files }) {
  const [{ data: pages }, { data: sections }, { data: symbols }] = await Promise.all([
    supabase.from('pages').select('id, url, name, code, fields, content, site, parent').eq('site', site.id),
    supabase.from('sections').select('id, content, page!inner(id, site), symbol, index').eq('page.site', site.id),
    supabase.from('symbols').select('id, name, code, fields, content, site').eq('site', site.id),
  ]);

  const backup_json = JSON.stringify({
    site,
    pages,
    sections: sections.map((section) => ({ ...section, page: section.page.id })),
    symbols,
    version: 2,
  });

  await supabase.storage
    .from('sites')
    .upload(`backups/${site.url}-${site.id}.json`, backup_json);

  await Promise.all(sections.map((section) => supabase.from('sections').delete().eq('id', section.id)));
  await Promise.all([
    supabase.from('pages').delete().eq('site', site.id),
    supabase.from('symbols').delete().eq('site', site.id),
    supabase.from('invitations').delete().eq('site', site.id),
    supabase.from('collaborators').delete().eq('site', site.id),
  ]);

  if (delete_files) {
    let siteFiles = await getFiles('sites', site.id);
    if (siteFiles.length) await supabase.storage.from('sites').remove(siteFiles);

    let imageFiles = await getFiles('images', site.id);
    if (imageFiles.length) await supabase.storage.from('images').remove(imageFiles);
  }

  if (delete_repo) {
    const repo_deleted = await fetch('/api/deploy/delete', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ site })
    });
    if (!repo_deleted) {
      alert('Could not delete repo. Ensure Personal Access Token has the "delete_repo" permission');
    }
  }

  await supabase.from('sites').delete().eq('id', site.id);
  invalidate('app:data');
}

export default {
  createSite,
  updateSite,
  deleteSite,
};