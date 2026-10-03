import React from 'react'

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-gray-200/80 ${className}`} aria-hidden="true" />
}

/** Full-page placeholder shown while the authentication session is restored. */
export function AuthLoadingSkeleton() {
  return (
    <main
      className="min-h-screen bg-gray-50"
      role="status"
      aria-label="Loading your session"
    >
      <div className="flex min-h-screen">
        <aside className="hidden w-64 border-r border-gray-200 bg-white p-5 md:block">
          <SkeletonBlock className="mb-10 h-9 w-36" />
          <div className="space-y-4">
            <SkeletonBlock className="h-10 w-full" />
            <SkeletonBlock className="h-10 w-full" />
            <SkeletonBlock className="h-10 w-full" />
            <SkeletonBlock className="h-10 w-full" />
          </div>
        </aside>

        <section className="flex-1 p-5 sm:p-8">
          <div className="mb-8 flex items-center justify-between">
            <div className="space-y-3">
              <SkeletonBlock className="h-8 w-56" />
              <SkeletonBlock className="h-4 w-72 max-w-[70vw]" />
            </div>
            <SkeletonBlock className="h-10 w-10 rounded-full" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <SkeletonBlock className="h-28 w-full rounded-xl" />
            <SkeletonBlock className="h-28 w-full rounded-xl" />
            <SkeletonBlock className="h-28 w-full rounded-xl" />
            <SkeletonBlock className="h-28 w-full rounded-xl" />
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            <SkeletonBlock className="h-72 w-full rounded-xl lg:col-span-2" />
            <SkeletonBlock className="h-72 w-full rounded-xl" />
          </div>
        </section>
      </div>
      <span className="sr-only">Restoring your session…</span>
    </main>
  )
}

