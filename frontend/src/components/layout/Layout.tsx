import type { ReactNode } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { getAuthUser } from '../../features/auth/auth'
import { clearToken } from '../../features/auth/tokenStorage'
import { ThemeToggle } from '../../theme/ThemeToggle'

export function Layout() {
  const navigate = useNavigate()
  const user = getAuthUser()

  function handleLogout() {
    clearToken()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-app">
      <header className="of-toolbar">
        <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3.5">
          <div className="min-w-0">
            <p className="text-[1.125rem] font-semibold tracking-[-0.02em] text-brand-700">
              OfficeFlow
            </p>
            <p className="of-caption truncate">
              {user ? `${user.role} · ${user.email}` : 'Office space management'}
            </p>
          </div>

          <nav
            className="flex flex-wrap items-center justify-end gap-1"
            aria-label="Main navigation"
          >
            <NavItem to="/" end>
              Spaces
            </NavItem>
            <NavItem to="/reservations">Reservations</NavItem>
            {user?.role === 'Tenant' ? (
              <NavItem to="/my-reservations">My reservations</NavItem>
            ) : null}
            {user?.role === 'Manager' ? (
              <>
                <NavItem to="/manage-spaces">Manage spaces</NavItem>
                <NavItem to="/manage-services">Manage services</NavItem>
                <NavItem to="/dashboard">Dashboard</NavItem>
              </>
            ) : null}
            <ThemeToggle />
            <button type="button" onClick={handleLogout} className="of-btn-ghost">
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
        <Outlet />
      </main>
    </div>
  )
}

function NavItem({
  to,
  end,
  children,
}: {
  to: string
  end?: boolean
  children: ReactNode
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        ['of-nav-pill', isActive ? 'bg-brand-600 text-white shadow-sm' : ''].join(
          ' ',
        )
      }
    >
      {children}
    </NavLink>
  )
}
