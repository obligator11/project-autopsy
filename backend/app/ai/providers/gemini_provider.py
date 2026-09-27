import google.generativeai as genai
from ...services.settings_service import get_gemini_key


def ask_gemini(prompt: str) -> str:
    api_key = get_gemini_key()
    if not api_key:
        raise ValueError("No Gemini API key configured")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-flash-latest")

    response = model.generate_content(prompt)
    return response.text