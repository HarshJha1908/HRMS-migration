import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { msalInstance } from "./msalInstance";
import { apiTokenRequest, loginRequest } from "./authConfig";

/**
 * Acquire an Access Token for the HRMS Web API.
 *
 * Tries silent acquisition first (no UI). If interaction is required (consent,
 * MFA, expired refresh token), falls back to a full-page redirect login.
 */
export const getApiAccessToken = async (): Promise<string> => {
  const account = msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0];

  if (!account) {
    // No session at all — kick off interactive login.
    await msalInstance.loginRedirect(loginRequest);
    // loginRedirect navigates away; throwing keeps callers from acting on undefined.
    throw new Error("Redirecting for sign-in");
  }

  try {
    const result = await msalInstance.acquireTokenSilent({
      ...apiTokenRequest,
      account
    });
    return result.accessToken;
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      await msalInstance.acquireTokenRedirect({
        ...apiTokenRequest,
        account
      });
      throw new Error("Redirecting for token acquisition");
    }
    throw error;
  }
};
