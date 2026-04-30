"use client"

import { API_URL } from "@/lib/api"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import ReactMarkdown from "react-markdown"
import { fetchWithTimeout } from "@/lib/fetchWithTimeout"
import LoadingCard from "@/components/LoadingCard"

type View = "form" | "loading" | "result"

// ── Inner component (needs useSearchParams → must be inside Suspense) ─────────

function EmailDrafterInner() {
  const searchParams = useSearchParams()

  const [professorName, setProfessorName] = useState(searchParams.get("professor") ?? "")
  const [university, setUniversity] = useState(searchParams.get("university") ?? "")
  const [researchInterest, setResearchInterest] = useState("")
  const [personalStatement, setPersonalStatement] = useState("")
  const [result, setResult] = useState("")
  const [view, setView] = useState<View>("form")
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  // Re-fill if navigating from a professor card
  useEffect(() => {
    const p = searchParams.get("professor")
    const u = searchParams.get("university")
    if (p) setProfessorName(p)
    if (u) setUniversity(u)
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setResult("")
    setView("loading")

    try {
      const res = await fetchWithTimeout(`${API_URL}/api/agents/draft-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professor_name: professorName,
          university,
          research_interest: researchInterest,
          personal_statement: personalStatement,
        }),
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
          <h1 className="text-2xl font-semibold tracking-tight">Email Drafter</h1>
          <p className="text-sm text-gray-400">Draft a personalized cold email to a professor</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Professor Name</label>
                <input
                  type="text"
                  value={professorName}
                  onChange={(e) => setProfessorName(e.target.value)}
                  placeholder="Dr. John Smith"
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">University</label>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="MIT"
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Research Interest</label>
              <input
                type="text"
                value={researchInterest}
                onChange={(e) => setResearchInterest(e.target.value)}
                placeholder="e.g. computational neuroscience"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Personal Statement <span className="text-gray-300 normal-case font-normal">(optional)</span>
              </label>
              <textarea
                value={personalStatement}
                onChange={(e) => setPersonalStatement(e.target.value)}
                placeholder="Paste your personal statement here for a more personalized email…"
                rows={4}
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
              Draft Email
            </button>
          </form>
      </div>
    )
  }

  // ── Loading view ───────────────────────────────────────────────────────────
  if (view === "loading") {
    return (
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Email Drafter</h1>
        <p className="text-sm text-gray-400">Draft a personalized cold email to a professor</p>
        <LoadingCard message="Drafting your email…" />
      </div>
    )
  }

  // ── Result view ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="space-y-0.5 min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">Email Drafter</h1>
          <p className="text-sm text-gray-400 truncate">
            Draft for <span className="text-gray-600 font-medium">{professorName}</span>
            {university ? ` · ${university}` : ""}
          </p>
        </div>
        <button
          onClick={() => setView("form")}
          className="text-xs text-gray-400 hover:text-blue-500 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-blue-50 border border-gray-100 shrink-0"
        >
          ← Edit Details
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Your Draft</p>
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

// ── Page export wrapped in Suspense (required for useSearchParams) ─────────────

export default function EmailDrafter() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    }>
      <EmailDrafterInner />
    </Suspense>
  )
}
