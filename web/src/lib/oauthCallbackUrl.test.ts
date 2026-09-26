import { describe, expect, it } from "vitest";
import { oauthCallbackUrl } from "./oauthCallbackUrl";

describe("oauthCallbackUrl", () => {
  it("follows the v2 plugin-content mount used by current Silo hosts", () => {
    expect(
      oauthCallbackUrl("https://silo.example.com", "/api/v2/plugin-content/plugins/6/admin"),
    ).toBe("https://silo.example.com/api/v2/auth/oauth/6/callback");
  });

  it("builds the host OAuth callback URL from the plugin install URL", () => {
    expect(oauthCallbackUrl("https://ct.wave-ninja.eu", "/api/v1/plugins/36/admin")).toBe(
      "https://ct.wave-ninja.eu/api/v1/auth/oauth/36/callback",
    );
  });

  it("keeps localhost and non-numeric installation ids working", () => {
    expect(oauthCallbackUrl("http://localhost:8090/", "/api/v1/plugins/oidc-dev/admin/settings")).toBe(
      "http://localhost:8090/api/v1/auth/oauth/oidc-dev/callback",
    );
  });
});
