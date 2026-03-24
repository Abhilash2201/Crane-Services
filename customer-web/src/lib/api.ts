import axios, { type AxiosRequestConfig } from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8080";
if (import.meta.env.DEV) {
  console.log("Backend URL:", baseURL);
}

type AuthPayload = {
  accessToken?: string;
  refreshToken?: string;
  refreshExpiresAt?: string;
  user?: { id?: string; name?: string; email?: string; role?: string };
};

const readAuth = (): AuthPayload | null => {
  try {
    const raw = localStorage.getItem("auth");
    return raw ? (JSON.parse(raw) as AuthPayload) : null;
  } catch {
    return null;
  }
};

const writeAuth = (next: AuthPayload | null) => {
  if (!next) {
    localStorage.removeItem("auth");
  } else {
    localStorage.setItem("auth", JSON.stringify(next));
  }
  window.dispatchEvent(new Event("auth-changed"));
};

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const auth = readAuth();
  if (auth?.accessToken && !config.headers?.Authorization) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${auth.accessToken}`,
    };
  }
  return config;
});

let refreshPromise: Promise<AuthPayload | null> | null = null;

type InternalConfig = AxiosRequestConfig & {
  _retry?: boolean;
  skipAuthRefresh?: boolean;
};

const refreshTokens = async () => {
  const auth = readAuth();
  if (!auth?.refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = api
      .post("/auth/refresh", { refreshToken: auth.refreshToken }, { skipAuthRefresh: true } as InternalConfig)
      .then((res) => {
        const data = res.data?.data;
        if (!data?.accessToken || !data?.refreshToken) return null;
        const merged: AuthPayload = {
          ...auth,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          refreshExpiresAt: data.refreshExpiresAt,
          user: data.user || auth.user,
        };
        writeAuth(merged);
        api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
        return merged;
      })
      .catch(() => {
        writeAuth(null);
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = (error.config || {}) as InternalConfig;
    if (original.skipAuthRefresh) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshed = await refreshTokens();
      if (refreshed?.accessToken) {
        original.headers = {
          ...original.headers,
          Authorization: `Bearer ${refreshed.accessToken}`,
        };
        return api(original);
      }
    }
    return Promise.reject(error);
  },
);
