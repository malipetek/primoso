import supabase from './client';

export async function signUp({ email, password }) {
  const res = await supabase.auth.signUp({ email, password });
  return res?.data;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function signIn({ email, password }) {
  const { res, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw error;
  }
  return res?.data;
}

export async function resetPassword(email) {
  return supabase.auth.api.resetPasswordForEmail(email);
}

export async function getSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
};

export const auth = supabase.auth;

export default {
  signUp,
  signIn,
  signOut,
  resetPassword,
  getSession,
};
