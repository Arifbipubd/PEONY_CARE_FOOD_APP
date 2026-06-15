# Peony Care Food App

A complementary meal donation app connecting Singaporeans in need with restaurants and donors.

---

## About

Peony Care is a mobile app that lets restaurants list surplus food as complementary meals, receivers claim them via QR code, and donors sponsor portions for those in need.

**Three roles:**
- **Receiver** — browses nearby listings and claims a complementary meal once per day via QR scan
- **Restaurant** — posts and manages food listings, views today's claims board
- **Donor** — sponsors meals and tracks contribution history

**Target platform:** Android  
**Context:** Singapore (SGT timezone, 500 m proximity radius, daily claim limit)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo SDK 54 |
| Language | TypeScript (strict) |
| Navigation | React Navigation v7 (native stack + bottom tabs) |
| State | Zustand |
| HTTP | Axios (backend not yet connected — mock data) |
| Storage | AsyncStorage (user meta) · expo-secure-store (tokens) |
| Camera | expo-camera (QR scan) |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npx expo start

# Android only
npx expo start --android

# Clear Metro cache if something looks stale
npx expo start --clear
```

---

## Project Structure

```
src/
├── constants/theme.ts        # All design tokens — colors, spacing, radii, fonts
├── navigation/               # RootNavigator + role tab navigators
├── screens/
│   ├── shared/               # Splash, Login, OTP, Register, Notifications
│   ├── receiver/             # Home, FoodDetail, QR Scanner, Claim, Profile…
│   ├── donor/                # Home, History, Credit Preference, Profile
│   └── restaurant/           # Dashboard, Manage listings, Claims board, Profile
├── components/               # Shared UI — Button, Card, Badge, Input, BottomSheet
├── services/                 # API functions (mock data now, swap for Axios later)
├── mock/                     # Mock data matching backend response shapes
├── store/                    # Zustand slices — auth, profile, notifications
├── hooks/                    # useLocation, useNotifications, etc.
├── types/                    # TypeScript types mirroring future API responses
└── utils/                    # formatDistance, formatSGT, etc.
```

---

## Navigation

```
RootNavigator
├── AuthStack          — Splash · Login · OTP · Register
├── ReceiverTabs       — Home · Scan · Alerts · Profile
├── DonorTabs          — Home · History · Alerts · Profile
└── RestaurantTabs     — Home · Manage · Claims · Profile
```

No token → `AuthStack`. Valid token → role-specific tabs based on `user.role`.  
Restaurant with `isApproved === false` → `ApprovalPendingScreen`.

---

## Key Business Rules

- **Claim is instant** — QR scan → `CLAIMED` immediately, no restaurant confirmation step
- **Daily limit** — 1 claim per receiver per Singapore calendar day
- **Proximity** — receiver must be within 500 m of the restaurant to scan
- **QR payload format** — `{food_id}|{restaurant_id}|{unix_timestamp}`
- **Login identifier** — phone number only (email is for invoices, never shown on login)

---

## Mock Data / Backend

All screens use mock data from `src/mock/`. When the Django REST backend is ready, only the service functions in `src/services/` need to change — nothing else in the codebase is affected.

---

## Code Quality

```bash
# TypeScript check (run before every commit)
npx tsc --noEmit

# Lint
npx eslint src/ --ext .ts,.tsx
```

---

## Design System

All colors, spacing, border radii, and font values live in `src/constants/theme.ts`. Never hardcode hex values or magic numbers in components — always import from `theme.ts`.

---

## Phase Scope

**P1 (current):** Auth · Browse & search food · Filter · Food detail · QR claim · All error screens · Restaurant listing management · Donor home + history · Notifications · All role profiles

**P2 (not yet):** Push notifications · Analytics · Donor PayNow meal order · Admin restaurant menu
