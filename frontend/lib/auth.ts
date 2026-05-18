const AUTH_STORAGE_KEY = "todo_auth_credentials";

export interface AuthCredentials {
  username: string;
  password: string;
}

export function setCredentials(username: string, password: string): void {
  if (typeof window === "undefined") return;
  const payload: AuthCredentials = { username, password };
  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
}

export function getCredentials(): AuthCredentials | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AuthCredentials;
    if (parsed.username && parsed.password) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function getAuthorizationHeader(): string | null {
  const credentials = getCredentials();
  if (!credentials) return null;
  const encoded = btoa(`${credentials.username}:${credentials.password}`);
  return `Basic ${encoded}`;
}

export function clearCredentials(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
}

export function isAuthenticated(): boolean {
  return getCredentials() !== null;
}

export function getUsername(): string | null {
  return getCredentials()?.username ?? null;
}
