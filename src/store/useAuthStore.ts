import { createStore } from "./store";

interface AuthState {
  accessToken: string | null;
  isAuthReady: boolean;
  setAccessToken: (token: string | null) => void;
  clearAuth: () => void;
  setAuthReady: () => void;
}

export const useAuthStore = createStore<AuthState>((set) => ({
  accessToken: null,
  isAuthReady: false,
  setAccessToken: (token) => set({ accessToken: token }),
  clearAuth: () => set({ accessToken: null }),
  setAuthReady: () => set({ isAuthReady: true }),
}));
