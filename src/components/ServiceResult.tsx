import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { m } from 'framer-motion'
import { ArrowLeft, Check, ExternalLink, Sparkles } from 'lucide-react'
import type { Service } from '../types'
import { icons } from './icons'
import Button from './Button'
import SourceBadge from './SourceBadge'
import DocumentUpload from './DocumentUpload'
import { useApp } from '../state/AppContext'
import Modal from './Modal'
interface Props { service: Service; onOfficial: () => void }
export default function ServiceResult({ service: s, onOfficial }: Props) {
  const { my, doc, setDoc, addService } = useApp()
  const navigate = useNavigate()
  const [addedModal, setAddedModal] = useState(false)
  const added = my.includes(s.id)
  const Icon = icons[s.icon]
  return (
    <><div className="mx-auto max-w-6xl px-5 py-8">
      <button onClick={() => navigate('/')} className="mb-3 inline-flex items-center gap-1.5 font-semibold text-navy"><ArrowLeft size={16} /> Back to services</button>
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-md border border-stone-200 bg-white p-6">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded bg-navy/10 text-navy"><Icon size={24} /></span>
            <div><p className="text-xs font-bold uppercase tracking-wide text-stone-500">Here's what we found · Service identified</p><h2 className="text-2xl font-bold text-navy">{s.title}</h2></div>
          </div>
          <p className="my-3">{s.description}</p>
          <SourceBadge />
          <div className="my-4 grid grid-cols-3 divide-x divide-stone-200 rounded border border-stone-200 text-sm">
            {[['Estimated time', s.time], ['Mode', 'Online'], ['Status', 'Demo only']].map(([k, v]) => <div key={k} className="p-2.5"><b className="block text-xs font-semibold text-stone-500">{k}</b>{v}</div>)}
          </div>
          <h3 className="mb-1 font-bold text-navy">Recommended next steps</h3>
          <ol>
            {s.steps.map((st, i) => (
              <m.li key={st} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.08 }} className="flex items-center gap-3 py-2">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-navy/10 text-[13px] font-bold text-navy">{i + 1}</span>{st}
              </m.li>
            ))}
          </ol>
          {s.required && (
            <div className="mt-3"><h3 className="mb-1 font-bold text-navy">Required information</h3>
              {s.required.map((r) => <p key={r} className="flex items-center gap-2"><Check size={18} className="text-grn" />{r}</p>)}</div>
          )}
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Button variant="green" onClick={() => { addService(s.id); navigate(`/plan/${s.id}`) }}>Create Action Plan</Button>
            {s.id === 'dl' && <Button variant="outline" disabled={added} onClick={() => { addService(s.id); setAddedModal(true) }}>{added ? 'Added to My Services' : 'Add to My Services'}</Button>}
            <Button variant="outline" onClick={onOfficial}>View Official Service <ExternalLink size={16} /></Button>
          </div>
          <div className="mt-4 flex items-center gap-2.5 rounded bg-navy/5 p-3 text-sm text-navy"><Sparkles size={18} /> The action plan explains each step in simple words.</div>
        </div>
        {s.id === 'elec' && <DocumentUpload doc={doc} onUpload={setDoc} />}
      </div>
    </div><Modal open={addedModal} onClose={() => setAddedModal(false)}><h3 className="mb-2 text-lg font-bold">Added to My Services</h3><p className="mb-4">This service now appears on your dashboard.</p><Button onClick={() => navigate('/dashboard')}>View dashboard</Button></Modal></>
  )
}
