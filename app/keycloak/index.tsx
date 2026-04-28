"use client";

import { useMemo } from "react";
import { useAsync } from "react-async-states";
import { UserManager } from "oidc-client-ts";
import { useRouter } from "next/navigation";
import { currentUserSource, WAITING_LOGIN_ERROR } from "./data/ressources";
import { containsAuthTokensInUrl } from "./hasCodeInUrl";

type AuthProviderProps = {
  userManager: UserManager;
  children: React.ReactNode;
};

const PREVIOUS_PATHNAME_LS_KEY = "tickifyinitialPathname";

export default function AuthProvider({ userManager, children }: AuthProviderProps) {
  const router = useRouter();

  const manager = useMemo(() => userManager, [userManager]);

  const { isSuccess, isError, error, isInitial } = useAsync(
    {
      lazy: false,
      source: currentUserSource,
      events: {
        change: (newState: any) => {
          if (
            newState.state.status === "success" &&
            typeof window !== "undefined" &&
            window.location.pathname &&
            window.location.search &&
            window.location.hash &&
            window.location.href &&
            window.location.origin &&
            window.location.host &&
            window.location.hostname &&
            window.location.port
          ) {
            // redirect to home if URL contains auth tokens
            if (newState.state.value && containsAuthTokensInUrl(window.location)) {
              router.replace("/dashboard");
              localStorage.removeItem(PREVIOUS_PATHNAME_LS_KEY);
            }
          }
        },
      },
    },
    [manager]
  );

  if (isInitial) return null; // waiting for async init

  if (isSuccess) return <>{children}</>; // authenticated → render app

  if (isError) {
    if (error === WAITING_LOGIN_ERROR) return null; // waiting for login redirect
    // Any other error: clear stale OIDC state and retry login
    console.error("Authentication error — retrying login:", error);
    import("@/app/keycloak/keycloakConfig").then(({ login }) => login());
    return null;
  }

  // fallback loading
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      Loading authentication...
    </div>
  );
}
