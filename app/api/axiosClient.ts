import axios, { AxiosInstance } from 'axios'

const baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api'
// console.log('Axios Base URL:', baseURL)

const createAxiosClient = (session: string | null): AxiosInstance => {
  const client = axios.create({
    baseURL: baseURL
  })

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
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
  )

  return client
}

export default createAxiosClient
