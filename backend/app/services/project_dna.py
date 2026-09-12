from datetime import datetime, timezone
from .scanner import scan_repository
from .git_analyzer import analyze_git_history


def build_project_dna(path: str) -> dict:
    scan = scan_repository(path)
    git_data = analyze_git_history(path)

    repo_age_days = None
    first_commit_date = git_data.get("first_commit_date")
    if first_commit_date:
        first_dt = datetime.fromisoformat(first_commit_date)
        now = datetime.now(timezone.utc)
        repo_age_days = (now - first_dt).days

    return {
        "total_source_files": scan["total_source_files"],
        "languages": scan["languages"],
        "total_commits": git_data.get("total_commits", 0),
        "contributors": git_data.get("contributors", {}),
        "contributor_count": len(git_data.get("contributors", {})),
        "has_git_history": git_data.get("has_git_history", False),
        "first_commit_date": first_commit_date,
        "last_commit_date": git_data.get("last_commit_date"),
        "repo_age_days": repo_age_days,
        "generated_at": datetime.utcnow().isoformat(),
    }