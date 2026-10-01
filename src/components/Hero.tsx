import { m } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { localized } from '../i18n'
import { useApp } from '../state/AppContext'
import { chips, sample, services } from '../data'
import { icons } from './icons'
import ChatInput from './ChatInput'
import type { ServiceId } from '../types'

interface Props { onAnalyze: (q: string) => void }
export default function Hero({ onAnalyze }: Props) {
  const { lang } = useApp()
  const t = localized(lang)
  return (
    <section className="bg-saf text-navy">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 lg:grid-cols-[1.25fr_1fr]">
        <m.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="text-xs font-bold uppercase tracking-widest opacity-90">{t.badge}</p>
          <h1 className="my-3 text-3xl font-extrabold leading-tight sm:text-5xl">{t.h1}</h1>
          <p className="mb-6 max-w-xl opacity-95">{t.sub}</p>
          <ChatInput onSend={onAnalyze} suggestions={chips} />
        </m.div>
        <div className="hidden gap-3 lg:grid">
          {(['elec', 'dl', 'pan'] as ServiceId[]).map((id, i) => {
            const s = services[id], Icon = icons[s.icon]
            return (
              <m.button key={id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.12 }} whileHover={{ x: -4 }}
                onClick={() => onAnalyze(sample[id])} className="flex items-center gap-4 rounded-md bg-white p-4 text-left text-ink shadow-[0_2px_0_rgba(0,0,0,.2)]">
                <span className="grid h-11 w-11 place-items-center rounded bg-navy/10 text-navy"><Icon size={22} /></span>
                <span><b className="block">{s.title}</b><small className="text-stone-500">{s.time}</small></span>
                <ArrowRight size={18} className="ml-auto text-burnt" />
              </m.button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
