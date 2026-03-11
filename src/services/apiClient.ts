const parseResponseBody = async (response: Response) => {
  if (response.status === 204 || response.status === 205) return null;

  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json().catch(() => null);
  }

  return response.text().catch(() => null);
};

export const apiClient = async (url: string, options: RequestInit = {}) => {

  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const body = await parseResponseBody(response);

  if (!response.ok) {
    console.error("API ERROR:", response.status, body);
    throw new Error(`API error ${response.status}`);
  }

  return body;
};