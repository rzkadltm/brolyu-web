import { useMemo, useState } from 'react'
import type { Room } from '../../data/rooms'

export const FILTERS = ['All', 'Language', 'Study', 'Games', 'Friends', 'Beginner', 'Advanced'] as const

export type RoomFilter = (typeof FILTERS)[number]

export function useRoomFilter(rooms: Room[]) {
  const [filter, setFilter] = useState<RoomFilter>('All')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return rooms.filter(room => {
      const matchFilter =
        filter === 'All' ||
        room.category === filter ||
        room.tags.some(t => t.label.toLowerCase() === filter.toLowerCase())
      const matchSearch =
        !q ||
        room.name.toLowerCase().includes(q) ||
        room.speakers.some(s => s.name.toLowerCase().includes(q)) ||
        room.tags.some(t => t.label.toLowerCase().includes(q))
      return matchFilter && matchSearch
    })
  }, [rooms, filter, search])

  const liveCount = useMemo(() => filtered.filter(r => r.live).length, [filtered])

  return { filter, setFilter, search, setSearch, filtered, liveCount, FILTERS }
}
