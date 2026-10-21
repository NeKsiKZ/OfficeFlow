import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../../../components/ui/PageHeader'
import { LoadingBlock, StatusBlock } from '../../../components/ui/StatusBlock'
import { useManagerStats } from '../../reports/hooks/useManagerStats'
import type { ManagerStats } from '../../reports/types'

type RangePreset = 'all' | '30d' | 'month'

function toIsoDateStart(date: Date): string {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  ).toISOString()
}

function buildRange(preset: RangePreset): { fromUtc?: string; toUtc?: string } {
  if (preset === 'all') {
    return {}
  }

  const now = new Date()
  const toUtc = now.toISOString()

  if (preset === 'month') {
    return {
      fromUtc: toIsoDateStart(
        new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)),
      ),
      toUtc,
    }
  }

  const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  return { fromUtc: from.toISOString(), toUtc }
}

function formatMoney(amount: number, currency: string): string {
  return `${amount.toFixed(2)} ${currency}`
}

export function DashboardPage() {
  const [preset, setPreset] = useState<RangePreset>('month')
  const filters = useMemo(() => buildRange(preset), [preset])
  const { stats, isLoading, error, refetch } = useManagerStats(filters)

  return (
    <section className="space-y-6">
      <PageHeader
        title="Manager dashboard"
        description="Przychód, wnioski do potwierdzenia i obłożenie biura."
        action={
          <div
            className="of-material inline-flex rounded-[12px] p-1"
            role="group"
            aria-label="Report period"
          >
            {(
              [
                ['month', 'This month'],
                ['30d', '30 days'],
                ['all', 'All time'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setPreset(value)}
                className={[
                  'of-nav-pill px-3 py-1.5 text-[0.8125rem]',
                  preset === value
                    ? 'bg-brand-600 text-[color:var(--of-on-brand)] shadow-sm'
                    : '',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
          </div>
        }
      />

      {isLoading ? <LoadingBlock label="Loading statistics..." /> : null}

      {error ? (
        <StatusBlock
          tone="error"
          title="Could not load statistics"
          action={
            <button type="button" onClick={() => void refetch()} className="of-btn-primary">
              Try again
            </button>
          }
        >
          {error}
        </StatusBlock>
      ) : null}

      {stats && !isLoading && !error ? <StatsContent stats={stats} /> : null}
    </section>
  )
}

function StatsContent({ stats }: { stats: ManagerStats }) {
  const { currency, revenue, counts, occupancy, monthlyRevenue } = stats
  const maxMonthly = Math.max(
    ...monthlyRevenue.map((row) => row.recognizedAmount),
    1,
  )

  return (
    <div className="space-y-4 of-enter-delayed">
      <div className="of-surface p-6 sm:p-7">
        <p className="of-caption">Revenue</p>
        <p className="mt-2 text-[1.75rem] font-semibold tracking-[-0.025em] text-ink-900 sm:text-[2rem]">
          {formatMoney(revenue.recognizedAmount, currency)}
        </p>
        <p className="of-caption mt-1.5">Confirmed + completed in selected period</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          to="/reservations"
          className="of-surface of-surface-pressable block p-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          <p className="of-caption">Awaiting confirmation</p>
          <p className="of-title mt-2 tabular-nums">{counts.pending}</p>
          <p className="of-caption mt-2 text-ink-600">
            {counts.pending === 0
              ? 'No pending requests'
              : 'Review in Reservations →'}
          </p>
        </Link>

        <div className="of-surface p-5">
          <p className="of-caption">Occupancy now</p>
          <p className="of-title mt-2 tabular-nums">
            {occupancy.occupancyPercent.toFixed(1)}%
          </p>
          <p className="of-caption mt-2">
            {occupancy.currentlyOccupiedSpaces} of {occupancy.activeSpaces}{' '}
            active spaces booked
          </p>
        </div>
      </div>

      <div className="of-surface p-5">
        <p className="of-caption">Monthly revenue</p>
        <div className="mt-4 flex items-end gap-2 sm:gap-3">
          {monthlyRevenue.map((row) => {
            const height = Math.max(
              4,
              Math.round((row.recognizedAmount / maxMonthly) * 96),
            )
            return (
              <div
                key={row.label}
                className="flex min-w-0 flex-1 flex-col items-center gap-2"
              >
                <span className="of-caption tabular-nums">
                  {row.recognizedAmount > 0
                    ? row.recognizedAmount.toFixed(0)
                    : '—'}
                </span>
                <div
                  className="w-full max-w-[40px] rounded-t-[8px] bg-brand-600/85"
                  style={{ height }}
                  title={`${row.label}: ${formatMoney(row.recognizedAmount, currency)}`}
                />
                <span className="of-caption truncate">{row.label.slice(5)}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
