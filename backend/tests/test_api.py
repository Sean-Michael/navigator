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


def test_update_status(client: TestClient) -> None:
    res = client.patch("/api/projects/spincd", json={"status": "idle"})
    assert res.status_code == 200
    assert res.json()["status"] == "idle"
    # persisted in the store
    assert client.get("/api/projects/spincd").json()["status"] == "idle"


def test_update_status_rejects_invalid(client: TestClient) -> None:
    assert (
        client.patch("/api/projects/spincd", json={"status": "bogus"}).status_code
        == 422
    )


def test_update_status_unknown_project_404(client: TestClient) -> None:
    assert (
        client.patch("/api/projects/nope", json={"status": "idle"}).status_code == 404
    )


def test_register_from_github_url(client: TestClient) -> None:
    res = client.post(
        "/api/projects/register",
        json={"repo": "https://github.com/sean/widget.git", "skills": ["python-docs"]},
    )
    assert res.status_code == 201
    body = res.json()
    assert body["project"]["id"] == "widget"
    assert body["project"]["status"] == "spec"
    assert "name: widget" in body["manifests"]["registry_entry"]
    assert "project: widget" in body["manifests"]["navigator_yaml"]
    assert "python-docs" in body["manifests"]["navigator_yaml"]
    # now visible in the list + bootstrap
    ids = {p["id"] for p in client.get("/api/projects").json()}
    assert "widget" in ids
    assert client.get("/api/projects/widget/portfolio").status_code == 200


def test_register_accepts_owner_name(client: TestClient) -> None:
    res = client.post("/api/projects/register", json={"repo": "acme/thing"})
    assert res.status_code == 201
    assert res.json()["project"]["id"] == "thing"


def test_register_rejects_duplicate(client: TestClient) -> None:
    assert (
        client.post("/api/projects/register", json={"repo": "spincd"}).status_code
        == 409
    )


def test_register_rejects_empty(client: TestClient) -> None:
    assert client.post("/api/projects/register", json={"repo": "  "}).status_code == 422


def test_registry_lists_all_repos(client: TestClient) -> None:
    content = client.get("/api/registry").json()["content"]
    assert "projects:" in content
    assert "name: spincd" in content


def test_project_manifest(client: TestClient) -> None:
    content = client.get("/api/projects/spincd/manifest").json()["content"]
    assert "project: spincd" in content
    assert "sessions:" in content
