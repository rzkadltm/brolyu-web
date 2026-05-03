import { useState, type CSSProperties } from 'react'

type AvatarProps = {
  initial: string
  src?: string | null
  size?: number
  speaking?: boolean
  className?: string
  title?: string
  style?: CSSProperties
}

function Avatar({ initial, src, size = 36, className, title, style }: AvatarProps) {
  const [errored, setErrored] = useState(false)
  // Reset the error flag when the URL itself changes — a new src deserves a
  // fresh load attempt before falling back to the initial. React's documented
  // "previous value" pattern: compare against tracked state during render.
  const [trackedSrc, setTrackedSrc] = useState<string | null | undefined>(src)
  if (trackedSrc !== src) {
    setTrackedSrc(src)
    if (errored) setErrored(false)
  }

  const showImage = Boolean(src) && !errored

  return (
    <div
      className={className}
      title={title}
      style={{
        width: size,
        height: size,
        background: showImage ? 'transparent' : 'var(--color-accent)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {showImage ? (
        <img
          src={src ?? undefined}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setErrored(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        initial
      )}
    </div>
  )
}

export default Avatar
