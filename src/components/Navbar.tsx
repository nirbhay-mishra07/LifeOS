import { useState } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { Bell, Menu, ShieldCheck, User as UserIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import type { Lang } from '../types'
import type { Dict } from '../i18n'
import { useApp } from '../state/AppContext'
import LanguageSelector from './LanguageSelector'
import NotificationDropdown from './NotificationDropdown'
interface Props { t: Dict; lang: Lang; setLang: (l: Lang) => void }
export default function Navbar({ t, lang, setLang }: Props) {
  const [menu, setMenu] = useState(false)
  const [notif, setNotif] = useState(false)
  const { notifications, markNotificationsRead } = useApp()
  const links = [{ label: t.home, to: '/' }, { label: t.services, to: '/dashboard' }, { label: t.track, to: '/dashboard' }, { label: t.help, to: '/help' }]
  const activeCount = notifications.filter((n) => !n.read).length
  const navClass = ({ isActive }: { isActive: boolean }) => `px-3 py-2 text-[15px] font-semibold hover:text-navy ${isActive ? 'text-navy shadow-[inset_0_-3px_#F28C28]' : ''}`
  return <header className="sticky top-0 z-40 border-b border-stone-200 bg-white">
    <div className="h-1" style={{ background: 'linear-gradient(90deg,#F28C28 33%,#fff 33% 66%,#138808 66%)' }} />
    <div className="relative mx-auto flex h-16 max-w-6xl items-center gap-3 px-5">
      <button className="rounded border border-stone-300 p-2 md:hidden" aria-label="Menu" title="Menu" onClick={() => setMenu(!menu)}><Menu size={20} /></button>
      <NavLink to="/" className="flex items-center gap-2.5 text-left"><span className="grid h-9 w-9 place-items-center rounded bg-navy text-white"><ShieldCheck size={20} /></span><span className="text-lg font-extrabold leading-none text-navy">LifeOS<small className="hidden text-[11px] font-medium text-stone-500 sm:block">{t.tagline}</small></span></NavLink>
      <nav className="ml-4 hidden gap-1 md:flex">{links.map((link, i) => <NavLink key={i} to={link.to} end={link.to === '/'} className={navClass}>{link.label}</NavLink>)}</nav>
      <div className="flex-1" /><LanguageSelector lang={lang} onChange={setLang} />
      <div className="relative"><button className="relative rounded border border-stone-300 p-2" aria-label="Notifications" title="Notifications" onClick={() => { setNotif(!notif); markNotificationsRead() }}><Bell size={18} />{activeCount > 0 && <span className="absolute -right-1.5 -top-1.5 rounded-full bg-saf px-1.5 text-[11px] font-bold">{activeCount}</span>}</button><NotificationDropdown open={notif} /></div>
      <button className="rounded border border-stone-300 p-2" aria-label="Profile" title="Profile (demo user)"><UserIcon size={18} /></button>
    </div>
    <AnimatePresence>{menu && <m.nav initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-stone-200 md:hidden">{links.map((link, i) => <NavLink key={i} to={link.to} end={link.to === '/'} onClick={() => setMenu(false)} className="block w-full px-5 py-3 text-left font-semibold">{link.label}</NavLink>)}</m.nav>}</AnimatePresence>
  </header>
}
