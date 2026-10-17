import { useSpaces } from '../hooks/useSpaces'
import { OfficeMap } from './OfficeMap'

export function SpacesPage() {
  const { spaces, isLoading, error, refetch } = useSpaces()

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          Office map
        </h1>
        <p className="max-w-2xl text-stone-600">
          Click a desk, room, or parking spot on the floor plan to view details
          and start a reservation.
        </p>
      </div>

      {isLoading ? (
        <div
          className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white/70 px-4 py-6 text-stone-600"
          role="status"
          aria-live="polite"
        >
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-r-transparent" />
          Loading office map...
        </div>
      ) : null}

      {error ? (
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
      ) : null}

      {!isLoading && !error && spaces.length === 0 ? (
        <div className="rounded-lg border border-dashed border-stone-300 bg-white/60 px-4 py-8 text-center text-stone-600">
          No spaces found. Create spaces via the API, then refresh this page.
        </div>
      ) : null}

      {!isLoading && !error && spaces.length > 0 ? (
        <OfficeMap spaces={spaces} />
      ) : null}
    </section>
  )
}
