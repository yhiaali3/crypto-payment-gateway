import create from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../api/apiClient'

type Merchant = {
    id?: string
    name?: string
    email?: string
    createdAt?: string
}

type AuthState = {
    token: string | null
    merchant: Merchant | null
    apiKey?: string | null
    apiSecret?: string | null
    login: (email: string, password: string) => Promise<void>
    logout: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            merchant: null,
            apiKey: null,
            apiSecret: null,
            login: async (email: string, password: string) => {
                // Call backend login
                const res = await api.post('/merchants/login', { email, password })
                const data = res.data as {
                    token: string
                    merchantId: string
                    email: string
                    name?: string
                }

                const merchant = {
                    id: data.merchantId,
                    name: data.name,
                    email: data.email,
                    createdAt: new Date().toISOString(),
                }

                // apiKey/apiSecret not returned by login endpoint; keep null until generated
                set({ token: data.token, merchant, apiKey: null, apiSecret: null })
            },
            logout: () => {
                set({ token: null, merchant: null, apiKey: null, apiSecret: null })
                try {
                    localStorage.removeItem('cg-auth')
                } catch (e) { }
            },
        }),
        { name: 'cg-auth' }
    )
)
