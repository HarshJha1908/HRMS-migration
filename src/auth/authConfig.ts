import type { Configuration, RedirectRequest, SilentRequest } from "@azure/msal-browser";
import { LogLevel } from "@azure/msal-browser";

const requireEnv = (key: string, fallback?: string): string => {
  const value = (import.meta.env[key] as string | undefined) ?? fallback;
  if (!value) {
    // Surface misconfiguration loudly in dev; in prod we still throw so we don't
    // silently send malformed auth requests to Entra.
    throw new Error(`Missing required env variable: ${key}`);
  }
  return value;
};

const clientId = requireEnv("VITE_AAD_CLIENT_ID");
const tenantId = requireEnv("VITE_AAD_TENANT_ID");
const redirectUri = requireEnv("VITE_AAD_REDIRECT_URI", window.location.origin + "/");
const postLogoutRedirectUri = requireEnv(
  "VITE_AAD_POST_LOGOUT_REDIRECT_URI",
  window.location.origin + "/"
);
const apiScope = requireEnv("VITE_AAD_API_SCOPE");

export const msalConfig: Configuration = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri,
    postLogoutRedirectUri
  },
  cache: {
    // sessionStorage clears on tab close (recommended balance of security vs UX).
    cacheLocation: "sessionStorage"
  },
  system: {
    loggerOptions: {
      logLevel: import.meta.env.DEV ? LogLevel.Warning : LogLevel.Error,
      piiLoggingEnabled: false,
      loggerCallback: (_level, _message, containsPii) => {
        if (containsPii) return;
      }
    }
  }
};

// Scopes used to obtain the ID token / basic profile during silent SSO.
export const loginScopes: string[] = ["openid", "profile", "email"];

// Scopes used to obtain an Access Token for the HRMS Web API.
export const apiTokenRequest: SilentRequest = {
  scopes: [apiScope]
};

// NOTE: Do NOT set `prompt: "select_account"` (or "login") here.
// Forcing a prompt prevents Entra from silently reusing an existing
// browser session and forces every user through the full sign-in +
// MFA flow on each visit. Omitting `prompt` lets MSAL/Entra perform
// real SSO when the browser already has a valid Entra session
// (and, for AAD/Hybrid-joined devices, a Primary Refresh Token).
export const loginRequest: RedirectRequest = {
  scopes: loginScopes,
  // Tenant-scoped authority so Entra knows which directory to SSO against
  // even if the user has multiple work/school accounts cached.
  authority: `https://login.microsoftonline.com/${tenantId}`,
  // Hint to skip the "Pick an account" screen when we know the domain.
  extraQueryParameters: {
    domain_hint: "linde.com"
  }
};

export const ssoSilentRequest: SilentRequest = {
  scopes: loginScopes,
  authority: `https://login.microsoftonline.com/${tenantId}`
};
