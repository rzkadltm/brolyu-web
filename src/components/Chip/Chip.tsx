import type { ReactNode } from 'react'

type ChipProps = {
  active: boolean
  onClick: () => void
  children: ReactNode
}

function Chip({ active, onClick, children }: ChipProps) {
  return (
    <button type="button" className={`ap-chip${active ? ' active' : ''}`} onClick={onClick}>
      {children}
    </button>
  )
}

export default Chip
