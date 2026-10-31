import type { Bi } from '../i18n'
import type { Season, SeasonId } from '../config/seasons'
import type { Category, Product } from './products'

export type { Bi, Season, SeasonId, Category, Product }

export type DayHours = {
  dow: number // 0 = Sunday … 6 = Saturday
  open: string // "09:00"
  close: string // "21:00"
  closed?: boolean
}

export type Settings = {
  phone: string // "+919540528086"
  whatsapp: string // "919540528086"
  hours: DayHours[]
  holiday: { on: boolean; text: Bi } // "Shop closed today" notice
  banner: { on: boolean; text: Bi } // home page announcement
}

export type EnquiryStatus = 'new' | 'called' | 'done'

export type EnquiryRow = {
  id: string
  created_at: string
  type: 'retail' | 'wholesale'
  product: string
  variant?: string | null
  qty?: string | null
  season?: string | null
  name: string
  mobile: string
  area: string
  note?: string | null
  status: EnquiryStatus
}

export type NewEnquiry = Omit<EnquiryRow, 'id' | 'created_at' | 'status'>

export type Catalog = {
  products: Product[]
  categories: Category[]
  seasons: Season[]
  settings: Settings
}
