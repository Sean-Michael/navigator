import type { NavData, Project, Status } from './data'

export interface SessionResponse {
  project: string
  branch: string
  worktree: string
  spec_sections: string[]
  prompt: string
  command: string[]
  launched: boolean
}

export interface RegisterResponse {
  project: Project
  manifests: { registry_entry: string; navigator_yaml: string }
}

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`
    try {
      const body = await res.json()
      if (body?.detail) detail = String(body.detail)
    } catch {
      /* keep status text */
    }
    throw new Error(detail)
  }
  return (await res.json()) as T
}

/** Load the full cross-project payload the UI renders. */
export async function fetchBootstrap(signal?: AbortSignal): Promise<NavData> {
  return json<NavData>(await fetch('/api/bootstrap', { signal }))
}

/** Assemble context for a new task and (in prod) launch a Claude Code session. */
export async function delegate(task: string, project?: string): Promise<SessionResponse> {
  return json<SessionResponse>(
    await fetch('/api/delegate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, project }),
    }),
  )
}

/** Assemble the resume context for a project's current branch. */
export async function resume(projectId: string): Promise<SessionResponse> {
  return json<SessionResponse>(
    await fetch(`/api/projects/${encodeURIComponent(projectId)}/resume`, { method: 'POST' }),
  )
}

/** Register a GitHub repo and generate its GitOps manifests. */
export async function registerProject(
  repo: string,
  skills: string[] = [],
  description?: string,
): Promise<RegisterResponse> {
  return json<RegisterResponse>(
    await fetch('/api/projects/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repo, skills, description }),
    }),
  )
}

/** Update a project's status pill. */
export async function updateStatus(projectId: string, status: Status): Promise<Project> {
  return json<Project>(
    await fetch(`/api/projects/${encodeURIComponent(projectId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }),
  )
}
