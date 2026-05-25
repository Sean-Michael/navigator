import type { CSSProperties } from 'react'

export type IconName =
  | 'branch'
  | 'git-commit'
  | 'pr'
  | 'merge'
  | 'session'
  | 'spec'
  | 'search'
  | 'cmd'
  | 'play'
  | 'rocket'
  | 'spark'
  | 'ext'
  | 'close'
  | 'check'
  | 'arrow-up'
  | 'compass'
  | 'back'
  | 'edit'
  | 'more'
  | 'doc'
  | 'image'
  | 'folder'
  | 'claude'
  | 'sun'

interface IconProps {
  name: IconName
  size?: number
  stroke?: number
  style?: CSSProperties
}

export function Icon({ name, size = 14, stroke = 1.6, style }: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: stroke,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    style,
  }
  switch (name) {
    case 'branch':
      return (
        <svg {...common}>
          <circle cx="6" cy="5" r="2" />
          <circle cx="6" cy="19" r="2" />
          <circle cx="18" cy="12" r="2" />
          <path d="M6 7v10" />
          <path d="M6 12c0-3 3-5 6-5h4" />
        </svg>
      )
    case 'git-commit':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3.5" />
          <path d="M3 12h5.5M15.5 12H21" />
        </svg>
      )
    case 'pr':
      return (
        <svg {...common}>
          <circle cx="6" cy="5" r="2" />
          <circle cx="6" cy="19" r="2" />
          <circle cx="18" cy="19" r="2" />
          <path d="M6 7v10" />
          <path d="M18 7v10c0-2-2-3-4-3h-2" />
          <path d="M14 11l-2-1 2-1" />
        </svg>
      )
    case 'merge':
      return (
        <svg {...common}>
          <circle cx="6" cy="5" r="2" />
          <circle cx="6" cy="19" r="2" />
          <circle cx="18" cy="12" r="2" />
          <path d="M6 7v10" />
          <path d="M6 12c0 4 4 5 8 5h2" />
        </svg>
      )
    case 'session':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="3" />
          <path d="M7 10l3 2-3 2M12 14h5" />
        </svg>
      )
    case 'spec':
      return (
        <svg {...common}>
          <path d="M7 3h7l4 4v14a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" />
          <path d="M14 3v4h4M9 13h6M9 17h4" />
        </svg>
      )
    case 'search':
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
      )
    case 'cmd':
      return (
        <svg {...common}>
          <path d="M9 6a3 3 0 100 6h6a3 3 0 100-6 3 3 0 00-3 3v6a3 3 0 11-3-3h6a3 3 0 113 3" />
        </svg>
      )
    case 'play':
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <path d="M8 5v14l11-7z" />
        </svg>
      )
    case 'rocket':
      return (
        <svg {...common}>
          <path d="M5 19c0-3 2-5 5-5l1 1-5 5-1-1z" />
          <path d="M12 4c4 1 7 4 8 8l-4 4c-3-1-7-5-8-8l4-4z" />
          <circle cx="14" cy="10" r="1.4" />
        </svg>
      )
    case 'spark':
      return (
        <svg {...common}>
          <path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6L12 4z" />
        </svg>
      )
    case 'ext':
      return (
        <svg {...common}>
          <path d="M14 5h5v5M19 5l-9 9M19 14v5H5V5h5" />
        </svg>
      )
    case 'close':
      return (
        <svg {...common}>
          <path d="M6 6l12 12M18 6l-12 12" />
        </svg>
      )
    case 'check':
      return (
        <svg {...common} strokeWidth={2.4}>
          <path d="M5 12l5 5 9-11" />
        </svg>
      )
    case 'arrow-up':
      return (
        <svg {...common}>
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      )
    case 'compass':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M14.5 9.5l-2 5-5 2 2-5 5-2z" />
        </svg>
      )
    case 'back':
      return (
        <svg {...common}>
          <path d="M15 6l-6 6 6 6" />
        </svg>
      )
    case 'edit':
      return (
        <svg {...common}>
          <path d="M4 20h4l10-10-4-4L4 16v4z" />
          <path d="M14 6l4 4" />
        </svg>
      )
    case 'more':
      return (
        <svg {...common}>
          <circle cx="6" cy="12" r="1.4" />
          <circle cx="12" cy="12" r="1.4" />
          <circle cx="18" cy="12" r="1.4" />
        </svg>
      )
    case 'doc':
      return (
        <svg {...common}>
          <path d="M7 3h7l4 4v14a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" />
          <path d="M14 3v4h4" />
        </svg>
      )
    case 'image':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="9" cy="10" r="1.6" />
          <path d="M21 17l-5-5-5 5-3-3-5 5" />
        </svg>
      )
    case 'folder':
      return (
        <svg {...common}>
          <path d="M3 6a1 1 0 011-1h5l2 2h9a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V6z" />
        </svg>
      )
    case 'claude':
      return (
        <svg {...common}>
          <path d="M4 16c2 2 4 3 8 3s6-1 8-3" />
          <path d="M4 8c2-2 4-3 8-3s6 1 8 3" />
          <circle cx="10" cy="12" r="1.2" />
          <circle cx="14" cy="12" r="1.2" />
        </svg>
      )
    case 'sun':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" />
        </svg>
      )
    default:
      return null
  }
}
