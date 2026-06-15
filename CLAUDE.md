# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## How to Work With the Developer

The developer is learning React Native and Expo while building this project. **Before writing any code for a step, always:**

1. Explain what the step does and WHY it is needed — in plain, simple language
2. List every file that will be created or changed and what each one is responsible for
3. Show which libraries/packages are involved and what they do
4. Wait for the developer to say "go ahead" or "approved" before generating any code
5. After implementing, briefly explain what was just built so the developer understands it

Never assume the developer already knows a concept. If a step involves a new concept (navigation, state management, hooks, etc.) explain it in 2–3 plain sentences before the plan.

---

## Project Overview

**Peony Care** — complementary meal donation app for Singaporeans in need. **Never use the term "free meal"** — always use "complementary meal" throughout all UI text, copy, comments, and documentation.  
**Three roles:** Receiver (claims food) · Restaurant (posts listings) · Donor (sponsors — P2)  
**Stack:** React Native + Expo · TypeScript strict · Android  
**Backend:** Separate Django REST project (not in this repo). All screens use mock/dummy data now. Real API is connected later by swapping service functions.

---

## Repository Structure

```
peony-care-food-app/
├── src/
│   ├── constants/
│   │   └── theme.ts              # ALL design tokens — import from here only
│   ├── navigation/
│   │   ├── RootNavigator.tsx     # Auth check → routes to correct role shell
│   │   ├── AuthStack.tsx
│   │   ├── ReceiverTabs.tsx
│   │   ├── DonorTabs.tsx
│   │   └── RestaurantTabs.tsx
│   ├── screens/
│   │   ├── shared/               # Splash, Login, OTP, Register
│   │   ├── receiver/
│   │   ├── donor/
│   │   └── restaurant/
│   ├── components/               # Shared UI: Button, Card, Badge, Input, BottomSheet…
│   ├── services/                 # API call functions (mock data returns for now)
│   │   ├── api.ts                # Axios instance skeleton (wired when backend ready)
│   │   ├── auth.ts
│   │   ├── receiver.ts
│   │   ├── donor.ts
│   │   ├── restaurant.ts
│   │   └── notifications.ts
│   ├── mock/                     # Mock data objects used by service functions
│   ├── store/                    # Zustand slices
│   │   ├── authStore.ts
│   │   ├── profileStore.ts
│   │   └── notificationStore.ts
│   ├── hooks/                    # useLocation, useNotifications, etc.
│   ├── types/                    # TS types mirroring future API response shapes
│   └── utils/                    # formatDistance, formatSGT, etc.
├── assets/
├── app.json
├── package.json
├── tsconfig.json
└── CLAUDE.md
```

---

## Development Commands

```bash
# Install dependencies
npm install

# Start Expo dev server
npx expo start

# Android only
npx expo start --android

# Clear Metro cache
npx expo start --clear

# TypeScript check (run before every commit)
npx tsc --noEmit

# Lint
npx eslint src/ --ext .ts,.tsx

# Run all tests
npm test

# Run a single test file
npm test -- src/screens/receiver/HomeScreen.test.tsx
```

---

## Design System — `src/constants/theme.ts`

**Never hardcode hex values or magic numbers in components.** Always import from `theme.ts`.

**Semantic color tokens:**
```ts
colors.accentPrimary   // #D31B1B  — primary red (buttons, links, active tab, brand)
colors.accentLight     // #FEF2F2  — light red tint (chip/badge backgrounds)
colors.surface         // #FFFFFF  — screen & card background
colors.textPrimary     // #1A1A2E  — headings (dark navy)
colors.textMuted       // #6B7280  — body text, secondary labels
colors.textInverse     // #FFFFFF  — text on red backgrounds
colors.borderDefault   // #E5E7EB
colors.successGreen    // #26A34E
colors.warningYellow   // #F59E0B
```

**Spacing scale (px):**
```ts
spacing.xs   // 3     spacing.sm   // 6
spacing.md   // 10    spacing.lg   // 14
spacing.xl   // 18    spacing['2xl'] // 24
spacing['3xl'] // 28  spacing['4xl'] // 32
```

**Border radius:**
```ts
radius.pill   // 100  — pill buttons, full chips
radius.card   // 18   — food listing cards
radius.sheet  // 28   — bottom sheets / modals
radius.input  // 14   — text inputs
radius.chip   // 22   — category filter chips
radius.badge  // 10   — status badges
radius.sm     // 8
radius.xs     // 4
```

---

## Navigation Architecture

`RootNavigator` reads `accessToken` + `user.role` from `useAuthStore`. No token → `AuthStack`. Valid token → role-specific tab navigator.

```
RootNavigator
├── AuthStack
│   ├── SplashScreen
│   ├── LoginScreen        — phone number entry
│   ├── OtpScreen          — 6-digit code verify
│   └── RegisterScreen     — role-specific fields (name / restaurant details)
│
├── ReceiverTabs           — role === 'RECEIVER'
│   ├── Home    → ReceiverHomeScreen → FoodDetailScreen → RestaurantPageScreen
│   ├── Scan    → QrScannerScreen → ClaimSuccessScreen
│   ├── Alerts  → NotificationsScreen
│   └── Profile → ReceiverProfileScreen → LocationSettingsScreen
│
├── DonorTabs              — role === 'DONOR'
│   ├── Home    → DonorHomeScreen
│   ├── History → DonorHistoryScreen
│   ├── Alerts  → NotificationsScreen
│   └── Profile → DonorProfileScreen → CreditPreferenceScreen
│
└── RestaurantTabs         — role === 'RESTAURANT'
    ├── Home    → RestaurantDashboardScreen
    ├── Manage  → DonationListScreen → DonationDetailScreen → PostDonationScreen
    ├── Claims  → TodaysClaimsScreen
    └── Profile → RestaurantProfileScreen
```

