import axios from 'axios'
import { firebaseAuth } from '../firebase/firebaseClient'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined' && firebaseAuth?.currentUser) {
    try {
      const token = await firebaseAuth.currentUser.getIdToken()
      config.headers = config.headers ?? {}
      config.headers.Authorization = `Bearer ${token}`
    } catch (error) {
      console.warn('Failed to attach Firebase token to request', error)
    }
  }

  return config
})

export default api
