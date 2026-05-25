import { useCallback, useEffect, useState } from 'react'
import { Icon } from './components/Icon'
import type { IconName } from './components/Icon'
import { Overview } from './components/Overview'
import { InboxView } from './components/Inbox'
import { ProjectPortal } from './components/Portal'
import { DelegationModal, ResumeModal, SpecModal, SpotlightInner, Toast } from './components/Modals'
import { Tweaks } from './components/Tweaks'
import { TWEAK_DEFAULTS } from './lib/tweaks'
import type { TweakValues } from './lib/tweaks'
import type { Project } from './data'
import { buildReadyItems, chipColorForStatus } from './lib/inbox'
import { useNavData } from './navData-context'
import * as api from './api'

const TABS: { id: TabId; label: string; icon: IconName }[] = [
  { id: 'overview', label: 'Overview', icon: 'compass' },
  { id: 'inbox', label: 'Inbox', icon: 'spec' },
  { id: 'projects', label: 'Projects', icon: 'folder' },
]

type TabId = 'overview' | 'inbox' | 'projects'

const ACCENTS: Record<string, { accent: string; soft: string }> = {
  frost: { accent: '#5E81AC', soft: 'rgba(94,129,172,0.14)' },
  teal: { accent: '#5E9893', soft: 'rgba(94,152,147,0.16)' },
  plum: { accent: '#8E6585', soft: 'rgba(142,101,133,0.16)' },
  sky: { accent: '#88C0D0', soft: 'rgba(136,192,208,0.18)' },
}

const STORE_KEY = 'navigator.tweaks'

function loadTweaks(): TweakValues {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) return { ...TWEAK_DEFAULTS, ...JSON.parse(raw) }
  } catch {
    /* ignore */
  }
  return TWEAK_DEFAULTS
}

