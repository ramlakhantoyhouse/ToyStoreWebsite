import type { Catalog, Category, EnquiryRow, EnquiryStatus, NewEnquiry, Product, Season, Settings } from './types'
import { products as starterProducts, categories as starterCategories } from './products'
import { seasons as starterSeasons } from '../config/seasons'
import { shop } from '../config/shop'

export type AdminUser = { id: string; email: string }

/**
 * Everything the site and the admin need from storage. Two implementations:
 * Supabase (real, when VITE_SUPABASE_URL is set) and a local demo that keeps
 * data in this browser so the admin can be tried before Supabase is set up.
 */
export interface Backend {
  mode: 'supabase' | 'demo'

  // public reads
  loadCatalog(): Promise<Catalog>

  // public write
  addEnquiry(e: NewEnquiry & { website?: string }): Promise<void>

  // auth (owner only)
  getUser(): Promise<AdminUser | null>
  /** true when the logged-in account is listed in the admins table */
  isAdmin(): Promise<boolean>
  onAuthChange(cb: (u: AdminUser | null) => void): () => void
  signIn(email: string, password: string): Promise<void>
  signOut(): Promise<void>
  sendPasswordReset(email: string): Promise<void>
  updatePassword(password: string): Promise<void>

  // admin writes
  saveProduct(p: Product, previousSlug?: string): Promise<void>
  deleteProduct(slug: string): Promise<void>
  saveCategory(c: Category, previousId?: string): Promise<void>
  deleteCategory(id: string): Promise<void>
  saveSeason(s: Season): Promise<void>
  /** refuses while any product still uses the season */
  deleteSeason(id: string): Promise<void>
  saveSettings(s: Settings): Promise<void>
  uploadPhoto(file: Blob, nameHint: string): Promise<string> // returns public URL
  deletePhoto(url: string): Promise<void>

  // enquiries (owner only)
  listEnquiries(): Promise<EnquiryRow[]>
  setEnquiryStatus(id: string, status: EnquiryStatus): Promise<void>
  deleteEnquiry(id: string): Promise<void>

  // first-run: copy the bundled starter catalogue into storage
  isEmpty(): Promise<boolean>
  importStarter(): Promise<void>
}

export const SEASON_IN_USE = 'Move the products in this season to another season first.'

export function defaultSettings(): Settings {
  const day = (dow: number) => ({ dow, open: shop.hours.open, close: dow === 3 ? shop.hours.wedClose : shop.hours.close })
  return {
    phone: shop.phone,
    whatsapp: shop.whatsapp,
    hours: [1, 2, 3, 4, 5, 6, 0].map(day),
    holiday: { on: false, text: { en: 'The shop is closed today.', hi: 'आज दुकान बंद है।' } },
    banner: { on: false, text: { en: '', hi: '' } },
  }
}

export function starterCatalog(): Catalog {
  return {
    products: starterProducts.map((p, i) => ({ inStock: true, sort: i, ...p })),
    categories: starterCategories.map((c, i) => ({ sort: i, ...c })),
    seasons: starterSeasons,
    settings: defaultSettings(),
  }
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || `item-${Date.now().toString(36)}`

let instance: Promise<Backend> | null = null

/** The configured backend, created once. */
export function getBackend(): Promise<Backend> {
  if (!instance) {
    // Accept a pasted Data API URL too: keep only https://<project>.supabase.co
    const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim().replace(/\/(rest|auth|storage)\/v1\/?.*$/, '').replace(/\/+$/, '')
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
    instance =
      url && key
        ? import('./supabaseBackend').then((m) => m.createSupabaseBackend(url, key))
        : import('./demoBackend').then((m) => m.createDemoBackend())
  }
  return instance
}
