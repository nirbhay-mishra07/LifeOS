import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ErrorInfo,
  type ReactNode,
} from 'react'

import {
  AnimatePresence,
  LazyMotion,
  MotionConfig,
  domAnimation,
  m,
} from 'framer-motion'

import {
  HashRouter,
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'

import type { ServiceId } from './types'

import { localized, tr } from './i18n'
import { services } from './data'
import { AppProvider, useApp } from './state/AppContext'
import { sendChatMessage } from './api'

import Navbar from './components/Navbar'
import Hero from './components/Hero'
import ServiceGrid from './components/ServiceGrid'
import HowItWorks from './components/HowItWorks'
import NextStep from './components/NextStep'
import AnalysisLoader from './components/AnalysisLoader'
import Footer from './components/Footer'
import Modal from './components/Modal'
import Button, { btnClass } from './components/Button'

import { ExternalLink } from 'lucide-react'

const ServiceResult = lazy(() => import('./components/ServiceResult'))
const ActionPlan = lazy(() => import('./components/ActionPlan'))
const Dashboard = lazy(() => import('./components/Dashboard'))

const Skeleton = () => (
  <div
    className="mx-auto my-12 max-w-4xl animate-pulse rounded-md border border-stone-200 bg-white p-8"
    aria-label="Loading"
  >
    <div className="h-6 w-1/3 rounded bg-stone-200" />
    <div className="mt-5 h-28 rounded bg-stone-100" />
  </div>
)

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface HomeProps {
  onAnalyze: (query: string) => void
  aiLoading: boolean
  aiResponse: string
  aiError: string
  messages: ChatMessage[]
  onNewChat: () => void
}

function Home({
  onAnalyze,
  aiLoading,
  aiResponse,
  aiError,
  messages,
  onNewChat,
}: HomeProps) {
  const { my, tasks } = useApp()
  const navigate = useNavigate()

  const progress = (id: ServiceId) =>
    Math.round(
      (tasks[id].filter((task) => task.done).length /
        tasks[id].length) *
        100
    )

  return (
    <>
      <Hero
        onAnalyze={onAnalyze}
        aiLoading={aiLoading}
        aiResponse={aiResponse}
        aiError={aiError}
        messages={messages}
        onNewChat={onNewChat}
      />

      <ServiceGrid onExplore={onAnalyze} />

      <HowItWorks />

      <NextStep
        my={my}
        tasks={tasks}
        progress={progress}
        onContinue={(id) => navigate(`/plan/${id}`)}
      />
    </>
  )
}

function ResultRoute({ onOfficial }: { onOfficial: () => void }) {
  const { serviceId } = useParams()
  const id = serviceId as ServiceId

  if (!services[id]) {
    return <NotFound />
  }

  return (
    <ServiceResult
      service={services[id]}
      onOfficial={onOfficial}
    />
  )
}

function PlanRoute() {
  const { serviceId } = useParams()
  const id = serviceId as ServiceId
  const { addService } = useApp()

  useEffect(() => {
    if (services[id]) {
      addService(id)
    }
  }, [id, addService])

  if (!services[id]) {
    return <NotFound />
  }

  return <ActionPlan service={services[id]} />
}

function DashboardRoute() {
  return <Dashboard />
}

function NotFound() {
  const navigate = useNavigate()
  const { lang } = useApp()

  return (
    <div className="mx-auto my-16 max-w-2xl px-5">
      <h2 className="text-2xl font-bold text-navy">
        {tr(lang, 'notFoundHeading')}
      </h2>

      <p className="my-2">
        {tr(lang, 'notFoundBody')}
      </p>

      <div className="flex flex-wrap gap-2">
        {(['elec', 'dl', 'pan'] as ServiceId[]).map(
          (id) => (
            <Link
              className={btnClass('outline')}
              key={id}
              to={`/result/${id}`}
            >
              {services[id].title}
            </Link>
          )
        )}
      </div>

      <Button
        className="mt-4"
        onClick={() => navigate('/')}
      >
        {tr(lang, 'backHome')}
      </Button>
    </div>
  )
}

function Help() {
  const navigate = useNavigate()
  const { lang } = useApp()

  return (
    <div className="mx-auto my-10 max-w-2xl rounded-md border border-stone-200 bg-white p-6">
      <h2 className="text-2xl font-bold text-navy">
        {tr(lang, 'help')}
      </h2>

      <p className="my-2">
        {tr(lang, 'helpBody')}
      </p>

      <Button onClick={() => navigate('/')}>
        {tr(lang, 'goHome')}
      </Button>
    </div>
  )
}

class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = {
    failed: false,
  }

  static getDerivedStateFromError() {
    return {
      failed: true,
    }
  }

  componentDidCatch(
    error: Error,
    info: ErrorInfo
  ) {
    console.error(
      'LifeOS route failed',
      error,
      info.componentStack
    )
  }

  render() {
    return this.state.failed ? (
      <div className="mx-auto my-16 max-w-xl rounded-md border border-stone-200 bg-white p-6">
        <h2 className="text-xl font-bold text-navy">
          Something went wrong
        </h2>

        <p className="my-3">
          This demo page could not be displayed.
          Please return home and try again.
        </p>

        <a
          className={btnClass()}
          href="#/"
        >
          Back to home
        </a>
      </div>
    ) : (
      this.props.children
    )
  }
}

