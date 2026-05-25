// Mock data — ported from the Navigator v4 design prototype.

export type Status = 'active' | 'review' | 'idle' | 'stale' | 'spec' | 'blocked'
export type Outcome = 'complete' | 'in-progress' | 'blocked'

export interface Commit {
  sha: string
  message: string
  time: string
  author?: string
  branch?: string
}

export interface Session {
  date: string
  branch: string
  task: string
  outcome: Outcome
  reflection: string
}

export interface Project {
  id: string
  name: string
  description: string
  branch: string
  status: Status
  lastCommit: Commit
  openPRs: number
  stalePRs: number
  lastTouched: string
  sessions: Session[]
  spec: string
  skills: string[]
  repoPath: string
}

export interface FeedEntry {
  day?: string
  type?: 'commit' | 'pr' | 'merge' | 'session' | 'spec'
  project?: string
  branch?: string
  sha?: string
  title?: string
  time?: string
  outcome?: Outcome
  extra?: string
}

export interface ReadyTask {
  id: string
  project: string
  task: string
  source: {
    kind: 'session' | 'todo' | 'spec'
    label: string
    detail: string
    quote: string
  }
  specSection?: string
  estimated: string
  kind: 'decision' | 'task'
}

export interface Language {
  name: string
  pct: number
  color: string
}

export interface CiRun {
  id: number
  status: 'passing' | 'failing'
  workflow: string
  branch: string
  time: string
  duration: string
  commit: string
  reason?: string
}

export interface Branch {
  name: string
  lastCommit: string
  time: string
  protected: boolean
  ahead: number
  behind: number
  stale?: boolean
}

export interface Artifact {
  id: string
  kind: 'image' | 'doc'
  name: string
  time: string
  thumb?: string
}

export interface Portfolio {
  visibility: string
  license: string
  primaryLang: string
  languages: Language[]
  homepage: string
  ci: {
    provider: string
    status: 'passing' | 'failing' | 'not configured'
    lastRun: { time: string; duration: string; commit: string; workflow: string } | null
    runs: CiRun[]
  }
  deploy: {
    env: string
    status: string
    url: string
    version: string
    lastDeploy: string
    uptime: string
  }
  coverage: { pct: number; trend: string } | null
  bundle: { size: string; trend: string } | null
  contributors: { name: string; commits: number; avatar: string }[]
  recentCommits: Commit[]
  branches: Branch[]
  artifacts: Artifact[]
  notes: string
}

export const NOW = new Date('2026-05-24T11:14:00')

