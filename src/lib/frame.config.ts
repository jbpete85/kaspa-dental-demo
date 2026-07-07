/**
 * Real Apple device frames (Bezel exports) live in /public/frames.
 * Cutout geometry was measured per device family from the alpha channel
 * (transparent screen region), so the UI sits exactly inside the bezel.
 *
 * Swap device/color below to re-skin all three phones at once.
 * `color` must match a file present in /public/frames for that device.
 */

export const FRAME_WIDTH = 312

type Geom = {
  aspect: number // image width / height
  leftPct: number
  topPct: number
  wPct: number
  hPct: number
  radiusPct: number // screen corner radius as % of screen width
}

const FAMILIES: Record<string, Geom> = {
  '17': { aspect: 0.4891, leftPct: 5.333, topPct: 2.79, wPct: 89.259, hPct: 94.384, radiusPct: 14.52 },
  '17 Pro': { aspect: 0.4891, leftPct: 5.333, topPct: 2.79, wPct: 89.259, hPct: 94.384, radiusPct: 14.52 },
  '17 Pro Max': { aspect: 0.49, leftPct: 5.102, topPct: 2.4, wPct: 89.728, hPct: 95.167, radiusPct: 13.57 },
  Air: { aspect: 0.4792, leftPct: 4.348, topPct: 2.743, wPct: 91.232, hPct: 94.514, radiusPct: 14.06 },
}

// ── Swap here ──────────────────────────────────────────────
// device: '17' | '17 Pro' | '17 Pro Max' | 'Air'
// color: any color present in /public/frames for that device
//   17: Black, Lavender, Mist Blue, Sage, White
//   17 Pro / 17 Pro Max: Silver, Deep Blue, Cosmic Orange
//   Air: Space Black, Cloud White, Light Gold, Sky Blue
export const activeFrame = { device: '17 Pro', color: 'Silver' }
// ───────────────────────────────────────────────────────────

export function frameSrc() {
  const file = `iPhone ${activeFrame.device} - ${activeFrame.color} - Portrait.png`
  // base-aware so it resolves under a GitHub Pages sub-path too
  return `${import.meta.env.BASE_URL}frames/${encodeURIComponent(file)}`
}

function geom(): Geom {
  return FAMILIES[activeFrame.device] ?? FAMILIES['17 Pro']
}

/** Resolve the on-screen screen-cutout rectangle (px) for a given frame width. */
export function screenRect(width = FRAME_WIDTH) {
  const g = geom()
  const height = width / g.aspect
  const sw = (width * g.wPct) / 100
  return {
    width,
    height,
    sx: (width * g.leftPct) / 100,
    sy: (height * g.topPct) / 100,
    sw,
    sh: (height * g.hPct) / 100,
    radius: (sw * g.radiusPct) / 100,
  }
}
