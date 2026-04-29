"use client"
import { API_URL } from "@/lib/api"
import { useState } from "react"
import ReactMarkdown from "react-markdown"
import { fetchWithTimeout } from "@/lib/fetchWithTimeout"
import LoadingCard from "@/components/LoadingCard"

export default function DailyBriefing() {
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function fetchBriefing() {
    setLoading(true)
    setResult("")
    setError("")

    try {
      const res = await fetchWithTimeout(`${API_URL}/api/agents/daily-briefing`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Something went wrong.")
      setResult(data.result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Daily Briefing</h1>
        <p className="text-sm text-gray-400">Your personalized PhD application summary for today</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        <p className="text-sm text-gray-500 leading-relaxed">
          Get a smart summary of your upcoming deadlines, application statuses, and what to prioritize today — generated fresh from your data.
        </p>
        <button
          onClick={fetchBriefing}
          disabled={loading}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-all"
        >
          {loading ? "Generating briefing..." : "Generate Briefing"}
        </button>
      </div>

      {loading && <LoadingCard message="Generating your briefing..." />}

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-3">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Your Briefing</p>
          <div className="prose prose-sm max-w-none text-gray-700">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}
