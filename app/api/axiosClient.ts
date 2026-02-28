import axios, { AxiosInstance } from 'axios'
import { useRouter } from 'expo-router'
import { useSession } from '../auth/context'

const baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api'
// console.log('Axios Base URL:', baseURL)

const createAxiosClient = (session: string | null): AxiosInstance => {
  const client = axios.create({
    baseURL: baseURL
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
