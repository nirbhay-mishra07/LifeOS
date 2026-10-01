import { ShieldCheck } from 'lucide-react'
export default function SourceBadge() {
  return (
    <span className="inline-flex flex-wrap gap-2">
      <span title="Information verified against official service guidance" className="inline-flex items-center gap-1.5 rounded-sm border border-grn/30 bg-grn/10 px-2 py-0.5 text-xs font-semibold text-grn">
        <ShieldCheck size={14} /> Official source</span>
      <span className="rounded-sm border border-saf/40 bg-saf/10 px-2 py-0.5 text-xs font-semibold text-[#9a4d00]">Prototype · Demo information</span>
    </span>
  )
}
