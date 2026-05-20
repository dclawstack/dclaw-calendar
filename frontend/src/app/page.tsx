import Link from "next/link"
import {
  Calendar, Sparkles, Link2, Shield, BarChart3, Users, Clock,
  CheckCircle2, ArrowRight, Zap, Brain, Target, Globe,
  ChevronRight, Star, Play,
} from "lucide-react"

// ─── Mini UI Mockups ──────────────────────────────────────────────────────────

function CalendarMockup() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const events = [
    { col: 1, row: 2, span: 2, label: "Team Standup", color: "#7660A8" },
    { col: 3, row: 3, span: 3, label: "Product Review", color: "#10B981" },
    { col: 5, row: 1, span: 2, label: "1:1 with Alex", color: "#2C6CB0" },
    { col: 2, row: 5, span: 2, label: "Deep Work 🎯", color: "#C28A00" },
    { col: 6, row: 4, span: 1, label: "Lunch", color: "#2E8B57" },
  ]
  return (
    <div
      className="rounded-2xl border overflow-hidden shadow-2xl"
      style={{ background: "#fff", borderColor: "#E8E8EC", width: "100%" }}
    >
      {/* Calendar header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "#E8E8EC" }}>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "#7660A8" }}>
            <Calendar className="w-3 h-3 text-white" />
          </div>
          <span className="font-semibold text-sm" style={{ color: "#0F0F12" }}>June 2026</span>
        </div>
        <div className="flex gap-1">
          {["Month", "Week", "Day"].map((v, i) => (
            <span
              key={v}
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={i === 1 ? { background: "#7660A8", color: "#fff" } : { color: "#7A7A85" }}
            >
              {v}
            </span>
          ))}
        </div>
      </div>
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b" style={{ borderColor: "#E8E8EC" }}>
        {days.map((d) => (
          <div key={d} className="text-center py-2 text-xs font-semibold" style={{ color: "#7A7A85" }}>
            {d}
          </div>
        ))}
      </div>
      {/* Time slots grid */}
      <div className="relative" style={{ height: 200 }}>
        <div className="grid grid-cols-7 h-full">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="border-r last:border-r-0 h-full"
              style={{ borderColor: "#F2F2F4" }}
            />
          ))}
        </div>
        {/* Event blocks */}
        {events.map((ev, i) => (
          <div
            key={i}
            className="absolute rounded-md px-2 py-1 text-xs font-medium text-white flex items-center overflow-hidden"
            style={{
              left: `${((ev.col - 1) / 7) * 100}%`,
              top: `${(ev.row - 1) * 38 + 4}px`,
              width: `${(ev.span / 7) * 100 - 2}%`,
              background: ev.color,
              fontSize: "10px",
              height: "30px",
            }}
          >
            {ev.label}
          </div>
        ))}
        {/* AI suggestion badge */}
        <div
          className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg"
          style={{ background: "#7660A8", color: "#fff" }}
        >
          <Sparkles className="w-3 h-3" />
          AI optimized your Tuesday
        </div>
      </div>
    </div>
  )
}

