import { createDirectus, rest, staticToken } from '@directus/sdk';
import { PUBLIC_CMS_URL, PUBLIC_CMS_TYPE } from '$env/static/public';
import { PRIVATE_CMS_TOKEN } from '$env/static/private';
import { building } from '$app/environment';

const client = building || PUBLIC_CMS_TYPE !== 'directus'
  ? {}
  : createDirectus(PUBLIC_CMS_URL)
    .with(rest())
    .with(staticToken(PRIVATE_CMS_TOKEN));
export default client;
