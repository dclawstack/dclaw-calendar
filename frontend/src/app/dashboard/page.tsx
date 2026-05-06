"use client";

import React, { useState } from "react";
import { Calendar } from "lucide-react";

export default function DashboardPage() {
  const [eventTitle, setEventTitle] = useState("");
  const [duration, setDuration] = useState("60");
  const [results, setResults] = useState<{
    suggestedSlots: string[];
    conflicts: string[];
    attendeeAvailability: string;
  } | null>(null);

  const handleFindBestTime = () => {
    setResults({
      suggestedSlots: [
        "2026-05-07T10:00:00Z — 2026-05-07T11:00:00Z",
        "2026-05-07T14:00:00Z — 2026-05-07T15:00:00Z",
        "2026-05-08T09:00:00Z — 2026-05-08T10:00:00Z",
      ],
      conflicts: ["Existing meeting at 10:00"],
      attendeeAvailability: "3/4 available",
    });
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center gap-3">
          <Calendar className="h-8 w-8 text-[#F97316]" />
          <h1 className="text-2xl font-bold text-gray-900">Calendar Dashboard</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Schedule Event
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Event title
                </label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Team Standup"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#F97316] focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#F97316] focus:outline-none focus:ring-1 focus:ring-[#F97316]"
                >
                  <option value="30">30 min</option>
                  <option value="60">1 hr</option>
                  <option value="120">2 hr</option>
                </select>
              </div>
              <button
                onClick={handleFindBestTime}
                className="inline-flex w-full justify-center rounded-lg bg-[#F97316] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
              >
                Find Best Time
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Results
            </h2>
            {results ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Suggested slots</p>
                  <ul className="mt-1 list-inside list-disc text-sm text-gray-700">
                    {results.suggestedSlots.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Conflicts</p>
                  <ul className="mt-1 list-inside list-disc text-sm text-gray-700">
                    {results.conflicts.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Attendee availability</p>
                  <p className="text-lg font-semibold text-[#F97316]">
                    {results.attendeeAvailability}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Enter event details and click Find Best Time to see results.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
