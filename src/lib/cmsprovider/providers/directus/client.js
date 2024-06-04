import {
  PUBLIC_CMS_URL,
  PUBLIC_CMS_TYPE
} from '$env/static/public';
import { createDirectus, rest, authentication } from '@directus/sdk';
import { building } from '$app/environment';
export let client;
const getClient = building || PUBLIC_CMS_TYPE != 'directus'
  ? () => null
  : (token) => {
    client = client || createDirectus(PUBLIC_CMS_URL).with(rest()).with(authentication('json'));
    if (token) {
      client.setToken(token);
    }
    return client;
  };

export default getClient;
