import { useSyncExternalStore } from "react";
import axios from "axios";
import { installAuthInterceptors } from "@/lib/axios";
import { authService } from "@/service/authService";
import type {
  AuthErrorResponse,
  AuthLoginResponse,
  AuthRefreshResponse,
  AuthRegisterResponse,
  AuthSession,
  AuthState,
  AuthTokenPayload,
  LoginFormValues,
  RegisterFormValues,
} from "@/types/auth";

type Listener = () => void;

const listeners = new Set<Listener>();

let refreshPromise: Promise<AuthRefreshResponse> | null = null;
let bootstrapPromise: Promise<void> | null = null;

const decodeSession = (accessToken: string): AuthSession | null => {
  try {
    const payloadPart = accessToken.split(".")[1];
    if (!payloadPart) {
      return null;
    }

    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
    const payload = JSON.parse(
      atob(normalized + padding),
    ) as Partial<AuthTokenPayload>;

    if (typeof payload.userId !== "string") {
      return null;
    }

    const email =
      typeof payload.email === "string" ? payload.email : undefined;
    const role =
      payload.role === "user" || payload.role === "admin"
        ? payload.role
        : undefined;
    const expiresAt =
      typeof payload.exp === "number" ? payload.exp * 1000 : null;

    if (expiresAt !== null && expiresAt <= Date.now()) {
      return null;
    }

    return {
      accessToken,
      userId: payload.userId,
      email,
      role,
      iat: typeof payload.iat === "number" ? payload.iat : undefined,
      exp: typeof payload.exp === "number" ? payload.exp : undefined,
      expiresAt,
    };
  } catch {
    return null;
  }
};

const createInitialState = (): AuthState => ({
  accessToken: null,
  session: null,
  isLoading: false,
  error: null,
});

let state: AuthState = createInitialState();

const notify = () => {
  listeners.forEach((listener) => listener());
};

const setState = (updater: (current: AuthState) => AuthState) => {
  state = updater(state);
  notify();
};

const clearSession = () => {
  setState(() => ({
    accessToken: null,
    session: null,
    isLoading: false,
    error: null,
  }));
};

const commitSession = (accessToken: string) => {
  const session = decodeSession(accessToken);

  if (!session) {
    throw new Error("Token khong hop le");
  }

  setState((current) => ({
    ...current,
    accessToken,
    session,
    isLoading: false,
    error: null,
  }));
};

const hasValidAccessToken = () => {
  const expiresAt = state.session?.expiresAt;

  return (
    typeof state.accessToken === "string" &&
    typeof expiresAt === "number" &&
    expiresAt > Date.now()
  );
};

const getAuthErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<AuthErrorResponse>(error)) {
    return (
      error.response?.data?.message ??
      error.message ??
      "Da xay ra loi khong xac dinh"
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Da xay ra loi khong xac dinh";
};

const beginRequest = () => {
  setState((current) => ({
    ...current,
    isLoading: true,
    error: null,
  }));
};

const login = async (
  values: LoginFormValues,
): Promise<AuthLoginResponse> => {
  beginRequest();

  try {
    const response = await authService.login(values);
    commitSession(response.accessToken);
    return response;
  } catch (error) {
    const message = getAuthErrorMessage(error);
    setState((current) => ({
      ...current,
      isLoading: false,
      error: message,
    }));
    throw new Error(message, { cause: error });
  }
};

const register = async (
  values: RegisterFormValues,
): Promise<AuthRegisterResponse> => {
  beginRequest();

  try {
    const response = await authService.register(values);
    setState((current) => ({
      ...current,
      isLoading: false,
      error: null,
    }));
    return response;
  } catch (error) {
    const message = getAuthErrorMessage(error);
    setState((current) => ({
      ...current,
      isLoading: false,
      error: message,
    }));
    throw new Error(message, { cause: error });
  }
};

const logout = async (): Promise<void> => {
  beginRequest();

  try {
    await authService.logout();
  } finally {
    clearSession();
  }
};

const refreshAccessToken = async (): Promise<AuthRefreshResponse> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await authService.refresh();
      commitSession(response.accessToken);
      return response;
    } catch (error) {
      clearSession();
      throw new Error(getAuthErrorMessage(error), { cause: error });
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

const bootstrapSession = async (): Promise<void> => {
  if (hasValidAccessToken()) {
    return;
  }

  if (bootstrapPromise) {
    return bootstrapPromise;
  }

  bootstrapPromise = (async () => {
    try {
      await refreshAccessToken();
    } catch {
      clearSession();
    } finally {
      bootstrapPromise = null;
    }
  })();

  return bootstrapPromise;
};

const clearError = () => {
  if (!state.error) {
    return;
  }

  setState((current) => ({
    ...current,
    error: null,
  }));
};

const subscribe = (listener: Listener) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

installAuthInterceptors({
  getAccessToken: () => state.accessToken,
  refreshAccessToken: () => refreshAccessToken().then(() => undefined),
  isAccessTokenExpired: () => !hasValidAccessToken(),
  onRefreshFailure: clearSession,
});

export const authStore = {
  getState: () => state,
  subscribe,
  login,
  register,
  logout,
  refreshAccessToken,
  bootstrapSession,
  clearError,
};

export const useAuthStore = () =>
  useSyncExternalStore(
    authStore.subscribe,
    authStore.getState,
    authStore.getState,
  );
