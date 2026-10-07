import { useRef, useState } from 'react'
import { ArrowRight, Mic, Paperclip, Search } from 'lucide-react'
import { useSpeech } from '../hooks/useSpeech'
import { useApp } from '../state/AppContext'
import { localized } from '../i18n'
interface Suggestion { label: string; query: string }
interface Props { onSend: (query: string) => void; suggestions?: Suggestion[] }
export default function ChatInput({ onSend, suggestions }: Props) {
  const file = useRef<HTMLInputElement>(null)
  const { lang, attached, setAttached } = useApp()
  const [value, onChange] = useState('')
  const [error, setError] = useState('')
  const speech = useSpeech(lang, onChange)
  const copy = localized(lang)
  const submit = () => { if (!value.trim()) { setError(copy.inputError); return } setError(''); onSend(value) }
  const ib = 'rounded-md border border-stone-300 p-2.5 text-ink transition hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2'
  return (
    <div className="w-full">
      <form onSubmit={(e) => { e.preventDefault(); submit() }} className="transition duration-200 ease-out focus-within:-translate-y-1.5 focus-within:shadow-[0_12px_28px_rgba(15,42,68,0.16)]">
        <div className="flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white p-2 text-ink shadow-sm transition-colors focus-within:border-navy focus-within:ring-2 focus-within:ring-navy/20 sm:gap-2 sm:p-2.5">
          <Search size={22} aria-hidden="true" className="ml-1 shrink-0 text-stone-500 sm:ml-2" />
          <input value={value} onChange={(e) => { onChange(e.target.value); if (e.target.value.trim()) setError('') }} placeholder={copy.ph} aria-label={copy.ph}
            className="min-w-0 flex-1 bg-transparent px-1 py-3 text-base outline-none placeholder:text-stone-500 sm:px-2 sm:py-4 sm:text-lg" />
          <button type="button" className={ib} title={speech.listening ? copy.listening : copy.voiceInput} aria-label={speech.listening ? copy.listening : copy.voiceInput} aria-pressed={speech.listening} onClick={speech.start}><Mic size={19} /></button>
          <button type="button" className={`${ib} hidden sm:block`} title={copy.uploadDocument} aria-label={copy.uploadDocument} onClick={() => file.current?.click()}><Paperclip size={19} /></button>
          <input ref={file} type="file" accept=".pdf,.jpg,.jpeg,.png" hidden onChange={(e) => e.target.files?.[0] && setAttached(e.target.files[0].name)} />
          <button type="submit" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-navy px-3.5 py-3 font-bold text-white transition hover:bg-[#0d2c4a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 sm:px-5 sm:py-3.5"><span className="hidden sm:inline">{copy.send}</span><ArrowRight size={19} aria-hidden="true" /></button>
        </div>
      </form>
      {suggestions && suggestions.length > 0 && <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm sm:mt-6"><b className="mr-1 text-stone-600">{copy.tryTxt}:</b>{suggestions.map((item) => <button key={item.label} type="button" onClick={() => onChange(item.query)} className="rounded-full border border-stone-300 bg-white px-3.5 py-1.5 font-semibold text-navy transition hover:border-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy">{item.label}</button>)}</div>}
      {attached && <p className="mt-2 text-center text-sm text-stone-600">{copy.attached}: {attached}</p>}
      {error && <p role="alert" className="mt-2 text-center text-sm font-semibold text-red-900">{error}</p>}
      {speech.message && <p role="status" className="mt-2 text-center text-sm text-stone-700">{speech.message}</p>}
    </div>
  )
}
