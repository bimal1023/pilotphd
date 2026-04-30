"use client"

import { API_URL } from "@/lib/api"
import { useState } from "react"
import ReactMarkdown from "react-markdown"
import { fetchWithTimeout } from "@/lib/fetchWithTimeout"
import LoadingCard from "@/components/LoadingCard"

type View = "form" | "loading" | "result"

export default function StatementRefiner() {
  const [statement, setStatement] = useState("")
  const [result, setResult] = useState("")
  const [view, setView] = useState<View>("form")
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setResult("")
    setView("loading")

    try {
      const res = await fetchWithTimeout(`${API_URL}/api/agents/refine-statement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personal_statement: statement }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Something went wrong.")
      setResult(data.result)
      setView("result")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
      setView("form")
    }
  }

  function copyResult() {
    if (!result) return
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Form view ──────────────────────────────────────────────────────────────
  if (view === "form") {
    return (
      <div className="space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Statement Refiner</h1>
          <p className="text-sm text-gray-400">Get expert feedback and a refined version of your personal statement</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Your Personal Statement
                </label>
                {statement && (
                  <span className="text-xs text-gray-300">{statement.length} chars</span>
                )}
              </div>
              <textarea
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                placeholder="Paste your personal statement here…"
                rows={12}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all"
            >
              Refine Statement
            </button>

            <p className="text-xs text-gray-300 text-center">
              Your statement is sent only to generate feedback — it is not stored.
            </p>
          </form>
      </div>
    )
  }

  // ── Loading view ───────────────────────────────────────────────────────────
  if (view === "loading") {
    return (
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Statement Refiner</h1>
        <p className="text-sm text-gray-400">Get expert feedback and a refined version of your personal statement</p>
        <LoadingCard message="Refining your statement…" />
      </div>
    )
  }

  // ── Result view ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-semibold tracking-tight">Statement Refiner</h1>
          <p className="text-sm text-gray-400">Feedback &amp; refined version of your statement</p>
        </div>
        <button
          onClick={() => setView("form")}
          className="text-xs text-gray-400 hover:text-blue-500 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-blue-50 border border-gray-100 shrink-0"
        >
          ← Edit Statement
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Feedback &amp; Refined Version</p>
          <button
            onClick={copyResult}
            className="text-xs text-gray-400 hover:text-blue-500 transition-colors px-2.5 py-1 rounded-lg hover:bg-blue-50 border border-gray-100"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
        <div className="prose prose-sm max-w-none text-gray-700">
          <ReactMarkdown>{result}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
