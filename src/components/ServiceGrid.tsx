import { m } from 'framer-motion'
import { popular } from '../data'
import ServiceCard from './ServiceCard'
import { useApp } from '../state/AppContext'
import { tr } from '../i18n'
export default function ServiceGrid({ onExplore }: { onExplore: (q: string) => void }) {
  const { lang } = useApp()
  return (
    <section className="mx-auto max-w-6xl px-5 py-12">
      <h2 className="text-2xl font-bold text-navy">{tr(lang, 'popular')}</h2>
      <p className="mb-5 text-stone-600">{tr(lang, 'pickService')}</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {popular.map((p, i) => (
          <m.div key={p.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
            <ServiceCard icon={p.icon} title={p.title} desc={p.desc} onExplore={() => onExplore(p.query)} />
          </m.div>
        ))}
      </div>
    </section>
  )
}
