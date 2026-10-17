import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getAuthUser, hasRole } from '../auth'
import type { UserRole } from '../types'

interface ProtectedRouteProps {
  roles?: UserRole | UserRole[]
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const location = useLocation()
  const user = getAuthUser()

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    )
  }

  if (roles && !hasRole(roles)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
