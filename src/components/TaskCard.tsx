import { m } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import type { Task } from '../types'
import Button from './Button'
import { useApp } from '../state/AppContext'
import { tr } from '../i18n'
export default function TaskCard({ task, current, onToggle }: { task: Task; current: boolean; onToggle: () => void }) {
  const { lang } = useApp()
  const dot = task.done ? 'border-grn bg-grn text-white' : current ? 'border-saf text-[#9a4d00]' : 'border-stone-300'
  return (
    <m.div layout className="my-3 flex gap-3.5">
      <m.span key={String(task.done)} initial={{ scale: 0.7 }} animate={{ scale: 1 }} className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 bg-white ${dot}`}>
        {task.done ? <Check size={16} /> : current ? <ArrowRight size={14} /> : null}</m.span>
      <div className="flex-1 rounded-md border border-stone-200 bg-white p-4">
        <b>{task.title}</b>
        <p className="text-sm text-stone-600">{task.description}</p>
        <p className="text-sm text-stone-600"><b>{tr(lang, 'documents')}</b> {task.documents}</p>
        {!task.done && <p className="text-sm text-stone-600"><b>{tr(lang, 'next')}</b> {task.next}</p>}
        <Button sm variant={task.done ? 'outline' : 'primary'} className="mt-2" onClick={onToggle}>{task.done ? tr(lang, 'undo') : tr(lang, 'markDone')}</Button>
      </div>
    </m.div>
  )
}