export const PROJECTS: Project[] = [
  {
    id: 'spincd',
    name: 'spincd',
    description: 'CD collection app. FastAPI + SQLite, React/TS frontend in progress.',
    branch: 'feat/react-frontend',
    status: 'review',
    lastCommit: {
      sha: 'a4f9c2b',
      message: 'wire collection list to /api/v1/albums, add TanStack Query provider',
      time: '2h ago',
      author: 'you',
    },
    openPRs: 1,
    stalePRs: 0,
    lastTouched: '2h ago',
    sessions: [
      {
        date: '2026-05-23',
        branch: 'feat/react-frontend',
        task: 'Set up Vite + React scaffold, wire collection list to FastAPI',
        outcome: 'in-progress',
        reflection:
          'Completed: Vite scaffold, basic collection list component, FastAPI proxy config.\nDeferred: Search/filter — spec is ambiguous about whether filtering is client-side or server-side. Left a TODO in SearchBar.tsx. Recommend clarifying in SPEC.md.\nDecisions outside spec: Used TanStack Query for data fetching — not specified, chose it over raw fetch for cache management.',
      },
      {
        date: '2026-05-20',
        branch: 'feat/react-frontend',
        task: 'Bootstrap frontend tooling — TypeScript, ESLint, Prettier configs',
        outcome: 'complete',
        reflection:
          'Completed: All config files in place, lint passing.\nDeferred: Nothing.\nDecisions: Strict TS, no `any`. ESLint flat config (eslint.config.js).',
      },
      {
        date: '2026-05-18',
        branch: 'feat/album-import',
        task: 'Discogs API client + import script',
        outcome: 'complete',
        reflection:
          "Completed: Discogs client, rate-limit aware fetch, 542 albums imported.\nAmbiguity: Spec didn't say what to do about duplicate releases (same album, different pressings). Defaulted to keeping all; flagged in TODOs.",
      },
    ],
    spec: 'SPEC.md',
    skills: ['frontend-design', 'python-docs'],
    repoPath: '~/repos/spincd',
  },
  {
    id: 'sean-michael.dev',
    name: 'sean-michael.dev',
    description: 'Personal site. FastAPI + HTMX, deployed on EC2.',
    branch: 'main',
    status: 'active',
    lastCommit: {
      sha: '1c8e3d0',
      message: 'tighten typography on /writing, fix CLS on hero image',
      time: '2h ago',
      author: 'you',
    },
    openPRs: 0,
    stalePRs: 0,
    lastTouched: '2h ago',
    sessions: [
      {
        date: '2026-05-24',
        branch: 'main',
        task: 'Tighten typography on writing index, fix CLS on hero',
        outcome: 'complete',
        reflection:
          'Completed: width: 100% on hero, aspect-ratio set explicitly. Bumped body to 17px and reduced measure to 64ch.\nDecisions: Switched body font to Newsreader.',
      },
      {
        date: '2026-05-22',
        branch: 'feat/writing-index',
        task: 'Add writing index with tag filtering',
        outcome: 'complete',
        reflection:
          'Completed: /writing route with frontmatter-driven filtering. Cached at edge.',
      },
    ],
    spec: 'SPEC.md',
    skills: ['frontend-design'],
    repoPath: '~/repos/sean-michael.dev',
  },
  {
    id: 'ai-digest',
    name: 'ai-digest',
    description: 'Agentic newsroom on k3s — daily AI/ML briefings, fully autonomous pipeline.',
    branch: 'main',
    status: 'idle',
    lastCommit: {
      sha: '7b21e0a',
      message: 'bump anthropic SDK to 0.34, tune editor pass temperature',
      time: 'yesterday',
      author: 'you',
    },
    openPRs: 0,
    stalePRs: 0,
    lastTouched: 'yesterday',
    sessions: [
      {
        date: '2026-05-23',
        branch: 'main',
        task: 'Tune editor agent temperature, evaluate output on 7-day backtest',
        outcome: 'complete',
        reflection:
          'Completed: Lowered temp to 0.4 for the editor pass; quality up, repetition down. Backtest in artifacts/2026-05-23-eval.md.',
      },
    ],
    spec: 'SPEC.md',
    skills: ['python-docs'],
    repoPath: '~/repos/ai-digest',
  },
  {
    id: 'argo-mcp',
    name: 'argo-mcp',
    description: 'MCP server for Argo Workflows — submit, watch, abort from any MCP client.',
    branch: 'feat/auth-pass-through',
    status: 'stale',
    lastCommit: {
      sha: '0e4d83f',
      message: 'WIP: pass through kube context to argo client',
      time: '9 days ago',
      author: 'you',
    },
    openPRs: 0,
    stalePRs: 1,
    lastTouched: '9 days ago',
    sessions: [
      {
        date: '2026-05-15',
        branch: 'feat/auth-pass-through',
        task: 'Pass kubeconfig context through to argo CLI calls',
        outcome: 'blocked',
        reflection:
          "Blocked: argo CLI doesn't expose context flag the way I assumed. Need to either embed kubernetes client directly or shell out with KUBECONFIG env. Leaning toward env approach for simplicity.\nDecisions: Tabled until I decide direction.",
      },
    ],
    spec: 'SPEC.md',
    skills: ['python-docs'],
    repoPath: '~/repos/argo-mcp',
  },
  {
    id: 'navigator',
    name: 'navigator',
    description: 'This app. Personal GitOps control plane for solo AI-assisted development.',
    branch: 'main',
    status: 'spec',
    lastCommit: {
      sha: '—',
      message: 'no commits yet — spec phase',
      time: '—',
      author: '—',
    },
    openPRs: 0,
    stalePRs: 0,
    lastTouched: 'spec',
    sessions: [],
    spec: 'SPEC.md',
    skills: ['frontend-design'],
    repoPath: '~/repos/navigator',
  },
]

