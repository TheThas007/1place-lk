export default function Loading() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        
        {/* Search bar skeleton */}
        <div className="max-w-2xl mx-auto mb-10 h-14 bg-gray-100 rounded-full animate-pulse" />

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Skeleton */}
          <aside className="hidden lg:block w-64 space-y-6">
            <div className="h-6 w-32 bg-gray-100 rounded-md animate-pulse" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-8 w-full bg-gray-50 rounded-xl animate-pulse" />
              ))}
            </div>
          </aside>

          {/* Grid Skeleton */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-[22px] overflow-hidden shadow-sm flex flex-col justify-between h-96">
                <div className="aspect-square bg-[#F7F7F7] animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-3 w-16 bg-gray-100 rounded-md animate-pulse" />
                  <div className="h-5 w-3/4 bg-gray-200 rounded-md animate-pulse" />
                  <div className="h-4 w-20 bg-gray-100 rounded-md animate-pulse" />
                  <div className="h-10 w-full bg-gray-900/10 rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
