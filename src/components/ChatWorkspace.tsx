import { ArrowRight, MessageSquarePlus, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { localized } from '../i18n'
import { detect } from '../data'
import { useApp } from '../state/AppContext'
import ChatInput from './ChatInput'

export interface ChatMessage { id: string; role: 'user' | 'assistant'; text: string }
export interface ChatSession { id: string; title: string; updatedAt: number; messages: ChatMessage[]; interactionId?: string | null }

function renderInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|__[^_]+__|\*[^*\n]+\*|_[^_\n]+_)/g).filter(Boolean).map((part, index) => {
    if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
      return <strong key={index} className="font-semibold text-navy">{part.slice(2, -2)}</strong>
    }
    if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
      return <em key={index}>{part.slice(1, -1)}</em>
    }
    return <span key={index}>{part.replace(/\*/g, '')}</span>
  })
}

function renderAssistantText(text: string): ReactNode[] {
  const blocks: ReactNode[] = []
  let paragraph: string[] = []
  let items: string[] = []
  let listType: 'ul' | 'ol' | null = null
  const flushParagraph = () => {
    if (!paragraph.length) return
    blocks.push(<p key={`p-${blocks.length}`} className="mb-3 last:mb-0">{renderInline(paragraph.join(' '))}</p>)
    paragraph = []
  }
  const flushList = () => {
    if (!items.length || !listType) return
    const List = listType
    blocks.push(<List key={`l-${blocks.length}`} className={`mb-3 space-y-1.5 pl-5 last:mb-0 ${listType === 'ul' ? 'list-disc' : 'list-decimal'}`}>{items.map((item, index) => <li key={index} className="pl-1">{renderInline(item)}</li>)}</List>)
    items = []
    listType = null
  }

  text.replace(/\r/g, '').split('\n').forEach((line) => {
    const trimmed = line.trim()
    const unordered = trimmed.match(/^[-*+]\s+(.+)$/)
    const ordered = trimmed.match(/^\d+[.)]\s+(.+)$/)
    if (unordered || ordered) {
      flushParagraph()
      const nextType = unordered ? 'ul' : 'ol'
      if (listType && listType !== nextType) flushList()
      listType = nextType
      items.push((unordered?.[1] ?? ordered?.[1] ?? '').trim())
      return
    }
    flushList()
    if (!trimmed) {
      flushParagraph()
      return
    }
    const heading = trimmed.match(/^#{1,3}\s+(.+)$/)
    if (heading) {
      flushParagraph()
      blocks.push(<h3 key={`h-${blocks.length}`} className="mb-2 mt-1 font-bold text-navy">{renderInline(heading[1])}</h3>)
      return
    }
    paragraph.push(trimmed)
  })
  flushParagraph()
  flushList()
  return blocks
}

interface Props {
  sessions: ChatSession[]
  activeId: string
  onSelect: (id: string) => void
  onNewChat: () => void
  onSend: (text: string) => void
  onContinue: () => void
  onRetry: () => void
  aiLoading: boolean
  inputDisabled: boolean
  aiError: boolean
}

export default function ChatWorkspace({ sessions, activeId, onSelect, onNewChat, onSend, onContinue, onRetry, aiLoading, inputDisabled, aiError }: Props) {
  const { lang } = useApp()
  const t = localized(lang)
  const active = sessions.find((session) => session.id === activeId)
  const hasUserMessage = active?.messages.some((message) => message.role === 'user') ?? false
  const latestUserMessage = active?.messages.filter((message) => message.role === 'user').slice(-1)[0]
  const canContinueToService = Boolean(latestUserMessage && detect(latestUserMessage.text))

  return (
    <section className="mx-auto flex min-h-[calc(100svh-4.25rem)] max-w-7xl flex-col px-3 py-3 sm:px-5 sm:py-5">
      <div className="flex min-h-[min(780px,calc(100svh-8rem))] flex-1 flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm md:flex-row">
        <aside className="flex max-h-44 shrink-0 flex-col border-b border-stone-200 bg-[#fbfaf7] p-3 md:max-h-none md:w-64 md:border-b-0 md:border-r md:p-4">
          <button type="button" disabled={inputDisabled} onClick={onNewChat} className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-navy px-4 py-3 font-bold text-white transition hover:bg-[#0d2c4a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
            <MessageSquarePlus size={18} aria-hidden="true" />{t.newChat}
          </button>
          <h2 className="mb-2 mt-4 hidden text-xs font-bold uppercase tracking-wider text-stone-500 md:block">{t.chatHistory}</h2>
          <div className="mt-3 flex gap-2 overflow-x-auto md:mt-0 md:flex-1 md:flex-col md:overflow-y-auto md:overflow-x-hidden">
            {sessions.map((session) => (
              <button key={session.id} type="button" disabled={inputDisabled} onClick={() => onSelect(session.id)} aria-current={session.id === activeId ? 'page' : undefined}
                className={`max-w-56 shrink-0 truncate rounded-lg px-3 py-2.5 text-left text-sm transition disabled:cursor-not-allowed md:max-w-none ${session.id === activeId ? 'bg-white font-semibold text-navy shadow-sm ring-1 ring-stone-200' : 'text-stone-700 hover:bg-white'}`}>
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
                  {message.role === 'assistant'
                    ? <div className="text-sm leading-relaxed sm:text-base">{renderAssistantText(message.text)}</div>
                    : <p className="whitespace-pre-wrap text-sm leading-relaxed sm:text-base">{message.text}</p>}
                  <time className={`mt-2 block text-[11px] ${message.role === 'user' ? 'text-white/70' : 'text-stone-500'}`}>{new Date(active.updatedAt).toLocaleTimeString(lang === 'hi' ? 'hi-IN' : 'en-IN', { hour: 'numeric', minute: '2-digit' })}</time>
                </div>
              </article>
            )) : <div className="mx-auto mt-8 max-w-md rounded-xl border border-stone-200 bg-white p-5 text-center text-stone-600 shadow-sm"><Sparkles className="mx-auto mb-3 text-burnt" size={22} aria-hidden="true" /><p>{t.chatWelcome}</p></div>}
            {aiLoading && <div role="status" className="flex justify-start"><div className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-600 shadow-sm"><span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-burnt" />{t.chatLoading}</div></div>}
            {aiError && <div role="alert" className="flex flex-wrap items-center gap-3 text-sm text-red-900"><p>{t.aiUnavailable}</p><button type="button" onClick={onRetry} className="rounded border border-red-800 px-3 py-1.5 font-semibold hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-800">{t.retry}</button></div>}
            {hasUserMessage && canContinueToService && !aiLoading && <div className="flex justify-start"><button type="button" onClick={onContinue} className="inline-flex items-center gap-2 rounded-lg border border-navy bg-white px-4 py-2.5 text-sm font-bold text-navy transition hover:bg-navy hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2">{t.continueGuidance}<ArrowRight size={16} aria-hidden="true" /></button></div>}
          </div>
          <div className="border-t border-stone-200 bg-white px-4 py-4 sm:px-8 sm:py-5">
            <ChatInput key={`${activeId}-${active?.messages.length ?? 0}`} onSend={onSend} disabled={inputDisabled} submitLabel={t.sendChat} />
          </div>
        </div>
      </div>
    </section>
  )
}
