import { EventType, PublicClientApplication, type AccountInfo } from "@azure/msal-browser";
import { msalConfig } from "./authConfig";

export const msalInstance = new PublicClientApplication(msalConfig);

// Bootstrap MSAL: must be awaited before <MsalProvider> renders so the
// PublicClientApplication is initialized and any redirect response is processed.
export const initializeMsal = async (): Promise<void> => {
  await msalInstance.initialize();

  // Process the response if we just returned from a redirect.
  await msalInstance.handleRedirectPromise();

  // Set an active account if one exists but isn't yet active.
  if (!msalInstance.getActiveAccount()) {
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      msalInstance.setActiveAccount(accounts[0]);
    }
  }

  // Keep active account in sync with login/acquire events.
  msalInstance.addEventCallback((event) => {
    if (
      (event.eventType === EventType.LOGIN_SUCCESS ||
        event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS) &&
      event.payload &&
      "account" in (event.payload as object)
    ) {
      const account = (event.payload as { account?: AccountInfo }).account;
      if (account) msalInstance.setActiveAccount(account);
    }
  });
};
