from google import genai
from ...services.settings_service import get_gemini_key


def ask_gemini(prompt: str) -> str:
    api_key = get_gemini_key()
    if not api_key:
        raise ValueError("No Gemini API key configured")

    client = genai.Client(api_key=api_key)

    response = client.models.generate_content(
        model="gemini-flash-latest",
        contents=prompt,
    )
    return response.text