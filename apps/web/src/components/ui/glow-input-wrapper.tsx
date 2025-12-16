import type { HTMLAttributes, MouseEvent } from 'react'

type GlowInputWrapperProps = HTMLAttributes<HTMLDivElement>

export function GlowInputWrapper(props: GlowInputWrapperProps) {
  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const mx = event.clientX - rect.left
    const my = event.clientY - rect.top
    event.currentTarget.style.setProperty('--mx', `${mx}px`)
    event.currentTarget.style.setProperty('--my', `${my}px`)
  }

  return (
    <div
      {...props}
      className={`glow-input-wrap ${props.className ?? ''}`}
      onMouseMove={handleMouseMove}
    />
  )
}
