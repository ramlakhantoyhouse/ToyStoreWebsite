// Ram Lakhan Toy House mark: an RL monogram drawn as strokes (so it renders the
// same with or without web fonts) with a small ball that takes the season colour.
export function Monogram({ className = 'size-10', ball = 'var(--field)' }: { className?: string; ball?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <rect width="48" height="48" rx="13" fill="var(--ink)" />
      <path
        d="M11.5 36V12h9a6.5 6.5 0 0 1 0 13h-9M19.5 25l7 11M30.5 12v24H37"
        fill="none"
        stroke="var(--field)"
        strokeWidth="4.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="37.2" cy="14.2" r="2.9" fill={ball} />
    </svg>
  )
}

export function Logo({ stacked = false, className = '' }: { stacked?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center ${stacked ? 'flex-col items-start gap-3' : 'gap-2.5'} ${className}`}>
      <Monogram className={stacked ? 'size-12' : 'size-10'} />
      <span className="leading-none">
        <span className={`block font-semibold tracking-[-0.02em] text-[var(--ink)] ${stacked ? 'text-xl' : 'text-[17px]'}`}>Ram Lakhan</span>
        <span className={`mt-1 block font-medium tracking-[0.22em] opacity-75 uppercase ${stacked ? 'text-xs' : 'text-[10.5px]'}`}>
          Toy House
        </span>
      </span>
    </span>
  )
}
