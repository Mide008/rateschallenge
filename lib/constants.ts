// lib/constants.ts
// Central source of truth for property types, thresholds, and config

export const PROPERTY_TYPES = [
  {
    code: 'SR',
    label: 'Shop',
    description: 'Retail unit, convenience store, boutique',
    icon: '🏪',
  },
  {
    code: 'CO',
    label: 'Office',
    description: 'Office suite, business unit, serviced office',
    icon: '🏢',
  },
  {
    code: 'IN',
    label: 'Industrial',
    description: 'Factory, light industrial, production unit',
    icon: '🏭',
  },
  {
    code: 'WH',
    label: 'Warehouse',
    description: 'Storage warehouse, distribution unit',
    icon: '📦',
  },
  {
    code: 'RS',
    label: 'Restaurant / Café',
    description: 'Restaurant, café, coffee shop, takeaway',
    icon: '🍽️',
  },
  {
    code: 'PP',
    label: 'Pub / Bar',
    description: 'Public house, bar, licensed premises',
    icon: '🍺',
  },
  {
    code: 'MX',
    label: 'Mixed Retail',
    description: 'Mixed use retail premises',
    icon: '🛍️',
  },
  {
    code: 'HO',
    label: 'Hotel',
    description: 'Hotel, guest house, B&B',
    icon: '🏨',
  },
  {
    code: 'GR',
    label: 'Garage / Workshop',
    description: 'Car garage, MOT centre, vehicle repair',
    icon: '🔧',
  },
  {
    code: 'PK',
    label: 'Car Park',
    description: 'Surface or multi-storey car park',
    icon: '🅿️',
  },
  {
    code: 'PN',
    label: 'Petrol Station',
    description: 'Forecourt, filling station',
    icon: '⛽',
  },
  {
    code: 'CL',
    label: 'Clinic / Medical',
    description: 'Medical clinic, dental surgery, health centre',
    icon: '🏥',
  },
  {
    code: 'LS',
    label: 'Leisure',
    description: 'Gym, fitness studio, sports facility',
    icon: '🏋️',
  },
  {
    code: 'EW',
    label: 'Workshop',
    description: 'Trade workshop, craft unit, maker space',
    icon: '🛠️',
  },
  {
    code: 'TK',
    label: 'Storage',
    description: 'Self-storage, lock-up, storage yard',
    icon: '🗄️',
  },
  {
    code: 'OC',
    label: 'Other Commercial',
    description: 'Doesn\'t fit the above — select this',
    icon: '🏗️',
  },
] as const

export type PropertyTypeCode = (typeof PROPERTY_TYPES)[number]['code']

export const PROPERTY_TYPE_MAP = Object.fromEntries(
  PROPERTY_TYPES.map((t) => [t.code, t.label])
) as Record<string, string>

// Comparable search thresholds
export const AREA_TOLERANCE         = 0.30   // ±30% floor area
export const MIN_COMPARABLES_STRONG = 10     // Enough for strong evidence
export const MIN_COMPARABLES_WEAK   = 5      // Minimum for any evidence
export const CHALLENGE_PERCENTILE   = 60     // Above this = likely overpaying

// Business rates multiplier 2024/25 (England)
// Used to convert RV saving to rates bill saving estimate
export const RATES_MULTIPLIER       = 0.512

// Free tier limit
export const FREE_COMPARABLES_LIMIT = 3

// Stripe price IDs — fill in after creating products in Stripe dashboard
export const STRIPE_PRICES = {
  analysis: 'price_FILL_IN_AFTER_STRIPE_SETUP',   // £29
  bundle:   'price_FILL_IN_AFTER_STRIPE_SETUP',   // £49
} as const