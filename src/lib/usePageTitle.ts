import { useEffect } from 'react'

const BASE = 'Ram Lakhan Toy House'
const SITE = 'https://ramlakhantoyhouse.vercel.app'

export function usePageTitle(title?: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${BASE}, Najafgarh` : `${BASE} — Toys, Festival Items & Sports in Najafgarh`
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description)
    // Each page is its own canonical URL (query strings like ?c=toys collapse to the page).
    const href = SITE + window.location.pathname.replace(/\/+$/, '')
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', href || `${SITE}/`)
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', href || `${SITE}/`)
  }, [title, description])
}
