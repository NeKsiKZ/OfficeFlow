import { getToken } from './tokenStorage'
import type { AuthUser, UserRole } from './types'

interface JwtPayload {
  email?: string
  role?: string
  tenantId?: string
  exp?: number
  [key: string]: unknown
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) {
      return null
    }

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(normalized)
    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
}

function resolveRole(payload: JwtPayload): UserRole | null {
  const roleClaim =
    payload.role ??
    payload[
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
    ]

  if (roleClaim === 'Manager' || roleClaim === 'Tenant') {
    return roleClaim
  }

  return null
}

export function getAuthUser(): AuthUser | null {
  const token = getToken()
  if (!token) {
    return null
  }

  const payload = decodeJwtPayload(token)
  if (!payload) {
    return null
  }

  if (payload.exp && payload.exp * 1000 < Date.now()) {
    return null
  }

  const role = resolveRole(payload)
  const email =
    payload.email ??
    (payload[
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
    ] as string | undefined)

  if (!role || !email) {
    return null
  }

  return {
    email,
    role,
    tenantId: payload.tenantId ?? null,
    exp: payload.exp,
  }
}

export function isAuthenticated(): boolean {
  return getAuthUser() != null
}

export function hasRole(requiredRoles?: UserRole | UserRole[]): boolean {
  const user = getAuthUser()
  if (!user) {
    return false
  }

  if (!requiredRoles) {
    return true
  }

  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
  return roles.includes(user.role)
}
