import { useCallback, useEffect, useMemo, useState } from 'react'
import { Icon } from './Icon'
import { DelegationModal, ResumeModal, SpecModal, SpotlightInner, Toast } from './Modals'
import type { Project } from '../data'
import { useNavData } from '../navData-context'
import * as api from '../api'
import {
  buildReadyItems,
  deriveAttention,
  HERO,
  markerIconFor,
  prNum,
  prTitle,
  truncate,
} from '../lib/inbox'
import type { AttentionItem, InboxItem, ReadyItem } from '../lib/inbox'

function MarkerIcon({ kind }: { kind: string }) {
  return <Icon name={markerIconFor(kind) as never} size={12} stroke={2} />
}

function RowProject({
  item,
  idx,
  isSelected,
  onSelect,
  quiet,
}: {
  item: AttentionItem
  idx: number
  isSelected: boolean
  onSelect: (key: string) => void
  quiet?: boolean
}) {
  const cls = quiet ? 'row row-quiet' : 'row'
  return (
    <div className={`${cls} ${isSelected ? 'is-selected' : ''}`} onClick={() => onSelect(item.key)}>
      <div className={`row-marker is-${item.kind}`}>{!quiet && <MarkerIcon kind={item.kind} />}</div>
      <div className="row-body">
        <div className="row-head">
          <span className="row-name">{item.name}</span>
        </div>
        <div className={`row-state is-${item.kind}`}>
          <span className="em">{item.stateLine.em}</span>
          {item.stateLine.rest}
        </div>
        {!quiet && (
          <div className="row-meta">
            <Icon name="branch" size={10} /> <span style={{ fontFamily: 'var(--font-mono)' }}>{item.stateLine.sub}</span>
          </div>
        )}
      </div>
      <div className="row-shortcut">{idx + 1}</div>
    </div>
  )
}

function RowTask({
  item,
  isSelected,
  onSelect,
}: {
  item: ReadyItem
  isSelected: boolean
  onSelect: (key: string) => void
}) {
  const dk = item.isDecision ? 'is-decision' : ''
  return (
    <div className={`row row-task ${dk} ${isSelected ? 'is-selected' : ''}`} onClick={() => onSelect(item.key)}>
      <div className={`row-marker ${item.isDecision ? 'is-decision' : ''}`}>
        <Icon name={item.isDecision ? 'compass' : 'spark'} size={12} stroke={1.8} />
      </div>
      <div className="row-body">
        <div className="row-head">
          <span className="row-name">{item.task}</span>
        </div>
        <div className="row-state">
          <span className="em">{item.stateLine.em}</span>
          {item.stateLine.rest}
        </div>
      </div>
      <span className="row-est">{item.estimated}</span>
    </div>
  )
}

