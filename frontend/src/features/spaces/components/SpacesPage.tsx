import { useState } from 'react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { LoadingBlock, StatusBlock } from '../../../components/ui/StatusBlock'
import { useSpaces } from '../hooks/useSpaces'
import type { SpaceFilters } from '../spacesApi'
import { OfficeMap } from './OfficeMap'
import { SpaceFilterBar } from './SpaceFilterBar'

export function SpacesPage() {
  const [filters, setFilters] = useState<SpaceFilters>({})
  const { spaces, isLoading, error, refetch } = useSpaces(filters)

  return (
    <section className="space-y-6">
      <PageHeader
        title="Office map"
        description="Filter available spaces, then press a desk, room, or parking spot to view details and reserve."
      />

      <div className="of-enter-delayed">
        <SpaceFilterBar filters={filters} onChange={setFilters} />
      </div>

      {isLoading ? <LoadingBlock label="Loading office map..." /> : null}

      {error ? (
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
      ) : null}

      {!isLoading && !error && spaces.length === 0 ? (
        <StatusBlock>
          No spaces match the selected filters.
        </StatusBlock>
      ) : null}

      {!isLoading && !error && spaces.length > 0 ? (
        <div className="of-enter-delayed">
          <OfficeMap spaces={spaces} />
        </div>
      ) : null}
    </section>
  )
}
