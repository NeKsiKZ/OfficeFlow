import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { useTheme } from '../../../theme/ThemeProvider'
import {
  drawCampusMap,
  hitTestPlacement,
  MAP_HIT_PADDING,
} from '../campusMapDraw'
import { getCampusMapPalette } from '../campusMapPalette'
import type { CampusFloor } from '../floors'
import type { MapPlacement, MapZone } from '../mapLayout'
import { formatSpaceRate, SpaceType, type Space } from '../types'

interface CampusMapCanvasProps {
  floor: CampusFloor
  zones: MapZone[]
  placements: MapPlacement[]
  selectedSpace: Space | null
  onSelect: (space: Space) => void
  ariaLabel: string
}

interface DisplaySnapshot {
  floor: CampusFloor
  zones: MapZone[]
  placements: MapPlacement[]
}

/** Critically damped-ish easing (Apple response ~0.08–0.16s). */
function approach(
  current: number,
  target: number,
  dtMs: number,
  responseSec: number,
): number {
  const t = 1 - Math.exp(-dtMs / (responseSec * 1000))
  return current + (target - current) * t
}

export function CampusMapCanvas({
  floor,
  zones,
  placements,
  selectedSpace,
  onSelect,
  ariaLabel,
}: CampusMapCanvasProps) {
  const { resolved } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [roomHoverTip, setRoomHoverTip] = useState<MapPlacement | null>(null)

  const sizeRef = useRef({ width: 0, height: 0 })
  const displayRef = useRef<DisplaySnapshot>({ floor, zones, placements })
  const pendingRef = useRef<DisplaySnapshot | null>(null)
  const selectedIdRef = useRef<string | null>(selectedSpace?.id ?? null)
  const themeRef = useRef(resolved)

  const hoveredIdRef = useRef<string | null>(null)
  const pressedIdRef = useRef<string | null>(null)
  const pressOriginRef = useRef<{ x: number; y: number } | null>(null)
  const hoverAmountRef = useRef(0)
  const pressAmountRef = useRef(0)
  const contentOpacityRef = useRef(1)
  const contentTargetRef = useRef(1)
  const reduceMotionRef = useRef(false)
  const cursorRef = useRef<'default' | 'pointer'>('default')
  const rafRef = useRef(0)
  const lastTsRef = useRef(0)

  useEffect(() => {
    selectedIdRef.current = selectedSpace?.id ?? null
  }, [selectedSpace?.id])

  useEffect(() => {
    themeRef.current = resolved
  }, [resolved])

  useEffect(() => {
    const current = displayRef.current
    const next: DisplaySnapshot = { floor, zones, placements }

    if (current.floor === floor) {
      // Same floor — update layout live (filters etc.)
      displayRef.current = next
      return
    }

    if (reduceMotionRef.current) {
      displayRef.current = next
      pendingRef.current = null
      contentOpacityRef.current = 1
      contentTargetRef.current = 1
      return
    }

    // Fade out → swap snapshot → fade in (spatial consistency)
    pendingRef.current = next
    contentTargetRef.current = 0
    setRoomHoverTip(null)
  }, [floor, zones, placements])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => {
      reduceMotionRef.current = media.matches
    }
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) {
        return
      }

      sizeRef.current = {
        width: Math.max(1, Math.floor(entry.contentRect.width)),
        height: Math.max(1, Math.floor(entry.contentRect.height)),
      }
    })

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const loop = (ts: number) => {
      const dt = lastTsRef.current ? Math.min(40, ts - lastTsRef.current) : 16
      lastTsRef.current = ts

      const reduceMotion = reduceMotionRef.current
      const hoverTarget = hoveredIdRef.current ? 1 : 0
      const pressTarget = pressedIdRef.current ? 1 : 0

      hoverAmountRef.current = reduceMotion
        ? hoverTarget
        : approach(hoverAmountRef.current, hoverTarget, dt, 0.12)
      pressAmountRef.current = reduceMotion
        ? pressTarget
        : approach(pressAmountRef.current, pressTarget, dt, 0.08)

      contentOpacityRef.current = reduceMotion
        ? contentTargetRef.current
        : approach(
            contentOpacityRef.current,
            contentTargetRef.current,
            dt,
            0.14,
          )

      if (
        pendingRef.current &&
        contentOpacityRef.current < 0.06 &&
        contentTargetRef.current === 0
      ) {
        displayRef.current = pendingRef.current
        pendingRef.current = null
        contentTargetRef.current = 1
        hoveredIdRef.current = null
        pressedIdRef.current = null
      }

      const { width, height } = sizeRef.current
      if (width > 0 && height > 0) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        const pixelW = Math.floor(width * dpr)
        const pixelH = Math.floor(height * dpr)
        if (canvas.width !== pixelW || canvas.height !== pixelH) {
          canvas.width = pixelW
          canvas.height = pixelH
          canvas.style.width = `${width}px`
          canvas.style.height = `${height}px`
        }

        const ctx = canvas.getContext('2d')
        if (ctx) {
          const display = displayRef.current
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
          drawCampusMap(ctx, {
            width,
            height,
            floor: display.floor,
            zones: display.zones,
            placements: display.placements,
            palette: getCampusMapPalette(themeRef.current),
            hoveredId: hoveredIdRef.current,
            selectedId: selectedIdRef.current,
            pressedId: pressedIdRef.current,
            contentOpacity: contentOpacityRef.current,
            hoverAmount: hoverAmountRef.current,
            pressAmount: pressAmountRef.current,
            reduceMotion,
          })
        }
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  function pointerToLocal(event: ReactPointerEvent<HTMLCanvasElement>): {
    x: number
    y: number
  } {
    const canvas = canvasRef.current
    if (!canvas) {
      return { x: 0, y: 0 }
    }

    const rect = canvas.getBoundingClientRect()
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
  }

  function setCursor(next: 'default' | 'pointer') {
    if (cursorRef.current === next) {
      return
    }
    cursorRef.current = next
    if (canvasRef.current) {
      canvasRef.current.style.cursor = next
    }
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    const { width, height } = sizeRef.current
    if (width === 0) {
      return
    }

    const { x, y } = pointerToLocal(event)
    const hit = hitTestPlacement(
      displayRef.current.placements,
      width,
      height,
      x,
      y,
      MAP_HIT_PADDING,
    )

    if (pressedIdRef.current && pressOriginRef.current) {
      const dx = x - pressOriginRef.current.x
      const dy = y - pressOriginRef.current.y
      if (Math.hypot(dx, dy) > 12 || hit?.space.id !== pressedIdRef.current) {
        pressedIdRef.current = null
      }
    }

    if (event.pointerType === 'mouse') {
      hoveredIdRef.current = hit?.space.id ?? null
      const nextTip =
        hit?.space.type === SpaceType.Room ? hit : null
      setRoomHoverTip((current) =>
        current?.space.id === nextTip?.space.id ? current : nextTip,
      )
    }

    setCursor(hit ? 'pointer' : 'default')
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    const { width, height } = sizeRef.current
    if (width === 0) {
      return
    }

    const { x, y } = pointerToLocal(event)
    const hit = hitTestPlacement(
      displayRef.current.placements,
      width,
      height,
      x,
      y,
      MAP_HIT_PADDING,
    )

    // Instant press feedback (pointer-down, not click)
    if (hit) {
      pressedIdRef.current = hit.space.id
      pressOriginRef.current = { x, y }
      hoveredIdRef.current = hit.space.id
      event.currentTarget.setPointerCapture(event.pointerId)
    } else {
      pressedIdRef.current = null
      pressOriginRef.current = null
    }
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLCanvasElement>) {
    const { width, height } = sizeRef.current
    const pressedId = pressedIdRef.current
    pressedIdRef.current = null
    pressOriginRef.current = null

    if (!pressedId || width === 0) {
      return
    }

    const { x, y } = pointerToLocal(event)
    const hit = hitTestPlacement(
      displayRef.current.placements,
      width,
      height,
      x,
      y,
      MAP_HIT_PADDING,
    )

    if (hit && hit.space.id === pressedId) {
      onSelect(hit.space)
    }
  }

  function handlePointerCancel() {
    pressedIdRef.current = null
    pressOriginRef.current = null
  }

  function handlePointerLeave() {
    if (!pressedIdRef.current) {
      hoveredIdRef.current = null
      setRoomHoverTip(null)
      setCursor('default')
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative aspect-[16/10] w-full"
    >
      <div className="of-map-floor absolute inset-0 overflow-hidden rounded-[22px] border border-ink-200/80 shadow-material">
        <canvas
          ref={canvasRef}
          role="application"
          aria-label={ariaLabel}
          className="block h-full w-full touch-manipulation"
          style={{ cursor: 'default', touchAction: 'manipulation' }}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onPointerLeave={handlePointerLeave}
        />
      </div>

      {roomHoverTip ? (
        <RoomHoverTooltip placement={roomHoverTip} />
      ) : null}
    </div>
  )
}

function RoomHoverTooltip({ placement }: { placement: MapPlacement }) {
  const { space } = placement
  const area =
    space.areaSquareMeters != null
      ? `${space.areaSquareMeters} m²`
      : 'Area n/a'

  return (
    <div
      role="tooltip"
      className="of-material pointer-events-none absolute z-20 min-w-[9.5rem] rounded-[12px] px-3 py-2 shadow-material"
      style={{
        left: `${placement.leftPercent + placement.widthPercent / 2}%`,
        top: `${placement.topPercent}%`,
        transform: 'translate(-50%, calc(-100% - 10px))',
      }}
    >
      <p className="text-[0.8125rem] font-semibold tracking-[-0.01em] text-ink-900">
        {space.name}
      </p>
      <p className="of-caption mt-1 text-ink-600">{formatSpaceRate(space)}</p>
      <p className="of-caption mt-0.5 text-ink-600">{area}</p>
    </div>
  )
}