function App() {
  const { projects: PROJECTS, readyTasks: READY_TASKS, spec } = useNavData()
  const [t, setTweaks] = useState<TweakValues>(loadTweaks)
  const setTweak = useCallback(<K extends keyof TweakValues>(key: K, value: TweakValues[K]) => {
    setTweaks((prev) => {
      const next = { ...prev, [key]: value }
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  const [tab, setTab] = useState<TabId>(t.defaultTab)
  const [activeProjectId, setActiveProjectId] = useState(PROJECTS[0].id)

  const [delegation, setDelegation] = useState<{ task: string; defaultProject?: string } | null>(null)
  const [resume, setResume] = useState<string | null>(null)
  const [showSpec, setShowSpec] = useState(false)
  const [spotlight, setSpotlight] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (m: string) => {
    setToast(m)
    setTimeout(() => setToast(null), 2800)
  }

  // tweak side effects → CSS variables
  useEffect(() => {
    document.documentElement.dataset.theme = t.theme
    document.documentElement.style.setProperty('--glass-blur', `${t.glassIntensity}px`)
    const a = ACCENTS[t.accent] || ACCENTS.frost
    document.documentElement.style.setProperty('--accent', a.accent)
    document.documentElement.style.setProperty('--accent-soft', a.soft)
  }, [t])

  // global Cmd+K + g-then-{o,i,p} tab jumps
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSpotlight(true)
      }
      const target = e.target as HTMLElement | null
      if (target && /INPUT|TEXTAREA/.test(target.tagName)) return
      if (e.key === 'g') {
        const onNext = (ev: KeyboardEvent) => {
          if (ev.key === 'o') setTab('overview')
          else if (ev.key === 'i') setTab('inbox')
          else if (ev.key === 'p') setTab('projects')
          window.removeEventListener('keydown', onNext)
        }
        window.addEventListener('keydown', onNext)
        setTimeout(() => window.removeEventListener('keydown', onNext), 700)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const activeProject = PROJECTS.find((p) => p.id === activeProjectId) || PROJECTS[0]

  const openProject = (id: string) => {
    setActiveProjectId(id)
    setTab('projects')
  }
  const jumpToInbox = () => setTab('inbox')

  const attentionCount = PROJECTS.filter(
    (p) =>
      p.openPRs > 0 ||
      (p.sessions[0] && p.sessions[0].outcome === 'blocked') ||
      p.status === 'stale' ||
      p.status === 'spec' ||
      (p.sessions[0] && p.sessions[0].outcome === 'in-progress'),
  ).length

  const isReceded = spotlight || !!delegation || !!resume || showSpec

  return (
    <>
      <div className="bg-field">
        <i />
        {t.showGrain && <div className="grain" />}
      </div>

      <div className={`v4-app ${isReceded ? 'is-receded' : ''}`}>
        <header className="topbar" style={{ marginBottom: 8 }}>
          <div className="brand">
            <div className="brand-mark">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 9.5l-2 5-5 2 2-5 5-2z" />
                <circle cx="12" cy="12" r="9" />
              </svg>
            </div>
            <div>
              <div>Navigator</div>
              <div className="brand-meta">homelab · {PROJECTS.length} repos</div>
            </div>
          </div>

          <nav className="glass glass--sm v4-tabnav">
            {TABS.map((it) => (
              <button key={it.id} className={`v4-tab ${tab === it.id ? 'is-active' : ''}`} onClick={() => setTab(it.id)}>
                <Icon name={it.icon} size={12} />
                {it.label}
                {it.id === 'inbox' && <span className="tab-badge">{attentionCount + READY_TASKS.length}</span>}
              </button>
            ))}
          </nav>

          <div className="topbar-actions">
            <button
              className="btn btn-ghost"
              onClick={() => setSpotlight(true)}
              title="Open command palette"
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <Icon name="search" size={13} />
              <span style={{ fontSize: 12.5 }}>Search</span>
              <span style={{ display: 'flex', gap: 2 }}>
                <span className="kbd">⌘</span>
                <span className="kbd">K</span>
              </span>
            </button>
            <button className="btn btn-icon" onClick={() => setTweak('theme', t.theme === 'light' ? 'dark' : 'light')} title="Toggle theme">
              <Icon name="sun" size={13} />
            </button>
          </div>
        </header>

        {tab === 'overview' && <Overview onOpenProject={openProject} onJumpToInbox={jumpToInbox} />}

        {tab === 'inbox' && <InboxView onJumpProject={openProject} />}

        {tab === 'projects' && (
          <div className="portal">
            <div className="glass glass--sm project-picker">
              {PROJECTS.map((p) => (
                <button
                  key={p.id}
                  className={`project-chip ${activeProject.id === p.id ? 'is-active' : ''}`}
                  onClick={() => setActiveProjectId(p.id)}
                >
                  <span className="chip-dot" style={{ background: chipColorForStatus(p.status) }} />
                  {p.name}
                </button>
              ))}
            </div>
            <ProjectPortal
              project={activeProject}
              onResume={(id) => setResume(id)}
              onDelegate={(id) => setDelegation({ task: '', defaultProject: id })}
              onOpenSpec={() => setShowSpec(true)}
              jumpToInbox={jumpToInbox}
            />
          </div>
        )}
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
            readyTasks={buildReadyItems(READY_TASKS, PROJECTS)}
            onClose={() => setSpotlight(false)}
            onSubmit={(task) => {
              setSpotlight(false)
              setDelegation({ task })
            }}
            onPickProject={(id) => {
              setSpotlight(false)
              openProject(id)
            }}
            onPickTask={(tk) => {
              setSpotlight(false)
              setDelegation({ task: tk.task, defaultProject: tk.project.id })
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
      {showSpec && <SpecModal projectName={activeProject.name} content={spec} onClose={() => setShowSpec(false)} />}
      {toast && <Toast message={toast} />}

      <Tweaks values={t} setTweak={setTweak} />
    </>
  )
}

export default App
