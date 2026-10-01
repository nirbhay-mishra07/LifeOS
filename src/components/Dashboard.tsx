import { AnimatePresence, m } from 'framer-motion'
import type { ServiceId } from '../types'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../state/AppContext'
import { tr } from '../i18n'
import { services } from '../data'
import DashboardStats from './DashboardStats'
import ProgressBar from './ProgressBar'
import Button from './Button'
export default function Dashboard() {
  const { my, tasks } = useApp()
  const { lang } = useApp()
  const navigate = useNavigate()
  const progress = (id: ServiceId) => Math.round(tasks[id].filter((task) => task.done).length / tasks[id].length * 100)
  const pending = my.reduce((sum, id) => sum + tasks[id].filter((task) => !task.done).length, 0)
  const completed = my.reduce((sum, id) => sum + tasks[id].filter((task) => task.done).length, 0)
  const upcoming = my.filter((id) => Boolean(services[id].dueDate)).length
  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <h2 className="mb-4 text-2xl font-bold text-navy">{tr(lang, 'myLifeOS')}</h2>
      <DashboardStats active={my.length} pending={pending} completed={completed} upcoming={upcoming} />
      <h2 className="mb-3 mt-8 text-2xl font-bold text-navy">{tr(lang, 'activeServices')}</h2>
      {my.length === 0 && <div className="rounded-md border border-stone-200 bg-white p-5">{tr(lang, 'noActive')} <Button sm className="ml-2" onClick={() => navigate('/')}>{tr(lang, 'startOne')}</Button></div>}
      <div className="grid gap-3 md:grid-cols-2">
        <AnimatePresence>
          {my.map((id) => {
            const p = progress(id), next = tasks[id].find((t) => !t.done)
            return (
              <m.div layout key={id} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="rounded-md border border-stone-200 bg-white p-5">
                <b className="text-lg text-navy">{services[id].title}</b>
                <p className="mb-3 mt-1 text-sm">{tr(lang, 'status')}: <b>{p === 100 ? tr(lang, 'completed') : p ? tr(lang, 'inProgress') : tr(lang, 'pending')}</b> · {tr(lang, 'next')}: {next ? next.title : tr(lang, 'allDone')}</p>
                <ProgressBar value={p} />
                <div className="mt-3 flex items-center gap-3"><b>{p}%</b><Button sm onClick={() => navigate(`/plan/${id}`)}>{tr(lang, 'continue')}</Button></div>
              </m.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
