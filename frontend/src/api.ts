import type { NavData } from './data'

export interface SessionResponse {
  project: string
  branch: string
  worktree: string
  spec_sections: string[]
  prompt: string
  command: string[]
  launched: boolean
}

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
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
