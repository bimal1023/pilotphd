"use client"

import { useState } from "react"
import Link from "next/link"
import { API_URL } from "@/lib/api"
import { fetchWithTimeout } from "@/lib/fetchWithTimeout"

// ── Types ─────────────────────────────────────────────────────────────────────

type Professor = {
  name: string
  university: string
  fit_score: number
  why: string
  email_talking_point: string
  email: string | null
  email_source: string | null
  top_papers: string[]
  citation_count: number
  h_index: number | null
  openalex_url: string
}

type View = "form" | "loading" | "results"

// ── Helpers ───────────────────────────────────────────────────────────────────

const DEFAULT_UNIVERSITIES = ["MIT", "Stanford", "CMU", "Princeton", "Harvard", "UC Berkeley"]

function fitColor(score: number) {
  if (score >= 85) return "bg-green-50 text-green-700 border-green-100"
  if (score >= 70) return "bg-blue-50 text-blue-700 border-blue-100"
  return "bg-gray-100 text-gray-600 border-gray-200"
}

function fitLabel(score: number) {
  if (score >= 85) return "Strong fit"
  if (score >= 70) return "Good fit"
  return "Partial fit"
}

// ── Loading steps ─────────────────────────────────────────────────────────────

const STEPS = [
  "Searching OpenAlex for researchers…",
  "Fetching publication stats…",
  "Ranking by research fit…",
  "Looking up contact info…",
]

