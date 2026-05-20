"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, Calendar, Clock, MapPin, Edit2, Trash2, Plus, User, Check, X, HelpCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  getEvent, getCalendar, listAttendees, createAttendee, updateAttendee, deleteAttendee, updateEvent, deleteEvent,
  type CalendarEvent, type Calendar as Cal, type Attendee,
} from "@/lib/api"
import { useRouter } from "next/navigation"

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  })
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; bg: string; color: string }> = {
  pending: { label: "Pending", icon: HelpCircle, bg: "var(--dk-warning-bg)", color: "var(--dk-warning)" },
  accepted: { label: "Accepted", icon: Check, bg: "var(--dk-success-bg)", color: "var(--dk-success)" },
  declined: { label: "Declined", icon: X, bg: "var(--dk-danger-bg)", color: "var(--dk-danger)" },
  tentative: { label: "Tentative", icon: HelpCircle, bg: "var(--dk-info-bg)", color: "var(--dk-info)" },
}

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [event, setEvent] = useState<CalendarEvent | null>(null)
  const [calendar, setCalendar] = useState<Cal | null>(null)
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [loading, setLoading] = useState(true)

  const [showAddAttendee, setShowAddAttendee] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [newName, setNewName] = useState("")
  const [addingAttendee, setAddingAttendee] = useState(false)

  const [editingTitle, setEditingTitle] = useState(false)
  const [editTitle, setEditTitle] = useState("")

  const [showDeleteEvent, setShowDeleteEvent] = useState(false)

  async function load() {
    try {
      const evt = await getEvent(eventId)
      setEvent(evt)
      setEditTitle(evt.title)
      const [cal, atts] = await Promise.all([
        getCalendar(evt.calendar_id),
        listAttendees({ event_id: eventId }),
      ])
      setCalendar(cal)
      setAttendees(atts)
    } catch {
      router.push("/events")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [eventId])

  async function handleAddAttendee() {
    if (!newEmail.trim()) return
    setAddingAttendee(true)
    try {
      await createAttendee({ event_id: eventId, email: newEmail.trim(), name: newName.trim() || undefined })
      setNewEmail("")
      setNewName("")
      setShowAddAttendee(false)
      const atts = await listAttendees({ event_id: eventId })
      setAttendees(atts)
    } finally {
      setAddingAttendee(false)
    }
  }

  async function handleUpdateStatus(attendeeId: string, status: Attendee["status"]) {
    await updateAttendee(attendeeId, { status })
    const atts = await listAttendees({ event_id: eventId })
    setAttendees(atts)
  }

  async function handleRemoveAttendee(attendeeId: string) {
    await deleteAttendee(attendeeId)
    const atts = await listAttendees({ event_id: eventId })
    setAttendees(atts)
  }

  async function handleSaveTitle() {
    if (!editTitle.trim()) return
    await updateEvent(eventId, { title: editTitle.trim() })
    setEditingTitle(false)
    const evt = await getEvent(eventId)
    setEvent(evt)
  }

  async function handleDeleteEvent() {
    await deleteEvent(eventId)
    router.push("/events")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--dk-bg-muted)" }}>
        <p style={{ color: "var(--dk-fg-2)" }}>Loading…</p>
      </div>
    )
  }

  if (!event) return null

  const acceptedCount = attendees.filter((a) => a.status === "accepted").length
  const declinedCount = attendees.filter((a) => a.status === "declined").length
  const pendingCount = attendees.filter((a) => a.status === "pending" || a.status === "tentative").length

  return (
    <div className="min-h-screen" style={{ background: "var(--dk-bg-muted)" }}>
      <nav className="border-b bg-white px-6 py-4" style={{ borderColor: "var(--dk-border)" }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/events" className="flex items-center gap-1 text-sm hover:opacity-70" style={{ color: "var(--dk-fg-2)" }}>
              <ArrowLeft className="w-4 h-4" /> Events
            </Link>
            <span style={{ color: "var(--dk-gray-300)" }}>/</span>
            <span className="text-sm font-semibold truncate max-w-xs" style={{ color: "var(--dk-ink)" }}>
              {event.title}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteEvent(true)}
            style={{ color: "var(--dk-danger)" }}
          >
            <Trash2 className="w-4 h-4 mr-1" /> Delete
          </Button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Event details */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border" style={{ borderColor: "var(--dk-border)", borderRadius: "var(--dk-radius-lg)" }}>
              <CardContent className="p-6">
                {editingTitle ? (
                  <div className="flex gap-2 mb-4">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="text-lg font-bold"
                      autoFocus
                      onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
                    />
                    <Button size="sm" onClick={handleSaveTitle} style={{ background: "var(--dk-brand)", color: "white" }}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingTitle(false)}>Cancel</Button>
                  </div>
                ) : (
                  <div className="flex items-start justify-between mb-4">
                    <h1 className="text-2xl font-bold" style={{ color: "var(--dk-ink)" }}>{event.title}</h1>
                    <Button variant="ghost" size="icon" onClick={() => setEditingTitle(true)} style={{ color: "var(--dk-fg-2)" }}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--dk-brand)" }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--dk-ink)" }}>
                        {formatDateTime(event.start_time)}
                      </p>
                      <p className="text-xs" style={{ color: "var(--dk-fg-2)" }}>
                        to {formatDateTime(event.end_time)}
                      </p>
                    </div>
                  </div>

                  {calendar && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: "var(--dk-brand)" }} />
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: calendar.color ?? "var(--dk-brand)" }} />
                        <span className="text-sm" style={{ color: "var(--dk-fg-1)" }}>{calendar.name}</span>
                      </div>
                    </div>
                  )}

                  {event.location && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: "var(--dk-brand)" }} />
                      <span className="text-sm" style={{ color: "var(--dk-fg-1)" }}>{event.location}</span>
                    </div>
                  )}

                  {event.timezone !== "UTC" && (
                    <p className="text-xs" style={{ color: "var(--dk-fg-2)" }}>Timezone: {event.timezone}</p>
                  )}

                  {event.description && (
                    <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--dk-border)" }}>
                      <p className="text-sm" style={{ color: "var(--dk-fg-1)" }}>{event.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attendees */}
          <div>
            <Card className="border" style={{ borderColor: "var(--dk-border)", borderRadius: "var(--dk-radius-lg)" }}>
              <CardHeader className="px-6 pt-6 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold" style={{ color: "var(--dk-ink)" }}>
                    Attendees ({attendees.length})
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowAddAttendee(true)}
                    style={{ color: "var(--dk-brand)" }}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
                {attendees.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--dk-success-bg)", color: "var(--dk-success)" }}>
                      {acceptedCount} accepted
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--dk-warning-bg)", color: "var(--dk-warning)" }}>
                      {pendingCount} pending
                    </span>
                    {declinedCount > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--dk-danger-bg)", color: "var(--dk-danger)" }}>
                        {declinedCount} declined
                      </span>
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent className="px-6 pb-6">
                {attendees.length === 0 ? (
                  <div className="text-center py-6">
                    <User className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--dk-gray-300)" }} />
                    <p className="text-xs" style={{ color: "var(--dk-fg-2)" }}>No attendees yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {attendees.map((att) => {
                      const cfg = STATUS_CONFIG[att.status]
                      const Icon = cfg.icon
                      return (
                        <div key={att.id} className="flex items-center gap-2 group">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold"
                            style={{ background: "var(--dk-brand-soft)", color: "var(--dk-brand)" }}
                          >
                            {(att.name ?? att.email)[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate" style={{ color: "var(--dk-ink)" }}>
                              {att.name ?? att.email}
                            </p>
                            {att.name && (
                              <p className="text-xs truncate" style={{ color: "var(--dk-fg-2)" }}>{att.email}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <span
                              className="text-xs px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
                              style={{ background: cfg.bg, color: cfg.color }}
                            >
                              <Icon className="w-2.5 h-2.5" />
                              {cfg.label}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 h-6 w-6 transition-opacity"
                              onClick={() => handleRemoveAttendee(att.id)}
                              style={{ color: "var(--dk-danger)" }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Add attendee dialog */}
      <Dialog open={showAddAttendee} onOpenChange={setShowAddAttendee}>
        <DialogContent style={{ borderRadius: "var(--dk-radius-lg)" }}>
          <DialogHeader>
            <DialogTitle style={{ color: "var(--dk-ink)" }}>Add Attendee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium" style={{ color: "var(--dk-fg-1)" }}>Email *</Label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="attendee@example.com"
                className="mt-1"
                autoFocus
              />
            </div>
            <div>
              <Label className="text-sm font-medium" style={{ color: "var(--dk-fg-1)" }}>Name (optional)</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Full name"
                className="mt-1"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                onClick={handleAddAttendee}
                disabled={!newEmail.trim() || addingAttendee}
                className="rounded-dk-pill text-white"
                style={{ background: "var(--dk-brand)" }}
              >
                {addingAttendee ? "Adding…" : "Add Attendee"}
              </Button>
              <Button variant="outline" onClick={() => setShowAddAttendee(false)} style={{ borderColor: "var(--dk-border-strong)" }}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete event dialog */}
      <Dialog open={showDeleteEvent} onOpenChange={setShowDeleteEvent}>
        <DialogContent style={{ borderRadius: "var(--dk-radius-lg)" }}>
          <DialogHeader>
            <DialogTitle style={{ color: "var(--dk-ink)" }}>Delete Event</DialogTitle>
          </DialogHeader>
          <p className="text-sm" style={{ color: "var(--dk-fg-1)" }}>
            Delete <strong>{event.title}</strong>? All attendees will be removed.
          </p>
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleDeleteEvent}
              className="rounded-dk-pill text-white"
              style={{ background: "var(--dk-danger)" }}
            >
              Delete Event
            </Button>
            <Button variant="outline" onClick={() => setShowDeleteEvent(false)} style={{ borderColor: "var(--dk-border-strong)" }}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
