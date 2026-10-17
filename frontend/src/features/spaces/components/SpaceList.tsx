import { formatSpaceRate, getSpaceTypeLabel } from '../types'
import { useSpaces } from '../hooks/useSpaces'

export function SpaceList() {
  const { spaces, isLoading, error, refetch } = useSpaces()

  if (isLoading) {
    return (
      <div
        className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white/70 px-4 py-6 text-stone-600"
        role="status"
        aria-live="polite"
      >
        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-r-transparent" />
        Loading spaces...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-5 text-red-800">
        <p className="font-medium">Could not load spaces</p>
        <p className="mt-1 text-sm">{error}</p>
        <button
          type="button"
          onClick={refetch}
          className="mt-3 rounded-md bg-red-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-800"
        >
          Try again
        </button>
      </div>
    )
  }

  if (spaces.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-stone-300 bg-white/60 px-4 py-8 text-center text-stone-600">
        No spaces found. Create one via the API, then refresh this page.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {spaces.map((space) => (
        <article
          key={space.id}
          className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-brand-500/40 hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-semibold text-stone-900">{space.name}</h2>
            <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
              {getSpaceTypeLabel(space.type)}
            </span>
          </div>

          <p className="text-sm text-stone-500">Code: {space.code}</p>

          {space.description ? (
            <p className="line-clamp-2 text-sm text-stone-600">{space.description}</p>
          ) : null}

          <div className="mt-auto border-t border-stone-100 pt-3">
            <p className="text-xs uppercase tracking-wide text-stone-400">Rate</p>
            <p className="text-base font-semibold text-brand-700">
              {formatSpaceRate(space)}
            </p>
          </div>

          {!space.isActive ? (
            <p className="text-xs font-medium text-amber-700">Inactive</p>
          ) : null}
        </article>
      ))}
    </div>
  )
}
