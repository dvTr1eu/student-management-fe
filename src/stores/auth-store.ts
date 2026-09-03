import { authUserFromAccessToken } from "@/features/auth/lib/jwt";
import { getCookie, removeCookie, setCookie } from "@/lib/cookies";
import { create } from "zustand";

const ACCESS_TOKEN = "thisisjustarandomstring";
const AUTH_USER = "auth-user";

export interface AuthUser {
  accountNo: string;
  email: string;
  name?: string;
  role: string[];
  exp: number;
}

interface AuthState {
  auth: {
    user: AuthUser | null;
    setUser: (user: AuthUser | null) => void;
    accessToken: string;
    setAccessToken: (accessToken: string) => void;
    resetAccessToken: () => void;
    reset: () => void;
  };
}

function parseUserCookie(value: string | undefined): AuthUser | null {
  if (!value) return null;
  try {
    const raw = value.includes("%") ? decodeURIComponent(value) : value;
    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed?.email || !Array.isArray(parsed.role)) return null;
    if (typeof parsed.exp === "number" && parsed.exp < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

function persistUser(user: AuthUser | null) {
  if (!user) {
    removeCookie(AUTH_USER);
    return;
  }
  setCookie(AUTH_USER, encodeURIComponent(JSON.stringify(user)));
}

function resolveUserFromToken(token: string): AuthUser | null {
  return authUserFromAccessToken(token);
}

export const useAuthStore = create<AuthState>()((set) => {
  const cookieState = getCookie(ACCESS_TOKEN);
  let initToken = "";
  try {
    initToken = cookieState ? JSON.parse(cookieState) : "";
  } catch {
    initToken = "";
  }

  let initUser = parseUserCookie(getCookie(AUTH_USER));
  // Luôn ưu tiên parse lại từ JWT để tránh tên tiếng Việt bị lỗi encoding cũ trong cookie
  if (initToken) {
    const fromToken = resolveUserFromToken(initToken);
    if (fromToken) {
      initUser = fromToken;
      persistUser(initUser);
    }
  }

  const accessToken = initToken && initUser ? initToken : "";
  if (initToken && !initUser) {
    removeCookie(ACCESS_TOKEN);
  }

  return {
    auth: {
      user: accessToken ? initUser : null,
      setUser: (user) =>
        set((state) => {
          persistUser(user);
          return { ...state, auth: { ...state.auth, user } };
        }),
      accessToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          setCookie(ACCESS_TOKEN, JSON.stringify(accessToken));
          return { ...state, auth: { ...state.auth, accessToken } };
        }),
      resetAccessToken: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN);
          return { ...state, auth: { ...state.auth, accessToken: "" } };
        }),
      reset: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN);
          removeCookie(AUTH_USER);
          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: "" },
          };
        }),
    },
  };
});
