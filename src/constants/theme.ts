// Design tokens — single source of truth for all colors, spacing, and radii.
// NEVER hardcode hex values or pixel numbers in components. Always import from here.

export const colors = {
  // Brand
  accentPrimary: '#D31B1B',  // red — buttons, links, active tab
  accentLight:   '#FEF2F2',  // light red tint — chip / badge backgrounds

  // Surfaces
  surface:       '#FFFFFF',  // screen and card background
  surfaceSecondary: '#F9FAFB', // slightly off-white for inner sections

  // Text
  textPrimary:   '#1A1A2E',  // dark navy — headings
  textMuted:     '#6B7280',  // grey — body text, labels
  textInverse:   '#FFFFFF',  // white — text on red backgrounds

  // Borders & shadows
  borderDefault: '#E5E7EB',
  shadow:        '#000000',

  // Status
  successGreen:      '#26A34E',
  successGreenLight: '#ECFDF5',
  warningYellow:      '#F59E0B',
  warningYellowLight: '#FFFBEB',
  errorRed:      '#D31B1B',
} as const;

export const spacing = {
  xs:   3,
  sm:   6,
  md:   10,
  lg:   14,
  xl:   18,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
} as const;

export const radius = {
  pill:  100,  // pill buttons, full chips
  card:  18,   // food listing cards
  sheet: 28,   // bottom sheets / modals
  input: 14,   // text inputs
  chip:  22,   // category filter chips
  badge: 10,   // status badges
  sm:    8,
  xs:    4,
} as const;

export const fontSizes = {
  xs:   11,
  sm:   13,
  md:   15,
  lg:   17,
  xl:   20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
} as const;

export const fontWeights = {
  regular: '400' as const,
  medium:  '500' as const,
  semiBold:'600' as const,
  bold:    '700' as const,
};

// Layout constants — shared pixel values for consistent sizing across screens
export const layout = {
  foodImageHeight:       260,  // hero image on Food Detail screen
  cardImageHeight:       190,  // image inside browse list cards
  tabBarHeight:           60,
} as const;
