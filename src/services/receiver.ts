// Receiver service — food browsing, search, and claiming.
// Returns mock data now. Swap for api calls when backend is ready.

import { FoodItem, Claim, DailyLimitStatus } from '../types';
import { MOCK_FOOD_ITEMS } from '../mock/foodItems';

export const browseFood = async (): Promise<FoodItem[]> => {
  await new Promise((r) => setTimeout(r, 600));
  return MOCK_FOOD_ITEMS;
};

export const searchFood = async (_query: string): Promise<FoodItem[]> => {
  await new Promise((r) => setTimeout(r, 400));
  return MOCK_FOOD_ITEMS.filter((f) =>
    f.name.toLowerCase().includes(_query.toLowerCase())
  );
};

export const getFoodDetail = async (id: string): Promise<FoodItem> => {
  await new Promise((r) => setTimeout(r, 300));
  const item = MOCK_FOOD_ITEMS.find((f) => f.id === id);
  if (!item) throw new Error('Food not found');
  return item;
};

export const getDailyLimit = async (): Promise<DailyLimitStatus> => {
  return { used: 0, limit: 1, canClaim: true, resetsAt: '2026-06-15T00:00:00+08:00' };
};

export const claimFood = async (_qrPayload: string): Promise<Claim> => {
  await new Promise((r) => setTimeout(r, 1000));
  return {
    claimId: 'mock-claim-001',
    status: 'CLAIMED',
    foodName: 'Chicken Rice (1 pack)',
    restaurantName: 'Tian Tian Hainanese',
    pickupAddress: '443 Joo Chiat Rd, Singapore 427656',
    distanceKm: 0.8,
    pickupWindow: 'Today, 6:00 PM — 8:00 PM',
    claimedAt: new Date().toISOString(),
    message: 'Show this confirmation at the counter to collect your meal.',
    dailyLimit: { used: 1, limit: 1 },
  };
};
