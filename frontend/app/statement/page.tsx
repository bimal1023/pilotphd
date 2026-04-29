"use client"
import { API_URL } from "@/lib/api"
import { useState } from "react"
import ReactMarkdown from "react-markdown"
import { fetchWithTimeout } from "@/lib/fetchWithTimeout"
import LoadingCard from "@/components/LoadingCard"

export default function StatementRefiner() {
  const [statement, setStatement] = useState("")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult("")
    setError("")

    try {
      const res = await fetchWithTimeout(`${API_URL}/api/agents/refine-statement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personal_statement: statement }),
      })
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
        <h1 className="text-2xl font-semibold tracking-tight">Statement Refiner</h1>
        <p className="text-sm text-gray-400">Get expert feedback and a refined version of your personal statement</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Your Personal Statement</label>
          <textarea
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            placeholder="Paste your personal statement here..."
            rows={12}
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-all"
        >
          {loading ? "Refining your statement..." : "Refine Statement"}
        </button>
      </form>

      {loading && <LoadingCard message="Refining your statement..." />}

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-3">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Feedback & Refined Version</p>
          <div className="prose prose-sm max-w-none text-gray-700">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}
