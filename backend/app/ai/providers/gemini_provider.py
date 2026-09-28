import time
from google import genai
from ...services.settings_service import get_gemini_key

# Tried in order. Older stable models first (less demand), the always-current
# alias last, so we never depend on one model name staying alive.
MODEL_CHAIN = [
    "gemini-flash-lite-latest",
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash-lite",
    "gemini-flash-latest",
]
ATTEMPTS_PER_MODEL = 2


def _is_temporary_error(exc: Exception) -> bool:
    text = str(exc)
    return "503" in text or "UNAVAILABLE" in text or "429" in text


def _is_model_missing(exc: Exception) -> bool:
    text = str(exc)
    return "404" in text or "NOT_FOUND" in text


def ask_gemini(prompt: str) -> str:
    api_key = get_gemini_key()
    if not api_key:
        raise ValueError("No Gemini API key configured")

    client = genai.Client(api_key=api_key)
    last_error = None

    for model in MODEL_CHAIN:
        for attempt in range(ATTEMPTS_PER_MODEL):
            try:
                response = client.models.generate_content(model=model, contents=prompt)
                return response.text
            except Exception as exc:
                last_error = exc
                if _is_model_missing(exc):
                    break  # this model name is retired, move to the next one
                if not _is_temporary_error(exc):
                    raise  # bad key or bad request, retrying won't help
                time.sleep(1 + attempt)  # short pause, then retry or move on

    raise last_error