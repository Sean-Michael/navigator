# Navigator — UI/UX Findings

A Playwright pass against the docker-compose stack (`localhost:5173`), both
themes, all three tabs, the command palette, and the delegate/resume/spec
modals. The app is functional and the bones are good; the problem is **visual
and verbal noise** — the design has the tell-tale "generated" smell of an icon
on every label, a glow on every surface, and a greeting + eyebrow + helper
sentence wrapped around every section. The goal of this round is **restraint**:
remove decoration until what's left is information.

---

## Already shipped (verified)

- **A1 — Contrast.** Secondary meta text failed WCAG AA (light ≈4.1:1, dark
  ≈3.3:1). Retuned `--ink-faint` (`#5e6573` light, `#aab3c2` dark); now
  ≥4.5:1 on base and glass in both themes. ✅ committed.
- **A2 — Tweaks overlay.** The floating Tweaks FAB used `z-index: 2147483645`
  and covered modal action bars. Now hidden while any overlay is open and
  z-ordered below the scrims. ✅ committed.

---

## Resolution (declutter pass — landed)

F1–F5 below were addressed directly on `main` (the parallel worktree agents
hit a session limit before running, so the work was done in one tree and
verified visually via Playwright in both themes):

- **F1** — Icon usage cut from **72 → ~40**: removed from KPI labels, top tabs,
  portal subtabs, portal hero/branch, section actions, and the ready-queue
  trailing chevron. Kept only meaningful ones (inbox status markers, primary
  button, external-link, file-type).
- **F2** — Flattened glass shadows from 5 layers (incl. double inset sheen) to
  one subtle elevation; cut the specular `::before` opacity ~half; background
  blobs `0.95 → 0.4`; grain default **off** and dimmed; default glass blur
  `22 → 12px`.
- **F3** — Removed the greeting, the "chart the course through the Warp" flavor,
  and the "click any tile" helper; inbox heroes are now `name + terse state`
  (e.g. "spincd · PR #14 awaiting review") with one-line factual subs.
- **F4** — Dropped tile-stat suffixes ("last 7d", "open/none") and trimmed KPI
  trailing phrases to a single short label.
- **F5** — Portal hero and portfolio tiles no longer stack status + CI + deploy
  + branch badges; kept the one or two that matter, rest as plain text.

`F6`/`F7` remain open follow-ups.

## Open findings — the declutter pass

### F1 — Icon overload (72 `<Icon>` usages)

Icons are used as **decoration**, not signification. Every KPI label, every
section header, every metadata row, every button carries one. When everything
has an icon, none of them mean anything — they just add visual static.

- **Remove** icons from text labels that are already clear: KPI labels
  (`spark`/`git-commit`/`session`/`rocket` next to "Needs attention",
  "Commits / 7d", …), section headings, the `folder`/`branch` glyphs in meta
  rows, "repo/branch/commit" strip.
- **Keep** icons only where they carry meaning without text or aid scanning:
  status markers in the inbox list, the single leading glyph on a primary
  button, external-link affordance, file-type (doc/image) in artifacts.
- Target: cut icon usage by **~half**. Default to *no* icon; add one only when
  it earns its place.

### F2 — "Glowing things" / material excess

The frosted-glass language is laid on too thick. Stacked specular highlights,
accent glows, a background-grain texture, tinted blob gradients, and multiple
box-shadows per element read as busy rather than premium.

- Soften/remove inner specular `::before/::after` highlights on glass.
- Drop or default-off the **background grain** and the colored **tint blobs**.
- Collapse multi-layer shadows to a single subtle elevation per surface.
- Reduce `--glass-blur` default and accent-glow intensity. Glass should be a
  quiet pane, not a light show.

### F3 — Microcopy that reeks of LLM

Copy is doing too much talking. Cut the personality down to labels and facts.

- **Greeting**: "Good morning. Here's where you are." → drop, or a plain
  dateline. The app doesn't need to greet you.
- **Inbox hero verbs**: "spincd **has a PR waiting on you.**", "**hasn't moved
  in** 9 days.", "**is still on paper.**", "**— pick up where you left off.**",
  "**— nothing demands attention.**" → reduce to a state label + the fact
  (e.g. "PR #14 · awaiting review").
- **Flavor**: "Navigator — chart the course through the Warp." and the
  reflection sermon in the generated prompt → remove from the UI.
- **Helper text**: "click any tile to open its portal" → delete; the affordance
  is obvious.
- Eyebrow labels ("NEEDS REVIEW", "READY TO DELEGATE", "NEEDS ATTENTION NOW")
  are redundant with the content beneath them — keep at most one per region.

### F4 — Redundant labels & suffixes

Self-evident data is being narrated.

- Portfolio tile stats: "COMMITS **last 7d**", "PRS **1 open** / **none**",
  drop the suffix words; the number + small label is enough.
- KPI units "**/ 5**", "**/ 4**" and trailing "across 5 projects" / "queued" /
  "track" / "logged" — trim to the number and one label.
- Em-dash-padded phrases throughout ("— decide direction or prune", "— no
  commits yet") → tighten.

### F5 — Badge / pill stacking

The portal hero and tiles stack a status pill **+** CI badge **+** deploy badge
**+** branch pill **+** repo path in one row, each with its own dot/icon/color.
Pick the one or two that matter per context; demote the rest to plain text.

---

## Carried / not yet addressed

- **F6 — Click targets.** Theme toggle (30px), tab buttons (31px), inline
  section links (23px tall) are under the 44px guideline. Low priority for a
  keyboard-first tool, but bump where cheap.
- **F7 — Mobile untested.** Browser window clamped at 1280px innerWidth, so
  true phone widths weren't exercised. CSS has breakpoints at 1100/980/760/640;
  needs a device-emulation pass before mobile is signed off.

---

## Work partition (conflict-free worktrees)

To let agents run in parallel without stepping on each other, work is split by
**file ownership**, not by feature:

- **Worktree A — material/CSS** (`F2`, visual weight of `F5`):
  owns **only** `frontend/src/styles/*.css`. No `.tsx`/`.ts` edits.
- **Worktree B — structure/copy** (`F1`, `F3`, `F4`, render-side of `F5`):
  owns **only** `frontend/src/**/*.tsx` and `*.ts`. No `.css` edits.

`F6`/`F7` are follow-ups, handled after the declutter lands.

Guiding principle for both: **when in doubt, remove it.** The win condition is
that a first-time viewer can't tell the UI was AI-generated.
