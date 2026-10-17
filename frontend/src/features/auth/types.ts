export type UserRole = 'Manager' | 'Tenant'

export interface LoginPayload {
  email: string
  password?: string
}

export interface LoginResult {
  token: string
  email: string
  role: UserRole
  expiresAtUtc: string
  tenantId: string | null
}

export interface AuthUser {
  email: string
  role: UserRole
  tenantId: string | null
  exp?: number
}
