import { mapsEmbed } from '../config/shop'

export function MapFrame() {
  return (
    <div className="overflow-hidden rounded-[28px] bg-[color-mix(in_srgb,var(--ink)_8%,transparent)]">
      <iframe
        title="Map: Ram Lakhan Toy House, Najafgarh"
        src={mapsEmbed}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="block aspect-[4/3] w-full border-0 dark:[filter:invert(0.9)_hue-rotate(180deg)_saturate(0.7)]"
      />
    </div>
  )
}
