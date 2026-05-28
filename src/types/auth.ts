export type AuthRole = "user" | "admin";

export type AuthTab = "login" | "register";

export type LoginFormValues = {
  email: string;
  password: string;
};

export type RegisterFormValues = {
  username: string;
  email: string;
  password: string;
};

export type AuthTokenPayload = {
  userId: string;
  email?: string;
  role?: AuthRole;
  iat?: number;
  exp?: number;
};

export type AuthSession = AuthTokenPayload & {
  accessToken: string;
  expiresAt: number | null;
};

export type AuthRegisterResponse = {
  success: boolean;
  message: string;
};

export type AuthLoginResponse = {
  success: boolean;
  message: string;
  accessToken: string;
};

export type AuthRefreshResponse = {
  success: boolean;
  accessToken: string;
};

export type AuthErrorResponse = {
  success?: boolean;
  message?: string;
};

export type AuthState = {
  accessToken: string | null;
  session: AuthSession | null;
  isLoading: boolean;
  error: string | null;
};
