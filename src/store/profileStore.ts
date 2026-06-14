// Profile store — holds the logged-in user's profile data.
// Populated after login; cleared on logout.

import { create } from 'zustand';

interface ProfileStore {
  displayName: string;
  photoUrl: string | null;
  // Receiver stats
  totalClaims: number;
  // Donor stats
  totalMealsSponsored: number;
  // Restaurant stats
  totalFoodShared: number;

  setProfile: (data: Partial<Omit<ProfileStore, 'setProfile' | 'clearProfile'>>) => void;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  displayName:         '',
  photoUrl:            null,
  totalClaims:         0,
  totalMealsSponsored: 0,
  totalFoodShared:     0,

  setProfile: (data) => set((state) => ({ ...state, ...data })),
  clearProfile: () =>
    set({
      displayName: '', photoUrl: null,
      totalClaims: 0, totalMealsSponsored: 0, totalFoodShared: 0,
    }),
}));
