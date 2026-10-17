import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { LoadingBlock, StatusBlock } from '../../../components/ui/StatusBlock'
import { getAuthUser } from '../../auth/auth'
import { cancelReservation, fetchReservationsByTenant } from '../reservationsApi'
import {
  canCancelReservation,
  getReservationStatusLabel,
  type Reservation,
} from '../types'

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

export function MyReservations() {
  const user = getAuthUser()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const loadReservations = useCallback(async () => {
    if (!user?.tenantId) {
      setError('Tenant account is required to view reservation history.')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchReservationsByTenant(user.tenantId)
      setReservations(data)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load reservations.'))
      setReservations([])
    } finally {
      setIsLoading(false)
    }
  }, [user?.tenantId])

  useEffect(() => {
    void loadReservations()
  }, [loadReservations])

  async function handleCancel(reservation: Reservation) {
    const confirmed = window.confirm(
      `Cancel reservation for "${reservation.spaceName}"?`,
    )
    if (!confirmed) {
      return
    }

    setActionError(null)
    setCancellingId(reservation.id)

    try {
      await cancelReservation(reservation.id)
      await loadReservations()
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Could not cancel reservation.'))
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="My reservations"
        description="History of your bookings with period and calculated cost."
      />

      {isLoading ? <LoadingBlock label="Loading reservations..." /> : null}

      {error ? (
        <StatusBlock tone="error" title="Could not load reservations">
          {error}
        </StatusBlock>
      ) : null}

      {actionError ? (
        <StatusBlock tone="error">{actionError}</StatusBlock>
      ) : null}

      {!isLoading && !error && reservations.length === 0 ? (
        <StatusBlock>
          You have no reservations yet. Open the office map and book a space.
        </StatusBlock>
      ) : null}

      {!isLoading && !error && reservations.length > 0 ? (
        <>
          <div className="of-surface of-enter-delayed hidden overflow-hidden md:block">
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
                {reservations.map((reservation) => (
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
                    <td className="px-4 py-3 text-right">
                      {canCancelReservation(reservation.status) ? (
                        <button
                          type="button"
                          onClick={() => void handleCancel(reservation)}
                          disabled={cancellingId === reservation.id}
                          className="of-btn-danger"
                        >
                          {cancellingId === reservation.id
                            ? 'Cancelling...'
                            : 'Cancel'}
                        </button>
                      ) : (
                        <span className="of-caption">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 gap-3 md:hidden">
            {reservations.map((reservation) => (
              <article
                key={reservation.id}
                className="of-surface of-enter-delayed space-y-3 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold tracking-[-0.01em] text-ink-900">
                    {reservation.spaceName}
                  </h2>
                  <StatusBadge status={reservation.status} />
                </div>
                <p className="of-body">
                  {formatDateTime(reservation.startTimeUtc)} —{' '}
                  {formatDateTime(reservation.endTimeUtc)}
                </p>
                <p className="text-base font-semibold tracking-[-0.01em] text-brand-700">
                  {reservation.totalCostAmount.toFixed(2)} {reservation.currency}
                </p>
                {canCancelReservation(reservation.status) ? (
                  <button
                    type="button"
                    onClick={() => void handleCancel(reservation)}
                    disabled={cancellingId === reservation.id}
                    className="of-btn-danger w-full"
                  >
                    {cancellingId === reservation.id
                      ? 'Cancelling...'
                      : 'Cancel'}
                  </button>
                ) : null}
              </article>
            ))}
          </div>
        </>
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
