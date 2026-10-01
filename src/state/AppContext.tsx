import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { services } from '../data'
import type { DocInfo, Lang, Notification, ServiceId, Task } from '../types'

interface State { my: ServiceId[]; tasks: Record<ServiceId, Task[]>; doc: DocInfo | null; notifications: Notification[]; lang: Lang; attached: string | null }
type Action =
  | { type: 'toggleTask'; serviceId: ServiceId; taskId: string }
  | { type: 'addService'; serviceId: ServiceId }
  | { type: 'setDoc'; doc: DocInfo | null }
  | { type: 'pushNotification'; text: string }
  | { type: 'markNotificationsRead' }
  | { type: 'setLang'; lang: Lang }
  | { type: 'setAttached'; name: string | null }
const initialState = (): State => ({
  my: ['elec'],
  tasks: { elec: services.elec.tasks.map((task) => ({ ...task })), dl: services.dl.tasks.map((task) => ({ ...task })), pan: services.pan.tasks.map((task) => ({ ...task })) },
  doc: null, notifications: [], lang: 'en', attached: null,
})
const isLang = (v: unknown): v is Lang => v === 'en' || v === 'hi' || v === 'hg'
function restore(): State {
  const fallback = initialState()
  try {
    const raw = localStorage.getItem('lifeos:v1')
    if (!raw) return fallback
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || !('version' in parsed) || parsed.version !== 1 || !('state' in parsed)) return fallback
    const saved = parsed.state as Partial<State>
    if (!Array.isArray(saved.my) || !saved.tasks || !isLang(saved.lang) || !Array.isArray(saved.notifications)) return fallback
    return { ...fallback, ...saved, my: saved.my.filter((id): id is ServiceId => id === 'elec' || id === 'dl' || id === 'pan') }
  } catch { return fallback }
}
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'toggleTask': {
      const tasks = { ...state.tasks, [action.serviceId]: state.tasks[action.serviceId].map((task) => task.id === action.taskId ? { ...task, done: !task.done } : task) }
      const wasDone = state.tasks[action.serviceId].find((task) => task.id === action.taskId)?.done
      const completed = tasks[action.serviceId].length > 0 && tasks[action.serviceId].every((task) => task.done)
      const wasCompleted = state.tasks[action.serviceId].length > 0 && state.tasks[action.serviceId].every((task) => task.done)
      let notifications = state.notifications
      if (!wasDone || (completed && !wasCompleted)) {
        const text = completed && !wasCompleted ? 'Your action plan reached 100%.' : 'Your action plan was updated.'
        notifications = [{ id: crypto.randomUUID(), text, createdAt: Date.now(), read: false }, ...notifications]
      }
      return { ...state, tasks, notifications }
    }
    case 'addService':
      if (state.my.includes(action.serviceId)) return state
      return { ...state, my: [...state.my, action.serviceId], notifications: [{ id: crypto.randomUUID(), text: `${services[action.serviceId].title} was added to My Services.`, createdAt: Date.now(), read: false }, ...state.notifications] }
    case 'setDoc': return { ...state, doc: action.doc }
    case 'pushNotification': return { ...state, notifications: [{ id: crypto.randomUUID(), text: action.text, createdAt: Date.now(), read: false }, ...state.notifications] }
    case 'markNotificationsRead': return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) }
    case 'setLang': return { ...state, lang: action.lang }
    case 'setAttached': return { ...state, attached: action.name }
  }
}
interface ContextValue extends State {
  toggleTask: (serviceId: ServiceId, taskId: string) => void
  addService: (serviceId: ServiceId) => void
  setDoc: (doc: DocInfo | null) => void
  pushNotification: (text: string) => void
  markNotificationsRead: () => void
  setLang: (lang: Lang) => void
  setAttached: (name: string | null) => void
  resetDemo: () => void
}
const AppContext = createContext<ContextValue | null>(null)
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, restore)
  useEffect(() => { try { localStorage.setItem('lifeos:v1', JSON.stringify({ version: 1, state })) } catch { /* storage can be unavailable */ } }, [state])
  const value = useMemo<ContextValue>(() => ({ ...state,
    toggleTask: (serviceId, taskId) => dispatch({ type: 'toggleTask', serviceId, taskId }),
    addService: (serviceId) => dispatch({ type: 'addService', serviceId }),
    setDoc: (doc) => dispatch({ type: 'setDoc', doc }),
    pushNotification: (text) => dispatch({ type: 'pushNotification', text }),
    markNotificationsRead: () => dispatch({ type: 'markNotificationsRead' }),
    setLang: (lang) => dispatch({ type: 'setLang', lang }),
    setAttached: (name) => dispatch({ type: 'setAttached', name }),
    resetDemo: () => { try { localStorage.removeItem('lifeos:v1') } catch { /* storage can be unavailable */ } window.location.reload() },
  }), [state])
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
/** Access shared application state and its typed actions. */
export function useApp(): ContextValue {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used inside AppProvider')
  return context
}
