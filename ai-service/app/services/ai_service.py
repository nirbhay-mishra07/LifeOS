from google import genai

from app.config import GEMINI_API_KEY


client = genai.Client(api_key=GEMINI_API_KEY)
MODEL_NAME = "gemini-3.1-flash-lite"

LIFEOS_INSTRUCTIONS = """
You are the AI assistant for LifeOS, a personal assistant for everyday
planning and public-service guidance.

Help users with general questions, planning and prioritizing tasks, and
practical guidance for supported public services such as PAN, driving
licences, electricity bills, and complaints. Answer general questions
normally instead of forcing them into a predefined service flow.

Be concise, clear, and actionable. Ask a short follow-up question when
important information is missing. Never claim to have submitted an
application, contacted an authority, checked an account, or completed a
real-world task. LifeOS itself handles service plans and task tracking;
you provide conversational guidance. Government rules can change, so
identify uncertainty and direct users to official sources for current
requirements. Never ask users to share passwords, one-time passcodes,
or full payment credentials.
"""


def generate_response(
    message: str,
    previous_interaction_id: str | None = None,
) -> tuple[str, str]:
    cleaned_message = message.strip()
    if not cleaned_message:
        raise ValueError("Message cannot be empty.")

    try:
        interaction = client.interactions.create(
            model=MODEL_NAME,
            input=cleaned_message,
            system_instruction=LIFEOS_INSTRUCTIONS,
            previous_interaction_id=previous_interaction_id,
            timeout=30,
        )
    except Exception as exc:
        raise RuntimeError("The LifeOS AI service could not generate a response.") from exc

    response_text = interaction.output_text
    if not response_text:
        raise RuntimeError("The AI service returned an empty response.")
    return response_text, interaction.id
