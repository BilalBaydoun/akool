/**
 * Simple user session helper.
 * Checks Supabase auth first, falls back to localStorage guest name.
 */

export interface UserSession {
  name: string;
  email: string;
  isLoggedIn: boolean;
}

export function getGuestSession(): UserSession {
  const name = localStorage.getItem('akool-guest-name') || '';
  const email = localStorage.getItem('akool-guest-email') || '';
  return { name, email, isLoggedIn: false };
}

export function saveGuestSession(name: string, email: string) {
  if (name) localStorage.setItem('akool-guest-name', name);
  if (email) localStorage.setItem('akool-guest-email', email);
}
