from .providers.gemini_provider import ask_gemini
from ..analyzers.ast.dependency_graph import build_dependency_graph
from ..services.git_analyzer import analyze_git_history
from ..scoring.hotspot import calculate_hotspots
from ..scoring.priority import build_priority_list


def gather_evidence(repo_path: str, file: str) -> dict | None:
    """
    Collects every measured fact we have about one file. Nothing here
    comes from an LLM, this is the "evidence first" layer.
    """
    git_data = analyze_git_history(repo_path)
    if not git_data.get("has_git_history"):
        return None

    hotspots = calculate_hotspots(repo_path, git_data["most_changed_files"])
    priorities = build_priority_list(hotspots)

    match = next((p for p in priorities if p["file"] == file), None)
    hotspot = next((h for h in hotspots if h["file"] == file), None)
    if not match or not hotspot:
        return None

    graph = build_dependency_graph(repo_path)
    imports = [e["target"] for e in graph["edges"] if e["source"] == file]
    imported_by = [e["source"] for e in graph["edges"] if e["target"] == file]

    return {
        "file": file,
        "severity": match["severity"],
        "hotspot_score": hotspot["hotspot_score"],
        "changes": hotspot["changes"],
        "size_bytes": hotspot["size_bytes"],
        "reasons": match["reasons"],
        "imports": imports,
        "imported_by": imported_by,
    }


def build_prompt(evidence: dict) -> str:
    return f"""You are a code-health analyst. Explain the risk assessment below
in plain English for a developer.

STRICT RULES:
- Use ONLY the measured evidence provided. Do not invent metrics,
  complexity numbers, bug counts, or test coverage.
- If something is not in the evidence, say it is not measured.
- Do not recommend rewriting the file. Suggest at most 2 cautious next steps.
- Keep it under 150 words.

EVIDENCE (measured by static analysis and git history):
- File: {evidence['file']}
- Severity: {evidence['severity']}
- Hotspot score: {evidence['hotspot_score']} / 100
- Times modified in git history: {evidence['changes']}
- File size: {evidence['size_bytes']} bytes
- Files it imports: {evidence['imports'] or 'none found'}
- Files that import it: {evidence['imported_by'] or 'none found'}
- Rule-based reasons: {evidence['reasons']}

Explain why this file received its severity rating."""


def investigate_file(repo_path: str, file: str) -> dict:
    evidence = gather_evidence(repo_path, file)
    if evidence is None:
        return {"error": "No evidence found for that file"}

    try:
        explanation = ask_gemini(build_prompt(evidence))
    except Exception as exc:
        return {"evidence": evidence, "error": f"AI request failed: {exc}"}

    return {"evidence": evidence, "explanation": explanation}