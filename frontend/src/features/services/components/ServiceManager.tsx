import axios from 'axios'
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { PaginationBar } from '../../../components/ui/PaginationBar'
import { LoadingBlock, StatusBlock } from '../../../components/ui/StatusBlock'
import { useClientPagination } from '../../../hooks/useClientPagination'
import { getSpaceTypeLabel, type SpaceType } from '../../spaces/types'
import {
  filterServices,
  type ServiceFilters,
} from '../filterServices'
import { createService, deleteService, fetchServices } from '../servicesApi'
import {
  ALL_SPACE_TYPES,
  formatApplicableSpaceTypes,
  formatServicePrice,
  type AdditionalService,
} from '../types'
import { ServiceFilterBar } from './ServiceFilterBar'

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

export function ServiceManager() {
  const [services, setServices] = useState<AdditionalService[]>([])
  const [filters, setFilters] = useState<ServiceFilters>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [applicableSpaceTypes, setApplicableSpaceTypes] = useState<SpaceType[]>([
    ...ALL_SPACE_TYPES,
  ])
  const [formError, setFormError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filteredServices = useMemo(
    () => filterServices(services, filters),
    [services, filters],
  )
  const pagination = useClientPagination(filteredServices)

  const loadServices = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchServices()
      setServices(data)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load services.'))
      setServices([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadServices()
  }, [loadServices])

  function resetForm() {
    setName('')
    setDescription('')
    setPrice('')
    setApplicableSpaceTypes([...ALL_SPACE_TYPES])
    setFormError(null)
  }

  function toggleSpaceType(spaceType: SpaceType) {
    setApplicableSpaceTypes((current) =>
      current.includes(spaceType)
        ? current.filter((type) => type !== spaceType)
        : [...current, spaceType],
    )
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

    if (applicableSpaceTypes.length === 0) {
      setFormError('Select at least one space type.')
      return
    }

    setIsSubmitting(true)

    try {
      await createService({
        name: name.trim(),
        price: parsedPrice,
        description: description.trim() || null,
        currency: 'PLN',
        applicableSpaceTypes,
      })
      resetForm()
      setIsFormOpen(false)
      await loadServices()
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Could not create service.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id: string, serviceName: string) {
    const confirmed = window.confirm(
      `Delete service "${serviceName}"? This cannot be undone.`,
    )
    if (!confirmed) {
      return
    }

    setActionError(null)
    setDeletingId(id)

    try {
      await deleteService(id)
      await loadServices()
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Could not delete service.'))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Service management"
        description="Manage optional add-ons and assign them to desk, room, or parking reservations."
        action={
          <button
            type="button"
            onClick={() => {
              setIsFormOpen((open) => !open)
              setFormError(null)
            }}
            className={isFormOpen ? 'of-btn-secondary' : 'of-btn-primary'}
          >
            {isFormOpen ? 'Cancel' : 'Add service'}
          </button>
        }
      />

      {isFormOpen ? (
        <form
          onSubmit={handleCreate}
          className="of-material of-enter-delayed space-y-4 rounded-[20px] p-5"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block space-y-1.5 sm:col-span-1">
              <span className="of-label">Name</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="of-field"
                placeholder="e.g. Parking podziemny"
                required
              />
            </label>

            <label className="block space-y-1.5">
              <span className="of-label">Price (PLN)</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                className="of-field"
                placeholder="50.00"
                required
              />
            </label>

            <label className="block space-y-1.5 sm:col-span-3">
              <span className="of-label">Description</span>
              <input
                type="text"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="of-field"
                placeholder="Optional details"
              />
            </label>
          </div>

          <fieldset className="space-y-2">
            <legend className="of-label">Available for</legend>
            <p className="of-caption">
              Choose which space types can include this add-on.
            </p>
            <div className="flex flex-wrap gap-2">
              {ALL_SPACE_TYPES.map((spaceType) => {
                const checked = applicableSpaceTypes.includes(spaceType)
                return (
                  <label
                    key={spaceType}
                    className={[
                      'inline-flex cursor-pointer items-center gap-2 rounded-pill px-3.5 py-2 text-[0.875rem] font-medium',
                      checked
                        ? 'bg-brand-600 text-[color:var(--of-on-brand)]'
                        : 'bg-[color:var(--of-fill)] text-ink-700',
                    ].join(' ')}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSpaceType(spaceType)}
                      className="sr-only"
                    />
                    {getSpaceTypeLabel(spaceType)}
                  </label>
                )
              })}
            </div>
          </fieldset>

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
            {isSubmitting ? 'Saving...' : 'Save service'}
          </button>
        </form>
      ) : null}

      {actionError ? (
        <StatusBlock tone="error">{actionError}</StatusBlock>
      ) : null}

      {!isLoading && !error && services.length > 0 ? (
        <ServiceFilterBar filters={filters} onChange={setFilters} />
      ) : null}

      {isLoading ? <LoadingBlock label="Loading services..." /> : null}

      {error ? (
        <StatusBlock
          tone="error"
          title="Could not load services"
          action={
            <button
              type="button"
              onClick={() => void loadServices()}
              className="of-btn-primary"
            >
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
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Space types</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--of-separator)]">
                {services.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-ink-400"
                    >
                      No additional services yet.
                    </td>
                  </tr>
                ) : filteredServices.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-ink-400"
                    >
                      No services match the selected filters.
                    </td>
                  </tr>
                ) : (
                  pagination.items.map((service) => (
                    <tr key={service.id} className="of-row text-ink-800">
                      <td className="px-4 py-3 font-medium tracking-[-0.01em]">
                        {service.name}
                      </td>
                      <td className="px-4 py-3 text-ink-500">
                        {service.description ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-ink-600">
                        {formatApplicableSpaceTypes(service)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-brand-700">
                        {formatServicePrice(service)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            void handleDelete(service.id, service.name)
                          }
                          disabled={deletingId === service.id}
                          className="of-btn-danger"
                        >
                          {deletingId === service.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filteredServices.length > 0 ? (
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
