import Link from "next/link";
import { Calendar } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-6 text-center">
        <Calendar className="h-16 w-16 text-[#F97316]" />
        <h1 className="text-4xl font-bold tracking-tight text-[#F97316]">
          DClaw Calendar
        </h1>
        <p className="text-lg text-gray-600">
          AI scheduling &amp; conflict resolution
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center rounded-lg bg-[#F97316] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
        >
          Open Dashboard
        </Link>
      </div>
    </main>
  );
}
