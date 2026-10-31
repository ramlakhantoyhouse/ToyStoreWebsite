import { useState } from 'react'
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCatalog } from '../data/catalog'
import { slugify } from '../data/backend'
import { img, type Category } from '../data/products'
import { useLang, type Bi } from '../i18n'
import { BiInput, Confirm, EmptyState, PageHead, Panel, Spinner, useAdmin, useL, useUnsavedWarning } from './ui'
import { CoverPhoto } from './CoverPhoto'

const errMsg = (e: unknown, fallback: string) => (e instanceof Error && e.message ? e.message : fallback)

/** /admin/categories — the groups customers browse by (Toys, Holi, Sports…). */
export default function Categories() {
  const L = useL()
  const { lang } = useLang()
  const { backend } = useAdmin()
  const { categories, products, reload } = useCatalog()
  const [editing, setEditing] = useState<string | null>(null) // category id, or 'new'
  const [moving, setMoving] = useState(false)
  const [toDelete, setToDelete] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState(false)

  const count = (id: string) => products.filter((p) => p.category === id).length

  async function move(index: number, dir: -1 | 1) {
    const j = index + dir
    if (j < 0 || j >= categories.length) return
    const list = [...categories]
    ;[list[index], list[j]] = [list[j], list[index]]
    setMoving(true)
    try {
      // save the new position of every category whose place changed
      for (const [i, c] of list.entries()) {
        if (c.sort !== i) await backend.saveCategory({ ...c, sort: i }, c.id)
      }
      await reload()
    } catch (e) {
      toast.error(errMsg(e, L('Could not change the order. Please try again.', 'क्रम नहीं बदल सका। फिर से कोशिश करें।')))
    } finally {
      setMoving(false)
    }
  }

  async function remove() {
    if (!toDelete) return
    setDeleting(true)
    try {
      await backend.deleteCategory(toDelete.id)
      await reload()
      toast.success(L('Category deleted.', 'कैटेगरी हटा दी गई।'))
      setToDelete(null)
    } catch (e) {
      toast.error(errMsg(e, L('Could not delete this category.', 'यह कैटेगरी हटाई नहीं जा सकी।')))
      setToDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="enter">
      <PageHead
        title={L('Categories', 'कैटेगरी')}
        sub={L(
          'The groups customers browse by on the website. Use the arrows to change their order.',
          'वेबसाइट पर ग्राहक इन्हीं ग्रुप से सामान देखते हैं। क्रम बदलने के लिए तीर दबाएँ।',
        )}
        actions={
          editing !== 'new' && (
            <button type="button" onClick={() => setEditing('new')} className="btn btn-ink press">
              <Plus className="size-5" /> {L('Add category', 'कैटेगरी जोड़ें')}
            </button>
          )
        }
      />

      {editing === 'new' && (
        <div className="mb-4">
          <CategoryEditor
            isNew
            initial={{ id: '', name: { en: '', hi: '' }, image: '', sort: categories.length }}
            taken={categories.map((c) => c.id)}
            onDone={() => setEditing(null)}
          />
        </div>
      )}

      {categories.length === 0 && editing !== 'new' ? (
        <EmptyState
          title={L('No categories yet', 'अभी कोई कैटेगरी नहीं है')}
          sub={L('Add your first category, like "Toys" or "Sports", so customers can find things easily.', 'पहली कैटेगरी जोड़ें, जैसे "खिलौने" या "खेल", ताकि ग्राहक आसानी से सामान ढूँढ सकें।')}
          action={
            <button type="button" onClick={() => setEditing('new')} className="btn btn-ink press">
              <Plus className="size-5" /> {L('Add category', 'कैटेगरी जोड़ें')}
            </button>
          }
        />
      ) : (
        <ul className="m-0 grid list-none gap-3 p-0">
          {categories.map((c, i) => {
            const n = count(c.id)
            const open = editing === c.id
            return (
              <li key={c.id}>
                <Panel className="!p-3 sm:!p-4">
                  <div className="flex items-center gap-3">
                    <div className="size-16 shrink-0 overflow-hidden rounded-[16px] bg-[var(--chalk)] sm:size-20">
                      {c.image && <img src={img(c.image)} alt="" className="size-full object-cover" loading="lazy" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[17px] font-bold tracking-[-0.02em]">{c.name[lang] || c.name.en}</p>
                      <p className="ink-2 truncate text-[13.5px]">{lang === 'hi' ? c.name.en : c.name.hi}</p>
                      <span data-field={n ? 'yellow' : 'card'} className="mt-1 inline-block rounded-full bg-[var(--field)] px-2.5 py-0.5 text-[12.5px] font-semibold text-[var(--ink)]">
                        {n} {n === 1 ? L('product', 'सामान') : L('products', 'सामान')}
                      </span>
                    </div>
                    <div className="flex shrink-0 flex-col gap-1">
                      <IconBtn label={L('Move up', 'ऊपर करें')} disabled={moving || i === 0} onClick={() => void move(i, -1)}>
                        <ArrowUp className="size-5" />
                      </IconBtn>
                      <IconBtn label={L('Move down', 'नीचे करें')} disabled={moving || i === categories.length - 1} onClick={() => void move(i, 1)}>
                        <ArrowDown className="size-5" />
                      </IconBtn>
                    </div>
                  </div>

                  {!open && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setEditing(c.id)} className="btn btn-line press !min-h-12 !px-4">
                        <Pencil className="size-4" /> {L('Edit', 'बदलें')}
                      </button>
                      <button type="button" onClick={() => setToDelete(c)} className="btn press !min-h-12 bg-transparent !px-4 text-[var(--danger)] shadow-[inset_0_0_0_2px_var(--danger)]">
                        <Trash2 className="size-4" /> {L('Delete', 'हटाएँ')}
                      </button>
                    </div>
                  )}

                  {open && (
                    <div className="mt-4">
                      <CategoryEditor initial={c} taken={categories.map((x) => x.id)} onDone={() => setEditing(null)} />
                    </div>
                  )}
                </Panel>
              </li>
            )
          })}
        </ul>
      )}

      {moving && (
        <p className="ink-2 mt-3 flex items-center gap-2 text-[14px]" role="status">
          <Spinner className="size-4" /> {L('Saving the new order…', 'नया क्रम सेव हो रहा है…')}
        </p>
      )}

      <Confirm
        open={!!toDelete}
        title={L('Delete this category?', 'यह कैटेगरी हटाएँ?')}
        body={
          toDelete && count(toDelete.id) > 0
            ? L(
                `"${toDelete.name.en}" still has ${count(toDelete.id)} product(s). Move them to another category first, then delete.`,
                `"${toDelete.name.hi || toDelete.name.en}" में अभी ${count(toDelete.id)} सामान हैं। पहले उन्हें दूसरी कैटेगरी में डालें, फिर हटाएँ।`,
              )
            : L('It will disappear from the website. This cannot be undone.', 'यह वेबसाइट से हट जाएगी। इसे वापस नहीं लाया जा सकता।')
        }
        confirmLabel={L('Delete', 'हटाएँ')}
        danger
        busy={deleting}
        onConfirm={() => void remove()}
        onClose={() => setToDelete(null)}
      />
    </div>
  )
}

