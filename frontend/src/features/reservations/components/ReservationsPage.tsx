import axios from 'axios'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { PageHeader } from '../../../components/ui/PageHeader'
import { PaginationBar } from '../../../components/ui/PaginationBar'
import { LoadingBlock, StatusBlock } from '../../../components/ui/StatusBlock'
import { useClientPagination } from '../../../hooks/useClientPagination'
import { getAuthUser } from '../../auth/auth'
import {
  filterReservations,
  type ReservationFilters,
} from '../filterReservations'
import {
  cancelReservation,
  confirmReservation,
  fetchAllReservations,
} from '../reservationsApi'
import {
  canCancelReservation,
  canConfirmReservation,
  getReservationStatusLabel,
  type Reservation,
} from '../types'
import { ReservationFilterBar } from './ReservationFilterBar'

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}

export function ReservationsPage() {
  const user = getAuthUser()

  if (user?.role === 'Tenant') {
    return <Navigate to="/my-reservations" replace />
  }

  if (user?.role !== 'Manager') {
    return <Navigate to="/" replace />
  }

  return <ManagerReservationsPanel />
}

function ManagerReservationsPanel() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [filters, setFilters] = useState<ReservationFilters>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const filteredReservations = useMemo(
    () => filterReservations(reservations, filters),
    [reservations, filters],
  )
  const pagination = useClientPagination(filteredReservations)

  const loadReservations = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchAllReservations()
      setReservations(data)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load reservations.'))
      setReservations([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadReservations()
  }, [loadReservations])

  async function handleConfirm(reservation: Reservation) {
    setActionError(null)
    setBusyId(reservation.id)

    try {
      await confirmReservation(reservation.id)
      await loadReservations()
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Could not confirm reservation.'))
    } finally {
      setBusyId(null)
    }
  }

  async function handleCancel(reservation: Reservation) {
    const confirmed = window.confirm(
      `Cancel reservation for "${reservation.spaceName}"?`,
    )
    if (!confirmed) {
      return
    }

    setActionError(null)
    setBusyId(reservation.id)

    try {
      await cancelReservation(reservation.id)
      await loadReservations()
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Could not cancel reservation.'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Reservations"
        description="Review pending requests, confirm bookings, or cancel reservations."
      />

      {!isLoading && !error && reservations.length > 0 ? (
        <ReservationFilterBar filters={filters} onChange={setFilters} />
      ) : null}

      {isLoading ? <LoadingBlock label="Loading reservations..." /> : null}

      {error ? (
        <StatusBlock
          tone="error"
          title="Could not load reservations"
          action={
            <button
              type="button"
              onClick={() => void loadReservations()}
              className="of-btn-primary"
            >
              Try again
            </button>
          }
        >
          {error}
        </StatusBlock>
      ) : null}

      {actionError ? (
        <StatusBlock tone="error">{actionError}</StatusBlock>
      ) : null}

      {!isLoading && !error && reservations.length === 0 ? (
        <StatusBlock>No reservations in the system yet.</StatusBlock>
      ) : null}

      {!isLoading &&
      !error &&
      reservations.length > 0 &&
      filteredReservations.length === 0 ? (
        <StatusBlock>No reservations match the selected filters.</StatusBlock>
      ) : null}

      {!isLoading && !error && filteredReservations.length > 0 ? (
        <div className="space-y-3">
          <div className="of-surface of-enter-delayed overflow-x-auto">
            <table className="min-w-full divide-y divide-[color:var(--of-separator)] text-left text-[0.875rem]">
              <thead className="bg-ink-50/80 text-ink-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Space</th>
                  <th className="px-4 py-3 font-medium">From</th>
                  <th className="px-4 py-3 font-medium">To</th>
                  <th className="px-4 py-3 font-medium">Cost</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--of-separator)]">
                {pagination.items.map((reservation) => {
                  const isBusy = busyId === reservation.id
                  return (
                    <tr key={reservation.id} className="of-row">
                      <td className="px-4 py-3 font-medium tracking-[-0.01em] text-ink-900">
                        {reservation.spaceName}
                      </td>
                      <td className="px-4 py-3 text-ink-500">
                        {formatDateTime(reservation.startTimeUtc)}
                      </td>
                      <td className="px-4 py-3 text-ink-500">
                        {formatDateTime(reservation.endTimeUtc)}
                      </td>
                      <td className="px-4 py-3 font-semibold tracking-[-0.01em] text-brand-700">
                        {reservation.totalCostAmount.toFixed(2)}{' '}
                        {reservation.currency}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={reservation.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap justify-end gap-2">
                          {canConfirmReservation(reservation.status) ? (
                            <button
                              type="button"
                              onClick={() => void handleConfirm(reservation)}
                              disabled={isBusy}
                              className="of-btn-primary"
                            >
                              {isBusy ? 'Working...' : 'Confirm'}
                            </button>
                          ) : null}
                          {canCancelReservation(reservation.status) ? (
                            <button
                              type="button"
                              onClick={() => void handleCancel(reservation)}
                              disabled={isBusy}
                              className="of-btn-danger"
                            >
                              {isBusy ? 'Working...' : 'Cancel'}
                            </button>
                          ) : null}
                          {!canConfirmReservation(reservation.status) &&
                          !canCancelReservation(reservation.status) ? (
                            <span className="of-caption">—</span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
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
        </div>
      ) : null}
    </section>
  )
}

function StatusBadge({ status }: { status: Reservation['status'] }) {
  return (
    <span className="inline-flex rounded-pill bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
      {getReservationStatusLabel(status)}
    </span>
  )
}
