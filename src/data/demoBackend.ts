import type { Backend, AdminUser } from './backend'
import { starterCatalog } from './backend'
import type { Catalog, EnquiryRow } from './types'

/*
  Demo mode: everything lives in this browser's localStorage. It lets the shop
  owner try the admin before Supabase is connected. Nothing here reaches other
  visitors. Demo login: demo@ramlakhan.shop / demo1234
*/

export const DEMO_EMAIL = 'demo@ramlakhan.shop'
export const DEMO_PASSWORD = 'demo1234'

const K = { catalog: 'rl-demo-catalog', enquiries: 'rl-demo-enquiries', user: 'rl-demo-user' }

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    throw new Error('Browser storage is full. Use smaller photos, or connect Supabase for real storage.')
  }
}

const wait = (ms = 250) => new Promise((r) => setTimeout(r, ms))

export function createDemoBackend(): Backend {
  const listeners = new Set<(u: AdminUser | null) => void>()
  const cat = (): Catalog => read(K.catalog, starterCatalog())
  const save = (c: Catalog) => write(K.catalog, c)
  const emit = () => {
    const u = read<AdminUser | null>(K.user, null)
    listeners.forEach((l) => l(u))
  }

  return {
    mode: 'demo',

    async loadCatalog() {
      return cat()
    },

    async addEnquiry(e) {
      if (e.website) return
      const rows = read<EnquiryRow[]>(K.enquiries, [])
      const { website: _ignored, ...rest } = e
      void _ignored
      rows.unshift({ ...rest, id: crypto.randomUUID(), created_at: new Date().toISOString(), status: 'new' })
      write(K.enquiries, rows.slice(0, 500))
    },

    async getUser() {
      return read<AdminUser | null>(K.user, null)
    },
    onAuthChange(cb) {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    async signIn(email, password) {
      await wait(400)
      if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) throw new Error('Wrong email or password.')
      write(K.user, { id: 'demo', email: DEMO_EMAIL })
      emit()
    },
    async signOut() {
      localStorage.removeItem(K.user)
      emit()
    },
    async sendPasswordReset() {
      await wait()
    },
    async updatePassword() {
      await wait()
    },

    async saveProduct(p, previousSlug) {
      await wait()
      const c = cat()
      const key = previousSlug ?? p.slug
      const i = c.products.findIndex((x) => x.slug === key)
      if (i >= 0) c.products[i] = p
      else c.products.unshift({ ...p, sort: Math.min(0, ...c.products.map((x) => x.sort ?? 0)) - 1 })
      save(c)
    },
    async deleteProduct(slug) {
      await wait()
      const c = cat()
      c.products = c.products.filter((p) => p.slug !== slug)
      save(c)
    },
    async saveCategory(category, previousId) {
      await wait()
      const c = cat()
      const key = previousId ?? category.id
      const i = c.categories.findIndex((x) => x.id === key)
      if (i >= 0) c.categories[i] = category
      else c.categories.push({ ...category, sort: c.categories.length })
      if (previousId && previousId !== category.id) {
        c.products = c.products.map((p) => (p.category === previousId ? { ...p, category: category.id } : p))
      }
      save(c)
    },
    async deleteCategory(id) {
      await wait()
      const c = cat()
      if (c.products.some((p) => p.category === id)) throw new Error('Move or delete the products in this category first.')
      c.categories = c.categories.filter((x) => x.id !== id)
      save(c)
    },
    async saveSeason(s) {
      await wait()
      const c = cat()
      c.seasons = c.seasons.map((x) => (x.id === s.id ? s : x))
      save(c)
    },
    async saveSettings(s) {
      await wait()
      const c = cat()
      c.settings = s
      save(c)
    },
    async uploadPhoto(file) {
      // demo keeps the (already compressed) photo inline
      return await new Promise<string>((resolve, reject) => {
        const r = new FileReader()
        r.onload = () => resolve(String(r.result))
        r.onerror = () => reject(new Error('Could not read the photo.'))
        r.readAsDataURL(file)
      })
    },
    async deletePhoto() {},

    async listEnquiries() {
      return read<EnquiryRow[]>(K.enquiries, [])
    },
    async setEnquiryStatus(id, status) {
      const rows = read<EnquiryRow[]>(K.enquiries, []).map((r) => (r.id === id ? { ...r, status } : r))
      write(K.enquiries, rows)
    },
    async deleteEnquiry(id) {
      write(
        K.enquiries,
        read<EnquiryRow[]>(K.enquiries, []).filter((r) => r.id !== id),
      )
    },

    async isEmpty() {
      return false
    },
    async importStarter() {
      save(starterCatalog())
    },
  }
}
