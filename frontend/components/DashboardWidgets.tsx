const mockData = {
    totalTransactions: 1250,
    successfulPayments: 1180,
    failedPayments: 70,
    activeWebhooks: 15,
    transactions: [
        { id: 'tx_001', amount: 100, currency: 'USDT', status: 'completed', created_at: '2023-01-01' },
        { id: 'tx_002', amount: 50, currency: 'BTC', status: 'pending', created_at: '2023-01-02' },
        { id: 'tx_003', amount: 200, currency: 'ETH', status: 'completed', created_at: '2023-01-03' },
        { id: 'tx_004', amount: 75, currency: 'USDT', status: 'failed', created_at: '2023-01-04' },
        { id: 'tx_005', amount: 150, currency: 'BTC', status: 'completed', created_at: '2023-01-05' },
    ]
}

export default function DashboardWidgets() {
    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-800 p-4 rounded">
                    <h3>Total Transactions</h3>
                    <p className="text-2xl">{mockData.totalTransactions}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded">
                    <h3>Successful Payments</h3>
                    <p className="text-2xl">{mockData.successfulPayments}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded">
                    <h3>Failed Payments</h3>
                    <p className="text-2xl">{mockData.failedPayments}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded">
                    <h3>Active Webhooks</h3>
                    <p className="text-2xl">{mockData.activeWebhooks}</p>
                </div>
            </div>
            <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Status</h3>
                <p>API Status: Online</p>
                <p>Webhook Listener: Active</p>
            </div>
            <div>
                <h3 className="text-xl font-semibold mb-4">Recent Transactions</h3>
                <table className="w-full bg-gray-800 rounded">
                    <thead>
                        <tr>
                            <th className="p-2">ID</th>
                            <th className="p-2">Amount</th>
                            <th className="p-2">Currency</th>
                            <th className="p-2">Status</th>
                            <th className="p-2">Created At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockData.transactions.map(tx => (
                            <tr key={tx.id}>
                                <td className="p-2">{tx.id}</td>
                                <td className="p-2">{tx.amount}</td>
                                <td className="p-2">{tx.currency}</td>
                                <td className="p-2">{tx.status}</td>
                                <td className="p-2">{tx.created_at}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}