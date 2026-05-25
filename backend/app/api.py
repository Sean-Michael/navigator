"""Navigator REST API.

Read endpoints surface the cross-project state the UI needs; the write
endpoints assemble the CLAUDE.md context for delegate/resume and report the
session command. Data currently comes from :mod:`app.seed`; the route bodies
are the seam where real git / GitHub / ``navigator.yaml`` reads will land.
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app import launcher, seed

router = APIRouter(prefix="/api")


def _project(project_id: str) -> dict[str, Any]:
    for p in seed.PROJECTS:
        if p["id"] == project_id:
            return p
    raise HTTPException(status_code=404, detail=f"unknown project: {project_id}")


@router.get("/bootstrap")
def bootstrap() -> dict[str, Any]:
    """Everything the frontend loads on startup, in one round trip."""
    return seed.bootstrap()


@router.get("/projects")
def list_projects() -> list[dict[str, Any]]:
    return seed.PROJECTS


@router.get("/projects/{project_id}")
def get_project(project_id: str) -> dict[str, Any]:
    return _project(project_id)


@router.get("/projects/{project_id}/portfolio")
def get_portfolio(project_id: str) -> dict[str, Any]:
    _project(project_id)  # 404 if unknown
    port = seed.PORTFOLIO.get(project_id)
    if port is None:
        raise HTTPException(status_code=404, detail=f"no portfolio for: {project_id}")
    return port


@router.get("/feed")
def get_feed() -> list[dict[str, Any]]:
    return seed.FEED


@router.get("/ready-tasks")
def get_ready_tasks() -> list[dict[str, Any]]:
    return seed.READY_TASKS


@router.get("/stats")
def get_stats() -> dict[str, int]:
    return seed.STATS


@router.get("/spec")
def get_spec() -> dict[str, str]:
    return {"content": seed.SPEC_MD}


class DelegateRequest(BaseModel):
    task: str
    project: str | None = None


class SessionResponse(BaseModel):
    project: str
    branch: str
    worktree: str
    spec_sections: list[str]
    prompt: str
    command: list[str]
    launched: bool


@router.post("/delegate", response_model=SessionResponse)
def delegate(req: DelegateRequest) -> SessionResponse:
    if not req.task.strip():
        raise HTTPException(status_code=422, detail="task must not be empty")
    project_id = req.project or launcher.infer_project(req.task, seed.PROJECTS)
    project = _project(project_id)
    branch = launcher.slugify_branch(req.task)
    spec_sections = launcher.guess_spec_sections(req.task)
    prompt = launcher.build_prompt(req.task, project, branch, spec_sections)
    return SessionResponse(
        project=project_id,
        branch=branch,
        worktree=f"{project['repoPath']}-{branch.replace('/', '-')}",
        spec_sections=spec_sections,
        prompt=prompt,
        command=launcher.launch_command(project, branch),
        launched=False,
    )


@router.post("/projects/{project_id}/resume", response_model=SessionResponse)
def resume(project_id: str) -> SessionResponse:
    project = _project(project_id)
    branch = project["branch"]
    prompt = launcher.build_resume_prompt(project)
    return SessionResponse(
        project=project_id,
        branch=branch,
        worktree=f"{project['repoPath']}-{branch.replace('/', '-')}",
        spec_sections=[],
        prompt=prompt,
        command=launcher.launch_command(project, branch),
        launched=False,
    )
