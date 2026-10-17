import { SpaceType, type Space } from '../spaces/types'

export const HOURLY_MIN_HOURS = 1
export const HOURLY_MAX_HOURS = 12
export const ROOM_MIN_MONTHS = 1
export const ROOM_MAX_MONTHS = 24

export function isMonthlySpace(space: Space): boolean {
  return space.type === SpaceType.Room
}

export function toDateInputValue(date: Date): string {
  const pad = (value: number) => value.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function toDateTimeLocalValue(date: Date): string {
  const pad = (value: number) => value.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function defaultHourlyStartValue(): string {
  const start = new Date()
  start.setMinutes(0, 0, 0)
  start.setHours(start.getHours() + 1)
  return toDateTimeLocalValue(start)
}

export function defaultHourlyEndValue(): string {
  const end = new Date()
  end.setMinutes(0, 0, 0)
  end.setHours(end.getHours() + 3)
  return toDateTimeLocalValue(end)
}

/** Default room start: first day of next month (local calendar date). */
export function defaultRoomStartDateValue(): string {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return toDateInputValue(start)
}

/**
 * Builds UTC midnight for YYYY-MM-DD, then adds calendar months (UTC).
 * Matches backend DateRange.ForCalendarMonths.
 */
export function buildMonthlyPeriodIso(
  startDate: string,
  monthCount: number,
): { startTime: string; endTime: string } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(startDate)
  if (!match) {
    throw new Error('Start date must be YYYY-MM-DD.')
  }

  const year = Number(match[1])
  const monthIndex = Number(match[2]) - 1
  const day = Number(match[3])
  const start = new Date(Date.UTC(year, monthIndex, day, 0, 0, 0, 0))
  const end = new Date(Date.UTC(year, monthIndex + monthCount, day, 0, 0, 0, 0))

  return {
    startTime: start.toISOString(),
    endTime: end.toISOString(),
  }
}

export function formatUtcDateLabel(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(iso))
}

export function validateHourlyPeriod(
  startLocal: string,
  endLocal: string,
): string | null {
  const start = new Date(startLocal)
  const end = new Date(endLocal)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'Enter a valid start and end date/time.'
  }

  if (end <= start) {
    return 'End must be after start.'
  }

  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
  if (hours < HOURLY_MIN_HOURS) {
    return `Hourly bookings must last at least ${HOURLY_MIN_HOURS} hour.`
  }

  if (hours > HOURLY_MAX_HOURS) {
    return `Hourly bookings cannot exceed ${HOURLY_MAX_HOURS} hours.`
  }

  if (start.getTime() < Date.now() - 2 * 60 * 1000) {
    return 'Start cannot be in the past.'
  }

  return null
}

export function validateMonthlyPeriod(
  startDate: string,
  monthCount: number,
): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    return 'Choose a valid start date.'
  }

  if (
    !Number.isInteger(monthCount) ||
    monthCount < ROOM_MIN_MONTHS ||
    monthCount > ROOM_MAX_MONTHS
  ) {
    return `Choose between ${ROOM_MIN_MONTHS} and ${ROOM_MAX_MONTHS} months.`
  }

  const today = toDateInputValue(new Date())
  if (startDate < today) {
    return 'Subscription start date cannot be in the past.'
  }

  return null
}

export function estimateHourlySpaceCost(
  space: Space,
  startLocal: string,
  endLocal: string,
): number | null {
  if (space.hourlyRate == null) {
    return null
  }

  const start = new Date(startLocal)
  const end = new Date(endLocal)
  if (!(end > start)) {
    return null
  }

  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
  const billable = Math.ceil(hours * 4) / 4
  return billable * space.hourlyRate
}

export function estimateMonthlySpaceCost(
  space: Space,
  monthCount: number,
): number | null {
  if (space.monthlySubscriptionRate == null) {
    return null
  }

  return monthCount * space.monthlySubscriptionRate
}

export function monthOptions(
  max: number = ROOM_MAX_MONTHS,
): { value: number; label: string }[] {
  return Array.from({ length: max }, (_, index) => {
    const value = index + 1
    return {
      value,
      label: value === 1 ? '1 month' : `${value} months`,
    }
  })
}
