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
  voice: {
    mode: 'live' as 'live' | 'mock',
    /** ElevenLabs conversational agent (Ava — Kaspa Dental). Browser SDK, mic + speakers. */
    agentId: 'agent_3501kwzr330qe939dehrx8ndq18j',
  },
  sms: {
    mode: 'live' as 'live' | 'mock',
    /** Thread mirror feed (n8n Data Table behind a webhook); `?reset=1` wipes it. */
    threadEndpoint: 'https://goodhelpai.app.n8n.cloud/webhook/kaspa-sms-thread',
    /** Wipe the thread each time the presenter presses Start. */
    resetOnStart: true,
    /**
     * The real Twilio number the audience texts. PENDING: point a Twilio
     * number's incoming-SMS webhook at
     * https://goodhelpai.app.n8n.cloud/webhook/kaspa-sms then put it here.
     */
    numberToText: '',
  },
} as const

/** True when the presenter forced mock mode via `?mock=1`. */
export function mockForced(): boolean {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).has('mock')
}
