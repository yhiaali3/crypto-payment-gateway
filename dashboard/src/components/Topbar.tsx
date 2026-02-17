import React from 'react'
import { useAuthStore } from '../store/auth'

export default function Topbar() {
    const merchant = useAuthStore((s) => s.merchant)
    const logout = useAuthStore((s) => s.logout)

    return (
        <div className="flex items-center justify-between px-4 py-3 bg-white">
            <div className="text-lg font-semibold">Dashboard</div>
            <div className="flex items-center gap-4">
                <div className="text-sm text-gray-700">{merchant?.name ?? 'Merchant'}</div>
                <button onClick={logout} className="px-3 py-1 bg-red-500 text-white rounded">Logout</button>
            </div>
        </div>
    )
}
