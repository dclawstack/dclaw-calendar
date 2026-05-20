"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Calendar, Clock, Users, CalendarDays, Plus, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { listCalendars, listEvents, listAttendees, type CalendarEvent } from "@/lib/api"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

function isToday(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  )
}

function isThisWeek(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = d.getTime() - now.getTime()
  return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [calendarCount, setCalendarCount] = useState(0)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [attendeeCount, setAttendeeCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [cals, evts, atts] = await Promise.all([
          listCalendars(),
          listEvents(),
          listAttendees(),
        ])
        setCalendarCount(cals.length)
        setEvents(evts)
        setAttendeeCount(atts.length)
      } catch {
        // silently degrade — API may not be running in build
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const todayEvents = events.filter((e) => isToday(e.start_time))
  const upcomingEvents = events.filter((e) => isThisWeek(e.start_time)).slice(0, 5)

  const stats = [
    {
      label: "Calendars",
      value: calendarCount,
      icon: Calendar,
      color: "text-dk-purple-700",
      bg: "bg-dk-purple-50",
      href: "/calendars",
    },
    {
      label: "Today's Events",
      value: todayEvents.length,
      icon: Clock,
      color: "text-cal-green",
      bg: "bg-green-50",
      href: "/events",
    },
    {
      label: "This Week",
      value: upcomingEvents.length,
      icon: CalendarDays,
      color: "text-dk-info",
      bg: "bg-dk-info-bg",
      href: "/events",
    },
    {
      label: "Total Attendees",
      value: attendeeCount,
      icon: Users,
      color: "text-dk-warning",
      bg: "bg-dk-warning-bg",
      href: "/events",
    },
  ]

  return (
    <div className="min-h-screen" style={{ background: "var(--dk-bg-muted)" }}>
      {/* Navbar */}
      <nav
        className="border-b bg-white px-6 py-4"
        style={{ borderColor: "var(--dk-border)" }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-dk-sm flex items-center justify-center"
              style={{ background: "var(--dk-brand)" }}
            >
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg" style={{ color: "var(--dk-ink)" }}>
              DClaw Calendar
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/calendars"
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: "var(--dk-fg-2)" }}
            >
              Calendars
            </Link>
            <Link
              href="/events"
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: "var(--dk-fg-2)" }}
            >
              Events
            </Link>
            <Link href="/events">
              <Button
                size="sm"
                className="rounded-dk-pill text-white"
                style={{ background: "var(--dk-brand)" }}
              >
                <Plus className="w-4 h-4 mr-1" />
                New Event
              </Button>
            </Link>
            {session?.user && (
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: "var(--dk-purple-500)" }}
                  title={session.user.email ?? ""}
                >
                  {(session.user.name ?? session.user.email ?? "?")[0].toUpperCase()}
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="text-sm font-medium hover:opacity-80 transition-opacity"
                  style={{ color: "var(--dk-fg-2)", background: "none", border: "none", cursor: "pointer" }}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--dk-brand)" }}>
            Dashboard
          </p>
          <h1 className="text-3xl font-bold" style={{ color: "var(--dk-ink)" }}>
            Good{" "}
            {new Date().getHours() < 12
              ? "morning"
              : new Date().getHours() < 17
              ? "afternoon"
              : "evening"}
            {session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}{" "}
            👋
          </h1>
          <p className="mt-1" style={{ color: "var(--dk-fg-2)" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href}>
              <Card
                className="hover:shadow-dk-md transition-shadow cursor-pointer border"
                style={{ borderColor: "var(--dk-border)", borderRadius: "var(--dk-radius-lg)" }}
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium" style={{ color: "var(--dk-fg-2)" }}>
                      {stat.label}
                    </span>
                    <div className={`w-8 h-8 rounded-dk-sm flex items-center justify-center ${stat.bg}`}>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="text-3xl font-bold" style={{ color: "var(--dk-ink)" }}>
                    {loading ? "—" : stat.value}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Upcoming events */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card
              className="border"
              style={{ borderColor: "var(--dk-border)", borderRadius: "var(--dk-radius-lg)" }}
            >
              <CardHeader className="px-6 pt-6 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold" style={{ color: "var(--dk-ink)" }}>
                    Upcoming Events
                  </CardTitle>
                  <Link
                    href="/events"
                    className="flex items-center gap-1 text-sm font-medium hover:opacity-80"
                    style={{ color: "var(--dk-brand)" }}
                  >
                    View all <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                {loading ? (
                  <p className="text-sm text-center py-8" style={{ color: "var(--dk-fg-2)" }}>
                    Loading…
                  </p>
                ) : upcomingEvents.length === 0 ? (
                  <div className="text-center py-10">
                    <CalendarDays className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--dk-gray-300)" }} />
                    <p className="text-sm font-medium" style={{ color: "var(--dk-fg-2)" }}>
                      No upcoming events this week
                    </p>
                    <Link href="/events">
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-4"
                        style={{ borderColor: "var(--dk-border-strong)" }}
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Create your first event
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <Link key={event.id} href={`/events/${event.id}`}>
                        <div
                          className="flex items-start gap-4 p-3 rounded-dk-md hover:bg-dk-purple-50 transition-colors cursor-pointer"
                          style={{ borderRadius: "var(--dk-radius-md)" }}
                        >
                          <div
                            className="w-1 rounded-full self-stretch flex-shrink-0"
                            style={{ background: "var(--dk-brand)", minHeight: "40px" }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate" style={{ color: "var(--dk-ink)" }}>
                              {event.title}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: "var(--dk-fg-2)" }}>
                              {formatDate(event.start_time)} · {formatTime(event.start_time)} – {formatTime(event.end_time)}
                            </p>
                            {event.location && (
                              <p className="text-xs mt-0.5 truncate" style={{ color: "var(--dk-fg-2)" }}>
                                📍 {event.location}
                              </p>
                            )}
                          </div>
                          {isToday(event.start_time) && (
                            <Badge
                              className="text-xs flex-shrink-0"
                              style={{ background: "var(--dk-brand-soft)", color: "var(--dk-brand)" }}
                            >
                              Today
                            </Badge>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick actions */}
          <div>
            <Card
              className="border"
              style={{ borderColor: "var(--dk-border)", borderRadius: "var(--dk-radius-lg)" }}
            >
              <CardHeader className="px-6 pt-6 pb-4">
                <CardTitle className="text-base font-semibold" style={{ color: "var(--dk-ink)" }}>
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-3">
                <Link href="/events" className="block">
                  <Button
                    className="w-full justify-start gap-3 rounded-dk-md"
                    style={{
                      background: "var(--dk-brand)",
                      color: "var(--dk-fg-on-brand)",
                      borderRadius: "var(--dk-radius-md)",
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Create Event
                  </Button>
                </Link>
                <Link href="/calendars" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3 rounded-dk-md"
                    style={{ borderColor: "var(--dk-border-strong)", borderRadius: "var(--dk-radius-md)" }}
                  >
                    <Calendar className="w-4 h-4" style={{ color: "var(--dk-brand)" }} />
                    Manage Calendars
                  </Button>
                </Link>
                <Link href="/events" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3 rounded-dk-md"
                    style={{ borderColor: "var(--dk-border-strong)", borderRadius: "var(--dk-radius-md)" }}
                  >
                    <Users className="w-4 h-4" style={{ color: "var(--dk-brand)" }} />
                    View All Events
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
