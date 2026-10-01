import { Zap, Contact, FileText, Landmark } from 'lucide-react'
import type { IconKey } from '../types'
export const icons = { zap: Zap, card: Contact, file: FileText, bank: Landmark } satisfies Record<IconKey, unknown>
