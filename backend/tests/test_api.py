from fastapi.testclient import TestClient


def test_bootstrap_has_all_sections(client: TestClient) -> None:
    res = client.get("/api/bootstrap")
    assert res.status_code == 200
    body = res.json()
    for key in ("projects", "feed", "readyTasks", "portfolio", "stats", "spec"):
        assert key in body
    assert len(body["projects"]) == 5
    assert body["spec"].startswith("# spincd")


def test_list_projects(client: TestClient) -> None:
    res = client.get("/api/projects")
    assert res.status_code == 200
    ids = {p["id"] for p in res.json()}
    assert ids == {"spincd", "sean-michael.dev", "ai-digest", "argo-mcp", "navigator"}


def test_get_project_and_camelcase_shape(client: TestClient) -> None:
    res = client.get("/api/projects/spincd")
    assert res.status_code == 200
    p = res.json()
    assert p["openPRs"] == 1
    assert p["lastCommit"]["sha"] == "a4f9c2b"
    assert p["repoPath"] == "~/repos/spincd"


def test_get_project_unknown_404(client: TestClient) -> None:
    assert client.get("/api/projects/nope").status_code == 404


def test_portfolio(client: TestClient) -> None:
    res = client.get("/api/projects/spincd/portfolio")
    assert res.status_code == 200
    assert res.json()["ci"]["status"] == "passing"


def test_feed_and_ready_and_stats(client: TestClient) -> None:
    assert client.get("/api/feed").status_code == 200
    assert any(t["id"] == "rt-1" for t in client.get("/api/ready-tasks").json())
    assert client.get("/api/stats").json()["commits7d"] == 18


def test_delegate_infers_project_and_builds_prompt(client: TestClient) -> None:
    res = client.post(
        "/api/delegate", json={"task": "add label filtering to the search page"}
    )
    assert res.status_code == 200
    body = res.json()
    assert body["project"] == "spincd"  # inferred from "filter"/"search"
    assert body["branch"].startswith("feat/")
    assert "Session Brief" in body["prompt"]
    assert "Phase 2 — Search & Filter" in body["spec_sections"]
    assert body["launched"] is False


def test_delegate_respects_explicit_project(client: TestClient) -> None:
    res = client.post(
        "/api/delegate", json={"task": "do a thing", "project": "ai-digest"}
    )
    assert res.status_code == 200
    assert res.json()["project"] == "ai-digest"


def test_delegate_rejects_empty_task(client: TestClient) -> None:
    assert client.post("/api/delegate", json={"task": "   "}).status_code == 422


def test_resume_builds_prompt(client: TestClient) -> None:
    res = client.post("/api/projects/spincd/resume")
    assert res.status_code == 200
    body = res.json()
    assert body["branch"] == "feat/react-frontend"
    assert "Resume Session" in body["prompt"]


def test_resume_unknown_project_404(client: TestClient) -> None:
    assert client.post("/api/projects/nope/resume").status_code == 404
