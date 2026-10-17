import { PageHeader } from '../../../components/ui/PageHeader'

export function ReservationsPage() {
  return (
    <section className="space-y-4">
      <PageHeader
        title="Reservations"
        description="Tenant reservation history will appear here. Backend queries are ready via GET /api/reservations?tenantId=..."
      />
      <div className="of-surface of-enter-delayed p-5">
        <p className="of-body">
          Use{' '}
          <span className="rounded-md bg-ink-100 px-1.5 py-0.5 font-medium text-ink-700">
            My reservations
          </span>{' '}
          as a tenant, or open a space on the map to create a booking.
        </p>
      </div>
    </section>
  )
}
