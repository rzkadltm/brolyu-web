import { useEffect, useState } from 'react'
import Chip from '../../components/Chip/Chip'
import SearchInput from '../../components/SearchInput/SearchInput'
import { useTheme } from '../../contexts/useTheme'
import type { Room } from '../../data/rooms'
import { apiRoomToUiRoom, roomsApi } from '../rooms/api'
import RoomCard from './RoomCard'
import { useRoomFilter } from './useRoomFilter'

function DiscoverPage() {
  const { theme, toggleTheme } = useTheme()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    roomsApi
      .list()
      .then(list => {
        if (cancelled) return
        setRooms(list.map(apiRoomToUiRoom))
        setLoadError(null)
      })
      .catch(err => {
        if (cancelled) return
        setLoadError(err instanceof Error ? err.message : 'Failed to load rooms')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const { filter, setFilter, search, setSearch, filtered, liveCount, FILTERS } = useRoomFilter(rooms)

  return (
    <>
      <div className="shrink-0 pt-[18px] md:pt-[22px] px-4 md:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4 md:mb-5">
          <h1
            className="font-display text-[22px] md:text-[26px] font-bold tracking-[-0.8px]"
            style={{ color: 'var(--text)' }}
          >
            Discover <span className="text-accent">Rooms</span>
          </h1>
          <div className="flex items-center gap-[10px]">
            <button type="button" className="ap-theme-btn" onClick={toggleTheme}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button type="button" className="ap-create-btn">＋ Create Room</button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5 md:mb-6">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search rooms, topics, people..."
          />
          <div className="flex gap-[7px] flex-wrap">
            {FILTERS.map(f => (
              <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
                {f}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      <div className="ap-rooms-scroll flex-1 overflow-y-auto px-4 md:px-8 pb-8">
        <div className="ap-section-label">
          {loading
            ? 'Loading rooms…'
            : filter === 'All'
              ? `${liveCount} live rooms`
              : `${filtered.length} rooms · ${filter}`}
        </div>
        {loadError && !loading && (
          <div className="text-center py-10 text-[14px]" style={{ color: 'oklch(62% 0.22 15)' }}>
            ⚠ {loadError}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((room, i) => (
            <RoomCard key={room.id} room={room} index={i} />
          ))}
        </div>
        {!loading && !loadError && filtered.length === 0 && (
          <div
            className="text-center py-20 text-[14px]"
            style={{ color: 'var(--text-d)' }}
          >
            {rooms.length === 0 ? (
              <>No live rooms yet — be the first to create one.</>
            ) : (
              <>
                No rooms found for &ldquo;{search || filter}&rdquo; —{' '}
                <button
                  type="button"
                  className="text-accent cursor-pointer bg-transparent border-0 p-0 font-inherit"
                  onClick={() => { setSearch(''); setFilter('All') }}
                >
                  clear filters
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default DiscoverPage
