"use client"
import { API_URL } from "@/lib/api"
import { useState, useEffect } from "react"
import { fetchWithTimeout } from "@/lib/fetchWithTimeout"
import { fetchApplicationsCached, invalidateApplicationsCache } from "@/lib/applicationsCache"

type Application = {
  id: number
  university: string
  program: string
  status: string
  deadline: string | null
  applied_date: string | null
  professors: string[]
  research_interest: string | null
  notes: string | null
  created_at: string
}

const statusConfig: Record<string, { color: string; dot: string }> = {
  planning:  { color: "bg-gray-100 text-gray-600",   dot: "bg-gray-400" },
  applied:   { color: "bg-blue-50 text-blue-600",    dot: "bg-blue-500" },
  waiting:   { color: "bg-amber-50 text-amber-600",  dot: "bg-amber-400" },
  accepted:  { color: "bg-green-50 text-green-600",  dot: "bg-green-500" },
  rejected:  { color: "bg-red-50 text-red-500",      dot: "bg-red-400" },
  withdrawn: { color: "bg-orange-50 text-orange-500",dot: "bg-orange-400" },
}

const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"

export default function Applications() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [university, setUniversity] = useState("")
  const [program, setProgram] = useState("")
  const [deadline, setDeadline] = useState("")
  const [researchInterest, setResearchInterest] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Partial<Application>>({})
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null)

  async function fetchApplications() {
    try {
      const data = await fetchApplicationsCached(async () => {
        const res = await fetchWithTimeout(`${API_URL}/api/applications/`)
        const json = await res.json()
        if (!res.ok) throw new Error(json.detail || "Could not load applications.")
        return Array.isArray(json) ? json : []
      })
      setApplications(data)
    } catch {
      setError("Could not load applications. Please refresh the page.")
    } finally {
      setLoading(false)
    }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchApplications() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    try {
      const res = await fetchWithTimeout(`${API_URL}/api/applications/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          university,
          program,
          deadline: deadline || null,
          research_interest: researchInterest || null,
        }),
      })
      if (!res.ok) throw new Error("Could not add application.")
      const created: Application = await res.json()
      invalidateApplicationsCache()
      setApplications((prev) => [created, ...prev])
      setUniversity(""); setProgram(""); setDeadline(""); setResearchInterest("")
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setSubmitting(false)
    }
  }

  function startEdit(app: Application) {
    setEditingId(app.id)
    setEditForm({
      university: app.university,
      program: app.program,
      status: app.status,
      deadline: app.deadline ?? "",
      notes: app.notes ?? "",
      research_interest: app.research_interest ?? "",
    })
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingId) return
    try {
      const res = await fetchWithTimeout(`${API_URL}/api/applications/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          deadline: editForm.deadline || null,
          notes: editForm.notes || null,
          research_interest: editForm.research_interest || null,
        }),
      })
      if (!res.ok) throw new Error("Could not update application.")
      const updated: Application = await res.json()
      invalidateApplicationsCache()
      setApplications((prev) => prev.map((a) => (a.id === editingId ? updated : a)))
      setEditingId(null)
    } catch {
      setError("Could not update application. Please try again.")
    }
  }

  async function handleStatusUpdate(id: number, newStatus: string, prevStatus: string) {
    setUpdatingStatusId(id)
    setError("")
    // Optimistic update
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)))
    try {
      const res = await fetchWithTimeout(`${API_URL}/api/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error()
    } catch {
      // Revert to previous status on failure
      setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status: prevStatus } : a)))
      setError("Could not update status. Please try again.")
    } finally {
      setUpdatingStatusId(null)
    }
  }

  async function handleDelete(id: number, university: string) {
    if (!window.confirm(`Delete the application for ${university}? This cannot be undone.`)) return
    // Optimistic remove
    setApplications((prev) => prev.filter((a) => a.id !== id))
    try {
      await fetchWithTimeout(`${API_URL}/api/applications/${id}`, { method: "DELETE" })
      invalidateApplicationsCache()
    } catch {
      // Restore the deleted item by re-fetching
      invalidateApplicationsCache()
      await fetchApplications()
      setError("Could not delete application. Please try again.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
          <p className="text-sm text-gray-400">Track your PhD applications</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            showForm
              ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {showForm ? "Cancel" : "+ Add Application"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">New Application</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500">University</label>
              <input type="text" value={university} onChange={(e) => setUniversity(e.target.value)}
                placeholder="MIT" required className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500">Program</label>
              <input type="text" value={program} onChange={(e) => setProgram(e.target.value)}
                placeholder="CS PhD" required className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500">Deadline</label>
              <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500">Research Interest</label>
              <input type="text" value={researchInterest} onChange={(e) => setResearchInterest(e.target.value)}
                placeholder="machine learning" className={inputClass} />
            </div>
          </div>
          <button type="submit" disabled={submitting}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-all">
            {submitting ? "Adding..." : "Add Application"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-400 py-8">
          <div className="w-4 h-4 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          Loading applications...
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-20 space-y-2">
          <p className="text-gray-400 text-sm">No applications yet</p>
          <p className="text-gray-300 text-xs">Click &quot;+ Add Application&quot; to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {applications.map((app) => (
            <div key={app.id} className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all">
              {editingId === app.id ? (
                <form onSubmit={handleEdit} className="p-5 space-y-4">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Edit Application</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-500">University</label>
                      <input type="text" value={editForm.university ?? ""} required className={inputClass}
                        onChange={(e) => setEditForm({ ...editForm, university: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-500">Program</label>
                      <input type="text" value={editForm.program ?? ""} required className={inputClass}
                        onChange={(e) => setEditForm({ ...editForm, program: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-500">Status</label>
                      <select value={editForm.status ?? "planning"} className={inputClass}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                        {["planning", "applied", "waiting", "accepted", "rejected", "withdrawn"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-500">Deadline</label>
                      <input type="date" value={editForm.deadline ?? ""} className={inputClass}
                        onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })} />
                    </div>
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-xs font-medium text-gray-500">Research Interest</label>
                      <input type="text" value={editForm.research_interest ?? ""} className={inputClass}
                        onChange={(e) => setEditForm({ ...editForm, research_interest: e.target.value })} />
                    </div>
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-xs font-medium text-gray-500">Notes</label>
                      <textarea value={editForm.notes ?? ""} rows={3} className={`${inputClass} resize-none`}
                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all">
                      Save
                    </button>
                    <button type="button" onClick={() => setEditingId(null)}
                      className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${statusConfig[app.status]?.dot}`} />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{app.university}</p>
                      <p className="text-xs text-gray-400">{app.program}{app.deadline ? ` · Due ${app.deadline}` : ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusConfig[app.status]?.color}`}>
                      {app.status}
                    </span>
                    <select
                      value={app.status}
                      disabled={updatingStatusId === app.id}
                      onChange={(e) => handleStatusUpdate(app.id, e.target.value, app.status)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 disabled:opacity-50 disabled:cursor-wait"
                    >
                      {["planning", "applied", "waiting", "accepted", "rejected", "withdrawn"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => startEdit(app)}
                      aria-label={`Edit ${app.university}`}
                      className="text-xs text-gray-300 hover:text-blue-400 transition-colors px-1">
                      ✎
                    </button>
                    <button
                      onClick={() => handleDelete(app.id, app.university)}
                      aria-label={`Delete ${app.university}`}
                      className="text-xs text-gray-300 hover:text-red-400 transition-colors px-1">
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
