import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useLang } from '../i18n'
import { useCatalog } from '../data/catalog'
import { FieldSection } from '../components/Field'
import { usePageTitle } from '../lib/usePageTitle'

const D = (ms: number) => ({ '--d': `${ms}ms` }) as React.CSSProperties

export function NotFound() {
  const { t } = useLang()
  usePageTitle(t('nf_title'))
  const { season } = useCatalog().currentSeason()
  return (
    <FieldSection inset field={season.id} className="relative">
      <div className="mx-auto flex min-h-[70svh] max-w-[1400px] flex-col justify-center px-4 py-16 sm:px-10 sm:py-24">
        <p aria-hidden="true" className="enter -ml-[0.04em] text-[clamp(9rem,42vw,30rem)] leading-[0.8] font-bold tracking-[-0.07em] select-none">
          404
        </p>
        <h1 className="enter mt-8 max-w-[18ch] text-[clamp(2.2rem,5.4vw,4.6rem)] leading-[0.95] font-bold tracking-[-0.05em]" style={D(80)}>
          {t('nf_title')}
        </h1>
        <p className="enter ink-2 mt-5 max-w-[30rem] text-[17px] leading-relaxed sm:text-[18px]" style={D(160)}>
          {t('nf_sub')}
        </p>
        <div className="enter mt-9" style={D(240)}>
          <Link to="/" viewTransition className="btn btn-ink press">
            <ArrowLeft className="size-[18px]" strokeWidth={1.75} /> {t('go_home')}
          </Link>
        </div>
      </div>
    </FieldSection>
  )
}
