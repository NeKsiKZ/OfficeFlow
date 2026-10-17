import { NavLink, Outlet } from 'react-router-dom'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-brand-600 text-white'
      : 'text-stone-700 hover:bg-brand-50 hover:text-brand-700',
  ].join(' ')

export function Layout() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-stone-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4">
          <div>
            <p className="text-lg font-semibold tracking-tight text-brand-700">
              OfficeFlow
            </p>
            <p className="text-xs text-stone-500">Office space management</p>
          </div>

          <nav className="flex items-center gap-2" aria-label="Main navigation">
            <NavLink to="/" end className={navLinkClass}>
              Spaces
            </NavLink>
            <NavLink to="/reservations" className={navLinkClass}>
              Reservations
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
