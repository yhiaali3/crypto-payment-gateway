import Navbar from '@/components/Navbar'
import CodeBlock from '@/components/CodeBlock'
import Footer from '@/components/Footer'

const examples = [
    {
        language: 'Node.js',
        code: `const axios = require('axios');

const response = await axios.post('/api/payments', {
  amount: 100,
  currency: 'USDT',
  merchant_id: 'your_merchant_id'
});

console.log(response.data);`
    },
    {
        language: 'PHP',
        code: `$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, '/api/payments');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
  'amount' => 100,
  'currency' => 'USDT',
  'merchant_id' => 'your_merchant_id'
]));

$response = curl_exec($ch);
curl_close($ch);

echo $response;`
    },
    {
        language: 'Python',
        code: `import requests

response = requests.post('/api/payments', json={
  'amount': 100,
  'currency': 'USDT',
  'merchant_id': 'your_merchant_id'
})

print(response.json())`
    }
]

export default function ApiExamples() {
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">API Examples</h1>
                {examples.map((example, index) => (
                    <div key={index} className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">{example.language}</h2>
                        <CodeBlock code={example.code} />
                    </div>
                ))}
            </div>
            <Footer />
        </div>
    )
}