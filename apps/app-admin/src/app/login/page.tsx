"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Parse detailed validation errors from backend
        if (data.error?.details && typeof data.error.details === 'object') {
          setErrors(data.error.details);
        } else {
          setErrors({ general: data.error?.message || "Invalid credentials" });
        }
        return;
      }

      // Redirect to home on success
      router.push("/");
    } catch (err) {
      const error = err as { message?: string };
      setErrors({ general: error.message || "Login failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-black">
            Admin Portal
          </h2>
          <p className="mt-2 text-center text-sm text-black">
            Sign in to access the admin portal
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="border border-black p-4">
              <p className="text-sm text-black">{errors.general}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
                className={`w-full px-3 py-2 border placeholder-black text-black bg-white focus:outline-none focus:border-black sm:text-sm ${
                  errors.email ? 'border-red-500' : 'border-black'
                }`}
                placeholder="Email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: "" });
                }}
                className={`w-full px-3 py-2 border placeholder-black text-black bg-white focus:outline-none focus:border-black sm:text-sm ${
                  errors.password ? 'border-red-500' : 'border-black'
                }`}
                placeholder="Password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-black text-sm font-medium text-black bg-white hover:bg-black hover:text-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          <div className="text-center space-y-1">
            <p className="text-xs text-black">
              <strong>Test Admin Accounts:</strong>
            </p>
            <p className="text-xs text-black">
              Super Admin: super.admin@example.com / Password123
            </p>
            <p className="text-xs text-black">
              Manager: manager@example.com / Password123
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
