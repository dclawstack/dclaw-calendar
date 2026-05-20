"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Calendar, Plus, Edit2, Trash2, ArrowLeft, Check } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  listCalendars,
  createCalendar,
  updateCalendar,
  deleteCalendar,
  type Calendar as Cal,
} from "@/lib/api"

const PRESET_COLORS = [
  "#7660A8", "#10B981", "#2C6CB0", "#C28A00",
  "#B3261E", "#2E8B57", "#5A5A66", "#D6D6D6",
]

function CalendarForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<Cal>
  onSave: (name: string, color: string, is_default: boolean) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(initial?.name ?? "")
  const [color, setColor] = useState(initial?.color ?? "#7660A8")
  const [isDefault, setIsDefault] = useState(initial?.is_default ?? false)

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="cal-name" className="text-sm font-medium" style={{ color: "var(--dk-fg-1)" }}>
          Calendar Name *
        </Label>
        <Input
          id="cal-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Work, Personal, Gym"
          className="mt-1"
          style={{ borderColor: "var(--dk-border)" }}
        />
      </div>
      <div>
        <Label className="text-sm font-medium block mb-2" style={{ color: "var(--dk-fg-1)" }}>
          Color
        </Label>
        <div className="flex items-center gap-2 flex-wrap">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-7 h-7 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110"
              style={{
                background: c,
                borderColor: color === c ? "var(--dk-ink)" : "transparent",
              }}
            >
              {color === c && <Check className="w-3.5 h-3.5 text-white" />}
            </button>
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-7 h-7 rounded-full cursor-pointer border-0 p-0"
            title="Custom color"
          />
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
          className="rounded"
          style={{ accentColor: "var(--dk-brand)" }}
        />
        <span className="text-sm" style={{ color: "var(--dk-fg-1)" }}>Set as default calendar</span>
      </label>
      <div className="flex gap-2 pt-2">
        <Button
          onClick={() => name.trim() && onSave(name.trim(), color, isDefault)}
          disabled={!name.trim()}
          className="rounded-dk-pill text-white"
          style={{ background: "var(--dk-brand)" }}
        >
          Save Calendar
        </Button>
        <Button variant="outline" onClick={onCancel} style={{ borderColor: "var(--dk-border-strong)" }}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

export default function CalendarsPage() {
  const [calendars, setCalendars] = useState<Cal[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState<Cal | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Cal | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function load() {
    try {
      setCalendars(await listCalendars())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleCreate(name: string, color: string, is_default: boolean) {
    await createCalendar({ name, color, is_default })
    setShowCreate(false)
    load()
  }

  async function handleUpdate(name: string, color: string, is_default: boolean) {
    if (!editTarget) return
    await updateCalendar(editTarget.id, { name, color, is_default })
    setEditTarget(null)
    load()
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteCalendar(deleteTarget.id)
      setDeleteTarget(null)
      load()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--dk-bg-muted)" }}>
      <nav className="border-b bg-white px-6 py-4" style={{ borderColor: "var(--dk-border)" }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1 text-sm hover:opacity-70 transition-opacity" style={{ color: "var(--dk-fg-2)" }}>
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Link>
            <span style={{ color: "var(--dk-gray-300)" }}>/</span>
            <span className="text-sm font-semibold" style={{ color: "var(--dk-ink)" }}>Calendars</span>
          </div>
          <Button
            size="sm"
            onClick={() => setShowCreate(true)}
            className="rounded-dk-pill text-white"
            style={{ background: "var(--dk-brand)" }}
          >
            <Plus className="w-4 h-4 mr-1" /> New Calendar
          </Button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: "var(--dk-ink)" }}>Calendars</h1>
          <p className="text-sm mt-1" style={{ color: "var(--dk-fg-2)" }}>
            {calendars.length} calendar{calendars.length !== 1 ? "s" : ""}
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-center py-16" style={{ color: "var(--dk-fg-2)" }}>Loading…</p>
        ) : calendars.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--dk-gray-300)" }} />
            <p className="font-medium" style={{ color: "var(--dk-fg-2)" }}>No calendars yet</p>
            <Button
              onClick={() => setShowCreate(true)}
              className="mt-4 rounded-dk-pill text-white"
              style={{ background: "var(--dk-brand)" }}
            >
              <Plus className="w-4 h-4 mr-1" /> Create your first calendar
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {calendars.map((cal) => (
              <Card
                key={cal.id}
                className="border hover:shadow-dk-sm transition-shadow"
                style={{ borderColor: "var(--dk-border)", borderRadius: "var(--dk-radius-lg)" }}
              >
                <CardContent className="p-5 flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex-shrink-0"
                    style={{ background: cal.color ?? "var(--dk-brand)" }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm" style={{ color: "var(--dk-ink)" }}>
                        {cal.name}
                      </p>
                      {cal.is_default && (
                        <Badge
                          className="text-xs"
                          style={{ background: "var(--dk-brand-soft)", color: "var(--dk-brand)" }}
                        >
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "var(--dk-fg-2)" }}>
                      Created {new Date(cal.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/events?calendar_id=${cal.id}`}>
                      <Button variant="ghost" size="sm" style={{ color: "var(--dk-fg-2)" }}>
                        View Events
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditTarget(cal)}
                      style={{ color: "var(--dk-fg-2)" }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTarget(cal)}
                      style={{ color: "var(--dk-danger)" }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent style={{ borderRadius: "var(--dk-radius-lg)" }}>
          <DialogHeader>
            <DialogTitle style={{ color: "var(--dk-ink)" }}>New Calendar</DialogTitle>
          </DialogHeader>
          <CalendarForm onSave={handleCreate} onCancel={() => setShowCreate(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <DialogContent style={{ borderRadius: "var(--dk-radius-lg)" }}>
          <DialogHeader>
            <DialogTitle style={{ color: "var(--dk-ink)" }}>Edit Calendar</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <CalendarForm
              initial={editTarget}
              onSave={handleUpdate}
              onCancel={() => setEditTarget(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent style={{ borderRadius: "var(--dk-radius-lg)" }}>
          <DialogHeader>
            <DialogTitle style={{ color: "var(--dk-ink)" }}>Delete Calendar</DialogTitle>
          </DialogHeader>
          <p className="text-sm" style={{ color: "var(--dk-fg-1)" }}>
            Delete <strong>{deleteTarget?.name}</strong>? All events in this calendar will be permanently removed.
          </p>
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-dk-pill text-white"
              style={{ background: "var(--dk-danger)" }}
            >
              {deleting ? "Deleting…" : "Delete Calendar"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              style={{ borderColor: "var(--dk-border-strong)" }}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
