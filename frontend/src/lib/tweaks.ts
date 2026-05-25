export interface TweakValues {
  theme: 'light' | 'dark'
  accent: 'frost' | 'sky' | 'teal' | 'plum'
  glassIntensity: number
  showGrain: boolean
  defaultTab: 'overview' | 'inbox' | 'projects'
}

export const TWEAK_DEFAULTS: TweakValues = {
  theme: 'light',
  accent: 'frost',
  glassIntensity: 12,
  showGrain: false,
  defaultTab: 'overview',
}
