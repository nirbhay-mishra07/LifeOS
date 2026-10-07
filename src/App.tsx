import { Component, lazy, Suspense, useEffect, useRef, useState, type ErrorInfo, type ReactNode } from 'react'
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion'
import { HashRouter, Link, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import type { ServiceId } from './types'
import { localized, tr } from './i18n'
import { detect, services } from './data'
import { sendChatMessage as sendToAi } from './api'
import { AppProvider, useApp } from './state/AppContext'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import ServiceGrid from './components/ServiceGrid'
import HowItWorks from './components/HowItWorks'
import NextStep from './components/NextStep'
import ChatWorkspace, { type ChatMessage, type ChatSession } from './components/ChatWorkspace'
import ChatHistoryPage from './components/ChatHistoryPage'
import AnalysisLoader from './components/AnalysisLoader'
import Footer from './components/Footer'
import Modal from './components/Modal'
import Button, { btnClass } from './components/Button'
import { ExternalLink } from 'lucide-react'

const ServiceResult = lazy(() => import('./components/ServiceResult'))
const ActionPlan = lazy(() => import('./components/ActionPlan'))
const Dashboard = lazy(() => import('./components/Dashboard'))
const Skeleton = () => <div className="mx-auto my-12 max-w-4xl animate-pulse rounded-md border border-stone-200 bg-white p-8" aria-label="Loading"><div className="h-6 w-1/3 rounded bg-stone-200" /><div className="mt-5 h-28 rounded bg-stone-100" /></div>

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== 'object') return false
  const message = value as Record<string, unknown>
  return typeof message.id === 'string' && (message.role === 'user' || message.role === 'assistant') && typeof message.text === 'string'
}
function isChatSession(value: unknown): value is ChatSession {
  if (!value || typeof value !== 'object') return false
  const session = value as Record<string, unknown>
  return typeof session.id === 'string' && typeof session.title === 'string' && typeof session.updatedAt === 'number' && Array.isArray(session.messages) && session.messages.every(isChatMessage) && (session.interactionId === undefined || session.interactionId === null || typeof session.interactionId === 'string')
}
function restoreChats(): ChatSession[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem('lifeos:chats:v1') ?? 'null')
    return Array.isArray(saved) ? saved.filter(isChatSession) : []
  } catch { return [] }
}
function normalizeQuestion(value: string): string {
  return value.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
}

