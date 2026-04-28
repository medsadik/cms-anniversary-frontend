import { createSource } from "react-async-states";
import { ProducerProps } from "async-states";
import { User } from "oidc-client-ts";
import { containsAuthTokensInUrl } from "../hasCodeInUrl";
import { getUser, login, signinCallback } from "../keycloakConfig";
import { BuyTrackUser } from "../useCurrentUser";
import { AxiosRequestHeaders } from "axios";
import { jwtDecode } from "jwt-decode";
import api from "@/lib/api";

export const WAITING_LOGIN_ERROR = new Error(
  "User authentication required. Please log in."
);

async function getCurrentUserTeamRoles(token: string): Promise<string[]> {
  try {
    const decodedToken: any = jwtDecode(token);

    const resourceRoles = Object.values(decodedToken?.resource_access || {}).flatMap(
      (resource: any) => resource.roles || []
    );

    const realmRoles = decodedToken?.realm_access?.roles || [];
    return [...new Set([...resourceRoles, ...realmRoles])];
  } catch (error) {
    console.error("Failed to decode token or extract roles", error);
    return [];
  }
}

export async function ensureAuth(): Promise<User | "waiting-login"> {
  const user = await getUser();
  if (!user || user.expired) {
    login(); // trigger redirect
    return "waiting-login";
  }
  return user;
}

function createBuyTrackUser(user: User, teamRoles: string[]): BuyTrackUser {
  const buyTrackUser = user as BuyTrackUser;
  buyTrackUser.roles = new Set(teamRoles);
  return buyTrackUser;
}

function injectInterceptors(onAbort: ProducerProps<any>["onAbort"], user: BuyTrackUser) {
  const tokenInjection = addTokenToAPI(user.access_token);
  onAbort(() => api.interceptors.request.eject(tokenInjection));
  const responseRejection = addResponseRejection();
  onAbort(() => api.interceptors.response.eject(responseRejection));
  return user;
}

function addTokenToAPI(token: string) {
  return api.interceptors.request.use(
    (config) => {
      if (!config.headers) config.headers = {} as AxiosRequestHeaders;
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => Promise.reject(error)
  );
}

function addResponseRejection() {
  return api.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error.response?.data || error)
  );
}

export const currentUserSource = createSource(
  "current-user",
  async function producer(props: ProducerProps<BuyTrackUser>) {
    const handleUser = async (user: User) => {
      const teamRoles = await getCurrentUserTeamRoles(user.access_token);
      return injectInterceptors(props.onAbort, createBuyTrackUser(user, teamRoles));
    };

    if (containsAuthTokensInUrl(window.location)) {
      try {
        const user = await signinCallback();
        if (!user) {
          const ensured = await ensureAuth();
          if (ensured === "waiting-login") return Promise.reject(WAITING_LOGIN_ERROR);
          return handleUser(ensured);
        }
        return handleUser(user);
      } catch {
        // signinCallback failed (e.g. stale state, expired code) — start a fresh login
        const ensured = await ensureAuth();
        if (ensured === "waiting-login") return Promise.reject(WAITING_LOGIN_ERROR);
        return handleUser(ensured);
      }
    }

    const ensured = await ensureAuth();
    if (ensured === "waiting-login") return Promise.reject(WAITING_LOGIN_ERROR);
    return handleUser(ensured);
  },
  {
    keepPendingForMs: 200,
    skipPendingDelayMs: 300,
  }
);
