import type { ReactNode } from 'react'
import type { Project, ReadyTask, Status } from '../data'

export type AttentionKind = 'review' | 'blocked' | 'stale' | 'spec' | 'active' | 'idle'

export interface StateLine {
  em: string
  rest: string
  sub?: string
}

export interface PrimaryAction {
  label: string
  icon: string
  kind?: string
  action: string
  external?: boolean
}

export interface AttentionItem extends Project {
  type: 'project'
  key: string
  kind: AttentionKind
  priority: number
  stable?: boolean
  stateLine: StateLine
  primary: PrimaryAction
  secondary: { label: string; icon: string; action: string } | null
}

export interface ReadyItem extends Omit<ReadyTask, 'project'> {
  type: 'ready'
  key: string
  project: Project
  isDecision: boolean
  stateLine: StateLine
}

export type InboxItem = AttentionItem | ReadyItem

export function prNum(p: Project): number {
  const map: Record<string, number> = {
    spincd: 14,
    'sean-michael.dev': 38,
    'ai-digest': 41,
    'argo-mcp': 9,
    navigator: 1,
  }
  return map[p.id] || 1
}

function oneLine(s: string | undefined, max: number): string {
  if (!s) return ''
  const flat = s.split('\n')[0].replace(/^[A-Z][a-z]+:\s*/, '')
  return flat.length > max ? flat.slice(0, max - 1) + '…' : flat
}

function shortBranch(b: string): string {
  return b.replace(/^feat\//, '').replace(/^fix\//, '')
}

export function deriveAttention(projects: Project[]): AttentionItem[] {
  const items: AttentionItem[] = projects.map((p) => {
    const last = p.sessions[0]
    if (p.openPRs > 0) {
      return {
        type: 'project',
        key: `p:${p.id}`,
        ...p,
        kind: 'review',
        priority: 0,
        stateLine: { em: `PR #${prNum(p)}`, rest: ` awaiting review`, sub: p.branch },
        primary: { label: `Review PR #${prNum(p)}`, icon: 'ext', kind: 'review', action: 'review', external: true },
        secondary:
          last && last.outcome === 'in-progress'
            ? { label: 'Resume after merge', icon: 'play', action: 'resume' }
            : null,
      }
    }
    if (last && last.outcome === 'blocked') {
      return {
        type: 'project',
        key: `p:${p.id}`,
        ...p,
        kind: 'blocked',
        priority: 1,
        stateLine: { em: 'Blocked', rest: ` — ${oneLine(last.reflection, 70)}`, sub: p.branch },
        primary: { label: 'Unblock & resume', icon: 'play', action: 'resume', kind: 'blocked' },
        secondary: { label: 'Edit spec', icon: 'spec', action: 'spec' },
      }
    }
    if (p.status === 'stale' || p.stalePRs > 0) {
      return {
        type: 'project',
        key: `p:${p.id}`,
        ...p,
        kind: 'stale',
        priority: 2,
        stateLine: { em: `Stale ${p.lastTouched}`, rest: ` — decide direction or prune`, sub: p.branch },
        primary: { label: 'Decide direction', icon: 'compass', action: 'resume', kind: 'stale' },
        secondary: { label: 'Prune branch', icon: 'close', action: 'prune' },
      }
    }
    if (p.status === 'spec') {
      return {
        type: 'project',
        key: `p:${p.id}`,
        ...p,
        kind: 'spec',
        priority: 3,
        stateLine: { em: 'Spec phase', rest: ` — no commits yet`, sub: 'design intent only' },
        primary: { label: 'Continue spec', icon: 'spec', action: 'spec', kind: 'spec' },
        secondary: { label: 'Bootstrap repo', icon: 'rocket', action: 'delegate' },
      }
    }
    if (last && last.outcome === 'in-progress') {
      return {
        type: 'project',
        key: `p:${p.id}`,
        ...p,
        kind: 'active',
        priority: 4,
        stateLine: { em: 'In progress', rest: ` — ${oneLine(last.task, 55)}`, sub: p.branch },
        primary: { label: `Resume on ${shortBranch(p.branch)}`, icon: 'play', action: 'resume', kind: 'active' },
        secondary: { label: 'New task', icon: 'spark', action: 'delegate' },
      }
    }
    return {
      type: 'project',
      key: `p:${p.id}`,
      ...p,
      kind: 'idle',
      priority: 10,
      stable: true,
      stateLine: { em: 'Stable', rest: ` · ${p.lastTouched}`, sub: p.branch },
      primary: { label: 'Start next task', icon: 'play', action: 'delegate', kind: 'active' },
      secondary: { label: 'New task', icon: 'spark', action: 'delegate' },
    }
  })
  items.sort((a, b) => a.priority - b.priority)
  return items
}

export function buildReadyItems(readyTasks: ReadyTask[], projects: Project[]): ReadyItem[] {
  return readyTasks.map((t) => {
    const proj = projects.find((p) => p.id === t.project) as Project
    const isDecision = t.kind === 'decision'
    return {
      type: 'ready',
      key: `r:${t.id}`,
      ...t,
      project: proj,
      isDecision,
      stateLine: {
        em: t.project,
        rest: ` · ${t.source.label
          .replace(/^TODO · /, '')
          .replace(/^SPEC\.md · /, 'spec ')
          .replace(/^session /, 'session ')}`,
      },
    }
  })
}

export function markerIconFor(kind: string): string {
  const m: Record<string, string> = {
    review: 'pr',
    blocked: 'close',
    stale: 'branch',
    spec: 'spec',
    active: 'play',
    idle: 'check',
  }
  return m[kind] || 'check'
}

export function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}

