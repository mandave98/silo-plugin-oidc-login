// Thin fetch wrapper that knows how to talk to the plugin's HTTP routes
// mounted under /api/v1/plugins/{installId}/...

import { getCachedToken } from "./identity";
import { currentMount } from "./mount";

export function mountPath(): string {
  // Derived at runtime from the page URL; see lib/mount.ts for the prefixes.
  return currentMount()?.prefix ?? "";
}

export function installationID(): number | null {
  const raw = currentMount()?.installationID;
  if (!raw) return null;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Prefix for host-owned endpoints (not proxied to the plugin), matching the mount's API version.
export function hostApiPrefix(): string {
  return currentMount()?.hostApi ?? "/api/v1";
}

export class HostAuthError extends Error {
  constructor(path: string) {
    super(`host rejected ${path}: authentication required`);
    this.name = "HostAuthError";
  }
}

function authHeaders(): Record<string, string> {
  const t = getCachedToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function jsonOrThrow<T>(r: Response): Promise<T> {
  if (!r.ok) {
    const body = await r.text().catch(() => "");
    throw new Error(`${r.status}: ${body}`);
  }
  if (r.status === 204) return undefined as T;
  const text = await r.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export const api = {
  get: <T>(path: string): Promise<T> =>
    fetch(mountPath() + path, { headers: authHeaders() }).then(jsonOrThrow<T>),
  post: <T>(path: string, body: unknown): Promise<T> =>
    fetch(mountPath() + path, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(body),
    }).then(jsonOrThrow<T>),
  patch: <T>(path: string, body: unknown): Promise<T> =>
    fetch(mountPath() + path, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(body),
    }).then(jsonOrThrow<T>),
  // Host-owned endpoint (not proxied to the plugin). The plugin-launch token only
  // authorises the plugin proxy on current hosts, so try the browser's host session
  // first and fall back to the bearer for older hosts that accepted it.
  hostPut: async <T>(path: string, body: unknown): Promise<T> => {
    const init = (headers: Record<string, string>): RequestInit => ({
      method: "PUT",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
    });
    let r = await fetch(path, init({}));
    if (r.status === 401 && getCachedToken()) {
      r = await fetch(path, init(authHeaders()));
    }
    if (r.status === 401) throw new HostAuthError(path);
    return jsonOrThrow<T>(r);
  },
  delete: <T>(path: string): Promise<T> =>
    fetch(mountPath() + path, {
      method: "DELETE",
      headers: authHeaders(),
    }).then(jsonOrThrow<T>),
};
