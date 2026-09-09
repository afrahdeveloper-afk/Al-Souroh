import { supabase } from '../../lib/supabaseClient';
import { ApiError, type CurrentUser } from '../types';

function toCurrentUser(user: { id: string; email?: string | null }): CurrentUser {
  return { id: user.id, username: user.email ?? user.id };
}

/** No session (never logged in, or expired) is a normal "not logged in" outcome, not an error. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) return null;
  return toCurrentUser(data.session.user);
}

/** `username` is a Supabase Auth email address — the Dashboard's "Name" field just passes whatever it's given straight through. */
export async function login(username: string, password: string): Promise<CurrentUser> {
  const { data, error } = await supabase.auth.signInWithPassword({ email: username, password });
  if (error || !data.user) {
    throw new ApiError(error?.status ?? 400, { detail: error?.message ?? 'Invalid credentials.' });
  }
  return toCurrentUser(data.user);
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}
