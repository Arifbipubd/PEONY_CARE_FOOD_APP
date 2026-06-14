// Auth store — holds the logged-in user's tokens and identity.
// Every screen checks this to know if the user is logged in and what role they are.
// Zustand is like a global variable that any component can read or update.

import { create } from 'zustand';
import { AuthUser } from '../types';

interface AuthStore {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isApproved: boolean;

  // Actions
  setAuth: (accessToken: string, refreshToken: string, user: AuthUser, isApproved?: boolean) => void;
  setApproved: (value: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken:  null,
  refreshToken: null,
  user:         null,
  isApproved:   false,

  setAuth: (accessToken, refreshToken, user, isApproved = false) =>
    set({ accessToken, refreshToken, user, isApproved }),

  setApproved: (value) => set({ isApproved: value }),

  clearAuth: () =>
    set({ accessToken: null, refreshToken: null, user: null, isApproved: false }),
}));
