import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Authenticate USER (returns JWT containing userId)
      const authRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!authRes.ok) {
        const errBody = await authRes.json().catch(() => ({}));
        throw new Error(errBody.error || "Invalid email or password");
      }

      const authData = await authRes.json();
      localStorage.setItem("token", authData.token);

      // Ensure a Merchant exists for this user (bootstrap if missing)
      const createRes = await fetch("/api/merchants/create", {
        method: "POST",
        headers: { Authorization: `Bearer ${authData.token}` },
      });

      if (createRes.status === 201) {
        const created = await createRes.json();
        localStorage.setItem("merchantId", created.merchantId);
        localStorage.setItem("apiKey", created.apiKey);
        localStorage.setItem("apiSecret", created.apiSecret);
      } else if (createRes.status === 409) {
        // Merchant already exists — fetch profile
        const profileRes = await fetch("/api/merchants/profile", { headers: { Authorization: `Bearer ${authData.token}` } });
        if (profileRes.ok) {
          const profile = await profileRes.json();
          localStorage.setItem("merchantId", profile.id);
        }
      }

      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-32 pb-20 px-4 md:px-0">
        <div className="container max-w-md">
          <div className="bg-white border border-gray-200 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
            <p className="text-gray-600 mb-8">Welcome back to CryptoGate</p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="text-center text-gray-600 text-sm mt-6">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
