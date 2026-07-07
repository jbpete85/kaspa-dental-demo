import type { ChatStep } from './types'
import { kaspa } from './kaspa.config'

/**
 * Placeholder canned conversations — just enough to evaluate look & feel.
 * Real scripts + the live do-everything agent come in the next phase.
 *
 * Convention: `them` = the Kaspa Dental agent, `me` = the patient (phone owner).
 */

// SMS — fill-the-chair / reactivation
export const SMS_SCRIPT: ChatStep[] = [
  { from: 'them', text: `Hi ${kaspa.patient.firstName}! This is ${kaspa.name} 🦷 A cleaning just opened up tomorrow at 2:00 PM — want me to grab it? Our records show you're a little overdue 😊`, typing: 1100, delay: 600 },
  { from: 'me', text: 'oh nice, yes please', delay: 1500 },
  { from: 'them', text: `Done! You're booked Tue at 2:00 PM with Dr. Lee. Reply C to confirm or R to reschedule.`, typing: 1200, delay: 700 },
  { from: 'me', text: 'C', delay: 1300 },
  { from: 'them', text: `Confirmed ✅ See you then, ${kaspa.patient.firstName}. We'll send a reminder the day before.`, typing: 1000, delay: 700 },
]

// Voice — after-hours new-patient call (rendered as captions/transcript)
export const VOICE_SCRIPT: ChatStep[] = [
  { from: 'them', text: `Thanks for calling ${kaspa.name}, this is ${kaspa.agentName}. How can I help?`, typing: 1400, delay: 1200 },
  { from: 'me', text: `Hi — do you take new patients? I think I chipped a tooth.`, delay: 1800 },
  { from: 'them', text: `Oh no — yes, we're taking new patients and I can get you in. Are you in any pain right now?`, typing: 1600, delay: 900 },
  { from: 'me', text: `A little, it's sensitive.`, delay: 1600 },
  { from: 'them', text: `I'm sorry to hear that. I have tomorrow at 9:40 AM with Dr. Lee — does that work?`, typing: 1700, delay: 900 },
  { from: 'me', text: `Yeah, that works.`, delay: 1500 },
  { from: 'them', text: `Perfect, you're booked for 9:40 AM. I'll text the new-patient forms to this number. See you tomorrow!`, typing: 1900, delay: 900 },
]

// Web chat — procedure Q&A → consult booking (used by Website + Messenger skins)
export const WEB_SCRIPT: ChatStep[] = [
  { from: 'them', text: `Hi! 👋 Welcome to ${kaspa.name}. How can I help today?`, typing: 900, delay: 500 },
  { from: 'me', text: 'do you do invisalign? roughly how much?', delay: 1600 },
  { from: 'them', text: `We do! Most Invisalign cases here run $3,500–$5,500 depending on complexity, and we offer monthly payment plans. Want a free consult for an exact quote?`, typing: 1500, delay: 800 },
  { from: 'me', text: 'sure', delay: 1400 },
  { from: 'them', text: `Love it. I have Thursday 4:30 PM or Friday 11:00 AM open — which works better?`, typing: 1300, delay: 700 },
  { from: 'me', text: 'thursday', delay: 1400 },
  { from: 'them', text: `Booked for Thu 4:30 PM ✅ What's the best email for the confirmation?`, typing: 1200, delay: 700 },
]

export const ACKS = [
  `Got it — give me one sec…`,
  `On it! Let me take care of that for you.`,
  `Perfect, updating that now.`,
]
