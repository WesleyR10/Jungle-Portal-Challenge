import { useRef, useState } from 'react'

type Props = {
  className?: string
  children: React.ReactNode
}

export function GlowWrap({ className, children }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [angle, setAngle] = useState(0)

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const cx = rect.width / 2
    const cy = rect.height / 2
    const rad = Math.atan2(y - cy, x - cx)
    const deg = (rad * 180) / Math.PI
    setAngle(deg)
  }

  return (
    <div
      ref={ref}
      className={`glow-wrap ${className ?? ''}`}
      style={{ ['--glow-angle' as any]: `${angle}deg` }}
      onMouseMove={onMouseMove}
    >
      {children}
    </div>
  )
}
