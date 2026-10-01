import { AnimatePresence, m } from 'framer-motion'
import { Bell } from 'lucide-react'
import { useApp } from '../state/AppContext'
import { tr } from '../i18n'
export default function NotificationDropdown({ open }: { open: boolean }) {
  const { notifications, lang } = useApp()
  const relative = (time: number) => { const mins = Math.max(0, Math.floor((Date.now() - time) / 60000)); return mins < 1 ? 'Just now' : mins < 60 ? `${mins} min ago` : mins < 1440 ? `${Math.floor(mins / 60)} hours ago` : `${Math.floor(mins / 1440)} days ago` }
  return <AnimatePresence>{open && <m.ul initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="absolute right-0 top-12 z-30 w-80 max-w-[88vw] rounded-md border border-stone-200 bg-white shadow-xl">{notifications.length ? notifications.map((n) => <li key={n.id} className="flex gap-3 border-b border-stone-100 p-3 last:border-0"><Bell size={16} className="mt-1 shrink-0 text-navy" /><span className="text-sm">{n.text}<span className="block text-xs text-stone-500">{relative(n.createdAt)}</span></span></li>) : <li className="p-4 text-sm text-stone-500">{tr(lang, 'noNotifications')}</li>}</m.ul>}</AnimatePresence>
}
