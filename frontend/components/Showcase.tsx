import CodeBlock from './CodeBlock'

export default function Showcase() {
    return (
        <section className="py-20">
            <div className="container mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
                <div className="text-center">
                    <p>Client → API → Blockchain → Webhook</p>
                </div>
                <div className="mt-12">
                    <h3 className="text-2xl font-semibold mb-4">API Example</h3>
                    <CodeBlock code={`POST /api/payments

{
  "amount": 100,
  "currency": "USDT",
  "merchant_id": "your_id"
}

Response:

{
  "transaction_id": "tx_123",
  "status": "pending"
}`} />
                </div>
                <div className="mt-12">
                    <h3 className="text-2xl font-semibold mb-4">Webhook Example</h3>
                    <CodeBlock code={`{
  "event": "payment.completed",
  "transaction_id": "tx_123",
  "amount": 100,
  "currency": "USDT"
}`} />
                </div>
            </div>
        </section>
    )
}