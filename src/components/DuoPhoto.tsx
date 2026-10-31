import credits from '../data/photo-credits.json'
import type { SeasonId } from '../config/seasons'
import { img } from '../data/products'

const sizes = new Map(credits.map((c) => [c.file, { w: c.w, h: c.h }]))

/** Size of a bundled photo ("toy-cars" or "/images/toy-cars.webp"); unknown for uploaded URLs. */
function sizeOf(file: string) {
  const m = /^(?:\/images\/)?([\w-]+)(?:\.webp)?$/.exec(file)
  return m ? sizes.get(`${m[1]}.webp`) : undefined
}

/** `file` is a bundled image name ("toy-cars") or any photo URL / data URL from the admin. */
function Img({ file, alt, eager, className }: { file: string; alt: string; eager?: boolean; className?: string }) {
  const size = sizeOf(file)
  return (
    <img
      src={img(file)}
      alt={alt}
      width={size?.w}
      height={size?.h}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={`absolute inset-0 h-full w-full object-cover ${className ?? ''}`}
    />
  )
}

/** Season photo (true colour). Name kept for existing imports. */
export function DuoPhoto({
  file,
  alt,
  className = '',
  eager = false,
}: {
  file: string
  season?: SeasonId
  alt: string
  className?: string
  eager?: boolean
}) {
  return (
    <div className={`relative overflow-hidden bg-[var(--card)] ${className}`}>
      <Img file={file} alt={alt} eager={eager} />
    </div>
  )
}

/** True-colour photo with stable size; zooms gently when its group is hovered. */
export function Photo({ file, alt, className = '', eager = false }: { file: string; alt: string; className?: string; eager?: boolean }) {
  return (
    <div className={`relative overflow-hidden bg-[var(--card)] ${className}`}>
      <Img
        file={file}
        alt={alt}
        eager={eager}
        className="transition-transform duration-700 ease-[var(--ease-out)] [@media(hover:hover)]:group-hover:scale-[1.05]"
      />
    </div>
  )
}
