import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'
import type { Backend, AdminUser } from './backend'
import { defaultSettings, SEASON_IN_USE, starterCatalog } from './backend'
import { sortedSeasons } from './catalog'
import type { Category, EnquiryRow, Product, Season, Settings } from './types'

/*
  Supabase storage. Catalogue rows keep their full shape in a jsonb `data`
  column so the site and the database never drift apart. Security lives in
  supabase/schema.sql (row level security): visitors can read the catalogue
  and add an enquiry; only accounts listed in `admins` can change anything.
*/

const BUCKET = 'product-photos'

const toUser = (u: User | null | undefined): AdminUser | null => (u ? { id: u.id, email: u.email ?? '' } : null)

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message)
  return res.data
}

export function createSupabaseBackend(url: string, key: string): Backend {
  const sb: SupabaseClient = createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } })

  return {
    mode: 'supabase',

    async loadCatalog() {
      const [p, c, s, st] = await Promise.all([
        sb.from('products').select('data, sort').order('sort'),
        sb.from('categories').select('data, sort').order('sort'),
        sb.from('seasons').select('data'),
        sb.from('settings').select('data').eq('id', 1).maybeSingle(),
      ])
      const products = (check(p) ?? []).map((r) => r.data as Product)
      const categories = (check(c) ?? []).map((r) => r.data as Category)
      const seasonsRows = (check(s) ?? []).map((r) => r.data as Season)
      const starter = starterCatalog()
      // every saved season (including added ones), plus starter seasons not yet in the table
      const missing = starter.seasons.filter((d) => !seasonsRows.some((x) => x.id === d.id))
      const seasons = sortedSeasons([...seasonsRows, ...missing])
      const settings = (check(st)?.data as Settings | undefined) ?? defaultSettings()
      return { products, categories, seasons, settings }
    },

    async addEnquiry(e) {
      if (e.website) return
      const { website: _ignored, ...row } = e
      void _ignored
      check(await sb.from('enquiries').insert(row))
    },

    async isAdmin() {
      const { data, error } = await sb.rpc('is_admin')
      if (error) return false
      return data === true
    },
    async getUser() {
      const { data } = await sb.auth.getUser()
      return toUser(data.user)
    },
    onAuthChange(cb) {
      const { data } = sb.auth.onAuthStateChange((_e, session) => cb(toUser(session?.user)))
      return () => data.subscription.unsubscribe()
    },
    async signIn(email, password) {
      const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password })
      if (error) throw new Error(error.message === 'Invalid login credentials' ? 'Wrong email or password.' : error.message)
    },
    async signOut() {
      await sb.auth.signOut()
    },
    async sendPasswordReset(email) {
      const { error } = await sb.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${location.origin}/admin/reset` })
      if (error) throw new Error(error.message)
    },
    async updatePassword(password) {
      const { error } = await sb.auth.updateUser({ password })
      if (error) throw new Error(error.message)
    },

    async saveProduct(p, previousSlug) {
      if (previousSlug && previousSlug !== p.slug) check(await sb.from('products').delete().eq('id', previousSlug))
      check(await sb.from('products').upsert({ id: p.slug, data: p, sort: p.sort ?? 0, updated_at: new Date().toISOString() }))
    },
    async deleteProduct(slug) {
      check(await sb.from('products').delete().eq('id', slug))
    },
    async saveCategory(c, previousId) {
      if (previousId && previousId !== c.id) {
        const rows = check(await sb.from('products').select('id, data')) ?? []
        for (const r of rows) {
          const p = r.data as Product
          if (p.category === previousId) check(await sb.from('products').update({ data: { ...p, category: c.id } }).eq('id', r.id))
        }
        check(await sb.from('categories').delete().eq('id', previousId))
      }
      check(await sb.from('categories').upsert({ id: c.id, data: c, sort: c.sort ?? 0 }))
    },
    async deleteCategory(id) {
      const rows = check(await sb.from('products').select('data')) ?? []
      if (rows.some((r) => (r.data as Product).category === id)) throw new Error('Move or delete the products in this category first.')
      check(await sb.from('categories').delete().eq('id', id))
    },
    async saveSeason(s) {
      check(await sb.from('seasons').upsert({ id: s.id, data: s }))
    },
    async deleteSeason(id) {
      const rows = check(await sb.from('products').select('data')) ?? []
      if (rows.some((r) => (r.data as Product).season === id)) throw new Error(SEASON_IN_USE)
      check(await sb.from('seasons').delete().eq('id', id))
    },
    async saveSettings(s) {
      check(await sb.from('settings').upsert({ id: 1, data: s }))
    },
    async uploadPhoto(file, nameHint) {
      const path = `${nameHint || 'photo'}-${Date.now().toString(36)}.webp`
      check(await sb.storage.from(BUCKET).upload(path, file, { contentType: 'image/webp', upsert: false }))
      return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
    },
    async deletePhoto(url) {
      const marker = `/object/public/${BUCKET}/`
      const i = url.indexOf(marker)
      if (i < 0) return // bundled sample photo, nothing to delete
      await sb.storage.from(BUCKET).remove([decodeURIComponent(url.slice(i + marker.length))])
    },

    async listEnquiries() {
      return check(await sb.from('enquiries').select('*').order('created_at', { ascending: false }).limit(500)) as EnquiryRow[]
    },
    async setEnquiryStatus(id, status) {
      check(await sb.from('enquiries').update({ status }).eq('id', id))
    },
    async deleteEnquiry(id) {
      check(await sb.from('enquiries').delete().eq('id', id))
    },

    async isEmpty() {
      const { count, error } = await sb.from('products').select('id', { count: 'exact', head: true })
      if (error) throw new Error(error.message)
      return (count ?? 0) === 0
    },
    async importStarter() {
      const s = starterCatalog()
      check(await sb.from('categories').upsert(s.categories.map((c) => ({ id: c.id, data: c, sort: c.sort ?? 0 }))))
      check(await sb.from('seasons').upsert(s.seasons.map((x) => ({ id: x.id, data: x }))))
      check(await sb.from('products').upsert(s.products.map((p) => ({ id: p.slug, data: p, sort: p.sort ?? 0 }))))
      check(await sb.from('settings').upsert({ id: 1, data: s.settings }))
    },
  }
}
