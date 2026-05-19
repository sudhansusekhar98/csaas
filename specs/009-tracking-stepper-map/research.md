# Phase 0 Research: Sample Tracking — Snake Stepper, Child Visibility & GPS Map View

**Feature**: `009-tracking-stepper-map`
**Date**: 2026-05-19

This document resolves the open dependency / patterns / unknowns questions surfaced by the spec and Technical Context. No `NEEDS CLARIFICATION` markers remained after specification; the items below are the explicit technology and pattern choices the planner must lock in before Phase 1.

## R-001 — Snake-wise horizontal stepper rendering approach

- **Decision**: Render the 12 steps as a CSS Grid with a fixed step-card width and a configurable `stepsPerRow` (default 6 on ≥1440px, 4 on 1024–1440px, 3 on 768–1024px, 1 below 480px). For odd-indexed rows, reverse the visual order via `flex-direction: row-reverse` so that the chronological flow zig-zags. Connector elements (short horizontal lines between cells, plus 180° elbow connectors at the end of each row) are rendered as positioned pseudo-elements / absolutely-positioned SVG arcs.
- **Rationale**: Pure CSS — no extra dependency, no virtual DOM trickery, predictable responsive behaviour via `@container` or `min-width` breakpoints. Allows `motion/react` to animate per-node state transitions identically to today.
- **Alternatives considered**:
  - **Single SVG drawn from a path generator** (e.g. d3-shape's curve interpolators). Rejected: overkill, adds dependency, makes accessible click targets and hover styles harder.
  - **Horizontal scroll with no wrapping**. Rejected: violates the user's "no scrolling" requirement.
  - **Stepper UI library (e.g. MUI Stepper)**. Rejected: doesn't support snake/zig-zag layout, would introduce a foreign design system into a Tailwind-styled prototype.

## R-002 — Connector visual for row-end 180° turns

- **Decision**: Render row-end turns as a half-pill SVG arc (radius equal to half the step-card height) coloured by the **lesser-progressed** of the two steps it joins (i.e., emerald if both completed, indigo if it crosses the current step, slate-200 if both pending). The arc lives in a single overlay SVG positioned absolutely behind the grid; it has no pointer events.
- **Rationale**: A clean continuous flow line beats per-cell border tricks; computing it once for the overlay is simpler than getting CSS borders to look right at the turn. Keeps node markup clean for clickability.
- **Alternatives considered**: Right-angle elbows (less elegant, looks like a flowchart, not a custody trail). Per-row separate trailing arcs as part of each step card (visually inconsistent across browsers).

## R-003 — Child sample data model & how it relates to the parent step events

- **Decision**: Children are independent sample records keyed by their own ID (e.g., `CHLD-8810-D-A`), each carrying `parentId`, `currentStepIndex` (10–12, since they only exist after Division at step 9), and their own `STEP_EVENTS` array for steps 10–12. Pre-division steps 1–9 of a child are *not* stored separately — they are inherited from the parent (same operator, same FRS, same GPS coords). The Step 9 (Division Logic) event itself is logged once on the parent and surfaces to each child via the same shared reference.
- **Rationale**: Matches spec 007's child handover model. Avoids data duplication for the common pre-division path. Keeps the post-division divergence visible: each child can be at a different step independently.
- **Alternatives considered**: Fully independent child event arrays from step 1 (would balloon demo data and create false divergence pre-division); embedded child status flags inside parent step events (couples model to UI, harder to extend).

## R-004 — Map library choice for the GPS Map View

- **Decision**: `react-leaflet@^4.2` over `leaflet@^1.9`, with OpenStreetMap (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`) as the default tile source.
- **Rationale**: BSD-licensed, no API key, ~140 KB gzipped runtime, plays nicely with React 19, large community, and the OSM tile policy is acceptable for an internal prototype demo. Built-in `Marker`, `Popup`, and `Polyline` cover everything we need without extra plugins.
- **Alternatives considered**:
  - **Mapbox GL JS / Maplibre GL**: nicer rendering but require a tile-server account (Mapbox) or self-hosting (Maplibre). Friction for a demo.
  - **Google Maps**: API key + billing setup, ToS friction.
  - **SVG/illustrated facility map**: would short-circuit the user's explicit request for an actual GPS-based map and remove the option of swapping in real device coordinates later.

## R-005 — Demo GPS coordinates for the 12 steps

- **Decision**: Anchor all coordinates around a notional Indian coal-handling site (Singareni / SECL-like facility). Use a hand-authored set of 12 coordinates within a ~3 km radius around `17.5450° N, 78.5050° E` (Telangana plateau, away from any real-world facility to avoid implying real surveillance). Each `STEP_TEMPLATE` gains a `coord: { lat: number; lng: number } | null` field (null for system/auto steps 4 and 10). Children at steps 11–12 get slightly offset coordinates from the parent's lab pins so child routes don't overlap.
- **Rationale**: A plausible cluster of locations gives the route polyline shape and visual variety; avoiding real coordinates dodges "is this surveillance of a real plant?" questions. ~3 km radius mirrors a realistic coal-handling site footprint.
- **Alternatives considered**: Random global coordinates (route would visually span continents — nonsense); using the dev's actual office coordinates (privacy concerns and demo-irrelevant).

## R-006 — View-mode state management & toggle UX

- **Decision**: Add a single `viewMode: 'stepper' | 'map'` piece of `useState` to `SampleTrackingView`. Render a segmented control in the existing sticky header next to the "Scan Next Phase" button. Switching mode preserves `selectedSampleId`, `stepOffsets`, and `activeChildId`. The step detail popup state (`activeStep`) is also preserved across toggles.
- **Rationale**: Minimal state, lifts directly into the component that already owns related state. Segmented control matches the existing label-caps typographic system. No new context provider needed.
- **Alternatives considered**: Routes (`/sample-tracking/map`) — the prototype uses a single-app view switcher already; adding routing for one toggle is disproportionate. Two-pane "stepper + map side by side" — won't fit at 1440×900 without shrinking both.

## R-007 — Step detail popup reuse from map pins

- **Decision**: Extract the popup's open-with-step-event call into the existing handler (`handleStepClick`) that already accepts an event + step def + step number. Map pins invoke the same handler with the matching `STEP_EVENTS[sampleId][stepIdx]`. No structural change to the popup component itself.
- **Rationale**: Spec FR-004 and FR-010 require the same popup from both surfaces; sharing the handler guarantees parity and avoids drift.
- **Alternatives considered**: Two separate popups (rejected — guaranteed divergence and double maintenance).

## R-008 — Performance & memoisation strategy

- **Decision**: Memoise the derived `routes` (parent + per-child polyline coordinates), `stepperNodes` (with status), and `legendCounts` (GPS-missing tally) via `useMemo` keyed by `selectedSampleId` and `activeChildId`. Leaflet `MapContainer` is mounted once and `<Marker>` / `<Polyline>` children re-render on sample change — but the map instance is not torn down on view-mode toggle (use CSS `display: none` instead of unmounting, so tile state is preserved → SC-003 < 400 ms transition).
- **Rationale**: Avoids re-initialising Leaflet on every toggle, which is the main perf trap with `react-leaflet`. Memoisation prevents unnecessary marker re-renders.
- **Alternatives considered**: Tear-down on toggle (cleaner unmount but flashes white and re-fetches tiles — bad SC-003). Heavy memoisation everywhere (premature; only these three derivations are non-trivial).

## R-009 — Best practices for `react-leaflet` v4 with React 19

- **Decision**: Use the v4 hook-based API (`useMap`, `<MapContainer>`, `<TileLayer>`, `<Marker>`, `<Polyline>`, `<Tooltip>`). Set a fixed `MapContainer` height via Tailwind (`h-[520px]`) so Leaflet's mandatory size invalidation doesn't fight flexbox. Provide a `whenReady` callback that calls `map.invalidateSize()` after the parent transitions in. Import Leaflet's default CSS once at the entry (`src/main.tsx`) — its assets package ships with the marker icon URL trickery already, but we'll override the default icon to a colour-tinted SVG so the prototype's brand stays consistent.
- **Rationale**: Captures the known sharp edges (mount sizing, default icon path issue) up front so the implementer doesn't rediscover them.
- **Alternatives considered**: `react-leaflet` v5 (still in beta during the spec window — risky for a prototype). Imperative Leaflet without the React wrapper (more boilerplate, no obvious win).

## R-010 — Accessibility considerations

- **Decision**: Snake stepper exposes each step node as a `<button>` with `aria-current="step"` on the current node and `aria-label` describing the step number, title, and status. Connector arcs are `aria-hidden`. Child rows are a `<ul>` with `<li><button>` items. Map pins use Leaflet's default keyboard focus (provided by Leaflet ≥ 1.7) plus a `title` attribute carrying the step number and operator name.
- **Rationale**: Honours the spec's "no colour-only reliance" (FR-002) at the AT level too. Keeps the implementation light — full WCAG 2.1 AA audit is out of scope for v1 but the foundations are in place.
- **Alternatives considered**: Skip A11y entirely (rejected — adds no cost to do it right while building).
