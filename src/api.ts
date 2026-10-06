const API_BASE_URL = 'http://127.0.0.1:8000'

export interface ChatRequest {
  message: string
  previous_interaction_id?: string | null
}

export interface ChatResponse {
  response: string
  interaction_id: string
}

export async function sendChatMessage(
  message: string,
  previousInteractionId?: string | null
): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      previous_interaction_id: previousInteractionId ?? null,
    }),
  })

  if (!response.ok) {
    throw new Error(`AI service returned ${response.status}`)
  }

  return response.json()
}
