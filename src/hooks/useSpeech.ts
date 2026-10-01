import { useEffect, useRef, useState } from 'react'
import type { Lang } from '../types'
interface RecognitionResultLike { 0: { transcript: string } }
interface RecognitionEventLike { results: ArrayLike<RecognitionResultLike> }
interface RecognitionLike {
  lang: string; continuous: boolean; interimResults: boolean
  onresult: ((event: RecognitionEventLike) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void; stop: () => void
}
interface SpeechWindow extends Window { SpeechRecognition?: new () => RecognitionLike; webkitSpeechRecognition?: new () => RecognitionLike }
/** Starts browser speech recognition in the selected Indian language. */
export function useSpeech(lang: Lang, onText: (text: string) => void) {
  const recognition = useRef<RecognitionLike | null>(null)
  const [listening, setListening] = useState(false)
  const [message, setMessage] = useState('')
  useEffect(() => () => recognition.current?.stop(), [])
  const start = () => {
    setMessage('')
    const Constructor = (window as SpeechWindow).SpeechRecognition ?? (window as SpeechWindow).webkitSpeechRecognition
    if (!Constructor) { onText('My electricity bill is unusually high.'); setMessage('Voice input is unavailable in this browser. Sample text was added.'); return }
    const api = new Constructor()
    recognition.current = api
    api.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'
    api.continuous = false
    api.interimResults = false
    api.onresult = (event) => { const text = event.results[0]?.[0]?.transcript; if (text) onText(text) }
    api.onerror = () => { setMessage('Microphone access was unavailable. Sample text was added.'); onText('My electricity bill is unusually high.'); setListening(false) }
    api.onend = () => setListening(false)
    setListening(true)
    try { api.start() } catch { setListening(false); setMessage('Voice input could not start. Please type your request.') }
  }
  return { start, listening, message }
}