function AIChatMockup() {
  const messages = [
    { role: "user", text: "Find me 2 hours of focus time tomorrow morning" },
    { role: "ai", text: "I found a perfect slot: 9:00–11:00 AM tomorrow. Your calendar is clear and it's before your energy typically dips. Shall I block it as Deep Work? 🎯" },
    { role: "user", text: "Yes, and reschedule the 9:30 call to afternoon" },
    { role: "ai", text: "Done! Moved the call to 3:00 PM and blocked 9–11 AM as Deep Work. You now have 2 uninterrupted hours." },
  ]
  return (
    <div
      className="rounded-2xl border overflow-hidden shadow-2xl"
      style={{ background: "#fff", borderColor: "#E8E8EC", maxWidth: 420 }}
    >
      <div
        className="flex items-center gap-2 px-4 py-3 border-b"
        style={{ borderColor: "#E8E8EC", background: "#F8F6FB" }}
      >
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#7660A8" }}>
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <p className="text-xs font-semibold" style={{ color: "#0F0F12" }}>Calendar AI</p>
          <p className="text-xs" style={{ color: "#10B981" }}>● Online</p>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "ai" && (
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-0.5"
                style={{ background: "#7660A8" }}
              >
                <Sparkles className="w-2.5 h-2.5 text-white" />
              </div>
            )}
            <div
              className="text-xs rounded-2xl px-3 py-2 max-w-xs leading-relaxed"
              style={
                m.role === "user"
                  ? { background: "#7660A8", color: "#fff", borderRadius: "16px 16px 4px 16px" }
                  : { background: "#F8F8FA", color: "#404049", borderRadius: "4px 16px 16px 16px" }
              }
            >
              {m.text}
            </div>
          </div>
        ))}
        <div className="flex gap-2 pt-1">
          {["Block focus time", "Reschedule meeting", "Show my week"].map((s) => (
            <span
              key={s}
              className="text-xs px-2 py-1 rounded-full border cursor-pointer hover:opacity-80 whitespace-nowrap"
              style={{ borderColor: "#E2DCEE", color: "#7660A8", fontSize: "10px" }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>
      <div
        className="px-4 py-2 border-t flex items-center gap-2"
        style={{ borderColor: "#E8E8EC" }}
      >
        <input
          readOnly
          placeholder="Ask anything about your schedule…"
          className="flex-1 text-xs outline-none bg-transparent"
          style={{ color: "#A3A3AC" }}
        />
        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "#7660A8" }}>
          <ArrowRight className="w-3 h-3 text-white" />
        </div>
      </div>
    </div>
  )
}

