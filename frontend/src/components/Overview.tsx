import { useMemo } from 'react'
import { Icon } from './Icon'
import type { IconName } from './Icon'
import { CIBadge, DeployBadge, StatusPill } from './atoms'
import { NOW } from '../data'
import type { Project } from '../data'
import { deriveAttention } from '../lib/inbox'
import type { AttentionKind } from '../lib/inbox'
import { useNavData } from '../navData-context'

function miniIconForKind(k: string): IconName {
  return (
    ({ review: 'pr', blocked: 'close', stale: 'branch', spec: 'spec', active: 'play', idle: 'check' } as Record<string, IconName>)[k] ||
    'check'
  )
}
function iconColorForKind(k: AttentionKind): string {
  return {
    review: 'var(--frost-3)',
    blocked: '#8d3f47',
    stale: '#8a6b1f',
    spec: '#7a4f72',
    active: '#4a7878',
    idle: 'var(--ink-soft)',
  }[k]
}
function iconStyleForKind(k: string): React.CSSProperties {
  const m: Record<string, React.CSSProperties> = {
    review: { background: 'rgba(94,129,172,0.16)', color: 'var(--frost-3)' },
    blocked: { background: 'rgba(191,97,106,0.14)', color: '#8d3f47' },
    stale: { background: 'rgba(235,203,139,0.22)', color: '#8a6b1f' },
    spec: { background: 'rgba(180,142,173,0.18)', color: '#7a4f72' },
    active: { background: 'rgba(143,188,187,0.20)', color: '#4a7878' },
    idle: { background: 'rgba(76,86,106,0.10)', color: 'var(--ink-soft)' },
  }
  return m[k] || m.idle
}
function shortcutForKind(k: string): string {
  return { review: 'open', blocked: 'unblock', stale: 'decide', spec: 'continue', active: 'resume', idle: 'open' }[k] || ''
}

