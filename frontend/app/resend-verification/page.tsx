"use client"

import { useState } from "react"
import Link from "next/link"
import { API_URL } from "@/lib/api"
import { fetchWithTimeout } from "@/lib/fetchWithTimeout"

const inputClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"

export default function ResendVerificationPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetchWithTimeout(`${API_URL}/api/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Something went wrong.")
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#fafafa] flex flex-col overflow-auto">
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md shrink-0">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white text-xs font-bold">P</span>
            <span className="font-semibold text-gray-900 text-sm">PilotPhD</span>
          </Link>
          <Link href="/login" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            ← Back to sign in
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          {submitted ? (
            <div className="text-center space-y-5">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Check your inbox</h1>
                <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                  If <span className="text-gray-600 font-medium">{email}</span> is registered and unverified, you&apos;ll get a new link shortly.
                </p>
              </div>
              <Link
                href="/login"
                className="inline-block text-xs text-blue-500 hover:text-blue-700 transition-colors"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">P</div>
                <h1 className="text-xl font-semibold text-gray-900">Resend verification email</h1>
                <p className="text-sm text-gray-400">
                  Enter your email and we&apos;ll send you a new verification link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    placeholder="you@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    autoFocus
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                    <p className="text-xs text-red-600">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {loading ? "Sending…" : "Send verification link"}
                </button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-6">
                Remember your password?{" "}
                <Link href="/login" className="text-blue-500 hover:text-blue-700 transition-colors font-medium">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
