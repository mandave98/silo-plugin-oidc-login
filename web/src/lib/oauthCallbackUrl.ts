import { parseMount } from "./mount";

export function oauthCallbackUrl(origin: string, pathname: string): string {
  const cleanOrigin = origin.replace(/\/+$/, "");
  const mount = parseMount(pathname);
  const installationID = mount?.installationID || "{installation_id}";
  const hostApi = mount?.hostApi ?? "/api/v1";
  return `${cleanOrigin}${hostApi}/auth/oauth/${installationID}/callback`;
}

export function currentOAuthCallbackUrl(): string {
  return oauthCallbackUrl(window.location.origin, window.location.pathname);
}
