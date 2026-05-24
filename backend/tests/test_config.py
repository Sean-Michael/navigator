from pathlib import Path

import pytest

from app.config import Settings


def test_defaults() -> None:
    settings = Settings(_env_file=None)
    assert settings.static_dir is None
    assert settings.github_token is None
    assert settings.cors_origins == ["http://localhost:5173"]


def test_env_prefix_and_overrides(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("NAVIGATOR_STATIC_DIR", "/app/static")
    monkeypatch.setenv("NAVIGATOR_GITHUB_TOKEN", "ghp_example")
    monkeypatch.setenv("NAVIGATOR_CORS_ORIGINS", '["https://nav.local"]')

    settings = Settings(_env_file=None)
    assert settings.static_dir == Path("/app/static")
    assert settings.github_token == "ghp_example"
    assert settings.cors_origins == ["https://nav.local"]
