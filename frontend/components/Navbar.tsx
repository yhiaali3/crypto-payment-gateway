import Link from 'next/link'

export default function Navbar() {
    return (
        <nav className="bg-gray-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-xl font-bold">Crypto Payment Gateway</Link>
                <div className="space-x-4">
                    <Link href="/" className="hover:text-gray-300">Home</Link>
                    <Link href="/dashboard" className="hover:text-gray-300">Dashboard</Link>
                    <Link href="/api-examples" className="hover:text-gray-300">API Examples</Link>
                    <a href="#" className="hover:text-gray-300">Documentation</a>
                </div>
            </div>
        </nav>
    )
}