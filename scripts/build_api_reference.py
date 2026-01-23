from __future__ import annotations

import argparse
import ast
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable, Optional


def format_signature(node: ast.FunctionDef | ast.AsyncFunctionDef) -> str:
    args = []
    posonly = getattr(node.args, "posonlyargs", [])
    defaults = list(node.args.defaults)
    kw_defaults = list(node.args.kw_defaults)

    all_args = list(posonly) + list(node.args.args)
    default_offset = len(all_args) - len(defaults)

    for idx, arg in enumerate(all_args):
        name = arg.arg
        if idx >= default_offset:
            default_val = defaults[idx - default_offset]
            name = f"{name}={ast.unparse(default_val)}"
        args.append(name)

    if posonly:
        args.insert(len(posonly), "/")

    if node.args.vararg:
        args.append(f"*{node.args.vararg.arg}")

    for idx, kwarg in enumerate(node.args.kwonlyargs):
        name = kwarg.arg
        default_val = kw_defaults[idx]
        if default_val is not None:
            name = f"{name}={ast.unparse(default_val)}"
        args.append(name)

    if node.args.kwarg:
        args.append(f"**{node.args.kwarg.arg}")

    return f"{node.name}({', '.join(args)})"


def format_class_signature(node: ast.ClassDef) -> str:
    fields = []
    for stmt in node.body:
        if isinstance(stmt, ast.AnnAssign) and isinstance(stmt.target, ast.Name):
            name = stmt.target.id
            if stmt.value is not None:
                name = f"{name}={ast.unparse(stmt.value)}"
            fields.append(name)
    return f"{node.name}({', '.join(fields)})" if fields else f"{node.name}()"


def extract_items(module_path: Path, names: Iterable[str]) -> list[dict]:
    tree = ast.parse(module_path.read_text(encoding="utf-8"), filename=str(module_path))
    items = []
    for node in tree.body:
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) and node.name in names:
            item = {
                "name": node.name,
                "signature": format_signature(node),
                "source": f"{module_path.parent.name}/{module_path.name}",
            }
            docstring = ast.get_docstring(node)
            if docstring:
                item["docstring"] = docstring
            items.append(item)
        if isinstance(node, ast.ClassDef) and node.name in names:
            item = {
                "name": node.name,
                "signature": format_class_signature(node),
                "source": f"{module_path.parent.name}/{module_path.name}",
            }
            docstring = ast.get_docstring(node)
            if docstring:
                item["docstring"] = docstring
            items.append(item)
    return items


def build_reference(repo_root: Path, source_repo: Optional[str]) -> dict:
    core_path = repo_root / "tsdecomp" / "core.py"
    registry_path = repo_root / "tsdecomp" / "registry.py"

    if not core_path.exists() or not registry_path.exists():
        raise FileNotFoundError("Expected tsdecomp/core.py and tsdecomp/registry.py under repo root.")

    sections = [
        {
            "module": "tsdecomp.core",
            "description": "Core dataclasses for configuration and results.",
            "items": extract_items(core_path, ["DecompResult", "DecompositionConfig"]),
        },
        {
            "module": "tsdecomp.registry",
            "description": "Registry entry point and main decomposition call.",
            "items": extract_items(registry_path, ["decompose"]),
        },
    ]

    payload = {
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
        "sections": sections,
    }
    if source_repo:
        payload["source_repo"] = source_repo
    return payload


def main() -> None:
    parser = argparse.ArgumentParser(description="Build API reference JSON for TSComp site.")
    parser.add_argument("--repo-root", type=Path, default=Path(".."))
    parser.add_argument(
        "--out",
        type=Path,
        default=Path("public/data/v1.0.0/api_reference.json"),
    )
    parser.add_argument("--source-repo", type=str, default="")
    args = parser.parse_args()

    payload = build_reference(args.repo_root.resolve(), args.source_repo or None)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(payload, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