**Restaurant approval gate:** If `user.isApproved === false` after login, render `ApprovalPendingScreen` instead of the tab navigator.

---

## API Service Pattern

Each file in `src/services/` exports typed async functions. Right now they return mock data from `src/mock/`. When backend is ready, replace the mock return with an Axios call — nothing else in the codebase changes.

```ts
// src/services/receiver.ts  — current (mock)
export const browseFood = async (): Promise<FoodItem[]> => {
  return MOCK_FOOD_ITEMS;
};

// src/services/receiver.ts  — after backend is ready
export const browseFood = async (params: BrowseParams): Promise<FoodItem[]> => {
  const { data } = await api.get('/receiver/donations/browse/', { params });
  return data;
};
```

`src/services/api.ts` holds the Axios instance skeleton with JWT interceptor stubs, ready to activate when backend is available.

---

## State Management — Zustand

| Store | Key fields |
|-------|-----------|
| `useAuthStore` | `accessToken`, `refreshToken`, `user: { id, role, phone }`, `isApproved` |
| `useProfileStore` | `displayName`, `photoUrl`, role-specific stats |
| `useNotificationStore` | `notifications[]`, `unreadCount` |

Persist `useAuthStore` to `AsyncStorage` (user meta) and `expo-secure-store` (tokens).

---

## Key Business Rules (reflected in mock data and UI states)

1. **Claim is instant** — QR scan → `CLAIMED` immediately. No pending step, no restaurant confirmation.
2. **Daily limit = 1** claim per receiver per Singapore calendar day. Show `DailyLimitScreen` (7-3) when hit.
3. **Proximity = 500 m** max between receiver GPS and restaurant. Show `ScanErrorScreen` (7-4) if too far.
4. **Food QR payload format:** `{food_id}|{restaurant_id}|{unix_timestamp}`.
5. **`list_status`** (ACTIVE / PAST / INACTIVE) is the restaurant management state; **`status`** (AVAILABLE / PARTIALLY_CLAIMED / FULLY_CLAIMED / EXPIRED) is the availability state. Both fields exist on food items.
6. **Phone is the only login identifier.** `contact_email` on restaurant/donor profiles is for invoices only — never shown as a login field.

---

## Phase Scope

**P1 — Build now:** Phone OTP auth · Browse & search food · Filter by category/radius · Food detail · QR scan → instant claim · All claim error screens · Restaurant post/manage listings · Read-only claims board · Donor home + credit preference · In-app notifications · All role profiles

**P2 — Do not build yet:** Push notifications · Notification settings UI · Analytics/impact charts · Donor meal order (PayNow) · Admin-managed restaurant menu

---

## Screen → Mockup Reference

Always read the relevant mockup PNG **before** planning or coding any screen. Files are in `Design Doc/Screen/{Donor|Receiver|Resturant}/`.

| Screen | Mockup file |
|--------|-------------|
| Splash | `Donor/1-1-Splash@1x.jpg` |
| Login | `Donor/1-3-Login@1x.jpg` |
| OTP | `Donor/1-4-Otp@1x.jpg` |
| Register — Donor | `Donor/1-2-Register-Donor@1x.jpg` |
| Register — Receiver | `Receiver/1-2-Register-Receiver@1x.jpg` |
| Register — Restaurant | `Receiver/1-2-Register-Restaurant@1x.jpg` |
| Receiver Home | `Receiver/2-1-R-Home@1x.jpg` |
| Search Results | `Receiver/2-2-R-Search-Results@1x.jpg` |
| Filter Sheet | `Receiver/2-3-FH-Filter-Meals@1x.jpg` |
| Food Detail | `Receiver/2-4-R-Detail@1x.jpg` |
| Restaurant List | `Receiver/2-5-R-Restaurants@1x.jpg` |
| Restaurant Page | `Receiver/2-6-R-Restaurant@1x.jpg` |
| QR Scanner | `Receiver/3-1-R-Scanner@1x.jpg` |
| Claim Success | `Receiver/3-2-R-Claim-Success@1x.jpg` |
| Receiver History | `Receiver/4-1-R-History@1x.jpg` |
| Donor Home | `Donor/2-1-D-Home@1x.jpg` |
| Donor History | `Donor/3-1-D-History@1x.jpg` |
| Credit Preference | `Donor/4-1-D-Credit@1x.jpg` |
| Notifications (filled) | `Donor/5-1-D-Notifications@1x.jpg` |
| Notifications (empty) | `Donor/5-2-Notif-Empty@1x.jpg` |
| Donor Profile | `Donor/6-1-D-Profile@1x.jpg` |
| Receiver Profile | `Receiver/6-1-R-Profile@1x.jpg` |
| Location Settings | `Receiver/6-2-R-Location-Settings@1x.jpg` |
| Empty State | `Receiver/7-1-R-Empty@1x.jpg` |
| Food Unavailable | `Receiver/7-2-R-Food-Unavailable@1x.jpg` |
| Daily Limit | `Receiver/7-3-R-Limit@1x.jpg` |
| Scan Error | `Receiver/7-4-R-Scan-Error@1x.jpg` |
| Offline Error | `Receiver/7-5-Error-Offline@1x.jpg` |
| Server Error | `Receiver/7-6-Error-Server@1x.jpg` |
