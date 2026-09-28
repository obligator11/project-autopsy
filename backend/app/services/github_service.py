import requests
from .settings_service import get_github_token

MAX_PAGES = 5  # 500 repos is plenty, and it stops runaway loops


def list_user_repos() -> list[dict]:
    token = get_github_token()
    if not token:
        raise ValueError("No GitHub token configured")

    repos = []
    for page in range(1, MAX_PAGES + 1):
        response = requests.get(
            "https://api.github.com/user/repos",
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/vnd.github+json",
            },
            params={"per_page": 100, "page": page, "sort": "updated", "affiliation": "owner"},
            timeout=15,
        )
        response.raise_for_status()
        batch = response.json()

        for r in batch:
            repos.append({
                "name": r["name"],
                "full_name": r["full_name"],
                "private": r["private"],
                "language": r["language"],
                "description": r["description"],
                "updated_at": r["updated_at"],
                "clone_url": r["clone_url"],
            })

        if len(batch) < 100:
            break

    return repos