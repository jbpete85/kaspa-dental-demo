import { useEffect, useRef, useState } from 'react'
import {
  Lock,
  X,
  ArrowUp,
  ArrowClockwise,
  PaperPlaneRight,
  Plus,
  Camera,
  Microphone,
  ThumbsUp,
  Smiley,
  CaretLeft,
  CaretRight,
  Phone,
  VideoCamera,
  Export,
  Book,
  Browsers,
  Tooth,
} from '@phosphor-icons/react'
import { useChannelConversation, type LiveChatOptions } from '@/lib/useChannelConversation'
import { WEB_SCRIPT } from '@/lib/mockConversations'
import { kaspa, transports, mockForced } from '@/lib/kaspa.config'
import { cn } from '@/lib/utils'

/** Live n8n transport unless config says mock or the presenter forced `?mock=1`. */
function webChatLive(): { live: LiveChatOptions } | undefined {
  if (transports.webChat.mode !== 'live' || mockForced()) return undefined
  return { live: { endpoint: transports.webChat.endpoint, greeting: transports.webChat.greeting } }
}

export type WebSkin = 'website' | 'messenger'

const IOS_BLUE = '#007AFF'
const FB_BLUE = '#0084FF'
const LABEL_GRAY = '#8E8E93'

export function WebChat({ live, skin }: { live: boolean; skin: WebSkin }) {
  return skin === 'messenger' ? <MessengerThread live={live} /> : <WebsiteWidget live={live} />
}

function TypingDots({ color }: { color: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className="ios-dot rounded-full" style={{ width: 8, height: 8, background: color }} />
      <span className="ios-dot rounded-full" style={{ width: 8, height: 8, background: color }} />
      <span className="ios-dot rounded-full" style={{ width: 8, height: 8, background: color }} />
    </div>
  )
}

/* ----------------------------- Website widget -----------------------------
   Safari chrome is authentic (bottom address capsule + toolbar, per iOS 15+);
   the chat widget itself is Kaspa's own product UI, so it stays branded. */

