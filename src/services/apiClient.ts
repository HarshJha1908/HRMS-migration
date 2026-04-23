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
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      ...(!isFormData ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {})
      },
      ...options
    });

    const body = await parseResponseBody(response);

    if (!response.ok) {
      console.error("API ERROR:", response.status, body);
      const responseMessage =
        body && typeof body === "object" && "message" in body
          ? String(body.message || "")
          : "";

      const error = new Error(responseMessage || `API error ${response.status}`);
      (error as Error & { status?: number; responseBody?: unknown }).status = response.status;
      (error as Error & { status?: number; responseBody?: unknown }).responseBody = body;
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
