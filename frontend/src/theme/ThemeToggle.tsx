import { useTheme } from './ThemeProvider'
import type { ThemePreference } from './theme'

const labels: Record<ThemePreference, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
}

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { preference, cyclePreference } = useTheme()

  return (
    <button
      type="button"
      onClick={cyclePreference}
      className={['of-btn-ghost shrink-0 px-3', className].filter(Boolean).join(' ')}
      aria-label={`Theme: ${labels[preference]}. Click to change.`}
      title={`Theme: ${labels[preference]}`}
    >
      <ThemeIcon preference={preference} />
      <span className="hidden sm:inline">{labels[preference]}</span>
    </button>
  )
}

function ThemeIcon({ preference }: { preference: ThemePreference }) {
  if (preference === 'dark') {
    return (
      <svg
        viewBox="0 0 20 20"
        className="h-4 w-4"
        fill="currentColor"
        aria-hidden
      >
        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
      </svg>
    )
  }

  if (preference === 'system') {
    return (
      <svg
        viewBox="0 0 20 20"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden
      >
        <rect x="3" y="4" width="14" height="10" rx="1.5" />
        <path d="M7 16h6" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="currentColor"
      aria-hidden
    >
      <path d="M10 3.5a.75.75 0 01.75.75V5a.75.75 0 01-1.5 0V4.25A.75.75 0 0110 3.5zM10 15a.75.75 0 01.75.75v.75a.75.75 0 01-1.5 0v-.75A.75.75 0 0110 15zM4.22 4.22a.75.75 0 011.06 0l.53.53a.75.75 0 11-1.06 1.06l-.53-.53a.75.75 0 010-1.06zM14.19 14.19a.75.75 0 011.06 0l.53.53a.75.75 0 11-1.06 1.06l-.53-.53a.75.75 0 010-1.06zM3.5 10a.75.75 0 01.75-.75H5a.75.75 0 010 1.5H4.25A.75.75 0 013.5 10zM15 10a.75.75 0 01.75-.75h.75a.75.75 0 010 1.5h-.75A.75.75 0 0115 10zM4.22 15.78a.75.75 0 010-1.06l.53-.53a.75.75 0 111.06 1.06l-.53.53a.75.75 0 01-1.06 0zM14.19 5.81a.75.75 0 010-1.06l.53-.53a.75.75 0 111.06 1.06l-.53.53a.75.75 0 01-1.06 0zM10 7a3 3 0 100 6 3 3 0 000-6z" />
    </svg>
  )
}
