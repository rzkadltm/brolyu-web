import type { CSSProperties } from 'react'

type AvatarProps = {
  initial: string
  color: string
  size?: number
  speaking?: boolean
  className?: string
  title?: string
  style?: CSSProperties
}

function Avatar({ initial, color, size = 36, className, title, style }: AvatarProps) {
  return (
    <div
      className={className}
      title={title}
      style={{
        width: size,
        height: size,
        background: color,
        ...style,
      }}
    >
      {initial}
    </div>
  )
}

export default Avatar
