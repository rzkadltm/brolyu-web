import { createContext } from 'react'
import type { User } from '../lib/api'

export interface AuthContextValue {
  user: User | null
  loading: boolean
  signInWithEmail: (email: string) => Promise<User>
  registerWithEmail: (email: string, name?: string) => Promise<User>
  signInWithOAuth: (provider: string) => void
  /** Convenience for the only provider wired today. */
  signInWithGoogle: () => void
  applyToken: (token: string) => Promise<User>
  signOut: () => void
  updateProfile: (
    patch: Partial<Pick<User, 'name' | 'bio' | 'avatarInitial' | 'avatarColor'>>,
  ) => Promise<User>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
