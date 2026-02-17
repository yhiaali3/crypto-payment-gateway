import axios, { AxiosError } from 'axios'

function readTokenFromPersist(): string | null {
    try {
        const raw = localStorage.getItem('cg-auth')
        if (!raw) return null
        const parsed = JSON.parse(raw)
        // Zustand persist may store state at root or under `state`
        if (typeof parsed === 'object' && parsed !== null) {
            if ('token' in parsed && typeof parsed.token === 'string') return parsed.token
            if ('state' in parsed && parsed.state && typeof parsed.state.token === 'string') return parsed.state.token
        }
        return null
    } catch (e) {
        return null
    }
}

const baseURL = (import.meta.env.VITE_API_BASE as string) || '/api'

export const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor to inject Authorization header
api.interceptors.request.use((config) => {
    const apiKey = import.meta.env.VITE_API_KEY

    if (apiKey && config.headers) {
        config.headers.Authorization = `ApiKey ${apiKey}`
    }

    return config
})


// Response interceptor to normalize errors
api.interceptors.response.use(
    (res) => res,
    (error: AxiosError) => {
        const status = error.response?.status || 0
        const message =
            (error.response && (error.response.data as any)?.error) || error.message || 'Unknown error'
        return Promise.reject({ status, message })
    },
)

export default api

