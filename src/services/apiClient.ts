const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

import { getApiAccessToken } from "../auth/tokenService";

export const resolveApiUrl = (url: string) => {
  if (!API_BASE_URL) return url;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/")) return `${API_BASE_URL}${url}`;
  return `${API_BASE_URL}/${url}`;
};

const resolveUrl = resolveApiUrl;

const parseResponseBody = async (response: Response) => {
  if (response.status === 204 || response.status === 205) return null;

  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json().catch(() => null);
  }

  return response.text().catch(() => null);
};

const GET_CACHE_TTL_MS = 2 * 60 * 1000;

type CacheEntry = {
  expiresAt: number;
  data: unknown;
};

const getResponseCache = new Map<string, CacheEntry>();
const inFlightGetRequests = new Map<string, Promise<unknown>>();

export const invalidateApiGetCache = () => {
  getResponseCache.clear();
};

export const apiClient = async (url: string, options: RequestInit = {}) => {
  const method = String(options.method || "GET").toUpperCase();
  const isCacheableGet = method === "GET";
  const requestKey = `${method}:${url}`;

  if (isCacheableGet) {
    const now = Date.now();
    const cached = getResponseCache.get(requestKey);

    if (cached && cached.expiresAt > now) {
      return cached.data;
    }

    if (cached && cached.expiresAt <= now) {
      getResponseCache.delete(requestKey);
    }

    const inFlight = inFlightGetRequests.get(requestKey);
    if (inFlight) {
      return inFlight;
    }
  }

  const requestPromise = (async () => {
    const isFormData = options.body instanceof FormData;

    // Attach an Entra ID access token. Calls to non-API absolute URLs are
    // skipped so we never leak the bearer to third-party hosts.
    const isApiCall =
      url.startsWith("/") || url.startsWith("api/") || url.includes("/api/");
    let authHeader: Record<string, string> = {};
    if (isApiCall) {
      try {
        const token = await getApiAccessToken();
        authHeader = { Authorization: `Bearer ${token}` };
      } catch (tokenError) {
        // getApiAccessToken throws after triggering a redirect; surface anything else.
        const message =
          tokenError instanceof Error ? tokenError.message : "Authentication failed";
        if (!message.startsWith("Redirecting")) {
          throw tokenError;
        }
        // Browser is navigating away; resolve to a never-completing promise.
        return await new Promise<never>(() => {});
      }
    }

    const response = await fetch(resolveUrl(url), {
      ...options,
      headers: {
        ...(!isFormData ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {}),
        ...authHeader
      }
    });

    const body = await parseResponseBody(response);

    if (!response.ok) {
      const responseMessage =
        body && typeof body === "object" && "message" in body
          ? String(body.message || "")
          : "";

      const error = new Error(responseMessage || `API error ${response.status}`);
      (error as Error & { status?: number; responseBody?: unknown }).status = response.status;
      (error as Error & { status?: number; responseBody?: unknown }).responseBody = body;
      throw error;
    }

    // Guard: API endpoints must return JSON. If the server returned HTML
    // (e.g. SPA fallback because the IIS reverse-proxy/ARR is misconfigured),
    // treat it as an error instead of silently returning index.html as data.
    const contentType = response.headers.get("content-type") || "";
    if (
      url.includes("/api/") &&
      !contentType.includes("application/json") &&
      typeof body === "string" &&
      body.trimStart().toLowerCase().startsWith("<!doctype")
    ) {
      const error = new Error(
        "API returned HTML instead of JSON. The reverse proxy to the API server is not configured (install IIS ARR and enable proxy)."
      );
      (error as Error & { status?: number }).status = response.status;
      throw error;
    }

    if (!isCacheableGet) {
      invalidateApiGetCache();
    }

    if (isCacheableGet) {
      getResponseCache.set(requestKey, {
        expiresAt: Date.now() + GET_CACHE_TTL_MS,
        data: body
      });
    }

    return body;
  })();

  if (!isCacheableGet) {
    return requestPromise;
  }

  inFlightGetRequests.set(requestKey, requestPromise);

  try {
    return await requestPromise;
  } finally {
    inFlightGetRequests.delete(requestKey);
  }
};
