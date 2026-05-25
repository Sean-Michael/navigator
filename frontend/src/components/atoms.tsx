import { Icon } from './Icon'
import type { Language, Status } from '../data'

const STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  review: 'Review',
  idle: 'Idle',
  stale: 'Stale',
  spec: 'Spec phase',
  blocked: 'Blocked',
}

export function StatusPill({ status }: { status: Status }) {
  return (
    <span className={`pill is-${status}`}>
      <span className="pill-dot" />
      {STATUS_LABEL[status] || status}
    </span>
  )
}

export function CIBadge({ status }: { status: string }) {
  const label = status === 'passing' ? 'passing' : status === 'failing' ? 'failing' : '—'
  return (
    <span className={`ci-badge is-${status.replace(/\s/g, '-')}`}>
      <span className="ci-dot" /> CI · {label}
    </span>
  )
}

export function DeployBadge({ status, env }: { status: string; env: string }) {
  const cls = status === 'healthy' ? 'is-healthy' : status === '—' ? '' : 'is-unhealthy'
  if (env === 'not deployed') return null
  return (
    <span className={`deploy-badge ${cls}`}>
      <Icon name="rocket" size={10} /> {env}
    </span>
  )
}

export function CoverageRing({ pct }: { pct: number }) {
  const r = 28
  const c = 2 * Math.PI * r
  const offset = c - (pct / 100) * c
  const cls = pct >= 70 ? '' : pct >= 40 ? 'is-low' : 'is-poor'
  return (
    <div className={`coverage-ring ${cls}`}>
      <svg viewBox="0 0 70 70">
        <circle className="ring-bg" cx="35" cy="35" r={r} fill="none" strokeWidth="6" />
        <circle
          className="ring-fg"
          cx="35"
          cy="35"
          r={r}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="coverage-ring-label">{pct}%</div>
    </div>
  )
}

export function LangBar({ languages }: { languages: Language[] }) {
  if (!languages || languages.length === 0) {
    return <div style={{ fontSize: 12.5, color: 'var(--ink-faint)' }}>—</div>
  }
  return (
    <>
      <div className="lang-bar">
        {languages.map((l) => (
          <span key={l.name} style={{ width: `${l.pct}%`, background: l.color }} />
        ))}
      </div>
      <div className="lang-legend">
        {languages.map((l) => (
          <span key={l.name}>
            <span className="lang-dot" style={{ background: l.color }} />
            {l.name} <span className="lang-pct">{l.pct}%</span>
          </span>
        ))}
      </div>
    </>
  )
}

export function MarkdownPreview({ text }: { text: string }) {
  const lines = text.split('\n')
  const nodes: React.ReactNode[] = []
  let listBuf: string[] = []
  const inline = (s: string) =>
    s
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
  const flushList = () => {
    if (listBuf.length) {
      const buf = listBuf
      nodes.push(
        <ul key={`l-${nodes.length}`}>
          {buf.map((it, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: inline(it) }} />
          ))}
        </ul>,
      )
      listBuf = []
    }
  }

  lines.forEach((l, i) => {
    if (l.startsWith('# ')) {
      flushList()
      nodes.push(<h1 key={i}>{l.slice(2)}</h1>)
    } else if (l.startsWith('## ')) {
      flushList()
      nodes.push(<h2 key={i}>{l.slice(3)}</h2>)
    } else if (l.startsWith('### ')) {
      flushList()
      nodes.push(<h3 key={i}>{l.slice(4)}</h3>)
    } else if (l.startsWith('> ')) {
      flushList()
      nodes.push(<blockquote key={i}>{l.slice(2)}</blockquote>)
    } else if (l.startsWith('- ')) {
      listBuf.push(l.slice(2))
    } else if (l.startsWith('  - ')) {
      listBuf.push('&nbsp;&nbsp;– ' + l.slice(4))
    } else if (l.trim() === '') {
      flushList()
    } else {
      flushList()
      nodes.push(<p key={i} dangerouslySetInnerHTML={{ __html: inline(l) }} />)
    }
  })
  flushList()
  return <>{nodes}</>
}