export const FEED: FeedEntry[] = [
  { day: 'Today' },
  {
    type: 'commit',
    project: 'spincd',
    branch: 'feat/react-frontend',
    sha: 'a4f9c2b',
    title: 'wire collection list to /api/v1/albums, add TanStack Query provider',
    time: '2h ago',
  },
  {
    type: 'session',
    project: 'sean-michael.dev',
    branch: 'main',
    title: 'Session complete — typography tighten + CLS fix',
    time: '2h ago',
    outcome: 'complete',
  },
  {
    type: 'pr',
    project: 'spincd',
    title: 'PR #14 opened: feat/react-frontend → main',
    branch: 'feat/react-frontend',
    time: '3h ago',
    extra: 'needs review',
  },
  {
    type: 'commit',
    project: 'sean-michael.dev',
    branch: 'main',
    sha: '1c8e3d0',
    title: 'tighten typography on /writing, fix CLS on hero image',
    time: '4h ago',
  },
  { day: 'Yesterday' },
  {
    type: 'merge',
    project: 'ai-digest',
    title: 'PR #41 merged: tune-editor-temperature',
    branch: 'main',
    time: '1d ago',
  },
  {
    type: 'commit',
    project: 'ai-digest',
    branch: 'main',
    sha: '7b21e0a',
    title: 'bump anthropic SDK to 0.34, tune editor pass temperature',
    time: '1d ago',
  },
  {
    type: 'session',
    project: 'ai-digest',
    branch: 'main',
    title: 'Session complete — editor temp tuning + 7d backtest',
    time: '1d ago',
    outcome: 'complete',
  },
  { day: 'Last week' },
  {
    type: 'spec',
    project: 'spincd',
    title: 'SPEC.md updated — added search/filter section',
    branch: 'main',
    time: '4d ago',
  },
  {
    type: 'session',
    project: 'argo-mcp',
    branch: 'feat/auth-pass-through',
    title: 'Session blocked — kube context pass-through ambiguity',
    time: '9d ago',
    outcome: 'blocked',
  },
]

export const SPEC_MD = `# spincd — Spec

> Personal CD collection management. Searchable, beautiful, fast.

## Overview

A FastAPI backend serving a typed REST API, plus a React + TypeScript frontend
that lives in the same repo. SQLite for persistence — fits in memory for the
collection size we'll ever realistically have.

## Stack

- **Backend**: FastAPI, SQLAlchemy 2.0, SQLite
- **Frontend**: Vite, React 18, TypeScript strict, TanStack Query
- **Sync**: Discogs API for metadata enrichment

## Phase 1 — Collection View

Done when: you can browse the whole collection at a glance.

- List view with album art, title, artist, year, label
- Sort by recently added, year, artist
- Search by label *(see Phase 2 ambiguity)*

## Phase 2 — Search & Filter

Done when: you can find any album in under 3s.

- Full-text search across artist + title + label
- Tag filtering — *server-side or client-side?* This is currently ambiguous.
  - Server-side scales but adds endpoints
  - Client-side fast for our size but blows memory if collection grows
- Decision needed before next implementation session.

## Phase 3 — Import

Done when: barcode scan adds an album in one tap.

- Discogs API client with rate limiting
- Barcode lookup endpoint
- Web Share Target API for "share image to spincd" from phone camera

## Open Questions

- Filtering server vs. client side (blocking)
- Sleeve scans — local storage or S3?
- Multi-user ever? (Probably no.)
`

