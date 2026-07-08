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

/** Options for mirroring an external thread (real SMS via Twilio → n8n Data Table). */
export interface PollOptions {
  /** Thread-feed webhook; GET returns [{messages: [{from, text, ts}]}], `?reset=1` wipes it. */
  endpoint: string
  /** Poll cadence while the channel is live. */
  intervalMs?: number
  /** Wipe the stored thread when the presenter presses Start. */
  resetOnStart?: boolean
}

export interface ConversationOptions {
  live?: LiveChatOptions
  poll?: PollOptions
}

/**
 * The conversation engine seam.
 *
 * Mock mode drives a canned script with realistic typing + timing.
 * Live mode (`opts.live`) talks to the real n8n agent: every user message
 * POSTs to the chat webhook and the reply renders as a `them` bubble.
 * Poll mode (`opts.poll`) mirrors an external conversation (real SMS): the
 * thread renders from a feed and the on-screen composer is a no-op.
 * The channel UIs consume the same surface in all three modes.
 */
export function useChannelConversation(script: ChatStep[], opts?: ConversationOptions) {
  const live = opts?.live
  const poll = opts?.poll
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [done, setDone] = useState(false)
  const timers = useRef<number[]>([])
  const ackIdx = useRef(0)
  const sessionId = useRef('')
  const aborter = useRef<AbortController | null>(null)
  const pollTimer = useRef<number | null>(null)

  const stopPolling = useCallback(() => {
    if (pollTimer.current !== null) {
      window.clearInterval(pollTimer.current)
      pollTimer.current = null
    }
  }, [])

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }, [])

  const reset = useCallback(() => {
    clearTimers()
    stopPolling()
    aborter.current?.abort()
    aborter.current = null
    setMessages([])
    setIsTyping(false)
    setDone(false)
  }, [clearTimers, stopPolling])

  const push = useCallback((from: ChatMessage['from'], text: string) => {
    setMessages((m) => [...m, { id: nextId(), from, text }])
  }, [])

  /** Mock: play the script. Live: fresh session + greeting. Poll: mirror the feed. */
  const start = useCallback(() => {
    clearTimers()
    stopPolling()
    aborter.current?.abort()
    setMessages([])
    setIsTyping(false)
    setDone(false)

    if (poll) {
      const interval = poll.intervalMs ?? 1500
      const tick = () => {
        fetch(poll.endpoint)
          .then((r) => r.json())
          .then((data: Array<{ messages?: Array<{ from: string; text: string }> }>) => {
            const rows = data?.[0]?.messages ?? []
            setMessages(
              rows.map((r, i) => ({
                id: `p${i}`,
                from: (r.from === 'me' ? 'me' : 'them') as ChatMessage['from'],
                text: r.text,
              })),
            )
            // patient texted, agent hasn't answered yet → show typing dots
            setIsTyping(rows.length > 0 && rows[rows.length - 1].from === 'me')
          })
          .catch(() => {}) // transient poll misses are fine
      }
      const begin = () => {
        tick()
        pollTimer.current = window.setInterval(tick, interval)
      }
      if (poll.resetOnStart) {
        fetch(`${poll.endpoint}?reset=1`).catch(() => {}).then(begin)
      } else {
        begin()
      }
      return
    }

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
  }, [script, live, poll, clearTimers, stopPolling, push])

  /** Live: round-trip to the agent. Poll: no-op (the real phone drives). Mock: canned ack. */
  const sendUserMessage = useCallback(
    (text: string) => {
      if (poll) return // mirror mode: the conversation belongs to the real texter
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
    [live, poll, push],
  )

  useEffect(
    () => () => {
      clearTimers()
      stopPolling()
      aborter.current?.abort()
    },
    [clearTimers, stopPolling],
  )

  return { messages, isTyping, done, start, reset, sendUserMessage }
}
