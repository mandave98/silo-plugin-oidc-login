// Where the host mounted this plugin's HTTP routes, derived from the page URL at runtime
// because the installation id is host-assigned and the mount prefix changed between Silo
// releases:
//   older hosts:  /api/v1/plugins/{installationId}/...
//   current hosts: /api/v2/plugin-content/plugins/{installationId}/...
// Host-owned endpoints (auth-binding, OAuth callback) follow the same API version.

export type Mount = {
  prefix: string; // e.g. "/api/v2/plugin-content/plugins/6"
  installationID: string; // e.g. "6"
  hostApi: "/api/v1" | "/api/v2";
};

const MOUNT_RE = /^(\/api\/(v1)\/plugins\/([^/]+)|\/api\/(v2)\/plugin-content\/plugins\/([^/]+))/;

export function parseMount(pathname: string): Mount | null {
  const m = pathname.match(MOUNT_RE);
  if (!m) return null;
  if (m[2] === "v1") return { prefix: m[1], installationID: m[3], hostApi: "/api/v1" };
  return { prefix: m[1], installationID: m[5], hostApi: "/api/v2" };
}

export function currentMount(): Mount | null {
  return parseMount(window.location.pathname);
}