export function prTitle(p: Project): string {
  const map: Record<string, string> = {
    spincd: 'wire collection list to API + TanStack Query provider',
    'sean-michael.dev': 'Tighten /writing typography, fix hero CLS',
  }
  return map[p.id] || 'Open PR'
}

interface Hero {
  eyebrow: string
  title: (p: AttentionItem) => ReactNode
  sub: (p: AttentionItem) => ReactNode
}

export const HERO: Record<AttentionKind, Hero> = {
  review: {
    eyebrow: 'Needs review',
    title: (p) => (
      <>
        <span className="proj">{p.name}</span> <span className="verb">has a PR waiting on you.</span>
      </>
    ),
    sub: (p) => (
      <>
        PR #{prNum(p)} from <span style={{ fontFamily: 'var(--font-mono)' }}>{p.branch}</span> → main. Review on
        GitHub — that's where the diff lives.
      </>
    ),
  },
  blocked: {
    eyebrow: 'Blocked',
    title: (p) => (
      <>
        <span className="proj">{p.name}</span> <span className="verb">stopped on an open question.</span>
      </>
    ),
    sub: () => (
      <>
        The last session bailed on a decision you haven't made. Unblocking usually means editing the spec, then
        resuming.
      </>
    ),
  },
  stale: {
    eyebrow: 'Stale',
    title: (p) => (
      <>
        <span className="proj">{p.name}</span> <span className="verb">hasn't moved in {p.lastTouched}.</span>
      </>
    ),
    sub: () => <>Decide what to do next — pick it back up, or close the branch and reclaim the worktree.</>,
  },
  spec: {
    eyebrow: 'Spec phase',
    title: (p) => (
      <>
        <span className="proj">{p.name}</span> <span className="verb">is still on paper.</span>
      </>
    ),
    sub: () => <>No commits yet. Iterate the spec, or hand off to a bootstrap session.</>,
  },
  active: {
    eyebrow: 'In progress',
    title: (p) => (
      <>
        <span className="proj">{p.name}</span> <span className="verb">— pick up where you left off.</span>
      </>
    ),
    sub: () => (
      <>
        Last session was in-progress. Resume the worktree with the reflection + open TODOs + relevant spec sections
        injected.
      </>
    ),
  },
  idle: {
    eyebrow: 'Stable',
    title: (p) => (
      <>
        <span className="proj">{p.name}</span> <span className="verb">— nothing demands attention.</span>
      </>
    ),
    sub: () => <>Pick a task from the queue, or describe a new one.</>,
  },
}

export function chipColorForStatus(s: Status): string {
  const map: Record<string, string> = {
    active: 'var(--aurora-green)',
    review: 'var(--frost-2)',
    idle: 'var(--polar-3)',
    stale: 'var(--aurora-yellow)',
    spec: 'var(--aurora-purple)',
  }
  return map[s] || 'var(--polar-3)'
}
