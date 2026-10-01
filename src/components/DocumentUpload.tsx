import { useRef, useState } from 'react'
import { useEffect } from 'react'
import { m } from 'framer-motion'
import { CheckCircle2, Upload } from 'lucide-react'
import type { DocInfo } from '../types'
import { mockDoc } from '../data'
import { useApp } from '../state/AppContext'
import { tr } from '../i18n'
export default function DocumentUpload({ doc, onUpload }: { doc: DocInfo | null; onUpload: (d: DocInfo | null) => void }) {
  const ref = useRef<HTMLInputElement>(null)
  const { lang } = useApp()
  const [error, setError] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  useEffect(() => { if (!analyzing) return; const timer = window.setTimeout(() => { onUpload({ ...mockDoc, name: ref.current?.dataset.filename ?? mockDoc.name }); setAnalyzing(false) }, 1200); return () => window.clearTimeout(timer) }, [analyzing, onUpload])
  const chooseFile = (file?: File) => {
    if (!file) return
    const validType = ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)
    if (!validType) { setError('Choose a PDF, JPG or PNG file.'); return }
    if (file.size > 5 * 1024 * 1024) { setError('File must be 5 MB or smaller.'); return }
    setError(''); if (ref.current) ref.current.dataset.filename = file.name; setAnalyzing(true)
  }
  return (
    <div className="self-start rounded-md border border-stone-200 bg-white p-5">
      <h3 className="mb-3 font-bold">{tr(lang, 'documentQuestion')}</h3>
      {analyzing && <p role="status" className="mb-3 animate-pulse text-sm font-semibold text-navy">Analyzing document...</p>}
      {doc ? (
        <m.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <p className="font-bold">{tr(lang, 'documentReceived')}</p>
          <p className="text-sm">{doc.name}</p>
          <p className="mb-3 flex items-center gap-1.5 text-sm text-grn"><CheckCircle2 size={16} /> {tr(lang, 'documentAnalyzed')}</p>
          <dl className="grid grid-cols-[1fr_auto] gap-1 text-sm">
            <dt className="text-stone-500">{tr(lang, 'consumerNumber')}</dt><dd className="font-bold">{doc.consumerNo}</dd>
            <dt className="text-stone-500">{tr(lang, 'billAmount')}</dt><dd className="font-bold">{doc.amount}</dd>
            <dt className="text-stone-500">{tr(lang, 'billPeriod')}</dt><dd className="font-bold">{doc.period}</dd>
          </dl>
          <p className="mt-3 text-xs font-bold text-[#9a4d00]">DEMO DATA – not read from your file</p>
          <button className="mt-3 rounded border border-stone-300 px-3 py-1.5 text-sm font-semibold" onClick={() => onUpload(null)}>{tr(lang, 'remove')}</button>
        </m.div>
      ) : (
        <>
          <button disabled={analyzing} onClick={() => ref.current?.click()} className="flex w-full items-center justify-center gap-2 rounded border-[1.5px] border-dashed border-navy p-5 font-semibold text-navy hover:bg-navy/5"><Upload size={18} /> {tr(lang, 'upload')}</button>
          <input ref={ref} type="file" accept=".pdf,.jpg,.jpeg,.png" hidden onChange={(e) => { chooseFile(e.target.files?.[0]); e.currentTarget.value = '' }} />
          {error && <p role="alert" className="mt-2 text-sm font-semibold text-red-900">{error}</p>}
          <p className="mt-2 text-sm text-stone-500">{tr(lang, 'optionalDoc')}</p>
        </>
      )}
    </div>
  )
}