function AnalyticsMockup() {
  const bars = [60, 85, 40, 95, 55, 70, 30]
  const days = ["M", "T", "W", "T", "F", "S", "S"]
  return (
    <div
      className="rounded-2xl border overflow-hidden shadow-xl"
      style={{ background: "#fff", borderColor: "#E8E8EC" }}
    >
      <div className="px-5 pt-5 pb-4">
        <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#7660A8" }}>
          This Week
        </p>
        <p className="text-2xl font-bold" style={{ color: "#0F0F12" }}>18.5h</p>
        <p className="text-xs mt-0.5" style={{ color: "#7A7A85" }}>in meetings — 2.5h less than last week ↓</p>
      </div>
      <div className="flex items-end gap-1.5 px-5 pb-4" style={{ height: 80 }}>
        {bars.map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t-sm"
              style={{
                height: `${h}%`,
                background: i === 3 ? "#7660A8" : "#E2DCEE",
                minHeight: 4,
              }}
            />
            <span className="text-xs" style={{ color: "#A3A3AC", fontSize: "9px" }}>{days[i]}</span>
          </div>
        ))}
      </div>
      <div
        className="grid grid-cols-3 border-t divide-x"
        style={{ borderColor: "#E8E8EC" }}
      >
        {[
          { label: "Focus time", value: "12h", up: true },
          { label: "Meetings", value: "18", up: false },
          { label: "Free slots", value: "8", up: true },
        ].map((s) => (
          <div key={s.label} className="px-3 py-3 text-center">
            <p className="text-sm font-bold" style={{ color: "#0F0F12" }}>{s.value}</p>
            <p className="text-xs" style={{ color: "#7A7A85", fontSize: "10px" }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function SchedulingLinkMockup() {
  return (
    <div
      className="rounded-2xl border overflow-hidden shadow-xl"
      style={{ background: "#fff", borderColor: "#E8E8EC", maxWidth: 340 }}
    >
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#F1EEF8" }}>
            <span className="text-lg">👤</span>
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#0F0F12" }}>Book time with Satish</p>
            <p className="text-xs" style={{ color: "#7A7A85" }}>30 min · Video call</p>
          </div>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
          style={{ background: "#F8F8FA", color: "#5A5A66" }}
        >
          <Link2 className="w-3.5 h-3.5" style={{ color: "#7660A8" }} />
          <span>cal.dclaw.app/satish/30min</span>
          <span
            className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ background: "#F1EEF8", color: "#7660A8" }}
          >
            Copy
          </span>
        </div>
      </div>
      <div className="px-5 pb-5">
        <p className="text-xs font-semibold mb-2" style={{ color: "#0F0F12" }}>Pick a time</p>
        <div className="grid grid-cols-3 gap-1.5">
          {["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"].map((t, i) => (
            <button
              key={t}
              className="text-xs py-1.5 rounded-lg border font-medium text-center"
              style={
                i === 1
                  ? { background: "#7660A8", color: "#fff", border: "1px solid #7660A8" }
                  : { background: "#fff", color: "#404049", borderColor: "#E8E8EC" }
              }
            >
              {t}
            </button>
          ))}
        </div>
        <button
          className="w-full mt-3 py-2 rounded-full text-sm font-semibold text-white"
          style={{ background: "#7660A8" }}
        >
          Confirm Booking
        </button>
      </div>
    </div>
  )
}

// ─── Section components ───────────────────────────────────────────────────────

const features = [
  {
    icon: Sparkles,
    color: "#7660A8",
    bg: "#F1EEF8",
    title: "AI Calendar Copilot",
    desc: "Chat with your calendar. Ask it to find focus time, reschedule meetings, or optimize your week — it understands context.",
  },
  {
    icon: Link2,
    color: "#2C6CB0",
    bg: "#E5EFF9",
    title: "Smart Scheduling Links",
    desc: "Share a booking link with anyone. DClaw handles timezone conversion, buffer time, and availability — automatically.",
  },
  {
    icon: Shield,
    color: "#B3261E",
    bg: "#FBE9E7",
    title: "Conflict Detection",
    desc: "No more accidental double-bookings. Every event is checked for overlaps in real time with smart resolution suggestions.",
  },
  {
    icon: Target,
    color: "#C28A00",
    bg: "#FBF1DC",
    title: "Time Blocking",
    desc: "Protect your best hours. Create focus blocks, travel buffers, and break zones that meetings can't invade.",
  },
  {
    icon: Users,
    color: "#10B981",
    bg: "#E6F4EC",
    title: "Team Scheduling",
    desc: "Find a time that works for everyone instantly. Group availability across your whole team in a single view.",
  },
  {
    icon: BarChart3,
    color: "#2E8B57",
    bg: "#E6F4EC",
    title: "Time Analytics",
    desc: "See exactly where your week went. Meeting load, focus time, and scheduling efficiency — all in one dashboard.",
  },
]

const stats = [
  { value: "5h+", label: "saved per week", icon: Clock },
  { value: "94%", label: "fewer double-bookings", icon: Shield },
  { value: "3×", label: "faster scheduling", icon: Zap },
]

const comparisons = [
  { feature: "AI Schedule Optimization", dclaw: true, calendly: false, google: false },
  { feature: "Smart Scheduling Links", dclaw: true, calendly: true, google: false },
  { feature: "Conflict Resolution", dclaw: true, calendly: false, google: false },
  { feature: "Time Blocking (AI)", dclaw: true, calendly: false, google: false },
  { feature: "Analytics Dashboard", dclaw: true, calendly: true, google: false },
  { feature: "Team Availability", dclaw: true, calendly: true, google: true },
  { feature: "Voice Scheduling", dclaw: true, calendly: false, google: false },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans" style={{ background: "#fff" }}>

      {/* ── Navbar ──────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 border-b backdrop-blur-sm"
        style={{ background: "rgba(255,255,255,0.92)", borderColor: "#E8E8EC" }}
      >
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "#7660A8" }}
            >
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base" style={{ color: "#0F0F12" }}>DClaw Calendar</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {["Features", "AI Copilot", "Scheduling", "Analytics"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: "#5A5A66" }}
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm font-medium hover:opacity-70 transition-opacity"
              style={{ color: "#5A5A66" }}
            >
              Sign in
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-semibold px-4 py-2 rounded-full text-white transition-opacity hover:opacity-90"
              style={{ background: "#7660A8" }}
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden pt-20 pb-24 px-6"
        style={{
          background: "linear-gradient(160deg, #FFFFFF 0%, #F8F6FB 50%, #F1EEF8 100%)",
        }}
      >
        {/* Background decoration */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: "#7660A8", transform: "translate(30%, -30%)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: "#10B981", transform: "translate(-30%, 30%)" }}
        />

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: copy */}
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
                style={{ background: "#F1EEF8", color: "#7660A8" }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI-powered scheduling is here
              </div>

              <h1
                className="text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-5"
                style={{ color: "#0F0F12" }}
              >
                Your calendar,{" "}
                <span style={{ color: "#7660A8" }}>supercharged</span>{" "}
                with AI
              </h1>

              <p
                className="text-xl leading-relaxed mb-8 max-w-lg"
                style={{ color: "#5A5A66" }}
              >
                DClaw Calendar optimizes your schedule, prevents double-bookings,
                and gives back <strong>5+ hours every week</strong> — all through
                a conversational AI copilot.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg"
                  style={{ background: "#7660A8", boxShadow: "0 8px 24px rgba(118,96,168,0.3)" }}
                >
                  Get started free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold border transition-all hover:opacity-80"
                  style={{ color: "#404049", borderColor: "#D6D6D6" }}
                >
                  <Play className="w-3.5 h-3.5" style={{ color: "#7660A8" }} />
                  Watch demo
                </Link>
              </div>

              <div className="flex items-center gap-5">
                <div className="flex -space-x-2">
                  {["#7660A8", "#10B981", "#2C6CB0", "#C28A00"].map((c, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: c }}
                    >
                      {["S", "A", "J", "M"][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" style={{ color: "#C28A00" }} />
                    ))}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "#7A7A85" }}>
                    Loved by 2,400+ teams
                  </p>
                </div>
              </div>
            </div>

            {/* Right: calendar mockup */}
            <div className="relative">
              <div
                className="absolute inset-0 rounded-3xl opacity-20 blur-2xl"
                style={{ background: "#7660A8", transform: "scale(0.95) translateY(10px)" }}
              />
              <CalendarMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ───────────────────────────────────────────────── */}
      <section style={{ background: "#7660A8" }}>
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="grid grid-cols-3 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <s.icon className="w-5 h-5 text-white opacity-70" />
                  <span className="text-3xl font-bold text-white">{s.value}</span>
                </div>
                <p className="text-sm text-white opacity-70">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features grid ───────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6" style={{ background: "#FAFAFA" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p
              className="text-sm font-semibold uppercase tracking-widest mb-3"
              style={{ color: "#7660A8" }}
            >
              Everything you need
            </p>
            <h2
              className="text-4xl font-bold mb-4 tracking-tight"
              style={{ color: "#0F0F12" }}
            >
              A smarter way to own your time
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "#5A5A66" }}>
              From AI-assisted scheduling to deep analytics, every feature is designed to
              put you in control of your calendar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="group p-6 rounded-2xl border bg-white transition-all hover:shadow-xl hover:-translate-y-0.5 cursor-default"
                style={{ borderColor: "#E8E8EC" }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: f.bg }}
                >
                  <f.icon className="w-5 h-5" style={{ color: f.color }} />
                </div>
                <h3 className="font-semibold text-base mb-2" style={{ color: "#0F0F12" }}>
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#5A5A66" }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Copilot section ──────────────────────────────────────── */}
      <section id="ai-copilot" className="py-24 px-6" style={{ background: "#fff" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
                style={{ background: "#F1EEF8", color: "#7660A8" }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI Copilot
              </div>
              <h2
                className="text-4xl font-bold mb-5 tracking-tight leading-snug"
                style={{ color: "#0F0F12" }}
              >
                Your calendar understands{" "}
                <span style={{ color: "#7660A8" }}>plain English</span>
              </h2>
              <p className="text-lg leading-relaxed mb-8" style={{ color: "#5A5A66" }}>
                Just tell it what you need. The AI Copilot reads your entire schedule,
                understands your priorities, and takes action — not just answers questions.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  "Find me 2 hours of focus time tomorrow morning",
                  "Reschedule Friday's standup — I have a conflict",
                  "How many meeting hours did I have this week?",
                  "Block every Tuesday afternoon for deep work",
                ].map((q) => (
                  <div
                    key={q}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm"
                    style={{ borderColor: "#E2DCEE", color: "#404049" }}
                  >
                    <Brain className="w-4 h-4 flex-shrink-0" style={{ color: "#7660A8" }} />
                    "{q}"
                  </div>
                ))}
              </div>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm font-semibold hover:opacity-80"
                style={{ color: "#7660A8" }}
              >
                Try the AI Copilot <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex justify-center lg:justify-end">
              <AIChatMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── Scheduling Links section ────────────────────────────────── */}
      <section
        id="scheduling"
        className="py-24 px-6"
        style={{ background: "linear-gradient(135deg, #F8F6FB 0%, #EFF8F4 100%)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="flex justify-center lg:justify-start order-2 lg:order-1">
              <SchedulingLinkMockup />
            </div>

            <div className="order-1 lg:order-2">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
                style={{ background: "#E5EFF9", color: "#2C6CB0" }}
              >
                <Link2 className="w-3.5 h-3.5" />
                Smart Scheduling Links
              </div>
              <h2
                className="text-4xl font-bold mb-5 tracking-tight leading-snug"
                style={{ color: "#0F0F12" }}
              >
                Share your availability{" "}
                <span style={{ color: "#2C6CB0" }}>in one link</span>
              </h2>
              <p className="text-lg leading-relaxed mb-8" style={{ color: "#5A5A66" }}>
                Stop the back-and-forth emails. Generate a smart booking link that shows
                your real availability, handles timezones, and adds buffer time — all automatically.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Globe, title: "Timezone-aware", desc: "Visitors see times in their local timezone automatically" },
                  { icon: Clock, title: "Buffer time", desc: "Automatically pad meetings so you're never rushed" },
                  { icon: Zap, title: "Instant booking", desc: "Events appear on your calendar the moment they're confirmed" },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "#E5EFF9" }}
                    >
                      <item.icon className="w-4 h-4" style={{ color: "#2C6CB0" }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#0F0F12" }}>{item.title}</p>
                      <p className="text-sm" style={{ color: "#7A7A85" }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Analytics section ───────────────────────────────────────── */}
      <section id="analytics" className="py-24 px-6" style={{ background: "#fff" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
                style={{ background: "#E6F4EC", color: "#2E8B57" }}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Time Analytics
              </div>
              <h2
                className="text-4xl font-bold mb-5 tracking-tight leading-snug"
                style={{ color: "#0F0F12" }}
              >
                Finally see where{" "}
                <span style={{ color: "#2E8B57" }}>your time actually goes</span>
              </h2>
              <p className="text-lg leading-relaxed mb-8" style={{ color: "#5A5A66" }}>
                Most people don't know they're spending 32 hours a month in meetings.
                DClaw shows you the data, and then helps you fix it.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { label: "Meeting hours tracked", value: "32h/mo", icon: "📊" },
                  { label: "Focus blocks protected", value: "18 slots", icon: "🎯" },
                  { label: "Conflicts prevented", value: "12 this month", icon: "🛡️" },
                  { label: "Time recovered", value: "5.2h/week", icon: "⚡" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="p-4 rounded-xl border"
                    style={{ borderColor: "#E8E8EC" }}
                  >
                    <div className="text-xl mb-1">{s.icon}</div>
                    <div className="font-bold text-sm" style={{ color: "#0F0F12" }}>{s.value}</div>
                    <div className="text-xs" style={{ color: "#7A7A85" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-sm">
                <AnalyticsMockup />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Comparison table ────────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ background: "#F8F8FA" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 tracking-tight" style={{ color: "#0F0F12" }}>
              Why teams switch to DClaw
            </h2>
            <p className="text-lg" style={{ color: "#5A5A66" }}>
              Built to do what Calendly and Google Calendar can't.
            </p>
          </div>

          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "#E8E8EC" }}>
            <div className="grid grid-cols-4 bg-white">
              <div className="px-5 py-4 text-sm font-semibold" style={{ color: "#7A7A85" }}>Feature</div>
              {[
                { name: "DClaw", highlight: true },
                { name: "Calendly", highlight: false },
                { name: "Google Calendar", highlight: false },
              ].map((h) => (
                <div
                  key={h.name}
                  className="px-5 py-4 text-center text-sm font-semibold"
                  style={h.highlight ? { color: "#7660A8" } : { color: "#7A7A85" }}
                >
                  {h.name}
                </div>
              ))}
            </div>
            {comparisons.map((row, i) => (
              <div
                key={row.feature}
                className="grid grid-cols-4 border-t"
                style={{
                  borderColor: "#E8E8EC",
                  background: i % 2 === 0 ? "#fff" : "#FAFAFA",
                }}
              >
                <div className="px-5 py-3.5 text-sm" style={{ color: "#404049" }}>
                  {row.feature}
                </div>
                {[row.dclaw, row.calendly, row.google].map((v, j) => (
                  <div key={j} className="px-5 py-3.5 flex items-center justify-center">
                    {v ? (
                      <CheckCircle2
                        className="w-5 h-5"
                        style={{ color: j === 0 ? "#7660A8" : "#10B981" }}
                      />
                    ) : (
                      <span className="text-lg" style={{ color: "#D6D6D6" }}>—</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────── */}
      <section
        className="py-24 px-6"
        style={{ background: "linear-gradient(135deg, #7660A8 0%, #5C4A8E 100%)" }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}
          >
            <Zap className="w-3.5 h-3.5" />
            Free to get started
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-5 tracking-tight">
            Take back control of your time
          </h2>
          <p className="text-lg text-white opacity-80 mb-10 max-w-xl mx-auto leading-relaxed">
            Join thousands of teams who schedule smarter with DClaw Calendar.
            No credit card required — start optimizing your calendar today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold transition-all hover:opacity-90"
              style={{ background: "#fff", color: "#7660A8" }}
            >
              Get started free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold border-2 border-white text-white transition-all hover:bg-white hover:text-purple-700"
            >
              Open dashboard
            </Link>
          </div>
          <p className="text-xs mt-6 text-white opacity-50">
            No credit card · Unlimited calendars · Cancel anytime
          </p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t py-10 px-6" style={{ borderColor: "#E8E8EC", background: "#fff" }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "#7660A8" }}
              >
                <Calendar className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-sm" style={{ color: "#0F0F12" }}>DClaw Calendar</span>
              <span className="text-sm" style={{ color: "#D6D6D6" }}>·</span>
              <span className="text-xs" style={{ color: "#7A7A85" }}>v1.3.0</span>
            </div>

            <div className="flex items-center gap-6">
              {[
                { label: "Dashboard", href: "/dashboard" },
                { label: "Calendars", href: "/calendars" },
                { label: "Events", href: "/events" },
              ].map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="text-sm hover:opacity-70 transition-opacity"
                  style={{ color: "#7A7A85" }}
                >
                  {l.label}
                </Link>
              ))}
            </div>

            <p className="text-xs" style={{ color: "#A3A3AC" }}>
              © 2026 DClaw Stack. Built on the DClaw platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
