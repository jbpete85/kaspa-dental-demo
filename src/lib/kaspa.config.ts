/**
 * Single source of truth for the demo practice identity.
 * Swap these values to instantly rebrand the demo to any prospect.
 */
export const kaspa = {
  name: 'Kaspa Dental',
  shortName: 'Kaspa',
  tagline: 'Family & Cosmetic Dentistry',
  domain: 'kaspadental.com',
  phoneDisplay: '(512) 555-0147',
  /** Practice accent — distinct from the Kingside frame so it reads as its own brand. */
  accent: '#0E9A8E',
  accentDeep: '#0B7A70',
  initials: 'KD',
  agentName: 'Ava',
  /** The patient on the other end of the phone. */
  patient: {
    name: 'Maya Torres',
    firstName: 'Maya',
    initials: 'MT',
  },
} as const
