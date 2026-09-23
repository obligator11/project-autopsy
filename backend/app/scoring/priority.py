def classify_severity(score: float) -> str:
    if score >= 65:
        return "HIGH"
    elif score >= 35:
        return "MEDIUM"
    else:
        return "LOW"


def build_reasons(hotspot: dict) -> list[str]:
    """
    Turns the raw numbers behind a hotspot score into plain-English reasons,
    matching the spec's "Reason: - high complexity - high churn" format —
    every reason traces back to an actual measured number, nothing is
    invented or guessed by an LLM at this stage.
    """
    reasons = []
    changes = hotspot.get("changes", 0)
    size_bytes = hotspot.get("size_bytes", 0)

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
        priorities.append({
            "file": hotspot["file"],
            "severity": classify_severity(score),
            "hotspot_score": score,
            "reasons": build_reasons(hotspot),
        })

    return priorities