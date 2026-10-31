import { Link } from 'react-router-dom'
import { useLang } from '../i18n'
import { useCatalog } from '../data/catalog'
import type { Product } from '../data/products'
import { OUT_OF_STOCK } from '../lib/useShop'
import { Photo } from './DuoPhoto'

export function ProductCard({ p }: { p: Product }) {
  const { pick } = useLang()
  const { catById, seasonById } = useCatalog()
  const cat = catById(p.category)
  const season = seasonById(p.season)
  const out = p.inStock === false
  return (
    <li className="reveal">
      <Link to={`/products/${p.slug}`} viewTransition className="press group block no-underline">
        <span className="relative block">
          <Photo
            file={p.images[0] ?? ''}
            alt={pick(p.name)}
            className={`aspect-[4/5] rounded-[22px] ${out ? 'opacity-60 saturate-[0.6]' : ''}`}
          />
          {out && (
            <span data-field="indigo" className="absolute top-3 left-3 rounded-full bg-[var(--field)] px-3 py-1 text-[12.5px] font-semibold text-[var(--ink)]">
              {pick(OUT_OF_STOCK)}
            </span>
          )}
          {season && ['holi', 'rakhi', 'kites', 'diwali'].includes(season.id) && (
            <span
              data-field={season.id}
              className="absolute bottom-3 left-3 rounded-full bg-[var(--field)] px-3 py-1 text-[12.5px] font-medium text-[var(--ink)]"
            >
              {pick(season.name)}
            </span>
          )}
        </span>
        <span className="block px-1 pt-3.5">
          <span className="block text-[16px] leading-snug font-semibold tracking-[-0.015em]">{pick(p.name)}</span>
          {cat && <span className="ink-2 mt-0.5 block text-[14px]">{pick(cat.name)}</span>}
        </span>
      </Link>
    </li>
  )
}

