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
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.params || '')
    return config
  },
  (error) => {
    console.error('[API Request Error]', error)
    return Promise.reject(error)
  }
)

// Response interceptor — handle HTTP errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url} | Status: ${response.status}`)
    return response
  },
  (error) => {
    const status = error.response?.status
    const url = error.config?.url
    const method = error.config?.method?.toUpperCase()

    console.error(`[API Error] ${method} ${url} | Status: ${status || 'TIMEOUT/NETWORK'} | Message: ${error.message}`)
    
    if (error.response?.data) {
      console.error('[API Error Detail]', error.response.data)
    }

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

/**
 * Extracts a user-friendly error message from an Axios error.
 */
export const getErrorMessage = (error: any, defaultMessage: string = 'An unexpected error occurred'): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message === 'Network Error') {
    return 'Network connection failed. Please check your internet or tunnel.';
  }
  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. The server might be busy.';
  }
  return `${defaultMessage} (${error.message || 'Unknown'})`;
};

export default axiosInstance
