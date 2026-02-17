import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import DashboardHome from './pages/DashboardHome'
import Payments from './pages/Payments'
import Settings from './pages/Settings'
import DashboardLayout from './layouts/DashboardLayout'
import { useAuthStore } from './store/auth'
import PaymentDetails from './pages/PaymentDetails'
import PublicPaymentPage from './pages/public/PublicPaymentPage'

function Protected({ children }: { children: JSX.Element }) {
    const token = useAuthStore((s) => s.token)
    if (!token) return <Navigate to="/login" replace />
    return children
}

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
                path="/dashboard"
                element={
                    <Protected>
                        <DashboardLayout />
                    </Protected>
                }
            >
                <Route index element={<DashboardHome />} />
                <Route path="payments" element={<Payments />} />
                <Route path="payments/:id" element={<PaymentDetails />} />
                <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="/pay/:id" element={<PublicPaymentPage />} />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    )
}
