export type TagColor = 'blue' | 'green' | 'purple' | 'amber' | 'rose'

export type Speaker = {
  initial: string
  color: string
  name: string
  speaking?: boolean
}

export type Room = {
  id: number
  name: string
  live: boolean
  strip: string
  speakers: Speaker[]
  tags: { label: string; color: TagColor }[]
  listeners: number
  category: string
  startsIn?: string
}

export const ROOMS: Room[] = [
  {
    id: 1, name: "Let's talk in English", live: true,
    strip: 'linear-gradient(90deg,#6366f1,#8b5cf6)',
    speakers: [
      { initial: 'H', color: '#6366f1', name: 'Hussein', speaking: true },
      { initial: 'M', color: '#4b5563', name: 'Monday' },
      { initial: 'A', color: '#8b5cf6', name: 'Aiko' },
    ],
    tags: [{ label: 'English', color: 'blue' }, { label: 'Beginner', color: 'green' }],
    listeners: 12, category: 'Language',
  },
  {
    id: 2, name: 'Spanish × Japanese Exchange 🌏', live: true,
    strip: 'linear-gradient(90deg,#0ea5e9,#06b6d4)',
    speakers: [
      { initial: 'P', color: '#0ea5e9', name: 'Pablo', speaking: true },
      { initial: 'Y', color: '#06b6d4', name: 'Yuna' },
      { initial: 'K', color: '#38bdf8', name: 'Kenji' },
    ],
    tags: [{ label: 'Spanish', color: 'rose' }, { label: 'Japanese', color: 'purple' }, { label: 'Exchange', color: 'blue' }],
    listeners: 8, category: 'Language',
  },
  {
    id: 3, name: 'IELTS Prep — AI Study Hall 📚', live: true,
    strip: 'linear-gradient(90deg,#f59e0b,#f97316)',
    speakers: [
      { initial: 'J', color: '#f59e0b', name: 'Ji-su', speaking: true },
      { initial: 'S', color: '#f97316', name: 'Sara' },
    ],
    tags: [{ label: 'Study', color: 'amber' }, { label: 'IELTS', color: 'blue' }, { label: 'AI Tutor', color: 'purple' }],
    listeners: 34, category: 'Study',
  },
  {
    id: 4, name: 'Word Blitz Battle 🎮 — Round 7', live: true,
    strip: 'linear-gradient(90deg,#ec4899,#f43f5e)',
    speakers: [
      { initial: 'Z', color: '#ec4899', name: 'Zara', speaking: true },
      { initial: 'K', color: '#f43f5e', name: 'Kofi' },
      { initial: 'T', color: '#e11d48', name: 'Tomás' },
      { initial: 'R', color: '#be185d', name: 'Rin' },
    ],
    tags: [{ label: 'Game', color: 'rose' }, { label: 'English', color: 'blue' }, { label: 'Fast-paced', color: 'purple' }],
    listeners: 6, category: 'Games',
  },
  {
    id: 5, name: 'Chill Korean Corner ☕', live: true,
    strip: 'linear-gradient(90deg,#8b5cf6,#a78bfa)',
    speakers: [
      { initial: 'E', color: '#8b5cf6', name: 'Eun', speaking: true },
      { initial: 'L', color: '#6366f1', name: 'Lena' },
      { initial: 'W', color: '#a78bfa', name: 'Woojin' },
    ],
    tags: [{ label: 'Korean', color: 'purple' }, { label: 'Casual', color: 'green' }],
    listeners: 19, category: 'Language',
  },
  {
    id: 6, name: 'Make Friends from Anywhere 🌍', live: true,
    strip: 'linear-gradient(90deg,#14b8a6,#06b6d4)',
    speakers: [
      { initial: 'N', color: '#14b8a6', name: 'Nadia', speaking: true },
      { initial: 'B', color: '#06b6d4', name: 'Bo' },
    ],
    tags: [{ label: 'Friends', color: 'green' }, { label: 'Open', color: 'blue' }],
    listeners: 27, category: 'Friends',
  },
  {
    id: 7, name: 'French for Beginners 🇫🇷', live: false,
    strip: 'linear-gradient(90deg,#3b82f6,#60a5fa)',
    speakers: [
      { initial: 'C', color: '#3b82f6', name: 'Camille' },
      { initial: 'D', color: '#60a5fa', name: 'Diego' },
    ],
    tags: [{ label: 'French', color: 'blue' }, { label: 'Beginner', color: 'green' }],
    listeners: 0, category: 'Language', startsIn: 'in 20 min',
  },
  {
    id: 8, name: 'Deep Talks — Philosophy & Life 🧠', live: true,
    strip: 'linear-gradient(90deg,#6366f1,#06b6d4)',
    speakers: [
      { initial: 'A', color: '#6366f1', name: 'Alex', speaking: true },
      { initial: 'M', color: '#0ea5e9', name: 'Mira' },
      { initial: 'O', color: '#8b5cf6', name: 'Omar' },
    ],
    tags: [{ label: 'Discussion', color: 'purple' }, { label: 'English', color: 'blue' }, { label: 'Advanced', color: 'amber' }],
    listeners: 41, category: 'Friends',
  },
  {
    id: 9, name: 'Trivia Night — General Knowledge 🏆', live: true,
    strip: 'linear-gradient(90deg,#f59e0b,#ec4899)',
    speakers: [
      { initial: 'T', color: '#f59e0b', name: 'Tiago', speaking: true },
      { initial: 'I', color: '#ec4899', name: 'Iwa' },
      { initial: 'K', color: '#f43f5e', name: 'Kim' },
    ],
    tags: [{ label: 'Game', color: 'rose' }, { label: 'Trivia', color: 'amber' }, { label: 'All levels', color: 'green' }],
    listeners: 22, category: 'Games',
  },
  {
    id: 10, name: 'Spanish × Japanese Exchange 🌏', live: true,
    strip: 'linear-gradient(90deg,#0ea5e9,#06b6d4)',
    speakers: [
      { initial: 'P', color: '#0ea5e9', name: 'Pablo', speaking: true },
      { initial: 'Y', color: '#06b6d4', name: 'Yuna' },
      { initial: 'K', color: '#38bdf8', name: 'Kenji' },
    ],
    tags: [{ label: 'Spanish', color: 'rose' }, { label: 'Japanese', color: 'purple' }, { label: 'Exchange', color: 'blue' }],
    listeners: 8, category: 'Language',
  },
  {
    id: 11, name: 'IELTS Prep — AI Study Hall 📚', live: true,
    strip: 'linear-gradient(90deg,#f59e0b,#f97316)',
    speakers: [
      { initial: 'J', color: '#f59e0b', name: 'Ji-su', speaking: true },
      { initial: 'S', color: '#f97316', name: 'Sara' },
    ],
    tags: [{ label: 'Study', color: 'amber' }, { label: 'IELTS', color: 'blue' }, { label: 'AI Tutor', color: 'purple' }],
    listeners: 34, category: 'Study',
  },
  {
    id: 12, name: 'Word Blitz Battle 🎮 — Round 7', live: true,
    strip: 'linear-gradient(90deg,#ec4899,#f43f5e)',
    speakers: [
      { initial: 'Z', color: '#ec4899', name: 'Zara', speaking: true },
      { initial: 'K', color: '#f43f5e', name: 'Kofi' },
      { initial: 'T', color: '#e11d48', name: 'Tomás' },
      { initial: 'R', color: '#be185d', name: 'Rin' },
    ],
    tags: [{ label: 'Game', color: 'rose' }, { label: 'English', color: 'blue' }, { label: 'Fast-paced', color: 'purple' }],
    listeners: 6, category: 'Games',
  },
]
