import type { Project } from '../data'

export function slugifyBranch(task: string): string {
  const slug = task
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 40)
    .replace(/-$/, '')
  return `feat/${slug}`
}

export function inferProject(task: string, projects: Project[]): string {
  const t = task.toLowerCase()
  if (/search|filter|album|collection|barcode|discogs/.test(t)) return 'spincd'
  if (/typography|writing|hero|landing|site/.test(t)) return 'sean-michael.dev'
  if (/digest|newsroom|editor|briefing/.test(t)) return 'ai-digest'
  if (/argo|workflow|kube|context|mcp/.test(t)) return 'argo-mcp'
  return projects[0]?.id ?? 'spincd'
}

export function guessSpecSections(task: string): string[] {
  const t = task.toLowerCase()
  const out: string[] = []
  if (/search|filter/.test(t)) out.push('Phase 2 — Search & Filter')
  if (/import|barcode|discogs/.test(t)) out.push('Phase 3 — Import')
  if (/collection|list/.test(t)) out.push('Phase 1 — Collection View')
  if (out.length === 0) out.push('Overview', 'Open Questions')
  return out
}

export function buildPrompt({
  task,
  project,
  branch,
  specSections,
}: {
  task: string
  project: Project
  branch: string
  specSections: string[]
}): string {
  return `# Session Brief — ${project.name}

## Task
${task}

## Context
- Project: ${project.name}
- Repo: ${project.repoPath}
- Worktree: ${project.repoPath}-${branch.replace('/', '-')}
- Branch: ${branch}
- Stack: ${project.description}

## Relevant spec sections (SPEC.md)
${specSections.map((s) => `- ${s}`).join('\n')}

## Recent activity
- Last commit (${project.lastCommit.sha}): ${project.lastCommit.message}
- Open PRs: ${project.openPRs}
${
    project.sessions[0]
      ? `- Last session (${project.sessions[0].date}): ${project.sessions[0].outcome} — ${project.sessions[0].task}`
      : ''
  }

## Skills loaded
${project.skills.map((s) => `- ${s}`).join('\n')}

## Session Reflection (Required)

At the end of this session, append a reflection block to \`navigator.yaml\`
under \`sessions:\` with: branch, task, outcome (complete | in-progress |
blocked), and a structured reflection covering what was completed, what was
deferred and why, decisions made outside the spec, ambiguities encountered,
and anything the next session should know.

The reflection is the interpretation layer on top of the git diff.`
}

export function buildResumePrompt(project: Project): string {
  const last = project.sessions[0]
  return `# Resume Session — ${project.name}

## Picking up on branch
${project.branch}

## What was last done
${
    last
      ? `(${last.date}) ${last.task}
Outcome: ${last.outcome}

Reflection:
${last.reflection}`
      : 'No prior sessions on this branch.'
  }

## Current repo state
- Last commit (${project.lastCommit.sha}): ${project.lastCommit.message}
- Open PRs: ${project.openPRs}

## Open TODOs in code
${
    project.id === 'spincd'
      ? '- SearchBar.tsx — resolve client-vs-server filter ambiguity\n- collection list — handle empty state'
      : '- (none detected)'
  }

## Relevant spec sections
${project.id === 'spincd' ? '- Phase 2 — Search & Filter\n- Open Questions' : '- Overview'}

## Skills loaded
${project.skills.map((s) => `- ${s}`).join('\n')}

## Instructions
Continue the work above. Append a reflection block to \`navigator.yaml\`
when you wrap up.`
}
