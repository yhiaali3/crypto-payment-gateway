import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { FeatureCard } from "@/components/FeatureCard";
import { IntegrationCard } from "@/components/IntegrationCard";
import { StatsCard } from "@/components/StatsCard";
import {
  Zap,
  Shield,
  Globe,
  Lock,
  TrendingUp,
  CheckCircle,
  Code,
  Webhook,
} from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 md:px-0">
        <div className="container max-w-4xl">
          <div className="animate-fade-in">
            <div className="inline-block mb-4">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                ✨ Production-Ready Payment Gateway
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Accept Crypto Payments
              <span className="bg-gradient-to-r from-primary to-crypto-blue bg-clip-text text-transparent">
                {" "}
                Instantly
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl leading-relaxed">
              The most reliable crypto payment gateway API. Accept USDT, BNB,
              ETH, and Bitcoin with automatic settlement, webhooks, and
              enterprise-grade security.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                to="/signup"
                className="px-8 py-4 bg-gradient-to-r from-primary to-crypto-blue text-white rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105 text-center"
              >
                Start Building Now
              </Link>
              <a
                href="#documentation"
                className="px-8 py-4 border-2 border-gray-300 text-gray-900 rounded-lg font-semibold hover:border-primary hover:text-primary transition-colors text-center"
              >
                View Documentation
              </a>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 md:gap-12">
              <StatsCard number="99.99%" label="Uptime SLA" />
              <StatsCard number="<100ms" label="Avg Response" />
              <StatsCard number="∞" label="Scalability" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 md:px-0 bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to accept cryptocurrency payments at scale
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-primary" />}
              title="Lightning Fast"
              description="Process payments in milliseconds. Instant settlement notifications via webhooks."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6 text-primary" />}
              title="Bank-Grade Security"
              description="HMAC-SHA256 signature verification. JWT tokens. API key management. Rate limiting."
            />
            <FeatureCard
              icon={<Globe className="w-6 h-6 text-primary" />}
              title="Multi-Chain Support"
              description="USDT TRC20, BNB BSC, Ethereum, Bitcoin. Support for any blockchain."
            />
            <FeatureCard
              icon={<Lock className="w-6 h-6 text-primary" />}
              title="Payment Request Management"
              description="Create, track, and manage payment requests with automatic expiration."
            />
            <FeatureCard
              icon={<Webhook className="w-6 h-6 text-primary" />}
              title="Reliable Webhooks"
              description="Automatic retry logic. Signature verification. Real-time notifications."
            />
            <FeatureCard
              icon={<Code className="w-6 h-6 text-primary" />}
              title="Easy Integration"
              description="RESTful API. Comprehensive documentation. SDKs for all platforms."
            />
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="py-20 px-4 md:px-0">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Multiple Payment Methods
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Support all major cryptocurrencies and payment providers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <IntegrationCard
              logo={<div className="text-3xl font-bold text-yellow-400">₿</div>}
              name="Bitcoin"
              description="Accept BTC with automatic price conversion and settlement"
              status="available"
            />
            <IntegrationCard
              logo={<div className="text-3xl font-bold text-purple-500">◆</div>}
              name="Ethereum"
              description="Full ERC20 support with gas optimization"
              status="available"
            />
            <IntegrationCard
              logo={<div className="text-3xl font-bold text-yellow-300">₮</div>}
              name="USDT TRC20"
              description="Tron network USDT with instant settlement"
              status="available"
            />
            <IntegrationCard
              logo={<div className="text-3xl font-bold text-yellow-500">B</div>}
              name="Binance Pay"
              description="Integrated Binance ecosystem support"
              status="available"
            />
            <IntegrationCard
              logo={<div className="text-3xl font-bold text-orange-400">M</div>}
              name="Monero"
              description="Privacy-focused cryptocurrency support"
              status="coming-soon"
            />
            <IntegrationCard
              logo={<div className="text-3xl font-bold text-orange-500">D</div>}
              name="Dogecoin"
              description="Fast, fun, and friendly digital currency"
              status="coming-soon"
            />
          </div>
        </div>
      </section>

      {/* API Example Section */}
      <section id="documentation" className="py-20 px-4 md:px-0 bg-gray-50">
        <div className="container">
          <div className="max-w-4xl">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
              Dead Simple API
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Create Payment Request
                </h3>
                <p className="text-gray-600 mb-6">
                  Get started in minutes. Create a payment request with just a
                  few lines of code.
                </p>

                <div className="space-y-4">
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-crypto-green flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">RESTful API</p>
                      <p className="text-gray-600 text-sm">
                        Standard HTTP methods and JSON
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-crypto-green flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        Full TypeScript Support
                      </p>
                      <p className="text-gray-600 text-sm">
                        Type-safe client libraries
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-crypto-green flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        Comprehensive Docs
                      </p>
                      <p className="text-gray-600 text-sm">
                        API reference and guides
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 text-white font-mono text-sm overflow-auto">
                <pre>{`// Create payment request
const payment = await fetch(
  '/api/payments',
  {
    method: 'POST',
    headers: {
      'Authorization': 
        'ApiKey sk_live...',
      'Content-Type': 
        'application/json'
    },
    body: JSON.stringify({
      amount: 100,
      currency: 'USDT',
      network: 'TRC20',
      paymentMethod: 
        'usdt_trc20',
      customerReference: 
        'order_12345'
    })
  }
);

// Response
{
  id: 'pay_abc123',
  status: 'pending',
  paymentAddress: 
    'TZ7d3UGGM2bxm...',
  expiresAt: '2024-01-28T...'
}`}</pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 px-4 md:px-0">
        <div className="container max-w-4xl">
          <div className="bg-gradient-to-br from-primary/5 to-crypto-blue/5 border border-primary/20 rounded-2xl p-12 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Enterprise Security
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Trust us with your cryptocurrency payments. Built with security as
              our foundation.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div>
                <div className="text-2xl font-bold text-primary mb-2">✓</div>
                <p className="font-semibold text-gray-900">HMAC-SHA256</p>
                <p className="text-gray-600 text-sm mt-2">
                  Webhook signature verification
                </p>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary mb-2">✓</div>
                <p className="font-semibold text-gray-900">JWT Tokens</p>
                <p className="text-gray-600 text-sm mt-2">
                  Secure authentication
                </p>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary mb-2">✓</div>
                <p className="font-semibold text-gray-900">Rate Limiting</p>
                <p className="text-gray-600 text-sm mt-2">
                  DDoS protection included
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-0 bg-gradient-to-r from-primary to-crypto-blue">
        <div className="container max-w-3xl text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Accept Crypto?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Start processing payments in minutes. Get your API key instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-4 bg-white text-primary rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Create Free Account
            </Link>
            <a
              href="https://docs.example.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Read Docs
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 md:px-0">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4">CryptoGate</h3>
              <p className="text-sm">
                The leading crypto payment gateway for developers
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Security
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Developers</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API Reference
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    SDKs
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <p className="text-sm text-center">
              © 2024 CryptoGate. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
