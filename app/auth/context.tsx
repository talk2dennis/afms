import { use, createContext, type PropsWithChildren, useState } from 'react'

import { useStorageState } from './useStorageState'

export const users = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@test.com',
    role: 'ADMIN',
    state: 'Lagos',
    lga: 'Ikeja',
    phone: '08012345678'
  },
  {
    id: '2',
    name: 'Dennis',
    email: 'dennis@test.com',
    role: 'USER',
    state: 'Delta',
    lga: 'Sapele',
    phone: '08012345678'
  },
  {
    id: '3',
    name: 'guest',
    email: 'guest@example.com',
    role: 'USER',
    state: 'Abuja',
    lga: 'Gwagwalada',
    phone: '08012345678'
  }
]

// type user
export type User = {
  id: string
  name: string
  email: string
  lga?: string
  state?: string
  phone?: string
  location?: { latitude: number; longitude: number }
  role?: 'ADMIN' | 'USER'
}

export const weatherContext = {
  location: 'Ikeja, Lagos',
  current: {
    condition: 'Heavy Rain',
    rainfall_mm: 28,
    temperature: 26
  },
  forecast: [
    { day: 'Today', rain_mm: 28 },
    { day: 'Tomorrow', rain_mm: 35 },
    { day: 'Wednesday', rain_mm: 10 }
  ],
  floodRisk: 'High'
}

const AuthContext = createContext<{
  signIn: (user: User, token: string) => void
  signOut: () => void
  session?: string | null
  isAuthenticated?: boolean
  isLoading: boolean
  userData?: User | null
}>({
  signIn: (user: User, token: string) => null,
  signOut: () => null,
  session: null,
  isLoading: false,
  userData: null,
  isAuthenticated: false
})

// Use this hook to access the user info.
export function useSession () {
  const value = use(AuthContext)
  if (!value) {
    throw new Error('useSession must be wrapped in a <SessionProvider />')
  }

  return value
}

export default function SessionProvider ({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState('session-token')
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState<User | null>(null)

  // if user is null but session exists, for now clear the session
  if (!userData && session) {
    setSession(null)
  }

  return (
    <AuthContext.Provider
      value={{
        signIn: (user: User, token: string) => {
          setLoading(true)
          setUserData(user)
          // log the user data and token for debugging
          console.log('userdata', user)

          setSession(token)
          setLoading(false)
        },
        signOut: () => {
          setLoading(true)
          setUserData(null)
          // delay for 2 seconds to simulate sign out process
          setTimeout(() => {
            setSession(null)
            setLoading(false)
          }, 2000)
        },

        session,
        isLoading: isLoading || loading,
        userData: userData,
        isAuthenticated: !!session || !!userData
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
