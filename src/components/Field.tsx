import type { ReactNode } from 'react'
import type { SeasonId } from '../config/seasons'

export type FieldId = 'chalk' | 'card' | 'indigo' | 'red' | 'yellow' | 'blue' | 'green' | 'pink' | 'orange' | SeasonId

/** Kept so existing imports compile; the page ground no longer changes colour. */
export function FieldLayer() {
  return null
}

/**
 * A section painted in one fixed colour. Colour is local to the section:
 * scrolling never recolours the page.
 */
export function FieldSection({
  field,
  className = '',
  children,
  id,
  as: Tag = 'section',
  inset = false,
}: {
  field: FieldId
  className?: string
  children: ReactNode
  id?: string
  as?: 'section' | 'div' | 'footer'
  /** Render as a rounded colour block inset on the white page, not a full-width band. */
  inset?: boolean
}) {
  if (inset)
    return (
      <Tag id={id} className="px-3 py-1.5 sm:px-6">
        <div data-field={field} className={`mx-auto max-w-[1440px] overflow-hidden rounded-[36px] bg-[var(--field)] text-[var(--ink)] sm:rounded-[44px] ${className}`}>
          {children}
        </div>
      </Tag>
    )
  return (
    <Tag id={id} data-field={field} className={`bg-[var(--field)] text-[var(--ink)] ${className}`}>
      {children}
    </Tag>
  )
}
