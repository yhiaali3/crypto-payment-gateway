import React from 'react'
import { NavLink } from 'react-router-dom'

export default function Sidebar() {
    return (
        <div className="h-full p-4 flex flex-col">
            <div className="mb-6 px-2 text-2xl font-semibold">CryptoGate</div>
            <nav className="flex-1">
                <ul>
                    <li>
                        <NavLink to="/dashboard" className={({ isActive }) => `block px-3 py-2 rounded ${isActive ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-800'}`} end>
                            Overview
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/dashboard/payments" className={({ isActive }) => `block px-3 py-2 rounded ${isActive ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-800'}`}>
                            Payments
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/dashboard/settings" className={({ isActive }) => `block px-3 py-2 rounded ${isActive ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-800'}`}>
                            Settings
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </div>
    )
}
