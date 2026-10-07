const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '')

export interface ChatResponse {
  message: string
  interaction_id: string
}

interface BackendChatResponse {
  response: string
  interaction_id: string
}

export async function sendChatMessage(
  message: string,
  previousInteractionId?: string | null,
): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      previous_interaction_id: previousInteractionId ?? null,
    }),
  })

  if (!response.ok) {
    throw new Error(`AI service returned ${response.status}`)
  }

  const result: BackendChatResponse = await response.json()
  if (!result.response || !result.interaction_id) {
    throw new Error('AI service returned an invalid response')
  }

  return { message: result.response, interaction_id: result.interaction_id }
}
