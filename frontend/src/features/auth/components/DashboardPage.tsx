import { Link } from 'react-router-dom'
import { PageHeader } from '../../../components/ui/PageHeader'
import { getAuthUser } from '../auth'

export function DashboardPage() {
  const user = getAuthUser()

  return (
    <section className="space-y-6">
      <PageHeader
        title="Manager dashboard"
        description={`Protected area for managers. Signed in as ${user?.email ?? 'unknown'}.`}
      />

      <div className="of-surface of-enter-delayed p-6">
        <p className="of-caption">Quick actions</p>
        <ul className="mt-3 space-y-2 text-[0.9375rem] text-ink-700">
          <li>
            <Link
              to="/manage-spaces"
              className="font-medium text-brand-700 underline-offset-4 hover:underline"
            >
              Manage spaces
            </Link>
            <span className="text-ink-400"> — add or remove office inventory</span>
          </li>
          <li className="text-ink-500">
            Review revenue reports via GET /api/reports/revenue
          </li>
        </ul>
      </div>
    </section>
  )
}
