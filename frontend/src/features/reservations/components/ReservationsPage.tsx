export function ReservationsPage() {
  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
        Reservations
      </h1>
      <p className="max-w-2xl text-stone-600">
        Tenant reservation history will appear here. Backend queries are ready
        via{' '}
        <code className="rounded bg-stone-200 px-1.5 py-0.5 text-sm">
          GET /api/reservations?tenantId=...
        </code>
        .
      </p>
    </section>
  )
}
