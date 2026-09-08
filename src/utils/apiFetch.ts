const API_URL = import.meta.env.VITE_API_URL;

let refreshPromise: Promise<boolean> | null = null;

const refreshAccessToken = (): Promise<boolean> => {
  // If a refresh is already in flight, everyone waits on the same one
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/api/auth/refresh/adminToken`, {
      method: "GET",
      credentials: "include",
    })
      .then((r) => r.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

export const apiFetch = async (
  endpoint: string,
  options: RequestInit = {},
  isRetry = false,
): Promise<Response> => {
  const res = await fetch(`${API_URL}${endpoint}`, {
    credentials: "include",
    ...options,
  });

  const isAuthCall =
    endpoint.includes("/auth/refresh") || endpoint.includes("/auth/login");

  // access token expired → refresh once → retry the original call
  if (res.status === 401 && !isRetry && !isAuthCall) {
    const ok = await refreshAccessToken();
    if (ok) {
      return apiFetch(endpoint, options, true); // retry with fresh token
    }
  }

  return res;
};
