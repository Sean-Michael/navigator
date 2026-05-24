# Navigator

A personal GitOps control plane for solo AI-assisted development. See [SPEC.md](SPEC.md) for the full design.

- **Frontend** — React + TypeScript + Vite (`frontend/`)
- **Backend** — FastAPI on a `uv` environment (`backend/`)

## Prerequisites

- [uv](https://docs.astral.sh/uv/)
- Node.js 22+
- Docker (optional, for the containerized workflows)

## Development

### With Docker Compose (recommended)

Runs both services with hot-reload:

```bash
docker compose up --build
```

- UI: http://localhost:5173
- API: http://localhost:8000

Source is mounted into the containers, so edits on the host reload automatically.

### Without Docker

Run the two services in separate terminals.

Backend:

```bash
cd backend
uv run uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api` to the backend on port 8000.

## Configuration

Backend settings are read from `backend/.env` (all prefixed `NAVIGATOR_`). Copy the example to start:

```bash
cp backend/.env.example backend/.env
```

| Variable                 | Description                                            |
| ------------------------ | ------------------------------------------------------ |
| `NAVIGATOR_STATIC_DIR`   | Path to the built frontend; serves the UI when set.    |
| `NAVIGATOR_GITHUB_TOKEN` | GitHub personal access token for PR/commit data.       |
| `NAVIGATOR_CORS_ORIGINS` | Allowed CORS origins (JSON list).                      |

## Production build

The root [Dockerfile](Dockerfile) builds the frontend and serves it as static files from FastAPI in a single container:

```bash
docker build -t navigator .
docker run -p 8000:8000 navigator
```

The app is then available at http://localhost:8000.
