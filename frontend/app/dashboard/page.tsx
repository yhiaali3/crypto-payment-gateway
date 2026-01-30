import Navbar from '@/components/Navbar'
import DashboardWidgets from '@/components/DashboardWidgets'
import Footer from '@/components/Footer'

export default function Dashboard() {
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
                <DashboardWidgets />
            </div>
            <Footer />
        </div>
    )
}