function RoutedApp() {
  const app = useApp()
  const location = useLocation()

  const timer = useRef<ReturnType<typeof setTimeout> | null>(
    null
  )

  const [query, setQuery] = useState('')
  const [official, setOfficial] = useState(false)

  const [aiResponse, setAiResponse] = useState('')
  const [interactionId, setInteractionId] =
    useState<string | null>(null)

  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  const [messages, setMessages] = useState<ChatMessage[]>([])

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current)
      }
    }
  }, [])

  useEffect(() => {
    if (
      location.pathname !== '/analyzing' &&
      timer.current
    ) {
      clearTimeout(timer.current)
      timer.current = null
    }
  }, [location.pathname])

  /*
   * Main LifeOS AI handler.
   *
   * Every message goes to the backend.
   * The backend decides whether it is a LifeOS
   * service request or a general Gemini conversation.
   */
  const analyze = async (value: string) => {
    const trimmed = value.trim()

    if (!trimmed || aiLoading) {
      return
    }

    setQuery(trimmed)
    setAiError('')
    setAiResponse('')
    setAiLoading(true)

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: trimmed,
      },
    ])

    try {
      const result = await sendChatMessage(
        trimmed,
        interactionId
      )

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: result.message,
        },
      ])

      setAiResponse(result.message)
      setInteractionId(result.interaction_id)
    } catch (error) {
      console.error(
        'LifeOS AI request failed',
        error
      )

      setAiError(
        'Unable to connect to the LifeOS AI service. Make sure the backend is running on port 8000.'
      )
    } finally {
      setAiLoading(false)
    }
  }

  const newChat = () => {
    setMessages([])
    setInteractionId(null)
    setAiResponse('')
    setAiError('')
    setQuery('')
  }
  const activeId =
    location.pathname.match(
      /^\/result\/([^/]+)/
    )?.[1] ??
    location.pathname.match(
      /^\/plan\/([^/]+)/
    )?.[1]

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation}>
        <div className="min-h-screen">

          {/* Accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:bg-white focus:p-3"
          >
            Skip to content
          </a>

          <Navbar
            t={localized(app.lang)}
            lang={app.lang}
            setLang={app.setLang}
          />

          <AnimatePresence mode="wait">
            <m.main
              id="main-content"
              key={location.pathname}
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -6,
              }}
              transition={{
                duration: 0.25,
              }}
            >
              <ErrorBoundary>
                <Suspense fallback={<Skeleton />}>
                  <Routes location={location}>

                    {/* =========================
                        HOME
                       ========================= */}
                    <Route
                      path="/"
                      element={
                        <Home
                          onAnalyze={analyze}
                          aiLoading={aiLoading}
                          aiResponse={aiResponse}
                          aiError={aiError}
                        messages={messages}
                        onNewChat={newChat}
                      />
                      }
                    />

                    {/* =========================
                        ANALYZING
                       ========================= */}
                    <Route
                      path="/analyzing"
                      element={
                        <AnalysisLoader
                          query={query}
                        />
                      }
                    />

                    {/* =========================
                        SERVICE RESULT
                       ========================= */}
                    <Route
                      path="/result/:serviceId"
                      element={
                        <ResultRoute
                          onOfficial={() =>
                            setOfficial(true)
                          }
                        />
                      }
                    />

                    {/* =========================
                        ACTION PLAN
                       ========================= */}
                    <Route
                      path="/plan/:serviceId"
                      element={<PlanRoute />}
                    />

                    {/* =========================
                        DASHBOARD
                       ========================= */}
                    <Route
                      path="/dashboard"
                      element={<DashboardRoute />}
                    />

                    {/* =========================
                        HELP
                       ========================= */}
                    <Route
                      path="/help"
                      element={<Help />}
                    />

                    {/* =========================
                        NOT FOUND
                       ========================= */}
                    <Route
                      path="/not-found"
                      element={<NotFound />}
                    />

                    <Route
                      path="*"
                      element={<NotFound />}
                    />

                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </m.main>
          </AnimatePresence>

          <Footer />

          {/* =========================
              OFFICIAL SERVICE MODAL
             ========================= */}
          <Modal
            open={official}
            onClose={() => setOfficial(false)}
          >
            <h3 className="mb-2 text-lg font-bold">
              Official service link
            </h3>

            <p className="mb-4">
              You are leaving the LifeOS prototype.
              This opens an official government website
              in a new tab.
            </p>

            <a
              className={btnClass()}
              href={
                activeId &&
                services[activeId as ServiceId]
                  ? services[
                      activeId as ServiceId
                    ].officialUrl
                  : '#'
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              Open official website
              <ExternalLink size={16} />
            </a>
          </Modal>

        </div>
      </LazyMotion>
    </MotionConfig>
  )
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <RoutedApp />
      </HashRouter>
    </AppProvider>
  )
}




