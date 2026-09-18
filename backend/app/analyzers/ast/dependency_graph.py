import os
from .import_parser import extract_python_imports

IGNORE_DIRS = {".git", "node_modules", "__pycache__", ".venv", "dist", "target"}


def _normalize(path: str) -> str:
    return path.replace("\\", "/")


def _find_python_files(repo_path: str) -> list[str]:
    python_files = []
    for root, dirs, files in os.walk(repo_path):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        for file in files:
            if file.endswith(".py"):
                full_path = os.path.join(root, file)
                python_files.append(_normalize(os.path.relpath(full_path, repo_path)))
    return python_files


def _module_path_to_possible_files(module: str) -> list[str]:
    cleaned = module.lstrip(".")
    if not cleaned:
        return []
    parts = cleaned.split(".")
    rel_path = os.path.join(*parts) + ".py"
    rel_init = os.path.join(*parts, "__init__.py")
    return [_normalize(rel_path), _normalize(rel_init)]


def build_dependency_graph(repo_path: str) -> dict:
    python_files = _find_python_files(repo_path)
    file_set = set(python_files)

    nodes = [{"id": f} for f in python_files]
    edge_set = set()  # dedupes identical (source, target) pairs

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
                local_candidate = _normalize(os.path.normpath(os.path.join(file_dir, candidate)))
                root_candidate = candidate

                if local_candidate in file_set:
                    edge_set.add((file, local_candidate))
                    break
                elif root_candidate in file_set:
                    edge_set.add((file, root_candidate))
                    break

    edges = [{"source": s, "target": t} for s, t in sorted(edge_set)]

    return {"nodes": nodes, "edges": edges}