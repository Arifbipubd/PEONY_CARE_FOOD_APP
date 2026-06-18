// Donor service — dashboard and credit preference.
// MOCK MODE ACTIVE — real API calls are commented out below each function.
// P2 features (meal orders, money donations) are not implemented yet.
// import { api } from './api';

export interface DonorDashboard {
  total_meals_sponsored: number;
  total_amount_donated_sgd: string;
}

function mapApiDonorDashboard(d: DonorDashboard) {
  return {
    totalMealsSponsored: d.total_meals_sponsored,
    totalAmountDonatedSgd: parseFloat(d.total_amount_donated_sgd),
  };
}

const MOCK_DONOR_DASHBOARD: DonorDashboard = {
  total_meals_sponsored: 42,
  total_amount_donated_sgd: '320.00',
};

export const getDashboard = async () => {
  // MOCK:
  await new Promise((r) => setTimeout(r, 500));
  return mapApiDonorDashboard(MOCK_DONOR_DASHBOARD);
  /* REAL API:
  const res = await api.get('/donor/dashboard/');
  return mapApiDonorDashboard(res.data.data);
  */
};

export const getCreditPreference = async (): Promise<'SHOW_NAME' | 'INITIALS' | 'ANONYMOUS'> => {
  // MOCK:
  return 'SHOW_NAME';
  /* REAL API:
  const res = await api.get('/donor/profile/');
  return res.data.data.credit_preference;
  */
};

export const updateCreditPreference = async (
  _pref: 'SHOW_NAME' | 'INITIALS' | 'ANONYMOUS',
): Promise<void> => {
  // MOCK: no-op
  await new Promise((r) => setTimeout(r, 300));
  /* REAL API:
  await api.patch('/donor/profile/', { credit_preference: _pref });
  */
};