export function Overview({
  onOpenProject,
  onJumpToInbox,
}: {
  onOpenProject: (id: string) => void
  onJumpToInbox: () => void
}) {
  const { projects, portfolio: PORTFOLIO, readyTasks: READY_TASKS, stats: STATS } = useNavData()
  const attention = projects.filter((p) => {
    const last = p.sessions[0]
    return (
      p.openPRs > 0 ||
      (last && last.outcome === 'blocked') ||
      p.status === 'stale' ||
      p.status === 'spec' ||
      (last && last.outcome === 'in-progress')
    )
  })
  const topAttention = useMemo(() => deriveAttention(projects).filter((i) => i.priority < 10).slice(0, 4), [projects])
  const topReady = READY_TASKS.slice(0, 4)

  const trend = (cur: number, prev: number) => {
    if (cur === prev) return { kind: 'is-flat', label: '0%' }
    const pct = Math.round(((cur - prev) / Math.max(prev, 1)) * 100)
    return pct >= 0 ? { kind: 'is-up', label: `+${pct}%` } : { kind: 'is-down', label: `${pct}%` }
  }

  const greeting = (() => {
    const h = NOW.getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  })()

  return (
    <div className="overview">
      <div className="greeting">
        <h1>
          {greeting}. <span className="quiet">Here's where you are.</span>
        </h1>
        <div className="date">{NOW.toDateString()}</div>
      </div>

      <div className="kpi-strip">
        <div className="glass kpi">
          <div className="kpi-label">
            <Icon name="spark" size={11} /> Needs attention
          </div>
          <div className="kpi-value">
            {attention.length}
            <span className="unit">/ {projects.length}</span>
          </div>
          <div className="kpi-trend">
            {READY_TASKS.length} ready · {projects.length - attention.length} stable
          </div>
        </div>
        <div className="glass kpi">
          <div className="kpi-label">
            <Icon name="git-commit" size={11} /> Commits / 7d
          </div>
          <div className="kpi-value">{STATS.commits7d}</div>
          <div className={`kpi-trend ${trend(STATS.commits7d, STATS.commits7dPrev).kind}`}>
            {trend(STATS.commits7d, STATS.commits7dPrev).label} vs prior week
          </div>
        </div>
        <div className="glass kpi">
          <div className="kpi-label">
            <Icon name="session" size={11} /> Sessions / 7d
          </div>
          <div className="kpi-value">{STATS.sessions7d}</div>
          <div className={`kpi-trend ${trend(STATS.sessions7d, STATS.sessions7dPrev).kind}`}>
            {STATS.prsMerged7d} PRs merged
          </div>
        </div>
        <div className="glass kpi">
          <div className="kpi-label">
            <Icon name="rocket" size={11} /> Deploys healthy
          </div>
          <div className="kpi-value">
            {STATS.deploysHealthy}
            <span className="unit">/ {STATS.deploysTotal}</span>
          </div>
          <div className="kpi-trend">across {projects.length} projects</div>
        </div>
      </div>

      <div className="attention-strip">
        <div className="glass section-card">
          <div className="sh">
            <span className="sh-title">Needs attention now</span>
            <button className="sh-link" onClick={onJumpToInbox}>
              open inbox →
            </button>
          </div>
          {topAttention.length === 0 ? (
            <div style={{ padding: '20px 4px', color: 'var(--ink-faint)', fontSize: 13 }}>
              Nothing demands attention. Pick a task from the queue, or describe a new one.
            </div>
          ) : (
            topAttention.map((it) => (
              <div key={it.key} className="mini-row" onClick={onJumpToInbox}>
                <div className="mini-icon" style={iconStyleForKind(it.kind)}>
                  <Icon name={miniIconForKind(it.kind)} size={11} />
                </div>
                <div>
                  <div className="mini-name">{it.name}</div>
                  <div className="mini-meta">
                    <span style={{ color: iconColorForKind(it.kind), fontWeight: 500 }}>{it.stateLine.em}</span>
                    {it.stateLine.rest}
                  </div>
                </div>
                <span className="mini-right">{shortcutForKind(it.kind)}</span>
              </div>
            ))
          )}
        </div>

        <div className="glass section-card">
          <div className="sh">
            <span className="sh-title">Ready to delegate</span>
            <button className="sh-link" onClick={onJumpToInbox}>
              {READY_TASKS.length} queued →
            </button>
          </div>
          {topReady.length === 0 ? (
            <div style={{ padding: '20px 4px', color: 'var(--ink-faint)', fontSize: 13 }}>Queue is empty.</div>
          ) : (
            topReady.map((t) => (
              <div key={t.id} className="mini-row" onClick={onJumpToInbox}>
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
                  <div className="mini-name" style={{ fontSize: 12.5 }}>{t.task}</div>
                  <div className="mini-meta">{t.project} · {t.estimated}</div>
                </div>
                <Icon name="back" size={11} style={{ color: 'var(--ink-faint)', transform: 'rotate(180deg)' }} />
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <div className="sh" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '6px 4px 12px' }}>
          <span className="sh-title">Portfolio</span>
          <span style={{ fontSize: 11.5, color: 'var(--ink-faint)' }}>click any tile to open its portal</span>
        </div>
        <div className="portfolio">
          {projects.map((p: Project) => {
            const port = PORTFOLIO[p.id]
            return (
              <div key={p.id} className="glass portfolio-tile" onClick={() => onOpenProject(p.id)}>
                <div className="tile-head">
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h3 className="tile-name">{p.name}</h3>
                    <div className="tile-meta">{port.primaryLang} · {port.deploy.env}</div>
                  </div>
                  <StatusPill status={p.status} />
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <CIBadge status={port.ci.status} />
                  {port.deploy.env !== 'not deployed' && <DeployBadge status={port.deploy.status} env={port.deploy.env} />}
                </div>
                <div className="tile-mini-stats">
                  <div className="tile-stat">
                    <span className="lbl">commits</span>
                    <span className="val">
                      {port.recentCommits.length}
                      <span style={{ color: 'var(--ink-faint)', fontSize: 10, marginLeft: 3 }}>last 7d</span>
                    </span>
                  </div>
                  <div className="tile-stat">
                    <span className="lbl">PRs</span>
                    <span className="val">
                      {p.openPRs}
                      <span style={{ color: p.openPRs > 0 ? '#5b7c43' : 'var(--ink-faint)', fontSize: 10, marginLeft: 3 }}>
                        {p.openPRs > 0 ? 'open' : 'none'}
                      </span>
                    </span>
                  </div>
                  <div className="tile-stat">
                    <span className="lbl">sessions</span>
                    <span className="val">{p.sessions.length}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
