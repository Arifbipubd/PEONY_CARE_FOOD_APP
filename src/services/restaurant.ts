// Restaurant service — dashboard, donation management, claims board.
// Returns mock data now. Swap for api calls when backend is ready.

export const getDashboard = async () => {
  await new Promise((r) => setTimeout(r, 500));
  return {
    livesImpacted: 1248,
    donationsThisYear: 156,
    claimRatePct: 96,
    activeCount: 4,
    claimedToday: 28,
  };
};

export const getDonations = async (_status: 'active' | 'past' | 'inactive') => {
  await new Promise((r) => setTimeout(r, 400));
  return [];
};

export const getTodaysClaims = async () => {
  await new Promise((r) => setTimeout(r, 400));
  return { total: 0, claims: [] };
};
