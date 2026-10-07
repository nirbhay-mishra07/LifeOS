import { m } from 'framer-motion'
import { localized } from '../i18n'
import { useApp } from '../state/AppContext'
import { sample } from '../data'
import ChatInput from './ChatInput'

interface Props { onAnalyze: (q: string) => void }

export default function Hero({ onAnalyze }: Props) {
  const { lang } = useApp()
  const t = localized(lang)
  const suggestions = [
    { label: t.exampleElectricity, query: sample.elec },
    { label: t.exampleLicence, query: sample.dl },
    { label: t.examplePan, query: sample.pan },
  ]

  return (
    <section className="flex min-h-[calc(100svh-4.25rem)] items-center justify-center bg-paper px-4 py-12 text-navy sm:px-6">
      <m.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-3xl text-center"
      >
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-burnt sm:text-sm">{t.badge}</p>
        <h1 className="mx-auto my-4 max-w-2xl text-3xl font-extrabold leading-tight sm:text-5xl">{t.h1}</h1>
        <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-stone-600 sm:text-lg">{t.sub}</p>
        <div className="mx-auto w-full max-w-3xl text-left">
          <ChatInput onSend={onAnalyze} suggestions={suggestions} />
        </div>
      </m.div>
    </section>
  )
}
