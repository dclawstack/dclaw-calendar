"use client"

import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Plus, Search, Trash2, Calendar, Clock, MapPin, ArrowLeft, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select } from "@/components/ui/select"
import {
  listEvents,
  listCalendars,
  createEvent,
  deleteEvent,
  type CalendarEvent,
  type Calendar as Cal,
} from "@/lib/api"

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  })
}

function toLocalInput(iso: string) {
  return iso ? iso.slice(0, 16) : ""
}

function EventForm({
  calendars,
  onSave,
  onCancel,
}: {
  calendars: Cal[]
  onSave: (data: {
    title: string; description: string; start_time: string; end_time: string;
    timezone: string; location: string; calendar_id: string;
  }) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [timezone] = useState("UTC")
  const [location, setLocation] = useState("")
  const [calendarId, setCalendarId] = useState(calendars[0]?.id ?? "")

  const valid = title.trim() && startTime && endTime && calendarId

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium" style={{ color: "var(--dk-fg-1)" }}>Title *</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" className="mt-1" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-sm font-medium" style={{ color: "var(--dk-fg-1)" }}>Start *</Label>
          <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label className="text-sm font-medium" style={{ color: "var(--dk-fg-1)" }}>End *</Label>
          <Input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="mt-1" />
        </div>
      </div>
      <div>
        <Label className="text-sm font-medium" style={{ color: "var(--dk-fg-1)" }}>Calendar *</Label>
        <Select value={calendarId} onChange={(e) => setCalendarId(e.target.value)} className="mt-1">
          {calendars.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
      </div>
      <div>
        <Label className="text-sm font-medium" style={{ color: "var(--dk-fg-1)" }}>Location</Label>
        <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Optional location" className="mt-1" />
      </div>
      <div>
        <Label className="text-sm font-medium" style={{ color: "var(--dk-fg-1)" }}>Description</Label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
          rows={3}
          className="mt-1 w-full rounded-md border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2"
          style={{ borderColor: "var(--dk-border)", color: "var(--dk-fg-1)", "--tw-ring-color": "var(--dk-brand)" } as React.CSSProperties}
        />
      </div>
      <div className="flex gap-2 pt-2">
        <Button
          onClick={() => valid && onSave({ title: title.trim(), description, start_time: startTime, end_time: endTime, timezone, location, calendar_id: calendarId })}
          disabled={!valid}
          className="rounded-dk-pill text-white"
          style={{ background: "var(--dk-brand)" }}
        >
          Create Event
        </Button>
        <Button variant="outline" onClick={onCancel} style={{ borderColor: "var(--dk-border-strong)" }}>Cancel</Button>
      </div>
    </div>
  )
}

function EventsContent() {
  const searchParams = useSearchParams()
  const filterCalendarId = searchParams.get("calendar_id") ?? undefined

  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [calendars, setCalendars] = useState<Cal[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<CalendarEvent | null>(null)

  async function load() {
    try {
      const [evts, cals] = await Promise.all([
        listEvents(filterCalendarId ? { calendar_id: filterCalendarId } : undefined),
        listCalendars(),
      ])
      setEvents(evts)
      setCalendars(cals)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filterCalendarId])

  const filtered = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase())
  )

  const calendarMap = Object.fromEntries(calendars.map((c) => [c.id, c]))

  async function handleCreate(data: Parameters<Parameters<typeof EventForm>[0]["onSave"]>[0]) {
    await createEvent(data)
    setShowCreate(false)
    load()
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await deleteEvent(deleteTarget.id)
    setDeleteTarget(null)
    load()
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--dk-bg-muted)" }}>
      <nav className="border-b bg-white px-6 py-4" style={{ borderColor: "var(--dk-border)" }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-1 text-sm hover:opacity-70" style={{ color: "var(--dk-fg-2)" }}>
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Link>
            <span style={{ color: "var(--dk-gray-300)" }}>/</span>
            <span className="text-sm font-semibold" style={{ color: "var(--dk-ink)" }}>Events</span>
            {filterCalendarId && calendarMap[filterCalendarId] && (
              <>
                <span style={{ color: "var(--dk-gray-300)" }}>/</span>
                <span className="text-sm" style={{ color: "var(--dk-fg-2)" }}>
                  {calendarMap[filterCalendarId].name}
                </span>
              </>
            )}
          </div>
          <Button
            size="sm"
            onClick={() => setShowCreate(true)}
            className="rounded-dk-pill text-white"
            style={{ background: "var(--dk-brand)" }}
          >
            <Plus className="w-4 h-4 mr-1" /> New Event
          </Button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--dk-ink)" }}>Events</h1>
            <p className="text-sm mt-1" style={{ color: "var(--dk-fg-2)" }}>
              {filtered.length} event{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--dk-fg-2)" }} />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events…"
              className="pl-9"
              style={{ borderColor: "var(--dk-border)" }}
            />
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-center py-16" style={{ color: "var(--dk-fg-2)" }}>Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--dk-gray-300)" }} />
            <p className="font-medium" style={{ color: "var(--dk-fg-2)" }}>
              {search ? "No events match your search" : "No events yet"}
            </p>
            {!search && (
              <Button
                onClick={() => setShowCreate(true)}
                className="mt-4 rounded-dk-pill text-white"
                style={{ background: "var(--dk-brand)" }}
              >
                <Plus className="w-4 h-4 mr-1" /> Create your first event
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((event) => {
              const cal = calendarMap[event.calendar_id]
              return (
                <Card
                  key={event.id}
                  className="border hover:shadow-dk-sm transition-shadow"
                  style={{ borderColor: "var(--dk-border)", borderRadius: "var(--dk-radius-lg)" }}
                >
                  <CardContent className="p-5 flex items-start gap-4">
                    <div
                      className="w-1 rounded-full self-stretch flex-shrink-0 mt-1"
                      style={{ background: cal?.color ?? "var(--dk-brand)", minHeight: "48px" }}
                    />
                    <div className="flex-1 min-w-0">
                      <Link href={`/events/${event.id}`}>
                        <p className="font-semibold text-sm hover:underline" style={{ color: "var(--dk-ink)" }}>
                          {event.title}
                        </p>
                      </Link>
                      <div className="flex flex-wrap gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-xs" style={{ color: "var(--dk-fg-2)" }}>
                          <Clock className="w-3 h-3" />
                          {formatDateTime(event.start_time)}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1 text-xs" style={{ color: "var(--dk-fg-2)" }}>
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </span>
                        )}
                        {cal && (
                          <span className="flex items-center gap-1 text-xs" style={{ color: "var(--dk-fg-2)" }}>
                            <Calendar className="w-3 h-3" />
                            {cal.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/events/${event.id}`}>
                        <Button variant="ghost" size="sm" style={{ color: "var(--dk-brand)" }}>
                          <Users className="w-3.5 h-3.5 mr-1" /> Attendees
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(event)}
                        style={{ color: "var(--dk-danger)" }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg" style={{ borderRadius: "var(--dk-radius-lg)" }}>
          <DialogHeader>
            <DialogTitle style={{ color: "var(--dk-ink)" }}>New Event</DialogTitle>
          </DialogHeader>
          {calendars.length === 0 ? (
            <div className="py-4 text-center">
              <p className="text-sm" style={{ color: "var(--dk-fg-2)" }}>
                You need at least one calendar before creating events.
              </p>
              <Link href="/calendars">
                <Button className="mt-3 rounded-dk-pill text-white" style={{ background: "var(--dk-brand)" }}>
                  Create a Calendar
                </Button>
              </Link>
            </div>
          ) : (
            <EventForm calendars={calendars} onSave={handleCreate} onCancel={() => setShowCreate(false)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent style={{ borderRadius: "var(--dk-radius-lg)" }}>
          <DialogHeader>
            <DialogTitle style={{ color: "var(--dk-ink)" }}>Delete Event</DialogTitle>
          </DialogHeader>
          <p className="text-sm" style={{ color: "var(--dk-fg-1)" }}>
            Delete <strong>{deleteTarget?.title}</strong>? This will also remove all attendees.
          </p>
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleDelete}
              className="rounded-dk-pill text-white"
              style={{ background: "var(--dk-danger)" }}
            >
              Delete Event
            </Button>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} style={{ borderColor: "var(--dk-border-strong)" }}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function EventsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p style={{ color: "var(--dk-fg-2)" }}>Loading…</p></div>}>
      <EventsContent />
    </Suspense>
  )
}
