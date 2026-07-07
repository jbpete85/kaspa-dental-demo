import { useEffect, useRef, useState } from 'react'
import {
  Lock,
  X,
  ArrowUp,
  PaperPlaneRight,
  Plus,
  Camera,
  Microphone,
  ThumbsUp,
  Smiley,
  CaretLeft,
  Phone,
  VideoCamera,
  Tooth,
} from '@phosphor-icons/react'
import { useChannelConversation } from '@/lib/useChannelConversation'
import { WEB_SCRIPT } from '@/lib/mockConversations'
import { kaspa } from '@/lib/kaspa.config'
import { cn } from '@/lib/utils'

export type WebSkin = 'website' | 'messenger'

export function WebChat({ live, skin }: { live: boolean; skin: WebSkin }) {
  return skin === 'messenger' ? <MessengerThread live={live} /> : <WebsiteWidget live={live} />
}

function TypingDots({ color }: { color: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className="ios-dot h-2 w-2 rounded-full" style={{ background: color }} />
      <span className="ios-dot h-2 w-2 rounded-full" style={{ background: color }} />
      <span className="ios-dot h-2 w-2 rounded-full" style={{ background: color }} />
    </div>
  )
}

/* ----------------------------- Website widget ----------------------------- */

function WebsiteWidget({ live }: { live: boolean }) {
  const convo = useChannelConversation(WEB_SCRIPT)
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
    <div className="relative h-full overflow-hidden bg-[#e9eef3] font-ios text-black">
      {/* Safari URL bar */}
      <div className="px-3 pb-2 pt-[46px]">
        <div className="mx-auto flex w-[86%] items-center justify-center gap-1.5 rounded-full bg-white/95 py-1.5 text-[13px] text-black/55 shadow-sm">
          <Lock size={12} weight="fill" /> {kaspa.domain}
        </div>
      </div>

      {/* Faux site peeking behind the widget */}
      <div className="px-5 pt-2">
        <div className="text-[20px] font-semibold" style={{ color: kaspa.accentDeep }}>
          {kaspa.name}
        </div>
        <div className="text-[12px] text-black/45">{kaspa.tagline}</div>
        <div className="mt-3 h-16 rounded-xl bg-white/70" />
      </div>

      {/* Chat widget */}
      <div className="absolute inset-x-2 bottom-2 flex h-[76%] flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_12px_44px_rgba(0,0,0,0.20)]">
        {/* Header */}
        <div
          className="flex shrink-0 items-center gap-2.5 px-3.5 py-3 text-white"
          style={{ background: `linear-gradient(135deg, ${kaspa.accent}, ${kaspa.accentDeep})` }}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
            <Tooth size={20} weight="fill" />
          </div>
          <div className="flex-1 leading-tight">
            <div className="text-[14px] font-semibold">{kaspa.name}</div>
            <div className="flex items-center gap-1 text-[11px] text-white/80">
              <span className="h-1.5 w-1.5 rounded-full bg-[#34d058]" /> Online now
            </div>
          </div>
          <X size={18} weight="bold" className="text-white/80" />
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="no-scrollbar flex-1 space-y-2 overflow-y-auto bg-[#f7f8fa] px-3 py-3">
          {convo.messages.map((m) =>
            m.from === 'me' ? (
              <div key={m.id} className="flex justify-end">
                <div
                  className="bubble-in max-w-[80%] rounded-[16px] rounded-br-[5px] px-3 py-2 text-[14px] leading-snug text-white"
                  style={{ background: kaspa.accent }}
                >
                  {m.text}
                </div>
              </div>
            ) : (
              <div key={m.id} className="flex justify-start">
                <div className="bubble-in max-w-[80%] rounded-[16px] rounded-bl-[5px] bg-white px-3 py-2 text-[14px] leading-snug text-black shadow-sm">
                  {m.text}
                </div>
              </div>
            ),
          )}
          {convo.isTyping && (
            <div className="flex justify-start">
              <div className="rounded-[16px] rounded-bl-[5px] bg-white px-3.5 py-3 shadow-sm">
                <TypingDots color="#b0b4bb" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex shrink-0 items-center gap-2 border-t border-black/5 px-2.5 py-2.5">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Type a message…"
            className="h-9 flex-1 rounded-full bg-[#eff1f4] px-3.5 text-[14px] outline-none placeholder:text-black/40"
          />
          <button
            onClick={send}
            disabled={!draft.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white transition disabled:opacity-40"
            style={{ background: kaspa.accent }}
          >
            <ArrowUp size={18} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  )
}

/* --------------------------- Facebook Messenger --------------------------- */

const FB_BLUE = '#0084ff'

function MessengerThread({ live }: { live: boolean }) {
  const convo = useChannelConversation(WEB_SCRIPT)
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
    <div className="flex h-full flex-col bg-white font-ios text-black">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-2 border-b border-black/5 px-3 pb-2 pt-[46px]">
        <CaretLeft size={26} weight="bold" style={{ color: FB_BLUE }} />
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full text-white"
          style={{ background: `linear-gradient(135deg, ${kaspa.accent}, ${kaspa.accentDeep})` }}
        >
          <Tooth size={17} weight="fill" />
        </div>
        <div className="flex-1 leading-tight">
          <div className="text-[14px] font-semibold">{kaspa.name}</div>
          <div className="text-[11px] text-black/45">Active now</div>
        </div>
        <Phone size={22} weight="fill" style={{ color: FB_BLUE }} />
        <VideoCamera size={24} weight="fill" style={{ color: FB_BLUE }} />
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="no-scrollbar flex-1 space-y-1.5 overflow-y-auto px-3 py-3">
        {convo.messages.map((m, i) =>
          m.from === 'me' ? (
            <div key={m.id} className="flex justify-end">
              <div
                className="bubble-in max-w-[78%] rounded-[18px] rounded-br-[5px] px-3.5 py-2 text-[15px] leading-snug text-white"
                style={{ background: FB_BLUE }}
              >
                {m.text}
              </div>
            </div>
          ) : (
            <div key={m.id} className="flex items-end justify-start gap-1.5">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white" style={{ background: kaspa.accent }}>
                <Tooth size={11} weight="fill" />
              </div>
              <div className="bubble-in max-w-[78%] rounded-[18px] rounded-bl-[5px] bg-[#f0f0f0] px-3.5 py-2 text-[15px] leading-snug text-black">
                {m.text}
              </div>
            </div>
          ),
        )}
        {convo.isTyping && (
          <div className="flex items-end justify-start gap-1.5">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white" style={{ background: kaspa.accent }}>
              <Tooth size={11} weight="fill" />
            </div>
            <div className="rounded-[18px] rounded-bl-[5px] bg-[#f0f0f0] px-3.5 py-3">
              <TypingDots color="#9a9a9a" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex shrink-0 items-center gap-2.5 px-3 pb-5 pt-2" style={{ color: FB_BLUE }}>
        <Plus size={24} weight="bold" />
        <Camera size={24} weight="fill" />
        <Microphone size={24} weight="fill" />
        <div className="flex flex-1 items-center rounded-full bg-[#f0f0f0] pl-3.5 pr-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Aa"
            className="h-8 flex-1 bg-transparent text-[15px] text-black outline-none placeholder:text-black/40"
          />
          <Smiley size={20} weight="fill" className="text-black/35" />
        </div>
        {draft.trim() ? (
          <button onClick={send}>
            <PaperPlaneRight size={24} weight="fill" />
          </button>
        ) : (
          <ThumbsUp size={24} weight="fill" />
        )}
      </div>
    </div>
  )
}
