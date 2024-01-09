import { createDirectus, rest, staticToken } from '@directus/sdk';
import { PUBLIC_DIRECTUS_URL } from '$env/static/public';
import { PRIVATE_DIRECTUS_PRIVATE_KEY } from '$env/static/private';

export default createDirectus(PUBLIC_DIRECTUS_URL).with(rest()).with(staticToken(PRIVATE_DIRECTUS_PRIVATE_KEY));