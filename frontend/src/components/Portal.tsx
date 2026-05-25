import { useState } from 'react'
import { Icon } from './Icon'
import type { IconName } from './Icon'
import { CIBadge, CoverageRing, DeployBadge, LangBar, MarkdownPreview, StatusPill } from './atoms'
import type { Portfolio, Project } from '../data'
import { useNavData } from '../navData-context'

const PORTAL_TABS: { id: string; label: string; icon: IconName }[] = [
  { id: 'overview', label: 'Overview', icon: 'compass' },
  { id: 'repo', label: 'Repo', icon: 'branch' },
  { id: 'ci', label: 'CI / CD', icon: 'play' },
  { id: 'sessions', label: 'Sessions', icon: 'session' },
  { id: 'spec', label: 'Spec', icon: 'spec' },
  { id: 'artifacts', label: 'Artifacts', icon: 'image' },
  { id: 'notes', label: 'Notes', icon: 'doc' },
]

interface PortalProps {
  project: Project
  onResume: (id: string) => void
  onDelegate: (id: string) => void
  onOpenSpec: () => void
  jumpToInbox: () => void
}

export function ProjectPortal({ project, onResume, onDelegate, onOpenSpec, jumpToInbox }: PortalProps) {
  const { portfolio } = useNavData()
  const port = portfolio[project.id]
  const [tab, setTab] = useState('overview')
  // Reset to the overview subtab when the selected project changes (adjust
  // state during render — the React-recommended alternative to an effect).
  const [tabFor, setTabFor] = useState(project.id)
  if (tabFor !== project.id) {
    setTabFor(project.id)
    setTab('overview')
  }

  return (
    <div className="portal">
      <div className="glass portal-hero">
        <div className="portal-hero-top">
          <div className="portal-title-block">
            <div className="portal-eyebrow">
              project · {port.visibility} · {port.primaryLang}
            </div>
            <h1 className="portal-title">{project.name}</h1>
            <p className="portal-desc">{project.description}</p>
          </div>
          <div className="portal-actions">
            <a className="btn" href="#" onClick={(e) => e.preventDefault()}>
              <Icon name="ext" size={11} /> GitHub
            </a>
            {port.deploy.url !== '—' && port.deploy.url !== 'not deployed' && (
              <a className="btn" href="#" onClick={(e) => e.preventDefault()}>
                <Icon name="ext" size={11} /> {port.deploy.url}
              </a>
            )}
            <button className="btn" onClick={onOpenSpec}>
              <Icon name="spec" size={12} /> Spec
            </button>
            <button className="btn" onClick={() => onDelegate(project.id)}>
              <Icon name="spark" size={12} /> New task
            </button>
            <button className="btn btn-primary" onClick={() => onResume(project.id)}>
              <Icon name="play" size={12} /> Resume
            </button>
          </div>
        </div>

        <div className="portal-meta-row">
          <StatusPill status={project.status} />
          <CIBadge status={port.ci.status} />
          <DeployBadge status={port.deploy.status} env={port.deploy.env} />
          <span className="proj-branch">
            <Icon name="branch" size={11} />
            {project.branch}
          </span>
          <span style={{ fontSize: 11.5, color: 'var(--ink-faint)', fontFamily: 'var(--font-mono)' }}>
            {project.repoPath}
          </span>
        </div>
      </div>

      <div className="glass glass--sm portal-subnav" style={{ display: 'inline-flex', alignSelf: 'flex-start' }}>
        {PORTAL_TABS.map((t) => (
          <button key={t.id} className={`portal-sub-tab ${tab === t.id ? 'is-active' : ''}`} onClick={() => setTab(t.id)}>
            <Icon name={t.icon} size={12} />
            {t.label}
            {t.id === 'sessions' && project.sessions.length > 0 && <span className="sub-count">{project.sessions.length}</span>}
            {t.id === 'artifacts' && port.artifacts.length > 0 && <span className="sub-count">{port.artifacts.length}</span>}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <PortalOverview project={project} port={port} setTab={setTab} jumpToInbox={jumpToInbox} />
      )}
      {tab === 'repo' && <PortalRepo project={project} port={port} />}
      {tab === 'ci' && <PortalCI port={port} />}
      {tab === 'sessions' && <PortalSessions project={project} />}
      {tab === 'spec' && <PortalSpec project={project} />}
      {tab === 'artifacts' && <PortalArtifacts port={port} />}
      {tab === 'notes' && <PortalNotes port={port} />}
    </div>
  )
}

function PortalStat({ label, value, sub }: { label: string; value: number; sub: string }) {
  return (
    <div>
      <div className="kpi-label" style={{ fontSize: 10 }}>{label}</div>
      <div className="kpi-value" style={{ fontSize: 24, marginTop: 2 }}>{value}</div>
      <div className="kpi-trend" style={{ marginTop: 2 }}>{sub}</div>
    </div>
  )
}

function PortalOverview({
  project,
  port,
  setTab,
  jumpToInbox,
}: {
  project: Project
  port: Portfolio
  setTab: (t: string) => void
  jumpToInbox: () => void
}) {
  const { readyTasks } = useNavData()
  const readyForProj = readyTasks.filter((r) => r.project === project.id)
  const last = project.sessions[0]

  return (
    <div className="portal-body">
      <div className="portal-col-main">
        <div className="glass panel" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <PortalStat label="Branches" value={port.branches.length} sub="track" />
            <PortalStat label="Sessions" value={project.sessions.length} sub="logged" />
            <PortalStat label="Open PRs" value={project.openPRs} sub={project.openPRs > 0 ? 'needs review' : 'none'} />
            <PortalStat label="Ready tasks" value={readyForProj.length} sub="queued" />
          </div>
        </div>

        {last && (
          <div className="glass panel">
            <div className="panel-head">
              <div className="panel-title">
                Last session
                <span className="panel-action" style={{ color: 'var(--ink-faint)' }}>{last.date}</span>
              </div>
              <button className="panel-action" onClick={() => setTab('sessions')}>
                see all <Icon name="back" size={10} />
              </button>
            </div>
            <div className="session-head">
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 className="session-task">{last.task}</h4>
                <div className="session-meta">
                  <span className="proj-branch" style={{ fontSize: 11 }}>
                    <Icon name="branch" size={10} />
                    {last.branch}
                  </span>
                </div>
              </div>
              <span className={`outcome-pill is-${last.outcome}`}>{last.outcome}</span>
            </div>
            <div className="session-reflection" style={{ marginTop: 10 }}>{last.reflection}</div>
          </div>
        )}

        {port.recentCommits.length > 0 && (
          <div className="glass panel">
            <div className="panel-head">
              <div className="panel-title">Recent commits</div>
              <button className="panel-action" onClick={() => setTab('repo')}>
                full history <Icon name="back" size={10} style={{ transform: 'rotate(180deg)' }} />
              </button>
            </div>
            <div className="commit-list">
              {port.recentCommits.slice(0, 4).map((c) => (
                <div key={c.sha} className="commit-row">
                  <span className="commit-sha">{c.sha}</span>
                  <span className="commit-msg">{c.message}</span>
                  <span className="commit-meta">{c.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {readyForProj.length > 0 && (
          <div className="glass panel">
            <div className="panel-head">
              <div className="panel-title">
                Queued for {project.name}
                <span
                  className="sub-count"
                  style={{ marginLeft: 4, padding: '1px 6px', borderRadius: 5, fontSize: 10.5, fontFamily: 'var(--font-mono)', background: 'rgba(180,142,173,0.16)', color: '#7a4f72' }}
                >
                  {readyForProj.length}
                </span>
              </div>
              <button className="panel-action" onClick={jumpToInbox}>
                open in Inbox <Icon name="ext" size={10} />
              </button>
            </div>
            {readyForProj.slice(0, 4).map((t) => (
              <div key={t.id} className="mini-row" onClick={jumpToInbox}>
                <div
                  className="mini-icon"
                  style={{
                    background: t.kind === 'decision' ? 'rgba(235,203,139,0.22)' : 'rgba(180,142,173,0.18)',
                    color: t.kind === 'decision' ? '#8a6b1f' : '#7a4f72',
                  }}
                >
                  <Icon name={t.kind === 'decision' ? 'compass' : 'spark'} size={11} />
                </div>
                <div>
                  <div className="mini-name">{t.task}</div>
                  <div className="mini-meta">{t.source.label}</div>
                </div>
                <span className="mini-right">{t.estimated}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="portal-col-side">
        {port.deploy.env !== 'not deployed' && (
          <div className={`deploy-card ${port.deploy.status === 'healthy' ? 'is-healthy' : port.deploy.status === '—' ? 'is-neutral' : 'is-unhealthy'}`}>
            <div className="deploy-card-head">
              <span className="deploy-env">{port.deploy.env}</span>
              <CIBadge status={port.ci.status} />
            </div>
            {port.deploy.url !== '—' && (
              <a className="deploy-url" href="#" onClick={(e) => e.preventDefault()}>
                <Icon name="ext" size={10} /> {port.deploy.url}
              </a>
            )}
            <div className="deploy-stats">
              <div>
                <div className="deploy-stat-key">version</div>
                <div className="deploy-stat-val">{port.deploy.version}</div>
              </div>
              <div>
                <div className="deploy-stat-key">uptime</div>
                <div className="deploy-stat-val">{port.deploy.uptime}</div>
              </div>
              <div>
                <div className="deploy-stat-key">deployed</div>
                <div className="deploy-stat-val">{port.deploy.lastDeploy}</div>
              </div>
            </div>
          </div>
        )}

        {port.coverage && port.coverage.pct > 0 && (
          <div className="glass panel">
            <div className="panel-head" style={{ marginBottom: 10 }}>
              <div className="panel-title">Test coverage</div>
            </div>
            <div className="coverage-block">
              <CoverageRing pct={port.coverage.pct} />
              <div className="coverage-text">
                <strong>{port.coverage.pct}%</strong>
                lines covered
                <br />
                <span
                  style={{
                    color: port.coverage.trend.startsWith('+') ? '#5b7c43' : port.coverage.trend.startsWith('−') ? '#8d3f47' : 'var(--ink-faint)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11.5,
                  }}
                >
                  {port.coverage.trend} vs last week
                </span>
              </div>
            </div>
          </div>
        )}

        {port.languages.length > 0 && (
          <div className="glass panel">
            <div className="panel-head" style={{ marginBottom: 10 }}>
              <div className="panel-title">Languages</div>
            </div>
            <LangBar languages={port.languages} />
          </div>
        )}

        {project.skills.length > 0 && (
          <div className="glass panel">
            <div className="panel-head" style={{ marginBottom: 10 }}>
              <div className="panel-title">Loaded skills</div>
            </div>
            <div className="skill-list">
              {project.skills.map((s) => (
                <div key={s} className="skill-item">
                  <Icon name="spark" size={12} />
                  <span className="skill-mono">{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function PortalRepo({ project, port }: { project: Project; port: Portfolio }) {
  return (
    <div className="portal-body">
      <div className="portal-col-main">
        <div className="glass panel">
          <div className="panel-head">
            <div className="panel-title">Recent commits</div>
            <a className="panel-action" href="#" onClick={(e) => e.preventDefault()}>
              view on GitHub <Icon name="ext" size={10} />
            </a>
          </div>
          <div className="commit-list">
            {port.recentCommits.map((c) => (
              <div key={c.sha} className="commit-row">
                <span className="commit-sha">{c.sha}</span>
                <div>
                  <div className="commit-msg">{c.message}</div>
                  <div className="commit-meta" style={{ marginTop: 3, fontSize: 10.5 }}>{c.branch} · {c.time}</div>
                </div>
                <a className="panel-action" href="#" onClick={(e) => e.preventDefault()}>
                  <Icon name="ext" size={11} />
                </a>
              </div>
            ))}
            {port.recentCommits.length === 0 && (
              <div className="empty">
                <div className="empty-icon">
                  <Icon name="branch" size={20} />
                </div>
                <div className="empty-title">No commits yet</div>
                <div className="empty-sub">
                  This project is in spec phase. Run a bootstrap session to land the first commit.
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="glass panel">
          <div className="panel-head">
            <div className="panel-title">Branches</div>
            <a className="panel-action" href="#" onClick={(e) => e.preventDefault()}>
              manage on GitHub <Icon name="ext" size={10} />
            </a>
          </div>
          <div className="branches-table">
            {port.branches.map((b) => (
              <div key={b.name} className="branch-row">
                <div className="branch-name">
                  <Icon name="branch" size={11} />
                  {b.name}
                  {b.protected && <span className="protected-pill">protected</span>}
                  {b.stale && (
                    <span className="pill is-stale" style={{ padding: '1px 6px' }}>
                      <span className="pill-dot" />
                      stale
                    </span>
                  )}
                </div>
                <div className="branch-aheadbehind">
                  {b.ahead > 0 && <span className="ahead">↑{b.ahead}</span>}
                  {b.behind > 0 && <span className="behind"> ↓{b.behind}</span>}
                  {b.ahead === 0 && b.behind === 0 && <span style={{ color: 'var(--ink-faint)' }}>even</span>}
                </div>
                <span className="commit-meta">{b.time}</span>
              </div>
            ))}
            {port.branches.length === 0 && (
              <div className="empty">
                <div className="empty-sub">No branches yet.</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="portal-col-side">
        <div className="glass panel">
          <div className="panel-head" style={{ marginBottom: 10 }}>
            <div className="panel-title">Languages</div>
          </div>
          <LangBar languages={port.languages} />
        </div>

        <div className="glass panel">
          <div className="panel-head" style={{ marginBottom: 10 }}>
            <div className="panel-title">Contributors</div>
          </div>
          {port.contributors.map((c) => (
            <div key={c.name} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 0' }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #88C0D0, #5E81AC)',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'white',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {c.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'var(--font-mono)' }}>
                  {c.commits} commits
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="glass panel">
          <div className="panel-head" style={{ marginBottom: 10 }}>
            <div className="panel-title">Repo info</div>
          </div>
          <div className="kv-row">
            <span className="kv-key">Visibility</span>
            <span className="kv-val">{port.visibility}</span>
          </div>
          <div className="kv-row">
            <span className="kv-key">License</span>
            <span className="kv-val">{port.license}</span>
          </div>
          <div className="kv-row">
            <span className="kv-key">Homepage</span>
            <span className="kv-val mono" style={{ fontSize: 11.5 }}>{port.homepage}</span>
          </div>
          <div className="kv-row">
            <span className="kv-key">Path</span>
            <span className="kv-val mono" style={{ fontSize: 11.5 }}>{project.repoPath}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function PortalCI({ port }: { port: Portfolio }) {
  if (port.ci.status === 'not configured' || port.ci.runs.length === 0) {
    return (
      <div className="glass panel">
        <div className="empty">
          <div className="empty-icon">
            <Icon name="play" size={20} />
          </div>
          <div className="empty-title">No CI configured</div>
          <div className="empty-sub">
            Add a workflow at <span style={{ fontFamily: 'var(--font-mono)' }}>.github/workflows/</span>. Navigator
            will surface build status here.
          </div>
        </div>
      </div>
    )
  }
  const failing = port.ci.runs.filter((r) => r.status === 'failing')
  return (
    <div className="portal-body">
      <div className="portal-col-main">
        {failing.length > 0 && (
          <div className="glass panel" style={{ borderColor: 'rgba(191,97,106,0.30)', background: 'rgba(191,97,106,0.06)' }}>
            <div className="panel-head">
              <div className="panel-title" style={{ color: '#8d3f47' }}>Failing</div>
              <a className="panel-action" href="#" onClick={(e) => e.preventDefault()}>
                view on GitHub <Icon name="ext" size={10} />
              </a>
            </div>
            {failing.map((r) => (
              <div key={r.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 0', fontSize: 13 }}>
                <span className="run-dot is-failing" />
                <span style={{ flex: 1 }}>
                  <span style={{ fontWeight: 500 }}>{r.workflow}</span> on{' '}
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{r.branch}</span> ·{' '}
                  {r.reason && <span style={{ color: 'var(--ink-faint)' }}>{r.reason}</span>}
                </span>
                <span className="commit-meta">{r.time}</span>
              </div>
            ))}
          </div>
        )}

        <div className="glass panel">
          <div className="panel-head">
            <div className="panel-title">Recent runs</div>
            <span className="commit-meta">{port.ci.provider}</span>
          </div>
          <div className="runs-list">
            {port.ci.runs.map((r) => (
              <div key={r.id} className="run-row">
                <span className={`run-dot is-${r.status}`} />
                <span className="run-id">#{r.id}</span>
                <div>
                  <span className="run-workflow">{r.workflow}</span>
                  <div className="run-branch">{r.branch} · {r.commit}</div>
                </div>
                <span className="run-duration">{r.duration}</span>
                <span className="run-time">{r.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="portal-col-side">
        {port.deploy.env !== 'not deployed' && (
          <div className={`deploy-card ${port.deploy.status === 'healthy' ? 'is-healthy' : ''}`}>
            <div className="deploy-card-head">
              <span className="deploy-env">{port.deploy.env}</span>
              <DeployBadge status={port.deploy.status} env={port.deploy.env} />
            </div>
            {port.deploy.url !== '—' && (
              <a className="deploy-url" href="#" onClick={(e) => e.preventDefault()}>
                <Icon name="ext" size={10} /> {port.deploy.url}
              </a>
            )}
            <div className="deploy-stats">
              <div>
                <div className="deploy-stat-key">version</div>
                <div className="deploy-stat-val">{port.deploy.version}</div>
              </div>
              <div>
                <div className="deploy-stat-key">uptime</div>
                <div className="deploy-stat-val">{port.deploy.uptime}</div>
              </div>
              <div>
                <div className="deploy-stat-key">last</div>
                <div className="deploy-stat-val">{port.deploy.lastDeploy}</div>
              </div>
            </div>
          </div>
        )}

        {port.coverage && port.coverage.pct > 0 && (
          <div className="glass panel">
            <div className="panel-head" style={{ marginBottom: 10 }}>
              <div className="panel-title">Coverage</div>
            </div>
            <div className="coverage-block">
              <CoverageRing pct={port.coverage.pct} />
              <div className="coverage-text">
                <strong>{port.coverage.pct}%</strong>
                lines covered
                <br />
                <span
                  style={{
                    color: port.coverage.trend.startsWith('+') ? '#5b7c43' : port.coverage.trend.startsWith('−') ? '#8d3f47' : 'var(--ink-faint)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11.5,
                  }}
                >
                  {port.coverage.trend} vs last week
                </span>
              </div>
            </div>
          </div>
        )}

        {port.bundle && (
          <div className="glass panel">
            <div className="panel-head" style={{ marginBottom: 10 }}>
              <div className="panel-title">Bundle size</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <div style={{ fontSize: 22, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{port.bundle.size}</div>
              <div style={{ fontSize: 11.5, color: port.bundle.trend.startsWith('+') ? '#8d3f47' : '#5b7c43', fontFamily: 'var(--font-mono)' }}>
                {port.bundle.trend}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function PortalSessions({ project }: { project: Project }) {
  if (project.sessions.length === 0) {
    return (
      <div className="glass panel">
        <div className="empty">
          <div className="empty-icon">
            <Icon name="session" size={20} />
          </div>
          <div className="empty-title">No sessions yet</div>
          <div className="empty-sub">
            Delegate the first task to seed <span style={{ fontFamily: 'var(--font-mono)' }}>navigator.yaml</span>.
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="portal-body no-side">
      <div className="portal-col-main">
        {project.sessions.map((s, i) => (
          <div key={i} className="glass session">
            <div className="session-head">
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 className="session-task">{s.task}</h4>
                <div className="session-meta">
                  <span className="proj-branch" style={{ fontSize: 11 }}>
                    <Icon name="branch" size={10} />
                    {s.branch}
                  </span>
                  <span className="proj-dot" />
                  <span>{s.date}</span>
                </div>
              </div>
              <span className={`outcome-pill is-${s.outcome}`}>{s.outcome}</span>
            </div>
            <div className="session-reflection">{s.reflection}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PortalSpec({ project }: { project: Project }) {
  const { spec } = useNavData()
  return (
    <div className="portal-body no-side">
      <div className="portal-col-main">
        <div className="glass" style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-faint)', fontWeight: 400 }}>
                {project.name} /{' '}
              </span>
              SPEC.md
            </h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-sm">
                <Icon name="edit" size={11} /> Edit
              </button>
              <button className="btn btn-sm">
                <Icon name="ext" size={11} /> View on GitHub
              </button>
            </div>
          </div>
          <MarkdownPreview text={spec} />
        </div>
      </div>
    </div>
  )
}

function PortalArtifacts({ port }: { port: Portfolio }) {
  if (port.artifacts.length === 0) {
    return (
      <div className="glass panel">
        <div className="empty">
          <div className="empty-icon">
            <Icon name="image" size={20} />
          </div>
          <div className="empty-title">No artifacts yet</div>
          <div className="empty-sub">
            Drop screenshots, design files, ADRs, or schemas in{' '}
            <span style={{ fontFamily: 'var(--font-mono)' }}>./artifacts</span> and they'll appear here.
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="portal-body no-side">
      <div className="portal-col-main">
        <div className="glass panel">
          <div className="panel-head">
            <div className="panel-title">
              Artifacts
              <span
                className="sub-count"
                style={{ marginLeft: 6, padding: '1px 6px', borderRadius: 5, fontSize: 10.5, fontFamily: 'var(--font-mono)', background: 'rgba(46,52,64,0.06)', color: 'var(--ink-faint)' }}
              >
                {port.artifacts.length}
              </span>
            </div>
            <button className="panel-action">
              <Icon name="ext" size={10} /> open folder
            </button>
          </div>
          <div className="artifacts-grid">
            {port.artifacts.map((a) => (
              <div key={a.id} className="artifact-tile">
                <div
                  className={`artifact-preview ${a.kind === 'doc' ? 'is-doc' : ''}`}
                  style={{ '--thumb': a.thumb } as React.CSSProperties}
                >
                  {a.kind === 'doc' ? <Icon name="doc" size={20} /> : <Icon name="image" size={20} />}
                </div>
                <div className="artifact-info">
                  <span className="nm">{a.name}</span>
                  <span className="tm">{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function PortalNotes({ port }: { port: Portfolio }) {
  return (
    <div className="portal-body no-side">
      <div className="portal-col-main">
        <div className="glass notes-pane">
          <MarkdownPreview text={port.notes || '*No notes yet.*'} />
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--hairline)', display: 'flex', gap: 8 }}>
            <button className="btn btn-sm">
              <Icon name="edit" size={11} /> Edit notes
            </button>
            <span style={{ fontSize: 11, color: 'var(--ink-faint)', alignSelf: 'center' }}>
              Stored at <span style={{ fontFamily: 'var(--font-mono)' }}>navigator.yaml#notes</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