export const READY_TASKS: ReadyTask[] = [
  {
    id: 'rt-1',
    project: 'spincd',
    task: 'Resolve client-vs-server filter ambiguity',
    source: {
      kind: 'session',
      label: 'session 2026-05-23',
      detail: 'Last session flagged this as ambiguous and left a TODO in SearchBar.tsx.',
      quote:
        'Spec is ambiguous about whether filtering is client-side or server-side. Recommend clarifying in SPEC.md.',
    },
    specSection: 'Phase 2 — Search & Filter',
    estimated: 'decision · 15m',
    kind: 'decision',
  },
  {
    id: 'rt-2',
    project: 'spincd',
    task: 'Implement collection empty state + zero-results search UI',
    source: {
      kind: 'todo',
      label: 'TODO · components/CollectionList.tsx:42',
      detail: 'Code-scan picked up a // TODO comment from the last session.',
      quote: '// TODO: empty state — when collection is 0, show import CTA',
    },
    specSection: 'Phase 1 — Collection View',
    estimated: '30m',
    kind: 'task',
  },
  {
    id: 'rt-3',
    project: 'ai-digest',
    task: 'Add weekend-only digest mode (skip Sat/Sun by default)',
    source: {
      kind: 'spec',
      label: 'SPEC.md · §Open Questions',
      detail: 'Open question flagged in the spec from previous review.',
      quote: 'Should we skip weekends? Reader feedback says yes; pipeline already runs daily.',
    },
    specSection: 'Open Questions',
    estimated: '45m',
    kind: 'task',
  },
  {
    id: 'rt-4',
    project: 'navigator',
    task: 'Bootstrap FastAPI backend — registry loader + git state endpoints',
    source: {
      kind: 'spec',
      label: 'SPEC.md · §Architecture · Stack',
      detail: 'Spec is at v1; ready to make the first commit.',
      quote:
        'FastAPI (Python). Runs on homelab, has direct filesystem access to all repos and the claude CLI.',
    },
    specSection: 'Stack',
    estimated: '2h',
    kind: 'task',
  },
  {
    id: 'rt-5',
    project: 'spincd',
    task: 'Decide sleeve scan storage — local FS vs S3 bucket',
    source: {
      kind: 'spec',
      label: 'SPEC.md · §Open Questions',
      detail: 'Open question. Picking this unblocks Phase 3 import flow.',
      quote: 'Sleeve scans — local storage or S3?',
    },
    specSection: 'Open Questions',
    estimated: 'decision · 10m',
    kind: 'decision',
  },
  {
    id: 'rt-6',
    project: 'sean-michael.dev',
    task: 'Write November reading post — draft outline only',
    source: {
      kind: 'todo',
      label: 'TODO · content/_drafts/november-reading.md',
      detail: 'Drafted file exists; nothing inside yet.',
      quote: '(empty file)',
    },
    estimated: '60m',
    kind: 'task',
  },
]

