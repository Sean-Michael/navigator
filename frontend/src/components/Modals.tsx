import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Icon } from './Icon'
import { StatusPill } from './atoms'
import type { Project } from '../data'
import { buildPrompt, buildResumePrompt, guessSpecSections, inferProject, slugifyBranch } from '../lib/prompts'
import type { ReadyItem } from '../lib/inbox'

export function Modal({ onClose, children, wide }: { onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  return (
    <div className="modal-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={`glass glass--deep modal ${wide ? 'modal--wide' : ''}`}>{children}</div>
    </div>
  )
}

export function DelegationModal({
  task,
  projects,
  defaultProject,
  onClose,
  onLaunch,
}: {
  task: string
  projects: Project[]
  defaultProject?: string
  onClose: () => void
  onLaunch: (p: Project, branch: string) => void
}) {
  const [project, setProject] = useState(() => defaultProject || inferProject(task, projects))
  const branchName = useMemo(() => slugifyBranch(task), [task])
  const proj = projects.find((p) => p.id === project) || projects[0]
  const specSections = useMemo(() => guessSpecSections(task), [task])

  const prompt = useMemo(
    () => buildPrompt({ task, project: proj, branch: branchName, specSections }),
    [task, proj, branchName, specSections],
  )
  const [editablePrompt, setEditablePrompt] = useState(prompt)
  const [promptFor, setPromptFor] = useState(prompt)
  if (promptFor !== prompt) {
    setPromptFor(prompt)
    setEditablePrompt(prompt)
  }

  return (
    <Modal onClose={onClose} wide>
      <div className="modal-head">
        <div>
          <h2 className="modal-title">Delegate task</h2>
          <p className="modal-sub">
            Navigator will assemble context, create a worktree, and launch a Claude Code session.
          </p>
        </div>
        <button className="close-btn" onClick={onClose}>
          <Icon name="close" size={12} />
        </button>
      </div>

      <div className="task-card">
        <div className="task-row">
          <div className="task-key">Task</div>
          <div className="task-val" style={{ fontSize: 14 }}>{task}</div>
        </div>
        <div className="task-row">
          <div className="task-key">Project</div>
          <div className="task-val">
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              style={{
                font: 'inherit',
                fontSize: 13,
                background: 'rgba(255,255,255,0.6)',
                border: '1px solid var(--hairline-strong)',
                borderRadius: 6,
                padding: '4px 8px',
                color: 'var(--ink)',
              }}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <span style={{ marginLeft: 10, fontSize: 12, color: 'var(--ink-faint)' }}>
              <Icon name="folder" size={11} /> {proj.repoPath}
            </span>
          </div>
        </div>
        <div className="task-row">
          <div className="task-key">Branch</div>
          <div className="task-val"><span className="mono">{branchName}</span></div>
        </div>
        <div className="task-row">
          <div className="task-key">Worktree</div>
          <div className="task-val"><span className="mono">{proj.repoPath}-{branchName.replace('/', '-')}</span></div>
        </div>
        <div className="task-row">
          <div className="task-key">Spec sections</div>
          <div className="task-val">
            <div className="chip-row">
              {specSections.map((s) => <span key={s} className="chip">§ {s}</span>)}
            </div>
          </div>
        </div>
        <div className="task-row">
          <div className="task-key">Skills</div>
          <div className="task-val">
            <div className="chip-row">
              {proj.skills.map((s) => (
                <span key={s} className="chip" style={{ background: 'rgba(180,142,173,0.16)', color: '#7a4f72', borderColor: 'rgba(180,142,173,0.28)' }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="task-row">
          <div className="task-key">Context</div>
          <div className="task-val" style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>
            Recent 8 commits · open PRs · last session reflection · CLAUDE.md
          </div>
        </div>
      </div>

      <div className="section-head" style={{ margin: '6px 2px 8px' }}>
        <div className="section-title">Generated CLAUDE.md preview</div>
        <span style={{ fontSize: 11, color: 'var(--ink-faint)' }}>editable · ⏎ to launch</span>
      </div>
      <textarea
        className="prompt-block"
        value={editablePrompt}
        onChange={(e) => setEditablePrompt(e.target.value)}
        spellCheck={false}
        rows={14}
      />

      <div className="modal-foot">
        <div className="foot-hint">
          <Icon name="claude" size={13} />
          <span>
            Will shell out to <span style={{ fontFamily: 'var(--font-mono)' }}>claude --dangerously-skip-permissions</span>
          </span>
        </div>
        <div className="foot-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onLaunch(proj, branchName)}>
            <Icon name="rocket" size={12} /> Launch session
          </button>
        </div>
      </div>
    </Modal>
  )
}

export function ResumeModal({
  project,
  onClose,
  onLaunch,
}: {
  project: Project
  onClose: () => void
  onLaunch: (p: Project) => void
}) {
  const last = project.sessions[0]
  const prompt = useMemo(() => buildResumePrompt(project), [project])
  const [editablePrompt, setEditablePrompt] = useState(prompt)
  const [promptFor, setPromptFor] = useState(prompt)
  if (promptFor !== prompt) {
    setPromptFor(prompt)
    setEditablePrompt(prompt)
  }

  return (
    <Modal onClose={onClose} wide>
      <div className="modal-head">
        <div>
          <h2 className="modal-title">Resume {project.name}</h2>
          <p className="modal-sub">
            Picks up where the last session left off — branch state, TODOs, last reflection, relevant spec sections.
          </p>
        </div>
        <button className="close-btn" onClick={onClose}>
          <Icon name="close" size={12} />
        </button>
      </div>

      <div className="task-card">
        <div className="task-row">
          <div className="task-key">Branch</div>
          <div className="task-val"><span className="mono">{project.branch}</span></div>
        </div>
        {last && (
          <>
            <div className="task-row">
              <div className="task-key">Last session</div>
              <div className="task-val" style={{ fontSize: 13 }}>
                {last.task}
                <div style={{ marginTop: 4, fontSize: 11.5, color: 'var(--ink-faint)' }}>
                  <span className={`outcome-pill is-${last.outcome}`}>{last.outcome}</span>
                  <span style={{ marginLeft: 8 }}>{last.date}</span>
                </div>
              </div>
            </div>
            <div className="task-row">
              <div className="task-key">Open TODOs</div>
              <div className="task-val" style={{ fontSize: 13 }}>
                {project.id === 'spincd' ? (
                  <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12.5, color: 'var(--ink-soft)' }}>
                    <li>SearchBar.tsx — resolve client-vs-server filter ambiguity</li>
                    <li>collection list — handle empty state</li>
                  </ul>
                ) : (
                  <span style={{ color: 'var(--ink-faint)', fontSize: 12.5 }}>None detected via TODO scan</span>
                )}
              </div>
            </div>
          </>
        )}
        <div className="task-row">
          <div className="task-key">Spec sections</div>
          <div className="task-val">
            <div className="chip-row">
              {(project.id === 'spincd' ? ['Phase 2 — Search & Filter', 'Open Questions'] : ['Overview']).map((s) => (
                <span key={s} className="chip">§ {s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="section-head" style={{ margin: '6px 2px 8px' }}>
        <div className="section-title">Resume prompt — what Claude Code will see</div>
        <span style={{ fontSize: 11, color: 'var(--ink-faint)' }}>editable</span>
      </div>
      <textarea
        className="prompt-block"
        value={editablePrompt}
        onChange={(e) => setEditablePrompt(e.target.value)}
        spellCheck={false}
        rows={14}
      />

      <div className="modal-foot">
        <div className="foot-hint">
          <Icon name="claude" size={13} />
          <span>
            Worktree exists · session will continue on{' '}
            <span style={{ fontFamily: 'var(--font-mono)' }}>{project.branch}</span>
          </span>
        </div>
        <div className="foot-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onLaunch(project)}>
            <Icon name="play" size={12} /> Launch
          </button>
        </div>
      </div>
    </Modal>
  )
}

export function SpecModal({
  projectName,
  content,
  onClose,
}: {
  projectName: string
  content: string
  onClose: () => void
}) {
  return (
    <Modal onClose={onClose} wide>
      <div className="modal-head">
        <div>
          <h2 className="modal-title">{projectName} / SPEC.md</h2>
          <p className="modal-sub">Edit and commit. Spec sections will be injected into the next session.</p>
        </div>
        <button className="close-btn" onClick={onClose}>
          <Icon name="close" size={12} />
        </button>
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12.5,
          lineHeight: 1.6,
          color: 'var(--ink-soft)',
          whiteSpace: 'pre-wrap',
          background: 'rgba(46,52,64,0.04)',
          padding: 16,
          borderRadius: 10,
          maxHeight: 400,
          overflow: 'auto',
        }}
      >
        {content}
      </div>
      <div className="modal-foot">
        <div className="foot-hint">
          <Icon name="ext" size={12} /> opens in $EDITOR
        </div>
        <div className="foot-actions">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          <button className="btn btn-primary">
            <Icon name="check" size={12} /> Commit changes
          </button>
        </div>
      </div>
    </Modal>
  )
}

export function SpotlightInner({
  projects,
  readyTasks,
  onClose,
  onSubmit,
  onPickProject,
  onPickTask,
}: {
  projects: Project[]
  readyTasks: ReadyItem[]
  onClose: () => void
  onSubmit: (task: string) => void
  onPickProject: (id: string) => void
  onPickTask: (t: ReadyItem) => void
}) {
  const [q, setQ] = useState('')
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { ref.current?.focus() }, [])
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])

  const isQuery = q.trim().length > 0
  const ql = q.toLowerCase()
  const matchProj = projects.filter((p) => p.name.toLowerCase().includes(ql))
  const matchTasks = readyTasks.filter(
    (t) => t.task.toLowerCase().includes(ql) || t.project.name.toLowerCase().includes(ql),
  )

  return (
    <div className="glass glass--deep spotlight">
      <div className="spotlight-input-row">
        <div style={{ color: 'var(--accent)' }}>
          <Icon name="spark" size={18} />
        </div>
        <input
          ref={ref}
          className="spotlight-input"
          placeholder="Describe a task, jump to a project, or pick from the queue…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && q.trim()) {
              const exact = projects.find((p) => p.name.toLowerCase() === ql)
              if (exact) onPickProject(exact.id)
              else onSubmit(q.trim())
            }
          }}
        />
        <span className="kbd">esc</span>
      </div>
      <div className="spotlight-suggest">
        {isQuery && (
          <>
            <div className="suggest-group-head">Delegate as new task</div>
            <div className="suggest-item is-active" onClick={() => onSubmit(q.trim())}>
              <div className="suggest-icon" style={{ background: 'rgba(180,142,173,0.18)', color: '#7a4f72' }}>
                <Icon name="rocket" size={13} />
              </div>
              <div className="suggest-text">
                <div>"{q}"</div>
                <div className="suggest-sub">Navigator will infer the project and assemble context</div>
              </div>
              <span className="suggest-shortcut">⏎</span>
            </div>
          </>
        )}
        {(isQuery ? matchTasks : readyTasks).length > 0 && (
          <>
            <div className="suggest-group-head">From the queue</div>
            {(isQuery ? matchTasks : readyTasks).slice(0, 5).map((tk) => (
              <div key={tk.key} className="suggest-item" onClick={() => onPickTask(tk)}>
                <div
                  className="suggest-icon"
                  style={{
                    background: tk.isDecision ? 'rgba(235,203,139,0.22)' : 'rgba(180,142,173,0.18)',
                    color: tk.isDecision ? '#8a6b1f' : '#7a4f72',
                  }}
                >
                  <Icon name={tk.isDecision ? 'compass' : 'spark'} size={13} />
                </div>
                <div className="suggest-text">
                  <div>{tk.task}</div>
                  <div className="suggest-sub">{tk.project.name} · {tk.source.label}</div>
                </div>
                <span className="suggest-shortcut">{tk.estimated}</span>
              </div>
            ))}
          </>
        )}
        <div className="suggest-group-head">{isQuery ? 'Jump to project' : 'Projects'}</div>
        {(isQuery ? matchProj : projects).map((p) => (
          <div key={p.id} className="suggest-item" onClick={() => onPickProject(p.id)}>
            <div className="suggest-icon">
              <Icon name="folder" size={13} />
            </div>
            <div className="suggest-text">
              <div>{p.name}</div>
              <div className="suggest-sub">{p.branch} · {p.lastTouched}</div>
            </div>
            <StatusPill status={p.status} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function Toast({ message }: { message: string }) {
  return (
    <div className="toast-wrap">
      <div className="glass glass--deep toast">
        <div className="toast-icon">
          <Icon name="check" size={12} />
        </div>
        <span>{message}</span>
      </div>
    </div>
  )
}
