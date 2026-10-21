export interface RevenueStats {
  recognizedAmount: number
  realizedAmount: number
  pipelineAmount: number
  cancelledAmount: number
  averageBookingAmount: number
}

export interface ReservationCountStats {
  total: number
  pending: number
  confirmed: number
  completed: number
  cancelled: number
}

export interface OccupancyStats {
  activeSpaces: number
  currentlyOccupiedSpaces: number
  occupancyPercent: number
}

export interface StatusBreakdown {
  status: string
  count: number
  totalAmount: number
}

export interface SpaceTypeBreakdown {
  spaceType: string
  reservationCount: number
  recognizedAmount: number
}

export interface MonthlyRevenue {
  year: number
  month: number
  label: string
  recognizedAmount: number
  reservationCount: number
}

export interface ManagerStats {
  generatedAtUtc: string
  fromUtc: string | null
  toUtc: string | null
  currency: string
  revenue: RevenueStats
  counts: ReservationCountStats
  occupancy: OccupancyStats
  byStatus: StatusBreakdown[]
  bySpaceType: SpaceTypeBreakdown[]
  monthlyRevenue: MonthlyRevenue[]
}

export interface ManagerStatsFilters {
  fromUtc?: string
  toUtc?: string
}
