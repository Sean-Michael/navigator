import { useState } from 'react'
import { Icon } from './Icon'
import type { TweakValues } from '../lib/tweaks'

const ACCENT_OPTIONS: { value: TweakValues['accent']; color: string; label: string }[] = [
  { value: 'frost', color: '#5E81AC', label: 'Frost' },
  { value: 'sky', color: '#88C0D0', label: 'Sky' },
  { value: 'teal', color: '#5E9893', label: 'Teal' },
  { value: 'plum', color: '#8E6585', label: 'Plum' },
]

const STYLE = `
  .twk-fab{position:fixed;right:16px;bottom:16px;z-index:15;width:40px;height:40px;
    display:grid;place-items:center;border:.5px solid rgba(255,255,255,.6);border-radius:12px;
    background:rgba(250,249,247,.78);color:#29261b;cursor:pointer;
    -webkit-backdrop-filter:blur(20px) saturate(160%);backdrop-filter:blur(20px) saturate(160%);
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 8px 24px rgba(0,0,0,.16)}
  [data-theme="dark"] .twk-fab{background:rgba(46,52,64,.82);color:#ECEFF4;border-color:rgba(255,255,255,.12)}
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:16;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    background:rgba(250,249,247,.86);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  [data-theme="dark"] .twk-panel{background:rgba(46,52,64,.9);color:#ECEFF4;border-color:rgba(255,255,255,.12)}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;padding:10px 8px 10px 14px}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:pointer;font-size:13px;line-height:1}
  [data-theme="dark"] .twk-x{color:rgba(236,239,244,.6)}
  .twk-x:hover{background:rgba(0,0,0,.06)}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;overflow-y:auto}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;color:rgba(41,38,27,.72)}
  [data-theme="dark"] .twk-lbl{color:rgba(236,239,244,.78)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}
  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  [data-theme="dark"] .twk-sect{color:rgba(236,239,244,.5)}
  .twk-sect:first-child{padding-top:0}
  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:14px;height:14px;
    border-radius:50%;background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:pointer}
  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;background:rgba(0,0,0,.06)}
  [data-theme="dark"] .twk-seg{background:rgba(255,255,255,.08)}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;background:rgba(255,255,255,.9);
    box-shadow:0 1px 2px rgba(0,0,0,.12);transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  [data-theme="dark"] .twk-seg-thumb{background:rgba(120,130,150,.8)}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;background:transparent;
    color:inherit;font:inherit;font-weight:500;min-height:22px;border-radius:6px;cursor:pointer;padding:4px 6px}
  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:pointer;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}
  .twk-chips{display:flex;gap:6px}
  .twk-chip{position:relative;appearance:none;flex:1;min-width:0;height:46px;padding:0;border:0;border-radius:6px;
    overflow:hidden;cursor:pointer;box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);
    transition:transform .12s cubic-bezier(.3,.7,.4,1),box-shadow .12s}
  .twk-chip:hover{transform:translateY(-1px)}
  .twk-chip[data-on="1"]{box-shadow:0 0 0 1.5px rgba(0,0,0,.85),0 2px 6px rgba(0,0,0,.15)}
`

function Seg<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  const idx = Math.max(0, options.findIndex((o) => o.value === value))
  const n = options.length
  return (
    <div className="twk-seg" role="radiogroup">
      <div className="twk-seg-thumb" style={{ left: `calc(2px + ${idx} * (100% - 4px) / ${n})`, width: `calc((100% - 4px) / ${n})` }} />
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={o.value === value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Tweaks({
  values,
  setTweak,
  hidden,
}: {
  values: TweakValues
  setTweak: <K extends keyof TweakValues>(k: K, v: TweakValues[K]) => void
  hidden?: boolean
}) {
  const [open, setOpen] = useState(false)

  // Stay out of the way while a modal / command palette is open.
  if (hidden) return null

  if (!open) {
    return (
      <>
        <style>{STYLE}</style>
        <button className="twk-fab" title="Tweaks" onClick={() => setOpen(true)}>
          <Icon name="more" size={16} />
        </button>
      </>
    )
  }

  return (
    <>
      <style>{STYLE}</style>
      <div className="twk-panel">
        <div className="twk-hd">
          <b>Tweaks</b>
          <button className="twk-x" aria-label="Close tweaks" onClick={() => setOpen(false)}>
            ✕
          </button>
        </div>
        <div className="twk-body">
          <div className="twk-sect">Theme</div>
          <div className="twk-row">
            <div className="twk-lbl">
              <span>Mode</span>
            </div>
            <Seg
              value={values.theme}
              options={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
              ]}
              onChange={(v) => setTweak('theme', v)}
            />
          </div>
          <div className="twk-row">
            <div className="twk-lbl">
              <span>Accent</span>
            </div>
            <div className="twk-chips" role="radiogroup">
              {ACCENT_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  className="twk-chip"
                  role="radio"
                  aria-checked={values.accent === o.value}
                  data-on={values.accent === o.value ? '1' : '0'}
                  title={o.label}
                  style={{ background: o.color }}
                  onClick={() => setTweak('accent', o.value)}
                />
              ))}
            </div>
          </div>

          <div className="twk-sect">Material</div>
          <div className="twk-row">
            <div className="twk-lbl">
              <span>Glass blur</span>
              <span className="twk-val">{values.glassIntensity}px</span>
            </div>
            <input
              type="range"
              className="twk-slider"
              min={0}
              max={40}
              step={1}
              value={values.glassIntensity}
              onChange={(e) => setTweak('glassIntensity', Number(e.target.value))}
            />
          </div>
          <div className="twk-row twk-row-h">
            <div className="twk-lbl">
              <span>Background grain</span>
            </div>
            <button
              type="button"
              className="twk-toggle"
              role="switch"
              aria-checked={values.showGrain}
              data-on={values.showGrain ? '1' : '0'}
              onClick={() => setTweak('showGrain', !values.showGrain)}
            >
              <i />
            </button>
          </div>

          <div className="twk-sect">Defaults</div>
          <div className="twk-row">
            <div className="twk-lbl">
              <span>Landing tab</span>
            </div>
            <Seg
              value={values.defaultTab}
              options={[
                { value: 'overview', label: 'Overview' },
                { value: 'inbox', label: 'Inbox' },
                { value: 'projects', label: 'Projects' },
              ]}
              onChange={(v) => setTweak('defaultTab', v)}
            />
          </div>
        </div>
      </div>
    </>
  )
}
