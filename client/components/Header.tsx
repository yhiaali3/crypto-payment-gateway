import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Header() {
  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
      <div className="container h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-crypto-blue rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10.5 1.5H9.5V0h1v1.5zM15 3l.707-.707.707.707L15.707 4 15 3zm0 12l.707.707.707-.707L15.707 16 15 15zM5 3l-.707-.707-.707.707L4.293 4 5 3zm0 12l-.707.707-.707-.707L4.293 16 5 15zM10.5 18.5h-1V20h1v-1.5zM2.5 10h1.5v1h-1.5v-1zm14 0h1.5v1h-1.5v-1z" />
            </svg>
          </div>
          <span className="font-bold text-xl text-gray-900 group-hover:text-primary transition-colors">
            CryptoGate
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-gray-600 hover:text-primary transition-colors text-sm font-medium"
          >
            Features
          </a>
          <a
            href="#integrations"
            className="text-gray-600 hover:text-primary transition-colors text-sm font-medium"
          >
            Integrations
          </a>
          <a
            href="#documentation"
            className="text-gray-600 hover:text-primary transition-colors text-sm font-medium"
          >
            Documentation
          </a>
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden sm:block text-gray-600 hover:text-primary transition-colors text-sm font-medium"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className={cn(
              "px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90",
              "transition-colors text-sm font-medium",
            )}
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
