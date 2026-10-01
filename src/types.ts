export type ServiceId = 'elec' | 'dl' | 'pan'
export type IconKey = 'zap' | 'card' | 'file' | 'bank'
export type Lang = 'en' | 'hi' | 'hg'
export type View = 'home' | 'analyzing' | 'result' | 'notfound' | 'plan' | 'dashboard' | 'help'

export interface User { name: string; email: string }
export interface Task { id: string; title: string; description: string; documents: string; next: string; done: boolean }
export interface Service {
  id: ServiceId; title: string; icon: IconKey; time: string; description: string
  officialUrl: string; steps: string[]; required?: string[]; tasks: Task[]; dueDate?: string
}
export interface DocInfo { name: string; consumerNo: string; amount: string; period: string }
export interface Notification { id: string; text: string; createdAt: number; read: boolean }
export interface ActionPlan { serviceId: ServiceId; tasks: Task[] }
