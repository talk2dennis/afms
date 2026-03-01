import axios, { AxiosInstance } from 'axios'
import Constants from 'expo-constants'
import { useRouter } from 'expo-router'
import { useSession } from '../auth/context'

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

const baseURL = resolveBaseUrl()

const createAxiosClient = (session: string | null): AxiosInstance => {
  const client = axios.create({
    baseURL,
    timeout: 60000
  })

  const { signOut } = useSession()

  const router = useRouter()

  if (session) {
    client.defaults.headers.common['Authorization'] = `Bearer ${session}`
  }

  client.interceptors.response.use(
    response => {
      if (response.config.url?.includes('/login') && response.data?.token) {
        // // login response, set the token for future requests
        // console.log(`Setting session token: ${response.data.token}`)
        client.defaults.headers.common[
          'Authorization'
        ] = `Bearer ${response.data.token}`
      }
      return response
    },
    error => {
      if (error.response?.status === 401) {
        // Unauthorized error, token might be invalid or expired
        console.log('Unauthorized error, signing out user...', session)
        // remove token from headers
        delete client.defaults.headers.common['Authorization']
        signOut()
        router.replace('/signin')
      }
      return Promise.reject(error)
    }
  )

  return client
}

export default createAxiosClient
