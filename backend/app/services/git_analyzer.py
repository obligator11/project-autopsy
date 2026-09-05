from git import Repo, InvalidGitRepositoryError
from collections import Counter


def analyze_git_history(path: str) -> dict:
    try:
        repo = Repo(path)
    except InvalidGitRepositoryError:
        return {"error": "Not a git repository", "has_git_history": False}

    commits = list(repo.iter_commits())
    total_commits = len(commits)

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
    }