function LoadingState() {
  const [step, setStep] = useState(0)

  useState(() => {
    const id = setInterval(() =>
      setStep((s) => (s < STEPS.length - 1 ? s + 1 : s)), 6000)
    return () => clearInterval(id)
  })

  return (
    <div className="flex flex-col items-center justify-center py-32 gap-6">
      <div className="w-10 h-10 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      <div className="space-y-2 text-center">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`flex items-center gap-2 text-sm transition-all ${
              i === step ? "text-gray-900 font-medium" : i < step ? "text-gray-400 line-through" : "text-gray-300"
            }`}
          >
            {i < step
              ? <span className="text-green-500">✓</span>
              : i === step
              ? <span className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin inline-block" />
              : <span className="w-3 h-3 rounded-full border border-gray-200 inline-block" />}
            {s}
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400">This takes about 20–30 seconds</p>
    </div>
  )
}

// ── Professor card ────────────────────────────────────────────────────────────

function ProfessorCard({ prof }: { prof: Professor }) {
  const [copied, setCopied] = useState(false)

  function copyEmail() {
    if (!prof.email) return
    navigator.clipboard.writeText(prof.email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const emailParams = new URLSearchParams({
    professor: prof.name,
    university: prof.university,
  })

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 hover:border-gray-200 transition-all space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{prof.name}</h3>
          <p className="text-sm text-gray-400 mt-0.5 truncate">{prof.university}</p>
        </div>
        <div className="shrink-0 text-right space-y-1">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${fitColor(prof.fit_score)}`}>
            {fitLabel(prof.fit_score)} · {prof.fit_score}
          </span>
          <div className="flex items-center gap-3 justify-end text-xs text-gray-400">
            {prof.h_index != null && <span>h-index {prof.h_index}</span>}
            <span>{prof.citation_count.toLocaleString()} citations</span>
          </div>
        </div>
      </div>

      {/* Why */}
      <p className="text-sm text-gray-600 leading-relaxed">{prof.why}</p>

      {/* Top papers */}
      {prof.top_papers.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Top Papers</p>
          <ul className="space-y-1">
            {prof.top_papers.map((paper, i) => (
              <li key={i} className="text-xs text-gray-500 flex gap-2">
                <span className="text-gray-300 shrink-0">·</span>
                <span>{paper}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Email talking point */}
      {prof.email_talking_point && (
        <div className="bg-blue-50 rounded-lg px-3 py-2.5">
          <p className="text-xs font-medium text-blue-700 mb-0.5">💡 Mention in your email</p>
          <p className="text-xs text-blue-600">{prof.email_talking_point}</p>
        </div>
      )}

      {/* Contact + actions */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-50 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {prof.email ? (
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded border border-gray-100 truncate max-w-[180px] sm:max-w-none">
                {prof.email}
              </span>
              <button
                onClick={copyEmail}
                className="text-xs text-gray-400 hover:text-blue-500 transition-colors px-1.5 py-1 rounded hover:bg-blue-50"
                aria-label="Copy email"
              >
                {copied ? "✓" : "Copy"}
              </button>
            </div>
          ) : prof.email_source ? (
            <a
              href={prof.email_source}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
            >
              Find contact page →
            </a>
          ) : (
            <span className="text-xs text-gray-300">Email not found publicly</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {prof.openalex_url && (
            <a
              href={prof.openalex_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded hover:bg-gray-50"
            >
              OpenAlex ↗
            </a>
          )}
          <Link
            href={`/email?${emailParams}`}
            className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-all font-medium"
          >
            Draft Email
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ProfessorsPage() {
  const [interest, setInterest] = useState("")
  const [profile, setProfile] = useState("")
  const [universities, setUniversities] = useState<string[]>(["MIT", "Stanford", "CMU"])
  const [customUniversity, setCustomUniversity] = useState("")
  const [results, setResults] = useState<Professor[]>([])
  const [view, setView] = useState<View>("form")
  const [error, setError] = useState("")

  function toggleUniversity(u: string) {
    setUniversities((prev) =>
      prev.includes(u) ? prev.filter((x) => x !== u) : [...prev, u]
    )
  }

  function addCustomUniversity() {
    const u = customUniversity.trim()
    if (!u || universities.includes(u)) return
    setUniversities((prev) => [...prev, u])
    setCustomUniversity("")
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (universities.length === 0) {
      setError("Please select at least one university.")
      return
    }
    setError("")
    setResults([])
    setView("loading")

    try {
      const res = await fetchWithTimeout(
        `${API_URL}/api/professors/search`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ research_interest: interest, universities, profile }),
        },
        90000,
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Search failed.")
      setResults(data)
      setView("results")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
      setView("form")
    }
  }

  // ── Form view ──────────────────────────────────────────────────────────────
  if (view === "form") {
    return (
      <div className="space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Find Professors</h1>
          <p className="text-sm text-gray-400">
            Discover researchers whose work aligns with yours — ranked by fit, with contact info.
          </p>
        </div>

        <form onSubmit={handleSearch} className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Research Interest
              </label>
              <input
                type="text"
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                placeholder="e.g. federated learning, NLP for biomedical text"
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Your Profile
              </label>
              <textarea
                value={profile}
                onChange={(e) => setProfile(e.target.value)}
                placeholder="e.g. 3rd year CS undergrad with a publication on privacy-preserving ML, GPA 3.9, interested in PhD starting Fall 2026"
                required
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Universities
              </label>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_UNIVERSITIES.map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => toggleUniversity(u)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      universities.includes(u)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-500"
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  value={customUniversity}
                  onChange={(e) => setCustomUniversity(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomUniversity() }}}
                  placeholder="Add another university…"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={addCustomUniversity}
                  className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all"
                >
                  Add
                </button>
              </div>
              {universities.filter((u) => !DEFAULT_UNIVERSITIES.includes(u)).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {universities
                    .filter((u) => !DEFAULT_UNIVERSITIES.includes(u))
                    .map((u) => (
                      <span key={u} className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-medium">
                        {u}
                        <button
                          type="button"
                          onClick={() => setUniversities((prev) => prev.filter((x) => x !== u))}
                          aria-label={`Remove ${u}`}
                          className="hover:opacity-70"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                </div>
              )}
              <p className="text-xs text-gray-400">{universities.length} selected</p>
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
              Find Professors
            </button>
          </form>
      </div>
    )
  }

  // ── Loading view ───────────────────────────────────────────────────────────
  if (view === "loading") {
    return <LoadingState />
  }

  // ── Results view ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            {results.length > 0
              ? `${results.length} professors found · ranked by fit`
              : "No professors found"}
          </p>
          {results.length === 0 && (
            <p className="text-xs text-gray-300 mt-1">Try broader keywords or different universities</p>
          )}
        </div>
        <button
          onClick={() => setView("form")}
          className="text-xs text-gray-400 hover:text-blue-500 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-blue-50 border border-gray-100 shrink-0"
        >
          ← New Search
        </button>
      </div>

      {results.length > 0 && (
        <>
          <div className="space-y-4">
            {results.map((prof, i) => (
              <ProfessorCard key={`${prof.name}-${i}`} prof={prof} />
            ))}
          </div>
          <p className="text-xs text-gray-300 text-center pb-4">
            Emails sourced from public web pages — verify before sending
          </p>
        </>
      )}
    </div>
  )
}
