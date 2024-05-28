import directus from './index';
import { passwordRequest } from '@directus/sdk';

export async function signUp({ email, password }) {
	// const res = await directus.auth.signUp({ email, password });
	return { error: 'there is no signup in directus api' };
}

export async function signOut() {
	await directus.logout();
}

export async function signIn({ email, password }) {
	return await directus.login(email, password);
}

export async function resetPassword(email) {
	return directus.request(passwordRequest(email));
}

export default {
	signUp,
	signIn,
	signOut,
	resetPassword
};
