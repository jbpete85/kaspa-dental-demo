import type { ReactNode } from 'react'
import { WifiHigh } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { FRAME_WIDTH, frameSrc, logicalSize, screenRect } from '@/lib/frame.config'

/* SF-style status glyphs (Phosphor's solid battery reads wrong; draw our own) */
function SignalBars() {
  return (
    <svg width="19" height="12" viewBox="0 0 19 12" fill="currentColor" aria-hidden>
      <rect x="0" y="7" width="3.4" height="4.6" rx="1.1" />
      <rect x="5" y="4.6" width="3.4" height="7" rx="1.1" />
      <rect x="10" y="2.2" width="3.4" height="9.4" rx="1.1" />
      <rect x="15" y="0" width="3.4" height="11.6" rx="1.1" />
    </svg>
  )
}

function BatteryIcon() {
  return (
    <svg width="28" height="13" viewBox="0 0 28 13" aria-hidden>
      <rect x="0.5" y="0.5" width="24" height="12" rx="4" fill="none" stroke="currentColor" strokeOpacity="0.4" />
      <rect x="2.5" y="2.5" width="20" height="8" rx="2" fill="currentColor" />
      <path d="M26 4.2v4.6c1.1-.35 1.8-1.25 1.8-2.3s-.7-1.95-1.8-2.3z" fill="currentColor" fillOpacity="0.45" />
    </svg>
  )
}

interface PhoneFrameProps {
  children: ReactNode
  /** status-bar / home-indicator color: dark on a light screen, white on a dark screen */
  statusTone?: 'onLight' | 'onDark'
  time?: string
  className?: string
}

/**
 * Real Apple device frame (PNG, Dynamic Island baked in) over live screen content.
 *
 * Authenticity model: the screen renders at NATIVE iOS point size (e.g. 402×874
 * on iPhone 17 Pro) with true iOS metrics (17pt body text, 59pt status area…),
 * then the whole surface is uniformly scaled down into the measured screen
 * cutout — exactly like shrinking a real screenshot. This kills the
 * "everything slightly too big" uncanny valley.
 */
export function PhoneFrame({
  children,
  statusTone = 'onLight',
  time = '9:41',
  className,
}: PhoneFrameProps) {
  const r = screenRect(FRAME_WIDTH)
  const logical = logicalSize()
  const scale = r.sw / logical.width
  const logicalH = r.sh / scale
  const tone = statusTone === 'onDark' ? 'text-white' : 'text-black'

  return (
    <div className={cn('relative font-ios select-none', className)} style={{ width: r.width, height: r.height }}>
      {/* Screen cutout */}
      <div
        className="absolute overflow-hidden bg-white"
        style={{ left: r.sx, top: r.sy, width: r.sw, height: r.sh, borderRadius: r.radius }}
      >
        {/* Native-resolution surface, scaled to fit */}
        <div
          className="relative"
          style={{ width: logical.width, height: logicalH, transform: `scale(${scale})`, transformOrigin: 'top left' }}
        >
          <div className="absolute inset-0">{children}</div>

          {/* Status bar — time centered in the left ear, glyphs in the right ear */}
          <div
            className={cn('pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between', tone)}
            style={{ height: 59, paddingTop: 22, paddingLeft: 6, paddingRight: 6 }}
          >
            <div className="flex justify-center" style={{ width: 138 }}>
              <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: -0.4 }}>{time}</span>
            </div>
            <div className="flex items-center justify-center" style={{ width: 138, gap: 7, paddingTop: 3 }}>
              <SignalBars />
              <WifiHigh weight="bold" size={18} />
              <BatteryIcon />
            </div>
          </div>

          {/* Home indicator */}
          <div className="pointer-events-none absolute inset-x-0 z-30 flex justify-center" style={{ bottom: 8 }}>
            <div
              className={statusTone === 'onDark' ? 'bg-white' : 'bg-black'}
              style={{ width: 140, height: 5, borderRadius: 3, opacity: statusTone === 'onDark' ? 0.9 : 0.85 }}
            />
          </div>
        </div>
      </div>

      {/* Device frame on top (bezel, island, buttons); clicks pass through */}
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
