import { createDirectus, authentication } from '@directus/sdk';
import { PUBLIC_CMS_URL } from '$env/static/public';
import { building } from '$app/environment';

const client = building
  ? {}
  : createDirectus(PUBLIC_CMS_URL).with(authentication());

export async function signUp({ email, password }) {
  try {
    const { data } = await client;
    return data;
  } catch (error) {
    console.error(`Sign-up error: ${error.message}`);
    return null;
  }
}

export async function signIn({ email, password }) {
  try {
    const res = await client.login(email, password);
    return res;
  } catch (error) {
    throw error;
  }
}

export async function signOut() {
  try {
    await client.logout();
  } catch (error) {
    console.error(`Sign-out error: ${error.message}`);
  }
}

export async function resetPassword(email) {
  try {
    const { data } = await client.request({
      url: '/auth/password/request',
      method: 'POST',
      data: {
        email,
        reset_url: `${PUBLIC_CMS_URL}/reset-password` // Customize this URL as needed
      }
    });
    return data;
  } catch (error) {
    console.error(`Reset password error: ${error.message}`);
    return null;
  }
}

export async function getSession() {
  try {
    const token = await client.getToken();
    return token;
  } catch (error) {
    console.error(`Get session error: ${error.message}`);
    return null;
  }
}

export default {
  signUp,
  signIn,
  signOut,
  resetPassword,
  getSession,
};