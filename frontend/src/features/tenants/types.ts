export interface Tenant {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string | null
  companyName: string | null
  isActive: boolean
}

export function getTenantDisplayName(tenant: Tenant): string {
  const fullName = `${tenant.firstName} ${tenant.lastName}`.trim()
  return tenant.companyName
    ? `${fullName} (${tenant.companyName})`
    : fullName
}
