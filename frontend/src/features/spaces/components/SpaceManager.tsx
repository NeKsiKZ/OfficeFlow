import axios from 'axios'
import { useMemo, useState, type FormEvent } from 'react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { PaginationBar } from '../../../components/ui/PaginationBar'
import { LoadingBlock, StatusBlock } from '../../../components/ui/StatusBlock'
import { useClientPagination } from '../../../hooks/useClientPagination'
import {
  filterSpaces,
  type ManageSpaceFilters,
} from '../filterSpaces'
import { CAMPUS_FLOORS, formatFloorLabel } from '../floors'
import { useSpaces } from '../hooks/useSpaces'
import { createSpace, deleteSpace } from '../spacesApi'
import {
  formatSpaceRate,
  getSpaceTypeLabel,
  SpaceType,
  type SpaceType as SpaceTypeValue,
} from '../types'
import { ManageSpaceFilterBar } from './ManageSpaceFilterBar'

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; errors?: string[] }
      | undefined

    if (data?.errors?.length) {
      return data.errors.join(' ')
    }

    if (data?.message) {
      return data.message
    }

    if (error.code === 'ERR_NETWORK') {
      return 'Cannot reach the API. Make sure the backend is running.'
    }

    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}

function buildSpaceCode(name: string, type: SpaceTypeValue): string {
  const prefix =
    type === SpaceType.Desk ? 'DSK' : type === SpaceType.Room ? 'RM' : 'PRK'
  const slug = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 12)
  const suffix = Date.now().toString(36).slice(-4).toUpperCase()

  return `${prefix}-${slug || 'SPACE'}-${suffix}`
}

export function SpaceManager() {
  const { spaces, isLoading, error, refetch } = useSpaces()
  const [filters, setFilters] = useState<ManageSpaceFilters>({})
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState<SpaceTypeValue>(SpaceType.Desk)
  const [price, setPrice] = useState('')
  const [floorNumber, setFloorNumber] = useState(1)
  const [formError, setFormError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filteredSpaces = useMemo(
    () => filterSpaces(spaces, filters),
    [spaces, filters],
  )
  const pagination = useClientPagination(filteredSpaces)

  function resetForm() {
    setName('')
    setType(SpaceType.Desk)
    setPrice('')
    setFloorNumber(1)
    setFormError(null)
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    setActionError(null)

    const parsedPrice = Number(price)
    if (!name.trim()) {
      setFormError('Name is required.')
      return
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setFormError('Price must be greater than zero.')
      return
    }

    const code = buildSpaceCode(name, type)
    setIsSubmitting(true)

    try {
      await createSpace({
        name: name.trim(),
        code,
        type,
        hourlyRate:
          type === SpaceType.Desk || type === SpaceType.ParkingSpace
            ? parsedPrice
            : null,
        monthlySubscriptionRate: type === SpaceType.Room ? parsedPrice : null,
        areaSquareMeters: type === SpaceType.Room ? 25 : null,
        capacity: type === SpaceType.Room ? 4 : null,
        spotNumber: type === SpaceType.ParkingSpace ? code : null,
        currency: 'PLN',
        floorNumber,
      })

      resetForm()
      setIsFormOpen(false)
      refetch()
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Could not create space.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id: string, spaceName: string) {
    const confirmed = window.confirm(
      `Delete space "${spaceName}"? This cannot be undone.`,
    )
    if (!confirmed) {
      return
    }

    setActionError(null)
    setDeletingId(id)

    try {
      await deleteSpace(id)
      refetch()
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Could not delete space.'))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Space management"
        description="Add or remove desks, rooms, and parking spaces available in the office."
        action={
          <button
            type="button"
            onClick={() => {
              setIsFormOpen((open) => !open)
              setFormError(null)
            }}
            className={isFormOpen ? 'of-btn-secondary' : 'of-btn-primary'}
          >
            {isFormOpen ? 'Cancel' : 'Dodaj przestrzeń'}
          </button>
        }
      />

      {isFormOpen ? (
        <form
          onSubmit={handleCreate}
          className="of-material of-enter-delayed space-y-4 rounded-[20px] p-5"
          style={{ transformOrigin: 'top right' }}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block space-y-1.5">
              <span className="of-label">Nazwa</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="of-field"
                placeholder="e.g. Desk A1"
                required
              />
            </label>

            <label className="block space-y-1.5">
              <span className="of-label">Typ</span>
              <select
                value={type}
                onChange={(event) => {
                  const next = Number(event.target.value) as SpaceTypeValue
                  setType(next)
                  setFloorNumber(next === SpaceType.ParkingSpace ? 0 : 1)
                }}
                className="of-field"
              >
                <option value={SpaceType.Desk}>Desk</option>
                <option value={SpaceType.Room}>Room</option>
                <option value={SpaceType.ParkingSpace}>Parking</option>
              </select>
            </label>

            <label className="block space-y-1.5">
              <span className="of-label">
                Cena ({type === SpaceType.Room ? 'PLN / month' : 'PLN / hour'})
              </span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                className="of-field"
                placeholder="0.00"
                required
              />
            </label>

            <label className="block space-y-1.5 sm:col-span-3">
              <span className="of-label">Floor</span>
              <select
                value={floorNumber}
                onChange={(event) => setFloorNumber(Number(event.target.value))}
                className="of-field"
              >
                {CAMPUS_FLOORS.map((floor) => (
                  <option key={floor} value={floor}>
                    {formatFloorLabel(floor)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {formError ? (
            <p className="of-alert-error" role="alert">
              {formError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="of-btn-primary"
          >
            {isSubmitting ? 'Saving...' : 'Save space'}
          </button>
        </form>
      ) : null}

      {actionError ? (
        <StatusBlock tone="error">{actionError}</StatusBlock>
      ) : null}

      {!isLoading && !error && spaces.length > 0 ? (
        <ManageSpaceFilterBar filters={filters} onChange={setFilters} />
      ) : null}

      {isLoading ? <LoadingBlock label="Loading spaces..." /> : null}

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

      {!isLoading && !error ? (
        <div className="space-y-3">
          <div className="of-surface of-enter-delayed overflow-x-auto">
            <table className="min-w-full divide-y divide-[color:var(--of-separator)] text-left text-[0.875rem]">
              <thead className="bg-ink-50/80 text-ink-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--of-separator)]">
                {spaces.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-ink-400"
                    >
                      No spaces in the database yet.
                    </td>
                  </tr>
                ) : filteredSpaces.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-ink-400"
                    >
                      No spaces match the selected filters.
                    </td>
                  </tr>
                ) : (
                  pagination.items.map((space) => (
                    <tr key={space.id} className="of-row text-ink-800">
                      <td className="px-4 py-3 font-medium tracking-[-0.01em]">
                        {space.name}
                      </td>
                      <td className="px-4 py-3 text-ink-500">{space.code}</td>
                      <td className="px-4 py-3">
                        {getSpaceTypeLabel(space.type)}
                      </td>
                      <td className="px-4 py-3">{formatSpaceRate(space)}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-pill bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
                          {space.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            void handleDelete(space.id, space.name)
                          }
                          disabled={deletingId === space.id}
                          className="of-btn-danger"
                        >
                          {deletingId === space.id ? 'Deleting...' : 'Usuń'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filteredSpaces.length > 0 ? (
            <PaginationBar
              page={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              from={pagination.from}
              to={pagination.to}
              canGoPrev={pagination.canGoPrev}
              canGoNext={pagination.canGoNext}
              onPrev={pagination.goPrev}
              onNext={pagination.goNext}
            />
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
