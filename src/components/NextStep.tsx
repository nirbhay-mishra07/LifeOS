import { m } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import type { ServiceId, Task } from '../types'
import { services } from '../data'
import ProgressBar from './ProgressBar'
import Button from './Button'
import { useApp } from '../state/AppContext'
import { tr } from '../i18n'
const stages = ['Understood', 'Process found', 'Plan created', 'In progress', 'Completed']
interface Props { my: ServiceId[]; tasks: Record<ServiceId, Task[]>; progress: (id: ServiceId) => number; onContinue: (id: ServiceId) => void }
export default function NextStep({ my, tasks, progress, onContinue }: Props) {
  const { lang } = useApp()
  const id = my[0]
  const next = id && tasks[id].find((t) => !t.done)
  return (
    <section className="bg-deep text-white">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <h2 className="text-2xl font-bold">{tr(lang, 'nextStep')}</h2>
        <p className="mb-5 text-green-100">{tr(lang, 'trackServices')}</p>
        {id ? (
          <>
            <div className="rounded-md bg-white p-5 text-ink">
              <h3 className="font-bold text-navy">{services[id].title}</h3>
              <p className="mb-3 text-sm text-stone-600">{tr(lang, 'next')}: {next ? next.title : tr(lang, 'allDone')} · {progress(id)}% {tr(lang, 'complete')}</p>
              <ProgressBar value={progress(id)} />
              <Button sm className="mt-3" onClick={() => onContinue(id)}>{tr(lang, 'continue')} <ArrowRight size={14} /></Button>
            </div>
            <div className="relative mt-6 flex justify-between text-xs sm:text-sm">
              <div className="absolute left-[8%] right-[8%] top-2.5 border-t-2 border-white/40" />
              {stages.map((s, i) => (
                <m.div key={s} className="relative flex-1 text-center" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}>
                  <span className={`mx-auto mb-1.5 grid h-5 w-5 place-items-center rounded-full border-2 border-white ${i < 3 ? 'bg-white text-deep' : 'bg-deep'}`}>{i < 3 && <Check size={12} />}</span>{s}
                </m.div>
              ))}
            </div>
          </>
        ) : <div className="rounded-md bg-white p-5 text-ink">{tr(lang, 'noActive')} Describe a problem above to start.</div>}
      </div>
    </section>
  )
}
