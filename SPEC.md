# Navigator

> _"Only the Navigator can see the Astronomican through the Warp. Only they can chart the course."_

A personal GitOps control plane for solo AI-assisted development.

---

## What This Is

ArgoCD is to Kubernetes what Navigator is to your codebase — the desired state lives in git, the system reconciles toward it, Claude Code sessions are the operators. You are the architect, not the implementer.

Navigator runs on your homelab alongside your repos and Claude CLI. It's a local web app — same class of thing as Grafana or ArgoCD, accessed from a browser on your local network or through your existing ingress.

```
Your homelab
├── repos/             # already there
├── claude CLI         # already installed
└── navigator/
    ├── React frontend   # the dashboard
    └── FastAPI backend  # reads local fs + GitHub API, shells out to claude
```

FastAPI reads local git state and spec files directly from the filesystem, calls the GitHub API for PR and commit data, and launches Claude Code sessions via subprocess. No separate services, no credential complexity — everything is already on the same machine.

---

## The Problem

You sit down with 30 minutes, have 6 active projects, and spend 20 of them figuring out where you left off. Claude Code sessions have no persistent identity, no recorded outcome, no cross-project view. The cold start is killing momentum.

The session is already the unit of work. The problem is sessions have no persistent identity, no recorded outcome, and no cross-project aggregation.

---

## Design Principles

- **Git is the database.** No separate ticket system. Branch names, PR descriptions, and commit history are the source of truth. Navigator reads and surfaces git state — it doesn't duplicate it.
- **10-second orientation.** Sit down, open Navigator, know exactly what's happening across all projects and what to do next. Zero manual status updates.
- **Spec as first-class artifact.** Intent lives next to the code. PRDs, design decisions, screenshots, diagrams — versioned, machine-readable, injected into Claude Code sessions automatically.
- **Conversational delegation.** Describe a task in natural language. Navigator enriches it with project context and fires a pre-baked Claude Code session. No copy-pasting, no re-explaining.
- **GitOps everywhere.** Tasks become branches. Completion is a merged PR. Everything traceable, everything reversible.
- **MCP-native control surface.** Navigator is an MCP server. Talk to it from Claude.ai, from Claude Code inside any project, or from your phone. No UI required for delegation.
- **Unix philosophy.** Do one thing well — orient and delegate. If GitHub already does it better (PR review, full diff, merge controls, issue tracking), link out to GitHub. Don't rebuild what exists. Pipe outputs to better tools.

---

## Scope: What Navigator Owns vs. What It Defers

**Navigator owns:**

