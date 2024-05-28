import { get } from 'svelte/store';
import { page } from '$app/stores';
import directus from './index';
import { readFolder } from '@directus/sdk';

export async function getFiles(folderId, path, files = []) {
    let dirs = [];
    const fileList = await directus.request(readFolder(folderId));

    if (fileList) {
        files = [...files, ...fileList.map((x) => {
            if (!x.id) dirs.push(`${path}/${x.name}`);
            return `${path}/${x.name}`;
        })];
    }

    for (const dir of dirs) {
        files = await getFiles(folderId, dir, files);
    }

    return files;
}

export default {
    getFiles,
};