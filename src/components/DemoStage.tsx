import { useState } from 'react'
import { CaretDown, Tooth } from '@phosphor-icons/react'
import { ChannelSection } from './ChannelSection'
import { SmsMessages } from './channels/SmsMessages'
import { VoiceCall } from './channels/VoiceCall'
import { WebChat, type WebSkin } from './channels/WebChat'
import { kaspa } from '@/lib/kaspa.config'
import { cn } from '@/lib/utils'

type Channel = 'sms' | 'voice' | 'web'

function SkinDropdown({ value, onChange }: { value: WebSkin; onChange: (v: WebSkin) => void }) {
  const [open, setOpen] = useState(false)
  const opts: { v: WebSkin; label: string }[] = [
    { v: 'website', label: 'Website' },
    { v: 'messenger', label: 'Facebook Messenger' },
  ]
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg bg-white/15 px-3.5 py-2 text-[13px] font-medium text-white backdrop-blur transition hover:bg-white/25"
      >
        {opts.find((o) => o.v === value)?.label}
        <CaretDown size={13} weight="bold" />
      </button>
      {open && (
        <div className="absolute left-1/2 top-full z-50 mt-1.5 w-48 -translate-x-1/2 overflow-hidden rounded-lg bg-white shadow-xl">
          {opts.map((o) => (
            <button
              key={o.v}
              onClick={() => {
                onChange(o.v)
                setOpen(false)
              }}
              className={cn(
                'block w-full px-3.5 py-2.5 text-left text-[13px] text-black transition hover:bg-black/5',
                o.v === value && 'font-semibold',
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function DemoStage() {
  const [active, setActive] = useState<Channel | null>(null)
  const [webSkin, setWebSkin] = useState<WebSkin>('website')

  const stop = () => setActive(null)

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fafbfc]">
      {/* Soft brand glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
        style={{
          background:
            'radial-gradient(ellipse 60% 100% at 50% 0%, rgba(32,164,243,0.10), transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="mb-3 flex items-center justify-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-accent">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-accent text-white">
              <Tooth size={12} weight="fill" />
            </span>
            Kingside · Dental Agent
          </div>
          <h1 className="mx-auto max-w-3xl font-heading text-[40px] font-semibold leading-[1.08] text-foreground">
            One agent. Every way a patient reaches out.
          </h1>
          <p className="mx-auto mt-4 max-w-xl font-body text-[16px] text-muted-foreground">
            {kaspa.name}'s front desk, answering by text, phone, and web. Instantly, around
            the clock. Hover a phone and press Start.
          </p>
        </header>

        {/* Three channels */}
        <div className="grid grid-cols-1 items-start justify-items-center gap-12 md:grid-cols-3 md:gap-6">
          <ChannelSection
            title="SMS / Text"
            subtitle="via Twilio"
            isActive={active === 'sms'}
            isDimmed={active !== null && active !== 'sms'}
            onStart={() => setActive('sms')}
            onStop={stop}
          >
            <SmsMessages live={active === 'sms'} />
          </ChannelSection>

          <ChannelSection
            title="Phone Call"
            subtitle="via ElevenLabs"
            statusTone="onDark"
            isActive={active === 'voice'}
            isDimmed={active !== null && active !== 'voice'}
            onStart={() => setActive('voice')}
            onStop={stop}
          >
            <VoiceCall live={active === 'voice'} onEnd={stop} />
          </ChannelSection>

          <ChannelSection
            title="Web Chat"
            subtitle={webSkin === 'messenger' ? 'Facebook Messenger' : 'Website widget'}
            isActive={active === 'web'}
            isDimmed={active !== null && active !== 'web'}
            onStart={() => setActive('web')}
            onStop={stop}
            overlayControl={<SkinDropdown value={webSkin} onChange={setWebSkin} />}
          >
            <WebChat live={active === 'web'} skin={webSkin} />
          </ChannelSection>
        </div>

        {/* Footer note */}
        <p className="mt-16 text-center font-body text-[12px] text-muted-foreground/70">
          Prototype · web chat &amp; SMS are live (voice mocked) · swap the practice in <code>kaspa.config.ts</code>
        </p>
      </div>
    </div>
  )
}
