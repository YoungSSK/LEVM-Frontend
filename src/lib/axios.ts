import axios, {
  AxiosHeaders,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

type AuthAwareConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

type AuthInterceptorOptions = {
  getAccessToken: () => string | null;
  refreshAccessToken: () => Promise<void>;
  isAccessTokenExpired: () => boolean;
  onRefreshFailure?: () => void;
};

let interceptorsInstalled = false;

const authEndpoints = ["/auth/login", "/auth/register", "/auth/logout", "/auth/refresh"];

const isAuthEndpoint = (url?: string | null) => {
  if (!url) {
    return false;
  }

  return authEndpoints.some((endpoint) => url.includes(endpoint));
};

const setBearerToken = (
  headers: InternalAxiosRequestConfig["headers"],
  token: string,
) => {
  if (headers instanceof AxiosHeaders) {
    headers.set("Authorization", `Bearer ${token}`);
    return;
  }

  (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
};

export const installAuthInterceptors = ({
  getAccessToken,
  refreshAccessToken,
  isAccessTokenExpired,
  onRefreshFailure,
}: AuthInterceptorOptions) => {
  if (interceptorsInstalled) {
    return;
  }

  interceptorsInstalled = true;

  api.interceptors.request.use(async (config) => {
    if (!isAuthEndpoint(config.url)) {
      if (isAccessTokenExpired()) {
        try {
          await refreshAccessToken();
        } catch (error) {
          onRefreshFailure?.();
          return Promise.reject(error);
        }
      }

      const token = getAccessToken();
      if (token) {
        config.headers = config.headers ?? {};
        setBearerToken(config.headers, token);
      }
    }

    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as AuthAwareConfig | undefined;

      if (
        !originalRequest ||
        error.response?.status !== 401 ||
        originalRequest._retry ||
        isAuthEndpoint(originalRequest.url)
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        await refreshAccessToken();
        const token = getAccessToken();

        if (token) {
          originalRequest.headers = originalRequest.headers ?? {};
          setBearerToken(originalRequest.headers, token);
        }

        return api(originalRequest);
      } catch (refreshError) {
        onRefreshFailure?.();
        return Promise.reject(refreshError);
      }
    },
  );
};
