import { useEffect, useRef } from 'react'
import { m } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { localized } from '../i18n'
import { useApp } from '../state/AppContext'
import { chips, sample, services } from '../data'
import { icons } from './icons'
import ChatInput from './ChatInput'
import type { ServiceId } from '../types'

interface Props {
  onAnalyze: (q: string) => void
  aiResponse: string
  aiLoading: boolean
  aiError: string
}

export default function Hero({
  onAnalyze,
  aiResponse,
  aiLoading,
  aiError,
}: Props) {
  const { lang } = useApp()
  const t = localized(lang)

  const responseRef = useRef<HTMLDivElement | null>(null)

  /*
   * Scroll to the AI response when:
   * - thinking starts
   * - response arrives
   * - an error occurs
   */
  useEffect(() => {
    if (!aiLoading && !aiResponse && !aiError) return

    requestAnimationFrame(() => {
      responseRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    })
  }, [aiLoading, aiResponse, aiError])

  return (
    <section className="bg-saf text-navy">
      <div className="mx-auto grid max-w-6xl items-start gap-10 px-5 py-14 lg:grid-cols-[1.25fr_1fr]">

        {/* LEFT SIDE */}
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

          {/* CHAT INPUT */}
          <ChatInput
            onSend={onAnalyze}
            suggestions={chips}
          />

          {/* AI RESPONSE */}
          {(aiLoading || aiResponse || aiError) && (
            <div
              ref={responseRef}
              className="mt-6 scroll-mt-6"
            >
              <div className="rounded-md border border-navy/10 bg-white p-5 text-ink shadow-[0_3px_0_rgba(0,0,0,.15)]">

                {/* HEADER */}
                <div className="mb-4 flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-navy text-xs font-bold text-white">
                    AI
                  </div>

                  <div>
                    <h2 className="font-bold text-navy">
                      LifeOS AI
                    </h2>

                    {aiLoading && (
                      <p className="text-xs text-stone-500">
                        Thinking...
                      </p>
                    )}
                  </div>
                </div>

                {/* THINKING */}
                {aiLoading && (
                  <div className="flex items-center gap-2 text-stone-600">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-stone-500" />

                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-stone-500"
                      style={{ animationDelay: '120ms' }}
                    />

                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-stone-500"
                      style={{ animationDelay: '240ms' }}
                    />

                    <span className="ml-2">
                      LifeOS AI is thinking...
                    </span>
                  </div>
                )}

                {/* ERROR */}
                {aiError && (
                  <p className="font-semibold text-red-900">
                    {aiError}
                  </p>
                )}

                {/* ACTUAL GEMINI RESPONSE */}
                {aiResponse && !aiLoading && (
                  <div className="whitespace-pre-wrap leading-7 text-ink">
                    {aiResponse}
                  </div>
                )}

              </div>
            </div>
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
                className="flex items-center gap-4 rounded-md bg-white p-4 text-left text-ink shadow-[0_2px_0_rgba(0,0,0,.2)]"
              >
                <span className="grid h-11 w-11 place-items-center rounded bg-navy/10 text-navy">
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