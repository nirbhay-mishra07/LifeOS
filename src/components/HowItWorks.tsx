import { m } from 'framer-motion'
import { useApp } from '../state/AppContext'
import { tr } from '../i18n'
export default function HowItWorks() {
  const { lang } = useApp()
  const steps = [tr(lang, 'flow1'), tr(lang, 'flow2'), tr(lang, 'flow3'), tr(lang, 'flow4')]
  return (
    <section className="mx-auto max-w-6xl px-5 pb-12">
      <h2 className="text-2xl font-bold text-navy">{tr(lang, 'howWorks')}</h2>
      <p className="mb-6 text-stone-600">{tr(lang, 'fromGoal')}</p>
      <div className="relative grid grid-cols-2 gap-6 md:grid-cols-4">
        <m.div className="absolute left-[12%] right-[12%] top-5 hidden h-0.5 origin-left bg-stone-300 md:block" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1 }} />
        {steps.map((s, i) => (
          <m.div key={s} className="relative text-center font-semibold" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
            <span className="mx-auto mb-2.5 grid h-10 w-10 place-items-center rounded-full border-4 border-paper bg-navy text-white">0{i + 1}</span>{s}
          </m.div>
        ))}
      </div>
    </section>
  )
}
