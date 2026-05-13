import { useMemo } from "react";
import { useMsal } from "@azure/msal-react";
import { msalInstance } from "./msalInstance";

export type AuthUser = {
  /** UPN / email the API uses to look up the SQL user record. */
  username: string;
  /** Display name (full name) when available. */
  name: string;
  /** Entra immutable user object id (oid claim). */
  oid: string;
  /** UPN claim, e.g. firstname.lastname@linde.com */
  upn: string;
  
  // loginUserAdID: string;
  loginUserAdID: string;
};

/**
 * Returns the currently signed-in user derived from the active MSAL account.
 * Components should treat `user` as null while AuthGate is still resolving.
 */
export const useAuth = (): { user: AuthUser | null; signOut: () => void } => {
  const { instance } = useMsal();
  const account = instance.getActiveAccount() ?? instance.getAllAccounts()[0] ?? null;

  const user = useMemo<AuthUser | null>(() => {
    if (!account) return null;
    const claims = (account.idTokenClaims || {}) as Record<string, unknown>;
    const upn =
      (claims.upn as string | undefined) ??
      (claims.preferred_username as string | undefined) ??
      account.username;

    // Build the best display name we can:
    //   1. `name` claim (set by Entra when available, e.g. "Tania Bhattacharjee")
    //   2. `given_name` + `family_name` claims
    //   3. UPN local-part with dots/underscores -> spaces, title-cased
    const givenName = (claims.given_name as string | undefined) ?? "";
    const familyName = (claims.family_name as string | undefined) ?? "";
    const composed = `${givenName} ${familyName}`.trim();
    const loginUserAdID = upn.includes("@") ? upn.split("@")[0] : upn;
    // const loginUserAdID = upn.includes("@") ? upn.split("@")[0] : upn;
    const prettifiedLocal = loginUserAdID
      .replace(/[._-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .map((p) => (p ? p[0].toUpperCase() + p.slice(1).toLowerCase() : p))
      .join(" ");

    const displayName = account.name?.trim() || composed || prettifiedLocal || upn;

    return {
      username: upn,
      upn,
      loginUserAdID,    
      name: displayName,
      oid:
        (claims.oid as string | undefined) ??
        account.localAccountId ??
        account.homeAccountId
    };
  }, [account]);

  const signOut = () => {
    msalInstance.logoutRedirect({
      postLogoutRedirectUri: msalInstance.getConfiguration().auth.postLogoutRedirectUri ?? undefined
    });
  };

  return { user, signOut };
};
