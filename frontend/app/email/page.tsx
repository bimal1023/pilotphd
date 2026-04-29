"use client"
import { API_URL } from "@/lib/api"
import { useState } from "react"
import ReactMarkdown from "react-markdown"
import { fetchWithTimeout } from "@/lib/fetchWithTimeout"
import LoadingCard from "@/components/LoadingCard"

export default function EmailDrafter() {
  const [professorName, setProfessorName] = useState("")
  const [university, setUniversity] = useState("")
  const [researchInterest, setResearchInterest] = useState("")
  const [personalStatement, setPersonalStatement] = useState("")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult("")
    setError("")

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
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
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Personal Statement <span className="text-gray-300">(optional)</span></label>
          <textarea
            value={personalStatement}
            onChange={(e) => setPersonalStatement(e.target.value)}
            placeholder="Paste your personal statement here..."
            rows={4}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-all"
        >
          {loading ? "Drafting your email..." : "Draft Email"}
        </button>
      </form>

      {loading && <LoadingCard message="Drafting your email..." />}

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-3">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Your Draft</p>
          <div className="prose prose-sm max-w-none text-gray-700">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}