- Cross-project orientation (the view GitHub doesn't have)
- Session state and delegation (the Claude Code layer GitHub knows nothing about)
- Spec and design intent (PRDs, decisions, artifacts)
- Context assembly and prompt generation
- The resume flow

**GitHub owns (link out, don't rebuild):**

- Full PR review, inline comments, diff view → link to github.com/user/repo/pulls
- Merge controls → GitHub
- Commit history detail → GitHub
- Branch management → GitHub
- Issue tracking → GitHub (or just don't use it; tasks live in Navigator)

The review inbox in Navigator is a _signal layer_ — "you have 2 PRs to review" with a direct link to GitHub. Not a diff viewer.

---

## Core Features

### Phase 1 — Awareness

_Done when: 10-second orientation is real_

- **Project cards** — repo name, active branch, last commit message, open PR count (links to GitHub), status pill (active / review / idle / stale), last session summary
- **Cross-project feed** — unified timeline of recent commits, merged PRs, and session events across all registered repos. Entries link out to GitHub for detail.
- **Review signal** — badge count of open PRs needing your attention, direct link to GitHub PR page. No diff viewer in Navigator.
- **Session log** — record of Claude Code sessions per project: task description, outcome label, changed files summary

### Phase 2 — Delegation

_Done when: you can delegate a task without context-switching_

- **Task delegation** — natural language input → enriched task card → branch name generated → Claude Code session launched with full context injected
- **Resume flow** — one click generates a pre-baked resume prompt: last session state, current branch, open TODOs, relevant spec sections
- **Context injection** — sessions auto-receive: relevant spec sections, recent commits, open PR titles, last session notes. Spec is a markdown file in the repo — edit it in your editor, commit it, Navigator reads it.

### Phase 3 — Intelligence

_Done when: spec drift is detected automatically_

- **Gap analysis** — diff spec intent against codebase. "You spec'd search by label — that's not implemented. Here are the files."
- **Session auto-summary** — Claude Code writes structured summary back to `navigator.yaml` on session end
- **Stale branch signal** — surface branches with no recent commits and no open PR. Flag, don't manage.

### Phase 4 — Polish

_Done when: you'd recommend it to another solo developer_

- **Mobile view** — read-only status cards and quick task input via Navigator's web UI. Session control is Claude Code's own mobile remote feature.
- **Stale branch signal** — flag branches with no commits and no open PR for more than N days

---

## Key UX Flows

### Cold Start (Home)

Open Navigator → project grid sorted by last-touched → spot the review badge and activity feed → pick a project or open the delegation input. Under 10 seconds. Everything else is a link to GitHub.

### Resume

Click Resume on a project card → Navigator assembles: current branch state, last session notes, open TODOs in code, relevant spec sections → shows generated Claude Code prompt → you optionally edit → launch.

### Delegate

Type: _"add label filtering to the search page"_ → Navigator infers project, pulls relevant spec sections, generates branch name and prompt → shows enriched task card for confirmation → launch. No form fields.

### Review

See PR badge on project card → click → opens GitHub PR page directly. Navigator's job ends at surfacing the signal.

---

## Architecture

### Stack

- **Frontend** — React + TypeScript + Vite
- **Backend** — FastAPI (Python). Runs on homelab, has direct filesystem access to all repos and the `claude` CLI.
- **State** — Git is the primary DB. Per-project `navigator.yaml` committed to each repo. SQLite for lightweight cross-project aggregation cache (last-seen commit, session log).
- **Infra** — Homelab k3s, deployed via ArgoCD like everything else. Exposed through existing ingress.

### Data Sources

- **Local filesystem** — repo paths, `navigator.yaml`, `CLAUDE.md`, git log via `gitpython` or subprocess
- **GitHub API** — PR status, open reviews, commit feed (the pretty stuff that's already there)
- **`claude` CLI** — session launcher, nothing more

### Registry (`~/.navigator/registry.yaml`)

Central list of repos Navigator knows about. Maintained by Navigator, not versioned in any project repo.

```yaml
projects:
  - name: spincd
    repo: /home/sean/repos/spincd
  - name: sean-michael.dev
    repo: /home/sean/repos/sean-michael.dev
  - name: navigator
    repo: /home/sean/repos/navigator
```

### Per-Project State File (`navigator.yaml`)

Lives in each repo root, versioned with the code. The git history of this file is its own audit log.

```yaml
project: spincd
spec: SPEC.md
skills:
  - frontend-design
  - python-docs
sessions:
  - date: 2026-05-20
    branch: feat/react-frontend
    task: 'Set up Vite + React scaffold, wire collection list to FastAPI'
    outcome: in-progress
    reflection: |
      Completed: Vite scaffold, basic collection list component, FastAPI proxy config.
      Deferred: Search/filter — spec is ambiguous about whether filtering is client-side
      or server-side. Left a TODO in SearchBar.tsx. Recommend clarifying in SPEC.md.
      Decisions outside spec: Used TanStack Query for data fetching — not specified,
      chose it over raw fetch for cache management.
```

### Session Launcher

Navigator assembles context then shells out with worktree isolation and permissions bypass:

```python
# Create isolated worktree for the session
branch = f"feat/{slugify(task_description)}"
worktree_path = repo_path.parent / f"{repo_path.name}-{branch}"
subprocess.run(["git", "worktree", "add", worktree_path, "-b", branch], cwd=repo_path)

# Write scoped CLAUDE.md with context + skill + reflection instruction
(worktree_path / "CLAUDE.md").write_text(assembled_claude_md)

# Launch with permissions bypassed — local homelab, trusted environment
subprocess.Popen(
    ["claude", "--dangerously-skip-permissions"],
    cwd=worktree_path
)
```

**Why `--dangerously-skip-permissions`:** This is a local homelab harness on a trusted machine. Permission prompts break fire-and-forget delegation. This is the intended use case for that flag.

**Why worktrees:** Each session gets an isolated filesystem view of the repo — can't stomp on main or other running sessions. Easy to inspect mid-flight or nuke if it goes sideways. Navigator tracks active worktrees and cleans them up after merge.

**The assembled `CLAUDE.md`** contains:

- Project context (what this is, stack, conventions)
- Relevant spec sections for this task
- Recent git log summary
- Last session reflection (if exists)
- The task description
- Loaded skills (e.g. `frontend-design`, `python-docs`)
- Standing reflection instruction (see below)

Navigator hands off and gets out of the way. Session control from that point is Claude Code desktop or mobile remote.

### GitOps Lifecycle

1. You open Navigator, see project state at a glance
2. Click Resume or describe a new task
3. Navigator assembles context + injects skills → launches `claude` CLI
4. Claude Code does the work on a branch, opens a draft PR
5. PR badge appears on the project card → link out to GitHub for review and merge

---

## Design Brief

### Aesthetic

macOS Sequoia liquid glass meets Nordic editor calm. Think: if Zed and macOS Tahoe had a child.

- **Light mode primary** — cool off-white base (`#ECEFF4`), not stark white. Dark mode secondary using Nord dark (`#2E3440`).
- **Liquid glass** — layered translucency, frosted material depth, subtle specular highlights on interactive elements. Project cards are panes of glass over a softly blurred background. Not flat, not skeuomorphic — Apple's current material language.
- **Nordic palette** — cool desaturated blues (`#81A1C1`, `#88C0D0`), slate grays (`#4C566A`), muted teal accents. Calm and focused, not high-contrast cyberpunk.
- **Generous whitespace** — intentional, not empty. Breathing room between cards. The activity feed is airy, not dense.
- **Typography** — SF Pro or Inter. Clean, slightly condensed. Timestamps and metadata in a lighter weight.
- **Not** — Jira, Bootstrap, high-saturation badges, dark-enterprise gray.

### Interaction Principles

- Keyboard-first. Cmd+K opens delegation input from anywhere.
- Delegation input is auto-focused on load. It's the primary action.
- Status pills: soft, slightly translucent, color + icon readable at a glance without reading the label.
- Activity feed entries: one-line default, expand for detail. Most things link out to GitHub — don't duplicate, surface and hand off.
- Everything fast. Optimistic UI. No loading spinners for primary actions.

### Screens (Priority Order)

Only build what GitHub can't do.

1. **Home** — project grid (glass cards) + activity feed + delegation input. The entire app in one view if possible.
2. **Project View** — spec + session log + quick actions (Resume / New Task). Branch state and PR count link to GitHub.
3. **Task Delegation** — natural language input → enriched task card preview → launch. Modal or side panel, not a new page.
4. **Spec Editor** — markdown + frontmatter, section nav sidebar, artifact attachments. Feels like a document.

No diff viewer. No merge controls. No inline PR comments. Those are GitHub's job.

### Key Components

- **Project card** — the most important component. Glass material. Name, branch pill, last commit message, PR badge (→ GitHub), status pill, Resume button.
- **Delegation input** — floating glass bar, Spotlight-feel. Full width. Submit generates prompt, doesn't immediately launch.
- **Resume prompt preview** — generated prompt in a glass card, editable textarea, Launch button. Shows what Claude Code will receive.
- **Activity feed** — airy timeline, commit + PR + session events, all with external links. No detail rendered inline.
- **Spec editor** — left: markdown source. Right: rendered preview. Sidebar: section jump nav + attached artifacts.

### Mock Data (Real Projects)

- `spincd` — CD collection app, FastAPI + SQLite + React/TS frontend in progress. Branch: `feat/react-frontend`. 1 open PR.
- `sean-michael.dev` — Personal site, FastAPI + HTMX, EC2. Status: active, last commit 2h ago.
- `ai-digest` — Agentic newsroom on k3s, daily AI/ML briefings. Status: deployed, stable. No open PRs.
- `argo-mcp` — MCP server for Argo Workflows. Status: built, integrating. 1 stale branch.
- `navigator` — This app. Status: spec phase. No commits yet.

---

## Open Questions

- Exact `claude` CLI flags — confirm `--dangerously-skip-permissions` is the right flag and whether a prompt can be passed at launch or only via the assembled `CLAUDE.md`.
- Worktree cleanup strategy — Navigator should detect when a worktree's branch is merged and offer to prune it. Manual confirm or automatic?
- SQLite cache invalidation — how often does Navigator re-read `navigator.yaml` and git state from disk vs serve cached data? Probably: on page load + webhook trigger from GitHub.
- GitHub API auth: personal access token in `.env`. Sufficient for solo use.

## Reflection Instruction (Standing Skill)

This block is appended to every assembled `CLAUDE.md` before session launch. It's what closes the loop between Claude Code's work and Navigator's visibility.

```markdown
## Session Reflection (Required)

At the end of this session, append a reflection block to `navigator.yaml` under `sessions:`:

- **branch**: the branch you worked on
- **task**: one-line description of what was asked
- **outcome**: one of: `complete`, `in-progress`, `blocked`
- **reflection**: structured prose covering:
  - What was completed
  - What was deferred and why
  - Any decisions made that aren't captured in the spec (and should be)
  - Any ambiguities you encountered in the spec — flag these explicitly so the spec can be improved
  - Anything that surprised you or that the next session should know

The reflection is not a substitute for the git diff — it's the interpretation layer on top of it.
Git tells us what changed. The reflection tells us why, and what to watch out for.
```

---

_Navigator — chart the course through the Warp._
