import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChatMessage, ChatStep } from './types'
import { ACKS } from './mockConversations'

let _seq = 0
const nextId = () => `m${++_seq}`

/**
 * The conversation engine seam.
 *
 * Today it drives a mocked/canned script with realistic typing + timing.
 * In the rebuild, the same surface (messages / isTyping / sendUserMessage)
 * gets backed by a live transport (n8n webhook, ElevenLabs, Twilio) without
 * the channel UIs changing.
 */
export function useChannelConversation(script: ChatStep[]) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [done, setDone] = useState(false)
  const timers = useRef<number[]>([])
  const ackIdx = useRef(0)

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }, [])

  const reset = useCallback(() => {
    clearTimers()
    setMessages([])
    setIsTyping(false)
    setDone(false)
  }, [clearTimers])

  const push = useCallback((from: ChatMessage['from'], text: string) => {
    setMessages((m) => [...m, { id: nextId(), from, text }])
  }, [])

  /** Play the scripted conversation from the top. */
  const start = useCallback(() => {
    clearTimers()
    setMessages([])
    setIsTyping(false)
    setDone(false)

    let t = 0
    script.forEach((step, i) => {
      const gap = step.delay ?? 500
      const last = i === script.length - 1
      if (step.from === 'them') {
        const typing = step.typing ?? 900
        const tStart = t + gap
        timers.current.push(window.setTimeout(() => setIsTyping(true), tStart))
        const tShow = tStart + typing
        timers.current.push(
          window.setTimeout(() => {
            setIsTyping(false)
            push('them', step.text)
            if (last) setDone(true)
          }, tShow),
        )
        t = tShow
      } else {
        const tShow = t + gap
        timers.current.push(
          window.setTimeout(() => {
            push(step.from, step.text)
            if (last) setDone(true)
          }, tShow),
        )
        t = tShow
      }
    })
  }, [script, clearTimers, push])

  /** Let the viewer type into the thread; replies with a canned ack (mock mode). */
  const sendUserMessage = useCallback(
    (text: string) => {
      const clean = text.trim()
      if (!clean) return
      push('me', clean)
      timers.current.push(window.setTimeout(() => setIsTyping(true), 450))
      timers.current.push(
        window.setTimeout(() => {
          setIsTyping(false)
          push('them', ACKS[ackIdx.current % ACKS.length])
          ackIdx.current += 1
        }, 1700),
      )
    },
    [push],
  )

  useEffect(() => () => clearTimers(), [clearTimers])

  return { messages, isTyping, done, start, reset, sendUserMessage }
}
