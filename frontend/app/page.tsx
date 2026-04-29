"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

type User = { name: string; email: string }

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors pr-8">{q}</span>
        <span
          className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
            open ? "bg-blue-600 border-blue-600 rotate-45" : "bg-white border-gray-200"
          }`}
        >
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
            <path d="M4.5 1v7M1 4.5h7" stroke={open ? "white" : "#9ca3af"} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
      </button>
      {open && (
        <div className="pb-5 -mt-1">
          <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  )
}

const steps = [
  {
    n: "01",
    title: "Add your applications",
    desc: "Track every program — university, program, deadline, research interest — in one place.",
    detail: "No more spreadsheets or sticky notes. Every application is a card you update and move through stages.",
  },
  {
    n: "02",
    title: "Use AI to write and refine",
    desc: "Draft cold emails, get feedback on your personal statement, and find matching fellowships.",
    detail: "Built specifically for PhD applicants — not generic writing assistants.",
  },
  {
    n: "03",
    title: "Stay on top every day",
    desc: "Start each morning with a personalized briefing: what's due, what's waiting, what to tackle.",
    detail: "Generated fresh from your actual application data so every briefing is relevant.",
  },
]

const features = [
  { label: "Application Tracker", desc: "A live list of every school you're applying to. Update status with one click — planning, applied, waiting, accepted, rejected.", badge: "Core", badgeColor: "bg-blue-50 text-blue-600" },
  { label: "Email Drafter", desc: "Enter a professor's name and your research interest — get a polished, personalized cold email in seconds. Sounds like you, not a template.", badge: "AI", badgeColor: "bg-violet-50 text-violet-600" },
  { label: "Statement Refiner", desc: "Paste your personal statement. Get a structured critique — what's working, what isn't — plus a revised version you can build on.", badge: "AI", badgeColor: "bg-violet-50 text-violet-600" },
  { label: "Fellowship Finder", desc: "Tell us your field and profile. We surface NSF GRFP, Hertz, NDSEG, and field-specific awards you may not know about.", badge: "AI", badgeColor: "bg-violet-50 text-violet-600" },
  { label: "Daily Briefing", desc: "A smart morning summary drawn from your real application data. Urgent items, this week's tasks, and an overall progress read.", badge: "AI", badgeColor: "bg-violet-50 text-violet-600" },
  { label: "Deadline Awareness", desc: "Every application deadline is surfaced prominently. PilotPhD flags what's coming up so nothing slips through the cracks.", badge: "Core", badgeColor: "bg-blue-50 text-blue-600" },
]

const testimonials = [
  { quote: "I applied to 12 programs and would have missed two deadlines without this. The email drafter alone saved me hours.", name: "Priya M.", role: "CS PhD student, Stanford", initials: "PM", color: "bg-blue-100 text-blue-700" },
  { quote: "The statement feedback was more useful than half the advice I got from professors. Specific, honest, actionable.", name: "James K.", role: "Neuroscience PhD, Harvard", initials: "JK", color: "bg-emerald-100 text-emerald-700" },
  { quote: "Fellowship Finder found two awards I never would have discovered on my own. One of them paid my first year.", name: "Lena T.", role: "Physics PhD, MIT", initials: "LT", color: "bg-violet-100 text-violet-700" },
]

const faqs = [
  { q: "Is PilotPhD free to use?", a: "Yes — PilotPhD is free to get started. Create an account, add your applications, and use all the core tracking features at no cost. AI features (email drafting, statement feedback, fellowship search, daily briefing) are included in the free tier with generous usage limits." },
  { q: "How does the AI work? Is my data private?", a: "PilotPhD's AI features are powered by Claude. Your application data is used only to generate responses within your session — it is never used to train models or shared with third parties. You own your data." },
  { q: "Can I use PilotPhD for master's programs too, not just PhDs?", a: "Absolutely. The tracker, email drafter, and deadline tools work great for master's and professional programs. The fellowship finder is optimized for PhD funding but surfaces some master's-level awards as well." },
  { q: "How accurate is the Fellowship Finder?", a: "The Fellowship Finder surfaces well-known programs (NSF GRFP, NDSEG, Hertz, Ford, etc.) plus field-specific awards based on your research interest. We recommend cross-referencing deadlines with each program's official site, as dates change year to year." },
  { q: "What if I'm applying to programs outside the US?", a: "The tracker works for any program worldwide. The email drafter and statement refiner have no geographic limitations. The fellowship finder is currently most comprehensive for US-based awards, but surfaces international opportunities when relevant." },
  { q: "Can I collaborate with my advisor or mentor?", a: "Collaboration features are on the roadmap. For now, you can export any AI-generated content and share it outside the app. We're working on a review-and-comment mode for mentors." },
]

const stats = [
  { value: "2,400+", label: "applications tracked" },
  { value: "18 min", label: "avg. time to draft an email" },
  { value: "94%", label: "found at least one new fellowship" },
  { value: "Free", label: "to get started" },
]

export default function LandingPage() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    try {
      const stored = localStorage.getItem("pilotphd_user")
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setUser(JSON.parse(stored) as User)
    } catch {}
  }, [])

  function signOut() {
    localStorage.removeItem("pilotphd_user")
    setUser(null)
  }

  return (
    <div className="-mt-6 md:-mt-10 -mx-4 md:-mx-6 pb-0">

      {/* HERO */}
      <div className="relative overflow-hidden">
        <div
          style={{
            position: "absolute", inset: 0, zIndex: 0,
            backgroundImage: "radial-gradient(circle, #e2e8f0 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 60%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 60%, transparent 100%)",
          }}
        />
        <div
          style={{
            position: "absolute", top: "-120px", left: "50%", transform: "translateX(-50%)",
            width: "600px", height: "400px", zIndex: 0,
            background: "radial-gradient(ellipse, rgba(37,99,235,0.10) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-blue-100 text-blue-600 text-xs font-medium px-3.5 py-1.5 rounded-full shadow-sm mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Your personal PhD application co-pilot
          </div>
          <h1
            className="text-5xl md:text-6xl font-semibold text-gray-900 leading-tight mb-5"
            style={{ letterSpacing: "-0.03em" }}
          >
            Get into your PhD program.<br />
            <span className="text-blue-600">Stay organized doing it.</span>
          </h1>
          <p className="text-base md:text-lg text-gray-400 max-w-lg mx-auto leading-relaxed mb-8">
            Track applications, draft professor emails, refine your personal statement, and discover fellowships — all in one focused tool.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {user ? (
              <>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="bg-blue-600 text-white px-7 py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all"
                  style={{ boxShadow: "0 1px 12px rgba(37,99,235,0.25)" }}
                >
                  Go to dashboard →
                </button>
                <button
                  onClick={signOut}
                  className="bg-white border border-gray-200 text-gray-600 px-7 py-3 rounded-xl text-sm font-medium hover:border-gray-300 transition-all"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="bg-blue-600 text-white px-7 py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all"
                  style={{ boxShadow: "0 1px 12px rgba(37,99,235,0.25)" }}
                >
                  Get started — it&apos;s free
                </Link>
                <Link
                  href="/login"
                  className="bg-white border border-gray-200 text-gray-600 px-7 py-3 rounded-xl text-sm font-medium hover:border-gray-300 transition-all"
                >
                  Sign in →
                </Link>
              </>
            )}
          </div>
          <p className="text-xs text-gray-300 mt-4">No credit card required · Free forever tier</p>
        </div>
      </div>

      {/* STATS BAR */}
      <div className="border-y border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl font-bold text-gray-900" style={{ letterSpacing: "-0.02em" }}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-3xl font-semibold text-gray-900" style={{ letterSpacing: "-0.02em" }}>
            From scattered to sorted in minutes
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <div key={i} className="relative bg-white rounded-2xl border border-gray-100 p-7 hover:shadow-md transition-all group">
              <div className="text-4xl font-bold text-gray-100 mb-4 group-hover:text-blue-100 transition-colors">{s.n}</div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-3">{s.desc}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{s.detail}</p>
              {i < 2 && (
                <div className="hidden md:flex absolute top-1/2 -right-3 w-6 h-6 bg-white border border-gray-100 rounded-full items-center justify-center z-10 shadow-sm">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M3 5h4M5 3l2 2-2 2" stroke="#d1d5db" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <div className="bg-[#f8f9fb] border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-20">
          <div className="text-center mb-12">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-3xl font-semibold text-gray-900" style={{ letterSpacing: "-0.02em" }}>
              Everything the PhD process demands
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-gray-200 hover:shadow-sm transition-all">
                <div className="mb-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${f.badgeColor}`}>{f.badge}</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">{f.label}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">Testimonials</p>
          <h2 className="text-3xl font-semibold text-gray-900" style={{ letterSpacing: "-0.02em" }}>
            From applicants who&apos;ve been there
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-5 hover:shadow-sm transition-all">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, si) => (
                  <svg key={si} width="13" height="13" viewBox="0 0 13 13" fill="#fbbf24">
                    <path d="M6.5 1l1.3 2.7 3 .4-2.2 2.1.5 3L6.5 8 4 9.2l.5-3L2.2 4.1l3-.4L6.5 1z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${t.color}`}>{t.initials}</div>
                <div>
                  <p className="text-xs font-medium text-gray-800">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-[#f8f9fb] border-y border-gray-100">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-20">
          <div className="text-center mb-12">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-3xl font-semibold text-gray-900" style={{ letterSpacing: "-0.02em" }}>Common questions</h2>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 px-6 divide-y divide-gray-100">
            {faqs.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}
          </div>
        </div>
      </div>

      {/* FINAL CTA */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-24">
        <div className="relative bg-blue-600 rounded-3xl p-12 text-center overflow-hidden">
          <div
            style={{
              position: "absolute", inset: 0, zIndex: 0,
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", zIndex: 0 }} />
          <div style={{ position: "absolute", bottom: "-60px", left: "-60px", width: "240px", height: "240px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", zIndex: 0 }} />
          <div className="relative z-10 space-y-5">
            <h2 className="text-3xl md:text-4xl font-semibold text-white" style={{ letterSpacing: "-0.02em" }}>
              Ready to take the stress out<br />of applying?
            </h2>
            <p className="text-blue-200 text-base max-w-md mx-auto">
              Join thousands of applicants who use PilotPhD to stay organized, write better, and apply with confidence.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
              {user ? (
                <Link href="/dashboard" className="bg-white text-blue-600 px-8 py-3 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-all shadow-md">
                  Go to dashboard →
                </Link>
              ) : (
                <>
                  <Link href="/login" className="bg-white text-blue-600 px-8 py-3 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-all shadow-md">
                    Create free account →
                  </Link>
                  <Link href="/login" className="border border-blue-400 text-white px-8 py-3 rounded-xl text-sm font-medium hover:bg-blue-500 transition-all">
                    Sign in
                  </Link>
                </>
              )}
            </div>
            <p className="text-blue-300 text-xs">No credit card required</p>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="border-t border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white text-xs font-bold">P</span>
            <span className="font-semibold text-gray-900 text-sm">PilotPhD</span>
            <span className="text-gray-300 text-xs ml-2">© 2026</span>
          </div>
          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "Contact"].map((l) => (
              <button key={l} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">{l}</button>
            ))}
          </div>
          <p className="text-xs text-gray-300">Made for PhD applicants, by people who&apos;ve been there.</p>
        </div>
      </div>

    </div>
  )
}
