from git import Repo, InvalidGitRepositoryError
from collections import Counter
from collections import defaultdict


def analyze_git_history(path: str) -> dict:
    try:
        repo = Repo(path)
    except InvalidGitRepositoryError:
        return {"error": "Not a git repository", "has_git_history": False}

    commits = list(repo.iter_commits())
    total_commits = len(commits)
    first_commit_date = commits[-1].committed_datetime.isoformat() if commits else None
    last_commit_date = commits[0].committed_datetime.isoformat() if commits else None

    author_counts = Counter()
    file_change_counts = Counter()

    for commit in commits:
        author_counts[commit.author.name] += 1
        for file_path in commit.stats.files.keys():
            file_change_counts[file_path] += 1

    most_changed_files = file_change_counts.most_common(5)

    return {
        "has_git_history": True,
        "total_commits": total_commits,
        "contributors": dict(author_counts),
        "most_changed_files": [
            {"file": f, "changes": c} for f, c in most_changed_files
        ],
        "first_commit_date": first_commit_date,
        "last_commit_date": last_commit_date,
    }



def build_commit_timeline(path: str) -> dict:
    try:
        repo = Repo(path)
    except InvalidGitRepositoryError:
        return {"has_git_history": False, "months": []}

    commits = list(repo.iter_commits())
    if not commits:
        return {"has_git_history": True, "months": []}

    monthly_counts: dict[str, int] = defaultdict(int)

    for commit in commits:
        month_key = commit.committed_datetime.strftime("%Y-%m")
        monthly_counts[month_key] += 1

    # Sort chronologically (oldest first) so the timeline reads left-to-right correctly
    sorted_months = sorted(monthly_counts.items())

    months = [
        {"month": month, "commit_count": count}
        for month, count in sorted_months
    ]

    return {"has_git_history": True, "months": months}