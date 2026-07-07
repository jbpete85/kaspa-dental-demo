import type { ReactNode } from 'react'
import { CellSignalFull, WifiHigh, BatteryFull } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { FRAME_WIDTH, frameSrc, screenRect } from '@/lib/frame.config'

interface PhoneFrameProps {
  children: ReactNode
  /** status-bar text color: dark on a light screen, white on a dark screen */
  statusTone?: 'onLight' | 'onDark'
  time?: string
  className?: string
}

/**
 * Real Apple device frame (PNG, with Dynamic Island baked in) overlaid on top
 * of live screen content positioned inside the measured screen cutout.
 */
export function PhoneFrame({
  children,
  statusTone = 'onLight',
  time = '9:41',
  className,
}: PhoneFrameProps) {
  const r = screenRect(FRAME_WIDTH)
  const tone = statusTone === 'onDark' ? 'text-white' : 'text-black'

  return (
    <div className={cn('relative font-ios select-none', className)} style={{ width: r.width, height: r.height }}>
      {/* Live screen content, clipped to the screen cutout */}
      <div
        className="absolute overflow-hidden bg-white"
        style={{ left: r.sx, top: r.sy, width: r.sw, height: r.sh, borderRadius: r.radius }}
      >
        <div className="absolute inset-0">{children}</div>

        {/* Status bar — time + icons flank the frame's Dynamic Island */}
        <div className={cn('absolute inset-x-0 top-0 z-30 flex h-9 items-center justify-between px-5', tone)}>
          <span className="text-[13px] font-semibold tracking-tight">{time}</span>
          <div className="flex items-center gap-[5px]">
            <CellSignalFull weight="fill" size={16} />
            <WifiHigh weight="fill" size={16} />
            <BatteryFull weight="fill" size={20} />
          </div>
        </div>
      </div>

      {/* Device frame on top (Dynamic Island + bezel + buttons); clicks pass through */}
      <img
        src={frameSrc()}
        alt=""
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full select-none"
        style={{ filter: 'drop-shadow(0 22px 38px rgba(0,0,0,0.18))' }}
      />
    </div>
  )
}
