// Centralized admin session management - memory-only storage (no localStorage)
// This prevents XSS attacks from stealing session tokens via localStorage

let adminSessionToken: string | null = null;
let adminSessionExpiry: number | null = null;
let adminInfo: { username: string; role: string } | null = null;

export function getAdminSessionToken(): string | null {
  // Check if session expired
  if (adminSessionExpiry && Date.now() > adminSessionExpiry) {
    clearAdminSession();
    return null;
  }
  return adminSessionToken;
}

export function getAdminInfo(): { username: string; role: string } | null {
  // Return null if session expired
  if (!getAdminSessionToken()) {
    return null;
  }
  return adminInfo;
}

export function setAdminSession(token: string, expiresAt: string, info?: { username: string; role: string }): void {
  adminSessionToken = token;
  adminSessionExpiry = new Date(expiresAt).getTime();
  if (info) {
    adminInfo = info;
  }
}

export function clearAdminSession(): void {
  adminSessionToken = null;
  adminSessionExpiry = null;
  adminInfo = null;
}

export function isAdminSessionValid(): boolean {
  return getAdminSessionToken() !== null;
}
