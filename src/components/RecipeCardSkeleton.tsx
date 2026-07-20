export default function RecipeCardSkeleton() {
  return (
    <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-slate-700 px-6 sm:px-8 py-6">
        <div className="h-8 bg-slate-600 rounded-lg w-2/3 mb-3"></div>
        <div className="h-4 bg-slate-600 rounded w-full mb-2"></div>
        <div className="h-4 bg-slate-600 rounded w-4/5"></div>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* Quick Info Grid Skeleton */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-700/50 rounded-xl p-4 h-24"></div>
          <div className="bg-slate-700/50 rounded-xl p-4 h-24"></div>
        </div>

        {/* Ingredients Skeleton */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-slate-700 rounded-lg"></div>
            <div className="h-6 bg-slate-700 rounded w-32"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-10 bg-slate-700/50 rounded-lg"></div>
            ))}
          </div>
        </div>

        {/* Instructions Skeleton */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-slate-700 rounded-lg"></div>
            <div className="h-6 bg-slate-700 rounded w-32"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="w-7 h-7 bg-slate-700 rounded-full flex-shrink-0"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-slate-700 rounded w-full"></div>
                  <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nutrition Skeleton (Optional, but good for skeleton) */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-slate-700 rounded-lg"></div>
            <div className="h-6 bg-slate-700 rounded w-48"></div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-slate-700/50 rounded-xl p-3 h-16"></div>
            ))}
          </div>
        </div>

        {/* Buttons Skeleton */}
        <div className="flex gap-3 pt-2">
          <div className="h-12 bg-slate-700 rounded-xl flex-1"></div>
        </div>
      </div>
    </div>
  );
}

export function RecipeListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-5 bg-slate-800 rounded w-32 animate-pulse"></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-800 rounded-2xl shadow-md border border-slate-700 p-5 animate-pulse">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="h-6 bg-slate-700 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-slate-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-slate-700 rounded w-2/3 mb-4"></div>
                <div className="flex gap-3">
                  <div className="h-6 bg-slate-700 rounded-full w-20"></div>
                  <div className="h-6 bg-slate-700 rounded-full w-24"></div>
                </div>
              </div>
              <div className="w-8 h-8 bg-slate-700 rounded-lg flex-shrink-0"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MealPlanListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-5 bg-slate-800 rounded w-32 animate-pulse"></div>
      <div className="grid grid-cols-1 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-slate-800 rounded-2xl shadow-md border border-slate-700 p-5 animate-pulse">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-slate-700 rounded-md"></div>
                  <div className="h-6 bg-slate-700 rounded w-1/3"></div>
                </div>
                <div className="flex gap-3">
                  <div className="h-6 bg-slate-700 rounded-full w-24"></div>
                </div>
              </div>
              <div className="w-8 h-8 bg-slate-700 rounded-lg flex-shrink-0"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MealPlanCalendarSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border-2 border-slate-700 bg-slate-800 overflow-hidden animate-pulse">
            {/* Header */}
            <div className="bg-slate-700 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-slate-600 rounded-md"></div>
                <div className="w-16 h-4 bg-slate-600 rounded"></div>
              </div>
              <div className="w-12 h-3 bg-slate-600 rounded"></div>
            </div>
            {/* Content */}
            <div className="p-4 space-y-4">
              <div className="w-3/4 h-5 bg-slate-700 rounded"></div>
              <div className="space-y-2">
                <div className="w-full h-4 bg-slate-700 rounded"></div>
                <div className="w-5/6 h-4 bg-slate-700 rounded"></div>
                <div className="w-2/3 h-4 bg-slate-700 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
