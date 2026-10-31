import { ArrowUpRight } from 'lucide-react'
import { useLang } from '../i18n'
import credits from '../data/photo-credits.json'
import { FieldSection } from '../components/Field'
import { Photo } from '../components/DuoPhoto'
import { usePageTitle } from '../lib/usePageTitle'

const D = (ms: number) => ({ '--d': `${ms}ms` }) as React.CSSProperties

export function Credits() {
  const { t } = useLang()
  usePageTitle(t('credits'))
  return (
    <FieldSection field="chalk">
      <div className="mx-auto max-w-[1400px] px-4 pt-10 pb-24 sm:px-10 sm:pt-16 sm:pb-32">
        <h1 className="enter text-[clamp(3rem,9vw,8.4rem)] leading-[0.9] font-bold tracking-[-0.06em]">{t('credits')}</h1>
        <p className="enter ink-2 mt-6 max-w-[36rem] text-[17px] leading-relaxed sm:text-[18px]" style={D(80)}>
          {t('credits_sub')}
        </p>

        <ul className="enter hair mt-12 grid border-t sm:mt-16 lg:grid-cols-2 lg:gap-x-16" style={D(160)} role="list">
          {credits.map((c) => (
            <li key={c.file} className="hair border-b">
              <a
                href={c.source}
                target="_blank"
                rel="noreferrer"
                className="group flex min-h-[44px] items-center gap-4 py-4 sm:gap-5"
              >
                <Photo file={c.file.replace(/\.webp$/, '')} alt="" className="h-14 w-20 shrink-0 rounded-xl sm:h-16 sm:w-24" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[16px] font-semibold tracking-[-0.01em] underline-offset-4 [@media(hover:hover)]:group-hover:underline">
                    {c.title}
                  </span>
                  <span className="ink-2 mt-0.5 block truncate text-[14.5px]">
                    {c.author} · {c.license}
                  </span>
                </span>
                <ArrowUpRight
                  className="size-5 shrink-0 opacity-60 transition-[opacity,translate] duration-300 ease-[var(--ease-out)] [@media(hover:hover)]:group-hover:translate-x-0.5 [@media(hover:hover)]:group-hover:-translate-y-0.5 [@media(hover:hover)]:group-hover:opacity-100"
                  aria-hidden="true"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </FieldSection>
  )
}
