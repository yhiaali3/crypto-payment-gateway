import React from 'react'

export default function DashboardHome() {
    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded shadow">Total payments</div>
                <div className="p-4 bg-white rounded shadow">Revenue</div>
                <div className="p-4 bg-white rounded shadow">Pending</div>
            </div>
        </div>
    )
}
