import type { Lang } from '../types'
import { useApp } from '../state/AppContext'
import { tr } from '../i18n'
export default function LanguageSelector({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  const { lang: current } = useApp()
  return (
    <select aria-label={tr(current, 'language')} value={lang} onChange={(e) => onChange(e.target.value as Lang)} className="rounded border border-stone-300 bg-white px-2 py-1.5 text-sm">
      <option value="en">English</option><option value="hi">हिंदी</option><option value="hg">Hinglish</option>
    </select>
  )
}
