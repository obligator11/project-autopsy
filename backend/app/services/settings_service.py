import keyring
import requests

SERVICE_NAME = "ProjectAutopsy"


def save_github_token(token: str):
    keyring.set_password(SERVICE_NAME, "github_token", token)


def get_github_token() -> str | None:
    return keyring.get_password(SERVICE_NAME, "github_token")


def save_gemini_key(key: str):
    keyring.set_password(SERVICE_NAME, "gemini_key", key)


def get_gemini_key() -> str | None:
    return keyring.get_password(SERVICE_NAME, "gemini_key")


def is_setup_complete() -> bool:
    return bool(get_github_token()) and bool(get_gemini_key())

def validate_github_token(token: str) -> bool:
    response = requests.get(
        "https://api.github.com/user",
        headers={"Authorization": f"Bearer {token}"},
    )
    return response.status_code == 200


def validate_gemini_key(key: str) -> bool:
    response = requests.get(
        f"https://generativelanguage.googleapis.com/v1beta/models?key={key}"
    )
    return response.status_code == 200