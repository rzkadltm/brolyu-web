import Chip from '../../components/Chip/Chip'
import SearchInput from '../../components/SearchInput/SearchInput'
import { useTheme } from '../../contexts/useTheme'
import { ROOMS } from '../../data/rooms'
import RoomCard from './RoomCard'
import { useRoomFilter } from './useRoomFilter'

function DiscoverPage() {
  const { theme, toggleTheme } = useTheme()
  const { filter, setFilter, search, setSearch, filtered, liveCount, FILTERS } = useRoomFilter(ROOMS)

  return (
    <>
      <div className="shrink-0 pt-[22px] px-8">
        <div className="flex items-center justify-between mb-5">
          <h1
            className="font-display text-[26px] font-bold tracking-[-0.8px]"
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

        <div className="flex items-center gap-3 mb-6">
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

      <div className="ap-rooms-scroll flex-1 overflow-y-auto px-8 pb-8">
        <div className="ap-section-label">
          {filter === 'All'
            ? `${liveCount} live rooms`
            : `${filtered.length} rooms · ${filter}`}
        </div>
        <div className="grid grid-cols-3 gap-4">
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
            <button
              type="button"
              className="text-accent cursor-pointer bg-transparent border-0 p-0 font-inherit"
              onClick={() => { setSearch(''); setFilter('All') }}
            >
              clear filters
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default DiscoverPage
