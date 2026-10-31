import { Link } from 'react-router-dom'
import { useLang } from '../i18n'
import { shop } from '../config/shop'
import { useShop } from '../lib/useShop'
import { Logo } from './Logo'
import { FieldSection } from './Field'

export function Footer() {
  const { t } = useLang()
  const live = useShop()
  const linkCls = 'no-underline opacity-80 transition-opacity hover:opacity-100'
  return (
    <FieldSection as="footer" field="indigo" className="mt-auto">
      <div className="mx-auto max-w-[1400px] px-4 pt-20 pb-28 sm:px-10 md:pb-16">
        <p className="max-w-4xl text-[clamp(2rem,5vw,4rem)] leading-[1.02] font-bold tracking-[-0.045em]">
          {t('footer_big')}
        </p>
        <div className="mt-16 grid gap-10 border-t border-[color-mix(in_srgb,var(--ink)_20%,transparent)] pt-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <Logo stacked />
          <div className="text-[15px]">
            <h2 className="text-sm font-medium tracking-normal opacity-60">{t('address')}</h2>
            <p className="mt-3 opacity-90">
              {shop.address.line1}
              <br />
              {shop.address.line2}
              <br />
              {shop.address.city}
            </p>
          </div>
          <div className="text-[15px]">
            <h2 className="text-sm font-medium tracking-normal opacity-60">{t('hours')}</h2>
            <p className="mt-3 opacity-90">{live.summary}</p>
            <p className="mt-4 grid gap-1.5">
              <a href={live.tel} className={linkCls}>
                {live.phoneDisplay}
              </a>
              <a href={live.wa()} target="_blank" rel="noreferrer" className={linkCls}>
                WhatsApp
              </a>
            </p>
          </div>
          <nav className="grid content-start gap-1.5 text-[15px]" aria-label="Footer">
            <Link to="/products" viewTransition className={linkCls}>{t('nav_shop')}</Link>
            <Link to="/seasons" viewTransition className={linkCls}>{t('nav_seasons')}</Link>
            <Link to="/wholesale" viewTransition className={linkCls}>{t('nav_wholesale')}</Link>
            <Link to="/visit" viewTransition className={linkCls}>{t('nav_visit')}</Link>
            <a href={shop.reviewsUrl} target="_blank" rel="noreferrer" className={linkCls}>{t('reviews')}</a>
            <Link to="/credits" viewTransition className={linkCls}>{t('credits')}</Link>
          </nav>
        </div>
        <p className="mt-14 text-[13px] opacity-55">
          © {new Date().getFullYear()} {shop.name} · Najafgarh, New Delhi
        </p>
      </div>
    </FieldSection>
  )
}
