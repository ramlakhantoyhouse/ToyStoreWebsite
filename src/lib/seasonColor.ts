import type { CSSProperties } from 'react'
import { BUILTIN_SEASON_IDS, type Season } from '../config/seasons'

/** Toy-box colours the owner can pick for a season block. */
export const SEASON_SWATCHES = [
  '#e63d86',
  '#38c5d6',
  '#ff9a3c',
  '#3a6bff',
  '#ffc83a',
  '#22b573',
  '#8b5cf6',
  '#ef4444',
  '#14b8a6',
  '#f97316',
]

/** Fill used for an added season that has no colour picked yet. */
export const DEFAULT_SEASON_COLOR = '#8b5cf6'

const DARK_INK = '#14163a'
const LIGHT_INK = '#ffffff'

function luminance(hex: string) {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6)
  const n = parseInt(full, 16)
  if (Number.isNaN(n)) return 0
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]
}

const contrast = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)

/** Text colour (dark indigo or white) that reads best on this fill. */
export function inkFor(hex: string) {
  const l = luminance(hex)
  return contrast(l, luminance(DARK_INK)) >= contrast(l, luminance(LIGHT_INK)) ? DARK_INK : LIGHT_INK
}

export const isBuiltinSeason = (id: string) => (BUILTIN_SEASON_IDS as readonly string[]).includes(id)

/**
 * Inline colour for a season block. Built-in seasons without a picked colour
 * keep their CSS rule ([data-field='holi'] etc.), so this returns undefined.
 */
export function seasonStyle(s: Pick<Season, 'id' | 'color'> | undefined | null): CSSProperties | undefined {
  if (!s) return undefined
  const color = s.color || (isBuiltinSeason(s.id) ? undefined : DEFAULT_SEASON_COLOR)
  if (!color) return undefined
  return { '--field': color, '--ink': inkFor(color) } as CSSProperties
}
