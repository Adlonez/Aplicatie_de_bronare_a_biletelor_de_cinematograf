import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: '',
  timeout: 10000,
})

// Request interceptor — attach JWT token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle HTTP errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status

    if (status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/auth/login'
    } else if (status === 403) {
      window.location.href = '/forbidden'
    } else if (status === 500) {
      window.location.href = '/server-error'
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
