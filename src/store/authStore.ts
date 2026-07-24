import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getItemAsync, setItemAsync, deleteItemAsync } from 'expo-secure-store';
import { AuthUser } from '../types';

const secureStorage = createJSONStorage(() => ({
  getItem:    (key: string) => getItemAsync(key),
  setItem:    (key: string, value: string) => setItemAsync(key, value),
  removeItem: (key: string) => deleteItemAsync(key),
}));

interface AuthStore {
  accessToken:  string | null;
  refreshToken: string | null;
  user:         AuthUser | null;
  isApproved:   boolean;
  isHydrated:   boolean;

  setAuth:     (accessToken: string, refreshToken: string, user: AuthUser, isApproved?: boolean) => void;
  setApproved: (value: boolean) => void;
  clearAuth:   () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      accessToken:  null,
      refreshToken: null,
      user:         null,
      isApproved:   false,
      isHydrated:   false,

      setAuth: (accessToken, refreshToken, user, isApproved = false) =>
        set({ accessToken, refreshToken, user, isApproved }),

      setApproved: (value) => set({ isApproved: value }),

      clearAuth: () =>
        set({ accessToken: null, refreshToken: null, user: null, isApproved: false }),
    }),
    {
      name: 'peony-auth',
      storage: secureStorage,
      partialize: (state) => ({
        accessToken:  state.accessToken,
        refreshToken: state.refreshToken,
        user:         state.user,
        isApproved:   state.isApproved,
      }),
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ isHydrated: true });
      },
    },
  ),
);
