import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  )

  // Follow the phone's setting until the visitor picks one themselves.
  useEffect(() => {
    let saved: string | null = null
    try {
      saved = localStorage.getItem('rl-theme')
    } catch {
      /* ignore */
    }
    if (saved) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => apply(mq.matches ? 'dark' : 'light', setThemeState)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const toggle = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    apply(next, setThemeState)
    try {
      localStorage.setItem('rl-theme', next)
    } catch {
      /* ignore */
    }
  }, [theme])

  return { theme, toggle }
}

function apply(t: Theme, set: (t: Theme) => void) {
  const root = document.documentElement
  root.classList.add('theme-switching')
  root.classList.toggle('dark', t === 'dark')
  set(t)
  window.setTimeout(() => root.classList.remove('theme-switching'), 320)
}
