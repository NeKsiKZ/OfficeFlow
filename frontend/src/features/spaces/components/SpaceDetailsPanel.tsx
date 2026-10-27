import axios from 'axios'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  buildMonthlyPeriodIso,
  defaultHourlyEndValue,
  defaultHourlyStartValue,
  defaultRoomStartDateValue,
  estimateHourlySpaceCost,
  estimateMonthlySpaceCost,
  formatUtcDateLabel,
  isMonthlySpace,
  monthOptions,
  ROOM_MAX_MONTHS,
  toDateInputValue,
  validateHourlyPeriod,
  validateMonthlyPeriod,
} from '../../reservations/period'
import { createReservation } from '../../reservations/reservationsApi'
import { fetchServices } from '../../services/servicesApi'
import {
  formatServicePrice,
  serviceAppliesToSpace,
  type AdditionalService,
} from '../../services/types'
import { getTenants } from '../../tenants/tenantsApi'
import { getTenantDisplayName, type Tenant } from '../../tenants/types'
import { formatFloorLabel } from '../floors'
import { formatSpaceRate, getSpaceTypeLabel, type Space } from '../types'

interface SpaceDetailsPanelProps {
  space: Space | null
  onClose: () => void
}

type PanelMode = 'details' | 'form'

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
  const monthly = space ? isMonthlySpace(space) : false

  const [mode, setMode] = useState<PanelMode>('details')
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [tenantsError, setTenantsError] = useState<string | null>(null)
  const [isLoadingTenants, setIsLoadingTenants] = useState(false)
  const [services, setServices] = useState<AdditionalService[]>([])
  const [servicesError, setServicesError] = useState<string | null>(null)
  const [isLoadingServices, setIsLoadingServices] = useState(false)
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const [tenantId, setTenantId] = useState('')
  const [startTime, setStartTime] = useState(defaultHourlyStartValue)
  const [endTime, setEndTime] = useState(defaultHourlyEndValue)
  const [roomStartDate, setRoomStartDate] = useState(defaultRoomStartDateValue)
  const [monthCount, setMonthCount] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    setMode('details')
    setTenantId('')
    setStartTime(defaultHourlyStartValue())
    setEndTime(defaultHourlyEndValue())
    setRoomStartDate(defaultRoomStartDateValue())
    setMonthCount(1)
    setSelectedServiceIds([])
    setSubmitError(null)
    setSuccessMessage(null)
    setTenantsError(null)
    setServicesError(null)
  }, [space?.id])

  useEffect(() => {
    if (!isOpen || mode !== 'form') {
      return
    }

    let isActive = true

    async function loadFormData() {
      setIsLoadingTenants(true)
      setIsLoadingServices(true)
      setTenantsError(null)
      setServicesError(null)

      try {
        const [tenantData, serviceData] = await Promise.all([
          getTenants(),
          fetchServices(),
        ])

        if (!isActive) {
          return
        }

        const activeTenants = tenantData.filter((tenant) => tenant.isActive)
        setTenants(activeTenants)
        setServices(serviceData)

        if (activeTenants.length > 0) {
          setTenantId((current) => current || activeTenants[0].id)
        }
      } catch (error) {
        if (isActive) {
          const message = getApiErrorMessage(error)
          setTenantsError(message)
          setServicesError(message)
          setTenants([])
          setServices([])
        }
      } finally {
        if (isActive) {
          setIsLoadingTenants(false)
          setIsLoadingServices(false)
        }
      }
    }

    void loadFormData()

    return () => {
      isActive = false
    }
  }, [isOpen, mode])

  const monthlyPeriodPreview = useMemo(() => {
    if (!monthly) {
      return null
    }

    try {
      return buildMonthlyPeriodIso(roomStartDate, monthCount)
    } catch {
      return null
    }
  }, [monthly, roomStartDate, monthCount])

  const availableServices = space
    ? services.filter((service) => serviceAppliesToSpace(service, space.type))
    : []

  const serviceUnitTotal = availableServices
    .filter((service) => selectedServiceIds.includes(service.id))
    .reduce((sum, service) => sum + service.price, 0)

  // Rooms: add-on prices are monthly; hourly bookings charge once per reservation.
  const selectedServicesTotal = monthly
    ? serviceUnitTotal * monthCount
    : serviceUnitTotal

  const estimatedSpaceCost = useMemo(() => {
    if (!space) {
      return null
    }

    if (monthly) {
      return estimateMonthlySpaceCost(space, monthCount)
    }

    return estimateHourlySpaceCost(space, startTime, endTime)
  }, [space, monthly, monthCount, startTime, endTime])

  const estimatedTotal =
    estimatedSpaceCost == null
      ? null
      : estimatedSpaceCost + selectedServicesTotal

  function toggleService(serviceId: string) {
    setSelectedServiceIds((current) =>
      current.includes(serviceId)
        ? current.filter((id) => id !== serviceId)
        : [...current, serviceId],
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!space) {
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)
    setSuccessMessage(null)

    try {
      let startIso: string
      let endIso: string

      if (isMonthlySpace(space)) {
        const validationError = validateMonthlyPeriod(roomStartDate, monthCount)
        if (validationError) {
          setSubmitError(validationError)
          return
        }

        const period = buildMonthlyPeriodIso(roomStartDate, monthCount)
        startIso = period.startTime
        endIso = period.endTime
      } else {
        const validationError = validateHourlyPeriod(startTime, endTime)
        if (validationError) {
          setSubmitError(validationError)
          return
        }

        startIso = new Date(startTime).toISOString()
        endIso = new Date(endTime).toISOString()
      }

      await createReservation({
        spaceId: space.id,
        tenantId,
        startTime: startIso,
        endTime: endIso,
        serviceIds: selectedServiceIds,
      })

      setSuccessMessage('Rezerwacja utworzona pomyślnie')
      setMode('details')
      setTenantId('')
      setSelectedServiceIds([])
      setStartTime(defaultHourlyStartValue())
      setEndTime(defaultHourlyEndValue())
      setRoomStartDate(defaultRoomStartDateValue())
      setMonthCount(1)
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
    <aside
      className="of-surface flex max-h-[min(88dvh,820px)] flex-col overflow-hidden lg:sticky lg:top-24"
      aria-label="Space summary"
    >
      <div className="flex items-start justify-between gap-3 border-b border-[color:var(--of-separator)] px-5 py-4">
        <div className="min-w-0">
          <p className="of-caption text-brand-700">Summary</p>
          <h2 className="of-title mt-1 truncate">
            {space
              ? mode === 'form'
                ? 'New reservation'
                : space.name
              : 'No selection'}
          </h2>
        </div>
        {space ? (
          <button
            type="button"
            onClick={handleClose}
            className="of-btn-ghost shrink-0 px-2.5 py-1.5 text-[0.8125rem]"
          >
            Clear
          </button>
        ) : null}
      </div>

      {!space ? (
        <div className="flex flex-1 flex-col justify-center gap-2 px-5 py-10">
          <p className="text-[0.9375rem] font-medium tracking-[-0.01em] text-ink-800">
            Select a space
          </p>
          <p className="of-caption">
            Choose a desk, room, or parking spot on the map or list to see
            details and reserve.
          </p>
        </div>
      ) : (
        <>
          <div className="of-sheet-body flex-1 space-y-4 px-5 py-4">
            {successMessage ? (
              <div className="of-alert-success" role="status">
                {successMessage}
              </div>
            ) : null}

            <div className="space-y-3">
              <DetailRow label="Type" value={getSpaceTypeLabel(space.type)} />
              <DetailRow label="Code" value={space.code} />
              <DetailRow
                label="Floor"
                value={formatFloorLabel(space.floorNumber)}
              />
              <DetailRow
                label="Rate"
                value={formatSpaceRate(space)}
                emphasis
              />
            </div>

            {mode === 'details' ? (
              <div className="space-y-3 border-t border-[color:var(--of-separator)] pt-4">
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
              </div>
            ) : (
              <form
                id="reservation-form"
                className="space-y-4 border-t border-[color:var(--of-separator)] pt-4"
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

                {monthly ? (
                  <>
                    <p className="of-caption">
                      Rooms are billed per calendar month. Choose a start date
                      and how many months to rent.
                    </p>

                    <label className="block space-y-1.5">
                      <span className="of-label">Start date</span>
                      <input
                        required
                        type="date"
                        value={roomStartDate}
                        min={toDateInputValue(new Date())}
                        onChange={(event) =>
                          setRoomStartDate(event.target.value)
                        }
                        className="of-field"
                      />
                    </label>

                    <label className="block space-y-1.5">
                      <span className="of-label">Duration</span>
                      <select
                        required
                        value={monthCount}
                        onChange={(event) =>
                          setMonthCount(Number(event.target.value))
                        }
                        className="of-field"
                      >
                        {monthOptions(ROOM_MAX_MONTHS).map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    {monthlyPeriodPreview ? (
                      <div className="of-alert-info space-y-1">
                        <p>
                          Ends{' '}
                          <span className="font-semibold text-ink-900">
                            {formatUtcDateLabel(monthlyPeriodPreview.endTime)}
                          </span>{' '}
                          (UTC calendar)
                        </p>
                        {estimatedTotal != null ? (
                          <p>
                            Estimated total:{' '}
                            <span className="font-semibold text-brand-700">
                              {estimatedTotal.toFixed(2)}{' '}
                              {space.currency ?? 'PLN'}
                            </span>
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <>
                    <p className="of-caption">
                      Hourly booking: 1–12 hours. End must be after start.
                    </p>

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

                    {estimatedTotal != null ? (
                      <div className="of-alert-info">
                        Estimated total:{' '}
                        <span className="font-semibold text-brand-700">
                          {estimatedTotal.toFixed(2)} {space.currency ?? 'PLN'}
                        </span>
                      </div>
                    ) : null}
                  </>
                )}

                <fieldset className="space-y-2">
                  <legend className="of-label">Additional services</legend>
                  {isLoadingServices ? (
                    <p className="of-caption">Loading services...</p>
                  ) : null}
                  {servicesError ? (
                    <p className="of-alert-error">{servicesError}</p>
                  ) : null}
                  {!isLoadingServices &&
                  !servicesError &&
                  availableServices.length === 0 ? (
                    <p className="of-caption">
                      No optional services for this space type.
                    </p>
                  ) : null}
                  {!isLoadingServices && availableServices.length > 0 ? (
                    <div className="space-y-2">
                      {availableServices.map((service) => {
                        const checked = selectedServiceIds.includes(service.id)
                        return (
                          <label
                            key={service.id}
                            className="flex cursor-pointer items-start gap-3 rounded-[12px] bg-[color:var(--of-fill)] px-3 py-2.5"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleService(service.id)}
                              className="mt-1 h-4 w-4 accent-brand-600"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block text-[0.9375rem] font-medium tracking-[-0.01em] text-ink-900">
                                {service.name} —{' '}
                                {formatServicePrice(service, {
                                  perMonth: monthly,
                                })}
                              </span>
                              {service.description ? (
                                <span className="of-caption mt-0.5 block">
                                  {service.description}
                                </span>
                              ) : null}
                            </span>
                          </label>
                        )
                      })}
                      {selectedServiceIds.length > 0 ? (
                        <p className="of-caption pt-1">
                          Selected add-ons:{' '}
                          <span className="font-semibold text-brand-700">
                            {selectedServicesTotal.toFixed(2)} PLN
                          </span>
                          {monthly ? (
                            <span>
                              {' '}
                              ({serviceUnitTotal.toFixed(2)} × {monthCount} mo)
                            </span>
                          ) : null}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </fieldset>

                {submitError ? (
                  <p className="of-alert-error">{submitError}</p>
                ) : null}
              </form>
            )}
          </div>

          <div className="space-y-2 border-t border-[color:var(--of-separator)] px-5 py-4">
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
      )}
    </aside>
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
