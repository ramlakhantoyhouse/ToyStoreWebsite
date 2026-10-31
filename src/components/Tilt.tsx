import { useEffect, useRef, type ReactNode } from 'react'

/**
 * Leans toward the pointer in 3D and springs back on leave, like picking a
 * toy box off the shelf. Pointer devices only; touch and reduced motion get a
 * still block.
 */
export function Tilt({ children, className = '', max = 7 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const target = useRef({ x: 0, y: 0 })
  const cur = useRef({ x: 0, y: 0, vx: 0, vy: 0 })
  const raf = useRef(0)

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const run = () => {
    cancelAnimationFrame(raf.current)
    const step = () => {
      const c = cur.current
      // damped spring toward the target angle
      c.vx = (c.vx + (target.current.x - c.x) * 0.12) * 0.78
      c.vy = (c.vy + (target.current.y - c.y) * 0.12) * 0.78
      c.x += c.vx
      c.y += c.vy
      const el = ref.current
      if (el) el.style.transform = `perspective(900px) rotateX(${c.y}deg) rotateY(${c.x}deg)`
      const settled = Math.abs(c.vx) + Math.abs(c.vy) < 0.01 && Math.abs(target.current.x - c.x) + Math.abs(target.current.y - c.y) < 0.01
      if (!settled) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
  }

  const ok = (e: React.PointerEvent) =>
    e.pointerType === 'mouse' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <div
      ref={ref}
      className={`will-change-transform [transform-style:preserve-3d] ${className}`}
      onPointerMove={(e) => {
        if (!ok(e)) return
        const r = e.currentTarget.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width - 0.5
        const py = (e.clientY - r.top) / r.height - 0.5
        target.current = { x: px * max * 2, y: -py * max * 2 }
        run()
      }}
      onPointerLeave={() => {
        target.current = { x: 0, y: 0 }
        run()
      }}
    >
      {children}
    </div>
  )
}