function WebsiteWidget({ live }: { live: boolean }) {
  const convo = useChannelConversation(WEB_SCRIPT, webChatLive())
  const [draft, setDraft] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (live) convo.start()
    else convo.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live])
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 999999, behavior: 'smooth' })
  }, [convo.messages, convo.isTyping])

  const send = () => {
    convo.sendUserMessage(draft)
    setDraft('')
  }

  return (
    <div className="relative h-full overflow-hidden bg-[#eef1f4] font-ios text-black">
      {/* Faux Kaspa site behind the widget */}
      <div style={{ paddingTop: 72, paddingLeft: 20, paddingRight: 20 }}>
        <div style={{ fontSize: 24, fontWeight: 600, color: kaspa.accentDeep }}>{kaspa.name}</div>
        <div style={{ marginTop: 2, fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>{kaspa.tagline}</div>
        <div className="rounded-2xl bg-white/75" style={{ marginTop: 14, height: 92 }} />
        <div className="rounded-2xl bg-white/60" style={{ marginTop: 10, height: 56 }} />
      </div>

      {/* Chat widget */}
      <div
        className="absolute flex flex-col overflow-hidden bg-white"
        style={{ left: 10, right: 10, bottom: 104, height: '58%', borderRadius: 22, boxShadow: '0 14px 48px rgba(0,0,0,0.22)' }}
      >
        {/* Header */}
        <div
          className="flex shrink-0 items-center text-white"
          style={{ gap: 10, padding: '12px 14px', background: `linear-gradient(135deg, ${kaspa.accent}, ${kaspa.accentDeep})` }}
        >
          <div className="flex items-center justify-center rounded-full bg-white/20" style={{ width: 36, height: 36 }}>
            <Tooth size={20} weight="fill" />
          </div>
          <div className="flex-1 leading-tight">
            <div style={{ fontSize: 15, fontWeight: 600 }}>{kaspa.name}</div>
            <div className="flex items-center" style={{ gap: 5, fontSize: 11.5, color: 'rgba(255,255,255,0.85)' }}>
              <span className="rounded-full" style={{ width: 6, height: 6, background: '#34d058' }} /> Online now
            </div>
          </div>
          <X size={18} weight="bold" className="text-white/85" />
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="no-scrollbar flex-1 overflow-y-auto bg-[#f7f8fa]" style={{ padding: 12 }}>
          {convo.messages.map((m, i) => {
            const isMe = m.from === 'me'
            const nextSame = i < convo.messages.length - 1 && convo.messages[i + 1].from === m.from
            return (
              <div key={m.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')} style={{ marginBottom: nextSame ? 3 : 10 }}>
                <div
                  className="bubble-in"
                  style={{
                    maxWidth: '80%',
                    padding: '8px 12px',
                    fontSize: 15,
                    lineHeight: '20px',
                    whiteSpace: 'pre-wrap',
                    borderRadius: 16,
                    ...(isMe
                      ? { background: kaspa.accent, color: '#fff', borderBottomRightRadius: nextSame ? 16 : 5 }
                      : { background: '#ffffff', color: '#000', boxShadow: '0 1px 2px rgba(0,0,0,0.07)', borderBottomLeftRadius: nextSame ? 16 : 5 }),
                  }}
                >
                  {m.text}
                </div>
              </div>
            )
          })}
          {convo.isTyping && (
            <div className="flex justify-start" style={{ marginBottom: 10 }}>
              <div style={{ padding: '12px 14px', borderRadius: 16, borderBottomLeftRadius: 5, background: '#ffffff', boxShadow: '0 1px 2px rgba(0,0,0,0.07)' }}>
                <TypingDots color="#b0b4bb" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex shrink-0 items-center" style={{ gap: 8, padding: 10, borderTop: '0.5px solid rgba(0,0,0,0.08)' }}>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Type a message…"
            className="flex-1 rounded-full bg-[#eff1f4] outline-none placeholder:text-black/40"
            style={{ height: 38, paddingLeft: 14, paddingRight: 14, fontSize: 15 }}
          />
          <button
            onClick={send}
            disabled={!draft.trim()}
            className="flex items-center justify-center rounded-full text-white transition disabled:opacity-40"
            style={{ width: 36, height: 36, background: kaspa.accent }}
          >
            <ArrowUp size={18} weight="bold" />
          </button>
        </div>
      </div>

      {/* Safari bottom chrome — address capsule + toolbar (iOS 15+) */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{ background: 'rgba(249,249,249,0.94)', backdropFilter: 'blur(20px)', borderTop: '0.5px solid rgba(60,60,67,0.29)' }}
      >
        <div
          className="relative flex items-center justify-center bg-white"
          style={{ margin: '8px 10px 0', height: 44, borderRadius: 13, boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }}
        >
          <span className="absolute" style={{ left: 12, fontSize: 15, color: '#3C3C43' }}>
            aA
          </span>
          <span className="flex items-center" style={{ gap: 5, fontSize: 16, color: '#000' }}>
            <Lock size={12} weight="fill" color={LABEL_GRAY} />
            {kaspa.domain}
          </span>
          <ArrowClockwise size={16} className="absolute" style={{ right: 12, color: '#3C3C43' }} />
        </div>
        <div className="flex items-center justify-between" style={{ padding: '8px 26px 26px', color: IOS_BLUE }}>
          <CaretLeft size={24} />
          <CaretRight size={24} style={{ opacity: 0.3 }} />
          <Export size={22} />
          <Book size={22} />
          <Browsers size={22} />
        </div>
      </div>
    </div>
  )
}

/* --------------------------- Facebook Messenger --------------------------- */

function MessengerThread({ live }: { live: boolean }) {
  const convo = useChannelConversation(WEB_SCRIPT, webChatLive())
  const [draft, setDraft] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (live) convo.start()
    else convo.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live])
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 999999, behavior: 'smooth' })
  }, [convo.messages, convo.isTyping])

  const send = () => {
    convo.sendUserMessage(draft)
    setDraft('')
  }

  const msgs = convo.messages

  return (
    <div className="flex h-full flex-col bg-white font-ios text-black">
      {/* Header */}
      <div
        className="flex shrink-0 items-center"
        style={{ gap: 8, padding: '59px 14px 8px', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}
      >
        <CaretLeft size={28} style={{ color: FB_BLUE }} />
        <div
          className="flex items-center justify-center rounded-full text-white"
          style={{ width: 36, height: 36, background: `linear-gradient(135deg, ${kaspa.accent}, ${kaspa.accentDeep})` }}
        >
          <Tooth size={19} weight="fill" />
        </div>
        <div className="flex-1 leading-tight" style={{ marginLeft: 2 }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{kaspa.name}</div>
          <div style={{ fontSize: 12, color: LABEL_GRAY }}>Active now</div>
        </div>
        <div className="flex items-center" style={{ gap: 20, color: FB_BLUE }}>
          <Phone size={22} weight="fill" />
          <VideoCamera size={24} weight="fill" />
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="no-scrollbar flex-1 overflow-y-auto" style={{ padding: '12px 12px 6px' }}>
        {msgs.map((m, i) => {
          const isMe = m.from === 'me'
          const prevSame = i > 0 && msgs[i - 1].from === m.from
          const nextSame = i < msgs.length - 1 && msgs[i + 1].from === m.from
          const t = 4
          const b = 18
          const borderRadius = isMe
            ? `${b}px ${prevSame ? t : b}px ${nextSame ? t : b}px ${b}px`
            : `${prevSame ? t : b}px ${b}px ${b}px ${nextSame ? t : b}px`
          return (
            <div key={m.id} className={cn('flex items-end', isMe ? 'justify-end' : 'justify-start')} style={{ gap: 6, marginBottom: nextSame ? 2 : 8 }}>
              {/* Messenger shows the avatar only on the last bubble of a group */}
              {!isMe &&
                (nextSame ? (
                  <span style={{ width: 24 }} />
                ) : (
                  <div
                    className="flex shrink-0 items-center justify-center rounded-full text-white"
                    style={{ width: 24, height: 24, background: kaspa.accent }}
                  >
                    <Tooth size={13} weight="fill" />
                  </div>
                ))}
              <div
                className="bubble-in"
                style={{
                  maxWidth: '72%',
                  padding: '8px 12px',
                  fontSize: 16,
                  lineHeight: '21px',
                  whiteSpace: 'pre-wrap',
                  borderRadius,
                  background: isMe ? FB_BLUE : '#F0F0F0',
                  color: isMe ? '#fff' : '#000',
                }}
              >
                {m.text}
              </div>
            </div>
          )
        })}
        {convo.isTyping && (
          <div className="flex items-end justify-start" style={{ gap: 6, marginBottom: 8 }}>
            <div className="flex shrink-0 items-center justify-center rounded-full text-white" style={{ width: 24, height: 24, background: kaspa.accent }}>
              <Tooth size={13} weight="fill" />
            </div>
            <div style={{ padding: '12px 14px', borderRadius: 18, borderBottomLeftRadius: 4, background: '#F0F0F0' }}>
              <TypingDots color="#9a9a9a" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex shrink-0 items-center" style={{ gap: 14, padding: '6px 12px 26px', color: FB_BLUE }}>
        <Plus size={26} weight="bold" />
        <Camera size={26} weight="fill" />
        <Microphone size={26} weight="fill" />
        <div className="flex flex-1 items-center bg-[#F0F0F0]" style={{ height: 36, borderRadius: 18, paddingLeft: 14, paddingRight: 8 }}>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Aa"
            className="h-full flex-1 bg-transparent text-black outline-none placeholder:text-black/40"
            style={{ fontSize: 17 }}
          />
          <Smiley size={22} weight="fill" className="text-black/35" />
        </div>
        {draft.trim() ? (
          <button onClick={send}>
            <PaperPlaneRight size={26} weight="fill" />
          </button>
        ) : (
          <ThumbsUp size={28} weight="fill" />
        )}
      </div>
    </div>
  )
}
