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
import { VOICE_SCRIPT } from '@/lib/mockConversations'
import { kaspa } from '@/lib/kaspa.config'
import { cn } from '@/lib/utils'

function fmt(total: number) {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex h-8 items-center justify-center gap-[5px]">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <span
          key={i}
          className="ios-wave-bar w-[4px] rounded-full"
          style={{
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
    <button onClick={onClick} className="flex flex-col items-center gap-1.5">
      <span
        className={cn(
          'flex h-[52px] w-[52px] items-center justify-center rounded-full backdrop-blur-md transition',
          active ? 'bg-white text-black' : 'bg-white/15 text-white',
        )}
      >
        {icon}
      </span>
      <span className="text-[11px] text-white/80">{label}</span>
    </button>
  )
}

export function VoiceCall({ live, onEnd }: { live: boolean; onEnd: () => void }) {
  const convo = useChannelConversation(VOICE_SCRIPT)
  const [seconds, setSeconds] = useState(0)
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    if (live) convo.start()
    else {
      convo.reset()
      setSeconds(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live])

  useEffect(() => {
    if (!live) return
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => window.clearInterval(id)
  }, [live])

  const latest = convo.messages[convo.messages.length - 1]
  const agentSpeaking = convo.isTyping || latest?.from === 'them'
  const speaker = !latest ? '' : latest.from === 'me' ? kaspa.patient.firstName : kaspa.agentName
  const caption = convo.isTyping ? '' : latest?.text ?? ''

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-[#2b2b2e] via-[#1c1c1e] to-black font-ios text-white">
      {/* Caller + status */}
      <div className="shrink-0 px-6 pt-[52px] text-center">
        <div className="text-[26px] font-semibold tracking-tight">{kaspa.name}</div>
        <div className="mt-1 text-[15px] text-white/65">{live ? fmt(seconds) : 'calling…'}</div>
      </div>

      {/* Avatar + waveform + caption */}
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
        <div className="relative flex items-center justify-center">
          {agentSpeaking && (
            <>
              <span className="ios-ring absolute h-[104px] w-[104px] rounded-full" style={{ backgroundColor: `${kaspa.accent}55` }} />
              <span className="ios-ring absolute h-[104px] w-[104px] rounded-full" style={{ backgroundColor: `${kaspa.accent}40`, animationDelay: '1.2s' }} />
            </>
          )}
          <div
            className="relative flex h-[104px] w-[104px] items-center justify-center rounded-full text-white shadow-xl"
            style={{ background: `linear-gradient(135deg, ${kaspa.accent}, ${kaspa.accentDeep})` }}
          >
            <Tooth size={46} weight="fill" />
          </div>
        </div>

        <Waveform active={agentSpeaking} />

        <div className="min-h-[44px] px-2 text-center">
          {speaker && (
            <div className="mb-0.5 text-[11px] uppercase tracking-[0.15em] text-white/40">{speaker}</div>
          )}
          <div className="text-[15px] leading-snug text-white/90">
            {convo.isTyping ? (
              <span className="inline-flex items-center gap-1 align-middle">
                <span className="ios-dot h-2 w-2 rounded-full bg-white/70" />
                <span className="ios-dot h-2 w-2 rounded-full bg-white/70" />
                <span className="ios-dot h-2 w-2 rounded-full bg-white/70" />
              </span>
            ) : (
              caption || (live ? 'Connecting…' : '')
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="shrink-0 px-8 pb-6">
        <div className="mb-4 grid grid-cols-3 place-items-center gap-y-3.5">
          <CallButton
            icon={muted ? <MicrophoneSlash size={24} weight="fill" /> : <Microphone size={24} weight="fill" />}
            label="mute"
            active={muted}
            onClick={() => setMuted((m) => !m)}
          />
          <CallButton icon={<GridFour size={24} weight="fill" />} label="keypad" />
          <CallButton icon={<SpeakerHigh size={24} weight="fill" />} label="speaker" />
          <CallButton icon={<Plus size={24} weight="bold" />} label="add" />
          <CallButton icon={<VideoCamera size={24} weight="fill" />} label="FaceTime" />
          <CallButton icon={<User size={24} weight="fill" />} label="contacts" />
        </div>
        <div className="flex justify-center">
          <button
            onClick={onEnd}
            className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#ff3b30] text-white shadow-lg transition active:scale-95"
          >
            <PhoneDisconnect size={28} weight="fill" />
          </button>
        </div>
      </div>
    </div>
  )
}
