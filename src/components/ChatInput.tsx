import { useRef, useState } from 'react'
import { ArrowRight, Mic, Paperclip, Search } from 'lucide-react'
import { useSpeech } from '../hooks/useSpeech'
import { useApp } from '../state/AppContext'
import { localized } from '../i18n'
interface Suggestion { label: string; query: string }
interface Props { onSend: (query: string) => void; suggestions: Suggestion[] }
export default function ChatInput({ onSend, suggestions }: Props) {
  const file = useRef<HTMLInputElement>(null)
  const { lang, attached, setAttached } = useApp()
  const [value, onChange] = useState('')
  const [error, setError] = useState('')
  const speech = useSpeech(lang, onChange)
  const copy = localized(lang)
  const placeholder = copy.ph
  const submit = () => { if (!value.trim()) { setError('Please describe what you need help with.'); return } setError(''); onSend(value) }
  const ib = 'rounded border border-stone-300 p-2 text-ink hover:bg-paper'
  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-1 rounded-md bg-white p-1.5 text-ink focus-within:ring-4 focus-within:ring-white/30">
        <Search size={20} className="ml-3 mr-1 shrink-0 text-stone-500" />
        <input value={value} onChange={(e) => { onChange(e.target.value); if (e.target.value.trim()) setError('') }} onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder={placeholder} aria-label={placeholder}
          className="min-w-0 flex-1 bg-transparent py-3 outline-none" />
        <button className={ib} title={speech.listening ? 'Listening' : 'Voice input'} aria-label={speech.listening ? 'Listening' : 'Voice input'} aria-pressed={speech.listening} onClick={speech.start}><Mic size={18} /></button>
        <button className={ib} title="Upload document (PDF/JPG/PNG)" aria-label="Upload document" onClick={() => file.current?.click()}><Paperclip size={18} /></button>
        <input ref={file} type="file" accept=".pdf,.jpg,.jpeg,.png" hidden onChange={(e) => e.target.files?.[0] && setAttached(e.target.files[0].name)} />
        <button onClick={submit} className="inline-flex items-center gap-2 rounded bg-navy px-4 py-2.5 font-bold text-white hover:bg-[#0d2c4a]"><span className="hidden sm:inline">Send</span><ArrowRight size={18} /></button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm"><b>{copy.tryTxt}:</b>{suggestions.map((item) => <button key={item.label} onClick={() => onChange(item.query)} className="rounded border border-navy/60 px-3 py-1 font-semibold transition hover:bg-white">{item.label}</button>)}</div>
      {attached && <p className="mt-2 text-sm">Attached: {attached}</p>}
      {error && <p role="alert" className="mt-2 text-sm font-semibold text-red-900">{error}</p>}
      {speech.message && <p role="status" className="mt-2 text-sm">{speech.message}</p>}
    </div>
  )
}
