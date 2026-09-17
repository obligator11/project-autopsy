from tree_sitter_languages import get_parser

_parser_cache = {}


def get_python_parser():
    if "python" not in _parser_cache:
        _parser_cache["python"] = get_parser("python")
    return _parser_cache["python"]


def extract_python_imports(source_code: str) -> list[str]:
    """
    Walks a Python file's syntax tree and returns every module path
    referenced in an import statement — e.g. `import os` -> "os",
    `from fastapi import FastAPI` -> "fastapi",
    `from .storage.database import init_db` -> ".storage.database".

    Uses tree-sitter's named FIELDS (module_name, name) rather than
    guessing by node type — this is what correctly distinguishes
    "the module being imported from" from "the specific names being
    imported out of it", especially for relative imports.
    """
    parser = get_python_parser()
    tree = parser.parse(bytes(source_code, "utf8"))

    imports = []

    def walk(node):
        if node.type == "import_statement":
            # Plain `import x` / `import x.y` / `import x as y` —
            # each imported item is a direct dotted_name or aliased_import child.
            for child in node.children:
                if child.type == "dotted_name":
                    imports.append(child.text.decode("utf8"))
                elif child.type == "aliased_import":
                    name_node = child.child_by_field_name("name")
                    if name_node:
                        imports.append(name_node.text.decode("utf8"))

        elif node.type == "import_from_statement":
            # `from X import y` — X is explicitly the "module_name" field,
            # correctly handling both plain (dotted_name) and relative
            # (relative_import, e.g. ".storage.database") module paths.
            module_node = node.child_by_field_name("module_name")
            if module_node:
                imports.append(module_node.text.decode("utf8"))

        for child in node.children:
            walk(child)

    walk(tree.root_node)
    return imports