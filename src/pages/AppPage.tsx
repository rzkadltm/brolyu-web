import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SEO } from '../components/SEO'
import { ROOMS } from '../data/rooms'
import type { Room, TagColor } from '../data/rooms'

const FILTERS = ['All', 'Language', 'Study', 'Games', 'Friends', 'Beginner', 'Advanced']

const TAG_CLASSES: Record<TagColor, string> = {
  blue:   'bg-[oklch(62%_0.22_265_/_0.1)] text-accent border-[oklch(62%_0.22_265_/_0.2)]',
  green:  'bg-[oklch(70%_0.18_152_/_0.1)] text-green border-[oklch(70%_0.18_152_/_0.2)]',
  purple: 'bg-[oklch(62%_0.22_300_/_0.1)] text-accent2 border-[oklch(62%_0.22_300_/_0.2)]',
  amber:  'bg-[oklch(75%_0.18_70_/_0.1)] text-[oklch(68%_0.18_70)] border-[oklch(75%_0.18_70_/_0.2)]',
  rose:   'bg-[oklch(62%_0.22_15_/_0.1)] text-[oklch(62%_0.22_15)] border-[oklch(62%_0.22_15_/_0.2)]',
}

const WAVE_DELAYS = [0, 0.15, 0.3, 0.15]
const WAVE_HEIGHTS = [8, 12, 5, 12]

function RoomCard({ room, index }: { room: Room; index: number }) {
  const navigate = useNavigate()
  const hasSpeaking = room.live && room.speakers.some(s => s.speaking)

  return (
    <div className="ap-room-card" style={{ animationDelay: `${index * 0.06}s` }}>
      <div className="h-[5px] shrink-0" style={{ background: room.strip }} />

      <div className="flex flex-col gap-[14px] p-5 pb-4 flex-1">
        {/* Header row */}
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

        {/* Speakers row */}
        <div className="flex items-center gap-[10px]">
          <div className="flex">
            {room.speakers.map((sp, i) => (
              <div
                key={i}
                className={`ap-speaker-av${sp.speaking ? ' speaking' : ''}`}
                style={{ background: sp.color, zIndex: room.speakers.length - i }}
                title={sp.name}
              >
                {sp.initial}
              </div>
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

        {/* Tags */}
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

      {/* Footer */}
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
          className={`ap-join-btn ${room.live ? 'live' : 'soon'}`}
          onClick={room.live ? () => navigate(`/room/${room.id}`) : undefined}
        >
          {room.live ? 'Join ↗' : 'Notify me'}
        </button>
      </div>
    </div>
  )
}

function AppPage() {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = ROOMS.filter(room => {
    const matchFilter =
      filter === 'All' ||
      room.category === filter ||
      room.tags.some(t => t.label.toLowerCase() === filter.toLowerCase())
    const matchSearch =
      !search ||
      room.name.toLowerCase().includes(search.toLowerCase()) ||
      room.speakers.some(s => s.name.toLowerCase().includes(search.toLowerCase())) ||
      room.tags.some(t => t.label.toLowerCase().includes(search.toLowerCase()))
    return matchFilter && matchSearch
  })

  const liveCount = filtered.filter(r => r.live).length

  return (
    <>
      <SEO
        title="Discover Rooms"
        description={`Browse ${liveCount} live voice rooms on Brolyu. Find study groups, language exchange partners, gaming rooms, and friend circles. Join thousands of people connecting right now.`}
        path="/app"
      />
      {/* Topbar */}
      <div className="shrink-0 pt-[18px] md:pt-[22px] pl-4 md:pl-8 pr-[64px] md:pr-[110px]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4 md:mb-5">
          <h1
            className="font-display text-[22px] md:text-[26px] font-bold tracking-[-0.8px]"
            style={{ color: 'var(--text)' }}
          >
            Discover <span className="text-accent">Rooms</span>
          </h1>
          <div className="flex items-center gap-[10px]">
            <button className="ap-create-btn">＋ Create Room</button>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5 md:mb-6">
          <div className="ap-search-wrap w-full md:w-auto">
            <span className="text-[14px]" style={{ color: 'var(--text-d)' }}>🔍</span>
            <input
              className="ap-search-input"
              placeholder="Search rooms, topics, people..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-[7px] flex-wrap">
            {FILTERS.map(f => (
              <button
                key={f}
                className={`ap-chip${filter === f ? ' active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Rooms scroll */}
      <div className="ap-rooms-scroll flex-1 overflow-y-auto px-4 md:px-8 pb-8">
        <div className="ap-section-label">
          {filter === 'All'
            ? `${liveCount} live rooms`
            : `${filtered.length} rooms · ${filter}`}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((room, i) => (
            <RoomCard key={room.id} room={room} index={i} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div
            className="text-center py-20 text-[14px]"
            style={{ color: 'var(--text-d)' }}
          >
            No rooms found for &ldquo;{search || filter}&rdquo; —{' '}
            <span
              className="text-accent cursor-pointer"
              onClick={() => { setSearch(''); setFilter('All') }}
            >
              clear filters
            </span>
          </div>
        )}
      </div>
    </>
  )
}

export default AppPage
