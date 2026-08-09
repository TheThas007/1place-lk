export default function Loading() {
  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2 mb-8 animate-pulse">
          <div className="h-4 w-16 bg-zinc-800 rounded-md" />
          <span className="text-zinc-700">/</span>
          <div className="h-4 w-24 bg-zinc-800 rounded-md" />
          <span className="text-zinc-700">/</span>
          <div className="h-4 w-32 bg-zinc-800 rounded-md" />
        </div>

        {/* Product Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          
          {/* Left Gallery Skeleton */}
          <div className="space-y-4">
            <div className="aspect-square bg-zinc-900 rounded-3xl border border-zinc-800 animate-pulse" />
            <div className="flex gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-20 h-20 bg-zinc-900 rounded-2xl border border-zinc-800 animate-pulse" />
              ))}
            </div>
          </div>

          {/* Right Product Details Skeleton */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="h-4 w-28 bg-zinc-800 rounded-md animate-pulse" />
              <div className="h-10 w-3/4 bg-zinc-900 rounded-xl animate-pulse" />
              <div className="h-8 w-44 bg-zinc-800 rounded-xl animate-pulse" />
              <div className="h-20 w-full bg-zinc-900/60 rounded-2xl border border-zinc-800 animate-pulse" />
            </div>

            {/* Storage & Color Options Skeleton */}
            <div className="space-y-4 pt-4 border-t border-zinc-800/80">
              <div className="h-4 w-32 bg-zinc-800 rounded-md animate-pulse" />
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 w-24 bg-zinc-900 rounded-xl border border-zinc-800 animate-pulse" />
                ))}
              </div>
            </div>

            {/* Action Button Skeleton */}
            <div className="space-y-3 pt-4">
              <div className="h-14 w-full bg-zinc-800 rounded-2xl animate-pulse" />
              <div className="h-14 w-full bg-zinc-900 border border-zinc-800 rounded-2xl animate-pulse" />
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
