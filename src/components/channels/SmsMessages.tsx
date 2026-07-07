import { useEffect, useRef, useState } from 'react'
import { CaretLeft, VideoCamera, Plus, ArrowUp, Tooth } from '@phosphor-icons/react'
import { useChannelConversation } from '@/lib/useChannelConversation'
import { SMS_SCRIPT } from '@/lib/mockConversations'
import { kaspa } from '@/lib/kaspa.config'
import { cn } from '@/lib/utils'

export function SmsMessages({ live }: { live: boolean }) {
  const convo = useChannelConversation(SMS_SCRIPT)
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
      <div className="relative shrink-0 border-b border-black/10 bg-[#f7f7f7]/95 px-3 pb-2 pt-[46px] backdrop-blur-xl">
        <button className="absolute bottom-2 left-3 text-[#0a84ff]">
          <CaretLeft size={26} weight="bold" />
        </button>
        <div className="flex flex-col items-center">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-white"
            style={{ background: `linear-gradient(135deg, ${kaspa.accent}, ${kaspa.accentDeep})` }}
          >
            <Tooth size={18} weight="fill" />
          </div>
          <span className="mt-0.5 text-[11px] font-medium leading-tight">{kaspa.name}</span>
        </div>
        <button className="absolute bottom-2 right-3 text-[#0a84ff]">
          <VideoCamera size={24} weight="fill" />
        </button>
      </div>

      {/* Thread */}
      <div ref={scrollRef} className="no-scrollbar flex-1 space-y-1.5 overflow-y-auto px-3 py-3">
        <div className="pb-1 text-center text-[11px] text-black/35">Text Message · SMS</div>
        {convo.messages.map((m) =>
          m.from === 'me' ? (
            <div key={m.id} className="flex justify-end">
              <div className="bubble-in max-w-[78%] rounded-[18px] rounded-br-[5px] bg-[#34c759] px-3.5 py-2 text-[15px] leading-snug text-white">
                {m.text}
              </div>
            </div>
          ) : (
            <div key={m.id} className="flex justify-start">
              <div className="bubble-in max-w-[78%] rounded-[18px] rounded-bl-[5px] bg-[#e9e9eb] px-3.5 py-2 text-[15px] leading-snug text-black">
                {m.text}
              </div>
            </div>
          ),
        )}
        {convo.isTyping && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1 rounded-[18px] rounded-bl-[5px] bg-[#e9e9eb] px-3.5 py-3">
              <span className="ios-dot h-2 w-2 rounded-full bg-[#8e8e93]" />
              <span className="ios-dot h-2 w-2 rounded-full bg-[#8e8e93]" />
              <span className="ios-dot h-2 w-2 rounded-full bg-[#8e8e93]" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex shrink-0 items-center gap-2 px-2.5 pb-5 pt-2">
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e9e9eb] text-black/60">
          <Plus size={20} weight="bold" />
        </button>
        <div className="flex flex-1 items-center rounded-full border border-black/15 bg-white pl-3.5 pr-1">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Text Message"
            className="h-8 flex-1 bg-transparent text-[15px] outline-none placeholder:text-black/35"
          />
          <button
            onClick={send}
            disabled={!draft.trim()}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full transition',
              draft.trim() ? 'bg-[#34c759] text-white' : 'bg-[#e4e4e6] text-white/70',
            )}
          >
            <ArrowUp size={18} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  )
}
