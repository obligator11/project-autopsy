import os
from collections import Counter

EXTENSION_MAP = {
    ".py": "Python",
    ".ts": "TypeScript",
    ".tsx": "TypeScript",
    ".js": "JavaScript",
    ".jsx": "JavaScript",
    ".sql": "SQL",
    ".rs": "Rust",
    ".go": "Go",
    ".java": "Java",
}

IGNORE_DIRS = {".git", "node_modules", "__pycache__", ".venv", "dist", "target"}


def scan_repository(path: str) -> dict:
    if not os.path.isdir(path):
        raise ValueError(f"Path does not exist or is not a directory: {path}")

    language_counts = Counter()
    total_files = 0

    for root, dirs, files in os.walk(path):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]

        for file in files:
            ext = os.path.splitext(file)[1]
            if ext in EXTENSION_MAP:
                language_counts[EXTENSION_MAP[ext]] += 1
                total_files += 1

    languages = {
        lang: round((count / total_files) * 100, 1)
        for lang, count in language_counts.items()
    } if total_files > 0 else {}

    return {
        "total_source_files": total_files,
        "languages": languages,
    }