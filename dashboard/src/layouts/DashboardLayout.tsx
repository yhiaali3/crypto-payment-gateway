import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

export default function DashboardLayout() {
    return (
        <div className="min-h-screen flex bg-white">
            <aside className="hidden md:block w-64 border-r bg-gray-900 text-white">
                <Sidebar />
            </aside>

            <div className="flex-1 min-w-0">
                <header className="border-b">
                    <Topbar />
                </header>
                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
