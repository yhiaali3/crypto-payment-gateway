const features = [
    { title: 'Fast Integration', description: 'Integrate in minutes with our simple API.' },
    { title: 'Secure Webhooks', description: 'Receive real-time payment notifications.' },
    { title: 'Multi-Currency Support', description: 'Support for USDT, BTC, ETH, and more.' },
    { title: 'Clean REST API', description: 'Easy-to-use RESTful endpoints.' },
    { title: 'Production Ready', description: 'Built for high-traffic applications.' },
    { title: 'Developer Friendly', description: 'Comprehensive documentation and examples.' }
]

export default function Features() {
    return (
        <section className="py-20 bg-gray-800">
            <div className="container mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="text-center">
                            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                            <p>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}