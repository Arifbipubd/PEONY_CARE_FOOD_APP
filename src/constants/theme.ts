// Design tokens — single source of truth for all colors, spacing, and radii.
// NEVER hardcode hex values or pixel numbers in components. Always import from here.

export const colors = {
  // Brand
  accentPrimary: '#C8102E',  // red/600 — buttons, links, active tab (verified against Design Doc/Design Utils/token_map.png + mockup pixel samples)
  accentLight:   '#FFF0F2',  // light red tint — chip / badge backgrounds (design-system "white" primitive)
  accentDark:    '#9B0D22',  // red/700 — slogan badge text, darker accent

  // Surfaces
  surface:          '#FFFFFF',   // screen and card background
  surfaceSecondary: '#F5F5F5',   // neutral gray for inner sections (verified against design-system.json)
  surfaceTertiary:  '#FAFAFA',   // subtle off-white surface (search bar background)

  // Text
  textPrimary:   '#1A1A2E',  // dark navy — headings
  textMuted:     '#6B7280',  // grey — body text, labels
  textInverse:   '#FFFFFF',  // white — text on red backgrounds

  // Borders & shadows
  borderDefault: '#E5E7EB',
  shadow:        '#000000',

  // Pickup time icon — orange/600 from design system
  pickupOrange:  '#EA580C',

  // Status
  successGreen:      '#26A34E',
  successGreenLight: '#ECFDF5',
  warningYellow:      '#F59E0B',
  warningYellowLight: '#FFFBEB',
  errorRed:      '#D31B1B',

  // Input focus ring (shadow/5 from design system)
  accentFocusShadow: 'rgba(200, 16, 46, 0.08)',

  // Avatar (initials badge)
  avatarBg:   '#FFE0E5',  // red/100 — avatar circle background, role-icon backgrounds

  // Gold (donor "hand-heart" icon — verified against Choose-Role@2x.png)
  goldLight: '#FFF3D0',  // yellow/200
  goldMid:   '#D4AF37',  // yellow/500 — donor avatar bg, anon heart icon (verified against FoodDetail Figma CSS)
  goldDark:  '#B8941E',  // yellow/600

  // Mint (receiver icon background — verified against Choose-Role@2x.png)
  mintLight: '#DCFCE7',  // green/100

  // Slider track (blue/500 from design system — verified against prototype.design-system.json)
  sliderBlue: '#2563EB',
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
  xs:    11,   // Caption/Bold-Medium-Regular 11px
  '12':  12,   // Caption/Bold-Medium-Regular 12px
  sm:    13,   // Caption/Bold-Regular-Medium 13px
  '14':  14,   // Caption/Bold-Medium 14px
  md:    15,   // Caption/Bold-Medium 15px
  '16':  16,   // Body/Regular-Bold 16px
  lg:    17,   // Body/Bold 17px
  xl:    20,   // Body/Bold 20px
  '2xl': 24,   // Subheading/Bold 24px
  '3xl': 28,
  '4xl': 32,
  '5xl': 48,   // Heading/Bold — splash title, large display text
} as const;

export const fontFamilies = {
  regular:  'Poppins_400Regular',
  medium:   'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold:     'Poppins_700Bold',
} as const;

export const lineHeights = {
  heading:    50.4,  // Heading/Bold (48px font)
  subheading: 26.4,  // Subheading/Bold (24px font)
  body:       21,    // Body text (14px font)
} as const;

export const letterSpacings = {
  heading:    -1.68,  // Heading/Bold (48px)
  subheading:  -0.6,  // Subheading/Bold (24px)
  bodyBold:   -0.5,   // Body/Bold (20px) — section headings, home greeting
  button:      0.3,   // Button labels (Caption/Bold 15px)
  buttonSm:    0.28,  // Small button labels (Caption/Bold 14px)
  slogan:      0.96,  // Slogan / badge chip
} as const;

export const fontWeights = {
  regular: '400' as const,
  medium:  '500' as const,
  semiBold:'600' as const,
  bold:    '700' as const,
};

// Layout constants — shared pixel values for consistent sizing across screens
export const layout = {
  foodImageHeight:       260,  // hero image on Food Detail / Restaurant Page screens
  cardImageHeight:       170,  // image inside food listing cards (verified against Figma)
  restaurantFoodThumb:    64,  // square thumbnail on Restaurant Page food list
  tabBarHeight:           60,
  inputHeight:            52,  // text input row height (Input component)
  buttonHeight:           54,  // primary/outline button height (Button component)
  actionButtonSize:       48,  // 48×48 icon action buttons (filter, etc.) and search bar height
} as const;
