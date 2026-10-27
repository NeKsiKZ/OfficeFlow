export type SpacesViewMode = 'map' | 'list'

interface SpacesViewSwitcherProps {
  value: SpacesViewMode
  onChange: (view: SpacesViewMode) => void
}

export function SpacesViewSwitcher({
  value,
  onChange,
}: SpacesViewSwitcherProps) {
  const isList = value === 'list'

  function toggle() {
    onChange(isList ? 'map' : 'list')
  }

  return (
    <div className="inline-flex items-center gap-2.5">
      <button
        type="button"
        onClick={() => onChange('map')}
        className={[
          'of-caption min-w-[2rem] text-right transition-colors duration-150',
          !isList ? 'font-semibold text-ink-900' : 'text-ink-400',
        ].join(' ')}
      >
        Map
      </button>

      <button
        type="button"
        role="switch"
        aria-checked={isList}
        aria-label={isList ? 'List view' : 'Map view'}
        onClick={toggle}
        className={[
          'relative h-7 w-12 shrink-0 rounded-pill p-0.5',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600',
          'transition-colors duration-200 ease-out',
          isList ? 'bg-brand-600' : 'bg-[color:var(--of-fill-strong)]',
        ].join(' ')}
      >
        <span
          aria-hidden
          className={[
            'pointer-events-none block h-6 w-6 rounded-full shadow-sm',
            'bg-[color:var(--of-bg-field)] ring-1 ring-[color:var(--of-separator)]',
            'transition-transform duration-200 ease-out motion-reduce:transition-none',
            isList ? 'translate-x-5' : 'translate-x-0',
          ].join(' ')}
        />
      </button>

      <button
        type="button"
        onClick={() => onChange('list')}
        className={[
          'of-caption min-w-[2rem] text-left transition-colors duration-150',
          isList ? 'font-semibold text-ink-900' : 'text-ink-400',
        ].join(' ')}
      >
        List
      </button>
    </div>
  )
}
