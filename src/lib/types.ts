export type ChatRole = 'them' | 'me' | 'system'

/** A scripted step in a mocked conversation. */
export interface ChatStep {
  from: ChatRole
  text: string
  /** ms the "typing" indicator shows before a `them` message appears */
  typing?: number
  /** ms gap before this step begins */
  delay?: number
}

/** A rendered message in the live thread. */
export interface ChatMessage {
  id: string
  from: ChatRole
  text: string
}
