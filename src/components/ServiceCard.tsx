import { m } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import type { IconKey } from '../types'
import { icons } from './icons'
import Button from './Button'
export default function ServiceCard({ icon, title, desc, onExplore }: { icon: IconKey; title: string; desc: string; onExplore: () => void }) {
  const Icon = icons[icon]
  return (
    <m.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="rounded-md border border-stone-200 bg-white p-5 hover:border-navy hover:shadow-lg">
      <span className="grid h-11 w-11 place-items-center rounded bg-navy/10 text-navy"><Icon size={22} /></span>
      <h3 className="mb-1 mt-3 text-[17px] font-bold text-navy">{title}</h3>
      <p className="mb-3 text-sm text-stone-600">{desc}</p>
      <Button variant="outline" sm onClick={onExplore}>Explore <ArrowRight size={14} /></Button>
    </m.div>
  )
}
