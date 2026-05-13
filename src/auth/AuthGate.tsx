import { useEffect, useState, type ReactNode } from "react";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { InteractionRequiredAuthError, InteractionStatus } from "@azure/msal-browser";
import { loginRequest, ssoSilentRequest } from "./authConfig";

type Props = { children: ReactNode };

/**
 * Blocks rendering of protected routes until an Entra ID session is established.
 * - Attempts silent SSO first (works on AAD/Hybrid-joined devices, Windows Hello).
 * - Falls back to interactive redirect login if silent fails.
 */
export default function AuthGate({ children }: Props) {
  const { instance, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated || inProgress !== InteractionStatus.None) return;

    let cancelled = false;
    (async () => {
      try {
        // If MSAL already has an account cached in this browser, give Entra
        // a loginHint so it can resume the session without showing the
        // account picker (true SSO when the browser session is still valid).
        const cachedAccount =
          instance.getActiveAccount() ?? instance.getAllAccounts()[0] ?? null;
        const silentReq = cachedAccount
          ? { ...ssoSilentRequest, loginHint: cachedAccount.username }
          : ssoSilentRequest;
        await instance.ssoSilent(silentReq);
      } catch (silentError) {
        if (cancelled) return;
        if (silentError instanceof InteractionRequiredAuthError) {
          await instance.loginRedirect(loginRequest);
        } else {
          // Unknown account — full interactive login.
          await instance.loginRedirect(loginRequest);
        }
      }
    })().catch((err) => {
      if (!cancelled) {
        setError(err instanceof Error ? err.message : "Sign-in failed");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [instance, inProgress, isAuthenticated]);

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Sign-in error</h2>
        <p>{error}</p>
        <button onClick={() => instance.loginRedirect(loginRequest)}>Try again</button>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <div style={{ padding: 24 }}>Signing you in&hellip;</div>;
  }

  return <>{children}</>;
}
