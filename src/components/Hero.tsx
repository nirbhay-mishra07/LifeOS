import { useEffect, useRef } from 'react'
import { m } from 'framer-motion'
import { ArrowRight, Bot, RotateCcw } from 'lucide-react'
import { localized } from '../i18n'
import { useApp } from '../state/AppContext'
import { chips, sample, services } from '../data'
import { icons } from './icons'
import ChatInput from './ChatInput'
import type { ServiceId } from '../types'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  onAnalyze: (q: string) => void
  aiResponse: string
  aiLoading: boolean
  aiError: string
  messages: ChatMessage[]
  onNewChat: () => void
}

function CleanMessage({ content }: { content: string }) {
  const lines = content
    .replace(/\*\*/g, '')
    .replace(/^#{1,6}\s*/gm, '')
    .split('\n')

  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        const trimmed = line.trim()

        if (!trimmed) {
          return <div key={index} className="h-1" />
        }

        if (/^[-*•]\s+/.test(trimmed)) {
          return (
            <div key={index} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-navy/60" />
              <span>{trimmed.replace(/^[-*•]\s+/, '')}</span>
            </div>
          )
        }

        return <p key={index}>{trimmed}</p>
      })}
    </div>
  )
}

export default function Hero({
  onAnalyze,
  aiResponse,
  aiLoading,
  aiError,
  messages,
  onNewChat,
}: Props) {
  const { lang } = useApp()
  const t = localized(lang)

  const responseRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!aiLoading && messages.length === 0 && !aiError) return

    requestAnimationFrame(() => {
      responseRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    })
  }, [aiLoading, messages.length, aiError])

  return (
    <section className="bg-saf text-navy">
      <div className="mx-auto grid max-w-6xl items-start gap-8 px-5 py-12 lg:grid-cols-[1.25fr_1fr]">

        {/* LEFT */}
        <m.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-bold uppercase tracking-widest opacity-90">
            {t.badge}
          </p>

          <h1 className="my-3 text-3xl font-extrabold leading-tight sm:text-5xl">
            {t.h1}
          </h1>

          <p className="mb-6 max-w-xl opacity-95">
            {t.sub}
          </p>

          {/* CHAT */}
          {(messages.length > 0 || aiLoading || aiError) && (
            <div
              ref={responseRef}
              className="overflow-hidden rounded-xl border border-navy/10 bg-white shadow-[0_4px_0_rgba(0,0,0,.14)]"
            >
              {/* HEADER */}
              <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-navy text-white">
                    <Bot size={18} />
                  </div>

                  <div>
                    <h2 className="font-bold text-navy">
                      LifeOS AI
                    </h2>
                    <p className="text-xs text-stone-500">
                      {aiLoading
                        ? 'Thinking...'
                        : 'Your personal assistant'}
                    </p>
                  </div>
                </div>

                {messages.length > 0 && !aiLoading && (
                  <button
                    type="button"
                    onClick={onNewChat}
                    className="flex items-center gap-1.5 rounded-lg border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-600 transition hover:bg-stone-50"
                  >
                    <RotateCcw size={13} />
                    New Chat
                  </button>
                )}
              </div>

              {/* MESSAGE AREA */}
              <div className="h-[430px] overflow-y-auto px-5 py-5 [scrollbar-width:thin]">
                <div className="space-y-5">
                  {messages.map((message, index) => (
                    <div
                      key={`${message.role}-${index}`}
                      className={
                        message.role === 'user'
                          ? 'flex justify-end'
                          : 'flex justify-start'
                      }
                    >
                      <div
                        className={
                          message.role === 'user'
                            ? 'max-w-[82%] rounded-2xl rounded-br-md bg-navy px-4 py-3 text-sm leading-6 text-white shadow-sm'
                            : 'max-w-[92%] rounded-2xl rounded-bl-md border border-stone-200 bg-stone-50 px-4 py-3 text-sm leading-6 text-ink'
                        }
                      >
                        {message.role === 'assistant' && (
                          <div className="mb-2 text-xs font-bold text-navy">
                            LifeOS AI
                          </div>
                        )}

                        {message.role === 'assistant' ? (
                          <CleanMessage content={message.content} />
                        ) : (
                          <div>{message.content}</div>
                        )}
                      </div>
                    </div>
                  ))}

                  {aiLoading && (
                    <div className="flex justify-start">
                      <div className="rounded-2xl rounded-bl-md border border-stone-200 bg-stone-50 px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-stone-600">
                          <span className="h-2 w-2 animate-bounce rounded-full bg-stone-500" />
                          <span
                            className="h-2 w-2 animate-bounce rounded-full bg-stone-500"
                            style={{ animationDelay: '120ms' }}
                          />
                          <span
                            className="h-2 w-2 animate-bounce rounded-full bg-stone-500"
                            style={{ animationDelay: '240ms' }}
                          />
                          <span className="ml-1">
                            LifeOS AI is thinking...
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {aiError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-900">
                      {aiError}
                    </div>
                  )}
                </div>
              </div>

              {/* INPUT INSIDE CHAT */}
              <div className="border-t border-stone-200 bg-stone-50 p-3">
                <ChatInput
                  onSend={onAnalyze}
                  suggestions={chips}
                />
              </div>
            </div>
          )}

          {/* INITIAL INPUT */}
          {messages.length === 0 && !aiLoading && !aiError && (
            <ChatInput
              onSend={onAnalyze}
              suggestions={chips}
            />
          )}
        </m.div>

        {/* RIGHT SIDE */}
        <div className="hidden gap-3 lg:grid">
          {(['elec', 'dl', 'pan'] as ServiceId[]).map((id, i) => {
            const s = services[id]
            const Icon = icons[s.icon]

            return (
              <m.button
                key={id}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.2 + i * 0.12,
                }}
                whileHover={{ x: -4 }}
                onClick={() => onAnalyze(sample[id])}
                className="flex items-center gap-4 rounded-xl bg-white p-4 text-left text-ink shadow-[0_2px_0_rgba(0,0,0,.18)] transition"
              >
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-navy/10 text-navy">
                  <Icon size={22} />
                </span>

                <span>
                  <b className="block">
                    {s.title}
                  </b>

                  <small className="text-stone-500">
                    {s.time}
                  </small>
                </span>

                <ArrowRight
                  size={18}
                  className="ml-auto text-burnt"
                />
              </m.button>
            )
          })}
        </div>

      </div>
    </section>
  )
}
