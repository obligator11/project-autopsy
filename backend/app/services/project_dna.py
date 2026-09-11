from datetime import datetime
from .scanner import scan_repository
from .git_analyzer import analyze_git_history


def build_project_dna(path: str) -> dict:
    scan = scan_repository(path)
    git_data = analyze_git_history(path)

    repo_age_days = None
    if git_data.get("has_git_history") and git_data.get("total_commits", 0) > 0:
        # We don't track the very first commit's date yet — approximate
        # using "has history" as a placeholder until git_analyzer exposes
        # first/last commit timestamps directly.
        repo_age_days = None

    return {
        "total_source_files": scan["total_source_files"],
        "languages": scan["languages"],
        "total_commits": git_data.get("total_commits", 0),
        "contributors": git_data.get("contributors", {}),
        "contributor_count": len(git_data.get("contributors", {})),
        "has_git_history": git_data.get("has_git_history", False),
        "generated_at": datetime.utcnow().isoformat(),
    }