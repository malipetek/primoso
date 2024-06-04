import { get } from 'svelte/store';
import { page } from '$app/stores';
import supabase from './client';

export async function getFiles(bucket, path, files = []) {
  let dirs = [];
  const { data: fileList, error: fileListError } = await supabase.storage
    .from(bucket)
    .list(path);

  if (fileListError)
    console.warn(`File listing error: ${fileListError.message}`);

  if (!fileListError && fileList) {
    files = [
      ...files,
      ...fileList.map((x) => {
        if (!x.id) dirs.push(`${path}/${x.name}`);
        return `${path}/${x.name}`;
      }),
    ];
  }

  for (const dir of dirs) {
    files = await getFiles(bucket, dir, files);
  }

  return files;
}

export async function getFile(fileId) {
  //`${site.id}/${page.id}/index.html`
  const { data: file, error } = await supabase.storage.download(fileId);
}

export async function getSiteHtml(site_id) {
  return new Promise(send => supabase.storage
    .from('sites')
    .download(`${site_id}/preview.html`).then(({ data, error }) => {
      if (error) {
        console.log('Error downloading file: ', error.message);
      } else if (browser) {
        var reader = new FileReader();
        reader.onload = function () {
          send(reader.result);
        };
        reader.readAsText(data);
      }
    }));
}
export default {
  getFiles,
  getFile,
  getSiteHtml,
};
