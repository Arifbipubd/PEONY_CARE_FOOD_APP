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

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | 18 or 20 LTS | Check with `node -v` |
| npm | 9+ | Comes with Node |
| Android Studio | Latest | Required for the Android emulator |
| JDK | 17 | Required by Android Studio |

Or skip Android Studio entirely — install **Expo Go** on your Android phone and scan the QR code.

---

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/Arifbipubd/PEONY_CARE_FOOD_APP.git
cd PEONY_CARE_FOOD_APP

# 2. Install dependencies
npm install

# 3. Start the dev server
npx expo start
```

### Running on a device or emulator

**Option A — Physical Android phone (easiest)**
1. Install **Expo Go** from the Play Store
2. Run `npx expo start`
3. Scan the QR code shown in the terminal with Expo Go

**Option B — Android emulator (Android Studio)**
1. Open Android Studio → Virtual Device Manager → create a Pixel device (API 33+)
2. Start the emulator
3. Run `npx expo start --android` — Expo detects the running emulator automatically

```bash
# Android emulator shortcut
npx expo start --android

# Clear Metro cache if you see stale bundle errors
npx expo start --clear
```

### Logging in (mock)

Any phone number works on the login screen. Enter any 6-digit code on the OTP screen. On the register screen, choose a role to land in the matching tab navigator.

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
