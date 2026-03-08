import {
  use,
  createContext,
  type PropsWithChildren,
  useEffect,
  useState
} from 'react'
import axios from 'axios'
import Constants from 'expo-constants'

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
  location?: [number, number] // [latitude, longitude]
  role?: 'ADMIN' | 'USER'
  token?: string
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

const normalizeBaseUrl = (url?: string | null) => {
  if (!url) {
    return null
  }
  return url.trim().replace(/\/+$/, '')
}

const resolveBaseUrl = () => {
  const envUrl = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_URL)
  if (envUrl) {
    return envUrl
  }

  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoClient?.hostUri ||
    ''

  const localIp = hostUri.split(':')[0]
  if (localIp) {
    return `http://${localIp}:5000/api`
  }

  return 'http://localhost:5000/api'
}

const AuthContext = createContext<{
  signIn: (user: User, token: string) => void
  signOut: () => void
  session?: string | null
  isAuthenticated?: boolean
  isLoading: boolean
  userData?: User | null
  setUserData?: (user: User | null) => void
}>({
  signIn: (user: User, token: string) => null,
  signOut: () => null,
  session: null,
  isLoading: false,
  userData: null,
  isAuthenticated: false,
  setUserData: (user: User | null) => null
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
  const [isRestoringSession, setIsRestoringSession] = useState(true)
  const [userData, setUserData] = useState<User | null>(null)

  useEffect(() => {
    const restoreSession = async () => {
      if (isLoading) {
        return
      }

      if (!session) {
        setUserData(null)
        setIsRestoringSession(false)
        return
      }

      try {
        setIsRestoringSession(true)
        const response = await axios.get(`${resolveBaseUrl()}/auth/me`, {
          headers: {
            Authorization: `Bearer ${session}`
          },
          timeout: 60000
        })

        const backendUser = response.data?.user ?? response.data
        setUserData({ ...backendUser, token: session })
      } catch (error) {
        setUserData(null)
        setSession(null)
      } finally {
        setIsRestoringSession(false)
      }
    }

    restoreSession()
  }, [isLoading, session])

  return (
    <AuthContext.Provider
      value={{
        signIn: (user: User, token: string) => {
          setUserData({ ...user, token: token })
          setSession(token)
        },
        signOut: () => {
          setLoading(true)
          setUserData(null)
          // delay for 2 seconds to simulate sign out process
          setTimeout(() => {
            setSession(null)
            setUserData(null)
            setLoading(false)
          }, 2000)
        },

        session,
        isLoading: isLoading || loading || isRestoringSession,
        userData: userData,
        isAuthenticated: !!session || !!userData,
        setUserData: (user: User | null) => {
          setUserData(user)
        }
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
