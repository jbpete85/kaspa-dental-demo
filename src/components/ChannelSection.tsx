import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { Play, X } from '@phosphor-icons/react'
import { PhoneFrame } from './PhoneFrame'
import { FRAME_WIDTH, screenRect } from '@/lib/frame.config'
import { cn } from '@/lib/utils'

interface ChannelSectionProps {
  title: string
  subtitle: string
  statusTone?: 'onLight' | 'onDark'
  isActive: boolean
  isDimmed: boolean
  onStart: () => void
  onStop: () => void
  /** Extra control shown in the hover overlay above Start (e.g. the web-chat dropdown). */
  overlayControl?: ReactNode
  children: ReactNode
}

export function ChannelSection({
  title,
  subtitle,
  statusTone = 'onLight',
  isActive,
  isDimmed,
  onStart,
  onStop,
  overlayControl,
  children,
}: ChannelSectionProps) {
  const r = screenRect(FRAME_WIDTH)

  return (
    <motion.div
      className="flex flex-col items-center"
      animate={{
        scale: isActive ? 1.04 : isDimmed ? 0.9 : 1,
        opacity: isDimmed ? 0.5 : 1,
      }}
      transition={{ type: 'spring', stiffness: 240, damping: 26 }}
    >
      <div className="group relative">
        <div
          className={cn(
            'transition duration-500',
            !isActive && 'grayscale brightness-[0.97] group-hover:grayscale-0 group-hover:brightness-100',
          )}
        >
          <PhoneFrame statusTone={statusTone}>{children}</PhoneFrame>
        </div>

        {/* Idle / hover overlay — sits over the screen cutout */}
        {!isActive && (
          <div
            className="pointer-events-none absolute z-40 flex flex-col items-center justify-center gap-4 bg-black/45 opacity-0 backdrop-blur-[1px] transition-opacity duration-300 group-hover:pointer-events-auto group-hover:opacity-100"
            style={{ left: r.sx, top: r.sy, width: r.sw, height: r.sh, borderRadius: r.radius }}
          >
            <div className="text-center">
              <div className="font-heading text-[20px] font-semibold text-white">{title}</div>
              <div className="text-[13px] text-white/70">{subtitle}</div>
            </div>
            {overlayControl}
            <button
              onClick={onStart}
              className="flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 font-heading text-[15px] font-semibold text-white shadow-lg transition hover:brightness-110 active:scale-95"
            >
              <Play size={16} weight="fill" />
              Start
            </button>
          </div>
        )}

        {/* Active: end control */}
        {isActive && (
          <button
            onClick={onStop}
            className="absolute right-1 top-1 z-50 flex items-center gap-1 rounded-full bg-foreground px-3 py-1.5 text-[12px] font-medium text-white shadow-lg transition hover:brightness-125"
          >
            <X size={13} weight="bold" />
            End
          </button>
        )}
      </div>

      {/* Persistent section label */}
      <div className="mt-5 flex items-center gap-2">
        <span className={cn('h-2 w-2 rounded-full transition', isActive ? 'bg-accent' : 'bg-border')} />
        <span className="font-body text-[13px] text-muted-foreground">{title}</span>
      </div>
    </motion.div>
  )
}
