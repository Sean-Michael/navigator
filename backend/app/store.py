"""In-memory project store.

Seeded from :mod:`app.seed` and mutated by the register / status endpoints so
changes persist for the life of the process. This is the seam where a real
``~/.navigator/registry.yaml`` + per-repo ``navigator.yaml`` loader will land;
the JSON the frontend sees stays identical.
"""

from __future__ import annotations

import copy
import re
from typing import Any

from app import seed

# Deep-copied so mutations never touch the immutable seed module.
PROJECTS: list[dict[str, Any]] = copy.deepcopy(seed.PROJECTS)
PORTFOLIO: dict[str, dict[str, Any]] = copy.deepcopy(seed.PORTFOLIO)

VALID_STATUSES = {"active", "review", "idle", "stale", "spec", "blocked"}


def get(project_id: str) -> dict[str, Any] | None:
    return next((p for p in PROJECTS if p["id"] == project_id), None)


def set_status(project_id: str, status: str) -> dict[str, Any] | None:
    project = get(project_id)
    if project is None:
        return None
    project["status"] = status
    return project


def parse_repo(repo: str) -> tuple[str, str]:
    """Return ``(owner_or_none, name)`` from a GitHub URL or ``owner/name``.

    Accepts ``https://github.com/owner/name(.git)``, ``git@github.com:owner/name``,
    or a bare ``owner/name`` / ``name``.
    """
    s = repo.strip().removesuffix(".git")
    m = re.search(r"github\.com[:/]+([^/]+)/([^/]+)", s)
    if m:
        return m.group(1), m.group(2)
    if "/" in s:
        owner, name = s.rsplit("/", 1)
        return owner or "", name
    return "", s


def project_exists(name: str) -> bool:
    return any(p["id"] == name or p["name"] == name for p in PROJECTS)


def register(
    repo: str, skills: list[str] | None = None, description: str | None = None
) -> dict[str, Any]:
    """Add a freshly-registered project in the ``spec`` phase.

    Mirrors what a real implementation would do after `git clone`: create the
    registry entry and a starter ``navigator.yaml`` (no sessions yet).
    """
    owner, name = parse_repo(repo)
    skills = skills or []
    repo_path = f"~/repos/{name}"
    project: dict[str, Any] = {
        "id": name,
        "name": name,
        "description": description
        or f"Registered from {owner + '/' if owner else ''}{name}.",
        "branch": "main",
        "status": "spec",
        "lastCommit": {
            "sha": "—",
            "message": "no commits yet — spec phase",
            "time": "—",
            "author": "—",
        },
        "openPRs": 0,
        "stalePRs": 0,
        "lastTouched": "spec",
        "sessions": [],
        "spec": "SPEC.md",
        "skills": skills,
        "repoPath": repo_path,
    }
    PROJECTS.append(project)
    PORTFOLIO[name] = {
        "visibility": "private",
        "license": "—",
        "primaryLang": "—",
        "languages": [],
        "homepage": f"https://github.com/{owner}/{name}" if owner else "—",
        "ci": {
            "provider": "—",
            "status": "not configured",
            "lastRun": None,
            "runs": [],
        },
        "deploy": {
            "env": "not deployed",
            "status": "—",
            "url": "—",
            "version": "—",
            "lastDeploy": "—",
            "uptime": "—",
        },
        "coverage": None,
        "bundle": None,
        "contributors": [],
        "recentCommits": [],
        "branches": [],
        "artifacts": [],
        "notes": "## Registered\n\nManifests generated. Commit `navigator.yaml` to the repo to start tracking sessions.",
    }
    return project


def reset() -> None:
    """Restore the store to the seed (used by tests)."""
    global PROJECTS, PORTFOLIO
    PROJECTS = copy.deepcopy(seed.PROJECTS)
    PORTFOLIO = copy.deepcopy(seed.PORTFOLIO)


def bootstrap() -> dict[str, Any]:
    return {
        "projects": PROJECTS,
        "feed": seed.FEED,
        "readyTasks": seed.READY_TASKS,
        "portfolio": PORTFOLIO,
        "stats": seed.STATS,
        "spec": seed.SPEC_MD,
    }
