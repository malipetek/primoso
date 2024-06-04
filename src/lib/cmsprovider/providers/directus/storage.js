import { createDirectus, rest, staticToken, readFiles, readItem, uploadFiles, createFolder, readFolders } from '@directus/sdk';
import { PUBLIC_CMS_URL } from '$env/static/public';
import { building } from '$app/environment';
import getClient from './client';

const client = getClient();
// Function to get files from a specific folder
export async function getFiles(folderId) {
  const { data, error } = await client.request(readFiles({ folder: folderId }));

  if (error) {
    console.warn(`File listing error: ${error.message}`);
    return [];
  }

  return data.map(file => ({
    id: file.id,
    filename: file.filename_download,
    url: `${PUBLIC_CMS_URL}/assets/${file.id}`,
  }));
}

// Function to get a single file by its ID
export async function getFile(fileId) {
  const { data, error } = await client.request(readItem('directus_files', fileId));

  if (error) {
    console.warn(`File retrieval error: ${error.message}`);
    return null;
  }

  return {
    id: data.id,
    filename: data.filename_download,
    url: `${PUBLIC_CMS_URL}/assets/${data.id}`,
  };
}

export async function uploadPreview({ site, preview }) {
  const folders = await client.request(readFolders());

  const siteFolder = await client.request(createFolder({
    parent: folders.find(f => f.name == 'sites')?.id,
    name: site.id
  }));

  const formData = new FormData();
  const blob = new Blob([preview], { type: 'text/html' });

  formData.append('title', 'preview');
  formData.append('folder', siteFolder.id);
  formData.append('file', blob, 'preview.html');

  return client.request(uploadFiles(formData));
}
export default {
  getFiles,
  getFile,
};