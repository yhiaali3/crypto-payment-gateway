import React from 'react'
import { usePayments } from '../api/hooks'
import { Link } from 'react-router-dom'

export default function Payments() {
    const { data, isLoading, isError, error } = usePayments()

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4">Payments</h2>

            {isLoading && <div className="p-4 bg-white rounded shadow">Loading payments...</div>}

            {isError && (
                <div className="p-4 bg-white rounded shadow text-red-600">{error?.message || 'Failed to load payments'}</div>
            )}

            {!isLoading && !isError && (
                <div className="overflow-x-auto bg-white rounded shadow">
                    <table className="min-w-full table-auto">
                        <thead>
                            <tr className="text-left">
                                <th className="px-4 py-2">Payment ID</th>
                                <th className="px-4 py-2">Amount</th>
                                <th className="px-4 py-2">Currency</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">Created At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data && data.length > 0 ? (
                                data.map((p) => (
                                    <tr key={p.id} className="border-t">
                                        <td className="px-4 py-3">
                                            <Link to={`/payments/${p.id}`} className="text-blue-500 hover:underline">
                                                {p.id}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3">{p.amount}</td>
                                        <td className="px-4 py-3">{p.currency}</td>
                                        <td className="px-4 py-3">{p.status}</td>
                                        <td className="px-4 py-3">{new Date(p.createdAt).toLocaleString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">
                                        No payments found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
