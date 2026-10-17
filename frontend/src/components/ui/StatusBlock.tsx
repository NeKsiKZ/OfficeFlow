import type { ReactNode } from 'react'

interface StatusBlockProps {
  tone?: 'info' | 'error' | 'success'
  title?: string
  children: ReactNode
  action?: ReactNode
}

const toneClass = {
  info: 'of-alert-info',
  error: 'of-alert-error',
  success: 'of-alert-success',
} as const

export function StatusBlock({
  tone = 'info',
  title,
  children,
  action,
}: StatusBlockProps) {
  return (
    <div
      className={`${toneClass[tone]} of-enter-delayed`}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      {title ? <p className="font-semibold tracking-[-0.01em]">{title}</p> : null}
      <div className={title ? 'mt-1' : undefined}>{children}</div>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  )
}

export function LoadingBlock({ label }: { label: string }) {
  return (
    <div
      className="of-surface of-enter-delayed flex items-center gap-3 px-4 py-6 text-ink-500"
      role="status"
    >
      <span className="of-spinner" />
      <span className="text-[0.9375rem]">{label}</span>
    </div>
  )
}
