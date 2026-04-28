
import { UserManager } from "oidc-client-ts";

// Define redirect URI safely for Next.js
const getRedirectUri = () => {
  if (typeof window !== "undefined") {
    // Runs only in browser
    return `${window.location.origin}/`;
  }
  // Fallback (used during SSR)
  return "/";
};

export const KEYCLOAK_CONFIG = Object.freeze({
  automaticSilentRenew: true,
  scope: process.env.NEXT_PUBLIC_KC_SCOPE ?? "openid profile email role",
  authority: process.env.NEXT_PUBLIC_KC_AUTHORITY ?? "http://192.168.1.160:8080/realms/cms",
  client_id: process.env.NEXT_PUBLIC_KC_CLIENT_ID ?? "front",
  post_logout_redirect_uri: getRedirectUri(),
  response_type: "code",
  response_mode: "query",
  logout_endpoint: "/protocol/openid-connect/logout",
  redirect_uri: getRedirectUri(),
});

// Lazy UserManager creation to avoid window reference on import
let userManagerInstance: UserManager | null = null;

export const getUserManager = () => {
  if (!userManagerInstance) {
    userManagerInstance = new UserManager(KEYCLOAK_CONFIG);
  }
  return userManagerInstance;
};

// Helper functions
export const getUser = async () => getUserManager().getUser();
export const signinCallback = async () => getUserManager().signinCallback();
export const login = async () => getUserManager().signinRedirect();
export const logout = async () => getUserManager().signoutRedirect();
