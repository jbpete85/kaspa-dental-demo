/**
 * Single source of truth for the demo practice identity.
 * Swap these values to instantly rebrand the demo to any prospect.
 *
 * NOTE: a full prospect rebrand touches THREE places:
 *   1. this file
 *   2. the CLINIC CONFIG block in the n8n agent's system prompt
 *      (workflow "Kaspa Dental Demo — Web Chat Agent" on goodhelpai.app.n8n.cloud)
 *   3. the ElevenLabs voice agent's prompt (once the voice channel goes live)
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

/**
 * Live transports per channel. `mode: 'live'` talks to the real agent;
 * `mode: 'mock'` plays the canned script. Presenter fallback: append
 * `?mock=1` to the URL to force every channel back to mock without a rebuild.
 */
export const transports = {
  webChat: {
    mode: 'live' as 'live' | 'mock',
    /** n8n chat-trigger REST endpoint of the Kaspa web chat agent. */
    endpoint:
      'https://goodhelpai.app.n8n.cloud/webhook/ee5484c6-73ef-4a13-b4f8-328efdf87f7f/chat',
    /** Shown locally on Start — mirrors the agent's configured greeting. */
    greeting: `Hi! 👋 Welcome to ${kaspa.name}. I’m ${kaspa.agentName}, our virtual receptionist. How can I help today?`,
  },
} as const

/** True when the presenter forced mock mode via `?mock=1`. */
export function mockForced(): boolean {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).has('mock')
}