function Home({ onAnalyze }: { onAnalyze: (query: string) => void }) {
  const { my, tasks } = useApp()
  const navigate = useNavigate()
  const progress = (id: ServiceId) => Math.round(tasks[id].filter((task) => task.done).length / tasks[id].length * 100)
  return <>
    <Hero onAnalyze={onAnalyze} />
    <ServiceGrid onExplore={onAnalyze} />
    <HowItWorks />
    <NextStep my={my} tasks={tasks} progress={progress} onContinue={(id) => navigate(`/plan/${id}`)} />
  </>
}
function ResultRoute({ onOfficial }: { onOfficial: () => void }) {
  const { serviceId } = useParams()
  const id = serviceId as ServiceId
  if (!services[id]) return <NotFound />
  return <ServiceResult service={services[id]} onOfficial={onOfficial} />
}
function PlanRoute() {
  const { serviceId } = useParams()
  const id = serviceId as ServiceId
  const { addService } = useApp()
  useEffect(() => { if (services[id]) addService(id) }, [id, addService])
  if (!services[id]) return <NotFound />
  return <ActionPlan service={services[id]} />
}
function DashboardRoute() {
  return <Dashboard />
}
function NotFound() {
  const navigate = useNavigate()
  const { lang } = useApp()
  return <div className="mx-auto my-16 max-w-2xl px-5"><h2 className="text-2xl font-bold text-navy">{tr(lang, 'notFoundHeading')}</h2><p className="my-2">{tr(lang, 'notFoundBody')}</p><div className="flex flex-wrap gap-2">{(['elec', 'dl', 'pan'] as ServiceId[]).map((id) => <Link className={btnClass('outline')} key={id} to={`/result/${id}`}>{services[id].title}</Link>)}</div><Button className="mt-4" onClick={() => navigate('/')}>{tr(lang, 'backHome')}</Button></div>
}
function Help() { const navigate = useNavigate(); const { lang } = useApp(); return <div className="mx-auto my-10 max-w-2xl rounded-md border border-stone-200 bg-white p-6"><h2 className="text-2xl font-bold text-navy">{tr(lang, 'help')}</h2><p className="my-2">{tr(lang, 'helpBody')}</p><Button onClick={() => navigate('/')}>{tr(lang, 'goHome')}</Button></div> }
class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('LifeOS route failed', error, info.componentStack) }
  render() { return this.state.failed ? <div className="mx-auto my-16 max-w-xl rounded-md border border-stone-200 bg-white p-6"><h2 className="text-xl font-bold text-navy">Something went wrong</h2><p className="my-3">This demo page could not be displayed. Please return home and try again.</p><a className={btnClass()} href="#/">Back to home</a></div> : this.props.children }
}
function RoutedApp() {
  const app = useApp()
  const location = useLocation()
  const navigate = useNavigate()
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [query, setQuery] = useState('')
  const [pendingId, setPendingId] = useState<ServiceId | null>(null)
  const [official, setOfficial] = useState(false)
  const [chats, setChats] = useState<ChatSession[]>(restoreChats)
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [pendingChatId, setPendingChatId] = useState<string | null>(null)
  const [errorChatId, setErrorChatId] = useState<string | null>(null)
  const activeId = location.pathname.match(/^\/result\/([^/]+)/)?.[1] ?? location.pathname.match(/^\/plan\/([^/]+)/)?.[1]
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])
  useEffect(() => { if (location.pathname !== '/analyzing' && timer.current) { clearTimeout(timer.current); timer.current = null } }, [location.pathname])
  const requestChatResponse = async (chatId: string, message: string, previousInteractionId: string | null) => {
    setPendingChatId(chatId)
    setErrorChatId(null)
    try {
      const result = await sendToAi(message, previousInteractionId)
      const reply: ChatMessage = { id: crypto.randomUUID(), role: 'assistant', text: result.message }
      setChats((previous) => previous.map((chat) => chat.id === chatId ? {
        ...chat,
        updatedAt: Date.now(),
        interactionId: result.interaction_id,
        messages: [...chat.messages, reply],
      } : chat))
    } catch (error) {
      console.error('LifeOS AI request failed', error)
      setErrorChatId(chatId)
    } finally {
      setPendingChatId((current) => current === chatId ? null : current)
    }
  }
  const createChat = (firstMessage?: string) => {
    const text = firstMessage?.trim() ?? ''
    if (text) {
      const normalizedText = normalizeQuestion(text)
      const existing = chats.find((chat) => chat.messages.some((message) => message.role === 'user' && normalizeQuestion(message.text) === normalizedText))
      if (existing) {
        setActiveChatId(existing.id)
        setErrorChatId(null)
        navigate('/chat')
        return
      }
    }
    const id = crypto.randomUUID()
    const now = Date.now()
    const messages: ChatMessage[] = text ? [{ id: crypto.randomUUID(), role: 'user', text }] : []
    const session: ChatSession = { id, title: text ? text.slice(0, 42) : localized(app.lang).newChat, updatedAt: now, messages, interactionId: null }
    setChats((previous) => [session, ...previous])
    setActiveChatId(id)
    navigate('/chat')
    if (text) void requestChatResponse(id, text, null)
  }
  const sendChatMessage = (value: string) => {
    const text = value.trim()
    if (!text || pendingChatId) return
    if (!activeChatId) { createChat(text); return }
    const now = Date.now()
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', text }
    const activeChat = chats.find((chat) => chat.id === activeChatId)
    setChats((previous) => previous.map((chat) => chat.id === activeChatId ? {
      ...chat,
      title: chat.messages.length === 0 ? text.slice(0, 42) : chat.title,
      updatedAt: now,
      messages: [...chat.messages, userMessage],
    } : chat))
    setErrorChatId(null)
    void requestChatResponse(activeChatId, text, activeChat?.interactionId ?? null)
  }
  const retryChat = () => {
    const activeChat = chats.find((chat) => chat.id === activeChatId)
    const previousUserMessages = activeChat?.messages.filter((message) => message.role === 'user') ?? []
    const lastMessage = previousUserMessages[previousUserMessages.length - 1]?.text
    if (activeChat && lastMessage && !pendingChatId) {
      void requestChatResponse(activeChat.id, lastMessage, activeChat.interactionId ?? null)
    }
  }
  const continueChat = () => {
    const active = chats.find((chat) => chat.id === activeChatId)
    const userMessages = active?.messages.filter((message) => message.role === 'user') ?? []
    const lastQuery = userMessages[userMessages.length - 1]?.text
    if (!lastQuery) return
    setQuery(lastQuery)
    setPendingId(detect(lastQuery))
    navigate('/analyzing')
  }
  useEffect(() => { try { localStorage.setItem('lifeos:chats:v1', JSON.stringify(chats)) } catch { /* storage can be unavailable */ } }, [chats])
  useEffect(() => {
    if (location.pathname === '/chat' && !activeChatId) {
      const mostRecent = chats[0]
      if (mostRecent) setActiveChatId(mostRecent.id)
      else createChat()
    }
  }, [location.pathname, activeChatId, chats])
  useEffect(() => {
    if (location.pathname !== '/analyzing') return
    timer.current = setTimeout(() => { navigate(pendingId ? `/result/${pendingId}` : '/not-found', { replace: true }); timer.current = null }, 2000)
    return () => { if (timer.current) { clearTimeout(timer.current); timer.current = null } }
  }, [location.pathname, navigate, pendingId])
  const progress = (id: ServiceId) => Math.round(app.tasks[id].filter((task) => task.done).length / app.tasks[id].length * 100)
  return <MotionConfig reducedMotion="user"><LazyMotion features={domAnimation}><div className="min-h-screen">
    <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:bg-white focus:p-3">Skip to content</a>
    <Navbar t={localized(app.lang)} lang={app.lang} setLang={app.setLang} />
    <AnimatePresence mode="wait"><m.main id="main-content" key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
      <ErrorBoundary><Suspense fallback={<Skeleton />}><Routes location={location}>
        <Route path="/" element={<Home onAnalyze={(value) => createChat(value)} />} />
        <Route path="/chat" element={<ChatWorkspace sessions={chats} activeId={activeChatId ?? ''} onSelect={(id) => { setActiveChatId(id); setErrorChatId(null) }} onNewChat={() => createChat()} onSend={sendChatMessage} onContinue={continueChat} onRetry={retryChat} aiLoading={pendingChatId === activeChatId} inputDisabled={pendingChatId !== null} aiError={errorChatId === activeChatId} />} />
        <Route path="/history" element={<ChatHistoryPage sessions={chats} onOpen={(id) => { setActiveChatId(id); setErrorChatId(null); navigate('/chat') }} onNewChat={() => createChat()} />} />
        <Route path="/analyzing" element={<AnalysisLoader query={query} />} />
        <Route path="/result/:serviceId" element={<ResultRoute onOfficial={() => setOfficial(true)} />} />
        <Route path="/plan/:serviceId" element={<PlanRoute />} />
        <Route path="/dashboard" element={<DashboardRoute />} />
        <Route path="/help" element={<Help />} />
        <Route path="/not-found" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes></Suspense></ErrorBoundary>
    </m.main></AnimatePresence>
    {location.pathname !== '/chat' && <Footer />}
    <Modal open={official} onClose={() => setOfficial(false)}><h3 className="mb-2 text-lg font-bold">Official service link</h3><p className="mb-4">You are leaving the LifeOS prototype. This opens an official government website in a new tab.</p><a className={btnClass()} href={activeId && services[activeId as ServiceId] ? services[activeId as ServiceId].officialUrl : '#'} target="_blank" rel="noopener noreferrer">Open official website <ExternalLink size={16} /></a></Modal>
  </div></LazyMotion></MotionConfig>
}
export default function App() { return <AppProvider><HashRouter><RoutedApp /></HashRouter></AppProvider> }
