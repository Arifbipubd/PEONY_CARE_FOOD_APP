// Donor service — dashboard and credit preference.
// P2 features (meal orders, money donations) are not implemented yet.

export const getDashboard = async () => {
  await new Promise((r) => setTimeout(r, 500));
  return {
    totalMealsSponsored: 42,
    totalAmountDonatedSgd: 320.0,
    recentActivity: [],
  };
};

export const getCreditPreference = async () => {
  return 'SHOW_NAME' as const;
};

export const updateCreditPreference = async (_pref: 'SHOW_NAME' | 'INITIALS' | 'ANONYMOUS') => {
  await new Promise((r) => setTimeout(r, 300));
};