export const PORTFOLIO: Record<string, Portfolio> = {
  spincd: {
    visibility: 'private',
    license: '—',
    primaryLang: 'TypeScript',
    languages: [
      { name: 'TypeScript', pct: 48, color: '#5E81AC' },
      { name: 'Python', pct: 38, color: '#88C0D0' },
      { name: 'CSS', pct: 9, color: '#8FBCBB' },
      { name: 'Shell', pct: 5, color: '#B48EAD' },
    ],
    homepage: '—',
    ci: {
      provider: 'GitHub Actions',
      status: 'passing',
      lastRun: { time: '2h ago', duration: '1m 47s', commit: 'a4f9c2b', workflow: 'test + lint' },
      runs: [
        { id: 412, status: 'passing', workflow: 'test + lint', branch: 'feat/react-frontend', time: '2h ago', duration: '1m 47s', commit: 'a4f9c2b' },
        { id: 411, status: 'passing', workflow: 'test + lint', branch: 'feat/react-frontend', time: 'yesterday', duration: '1m 51s', commit: '1c8e3d0' },
        { id: 410, status: 'failing', workflow: 'e2e', branch: 'feat/react-frontend', time: 'yesterday', duration: '3m 12s', commit: '1c8e3d0' },
        { id: 409, status: 'passing', workflow: 'test + lint', branch: 'main', time: '3d ago', duration: '1m 42s', commit: '0f1b22a' },
        { id: 408, status: 'passing', workflow: 'deploy', branch: 'main', time: '3d ago', duration: '2m 30s', commit: '0f1b22a' },
      ],
    },
    deploy: { env: 'homelab k3s', status: 'healthy', url: 'spincd.lab.local', version: '0.4.2', lastDeploy: '3d ago', uptime: '12d' },
    coverage: { pct: 67, trend: '+3%' },
    bundle: { size: '248 KB', trend: '+12 KB' },
    contributors: [{ name: 'you', commits: 142, avatar: 'S' }],
    recentCommits: [
      { sha: 'a4f9c2b', message: 'wire collection list to /api/v1/albums, add TanStack Query provider', time: '2h ago', branch: 'feat/react-frontend' },
      { sha: '1c8e3d0', message: 'TypeScript strict mode + ESLint flat config', time: 'yesterday', branch: 'feat/react-frontend' },
      { sha: '0f1b22a', message: 'Discogs import: 542 albums, rate-limited fetch', time: '3d ago', branch: 'main' },
      { sha: '8e447d1', message: 'schema: albums + tracks + labels', time: '5d ago', branch: 'main' },
      { sha: 'b91c042', message: 'FastAPI scaffold + SQLAlchemy 2.0 base', time: '1w ago', branch: 'main' },
    ],
    branches: [
      { name: 'main', lastCommit: '8e447d1', time: '5d ago', protected: true, ahead: 0, behind: 0 },
      { name: 'feat/react-frontend', lastCommit: 'a4f9c2b', time: '2h ago', protected: false, ahead: 14, behind: 2 },
    ],
    artifacts: [
      { id: 'a1', kind: 'image', name: 'collection-mock.png', time: '3d ago', thumb: 'linear-gradient(135deg, #B48EAD, #7a4f72)' },
      { id: 'a2', kind: 'image', name: 'search-flow.png', time: '1w ago', thumb: 'linear-gradient(135deg, #88C0D0, #5E81AC)' },
      { id: 'a3', kind: 'doc', name: 'schema.sql', time: '1w ago' },
      { id: 'a4', kind: 'doc', name: 'ADR-001-tanstack-query.md', time: 'yesterday' },
      { id: 'a5', kind: 'doc', name: 'discogs-api.md', time: '2w ago' },
    ],
    notes: `## Pinned

- Filtering is **client-side for now**, decision pending in Phase 2 (see SPEC §Open Questions).
- TanStack Query is the only non-spec'd dependency — flagged in 2026-05-23 session reflection.

## Backlog

- Sleeve scan storage: local FS for solo use; revisit if I ever multi-user.
- Barcode scan flow — needs phone-first prototype.

## Questions I owe future-me

- Is the "many pressings of same album" dedupe heuristic actually right? Spot-check 20 albums.`,
  },
  'sean-michael.dev': {
    visibility: 'public',
    license: 'MIT',
    primaryLang: 'Python',
    languages: [
      { name: 'Python', pct: 52, color: '#88C0D0' },
      { name: 'HTML', pct: 28, color: '#A3BE8C' },
      { name: 'CSS', pct: 14, color: '#8FBCBB' },
      { name: 'JavaScript', pct: 6, color: '#EBCB8B' },
    ],
    homepage: 'sean-michael.dev',
    ci: {
      provider: 'GitHub Actions',
      status: 'passing',
      lastRun: { time: '2h ago', duration: '1m 12s', commit: '1c8e3d0', workflow: 'deploy' },
      runs: [
        { id: 198, status: 'passing', workflow: 'deploy', branch: 'main', time: '2h ago', duration: '1m 12s', commit: '1c8e3d0' },
        { id: 197, status: 'passing', workflow: 'deploy', branch: 'main', time: '2d ago', duration: '1m 08s', commit: '9aa12fe' },
        { id: 196, status: 'passing', workflow: 'lint', branch: 'main', time: '2d ago', duration: '22s', commit: '9aa12fe' },
        { id: 195, status: 'passing', workflow: 'deploy', branch: 'main', time: '5d ago', duration: '1m 14s', commit: '7e2c1a9' },
      ],
    },
    deploy: { env: 'EC2 (t3.micro)', status: 'healthy', url: 'sean-michael.dev', version: '—', lastDeploy: '2h ago', uptime: '47d' },
    coverage: { pct: 0, trend: '—' },
    bundle: null,
    contributors: [{ name: 'you', commits: 88, avatar: 'S' }],
    recentCommits: [
      { sha: '1c8e3d0', message: 'tighten typography on /writing, fix CLS on hero image', time: '2h ago', branch: 'main' },
      { sha: '9aa12fe', message: 'writing index with tag filtering, frontmatter cached', time: '2d ago', branch: 'main' },
      { sha: '7e2c1a9', message: 'bump Newsreader, switch /reading to grid', time: '5d ago', branch: 'main' },
    ],
    branches: [{ name: 'main', lastCommit: '1c8e3d0', time: '2h ago', protected: true, ahead: 0, behind: 0 }],
    artifacts: [
      { id: 'b1', kind: 'image', name: 'hero-redesign.png', time: '5d ago', thumb: 'linear-gradient(135deg, #8FBCBB, #4a7878)' },
      { id: 'b2', kind: 'doc', name: 'writing-frontmatter.md', time: '2d ago' },
    ],
    notes: `## Pinned\n\n- Body font is Newsreader 17px / 64ch measure — settled.\n- /writing is the canonical content surface; everything else is curated.\n\n## To draft\n\n- November reading roundup\n- Notes on running solo SaaS w/ Claude Code`,
  },
  'ai-digest': {
    visibility: 'private',
    license: '—',
    primaryLang: 'Python',
    languages: [
      { name: 'Python', pct: 81, color: '#88C0D0' },
      { name: 'YAML', pct: 12, color: '#EBCB8B' },
      { name: 'Shell', pct: 7, color: '#B48EAD' },
    ],
    homepage: '—',
    ci: {
      provider: 'GitHub Actions',
      status: 'passing',
      lastRun: { time: 'yesterday', duration: '4m 30s', commit: '7b21e0a', workflow: 'nightly digest' },
      runs: [
        { id: 88, status: 'passing', workflow: 'nightly digest', branch: 'main', time: 'yesterday', duration: '4m 30s', commit: '7b21e0a' },
        { id: 87, status: 'passing', workflow: 'nightly digest', branch: 'main', time: '2d ago', duration: '4m 12s', commit: '7b21e0a' },
        { id: 86, status: 'passing', workflow: 'nightly digest', branch: 'main', time: '3d ago', duration: '4m 45s', commit: 'f02bb91' },
      ],
    },
    deploy: { env: 'homelab k3s · cronjob', status: 'healthy', url: 'digest.lab.local', version: '0.7.1', lastDeploy: '5d ago', uptime: '21d' },
    coverage: { pct: 54, trend: '0%' },
    bundle: null,
    contributors: [{ name: 'you', commits: 64, avatar: 'S' }],
    recentCommits: [
      { sha: '7b21e0a', message: 'bump anthropic SDK to 0.34, tune editor pass temperature', time: 'yesterday', branch: 'main' },
      { sha: 'f02bb91', message: 'evals: 7-day backtest of editor temperature settings', time: '3d ago', branch: 'main' },
      { sha: 'c43e2af', message: 'deduplicate cross-source story clustering', time: '1w ago', branch: 'main' },
    ],
    branches: [{ name: 'main', lastCommit: '7b21e0a', time: 'yesterday', protected: true, ahead: 0, behind: 0 }],
    artifacts: [
      { id: 'c1', kind: 'doc', name: 'ADR-003-editor-temp.md', time: 'yesterday' },
      { id: 'c2', kind: 'doc', name: '2026-05-23-eval.md', time: 'yesterday' },
      { id: 'c3', kind: 'doc', name: 'agent-graph.md', time: '2w ago' },
    ],
    notes: `## Architecture\n\nResearch → curate → write → edit → publish.\nFour agents, sequential pipeline, ~4 min wall clock.\n\n## Knobs\n\n- editor temperature: **0.4** (lowered from 0.7 last session)\n- writer temperature: 0.7\n- max stories/day: 8`,
  },
  'argo-mcp': {
    visibility: 'public',
    license: 'MIT',
    primaryLang: 'Python',
    languages: [
      { name: 'Python', pct: 92, color: '#88C0D0' },
      { name: 'YAML', pct: 8, color: '#EBCB8B' },
    ],
    homepage: '—',
    ci: {
      provider: 'GitHub Actions',
      status: 'failing',
      lastRun: { time: '9d ago', duration: '—', commit: '0e4d83f', workflow: 'test' },
      runs: [
        { id: 22, status: 'failing', workflow: 'test', branch: 'feat/auth-pass-through', time: '9d ago', duration: '0m 38s', commit: '0e4d83f', reason: 'test_context_passthrough' },
        { id: 21, status: 'passing', workflow: 'test', branch: 'main', time: '3w ago', duration: '1m 04s', commit: '5d8121c' },
      ],
    },
    deploy: { env: 'not deployed', status: '—', url: '—', version: '—', lastDeploy: '—', uptime: '—' },
    coverage: { pct: 41, trend: '−6%' },
    bundle: null,
    contributors: [{ name: 'you', commits: 19, avatar: 'S' }],
    recentCommits: [
      { sha: '0e4d83f', message: 'WIP: pass through kube context to argo client', time: '9d ago', branch: 'feat/auth-pass-through' },
      { sha: '5d8121c', message: 'initial MCP server + submit/watch/abort', time: '3w ago', branch: 'main' },
    ],
    branches: [
      { name: 'main', lastCommit: '5d8121c', time: '3w ago', protected: true, ahead: 0, behind: 0 },
      { name: 'feat/auth-pass-through', lastCommit: '0e4d83f', time: '9d ago', protected: false, ahead: 3, behind: 0, stale: true },
    ],
    artifacts: [{ id: 'd1', kind: 'doc', name: 'mcp-protocol.md', time: '3w ago' }],
    notes: `## Open question\n\nKube context pass-through — embed kubernetes client directly, or shell out with KUBECONFIG env var?\n\nLeaning **KUBECONFIG env** for simplicity. Decide before next session.\n\n## Failing test\n\n\`test_context_passthrough\` — needs the decision above before fixing.`,
  },
  navigator: {
    visibility: 'private',
    license: '—',
    primaryLang: '—',
    languages: [],
    homepage: '—',
    ci: { provider: '—', status: 'not configured', lastRun: null, runs: [] },
    deploy: { env: 'not deployed', status: '—', url: '—', version: '—', lastDeploy: '—', uptime: '—' },
    coverage: null,
    bundle: null,
    contributors: [{ name: 'you', commits: 0, avatar: 'S' }],
    recentCommits: [],
    branches: [],
    artifacts: [
      { id: 'e1', kind: 'doc', name: 'SPEC.md', time: 'today' },
      { id: 'e2', kind: 'image', name: 'wireframe-inbox.png', time: 'today', thumb: 'linear-gradient(135deg, #B48EAD, #7a4f72)' },
      { id: 'e3', kind: 'image', name: 'design-portal.png', time: 'today', thumb: 'linear-gradient(135deg, #88C0D0, #5E81AC)' },
    ],
    notes: `## What this is\n\nA personal GitOps control plane for solo AI-assisted development. ArgoCD is to Kubernetes what Navigator is to your codebase.\n\n## Phase 1 scope\n\n- Inbox (this)\n- Project portal (this)\n- Overview dashboard (this)\n- Delegation flow w/ context injection\n- Resume flow\n\n## Reference points\n\n- Backstage / Cortex (developer portal layer)\n- Superhuman (inbox + keyboard)\n- Linear (speed + restraint)`,
  },
}

export interface Stats {
  commits7d: number
  commits7dPrev: number
  sessions7d: number
  sessions7dPrev: number
  prsMerged7d: number
  prsMerged7dPrev: number
  deploysHealthy: number
  deploysTotal: number
}

export const STATS: Stats = {
  commits7d: 18,
  commits7dPrev: 12,
  sessions7d: 4,
  sessions7dPrev: 6,
  prsMerged7d: 3,
  prsMerged7dPrev: 2,
  deploysHealthy: 3,
  deploysTotal: 4,
}

/** The full payload the app loads from the backend (or falls back to). */
export interface NavData {
  projects: Project[]
  feed: FeedEntry[]
  readyTasks: ReadyTask[]
  portfolio: Record<string, Portfolio>
  stats: Stats
  spec: string
}

/** Offline seed — identical to the backend's. Used until /api/bootstrap loads. */
export const SEED: NavData = {
  projects: PROJECTS,
  feed: FEED,
  readyTasks: READY_TASKS,
  portfolio: PORTFOLIO,
  stats: STATS,
  spec: SPEC_MD,
}
