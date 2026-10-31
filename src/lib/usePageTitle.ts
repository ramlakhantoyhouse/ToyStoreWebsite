import { useEffect } from 'react'

const BASE = 'Ram Lakhan Toy House'

export function usePageTitle(title?: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${BASE}, Najafgarh` : `${BASE} — Toys, Festival Items & Sports in Najafgarh`
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description)
  }, [title, description])
}
