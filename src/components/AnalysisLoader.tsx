import { useEffect, useState } from 'react'
import { m } from 'framer-motion'
import { Check } from 'lucide-react'
import { useApp } from '../state/AppContext'
import { tr } from '../i18n'
export default function AnalysisLoader({ query }: { query: string }) {
  const { lang } = useApp()
  const steps = [tr(lang, 'readMessage'), tr(lang, 'identifyService'), tr(lang, 'checkProcess'), tr(lang, 'preparePlan')]
  const [n, setN] = useState(0)
  useEffect(() => { const id = setInterval(() => setN((x) => Math.min(x + 1, steps.length)), 420); return () => clearInterval(id) }, [])
  return (
    <div className="mx-auto my-16 max-w-lg rounded-md border border-stone-200 bg-white p-6">
      <h2 className="text-2xl font-bold text-navy">{tr(lang, 'understanding')}</h2>
      <p className="mb-4 text-stone-600">"{query}"</p>
      <ul>
        {steps.map((s, i) => (
          <m.li key={s} animate={{ opacity: i < n ? 1 : 0.45 }} className="flex items-center gap-3 py-2.5">
            <m.span animate={{ scale: i < n ? [0.6, 1] : 1 }} className={`grid h-5 w-5 place-items-center rounded-full border-2 ${i < n ? 'border-grn bg-grn text-white' : 'border-stone-300'}`}>{i < n && <Check size={12} />}</m.span>{s}
          </m.li>
        ))}
      </ul>
    </div>
  )
}
