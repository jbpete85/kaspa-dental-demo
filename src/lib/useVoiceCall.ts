import { useCallback, useEffect, useRef, useState } from 'react'
import { Conversation } from '@elevenlabs/client'

export type VoiceStatus = 'idle' | 'connecting' | 'active' | 'error'

/**
 * Live voice driver for the call screen: an ElevenLabs Conversational AI
 * session over the browser mic/speakers. Mirrors the shape the call UI
 * needs (status, who's talking, last caption) without leaking SDK types.
 */
export function useVoiceCall(agentId: string) {
  const [status, setStatus] = useState<VoiceStatus>('idle')
  const [agentSpeaking, setAgentSpeaking] = useState(false)
  const [caption, setCaption] = useState('')
  const [speaker, setSpeaker] = useState<'agent' | 'caller' | ''>('')
  const convRef = useRef<Conversation | null>(null)
  const startedRef = useRef(false)

  const end = useCallback(() => {
    startedRef.current = false
    const c = convRef.current
    convRef.current = null
    setStatus('idle')
    setAgentSpeaking(false)
    setCaption('')
    setSpeaker('')
    c?.endSession().catch(() => {})
  }, [])

  const start = useCallback(async () => {
    if (startedRef.current) return
    startedRef.current = true
    setStatus('connecting')
    setCaption('')
    setSpeaker('')
    // Preflight the mic so a denied/missing device fails visibly instead of
    // leaving the call stuck on "calling…".
    try {
      const probe = await navigator.mediaDevices.getUserMedia({ audio: true })
      probe.getTracks().forEach((t) => t.stop())
    } catch (err) {
      console.error('microphone unavailable:', err)
      setStatus('error')
      startedRef.current = false
      return
    }
    if (!startedRef.current) return
    Conversation.startSession({
      agentId,
      connectionType: 'webrtc',
      onStatusChange: ({ status: s }) => {
        if (s === 'connected') setStatus('active')
        if (s === 'disconnected') setStatus('idle')
      },
      onModeChange: ({ mode }) => setAgentSpeaking(mode === 'speaking'),
      onMessage: ({ source, message }) => {
        setSpeaker(source === 'ai' ? 'agent' : 'caller')
        setCaption(message)
      },
      onError: (err) => {
        console.error('voice session error:', err)
        setStatus('error')
      },
    })
      .then((c) => {
        if (!startedRef.current) {
          c.endSession().catch(() => {})
          return
        }
        convRef.current = c
      })
      .catch((err) => {
        console.error('voice session failed to start:', err)
        setStatus('error')
        startedRef.current = false
      })
  }, [agentId])

  const setMuted = useCallback((muted: boolean) => {
    try {
      convRef.current?.setMicMuted(muted)
    } catch {
      /* older SDKs: mute unsupported, button stays cosmetic */
    }
  }, [])

  useEffect(() => () => end(), [end])

  return { status, agentSpeaking, caption, speaker, start, end, setMuted }
}