function ProjectDetail({
  item,
  suggestedTask,
  onPrimary,
  onSecondary,
  onDelegateTask,
  onJumpProject,
}: {
  item: AttentionItem
  suggestedTask: ReadyItem | null
  onPrimary: (item: InboxItem) => void
  onSecondary: (item: AttentionItem) => void
  onDelegateTask: (t: ReadyItem) => void
  onJumpProject?: (id: string) => void
}) {
  const { readyTasks } = useNavData()
  const hero = HERO[item.kind]
  const last = item.sessions ? item.sessions[0] : null
  const useSuggest = item.kind === 'idle' && suggestedTask
  const primary = useSuggest
    ? { label: `Start: ${truncate(suggestedTask!.task, 50)}`, icon: 'play', kind: 'task', action: 'delegate-task' }
    : item.primary
  return (
    <div className="glass detail">
      <div className="detail-scroll">
        <div className="detail-state-hero">
          <div className={`state-icon is-${item.kind}`}>
            <MarkerIcon kind={item.kind} />
          </div>
          <div className="hero-text">
            <div className={`hero-eyebrow is-${item.kind}`}>{hero.eyebrow}</div>
            <h1 className="hero-title">{hero.title(item)}</h1>
            <p className="hero-sub">{hero.sub(item)}</p>
            <div className="cta-row">
              <button
                className={`cta-primary is-${primary.kind || item.kind}`}
                onClick={() => (useSuggest ? onDelegateTask(suggestedTask!) : onPrimary(item))}
              >
                <Icon name={primary.icon as never} size={13} />
                {primary.label}
                <span className="cta-shortcut">⏎</span>
              </button>
              {item.secondary && (
                <button className="cta-secondary" onClick={() => onSecondary(item)}>
                  <Icon name={item.secondary.icon as never} size={12} />
                  {item.secondary.label}
                </button>
              )}
              {onJumpProject && (
                <button className="cta-secondary" onClick={() => onJumpProject(item.id)} title="Open project portal">
                  <Icon name="folder" size={12} /> Open portal
                </button>
              )}
            </div>
            {useSuggest && (
              <div style={{ marginTop: 14, fontSize: 12, color: 'var(--ink-faint)' }}>
                or browse <span style={{ color: 'var(--ink-soft)', fontWeight: 500 }}>Ready to delegate</span> (
                {readyTasks.filter((t) => t.project === item.id).length} queued for {item.name})
              </div>
            )}
          </div>
        </div>
        {item.kind === 'review' && (
          <div className="ctx-section">
            <div className="ctx-head">Pull request</div>
            <a className="pr-card" href="#" onClick={(e) => e.preventDefault()}>
              <div className="pr-icon">
                <Icon name="pr" size={14} />
              </div>
              <div>
                <div className="pr-title">PR #{prNum(item)} · {prTitle(item)}</div>
                <div className="pr-sub">{item.branch} → main · opened 3h ago · 12 files, +384 −41</div>
              </div>
              <div className="pr-arrow">
                <Icon name="ext" size={14} />
              </div>
            </a>
          </div>
        )}
        {(item.kind === 'blocked' || item.kind === 'stale' || item.kind === 'active') && last && (
          <div className="ctx-section">
            <div className="ctx-head">What stopped it</div>
            <div className="reflection-card">
              <div className="reflection-head">
                <p className="reflection-task">{last.task}</p>
                <span className={`outcome-pill is-${last.outcome}`}>{last.outcome}</span>
              </div>
              <div className="reflection-body">{last.reflection}</div>
            </div>
          </div>
        )}
        {item.kind === 'spec' && (
          <div className="ctx-section">
            <div className="ctx-head">Spec preview · SPEC.md</div>
            <div className="ctx-card" style={{ fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
              <p style={{ margin: '0 0 8px', fontWeight: 500, color: 'var(--ink)' }}>
                Navigator — chart the course through the Warp.
              </p>
              <p style={{ margin: 0 }}>
                A personal GitOps control plane for solo AI-assisted development. ArgoCD is to Kubernetes what
                Navigator is to your codebase…
              </p>
              <div style={{ marginTop: 14, fontSize: 11.5, color: 'var(--ink-faint)', fontFamily: 'var(--font-mono)' }}>
                ~/repos/navigator/SPEC.md · 285 lines
              </div>
            </div>
          </div>
        )}
        <div className="repo-strip">
          <span className="repo-strip-item">
            <span className="lbl">repo</span>
            <span className="val">{item.repoPath}</span>
          </span>
          <span className="repo-strip-item">
            <span className="lbl">branch</span>
            <span className="val">{item.branch}</span>
          </span>
          {item.lastCommit && item.lastCommit.sha !== '—' && (
            <span className="repo-strip-item">
              <span className="lbl">commit</span>
              <span className="val">{item.lastCommit.sha}</span>
              <span className="lbl"> · {item.lastCommit.time}</span>
            </span>
          )}
          <a className="repo-strip-link" href="#" onClick={(e) => e.preventDefault()}>
            full project <Icon name="ext" size={10} />
          </a>
        </div>
      </div>
    </div>
  )
}

function TaskDetail({
  task,
  onDelegate,
  onEditSpec,
}: {
  task: ReadyItem
  onDelegate: (t: ReadyItem) => void
  onEditSpec: () => void
}) {
  const heroKind = task.isDecision ? 'decision' : 'task'
  const heroIcon = task.isDecision ? 'compass' : 'spark'
  return (
    <div className="glass detail">
      <div className="detail-scroll">
        <div className="detail-state-hero">
          <div className={`state-icon is-${heroKind}`}>
            <Icon name={heroIcon} size={16} stroke={2} />
          </div>
          <div className="hero-text">
            <div className={`hero-eyebrow is-${heroKind}`}>
              {task.isDecision ? 'Decision needed' : 'Ready to delegate'} · {task.project.name}
            </div>
            <h1 className="hero-title hero-title-task">{task.task}</h1>
            <p className="hero-sub">{task.source.detail}</p>
            <div className="cta-row">
              <button className={`cta-primary is-${heroKind}`} onClick={() => onDelegate(task)}>
                <Icon name="rocket" size={13} />
                {task.isDecision ? 'Decide & resume' : 'Delegate to Claude Code'}
                <span className="cta-shortcut">⏎</span>
              </button>
              <button className="cta-secondary" onClick={onEditSpec}>
                <Icon name="spec" size={12} /> Edit spec context
              </button>
              <button className="cta-secondary">
                <Icon name="close" size={12} /> Dismiss
              </button>
            </div>
          </div>
        </div>
        <div className="ctx-section">
          <div className="ctx-head">Where this came from</div>
          <div className="source-card">
            <div className={`source-icon is-${task.source.kind}`}>
              <Icon name={task.source.kind === 'spec' ? 'spec' : task.source.kind === 'session' ? 'session' : 'doc'} size={13} />
            </div>
            <div>
              <div className="source-label">{task.source.label}</div>
              <div className="source-detail">{task.source.detail}</div>
              {task.source.quote && task.source.quote !== '(empty file)' && (
                <div className="source-quote">{task.source.quote}</div>
              )}
            </div>
          </div>
        </div>
        <div className="ctx-section">
          <div className="ctx-head">Context Claude Code will receive</div>
          <div className="ctx-card">
            <p className="ctx-line">
              <span style={{ color: 'var(--ink-faint)' }}>worktree</span> &nbsp;
              <span className="mono">
                {task.project.repoPath}-
                {`feat/${task.task.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)}`.replace('/', '-')}
              </span>
            </p>
            {task.specSection && (
              <p className="ctx-line">
                <span style={{ color: 'var(--ink-faint)' }}>spec section</span> &nbsp;
                <span className="mono">§ {task.specSection}</span>
              </p>
            )}
            <p className="ctx-line">
              <span style={{ color: 'var(--ink-faint)' }}>skills</span> &nbsp;
              <span className="chip-cluster" style={{ display: 'inline-flex' }}>
                {task.project.skills.map((s) => (
                  <span key={s} className="chip" style={{ fontSize: 11, padding: '1px 7px' }}>{s}</span>
                ))}
              </span>
            </p>
          </div>
        </div>
        <div className="repo-strip">
          <span className="repo-strip-item">
            <span className="lbl">project</span>
            <span className="val">{task.project.name}</span>
          </span>
          <span className="repo-strip-item">
            <span className="lbl">est</span>
            <span className="val">{task.estimated}</span>
          </span>
        </div>
      </div>
    </div>
  )
}

export function InboxView({ onJumpProject, hideFooter }: { onJumpProject?: (id: string) => void; hideFooter?: boolean }) {
  const { projects: PROJECTS, readyTasks: READY_TASKS, spec } = useNavData()
  const projectItems = useMemo(() => deriveAttention(PROJECTS), [PROJECTS])
  const attentionItems = useMemo(() => projectItems.filter((i) => i.priority < 10), [projectItems])
  const stableItems = useMemo(() => projectItems.filter((i) => i.priority >= 10), [projectItems])
  const readyItems = useMemo(() => buildReadyItems(READY_TASKS, PROJECTS), [READY_TASKS, PROJECTS])
  const flat = useMemo<InboxItem[]>(
    () => [...attentionItems, ...readyItems, ...stableItems],
    [attentionItems, readyItems, stableItems],
  )
  const [selectedKey, setSelectedKey] = useState<string | undefined>(flat[0]?.key)
  const selected = flat.find((i) => i.key === selectedKey) || flat[0]
  const [spotlight, setSpotlight] = useState(false)
  const [delegation, setDelegation] = useState<{ task: string; defaultProject?: string } | null>(null)
  const [resume, setResume] = useState<string | null>(null)
  const [showSpec, setShowSpec] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (m: string) => {
    setToast(m)
    setTimeout(() => setToast(null), 2800)
  }
  const suggestedFor = useCallback((id: string) => readyItems.find((r) => r.project.id === id) ?? null, [readyItems])

  const doPrimary = useCallback(
    (item: InboxItem) => {
      if (!item) return
      if (item.type === 'ready') {
        setDelegation({ task: item.task, defaultProject: item.project.id })
        return
      }
      if (item.kind === 'idle') {
        const sug = suggestedFor(item.id)
        if (sug) {
          setDelegation({ task: sug.task, defaultProject: item.id })
          return
        }
        setDelegation({ task: '', defaultProject: item.id })
        return
      }
      const act = item.primary.action
      if (item.primary.external) {
        showToast(`→ Opening GitHub: ${item.name} PR #${prNum(item)}`)
        return
      }
      if (act === 'resume') setResume(item.id)
      else if (act === 'delegate') setDelegation({ task: '', defaultProject: item.id })
      else if (act === 'spec') setShowSpec(true)
    },
    [suggestedFor],
  )

  const doSecondary = useCallback((item: AttentionItem) => {
    const act = item.secondary?.action
    if (act === 'resume') setResume(item.id)
    else if (act === 'delegate') setDelegation({ task: '', defaultProject: item.id })
    else if (act === 'spec') setShowSpec(true)
    else if (act === 'prune') showToast(`Pruned worktree for ${item.branch}`)
  }, [])

  const doDelegateTask = useCallback((task: ReadyItem) => {
    setDelegation({ task: task.task, defaultProject: task.project.id })
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && /INPUT|TEXTAREA/.test(target.tagName)) {
        if (e.key === 'Escape') target.blur()
        return
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSpotlight(true)
        return
      }
      if (e.key === 'j' || e.key === 'ArrowDown') {
        const i = flat.findIndex((x) => x.key === selectedKey)
        if (i < flat.length - 1) setSelectedKey(flat[i + 1].key)
        e.preventDefault()
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        const i = flat.findIndex((x) => x.key === selectedKey)
        if (i > 0) setSelectedKey(flat[i - 1].key)
        e.preventDefault()
      } else if (e.key === 'Enter' && selected) {
        doPrimary(selected)
      } else if (e.key.toLowerCase() === 'r' && selected && selected.type === 'project') {
        setResume(selected.id)
      } else if (e.key.toLowerCase() === 's' && selected && selected.type === 'project') {
        setShowSpec(true)
      } else if (e.key.toLowerCase() === 'n') {
        setSpotlight(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [flat, selectedKey, selected, doPrimary])

  const isReceded = spotlight || delegation || resume || showSpec
  const specProject: Project | undefined =
    selected && selected.type === 'project' ? selected : undefined

  return (
    <>
      <div
        className={`v2-app ${isReceded ? 'is-receded' : ''}`}
        style={{ padding: 0, height: 'auto', minHeight: 0, overflow: 'visible' }}
      >
        <div className="v2-main" style={{ minHeight: '70vh' }}>
          <aside className="glass inbox">
            <div className="inbox-head">
              <h2>Inbox</h2>
              <div className="inbox-count">{flat.length} items</div>
            </div>
            <div className="inbox-list">
              {attentionItems.length > 0 && (
                <>
                  <div className="inbox-group">
                    Needs attention<span className="group-count">{attentionItems.length}</span>
                  </div>
                  {attentionItems.map((it, i) => (
                    <RowProject key={it.key} item={it} idx={i} isSelected={selectedKey === it.key} onSelect={setSelectedKey} />
                  ))}
                </>
              )}
              {readyItems.length > 0 && (
                <>
                  <div className="inbox-group">
                    Ready to delegate<span className="group-count">{readyItems.length}</span>
                  </div>
                  {readyItems.map((it) => (
                    <RowTask key={it.key} item={it} isSelected={selectedKey === it.key} onSelect={setSelectedKey} />
                  ))}
                </>
              )}
              {stableItems.length > 0 && (
                <>
                  <div className="inbox-group">
                    Stable<span className="group-count">{stableItems.length}</span>
                  </div>
                  {stableItems.map((it, i) => (
                    <RowProject
                      key={it.key}
                      item={it}
                      idx={attentionItems.length + readyItems.length + i}
                      isSelected={selectedKey === it.key}
                      onSelect={setSelectedKey}
                      quiet
                    />
                  ))}
                </>
              )}
            </div>
            {!hideFooter && (
              <div style={{ padding: '10px 14px', borderTop: '1px solid var(--hairline)' }}>
                <div className="v2-footer-hints">
                  <span className="hint">
                    <span className="kbd">j</span>
                    <span className="kbd">k</span> nav
                  </span>
                  <span className="hint">
                    <span className="kbd">⏎</span> act
                  </span>
                  <span className="hint">
                    <span className="kbd">n</span> new
                  </span>
                  <span className="hint">
                    <span className="kbd">r</span> resume
                  </span>
                  <span className="hint">
                    <span className="kbd">s</span> spec
                  </span>
                </div>
              </div>
            )}
          </aside>
          {selected && selected.type === 'project' && (
            <ProjectDetail
              item={selected}
              suggestedTask={selected.kind === 'idle' ? suggestedFor(selected.id) : null}
              onPrimary={doPrimary}
              onSecondary={doSecondary}
              onDelegateTask={doDelegateTask}
              onJumpProject={onJumpProject}
            />
          )}
          {selected && selected.type === 'ready' && (
            <TaskDetail task={selected} onDelegate={doDelegateTask} onEditSpec={() => setShowSpec(true)} />
          )}
        </div>
      </div>

      {spotlight && (
        <div
          className="spotlight-scrim v3"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSpotlight(false)
          }}
        >
          <SpotlightInner
            projects={PROJECTS}
            readyTasks={readyItems}
            onClose={() => setSpotlight(false)}
            onSubmit={(task) => {
              setSpotlight(false)
              setDelegation({ task })
            }}
            onPickProject={(id) => {
              setSpotlight(false)
              setSelectedKey(`p:${id}`)
            }}
            onPickTask={(t) => {
              setSpotlight(false)
              setSelectedKey(t.key)
            }}
          />
        </div>
      )}
      {delegation && (
        <DelegationModal
          task={delegation.task || 'describe the task…'}
          projects={PROJECTS}
          defaultProject={delegation.defaultProject}
          onClose={() => setDelegation(null)}
          onLaunch={(p, br) => {
            const taskText = delegation.task
            setDelegation(null)
            api
              .delegate(taskText, p.id)
              .then((r) => showToast(`Launched ${p.name} on ${r.branch}`))
              .catch(() => showToast(`Launched ${p.name} on ${br}`))
          }}
        />
      )}
      {resume && (
        <ResumeModal
          project={PROJECTS.find((p) => p.id === resume) as Project}
          onClose={() => setResume(null)}
          onLaunch={(p) => {
            setResume(null)
            api
              .resume(p.id)
              .then((r) => showToast(`Resumed ${p.name} on ${r.branch}`))
              .catch(() => showToast(`Resumed ${p.name}`))
          }}
        />
      )}
      {showSpec && specProject && (
        <SpecModal projectName={specProject.name} content={spec} onClose={() => setShowSpec(false)} />
      )}
      {toast && <Toast message={toast} />}
    </>
  )
}
