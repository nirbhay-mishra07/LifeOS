import { useApp } from '../state/AppContext'
import { tr } from '../i18n'
export default function Footer() {
  const { resetDemo, lang } = useApp()
  return (
    <footer className="bg-[#0d2c4a] py-8 text-sm text-white">
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex flex-wrap justify-between gap-6">
          <div><b className="text-lg">LifeOS</b><br />Making everyday services easier to navigate.</div>
          <div className="flex flex-wrap gap-4 opacity-90">{['Services', 'Help', 'About', 'Privacy', 'Accessibility'].map((l) => <a key={l} href="#" className="hover:underline">{l}</a>)}</div>
        </div>
        <p className="mt-5 opacity-70">Built as a Microsoft Innovate 2026 prototype. Not affiliated with any government body. All data shown is demo information.</p>
        <button className="mt-3 rounded border border-white/50 px-3 py-1.5 font-semibold hover:bg-white/10" onClick={resetDemo}>{tr(lang, 'resetDemo')}</button>
      </div>
    </footer>
  )
}
