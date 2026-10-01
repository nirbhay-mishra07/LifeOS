import { m } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import type { Service } from '../types'
import { useNavigate } from 'react-router-dom'
import ProgressBar from './ProgressBar'
import TaskCard from './TaskCard'
import SourceBadge from './SourceBadge'
import { useApp } from '../state/AppContext'
import { tr } from '../i18n'
export default function ActionPlan({ service }: { service: Service }) {
  const { lang, tasks, toggleTask } = useApp()
  const navigate = useNavigate()
  const serviceTasks = tasks[service.id]
  const progress = Math.round(serviceTasks.filter((task) => task.done).length / serviceTasks.length * 100)
  const cur = serviceTasks.findIndex((t) => !t.done)
  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <button onClick={() => navigate('/dashboard')} className="mb-3 inline-flex items-center gap-1.5 font-semibold text-navy"><ArrowLeft size={16} /> {tr(lang, 'backServices')}</button>
      <h2 className="text-2xl font-bold text-navy">{tr(lang, 'actionPlan')}</h2>
      <p className="mb-3 mt-1 flex flex-wrap items-center gap-2 text-stone-600">{service.title} <SourceBadge /></p>
      <div className="rounded-md border border-stone-200 bg-white p-4">
        <m.b key={progress} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }}>{progress}% {tr(lang, 'complete')}</m.b>
        <div className="mt-2"><ProgressBar value={progress} /></div>
      </div>
      <div className="mt-3">{serviceTasks.map((t, i) => <TaskCard key={t.id} task={t} current={i === cur} onToggle={() => toggleTask(service.id, t.id)} />)}</div>
    </div>
  )
}
