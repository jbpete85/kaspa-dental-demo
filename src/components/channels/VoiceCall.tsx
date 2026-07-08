import { useEffect, useState, type ReactNode } from 'react'
import {
  Microphone,
  MicrophoneSlash,
  GridFour,
  SpeakerHigh,
  Plus,
  VideoCamera,
  User,
  PhoneDisconnect,
  Tooth,
} from '@phosphor-icons/react'
import { useChannelConversation } from '@/lib/useChannelConversation'
import { useVoiceCall } from '@/lib/useVoiceCall'
import { VOICE_SCRIPT } from '@/lib/mockConversations'
import { kaspa, transports, mockForced } from '@/lib/kaspa.config'
import { cn } from '@/lib/utils'

const voiceIsLive = () => transports.voice.mode === 'live' && !mockForced()

function fmt(total: number) {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex items-center justify-center" style={{ height: 34, gap: 5 }}>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <span
          key={i}
          className="ios-wave-bar rounded-full"
          style={{
            width: 4,
            height: 30,
            backgroundColor: kaspa.accent,
            animationPlayState: active ? 'running' : 'paused',
            animationDelay: `${i * 0.12}s`,
            transform: active ? undefined : 'scaleY(0.22)',
            opacity: active ? 1 : 0.4,
          }}
        />
      ))}
    </div>
  )
}

function CallButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: ReactNode
  label: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center" style={{ gap: 7 }}>
      <span
        className={cn(
          'flex items-center justify-center rounded-full backdrop-blur-md transition',
          active ? 'bg-white text-black' : 'text-white',
        )}
        style={{ width: 72, height: 72, background: active ? undefined : 'rgba(255,255,255,0.14)' }}
      >
        {icon}
      </span>
      <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.85)' }}>{label}</span>
    </button>
  )
}

export function VoiceCall({ live, onEnd }: { live: boolean; onEnd: () => void }) {
  const isLive = voiceIsLive()
  const convo = useChannelConversation(VOICE_SCRIPT)
  const voice = useVoiceCall(transports.voice.agentId)
  const [seconds, setSeconds] = useState(0)
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    if (live) {
      if (isLive) voice.start()
      else convo.start()
    } else {
      if (isLive) voice.end()
      else convo.reset()
      setSeconds(0)
      setMuted(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live])

  useEffect(() => {
    if (!live || (isLive && voice.status !== 'active')) return
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => window.clearInterval(id)
  }, [live, isLive, voice.status])

  const latest = convo.messages[convo.messages.length - 1]
  const agentSpeaking = isLive ? voice.agentSpeaking : convo.isTyping || latest?.from === 'them'
  const speaker = isLive
    ? voice.speaker === 'agent'
      ? kaspa.agentName
      : voice.speaker === 'caller'
        ? 'You'
        : ''
    : !latest
      ? ''
      : latest.from === 'me'
        ? kaspa.patient.firstName
        : kaspa.agentName
  const caption = isLive
    ? voice.status === 'error'
      ? 'Couldn’t connect the call. Check mic permission and try again.'
      : voice.caption
    : convo.isTyping
      ? ''
      : (latest?.text ?? '')

  return (
    <div className="relative flex h-full flex-col font-ios text-white">
      {/* Real iOS 26 wallpaper behind a call scrim */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}wallpaper-ios26.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, rgba(8,10,14,0.72) 0%, rgba(8,10,14,0.8) 55%, rgba(0,0,0,0.88) 100%)', backdropFilter: 'blur(28px)' }}
      />

      {/* Caller + status */}
      <div className="relative shrink-0 text-center" style={{ paddingTop: 78, paddingLeft: 24, paddingRight: 24 }}>
        <div style={{ fontSize: 30, fontWeight: 500, letterSpacing: 0.2 }}>{kaspa.name}</div>
        <div style={{ marginTop: 5, fontSize: 16, color: 'rgba(255,255,255,0.65)', fontVariantNumeric: 'tabular-nums' }}>
          {live ? (isLive && voice.status !== 'active' ? 'calling…' : fmt(seconds)) : 'calling…'}
        </div>
      </div>

      {/* Avatar + waveform + live caption */}
      <div className="relative flex flex-1 flex-col items-center justify-center" style={{ gap: 18, paddingLeft: 24, paddingRight: 24 }}>
        <div className="relative flex items-center justify-center">
          {agentSpeaking && (
            <>
              <span
                className="ios-ring absolute rounded-full"
                style={{ width: 108, height: 108, backgroundColor: `${kaspa.accent}55` }}
              />
              <span
                className="ios-ring absolute rounded-full"
                style={{ width: 108, height: 108, backgroundColor: `${kaspa.accent}40`, animationDelay: '1.2s' }}
              />
            </>
          )}
          <div
            className="relative flex items-center justify-center rounded-full text-white shadow-xl"
            style={{ width: 108, height: 108, background: `linear-gradient(135deg, ${kaspa.accent}, ${kaspa.accentDeep})` }}
          >
            <Tooth size={48} weight="fill" />
          </div>
        </div>

        <Waveform active={agentSpeaking} />

        <div className="text-center" style={{ minHeight: 48, paddingLeft: 8, paddingRight: 8 }}>
          {speaker && (
            <div style={{ marginBottom: 3, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>
              {speaker}
            </div>
          )}
          <div style={{ fontSize: 16, lineHeight: '21px', color: 'rgba(255,255,255,0.92)' }}>
            {convo.isTyping ? (
              <span className="inline-flex items-center gap-1 align-middle">
                <span className="ios-dot rounded-full" style={{ width: 8, height: 8, background: 'rgba(255,255,255,0.7)' }} />
                <span className="ios-dot rounded-full" style={{ width: 8, height: 8, background: 'rgba(255,255,255,0.7)' }} />
                <span className="ios-dot rounded-full" style={{ width: 8, height: 8, background: 'rgba(255,255,255,0.7)' }} />
              </span>
            ) : (
              caption || (live ? 'Connecting…' : '')
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="relative shrink-0" style={{ paddingLeft: 40, paddingRight: 40, paddingBottom: 40 }}>
        <div className="grid grid-cols-3 place-items-center" style={{ rowGap: 24, marginBottom: 26 }}>
          <CallButton
            icon={muted ? <MicrophoneSlash size={30} weight="fill" /> : <Microphone size={30} weight="fill" />}
            label="mute"
            active={muted}
            onClick={() => {
              setMuted((m) => {
                if (isLive) voice.setMuted(!m)
                return !m
              })
            }}
          />
          <CallButton icon={<GridFour size={30} weight="fill" />} label="keypad" />
          <CallButton icon={<SpeakerHigh size={30} weight="fill" />} label="speaker" />
          <CallButton icon={<Plus size={30} weight="bold" />} label="add" />
          <CallButton icon={<VideoCamera size={30} weight="fill" />} label="FaceTime" />
          <CallButton icon={<User size={30} weight="fill" />} label="contacts" />
        </div>
        <div className="flex justify-center">
          <button
            onClick={onEnd}
            className="flex items-center justify-center rounded-full text-white shadow-lg transition active:scale-95"
            style={{ width: 72, height: 72, background: '#FF3B30' }}
          >
            <PhoneDisconnect size={32} weight="fill" />
          </button>
        </div>
      </div>
    </div>
  )
}
