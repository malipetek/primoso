import { PUBLIC_DIRECTUS_URL, PUBLIC_DIRECTUS_PUBLIC_KEY } from '$env/static/public';
import { createDirectus, rest, staticToken, authentication } from '@directus/sdk';

/** @type {import('@directus/sdk').DirectusClient & import('@directus/sdk').RestClient & import('@directus/sdk').StaticTokenClient & import('@directus/sdk').AuthenticationClient} */
const directusClient = createDirectus(PUBLIC_DIRECTUS_URL).with(rest()).with(staticToken(PUBLIC_DIRECTUS_PUBLIC_KEY)).with(authentication());

export default directusClient;
