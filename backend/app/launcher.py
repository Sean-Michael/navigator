"""Context assembly + session launching.

Mirrors the frontend's prompt generation (``src/lib/prompts.ts``) so the
delegate/resume flows produce the same CLAUDE.md the UI previews. Actually
launching a ``claude`` session (worktree creation + subprocess) is gated
behind a setting and off by default — the API returns the assembled brief and
the exact command it *would* run, which is safe in dev and in tests.
"""

from __future__ import annotations

import re
from typing import Any


def slugify_branch(task: str) -> str:
    slug = task.lower()
    slug = re.sub(r"[^a-z0-9\s-]", "", slug)
    slug = re.sub(r"\s+", "-", slug)
    slug = re.sub(r"-+", "-", slug)
    slug = slug[:40].rstrip("-")
    return f"feat/{slug}"


def infer_project(task: str, projects: list[dict[str, Any]]) -> str:
    t = task.lower()
    if re.search(r"search|filter|album|collection|barcode|discogs", t):
        return "spincd"
    if re.search(r"typography|writing|hero|landing|site", t):
        return "sean-michael.dev"
    if re.search(r"digest|newsroom|editor|briefing", t):
        return "ai-digest"
    if re.search(r"argo|workflow|kube|context|mcp", t):
        return "argo-mcp"
    return projects[0]["id"] if projects else "spincd"


def guess_spec_sections(task: str) -> list[str]:
    t = task.lower()
    out: list[str] = []
    if re.search(r"search|filter", t):
        out.append("Phase 2 — Search & Filter")
    if re.search(r"import|barcode|discogs", t):
        out.append("Phase 3 — Import")
    if re.search(r"collection|list", t):
        out.append("Phase 1 — Collection View")
    if not out:
        out = ["Overview", "Open Questions"]
    return out


def build_prompt(task: str, project: dict[str, Any], branch: str, spec_sections: list[str]) -> str:
    last = project["sessions"][0] if project["sessions"] else None
    last_line = (
        f"- Last session ({last['date']}): {last['outcome']} — {last['task']}" if last else ""
    )
    sections = "\n".join(f"- {s}" for s in spec_sections)
    skills = "\n".join(f"- {s}" for s in project["skills"])
    worktree = f"{project['repoPath']}-{branch.replace('/', '-')}"
    return f"""# Session Brief — {project['name']}

## Task
{task}

## Context
- Project: {project['name']}
- Repo: {project['repoPath']}
- Worktree: {worktree}
- Branch: {branch}
- Stack: {project['description']}

## Relevant spec sections (SPEC.md)
{sections}

## Recent activity
- Last commit ({project['lastCommit']['sha']}): {project['lastCommit']['message']}
- Open PRs: {project['openPRs']}
{last_line}

## Skills loaded
{skills}

## Session Reflection (Required)

At the end of this session, append a reflection block to `navigator.yaml`
under `sessions:` with: branch, task, outcome (complete | in-progress |
blocked), and a structured reflection covering what was completed, what was
deferred and why, decisions made outside the spec, ambiguities encountered,
and anything the next session should know.

The reflection is the interpretation layer on top of the git diff."""


def build_resume_prompt(project: dict[str, Any]) -> str:
    last = project["sessions"][0] if project["sessions"] else None
    if last:
        what = (
            f"({last['date']}) {last['task']}\nOutcome: {last['outcome']}\n\n"
            f"Reflection:\n{last['reflection']}"
        )
    else:
        what = "No prior sessions on this branch."
    todos = (
        "- SearchBar.tsx — resolve client-vs-server filter ambiguity\n"
        "- collection list — handle empty state"
        if project["id"] == "spincd"
        else "- (none detected)"
    )
    spec = (
        "- Phase 2 — Search & Filter\n- Open Questions"
        if project["id"] == "spincd"
        else "- Overview"
    )
    skills = "\n".join(f"- {s}" for s in project["skills"])
    return f"""# Resume Session — {project['name']}

## Picking up on branch
{project['branch']}

## What was last done
{what}

## Current repo state
- Last commit ({project['lastCommit']['sha']}): {project['lastCommit']['message']}
- Open PRs: {project['openPRs']}

## Open TODOs in code
{todos}

## Relevant spec sections
{spec}

## Skills loaded
{skills}

## Instructions
Continue the work above. Append a reflection block to `navigator.yaml`
when you wrap up."""


def launch_command(project: dict[str, Any], branch: str) -> list[str]:
    """The command Navigator would run to start the session (see SPEC)."""
    return ["claude", "--dangerously-skip-permissions"]
