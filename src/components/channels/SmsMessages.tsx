import { useEffect, useRef, useState } from 'react'
import { CaretLeft, CaretRight, Plus, ArrowUp, Tooth } from '@phosphor-icons/react'
import { useChannelConversation, type PollOptions } from '@/lib/useChannelConversation'
import { SMS_SCRIPT } from '@/lib/mockConversations'
import { kaspa, transports, mockForced } from '@/lib/kaspa.config'
import { cn } from '@/lib/utils'

/** Mirror the real Twilio thread unless config says mock or `?mock=1` forced it. */
function smsPoll(): { poll: PollOptions } | undefined {
  if (transports.sms.mode !== 'live' || mockForced()) return undefined
  return {
    poll: {
      endpoint: transports.sms.threadEndpoint,
      resetOnStart: transports.sms.resetOnStart,
    },
  }
}

/* iOS light-mode Messages palette */
const IOS_BLUE = '#007AFF'
const SMS_GREEN = '#34C759'
const RECEIVED_GRAY = '#E9E9EB'
const LABEL_GRAY = '#8E8E93'

export function SmsMessages({ live }: { live: boolean }) {
  const mirror = smsPoll()
  const convo = useChannelConversation(SMS_SCRIPT, mirror)
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
      {/* Nav bar — back chevron, centered 50pt avatar, name + disclosure below */}
      <div
        className="relative shrink-0"
        style={{
          paddingTop: 59,
          paddingBottom: 10,
          background: 'rgba(249,249,249,0.94)',
          backdropFilter: 'blur(20px)',
          borderBottom: '0.5px solid rgba(60,60,67,0.29)',
        }}
      >
        <button className="absolute" style={{ left: 8, bottom: 30, color: IOS_BLUE }}>
          <CaretLeft size={28} />
        </button>
        <div className="flex flex-col items-center">
          <div
            className="flex items-center justify-center rounded-full text-white"
            style={{ width: 50, height: 50, background: `linear-gradient(135deg, ${kaspa.accent}, ${kaspa.accentDeep})` }}
          >
            <Tooth size={26} weight="fill" />
          </div>
          <span className="flex items-center" style={{ marginTop: 3, fontSize: 11.5, gap: 1 }}>
            {kaspa.name}
            <CaretRight size={9} color="#B8B8BE" weight="bold" />
          </span>
        </div>
      </div>

      {/* Thread */}
      <div ref={scrollRef} className="no-scrollbar flex-1 overflow-y-auto" style={{ padding: '10px 16px 6px' }}>
        <div className="text-center" style={{ fontSize: 11.5, color: LABEL_GRAY, paddingBottom: 2 }}>
          <span style={{ fontWeight: 600 }}>Today</span> 9:41 AM
        </div>
        <div className="text-center" style={{ fontSize: 11.5, color: LABEL_GRAY, paddingBottom: 10 }}>
          {mirror && live && transports.sms.numberToText
            ? `Text ${transports.sms.numberToText} to talk to ${kaspa.agentName}`
            : 'Text Message · SMS'}
        </div>

        {msgs.map((m, i) => {
          const isMe = m.from === 'me'
          const prevSame = i > 0 && msgs[i - 1].from === m.from
          const nextSame = i < msgs.length - 1 && msgs[i + 1].from === m.from
          const t = 5
          const b = 18
          // grouped bubbles tighten the stacked-side corners; last-of-group gets the tail
          const borderRadius = isMe
            ? `${b}px ${prevSame ? t : b}px ${nextSame ? t : b}px ${b}px`
            : `${prevSame ? t : b}px ${b}px ${b}px ${nextSame ? t : b}px`
          return (
            <div
              key={m.id}
              className={cn('flex', isMe ? 'justify-end' : 'justify-start')}
              style={{ marginBottom: nextSame ? 2 : 8 }}
            >
              <div
                className={cn('bubble-in', !nextSame && (isMe ? 'msg-tail msg-tail-out' : 'msg-tail msg-tail-in'))}
                style={{
                  maxWidth: '75%',
                  padding: '7px 12px',
                  fontSize: 17,
                  lineHeight: '22px',
                  whiteSpace: 'pre-wrap',
                  borderRadius,
                  background: isMe ? SMS_GREEN : RECEIVED_GRAY,
                  color: isMe ? '#ffffff' : '#000000',
                }}
              >
                {m.text}
              </div>
            </div>
          )
        })}
        {convo.isTyping && (
          <div className="flex justify-start" style={{ marginBottom: 8 }}>
            <div
              className="msg-tail msg-tail-in flex items-center"
              style={{ gap: 5, padding: '13px 14px', borderRadius: 18, background: RECEIVED_GRAY }}
            >
              <span className="ios-dot rounded-full" style={{ width: 8, height: 8, background: LABEL_GRAY }} />
              <span className="ios-dot rounded-full" style={{ width: 8, height: 8, background: LABEL_GRAY }} />
              <span className="ios-dot rounded-full" style={{ width: 8, height: 8, background: LABEL_GRAY }} />
            </div>
          </div>
        )}
      </div>

      {/* Input — plus button, hairline field, green send inside the field */}
      <div className="flex shrink-0 items-center" style={{ gap: 10, padding: '6px 14px 26px' }}>
        <button
          className="flex shrink-0 items-center justify-center rounded-full"
          style={{ width: 34, height: 34, background: RECEIVED_GRAY, color: '#7C7C82' }}
        >
          <Plus size={20} weight="bold" />
        </button>
        <div
          className="flex flex-1 items-center"
          style={{ height: 36, borderRadius: 18, border: '1px solid rgba(60,60,67,0.22)', paddingLeft: 14, paddingRight: 4 }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Text Message · SMS"
            className="h-full flex-1 bg-transparent outline-none"
            style={{ fontSize: 17 }}
          />
          <button
            onClick={send}
            disabled={!draft.trim()}
            className="flex shrink-0 items-center justify-center rounded-full transition"
            style={{ width: 28, height: 28, background: draft.trim() ? SMS_GREEN : '#E5E5EA', color: '#ffffff' }}
          >
            <ArrowUp size={17} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  )
}
