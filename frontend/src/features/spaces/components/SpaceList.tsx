import { LoadingBlock, StatusBlock } from '../../../components/ui/StatusBlock'
import { formatSpaceRate, getSpaceTypeLabel } from '../types'
import { useSpaces } from '../hooks/useSpaces'

export function SpaceList() {
  const { spaces, isLoading, error, refetch } = useSpaces()

  if (isLoading) {
    return <LoadingBlock label="Loading spaces..." />
  }

  if (error) {
    return (
      <StatusBlock
        tone="error"
        title="Could not load spaces"
        action={
          <button type="button" onClick={refetch} className="of-btn-primary">
            Try again
          </button>
        }
      >
        {error}
      </StatusBlock>
    )
  }

  if (spaces.length === 0) {
    return (
      <StatusBlock>
        No spaces found. Create one via the API, then refresh this page.
      </StatusBlock>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {spaces.map((space) => (
        <article
          key={space.id}
          className="of-surface of-surface-pressable of-enter-delayed flex flex-col gap-3 p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-[-0.015em] text-ink-900">
              {space.name}
            </h2>
            <span className="shrink-0 rounded-pill bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
              {getSpaceTypeLabel(space.type)}
            </span>
          </div>

          <p className="of-caption">Code: {space.code}</p>

          {space.description ? (
            <p className="of-body line-clamp-2">{space.description}</p>
          ) : null}

          <div className="mt-auto border-t border-[color:var(--of-separator)] pt-3">
            <p className="of-caption">Rate</p>
            <p className="text-base font-semibold tracking-[-0.01em] text-brand-700">
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
