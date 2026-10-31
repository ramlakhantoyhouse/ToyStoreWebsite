import { useRef, useState } from 'react'
import { Camera } from 'lucide-react'
import { toast } from 'sonner'
import { compressPhoto } from '../lib/photo'
import { img } from '../data/products'
import { Spinner, useAdmin, useL } from './ui'

/**
 * One cover photo with a big "Change photo" button. The picked photo is
 * shrunk on the phone, uploaded, and its URL handed back via onChange.
 */
export function CoverPhoto({ value, onChange, nameHint, alt }: { value: string; onChange: (url: string) => void; nameHint: string; alt: string }) {
  const L = useL()
  const { backend } = useAdmin()
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  async function pick(file: File | undefined) {
    if (!file) return
    setBusy(true)
    try {
      const blob = await compressPhoto(file)
      const url = await backend.uploadPhoto(blob, nameHint)
      onChange(url)
      toast.success(L('Photo ready. Press Save to keep it.', 'फ़ोटो तैयार है। रखने के लिए सेव दबाएँ।'))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : L('Could not upload the photo.', 'फ़ोटो अपलोड नहीं हो सकी।'))
    } finally {
      setBusy(false)
      if (input.current) input.current.value = ''
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="size-24 shrink-0 overflow-hidden rounded-[18px] bg-[var(--chalk)]">
        {value ? <img src={img(value)} alt={alt} className="size-full object-cover" /> : null}
      </div>
      <div>
        <input ref={input} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => void pick(e.target.files?.[0])} />
        <button type="button" disabled={busy} onClick={() => input.current?.click()} className="btn btn-line press min-h-12">
          {busy ? <Spinner /> : <Camera className="size-5" />}
          {busy ? L('Uploading…', 'अपलोड हो रहा है…') : L('Change photo', 'फ़ोटो बदलें')}
        </button>
        <p className="ink-2 mt-1.5 text-[13px]">{L('Use a clear, bright photo.', 'साफ़ और रोशनी वाली फ़ोटो लगाएँ।')}</p>
      </div>
    </div>
  )
}
