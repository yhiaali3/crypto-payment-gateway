import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const login = useAuthStore((s) => s.login)
    const navigate = useNavigate()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        setIsLoading(true)
        try {
            await login(email, password)
            navigate('/dashboard')
        } catch (err: any) {
            setError(err?.message || 'Login failed')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-full max-w-md bg-white p-8 rounded shadow">
                <h1 className="text-2xl font-semibold mb-6">Sign in to CryptoGate</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="w-full px-3 py-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="w-full px-3 py-2 border rounded" />
                    </div>
                    {error && <div className="text-sm text-red-600">{error}</div>}
                    <div>
                        <button type="submit" disabled={isLoading} className="w-full py-2 bg-primary text-white rounded">
                            {isLoading ? 'Signing in...' : 'Login'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