function IconBtn({ label, disabled, onClick, children }: { label: string; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="press grid size-12 cursor-pointer place-items-center rounded-full border-0 bg-[var(--chalk)] text-[var(--ink)] disabled:cursor-default disabled:opacity-30"
    >
      {children}
    </button>
  )
}

function CategoryEditor({ initial, isNew, taken, onDone }: { initial: Category; isNew?: boolean; taken: string[]; onDone: () => void }) {
  const L = useL()
  const { backend } = useAdmin()
  const { reload } = useCatalog()
  const [name, setName] = useState<Bi>(initial.name)
  const [image, setImage] = useState(initial.image)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const dirty = name.en !== initial.name.en || name.hi !== initial.name.hi || image !== initial.image
  useUnsavedWarning(dirty)

  async function save() {
    const en = name.en.trim()
    if (!en) {
      setError(L('Please type the English name.', 'कृपया अंग्रेज़ी नाम लिखें।'))
      return
    }
    setError('')
    let id = initial.id
    if (isNew) {
      const base = slugify(en)
      id = base
      for (let n = 2; taken.includes(id); n++) id = `${base}-${n}`
    }
    setSaving(true)
    try {
      const cat: Category = { ...initial, id, name: { en, hi: name.hi.trim() || en }, image }
      await backend.saveCategory(cat, isNew ? undefined : initial.id)
      await reload()
      toast.success(isNew ? L('Category added.', 'कैटेगरी जुड़ गई।') : L('Changes saved.', 'बदलाव सेव हो गए।'))
      onDone()
    } catch (e) {
      toast.error(errMsg(e, L('Could not save. Please try again.', 'सेव नहीं हो सका। फिर से कोशिश करें।')))
    } finally {
      setSaving(false)
    }
  }

  const body = (
    <div className="grid gap-5">
      {isNew && <h2 className="text-[20px] font-bold tracking-[-0.03em]">{L('New category', 'नई कैटेगरी')}</h2>}
      <BiInput label={L('Name', 'नाम')} value={name} onChange={setName} required error={error} placeholder={{ en: 'e.g. Toys', hi: 'जैसे खिलौने' }} />
      <div>
        <p className="mb-2 text-[14.5px] font-semibold">{L('Cover photo', 'कवर फ़ोटो')}</p>
        <CoverPhoto value={image} onChange={setImage} nameHint={`category-${slugify(name.en || 'new')}`} alt={name.en} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={onDone} disabled={saving} className="btn btn-line press">
          {L('Cancel', 'रहने दें')}
        </button>
        <button type="button" onClick={() => void save()} disabled={saving} className="btn btn-ink press disabled:opacity-60">
          {saving ? <Spinner /> : isNew ? L('Add', 'जोड़ें') : L('Save', 'सेव करें')}
        </button>
      </div>
    </div>
  )

  return isNew ? <Panel className="border-2 border-[var(--ink)]">{body}</Panel> : body
}
