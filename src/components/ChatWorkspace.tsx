import { ArrowRight, MessageSquarePlus, Sparkles } from 'lucide-react'
import { localized } from '../i18n'
import { useApp } from '../state/AppContext'
import ChatInput from './ChatInput'

export interface ChatMessage { id: string; role: 'user' | 'assistant'; text: string }
export interface ChatSession { id: string; title: string; updatedAt: number; messages: ChatMessage[] }

interface Props {
  sessions: ChatSession[]
  activeId: string
  onSelect: (id: string) => void
  onNewChat: () => void
  onSend: (text: string) => void
  onContinue: () => void
}

export default function ChatWorkspace({ sessions, activeId, onSelect, onNewChat, onSend, onContinue }: Props) {
  const { lang } = useApp()
  const t = localized(lang)
  const active = sessions.find((session) => session.id === activeId)
  const hasUserMessage = active?.messages.some((message) => message.role === 'user') ?? false

  return (
    <section className="mx-auto flex min-h-[calc(100svh-4.25rem)] max-w-7xl flex-col px-3 py-3 sm:px-5 sm:py-5">
      <div className="flex min-h-[min(780px,calc(100svh-8rem))] flex-1 flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm md:flex-row">
        <aside className="flex max-h-44 shrink-0 flex-col border-b border-stone-200 bg-[#fbfaf7] p-3 md:max-h-none md:w-64 md:border-b-0 md:border-r md:p-4">
          <button type="button" onClick={onNewChat} className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-navy px-4 py-3 font-bold text-white transition hover:bg-[#0d2c4a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2">
            <MessageSquarePlus size={18} aria-hidden="true" />{t.newChat}
          </button>
          <h2 className="mb-2 mt-4 hidden text-xs font-bold uppercase tracking-wider text-stone-500 md:block">{t.chatHistory}</h2>
          <div className="mt-3 flex gap-2 overflow-x-auto md:mt-0 md:flex-1 md:flex-col md:overflow-y-auto md:overflow-x-hidden">
            {sessions.map((session) => (
              <button key={session.id} type="button" onClick={() => onSelect(session.id)} aria-current={session.id === activeId ? 'page' : undefined}
                className={`max-w-56 shrink-0 truncate rounded-lg px-3 py-2.5 text-left text-sm transition md:max-w-none ${session.id === activeId ? 'bg-white font-semibold text-navy shadow-sm ring-1 ring-stone-200' : 'text-stone-700 hover:bg-white'}`}>
                {session.title}
              </button>
            ))}
            {sessions.length === 0 && <p className="hidden px-2 py-2 text-sm text-stone-500 md:block">{t.chatHistory}</p>}
          </div>
        </aside>

        <div className="flex min-h-[460px] flex-1 flex-col md:min-h-0">
          <header className="border-b border-stone-100 px-5 py-4 sm:px-8">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-burnt"><Sparkles size={14} aria-hidden="true" />{t.aiName}</p>
            <h1 className="mt-1 truncate text-lg font-bold text-navy">{active?.title ?? t.newChat}</h1>
          </header>
          <div className="flex-1 space-y-5 overflow-y-auto bg-paper/40 px-4 py-5 sm:px-8 sm:py-7" aria-live="polite">
            {active?.messages.length ? active.messages.map((message) => (
              <article key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] rounded-xl px-4 py-3 sm:max-w-[78%] ${message.role === 'user' ? 'bg-navy text-white' : 'border border-stone-200 bg-white text-ink shadow-sm'}`}>
                  {message.role === 'assistant' && <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-navy"><Sparkles size={14} aria-hidden="true" />{t.aiName}</p>}
                  <p className="whitespace-pre-wrap text-sm leading-relaxed sm:text-base">{message.text}</p>
                  <time className={`mt-2 block text-[11px] ${message.role === 'user' ? 'text-white/70' : 'text-stone-500'}`}>{new Date(active.updatedAt).toLocaleTimeString(lang === 'hi' ? 'hi-IN' : 'en-IN', { hour: 'numeric', minute: '2-digit' })}</time>
                </div>
              </article>
            )) : <div className="mx-auto mt-8 max-w-md rounded-xl border border-stone-200 bg-white p-5 text-center text-stone-600 shadow-sm"><Sparkles className="mx-auto mb-3 text-burnt" size={22} aria-hidden="true" /><p>{t.chatWelcome}</p></div>}
            {hasUserMessage && <div className="flex justify-start"><button type="button" onClick={onContinue} className="inline-flex items-center gap-2 rounded-lg border border-navy bg-white px-4 py-2.5 text-sm font-bold text-navy transition hover:bg-navy hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2">{t.continueGuidance}<ArrowRight size={16} aria-hidden="true" /></button></div>}
          </div>
          <div className="border-t border-stone-200 bg-white px-4 py-4 sm:px-8 sm:py-5">
            <ChatInput key={`${activeId}-${active?.messages.length ?? 0}`} onSend={onSend} />
          </div>
        </div>
      </div>
    </section>
  )
}
