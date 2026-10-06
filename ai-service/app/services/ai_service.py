from google import genai

from app.config import GEMINI_API_KEY


client = genai.Client(api_key=GEMINI_API_KEY)

MODEL_NAME = "gemini-3.1-flash-lite"


LIFEOS_INSTRUCTIONS = """
You are the AI assistant for LifeOS.

LifeOS is a personal operating system designed to help users manage
their tasks, goals, habits, projects, schedule, and productivity.

Your role is to help the user:
- Plan their day and priorities
- Break large goals into actionable tasks
- Organize projects
- Manage habits and routines
- Suggest productive next steps
- Summarize information
- Answer questions clearly
- Help the user make better decisions

Response guidelines:
- Be practical and actionable.
- Keep responses clear and easy to understand.
- Avoid unnecessary long explanations unless the user asks for detail.
- Use bullet points or numbered steps when useful.
- Do not claim that you performed an action unless the system actually performed it.
- If information is missing, ask the user for the necessary information.
"""


def generate_response(
    message: str,
    previous_interaction_id: str | None = None
) -> tuple[str, str]:

    interaction = client.interactions.create(
        model=MODEL_NAME,
        input=message,
        system_instruction=LIFEOS_INSTRUCTIONS,
        previous_interaction_id=previous_interaction_id,
        timeout=30,
    )

    return interaction.output_text, interaction.id
