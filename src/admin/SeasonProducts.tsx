import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightLeft, ExternalLink, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCatalog } from '../data/catalog'
import { img, type Product } from '../data/products'
import { useLang } from '../i18n'
import { Select, Spinner, useAdmin, useL } from './ui'

const errMsg = (e: unknown, fallback: string) => (e instanceof Error && e.message ? e.message : fallback)

/**
 * Every product in one season, with ways to clear the season out right here:
 * open a product, delete it (tap twice), or move / delete them all at once.
 */
export function SeasonProducts({ seasonId }: { seasonId: string }) {
  const L = useL()
  const { lang } = useLang()
  const { backend } = useAdmin()
  const { products, seasons, catById, reload } = useCatalog()
  const list = products.filter((p) => p.season === seasonId)
  const others = seasons.filter((s) => s.id !== seasonId)

  const [armed, setArmed] = useState<string | null>(null) // product slug waiting for 2nd tap
  const [busy, setBusy] = useState<string | null>(null) // slug | 'move' | 'all'
  const [target, setTarget] = useState(others[0]?.id ?? '')
  const [armAll, setArmAll] = useState(false)

  const name = (p: Product) => p.name[lang] || p.name.en

  async function removeOne(p: Product) {
    if (armed !== p.slug) {
      setArmed(p.slug)
      return
    }
    setBusy(p.slug)
    try {
      await backend.deleteProduct(p.slug)
      for (const u of p.images) await backend.deletePhoto(img(u)).catch(() => {})
      await reload()
      toast.success(L(`${p.name.en} deleted.`, `${name(p)} हटा दिया गया।`))
    } catch (e) {
      toast.error(errMsg(e, L('Could not delete. Please try again.', 'हटाया नहीं जा सका। फिर से कोशिश करें।')))
    } finally {
      setBusy(null)
      setArmed(null)
    }
  }

  async function moveAll() {
    if (!target) return
    setBusy('move')
    try {
      for (const p of list) await backend.saveProduct({ ...p, season: target })
      await reload()
      const to = seasons.find((s) => s.id === target)
      toast.success(L(`Moved ${list.length} product(s) to ${to?.name.en}.`, `${list.length} सामान ${to?.name.hi || to?.name.en} में डाल दिए।`))
    } catch (e) {
      toast.error(errMsg(e, L('Could not move. Please try again.', 'नहीं हो सका। फिर से कोशिश करें।')))
    } finally {
      setBusy(null)
    }
  }

  async function deleteAll() {
    if (!armAll) {
      setArmAll(true)
      return
    }
    setBusy('all')
    try {
      for (const p of list) {
        await backend.deleteProduct(p.slug)
        for (const u of p.images) await backend.deletePhoto(img(u)).catch(() => {})
      }
      await reload()
      toast.success(L(`Deleted ${list.length} product(s).`, `${list.length} सामान हटा दिए।`))
    } catch (e) {
      toast.error(errMsg(e, L('Could not delete. Please try again.', 'हटाया नहीं जा सका। फिर से कोशिश करें।')))
    } finally {
      setBusy(null)
      setArmAll(false)
    }
  }

  if (!list.length)
    return <p className="ink-2 rounded-[16px] bg-[var(--card)] px-4 py-3 text-[14.5px]">{L('No products in this season.', 'इस मौसम में कोई सामान नहीं है।')}</p>

  return (
    <div className="grid gap-3">
      <ul className="grid gap-2" role="list">
        {list.map((p) => (
          <li key={p.slug} className="flex min-w-0 items-center gap-3 rounded-[16px] bg-[var(--card)] p-2">
            <span className="size-12 shrink-0 overflow-hidden rounded-[12px] bg-[var(--chalk)]">
              {p.images[0] && <img src={img(p.images[0])} alt="" loading="lazy" className="size-full object-cover" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-semibold">{name(p)}</span>
              <span className="ink-2 block truncate text-[13px]">{catById(p.category)?.name[lang] ?? p.category}</span>
            </span>
            <Link
              to={`/admin/products/${p.slug}`}
              aria-label={L(`Open ${p.name.en}`, `${name(p)} खोलें`)}
              className="press grid size-11 shrink-0 place-items-center rounded-full text-[var(--ink)] no-underline hover:bg-[var(--chalk)]"
            >
              <ExternalLink className="size-[18px]" />
            </Link>
            <button
              type="button"
              onClick={() => void removeOne(p)}
              disabled={!!busy}
              aria-label={L(`Delete ${p.name.en}`, `${name(p)} हटाएँ`)}
              className={`press flex h-11 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full border-0 px-3 text-[13.5px] font-semibold disabled:opacity-50 ${
                armed === p.slug ? 'bg-[var(--danger)] text-white' : 'bg-transparent text-[var(--danger)] hover:bg-[var(--chalk)]'
              }`}
            >
              {busy === p.slug ? <Spinner className="size-4" /> : <Trash2 className="size-[18px]" />}
              {armed === p.slug && L('Sure?', 'पक्का?')}
            </button>
          </li>
        ))}
      </ul>

      {others.length > 0 && (
        <div className="grid gap-2 rounded-[16px] bg-[var(--card)] p-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <Select
            label={L('Move all of them to', 'सबको इस मौसम में डालें')}
            value={target}
            onChange={setTarget}
            options={others.map((s) => ({ value: s.id, label: s.name[lang] || s.name.en }))}
          />
          <button type="button" onClick={() => void moveAll()} disabled={!!busy} className="btn btn-ink press disabled:opacity-50">
            {busy === 'move' ? <Spinner /> : <ArrowRightLeft className="size-[18px]" />} {L('Move all', 'सब डालें')}
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => void deleteAll()}
        disabled={!!busy}
        className={`btn press w-full disabled:opacity-50 ${armAll ? 'bg-[var(--danger)] text-white' : 'btn-line text-[var(--danger)]'}`}
      >
        {busy === 'all' ? <Spinner /> : <Trash2 className="size-[18px]" />}
        {armAll ? L(`Tap again to delete all ${list.length}`, `सभी ${list.length} हटाने के लिए फिर दबाएँ`) : L(`Delete all ${list.length} products`, `सभी ${list.length} सामान हटाएँ`)}
      </button>
    </div>
  )
}
