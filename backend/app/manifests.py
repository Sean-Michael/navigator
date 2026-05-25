"""GitOps manifest generation.

Navigator's source of truth is git: a central ``~/.navigator/registry.yaml``
listing known repos, and a per-repo ``navigator.yaml`` committed alongside the
code (see SPEC.md). These helpers render those files from the project store so
a freshly-registered repo gets ready-to-commit manifests.
"""

from __future__ import annotations

from typing import Any

import yaml


def registry_yaml(projects: list[dict[str, Any]]) -> str:
    """The central registry of repos Navigator knows about."""
    doc = {"projects": [{"name": p["name"], "repo": p["repoPath"]} for p in projects]}
    return yaml.safe_dump(doc, sort_keys=False, default_flow_style=False)


def navigator_yaml(project: dict[str, Any]) -> str:
    """The per-repo manifest, committed to the project's root."""
    doc: dict[str, Any] = {
        "project": project["name"],
        "spec": project.get("spec", "SPEC.md"),
        "skills": list(project.get("skills", [])),
        "sessions": [
            {
                "date": s["date"],
                "branch": s["branch"],
                "task": s["task"],
                "outcome": s["outcome"],
                "reflection": s["reflection"],
            }
            for s in project.get("sessions", [])
        ],
    }
    return yaml.safe_dump(
        doc, sort_keys=False, default_flow_style=False, allow_unicode=True
    )
