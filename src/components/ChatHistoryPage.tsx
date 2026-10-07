import { ArrowRight, Clock3, MessageCircle, Plus } from 'lucide-react'
import { localized } from '../i18n'
import { useApp } from '../state/AppContext'
import type { ChatSession } from './ChatWorkspace'

interface Props {
  sessions: ChatSession[]
  onOpen: (id: string) => void
  onNewChat: () => void
}

export default function ChatHistoryPage({ sessions, onOpen, onNewChat }: Props) {
  const { lang } = useApp()
  const t = localized(lang)
  const formatDate = (timestamp: number) => new Date(timestamp).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { dateStyle: 'medium' })

  return (
    <section className="mx-auto min-h-[calc(100svh-4.25rem)] max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-burnt">LifeOS AI</p>
          <h1 className="mt-1 text-3xl font-extrabold text-navy">{t.chatHistory}</h1>
        </div>
        <button type="button" onClick={onNewChat} className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2.5 font-bold text-white transition hover:bg-[#0d2c4a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2">
          <Plus size={18} aria-hidden="true" />{t.newChat}
        </button>
      </header>

      {sessions.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white p-8 text-center text-stone-600 shadow-sm">
          <MessageCircle className="mx-auto mb-3 text-burnt" size={28} aria-hidden="true" />
          <p>{t.noChatHistory}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {sessions.map((session) => {
            const lastMessage = session.messages[session.messages.length - 1]
            return (
              <li key={session.id}>
                <button type="button" onClick={() => onOpen(session.id)} className="group flex w-full items-center gap-4 rounded-xl border border-stone-200 bg-white p-4 text-left shadow-sm transition hover:border-navy/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy sm:p-5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-paper text-navy"><MessageCircle size={20} aria-hidden="true" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold text-navy">{session.title}</span>
                    <span className="mt-1 block truncate text-sm text-stone-600">{lastMessage?.text ?? t.chatWelcome}</span>
                    <span className="mt-2 flex items-center gap-1.5 text-xs text-stone-500"><Clock3 size={13} aria-hidden="true" />{formatDate(session.updatedAt)}</span>
                  </span>
                  <ArrowRight size={18} aria-hidden="true" className="shrink-0 text-stone-400 transition group-hover:translate-x-0.5 group-hover:text-navy" />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
