import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import Showcase from '@/components/Showcase'
import Footer from '@/components/Footer'

export default function Home() {
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            <Hero />
            <Features />
            <Showcase />
            <Footer />
        </div>
    )
}