import { cn } from '@/lib/utils'

export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string
  showWordmark?: boolean
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        aria-hidden="true"
        className="relative grid size-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-heat-200 shadow-lg shadow-primary/25"
      >
        {/* Stylized "M" / soundwave mark */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          className="text-primary-foreground"
        >
          <path
            d="M4 15V9M8 19V5M12 15V9M16 21V3M20 15V9"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </span>
      {showWordmark && (
        <span className="font-display text-lg font-extrabold uppercase tracking-tight text-foreground">
          Interview <span className="heat-text">Coach</span>
        </span>
      )}
    </span>
  )
}
