import os

IGNORE_PATTERNS = (".gitkeep", "__pycache__", ".pyc")


def calculate_hotspots(repo_path: str, most_changed_files: list[dict]) -> list[dict]:
    """
    Combines change frequency (churn) with file size to produce
    a simple hotspot score. Weights are placeholders until
    complexity/coupling/coverage analyzers exist (see spec section 9).
    """
    relevant_files = [
        f for f in most_changed_files
        if not any(pattern in f["file"] for pattern in IGNORE_PATTERNS)
    ]

    if not relevant_files:
        return []

    max_changes = max(f["changes"] for f in relevant_files)

    hotspots = []
    for entry in relevant_files:
        file_path = entry["file"]
        changes = entry["changes"]
        full_path = os.path.join(repo_path, file_path)

        try:
            size_bytes = os.path.getsize(full_path)
        except OSError:
            size_bytes = 0

        churn_score = changes / max_changes if max_changes else 0
        size_score = min(size_bytes / 10000, 1.0)

        hotspot_score = round((churn_score * 0.7 + size_score * 0.3) * 100, 1)

        hotspots.append({
            "file": file_path,
            "changes": changes,
            "size_bytes": size_bytes,
            "hotspot_score": hotspot_score,
        })

    hotspots.sort(key=lambda h: h["hotspot_score"], reverse=True)
    return hotspots