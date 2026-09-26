def classify_severity(score: float, size_bytes: int = 0) -> str:
    # A file this small can't meaningfully be a "risk," regardless of
    # how its churn score computes — this is a floor, not a formula change.
    if size_bytes < 200:
        return "LOW"

    if score >= 65:
        return "HIGH"
    elif score >= 35:
        return "MEDIUM"
    else:
        return "LOW"


def build_reasons(hotspot: dict) -> list[str]:
    reasons = []
    changes = hotspot.get("changes", 0)
    size_bytes = hotspot.get("size_bytes", 0)

    if size_bytes < 200:
        reasons.append("Trivial file size — unlikely to carry real risk despite change frequency")
        return reasons

    if changes >= 5:
        reasons.append(f"Modified {changes} times — frequently changed")
    elif changes >= 2:
        reasons.append(f"Modified {changes} times")

    if size_bytes >= 5000:
        reasons.append(f"Large file ({size_bytes:,} bytes)")

    if not reasons:
        reasons.append("Flagged by change-frequency and size scoring")

    return reasons


def build_priority_list(hotspots: list[dict]) -> list[dict]:
    priorities = []

    for hotspot in hotspots:
        score = hotspot.get("hotspot_score", 0)
        size_bytes = hotspot.get("size_bytes", 0)
        priorities.append({
            "file": hotspot["file"],
            "severity": classify_severity(score, size_bytes),
            "hotspot_score": score,
            "reasons": build_reasons(hotspot),
        })

    return priorities