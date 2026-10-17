import axios from 'axios'
import { useEffect, useState, type FormEvent } from 'react'
import { createReservation } from '../../reservations/reservationsApi'
import { getTenants } from '../../tenants/tenantsApi'
import { getTenantDisplayName, type Tenant } from '../../tenants/types'
import { formatSpaceRate, getSpaceTypeLabel, type Space } from '../types'

interface SpaceDetailsPanelProps {
  space: Space | null
  onClose: () => void
}

type PanelMode = 'details' | 'form'

function toDateTimeLocalValue(date: Date): string {
  const pad = (value: number) => value.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function defaultStartValue(): string {
  const start = new Date()
  start.setMinutes(0, 0, 0)
  start.setHours(start.getHours() + 1)
  return toDateTimeLocalValue(start)
}

function defaultEndValue(): string {
  const end = new Date()
  end.setMinutes(0, 0, 0)
  end.setHours(end.getHours() + 3)
  return toDateTimeLocalValue(end)
}

function getApiErrorMessage(error: unknown): string {
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

  return 'Reservation could not be created.'
}

export function SpaceDetailsPanel({ space, onClose }: SpaceDetailsPanelProps) {
  const isOpen = space != null
  const [mode, setMode] = useState<PanelMode>('details')
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [tenantsError, setTenantsError] = useState<string | null>(null)
  const [isLoadingTenants, setIsLoadingTenants] = useState(false)
  const [tenantId, setTenantId] = useState('')
  const [startTime, setStartTime] = useState(defaultStartValue)
  const [endTime, setEndTime] = useState(defaultEndValue)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    setMode('details')
    setTenantId('')
    setStartTime(defaultStartValue())
    setEndTime(defaultEndValue())
    setSubmitError(null)
    setSuccessMessage(null)
    setTenantsError(null)
  }, [space?.id])

  useEffect(() => {
    if (!isOpen || mode !== 'form') {
      return
    }

    let isActive = true

    async function loadTenants() {
      setIsLoadingTenants(true)
      setTenantsError(null)

      try {
        const data = await getTenants()
        if (!isActive) {
          return
        }

        const activeTenants = data.filter((tenant) => tenant.isActive)
        setTenants(activeTenants)

        if (activeTenants.length > 0) {
          setTenantId((current) => current || activeTenants[0].id)
        }
      } catch (error) {
        if (isActive) {
          setTenantsError(getApiErrorMessage(error))
          setTenants([])
        }
      } finally {
        if (isActive) {
          setIsLoadingTenants(false)
        }
      }
    }

    void loadTenants()

    return () => {
      isActive = false
    }
  }, [isOpen, mode])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!space) {
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)
    setSuccessMessage(null)

    try {
      await createReservation({
        spaceId: space.id,
        tenantId,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      })

      setSuccessMessage('Rezerwacja utworzona pomyślnie')
      setMode('details')
      setTenantId('')
      setStartTime(defaultStartValue())
      setEndTime(defaultEndValue())
    } catch (error) {
      setSubmitError(getApiErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleClose() {
    setMode('details')
    setSuccessMessage(null)
    setSubmitError(null)
    onClose()
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close details"
        onClick={handleClose}
        className={[
          'of-scrim',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
      />

      <aside
        className={[
          'of-sheet',
          isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
        ].join(' ')}
        aria-hidden={!isOpen}
        aria-label="Space details"
      >
        {space ? (
          <>
            <div className="of-material flex items-start justify-between gap-4 border-b border-[color:var(--of-separator)] px-6 py-5">
              <div>
                <p className="of-caption text-brand-600">
                  {mode === 'form' ? 'New reservation' : 'Selected space'}
                </p>
                <h2 className="of-title mt-1">{space.name}</h2>
              </div>
              <button type="button" onClick={handleClose} className="of-btn-ghost">
                Close
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
              {successMessage ? (
                <div className="of-alert-success" role="status">
                  {successMessage}
                </div>
              ) : null}

              <DetailRow label="Type" value={getSpaceTypeLabel(space.type)} />
              <DetailRow label="Code" value={space.code} />
              <DetailRow label="Rate" value={formatSpaceRate(space)} emphasis />

              {mode === 'details' ? (
                <>
                  {space.description ? (
                    <DetailRow label="Description" value={space.description} />
                  ) : null}
                  {space.capacity != null ? (
                    <DetailRow
                      label="Capacity"
                      value={`${space.capacity} people`}
                    />
                  ) : null}
                  {space.areaSquareMeters != null ? (
                    <DetailRow
                      label="Area"
                      value={`${space.areaSquareMeters} m²`}
                    />
                  ) : null}
                  {space.spotNumber ? (
                    <DetailRow label="Spot" value={space.spotNumber} />
                  ) : null}
                  <DetailRow
                    label="Status"
                    value={space.isActive ? 'Available' : 'Inactive'}
                  />
                </>
              ) : (
                <form
                  id="reservation-form"
                  className="space-y-4"
                  onSubmit={handleSubmit}
                >
                  <label className="block space-y-1.5">
                    <span className="of-label">Najemca</span>
                    <select
                      required
                      value={tenantId}
                      onChange={(event) => setTenantId(event.target.value)}
                      disabled={isLoadingTenants || tenants.length === 0}
                      className="of-field"
                    >
                      {isLoadingTenants ? (
                        <option value="">Loading tenants...</option>
                      ) : null}
                      {!isLoadingTenants && tenants.length === 0 ? (
                        <option value="">No tenants available</option>
                      ) : null}
                      {tenants.map((tenant) => (
                        <option key={tenant.id} value={tenant.id}>
                          {getTenantDisplayName(tenant)} — {tenant.email}
                        </option>
                      ))}
                    </select>
                  </label>

                  {tenantsError ? (
                    <p className="of-alert-error">{tenantsError}</p>
                  ) : null}

                  <label className="block space-y-1.5">
                    <span className="of-label">Start</span>
                    <input
                      required
                      type="datetime-local"
                      value={startTime}
                      onChange={(event) => setStartTime(event.target.value)}
                      className="of-field"
                    />
                  </label>

                  <label className="block space-y-1.5">
                    <span className="of-label">End</span>
                    <input
                      required
                      type="datetime-local"
                      value={endTime}
                      min={startTime}
                      onChange={(event) => setEndTime(event.target.value)}
                      className="of-field"
                    />
                  </label>

                  {submitError ? (
                    <p className="of-alert-error">{submitError}</p>
                  ) : null}
                </form>
              )}
            </div>

            <div className="of-material space-y-2 border-t border-[color:var(--of-separator)] px-6 py-5">
              {mode === 'details' ? (
                <button
                  type="button"
                  disabled={!space.isActive}
                  onClick={() => {
                    setSuccessMessage(null)
                    setSubmitError(null)
                    setMode('form')
                  }}
                  className="of-btn-primary w-full py-3.5"
                >
                  Zarezerwuj
                </button>
              ) : (
                <>
                  <button
                    type="submit"
                    form="reservation-form"
                    disabled={
                      isSubmitting ||
                      isLoadingTenants ||
                      !tenantId ||
                      tenants.length === 0
                    }
                    className="of-btn-primary w-full py-3.5"
                  >
                    {isSubmitting ? 'Saving...' : 'Potwierdź rezerwację'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('details')
                      setSubmitError(null)
                    }}
                    className="of-btn-secondary w-full"
                  >
                    Anuluj
                  </button>
                </>
              )}
            </div>
          </>
        ) : null}
      </aside>
    </>
  )
}

function DetailRow({
  label,
  value,
  emphasis = false,
}: {
  label: string
  value: string
  emphasis?: boolean
}) {
  return (
    <div>
      <p className="of-caption">{label}</p>
      <p
        className={
          emphasis
            ? 'mt-1 text-lg font-semibold tracking-[-0.015em] text-brand-700'
            : 'mt-1 text-[0.9375rem] text-ink-900'
        }
      >
        {value}
      </p>
    </div>
  )
}
