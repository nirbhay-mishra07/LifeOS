import { m } from 'framer-motion'
import { useApp } from '../state/AppContext'
import { tr } from '../i18n'
export default function DashboardStats({ active, pending, completed, upcoming }: { active: number; pending: number; completed: number; upcoming: number }) {
  const { lang } = useApp()
  const items: [string, number][] = [[tr(lang, 'activeServices'), active], [tr(lang, 'pendingActions'), pending], [tr(lang, 'completed'), completed], [tr(lang, 'upcoming'), upcoming]]
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map(([k, v], i) => (
        <m.div key={k} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="rounded-md border border-stone-200 border-t-[3px] border-t-saf bg-white p-4">
          <m.b key={v} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="block text-3xl text-navy">{v}</m.b>{k}
        </m.div>
      ))}
    </div>
  )
}
