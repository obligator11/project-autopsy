import os
from .import_parser import extract_python_imports

IGNORE_DIRS = {".git", "node_modules", "__pycache__", ".venv", "dist", "target"}


def _find_python_files(repo_path: str) -> list[str]:
    python_files = []
    for root, dirs, files in os.walk(repo_path):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        for file in files:
            if file.endswith(".py"):
                full_path = os.path.join(root, file)
                python_files.append(os.path.relpath(full_path, repo_path))
    return python_files


def _module_path_to_possible_files(module: str) -> list[str]:
    """
    Converts an import string like '.storage.database' or 'app.models.project'
    into candidate relative file paths, e.g. 'storage/database.py' or
    'app/models/project.py' — both with and without a leading dot, since
    relative imports (from .x import y) strip differently than absolute ones.
    """
    cleaned = module.lstrip(".")
    if not cleaned:
        return []
    parts = cleaned.split(".")
    rel_path = os.path.join(*parts) + ".py"
    rel_init = os.path.join(*parts, "__init__.py")
    return [rel_path, rel_init]


def build_dependency_graph(repo_path: str) -> dict:
    python_files = _find_python_files(repo_path)
    file_set = set(f.replace("\\", "/") for f in python_files)

    nodes = [{"id": f} for f in python_files]
    edges = []

    for file in python_files:
        full_path = os.path.join(repo_path, file)
        try:
            with open(full_path, "r", encoding="utf-8") as f:
                source = f.read()
        except (UnicodeDecodeError, OSError):
            continue

        try:
            imports = extract_python_imports(source)
        except Exception:
            continue

        file_dir = os.path.dirname(file)

        for module in imports:
            candidates = _module_path_to_possible_files(module)
            for candidate in candidates:
                # Try resolving relative to the importing file's own folder first
                # (handles `from .storage.database import init_db` correctly),
                # then fall back to resolving from the repo root.
                local_candidate = os.path.normpath(os.path.join(file_dir, candidate)).replace("\\", "/")
                root_candidate = candidate.replace("\\", "/")

                if local_candidate in file_set:
                    edges.append({"source": file.replace("\\", "/"), "target": local_candidate})
                    break
                elif root_candidate in file_set:
                    edges.append({"source": file.replace("\\", "/"), "target": root_candidate})
                    break

    return {"nodes": nodes, "edges": edges}