import { useNavigate } from 'react-router-dom'
import Avatar from '../../components/Avatar/Avatar'
import type { Room, TagColor } from '../../data/rooms'

const TAG_CLASSES: Record<TagColor, string> = {
  blue:   'bg-[oklch(62%_0.22_265_/_0.1)] text-accent border-[oklch(62%_0.22_265_/_0.2)]',
  green:  'bg-[oklch(70%_0.18_152_/_0.1)] text-green border-[oklch(70%_0.18_152_/_0.2)]',
  purple: 'bg-[oklch(62%_0.22_300_/_0.1)] text-accent2 border-[oklch(62%_0.22_300_/_0.2)]',
  amber:  'bg-[oklch(75%_0.18_70_/_0.1)] text-[oklch(68%_0.18_70)] border-[oklch(75%_0.18_70_/_0.2)]',
  rose:   'bg-[oklch(62%_0.22_15_/_0.1)] text-[oklch(62%_0.22_15)] border-[oklch(62%_0.22_15_/_0.2)]',
}

const WAVE_DELAYS = [0, 0.15, 0.3, 0.15]
const WAVE_HEIGHTS = [8, 12, 5, 12]

type RoomCardProps = {
  room: Room
  index: number
}

function RoomCard({ room, index }: RoomCardProps) {
  const navigate = useNavigate()
  const hasSpeaking = room.live && room.speakers.some(s => s.speaking)

  return (
    <div className="ap-room-card" style={{ animationDelay: `${index * 0.06}s` }}>
      <div className="h-[5px] shrink-0" style={{ background: room.strip }} />

      <div className="flex flex-col gap-[14px] p-5 pb-4 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div
            className="font-display text-[15px] font-bold tracking-[-0.3px] leading-snug"
            style={{ color: 'var(--text)' }}
          >
            {room.name}
          </div>
          {room.live ? (
            <div
              className="flex items-center gap-[5px] shrink-0 rounded-full px-[9px] py-[3px] border"
              style={{ background: 'oklch(70% 0.18 152 / 0.1)', borderColor: 'oklch(70% 0.18 152 / 0.2)' }}
            >
              <div className="ap-live-dot" />
              <span className="text-[10px] font-bold text-green">LIVE</span>
            </div>
          ) : (
            <div
              className="flex items-center gap-[5px] shrink-0 rounded-full px-[9px] py-[3px] border"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <span className="text-[10px] font-semibold" style={{ color: 'var(--text-d)' }}>
                ⏱ {room.startsIn}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-[10px]">
          <div className="flex">
            {room.speakers.map((sp, i) => (
              <Avatar
                key={i}
                initial={sp.initial}
                size={36}
                speaking={sp.speaking}
                title={sp.name}
                className={`ap-speaker-av${sp.speaking ? ' speaking' : ''}`}
                style={{ background: sp.color, zIndex: room.speakers.length - i }}
              />
            ))}
          </div>
          <div className="flex flex-col gap-[2px]">
            <div className="text-[12px] font-semibold" style={{ color: 'var(--text)' }}>
              {room.speakers.map(s => s.name).join(', ')}
            </div>
            <div
              className="text-[10px] flex items-center gap-[6px]"
              style={{ color: 'var(--text-m)' }}
            >
              {hasSpeaking && (
                <>
                  <div className="flex items-center gap-[2px] h-[14px]">
                    {WAVE_HEIGHTS.map((h, i) => (
                      <div
                        key={i}
                        className="ap-cw-bar"
                        style={{ height: `${h}px`, animationDelay: `${WAVE_DELAYS[i]}s` }}
                      />
                    ))}
                  </div>
                  Speaking
                </>
              )}
              {!room.live && 'Starting soon'}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-[6px]">
          {room.tags.map((tag, i) => (
            <span
              key={i}
              className={`text-[10px] font-semibold px-[10px] py-[3px] rounded-full border ${TAG_CLASSES[tag.color]}`}
            >
              {tag.label}
            </span>
          ))}
        </div>
      </div>

      <div
        className="flex items-center justify-between px-5 pb-4 pt-3 border-t"
        style={{ borderColor: 'var(--border2)' }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-[5px] text-[12px]" style={{ color: 'var(--text-m)' }}>
            <span className="text-[13px]">🎙️</span>
            <span>{room.speakers.length} speaking</span>
          </div>
          {room.live && (
            <div className="flex items-center gap-[5px] text-[12px]" style={{ color: 'var(--text-m)' }}>
              <span className="text-[13px]">👂</span>
              <span>{room.listeners} listening</span>
            </div>
          )}
        </div>
        <button
          type="button"
          className={`ap-join-btn ${room.live ? 'live' : 'soon'}`}
          onClick={room.live ? () => navigate(`/room/${room.id}`) : undefined}
        >
          {room.live ? 'Join ↗' : 'Notify me'}
        </button>
      </div>
    </div>
  )
}

export default RoomCard
