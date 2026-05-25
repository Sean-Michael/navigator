"""Navigator REST API.

Read endpoints surface the cross-project state the UI needs; the write
endpoints assemble the CLAUDE.md context for delegate/resume, register new
repos, and update status. Project state lives in :mod:`app.store` (seeded from
:mod:`app.seed`); manifests are rendered by :mod:`app.manifests`.
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app import launcher, manifests, seed, store

router = APIRouter(prefix="/api")


def _project(project_id: str) -> dict[str, Any]:
    project = store.get(project_id)
    if project is None:
        raise HTTPException(status_code=404, detail=f"unknown project: {project_id}")
    return project


@router.get("/bootstrap")
def bootstrap() -> dict[str, Any]:
    """Everything the frontend loads on startup, in one round trip."""
    return store.bootstrap()


@router.get("/projects")
def list_projects() -> list[dict[str, Any]]:
    return store.PROJECTS


@router.get("/projects/{project_id}")
def get_project(project_id: str) -> dict[str, Any]:
    return _project(project_id)


@router.get("/projects/{project_id}/portfolio")
def get_portfolio(project_id: str) -> dict[str, Any]:
    _project(project_id)  # 404 if unknown
    port = store.PORTFOLIO.get(project_id)
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


# ---------------------------------------------------------------------------
# Registration + status (GitOps manifests)
# ---------------------------------------------------------------------------


class RegisterRequest(BaseModel):
    repo: str
    skills: list[str] = []
    description: str | None = None


class Manifests(BaseModel):
    registry_entry: str
    navigator_yaml: str


class RegisterResponse(BaseModel):
    project: dict[str, Any]
    manifests: Manifests


@router.post("/projects/register", response_model=RegisterResponse, status_code=201)
def register_project(req: RegisterRequest) -> RegisterResponse:
    repo = req.repo.strip()
    if not repo:
        raise HTTPException(status_code=422, detail="repo must not be empty")
    _, name = store.parse_repo(repo)
    if not name:
        raise HTTPException(status_code=422, detail="could not parse a repo name")
    if store.project_exists(name):
        raise HTTPException(
            status_code=409, detail=f"project already registered: {name}"
        )
    project = store.register(repo, skills=req.skills, description=req.description)
    return RegisterResponse(
        project=project,
        manifests=Manifests(
            registry_entry=manifests.registry_yaml([project]),
            navigator_yaml=manifests.navigator_yaml(project),
        ),
    )


class StatusRequest(BaseModel):
    status: str


@router.patch("/projects/{project_id}")
def update_project(project_id: str, req: StatusRequest) -> dict[str, Any]:
    _project(project_id)  # 404 if unknown
    if req.status not in store.VALID_STATUSES:
        raise HTTPException(
            status_code=422,
            detail=f"invalid status '{req.status}'; expected one of {sorted(store.VALID_STATUSES)}",
        )
    project = store.set_status(project_id, req.status)
    assert project is not None
    return project


@router.get("/registry")
def get_registry() -> dict[str, str]:
    """The central registry.yaml listing every known repo."""
    return {"content": manifests.registry_yaml(store.PROJECTS)}


@router.get("/projects/{project_id}/manifest")
def get_manifest(project_id: str) -> dict[str, str]:
    """The per-repo navigator.yaml for a project."""
    project = _project(project_id)
    return {"content": manifests.navigator_yaml(project)}


# ---------------------------------------------------------------------------
# Delegate + resume
# ---------------------------------------------------------------------------


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
    project_id = req.project or launcher.infer_project(req.task, store.PROJECTS)
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
