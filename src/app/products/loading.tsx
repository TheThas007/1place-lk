export default function Loading() {
  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header Skeleton */}
      <section className="bg-white border-b border-neutral-100 pt-7 pb-6">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 space-y-4">
          <div className="space-y-2">
            <div className="h-3 w-32 bg-neutral-200 rounded animate-pulse" />
            <div className="h-8 w-48 bg-neutral-200 rounded-lg animate-pulse" />
            <div className="h-4 w-96 max-w-full bg-neutral-100 rounded animate-pulse" />
          </div>

          {/* Search Bar Skeleton */}
          <div className="max-w-3xl mx-auto h-13 sm:h-14 bg-neutral-100 rounded-2xl animate-pulse" />

          {/* Category Chips Skeleton */}
          <div className="flex items-center gap-2 overflow-hidden py-1">
            {[80, 110, 140, 120, 90, 100, 95, 85, 105, 100].map((width, i) => (
              <div
                key={i}
                style={{ width: `${width}px` }}
                className="h-9 bg-neutral-100 rounded-full shrink-0 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Main Catalog Skeleton */}
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6 sm:py-8">
        {/* Results Toolbar Skeleton */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-100">
          <div className="h-5 w-28 bg-neutral-200 rounded animate-pulse" />
          <div className="h-9 w-36 bg-neutral-100 rounded-xl animate-pulse" />
        </div>

        {/* Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar Skeleton */}
          <aside className="hidden lg:block w-64 xl:w-72 shrink-0 space-y-6">
            <div className="p-5 border border-neutral-200/80 rounded-2xl space-y-5">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="space-y-2.5 pb-4 border-b border-neutral-100 last:border-none last:pb-0">
                  <div className="h-4 w-24 bg-neutral-200 rounded animate-pulse" />
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-full bg-neutral-100 rounded animate-pulse" />
                    <div className="h-3.5 w-4/5 bg-neutral-100 rounded animate-pulse" />
                    <div className="h-3.5 w-3/5 bg-neutral-100 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Grid Skeleton */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-white border border-neutral-200/70 rounded-2xl overflow-hidden flex flex-col justify-between h-[360px] sm:h-[400px]"
              >
                <div className="aspect-square bg-neutral-100 animate-pulse" />
                <div className="p-4 sm:p-5 space-y-2.5 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="h-2.5 w-16 bg-neutral-200 rounded animate-pulse" />
                    <div className="h-4 w-full bg-neutral-200 rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-neutral-200 rounded animate-pulse" />
                  </div>
                  <div className="pt-2 border-t border-neutral-100 space-y-2">
                    <div className="h-5 w-24 bg-neutral-200 rounded animate-pulse" />
                    <div className="h-9 w-full bg-neutral-900/10 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
