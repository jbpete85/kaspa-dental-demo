import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChatMessage, ChatStep } from './types'
import { ACKS } from './mockConversations'

let _seq = 0
const nextId = () => `m${++_seq}`

/** Options for driving a channel from the live n8n agent instead of a script. */
export interface LiveChatOptions {
  /** n8n chat-trigger REST endpoint (POST {action, sessionId, chatInput}). */
  endpoint: string
  /** Greeting bubble shown locally on start (the agent doesn't push one over REST). */
  greeting: string
}

/**
 * The conversation engine seam.
 *
 * Mock mode drives a canned script with realistic typing + timing.
 * Live mode (pass `live`) talks to the real n8n agent: every user message
 * POSTs to the chat webhook and the reply renders as a `them` bubble.
 * The channel UIs consume the same surface either way.
 */
export function useChannelConversation(script: ChatStep[], live?: LiveChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [done, setDone] = useState(false)
  const timers = useRef<number[]>([])
  const ackIdx = useRef(0)
  const sessionId = useRef('')
  const aborter = useRef<AbortController | null>(null)

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }, [])

  const reset = useCallback(() => {
    clearTimers()
    aborter.current?.abort()
    aborter.current = null
    setMessages([])
    setIsTyping(false)
    setDone(false)
  }, [clearTimers])

  const push = useCallback((from: ChatMessage['from'], text: string) => {
    setMessages((m) => [...m, { id: nextId(), from, text }])
  }, [])

  /** Mock: play the scripted conversation. Live: fresh session + greeting. */
  const start = useCallback(() => {
    clearTimers()
    aborter.current?.abort()
    setMessages([])
    setIsTyping(false)
    setDone(false)

    if (live) {
      sessionId.current = `web-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      timers.current.push(window.setTimeout(() => setIsTyping(true), 500))
      timers.current.push(
        window.setTimeout(() => {
          setIsTyping(false)
          push('them', live.greeting)
        }, 1500),
      )
      return
    }

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
  }, [script, live, clearTimers, push])

  /** Live: round-trip to the agent. Mock: canned ack. */
  const sendUserMessage = useCallback(
    (text: string) => {
      const clean = text.trim()
      if (!clean) return
      push('me', clean)

      if (live) {
        aborter.current?.abort()
        const ac = new AbortController()
        aborter.current = ac
        const timeout = window.setTimeout(() => ac.abort(), 60_000)
        setIsTyping(true)
        fetch(live.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: ac.signal,
          body: JSON.stringify({
            action: 'sendMessage',
            sessionId: sessionId.current,
            chatInput: clean,
          }),
        })
          .then((r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`)
            return r.json()
          })
          .then((data: { output?: string }) => {
            setIsTyping(false)
            push('them', data.output || '…')
          })
          .catch((err: unknown) => {
            if (ac.signal.aborted && aborter.current !== ac) return // superseded, stay quiet
            setIsTyping(false)
            push('them', 'Sorry — I’m having trouble connecting right now. Please try again in a moment.')
            console.error('live chat error:', err)
          })
          .finally(() => window.clearTimeout(timeout))
        return
      }

      timers.current.push(window.setTimeout(() => setIsTyping(true), 450))
      timers.current.push(
        window.setTimeout(() => {
          setIsTyping(false)
          push('them', ACKS[ackIdx.current % ACKS.length])
          ackIdx.current += 1
        }, 1700),
      )
    },
    [live, push],
  )

  useEffect(
    () => () => {
      clearTimers()
      aborter.current?.abort()
    },
    [clearTimers],
  )

  return { messages, isTyping, done, start, reset, sendUserMessage }
}
